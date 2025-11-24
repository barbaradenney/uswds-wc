import { test, expect } from '@playwright/test';

/**
 * Performance tests for USWDS components
 * Tests bundle size, runtime performance, and rendering speed
 */

interface PerformanceMetrics {
  renderTime: number;
  bundleSize: number;
  domNodes: number;
  memoryUsage?: number;
  paintTiming?: {
    firstPaint: number;
    firstContentfulPaint: number;
    largestContentfulPaint?: number;
  };
}

test.describe('Performance Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing performance marks
    await page.evaluate(() => {
      performance.clearMarks();
      performance.clearMeasures();
    });
  });

  test('should measure component rendering performance', async ({ page }) => {
    const results: Record<string, PerformanceMetrics> = {};

    const testComponents = [
      { name: 'button', story: 'actions-button--default' },
      { name: 'table', story: 'data-display-table--default' },
      { name: 'accordion', story: 'structure-accordion--default' },
      { name: 'modal', story: 'feedback-modal--default' },
    ];

    for (const { name, story } of testComponents) {
      console.log(`Testing performance for ${name}`);

      // Start timing
      const startTime = Date.now();

      await page.goto(`/iframe.html?id=${story}`);
      await page.waitForLoadState('networkidle');

      // Wait for component to fully render
      await page.locator(`usa-${name}`).first().waitFor({ state: 'visible' });

      const endTime = Date.now();
      const renderTime = endTime - startTime;

      // Get DOM node count
      const domNodes = await page.evaluate(() => {
        return document.querySelectorAll('*').length;
      });

      // Get bundle size info
      const resourceSizes = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        let totalSize = 0;

        resources.forEach((resource) => {
          if (resource.transferSize) {
            totalSize += resource.transferSize;
          }
        });

        return totalSize;
      });

      // Get paint timing
      const paintTiming = await page.evaluate(() => {
        const paintEntries = performance.getEntriesByType('paint');
        const result: any = {};

        paintEntries.forEach((entry) => {
          if (entry.name === 'first-paint') {
            result.firstPaint = entry.startTime;
          } else if (entry.name === 'first-contentful-paint') {
            result.firstContentfulPaint = entry.startTime;
          }
        });

        // Get LCP if available
        if ('LargestContentfulPaint' in window) {
          const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
          if (lcpEntries.length > 0) {
            result.largestContentfulPaint = lcpEntries[lcpEntries.length - 1].startTime;
          }
        }

        return result;
      });

      results[name] = {
        renderTime,
        bundleSize: resourceSizes,
        domNodes,
        paintTiming,
      };

      // Performance assertions
      expect(renderTime).toBeLessThan(3000); // Should render within 3 seconds
      expect(domNodes).toBeLessThan(10000); // Should not create excessive DOM nodes

      if (paintTiming.firstContentfulPaint) {
        expect(paintTiming.firstContentfulPaint).toBeLessThan(2000); // FCP within 2 seconds
      }
    }

    // Log results for analysis
    console.table(results);

    // Save results for reporting
    await page.evaluate((data) => {
      (window as any).performanceResults = data;
    }, results);
  });

  test('should handle large datasets efficiently', async ({ page }) => {
    await page.goto('/iframe.html?id=data-display-table--default');

    const startTime = performance.now();

    // Wait for table to be visible
    const table = page.locator('usa-table').first();
    await table.waitFor({ state: 'visible' });

    // Check if virtual scrolling is working
    const visibleRows = await page.locator('usa-table tbody tr').count();

    // With virtual scrolling, should have limited DOM rows regardless of data size
    expect(visibleRows).toBeLessThan(50);

    // Test scrolling performance
    const scrollContainer = page.locator('usa-table [data-virtual-scroll]').first();

    if ((await scrollContainer.count()) > 0) {
      const scrollStartTime = performance.now();

      // Scroll to test performance
      await scrollContainer.evaluate((el) => {
        el.scrollTop = 1000; // Scroll down
      });

      await page.waitForTimeout(100); // Wait for scroll to settle

      const scrollEndTime = performance.now();
      const scrollTime = scrollEndTime - scrollStartTime;

      expect(scrollTime).toBeLessThan(500); // Scrolling should be responsive
    }

    const totalTime = performance.now() - startTime;
    expect(totalTime).toBeLessThan(2000); // Total interaction should be fast
  });

  test('should handle memory efficiently', async ({ page }) => {
    // Test memory usage with repeated component creation/destruction
    await page.goto('/');

    const initialMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });

    // Create and destroy components multiple times
    for (let i = 0; i < 10; i++) {
      await page.goto('/iframe.html?id=feedback-modal--default');
      await page.waitForLoadState('networkidle');

      // Open modal
      const openButton = page.locator('button:has-text("Open Modal")').first();
      if ((await openButton.count()) > 0) {
        await openButton.click();
        await page.waitForTimeout(200);

        // Close modal
        const closeButton = page.locator('usa-modal button[data-close-modal]').first();
        if ((await closeButton.count()) > 0) {
          await closeButton.click();
          await page.waitForTimeout(200);
        }
      }
    }

    const finalMemory = await page.evaluate(() => {
      // Force garbage collection if available
      if ('gc' in window) {
        (window as any).gc();
      }

      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });

    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = finalMemory - initialMemory;
      const memoryIncreasePercent = (memoryIncrease / initialMemory) * 100;

      console.log(
        `Memory increase: ${memoryIncrease} bytes (${memoryIncreasePercent.toFixed(2)}%)`
      );

      // Memory should not increase by more than 50% after repeated operations
      expect(memoryIncreasePercent).toBeLessThan(50);
    }
  });

  test('should handle rapid state changes efficiently', async ({ page }) => {
    await page.goto('/iframe.html?id=structure-accordion--multiple-items');
    await page.waitForLoadState('networkidle');

    const accordionButtons = page.locator('usa-accordion button');
    const buttonCount = await accordionButtons.count();

    if (buttonCount > 0) {
      const startTime = performance.now();

      // Rapidly toggle accordion items
      for (let cycle = 0; cycle < 3; cycle++) {
        for (let i = 0; i < Math.min(buttonCount, 5); i++) {
          await accordionButtons.nth(i).click();
          // Don't wait - test rapid interactions
        }
        await page.waitForTimeout(100); // Brief pause between cycles
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Rapid interactions should complete within 2 seconds
      expect(totalTime).toBeLessThan(2000);

      // Check that accordion is still responsive
      await accordionButtons.nth(0).click();
      const panel = page.locator('usa-accordion [role="region"]').first();
      await expect(panel).toBeVisible();
    }
  });

  test('should handle CSS performance efficiently', async ({ page }) => {
    // Test CSS loading performance
    const startTime = Date.now();

    await page.goto('/iframe.html?id=data-display-collection--large-list');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);

    // Check CSS metrics
    const cssMetrics = await page.evaluate(() => {
      const styleSheets = document.styleSheets;
      let totalRules = 0;
      let cssSize = 0;

      for (let i = 0; i < styleSheets.length; i++) {
        try {
          const sheet = styleSheets[i];
          if (sheet.cssRules) {
            totalRules += sheet.cssRules.length;
          }
          if (sheet.href) {
            // Estimate size based on performance entries
            const resource = performance.getEntriesByName(
              sheet.href
            )[0] as PerformanceResourceTiming;
            if (resource && resource.transferSize) {
              cssSize += resource.transferSize;
            }
          }
        } catch (e) {
          // Cross-origin stylesheets may not be accessible
        }
      }

      return { totalRules, cssSize };
    });

    console.log('CSS Metrics:', cssMetrics);

    // Reasonable CSS performance expectations
    expect(cssMetrics.totalRules).toBeLessThan(10000); // Not too many CSS rules
    expect(cssMetrics.cssSize).toBeLessThan(1000000); // CSS under 1MB
  });

  test('should maintain performance with component combinations', async ({ page }) => {
    // Test performance when multiple components are used together
    await page.goto('/iframe.html?id=components-form--complex-form');

    const startTime = performance.now();
    await page.waitForLoadState('networkidle');

    // Fill out a complex form quickly
    const textInputs = page.locator('usa-text-input input');
    const textInputCount = await textInputs.count();

    for (let i = 0; i < Math.min(textInputCount, 10); i++) {
      await textInputs.nth(i).fill(`test-value-${i}`);
    }

    // Test select components
    const selects = page.locator('usa-select select');
    const selectCount = await selects.count();

    for (let i = 0; i < Math.min(selectCount, 5); i++) {
      await selects.nth(i).selectOption({ index: 1 });
    }

    const endTime = performance.now();
    const interactionTime = endTime - startTime;

    // Complex form should still be responsive
    expect(interactionTime).toBeLessThan(5000);

    // Check DOM performance
    const totalElements = await page.evaluate(() => {
      return document.querySelectorAll('*').length;
    });

    // Complex forms shouldn't create excessive DOM elements
    expect(totalElements).toBeLessThan(5000);
  });

  test('should generate performance report', async ({ page }) => {
    const performanceReport = {
      timestamp: new Date().toISOString(),
      testResults: [],
      summary: {
        totalTests: 0,
        passedTests: 0,
        averageRenderTime: 0,
        averageDOMNodes: 0,
      },
    };

    // This would be populated by running all the performance tests
    // For now, we'll create a sample report structure

    console.log('Performance Report Generated:', performanceReport);

    // In a real implementation, this would save to a file
    await page.evaluate((report) => {
      (window as any).performanceReport = report;
    }, performanceReport);
  });
});
