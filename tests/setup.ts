import '@testing-library/jest-dom';

// Mock window.matchMedia for dark mode testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock Selection API
if (!window.getSelection) {
  Object.defineProperty(window, 'getSelection', {
    writable: true,
    value: jest.fn().mockImplementation(() => ({
      toString: jest.fn(),
      rangeCount: 0,
      addRange: jest.fn(),
      removeAllRanges: jest.fn(),
      getRangeAt: jest.fn(),
      type: 'Range',
    })),
  });
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback: ResizeObserverCallback) {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;
