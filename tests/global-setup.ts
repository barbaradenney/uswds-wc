/**
 * Global Setup for Comprehensive Testing
 *
 * This setup ensures all testing infrastructure is properly initialized
 * before any tests run.
 */

import { chromium, FullConfig } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up comprehensive testing environment...');

  // Ensure test directories exist
  const testDirs = [
    './test-reports',
    './test-reports/accessibility',
    './test-reports/performance',
    './test-reports/security',
    './test-reports/visual',
    './test-reports/playwright-artifacts',
    './test-reports/coverage'
  ];

  for (const dir of testDirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  }

  // In CI, start http-server once for all test projects
  // This is more efficient than starting it in each GitHub Actions job
  if (process.env.CI && fs.existsSync('./storybook-static')) {
    console.log('🚀 Starting http-server for storybook-static (CI environment)...');
    try {
      // Start http-server in background
      const serverProcess = exec('npx http-server storybook-static -p 6006 --silent');

      // Store PID for cleanup in global teardown
      if (serverProcess.pid) {
        fs.writeFileSync('.storybook-server.pid', serverProcess.pid.toString());
        console.log(`   Server PID: ${serverProcess.pid}`);
      }

      console.log('✅ http-server started');
    } catch (error) {
      console.error('❌ Failed to start http-server:', error);
      throw error;
    }
  }

  // Note: In local development, Storybook is started by Playwright's webServer configuration
  // In CI, we start http-server above and disable webServer to avoid timing issues
  console.log('⏳ Waiting for Storybook to be ready...');
  console.log(`   CI environment: ${process.env.CI === 'true' ? 'YES' : 'NO'}`);
  console.log(`   Node version: ${process.version}`);

  let attempts = 0;
  const maxAttempts = 60; // 2 minutes timeout
  let storybookReady = false;

  while (attempts < maxAttempts && !storybookReady) {
    try {
      const response = await fetch('http://localhost:6006/iframe.html');
      if (response.ok) {
        storybookReady = true;
        console.log('✅ Storybook is ready');
        console.log(`   Response status: ${response.status}`);
        console.log(`   Response headers: ${JSON.stringify(Object.fromEntries(response.headers))}`);
        break;
      } else {
        console.log(`   Attempt ${attempts + 1}/${maxAttempts}: Got ${response.status}`);
      }
    } catch (error: any) {
      // Still waiting for Playwright webServer to start Storybook...
      if (attempts % 10 === 0) {
        console.log(`   Attempt ${attempts + 1}/${maxAttempts}: ${error.message}`);
      }
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
    attempts++;

    if (attempts >= maxAttempts) {
      console.error('❌ Storybook never became available');
      console.error('   Playwright webServer should have started it automatically');
      console.error('   Check that storybook-static build completed successfully');
      throw new Error('Storybook failed to start within timeout period (started by Playwright webServer)');
    }
  }

  // Verify Playwright browsers are installed
  try {
    await execAsync('npx playwright --version');
    console.log('✅ Playwright is available');

    // Actually install browsers if not already installed
    console.log('📥 Ensuring Playwright browsers are installed...');
    try {
      await execAsync('npx playwright install --with-deps chromium');
      console.log('✅ Playwright browsers ready');
    } catch (installError) {
      console.warn('⚠️  Browser installation encountered an issue (may already be installed)');
    }
  } catch (error) {
    console.log('📥 Installing Playwright and browsers...');
    await execAsync('npx playwright install --with-deps');
    console.log('✅ Playwright browsers installed');
  }

  // Create comprehensive test state file
  const testState = {
    startTime: Date.now(),
    storybookUrl: 'http://localhost:6006',
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      ci: !!process.env.CI
    },
    configuration: {
      parallel: config.fullyParallel,
      workers: config.workers,
      retries: config.retries,
      timeout: config.timeout
    }
  };

  fs.writeFileSync('./test-reports/test-state.json', JSON.stringify(testState, null, 2));

  // Test browser accessibility
  console.log('🔍 Testing browser accessibility...');
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Set page default timeout to 120s for CI (Storybook build needs time to load/execute all JS)
  page.setDefaultTimeout(120000);

  try {
    console.log('🌐 Navigating to Storybook story...');
    // Wait for navigation and all network requests to complete
    await page.goto('http://localhost:6006/iframe.html?id=actions-button--default', {
      waitUntil: 'networkidle',
      timeout: 120000 // CI needs more time for asset loading and JS execution (120s for slow I/O + bundle parsing)
    });
    console.log('✅ Navigation complete (networkidle reached)');

    // Capture initial page state for debugging
    const pageTitle = await page.title();
    const pageUrl = page.url();
    console.log(`   Page title: "${pageTitle}"`);
    console.log(`   Page URL: ${pageUrl}`);

    // Check what's actually in the DOM
    const hasStorybookRoot = await page.evaluate(() => {
      const root = document.getElementById('storybook-root');
      return {
        exists: root !== null,
        hasChildren: root?.children.length > 0,
        childCount: root?.children.length || 0,
        innerHTML: root?.innerHTML.substring(0, 200) || ''
      };
    });
    console.log(`   Storybook root: ${JSON.stringify(hasStorybookRoot)}`);

    // Check if custom elements are defined
    const customElementStatus = await page.evaluate(() => {
      return {
        'usa-button': customElements.get('usa-button') !== undefined,
        'usa-alert': customElements.get('usa-alert') !== undefined,
        totalDefined: Array.from(document.querySelectorAll('*'))
          .filter(el => el.tagName.includes('-'))
          .map(el => el.tagName.toLowerCase())
          .filter((v, i, a) => a.indexOf(v) === i).length
      };
    });
    console.log(`   Custom elements: ${JSON.stringify(customElementStatus)}`);

    // Wait for Storybook to render the story
    // CI is VERY slow - need generous timeout for element registration
    console.log('⏳ Waiting for usa-button element registration...');
    await page.waitForFunction(
      () => {
        // Check that:
        // 1. Custom element is registered
        // 2. Storybook root has content
        // 3. usa-button element exists in DOM
        return customElements.get('usa-button') !== undefined &&
               document.getElementById('storybook-root')?.children.length > 0 &&
               document.querySelector('usa-button') !== null;
      },
      { timeout: 120000 } // CI needs 120s for bundle loading + custom element registration + rendering
    );

    console.log('✅ Basic component accessibility verified');
  } catch (error) {
    console.error('❌ Component accessibility test failed:', error);

    // Capture final page state for debugging
    try {
      const finalState = await page.evaluate(() => {
        return {
          url: window.location.href,
          title: document.title,
          bodyText: document.body?.textContent?.substring(0, 500),
          scripts: Array.from(document.querySelectorAll('script')).map(s => s.src).filter(Boolean),
          errors: (window as any).__errors || []
        };
      });
      console.error('   Final page state:', JSON.stringify(finalState, null, 2));
    } catch (e) {
      console.error('   Could not capture final page state');
    }

    console.error('  - This usually means components are not loading in Storybook');
    console.error('  - Check that storybook-static build completed successfully');
    console.error('  - Verify custom elements are being registered');
    throw error;
  } finally {
    await browser.close();
  }

  // Setup axe-core for accessibility testing
  console.log('🔧 Setting up accessibility testing infrastructure...');

  // Verify axe-core is available
  try {
    const axeCoreExists = fs.existsSync('./node_modules/axe-core');
    if (!axeCoreExists) {
      console.log('📥 Installing axe-core...');
      await execAsync('npm install --save-dev axe-core');
    }
    console.log('✅ Accessibility testing ready');
  } catch (error) {
    console.warn('⚠️ Failed to setup axe-core:', error);
  }

  // Setup performance monitoring
  console.log('📊 Setting up performance monitoring...');
  const performanceState = {
    baselineMetrics: {
      timestamp: Date.now(),
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    }
  };

  fs.writeFileSync('./test-reports/performance-baseline.json', JSON.stringify(performanceState, null, 2));

  // Setup security testing infrastructure
  console.log('🔒 Setting up security testing infrastructure...');
  const securityState = {
    timestamp: Date.now(),
    environment: 'test',
    securityHeaders: [
      'X-Frame-Options',
      'X-Content-Type-Options',
      'X-XSS-Protection',
      'Strict-Transport-Security',
      'Content-Security-Policy'
    ]
  };

  fs.writeFileSync('./test-reports/security-config.json', JSON.stringify(securityState, null, 2));

  console.log('🎯 Comprehensive testing environment ready!');
}

export default globalSetup;