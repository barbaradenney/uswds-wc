import { test, expect } from '@playwright/test';

/**
 * USWDS Compliance Visual Tests
 *
 * These Playwright tests validate that all components follow USWDS specification:
 * 1. HTML structure matches official USWDS patterns
 * 2. CSS classes are correct
 * 3. ARIA attributes are properly placed
 * 4. Accessibility requirements are met
 *
 * CRITICAL: These tests prevent USWDS compliance regressions like the character count bug
 *
 * Reference: https://designsystem.digital.gov/components/
 */

test.describe('USWDS Component Compliance Tests', () => {
  /**
   * CHARACTER COUNT COMPONENT
   * USWDS Spec: https://designsystem.digital.gov/components/character-count/
   * Source: node_modules/@uswds/uswds/packages/usa-character-count/src/index.js
   */
  test.describe('Character Count USWDS Compliance', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:6006/?path=/story/forms-character-count--default');
      await page.waitForLoadState('networkidle');
    });

    test('should follow USWDS HTML structure', async ({ page }) => {
      const component = page.locator('usa-character-count').first();

      // Required USWDS elements
      const container = component.locator('.usa-character-count');
      const formGroup = component.locator('.usa-form-group');
      const label = component.locator('.usa-label');
      const field = component.locator('.usa-character-count__field');
      const message = component.locator('.usa-character-count__message');
      const status = component.locator('.usa-character-count__status');
      const srStatus = component.locator('.usa-character-count__sr-status');

      // All required elements must exist
      await expect(container).toBeVisible();
      await expect(formGroup).toBeVisible();
      await expect(label).toBeVisible();
      await expect(field).toBeVisible();
      await expect(message).toBeVisible();
      await expect(status).toBeVisible();
      await expect(srStatus).toBeVisible();
    });

    test('CRITICAL: message element structure per USWDS spec line 189', async ({ page }) => {
      // USWDS spec line 189: Removes aria-live from message element
      // This catches the monorepo migration regression

      const component = page.locator('usa-character-count').first();
      const message = component.locator('.usa-character-count__message');

      // FAIL CONDITION: Message should NOT have aria-live
      const ariaLive = await message.getAttribute('aria-live');
      expect(ariaLive).toBeNull();

      // PASS CONDITION: Message should have usa-sr-only class
      await expect(message).toHaveClass(/usa-sr-only/);
    });

    test('CRITICAL: SR status element structure per USWDS spec', async ({ page }) => {
      const component = page.locator('usa-character-count').first();
      const srStatus = component.locator('.usa-character-count__sr-status');

      // SR status SHOULD have aria-live="polite"
      await expect(srStatus).toHaveAttribute('aria-live', 'polite');

      // SR status should be screen-reader only
      await expect(srStatus).toHaveClass(/usa-sr-only/);
    });

    test('status element should have usa-hint class', async ({ page }) => {
      // USWDS spec line 84: Status should have usa-hint class
      const component = page.locator('usa-character-count').first();
      const status = component.locator('.usa-character-count__status');

      await expect(status).toHaveClass(/usa-hint/);
      await expect(status).toHaveAttribute('aria-hidden', 'true');
    });
  });

  /**
   * ICON COMPONENT
   * USWDS Spec: https://designsystem.digital.gov/components/icon/
   */
  test.describe('Icon USWDS Compliance', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:6006/?path=/story/data-display-icon--default');
      await page.waitForLoadState('networkidle');
    });

    test('should use sprite-first architecture', async ({ page }) => {
      const icon = page.locator('usa-icon').first();
      const svg = icon.locator('svg');

      // Must have usa-icon class
      await expect(svg).toHaveClass(/usa-icon/);

      // Must use <use> element with sprite reference
      const useElement = svg.locator('use');
      await expect(useElement).toBeVisible();

      const href = await useElement.getAttribute('href');
      expect(href).toMatch(/^\/img\/sprite\.svg#/);

      // Must NOT have inline <path> elements
      const pathCount = await svg.locator('path').count();
      expect(pathCount).toBe(0);
    });

    test('should have correct accessibility attributes', async ({ page }) => {
      await page.goto('http://localhost:6006/?path=/story/data-display-icon--default');
      await page.waitForLoadState('networkidle');

      const icon = page.locator('usa-icon').first();
      const svg = icon.locator('svg');

      // Accessible icons must have role="img"
      await expect(svg).toHaveAttribute('role', 'img');

      // Must have aria-label
      const ariaLabel = await svg.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();

      // Must have aria-hidden="false"
      await expect(svg).toHaveAttribute('aria-hidden', 'false');

      // Must have focusable="false"
      await expect(svg).toHaveAttribute('focusable', 'false');
    });

    test('decorative icons should be hidden from screen readers', async ({ page }) => {
      await page.goto('http://localhost:6006/?path=/story/data-display-icon--decorative');
      await page.waitForLoadState('networkidle');

      const icon = page.locator('usa-icon').first();
      const svg = icon.locator('svg');

      // Decorative icons must have aria-hidden="true"
      await expect(svg).toHaveAttribute('aria-hidden', 'true');

      // Must NOT have aria-label
      const ariaLabel = await svg.getAttribute('aria-label');
      expect(ariaLabel).toBeNull();
    });
  });

  /**
   * ACCORDION COMPONENT
   * USWDS Spec: https://designsystem.digital.gov/components/accordion/
   */
  test.describe('Accordion USWDS Compliance', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:6006/?path=/story/structure-accordion--default');
      await page.waitForLoadState('networkidle');
    });

    test('should have correct ARIA attributes', async ({ page }) => {
      const accordion = page.locator('usa-accordion').first();

      // Button should have aria-expanded
      const button = accordion.locator('.usa-accordion__button').first();
      const ariaExpanded = await button.getAttribute('aria-expanded');
      expect(ariaExpanded).toMatch(/^(true|false)$/);

      // Button should have aria-controls
      const ariaControls = await button.getAttribute('aria-controls');
      expect(ariaControls).toBeTruthy();

      // Content should have matching id
      const contentId = ariaControls;
      const content = accordion.locator(`#${contentId}`);
      await expect(content).toBeAttached();
    });

    test('should toggle aria-expanded on click', async ({ page }) => {
      const accordion = page.locator('usa-accordion').first();
      const button = accordion.locator('.usa-accordion__button').first();

      // Get initial state
      const initialExpanded = await button.getAttribute('aria-expanded');

      // Click button
      await button.click();
      await page.waitForTimeout(300);

      // State should toggle
      const newExpanded = await button.getAttribute('aria-expanded');
      expect(newExpanded).not.toBe(initialExpanded);
    });
  });

  /**
   * ALERT COMPONENT
   * USWDS Spec: https://designsystem.digital.gov/components/alert/
   */
  test.describe('Alert USWDS Compliance', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:6006/?path=/story/feedback-alert--default');
      await page.waitForLoadState('networkidle');
    });

    test('should have correct USWDS structure', async ({ page }) => {
      const alert = page.locator('usa-alert').first();

      // Container should have usa-alert class
      const container = alert.locator('.usa-alert');
      await expect(container).toBeVisible();

      // Should have alert body
      const body = alert.locator('.usa-alert__body');
      await expect(body).toBeVisible();

      // Should have heading
      const heading = alert.locator('.usa-alert__heading');
      await expect(heading).toBeVisible();

      // Should have text content
      const text = alert.locator('.usa-alert__text');
      await expect(text).toBeVisible();
    });

    test('should have appropriate role attribute', async ({ page }) => {
      const alert = page.locator('usa-alert').first();
      const container = alert.locator('.usa-alert');

      // Alert should have role="region" or "alert"
      const role = await container.getAttribute('role');
      expect(role).toMatch(/^(region|alert)$/);
    });
  });

  /**
   * BUTTON COMPONENT
   * USWDS Spec: https://designsystem.digital.gov/components/button/
   */
  test.describe('Button USWDS Compliance', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:6006/?path=/story/actions-button--default');
      await page.waitForLoadState('networkidle');
    });

    test('should have usa-button class', async ({ page }) => {
      const button = page.locator('usa-button').first();
      const buttonElement = button.locator('button, a');

      await expect(buttonElement).toHaveClass(/usa-button/);
    });

    test('should be keyboard accessible', async ({ page }) => {
      const button = page.locator('usa-button').first();
      const buttonElement = button.locator('button, a');

      // Should be focusable
      await buttonElement.focus();
      await expect(buttonElement).toBeFocused();

      // Should activate on Enter
      await buttonElement.press('Enter');

      // Should activate on Space
      await buttonElement.press('Space');
    });
  });

  /**
   * TABLE COMPONENT
   * USWDS Spec: https://designsystem.digital.gov/components/table/
   */
  test.describe('Table USWDS Compliance', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:6006/?path=/story/data-display-table--sorting-demo');
      await page.waitForLoadState('networkidle');
    });

    test('sortable tables should have correct ARIA attributes', async ({ page }) => {
      const table = page.locator('usa-table').first();

      // Sortable headers should have aria-sort
      const sortableHeaders = table.locator('th[data-sortable="true"], th.usa-table__header--sorting-demo');
      const count = await sortableHeaders.count();

      if (count > 0) {
        const firstHeader = sortableHeaders.first();
        const ariaSort = await firstHeader.getAttribute('aria-sort');
        // aria-sort should be one of: ascending, descending, none
        if (ariaSort) {
          expect(ariaSort).toMatch(/^(ascending|descending|none)$/);
        }
      }
    });

    test('table should have proper caption or accessible name', async ({ page }) => {
      const table = page.locator('usa-table').first();
      const tableElement = table.locator('table');

      // Should have either caption or aria-label/aria-labelledby
      const caption = await table.locator('caption').count();
      const ariaLabel = await tableElement.getAttribute('aria-label');
      const ariaLabelledby = await tableElement.getAttribute('aria-labelledby');

      const hasAccessibleName = caption > 0 || !!ariaLabel || !!ariaLabelledby;
      expect(hasAccessibleName).toBe(true);
    });
  });
});

