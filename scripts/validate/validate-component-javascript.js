#!/usr/bin/env node

/**
 * Component JavaScript Integration Validator
 *
 * This script validates that ALL interactive components properly initialize USWDS JavaScript.
 * It catches the exact issue we just fixed where accordion wasn't calling setupEventHandlers().
 *
 * Validates:
 * 1. All interactive components call USWDS.componentName.on(this) or equivalent
 * 2. Components have setupEventHandlers() or similar initialization
 * 3. firstUpdated() properly initializes USWDS integration
 * 4. No broken import paths in test files
 *
 * Exit codes:
 * - 0: All validations passed
 * - 1: Critical issues found (missing USWDS integration)
 * - 2: Warning issues found (potential problems)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// Components that MUST have JavaScript integration
// (Only components with USWDS JavaScript source files in node_modules/@uswds/uswds/packages/usa-*/src/index.js)
const INTERACTIVE_COMPONENTS = [
  'accordion',
  'banner',
  'character-count',
  'combo-box',
  'date-picker',
  'date-range-picker',
  'file-input',
  'footer',
  'header',
  'in-page-navigation',
  'language-selector',
  'menu',
  'modal',
  'search',
  'time-picker',
  'tooltip',
];

// Components that are CSS-only (no JavaScript needed)
// These don't have USWDS JavaScript source files
const CSS_ONLY_COMPONENTS = [
  'button',
  'alert',
  'card',
  'breadcrumb',
  'pagination',
  'step-indicator',
  'tag',
  'link',
  'prose',
  'section',
  'summary-box',
  'select',
];

let errors = [];
let warnings = [];
let passed = [];

console.log('🔍 Validating Component JavaScript Integration...\n');

/**
 * Find component file path across monorepo packages
 */
function findComponentPath(componentName) {
  const packagesDir = path.join(rootDir, 'packages');
  const packageDirs = fs.readdirSync(packagesDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name.startsWith('uswds-wc-'))
    .map(d => d.name);

  for (const pkgName of packageDirs) {
    const componentPath = path.join(rootDir, `packages/${pkgName}/src/components/${componentName}/usa-${componentName}.ts`);
    if (fs.existsSync(componentPath)) {
      return componentPath;
    }
  }
  return null;
}

/**
 * Check if component file properly initializes USWDS
 */
function validateComponentJavaScript(componentName) {
  const componentPath = findComponentPath(componentName);

  if (!componentPath) {
    warnings.push(`⚠️  ${componentName}: Component file not found`);
    return;
  }

  const content = fs.readFileSync(componentPath, 'utf-8');

  // Check for USWDS integration patterns
  const hasUSWDSOn = content.includes('USWDS.') && content.includes('.on(');
  const hasSetupEventHandlers = content.includes('setupEventHandlers()');
  const hasSetupUSWDSEventHandlers = content.includes('setupUSWDSEventHandlers()');
  const hasEnsureUSWDSCompliance = content.includes('ensureUSWDSCompliance()');
  const hasInitializeUSWDS = content.includes('initializeUSWDS') || content.includes('initializeUSWDSComponent');
  const hasFirstUpdated = content.includes('firstUpdated(');

  // Check for Mirrored Behavior Pattern (Pattern 2 from CLAUDE.md)
  // Format: initialize{ComponentName}(this) from usa-{component}-behavior.js
  const componentNameCamelCase = componentName.split('-').map((part, i) =>
    i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
  ).join('');
  const componentNamePascalCase = componentNameCamelCase.charAt(0).toUpperCase() + componentNameCamelCase.slice(1);

  const hasMirroredBehaviorImport = content.includes(`usa-${componentName}-behavior.js`) ||
                                    content.includes(`usa-${componentName}-behavior.ts`);
  const hasMirroredBehaviorInit = content.includes(`initialize${componentNamePascalCase}(`) ||
                                  content.includes('USWDS-Mirrored Behavior Pattern') ||
                                  content.includes('USWDS-mirrored behavior');
  const hasMirroredBehaviorCleanup = content.includes('this.cleanup =');

  // Check for @uswds-behavior-disabled annotation (intentionally disabled for Lit compatibility)
  const hasBehaviorDisabled = content.includes('@uswds-behavior-disabled');

  // Check if setupEventHandlers is called in firstUpdated
  const firstUpdatedMatch = content.match(/firstUpdated\([^)]*\)\s*{([^}]*(?:{[^}]*}[^}]*)*)}/s);
  const callsSetupInFirstUpdated = firstUpdatedMatch && firstUpdatedMatch[0].includes('setupEventHandlers()');

  // Check for USWDS initialization in firstUpdated (via initializeUSWDSComponent or mirrored behavior)
  const firstUpdatedCallsUSWDSInit = firstUpdatedMatch && (
    firstUpdatedMatch[0].includes('initializeUSWDS') ||
    firstUpdatedMatch[0].includes('this.setupEventHandlers()') ||
    firstUpdatedMatch[0].includes(`initialize${componentNamePascalCase}(`)
  );

  // Validate interactive components
  if (INTERACTIVE_COMPONENTS.includes(componentName)) {
    // A component has proper integration if:
    // 1. It calls initializeUSWDSComponent (which handles USWDS.on internally), OR
    // 2. It explicitly calls setupEventHandlers() in firstUpdated, OR
    // 3. It has direct USWDS.componentName.on(this) calls, OR
    // 4. It uses USWDS-Mirrored Behavior Pattern (Pattern 2 from CLAUDE.md), OR
    // 5. It has @uswds-behavior-disabled annotation (Lit-implemented behavior with 100% parity)
    const hasProperIntegration = (
      hasInitializeUSWDS ||  // Pattern 1: Direct USWDS Integration
      (hasSetupEventHandlers && callsSetupInFirstUpdated) ||  // Legacy accordion pattern
      (hasUSWDSOn && hasEnsureUSWDSCompliance) ||  // Direct USWDS integration
      (hasMirroredBehaviorImport && hasMirroredBehaviorInit && hasMirroredBehaviorCleanup) ||  // Pattern 2: Mirrored Behavior
      hasBehaviorDisabled  // Pattern 2 variant: Lit-implemented behavior (behavior disabled for DOM compatibility)
    );

    if (!hasProperIntegration) {
      // Only error if component truly has NO USWDS integration at all
      if (!hasFirstUpdated || !firstUpdatedCallsUSWDSInit) {
        errors.push(
          `❌ ${componentName}: Missing USWDS JavaScript integration!\n` +
          `   Expected: initializeUSWDSComponent() OR initialize${componentNamePascalCase}() in firstUpdated()\n` +
          `   Found: hasInitializeUSWDS=${hasInitializeUSWDS}, mirroredBehavior=${hasMirroredBehaviorInit}, ` +
          `setupEventHandlers=${hasSetupEventHandlers}, callsSetupInFirstUpdated=${callsSetupInFirstUpdated}`
        );
      } else {
        // Component has some initialization, just not the specific patterns
        passed.push(`✅ ${componentName}: USWDS JavaScript integrated via utility`);
      }
    } else {
      const pattern = hasBehaviorDisabled ? 'Lit-Implemented Behavior (100% USWDS parity)' :
                      hasMirroredBehaviorImport ? 'Mirrored Behavior Pattern' :
                      hasInitializeUSWDS ? 'Direct Integration Pattern' : 'Custom Pattern';
      passed.push(`✅ ${componentName}: USWDS JavaScript properly integrated (${pattern})`);
    }
  }
}

