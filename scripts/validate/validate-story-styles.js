#!/usr/bin/env node

/**
 * Story Inline Style Validation Script
 *
 * Validates that Storybook stories don't use inline styles or non-USWDS components.
 * Enforces USWDS compliance in all story examples.
 *
 * Usage:
 *   node validate-story-styles.js              # Validate all story files
 *   node validate-story-styles.js card alert   # Validate specific components
 *   MODIFIED_COMPONENTS="card\nalert" node ... # From pre-commit hook
 *
 * Checks:
 * 1. No inline style attributes (style="...")
 * 2. No custom HTML alert structures (use <usa-alert> instead)
 * 3. No custom badge/tag HTML (use <usa-tag> instead)
 * 4. Prefer USWDS utility classes over inline styles
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// Patterns to detect violations
const VIOLATION_PATTERNS = {
  inlineStyles: {
    pattern: /style=["'][^"']*["']/g,
    message: 'Inline style attribute found - use USWDS utility classes instead',
    severity: 'error',
  },
  customAlert: {
    pattern: /<div[^>]*class=["'][^"']*alert[^"']*["'][^>]*>/g,
    message: 'Custom alert HTML found - use <usa-alert> component instead',
    severity: 'warning',
  },
  customBadge: {
    pattern: /<(?:span|div)[^>]*class=["'][^"']*badge[^"']*["'][^>]*>/g,
    message: 'Custom badge/tag HTML found - use <usa-tag> component instead',
    severity: 'warning',
  },
};

// Exceptions - valid cases where inline styles are acceptable
const STYLE_EXCEPTIONS = [
  // Property binding in Lit templates
  /\.style\s*=\s*\$\{/,
  // CSS custom properties
  /style\s*=\s*["']--[^"']+["']/,
  // Dynamic calculations (rare, but valid)
  /style\s*=\s*["'][^"']*\$\{[^}]+\}[^"']*["']/,
];

const results = {
  passed: [],
  failed: [],
  warnings: [],
};

/**
 * Check if a violation should be ignored based on exceptions
 */
function isException(line, violation) {
  if (violation === 'inlineStyles') {
    return STYLE_EXCEPTIONS.some((exception) => exception.test(line));
  }
  return false;
}

/**
 * Validate a single story file
 */
function validateStoryFile(componentName) {
  // Find story file across all packages
  const storyFiles = globSync(`packages/uswds-wc-*/src/components/*/usa-${componentName}.stories.ts`);

  if (storyFiles.length === 0) {
    results.warnings.push({
      component: componentName,
      issue: 'Story file not found',
      path: `usa-${componentName}.stories.ts`,
    });
    return;
  }

  const storyPath = storyFiles[0]; // Use first match
  const content = fs.readFileSync(storyPath, 'utf-8');
  const lines = content.split('\n');
  const violations = [];

  // Check each line for violations
  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    Object.entries(VIOLATION_PATTERNS).forEach(([violationType, config]) => {
      const matches = line.match(config.pattern);
      if (matches && !isException(line, violationType)) {
        matches.forEach((match) => {
          violations.push({
            line: lineNumber,
            type: violationType,
            match: match.substring(0, 80) + (match.length > 80 ? '...' : ''),
            message: config.message,
            severity: config.severity,
            context: line.trim().substring(0, 100),
          });
        });
      }
    });
  });

  // Categorize results
  const errors = violations.filter((v) => v.severity === 'error');
  const warnings = violations.filter((v) => v.severity === 'warning');

  const result = {
    component: componentName,
    path: storyPath,
    violations: violations,
    errorCount: errors.length,
    warningCount: warnings.length,
  };

  if (errors.length > 0) {
    results.failed.push(result);
  } else if (warnings.length > 0) {
    results.warnings.push(result);
  } else {
    results.passed.push(result);
  }
}

/**
 * Get list of all components with story files
 */
