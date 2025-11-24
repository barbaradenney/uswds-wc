#!/usr/bin/env node

/**
 * Test Timing Validation Script
 *
 * Detects vulnerable test patterns that commonly fail in CI due to timing issues.
 * This script proactively identifies tests that need timing guards before they fail in CI.
 *
 * Vulnerable Patterns:
 * 1. ARIA Attribute Timing - getAttribute('aria-*') without waitForARIAAttribute
 * 2. Property → DOM Propagation - Set property, immediately check DOM without waitForPropertyPropagation
 * 3. Modal Rendering - modal.open = true without waitForModalOpen
 * 4. Component-specific timing - accordion, combo-box, date-picker without specific wait functions
 */

import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

const issues = [];
let fileCount = 0;

// Vulnerable patterns that commonly fail in CI
const VULNERABLE_PATTERNS = [
  {
    name: 'ARIA Attribute Without Wait',
    pattern: /getAttribute\(['"]aria-[^'"]+['"]\)/g,
    safePattern: /waitForARIAAttribute/,
    message:
      'Direct ARIA attribute access may fail in CI. Use waitForARIAAttribute() instead.',
    severity: 'warning',
    example: `
// ❌ Bad - May fail in CI
const ariaSort = header.getAttribute('aria-sort');

// ✅ Good - CI-safe
const ariaSort = await waitForARIAAttribute(header, 'aria-sort');
`,
  },

  {
    name: 'Property → DOM Without Propagation Wait',
    pattern:
      /(\.(?:required|disabled|readonly|checked|value)\s*=\s*[^;]+;\s*(?:await\s+waitForUpdate\([^)]+\);\s*)?(?:const|let|var)?\s*\w+\s*=\s*\w+\.querySelector)/g,
    safePattern: /waitForPropertyPropagation/,
    message:
      'Property changes may not propagate to DOM immediately. Use waitForPropertyPropagation() after setting properties.',
    severity: 'error',
    example: `
// ❌ Bad - May fail in CI
element.required = true;
await waitForUpdate(element);
const input = element.querySelector('input');

// ✅ Good - CI-safe
element.required = true;
await waitForPropertyPropagation(element);
const input = element.querySelector('input');
`,
  },

  {
    name: 'Modal Open Without Wait',
    pattern: /\.open\s*=\s*true[^}]*querySelector\(/g,
    safePattern: /waitForModalOpen/,
    message:
      'Modal content may not be rendered immediately after setting .open = true. Use waitForModalOpen().',
    severity: 'error',
    example: `
// ❌ Bad - May fail in CI
modal.open = true;
await waitForUpdate(modal);
const title = modal.querySelector('.usa-modal__heading');

// ✅ Good - CI-safe
modal.open = true;
await waitForModalOpen(modal);
const title = modal.querySelector('.usa-modal__heading');
`,
  },

  {
    name: 'Accordion Without Transition Wait',
    pattern: /usa-accordion.*click\(\)[^}]*expect/gi,
    safePattern: /waitForAccordionTransition/,
    message:
      'Accordion transitions need time to complete. Use waitForAccordionTransition() after click.',
    severity: 'warning',
    example: `
// ❌ Bad - May fail in CI
button.click();
await waitForUpdate(accordion);
expect(button.getAttribute('aria-expanded')).toBe('true');

// ✅ Good - CI-safe
button.click();
await waitForAccordionTransition(accordion);
expect(button.getAttribute('aria-expanded')).toBe('true');
`,
  },

  {
    name: 'Combo-box Without Init Wait',
    pattern: /usa-combo-box[^}]*(?:querySelector|options)/gi,
    safePattern: /waitForComboBoxInit/,
    message:
      'Combo-box has complex USWDS initialization. Use waitForComboBoxInit() before interacting.',
    severity: 'warning',
    example: `
// ❌ Bad - May fail in CI
const comboBox = document.createElement('usa-combo-box');
document.body.appendChild(comboBox);
await waitForUpdate(comboBox);
const list = comboBox.querySelector('ul');

// ✅ Good - CI-safe
const comboBox = document.createElement('usa-combo-box');
document.body.appendChild(comboBox);
await waitForComboBoxInit(comboBox);
const list = comboBox.querySelector('ul');
`,
  },

  {
    name: 'Date Picker Without Init Wait',
    pattern: /usa-date-picker[^}]*(?:querySelector|calendar)/gi,
    safePattern: /waitForDatePickerInit/,
    message:
      'Date picker has complex initialization. Use waitForDatePickerInit() before interacting.',
    severity: 'warning',
    example: `
// ❌ Bad - May fail in CI
const datePicker = document.createElement('usa-date-picker');
document.body.appendChild(datePicker);
await waitForUpdate(datePicker);
const calendar = datePicker.querySelector('.usa-date-picker__calendar');

// ✅ Good - CI-safe
const datePicker = document.createElement('usa-date-picker');
document.body.appendChild(datePicker);
await waitForDatePickerInit(datePicker);
const calendar = datePicker.querySelector('.usa-date-picker__calendar');
`,
  },
];

