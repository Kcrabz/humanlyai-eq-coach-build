
// This file is automatically loaded by Jest before running tests

// Import jest-dom to add custom DOM element matchers
import '@testing-library/jest-dom';

// Mock for window.matchMedia which isn't available in test environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock for ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock for window.scrollTo
window.scrollTo = jest.fn();

// Clear all mocks automatically between tests
afterEach(() => {
  jest.clearAllMocks();
});
