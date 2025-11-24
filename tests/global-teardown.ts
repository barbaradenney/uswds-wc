/**
 * Global Teardown for Comprehensive Testing
 *
 * This teardown cleans up testing infrastructure and generates
 * final comprehensive reports.
 */

import fs from 'fs';
import path from 'path';
import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Cleaning up comprehensive testing environment...');

  // Read test state
  let testState: any = {};
  try {
    const stateFile = fs.readFileSync('./test-reports/test-state.json', 'utf8');
    testState = JSON.parse(stateFile);
  } catch (error) {
    console.warn('⚠️ Could not read test state file');
  }

  // Calculate total test duration
  const endTime = Date.now();
  const totalDuration = endTime - (testState.startTime || endTime);

  console.log(`⏱️ Total testing duration: ${(totalDuration / 1000).toFixed(1)}s`);

  // Stop http-server if we started it in CI
  const httpServerPidFile = '.storybook-server.pid';
  if (fs.existsSync(httpServerPidFile)) {
    try {
      const pid = fs.readFileSync(httpServerPidFile, 'utf8').trim();
      if (pid) {
        console.log('🛑 Stopping http-server...');

        // Kill the http-server process
        try {
          process.kill(parseInt(pid), 'SIGTERM');

          // Wait a bit for graceful shutdown
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Force kill if still running
          try {
            process.kill(parseInt(pid), 'SIGKILL');
          } catch (error) {
            // Process already died, which is what we want
          }

          console.log('✅ http-server stopped');
        } catch (error: any) {
          console.warn('⚠️ Could not stop http-server process:', error.message);
        }
      }

      // Remove PID file
      fs.unlinkSync(httpServerPidFile);
    } catch (error) {
      console.warn('⚠️ Error cleaning up http-server:', error);
    }
  }

  // Stop Storybook if we started it (legacy support)
  const pidFile = './test-reports/storybook.pid';
  if (fs.existsSync(pidFile)) {
    try {
      const pid = fs.readFileSync(pidFile, 'utf8').trim();
      if (pid) {
        console.log('🛑 Stopping Storybook...');

        // Kill the Storybook process
        try {
          process.kill(parseInt(pid), 'SIGTERM');

          // Wait a bit for graceful shutdown
          await new Promise(resolve => setTimeout(resolve, 3000));

          // Force kill if still running
          try {
            process.kill(parseInt(pid), 'SIGKILL');
          } catch (error) {
            // Process already died, which is what we want
          }

          console.log('✅ Storybook stopped');
        } catch (error: any) {
          console.warn('⚠️ Could not stop Storybook process:', error.message);
        }
      }

      // Remove PID file
      fs.unlinkSync(pidFile);
    } catch (error) {
      console.warn('⚠️ Error cleaning up Storybook:', error);
    }
  }

  // Generate comprehensive summary report
  console.log('📊 Generating comprehensive test summary...');

  const summaryReport = {
    metadata: {
      endTime,
      totalDuration,
      environment: testState.environment || {},
      configuration: testState.configuration || {}
    },
    performance: await collectPerformanceMetrics(),
    coverage: await collectCoverageData(),
    accessibility: await collectAccessibilityResults(),
    security: await collectSecurityResults(),
    recommendations: generateRecommendations()
  };

  // Save comprehensive summary
  fs.writeFileSync(
    './test-reports/comprehensive-summary.json',
    JSON.stringify(summaryReport, null, 2)
  );

  // Generate human-readable summary
  const readableSummary = generateReadableSummary(summaryReport);
  fs.writeFileSync('./test-reports/comprehensive-summary.md', readableSummary);

  // Cleanup temporary files
  const tempFiles = [
    './test-reports/test-state.json',
    './test-reports/performance-baseline.json',
    './test-reports/security-config.json'
  ];

  for (const file of tempFiles) {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    } catch (error) {
      console.warn(`⚠️ Could not cleanup ${file}:`, error);
    }
  }

  // Archive artifacts if in CI
  if (process.env.CI) {
    console.log('📦 Archiving test artifacts for CI...');
    await archiveArtifacts();
  }

  console.log('✅ Comprehensive testing cleanup complete');
  console.log(`📄 Summary report available at: ./test-reports/comprehensive-summary.md`);
}

