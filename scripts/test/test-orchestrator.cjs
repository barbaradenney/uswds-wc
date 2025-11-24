#!/usr/bin/env node

/**
 * Comprehensive Test Orchestrator for USWDS Web Components
 *
 * This script coordinates all testing types and provides unified reporting
 * across unit tests, integration tests, accessibility tests, performance tests,
 * security tests, and visual regression tests.
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// ANSI color codes for better console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

class TestOrchestrator {
  constructor(options = {}) {
    this.options = {
      parallel: true,
      failFast: false,
      verbose: false,
      outputFormat: 'console', // console, json, html
      reportPath: './test-reports',
      includeCoverage: true,
      includePerformance: true,
      includeSecurity: true,
      includeAccessibility: true,
      includeVisual: false, // Requires Chromatic token
      includeCrossBrowser: true,
      ...options
    };

    this.results = {
      startTime: Date.now(),
      endTime: null,
      totalDuration: 0,
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        warnings: 0
      },
      suites: {},
      errors: [],
      warnings: []
    };

    this.testSuites = [
      {
        name: 'Unit Tests',
        command: 'npm',
        args: ['run', 'test'],
        category: 'core',
        timeout: 120000, // 2 minutes
        required: true,
        parallel: true
      },
      {
        name: 'Type Checking',
        command: 'npm',
        args: ['run', 'typecheck'],
        category: 'core',
        timeout: 60000,
        required: true,
        parallel: true
      },
      {
        name: 'Linting',
        command: 'npm',
        args: ['run', 'lint'],
        category: 'core',
        timeout: 30000,
        required: true,
        parallel: true
      },
      {
        name: 'Storybook Tests',
        command: 'npm',
        args: ['run', 'test:storybook:ci'],
        category: 'integration',
        timeout: 300000, // 5 minutes
        required: true,
        parallel: false,
        prereq: 'storybook'
      },
      {
        name: 'Accessibility Tests',
        command: 'npx',
        args: ['playwright', 'test', 'tests/accessibility/', '--reporter=json'],
        category: 'accessibility',
        timeout: 180000, // 3 minutes
        required: this.options.includeAccessibility,
        parallel: true
      },
      {
        name: 'Performance Tests',
        command: 'npx',
        args: ['playwright', 'test', 'tests/performance/', '--reporter=json'],
        category: 'performance',
        timeout: 300000, // 5 minutes
        required: this.options.includePerformance,
        parallel: false
      },
      {
        name: 'Security Tests',
        command: 'npx',
        args: ['playwright', 'test', 'tests/security/', '--reporter=json'],
        category: 'security',
        timeout: 180000, // 3 minutes
        required: this.options.includeSecurity,
        parallel: true
      },
      {
        name: 'Progressive Enhancement Tests',
        command: 'npx',
        args: ['playwright', 'test', 'tests/progressive-enhancement/', '--reporter=json'],
        category: 'enhancement',
        timeout: 240000, // 4 minutes
        required: true,
        parallel: true
      },
      {
        name: 'Error Recovery Tests',
        command: 'npx',
        args: ['playwright', 'test', 'tests/error-recovery/', '--reporter=json'],
        category: 'robustness',
        timeout: 180000, // 3 minutes
        required: true,
        parallel: true
      },
      {
        name: 'API Contract Tests',
        command: 'npx',
        args: ['playwright', 'test', 'tests/api-contracts/', '--reporter=json'],
        category: 'contracts',
        timeout: 120000, // 2 minutes
        required: true,
        parallel: true
      },
      {
        name: 'Cross-Browser Tests',
        command: 'npx',
        args: ['playwright', 'test', 'tests/cross-browser/', '--reporter=json'],
        category: 'compatibility',
        timeout: 600000, // 10 minutes
        required: this.options.includeCrossBrowser,
        parallel: false
      },
      {
        name: 'Visual Regression Tests',
        command: 'npx',
        args: ['chromatic', '--exit-zero-on-changes', '--junit-report'],
        category: 'visual',
        timeout: 600000, // 10 minutes
        required: this.options.includeVisual,
        parallel: false,
        env: { CHROMATIC_PROJECT_TOKEN: process.env.CHROMATIC_PROJECT_TOKEN }
      }
    ];
  }

  log(message, color = 'reset', prefix = '') {
    const timestamp = new Date().toISOString().substr(11, 8);
    const colorCode = colors[color] || colors.reset;
    console.log(`${colors.dim}[${timestamp}]${colors.reset} ${prefix}${colorCode}${message}${colors.reset}`);
  }

  logError(message, error = null) {
    this.log(`❌ ${message}`, 'red', '');
    if (error && this.options.verbose) {
      console.error(error);
    }
    this.results.errors.push({ message, error: error?.message, timestamp: Date.now() });
  }

  logWarning(message) {
    this.log(`⚠️  ${message}`, 'yellow', '');
    this.results.warnings.push({ message, timestamp: Date.now() });
  }

  logSuccess(message) {
    this.log(`✅ ${message}`, 'green', '');
  }

  logInfo(message) {
    this.log(`ℹ️  ${message}`, 'blue', '');
  }

  async ensureDirectories() {
    const dirs = [
      this.options.reportPath,
      path.join(this.options.reportPath, 'coverage'),
      path.join(this.options.reportPath, 'accessibility'),
      path.join(this.options.reportPath, 'performance'),
      path.join(this.options.reportPath, 'security'),
      path.join(this.options.reportPath, 'visual')
    ];

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        this.log(`Created directory: ${dir}`, 'dim');
      }
    }
  }

  async checkPrerequisites() {
    this.log('🔍 Checking prerequisites...', 'cyan', '');

    // Check if Storybook is needed and running
    const storybookTests = this.testSuites.filter(suite => suite.prereq === 'storybook');
    if (storybookTests.length > 0) {
      try {
        // Try to connect to Storybook on default port
        const response = await fetch('http://localhost:6006/iframe.html');
        if (!response.ok) {
          throw new Error('Storybook not accessible');
        }
        this.logSuccess('Storybook is running and accessible');
      } catch (error) {
        this.logWarning('Storybook not accessible - starting it now...');
        await this.startStorybook();
      }
    }

    // Check for required environment variables
    if (this.options.includeVisual && !process.env.CHROMATIC_PROJECT_TOKEN) {
      this.logWarning('CHROMATIC_PROJECT_TOKEN not set - visual tests will be skipped');
      this.testSuites = this.testSuites.map(suite =>
        suite.category === 'visual' ? { ...suite, required: false } : suite
      );
    }

    // Check for Playwright browsers
    try {
      execSync('npx playwright --version', { stdio: 'pipe' });
      this.logSuccess('Playwright is available');
    } catch (error) {
      this.logError('Playwright not found - installing browsers...');
      try {
        execSync('npx playwright install', { stdio: 'inherit' });
        this.logSuccess('Playwright browsers installed');
      } catch (installError) {
        this.logError('Failed to install Playwright browsers', installError);
        return false;
      }
    }

    return true;
  }

  async startStorybook() {
    return new Promise((resolve, reject) => {
      this.log('🚀 Starting Storybook...', 'cyan');

      const storybook = spawn('npm', ['run', 'storybook'], {
        stdio: 'pipe',
        detached: true
      });

      let startupTimeout;
      let checkInterval;

      const cleanup = () => {
        clearTimeout(startupTimeout);
        clearInterval(checkInterval);
      };

      startupTimeout = setTimeout(() => {
        cleanup();
        storybook.kill();
        reject(new Error('Storybook startup timeout'));
      }, 120000); // 2 minutes timeout

      // Check if Storybook is ready
      checkInterval = setInterval(async () => {
        try {
          const response = await fetch('http://localhost:6006/iframe.html');
          if (response.ok) {
            cleanup();
            this.logSuccess('Storybook started successfully');
            // Store the process to kill it later
            this.storybookProcess = storybook;
            resolve();
          }
        } catch (error) {
          // Still starting up...
        }
      }, 2000);

      storybook.on('error', (error) => {
        cleanup();
        reject(error);
      });
    });
  }

  async runTestSuite(suite) {
    const startTime = Date.now();
    this.log(`🧪 Running ${suite.name}...`, 'blue');

    return new Promise((resolve) => {
      const env = { ...process.env, ...suite.env };
      const child = spawn(suite.command, suite.args, {
        stdio: 'pipe',
        env
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
        if (this.options.verbose) {
          process.stdout.write(data);
        }
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
        if (this.options.verbose) {
          process.stderr.write(data);
        }
      });

      const timeout = setTimeout(() => {
        child.kill('SIGKILL');
        this.logError(`${suite.name} timed out after ${suite.timeout}ms`);
        resolve({
          name: suite.name,
          category: suite.category,
          success: false,
          duration: Date.now() - startTime,
          error: 'Timeout',
          stdout: stdout.slice(-1000), // Last 1000 chars
          stderr: stderr.slice(-1000)
        });
      }, suite.timeout);

      child.on('close', (code) => {
        clearTimeout(timeout);
        const duration = Date.now() - startTime;
        const success = code === 0;

        if (success) {
          this.logSuccess(`${suite.name} completed in ${duration}ms`);
        } else {
          this.logError(`${suite.name} failed with exit code ${code}`);
        }

        // Parse results if JSON output
        let results = null;
        if (suite.args.includes('--reporter=json') && success) {
          try {
            const jsonOutput = stdout.split('\n').find(line => line.trim().startsWith('{'));
            if (jsonOutput) {
              results = JSON.parse(jsonOutput);
            }
          } catch (error) {
            this.logWarning(`Failed to parse JSON output from ${suite.name}`);
          }
        }

        resolve({
          name: suite.name,
          category: suite.category,
          success,
          duration,
          exitCode: code,
          stdout: success ? stdout.slice(-500) : stdout.slice(-1000),
          stderr: stderr.slice(-1000),
          results
        });
      });
    });
  }

  async runAllTests() {
    this.log(`🚀 Starting comprehensive test suite...`, 'bold', '');
    this.log(`📊 Test configuration:`, 'cyan');
    this.log(`   - Parallel execution: ${this.options.parallel}`, 'dim');
    this.log(`   - Fail fast: ${this.options.failFast}`, 'dim');
    this.log(`   - Include coverage: ${this.options.includeCoverage}`, 'dim');
    this.log(`   - Include visual tests: ${this.options.includeVisual}`, 'dim');

    // Ensure directories exist
    await this.ensureDirectories();

    // Check prerequisites
    const prereqsOk = await this.checkPrerequisites();
    if (!prereqsOk) {
      this.logError('Prerequisites check failed');
      return this.generateReport();
    }

    // Filter required test suites
    const requiredSuites = this.testSuites.filter(suite => suite.required);
    const skippedSuites = this.testSuites.filter(suite => !suite.required);

    if (skippedSuites.length > 0) {
      this.log(`⏭️  Skipping ${skippedSuites.length} optional test suites`, 'yellow');
      skippedSuites.forEach(suite => {
        this.log(`   - ${suite.name}`, 'dim');
        this.results.summary.skipped++;
      });
    }

    this.log(`🎯 Running ${requiredSuites.length} test suites...`, 'bold');

    // Group tests by parallel capability
    const parallelSuites = requiredSuites.filter(suite => suite.parallel && this.options.parallel);
    const sequentialSuites = requiredSuites.filter(suite => !suite.parallel || !this.options.parallel);

    let allResults = [];

    // Run parallel tests
    if (parallelSuites.length > 0) {
      this.log(`⚡ Running ${parallelSuites.length} tests in parallel...`, 'cyan');
      const parallelPromises = parallelSuites.map(suite => this.runTestSuite(suite));
      const parallelResults = await Promise.all(parallelPromises);
      allResults.push(...parallelResults);

      // Check for failures in parallel tests
      const parallelFailures = parallelResults.filter(result => !result.success);
      if (parallelFailures.length > 0 && this.options.failFast) {
        this.logError(`${parallelFailures.length} parallel tests failed - stopping due to fail-fast mode`);
        this.results.suites = Object.fromEntries(allResults.map(r => [r.name, r]));
        return this.generateReport();
      }
    }

    // Run sequential tests
    if (sequentialSuites.length > 0) {
      this.log(`🔄 Running ${sequentialSuites.length} tests sequentially...`, 'cyan');
      for (const suite of sequentialSuites) {
        const result = await this.runTestSuite(suite);
        allResults.push(result);

        if (!result.success && this.options.failFast) {
          this.logError(`${suite.name} failed - stopping due to fail-fast mode`);
          break;
        }
      }
    }

    // Store all results
    this.results.suites = Object.fromEntries(allResults.map(r => [r.name, r]));

    // Calculate summary
    this.results.summary.total = allResults.length + skippedSuites.length;
    this.results.summary.passed = allResults.filter(r => r.success).length;
    this.results.summary.failed = allResults.filter(r => !r.success).length;

    this.results.endTime = Date.now();
    this.results.totalDuration = this.results.endTime - this.results.startTime;

    return this.generateReport();
  }

  async generateReport() {
    this.log(`📊 Generating test report...`, 'cyan');

    const report = {
      ...this.results,
      environment: {
        node: process.version,
        platform: os.platform(),
        arch: os.arch(),
        ci: !!process.env.CI,
        timestamp: new Date().toISOString()
      },
      configuration: this.options
    };

    // Save JSON report
    const jsonReportPath = path.join(this.options.reportPath, 'comprehensive-test-report.json');
    fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));

    // Generate console summary
    this.generateConsoleSummary(report);

    // Generate HTML report if requested
    if (this.options.outputFormat === 'html') {
      await this.generateHTMLReport(report);
    }

    // Cleanup
    if (this.storybookProcess) {
      this.log('🛑 Stopping Storybook...', 'dim');
      this.storybookProcess.kill();
    }

    return report;
  }

  generateConsoleSummary(report) {
    this.log(`\n${'='.repeat(80)}`, 'bold');
    this.log(`📋 COMPREHENSIVE TEST SUMMARY`, 'bold', '');
    this.log(`${'='.repeat(80)}`, 'bold');

    const { summary, totalDuration } = report;
    const durationSeconds = (totalDuration / 1000).toFixed(1);

    // Overall summary
    this.log(`\n⏱️  Total Duration: ${durationSeconds}s`, 'cyan');
    this.log(`📊 Test Results:`, 'cyan');
    this.log(`   ✅ Passed: ${summary.passed}`, summary.passed > 0 ? 'green' : 'dim');
    this.log(`   ❌ Failed: ${summary.failed}`, summary.failed > 0 ? 'red' : 'dim');
    this.log(`   ⏭️  Skipped: ${summary.skipped}`, summary.skipped > 0 ? 'yellow' : 'dim');
    this.log(`   ⚠️  Warnings: ${this.results.warnings.length}`, this.results.warnings.length > 0 ? 'yellow' : 'dim');

    // Category breakdown
    const categories = {};
    Object.values(report.suites).forEach(suite => {
      if (!categories[suite.category]) {
        categories[suite.category] = { passed: 0, failed: 0, total: 0 };
      }
      categories[suite.category].total++;
      if (suite.success) {
        categories[suite.category].passed++;
      } else {
        categories[suite.category].failed++;
      }
    });

    this.log(`\n📈 Results by Category:`, 'cyan');
    Object.entries(categories).forEach(([category, stats]) => {
      const status = stats.failed === 0 ? '✅' : '❌';
      const color = stats.failed === 0 ? 'green' : 'red';
      this.log(`   ${status} ${category}: ${stats.passed}/${stats.total}`, color);
    });

    // Failed tests detail
    const failedSuites = Object.values(report.suites).filter(suite => !suite.success);
    if (failedSuites.length > 0) {
      this.log(`\n❌ Failed Tests:`, 'red');
      failedSuites.forEach(suite => {
        this.log(`   • ${suite.name} (${suite.duration}ms)`, 'red');
        if (suite.stderr) {
          this.log(`     Error: ${suite.stderr.split('\n')[0]}`, 'dim');
        }
      });
    }

    // Warnings
    if (this.results.warnings.length > 0) {
      this.log(`\n⚠️  Warnings:`, 'yellow');
      this.results.warnings.forEach(warning => {
        this.log(`   • ${warning.message}`, 'yellow');
      });
    }

    // Success message or failure
    this.log(`\n${'='.repeat(80)}`, 'bold');
    if (summary.failed === 0) {
      this.log(`🎉 ALL TESTS PASSED! (${summary.passed}/${summary.total})`, 'green', '');
    } else {
      this.log(`💥 ${summary.failed} TEST(S) FAILED (${summary.passed}/${summary.total} passed)`, 'red', '');
    }
    this.log(`${'='.repeat(80)}`, 'bold');

    this.log(`\n📄 Detailed report saved to: ${path.join(this.options.reportPath, 'comprehensive-test-report.json')}`, 'dim');
  }

  async generateHTMLReport(report) {
    const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>USWDS Web Components - Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background: #005ea2; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #f8f9fa; border-radius: 6px; padding: 20px; text-align: center; border-left: 4px solid #005ea2; }
        .stat-card.success { border-left-color: #00a91c; }
        .stat-card.error { border-left-color: #d63384; }
        .stat-card.warning { border-left-color: #ffb700; }
        .test-grid { display: grid; gap: 15px; }
        .test-suite { background: #f8f9fa; border-radius: 6px; padding: 15px; border-left: 4px solid #005ea2; }
        .test-suite.success { border-left-color: #00a91c; }
        .test-suite.failed { border-left-color: #d63384; }
        .test-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .test-name { font-weight: 600; font-size: 16px; }
        .test-duration { font-size: 14px; color: #666; }
        .test-category { display: inline-block; background: #005ea2; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-bottom: 10px; }
        .error-details { background: #fff5f5; border: 1px solid #fed7d7; border-radius: 4px; padding: 10px; margin-top: 10px; font-family: monospace; font-size: 12px; color: #c53030; }
        .timestamp { color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 USWDS Web Components - Comprehensive Test Report</h1>
            <p class="timestamp">Generated on ${new Date(report.environment.timestamp).toLocaleString()}</p>
        </div>
        <div class="content">
            <div class="summary">
                <div class="stat-card success">
                    <h3>✅ Passed</h3>
                    <div style="font-size: 2em; font-weight: bold;">${report.summary.passed}</div>
                </div>
                <div class="stat-card error">
                    <h3>❌ Failed</h3>
                    <div style="font-size: 2em; font-weight: bold;">${report.summary.failed}</div>
                </div>
                <div class="stat-card warning">
                    <h3>⏭️ Skipped</h3>
                    <div style="font-size: 2em; font-weight: bold;">${report.summary.skipped}</div>
                </div>
                <div class="stat-card">
                    <h3>⏱️ Duration</h3>
                    <div style="font-size: 1.5em; font-weight: bold;">${(report.totalDuration / 1000).toFixed(1)}s</div>
                </div>
            </div>

            <h2>📊 Test Results</h2>
            <div class="test-grid">
                ${Object.values(report.suites).map(suite => `
                    <div class="test-suite ${suite.success ? 'success' : 'failed'}">
                        <div class="test-header">
                            <div class="test-name">${suite.success ? '✅' : '❌'} ${suite.name}</div>
                            <div class="test-duration">${suite.duration}ms</div>
                        </div>
                        <div class="test-category">${suite.category}</div>
                        ${!suite.success && suite.stderr ? `
                            <div class="error-details">
                                <strong>Error:</strong><br>
                                ${suite.stderr.split('\n').slice(0, 3).join('<br>')}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    </div>
</body>
</html>`;

    const htmlReportPath = path.join(this.options.reportPath, 'comprehensive-test-report.html');
    fs.writeFileSync(htmlReportPath, htmlTemplate);
    this.log(`📄 HTML report saved to: ${htmlReportPath}`, 'dim');
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--no-parallel':
        options.parallel = false;
        break;
      case '--fail-fast':
        options.failFast = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--html':
        options.outputFormat = 'html';
        break;
      case '--no-coverage':
        options.includeCoverage = false;
        break;
      case '--no-performance':
        options.includePerformance = false;
        break;
      case '--no-security':
        options.includeSecurity = false;
        break;
      case '--no-accessibility':
        options.includeAccessibility = false;
        break;
      case '--visual':
        options.includeVisual = true;
        break;
      case '--no-cross-browser':
        options.includeCrossBrowser = false;
        break;
      case '--report-path':
        options.reportPath = args[++i];
        break;
      case '--help':
        console.log(`
USWDS Web Components - Comprehensive Test Orchestrator

Usage: node scripts/test-orchestrator.js [options]

Options:
  --no-parallel         Run tests sequentially instead of in parallel
  --fail-fast          Stop on first test failure
  --verbose            Show detailed output from test runs
  --html               Generate HTML report in addition to JSON
  --no-coverage        Skip coverage reporting
  --no-performance     Skip performance tests
  --no-security        Skip security tests
  --no-accessibility   Skip accessibility tests
  --visual             Include visual regression tests (requires CHROMATIC_PROJECT_TOKEN)
  --no-cross-browser   Skip cross-browser tests
  --report-path PATH   Specify custom report output directory
  --help               Show this help message

Examples:
  npm run test:comprehensive
  node scripts/test-orchestrator.js --fail-fast --html
  node scripts/test-orchestrator.js --visual --no-performance
`);
        process.exit(0);
    }
  }

  const orchestrator = new TestOrchestrator(options);
  const report = await orchestrator.runAllTests();

  // Exit with appropriate code
  process.exit(report.summary.failed > 0 ? 1 : 0);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test orchestrator failed:', error);
    process.exit(1);
  });
}

module.exports = { TestOrchestrator };