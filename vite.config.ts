import { defineConfig } from 'vite';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';

export default defineConfig(({ mode }) => ({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/styles': resolve(__dirname, 'src/styles'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/types': resolve(__dirname, 'src/types'),
      // Force all lit packages to use same instance
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
  css: {
    preprocessorOptions: {
      scss: {
        includePaths: [
          'node_modules/@uswds/uswds/scss',
          'node_modules/@uswds/uswds/packages',
          'node_modules',
          'src/styles',
        ],
        // additionalData: `@use "src/styles/_uswds-theme" as settings;`,
      },
    },
  },
  define: {
    // Define globals that USWDS modules expect during import-time evaluation
    global: 'globalThis',
  },
  optimizeDeps: {
    include: [
      'lit',
      'lit/decorators.js',
      '@lit/reactive-element',
      // CRITICAL: Include USWDS modules for proper CommonJS to ESM conversion
      '@uswds/uswds/js/usa-accordion',
      '@uswds/uswds/js/usa-date-picker',
      '@uswds/uswds/js/usa-in-page-navigation',
      '@uswds/uswds/js/usa-modal',
      '@uswds/uswds/js/usa-combo-box',
      '@uswds/uswds/js/usa-time-picker',
      '@uswds/uswds/js/usa-header',
      '@uswds/uswds/js/usa-tooltip',
      '@uswds/uswds/js/usa-skipnav',
      '@uswds/uswds/js/usa-table',
      '@uswds/uswds/js/usa-search',
      '@uswds/uswds/js/usa-character-count',
      '@uswds/uswds/js/usa-file-input',
      '@uswds/uswds/js/usa-date-range-picker',
    ],
    // Force pre-bundling even in development
    force: true,
  },
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        // Category entry points for organized imports
        'forms/index': resolve(__dirname, 'src/forms/index.ts'),
        'navigation/index': resolve(__dirname, 'src/navigation/index.ts'),
        'data-display/index': resolve(__dirname, 'src/data-display/index.ts'),
        'feedback/index': resolve(__dirname, 'src/feedback/index.ts'),
        'actions/index': resolve(__dirname, 'src/actions/index.ts'),
        'layout/index': resolve(__dirname, 'src/layout/index.ts'),
        'structure/index': resolve(__dirname, 'src/structure/index.ts'),
        // Individual component entries for selective imports
        'components/accordion': resolve(__dirname, 'src/components/accordion/index.ts'),
        'components/button': resolve(__dirname, 'src/components/button/index.ts'),
        'components/alert': resolve(__dirname, 'src/components/alert/index.ts'),
      },
      name: 'USWDSWebComponents',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['lit', '@lit/reactive-element', 'lit-element', 'lit-html'],
      output: {
        globals: {
          lit: 'Lit',
          '@lit/reactive-element': 'LitReactiveElement',
        },
        // Advanced minification for production
        ...(mode === 'production' && {
          compact: true,
        }),
      },
      plugins: [
        // Bundle visualization for analysis
        mode === 'production' &&
          visualizer({
            filename: 'dist/stats.html',
            gzipSize: true,
            brotliSize: true,
            template: 'treemap',
          }),
      ].filter(Boolean),
    },
    sourcemap: true,
    // Advanced minification options
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
    // Set bundle size warnings
    chunkSizeWarningLimit: 500, // 500 KB warning threshold
  },
  // Add compression plugins for production
  plugins:
    mode === 'production'
      ? [
          // Gzip compression
          viteCompression({
            algorithm: 'gzip',
            ext: '.gz',
            threshold: 1024, // Only compress files > 1KB
          }),
          // Brotli compression
          viteCompression({
            algorithm: 'brotliCompress',
            ext: '.br',
            threshold: 1024,
          }),
        ]
      : [],
  test: {
    globals: true,
    environment: 'jsdom',
  },
}));