async function collectPerformanceMetrics() {
  try {
    // Collect performance data from various sources
    const performanceFiles = [
      './test-reports/playwright-results.json',
      './test-reports/performance-baseline.json'
    ];

    const metrics = {
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      testFiles: []
    };

    for (const file of performanceFiles) {
      if (fs.existsSync(file)) {
        try {
          const data = JSON.parse(fs.readFileSync(file, 'utf8'));
          metrics.testFiles.push({
            file: path.basename(file),
            data
          });
        } catch (error) {
          console.warn(`⚠️ Could not parse ${file}:`, error);
        }
      }
    }

    return metrics;
  } catch (error) {
    console.warn('⚠️ Error collecting performance metrics:', error);
    return { error: error.message };
  }
}

async function collectCoverageData() {
  try {
    const coverageFiles = [
      './coverage/coverage-summary.json',
      './test-reports/coverage/coverage-final.json'
    ];

    const coverage = {
      files: [],
      summary: null
    };

    for (const file of coverageFiles) {
      if (fs.existsSync(file)) {
        try {
          const data = JSON.parse(fs.readFileSync(file, 'utf8'));
          coverage.files.push({
            file: path.basename(file),
            data
          });

          if (file.includes('summary')) {
            coverage.summary = data;
          }
        } catch (error) {
          console.warn(`⚠️ Could not parse coverage file ${file}:`, error);
        }
      }
    }

    return coverage;
  } catch (error) {
    console.warn('⚠️ Error collecting coverage data:', error);
    return { error: error.message };
  }
}

async function collectAccessibilityResults() {
  try {
    const accessibilityDir = './test-reports/accessibility';
    const results = {
      files: [],
      summary: {
        totalViolations: 0,
        criticalIssues: 0,
        warningIssues: 0
      }
    };

    if (fs.existsSync(accessibilityDir)) {
      const files = fs.readdirSync(accessibilityDir);

      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const filePath = path.join(accessibilityDir, file);
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            results.files.push({
              file,
              data
            });

            // Aggregate violations if data structure matches axe-core format
            if (data.violations && Array.isArray(data.violations)) {
              results.summary.totalViolations += data.violations.length;
              results.summary.criticalIssues += data.violations.filter(v => v.impact === 'critical').length;
              results.summary.warningIssues += data.violations.filter(v => v.impact === 'moderate' || v.impact === 'minor').length;
            }
          } catch (error) {
            console.warn(`⚠️ Could not parse accessibility file ${file}:`, error);
          }
        }
      }
    }

    return results;
  } catch (error) {
    console.warn('⚠️ Error collecting accessibility results:', error);
    return { error: error.message };
  }
}

async function collectSecurityResults() {
  try {
    const securityFiles = [
      './test-reports/security-config.json',
      './test-reports/playwright-results.json'
    ];

    const security = {
      files: [],
      summary: {
        vulnerabilities: 0,
        warnings: 0,
        passed: 0
      }
    };

    for (const file of securityFiles) {
      if (fs.existsSync(file)) {
        try {
          const data = JSON.parse(fs.readFileSync(file, 'utf8'));
          security.files.push({
            file: path.basename(file),
            data
          });
        } catch (error) {
          console.warn(`⚠️ Could not parse security file ${file}:`, error);
        }
      }
    }

    return security;
  } catch (error) {
    console.warn('⚠️ Error collecting security results:', error);
    return { error: error.message };
  }
}

