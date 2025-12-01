import type { StorybookConfig } from '@storybook/web-components-vite';
import remarkGfm from 'remark-gfm';
import { resolve } from 'path';

const config: StorybookConfig = {
  stories: [
    // Pick up all stories from all packages
    '../packages/**/src/**/*.stories.@(ts|mdx)',
    // Include component changelogs (version history)
    '../packages/**/src/components/*/CHANGELOG.mdx',
    // Note: TESTING.mdx files excluded - too technical for Storybook UI
    './*.mdx', // Include documentation files from .storybook directory
  ],
  staticDirs: ['../public'],
  addons: [
    // Note: In Storybook 9, essential addons (actions, controls, etc.) are built into core
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
    // '@storybook/addon-coverage', // Temporarily disabled due to Node.js compatibility issue
    {
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
  ],
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },
  docs: {
    defaultName: 'Docs',
  },
  typescript: {
    check: false,
  },
  viteFinal: async (config) => {
    // Set Vite root to project root for monorepo support
    config.root = resolve(__dirname, '..');

    // Ensure proper module resolution for monorepo
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      // CSS import alias (must come before general @uswds-wc/core alias)
      '@uswds-wc/core/styles.css': resolve(__dirname, '../packages/uswds-wc-core/src/styles/styles.css'),
      '@uswds-wc/core': resolve(__dirname, '../packages/uswds-wc-core/src'),
      '@uswds-wc/actions': resolve(__dirname, '../packages/uswds-wc-actions/src'),
      '@uswds-wc/forms': resolve(__dirname, '../packages/uswds-wc-forms/src'),
      '@uswds-wc/navigation': resolve(__dirname, '../packages/uswds-wc-navigation/src'),
      '@uswds-wc/data-display': resolve(__dirname, '../packages/uswds-wc-data-display/src'),
      '@uswds-wc/feedback': resolve(__dirname, '../packages/uswds-wc-feedback/src'),
      '@uswds-wc/layout': resolve(__dirname, '../packages/uswds-wc-layout/src'),
      '@uswds-wc/structure': resolve(__dirname, '../packages/uswds-wc-structure/src'),
      '@uswds-wc/patterns': resolve(__dirname, '../packages/uswds-wc-patterns/src'),
      '@uswds-wc/templates': resolve(__dirname, '../packages/uswds-wc-templates/src'),
      // Resolve @storybook/blocks to addon-docs for MDX files
      '@storybook/blocks': resolve(
        __dirname,
        '../node_modules/@storybook/addon-docs/dist/blocks.mjs'
      ),
    };

    // Comprehensive Lit deduplication strategy
    config.resolve.dedupe = config.resolve.dedupe || [];
    config.resolve.dedupe.push('lit', '@lit/reactive-element', 'lit-element', 'lit-html');

    // Remove external configuration to allow bundling
    config.build = config.build || {};
    config.build.rollupOptions = config.build.rollupOptions || {};

    // Add alias for rollup build phase to handle CSS imports
    config.build.rollupOptions.alias = config.build.rollupOptions.alias || {};
    config.build.rollupOptions.alias['@uswds-wc/core/styles.css'] = resolve(
      __dirname,
      '../packages/uswds-wc-core/src/styles/styles.css'
    );

    // CRITICAL: CommonJS handling for USWDS modules in Storybook
    config.build.commonjsOptions = config.build.commonjsOptions || {};
    config.build.commonjsOptions.include = [/node_modules\/@uswds\/uswds/, /node_modules/];

    // Phase 5: Enhanced Hot Reload & Development Performance
    // Optimize dependencies with forced refresh and better caching
    config.optimizeDeps = config.optimizeDeps || {};
    config.optimizeDeps.include = config.optimizeDeps.include || [];
    config.optimizeDeps.include.push(
      'lit',
      'lit/decorators.js',
      '@lit/reactive-element',
      'lit/directives/repeat.js',
      'lit/directives/class-map.js',
      'lit/directives/if-defined.js',
      'lit/directives/when.js',
      // CRITICAL: Include USWDS modules for proper CommonJS to ESM conversion
      '@uswds/uswds/js/usa-accordion',
      '@uswds/uswds/js/usa-date-picker',
      '@uswds/uswds/js/usa-in-page-navigation',
      '@uswds/uswds/js/usa-modal', // Ensure modal is included
      '@uswds/uswds/js/usa-combo-box',
      '@uswds/uswds/js/usa-time-picker',
      '@uswds/uswds/js/usa-header',
      '@uswds/uswds/js/usa-tooltip',
      // Additional USWDS modules
      '@uswds/uswds/js/usa-skipnav',
      '@uswds/uswds/js/usa-date-range-picker',
      '@uswds/uswds/js/usa-character-count',
      '@uswds/uswds/js/usa-file-input',
      '@uswds/uswds/js/usa-table'
    );
    config.optimizeDeps.force = true;

    // Enable faster hot reload
    config.server = config.server || {};
    config.server.hmr = config.server.hmr || {};
    if (typeof config.server.hmr === 'object') {
      config.server.hmr.overlay = true; // Show overlay for HMR errors
      config.server.hmr.clientPort = undefined; // Let Vite auto-detect
      config.server.hmr.timeout = 2000; // Faster timeout for better UX
    }

    // Enhance development server settings for faster iteration
    config.server.fs = config.server.fs || {};
    config.server.fs.strict = false; // Allow serving files outside root
    config.server.fs.allow = config.server.fs.allow || [];
    // Add packages directory to allowed serve paths for monorepo
    config.server.fs.allow.push(resolve(__dirname, '../packages'));
    config.server.watch = config.server.watch || {};
    if (typeof config.server.watch === 'object') {
      config.server.watch.usePolling = false; // Use native file watching for performance
      config.server.watch.interval = 100; // Fast file watching
      config.server.watch.ignored = [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/coverage/**',
        '**/.nyc_output/**',
        '**/storybook-static/**',
      ];
    }

    // Performance optimizations for development
    config.esbuild = config.esbuild || {};
    if (typeof config.esbuild === 'object') {
      config.esbuild.keepNames = true; // Preserve function names for debugging
      config.esbuild.minifyIdentifiers = false; // Don't minify in dev mode
    }

    // Faster CSS processing in development
    config.css = config.css || {};
    config.css.devSourcemap = true; // Enable CSS sourcemaps for debugging

    // Add support for raw markdown imports for documentation integration
    config.assetsInclude = config.assetsInclude || [];
    if (Array.isArray(config.assetsInclude)) {
      config.assetsInclude.push('**/*.md');
    }

    // Configure MDX processing to support tables and GFM
    config.define = config.define || {};
    config.define['process.env.MDX_SUPPORT_TABLES'] = 'true';
    config.define['process.env.NODE_ENV'] = '"development"'; // Ensure dev mode
    // CRITICAL: Define globals that USWDS modules expect during import-time evaluation
    config.define.global = 'globalThis';

    // Enhanced caching strategy
    config.cacheDir = config.cacheDir || 'node_modules/.vite-storybook';

    return config;
  },
};

export default config;
