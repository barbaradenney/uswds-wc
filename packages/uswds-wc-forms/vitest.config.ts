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
    exclude: [
      'node_modules',
      'dist',
      '**/*.browser.test.ts', // Exclude browser-dependent tests (require real browser/Playwright)
      '**/file-input-interaction.test.ts', // Requires USWDS JavaScript drag/drop behavior
      '**/usa-file-input-behavior.test.ts', // Requires USWDS JavaScript DOM transformation
      '**/usa-file-input.layout.test.ts', // Requires USWDS JavaScript enhanced structure
    ],
  },
  resolve: {
    alias: {
      '@uswds-wc/core': resolve(__dirname, '../uswds-wc-core/src'),
      '@uswds-wc/test-utils': resolve(__dirname, '../uswds-wc-test-utils/src'),
    },
  },
});
