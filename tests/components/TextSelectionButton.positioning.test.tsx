/**
 * Unit Tests for TextSelectionButton Positioning Logic
 * Tests button positioning 50px above/below selected text with viewport constraints
 */

import {
  calculateButtonPosition,
  createMockDOMRect,
  setViewportSize,
} from '../utils/test-helpers';
import { selectionScenarios } from '../fixtures/selections';

describe('TextSelectionButton Positioning', () => {
  beforeEach(() => {
    // Reset viewport to standard desktop size
    setViewportSize(1024, 768);
  });

  describe('Position Calculation - Above Selection', () => {
    test('should position button 50px above when space is available', () => {
      const selection = selectionScenarios[0]; // selectionInTopHalf
      const result = calculateButtonPosition(
        selection.boundingRect,
        selection.viewport.height,
        selection.viewport.width
      );

      expect(result.position).toBe('above');
      expect(result.top).toBe(selection.expectedButtonPosition.top);
    });

    test('should center button horizontally under selection', () => {
      const selection = selectionScenarios[0];
      const result = calculateButtonPosition(
        selection.boundingRect,
        selection.viewport.height,
        selection.viewport.width
      );

      // Button should be horizontally centered
      const selectionCenter = selection.boundingRect.left + selection.boundingRect.width / 2;
      const buttonCenter = result.left + 60; // Assuming button width is ~120px, center is at left + 60
      expect(Math.abs(buttonCenter - selectionCenter)).toBeLessThan(5);
    });
  });

  describe('Position Calculation - Below Selection', () => {
    test('should position button below when space above is insufficient', () => {
      const selection = selectionScenarios[1]; // selectionInBottomHalf
      const result = calculateButtonPosition(
        selection.boundingRect,
        selection.viewport.height,
        selection.viewport.width
      );

      expect(result.position).toBe('below');
      expect(result.top).toBeGreaterThan(selection.boundingRect.bottom);
    });

    test('should maintain 50px offset below selection', () => {
      const selection = selectionScenarios[1];
      const result = calculateButtonPosition(
        selection.boundingRect,
        selection.viewport.height,
        selection.viewport.width,
        40, // button height
        120, // button width
        50 // offset
      );

      const expectedTop = selection.boundingRect.bottom + 50;
      expect(result.top).toBe(expectedTop);
    });
  });

  describe('Viewport Boundary Constraints', () => {
    test('should constrain button to left edge with 10px padding', () => {
      const selection = selectionScenarios[2]; // selectionNearLeftEdge
      const result = calculateButtonPosition(
        selection.boundingRect,
        selection.viewport.height,
        selection.viewport.width,
        40,
        120,
        50,
        10 // padding
      );

      expect(result.left).toBeGreaterThanOrEqual(10);
    });

    test('should constrain button to right edge with 10px padding', () => {
      const selection = selectionScenarios[3]; // selectionNearRightEdge
      const result = calculateButtonPosition(
        selection.boundingRect,
        selection.viewport.height,
        selection.viewport.width,
        40,
        120,
        50,
        10
      );

      const maxRight = selection.viewport.width - 120 - 10;
      expect(result.left).toBeLessThanOrEqual(maxRight);
    });

    test('should remain fully within viewport at all times', () => {
      selectionScenarios.forEach((scenario) => {
        const result = calculateButtonPosition(
          scenario.boundingRect,
          scenario.viewport.height,
          scenario.viewport.width
        );

        expect(result.left).toBeGreaterThanOrEqual(10);
        expect(result.left + 120).toBeLessThanOrEqual(scenario.viewport.width - 10);
        expect(result.top).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Mobile Viewport Positioning', () => {
    test('should position correctly on mobile (375px width)', () => {
      const selection = selectionScenarios[4]; // mobileSelectionScenario
      const result = calculateButtonPosition(
        selection.boundingRect,
        selection.viewport.height,
        selection.viewport.width
      );

      // Button should fit within mobile viewport
      expect(result.left).toBeGreaterThanOrEqual(10);
      expect(result.left + 120).toBeLessThanOrEqual(375 - 10);
    });
  });

  describe('Long Text Selection (Multiple Lines)', () => {
    test('should handle multi-line selections correctly', () => {
      const selection = selectionScenarios[5]; // longTextSelection
      const result = calculateButtonPosition(
        selection.boundingRect,
        selection.viewport.height,
        selection.viewport.width
      );

      // Button should position based on selection top (first line), not bottom
      expect(result.top).toBeLessThan(selection.boundingRect.bottom);
      expect(result.position).toBe('above');
    });
  });

  describe('Edge Cases', () => {
    test('should handle selection at very top of viewport', () => {
      const rect = createMockDOMRect(5, 50, 35, 350);
      const result = calculateButtonPosition(rect, 768, 1024);

      // Button can't fit 50px above (would be negative), so should position below
      expect(result.position).toBe('below');
      expect(result.top).toBeGreaterThan(35);
    });

    test('should handle selection exactly at offset distance from viewport edge', () => {
      const rect = createMockDOMRect(50, 100, 80, 400);
      const result = calculateButtonPosition(rect, 768, 1024);

      // Button should fit exactly at 50px offset
      expect(result.top).toBe(0);
    });

    test('should handle very small selection area', () => {
      const rect = createMockDOMRect(300, 500, 305, 510);
      const result = calculateButtonPosition(rect, 768, 1024);

      expect(result.position).toBe('above');
      expect(result.top).toBe(250);
    });

    test('should handle full-width selection', () => {
      const rect = createMockDOMRect(400, 0, 430, 1024);
      const result = calculateButtonPosition(rect, 768, 1024);

      // Button should still be constrained and centered
      expect(result.left).toBeGreaterThanOrEqual(10);
      expect(result.left + 120).toBeLessThanOrEqual(1024 - 10);
    });
  });
});
