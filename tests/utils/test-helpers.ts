/**
 * Test utility helpers for viewport calculations and selection mocking
 */

/**
 * Mock viewport dimensions for testing
 */
export function setViewportSize(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
}

/**
 * Create a mock text selection with bounding rect
 */
export function createMockSelection(
  text: string,
  boundingRect: {
    top: number;
    left: number;
    bottom: number;
    right: number;
    width: number;
    height: number;
    x: number;
    y: number;
  }
) {
  const mockRange = {
    toString: jest.fn().mockReturnValue(text),
    getBoundingClientRect: jest.fn().mockReturnValue(boundingRect),
    getClientRects: jest.fn().mockReturnValue([boundingRect]),
  };

  const mockSelection = {
    toString: jest.fn().mockReturnValue(text),
    rangeCount: 1,
    getRangeAt: jest.fn().mockReturnValue(mockRange),
    type: 'Range' as const,
    addRange: jest.fn(),
    removeAllRanges: jest.fn(),
    removeRange: jest.fn(),
  };

  return mockSelection;
}

/**
 * Utility to calculate button position (50px above or below selection)
 * with viewport constraint
 */
export function calculateButtonPosition(
  selectionRect: DOMRect | { top: number; left: number; bottom: number; right: number; width: number; height: number },
  viewportHeight: number,
  viewportWidth: number,
  buttonHeight: number = 40,
  buttonWidth: number = 120,
  offset: number = 50,
  padding: number = 10
) {
  const proposedTop = selectionRect.top - offset;
  const centerX = selectionRect.left + selectionRect.width / 2;
  const buttonLeft = centerX - buttonWidth / 2;

  // Check if button fits above
  if (proposedTop >= padding) {
    // Can fit above
    return {
      top: proposedTop,
      left: Math.max(padding, Math.min(buttonLeft, viewportWidth - buttonWidth - padding)),
      position: 'above' as const,
    };
  } else {
    // Must go below
    return {
      top: selectionRect.bottom + offset,
      left: Math.max(padding, Math.min(buttonLeft, viewportWidth - buttonWidth - padding)),
      position: 'below' as const,
    };
  }
}

/**
 * Trigger a selection change event
 */
export function triggerSelectionChange() {
  const event = new Event('selectionchange', { bubbles: true });
  document.dispatchEvent(event);
}

/**
 * Trigger a scroll event with debounce simulation
 */
export async function triggerScrollEvent(delay: number = 50) {
  const event = new Event('scroll', { bubbles: true });
  window.dispatchEvent(event);
  await new Promise(resolve => setTimeout(resolve, delay + 10));
}

/**
 * Create a mock DOMRect
 */
export function createMockDOMRect(
  top: number,
  left: number,
  bottom: number,
  right: number,
  width?: number,
  height?: number
): DOMRect {
  return {
    top,
    left,
    bottom,
    right,
    width: width ?? right - left,
    height: height ?? bottom - top,
    x: left,
    y: top,
    toJSON: () => ({}),
  };
}
