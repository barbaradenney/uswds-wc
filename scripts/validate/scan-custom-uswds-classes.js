#!/usr/bin/env node

/**
 * Scan All Components for Custom USWDS-Style Classes
 *
 * This script detects classes that look like USWDS classes (usa-*)
 * but may not actually exist in the official USWDS CSS.
 *
 * Focuses on BEM modifier patterns: usa-component__element--modifier
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');
const componentsDir = join(rootDir, 'src/components');

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Extract all USWDS classes from official SCSS files
 */
async function buildUSWDSClassRegistry() {
  log('\n📦 Building USWDS class registry from official source...', 'cyan');

  const scssFiles = await glob('node_modules/@uswds/uswds/**/*.scss', { cwd: rootDir });
  const officialClasses = new Set();

  for (const file of scssFiles) {
    try {
      const content = readFileSync(join(rootDir, file), 'utf8');

      // Match class definitions in SCSS
      // Patterns: .usa-*, [class*="usa-"], [class^="usa-"]
      const classMatches = content.matchAll(/\.usa-[\w-]+(?=\s|:|,|{|\[|\.|#)/g);

      for (const match of classMatches) {
        const className = match[0].slice(1); // Remove leading dot
        officialClasses.add(className);
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }

  log(`✅ Found ${officialClasses.size} official USWDS classes\n`, 'green');
  return officialClasses;
}

/**
 * Extract all usa-* classes from component code
 */
function extractUSWDSClasses(content) {
  const classes = new Set();

  // Pattern 1: class="usa-..." or class='usa-...'
  const classAttributePattern = /class=["']([^"']*usa-[^"']*)["']/g;
  const classMatches = content.matchAll(classAttributePattern);

  for (const match of classMatches) {
    // Split by whitespace and extract usa-* classes
    const classNames = match[1].split(/\s+/).filter(cls => cls.startsWith('usa-'));
    classNames.forEach(cls => classes.add(cls));
  }

  // Pattern 2: classList.add('usa-...')
  const classListPattern = /classList\.(?:add|remove|toggle)\(['"]usa-[\w-]+['"]\)/g;
  const classListMatches = content.matchAll(classListPattern);

  for (const match of classListMatches) {
    const classMatch = match[0].match(/['"]usa-[\w-]+['"]/);
    if (classMatch) {
      const className = classMatch[0].slice(1, -1); // Remove quotes
      classes.add(className);
    }
  }

  // Pattern 3: Template literal classes: ${...}usa-...${...}
  const templateLiteralPattern = /usa-[\w-]+/g;
  const templateMatches = content.matchAll(templateLiteralPattern);

  for (const match of templateMatches) {
    classes.add(match[0]);
  }

  return Array.from(classes).sort();
}

/**
 * Detect suspicious patterns that likely indicate custom classes
 */
function detectSuspiciousPatterns(className) {
  const issues = [];

  // Pattern 1: BEM modifier with double dash (usa-*__*--*)
  if (/usa-[\w-]+__[\w-]+--[\w-]+/.test(className)) {
    issues.push({
      type: 'BEM_MODIFIER',
      severity: 'high',
      description: 'BEM modifier pattern - verify in USWDS CSS'
    });
  }

  // Pattern 2: Double dash variant (usa-*--*)
  if (/usa-[\w-]+--[\w-]+/.test(className) && !className.includes('__')) {
    issues.push({
      type: 'COMPONENT_MODIFIER',
      severity: 'high',
      description: 'Component modifier pattern - verify in USWDS CSS'
    });
  }

  // Pattern 3: Unusual suffixes that might be custom
  const customSuffixes = ['-custom', '-new', '-modified', '-temp', '-v2', '-alt'];
  for (const suffix of customSuffixes) {
    if (className.endsWith(suffix)) {
      issues.push({
        type: 'CUSTOM_SUFFIX',
        severity: 'high',
        description: `Custom suffix '${suffix}' detected`
      });
    }
  }

  // Pattern 4: Numbers in unusual places (might indicate variations)
  if (/usa-[\w-]*\d+[\w-]*(?:__|\s|$)/.test(className) && !/usa-step-indicator/.test(className)) {
    issues.push({
      type: 'NUMERIC_VARIATION',
      severity: 'medium',
      description: 'Numeric variation - may be custom'
    });
  }

  return issues;
}

/**
 * Scan a single component
 */
function scanComponent(componentName, officialClasses) {
  const componentFile = join(componentsDir, componentName, `usa-${componentName}.ts`);

  if (!existsSync(componentFile)) {
    return null;
  }

  const content = readFileSync(componentFile, 'utf8');
  const usedClasses = extractUSWDSClasses(content);

  const results = {
    component: componentName,
    totalClasses: usedClasses.length,
    customClasses: [],
    suspiciousPatterns: [],
    officialClasses: [],
  };

  for (const className of usedClasses) {
    const isOfficial = officialClasses.has(className);
    const suspicious = detectSuspiciousPatterns(className);

    if (!isOfficial) {
      results.customClasses.push({
        className,
        suspicious,
      });
    } else {
      results.officialClasses.push(className);
    }

    if (suspicious.length > 0) {
      results.suspiciousPatterns.push({
        className,
        patterns: suspicious,
      });
    }
  }

  return results;
}

/**
 * Display scan results for a component
 */
function displayComponentResults(results) {
  const hasIssues = results.customClasses.length > 0 || results.suspiciousPatterns.length > 0;

  if (!hasIssues) {
    log(`  ✅ ${results.component} - All classes verified`, 'green');
    return;
  }

  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`📦 ${results.component}`, 'bold');
  log('='.repeat(60), 'cyan');

  log(`  Total USWDS classes used: ${results.totalClasses}`, 'blue');
  log(`  Official USWDS classes: ${results.officialClasses.length}`, 'green');
  log(`  Potentially custom classes: ${results.customClasses.length}`, results.customClasses.length > 0 ? 'red' : 'green');

  // Show custom classes
  if (results.customClasses.length > 0) {
    log('\n  ❌ Custom/Unknown USWDS-style classes:', 'red');

    for (const item of results.customClasses) {
      log(`     • ${item.className}`, 'red');

      if (item.suspicious.length > 0) {
        for (const pattern of item.suspicious) {
          const severityColor = pattern.severity === 'high' ? 'red' : 'yellow';
          log(`       └─ [${pattern.type}] ${pattern.description}`, severityColor);
        }
      }
    }
  }

  // Show suspicious patterns even for official classes
  const suspiciousOfficial = results.suspiciousPatterns.filter(s =>
    !results.customClasses.some(c => c.className === s.className)
  );

  if (suspiciousOfficial.length > 0) {
    log('\n  ⚠️  Suspicious patterns (in official classes):', 'yellow');

    for (const item of suspiciousOfficial) {
      log(`     • ${item.className}`, 'yellow');

      for (const pattern of item.patterns) {
        log(`       └─ [${pattern.type}] ${pattern.description}`, 'gray');
      }
    }
  }
}

/**
 * Display summary report
 */
function displaySummary(allResults) {
  const componentsWithIssues = allResults.filter(r =>
    r.customClasses.length > 0 || r.suspiciousPatterns.length > 0
  );

  const totalCustomClasses = allResults.reduce((sum, r) => sum + r.customClasses.length, 0);
  const totalSuspicious = allResults.reduce((sum, r) => sum + r.suspiciousPatterns.length, 0);

  log('\n' + '='.repeat(60), 'cyan');
  log('📊 SCAN SUMMARY', 'bold');
  log('='.repeat(60), 'cyan');

  log(`\n  Total components scanned: ${allResults.length}`, 'blue');
  log(`  Components with issues: ${componentsWithIssues.length}`, componentsWithIssues.length > 0 ? 'red' : 'green');
  log(`  Total custom classes found: ${totalCustomClasses}`, totalCustomClasses > 0 ? 'red' : 'green');
  log(`  Total suspicious patterns: ${totalSuspicious}`, totalSuspicious > 0 ? 'yellow' : 'green');

  if (componentsWithIssues.length > 0) {
    log('\n  ⚠️  Components requiring review:', 'yellow');
    for (const result of componentsWithIssues) {
      const customCount = result.customClasses.length;
      const suspiciousCount = result.suspiciousPatterns.length;
      log(`     • ${result.component}: ${customCount} custom, ${suspiciousCount} suspicious`, 'yellow');
    }
  }

  if (totalCustomClasses === 0) {
    log('\n  🎉 All components use only official USWDS classes!', 'green');
  } else {
    log('\n  ❌ Action required: Review and fix custom classes', 'red');
    log('     Verify each class exists in official USWDS CSS', 'gray');
    log('     Remove or replace classes that don\'t exist', 'gray');
  }

  log('\n' + '='.repeat(60), 'cyan');
}

/**
 * Generate detailed report file
 */
function generateReportFile(allResults, officialClasses) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalComponents: allResults.length,
      componentsWithIssues: allResults.filter(r => r.customClasses.length > 0).length,
      totalCustomClasses: allResults.reduce((sum, r) => sum + r.customClasses.length, 0),
      officialUSWDSClasses: officialClasses.size,
    },
    components: allResults.map(r => ({
      name: r.component,
      totalClasses: r.totalClasses,
      officialClasses: r.officialClasses.length,
      customClasses: r.customClasses.map(c => ({
        className: c.className,
        issues: c.suspicious,
      })),
      suspiciousPatterns: r.suspiciousPatterns,
    })),
  };

  const reportPath = join(rootDir, 'test-reports/custom-uswds-classes-scan.json');
  import('fs').then(({ writeFileSync }) => {
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    log(`\n📄 Detailed report saved to: test-reports/custom-uswds-classes-scan.json`, 'cyan');
  });

  return report;
}

/**
 * Main scan function
 */
async function scanAllComponents() {
  log('\n🔍 USWDS Custom Class Scanner', 'bold');
  log('='.repeat(60), 'cyan');
  log('Scanning all components for custom USWDS-style classes...\n', 'gray');

  // Build official USWDS class registry
  const officialClasses = await buildUSWDSClassRegistry();

  // Get all components
  const components = readdirSync(componentsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .sort();

  log(`📦 Scanning ${components.length} components...\n`, 'blue');

  // Scan each component
  const allResults = [];
  const cleanComponents = [];

  for (const componentName of components) {
    const results = scanComponent(componentName, officialClasses);

    if (results) {
      allResults.push(results);

      if (results.customClasses.length === 0 && results.suspiciousPatterns.length === 0) {
        cleanComponents.push(componentName);
      } else {
        displayComponentResults(results);
      }
    }
  }

  // Show clean components summary
  if (cleanComponents.length > 0) {
    log(`\n✅ Clean components (${cleanComponents.length}): ${cleanComponents.join(', ')}`, 'green');
  }

  // Display summary
  displaySummary(allResults);

  // Generate report file
  generateReportFile(allResults, officialClasses);

  // Exit code
  const hasIssues = allResults.some(r => r.customClasses.length > 0);
  process.exit(hasIssues ? 1 : 0);
}

// Run scan
scanAllComponents().catch(error => {
  console.error('Error scanning components:', error);
  process.exit(1);
});