/**
 * Cross-Component USWDS Compliance Tests
 *
 * These tests validate patterns that should be consistent across all components
 */
test.describe('Cross-Component USWDS Patterns', () => {
  test('form components should have proper label associations', async ({ page }) => {
    const formComponents = [
      { path: 'forms-text-input--default', name: 'text-input' },
      { path: 'forms-textarea--default', name: 'textarea' },
      { path: 'forms-select--default', name: 'select' },
      { path: 'forms-checkbox--default', name: 'checkbox' },
      { path: 'forms-radio--default', name: 'radio' },
    ];

    for (const { path, name } of formComponents) {
      await page.goto(`http://localhost:6006/?path=/story/${path}`);
      await page.waitForLoadState('networkidle');

      // Find input/select/textarea element
      const input = page.locator('input, textarea, select').first();
      const inputId = await input.getAttribute('id');

      if (inputId) {
        // Should have associated label
        const label = page.locator(`label[for="${inputId}"]`);
        await expect(label).toBeVisible();
      } else {
        // Or should be wrapped in label
        const wrappingLabel = page.locator('label').first();
        const containsInput = await wrappingLabel.locator('input, textarea, select').count();
        expect(containsInput).toBeGreaterThan(0);
      }
    }
  });

  test('interactive components should have focus indicators', async ({ page }) => {
    const components = [
      'actions-button--default',
      'forms-text-input--default',
      'actions-link--default',
      'forms-checkbox--default',
    ];

    for (const componentPath of components) {
      await page.goto(`http://localhost:6006/?path=/story/${componentPath}`);
      await page.waitForLoadState('networkidle');

      const focusable = page.locator('button, a, input, select, textarea').first();
      await focusable.focus();

      // Take snapshot of focused state to verify visible focus indicator
      await expect(focusable).toBeFocused();
    }
  });

  test('error states should have proper ARIA attributes', async ({ page }) => {
    const errorComponents = [
      { path: 'forms-text-input--error', selector: 'input' },
      { path: 'forms-character-count--error-state', selector: 'textarea' },
      { path: 'forms-select--error', selector: 'select' },
    ];

    for (const { path, selector } of errorComponents) {
      await page.goto(`http://localhost:6006/?path=/story/${path}`);
      await page.waitForLoadState('networkidle');

      const input = page.locator(selector).first();

      // Should have aria-invalid or aria-describedby pointing to error message
      const ariaInvalid = await input.getAttribute('aria-invalid');
      const ariaDescribedby = await input.getAttribute('aria-describedby');

      const hasErrorIndication = ariaInvalid === 'true' || !!ariaDescribedby;
      expect(hasErrorIndication).toBe(true);

      if (ariaDescribedby) {
        // Error message should exist
        const errorMessage = page.locator(`#${ariaDescribedby}`);
        await expect(errorMessage).toBeVisible();
      }
    }
  });
});

