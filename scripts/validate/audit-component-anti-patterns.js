#!/usr/bin/env node
/**
 * Component Anti-Pattern Detection Script
 *
 * Detects common Lit/Web Component anti-patterns that cause bugs:
 * 1. Direct array/object mutation (causes missed updates)
 * 2. Missing cleanup in disconnectedCallback (causes memory leaks)
 * 3. Setting reactive props in updated() (causes infinite loops)
 * 4. Sync child access in connectedCallback (children not ready)
 *
 * @usage
 *   node scripts/validate/audit-component-anti-patterns.js
 *   node scripts/validate/audit-component-anti-patterns.js --fix    # Show fix suggestions
 *   node scripts/validate/audit-component-anti-patterns.js --json   # Output as JSON
 */

import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const rootDir = join(__filename, '..', '..', '..');

// Anti-patterns to detect
const ANTI_PATTERNS = {
  ARRAY_MUTATION: {
    name: 'Direct Array Mutation',
    severity: 'warning', // Downgraded to warning - context matters
    description: 'Mutating arrays directly may prevent Lit from detecting changes (check if array is @property)',
    patterns: [
      /this\.items\.push\s*\(/,      // Most common reactive array name
      /this\.options\.push\s*\(/,    // Another common one
      /this\.navItems\.push\s*\(/,
      /this\.sections\.push\s*\(/,
    ],
    fix: 'Use immutable pattern: this.items = [...this.items, newItem]',
  },
  OBJECT_MUTATION: {
    name: 'Direct Object Mutation',
    severity: 'warning',
    description: 'Mutating objects directly may prevent Lit from detecting changes',
    patterns: [
      /this\.\w+\[\s*['"`]\w+['"`]\s*\]\s*=/,  // this.obj['key'] =
    ],
    fix: 'Use immutable pattern: this.obj = { ...this.obj, key: value }',
  },
  MISSING_CLEANUP: {
    name: 'Missing Event Listener Cleanup',
    severity: 'error',
    description: 'Event listeners added in connectedCallback must be removed in disconnectedCallback',
    patterns: [
      // Custom check - detected by cross-referencing addEventListener with removeEventListener
    ],
    customCheck: true,
    fix: 'Store bound handler and remove in disconnectedCallback: this.removeEventListener(type, this._boundHandler)',
  },
  REACTIVE_PROP_IN_UPDATED: {
    name: 'Reactive Property Set in updated()',
    severity: 'warning',
    description: 'Setting reactive properties in updated() can cause infinite update loops',
    patterns: [
      // Check for this.propName = inside updated()
    ],
    customCheck: true,
    fix: 'Move reactive property updates to willUpdate() instead',
  },
  SYNC_CHILD_ACCESS: {
    name: 'Synchronous Child Access in connectedCallback',
    severity: 'warning',
    description: 'Children may not be ready in connectedCallback, use firstUpdated or updateComplete',
    patterns: [
      /connectedCallback[\s\S]{0,200}this\.querySelector/,
      /connectedCallback[\s\S]{0,200}this\.querySelectorAll/,
      /connectedCallback[\s\S]{0,200}this\.children/,
      /connectedCallback[\s\S]{0,200}this\.firstChild/,
      /connectedCallback[\s\S]{0,200}this\.lastChild/,
    ],
    fix: 'Move to firstUpdated() or use await this.updateComplete first',
  },
  SETINTERVAL_NO_CLEANUP: {
    name: 'setInterval Without Cleanup',
    severity: 'error',
    description: 'setInterval must be cleared in disconnectedCallback to prevent memory leaks',
    patterns: [
      /setInterval\s*\(/,
    ],
    customCheck: true, // Need to verify clearInterval exists
    fix: 'Store interval ID and call clearInterval in disconnectedCallback',
  },
  SETTIMEOUT_NO_CLEANUP: {
    name: 'setTimeout Without Cleanup',
    severity: 'warning',
    description: 'Long timeouts should be cleared in disconnectedCallback if component can be removed',
    patterns: [
      /setTimeout\s*\([^)]+,\s*[5-9]\d{3,}\s*\)/,  // timeouts > 5000ms
    ],
    fix: 'Store timeout ID and call clearTimeout in disconnectedCallback',
  },
  WINDOW_LISTENER_NO_CLEANUP: {
    name: 'Window/Document Listener Without Cleanup',
    severity: 'error',
    description: 'Global event listeners must be removed in disconnectedCallback',
    patterns: [
      /window\.addEventListener/,
      /document\.addEventListener/,
    ],
    customCheck: true,
    fix: 'Remove window/document listeners in disconnectedCallback',
  },
};

/**
 * Find all component files
 */
function findComponentFiles(dir, files = []) {
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      if (item === 'node_modules' || item === 'dist' || item === '__tests__') continue;
      findComponentFiles(fullPath, files);
    } else if (
      item.endsWith('.ts') &&
      !item.endsWith('.test.ts') &&
      !item.endsWith('.spec.ts') &&
      !item.endsWith('.stories.ts') &&
      !item.endsWith('.cy.ts') &&
      !item.endsWith('.d.ts') &&
      item.startsWith('usa-')
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Check for missing cleanup patterns
 */
function checkMissingCleanup(content, filePath) {
  const issues = [];

  // Check for addEventListener without matching removeEventListener
  const addListenerMatches = content.match(/addEventListener\s*\(\s*['"`](\w+)['"`]/g) || [];
  const removeListenerMatches = content.match(/removeEventListener\s*\(\s*['"`](\w+)['"`]/g) || [];

  // Extract event types
  const addedEvents = addListenerMatches.map((m) => {
    const match = m.match(/['"`](\w+)['"`]/);
    return match ? match[1] : null;
  }).filter(Boolean);

  const removedEvents = removeListenerMatches.map((m) => {
    const match = m.match(/['"`](\w+)['"`]/);
    return match ? match[1] : null;
  }).filter(Boolean);

  // Check for window/document listeners specifically
  const windowDocListeners = content.match(/(window|document)\.addEventListener\s*\(\s*['"`](\w+)['"`]/g) || [];
  for (const listener of windowDocListeners) {
    const eventMatch = listener.match(/['"`](\w+)['"`]/);
    const targetMatch = listener.match(/(window|document)/);
    if (eventMatch && targetMatch) {
      const target = targetMatch[1];
      const event = eventMatch[1];
      // Check if there's a matching remove
      const removePattern = new RegExp(`${target}\\.removeEventListener\\s*\\(\\s*['"\`]${event}['"\`]`);
      if (!removePattern.test(content)) {
        issues.push({
          pattern: 'WINDOW_LISTENER_NO_CLEANUP',
          message: `${target}.addEventListener('${event}') without matching removeEventListener`,
          line: getLineNumber(content, listener),
        });
      }
    }
  }

  // Check for setInterval without clearInterval
  const setIntervalCount = (content.match(/setInterval\s*\(/g) || []).length;
  const clearIntervalCount = (content.match(/clearInterval\s*\(/g) || []).length;
  if (setIntervalCount > clearIntervalCount) {
    issues.push({
      pattern: 'SETINTERVAL_NO_CLEANUP',
      message: `Found ${setIntervalCount} setInterval but only ${clearIntervalCount} clearInterval`,
      line: getLineNumber(content, 'setInterval'),
    });
  }

  return issues;
}

/**
 * Check for reactive props set in updated()
 */
function checkUpdatedAntiPattern(content) {
  const issues = [];

  // Find updated() method
  const updatedMatch = content.match(/updated\s*\([^)]*\)\s*\{/);
  if (!updatedMatch) return issues;

  const startIndex = updatedMatch.index + updatedMatch[0].length;
  let braceCount = 1;
  let endIndex = startIndex;

  // Find the closing brace of updated()
  for (let i = startIndex; i < content.length && braceCount > 0; i++) {
    if (content[i] === '{') braceCount++;
    if (content[i] === '}') braceCount--;
    endIndex = i;
  }

  const updatedBody = content.slice(startIndex, endIndex);

  // Check for property assignments (this.propName = )
  // Exclude common safe patterns like _private props
  const propAssignments = updatedBody.match(/this\.(?!_)[a-zA-Z]\w*\s*=/g) || [];

  for (const assignment of propAssignments) {
    const propName = assignment.match(/this\.(\w+)/)?.[1];
    // Check if it's a @property decorated field
    const propPattern = new RegExp(`@property[^)]*\\)\\s*\\n?\\s*${propName}\\s*[=:]`);
    if (propPattern.test(content)) {
      issues.push({
        pattern: 'REACTIVE_PROP_IN_UPDATED',
        message: `Setting reactive property '${propName}' in updated() may cause infinite loops`,
        line: getLineNumber(content, assignment),
      });
    }
  }

  return issues;
}

/**
 * Get line number for a match
 */
function getLineNumber(content, searchStr) {
  const index = content.indexOf(searchStr);
  if (index === -1) return -1;
  return content.slice(0, index).split('\n').length;
}

/**
 * Analyze a single file for anti-patterns
 */
function analyzeFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const issues = [];

  // Check each pattern
  for (const [patternKey, patternConfig] of Object.entries(ANTI_PATTERNS)) {
    if (patternConfig.customCheck) continue; // Handle separately

    for (const regex of patternConfig.patterns || []) {
      const matches = content.match(regex);
      if (matches) {
        for (const match of matches) {
          issues.push({
            pattern: patternKey,
            name: patternConfig.name,
            severity: patternConfig.severity,
            message: patternConfig.description,
            fix: patternConfig.fix,
            line: getLineNumber(content, match),
            match: match.trim().substring(0, 50),
          });
        }
      }
    }
  }

  // Custom checks
  issues.push(...checkMissingCleanup(content, filePath));
  issues.push(...checkUpdatedAntiPattern(content));

  return issues;
}

/**
 * Main audit function
 */
function auditAntiPatterns() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes('--json');
  const showFix = args.includes('--fix');

  const packagesDir = join(rootDir, 'packages');
  if (!existsSync(packagesDir)) {
    console.error('Error: packages directory not found');
    process.exit(1);
  }

  const componentFiles = findComponentFiles(packagesDir);
  const results = {
    totalFiles: componentFiles.length,
    totalIssues: 0,
    byPattern: {},
    bySeverity: { error: 0, warning: 0 },
    files: [],
  };

  // Initialize pattern counts
  for (const key of Object.keys(ANTI_PATTERNS)) {
    results.byPattern[key] = { count: 0, issues: [] };
  }

  // Analyze each file
  for (const filePath of componentFiles) {
    const issues = analyzeFile(filePath);
    if (issues.length === 0) continue;

    const relativePath = relative(rootDir, filePath);
    const fileResult = {
      file: relativePath,
      issues: issues.map((i) => ({ ...i, file: relativePath })),
    };

    results.files.push(fileResult);
    results.totalIssues += issues.length;

    for (const issue of issues) {
      const patternKey = issue.pattern;
      if (results.byPattern[patternKey]) {
        results.byPattern[patternKey].count++;
        results.byPattern[patternKey].issues.push({ ...issue, file: relativePath });
      }
      results.bySeverity[issue.severity || 'warning']++;
    }
  }

  // Output results
  if (jsonOutput) {
    console.log(JSON.stringify(results, null, 2));
    return results;
  }

  // Console output
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║         COMPONENT ANTI-PATTERN AUDIT                          ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log(`📊 Total component files scanned: ${results.totalFiles}`);
  console.log(`⚠️  Total issues found: ${results.totalIssues}`);
  console.log(`   ❌ Errors: ${results.bySeverity.error}`);
  console.log(`   ⚠️  Warnings: ${results.bySeverity.warning}\n`);

  if (results.totalIssues === 0) {
    console.log('✅ No anti-patterns detected! Components follow best practices.\n');
    return results;
  }

  // By Pattern
  console.log('┌────────────────────────────────────────────────────────────────┐');
  console.log('│ BY ANTI-PATTERN                                                │');
  console.log('└────────────────────────────────────────────────────────────────┘\n');

  for (const [patternKey, data] of Object.entries(results.byPattern)) {
    if (data.count === 0) continue;
    const config = ANTI_PATTERNS[patternKey];
    const icon = config.severity === 'error' ? '❌' : '⚠️';
    console.log(`${icon} ${config.name}: ${data.count}`);
    console.log(`   ${config.description}`);
    if (showFix) {
      console.log(`   💡 Fix: ${config.fix}`);
    }
    console.log('');
  }

  // Files with issues
  console.log('┌────────────────────────────────────────────────────────────────┐');
  console.log('│ FILES WITH ISSUES                                              │');
  console.log('└────────────────────────────────────────────────────────────────┘\n');

  for (const fileResult of results.files) {
    console.log(`  📄 ${fileResult.file}`);
    for (const issue of fileResult.issues) {
      const icon = issue.severity === 'error' ? '❌' : '⚠️';
      const name = issue.name || ANTI_PATTERNS[issue.pattern]?.name || issue.pattern;
      console.log(`     ${icon} Line ${issue.line}: ${name}`);
      if (issue.match) {
        console.log(`        "${issue.match}..."`);
      }
    }
    console.log('');
  }

  // Write report
  const reportPath = join(rootDir, 'reports', 'anti-patterns-audit.json');
  try {
    writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`📄 Report saved to: ${relative(rootDir, reportPath)}`);
  } catch {
    // Ignore write errors
  }

  // Exit with error if errors found
  if (results.bySeverity.error > 0) {
    console.log('\n❌ Anti-pattern errors detected. Please fix before committing.');
    process.exit(1);
  }

  return results;
}

// Run if called directly
auditAntiPatterns();

export { auditAntiPatterns };
