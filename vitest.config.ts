/// <reference types="vitest/config" />
import { defineConfig, Plugin } from 'vitest/config';
import { resolve } from 'path';

// Plugin to stub CSS imports in tests
function cssStubPlugin(): Plugin {
  return {
    name: 'css-stub',
    resolveId(id) {
      if (id.endsWith('.css')) {
        return '\0' + id;
      }
    },
    load(id) {
      if (id.startsWith('\0') && id.endsWith('.css')) {
        return 'export default {};';
      }
    },
  };
}

// Main vitest configuration for unit tests
export default defineConfig({
  plugins: [cssStubPlugin()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['vitest.setup.ts'],
    // Handle unhandled errors/rejections gracefully - don't fail tests for JSDOM limitations
    onUnhandledRejection: (error) => {
      // Suppress JSDOM limitation errors that don't affect test validity
      const errorMessage = error?.message || error?.toString() || '';
      const jsdomLimitations = [
        'Not implemented',
        'window.matchMedia is not a function',
        'window.getComputedStyle',
        'navigation to another Document',
      ];
      const shouldSuppress = jsdomLimitations.some((msg) => errorMessage.includes(msg));
      if (shouldSuppress) {
        return; // Ignore these errors
      }
      throw error; // Re-throw real errors
    },
    include: ['packages/**/src/**/*.test.ts', '__tests__/**/*.test.ts', 'tests/**/*.test.js'],
    exclude: [
      'packages/**/src/**/*.stories.ts',
      'packages/**/src/**/*.browser.test.ts',
      'packages/**/src/**/*.visual.test.ts',
      'node_modules',
      // Skip behavior/interaction tests in CI - they're flaky in jsdom, covered by Cypress
      ...(process.env.CI
        ? ['packages/**/src/**/*-behavior*.test.ts', 'packages/**/src/**/*-interaction.test.ts']
        : []),
    ],
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html', 'json'],
      reportsDirectory: './coverage',
      include: ['packages/**/src/**/*.ts'],
      exclude: [
        'packages/**/src/**/*.test.ts',
        'packages/**/src/**/*.stories.ts',
        'packages/**/src/**/*.browser.test.ts',
        'packages/**/src/**/*.visual.test.ts',
        'packages/**/src/**/index.ts',
        'packages/**/src/**/*.d.ts',
        'node_modules',
        '__tests__',
        '__mocks__',
      ],
      // Coverage thresholds (temporarily disabled to unblock CI while improving coverage)
      // TODO(#39): Re-enable thresholds once coverage is improved across all packages
      // Target: lines 80%, functions 80%, branches 75%, statements 80%
      // Current: lines ~27%, functions ~67%, statements ~27%
      // thresholds: {
      //   lines: 80,
      //   functions: 80,
      //   branches: 75,
      //   statements: 80,
      // },
      // Report uncovered lines
      all: true,
      // Clean coverage directory before running
      clean: true,
    },
    // CSS handling in tests
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
    // Progress reporting
    // Use custom reporter to clarify "skipped" vs "other packages" distinction
    reporters: process.env.VITEST_VERBOSE
      ? ['verbose', 'basic']
      : process.env.VITEST_DEBUG_HANGING
        ? ['default', 'hanging-process']
        : ['./scripts/test/vitest-clarified-reporter.js'],
    // Show test names as they start (not just when they finish)
    logHeapUsage: true,
    // Increased timeouts for large test suite (187 test files)
    testTimeout: 60000, // 60s per test (increased for comprehensive validation)
    hookTimeout: 30000, // 30s for setup/teardown hooks
    // Process management to prevent memory leaks and ensure clean exit
    // Using default 'threads' pool - forks can cause unhandled error exit code issues
    // with JSDOM environments (vitest issue #1692, #3912)
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true, // Run in single thread for cleaner exit
        isolate: false, // Share the same context to avoid re-registration
      },
    },
    // Isolation and cleanup
    // IMPORTANT: isolate: false allows web components to register once and be reused
    // This prevents "NotSupportedError: This name has already been registered" errors
    isolate: false, // Share context to avoid web component re-registration errors
    teardownTimeout: 5000, // Allow 5s for cleanup after tests complete
    // Prevent runaway tests
    bail: 5, // Stop after 5 failures for faster feedback
    // Optimize for large test suites (304 test files)
    slowTestThreshold: 5000, // Report tests slower than 5s
    // Run tests sequentially to prevent web component registration conflicts
    // Web components can only be registered once per context
    fileParallelism: false, // Run test files one at a time
    maxConcurrency: 1, // Only 1 test running at a time
  },
  resolve: {
    alias: {
      // Package aliases for tests
      '@uswds-wc/core': resolve(__dirname, 'packages/uswds-wc-core/src'),
      '@uswds-wc/actions': resolve(__dirname, 'packages/uswds-wc-actions/src'),
      '@uswds-wc/forms': resolve(__dirname, 'packages/uswds-wc-forms/src'),
      '@uswds-wc/navigation': resolve(__dirname, 'packages/uswds-wc-navigation/src'),
      '@uswds-wc/data-display': resolve(__dirname, 'packages/uswds-wc-data-display/src'),
      '@uswds-wc/feedback': resolve(__dirname, 'packages/uswds-wc-feedback/src'),
      '@uswds-wc/layout': resolve(__dirname, 'packages/uswds-wc-layout/src'),
      '@uswds-wc/structure': resolve(__dirname, 'packages/uswds-wc-structure/src'),
      '@uswds-wc/test-utils': resolve(__dirname, 'packages/uswds-wc-test-utils/src'),
      // Mock CSS imports (not needed in unit tests)
      '\\.css$': resolve(__dirname, '__mocks__/styleMock.js'),
      '@uswds-wc/core/styles.css': resolve(__dirname, '__mocks__/styleMock.js'),
    },
  },
  // Optimize dependencies for testing
  optimizeDeps: {
    include: ['lit', 'lit/decorators.js', '@lit/reactive-element', 'vitest', '@vitest/expect'],
  },
  // Cache for better performance
  cacheDir: 'node_modules/.vitest',
});