function generateRecommendations() {
  const recommendations = [];

  // Check if all critical test types were run
  const requiredDirectories = [
    './test-reports/accessibility',
    './test-reports/performance',
    './test-reports/security'
  ];

  for (const dir of requiredDirectories) {
    if (!fs.existsSync(dir) || fs.readdirSync(dir).length === 0) {
      const testType = path.basename(dir);
      recommendations.push(`Consider adding ${testType} testing to your comprehensive test suite`);
    }
  }

  // Check coverage thresholds
  try {
    const coverageFile = './coverage/coverage-summary.json';
    if (fs.existsSync(coverageFile)) {
      const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
      const totalCoverage = coverage.total;

      if (totalCoverage && totalCoverage.lines && totalCoverage.lines.pct < 80) {
        recommendations.push(`Code coverage is ${totalCoverage.lines.pct}% - consider increasing to 80%+`);
      }
    }
  } catch (error) {
    recommendations.push('Add code coverage reporting to track test effectiveness');
  }

  // General recommendations
  recommendations.push('Review test results for patterns in failures across different environments');
  recommendations.push('Consider adding visual regression testing if not already included');
  recommendations.push('Ensure all test artifacts are properly archived for historical analysis');

  return recommendations;
}

function generateReadableSummary(report: any) {
  const duration = (report.metadata.totalDuration / 1000).toFixed(1);

  return `# Comprehensive Test Summary

## Overview
- **Total Duration**: ${duration} seconds
- **Completed**: ${new Date(report.metadata.endTime).toLocaleString()}
- **Environment**: ${report.metadata.environment.platform} (Node ${report.metadata.environment.node})

## Performance Metrics
${report.performance.error ? `⚠️ Error collecting performance data: ${report.performance.error}` :
`- **Memory Usage**: ${Math.round(report.performance.memoryUsage.heapUsed / 1024 / 1024)}MB
- **Process Uptime**: ${Math.round(report.performance.uptime)}s`}

## Test Coverage
${report.coverage.error ? `⚠️ Error collecting coverage data: ${report.coverage.error}` :
`${report.coverage.summary ?
  `- **Lines**: ${report.coverage.summary.total.lines.pct}%
- **Functions**: ${report.coverage.summary.total.functions.pct}%
- **Branches**: ${report.coverage.summary.total.branches.pct}%
- **Statements**: ${report.coverage.summary.total.statements.pct}%` :
  '- Coverage data not available'}`}

## Accessibility Testing
${report.accessibility.error ? `⚠️ Error collecting accessibility data: ${report.accessibility.error}` :
`- **Total Violations**: ${report.accessibility.summary.totalViolations}
- **Critical Issues**: ${report.accessibility.summary.criticalIssues}
- **Warning Issues**: ${report.accessibility.summary.warningIssues}
- **Files Tested**: ${report.accessibility.files.length}`}

## Security Testing
${report.security.error ? `⚠️ Error collecting security data: ${report.security.error}` :
`- **Vulnerabilities**: ${report.security.summary.vulnerabilities}
- **Warnings**: ${report.security.summary.warnings}
- **Tests Passed**: ${report.security.summary.passed}`}

## Recommendations
${report.recommendations.map((rec: string) => `- ${rec}`).join('\n')}

## Artifacts
- **Detailed Results**: \`./test-reports/playwright-results.json\`
- **HTML Report**: \`./test-reports/playwright-html/index.html\`
- **Test Artifacts**: \`./test-reports/playwright-artifacts/\`

---
Generated by USWDS Web Components Comprehensive Test Suite
`;
}

async function archiveArtifacts() {
  try {
    // In a real CI environment, you might upload to S3, Azure, or another artifact store
    // For now, we'll just organize the artifacts

    const archiveDir = `./test-reports/archive-${Date.now()}`;

    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir, { recursive: true });
    }

    // Copy key files to archive
    const keyFiles = [
      './test-reports/comprehensive-summary.json',
      './test-reports/comprehensive-summary.md',
      './test-reports/playwright-results.json'
    ];

    for (const file of keyFiles) {
      if (fs.existsSync(file)) {
        const fileName = path.basename(file);
        fs.copyFileSync(file, path.join(archiveDir, fileName));
      }
    }

    console.log(`📦 Artifacts archived to: ${archiveDir}`);
  } catch (error) {
    console.warn('⚠️ Error archiving artifacts:', error);
  }
}

export default globalTeardown;