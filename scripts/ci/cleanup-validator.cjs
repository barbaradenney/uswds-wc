#!/usr/bin/env node

/**
 * Pre-commit cleanup validator
 * Ensures repository stays organized before commits
 */

const fs = require('fs');
const path = require('path');

const violations = [];

// Check for loose files in root
const rootFiles = fs.readdirSync('.');
const allowedRootFiles = [
  'README.md', 'CLAUDE.md', 'CHANGELOG.md', 'LICENSE',
  'CONTRIBUTING.md', 'SECURITY.md', 'CODE_OF_CONDUCT.md', // Standard open source files
  '.project-metadata.json', '.templates', // Documentation generation system
  'package.json', 'package-lock.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', 'renovate.json',
  'tsconfig.json', 'tsconfig.build.json', 'tsconfig.node.json', 'tsconfig.test.json',
  'vite.config.ts', 'vitest.config.ts', 'vitest.storybook.config.ts',
  'playwright.config.ts', 'playwright.comprehensive.config.ts',
  'cypress.config.ts', 'lighthouserc.js', 'postcss.config.cjs', 'gulpfile.cjs',
  'turbo.json', // Turborepo configuration
  '.gitignore', '.eslintrc.json', '.prettierrc', '.nvmrc', '.editorconfig',
  'node_modules', 'dist', 'coverage', 'debug', 'reports', 'scratch',
  '__tests__', 'assets', 'compliance', 'cypress', 'docs', 'eslint-rules',
  'public', 'sass', 'scripts', 'src', 'test-results', 'playwright-report', '.git',
  '.husky', '.storybook', '.vscode', '.DS_Store', 'storybook-static', 'compliance-reports',
  '.changeset', 'packages', 'test-reports' // Monorepo directories
];

rootFiles.forEach(file => {
  if (!allowedRootFiles.includes(file) && !file.startsWith('.')) {
    const standardFiles = ['README.md', 'CLAUDE.md', 'CHANGELOG.md', 'CONTRIBUTING.md', 'SECURITY.md', 'CODE_OF_CONDUCT.md'];
    if (file.endsWith('.md') && !standardFiles.includes(file)) {
      violations.push(`❌ Documentation file in root: ${file} (should be in docs/)`);
    }
    if (file.endsWith('.html')) {
      violations.push(`❌ HTML file in root: ${file} (should be in debug/ or component folder)`);
    }
    if (file.endsWith('.json') && !['package.json', 'package-lock.json', 'renovate.json', 'tsconfig.json', 'turbo.json', 'vercel.json', 'lighthouserc.json'].includes(file)) {
      violations.push(`❌ JSON file in root: ${file} (should be in reports/)`);
    }
    if ((file.endsWith('.js') || file.endsWith('.sh')) && file.startsWith('test-')) {
      violations.push(`❌ Test file in root: ${file} (should be in debug/ or component folder)`);
    }
    if (file.endsWith('.log')) {
      violations.push(`❌ Log file in root: ${file} (should be in reports/logs/)`);
    }
  }
});

// Check for loose scripts in scripts/
if (fs.existsSync('scripts')) {
  const scriptFiles = fs.readdirSync('scripts');
  const looseScripts = scriptFiles.filter(f => 
    (f.endsWith('.js') || f.endsWith('.sh') || f.endsWith('.cjs')) && 
    !f.startsWith('.')
  );
  
  if (looseScripts.length > 0) {
    violations.push(`❌ ${looseScripts.length} loose scripts in scripts/ directory:`);
    looseScripts.slice(0, 5).forEach(s => violations.push(`   - ${s}`));
    if (looseScripts.length > 5) {
      violations.push(`   ... and ${looseScripts.length - 5} more`);
    }
    violations.push(`   → Should be in: scripts/test/, scripts/validate/, scripts/build/, etc.`);
  }
}

// Check for component-specific tests in __tests__
if (fs.existsSync('__tests__')) {
  const testFiles = fs.readdirSync('__tests__').filter(f => f.endsWith('.test.ts'));
  const componentPatterns = [
    'accordion', 'alert', 'banner', 'breadcrumb', 'button', 'card', 'character-count',
    'combo-box', 'date-picker', 'date-range-picker', 'file-input', 'footer', 'header',
    'menu', 'modal', 'pagination', 'search', 'select', 'step-indicator', 'time-picker',
    'tooltip', 'in-page-navigation', 'language-selector'
  ];
  
  testFiles.forEach(file => {
    componentPatterns.forEach(pattern => {
      if (file.startsWith(pattern + '-')) {
        violations.push(`❌ Component-specific test in __tests__: ${file}`);
        violations.push(`   → Should be in: src/components/${pattern}/`);
      }
    });
  });
}

// Check for documentation files in __tests__
if (fs.existsSync('__tests__')) {
  const docsFiles = fs.readdirSync('__tests__').filter(f => f.endsWith('.md'));
  docsFiles.forEach(file => {
    violations.push(`❌ Documentation in __tests__: ${file} (should be in docs/archived/)`);
  });
}

// Report results
if (violations.length > 0) {
  console.error('\n🚫 Repository Cleanup Violations Detected:\n');
  violations.forEach(v => console.error(v));
  console.error('\n💡 Tips:');
  console.error('   - Move test files to component folders or debug/');
  console.error('   - Move docs to docs/ or docs/archived/');
  console.error('   - Organize scripts into categorized subdirectories');
  console.error('   - Move JSON reports to reports/');
  console.error('\nRun: npm run cleanup:auto (once implemented)\n');
  process.exit(1);
}

console.log('✅ Repository organization validated - clean!');
process.exit(0);
