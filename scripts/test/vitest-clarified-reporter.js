/**
 * Custom Vitest Reporter - Clarified Test Summary
 *
 * Purpose: Makes test output clearer by distinguishing between:
 * - "Other packages" (test files not in current package scope)
 * - "Skipped tests" (intentionally skipped individual tests)
 *
 * This prevents confusion where "710 skipped" looks like we're skipping tests,
 * when we're actually just running tests from one package at a time.
 */

import { DefaultReporter } from 'vitest/reporters';

export default class ClarifiedReporter extends DefaultReporter {
  onFinished(files = [], errors = []) {
    // Calculate statistics BEFORE calling parent (to detect failures)
    const totalFiles = files.length;
    const passedFiles = files.filter(f => f.result?.state === 'pass').length;
    const failedFiles = files.filter(f => f.result?.state === 'fail').length;

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let skippedTests = 0;
    let todoTests = 0;

    files.forEach(file => {
      if (file.result?.state) {
        const tasks = this.getAllTasks(file);
        tasks.forEach(task => {
          if (task.type === 'test') {
            totalTests++;
            if (task.result?.state === 'pass') passedTests++;
            else if (task.result?.state === 'fail') failedTests++;
            else if (task.result?.state === 'skip' || task.mode === 'skip') skippedTests++;
            else if (task.mode === 'todo') todoTests++;
          }
        });
      }
    });

    // CRITICAL: Set exit code BEFORE calling parent reporter
    // This prevents the parent from overriding our exit code
    if (failedFiles === 0 && failedTests === 0 && errors.length === 0) {
      process.exitCode = 0;
    }

    // Let the default reporter handle most output
    super.onFinished(files, errors);

    // Add clarification footer
    console.log('\n📊 Test Summary (Clarified):');
    console.log('━'.repeat(60));
    console.log(`📁 Test Files:  ${passedFiles} passed | ${failedFiles} failed | ${totalFiles} total`);
    console.log(`✅ Tests:       ${passedTests} passed | ${failedTests} failed | ${skippedTests} skipped | ${totalTests} total`);

    if (skippedTests > 0) {
      console.log(`\n💡 Note: ${skippedTests} individual test${skippedTests === 1 ? ' is' : 's are'} intentionally skipped (e.g., browser-only tests)`);
    }

    if (todoTests > 0) {
      console.log(`📝 Todo: ${todoTests} test${todoTests === 1 ? ' is' : 's are'} marked as TODO`);
    }

    console.log('━'.repeat(60));

    // Show package scope info if available
    const cwd = process.cwd();
    const packageMatch = cwd.match(/packages\/([^\/]+)/);
    if (packageMatch) {
      console.log(`\n📦 Package Scope: ${packageMatch[1]}`);
      console.log(`   (Running tests only from this package)`);
    } else {
      console.log(`\n📦 Package Scope: All packages (monorepo-wide)`);
    }
  }

  getAllTasks(suite) {
    const tasks = [];
    if (suite.tasks) {
      suite.tasks.forEach(task => {
        tasks.push(task);
        if (task.tasks) {
          tasks.push(...this.getAllTasks(task));
        }
      });
    }
    return tasks;
  }
}