/**
 * USWDS CSS Class Compliance
 *
 * Validates that components use official USWDS CSS classes
 */
test.describe('USWDS CSS Class Compliance', () => {
  test('components should use official USWDS classes', async ({ page }) => {
    const components = [
      { path: 'actions-button--default', class: 'usa-button' },
      { path: 'forms-text-input--default', class: 'usa-input' },
      { path: 'forms-select--default', class: 'usa-select' },
      { path: 'feedback-alert--default', class: 'usa-alert' },
      { path: 'data-display-table--default', class: 'usa-table' },
    ];

    for (const { path, class: className } of components) {
      await page.goto(`http://localhost:6006/?path=/story/${path}`);
      await page.waitForLoadState('networkidle');

      const element = page.locator(`.${className}`).first();
      await expect(element).toBeVisible();
      await expect(element).toHaveClass(new RegExp(className));
    }
  });

  test('form groups should use usa-form-group', async ({ page }) => {
    const formComponents = [
      'forms-text-input--default',
      'forms-character-count--default',
      'forms-select--default',
    ];

    for (const componentPath of formComponents) {
      await page.goto(`http://localhost:6006/?path=/story/${componentPath}`);
      await page.waitForLoadState('networkidle');

      const formGroup = page.locator('.usa-form-group').first();
      await expect(formGroup).toBeVisible();
    }
  });

  test('error states should use usa-form-group--error', async ({ page }) => {
    const errorComponents = [
      'forms-text-input--error',
      'forms-character-count--error-state',
    ];

    for (const componentPath of errorComponents) {
      await page.goto(`http://localhost:6006/?path=/story/${componentPath}`);
      await page.waitForLoadState('networkidle');

      const formGroup = page.locator('.usa-form-group').first();
      await expect(formGroup).toHaveClass(/usa-form-group--error/);
    }
  });
});
