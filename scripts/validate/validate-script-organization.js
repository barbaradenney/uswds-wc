#!/usr/bin/env node

/**
 * Script Organization Validator
 *
 * Detects scripts that should be archived based on naming patterns and purpose.
 * Prevents accumulation of one-off fix/migration scripts in active directories.
 *
 * Run as part of pre-commit to maintain repository cleanliness.
 */

import { readdirSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const scriptsDir = join(__dirname, '..');

// Patterns that indicate a script should be archived
const ONE_OFF_PATTERNS = {
  // Scripts that start with these prefixes
  prefixes: [
    'fix-',           // One-time fixes
    'apply-',         // Migration/application tasks
    'add-',           // Setup/addition tasks (unless generators)
    'cleanup-',       // One-time cleanup tasks
    'migrate-',       // Migration scripts
    'audit-',         // One-time audit scripts
    'analyze-',       // One-time analysis scripts
    'investigate-',   // Investigation/debugging scripts
    'diagnose-',      // Diagnostic scripts
    'manual-',        // Manual intervention scripts
    'comprehensive-issue-', // Specific issue detection
  ],

  // Allowed exceptions - these can stay in active directories
  exceptions: [
    'add-initialization-test.js',       // Template/example
    'analyze-testing-gaps.js',          // Ongoing analysis tool
    'cleanup-validator.cjs',            // Active pre-commit validator
    'cleanup-test-processes.js',        // Active test cleanup utility
    'cleanup-documentation.cjs',        // Active documentation lifecycle tool
    'validate-script-organization.js',  // This validator itself
    'audit-skipped-tests.js',           // Ongoing maintenance audit tool
    'audit-component-anti-patterns.js', // Ongoing maintenance audit tool
  ],
};

// Directories to check for organization issues
const ACTIVE_DIRECTORIES = [
  'scripts/maintenance',
  'scripts/validate',
  'scripts/test',
  'scripts/ci',
];

// Color helpers
const colors = {
  bold: text => `\x1b[1m${text}\x1b[0m`,
  red: text => `\x1b[31m${text}\x1b[0m`,
  green: text => `\x1b[32m${text}\x1b[0m`,
  yellow: text => `\x1b[33m${text}\x1b[0m`,
  cyan: text => `\x1b[36m${text}\x1b[0m`,
};

class ScriptOrganizationValidator {
  constructor() {
    this.issues = [];
  }

  /**
   * Check if a script name indicates it should be archived
   */
  shouldBeArchived(filename) {
    // Check exceptions first
    if (ONE_OFF_PATTERNS.exceptions.includes(filename)) {
      return false;
    }

    // Check if filename starts with any one-off pattern
    return ONE_OFF_PATTERNS.prefixes.some(prefix =>
      filename.startsWith(prefix)
    );
  }

  /**
   * Read script file to check for one-off indicators in content
   */
  isProbablyOneOff(filePath) {
    try {
      const content = readFileSync(filePath, 'utf8');
      const firstLines = content.split('\n').slice(0, 30).join('\n');

      // Look for phrases indicating one-time use
      const oneOffPhrases = [
        'one-time',
        'one time',
        'migration script',
        'fix script',
        'temporary script',
        'manual fix',
        'this script fixes',
        'this script migrates',
        'this script adds',
        'this script applies',
        'run once',
      ];

      return oneOffPhrases.some(phrase =>
        firstLines.toLowerCase().includes(phrase)
      );
    } catch (e) {
      return false;
    }
  }

  /**
   * Validate script organization in a directory
   */
  validateDirectory(dirPath) {
    if (!existsSync(dirPath)) {
      return;
    }

    const files = readdirSync(dirPath, { withFileTypes: true });

    for (const file of files) {
      if (!file.isFile()) continue;

      const filename = file.name;
      const filePath = join(dirPath, filename);

      // Skip non-script files
      if (!['.js', '.cjs', '.mjs', '.sh'].some(ext => filename.endsWith(ext))) {
        continue;
      }

      // Skip exception files completely
      if (ONE_OFF_PATTERNS.exceptions.includes(filename)) {
        continue;
      }

      // Check if should be archived by name
      if (this.shouldBeArchived(filename)) {
        this.issues.push({
          file: filePath,
          reason: 'Filename pattern indicates one-off script',
          suggestion: `Move to scripts/archived/one-off-fixes/`,
        });
        continue;
      }

      // Check content for one-off indicators
      if (this.isProbablyOneOff(filePath)) {
        this.issues.push({
          file: filePath,
          reason: 'Script content suggests one-time use',
          suggestion: `Review and move to scripts/archived/one-off-fixes/ if completed`,
        });
      }
    }
  }

  /**
   * Run validation on all active directories
   */
  validate() {
    console.log(colors.cyan('\n🧹 Validating script organization...\n'));

    for (const dir of ACTIVE_DIRECTORIES) {
      const dirPath = join(scriptsDir, '..', dir);
      this.validateDirectory(dirPath);
    }

    return this.issues;
  }

  /**
   * Report validation results
   */
  report() {
    if (this.issues.length === 0) {
      console.log(colors.green('✅ All scripts are properly organized\n'));
      return true;
    }

    console.log(colors.yellow(`⚠️  Found ${this.issues.length} script(s) that may need archiving:\n`));

    for (const issue of this.issues) {
      const relativePath = issue.file.replace(process.cwd() + '/', '');
      console.log(colors.bold(`📄 ${relativePath}`));
      console.log(`   ${colors.yellow('Reason:')} ${issue.reason}`);
      console.log(`   ${colors.cyan('→')} ${issue.suggestion}\n`);
    }

    console.log(colors.yellow('💡 To fix:'));
    console.log('   1. Review the listed scripts');
    console.log('   2. If completed, move to scripts/archived/one-off-fixes/');
    console.log('   3. Update package.json if script is referenced');
    console.log('   4. Re-run validation\n');

    return false;
  }
}

// Main execution
const validator = new ScriptOrganizationValidator();
validator.validate();
const isValid = validator.report();

process.exit(isValid ? 0 : 1);
