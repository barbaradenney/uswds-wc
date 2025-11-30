/**
 * Stryker Mutation Testing Configuration
 *
 * Validates test quality by introducing code mutations and verifying tests catch them.
 *
 * Mutation Types:
 * - Arithmetic operators (+ → -, * → /)
 * - Boolean operators (< → <=, > → >=)
 * - Conditional operators (if → !if)
 * - String mutations ('' → 'Stryker')
 * - Block removal
 *
 * Usage:
 *   npm run test:mutation
 *   npm run test:mutation:report
 *   npm run test:mutation:incremental
 */

/** @type {import('@stryker-mutator/core').PartialStrykerOptions} */
const config = {
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress', 'json'],
  testRunner: 'vitest',
  coverageAnalysis: 'perTest',

  // Mutation targets - monorepo structure
  mutate: [
    'packages/*/src/components/**/*.ts',
    '!packages/*/src/components/**/*.test.ts',
    '!packages/*/src/components/**/*.stories.ts',
    '!packages/*/src/components/**/*.cy.ts',
    '!packages/*/src/components/**/index.ts',
  ],

  // Ignore patterns
  ignorePatterns: [
    'node_modules',
    'dist',
    'coverage',
    'storybook-static',
    '.storybook',
    '__tests__',
    'tests',
    'cypress',
    'scripts',
    '**/*.d.ts',
  ],

  // Mutation thresholds
  thresholds: {
    high: 80,    // 80%+ mutation score = excellent
    low: 60,     // Below 60% = needs improvement
    break: 50,   // Below 50% = fail build
  },

  // Performance settings
  concurrency: 4,
  timeoutMS: 60000,
  timeoutFactor: 1.5,

  // Incremental mode - only test changed files
  incremental: false,
  incrementalFile: 'reports/stryker-incremental.json',

  // Advanced options
  maxConcurrentTestRunners: 4,
  disableTypeChecks: '{src,lib,test}/**/*.{js,ts,jsx,tsx,html,vue}',

  // Test framework configuration
  vitest: {
    configFile: 'vitest.config.ts',
  },

  // Plugins
  plugins: [
    '@stryker-mutator/vitest-runner',
  ],

  // Mutation operators
  mutator: {
    plugins: ['typescript'],
    excludedMutations: [
      // Exclude mutations that don't provide value
      'StringLiteral',      // USWDS class names shouldn't mutate
      'ObjectLiteral',      // Configuration objects
      'ArrowFunction',      // Function syntax mutations
    ],
  },

  // HTML report configuration
  htmlReporter: {
    baseDir: 'reports/mutation',
  },

  // JSON report for CI integration
  jsonReporter: {
    fileName: 'reports/mutation/mutation-report.json',
  },

  // CI mode
  clearTextReporter: {
    allowColor: true,
    logTests: false,
  },
};

export default config;