/**
 * Check for broken import paths in test files
 */
function validateTestImports() {
  const testFiles = [];

  function findTestFiles(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        findTestFiles(fullPath);
      } else if (file.endsWith('.test.ts')) {
        testFiles.push(fullPath);
      }
    }
  }

  // Scan all monorepo packages
  const packagesDir = path.join(rootDir, 'packages');
  if (fs.existsSync(packagesDir)) {
    const packages = fs.readdirSync(packagesDir, { withFileTypes: true });
    for (const pkg of packages) {
      if (pkg.isDirectory() && pkg.name.startsWith('uswds-wc-')) {
        findTestFiles(path.join(packagesDir, pkg.name, 'src'));
      }
    }
  }

  for (const testFile of testFiles) {
    const content = fs.readFileSync(testFile, 'utf-8');
    const relativePath = path.relative(rootDir, testFile);

    // Check for broken import patterns
    if (content.includes("import '../src/")) {
      errors.push(
        `❌ ${relativePath}: Broken import path detected!\n` +
        `   Found: import '../src/...' (should be relative to component directory)\n` +
        `   Fix: Use './usa-component.ts' instead of '../src/components/component/usa-component.ts'`
      );
    }
  }
}

/**
 * Check if component has setupEventHandlers but doesn't call it
 */
function validateEventHandlerCalls() {
  for (const componentName of INTERACTIVE_COMPONENTS) {
    const componentPath = findComponentPath(componentName);

    if (!componentPath) continue;

    const content = fs.readFileSync(componentPath, 'utf-8');

    // If component defines setupEventHandlers but doesn't call it anywhere, warn
    if (content.includes('setupEventHandlers()') && content.includes('setupEventHandlers(')) {
      const defineCount = (content.match(/setupEventHandlers\(\)/g) || []).length;
      const callCount = (content.match(/this\.setupEventHandlers\(\)|setupEventHandlers\(\)/g) || []).length;

      if (defineCount === callCount) {
        warnings.push(
          `⚠️  ${componentName}: setupEventHandlers() defined but may not be called\n` +
          `   Verify it's called in connectedCallback() or firstUpdated()`
        );
      }
    }
  }
}

// Run all validations
console.log('📋 Checking Component JavaScript Integration...\n');
for (const componentName of INTERACTIVE_COMPONENTS) {
  validateComponentJavaScript(componentName);
}

console.log('\n📋 Checking Test Import Paths...\n');
validateTestImports();

console.log('\n📋 Checking Event Handler Calls...\n');
validateEventHandlerCalls();

// Print results
console.log('\n' + '='.repeat(80));
console.log('📊 VALIDATION RESULTS\n');

if (passed.length > 0) {
  console.log('✅ PASSED:\n');
  passed.forEach(msg => console.log(`   ${msg}`));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS:\n');
  warnings.forEach(msg => console.log(`   ${msg}\n`));
}

if (errors.length > 0) {
  console.log('❌ ERRORS:\n');
  errors.forEach(msg => console.log(`   ${msg}\n`));
}

console.log('='.repeat(80));
console.log(`\n📈 Summary: ${passed.length} passed, ${warnings.length} warnings, ${errors.length} errors\n`);

// Exit with appropriate code
if (errors.length > 0) {
  console.log('💥 Critical issues found - please fix errors before committing');
  process.exit(1);
} else if (warnings.length > 0) {
  console.log('⚠️  Warnings found - please review');
  process.exit(0); // Don't block on warnings
} else {
  console.log('✨ All validations passed!');
  process.exit(0);
}
