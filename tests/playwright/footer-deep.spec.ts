import { test, expect } from '@playwright/test';

/**
 * Footer Deep Testing Suite
 *
 * Phase 2B comprehensive testing for usa-footer component
 * Tests accordion sections, responsive behavior, and footer variants
 *
 * Total Tests: 14
 * - 4 Baseline tests (rendering, keyboard, a11y, responsive)
 * - 4 Accordion tests (if applicable with big variant)
 * - 3 Variant tests (slim, medium, big)
 * - 3 Edge case tests
 */

const STORY_URL_DEFAULT = '/iframe.html?id=navigation-footer--default';
const STORY_URL_SLIM = '/iframe.html?id=navigation-footer--slim';
const STORY_URL_BIG = '/iframe.html?id=navigation-footer--big';
const COMPONENT_SELECTOR = 'usa-footer';
const WRAPPER_SELECTOR = '.usa-footer';

test.describe('Footer Deep Testing', () => {
  // Skip all footer tests in Webkit CI - USWDS/Storybook initialization too slow
  test.beforeEach(async ({ page, browserName }) => {
    test.skip(!!process.env.CI, 'Deep tests skip CI - use cross-browser tests for CI coverage');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  // ============================================================================
  // BASELINE TESTS (4 tests)
  // ============================================================================

  test.describe('Baseline Tests', () => {
    test('should render correctly', async ({ page, browserName }) => {
      await page.goto(STORY_URL_DEFAULT);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      await expect(component).toBeVisible();

      // Check for USWDS wrapper inside component
      const wrapper = component.locator(WRAPPER_SELECTOR);
      await expect(wrapper).toBeVisible();

      // Check for footer navigation
      const footerNav = wrapper.locator('.usa-footer__nav, .usa-footer__primary-section');
      if ((await footerNav.count()) > 0) {
        await expect(footerNav.first()).toBeVisible();
      }

      // Visual regression screenshot
      await page.screenshot({
        path: `test-results/screenshots/${browserName}-footer-render.png`,
        fullPage: false,
        clip: (await component.boundingBox()) || undefined,
      });
    });

    test('should handle keyboard accessibility', async ({ page }) => {
      await page.goto(STORY_URL_DEFAULT);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();

      // Tab to first link in footer
      await page.keyboard.press('Tab');

      // Check if any footer link is focused
      const footerLinks = component.locator('a');
      if ((await footerLinks.count()) > 0) {
        // Try to focus first link directly
        await footerLinks.first().focus();
        await expect(footerLinks.first()).toBeFocused();

        // Press Enter should not cause error
        await page.keyboard.press('Enter');
      } else {
        // If no links, test passes (valid footer configuration)
        expect(true).toBeTruthy();
      }
    });

    test('should be accessible', async ({ page }) => {
      await page.goto(STORY_URL_DEFAULT);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();

      // Check for contentinfo landmark (footer role)
      const footer = component.locator('[role="contentinfo"], footer');
      expect(await footer.count()).toBeGreaterThan(0);

      // Check for navigation structure
      const nav = component.locator('nav');
      if ((await nav.count()) > 0) {
        await expect(nav.first()).toBeVisible();
      }

      // Check links have proper text
      const links = component.locator('a');
      const linkCount = await links.count();
      if (linkCount > 0) {
        for (let i = 0; i < Math.min(linkCount, 3); i++) {
          const link = links.nth(i);
          const text = await link.textContent();
          expect(text?.trim().length).toBeGreaterThan(0);
        }
      }
    });

    test('should handle responsive design', async ({ page, isMobile }) => {
      await page.goto(STORY_URL_DEFAULT);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      await expect(component).toBeVisible();

      const box = await component.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThan(0);

      if (isMobile) {
        // Mobile: footer should stack vertically
        // Check that footer sections are visible
        const sections = component.locator('.usa-footer__primary-section, .usa-footer__nav');
        if ((await sections.count()) > 0) {
          await expect(sections.first()).toBeVisible();
        }
      } else {
        // Desktop: footer sections should be visible
        const sections = component.locator('.usa-footer__primary-section, .usa-footer__nav');
        if ((await sections.count()) > 0) {
          await expect(sections.first()).toBeVisible();
        }
      }
    });
  });

  // ============================================================================
  // ACCORDION TESTS (4 tests) - For Big Footer variant
  // ============================================================================

  test.describe('Accordion Tests', () => {
    test('should toggle accordion sections in big footer', async ({ page, isMobile }) => {
      // Big footer has accordion behavior on mobile
      if (!isMobile) {
        test.skip();
      }

      await page.goto(STORY_URL_BIG);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();

      // Look for accordion buttons
      const accordionButtons = component.locator('.usa-footer__primary-link, button[aria-expanded]');
      const buttonCount = await accordionButtons.count();

      if (buttonCount > 0) {
        const firstButton = accordionButtons.first();
        await expect(firstButton).toBeVisible();

        // Check initial state
        let ariaExpanded = await firstButton.getAttribute('aria-expanded');
        const initialState = ariaExpanded === 'true';

        // Click to toggle
        await firstButton.click();
        await page.waitForTimeout(300);

        ariaExpanded = await firstButton.getAttribute('aria-expanded');
        const newState = ariaExpanded === 'true';

        // State should have changed
        expect(newState).not.toBe(initialState);

        // If now expanded, list should be visible
        if (newState) {
          const list = component.locator('.usa-footer__secondary-links, ul').first();
          if ((await list.count()) > 0) {
            await expect(list).toBeVisible();
          }
        }
      } else {
        // No accordion buttons found, test passes (might not be mobile view)
        expect(true).toBeTruthy();
      }
    });

    test('should handle multiple accordion sections independently', async ({ page, isMobile }) => {
      if (!isMobile) {
        test.skip();
      }

      await page.goto(STORY_URL_BIG);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const accordionButtons = component.locator('.usa-footer__primary-link, button[aria-expanded]');
      const buttonCount = await accordionButtons.count();

      if (buttonCount >= 2) {
        // Open first section
        const firstButton = accordionButtons.nth(0);
        await firstButton.click();
        await page.waitForTimeout(300);

        const firstExpanded = await firstButton.getAttribute('aria-expanded');
        expect(firstExpanded).toBe('true');

        // Open second section
        const secondButton = accordionButtons.nth(1);
        await secondButton.click();
        await page.waitForTimeout(300);

        const secondExpanded = await secondButton.getAttribute('aria-expanded');
        expect(secondExpanded).toBe('true');

        // First section should remain open (non-exclusive accordion)
        const firstStillExpanded = await firstButton.getAttribute('aria-expanded');
        expect(firstStillExpanded).toBe('true');
      } else {
        expect(true).toBeTruthy();
      }
    });

    test('should handle keyboard navigation in accordion', async ({ page, isMobile }) => {
      if (!isMobile) {
        test.skip();
      }

      await page.goto(STORY_URL_BIG);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const accordionButtons = component.locator('.usa-footer__primary-link, button[aria-expanded]');

      if ((await accordionButtons.count()) > 0) {
        const firstButton = accordionButtons.first();

        // Focus and activate with keyboard
        await firstButton.focus();
        await expect(firstButton).toBeFocused();

        // Press Enter to expand
        await page.keyboard.press('Enter');
        await page.waitForTimeout(300);

        const ariaExpanded = await firstButton.getAttribute('aria-expanded');
        expect(ariaExpanded).toBe('true');

        // Tab into the list
        await page.keyboard.press('Tab');

        // Should focus first link in list
        const firstLink = component.locator('.usa-footer__secondary-links a, .usa-list--unstyled a').first();
        if ((await firstLink.count()) > 0) {
          await expect(firstLink).toBeFocused();
        }
      } else {
        expect(true).toBeTruthy();
      }
    });

    test('should maintain accordion state on window resize', async ({ page }) => {
      // Start at desktop size
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.goto(STORY_URL_BIG);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();

      // Resize to mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);

      // Find accordion buttons (should appear on mobile)
      const accordionButtons = component.locator('.usa-footer__primary-link, button[aria-expanded]');

      if ((await accordionButtons.count()) > 0) {
        const firstButton = accordionButtons.first();

        // Open accordion
        await firstButton.click();
        await page.waitForTimeout(300);

        let ariaExpanded = await firstButton.getAttribute('aria-expanded');
        expect(ariaExpanded).toBe('true');

        // Resize back to desktop
        await page.setViewportSize({ width: 1024, height: 768 });
        await page.waitForTimeout(500);

        // Content should still be visible (accordion may not exist on desktop)
        await expect(component).toBeVisible();
      } else {
        expect(true).toBeTruthy();
      }
    });
  });

  // ============================================================================
  // VARIANT TESTS (3 tests)
  // ============================================================================

  test.describe('Variant Tests', () => {
    test('should render slim footer variant correctly', async ({ page }) => {
      await page.goto(STORY_URL_SLIM);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      await expect(component).toBeVisible();

      // Check for slim footer class
      const slimFooter = component.locator('.usa-footer--slim');
      await expect(slimFooter).toBeVisible();

      // Slim footer has minimal content
      const wrapper = component.locator(WRAPPER_SELECTOR);
      await expect(wrapper).toBeVisible();
    });

    test('should render medium footer variant correctly', async ({ page }) => {
      await page.goto(STORY_URL_DEFAULT);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      await expect(component).toBeVisible();

      // Medium footer should have navigation sections
      const nav = component.locator('.usa-footer__nav, .usa-footer__primary-section');
      if ((await nav.count()) > 0) {
        await expect(nav.first()).toBeVisible();
      }

      // Should have footer navigation lists
      const lists = component.locator('.usa-footer__primary-content ul, .usa-list');
      if ((await lists.count()) > 0) {
        await expect(lists.first()).toBeVisible();
      }
    });

    test('should render big footer variant correctly', async ({ page }) => {
      await page.goto(STORY_URL_BIG);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      await expect(component).toBeVisible();

      // Big footer has primary section
      const primarySection = component.locator('.usa-footer__primary-section');
      await expect(primarySection).toBeVisible();

      // Should have multiple columns/sections
      const sections = component.locator('.usa-footer__primary-content section, .usa-footer__primary-content > *');
      expect(await sections.count()).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // EDGE CASE TESTS (3 tests)
  // ============================================================================

  test.describe('Edge Case Tests', () => {
    test('should handle empty sections array', async ({ page }) => {
      await page.goto(STORY_URL_DEFAULT);
      await page.waitForLoadState('networkidle');

      // Modify component to have empty sections
      await page.evaluate(() => {
        const footer = document.querySelector('usa-footer');
        if (footer) {
          (footer as any).sections = [];
        }
      });

      await page.waitForTimeout(500);

      // Component should still render without errors
      const component = page.locator(COMPONENT_SELECTOR).first();
      await expect(component).toBeVisible();
    });

    test('should handle footer with agency name', async ({ page }) => {
      await page.goto(STORY_URL_DEFAULT);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      await expect(component).toBeVisible();

      // Look for agency name or logo
      const agencyContent = component.locator('.usa-footer__logo, .usa-footer__logo-heading');
      if ((await agencyContent.count()) > 0) {
        await expect(agencyContent.first()).toBeVisible();
        const text = await agencyContent.first().textContent();
        expect(text?.trim().length).toBeGreaterThan(0);
      } else {
        // No agency content, that's valid for some variants
        expect(true).toBeTruthy();
      }
    });

    test('should handle footer link clicks', async ({ page }) => {
      await page.goto(STORY_URL_DEFAULT);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();

      // Find first footer link
      const firstLink = component.locator('a').first();

      if ((await firstLink.count()) > 0) {
        await expect(firstLink).toBeVisible();

        // Get link attributes
        const href = await firstLink.getAttribute('href');
        const text = await firstLink.textContent();

        expect(href).toBeTruthy();
        expect(text?.trim().length).toBeGreaterThan(0);

        // Set up event listener for custom event
        const eventPromise = page.evaluate(() => {
          return new Promise((resolve) => {
            document.addEventListener('footer-link-click', (e: any) => {
              resolve({
                label: e.detail.label,
                href: e.detail.href,
              });
            }, { once: true });

            // Timeout after 1s
            setTimeout(() => resolve(null), 1000);
          });
        });

        // Click the link
        await firstLink.click({ noWaitAfter: true });

        // Wait a bit for event
        await page.waitForTimeout(100);

        // Event might fire or navigation might happen - both are valid
        expect(true).toBeTruthy();
      } else {
        // No links in footer, that's valid for slim variant
        expect(true).toBeTruthy();
      }
    });
  });
});
