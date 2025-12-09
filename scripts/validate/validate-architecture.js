#!/usr/bin/env node

/**
 * Architecture Validation Script
 *
 * Validates that components follow proper USWDS transformation patterns
 * and don't pre-build USWDS internal structure.
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Patterns that indicate violations of USWDS architecture
const FORBIDDEN_PATTERNS = [
  {
    pattern: /class.*=.*usa-combo-box__input|class.*=.*usa-combo-box__toggle-list|class.*=.*usa-combo-box__list/,
    message: 'Pre-building combo-box internal structure in render template',
    severity: 'error'
  },
  {
    pattern: /usa-modal__overlay.*=.*html/,
    message: 'Pre-building modal overlay structure when not required',
    severity: 'error'
  },
  {
    pattern: /usa-date-picker__calendar/,
    message: 'Pre-building date picker calendar structure',
    severity: 'error'
  },
  {
    pattern: /handleDropdownToggle|handleKeyNavigation|handleCustomClick/,
    message: 'Custom event handlers for USWDS-managed interactions',
    severity: 'warning'
  },
  {
    pattern: /setAttribute.*aria-expanded.*true/,
    message: 'Manual ARIA management that USWDS should handle',
    severity: 'warning'
  },
  {
    pattern: /event\.preventDefault\(\).*click|click.*event\.preventDefault\(\)/,
    message: 'Preventing default click behavior that USWDS manages',
    severity: 'warning'
  }
];

// Required patterns for interactive components
const REQUIRED_PATTERNS = {
  'combo-box': {
    pattern: /comboBoxModule.*\.on\(/,
    message: 'Missing comboBoxModule.on() integration'
  },
  'date-picker': {
    pattern: /datePickerModule.*\.on\(/,
    message: 'Missing datePickerModule.on() integration'
  },
  'modal': {
    pattern: /modalModule.*\.on\(|uswdsModule.*\.on\(/,
    message: 'Missing modalModule.on() integration'
  },
  'time-picker': {
    pattern: /timePickerModule.*\.on\(|uswdsModule.*\.on\(/,
    message: 'Missing timePickerModule.on() integration'
  },
  'file-input': {
    pattern: /fileInputModule.*\.on\(/,
    message: 'Missing fileInputModule.on() integration'
  },
  'in-page-navigation': {
    pattern: /inPageNavModule.*\.on\(/,
    message: 'Missing inPageNavModule.on() integration'
  },
  'banner': {
    pattern: /setupBannerToggle|bannerModule.*\.on\(/,
    message: 'Missing setupBannerToggle() or bannerModule.on() integration'
  }
};

// Components that are purely presentational (no USWDS JavaScript required)
const PRESENTATIONAL_COMPONENTS = [
  'card', 'alert', 'breadcrumb', 'button', 'collection',
  'footer', 'header', 'icon', 'identifier', 'link', 'list', 'prose',
  'section', 'summary-box', 'tag'
];

function validateComponent(componentPath, componentName) {
  const source = fs.readFileSync(componentPath, 'utf8');
  const violations = [];
  const warnings = [];

  // Skip validation for test files and Cypress files
  if (componentPath.includes('.test.') ||
      componentPath.includes('.spec.') ||
      componentPath.includes('.cy.') ||
      componentPath.includes('.component.cy.') ||
      componentPath.includes('.behavioral.cy.')) {
    return { violations: [], warnings: [] };
  }

  // Check for forbidden patterns
  FORBIDDEN_PATTERNS.forEach(({ pattern, message, severity }) => {
    if (pattern.test(source)) {
      const violation = {
        file: componentPath,
        message,
        line: findLineNumber(source, pattern),
        severity
      };

      if (severity === 'error') {
        violations.push(violation);
      } else {
        warnings.push(violation);
      }
    }
  });

  // Check for required USWDS integration (skip presentational components)
  if (!PRESENTATIONAL_COMPONENTS.includes(componentName)) {
    const requiredPattern = REQUIRED_PATTERNS[componentName];
    if (requiredPattern && !requiredPattern.pattern.test(source)) {
      violations.push({
        file: componentPath,
        message: requiredPattern.message,
        line: 1,
        severity: 'error'
      });
    }
  }

  // Check render method complexity
  const renderMatch = source.match(/render\(\)[\s\S]*?(?=\n  [a-zA-Z]|\n})/);
  if (renderMatch) {
    const renderLines = renderMatch[0].split('\n').length;
    if (renderLines > 50) {
      warnings.push({
        file: componentPath,
        message: `Render method too complex (${renderLines} lines). Consider simplifying.`,
        line: findLineNumber(source, /render\(\)/),
        severity: 'warning'
      });
    }
  }

  return { violations, warnings };
}

function findLineNumber(source, pattern) {
  const lines = source.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (pattern.test(lines[i])) {
      return i + 1;
    }
  }
  return 1;
}

function validateAllComponents() {
  console.log('🔍 Validating USWDS architecture compliance...\n');

  const componentFiles = glob.sync('packages/*/src/components/*/usa-*.ts', {
    ignore: ['**/*.test.ts', '**/*.spec.ts']
  });

  let totalViolations = 0;
  let totalWarnings = 0;

  componentFiles.forEach(filePath => {
    const componentName = path.basename(filePath)
      .replace('usa-', '')
      .replace('.ts', '');

    const { violations, warnings } = validateComponent(filePath, componentName);

    if (violations.length > 0) {
      console.log(`❌ ${filePath}:`);
      violations.forEach(v => {
        console.log(`   Line ${v.line}: ${v.message}`);
      });
      console.log();
      totalViolations += violations.length;
    }

    if (warnings.length > 0) {
      console.log(`⚠️  ${filePath}:`);
      warnings.forEach(w => {
        console.log(`   Line ${w.line}: ${w.message}`);
      });
      console.log();
      totalWarnings += warnings.length;
    }
  });

  // Summary
  console.log(`\n📊 Validation Summary:`);
  console.log(`   Components checked: ${componentFiles.length}`);
  console.log(`   Critical violations: ${totalViolations}`);
  console.log(`   Warnings: ${totalWarnings}`);

  if (totalViolations > 0) {
    console.log(`\n❌ Architecture validation FAILED`);
    console.log(`📖 See docs/USWDS_TRANSFORMATION_PATTERNS.md for guidance`);
    process.exit(1);
  }

  if (totalWarnings > 0) {
    console.log(`\n⚠️  Architecture validation passed with warnings`);
    console.log(`📖 Consider reviewing warnings for best practices`);
  } else {
    console.log(`\n✅ Architecture validation PASSED`);
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  validateAllComponents();
}

export { validateComponent, validateAllComponents };