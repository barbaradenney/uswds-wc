#!/usr/bin/env node

/**
 * USWDS Component Initialization Issue Detection Script
 *
 * Systematically detects components with potential initialization issues:
 * 1. Missing initialization guards
 * 2. Problematic USWDS import patterns
 * 3. Lit directive issues
 * 4. Incomplete cleanup patterns
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// ANSI color codes for better output
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

class InitializationIssueDetector {
  constructor() {
    this.issues = [];
    this.componentsChecked = 0;
    this.componentsWithIssues = 0;
    // Components that have specific USWDS JavaScript modules
    this.uswdsJSModules = this.detectAvailableUSWDSModules();
  }

  detectAvailableUSWDSModules() {
    // Check which USWDS components actually have JavaScript modules
    const modules = new Set();
    try {
      const uswdsPackagesPath = 'node_modules/@uswds/uswds/packages';
      if (fs.existsSync(uswdsPackagesPath)) {
        const packages = fs.readdirSync(uswdsPackagesPath);
        for (const pkg of packages) {
          if (pkg.startsWith('usa-')) {
            const indexPath = path.join(uswdsPackagesPath, pkg, 'src', 'index.js');
            if (fs.existsSync(indexPath)) {
              modules.add(pkg);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Warning: Could not detect available USWDS modules:', error.message);
    }
    return modules;
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logHeader(message) {
    this.log(`\n${colors.bold}═══ ${message} ═══${colors.reset}`, 'cyan');
  }

  extractComponentName(filePath) {
    // Extract component name from file path like "packages/*/src/components/pagination/usa-pagination.ts" -> "usa-pagination"
    const match = filePath.match(/usa-([^\/]+)\.ts$/);
    return match ? `usa-${match[1]}` : null;
  }

  async detectAllIssues() {
    this.logHeader('USWDS Component Initialization Issue Detection');

    // Find all component TypeScript files
    const componentFiles = glob.sync('packages/*/src/components/**/*.ts', {
      ignore: [
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/*.d.ts',
        '**/*.stories.ts',
        '**/index.ts'
      ]
    });

    this.log(`\nFound ${componentFiles.length} component files to analyze...`, 'blue');

    for (const filePath of componentFiles) {
      await this.analyzeComponent(filePath);
    }

    this.generateReport();
  }

  async analyzeComponent(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      this.componentsChecked++;
      const componentIssues = [];

      // Extract component name from file path to check if specific module exists
      const componentName = this.extractComponentName(filePath);

      // Check 1: Missing initialization guards
      const hasUSWDSInit = content.includes('.on(this)');
      if (hasUSWDSInit) {
        const hasGuard = content.includes('usingUSWDSEnhancement') ||
                        content.includes('initialized') ||
                        content.includes('Already initialized');

        if (!hasGuard) {
          componentIssues.push({
            type: 'MISSING_INIT_GUARD',
            severity: 'HIGH',
            message: 'Missing initialization guard for USWDS .on(this) call',
            line: this.findLineNumber(content, '.on(this)')
          });
        }
      }

      // Check 2: USWDS import optimization opportunities (only for components with available modules)
      const hasFullUSWDSImport = content.includes("import('@uswds/uswds')") &&
                                !content.includes("import('@uswds/uswds/js/");
      const hasTreeShakingComment = content.includes('Tree-shaking') || content.includes('tree-shaking');
      const hasSpecificModule = this.uswdsJSModules.has(componentName);

      if (hasFullUSWDSImport && hasTreeShakingComment && hasSpecificModule) {
        componentIssues.push({
          type: 'IMPORT_OPTIMIZATION',
          severity: 'LOW',
          message: 'Opportunity to optimize: Try specific USWDS module import before full bundle fallback',
          line: this.findLineNumber(content, "import('@uswds/uswds')")
        });
      } else if (hasFullUSWDSImport && !hasSpecificModule && hasTreeShakingComment) {
        // Component correctly uses full bundle because no specific module exists
        // This is not an issue - add a debug note for clarity
        componentIssues.push({
          type: 'CORRECTLY_IMPLEMENTED',
          severity: 'INFO',
          message: `Correctly using full USWDS bundle (no specific JS module exists for ${componentName})`,
          line: this.findLineNumber(content, "import('@uswds/uswds')"),
          isPositive: true
        });
      } else if (hasFullUSWDSImport && !hasTreeShakingComment) {
        componentIssues.push({
          type: 'PROBLEMATIC_IMPORT',
          severity: 'MEDIUM',
          message: 'Using full USWDS bundle import - consider progressive enhancement pattern',
          line: this.findLineNumber(content, "import('@uswds/uswds')")
        });
      }

      // Check 3: Lit directive issues - Only flag unused imports, not legitimate usage
      const hasUnsafeHTMLImport = content.includes("import { unsafeHTML }") || content.includes("from 'lit/directives/unsafe-html.js'");
      const hasUnsafeHTMLUsage = content.includes('unsafeHTML(');

      if (hasUnsafeHTMLImport && !hasUnsafeHTMLUsage) {
        componentIssues.push({
          type: 'UNUSED_IMPORT',
          severity: 'MEDIUM',
          message: 'Unused unsafeHTML import - can be removed for cleaner code',
          line: this.findLineNumber(content, 'unsafeHTML')
        });
      }

      // Check 4: Missing cleanup flag reset
      if (hasUSWDSInit) {
        const hasCleanup = content.includes('.off(this)');
        const hasCleanupFlagReset = content.includes('usingUSWDSEnhancement = false') ||
                                   content.includes('initialized = false');

        if (hasCleanup && !hasCleanupFlagReset) {
          componentIssues.push({
            type: 'MISSING_CLEANUP_FLAG',
            severity: 'MEDIUM',
            message: 'USWDS cleanup present but missing flag reset',
            line: this.findLineNumber(content, '.off(this)')
          });
        }
      }

      // Check 5: Incomplete error handling
      if (hasUSWDSInit) {
        const hasErrorHandling = content.includes('try {') && content.includes('catch');
        if (!hasErrorHandling) {
          componentIssues.push({
            type: 'MISSING_ERROR_HANDLING',
            severity: 'LOW',
            message: 'USWDS initialization lacks proper error handling',
            line: this.findLineNumber(content, '.on(this)')
          });
        }
      }

      if (componentIssues.length > 0) {
        // Only count as problematic if there are actual issues (not just positive feedback)
        const actualIssues = componentIssues.filter(issue => !issue.isPositive);
        if (actualIssues.length > 0) {
          this.componentsWithIssues++;
        }

        this.issues.push({
          file: filePath,
          component: componentName,
          issues: componentIssues
        });
      }

    } catch (error) {
      this.log(`Error analyzing ${filePath}: ${error.message}`, 'red');
    }
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
    this.logHeader('DETECTION REPORT');

    // Calculate actual issues (excluding positive feedback)
    const totalActualIssues = this.issues.reduce((sum, comp) =>
      sum + comp.issues.filter(issue => !issue.isPositive).length, 0);

    this.log(`\n📊 Summary:`, 'bold');
    this.log(`   Components analyzed: ${this.componentsChecked}`);
    this.log(`   Components with issues: ${this.componentsWithIssues}`,
             this.componentsWithIssues > 0 ? 'yellow' : 'green');
    this.log(`   Total issues found: ${totalActualIssues}`);

    if (totalActualIssues === 0) {
      this.log('\n🎉 No initialization issues detected!', 'green');
      return;
    }

    // Group issues by severity, excluding positive feedback from main issue count
    const severityGroups = {
      HIGH: [],
      MEDIUM: [],
      LOW: [],
      INFO: []
    };

    const positiveInfo = [];

    this.issues.forEach(component => {
      component.issues.forEach(issue => {
        if (issue.isPositive) {
          positiveInfo.push({ ...issue, component: component.component, file: component.file });
        } else {
          severityGroups[issue.severity].push({ ...issue, component: component.component, file: component.file });
        }
      });
    });

    // Show positive feedback first (correctly implemented components)
    if (positiveInfo.length > 0) {
      this.log('\n✅ CORRECTLY IMPLEMENTED (no action needed):', 'green');
      positiveInfo.forEach(info => {
        this.log(`   ${info.component} (${info.file}:${info.line})`);
        this.log(`     ${info.message}`, 'reset');
      });
    }

    // Report by severity (excluding INFO/positive)
    Object.entries(severityGroups).forEach(([severity, issues]) => {
      if (issues.length === 0 || severity === 'INFO') return;

      this.log(`\n🚨 ${severity} PRIORITY ISSUES (${issues.length}):`,
               severity === 'HIGH' ? 'red' : severity === 'MEDIUM' ? 'yellow' : 'blue');

      issues.forEach(issue => {
        this.log(`   ${issue.component} (${issue.file}:${issue.line})`);
        this.log(`     ${issue.message}`, 'reset');
      });
    });

    // Provide fix recommendations
    this.logHeader('RECOMMENDED ACTIONS');

    const highIssues = severityGroups.HIGH.length;
    const mediumIssues = severityGroups.MEDIUM.length;
    const lowIssues = severityGroups.LOW.length;

    if (highIssues > 0) {
      this.log('\n🔥 IMMEDIATE ACTION REQUIRED:', 'red');
      this.log('   Run: npm run fix:initialization:guards', 'yellow');
      this.log('   This will add missing initialization guards to prevent duplicate USWDS calls');
    }

    if (mediumIssues > 0) {
      this.log('\n⚠️  RECOMMENDED FIXES:', 'yellow');
      this.log('   Run: npm run fix:initialization:imports', 'yellow');
      this.log('   This will update USWDS import patterns and fix directive issues');
    }

    if (lowIssues > 0) {
      this.log('\n💡 OPTIMIZATION OPPORTUNITIES:', 'blue');
      this.log('   These are enhancement opportunities that can improve bundle size', 'reset');
      this.log('   Run: npm run optimize:imports', 'yellow');
      this.log('   This will attempt to optimize USWDS imports for better tree-shaking');
    }

    this.log('\n🛡️  PREVENTION:', 'blue');
    this.log('   Run: npm run setup:initialization:prevention', 'yellow');
    this.log('   This will install pre-commit hooks and ESLint rules to prevent future issues');
  }
}

// Self-executing detection
const detector = new InitializationIssueDetector();
detector.detectAllIssues().catch(error => {
  console.error('Detection failed:', error);
  process.exit(1);
});

export default InitializationIssueDetector;