function checkFileForVulnerablePatterns(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);

    // Check if file imports ci-timing-utils (indicates awareness of timing issues)
    const hasCITimingImport = /from ['"]@uswds-wc\/test-utils.*ci-timing/.test(
      content
    );

    VULNERABLE_PATTERNS.forEach(
      ({ name, pattern, safePattern, message, severity, example }) => {
        const matches = [...content.matchAll(pattern)];

        matches.forEach((match) => {
          // Check if the safe pattern is used in the same test block
          const testBlockStart = content.lastIndexOf("it('", match.index);
          const testBlockEnd = content.indexOf('});', match.index);

          if (testBlockStart !== -1 && testBlockEnd !== -1) {
            const testBlock = content.substring(testBlockStart, testBlockEnd);
            const hasSafePattern = safePattern.test(testBlock);

            if (!hasSafePattern) {
              const lines = content.substring(0, match.index).split('\n');
              const lineNumber = lines.length;
              const columnNumber =
                match.index - lines.slice(0, -1).join('\n').length - 1;

              issues.push({
                file: relativePath,
                line: lineNumber,
                column: columnNumber,
                name,
                message,
                severity,
                code: match[0],
                example,
                hasCITimingImport,
              });
            }
          }
        });
      }
    );

    fileCount++;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
  }
}

function main() {
  console.log('🔍 Validating test timing patterns...\n');

  // Find all test files
  const testFiles = globSync('packages/**/src/**/*.test.ts', {
    ignore: ['**/node_modules/**', '**/dist/**'],
  });

  testFiles.forEach(checkFileForVulnerablePatterns);

  console.log(`📊 Validated ${fileCount} test files\n`);

  if (issues.length === 0) {
    console.log('✅ No vulnerable test timing patterns found\n');
    process.exit(0);
  }

  // Group issues by severity
  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');

  // Group issues by file
  const issuesByFile = issues.reduce((acc, issue) => {
    if (!acc[issue.file]) {
      acc[issue.file] = [];
    }
    acc[issue.file].push(issue);
    return acc;
  }, {});

  if (errors.length > 0) {
    console.log('❌ Critical timing issues found:\n');
    Object.entries(issuesByFile)
      .filter(([, fileIssues]) =>
        fileIssues.some((i) => i.severity === 'error')
      )
      .forEach(([file, fileIssues]) => {
        console.log(`  ${file}`);
        fileIssues
          .filter((i) => i.severity === 'error')
          .forEach((issue) => {
            console.log(`    Line ${issue.line}: ${issue.name}`);
            console.log(`    ${issue.message}`);
            console.log(`    Code: ${issue.code.substring(0, 60)}...`);
            console.log(`${issue.example}`);
          });
        console.log();
      });
  }

  if (warnings.length > 0) {
    console.log('⚠️  Potential timing issues:\n');
    Object.entries(issuesByFile)
      .filter(([, fileIssues]) =>
        fileIssues.some((i) => i.severity === 'warning')
      )
      .forEach(([file, fileIssues]) => {
        console.log(`  ${file}`);
        fileIssues
          .filter((i) => i.severity === 'warning')
          .forEach((issue) => {
            console.log(`    Line ${issue.line}: ${issue.name}`);
            console.log(`    ${issue.message}`);
          });
        console.log();
      });
  }

  console.log(
    `\n📊 Summary: ${errors.length} errors, ${warnings.length} warnings\n`
  );

  // Check if any files are missing CI timing imports
  const filesWithoutImport = issues.filter((i) => !i.hasCITimingImport);
  if (filesWithoutImport.length > 0) {
    const uniqueFiles = [...new Set(filesWithoutImport.map((i) => i.file))];
    console.log('💡 Files missing CI timing utilities import:\n');
    uniqueFiles.forEach((file) => {
      console.log(`  ${file}`);
    });
    console.log(
      '\n  Add: import { waitForARIAAttribute, waitForPropertyPropagation, ... } from \'@uswds-wc/test-utils\';\n'
    );
  }

  console.log('💡 Common fixes:\n');
  console.log(
    '  • Use waitForARIAAttribute() instead of direct getAttribute()'
  );
  console.log(
    '  • Use waitForPropertyPropagation() after setting element properties'
  );
  console.log('  • Use waitForModalOpen() after modal.open = true');
  console.log('  • Use component-specific wait functions for complex components');
  console.log(
    '\n  See: packages/uswds-wc-test-utils/src/ci-timing-utils.js for all utilities\n'
  );

  if (errors.length > 0) {
    process.exit(1);
  }

  process.exit(0);
}

main();
