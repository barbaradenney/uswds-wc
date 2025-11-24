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
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
  },
  resolve: {
    alias: {
      '@uswds-wc/core': resolve(__dirname, '../uswds-wc-core/src'),
      '@uswds-wc/test-utils': resolve(__dirname, '../uswds-wc-test-utils/src'),
    },
  },
});
