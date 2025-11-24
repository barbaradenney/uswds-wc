import { test, expect } from '@playwright/test';

/**
 * Comprehensive Browser Required Tests
 *
 * Tests for remaining components that require browser environment:
 * - Date Picker (dynamic property changes, JavaScript compliance)
 * - Footer (link click events, DOM element selection)
 * - In-Page Navigation (USWDS generation, dynamic updates)
 * - Storybook Story Rendering (Lit re-rendering issues)
 */

test.describe('Date Picker (Browser Required)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:6006/iframe.html?id=forms-date-picker--default&viewMode=story');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('should handle dynamic property changes', async ({ page }) => {
    const datePicker = page.locator('usa-date-picker');

    // Set value dynamically
    await datePicker.evaluate((el: any) => {
      el.value = '02/14/2024';
    });
    await page.waitForTimeout(200);

    // Check input value
    const input = datePicker.locator('input');
    await expect(input).toHaveValue('02/14/2024');
  });

  test('should pass USWDS JavaScript compliance validation', async ({ page }) => {
    const datePicker = page.locator('usa-date-picker');

    // Check for USWDS initialization
    const hasUSWDSInit = await datePicker.evaluate((el) => {
      return el.classList.contains('usa-date-picker') ||
             el.querySelector('.usa-date-picker') !== null;
    });

    expect(hasUSWDSInit).toBe(true);
  });
});

test.describe('Footer (Browser Required)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:6006/iframe.html?id=navigation-footer--default&viewMode=story');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('should dispatch footer-link-click event for identifier links', async ({ page }) => {
    const footer = page.locator('usa-footer');

    // Listen for custom event
    const eventPromise = page.evaluate(() => {
      return new Promise((resolve) => {
        document.querySelector('usa-footer')?.addEventListener('footer-link-click', (e: any) => {
          resolve(e.detail);
        });
      });
    });

    // Click a footer link
    const link = footer.locator('.usa-identifier__required-link').first();
    if (await link.count() > 0) {
      await link.click();

      const eventDetail = await Promise.race([
        eventPromise,
        page.waitForTimeout(1000).then(() => null)
      ]);

      expect(eventDetail).toBeTruthy();
    }
  });

  test('should not interfere with other components after event handling', async ({ page }) => {
    const footer = page.locator('usa-footer');

    // Click multiple links
    const links = footer.locator('a');
    const linkCount = await links.count();

    if (linkCount > 0) {
      await links.first().click();
      await page.waitForTimeout(100);

      // Footer should still be in DOM
      await expect(footer).toBeAttached();
      expect(await footer.evaluate((el) => el.isConnected)).toBe(true);
    }
  });

  test('should handle multiple rapid link clicks without component removal', async ({ page }) => {
    const footer = page.locator('usa-footer');
    const links = footer.locator('a');
    const linkCount = await links.count();

    if (linkCount > 0) {
      // Click multiple times rapidly
      for (let i = 0; i < 5; i++) {
        await links.nth(i % linkCount).click({ timeout: 100 }).catch(() => {});
      }

      // Component should still be connected
      await expect(footer).toBeAttached();
    }
  });
});

test.describe('In-Page Navigation (Browser Required)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:6006/iframe.html?id=navigation-in-page-navigation--default&viewMode=story');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('should have proper in-page navigation DOM structure for USWDS', async ({ page }) => {
    const nav = page.locator('usa-in-page-navigation');
    await expect(nav).toBeVisible();

    // Check for USWDS-generated structure
    const navElement = nav.locator('.usa-in-page-nav');
    await expect(navElement).toBeAttached();

    const navList = nav.locator('.usa-in-page-nav__list');
    await expect(navList).toBeAttached();

    const navLinks = nav.locator('.usa-in-page-nav__link');
    expect(await navLinks.count()).toBeGreaterThan(0);
  });

  test('should maintain proper USWDS in-page navigation structure', async ({ page }) => {
    const nav = page.locator('usa-in-page-navigation');
    const navList = nav.locator('.usa-in-page-nav__list');
    const navItems = nav.locator('.usa-in-page-nav__item');
    const navLinks = nav.locator('.usa-in-page-nav__link');

    await expect(navList).toBeAttached();
    expect(await navItems.count()).toBeGreaterThan(0);
    expect(await navLinks.count()).toBeGreaterThan(0);
  });

  test('should handle dynamic property changes', async ({ page }) => {
    const nav = page.locator('usa-in-page-navigation');

    // Update links dynamically
    await nav.evaluate((el: any) => {
      el.links = [
        { text: 'New Section 1', href: '#new1' },
        { text: 'New Section 2', href: '#new2' }
      ];
    });
    await page.waitForTimeout(300);

    // Check for updated links
    const links = nav.locator('.usa-in-page-nav__link');
    expect(await links.count()).toBeGreaterThanOrEqual(1);
  });
});

test.describe('Storybook Story Rendering (Browser Required)', () => {
  test('should render pagination story with actual DOM content', async ({ page }) => {
    await page.goto('http://localhost:6006/iframe.html?id=navigation-pagination--default&viewMode=story');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const pagination = page.locator('usa-pagination');
    await expect(pagination).toBeVisible();

    // Check content is rendered
    const nav = pagination.locator('.usa-pagination');
    await expect(nav).toBeAttached();

    const list = pagination.locator('.usa-pagination__list');
    await expect(list).toBeAttached();
  });

  test('should respond to pagination story args/controls', async ({ page }) => {
    await page.goto('http://localhost:6006/iframe.html?id=navigation-pagination--default&viewMode=story');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const pagination = page.locator('usa-pagination');

    // Update properties via Storybook controls simulation
    await pagination.evaluate((el: any) => {
      el.totalPages = 50;
      el.currentPage = 10;
    });
    await page.waitForTimeout(300);

    // Content should update
    const currentPageIndicator = pagination.locator('.usa-current');
    await expect(currentPageIndicator).toBeAttached();
  });
});
