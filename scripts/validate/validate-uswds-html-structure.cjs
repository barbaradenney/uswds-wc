#!/usr/bin/env node

/**
 * Validate USWDS HTML Structure
 *
 * Validates that our web components render HTML that matches
 * the official USWDS pattern documentation structure.
 *
 * This validates:
 * 1. Form components have compact mode
 * 2. Select elements render with usa-select class (v2.5.3+, no combo-box wrapper)
 * 3. Width modifiers are correctly applied
 * 4. No form-group wrappers in patterns
 * 5. Required indicators are inline in labels
 */

const fs = require('fs');
const path = require('path');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

let hasErrors = false;
let hasWarnings = false;

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  hasErrors = true;
  log(`❌ ${message}`, 'red');
}

function warning(message) {
  hasWarnings = true;
  log(`⚠️  ${message}`, 'yellow');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

/**
 * Check if form components have compact mode
 */
function validateCompactMode() {
  log('\n📋 Validating Compact Mode Implementation\n', 'cyan');

  const formComponents = [
    'packages/uswds-wc-forms/src/components/text-input/usa-text-input.ts',
    'packages/uswds-wc-forms/src/components/select/usa-select.ts',
    'packages/uswds-wc-forms/src/components/textarea/usa-textarea.ts',
  ];

  formComponents.forEach((componentPath) => {
    const fullPath = path.join(process.cwd(), componentPath);
    const content = fs.readFileSync(fullPath, 'utf8');

    const componentName = path.basename(componentPath, '.ts');

    // Check for compact property
    const hasCompactProp = /@property\(\{ type: Boolean \}\)\s+compact\s*=\s*false/.test(content);
    if (!hasCompactProp) {
      error(`${componentName}: Missing compact property`);
      info(`  Add: @property({ type: Boolean }) compact = false;`);
    } else {
      success(`${componentName}: Has compact property`);
    }

    // Check for conditional form-group rendering
    const hasConditionalRender = /if \(this\.compact\)/.test(content);
    if (!hasConditionalRender) {
      error(`${componentName}: Missing conditional form-group rendering`);
      info(`  Add: if (this.compact) { return inputTemplate; }`);
    } else {
      success(`${componentName}: Has conditional rendering`);
    }
  });
}

/**
 * Check if select component renders correctly
 * Note: As of v2.5.3, usa-select no longer uses combo-box wrapper.
 * The select element is rendered directly with usa-select class.
 */
function validateSelectRendering() {
  log('\n📋 Validating Select Rendering (v2.5.3+)\n', 'cyan');

  const selectPath = 'packages/uswds-wc-forms/src/components/select/usa-select.ts';
  const fullPath = path.join(process.cwd(), selectPath);
  const content = fs.readFileSync(fullPath, 'utf8');

  // Check for usa-select class on select element
  const hasUSASelect = /class="usa-select"/.test(content) || /class="\${.*usa-select/.test(content);
  if (!hasUSASelect) {
    error('usa-select: Missing usa-select class on select element');
    info('  Add: <select class="usa-select">...</select>');
  } else {
    success('usa-select: Has usa-select class');
  }

  // Ensure combo-box wrapper is NOT used (v2.5.3 simplification)
  const hasComboBox = /<div class="usa-combo-box">/.test(content);
  if (hasComboBox) {
    warning('usa-select: Contains combo-box wrapper (deprecated in v2.5.3)');
    info('  usa-select should render directly without combo-box wrapper');
  } else {
    success('usa-select: No combo-box wrapper (correct for v2.5.3+)');
  }
}

/**
 * Check if patterns use compact mode
 */
function validatePatternsUseCompact() {
  log('\n📋 Validating Patterns Use Compact Mode\n', 'cyan');

  const patterns = [
    'packages/uswds-wc-patterns/src/patterns/address/usa-address-pattern.ts',
    'packages/uswds-wc-patterns/src/patterns/phone-number/usa-phone-number-pattern.ts',
    'packages/uswds-wc-patterns/src/patterns/name/usa-name-pattern.ts',
    'packages/uswds-wc-patterns/src/patterns/contact-preferences/usa-contact-preferences-pattern.ts',
  ];

  patterns.forEach((patternPath) => {
    const fullPath = path.join(process.cwd(), patternPath);
    const content = fs.readFileSync(fullPath, 'utf8');

    const patternName = path.basename(path.dirname(patternPath));

    // Check for usa-text-input with compact
    const textInputMatches = content.match(/<usa-text-input[^>]*>/g) || [];
    const textInputsWithCompact = textInputMatches.filter((match) =>
      /compact/.test(match)
    ).length;
    const totalTextInputs = textInputMatches.length;

    if (totalTextInputs > 0 && textInputsWithCompact !== totalTextInputs) {
      error(
        `${patternName}: ${totalTextInputs - textInputsWithCompact}/${totalTextInputs} usa-text-input missing compact`
      );
    } else if (totalTextInputs > 0) {
      success(`${patternName}: All ${totalTextInputs} usa-text-input have compact`);
    }

    // Check for usa-select with compact
    const selectMatches = content.match(/<usa-select[^>]*>/g) || [];
    const selectsWithCompact = selectMatches.filter((match) => /compact/.test(match)).length;
    const totalSelects = selectMatches.length;

    if (totalSelects > 0 && selectsWithCompact !== totalSelects) {
      error(
        `${patternName}: ${totalSelects - selectsWithCompact}/${totalSelects} usa-select missing compact`
      );
    } else if (totalSelects > 0) {
      success(`${patternName}: All ${totalSelects} usa-select have compact`);
    }

    // Check for usa-textarea with compact
    const textareaMatches = content.match(/<usa-textarea[^>]*>/g) || [];
    const textareasWithCompact = textareaMatches.filter((match) => /compact/.test(match)).length;
    const totalTextareas = textareaMatches.length;

    if (totalTextareas > 0 && textareasWithCompact !== totalTextareas) {
      error(
        `${patternName}: ${totalTextareas - textareasWithCompact}/${totalTextareas} usa-textarea missing compact`
      );
    } else if (totalTextareas > 0) {
      success(`${patternName}: All ${totalTextareas} usa-textarea have compact`);
    }
  });
}

/**
 * Check for width modifiers on appropriate fields
 */
function validateWidthModifiers() {
  log('\n📋 Validating Width Modifiers\n', 'cyan');

  const addressPattern = 'packages/uswds-wc-patterns/src/patterns/address/usa-address-pattern.ts';
  const fullPath = path.join(process.cwd(), addressPattern);
  const content = fs.readFileSync(fullPath, 'utf8');

  // Check ZIP field has width="medium"
  const zipMatches = content.match(/<usa-text-input[^>]*name="zipCode"[^>]*>/g);
  if (zipMatches) {
    const hasWidthMedium = zipMatches.some((match) => /width="medium"/.test(match));
    if (!hasWidthMedium) {
      error('address pattern: ZIP code missing width="medium"');
      info('  ZIP should render with usa-input--medium class');
    } else {
      success('address pattern: ZIP code has width="medium"');
    }
  }
}

/**
 * Check that patterns don't have form-group wrappers in template
 */
function validateNoFormGroups() {
  log('\n📋 Validating No Form-Group Wrappers in Patterns\n', 'cyan');

  const patterns = [
    'packages/uswds-wc-patterns/src/patterns/address/usa-address-pattern.ts',
    'packages/uswds-wc-patterns/src/patterns/phone-number/usa-phone-number-pattern.ts',
    'packages/uswds-wc-patterns/src/patterns/name/usa-name-pattern.ts',
    'packages/uswds-wc-patterns/src/patterns/contact-preferences/usa-contact-preferences-pattern.ts',
  ];

  patterns.forEach((patternPath) => {
    const fullPath = path.join(process.cwd(), patternPath);
    const content = fs.readFileSync(fullPath, 'utf8');

    const patternName = path.basename(path.dirname(patternPath));

    // Check for form-group class in render template
    const renderMethod = content.match(/override render\(\)[^{]*{([\s\S]*?)^\s*}/m);
    if (renderMethod) {
      const renderBody = renderMethod[1];
      const hasFormGroup = /usa-form-group/.test(renderBody);
      if (hasFormGroup) {
        error(`${patternName}: Found usa-form-group in render template`);
        info('  Patterns should use compact mode, not form-group wrappers');
      } else {
        success(`${patternName}: No form-group wrappers in template`);
      }
    }
  });
}

/**
 * Check documentation exists
 */
function validateDocumentation() {
  log('\n📋 Validating Documentation\n', 'cyan');

  const docPath = 'docs/patterns/USWDS-HTML-STRUCTURE-ALIGNMENT.md';
  const fullPath = path.join(process.cwd(), docPath);

  if (!fs.existsSync(fullPath)) {
    warning('Missing USWDS HTML structure alignment documentation');
    info(`  Create: ${docPath}`);
  } else {
    success('USWDS HTML structure alignment documentation exists');
  }
}

/**
 * Main validation
 */
function main() {
  log('\n🔍 USWDS HTML Structure Validation\n', 'magenta');
  log('='.repeat(80));

  validateCompactMode();
  validateSelectRendering();
  validatePatternsUseCompact();
  validateWidthModifiers();
  validateNoFormGroups();
  validateDocumentation();

  log('\n' + '='.repeat(80));

  if (hasErrors) {
    log('\n❌ Validation failed with errors', 'red');
    log('\nSee docs/patterns/USWDS-HTML-STRUCTURE-ALIGNMENT.md for requirements\n', 'cyan');
    process.exit(1);
  } else if (hasWarnings) {
    log('\n⚠️  Validation passed with warnings', 'yellow');
    process.exit(0);
  } else {
    log('\n✅ All USWDS HTML structure validations passed!', 'green');
    process.exit(0);
  }
}

main();
