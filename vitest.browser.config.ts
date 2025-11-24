import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

/**
 * Vitest configuration for browser-dependent tests
 *
 * These tests require actual DOM rendering and USWDS JavaScript behavior
 * that cannot be properly simulated in jsdom environments.
 *
 * Usage:
 * - npm run test:browser           # Run browser-only tests
 * - npm run test:browser:watch     # Run in watch mode
 * - npm run test:browser:coverage  # Run with coverage
 */
export default defineConfig({
  test: {
    // Use jsdom environment (already available) for browser-like behavior
    environment: 'jsdom',

    // Include only browser-specific test patterns
    include: [
      'src/**/usa-*.browser.test.ts',
      'src/**/usa-*.visual.test.ts',
      'src/**/*.browser.test.ts',
    ],

    // Exclude regular unit tests
    exclude: ['node_modules/**', 'dist/**', 'src/**/usa-*.test.ts', 'src/**/usa-*.layout.test.ts'],

    // Browser test specific configuration
    testTimeout: 10000, // Longer timeout for browser operations
    setupFiles: ['./vitest.browser.setup.ts'],

    // Coverage configuration for browser tests
    coverage: {
      provider: 'v8',
      include: ['src/components/**/*.ts'],
      exclude: ['src/components/**/*.test.ts', 'src/components/**/*.stories.ts'],
      reporter: ['text', 'html', 'json'],
      reportsDirectory: './coverage/browser',
    },
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
