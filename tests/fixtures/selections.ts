/**
 * Test fixtures for text selection scenarios
 * Used to provide consistent test data across unit, integration, and E2E tests
 */

export interface SelectionScenario {
  name: string;
  text: string;
  boundingRect: {
    top: number;
    left: number;
    bottom: number;
    right: number;
    width: number;
    height: number;
    x: number;
    y: number;
  };
  viewport: {
    width: number;
    height: number;
  };
  expectedButtonPosition: {
    top: number;
    left: number;
    placement: 'above' | 'below';
  };
}

/**
 * Selection in top half of viewport - button should appear above
 */
export const selectionInTopHalf: SelectionScenario = {
  name: 'Selection in top half of viewport',
  text: 'Selected text from top of page',
  boundingRect: {
    top: 100,
    left: 100,
    bottom: 130,
    right: 400,
    width: 300,
    height: 30,
    x: 100,
    y: 100,
  },
  viewport: {
    width: 1024,
    height: 768,
  },
  expectedButtonPosition: {
    top: 50, // 100 - 50 (offset)
    left: 190, // 100 + 300/2 - 120/2 (center)
    placement: 'above',
  },
};

/**
 * Selection in bottom half of viewport - button should appear below
 */
export const selectionInBottomHalf: SelectionScenario = {
  name: 'Selection in bottom half of viewport',
  text: 'Selected text from bottom of page',
  boundingRect: {
    top: 650,
    left: 100,
    bottom: 680,
    right: 400,
    width: 300,
    height: 30,
    x: 100,
    y: 650,
  },
  viewport: {
    width: 1024,
    height: 768,
  },
  expectedButtonPosition: {
    top: 730, // 680 + 50 (offset)
    left: 190,
    placement: 'below',
  },
};

/**
 * Selection near left edge - button should be constrained to left edge
 */
export const selectionNearLeftEdge: SelectionScenario = {
  name: 'Selection near left edge',
  text: 'Text',
  boundingRect: {
    top: 300,
    left: 10,
    bottom: 330,
    right: 100,
    width: 90,
    height: 30,
    x: 10,
    y: 300,
  },
  viewport: {
    width: 1024,
    height: 768,
  },
  expectedButtonPosition: {
    top: 250, // 300 - 50
    left: 10, // constrained to padding
    placement: 'above',
  },
};

/**
 * Selection near right edge - button should be constrained to right edge
 */
export const selectionNearRightEdge: SelectionScenario = {
  name: 'Selection near right edge',
  text: 'Text',
  boundingRect: {
    top: 300,
    left: 924, // close to right edge (1024 - 100)
    bottom: 330,
    right: 1014,
    width: 90,
    height: 30,
    x: 924,
    y: 300,
  },
  viewport: {
    width: 1024,
    height: 768,
  },
  expectedButtonPosition: {
    top: 250,
    left: 894, // constrained to viewport width - button width - padding
    placement: 'above',
  },
};

/**
 * Mobile viewport selection - button should fit on small screen
 */
export const mobileSelectionScenario: SelectionScenario = {
  name: 'Mobile viewport selection',
  text: 'Selected text on mobile',
  boundingRect: {
    top: 150,
    left: 20,
    bottom: 180,
    right: 375,
    width: 355,
    height: 30,
    x: 20,
    y: 150,
  },
  viewport: {
    width: 375,
    height: 667,
  },
  expectedButtonPosition: {
    top: 100, // 150 - 50
    left: 127, // centered on mobile
    placement: 'above',
  },
};

/**
 * Long text selection spanning multiple lines
 */
export const longTextSelection: SelectionScenario = {
  name: 'Long text selection spanning lines',
  text: 'This is a long selected text that spans multiple lines in the document and should still position the button correctly.',
  boundingRect: {
    top: 250,
    left: 50,
    bottom: 330, // spans ~4 lines
    right: 600,
    width: 550,
    height: 80,
    x: 50,
    y: 250,
  },
  viewport: {
    width: 1024,
    height: 768,
  },
  expectedButtonPosition: {
    top: 200, // 250 - 50
    left: 237, // 50 + 550/2 - 120/2
    placement: 'above',
  },
};

/**
 * Collection of all selection scenarios for testing
 */
export const selectionScenarios = [
  selectionInTopHalf,
  selectionInBottomHalf,
  selectionNearLeftEdge,
  selectionNearRightEdge,
  mobileSelectionScenario,
  longTextSelection,
];
