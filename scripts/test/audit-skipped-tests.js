#!/usr/bin/env node
/**
 * Audit Skipped Tests Script
 *
 * Scans all test files for skipped tests and generates a detailed report
 * with categorization and fix recommendations.
 *
 * @usage
 *   node scripts/test/audit-skipped-tests.js
 *   node scripts/test/audit-skipped-tests.js --json    # Output as JSON
 *   node scripts/test/audit-skipped-tests.js --verbose # Include test code snippets
 */

import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const rootDir = join(__filename, '..', '..', '..');

// Skip patterns to detect
const SKIP_PATTERNS = [
  /it\.skip\s*\(/,
  /test\.skip\s*\(/,
  /describe\.skip\s*\(/,
  /it\.skipIf\s*\(/,
];

// Categories for skipped tests based on common reasons
const CATEGORIES = {
  JSDOM_LIMITATION: {
    keywords: ['jsdom', 'browser environment', 'real browser', 'focus not supported'],
    description: 'Requires real browser - covered by Cypress/Playwright',
    recommendation: 'Keep skipped, ensure Cypress coverage exists',
  },
  USWDS_TIMING: {
    keywords: ['uswds', 'enhancement', 'transformation', 'duplicate input', 'combo-box', 'date-picker'],
    description: 'USWDS JavaScript enhancement timing issues',
    recommendation: 'Add longer wait times or move to browser tests',
  },
  CI_TIMING: {
    keywords: ['ci', 'slower', 'timing', 'waitfor', 'propagation'],
    description: 'Test timing issues specific to CI environment',
    recommendation: 'Increase timeouts or use vi.waitFor patterns',
  },
  REGRESSION: {
    keywords: ['regression', 'fixme', 'bug', 'issue'],
    description: 'Known regression or bug to be fixed',
    recommendation: 'Create issue and fix the underlying bug',
  },
  TODO: {
    keywords: ['todo', 'investigate', 'needs work'],
    description: 'Work in progress or needs investigation',
    recommendation: 'Investigate and implement fix',
  },
  UNKNOWN: {
    keywords: [],
    description: 'Unknown reason for skip',
    recommendation: 'Add comment explaining why test is skipped',
  },
};

/**
 * Find all test files in the packages directory
 */
function findTestFiles(dir, files = []) {
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip node_modules and dist directories
      if (item === 'node_modules' || item === 'dist') continue;
      findTestFiles(fullPath, files);
    } else if (item.endsWith('.test.ts') || item.endsWith('.spec.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Extract skipped tests from a file
 */
function extractSkippedTests(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const skippedTests = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    for (const pattern of SKIP_PATTERNS) {
      if (pattern.test(line)) {
        // Extract test name
        const nameMatch = line.match(/(?:it|test|describe)\.skip(?:If)?\s*\(\s*['"`]([^'"`]+)['"`]/);
        const testName = nameMatch ? nameMatch[1] : 'Unknown test';

        // Look for comments above the skip (up to 5 lines)
        const contextLines = [];
        for (let j = Math.max(0, i - 5); j < i; j++) {
          if (lines[j].includes('//') || lines[j].includes('*')) {
            contextLines.push(lines[j].trim());
          }
        }
        const context = contextLines.join(' ');

        // Categorize based on context
        let category = 'UNKNOWN';
        for (const [cat, config] of Object.entries(CATEGORIES)) {
          if (cat === 'UNKNOWN') continue;
          for (const keyword of config.keywords) {
            if (context.toLowerCase().includes(keyword) || testName.toLowerCase().includes(keyword)) {
              category = cat;
              break;
            }
          }
          if (category !== 'UNKNOWN') break;
        }

        skippedTests.push({
          testName,
          line: i + 1,
          category,
          context: context.substring(0, 200),
          isConditional: /skipIf/.test(line),
        });
        break;
      }
    }
  }

  return skippedTests;
}

/**
 * Get component name from file path
 */
function getComponentName(filePath) {
  const match = filePath.match(/components\/([^/]+)\//);
  return match ? match[1] : 'unknown';
}

/**
 * Get package name from file path
 */
function getPackageName(filePath) {
  const match = filePath.match(/packages\/([^/]+)\//);
  return match ? match[1] : 'unknown';
}

/**
 * Main audit function
 */
function auditSkippedTests() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes('--json');
  const verbose = args.includes('--verbose');

  const packagesDir = join(rootDir, 'packages');
  if (!existsSync(packagesDir)) {
    console.error('Error: packages directory not found');
    process.exit(1);
  }

  const testFiles = findTestFiles(packagesDir);
  const results = {
    totalFiles: testFiles.length,
    totalSkipped: 0,
    byCategory: {},
    byComponent: {},
    byPackage: {},
    tests: [],
  };

  // Initialize category counts
  for (const cat of Object.keys(CATEGORIES)) {
    results.byCategory[cat] = { count: 0, tests: [] };
  }

  // Process each test file
  for (const filePath of testFiles) {
    const skippedTests = extractSkippedTests(filePath);

    if (skippedTests.length === 0) continue;

    const relativePath = relative(rootDir, filePath);
    const component = getComponentName(filePath);
    const pkg = getPackageName(filePath);

    for (const test of skippedTests) {
      const entry = {
        file: relativePath,
        component,
        package: pkg,
        ...test,
      };

      results.tests.push(entry);
      results.totalSkipped++;

      // By category
      results.byCategory[test.category].count++;
      results.byCategory[test.category].tests.push(entry);

      // By component
      if (!results.byComponent[component]) {
        results.byComponent[component] = { count: 0, tests: [] };
      }
      results.byComponent[component].count++;
      results.byComponent[component].tests.push(entry);

      // By package
      if (!results.byPackage[pkg]) {
        results.byPackage[pkg] = { count: 0, tests: [] };
      }
      results.byPackage[pkg].count++;
      results.byPackage[pkg].tests.push(entry);
    }
  }

  // Output results
  if (jsonOutput) {
    console.log(JSON.stringify(results, null, 2));
    return results;
  }

  // Console output
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║           SKIPPED TESTS AUDIT REPORT                          ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log(`📊 Total test files scanned: ${results.totalFiles}`);
  console.log(`⏭️  Total skipped tests: ${results.totalSkipped}\n`);

  // By Category
  console.log('┌────────────────────────────────────────────────────────────────┐');
  console.log('│ BY CATEGORY                                                    │');
  console.log('└────────────────────────────────────────────────────────────────┘');

  for (const [cat, data] of Object.entries(results.byCategory)) {
    if (data.count === 0) continue;
    const config = CATEGORIES[cat];
    console.log(`\n  ${cat}: ${data.count}`);
    console.log(`    Description: ${config.description}`);
    console.log(`    Recommendation: ${config.recommendation}`);
  }

  // By Component
  console.log('\n┌────────────────────────────────────────────────────────────────┐');
  console.log('│ BY COMPONENT                                                   │');
  console.log('└────────────────────────────────────────────────────────────────┘\n');

  const sortedComponents = Object.entries(results.byComponent)
    .sort((a, b) => b[1].count - a[1].count);

  for (const [component, data] of sortedComponents) {
    console.log(`  ${component}: ${data.count} skipped`);
    if (verbose) {
      for (const test of data.tests) {
        console.log(`    └─ [${test.category}] ${test.testName} (line ${test.line})`);
      }
    }
  }

  // Summary recommendations
  console.log('\n┌────────────────────────────────────────────────────────────────┐');
  console.log('│ RECOMMENDATIONS                                                │');
  console.log('└────────────────────────────────────────────────────────────────┘\n');

  const fixableCount = results.byCategory.CI_TIMING?.count || 0;
  const browserCount = results.byCategory.JSDOM_LIMITATION?.count || 0;
  const uswdsCount = results.byCategory.USWDS_TIMING?.count || 0;

  console.log(`  🔧 Fixable (CI timing): ${fixableCount} - Can be fixed with better wait patterns`);
  console.log(`  🌐 Browser tests needed: ${browserCount} - Ensure Cypress/Playwright coverage`);
  console.log(`  ⏱️  USWDS timing: ${uswdsCount} - May need behavior file or async handling`);
  console.log(`  ❓ Unknown: ${results.byCategory.UNKNOWN?.count || 0} - Need documentation`);

  // Write report to file
  const reportPath = join(rootDir, 'reports', 'skipped-tests-audit.json');
  try {
    const reportsDir = join(rootDir, 'reports');
    if (!existsSync(reportsDir)) {
      // Create reports directory if needed (handled by fs)
    }
    writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n📄 Report saved to: ${relative(rootDir, reportPath)}`);
  } catch {
    // Ignore write errors - reports directory may not exist
  }

  return results;
}

// Run if called directly
auditSkippedTests();

export { auditSkippedTests };
