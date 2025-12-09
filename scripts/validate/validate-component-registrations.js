#!/usr/bin/env node

/**
 * Component Registration Validation Script
 *
 * Detects and reports component registration conflicts that can cause
 * component duplication and behavioral issues in Storybook and runtime.
 *
 * This script should have caught the duplicate registration issue that
 * caused component duplication problems.
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// ANSI color codes
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class ComponentRegistrationValidator {
  constructor() {
    this.issues = [];
    this.componentsChecked = 0;
    this.decoratorRegistrations = new Map(); // @customElement decorators
    this.manualRegistrations = new Map();    // customElements.define calls
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logHeader(message) {
    this.log(`\n${colors.bold}═══ ${message} ═══${colors.reset}`, 'cyan');
  }

  async validateRegistrations() {
    this.logHeader('COMPONENT REGISTRATION VALIDATION');

    this.log('\n🔍 Scanning for component registrations...', 'blue');

    // Step 1: Find all @customElement decorators
    await this.findDecoratorRegistrations();

    // Step 2: Find all manual registrations in index.ts
    await this.findManualRegistrations();

    // Step 3: Compare and detect conflicts
    this.detectConflicts();

    // Step 4: Generate report
    this.generateReport();
  }

  async findDecoratorRegistrations() {
    const componentFiles = glob.sync('packages/*/src/components/**/*.ts', {
      ignore: [
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/*.d.ts',
        '**/*.stories.ts',
        '**/index.ts'
      ]
    });

    this.log(`   Found ${componentFiles.length} component files`, 'blue');

    for (const filePath of componentFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      const decoratorMatch = content.match(/@customElement\(['"`](usa-[^'"`]+)['"`]\)/);

      if (decoratorMatch) {
        const componentName = decoratorMatch[1];
        this.decoratorRegistrations.set(componentName, {
          file: filePath,
          line: this.findLineNumber(content, decoratorMatch[0])
        });
        this.componentsChecked++;
      }
    }

    this.log(`   Found ${this.decoratorRegistrations.size} @customElement decorators`, 'green');
  }

  async findManualRegistrations() {
    const indexPath = 'src/index.ts';

    if (!fs.existsSync(indexPath)) {
      this.log(`   Warning: ${indexPath} not found`, 'yellow');
      return;
    }

    const content = fs.readFileSync(indexPath, 'utf8');

    // Find all customElements.define calls
    const defineMatches = content.matchAll(/customElements\.define\(['"`](usa-[^'"`]+)['"`]/g);

    for (const match of defineMatches) {
      const componentName = match[1];
      this.manualRegistrations.set(componentName, {
        file: indexPath,
        line: this.findLineNumber(content, match[0])
      });
    }

    this.log(`   Found ${this.manualRegistrations.size} manual registrations in index.ts`, 'green');
  }

  detectConflicts() {
    this.log('\n🔍 Detecting registration conflicts...', 'blue');

    // Find components with both decorator AND manual registration
    for (const [componentName, decoratorInfo] of this.decoratorRegistrations) {
      if (this.manualRegistrations.has(componentName)) {
        const manualInfo = this.manualRegistrations.get(componentName);

        this.issues.push({
          type: 'DUPLICATE_REGISTRATION',
          severity: 'HIGH',
          componentName,
          message: `Component has BOTH @customElement decorator AND manual registration`,
          decorator: decoratorInfo,
          manual: manualInfo
        });
      }
    }

    // Find manual registrations without decorators
    for (const [componentName, manualInfo] of this.manualRegistrations) {
      if (!this.decoratorRegistrations.has(componentName)) {
        this.issues.push({
          type: 'MANUAL_ONLY_REGISTRATION',
          severity: 'MEDIUM',
          componentName,
          message: `Component has manual registration but no @customElement decorator`,
          manual: manualInfo
        });
      }
    }

    // Find decorators without manual registrations (this is good!)
    const decoratorOnlyCount = Array.from(this.decoratorRegistrations.keys())
      .filter(name => !this.manualRegistrations.has(name)).length;

    this.log(`   ${decoratorOnlyCount} components correctly use only @customElement decorator`, 'green');
  }

  findLineNumber(content, searchString) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchString)) {
        return i + 1;
      }
    }
    return 'unknown';
  }

  generateReport() {
    this.logHeader('VALIDATION REPORT');

    const duplicateIssues = this.issues.filter(i => i.type === 'DUPLICATE_REGISTRATION');
    const manualOnlyIssues = this.issues.filter(i => i.type === 'MANUAL_ONLY_REGISTRATION');

    this.log(`\n📊 Summary:`, 'bold');
    this.log(`   Components scanned: ${this.componentsChecked}`);
    this.log(`   @customElement decorators: ${this.decoratorRegistrations.size}`);
    this.log(`   Manual registrations: ${this.manualRegistrations.size}`);
    this.log(`   Duplicate registrations: ${duplicateIssues.length}`,
             duplicateIssues.length > 0 ? 'red' : 'green');
    this.log(`   Manual-only registrations: ${manualOnlyIssues.length}`,
             manualOnlyIssues.length > 0 ? 'yellow' : 'green');

    if (this.issues.length === 0) {
      this.log('\n🎉 No registration conflicts detected!', 'green');
      this.log('All components use consistent registration patterns.', 'green');
      return;
    }

    // Report duplicate registrations (HIGH priority)
    if (duplicateIssues.length > 0) {
      this.log('\n🚨 DUPLICATE REGISTRATIONS (CRITICAL - Causes component duplication):', 'red');
      duplicateIssues.forEach(issue => {
        this.log(`\n   ${issue.componentName}:`, 'red');
        this.log(`     @customElement: ${issue.decorator.file}:${issue.decorator.line}`);
        this.log(`     Manual registration: ${issue.manual.file}:${issue.manual.line}`);
        this.log(`     ⚠️  This causes component duplication and conflicts!`, 'yellow');
      });

      this.log('\n💡 RECOMMENDED FIXES:', 'cyan');
      this.log('   1. Remove manual registrations from src/index.ts', 'cyan');
      this.log('   2. Keep only @customElement decorators (modern pattern)', 'cyan');
      this.log('   3. Test components in Storybook after changes', 'cyan');
    }

    // Report manual-only registrations (MEDIUM priority)
    if (manualOnlyIssues.length > 0) {
      this.log('\n⚠️  MANUAL-ONLY REGISTRATIONS (Consider adding @customElement decorator):', 'yellow');
      manualOnlyIssues.forEach(issue => {
        this.log(`   ${issue.componentName}: ${issue.manual.file}:${issue.manual.line}`);
      });
    }

    // Provide fix commands
    if (duplicateIssues.length > 0) {
      this.log('\n🔧 AUTOMATED FIXES:', 'cyan');
      this.log('   Create a script to remove duplicate manual registrations:', 'cyan');

      const componentsToFix = duplicateIssues.map(i => i.componentName);
      this.log(`\n   Components to fix: ${componentsToFix.join(', ')}`, 'yellow');

      this.log('\n   Manual fix: Edit src/index.ts and remove these lines:', 'cyan');
      duplicateIssues.forEach(issue => {
        this.log(`     - Lines around ${issue.manual.line} for ${issue.componentName}`, 'yellow');
      });
    }

    // Exit with error code if critical issues found
    if (duplicateIssues.length > 0) {
      this.log('\n❌ CRITICAL ISSUES DETECTED - Component duplication likely occurring!', 'red');
      process.exit(1);
    }
  }
}

// Run validation
const validator = new ComponentRegistrationValidator();
validator.validateRegistrations().catch(error => {
  console.error('Validation failed:', error);
  process.exit(1);
});

export default ComponentRegistrationValidator;