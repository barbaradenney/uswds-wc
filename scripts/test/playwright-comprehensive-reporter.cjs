/**
 * Comprehensive Playwright Reporter for USWDS Web Components
 *
 * This custom reporter integrates with our comprehensive testing infrastructure
 * to provide detailed reporting across all test categories.
 */

const fs = require('fs');
const path = require('path');

class ComprehensiveReporter {
  constructor(options = {}) {
    this.options = {
      outputFile: './test-reports/comprehensive-playwright-report.json',
      includeAttachments: true,
      categorizeTests: true,
      generateMetrics: true,
      ...options
    };

    this.results = {
      metadata: {
        startTime: Date.now(),
        endTime: null,
        totalDuration: 0,
        reporterVersion: '1.0.0'
      },
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        flaky: 0
      },
      categories: {},
      projects: {},
      tests: [],
      errors: [],
      performance: {
        slowestTests: [],
        fastestTests: [],
        averageDuration: 0
      },
      accessibility: {
        violations: [],
        summary: {
          critical: 0,
          serious: 0,
          moderate: 0,
          minor: 0
        }
      },
      security: {
        vulnerabilities: [],
        warnings: []
      },
      coverage: {
        byCategory: {},
        overall: null
      }
    };

    this.testCategories = {
      'accessibility': { name: 'Accessibility', priority: 'critical' },
      'performance': { name: 'Performance', priority: 'high' },
      'security': { name: 'Security', priority: 'critical' },
      'progressive-enhancement': { name: 'Progressive Enhancement', priority: 'medium' },
      'error-recovery': { name: 'Error Recovery', priority: 'medium' },
      'api-contracts': { name: 'API Contracts', priority: 'medium' },
      'cross-browser': { name: 'Cross-Browser', priority: 'high' },
      'integration': { name: 'Integration', priority: 'high' },
      'visual': { name: 'Visual Regression', priority: 'medium' }
    };
  }

  onBegin(config, suite) {
    console.log(`🧪 Starting comprehensive test run with ${suite.allTests().length} tests`);

    this.results.metadata.startTime = Date.now();
    this.results.metadata.configuration = {
      workers: config.workers,
      timeout: config.timeout,
      retries: config.retries,
      reporter: config.reporter?.map(r => Array.isArray(r) ? r[0] : r)
    };

    // Initialize project tracking
    config.projects.forEach(project => {
      this.results.projects[project.name] = {
        name: project.name,
        tests: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0
      };
    });

    // Initialize category tracking
    Object.keys(this.testCategories).forEach(category => {
      this.results.categories[category] = {
        ...this.testCategories[category],
        tests: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0,
        issues: []
      };
    });
  }

  onTestBegin(test) {
    // Track test start time for performance metrics
    test._startTime = Date.now();
  }

  onTestEnd(test, result) {
    const duration = Date.now() - test._startTime;
    const category = this.categorizeTest(test);
    const projectName = test.parent.project().name;

    // Update summary
    this.results.summary.total++;
    this.results.summary[result.status]++;

    // Update project stats
    if (this.results.projects[projectName]) {
      this.results.projects[projectName].tests++;
      this.results.projects[projectName][result.status]++;
      this.results.projects[projectName].duration += duration;
    }

    // Update category stats
    if (category && this.results.categories[category]) {
      this.results.categories[category].tests++;
      this.results.categories[category][result.status]++;
      this.results.categories[category].duration += duration;
    }

    // Store test result
    const testResult = {
      title: test.title,
      file: test.location.file,
      line: test.location.line,
      project: projectName,
      category,
      status: result.status,
      duration,
      retry: result.retry,
      error: result.error ? {
        message: result.error.message,
        stack: result.error.stack
      } : null,
      attachments: this.options.includeAttachments ?
        result.attachments.map(att => ({
          name: att.name,
          contentType: att.contentType,
          path: att.path
        })) : [],
      annotations: test.annotations
    };

    this.results.tests.push(testResult);

    // Process test-specific data
    this.processTestResult(test, result, testResult);

    // Track performance metrics
    this.updatePerformanceMetrics(testResult);
  }

  onError(error) {
    this.results.errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: Date.now()
    });

    console.error('❌ Test runner error:', error.message);
  }

  onEnd(result) {
    this.results.metadata.endTime = Date.now();
    this.results.metadata.totalDuration = this.results.metadata.endTime - this.results.metadata.startTime;

    // Calculate final metrics
    this.calculateFinalMetrics();

    // Generate comprehensive report
    this.generateReport();

    // Log summary to console
    this.logSummary();
  }

  categorizeTest(test) {
    const filePath = test.location.file;

    // Extract category from file path
    for (const [category, info] of Object.entries(this.testCategories)) {
      if (filePath.includes(`/${category}/`) || filePath.includes(`\\${category}\\`)) {
        return category;
      }
    }

    // Fallback categorization based on test title or annotations
    const title = test.title.toLowerCase();
    if (title.includes('accessibility') || title.includes('a11y')) return 'accessibility';
    if (title.includes('performance') || title.includes('speed')) return 'performance';
    if (title.includes('security') || title.includes('xss') || title.includes('csrf')) return 'security';
    if (title.includes('browser') || title.includes('chrome') || title.includes('firefox')) return 'cross-browser';
    if (title.includes('api') || title.includes('contract')) return 'api-contracts';
    if (title.includes('error') || title.includes('recovery')) return 'error-recovery';
    if (title.includes('enhancement') || title.includes('progressive')) return 'progressive-enhancement';

    return 'integration'; // Default category
  }

  processTestResult(test, result, testResult) {
    // Process accessibility-specific data
    if (testResult.category === 'accessibility') {
      this.processAccessibilityResult(result, testResult);
    }

    // Process security-specific data
    if (testResult.category === 'security') {
      this.processSecurityResult(result, testResult);
    }

    // Process performance-specific data
    if (testResult.category === 'performance') {
      this.processPerformanceResult(result, testResult);
    }

    // Process errors and failures
    if (result.status === 'failed' && result.error) {
      this.processErrorResult(result, testResult);
    }
  }

  processAccessibilityResult(result, testResult) {
    // Look for axe-core violations in test attachments or output
    result.attachments.forEach(attachment => {
      if (attachment.name.includes('accessibility') || attachment.name.includes('axe')) {
        try {
          if (attachment.body) {
            const data = JSON.parse(attachment.body.toString());
            if (data.violations && Array.isArray(data.violations)) {
              data.violations.forEach(violation => {
                this.results.accessibility.violations.push({
                  ...violation,
                  test: testResult.title,
                  file: testResult.file
                });

                // Update summary counts
                const impact = violation.impact || 'minor';
                if (this.results.accessibility.summary[impact] !== undefined) {
                  this.results.accessibility.summary[impact]++;
                }
              });
            }
          }
        } catch (error) {
          // Ignore parsing errors
        }
      }
    });
  }

  processSecurityResult(result, testResult) {
    // Look for security violations in test output
    if (result.error && result.error.message) {
      const message = result.error.message.toLowerCase();
      if (message.includes('xss') || message.includes('injection') || message.includes('vulnerability')) {
        this.results.security.vulnerabilities.push({
          test: testResult.title,
          file: testResult.file,
          message: result.error.message,
          severity: message.includes('critical') ? 'critical' : 'warning'
        });
      }
    }
  }

  processPerformanceResult(result, testResult) {
    // Track performance-specific metrics
    if (testResult.duration > 10000) { // 10+ seconds
      this.results.categories.performance.issues.push({
        test: testResult.title,
        issue: 'slow_test',
        duration: testResult.duration,
        threshold: 10000
      });
    }
  }

  processErrorResult(result, testResult) {
    const error = result.error;
    const category = testResult.category;

    // Categorize error for better reporting
    let errorType = 'unknown';
    if (error.message.includes('timeout')) errorType = 'timeout';
    else if (error.message.includes('selector')) errorType = 'selector';
    else if (error.message.includes('navigation')) errorType = 'navigation';
    else if (error.message.includes('assertion')) errorType = 'assertion';

    if (this.results.categories[category]) {
      this.results.categories[category].issues.push({
        test: testResult.title,
        type: errorType,
        message: error.message,
        line: testResult.line
      });
    }
  }

  updatePerformanceMetrics(testResult) {
    const duration = testResult.duration;

    // Track slowest tests
    this.results.performance.slowestTests.push(testResult);
    this.results.performance.slowestTests.sort((a, b) => b.duration - a.duration);
    this.results.performance.slowestTests = this.results.performance.slowestTests.slice(0, 10);

    // Track fastest tests (only successful ones)
    if (testResult.status === 'passed') {
      this.results.performance.fastestTests.push(testResult);
      this.results.performance.fastestTests.sort((a, b) => a.duration - b.duration);
      this.results.performance.fastestTests = this.results.performance.fastestTests.slice(0, 10);
    }
  }

  calculateFinalMetrics() {
    // Calculate average test duration
    const totalDuration = this.results.tests.reduce((sum, test) => sum + test.duration, 0);
    this.results.performance.averageDuration = Math.round(totalDuration / this.results.tests.length);

    // Calculate category coverage
    Object.keys(this.results.categories).forEach(category => {
      const categoryData = this.results.categories[category];
      if (categoryData.tests > 0) {
        categoryData.passRate = Math.round((categoryData.passed / categoryData.tests) * 100);
        categoryData.averageDuration = Math.round(categoryData.duration / categoryData.tests);
      }
    });

    // Calculate project success rates
    Object.keys(this.results.projects).forEach(project => {
      const projectData = this.results.projects[project];
      if (projectData.tests > 0) {
        projectData.passRate = Math.round((projectData.passed / projectData.tests) * 100);
        projectData.averageDuration = Math.round(projectData.duration / projectData.tests);
      }
    });

    // Calculate flaky test rate
    const flakyTests = this.results.tests.filter(test => test.retry > 0);
    this.results.summary.flaky = flakyTests.length;
    this.results.summary.flakyRate = Math.round((flakyTests.length / this.results.tests.length) * 100);
  }

  generateReport() {
    // Ensure output directory exists
    const outputDir = path.dirname(this.options.outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write comprehensive JSON report
    fs.writeFileSync(this.options.outputFile, JSON.stringify(this.results, null, 2));

    // Generate category-specific reports
    Object.keys(this.results.categories).forEach(category => {
      const categoryData = this.results.categories[category];
      const categoryTests = this.results.tests.filter(test => test.category === category);

      const categoryReport = {
        category: categoryData.name,
        priority: categoryData.priority,
        summary: {
          tests: categoryData.tests,
          passed: categoryData.passed,
          failed: categoryData.failed,
          passRate: categoryData.passRate,
          averageDuration: categoryData.averageDuration
        },
        tests: categoryTests,
        issues: categoryData.issues
      };

      const categoryFile = path.join(outputDir, `${category}-report.json`);
      fs.writeFileSync(categoryFile, JSON.stringify(categoryReport, null, 2));
    });

    // Generate accessibility-specific report if we have violations
    if (this.results.accessibility.violations.length > 0) {
      const a11yReport = {
        summary: this.results.accessibility.summary,
        violations: this.results.accessibility.violations,
        recommendations: this.generateA11yRecommendations()
      };

      fs.writeFileSync(
        path.join(outputDir, 'accessibility-violations.json'),
        JSON.stringify(a11yReport, null, 2)
      );
    }
  }

  generateA11yRecommendations() {
    const recommendations = [];
    const violations = this.results.accessibility.violations;

    // Group violations by impact
    const criticalViolations = violations.filter(v => v.impact === 'critical');
    const seriousViolations = violations.filter(v => v.impact === 'serious');

    if (criticalViolations.length > 0) {
      recommendations.push('Address critical accessibility violations immediately - these prevent users from accessing content');
    }

    if (seriousViolations.length > 0) {
      recommendations.push('Fix serious accessibility issues - these significantly impact user experience');
    }

    // Common violation types
    const commonViolations = {};
    violations.forEach(v => {
      commonViolations[v.id] = (commonViolations[v.id] || 0) + 1;
    });

    const mostCommon = Object.entries(commonViolations)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    if (mostCommon.length > 0) {
      recommendations.push(`Most common violations: ${mostCommon.map(([id, count]) => `${id} (${count})`).join(', ')}`);
    }

    return recommendations;
  }

  logSummary() {
    const { summary, metadata } = this.results;
    const durationSeconds = (metadata.totalDuration / 1000).toFixed(1);

    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE TEST RESULTS');
    console.log('='.repeat(80));

    console.log(`⏱️  Duration: ${durationSeconds}s`);
    console.log(`📋 Tests: ${summary.total} total`);
    console.log(`✅ Passed: ${summary.passed} (${Math.round((summary.passed / summary.total) * 100)}%)`);
    console.log(`❌ Failed: ${summary.failed} (${Math.round((summary.failed / summary.total) * 100)}%)`);

    if (summary.skipped > 0) {
      console.log(`⏭️  Skipped: ${summary.skipped} (${Math.round((summary.skipped / summary.total) * 100)}%)`);
    }

    if (summary.flaky > 0) {
      console.log(`🔄 Flaky: ${summary.flaky} (${summary.flakyRate}%)`);
    }

    // Category breakdown
    console.log('\n📈 Results by Category:');
    Object.entries(this.results.categories).forEach(([key, category]) => {
      if (category.tests > 0) {
        const status = category.failed === 0 ? '✅' : '❌';
        console.log(`   ${status} ${category.name}: ${category.passed}/${category.tests} (${category.passRate}%)`);
      }
    });

    // Critical issues
    const criticalA11y = this.results.accessibility.summary.critical;
    const securityVulns = this.results.security.vulnerabilities.length;

    if (criticalA11y > 0 || securityVulns > 0) {
      console.log('\n🚨 Critical Issues:');
      if (criticalA11y > 0) {
        console.log(`   ♿ ${criticalA11y} critical accessibility violations`);
      }
      if (securityVulns > 0) {
        console.log(`   🔒 ${securityVulns} security vulnerabilities`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log(`📄 Detailed report: ${this.options.outputFile}`);
    console.log('='.repeat(80) + '\n');
  }
}

module.exports = ComprehensiveReporter;