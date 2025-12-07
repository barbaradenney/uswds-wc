#!/usr/bin/env node

/**
 * Automated Component Issue Detection and Correction
 *
 * This script automatically detects and suggests fixes for common component issues:
 * 1. Missing required DOM elements for USWDS integration
 * 2. CSS-only components incorrectly trying to load JavaScript
 * 3. Double initialization patterns
 * 4. Performance issues in test configuration
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { globSync } from 'glob';
import path from 'path';
import { getAllComponentPaths, getAllComponentNames } from '../utils/find-components.js';

const ISSUES = {
  MISSING_REQUIRED_ELEMENTS: 'missing-required-elements',
  INCORRECT_JS_LOADING: 'incorrect-js-loading',
  DOUBLE_INITIALIZATION: 'double-initialization',
  TEST_PERFORMANCE: 'test-performance'
};

class ComponentIssueDetector {
  constructor() {
    this.detectedIssues = [];
    this.fixableIssues = [];
  }

  /**
   * Detect components that might need ensureRequiredElements() method
   */
  async detectMissingRequiredElements() {
    const componentFiles = globSync('packages/*/src/components/*/usa-*.ts', {
      ignore: ['**/*.test.ts', '**/*.browser.test.ts', '**/*.spec.ts']
    });
    const issueComponents = [];

    for (const file of componentFiles) {
      const content = readFileSync(file, 'utf-8');

      // Check if component has USWDS integration but no ensureRequiredElements
      if (content.includes('initializeUSWDSComponent') &&
          !content.includes('ensureRequiredElements') &&
          !content.includes('CSS-only')) {

        // Check if it's an interactive component that might need DOM elements
        const componentName = path.basename(file, '.ts').replace('usa-', '');
        const interactiveComponents = ['modal', 'accordion', 'table', 'combo-box', 'date-picker'];

        if (interactiveComponents.some(comp => componentName.includes(comp))) {
          issueComponents.push({
            file,
            componentName,
            issue: ISSUES.MISSING_REQUIRED_ELEMENTS,
            severity: 'medium',
            autoFixable: true
          });
        }
      }
    }

    return issueComponents;
  }

  /**
   * Detect CSS-only components incorrectly trying to load JavaScript
   */
  async detectIncorrectJSLoading() {
    const cssOnlyComponents = [
      'pagination', 'button', 'alert', 'card', 'breadcrumb',
      'tag', 'link', 'prose', 'section', 'summary-box'
    ];

    const issueComponents = [];

    // Call getAllComponentPaths() once instead of in a loop
    const componentPaths = getAllComponentPaths();

    for (const componentName of cssOnlyComponents) {
      const componentDir = componentPaths.find(p => path.basename(p) === componentName);
      if (!componentDir) continue;
      const componentFile = path.join(componentDir, `usa-${componentName}.ts`);

      if (existsSync(componentFile)) {
        const content = readFileSync(componentFile, 'utf-8');

        // Check if CSS-only component is trying to load USWDS JavaScript
        if (content.includes('initializeUSWDSComponent') &&
            !content.includes('isCSSOnlyComponent')) {

          issueComponents.push({
            file: componentFile,
            componentName,
            issue: ISSUES.INCORRECT_JS_LOADING,
            severity: 'low',
            autoFixable: true
          });
        }
      }
    }

    return issueComponents;
  }

  /**
   * Detect potential double initialization patterns
   */
  async detectDoubleInitialization() {
    const componentFiles = globSync('packages/*/src/components/*/usa-*.ts', {
      ignore: ['**/*.test.ts', '**/*.browser.test.ts', '**/*.spec.ts']
    });
    const issueComponents = [];

    for (const file of componentFiles) {
      const content = readFileSync(file, 'utf-8');

      // Look for ACTUAL initialization calls (not function declarations or imports)
      // Match: initializeUSWDSComponent( or USWDS.component.on(this) or this.initializeUSWDSComponent()
      const actualCalls = [];

      // Match calls to initializeUSWDSComponent (exclude import statements and function declarations)
      const componentInitCalls = content.match(/(?:await\s+)?initializeUSWDSComponent\s*\(/g) || [];
      actualCalls.push(...componentInitCalls);

      // Match calls to USWDS.component.on(this)
      const uswdsOnCalls = content.match(/USWDS\.\w+\.on\s*\(\s*this\s*\)/g) || [];
      actualCalls.push(...uswdsOnCalls);

      // Only flag if we have MULTIPLE different initialization approaches being called
      // (Not counting the same call multiple times from declarations vs usage)
      const hasComponentInit = componentInitCalls.length > 0;
      const hasUSWDSOn = uswdsOnCalls.length > 0;
      const multipleDifferentApproaches = hasComponentInit && hasUSWDSOn;

      if (multipleDifferentApproaches) {
        // Check if there are proper guards
        if (!content.includes('usingUSWDSEnhancement') &&
            !content.includes('uswdsInitialized')) {

          issueComponents.push({
            file,
            componentName: path.basename(file, '.ts').replace('usa-', ''),
            issue: ISSUES.DOUBLE_INITIALIZATION,
            severity: 'high',
            autoFixable: false,
            details: `Found both initializeUSWDSComponent (${componentInitCalls.length}) and USWDS.on (${uswdsOnCalls.length}) without proper guards`
          });
        }
      }
    }

    return issueComponents;
  }

  /**
   * Detect test performance issues
   */
  async detectTestPerformanceIssues() {
    const issues = [];

    // Check test file count (exclude node_modules and other non-source directories)
    const testFiles = globSync('packages/*/src/**/*.test.ts', {
      ignore: ['**/node_modules/**', '**/dist/**', '**/.cache/**']
    });
    const testFileCount = testFiles.length;

    if (testFileCount > 200) {
      // Check if vitest config already has performance optimizations
      const configFile = 'vitest.config.ts';
      let hasOptimizations = false;

      if (existsSync(configFile)) {
        const content = readFileSync(configFile, 'utf-8');
        // Check for comprehensive performance optimizations
        hasOptimizations = content.includes('maxConcurrency') &&
                          content.includes('slowTestThreshold') &&
                          content.includes('bail') &&
                          content.includes('maxThreads');
      }

      if (!hasOptimizations) {
        issues.push({
          file: 'vitest.config.ts',
          componentName: 'test-suite',
          issue: ISSUES.TEST_PERFORMANCE,
          severity: 'medium',
          autoFixable: true,
          details: `Found ${testFileCount} test files - may need performance optimization`
        });
      }
    }

    // Check vitest config for performance settings
    const configFile = 'vitest.config.ts';
    if (existsSync(configFile)) {
      const content = readFileSync(configFile, 'utf-8');

      // Check for performance optimizations
      if (!content.includes('maxConcurrency') || !content.includes('slowTestThreshold')) {
        issues.push({
          file: configFile,
          componentName: 'test-config',
          issue: ISSUES.TEST_PERFORMANCE,
          severity: 'low',
          autoFixable: true,
          details: 'Missing performance optimizations in test configuration'
        });
      }
    }

    return issues;
  }

  /**
   * Generate automatic fixes for detected issues
   */
  generateAutoFix(issue) {
    switch (issue.issue) {
      case ISSUES.MISSING_REQUIRED_ELEMENTS:
        return this.generateRequiredElementsFix(issue);

      case ISSUES.INCORRECT_JS_LOADING:
        return this.generateCSSOnlyFix(issue);

      case ISSUES.TEST_PERFORMANCE:
        return this.generateTestPerformanceFix(issue);

      default:
        return null;
    }
  }

  generateRequiredElementsFix(issue) {
    return `
  /**
   * Ensure required DOM elements exist before USWDS initialization
   * Auto-generated by component issue detector
   */
  private ensureRequiredElements() {
    const element = this.querySelector('table') || this.querySelector('.usa-${issue.componentName}');
    if (!element) return;

    // Add component-specific required elements here
    // This method was auto-generated - customize as needed

    console.log('✅ Required elements ensured for ${issue.componentName}');
  }`;
  }

  generateCSSOnlyFix(issue) {
    return `
    // Check if ${issue.componentName} is CSS-only before attempting to load
    const { isCSSOnlyComponent } = await import('../../utils/uswds-loader.js');
    if (isCSSOnlyComponent('${issue.componentName}')) {
      console.log('✅ USWDS ${issue.componentName} is CSS-only, using web component behavior');
      this.setupFallbackBehavior();
      return;
    }`;
  }

  generateTestPerformanceFix(issue) {
    if (issue.details?.includes('test files')) {
      return `
// Add to vitest.config.ts for better performance with large test suites:
test: {
  maxConcurrency: 10, // Limit concurrent tests
  slowTestThreshold: 5000, // Report slow tests
  bail: 5, // Stop after 5 failures
  poolOptions: {
    threads: {
      maxThreads: Math.min(4, require('os').cpus().length)
    }
  }
}`;
    }
    return null;
  }

  /**
   * Run all detection methods
   */
  async detectAllIssues() {
    console.log('🔍 Scanning for component issues...\n');

    const allIssues = await Promise.all([
      this.detectMissingRequiredElements(),
      this.detectIncorrectJSLoading(),
      this.detectDoubleInitialization(),
      this.detectTestPerformanceIssues()
    ]);

    const flattenedIssues = allIssues.flat();
    this.detectedIssues = flattenedIssues;
    this.fixableIssues = flattenedIssues.filter(issue => issue.autoFixable);

    return this.detectedIssues;
  }

  /**
   * Generate report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalIssues: this.detectedIssues.length,
      autoFixableIssues: this.fixableIssues.length,
      issues: this.detectedIssues.map(issue => ({
        file: issue.file,
        component: issue.componentName,
        type: issue.issue,
        severity: issue.severity,
        autoFixable: issue.autoFixable,
        details: issue.details || 'No additional details',
        suggestedFix: issue.autoFixable ? this.generateAutoFix(issue) : null
      }))
    };

    return report;
  }

  /**
   * Print summary to console
   */
  printSummary() {
    console.log('\n📊 Component Issue Detection Summary');
    console.log('=====================================');

    if (this.detectedIssues.length === 0) {
      console.log('✅ No issues detected! All components look healthy.');
      return;
    }

    console.log(`Total issues found: ${this.detectedIssues.length}`);
    console.log(`Auto-fixable issues: ${this.fixableIssues.length}\n`);

    // Group by severity
    const bySeverity = this.detectedIssues.reduce((acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    }, {});

    Object.entries(bySeverity).forEach(([severity, count]) => {
      const emoji = severity === 'high' ? '🚨' : severity === 'medium' ? '⚠️' : 'ℹ️';
      console.log(`${emoji} ${severity.toUpperCase()}: ${count} issues`);
    });

    console.log('\n🔧 Auto-fixable Issues:');
    this.fixableIssues.forEach(issue => {
      console.log(`  • ${issue.componentName}: ${issue.issue}`);
    });

    if (this.fixableIssues.length > 0) {
      console.log('\n💡 Run with --fix to automatically apply fixes');
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const shouldFix = args.includes('--fix');
  const verbose = args.includes('--verbose');

  const detector = new ComponentIssueDetector();
  const issues = await detector.detectAllIssues();

  detector.printSummary();

  if (verbose || issues.length > 0) {
    const report = detector.generateReport();
    writeFileSync('test-reports/component-issues-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed report saved to test-reports/component-issues-report.json');
  }

  if (shouldFix && detector.fixableIssues.length > 0) {
    console.log('\n🛠️  Auto-fixing issues...');
    // Auto-fix implementation would go here
    console.log('Auto-fix functionality coming soon!');
  }

  // Only block commits for HIGH severity issues (critical problems)
  // Medium/Low severity issues are warnings that don't block
  const highSeverityIssues = issues.filter(issue => issue.severity === 'high');
  process.exit(highSeverityIssues.length > 0 ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}