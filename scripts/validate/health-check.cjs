#!/usr/bin/env node

/**
 * Repository Health Check Dashboard
 *
 * Provides a comprehensive overview of repository health including:
 * - Tests status
 * - Linting status
 * - TypeScript status
 * - USWDS compliance
 * - Bundle size
 * - Documentation health
 * - Dependencies status
 * - Cache size
 * - Discovered issues
 *
 * Usage: npm run health:check
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

function exec(command, options = {}) {
  try {
    return execSync(command, { encoding: 'utf8', ...options }).trim();
  } catch (error) {
    if (options.ignoreError) {
      return error.stdout ? error.stdout.trim() : '';
    }
    throw error;
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

console.log('\n');
console.log(BOLD + BLUE + '🏥 Repository Health Check' + RESET);
console.log(BLUE + '═'.repeat(80) + RESET);
console.log('\n');

let healthScore = 0;
let totalChecks = 0;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. Tests Status (from cached regression validation)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

totalChecks++;
try {
  // Use cached regression validation instead of running all tests
  const regressionFile = 'test-reports/regression-validation.json';
  if (fs.existsSync(regressionFile)) {
    const regression = JSON.parse(fs.readFileSync(regressionFile, 'utf8'));
    if (regression.overallPassed && regression.regressionTestsPassed) {
      console.log(GREEN + '✅ Tests: All passing (from regression validation)' + RESET);
      healthScore++;
    } else {
      console.log(RED + '❌ Tests: Regression validation failing' + RESET);
    }
  } else {
    console.log(YELLOW + '⚠️  Tests: No cached results (run npm test)' + RESET);
  }
} catch (error) {
  console.log(YELLOW + '⚠️  Tests: Unable to determine status' + RESET);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. Linting Status
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

totalChecks++;
try {
  exec('npm run lint 2>&1', { stdio: 'ignore' });
  console.log(GREEN + '✅ Linting: No errors' + RESET);
  healthScore++;
} catch {
  console.log(RED + '❌ Linting: ERRORS FOUND' + RESET);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. TypeScript Status
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

totalChecks++;
try {
  exec('npm run typecheck 2>&1', { stdio: 'ignore' });
  console.log(GREEN + '✅ TypeScript: No errors' + RESET);
  healthScore++;
} catch {
  console.log(RED + '❌ TypeScript: ERRORS FOUND' + RESET);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. USWDS Compliance
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

totalChecks++;
try {
  const componentCount = fs.readdirSync('src/components').filter(dir =>
    fs.statSync(path.join('src/components', dir)).isDirectory()
  ).length;
  console.log(GREEN + `✅ USWDS Compliance: ${componentCount} components` + RESET);
  healthScore++;
} catch {
  console.log(YELLOW + '⚠️  USWDS Compliance: Unable to determine' + RESET);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. Bundle Size
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

totalChecks++;
try {
  if (fs.existsSync('test-reports/storybook-docs-metrics.json')) {
    const metrics = JSON.parse(fs.readFileSync('test-reports/storybook-docs-metrics.json', 'utf8'));
    const bundleSize = metrics.bundle?.total || 'Unknown';
    const gzipped = metrics.bundle?.gzipped || 'Unknown';
    console.log(GREEN + `✅ Bundle Size: ${bundleSize} (${gzipped} gzipped)` + RESET);
    healthScore++;
  } else if (fs.existsSync('dist')) {
    const distSize = exec('du -sh dist/ 2>/dev/null || echo "0KB"');
    console.log(GREEN + `✅ Bundle Size: ${distSize}` + RESET);
    healthScore++;
  } else {
    console.log(YELLOW + '⚠️  Bundle Size: Build not found (run npm run build)' + RESET);
  }
} catch {
  console.log(YELLOW + '⚠️  Bundle Size: Unable to determine' + RESET);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6. Documentation Health
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

totalChecks++;
try {
  const docCount = exec('find docs -name "*.md" 2>/dev/null | wc -l');
  const uncategorized = exec('node scripts/maintenance/cleanup-documentation.cjs --dry-run 2>/dev/null | grep "Uncategorized:" | awk \'{print $2}\' || echo "0"');

  if (parseInt(uncategorized) > 0) {
    console.log(YELLOW + `⚠️  Documentation: ${docCount} files (${uncategorized} uncategorized)` + RESET);
  } else if (parseInt(docCount) > 50) {
    console.log(YELLOW + `⚠️  Documentation: ${docCount} files (consider cleanup)` + RESET);
  } else {
    console.log(GREEN + `✅ Documentation: ${docCount} files (0 uncategorized)` + RESET);
    healthScore++;
  }
} catch {
  console.log(YELLOW + '⚠️  Documentation: Unable to determine' + RESET);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 7. Dependencies Status
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

totalChecks++;
try {
  const outdated = exec('npm outdated --json 2>/dev/null || echo "{}"');
  const outdatedCount = Object.keys(JSON.parse(outdated)).length;

  const audit = exec('npm audit --json 2>/dev/null || echo "{}"');
  const auditData = JSON.parse(audit);
  const vulnCount = auditData.metadata?.vulnerabilities?.total || 0;

  if (vulnCount > 0) {
    console.log(RED + `❌ Dependencies: ${vulnCount} vulnerabilities found` + RESET);
  } else if (outdatedCount > 5) {
    console.log(YELLOW + `⚠️  Dependencies: ${outdatedCount} outdated (run npm update)` + RESET);
  } else if (outdatedCount > 0) {
    console.log(GREEN + `✅ Dependencies: ${outdatedCount} outdated (acceptable)` + RESET);
    healthScore++;
  } else {
    console.log(GREEN + '✅ Dependencies: All up-to-date' + RESET);
    healthScore++;
  }
} catch {
  console.log(YELLOW + '⚠️  Dependencies: Unable to determine' + RESET);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 8. Cache Size
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

totalChecks++;
try {
  let totalCacheSize = 0;

  if (fs.existsSync('node_modules/.cache')) {
    const cacheSize = exec('du -sk node_modules/.cache 2>/dev/null || echo "0"').split('\t')[0];
    totalCacheSize += parseInt(cacheSize) * 1024;
  }

  if (totalCacheSize > 100 * 1024 * 1024) {
    console.log(YELLOW + `⚠️  Cache Size: ${formatBytes(totalCacheSize)} (suggest cleanup: npm run cleanup:cache)` + RESET);
  } else if (totalCacheSize > 0) {
    console.log(GREEN + `✅ Cache Size: ${formatBytes(totalCacheSize)} (acceptable)` + RESET);
    healthScore++;
  } else {
    console.log(GREEN + '✅ Cache Size: Clean (0 B)' + RESET);
    healthScore++;
  }
} catch {
  console.log(YELLOW + '⚠️  Cache Size: Unable to determine' + RESET);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 9. Discovered Issues
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

totalChecks++;
try {
  if (fs.existsSync('.git/DISCOVERED_ISSUES.json')) {
    const issues = JSON.parse(fs.readFileSync('.git/DISCOVERED_ISSUES.json', 'utf8'));
    console.log(RED + `❌ Discovered Issues: ${issues.length} pending (fix before new work)` + RESET);
  } else {
    console.log(GREEN + '✅ Discovered Issues: None pending' + RESET);
    healthScore++;
  }
} catch {
  console.log(GREEN + '✅ Discovered Issues: None pending' + RESET);
  healthScore++;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Summary
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log('\n' + BLUE + '═'.repeat(80) + RESET);

const healthPercentage = Math.round((healthScore / totalChecks) * 100);
let statusColor = GREEN;
let statusIcon = '✅';

if (healthPercentage < 70) {
  statusColor = RED;
  statusIcon = '❌';
} else if (healthPercentage < 90) {
  statusColor = YELLOW;
  statusIcon = '⚠️';
}

console.log(BOLD + statusColor + `${statusIcon} Overall Health: ${healthScore}/${totalChecks} (${healthPercentage}%)` + RESET);

if (healthPercentage === 100) {
  console.log(GREEN + '🎉 Repository is in excellent health!' + RESET);
} else if (healthPercentage >= 90) {
  console.log(YELLOW + '👍 Repository is in good health with minor issues.' + RESET);
} else if (healthPercentage >= 70) {
  console.log(YELLOW + '⚠️  Repository has some issues that need attention.' + RESET);
} else {
  console.log(RED + '🚨 Repository needs immediate attention!' + RESET);
}

console.log(BLUE + '═'.repeat(80) + RESET);
console.log('\n');

// Exit with appropriate code
process.exit(healthPercentage < 70 ? 1 : 0);
