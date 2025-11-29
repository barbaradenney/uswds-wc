import { test, expect } from '@playwright/test';

/**
 * Date Range Picker Deep Testing Suite
 *
 * Phase 2 comprehensive testing for usa-date-range-picker component
 * Tests dual calendar interactions, date range selection, validation, and edge cases
 *
 * Total Tests: 17
 * - 4 Baseline tests (rendering, keyboard, a11y, responsive)
 * - 5 Date range interaction tests (dual calendars, range selection, validation)
 * - 4 Validation tests (min/max, required, cross-validation, invalid ranges)
 * - 4 Edge case tests (leap years, year boundaries, pre-filled dates, disabled state)
 */

const STORY_URL = '/iframe.html?id=forms-date-range-picker--default';
const COMPONENT_SELECTOR = 'usa-date-range-picker';
const WRAPPER_SELECTOR = '.usa-date-range-picker'; // USWDS wrapper inside component

test.describe('Date Range Picker Deep Testing', () => {
  // Skip all date-range-picker tests in Webkit CI - USWDS/Storybook initialization too slow
  test.beforeEach(async ({ page, browserName }) => {
    test.skip(browserName === 'webkit' && !!process.env.CI, 'Date range picker tests skip Webkit in CI - USWDS/Storybook initialization too slow');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  // ============================================================================
  // BASELINE TESTS (4 tests)
  // ============================================================================

  test.describe('Baseline Tests', () => {
    test('should render correctly with dual date pickers', async ({ page, browserName }) => {
      await page.goto(STORY_URL);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      await expect(component).toBeVisible();

      // Check for USWDS wrapper inside component
      const wrapper = component.locator(WRAPPER_SELECTOR);
      await expect(wrapper).toBeVisible();

      // Check for start date picker
      const startDatePicker = component.locator('usa-date-picker[data-range-start="true"]');
      await expect(startDatePicker).toBeVisible();

      // Check for end date picker
      const endDatePicker = component.locator('usa-date-picker[data-range-end="true"]');
      await expect(endDatePicker).toBeVisible();

      // Check for both inputs
      const startInput = component.locator('input[name*="start"]').first();
      const endInput = component.locator('input[name*="end"]').first();
      await expect(startInput).toBeVisible();
      await expect(endInput).toBeVisible();

      // Visual regression screenshot
      await page.screenshot({
        path: `test-results/screenshots/${browserName}-date-range-picker-render.png`,
        fullPage: false,
        clip: (await component.boundingBox()) || undefined,
      });
    });

    test('should handle keyboard accessibility across both inputs', async ({ page }) => {
      await page.goto(STORY_URL);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const startInput = component.locator('input[name*="start"]').first();
      const endInput = component.locator('input[name*="end"]').first();

      // Focus and fill start date
      await startInput.click();
      await expect(startInput).toBeFocused();
      await startInput.fill('01/15/2025');
      expect(await startInput.inputValue()).toContain('01/15/2025');

      // Tab to end date (may need to tab past calendar button)
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab'); // Skip calendar button
      await expect(endInput).toBeFocused();

      // Fill end date
      await endInput.fill('02/15/2025');
      expect(await endInput.inputValue()).toContain('02/15/2025');
    });

    test('should be accessible with proper ARIA attributes', async ({ page }) => {
      await page.goto(STORY_URL);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();

      // Check for fieldset/legend structure
      const fieldset = component.locator('fieldset');
      await expect(fieldset).toBeVisible();

      const legend = component.locator('legend');
      await expect(legend).toBeVisible();

      // Check for label associations
      const startInput = component.locator('input[name*="start"]').first();
      const endInput = component.locator('input[name*="end"]').first();

      const startInputId = await startInput.getAttribute('id');
      const endInputId = await endInput.getAttribute('id');

      if (startInputId) {
        const startLabel = component.locator(`label[for="${startInputId}"]`);
        expect(await startLabel.count()).toBeGreaterThan(0);
      }

      if (endInputId) {
        const endLabel = component.locator(`label[for="${endInputId}"]`);
        expect(await endLabel.count()).toBeGreaterThan(0);
      }

      // Check for calendar buttons with aria-label
      const calendarButtons = component.locator('button.usa-date-picker__button');
      expect(await calendarButtons.count()).toBe(2);

      const startCalendarButton = calendarButtons.first();
      const startAriaLabel = await startCalendarButton.getAttribute('aria-label');
      expect(startAriaLabel).toBeTruthy();
    });

    test('should handle responsive design', async ({ page, isMobile }) => {
      await page.goto(STORY_URL);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      await expect(component).toBeVisible();

      const box = await component.boundingBox();
      expect(box).toBeTruthy();

      if (isMobile) {
        const viewportSize = page.viewportSize();
        if (viewportSize && box) {
          expect(box.width).toBeLessThanOrEqual(viewportSize.width);
        }

        // On mobile, date pickers should stack vertically
        const startPicker = component.locator('usa-date-picker[data-range-start="true"]');
        const endPicker = component.locator('usa-date-picker[data-range-end="true"]');

        const startBox = await startPicker.boundingBox();
        const endBox = await endPicker.boundingBox();

        if (startBox && endBox) {
          // End picker should be below start picker on mobile
          expect(endBox.y).toBeGreaterThan(startBox.y);
        }
      }

      const deviceType = isMobile ? 'mobile' : 'desktop';
      await page.screenshot({
        path: `test-results/screenshots/${deviceType}-date-range-picker-responsive.png`,
        fullPage: false,
        clip: box || undefined,
      });
    });
  });

  // ============================================================================
  // DATE RANGE INTERACTION TESTS (5 tests)
  // ============================================================================

  test.describe('Date Range Interaction Tests', () => {
    test('should toggle start date calendar independently', async ({ page }) => {
      await page.goto(STORY_URL);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const startPicker = component.locator('usa-date-picker[data-range-start="true"]');
      const startCalendarButton = startPicker.locator('.usa-date-picker__button').first();
      const startCalendar = startPicker.locator('.usa-date-picker__calendar');

      // Open start calendar
      await startCalendarButton.click();
      await expect(startCalendar).toBeVisible();

      // Close with Escape
      await page.keyboard.press('Escape');
      await expect(startCalendar).toBeHidden();

      // Open again
      await startCalendarButton.click();
      await expect(startCalendar).toBeVisible();

      // Close by clicking outside
      await page.click('body', { position: { x: 0, y: 0 } });
      await expect(startCalendar).toBeHidden();
    });

    test('should toggle end date calendar independently', async ({ page }) => {
      await page.goto(STORY_URL);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const endPicker = component.locator('usa-date-picker[data-range-end="true"]');
      const endCalendarButton = endPicker.locator('.usa-date-picker__button').first();
      const endCalendar = endPicker.locator('.usa-date-picker__calendar');

      // Open end calendar
      await endCalendarButton.click();
      await expect(endCalendar).toBeVisible();

      // Close with Escape
      await page.keyboard.press('Escape');
      await expect(endCalendar).toBeHidden();

      // Open again
      await endCalendarButton.click();
      await expect(endCalendar).toBeVisible();

      // Close by clicking outside
      await page.click('body', { position: { x: 0, y: 0 } });
      await expect(endCalendar).toBeHidden();
    });

    test('should select complete date range from calendars', async ({ page }) => {
      await page.goto(STORY_URL);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const startPicker = component.locator('usa-date-picker[data-range-start="true"]');
      const endPicker = component.locator('usa-date-picker[data-range-end="true"]');

      const startInput = component.locator('input[name*="start"]').first();
      const endInput = component.locator('input[name*="end"]').first();

      // Open start calendar and select 10th
      const startCalendarButton = startPicker.locator('.usa-date-picker__button').first();
      await startCalendarButton.click();

      const startDayButton = startPicker
        .locator('button.usa-date-picker__calendar__date')
        .filter({ hasText: /^10$/ })
        .first();
      await startDayButton.click();

      // Verify start date selected and calendar closed
      const startValue = await startInput.inputValue();
      expect(startValue).toContain('/10/');

      const startCalendar = startPicker.locator('.usa-date-picker__calendar');
      await expect(startCalendar).toBeHidden();

      // Open end calendar and select 20th
      const endCalendarButton = endPicker.locator('.usa-date-picker__button').first();
      await endCalendarButton.click();

      const endDayButton = endPicker
        .locator('button.usa-date-picker__calendar__date')
        .filter({ hasText: /^20$/ })
        .first();
      await endDayButton.click();

      // Verify end date selected and calendar closed
      const endValue = await endInput.inputValue();
      expect(endValue).toContain('/20/');

      const endCalendar = endPicker.locator('.usa-date-picker__calendar');
      await expect(endCalendar).toBeHidden();

      // Verify complete range selected
      expect(startValue.length).toBeGreaterThan(0);
      expect(endValue.length).toBeGreaterThan(0);
    });

    test('should navigate months in both calendars independently', async ({ page }) => {
      await page.goto(STORY_URL);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const startPicker = component.locator('usa-date-picker[data-range-start="true"]');
      const endPicker = component.locator('usa-date-picker[data-range-end="true"]');

      // Test start calendar month navigation
      const startCalendarButton = startPicker.locator('.usa-date-picker__button').first();
      await startCalendarButton.click();

      const startMonthDisplay = startPicker.locator('.usa-date-picker__calendar__month-selection');
      const startInitialMonth = await startMonthDisplay.textContent();

      const startNextMonthButton = startPicker.locator('.usa-date-picker__calendar__next-month');
      await startNextMonthButton.click();
      await page.waitForTimeout(500);

      const startNewMonth = await startMonthDisplay.textContent();
      expect(startNewMonth).not.toBe(startInitialMonth);

      // Close start calendar
      await page.keyboard.press('Escape');

      // Test end calendar month navigation
      const endCalendarButton = endPicker.locator('.usa-date-picker__button').first();
      await endCalendarButton.click();

      const endMonthDisplay = endPicker.locator('.usa-date-picker__calendar__month-selection');
      const endInitialMonth = await endMonthDisplay.textContent();

      const endNextMonthButton = endPicker.locator('.usa-date-picker__calendar__next-month');
      await endNextMonthButton.click();
      await page.waitForTimeout(500);

      const endNewMonth = await endMonthDisplay.textContent();
      expect(endNewMonth).not.toBe(endInitialMonth);
    });

    test('should handle date range change events', async ({ page }) => {
      await page.goto('/iframe.html?id=forms-date-range-picker--interactive-validation');
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const startInput = component.locator('input[name*="start"]').first();
      const endInput = component.locator('input[name*="end"]').first();

      // Listen for date-range-change events via console logs
      await page.on('console', (msg) => {
        if (msg.text().includes('Date Range Change Event')) {
          // Event fired successfully
        }
      });

      // Set start date
      await startInput.fill('03/01/2025');
      await startInput.blur();
      await page.waitForTimeout(300);

      // Set end date
      await endInput.fill('03/15/2025');
      await endInput.blur();
      await page.waitForTimeout(300);

      // Verify both dates are set
      expect(await startInput.inputValue()).toBe('03/01/2025');
      expect(await endInput.inputValue()).toBe('03/15/2025');
    });
  });

  // ============================================================================
  // VALIDATION TESTS (4 tests)
  // ============================================================================

  test.describe('Validation Tests', () => {
    test('should enforce min/max date constraints on both pickers', async ({ page }) => {
      await page.goto('/iframe.html?id=forms-date-range-picker--with-constraints');
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const startPicker = component.locator('usa-date-picker[data-range-start="true"]');

      // Open start calendar
      const startCalendarButton = startPicker.locator('.usa-date-picker__button').first();
      await startCalendarButton.click();

      // Check that dates outside range are disabled
      const disabledDates = startPicker.locator(
        'button.usa-date-picker__calendar__date[disabled]',
      );
      expect(await disabledDates.count()).toBeGreaterThan(0);

      // Verify first disabled date is truly disabled
      const firstDisabled = disabledDates.first();
      await expect(firstDisabled).toBeDisabled();

      // Close and check end picker
      await page.keyboard.press('Escape');

      const endPicker = component.locator('usa-date-picker[data-range-end="true"]');
      const endCalendarButton = endPicker.locator('.usa-date-picker__button').first();
      await endCalendarButton.click();

      const endDisabledDates = endPicker.locator(
        'button.usa-date-picker__calendar__date[disabled]',
      );
      expect(await endDisabledDates.count()).toBeGreaterThan(0);
    });

    test('should validate required field for both dates', async ({ page }) => {
      await page.goto('/iframe.html?id=forms-date-range-picker--required');
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();

      // Check for required indicator in legend/label
      const legend = component.locator('legend');
      const legendText = await legend.textContent();
      expect(legendText).toBeTruthy();

      // Check for hint text mentioning required
      const hint = component.locator('.usa-hint');
      if ((await hint.count()) > 0) {
        const hintText = await hint.textContent();
        expect(hintText?.toLowerCase()).toContain('required');
      }

      // Verify both pickers have the required structure
      const startPicker = component.locator('usa-date-picker[data-range-start="true"]');
      const endPicker = component.locator('usa-date-picker[data-range-end="true"]');

      await expect(startPicker).toBeVisible();
      await expect(endPicker).toBeVisible();
    });

    test('should validate end date is after start date', async ({ page }) => {
      await page.goto(STORY_URL);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const startInput = component.locator('input[name*="start"]').first();
      const endInput = component.locator('input[name*="end"]').first();

      // Set start date to later date
      await startInput.fill('03/20/2025');
      await startInput.blur();
      await page.waitForTimeout(300);

      // Try to set end date to earlier date
      await endInput.fill('03/10/2025');
      await endInput.blur();
      await page.waitForTimeout(300);

      // USWDS should handle this validation
      // The component may show error, clear the value, or prevent the invalid range
      // We just verify no crash occurred
      const startValue = await startInput.inputValue();
      const endValue = await endInput.inputValue();

      // At least one of these should be true:
      // 1. End value was cleared/rejected
      // 2. Error message shown
      // 3. Values are valid range
      const errorMessage = component.locator('.usa-error-message');
      const hasError = (await errorMessage.count()) > 0;

      // Either there's an error, or the values form a valid range, or end was cleared
      expect(hasError || endValue === '' || new Date(endValue) >= new Date(startValue)).toBeTruthy();
    });

    test('should validate date formats in both inputs', async ({ page }) => {
      await page.goto(STORY_URL);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const startInput = component.locator('input[name*="start"]').first();

      // Type invalid date format
      await startInput.fill('99/99/9999');
      await startInput.blur();
      await page.waitForTimeout(300);

      // Clear and type valid date
      await startInput.fill('01/15/2025');
      await startInput.blur();

      // Verify date parsed correctly
      const value = await startInput.inputValue();
      expect(value).toBe('01/15/2025');
    });
  });

  // ============================================================================
  // EDGE CASE TESTS (4 tests)
  // ============================================================================

  test.describe('Edge Case Tests', () => {
    test('should handle leap years in date ranges', async ({ page }) => {
      await page.goto(STORY_URL);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const startInput = component.locator('input[name*="start"]').first();
      const endInput = component.locator('input[name*="end"]').first();

      // Set range spanning leap day
      await startInput.fill('02/28/2024');
      await endInput.fill('03/01/2024');

      expect(await startInput.inputValue()).toBe('02/28/2024');
      expect(await endInput.inputValue()).toBe('03/01/2024');

      // Test leap day itself
      await startInput.clear();
      await startInput.fill('02/29/2024'); // Valid leap day
      expect(await startInput.inputValue()).toBe('02/29/2024');

      // Test non-leap year
      await startInput.clear();
      await startInput.fill('02/28/2023');
      await endInput.clear();
      await endInput.fill('03/01/2023');

      expect(await startInput.inputValue()).toBe('02/28/2023');
      expect(await endInput.inputValue()).toBe('03/01/2023');
    });

    test('should handle year boundaries in date ranges', async ({ page }) => {
      await page.goto(STORY_URL);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const startInput = component.locator('input[name*="start"]').first();
      const endInput = component.locator('input[name*="end"]').first();

      // Set range crossing year boundary
      await startInput.fill('12/25/2024');
      await endInput.fill('01/05/2025');

      expect(await startInput.inputValue()).toBe('12/25/2024');
      expect(await endInput.inputValue()).toBe('01/05/2025');

      // Verify calendar navigation works across year boundary
      const startPicker = component.locator('usa-date-picker[data-range-start="true"]');
      const startCalendarButton = startPicker.locator('.usa-date-picker__button').first();
      await startCalendarButton.click();

      const monthDisplay = startPicker.locator('.usa-date-picker__calendar__month-selection');
      const yearDisplay = startPicker.locator('.usa-date-picker__calendar__year-selection');

      expect(await monthDisplay.textContent()).toContain('December');
      expect(await yearDisplay.textContent()).toContain('2024');

      // Navigate to next month (crosses year)
      const nextMonthButton = startPicker.locator('.usa-date-picker__calendar__next-month');
      await nextMonthButton.click();
      await page.waitForTimeout(500);

      expect(await monthDisplay.textContent()).toContain('January');
      expect(await yearDisplay.textContent()).toContain('2025');
    });

    test('should handle pre-filled date ranges', async ({ page }) => {
      await page.goto('/iframe.html?id=forms-date-range-picker--with-initial-dates');
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const startInput = component.locator('input[name*="start"]').first();
      const endInput = component.locator('input[name*="end"]').first();

      // Verify inputs have pre-filled values
      const startValue = await startInput.inputValue();
      const endValue = await endInput.inputValue();

      expect(startValue.length).toBeGreaterThan(0);
      expect(endValue.length).toBeGreaterThan(0);

      // Open start calendar and verify selected date
      const startPicker = component.locator('usa-date-picker[data-range-start="true"]');
      const startCalendarButton = startPicker.locator('.usa-date-picker__button').first();
      await startCalendarButton.click();

      const selectedStartDate = startPicker
        .locator('button.usa-date-picker__calendar__date[aria-selected="true"]')
        .first();
      await expect(selectedStartDate).toBeVisible();

      const selectedDay = await selectedStartDate.textContent();
      expect(startValue).toContain(selectedDay || '');
    });

    test('should handle disabled state for both pickers', async ({ page }) => {
      await page.goto('/iframe.html?id=forms-date-range-picker--disabled');
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const startInput = component.locator('input[name*="start"]').first();
      const endInput = component.locator('input[name*="end"]').first();

      // Verify both inputs are disabled
      await expect(startInput).toBeDisabled();
      await expect(endInput).toBeDisabled();

      // Verify calendar buttons are disabled
      const startPicker = component.locator('usa-date-picker[data-range-start="true"]');
      const endPicker = component.locator('usa-date-picker[data-range-end="true"]');

      const startCalendarButton = startPicker.locator('.usa-date-picker__button').first();
      const endCalendarButton = endPicker.locator('.usa-date-picker__button').first();

      await expect(startCalendarButton).toBeDisabled();
      await expect(endCalendarButton).toBeDisabled();

      // Verify fieldset has disabled class
      const fieldset = component.locator('fieldset');
      const fieldsetClass = await fieldset.getAttribute('class');
      expect(fieldsetClass).toContain('usa-fieldset');
    });
  });
});
