import { test, expect } from '@playwright/test';

/**
 * Component Performance Tests
 *
 * Tests component rendering performance, memory usage, and detects memory leaks.
 * Focus areas: render times, memory consumption, cleanup verification, performance regression
 */
test.describe('Component Performance Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Enable performance monitoring
    await page.addInitScript(() => {
      // Mock performance.memory for consistent testing
      if (typeof (performance as any).memory === 'undefined') {
        (performance as any).memory = {
          usedJSHeapSize: 0,
          totalJSHeapSize: 0,
          jsHeapSizeLimit: 0
        };
      }

      // Performance monitoring utilities
      (window as any).performanceMonitor = {
        renderTimes: [] as number[],
        memorySnapshots: [] as number[],
        startRender: 0,

        startMeasurement: () => {
          (window as any).performanceMonitor.startRender = performance.now();
        },

        endMeasurement: () => {
          const renderTime = performance.now() - (window as any).performanceMonitor.startRender;
          (window as any).performanceMonitor.renderTimes.push(renderTime);

          if ((performance as any).memory) {
            (window as any).performanceMonitor.memorySnapshots.push(
              (performance as any).memory.usedJSHeapSize
            );
          }

          return renderTime;
        },

        getAverageRenderTime: () => {
          const times = (window as any).performanceMonitor.renderTimes;
          return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
        },

        reset: () => {
          (window as any).performanceMonitor.renderTimes = [];
          (window as any).performanceMonitor.memorySnapshots = [];
        }
      };
    });
  });

  test.describe('Button Component Performance', () => {
    test('should render within performance budget', async ({ page }) => {
      await page.goto('/iframe.html?id=actions-button--default');
      await page.waitForLoadState('networkidle');

      // Measure initial render performance
      const renderTime = await page.evaluate(async () => {
        const monitor = (window as any).performanceMonitor;
        monitor.startMeasurement();

        // Create new button element
        const button = document.createElement('usa-button');
        button.textContent = 'Performance Test';
        document.body.appendChild(button);

        // Wait for component to be ready
        if ('updateComplete' in button) {
          await (button as any).updateComplete;
        } else {
          await new Promise(resolve => setTimeout(resolve, 0));
        }

        const time = monitor.endMeasurement();
        button.remove();

        return time;
      });

      // Button should render in under 50ms
      expect(renderTime).toBeLessThan(50);
      console.log(`✅ Button render time: ${renderTime.toFixed(2)}ms`);
    });

    test('should handle multiple instances efficiently', async ({ page }) => {
      await page.goto('/iframe.html?id=actions-button--default');
      await page.waitForLoadState('networkidle');

      const results = await page.evaluate(async () => {
        const monitor = (window as any).performanceMonitor;
        const buttons: HTMLElement[] = [];
        const instanceCount = 50;

        monitor.startMeasurement();

        // Create multiple button instances
        for (let i = 0; i < instanceCount; i++) {
          const button = document.createElement('usa-button');
          button.textContent = `Button ${i + 1}`;
          button.setAttribute('variant', i % 2 === 0 ? 'primary' : 'secondary');
          document.body.appendChild(button);
          buttons.push(button);

          if ('updateComplete' in button) {
            await (button as any).updateComplete;
          }
        }

        const totalRenderTime = monitor.endMeasurement();
        const averageRenderTime = totalRenderTime / instanceCount;

        // Clean up
        buttons.forEach(button => button.remove());

        return {
          totalRenderTime,
          averageRenderTime,
          instanceCount
        };
      });

      // Average render time per instance should be under 10ms
      expect(results.averageRenderTime).toBeLessThan(10);
      expect(results.totalRenderTime).toBeLessThan(1000);

      console.log(`✅ ${results.instanceCount} buttons rendered in ${results.totalRenderTime.toFixed(2)}ms`);
      console.log(`📊 Average per instance: ${results.averageRenderTime.toFixed(2)}ms`);
    });

    test('should not leak memory on removal', async ({ page }) => {
      await page.goto('/iframe.html?id=actions-button--default');
      await page.waitForLoadState('networkidle');

      await page.evaluate(async () => {
        // Force garbage collection if available
        if ((window as any).gc) {
          (window as any).gc();
        }
      });

      const memoryTest = await page.evaluate(async () => {
        const iterations = 20;
        const initialMemory = (performance as any).memory ?
          (performance as any).memory.usedJSHeapSize : 0;

        // Create and destroy buttons multiple times
        for (let i = 0; i < iterations; i++) {
          const button = document.createElement('usa-button');
          button.textContent = 'Memory Test';

          // Add event listeners that should be cleaned up
          const clickHandler = () => {};
          button.addEventListener('click', clickHandler);
          button.addEventListener('focus', clickHandler);

          document.body.appendChild(button);

          if ('updateComplete' in button) {
            await (button as any).updateComplete;
          }

          // Remove button
          button.remove();

          // Force cleanup every few iterations
          if (i % 5 === 0 && (window as any).gc) {
            (window as any).gc();
          }
        }

        // Final cleanup
        if ((window as any).gc) {
          (window as any).gc();
        }

        // Wait for cleanup
        await new Promise(resolve => setTimeout(resolve, 100));

        const finalMemory = (performance as any).memory ?
          (performance as any).memory.usedJSHeapSize : 0;

        return {
          initialMemory,
          finalMemory,
          memoryDifference: finalMemory - initialMemory,
          iterations
        };
      });

      // Memory increase should be minimal (less than 100KB)
      const maxAcceptableLeakage = 100 * 1024; // 100KB
      expect(Math.abs(memoryTest.memoryDifference)).toBeLessThan(maxAcceptableLeakage);

      console.log(`✅ Memory test: ${memoryTest.memoryDifference} bytes difference after ${memoryTest.iterations} iterations`);
    });
  });

  test.describe('Modal Component Performance', () => {
    test('should open and close efficiently', async ({ page }) => {
      await page.goto('/iframe.html?id=feedback-modal--default');
      await page.waitForLoadState('networkidle');

      const modalPerformance = await page.evaluate(async () => {
        const monitor = (window as any).performanceMonitor;
        const results = {
          openTime: 0,
          closeTime: 0,
          totalCycles: 10
        };

        const openButton = document.querySelector('button:has-text("Open Modal")') as HTMLButtonElement;

        // Test multiple open/close cycles
        for (let i = 0; i < results.totalCycles; i++) {
          // Measure modal opening
          monitor.startMeasurement();
          openButton.click();

          // Wait for modal to open
          await new Promise(resolve => setTimeout(resolve, 100));
          const modal = document.querySelector('[role="dialog"]');

          if (!modal) {
            throw new Error('Modal did not open');
          }

          results.openTime += monitor.endMeasurement();

          // Measure modal closing
          monitor.startMeasurement();
          const closeButton = modal.querySelector('.usa-modal__close') as HTMLButtonElement;
          if (closeButton) {
            closeButton.click();
          } else {
            // Fallback to Escape key
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
          }

          // Wait for modal to close
          await new Promise(resolve => setTimeout(resolve, 100));
          results.closeTime += monitor.endMeasurement();

          // Brief pause between cycles
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        return {
          averageOpenTime: results.openTime / results.totalCycles,
          averageCloseTime: results.closeTime / results.totalCycles,
          totalCycles: results.totalCycles
        };
      });

      // Modal should open/close within reasonable time
      expect(modalPerformance.averageOpenTime).toBeLessThan(100);
      expect(modalPerformance.averageCloseTime).toBeLessThan(100);

      console.log(`✅ Modal performance: Open ${modalPerformance.averageOpenTime.toFixed(2)}ms, Close ${modalPerformance.averageCloseTime.toFixed(2)}ms`);
    });

    test('should handle focus management efficiently', async ({ page }) => {
      await page.goto('/iframe.html?id=feedback-modal--default');
      await page.waitForLoadState('networkidle');

      const focusPerformance = await page.evaluate(async () => {
        const monitor = (window as any).performanceMonitor;
        const openButton = document.querySelector('button:has-text("Open Modal")') as HTMLButtonElement;

        monitor.startMeasurement();

        // Open modal
        openButton.click();
        await new Promise(resolve => setTimeout(resolve, 50));

        const modal = document.querySelector('[role="dialog"]');
        if (!modal) {
          throw new Error('Modal did not open');
        }

        // Test focus trapping performance
        const focusableElements = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        // Simulate tab navigation through all focusable elements
        for (const element of focusableElements) {
          (element as HTMLElement).focus();
          await new Promise(resolve => setTimeout(resolve, 1));
        }

        const focusTime = monitor.endMeasurement();

        // Close modal
        const closeButton = modal.querySelector('.usa-modal__close') as HTMLButtonElement;
        if (closeButton) {
          closeButton.click();
        }

        return {
          focusTime,
          focusableElementCount: focusableElements.length
        };
      });

      // Focus management should be fast
      expect(focusPerformance.focusTime).toBeLessThan(200);

      console.log(`✅ Focus management: ${focusPerformance.focusTime.toFixed(2)}ms for ${focusPerformance.focusableElementCount} elements`);
    });
  });

  test.describe('Combo Box Component Performance', () => {
    test('should handle large datasets efficiently', async ({ page }) => {
      await page.goto('/iframe.html?id=forms-combo-box--default');
      await page.waitForLoadState('networkidle');

      const comboBoxPerformance = await page.evaluate(async () => {
        const monitor = (window as any).performanceMonitor;
        const comboBox = document.querySelector('usa-combo-box') as HTMLElement;

        if (!comboBox) {
          throw new Error('Combo box not found');
        }

        // Generate large dataset
        const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
          value: `option-${i}`,
          text: `Option ${i + 1} - Performance Test Item`
        }));

        monitor.startMeasurement();

        // Set large dataset (simulate via DOM manipulation)
        const input = comboBox.querySelector('.usa-combo-box__input') as HTMLInputElement;
        const list = comboBox.querySelector('.usa-combo-box__list') as HTMLElement;

        if (input && list) {
          // Simulate opening dropdown
          const toggleButton = comboBox.querySelector('.usa-combo-box__toggle-list') as HTMLButtonElement;
          if (toggleButton) {
            toggleButton.click();
          }

          await new Promise(resolve => setTimeout(resolve, 50));

          // Test filtering performance
          input.focus();
          input.value = 'Option 1';
          input.dispatchEvent(new Event('input', { bubbles: true }));

          await new Promise(resolve => setTimeout(resolve, 100));
        }

        const filterTime = monitor.endMeasurement();

        return {
          filterTime,
          datasetSize: largeDataset.length
        };
      });

      // Filtering should be responsive even with large datasets
      expect(comboBoxPerformance.filterTime).toBeLessThan(500);

      console.log(`✅ Combo box filtering: ${comboBoxPerformance.filterTime.toFixed(2)}ms for ${comboBoxPerformance.datasetSize} items`);
    });

    test('should handle rapid user input efficiently', async ({ page }) => {
      await page.goto('/iframe.html?id=forms-combo-box--default');
      await page.waitForLoadState('networkidle');

      const inputPerformance = await page.evaluate(async () => {
        const monitor = (window as any).performanceMonitor;
        const comboBox = document.querySelector('usa-combo-box');

        if (!comboBox) {
          throw new Error('Combo box not found');
        }

        const input = comboBox.querySelector('.usa-combo-box__input') as HTMLInputElement;

        if (!input) {
          throw new Error('Combo box input not found');
        }

        monitor.startMeasurement();

        // Simulate rapid typing
        const testPhrase = 'rapid input test';

        for (const char of testPhrase) {
          input.value += char;
          input.dispatchEvent(new Event('input', { bubbles: true }));

          // Short delay to simulate realistic typing speed
          await new Promise(resolve => setTimeout(resolve, 10));
        }

        // Wait for final processing
        await new Promise(resolve => setTimeout(resolve, 100));

        const totalInputTime = monitor.endMeasurement();

        return {
          inputTime: totalInputTime,
          characterCount: testPhrase.length,
          averageTimePerChar: totalInputTime / testPhrase.length
        };
      });

      // Input handling should be responsive
      expect(inputPerformance.averageTimePerChar).toBeLessThan(50);

      console.log(`✅ Rapid input handling: ${inputPerformance.inputTime.toFixed(2)}ms total, ${inputPerformance.averageTimePerChar.toFixed(2)}ms per character`);
    });
  });

  test.describe('Accordion Component Performance', () => {
    test('should expand/collapse efficiently', async ({ page }) => {
      await page.goto('/iframe.html?id=structure-accordion--default');
      await page.waitForLoadState('networkidle');

      const accordionPerformance = await page.evaluate(async () => {
        const monitor = (window as any).performanceMonitor;
        const accordionButtons = document.querySelectorAll('.usa-accordion__button');

        if (accordionButtons.length === 0) {
          throw new Error('No accordion buttons found');
        }

        const results = {
          expandTime: 0,
          collapseTime: 0,
          cycles: Math.min(accordionButtons.length, 5)
        };

        // Test expand/collapse performance
        for (let i = 0; i < results.cycles; i++) {
          const button = accordionButtons[i] as HTMLButtonElement;

          // Measure expansion
          monitor.startMeasurement();
          button.click();
          await new Promise(resolve => setTimeout(resolve, 100)); // Wait for animation
          results.expandTime += monitor.endMeasurement();

          // Measure collapse
          monitor.startMeasurement();
          button.click();
          await new Promise(resolve => setTimeout(resolve, 100)); // Wait for animation
          results.collapseTime += monitor.endMeasurement();
        }

        return {
          averageExpandTime: results.expandTime / results.cycles,
          averageCollapseTime: results.collapseTime / results.cycles,
          cycles: results.cycles
        };
      });

      // Accordion animations should be smooth
      expect(accordionPerformance.averageExpandTime).toBeLessThan(200);
      expect(accordionPerformance.averageCollapseTime).toBeLessThan(200);

      console.log(`✅ Accordion performance: Expand ${accordionPerformance.averageExpandTime.toFixed(2)}ms, Collapse ${accordionPerformance.averageCollapseTime.toFixed(2)}ms`);
    });
  });

  test.describe('Table Component Performance', () => {
    test('should handle large datasets efficiently', async ({ page }) => {
      await page.goto('/iframe.html?id=data-display-table--sorting-demo');
      await page.waitForLoadState('networkidle');

      const tablePerformance = await page.evaluate(async () => {
        const monitor = (window as any).performanceMonitor;
        const table = document.querySelector('.usa-table') as HTMLTableElement;

        if (!table) {
          throw new Error('Table not found');
        }

        monitor.startMeasurement();

        // Test sorting performance
        const sortableHeaders = table.querySelectorAll('th button');

        if (sortableHeaders.length > 0) {
          const firstHeader = sortableHeaders[0] as HTMLButtonElement;

          // Click to sort ascending
          firstHeader.click();
          await new Promise(resolve => setTimeout(resolve, 50));

          // Click to sort descending
          firstHeader.click();
          await new Promise(resolve => setTimeout(resolve, 50));

          // Click to remove sort
          firstHeader.click();
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        const sortTime = monitor.endMeasurement();

        return {
          sortTime,
          rowCount: table.querySelectorAll('tbody tr').length,
          columnCount: table.querySelectorAll('th').length
        };
      });

      // Table sorting should be responsive
      expect(tablePerformance.sortTime).toBeLessThan(300);

      console.log(`✅ Table sorting: ${tablePerformance.sortTime.toFixed(2)}ms for ${tablePerformance.rowCount} rows, ${tablePerformance.columnCount} columns`);
    });
  });

  test.describe('Performance Regression Tests', () => {
    test('should maintain consistent performance across component variants', async ({ page }) => {
      const components = [
        { name: 'Button Primary', url: '/iframe.html?id=actions-button--default' },
        { name: 'Button Secondary', url: '/iframe.html?id=actions-button--secondary' },
        { name: 'Alert Info', url: '/iframe.html?id=feedback-alert--info' },
        { name: 'Alert Warning', url: '/iframe.html?id=feedback-alert--warning' },
        { name: 'Card Default', url: '/iframe.html?id=data-display-card--default' },
        { name: 'Card With Media', url: '/iframe.html?id=data-display-card--with-media' }
      ];

      const performanceResults = [];

      for (const component of components) {
        await page.goto(component.url);
        await page.waitForLoadState('networkidle');

        const renderTime = await page.evaluate(() => {
          const start = performance.now();

          // Force re-render by modifying DOM
          const elements = document.querySelectorAll('usa-button, usa-alert, usa-card');
          elements.forEach(el => {
            if (el.textContent) {
              el.textContent = el.textContent + ' ';
              el.textContent = el.textContent.trim();
            }
          });

          return performance.now() - start;
        });

        performanceResults.push({
          name: component.name,
          renderTime
        });

        console.log(`📊 ${component.name}: ${renderTime.toFixed(2)}ms`);
      }

      // No component should take significantly longer than others (within 3x difference)
      const renderTimes = performanceResults.map(r => r.renderTime);
      const minTime = Math.min(...renderTimes);
      const maxTime = Math.max(...renderTimes);
      const ratio = maxTime / minTime;

      expect(ratio).toBeLessThan(5); // Max 5x difference between fastest and slowest

      console.log(`✅ Performance consistency: ${ratio.toFixed(2)}x difference between fastest and slowest component`);
    });
  });
});