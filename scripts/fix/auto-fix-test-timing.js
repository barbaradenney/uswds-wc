#!/usr/bin/env node

/**
 * Auto-Fix Test Timing Issues
 *
 * Automatically applies CI timing utilities to vulnerable test patterns.
 * Fixes 3 categories of timing issues:
 * 1. Property → DOM propagation (86 errors)
 * 2. ARIA attribute timing (420 warnings)
 * 3. Modal timing (58 errors)
 *
 * Usage:
 *   node scripts/fix/auto-fix-test-timing.js              # Dry run (preview changes)
 *   node scripts/fix/auto-fix-test-timing.js --apply      # Apply fixes
 *   node scripts/fix/auto-fix-test-timing.js --file=path  # Fix specific file
 */

import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

const DRY_RUN = !process.argv.includes('--apply');
const SPECIFIC_FILE = process.argv
  .find((arg) => arg.startsWith('--file='))
  ?.split('=')[1];

let fixedFiles = 0;
let totalFixes = 0;

/**
 * Fix 1: Property → DOM propagation issues
 * Pattern: element.property = value; await element.updateComplete; querySelector
 * Fix: Replace waitForUpdate with waitForPropertyPropagation
 */
function fixPropertyPropagation(content, filePath) {
  let fixed = content;
  let fileFixCount = 0;

  // Pattern: property assignment → waitForUpdate → querySelector
  // This regex finds: .property = value; (optional whitespace) await waitForUpdate(element); querySelector
  const propertyPropagationPattern =
    /(\.\w+\s*=\s*[^;]+;\s*(?:await\s+)?(?:waitForUpdate|element\.updateComplete)\([^)]*\);\s*)(const|let|var)?\s*(\w+)\s*=\s*(\w+)\.querySelector/g;

  const matches = [...fixed.matchAll(propertyPropagationPattern)];

  if (matches.length > 0) {
    // Check if file already has waitForPropertyPropagation import
    const hasImport = /waitForPropertyPropagation/.test(fixed);

    // Replace waitForUpdate with waitForPropertyPropagation in these contexts
    fixed = fixed.replace(propertyPropagationPattern, (match, before, varKeyword, varName, elementName) => {
      fileFixCount++;
      const vdecl = varKeyword ? `${varKeyword} ` : '';
      // Replace waitForUpdate/updateComplete with waitForPropertyPropagation
      const newBefore = before
        .replace(/await\s+waitForUpdate\([^)]+\)/,'await waitForPropertyPropagation(element)')
        .replace(/await\s+element\.updateComplete/, 'await waitForPropertyPropagation(element)');

      return `${newBefore}${vdecl}${varName} = ${elementName}.querySelector`;
    });

    // Add import if not present
    if (!hasImport && fileFixCount > 0) {
      // Find existing test-utils import
      const testUtilsImportMatch = fixed.match(
        /(import\s+{[^}]*})\s+from\s+['"]@uswds-wc\/test-utils['"]/
      );

      if (testUtilsImportMatch) {
        // Add to existing import
        const existingImport = testUtilsImportMatch[1];
        if (!existingImport.includes('waitForPropertyPropagation')) {
          const newImport = existingImport.replace(
            '}',
            ',\n  waitForPropertyPropagation\n}'
          );
          fixed = fixed.replace(testUtilsImportMatch[0], `${newImport} from '@uswds-wc/test-utils'`);
        }
      } else {
        // Add new import after other imports
        const lastImportMatch = fixed.match(/import[^;]+;(?=\n\n)/);
        if (lastImportMatch) {
          const insertion = `\nimport { waitForPropertyPropagation } from '@uswds-wc/test-utils';`;
          fixed = fixed.replace(
            lastImportMatch[0],
            lastImportMatch[0] + insertion
          );
        }
      }
    }
  }

  return { content: fixed, count: fileFixCount };
}

/**
 * Fix 2: ARIA attribute timing issues
 * Pattern: element.getAttribute('aria-*')
 * Fix: Use waitForARIAAttribute(element, 'aria-*')
 */
function fixARIAAttributes(content, filePath) {
  let fixed = content;
  let fileFixCount = 0;

  // Pattern: element.getAttribute('aria-something')
  const ariaPattern =
    /(\w+)\.getAttribute\(\s*['"]aria-([^'"]+)['"]\s*\)/g;

  const matches = [...fixed.matchAll(ariaPattern)];

  if (matches.length > 0) {
    const hasImport = /waitForARIAAttribute/.test(fixed);

    // Replace with waitForARIAAttribute
    fixed = fixed.replace(ariaPattern, (match, elementName, ariaName) => {
      fileFixCount++;
      return `await waitForARIAAttribute(${elementName}, 'aria-${ariaName}')`;
    });

    // Add import if not present
    if (!hasImport && fileFixCount > 0) {
      const testUtilsImportMatch = fixed.match(
        /(import\s+{[^}]*})\s+from\s+['"]@uswds-wc\/test-utils['"]/
      );

      if (testUtilsImportMatch) {
        const existingImport = testUtilsImportMatch[1];
        if (!existingImport.includes('waitForARIAAttribute')) {
          const newImport = existingImport.replace(
            '}',
            ',\n  waitForARIAAttribute\n}'
          );
          fixed = fixed.replace(testUtilsImportMatch[0], `${newImport} from '@uswds-wc/test-utils'`);
        }
      } else {
        const lastImportMatch = fixed.match(/import[^;]+;(?=\n\n)/);
        if (lastImportMatch) {
          const insertion = `\nimport { waitForARIAAttribute } from '@uswds-wc/test-utils';`;
          fixed = fixed.replace(
            lastImportMatch[0],
            lastImportMatch[0] + insertion
          );
        }
      }
    }
  }

  return { content: fixed, count: fileFixCount };
}

