#!/usr/bin/env node
/**
 * Unified USWDS Compliance Validation System
 *
 * Consolidates 60+ compliance scripts into a single flag-based validation system.
 * Replaces: compliance:*, validate:uswds-*, validate:*, per-component compliance scripts
 *
 * Usage:
 *   npm run validate -- --all                 # Run all compliance checks
 *   npm run validate -- --component=accordion # Validate specific component
 *   npm run validate -- --uswds               # USWDS HTML/CSS compliance
 *   npm run validate -- --structure           # Component structure validation
 *   npm run validate -- --css                 # CSS compliance (no custom styles)
 *   npm run validate -- --javascript          # JavaScript integration validation
 *   npm run validate -- --accessibility       # Accessibility compliance
 *   npm run validate -- --architecture        # Architecture pattern compliance
 *   npm run validate -- --storybook           # Storybook story validation
 *
 * Advanced:
 *   npm run validate -- --fix                 # Auto-fix issues where possible
 *   npm run validate -- --strict              # Strict mode (fail on warnings)
 *   npm run validate -- --report=json         # Output JSON report
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import { getAllComponentPaths, getAllComponentNames, getComponentPath } from '../utils/find-components.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '../..');

// Parse command line arguments
const args = process.argv.slice(2);
const flags = {
  all: args.includes('--all'),
  component: args.find(arg => arg.startsWith('--component='))?.split('=')[1],
  uswds: args.includes('--uswds'),
  structure: args.includes('--structure'),
  css: args.includes('--css'),
  javascript: args.includes('--javascript'),
  accessibility: args.includes('--accessibility'),
  architecture: args.includes('--architecture'),
  storybook: args.includes('--storybook'),
  fix: args.includes('--fix'),
  strict: args.includes('--strict'),
  report: args.find(arg => arg.startsWith('--report='))?.split('=')[1],
  verbose: args.includes('--verbose'),
};

// Color utilities
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60) + '\n');
}

// Validation results storage
const results = {
  passed: [],
  warnings: [],
  failures: [],
  fixed: [],
};

// Get component list
function getComponents() {
  return getAllComponentNames();
}

// Validation: USWDS HTML/CSS Compliance
async function validateUSWDSCompliance(componentName) {
  const componentDir = getComponentPath(componentName);
  if (!componentDir) {
    results.warnings.push(`${componentName}: Component directory not found`);
    return;
  }
  const componentPath = path.join(componentDir, `usa-${componentName}.ts`);

  if (!fs.existsSync(componentPath)) {
    results.warnings.push(`${componentName}: Component file not found`);
    return;
  }

  const content = fs.readFileSync(componentPath, 'utf-8');

  // Check 1: Uses official USWDS CSS import
  // Support both old path (../../styles/styles.css) and new monorepo path (@uswds-wc/core/styles.css)
  const hasOldImport = content.includes("import '../../styles/styles.css'");
  const hasMonorepoImport = content.includes("import '@uswds-wc/core/styles.css'");

  if (!hasOldImport && !hasMonorepoImport) {
    results.failures.push(`${componentName}: Missing USWDS CSS import`);

    if (flags.fix) {
      // Auto-fix: Add import
      const fixedContent = `import '@uswds-wc/core/styles.css';\n${content}`;
      fs.writeFileSync(componentPath, fixedContent);
      results.fixed.push(`${componentName}: Added USWDS CSS import`);
    }
  } else {
    results.passed.push(`${componentName}: ✓ USWDS CSS import`);
  }

  // Check 2: No custom CSS beyond :host
  const customCSSRegex = /static\s+(?:override\s+)?styles\s*=\s*css`([^`]*)`/;
  const match = content.match(customCSSRegex);

  if (match && match[1]) {
    const styles = match[1].trim();
    // Only :host display/contain styles are allowed
    if (styles && !styles.match(/^:host\s*\{\s*(?:display|contain):/)) {
      results.failures.push(`${componentName}: Contains custom CSS beyond :host display/contain`);
    } else {
      results.passed.push(`${componentName}: ✓ Minimal CSS (only :host)`);
    }
  } else {
    results.passed.push(`${componentName}: ✓ No custom CSS`);
  }

  // Check 3: Uses light DOM (no Shadow DOM)
  if (content.includes('createRenderRoot()') && content.includes('return this')) {
    results.passed.push(`${componentName}: ✓ Light DOM rendering`);
  } else if (content.includes('USWDSBaseComponent')) {
    results.passed.push(`${componentName}: ✓ Light DOM (via USWDSBaseComponent)`);
  } else {
    results.warnings.push(`${componentName}: Check light DOM implementation`);
  }

  // Check 4: Uses USWDS CSS classes in render/template methods
  // Look for USWDS classes anywhere in the component file
  // This handles direct usage, helper methods, and programmatic application
  const hasDirectUSWDSClasses = /class="[^"]*usa-[^"]*"/.test(content);
  const hasClassMethod = /class="\$\{this\.get\w+Classes\(\)\}"/.test(content);
  const hasUSWDSVariable = /class="\$\{[^}]*[Cc]lass/.test(content);
  const hasProgrammaticClasses = /this\.buttonElement\.className|updateButtonElement|updateClasses/.test(content);

  if (hasDirectUSWDSClasses || hasClassMethod || hasUSWDSVariable || hasProgrammaticClasses) {
    results.passed.push(`${componentName}: ✓ Uses USWDS CSS classes`);
  } else {
    results.warnings.push(`${componentName}: No USWDS classes found in component`);
  }
}

// Validation: Component Structure
async function validateStructure(componentName) {
  const componentDir = getComponentPath(componentName);
  if (!componentDir) {
    results.warnings.push(`${componentName}: Component directory not found`);
    return;
  }

  const requiredFiles = [
    `usa-${componentName}.ts`,
    `usa-${componentName}.test.ts`,
    `usa-${componentName}.stories.ts`,
    'README.md',
    'index.ts',
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(componentDir, file);

    if (fs.existsSync(filePath)) {
      results.passed.push(`${componentName}: ✓ Has ${file}`);
    } else {
      results.failures.push(`${componentName}: Missing ${file}`);
    }
  }
}

// Validation: JavaScript Integration
async function validateJavaScriptIntegration(componentName) {
  const componentDir = getComponentPath(componentName);
  if (!componentDir) {
    results.warnings.push(`${componentName}: Component directory not found`);
    return;
  }
  const componentPath = path.join(componentDir, `usa-${componentName}.ts`);

  if (!fs.existsSync(componentPath)) {
    results.warnings.push(`${componentName}: Component file not found`);
    return;
  }

  const content = fs.readFileSync(componentPath, 'utf-8');

  // Interactive components that require USWDS JavaScript integration
  const interactiveComponents = [
    'accordion', 'combo-box', 'date-picker', 'date-range-picker',
    'file-input', 'modal', 'time-picker', 'character-count',
    'header', 'banner', 'search', 'tooltip', 'in-page-navigation',
  ];

  if (interactiveComponents.includes(componentName)) {
    // Check for USWDS initialization (standard loader, global USWDS, mirrored behavior, or intentional Lit implementation)
    const hasStandardInit = content.includes('initializeUSWDSComponent');
    const hasGlobalUSWDS = content.includes('USWDS.');
    const hasBehaviorFile = content.includes(`-behavior.js'`) || content.includes(`-behavior.ts'`);
    const hasLoadUSWDSModule = content.includes('loadUSWDSModule');
    const hasBehaviorDisabled = content.includes('@uswds-behavior-disabled');
    const hasPureLitImplementation = content.includes('Pure Lit Implementation');

    if (hasStandardInit || hasGlobalUSWDS || hasBehaviorFile || hasLoadUSWDSModule) {
      results.passed.push(`${componentName}: ✓ USWDS JavaScript integration`);
    } else if (hasBehaviorDisabled || hasPureLitImplementation) {
      results.passed.push(`${componentName}: ✓ Pure Lit implementation (USWDS behavior disabled)`);
    } else {
      results.failures.push(`${componentName}: Missing USWDS JavaScript integration`);
    }
  } else {
    results.passed.push(`${componentName}: ✓ Presentational component (no JS needed)`);
  }
}

// Validation: Architecture Patterns
async function validateArchitecture(componentName) {
  const componentDir = getComponentPath(componentName);
  if (!componentDir) return;
  const componentPath = path.join(componentDir, `usa-${componentName}.ts`);

  if (!fs.existsSync(componentPath)) {
    return;
  }

  const content = fs.readFileSync(componentPath, 'utf-8');

  // Check 1: Script Tag Pattern comment (only for components with firstUpdated)
  if (content.includes('firstUpdated')) {
    if (content.includes('ARCHITECTURE: Script Tag Pattern')) {
      results.passed.push(`${componentName}: ✓ Script Tag Pattern documented`);
    } else {
      results.warnings.push(`${componentName}: Missing Script Tag Pattern documentation`);
    }
  } else {
    // CSS-only component without firstUpdated - no Script Tag Pattern needed
    results.passed.push(`${componentName}: ✓ CSS-only component (no firstUpdated)`);
  }

  // Check 2: Extends USWDSBaseComponent or LitElement
  if (content.includes('extends USWDSBaseComponent') || content.includes('extends LitElement')) {
    results.passed.push(`${componentName}: ✓ Proper base class`);
  } else {
    results.failures.push(`${componentName}: Invalid base class`);
  }

  // Check 3: Has @customElement decorator
  if (content.includes(`@customElement('usa-${componentName}')`)) {
    results.passed.push(`${componentName}: ✓ Custom element registered`);
  } else {
    results.failures.push(`${componentName}: Missing @customElement decorator`);
  }
}

// Validation: Storybook Stories
async function validateStorybook(componentName) {
  const componentDir = getComponentPath(componentName);
  if (!componentDir) {
    results.failures.push(`${componentName}: Component directory not found`);
    return;
  }
  const storyPath = path.join(componentDir, `usa-${componentName}.stories.ts`);

  if (!fs.existsSync(storyPath)) {
    results.failures.push(`${componentName}: Missing Storybook story file`);
    return;
  }

  const content = fs.readFileSync(storyPath, 'utf-8');

  // Check 1: Has proper meta export
  if (content.includes('const meta: Meta<')) {
    results.passed.push(`${componentName}: ✓ Story meta configuration`);
  } else {
    results.failures.push(`${componentName}: Invalid story meta`);
  }

  // Check 2: Has Default story
  if (content.includes('export const Default:')) {
    results.passed.push(`${componentName}: ✓ Has Default story`);
  } else {
    results.failures.push(`${componentName}: Missing Default story`);
  }

  // Check 3: Has layout setting (padded, fullscreen, centered, etc.)
  if (content.includes("layout:")) {
    results.passed.push(`${componentName}: ✓ Has layout setting`);
  } else {
    results.warnings.push(`${componentName}: Consider adding layout parameter`);
  }
}

// Validation: Accessibility
async function validateAccessibility(componentName) {
  const componentDir = getComponentPath(componentName);
  if (!componentDir) return;
  const testPath = path.join(componentDir, `usa-${componentName}.test.ts`);

  if (!fs.existsSync(testPath)) {
    results.warnings.push(`${componentName}: No test file found`);
    return;
  }

  const content = fs.readFileSync(testPath, 'utf-8');

  // Check for accessibility test
  if (content.includes('testComponentAccessibility') || content.includes('checkAccessibility')) {
    results.passed.push(`${componentName}: ✓ Has accessibility tests`);
  } else {
    results.failures.push(`${componentName}: Missing accessibility tests`);
  }
}

// Main validation orchestration
async function validateComponent(componentName) {
  if (flags.all || flags.uswds) {
    await validateUSWDSCompliance(componentName);
  }

  if (flags.all || flags.structure) {
    await validateStructure(componentName);
  }

  if (flags.all || flags.javascript) {
    await validateJavaScriptIntegration(componentName);
  }

  if (flags.all || flags.architecture) {
    await validateArchitecture(componentName);
  }

  if (flags.all || flags.storybook) {
    await validateStorybook(componentName);
  }

  if (flags.all || flags.accessibility) {
    await validateAccessibility(componentName);
  }
}

// Generate report
function generateReport() {
  const totalChecks = results.passed.length + results.warnings.length + results.failures.length;
  const passRate = ((results.passed.length / totalChecks) * 100).toFixed(1);

  section('Compliance Validation Summary');

  log(`✅ Passed:   ${results.passed.length}`, 'green');
  log(`⚠️  Warnings: ${results.warnings.length}`, 'yellow');
  log(`❌ Failures: ${results.failures.length}`, 'red');

  if (results.fixed.length > 0) {
    log(`🔧 Fixed:    ${results.fixed.length}`, 'cyan');
  }

  log(`\n📊 Pass Rate: ${passRate}%`, passRate >= 90 ? 'green' : 'yellow');

  if (flags.verbose) {
    if (results.failures.length > 0) {
      console.log('\n❌ Failures:');
      results.failures.forEach(f => log(`  - ${f}`, 'red'));
    }

    if (results.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      results.warnings.forEach(w => log(`  - ${w}`, 'yellow'));
    }

    if (results.fixed.length > 0) {
      console.log('\n🔧 Auto-fixed:');
      results.fixed.forEach(f => log(`  - ${f}`, 'cyan'));
    }
  }

  // JSON report
  if (flags.report === 'json') {
    const reportPath = path.join(rootDir, 'reports/compliance-report.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    log(`\n📄 JSON report: ${reportPath}`, 'blue');
  }

  return results.failures.length === 0 && (!flags.strict || results.warnings.length === 0);
}

// Main execution
async function main() {
  log('🔍 USWDS Compliance Validation System', 'bright');
  log('=====================================\n', 'bright');

  try {
    let components = [];

    if (flags.component) {
      components = [flags.component];
    } else {
      components = getComponents();
    }

    // Default to all checks if none specified
    if (!flags.uswds && !flags.structure && !flags.javascript &&
        !flags.architecture && !flags.storybook && !flags.accessibility) {
      flags.all = true;
    }

    log(`📦 Validating ${components.length} component(s)...\n`, 'blue');

    for (const component of components) {
      await validateComponent(component);
    }

    const success = generateReport();

    process.exit(success ? 0 : 1);

  } catch (error) {
    log(`\n❌ Validation failed: ${error.message}`, 'red');
    if (flags.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
