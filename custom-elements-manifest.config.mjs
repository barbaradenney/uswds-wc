/**
 * Custom Elements Manifest Configuration
 *
 * Generates machine-readable API documentation for all web components
 * in the USWDS Web Components library.
 *
 * @see https://custom-elements-manifest.open-wc.org/
 */
export default {
  /** Glob patterns for component source files */
  globs: [
    'packages/uswds-wc-actions/src/components/**/*.ts',
    'packages/uswds-wc-forms/src/components/**/*.ts',
    'packages/uswds-wc-navigation/src/components/**/*.ts',
    'packages/uswds-wc-data-display/src/components/**/*.ts',
    'packages/uswds-wc-feedback/src/components/**/*.ts',
    'packages/uswds-wc-layout/src/components/**/*.ts',
    'packages/uswds-wc-structure/src/components/**/*.ts',
    'packages/uswds-wc-patterns/src/patterns/**/*.ts',
    'packages/uswds-wc-templates/src/templates/**/*.ts',
  ],

  /** Files to exclude from analysis */
  exclude: [
    '**/*.test.ts',
    '**/*.spec.ts',
    '**/*.stories.ts',
    '**/*.cy.ts',
    '**/*-behavior*.ts',
    '**/*.d.ts',
    '**/dist/**',
    '**/node_modules/**',
  ],

  /** Output directory for custom-elements.json */
  outdir: './',

  /** Enable Lit-specific analysis */
  litelement: true,

  /** Include package.json info in output */
  packagejson: true,

  /** Plugins for additional analysis */
  plugins: [],
};
