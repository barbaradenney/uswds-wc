/**
 * Vite configuration for CDN bundle build
 * Creates a single bundled file that can be loaded directly in browsers via CDN
 *
 * Usage:
 *   <link rel="stylesheet" href="https://unpkg.com/@uswds-wc/bundle/uswds-wc.css">
 *   <script type="module" src="https://unpkg.com/@uswds-wc/bundle/uswds-wc.js"></script>
 *
 * Or from jsdelivr:
 *   <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@uswds-wc/bundle/uswds-wc.css">
 *   <script type="module" src="https://cdn.jsdelivr.net/npm/@uswds-wc/bundle/uswds-wc.js"></script>
 */

import { defineConfig } from 'vite';
import { resolve } from 'path';
import viteCompression from 'vite-plugin-compression';

export default defineConfig(({ mode }) => ({
  resolve: {
    alias: {
      // Force all lit packages to use same instance (will be bundled)
      lit: resolve(__dirname, 'node_modules/lit'),
      '@lit/reactive-element': resolve(__dirname, 'node_modules/@lit/reactive-element'),
      'lit-html': resolve(__dirname, 'node_modules/lit-html'),
      'lit-element': resolve(__dirname, 'node_modules/lit-element'),
      // USWDS module aliases for proper tree-shaking
      '@uswds/uswds/js/usa-accordion': resolve(
        __dirname,
        'node_modules/@uswds/uswds/packages/usa-accordion/src/index.js'
      ),
      '@uswds/uswds/js/usa-modal': resolve(
        __dirname,
        'node_modules/@uswds/uswds/packages/usa-modal/src/index.js'
      ),
      '@uswds/uswds/js/usa-date-picker': resolve(
        __dirname,
        'node_modules/@uswds/uswds/packages/usa-date-picker/src/index.js'
      ),
      '@uswds/uswds/js/usa-combo-box': resolve(
        __dirname,
        'node_modules/@uswds/uswds/packages/usa-combo-box/src/index.js'
      ),
      '@uswds/uswds/js/usa-header': resolve(
        __dirname,
        'node_modules/@uswds/uswds/packages/usa-header/src/index.js'
      ),
      '@uswds/uswds/js/usa-time-picker': resolve(
        __dirname,
        'node_modules/@uswds/uswds/packages/usa-time-picker/src/index.js'
      ),
      '@uswds/uswds/js/usa-in-page-navigation': resolve(
        __dirname,
        'node_modules/@uswds/uswds/packages/usa-in-page-navigation/src/index.js'
      ),
      '@uswds/uswds/js/usa-tooltip': resolve(
        __dirname,
        'node_modules/@uswds/uswds/packages/usa-tooltip/src/index.js'
      ),
      '@uswds/uswds/js/usa-skipnav': resolve(
        __dirname,
        'node_modules/@uswds/uswds/packages/usa-skipnav/src/index.js'
      ),
      '@uswds/uswds/js/usa-table': resolve(
        __dirname,
        'node_modules/@uswds/uswds/packages/usa-table/src/index.js'
      ),
      '@uswds/uswds/js/usa-search': resolve(
        __dirname,
        'node_modules/@uswds/uswds/packages/usa-search/src/index.js'
      ),
      '@uswds/uswds/js/usa-character-count': resolve(
        __dirname,
        'node_modules/@uswds/uswds/packages/usa-character-count/src/index.js'
      ),
      '@uswds/uswds/js/usa-file-input': resolve(
        __dirname,
        'node_modules/@uswds/uswds/packages/usa-file-input/src/index.js'
      ),
      '@uswds/uswds/js/usa-date-range-picker': resolve(
        __dirname,
        'node_modules/@uswds/uswds/packages/usa-date-range-picker/src/index.js'
      ),
      // Resolve @uswds-wc packages to local source
      // Handle CSS import specially - make it a no-op since we load CSS separately
      '@uswds-wc/core/styles.css': resolve(__dirname, 'packages/uswds-wc-core/src/styles/styles.css'),
      '@uswds-wc/core': resolve(__dirname, 'packages/uswds-wc-core/src/index.ts'),
      '@uswds-wc/actions': resolve(__dirname, 'packages/uswds-wc-actions/src/index.ts'),
      '@uswds-wc/forms': resolve(__dirname, 'packages/uswds-wc-forms/src/index.ts'),
      '@uswds-wc/feedback': resolve(__dirname, 'packages/uswds-wc-feedback/src/index.ts'),
      '@uswds-wc/navigation': resolve(__dirname, 'packages/uswds-wc-navigation/src/index.ts'),
      '@uswds-wc/data-display': resolve(__dirname, 'packages/uswds-wc-data-display/src/index.ts'),
      '@uswds-wc/layout': resolve(__dirname, 'packages/uswds-wc-layout/src/index.ts'),
      '@uswds-wc/structure': resolve(__dirname, 'packages/uswds-wc-structure/src/index.ts'),
      '@uswds-wc/patterns': resolve(__dirname, 'packages/uswds-wc-patterns/src/index.ts'),
    },
    dedupe: [
      'lit',
      '@lit/reactive-element',
      'lit-element',
      'lit-html',
      'lit/decorators.js',
      'lit/directive.js',
      'lit/directives/unsafe-html.js',
    ],
  },
  define: {
    // Define globals that USWDS modules expect during import-time evaluation
    global: 'globalThis',
  },
  build: {
    outDir: 'cdn',
    emptyOutDir: true,
    lib: {
      // Entry point that exports all components
      entry: resolve(__dirname, 'packages/uswds-wc/src/index.ts'),
      name: 'USWDSWebComponents',
      // Generate ES module format (works in modern browsers)
      formats: ['es'],
      fileName: () => 'uswds-wc.js',
    },
    rollupOptions: {
      // Bundle everything - no externals for CDN build
      external: [],
      output: {
        // Single file output
        inlineDynamicImports: true,
        // Provide global variable for UMD builds (if needed later)
        globals: {},
      },
    },
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        pure_funcs: mode === 'production' ? ['console.log', 'console.debug'] : [],
      },
      format: {
        comments: false,
      },
    },
    commonjsOptions: {
      include: [/node_modules\/@uswds\/uswds/, /node_modules/],
    },
  },
  plugins: mode === 'production'
    ? [
        // Gzip compression
        viteCompression({
          algorithm: 'gzip',
          ext: '.gz',
          threshold: 1024,
        }),
        // Brotli compression
        viteCompression({
          algorithm: 'brotliCompress',
          ext: '.br',
          threshold: 1024,
        }),
      ]
    : [],
}));
