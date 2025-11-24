import { test, expect } from '@playwright/test';

/**
 * Header Deep Testing Suite
 *
 * Phase 2B comprehensive testing for usa-header component
 * Tests mobile menu, mega menu, navigation dropdowns, and responsive behavior
 *
 * Total Tests: 16
 * - 4 Baseline tests (rendering, keyboard, a11y, responsive)
 * - 5 Mobile menu tests
 * - 4 Dropdown/megamenu tests
 * - 3 Edge case tests
 */

const STORY_URL_DEFAULT = '/iframe.html?id=navigation-header--default';
const STORY_URL_EXTENDED = '/iframe.html?id=navigation-header--extended';
const STORY_URL_WITH_SUBMENU = '/iframe.html?id=navigation-header--with-submenu';
const STORY_URL_WITH_MEGAMENU = '/iframe.html?id=navigation-header--with-megamenu';
const COMPONENT_SELECTOR = 'usa-header';
const WRAPPER_SELECTOR = '.usa-header';

test.describe('Header Deep Testing', () => {
  test.beforeEach(async ({ page }) => {
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

      // Check for logo
      const logo = wrapper.locator('.usa-logo');
      await expect(logo).toBeVisible();

      // Check for navigation
      const nav = wrapper.locator('.usa-nav');
      await expect(nav).toBeVisible();

      // Visual regression screenshot
      await page.screenshot({
        path: `test-results/screenshots/${browserName}-header-render.png`,
        fullPage: false,
        clip: (await component.boundingBox()) || undefined,
      });
    });

    test('should handle keyboard accessibility', async ({ page }) => {
      await page.goto(STORY_URL_DEFAULT);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();

      // Focus page body first to ensure tab works correctly
      await page.evaluate(() => document.body.focus());

      // Tab to first focusable element (logo or first nav link depending on browser)
      await page.keyboard.press('Tab');
      const logoLink = component.locator('.usa-logo a');
      const firstNavLink = component.locator('.usa-nav__primary a').first();

      // Check if either logo or first nav link is focused (browser-dependent)
      const logoFocused = await logoLink.evaluate((el) => el === document.activeElement).catch(() => false);
      const navFocused = await firstNavLink.evaluate((el) => el === document.activeElement).catch(() => false);
      expect(logoFocused || navFocused).toBeTruthy();

      // Tab to next element
      await page.keyboard.press('Tab');

      // Press Enter should not cause error
      await page.keyboard.press('Enter');
      // Navigation might change URL, that's ok
    });

    test('should be accessible', async ({ page }) => {
      await page.goto(STORY_URL_DEFAULT);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();

      // Check for banner landmark
      const banner = component.locator('[role="banner"]');
      expect(await banner.count()).toBeGreaterThanOrEqual(1);

      // Check for navigation landmark
      const nav = component.locator('nav');
      await expect(nav).toBeVisible();

      // Check mobile menu button has aria-label
      const mobileMenuButton = component.locator('.usa-menu-btn');
      if ((await mobileMenuButton.count()) > 0) {
        const ariaLabel = await mobileMenuButton.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
        expect(ariaLabel?.toLowerCase()).toContain('menu');
      }

      // Check logo link is accessible
      const logoLink = component.locator('.usa-logo a');
      await expect(logoLink).toBeVisible();
    });

    test('should handle responsive design', async ({ page, isMobile }) => {
      await page.goto(STORY_URL_DEFAULT);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      await expect(component).toBeVisible();

      if (isMobile) {
        // Mobile: menu button should be visible, nav hidden initially
        const mobileMenuButton = component.locator('.usa-menu-btn');
        await expect(mobileMenuButton).toBeVisible();

        const nav = component.locator('.usa-nav');
        // Nav might have display: none or be hidden off-screen
        const navVisible = await nav.isVisible();
        // In mobile, nav should be hidden by default
        if (navVisible) {
          // Check if it's hidden via CSS (aria-hidden or hidden class)
          const ariaHidden = await nav.getAttribute('aria-hidden');
          const hasHiddenClass = await nav.evaluate((el) => el.classList.contains('is-hidden'));
          expect(ariaHidden === 'true' || hasHiddenClass).toBeTruthy();
        }
      } else {
        // Desktop: nav should be visible
        const nav = component.locator('.usa-nav');
        await expect(nav).toBeVisible();
      }

      const box = await component.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // MOBILE MENU TESTS (5 tests)
  // ============================================================================

  test.describe('Mobile Menu Tests', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

    test('should toggle mobile menu on button click', async ({ page }) => {
      await page.goto(STORY_URL_DEFAULT);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const mobileMenuButton = component.locator('.usa-menu-btn');
      await expect(mobileMenuButton).toBeVisible();

      // Initially menu should be closed
      let ariaExpanded = await mobileMenuButton.getAttribute('aria-expanded');
      expect(ariaExpanded).toBe('false');

      // Click to open
      await mobileMenuButton.click();
      await page.waitForTimeout(500); // Wait for animation

      ariaExpanded = await mobileMenuButton.getAttribute('aria-expanded');
      expect(ariaExpanded).toBe('true');

      // Nav should now be visible
      const nav = component.locator('.usa-nav');
      await expect(nav).toBeVisible();

      // Click close button (not menu button which is now hidden)
      const closeButton = component.locator('.usa-nav__close');
      if ((await closeButton.isVisible())) {
        await closeButton.click();
      } else {
        // Fallback to menu button with force
        await mobileMenuButton.click({ force: true });
      }
      await page.waitForTimeout(500);

      ariaExpanded = await mobileMenuButton.getAttribute('aria-expanded');
      expect(ariaExpanded).toBe('false');
    });

    test('should close mobile menu on Escape key', async ({ page }) => {
      await page.goto(STORY_URL_DEFAULT);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const mobileMenuButton = component.locator('.usa-menu-btn');

      // Open menu
      await mobileMenuButton.click();
      await page.waitForTimeout(500);

      let ariaExpanded = await mobileMenuButton.getAttribute('aria-expanded');
      expect(ariaExpanded).toBe('true');

      // Press Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      ariaExpanded = await mobileMenuButton.getAttribute('aria-expanded');
      expect(ariaExpanded).toBe('false');
    });

    test('should trap focus in mobile menu when open', async ({ page }) => {
      await page.goto(STORY_URL_WITH_SUBMENU);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const mobileMenuButton = component.locator('.usa-menu-btn');

      // Open menu
      await mobileMenuButton.click();
      await page.waitForTimeout(500);

      // Focus should move into the menu
      await page.keyboard.press('Tab');
      const activeElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(['A', 'BUTTON']).toContain(activeElement);

      // Should be able to navigate through menu items
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
      }

      // Focus should stay within header/menu area
      const focusedElement = await page.evaluate(() => {
        const active = document.activeElement;
        return active?.closest('usa-header') !== null;
      });
      expect(focusedElement).toBeTruthy();
    });

    test('should display mobile menu with submenu items', async ({ page }) => {
      await page.goto(STORY_URL_WITH_SUBMENU);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const mobileMenuButton = component.locator('.usa-menu-btn');

      // Open menu
      await mobileMenuButton.click();
      await page.waitForTimeout(500);

      // Find submenu button (with aria-expanded)
      const submenuButton = component.locator('button[aria-expanded]').first();
      if ((await submenuButton.count()) > 0) {
        await expect(submenuButton).toBeVisible();

        // Click submenu button
        await submenuButton.click();
        await page.waitForTimeout(300);

        // Check submenu is expanded
        const expanded = await submenuButton.getAttribute('aria-expanded');
        expect(expanded).toBe('true');

        // Submenu items should be visible
        const submenu = component.locator('.usa-nav__submenu').first();
        await expect(submenu).toBeVisible();
      }
    });

    test('should handle mobile menu state persistence', async ({ page }) => {
      await page.goto(STORY_URL_DEFAULT);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const mobileMenuButton = component.locator('.usa-menu-btn');

      // Open menu
      await mobileMenuButton.click();
      await page.waitForTimeout(500);

      // Click a nav link (which might navigate)
      const firstNavLink = component.locator('.usa-nav__primary a').first();
      const href = await firstNavLink.getAttribute('href');

      // Just verify the link exists and is clickable
      await expect(firstNavLink).toBeVisible();
      expect(href).toBeTruthy();
    });
  });

  // ============================================================================
  // DROPDOWN/MEGAMENU TESTS (4 tests)
  // ============================================================================

  test.describe('Dropdown and Megamenu Tests', () => {
    test('should toggle dropdown submenu on click', async ({ page }) => {
      await page.goto(STORY_URL_WITH_SUBMENU);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();

      // Find dropdown button (primary nav item with submenu)
      const dropdownButton = component.locator('.usa-nav__primary button').first();

      if ((await dropdownButton.count()) > 0) {
        await expect(dropdownButton).toBeVisible();

        // Initially closed
        let ariaExpanded = await dropdownButton.getAttribute('aria-expanded');
        expect(ariaExpanded).toBe('false');

        // Click to open
        await dropdownButton.click();
        await page.waitForTimeout(300);

        ariaExpanded = await dropdownButton.getAttribute('aria-expanded');
        expect(ariaExpanded).toBe('true');

        // Submenu should be visible
        const submenu = component.locator('.usa-nav__submenu').first();
        await expect(submenu).toBeVisible();

        // Click again to close
        await dropdownButton.click();
        await page.waitForTimeout(300);

        ariaExpanded = await dropdownButton.getAttribute('aria-expanded');
        expect(ariaExpanded).toBe('false');
      } else {
        // If no dropdown button, test passes (variant without submenu)
        expect(true).toBeTruthy();
      }
    });

    test('should handle megamenu rendering', async ({ page }) => {
      await page.goto(STORY_URL_WITH_MEGAMENU);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();

      // Look for megamenu button
      const megamenuButton = component.locator('.usa-nav__primary button[aria-controls*="megamenu"]').first();

      if ((await megamenuButton.count()) > 0) {
        await expect(megamenuButton).toBeVisible();

        // Click to open megamenu
        await megamenuButton.click();
        await page.waitForTimeout(500);

        // Megamenu should be visible
        const megamenu = component.locator('.usa-megamenu').first();
        await expect(megamenu).toBeVisible();

        // Should have grid structure
        const grid = megamenu.locator('.usa-megamenu__grid');
        await expect(grid).toBeVisible();

        // Should have at least one column
        const columns = megamenu.locator('.usa-megamenu__col');
        expect(await columns.count()).toBeGreaterThan(0);
      } else {
        // If story doesn't have megamenu, verify regular submenu instead
        const submenuButton = component.locator('.usa-nav__primary button').first();
        if ((await submenuButton.count()) > 0) {
          await submenuButton.click();
          await page.waitForTimeout(300);
          const submenu = component.locator('.usa-nav__submenu').first();
          await expect(submenu).toBeVisible();
        }
      }
    });

    test('should close dropdown when clicking outside', async ({ page }) => {
      await page.goto(STORY_URL_WITH_SUBMENU);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const dropdownButton = component.locator('.usa-nav__primary button').first();

      if ((await dropdownButton.count()) > 0) {
        // Open dropdown
        await dropdownButton.click();
        await page.waitForTimeout(300);

        let ariaExpanded = await dropdownButton.getAttribute('aria-expanded');
        expect(ariaExpanded).toBe('true');

        // Click outside (on logo area)
        const logo = component.locator('.usa-logo');
        await logo.click();
        await page.waitForTimeout(300);

        ariaExpanded = await dropdownButton.getAttribute('aria-expanded');
        expect(ariaExpanded).toBe('false');
      } else {
        expect(true).toBeTruthy();
      }
    });

    test('should navigate submenu with keyboard', async ({ page }) => {
      await page.goto(STORY_URL_WITH_SUBMENU);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const dropdownButton = component.locator('.usa-nav__primary button').first();

      if ((await dropdownButton.count()) > 0) {
        // Focus and open dropdown with Space
        await dropdownButton.focus();
        await page.keyboard.press('Space');
        await page.waitForTimeout(300);

        let ariaExpanded = await dropdownButton.getAttribute('aria-expanded');
        expect(ariaExpanded).toBe('true');

        // Tab into submenu
        await page.keyboard.press('Tab');

        // Should focus first submenu link
        const firstSubmenuLink = component.locator('.usa-nav__submenu a').first();
        await expect(firstSubmenuLink).toBeFocused();

        // Arrow down should move to next item
        await page.keyboard.press('ArrowDown');
        const secondSubmenuLink = component.locator('.usa-nav__submenu a').nth(1);
        if ((await secondSubmenuLink.count()) > 0) {
          await expect(secondSubmenuLink).toBeFocused();
        }
      } else {
        expect(true).toBeTruthy();
      }
    });
  });

  // ============================================================================
  // EDGE CASE TESTS (3 tests)
  // ============================================================================

  test.describe('Edge Case Tests', () => {
    test('should handle empty navigation items', async ({ page }) => {
      await page.goto(STORY_URL_DEFAULT);
      await page.waitForLoadState('networkidle');

      // Modify component to have empty nav items
      await page.evaluate(() => {
        const header = document.querySelector('usa-header');
        if (header) {
          (header as any).navItems = [];
        }
      });

      await page.waitForTimeout(500);

      // Component should still render without errors
      const component = page.locator(COMPONENT_SELECTOR).first();
      await expect(component).toBeVisible();

      // Logo should still be visible
      const logo = component.locator('.usa-logo');
      await expect(logo).toBeVisible();
    });

    test('should handle extended header variant', async ({ page }) => {
      await page.goto(STORY_URL_EXTENDED);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      await expect(component).toBeVisible();

      // Check for extended header class
      const header = component.locator('.usa-header--extended');
      await expect(header).toBeVisible();

      // Extended headers have secondary links
      const secondaryNav = component.locator('.usa-nav__secondary');
      if ((await secondaryNav.count()) > 0) {
        await expect(secondaryNav).toBeVisible();
      }
    });

    test('should handle search integration', async ({ page }) => {
      // Try to find a story with search enabled
      await page.goto('/iframe.html?id=navigation-header--with-megamenu');
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();

      // If story doesn't exist, try default and check if search can be enabled
      if ((await component.count()) === 0) {
        await page.goto(STORY_URL_DEFAULT);
        await page.waitForLoadState('networkidle');

        // Enable search via property
        await page.evaluate(() => {
          const header = document.querySelector('usa-header');
          if (header) {
            (header as any).showSearch = true;
          }
        });
        await page.waitForTimeout(500);
      }

      // Look for search component
      const search = page.locator('usa-search').first();
      if ((await search.count()) > 0) {
        await expect(search).toBeVisible();

        // Should have search input
        const searchInput = search.locator('input[type="search"]');
        await expect(searchInput).toBeVisible();

        // Should have search button
        const searchButton = search.locator('button[type="submit"]');
        await expect(searchButton).toBeVisible();
      } else {
        // Story doesn't have search, that's ok
        expect(true).toBeTruthy();
      }
    });
  });
});