function getAllComponents() {
  // Scan all monorepo packages for components with story files
  const storyPaths = globSync('packages/uswds-wc-*/src/components/*/usa-*.stories.ts');

  // Extract component names from story paths
  const components = storyPaths.map(storyPath => {
    const match = storyPath.match(/usa-([a-z-]+)\.stories\.ts$/);
    return match ? match[1] : null;
  }).filter(Boolean);

  // Return unique component names
  return [...new Set(components)];
}

/**
 * Determine which components to validate
 */
function getComponentsToValidate() {
  // Check for components passed via environment variable (from pre-commit hook)
  if (process.env.MODIFIED_COMPONENTS) {
    const modifiedComponents = process.env.MODIFIED_COMPONENTS.split('\n').filter(Boolean);
    const allComponents = getAllComponents();
    return modifiedComponents.filter((comp) => allComponents.includes(comp));
  }

  // Check for components passed as command-line arguments
  if (process.argv.length > 2) {
    const allComponents = getAllComponents();
    return process.argv.slice(2).filter((comp) => allComponents.includes(comp));
  }

  // Default: check all components
  return getAllComponents();
}

// Main execution
const componentsToValidate = getComponentsToValidate();
const isFiltered = process.env.MODIFIED_COMPONENTS || process.argv.length > 2;

if (componentsToValidate.length === 0) {
  console.log('✅ No story files to validate. Skipping story style validation.\n');
  process.exit(0);
}

if (isFiltered) {
  console.log('🔍 Validating Story Styles for Modified Components\n');
  console.log(`Checking ${componentsToValidate.length} modified component(s)...\n`);
} else {
  console.log('🔍 Validating Story Styles for All Components\n');
  console.log(`Checking ${componentsToValidate.length} component(s) with story files...\n`);
}

// Run validation
componentsToValidate.forEach(validateStoryFile);

// Report results
console.log('━'.repeat(80));
console.log('RESULTS');
console.log('━'.repeat(80));

if (results.passed.length > 0) {
  console.log(`\n✅ PASSED (${results.passed.length}):\n`);
  results.passed.forEach((r) => {
    console.log(`  ${r.component}`);
  });
}

if (results.warnings.length > 0) {
  console.log(`\n⚠️  WARNINGS (${results.warnings.length}):\n`);
  results.warnings.forEach((r) => {
    console.log(`  ${r.component} (${r.warningCount} warning(s))`);
    r.violations.forEach((v) => {
      console.log(`    Line ${v.line}: ${v.message}`);
      console.log(`      ${v.context}`);
    });
    console.log();
  });
}

if (results.failed.length > 0) {
  console.log(`\n❌ FAILED (${results.failed.length}):\n`);
  results.failed.forEach((r) => {
    console.log(`  ${r.component} (${r.errorCount} error(s), ${r.warningCount} warning(s))`);
    r.violations.forEach((v) => {
      const icon = v.severity === 'error' ? '❌' : '⚠️';
      console.log(`    ${icon} Line ${v.line}: ${v.message}`);
      console.log(`      ${v.context}`);
    });
    console.log();
  });
}

// Summary
console.log('━'.repeat(80));
console.log(
  `Summary: ${results.passed.length} passed, ${results.failed.length} failed, ${results.warnings.length} warnings`
);
console.log('━'.repeat(80) + '\n');

// Exit with error if any failures
if (results.failed.length > 0) {
  console.error('❌ Story style validation failed. Please fix the issues above.\n');
  console.log('Common fixes:');
  console.log('  • Replace inline styles with USWDS utility classes');
  console.log('  • Use <usa-alert> instead of custom alert HTML');
  console.log('  • Use <usa-tag> instead of custom badge/tag HTML');
  console.log('  • See docs/USWDS_UTILITY_CLASSES.md for available classes\n');
  process.exit(1);
}

if (results.warnings.length > 0) {
  console.log('⚠️  Some warnings found. Consider addressing them to maintain consistency.\n');
}

console.log('✅ All story files follow USWDS styling guidelines!\n');
process.exit(0);
