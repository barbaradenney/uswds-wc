/**
 * Vitest setup for browser-dependent tests
 *
 * This setup file configures the test environment for tests that require
 * actual DOM behavior, USWDS JavaScript integration, and browser APIs.
 */

// Import USWDS CSS for proper styling in browser tests
import './src/styles/styles.css';

// Global setup for browser environment
beforeAll(() => {
  // Ensure window dimensions are set for layout tests
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1024,
  });

  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 768,
  });

  // Mock getBoundingClientRect for elements that need it
  Element.prototype.getBoundingClientRect = vi.fn(() => ({
    width: 100,
    height: 50,
    top: 0,
    left: 0,
    bottom: 50,
    right: 100,
    x: 0,
    y: 0,
    toJSON: () => {},
  }));

  console.log('🌐 Browser test environment initialized');
});

// Cleanup after each test
afterEach(() => {
  // Clear any USWDS-created elements
  document.querySelectorAll('.usa-tooltip__body').forEach((el) => el.remove());

  // Clear any event listeners or timers that might persist
  vi.clearAllTimers();
});

export {};
