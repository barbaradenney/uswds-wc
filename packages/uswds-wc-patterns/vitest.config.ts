/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import type { Plugin } from 'vite';

// Plugin to stub CSS imports in tests
const cssStubPlugin = (): Plugin => ({
  name: 'css-stub',
  enforce: 'pre', // Run before other plugins
  resolveId(id) {
    if (id.endsWith('.css')) {
      return '\0' + id; // Virtual module prefix
    }
  },
  load(id) {
    if (id.startsWith('\0') && id.endsWith('.css')) {
      return 'export default {}';
    }
  },
});

export default defineConfig({
  plugins: [cssStubPlugin()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    // Isolate test files to prevent localStorage pollution between files
    isolate: true,
    // Ensure each test file gets a fresh environment
    pool: 'forks',
    // Use custom reporter to clarify test output
    reporters: ['../../scripts/test/vitest-clarified-reporter.js'],
  },
  resolve: {
    alias: {
      '@uswds-wc/core': resolve(__dirname, '../uswds-wc-core/src'),
      '@uswds-wc/actions': resolve(__dirname, '../uswds-wc-actions/src'),
      '@uswds-wc/forms': resolve(__dirname, '../uswds-wc-forms/src'),
      '@uswds-wc/navigation': resolve(__dirname, '../uswds-wc-navigation/src'),
      '@uswds-wc/data-display': resolve(__dirname, '../uswds-wc-data-display/src'),
      '@uswds-wc/feedback': resolve(__dirname, '../uswds-wc-feedback/src'),
      '@uswds-wc/layout': resolve(__dirname, '../uswds-wc-layout/src'),
      '@uswds-wc/structure': resolve(__dirname, '../uswds-wc-structure/src'),
      '@uswds-wc/test-utils': resolve(__dirname, '../uswds-wc-test-utils/src'),
    },
  },
});
