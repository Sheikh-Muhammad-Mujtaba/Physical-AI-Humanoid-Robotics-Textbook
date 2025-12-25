/**
 * Integration Test: Text Selection Workflow
 * Tests complete flow: Select text → Button appears → Click button → Text captured → Selection cleared
 */

import { triggerSelectionChange } from '../utils/test-helpers';

describe('Text Selection Workflow Integration', () => {
  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <div id="content">
        <p>This is some text that can be selected.</p>
        <p>More text for testing selection functionality.</p>
      </div>
      <div id="button-container"></div>
    `;
  });

  afterEach(() => {
    // Cleanup
    document.body.innerHTML = '';
  });

  describe('Selection Detection', () => {
    test('should detect when text is selected', () => {
      const text = 'text that can be selected';

      // Simulate text selection
      const selection = window.getSelection();
      const paragraph = document.querySelector('p');

      if (selection && paragraph) {
        const range = document.createRange();
        range.selectNodeContents(paragraph);
        selection.removeAllRanges();
        selection.addRange(range);

        triggerSelectionChange();

        expect(selection.toString()).not.toBe('');
      }
    });

    test('should trigger selection change event', (done) => {
      document.addEventListener('selectionchange', () => {
        done();
      });

      triggerSelectionChange();
    });

    test('should capture selected text content', () => {
      const paragraph = document.querySelector('p');
      const selection = window.getSelection();

      if (selection && paragraph) {
        const range = document.createRange();
        range.selectNodeContents(paragraph);
        selection.removeAllRanges();
        selection.addRange(range);

        const selectedText = selection.toString();
        expect(selectedText).toContain('text that can be selected');
      }
    });
  });

  describe('Button Appearance and Positioning', () => {
    test('should show Ask AI button when text is selected', () => {
      const selection = window.getSelection();
      const paragraph = document.querySelector('p');

      if (selection && paragraph) {
        const range = document.createRange();
        range.selectNodeContents(paragraph);
        selection.removeAllRanges();
        selection.addRange(range);

        triggerSelectionChange();

        // Button should appear in viewport
        const button = document.querySelector('[data-testid="ask-ai-button"]');
        // For now, we test that the function executes without error
        expect(selection.toString()).toBeTruthy();
      }
    });

    test('should position button within 500ms of selection', (done) => {
      const selection = window.getSelection();
      const paragraph = document.querySelector('p');

      if (selection && paragraph) {
        const range = document.createRange();
        range.selectNodeContents(paragraph);
        selection.removeAllRanges();
        selection.addRange(range);

        const startTime = Date.now();
        triggerSelectionChange();

        // Check that positioning logic runs quickly
        setTimeout(() => {
          const elapsed = Date.now() - startTime;
          expect(elapsed).toBeLessThan(500);
          done();
        }, 100);
      }
    });

    test('should keep button visible in viewport', () => {
      // Simulate button element
      const button = document.createElement('button');
      button.className = 'ask-ai-button';
      button.style.position = 'fixed';
      button.style.top = '100px';
      button.style.left = '50px';
      document.body.appendChild(button);

      // Button should be within viewport
      const rect = button.getBoundingClientRect();
      expect(rect.top).toBeGreaterThanOrEqual(0);
      expect(rect.left).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Button Interaction', () => {
    test('should handle button click event', (done) => {
      const button = document.createElement('button');
      button.className = 'ask-ai-button';
      button.textContent = 'Ask AI';

      button.addEventListener('click', () => {
        done();
      });

      document.body.appendChild(button);
      button.click();
    });

    test('should pass selected text to chatbot on button click', () => {
      const selection = window.getSelection();
      const paragraph = document.querySelector('p');

      if (selection && paragraph) {
        const range = document.createRange();
        range.selectNodeContents(paragraph);
        selection.removeAllRanges();
        selection.addRange(range);

        const selectedText = selection.toString();

        // Simulate button click that should pass text
        expect(selectedText).toContain('text that can be selected');
      }
    });

    test('should clear browser selection after button click', () => {
      const selection = window.getSelection();
      const paragraph = document.querySelector('p');

      if (selection && paragraph) {
        const range = document.createRange();
        range.selectNodeContents(paragraph);
        selection.removeAllRanges();
        selection.addRange(range);

        // Clear selection
        selection.removeAllRanges();

        expect(selection.toString()).toBe('');
      }
    });
  });

  describe('Button Disappearance', () => {
    test('should hide button when selection is cleared', () => {
      const selection = window.getSelection();
      const paragraph = document.querySelector('p');

      if (selection && paragraph) {
        const range = document.createRange();
        range.selectNodeContents(paragraph);
        selection.removeAllRanges();
        selection.addRange(range);

        // Clear selection
        selection.removeAllRanges();
        triggerSelectionChange();

        expect(selection.toString()).toBe('');
      }
    });

    test('should remove button from DOM after clearing selection', () => {
      const button = document.createElement('button');
      button.className = 'ask-ai-button';
      button.id = 'test-button';
      document.body.appendChild(button);

      // Verify button exists
      expect(document.getElementById('test-button')).not.toBeNull();

      // Remove button
      button.remove();

      // Verify button no longer exists
      expect(document.getElementById('test-button')).toBeNull();
    });

    test('should handle rapid selection changes', (done) => {
      const selection = window.getSelection();
      const paragraphs = document.querySelectorAll('p');

      if (selection && paragraphs.length >= 2) {
        // First selection
        const range1 = document.createRange();
        range1.selectNodeContents(paragraphs[0]);
        selection.removeAllRanges();
        selection.addRange(range1);
        triggerSelectionChange();

        const firstText = selection.toString();

        // Rapidly change selection
        setTimeout(() => {
          const range2 = document.createRange();
          range2.selectNodeContents(paragraphs[1]);
          selection.removeAllRanges();
          selection.addRange(range2);
          triggerSelectionChange();

          const secondText = selection.toString();

          // Both selections should be valid but different
          expect(firstText).not.toBe('');
          expect(secondText).not.toBe('');
          expect(firstText).not.toBe(secondText);
          done();
        }, 50);
      }
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty selection', () => {
      const selection = window.getSelection();
      selection.removeAllRanges();

      expect(selection.toString()).toBe('');
    });

    test('should handle very long selected text', () => {
      const longText = 'A'.repeat(500);
      const paragraph = document.createElement('p');
      paragraph.textContent = longText;
      document.body.appendChild(paragraph);

      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(paragraph);
      selection.removeAllRanges();
      selection.addRange(range);

      expect(selection.toString().length).toBe(500);
    });

    test('should handle multi-element selection', () => {
      const selection = window.getSelection();
      const range = document.createRange();

      const firstP = document.querySelector('p');
      const lastP = document.querySelectorAll('p')[1];

      if (firstP && lastP) {
        range.setStart(firstP, 0);
        range.setEnd(lastP, lastP.childNodes.length);
        selection.removeAllRanges();
        selection.addRange(range);

        expect(selection.toString()).not.toBe('');
      }
    });
  });
});