/**
 * Fix 3: Modal timing issues
 * Pattern: modal.open = true; await modal.updateComplete; querySelector
 * Fix: Use waitForModalOpen(modal)
 */
function fixModalTiming(content, filePath) {
  let fixed = content;
  let fileFixCount = 0;

  // Pattern: .open = true; await element.updateComplete; querySelector
  const modalPattern =
    /\.open\s*=\s*true;\s*await\s+(?:\w+\.updateComplete|waitForUpdate\([^)]+\));\s*(const|let|var)?\s*(\w+)\s*=\s*(\w+)\.querySelector/g;

  const matches = [...fixed.matchAll(modalPattern)];

  if (matches.length > 0) {
    const hasImport = /waitForModalOpen/.test(fixed);

    // Replace with waitForModalOpen
    fixed = fixed.replace(modalPattern, (match, varKeyword, varName, elementName) => {
      fileFixCount++;
      const vdecl = varKeyword ? `${varKeyword} ` : '';
      return `.open = true;\n    await waitForModalOpen(${elementName});\n    ${vdecl}${varName} = ${elementName}.querySelector`;
    });

    // Add import if not present
    if (!hasImport && fileFixCount > 0) {
      const testUtilsImportMatch = fixed.match(
        /(import\s+{[^}]*})\s+from\s+['"]@uswds-wc\/test-utils['"]/
      );

      if (testUtilsImportMatch) {
        const existingImport = testUtilsImportMatch[1];
        if (!existingImport.includes('waitForModalOpen')) {
          const newImport = existingImport.replace(
            '}',
            ',\n  waitForModalOpen\n}'
          );
          fixed = fixed.replace(testUtilsImportMatch[0], `${newImport} from '@uswds-wc/test-utils'`);
        }
      } else {
        const lastImportMatch = fixed.match(/import[^;]+;(?=\n\n)/);
        if (lastImportMatch) {
          const insertion = `\nimport { waitForModalOpen } from '@uswds-wc/test-utils';`;
          fixed = fixed.replace(
            lastImportMatch[0],
            lastImportMatch[0] + insertion
          );
        }
      }
    }
  }

  return { content: fixed, count: fileFixCount };
}

/**
 * Process a single test file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let fixed = content;
    let fileTotalFixes = 0;

    // Apply all fix functions
    const result1 = fixPropertyPropagation(fixed, filePath);
    fixed = result1.content;
    fileTotalFixes += result1.count;

    const result2 = fixARIAAttributes(fixed, filePath);
    fixed = result2.content;
    fileTotalFixes += result2.count;

    const result3 = fixModalTiming(fixed, filePath);
    fixed = result3.content;
    fileTotalFixes += result3.count;

    if (fileTotalFixes > 0) {
      const relativePath = path.relative(process.cwd(), filePath);

      if (DRY_RUN) {
        console.log(
          `  📝 ${relativePath}: ${fileTotalFixes} fix${fileTotalFixes > 1 ? 'es' : ''} (DRY RUN)`
        );
      } else {
        fs.writeFileSync(filePath, fixed, 'utf8');
        console.log(
          `  ✅ ${relativePath}: ${fileTotalFixes} fix${fileTotalFixes > 1 ? 'es' : ''} applied`
        );
      }

      fixedFiles++;
      totalFixes += fileTotalFixes;
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function main() {
  console.log('🔧 Auto-Fix Test Timing Issues\n');

  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No files will be modified');
    console.log('   Use --apply to apply fixes\n');
  } else {
    console.log('⚠️  APPLY MODE - Files will be modified\n');
  }

  // Get test files to process
  let testFiles;
  if (SPECIFIC_FILE) {
    testFiles = [SPECIFIC_FILE];
    console.log(`📁 Processing specific file: ${SPECIFIC_FILE}\n`);
  } else {
    testFiles = globSync('packages/**/src/**/*.test.ts', {
      ignore: ['**/node_modules/**', '**/dist/**'],
    });
    console.log(`📁 Found ${testFiles.length} test files\n`);
  }

  // Process each file
  testFiles.forEach(processFile);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log('='.repeat(60));
  console.log(`  Files modified: ${fixedFiles}`);
  console.log(`  Total fixes: ${totalFixes}`);

  if (DRY_RUN && totalFixes > 0) {
    console.log('\n💡 Run with --apply to apply these fixes');
  } else if (totalFixes === 0) {
    console.log('\n✨ No timing issues found - all tests are CI-safe!');
  } else {
    console.log('\n✅ All fixes applied successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Run: node scripts/validate/validate-test-timing.js');
    console.log('   2. Run: pnpm test');
    console.log('   3. Commit changes if tests pass');
  }
}

main();
