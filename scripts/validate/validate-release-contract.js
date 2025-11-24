#!/usr/bin/env node
/**
 * Release Contract Validator
 * 
 * CRITICAL: Enforces that releases are ONLY done through the official release script.
 * This validator checks for any signs of manual release attempts and blocks them.
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '../..');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

let violations = [];

console.log(`${BOLD}${CYAN}🔒 Release Contract Validator${RESET}\n`);

/**
 * Check if this is a release-related commit
 */
function isReleaseCommit() {
  try {
    // Get staged files
    const staged = execSync('git diff --cached --name-only', { encoding: 'utf8' });
    const files = staged.trim().split('\n').filter(Boolean);
    
    // Check for version changes in package.json files
    const versionChanges = files.filter(f => f.endsWith('package.json'));
    
    if (versionChanges.length === 0) {
      return false;
    }
    
    // Check if versions actually changed
    for (const file of versionChanges) {
      try {
        const diff = execSync(`git diff --cached ${file}`, { encoding: 'utf8' });
        if (diff.includes('"version":')) {
          return true;
        }
      } catch (err) {
        // File might be new
      }
    }
    
    return false;
  } catch (err) {
    return false;
  }
}

/**
 * Check if commit was made through the release script
 */
function isReleaseScriptCommit() {
  try {
    // Check if environment variable is set by release script
    if (process.env.RELEASE_SCRIPT_RUNNING === 'true') {
      return true;
    }
    
    // Check commit message for release script signature
    const commitMsg = execSync('git log -1 --pretty=%B 2>/dev/null || echo ""', { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // Release script commits include specific markers
    if (commitMsg.includes('chore(release): bump version to') && 
        commitMsg.includes('Generated with [Claude Code]')) {
      return true;
    }
    
    return false;
  } catch (err) {
    return false;
  }
}

/**
 * Check for manual version bumps
 */
function checkManualVersionBumps() {
  try {
    const staged = execSync('git diff --cached --name-only', { encoding: 'utf8' });
    const packageFiles = staged.trim().split('\n')
      .filter(f => f.endsWith('package.json'));
    
    for (const file of packageFiles) {
      try {
        const diff = execSync(`git diff --cached ${file}`, { encoding: 'utf8' });
        
        // Check if version line changed
        if (diff.includes('"version":')) {
          const versionLines = diff.split('\n')
            .filter(line => line.includes('"version":'));
          
          if (versionLines.length > 0) {
            violations.push({
              type: 'MANUAL_VERSION_BUMP',
              file,
              severity: 'CRITICAL',
              message: `Manual version change detected in ${file}`
            });
          }
        }
      } catch (err) {
        // Skip if can't read diff
      }
    }
  } catch (err) {
    // No staged files
  }
}

/**
 * Check for manual changelog modifications without release script
 */
function checkManualChangelogModifications() {
  try {
    const staged = execSync('git diff --cached --name-only', { encoding: 'utf8' });
    
    if (staged.includes('CHANGELOG.md')) {
      const diff = execSync('git diff --cached CHANGELOG.md', { encoding: 'utf8' });
      
      // Check if new version section was added
      if (diff.includes('## [') && diff.includes('] -')) {
        violations.push({
          type: 'MANUAL_CHANGELOG',
          file: 'CHANGELOG.md',
          severity: 'WARNING',
          message: 'CHANGELOG.md modified - ensure this is through release script'
        });
      }
    }
  } catch (err) {
    // No changelog changes
  }
}

/**
 * Check for manual git tags
 */
function checkManualTags() {
  try {
    // Check if we're creating a tag manually
    const args = process.argv.slice(2);
    
    if (args.includes('--allow-manual-tag')) {
      return; // Explicitly allowed for testing
    }
    
    // This will be caught during tag creation, not commit
  } catch (err) {
    // Skip
  }
}

/**
 * Display violations and exit
 */
function reportViolations() {
  if (violations.length === 0) {
    console.log(`${GREEN}✓ Release contract compliance verified${RESET}\n`);
    return 0;
  }
  
  console.log(`${RED}${BOLD}❌ RELEASE CONTRACT VIOLATIONS DETECTED${RESET}\n`);
  
  const critical = violations.filter(v => v.severity === 'CRITICAL');
  const warnings = violations.filter(v => v.severity === 'WARNING');
  
  if (critical.length > 0) {
    console.log(`${RED}${BOLD}CRITICAL VIOLATIONS:${RESET}`);
    critical.forEach(v => {
      console.log(`  ${RED}✗${RESET} ${v.type}: ${v.message}`);
      console.log(`    File: ${v.file}`);
    });
    console.log('');
  }
  
  if (warnings.length > 0) {
    console.log(`${YELLOW}${BOLD}WARNINGS:${RESET}`);
    warnings.forEach(v => {
      console.log(`  ${YELLOW}⚠${RESET} ${v.type}: ${v.message}`);
      console.log(`    File: ${v.file}`);
    });
    console.log('');
  }
  
  console.log(`${RED}${BOLD}═══════════════════════════════════════════════════════════${RESET}`);
  console.log(`${RED}${BOLD}  MANUAL RELEASES ARE STRICTLY PROHIBITED${RESET}`);
  console.log(`${RED}${BOLD}═══════════════════════════════════════════════════════════${RESET}\n`);
  
  console.log(`${CYAN}${BOLD}To create a release, use the official release script:${RESET}\n`);
  console.log(`  ${GREEN}pnpm run release:patch${RESET}   # Bug fixes`);
  console.log(`  ${GREEN}pnpm run release:minor${RESET}   # New features`);
  console.log(`  ${GREEN}pnpm run release:major${RESET}   # Breaking changes\n`);
  
  console.log(`${YELLOW}If you need to make non-release changes to package.json:${RESET}`);
  console.log(`  1. Ensure you're not changing the version field`);
  console.log(`  2. Document the change in your commit message\n`);
  
  if (critical.length > 0) {
    console.log(`${RED}${BOLD}COMMIT BLOCKED - Fix violations above${RESET}\n`);
    return 1;
  }
  
  return 0;
}

// Main execution
try {
  if (!isReleaseCommit()) {
    console.log(`${GREEN}✓ Not a release commit - skipping validation${RESET}\n`);
    process.exit(0);
  }
  
  if (isReleaseScriptCommit()) {
    console.log(`${GREEN}✓ Release script commit detected - allowing${RESET}\n`);
    process.exit(0);
  }
  
  // This IS a release commit, but NOT from release script
  console.log(`${YELLOW}⚠ Release-related changes detected...${RESET}\n`);
  
  checkManualVersionBumps();
  checkManualChangelogModifications();
  checkManualTags();
  
  const exitCode = reportViolations();
  process.exit(exitCode);
  
} catch (err) {
  console.error(`${RED}Error validating release contract: ${err.message}${RESET}`);
  // Don't block on validator errors
  process.exit(0);
}
