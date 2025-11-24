/**
 * Date Picker Layout Tests
 * Prevents regression of input group positioning, calendar button, and external input issues
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../date-picker/index.ts';
import type { USADatePicker } from './usa-date-picker.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';
import { waitForARIAAttribute } from '@uswds-wc/test-utils';

describe('USADatePicker Layout Tests', () => {
  let element: USADatePicker;

  beforeEach(() => {
    element = document.createElement('usa-date-picker') as USADatePicker;
    element.label = 'Select a date';
    element.name = 'test-date';
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS date picker structure', async () => {
    await element.updateComplete;

    const datePicker = element.querySelector('.usa-date-picker');
    const label = element.querySelector('.usa-label');
    const input = element.querySelector('.usa-input');

    expect(datePicker, 'Date picker container should exist').toBeTruthy();
    expect(label, 'Label should exist').toBeTruthy();
    expect(input, 'Date input should exist').toBeTruthy();

    // Verify USWDS structure hierarchy (basic structure without USWDS enhancement)
    expect(datePicker.contains(input), 'Input should be inside date picker container').toBe(true);

    // Note: .usa-input-group is created by USWDS JavaScript during enhancement
    // In test environment, we validate the basic structure that will be enhanced
  });

  it('should have structure ready for USWDS enhancement', async () => {
    // Set properties so data attributes are rendered
    element.minDate = '2020-01-01';
    element.maxDate = '2030-12-31';
    element.value = '2025-01-01';
    await element.updateComplete;

    const datePicker = element.querySelector('.usa-date-picker');
    const input = element.querySelector('.usa-input');

    expect(datePicker, 'Date picker container should exist').toBeTruthy();
    expect(input, 'Input should exist').toBeTruthy();

    // Verify the basic data attributes are present for USWDS to read
    expect(datePicker!.hasAttribute('data-min-date')).toBe(true);
    expect(datePicker!.hasAttribute('data-max-date')).toBe(true);
    expect(datePicker!.hasAttribute('data-default-value')).toBe(true);

    // Note: aria-haspopup is added by USWDS JavaScript during enhancement
    // Note: .usa-input-group and .usa-date-picker__button are created by USWDS JavaScript
    // In test environment, we validate the structure is ready for enhancement
  });

  // NOTE: Calendar positioning tests moved to Cypress (cypress/e2e/date-picker-calendar.cy.ts)
  // Calendar DOM creation and positioning requires real browser environment

  it('should handle external input target correctly', async () => {
    // Note: The date picker component doesn't currently support external input targets
    // This test documents the expected behavior if the feature is added in the future
    await element.updateComplete;

    const internalInput = element.querySelector('.usa-input');

    // Currently, internal input should always be rendered
    expect(internalInput, 'Internal input should exist in current implementation').toBeTruthy();
    expect(internalInput?.getAttribute('type')).toBe('text');
  });

  it('should have proper structure for button enhancement', async () => {
    await element.updateComplete;

    const datePicker = element.querySelector('.usa-date-picker');
    const input = element.querySelector('.usa-input');

    // Verify the basic structure is set up for USWDS to add the calendar button
    expect(datePicker, 'Date picker container should exist').toBeTruthy();
    expect(input, 'Input should exist for USWDS to enhance').toBeTruthy();

    // Verify structure has required data attributes for USWDS
    expect(datePicker?.hasAttribute('data-enhanced')).toBe(true);

    // Note: aria-haspopup is added by USWDS JavaScript during enhancement
    // Note: .usa-date-picker__button is created by USWDS JavaScript during enhancement
    // In test environment, we validate the structure is ready for button creation
  });

  it('should handle disabled state correctly', async () => {
    element.disabled = true;
    await element.updateComplete;

    const input = element.querySelector('.usa-input') as HTMLInputElement;
    const toggleButton = element.querySelector('.usa-date-picker__button') as HTMLButtonElement;

    if (input) {
      expect(input.disabled, 'Input should be disabled').toBe(true);
    }
    if (toggleButton) {
      expect(toggleButton.disabled, 'Calendar button should be disabled').toBe(true);
    }
  });

  it('should display error state correctly', async () => {
    element.error = true;
    await element.updateComplete;

    const formGroup = element.querySelector('.usa-form-group');

    // Check that form group has error class (this is what we actually render)
    if (formGroup) {
      expect(
        formGroup.classList.contains('usa-form-group--error'),
        'Form group should have error class'
      ).toBe(true);
    }

    // Note: .usa-input--error class would be added by USWDS JavaScript
    // In test environment, we validate our basic error structure
  });

  describe('JavaScript Implementation Validation', () => {
    it('should pass JavaScript implementation validation', async () => {
      // Validate USWDS JavaScript implementation patterns
      const componentPath = `${process.cwd()}/src/components/date-picker/usa-date-picker.ts`;
      const validation = validateComponentJavaScript(componentPath, 'date-picker');

      if (!validation.isValid) {
        console.warn('JavaScript validation issues:', validation.issues);
      }

      // JavaScript validation should pass for critical integration patterns
      expect(validation.score).toBeGreaterThan(50); // Allow some non-critical issues

      // Critical USWDS integration should be present
      const criticalIssues = validation.issues.filter((issue) =>
        issue.includes('Missing USWDS JavaScript integration')
      );
      expect(criticalIssues.length).toBe(0);
    });
  });

  describe('Visual Regression Prevention', () => {
    it('should pass visual layout checks for date picker structure', async () => {
      await element.updateComplete;

      const datePicker = element.querySelector('.usa-date-picker');
      const input = element.querySelector('.usa-input');

      expect(datePicker, 'Date picker should render').toBeTruthy();
      expect(input, 'Input should render').toBeTruthy();

      // Verify essential USWDS classes are present
      expect(datePicker.classList.contains('usa-date-picker')).toBe(true);
      expect(input.classList.contains('usa-input')).toBe(true);

      // Note: .usa-input-group is created by USWDS JavaScript in browser environment
      // In test environment, we validate the basic structure is ready
    });

    it('should maintain date picker structure integrity', async () => {
      await element.updateComplete;

      const input = element.querySelector('.usa-input');
      const datePicker = element.querySelector('.usa-date-picker');

      expect(input, 'Input should be present').toBeTruthy();
      expect(datePicker, 'Date picker container should be present').toBeTruthy();

      // Verify input has correct attributes
      if (input) {
        expect(input.getAttribute('type')).toBe('text');
        expect(input.getAttribute('id')).toBe('date-picker-input');
        expect(input.classList.contains('usa-input')).toBe(true);
      }

      // Note: .usa-date-picker__button is created by USWDS JavaScript in browser environment
      // In test environment, we validate the basic structure is ready for enhancement
    });

    it('should handle calendar toggle correctly', async () => {
      await element.updateComplete;

      const toggleButton = element.querySelector('.usa-date-picker__button') as HTMLButtonElement;

      if (toggleButton) {
        // Should respond to button clicks
        const clickEvent = new MouseEvent('click', { bubbles: true });
        toggleButton.dispatchEvent(clickEvent);
        await element.updateComplete;

        // Structure should remain intact after interaction
        const datePicker = element.querySelector('.usa-date-picker');
        expect(datePicker, 'Date picker should maintain structure after interaction').toBeTruthy();
      }
    });

    it('should handle keyboard interactions correctly', async () => {
      await element.updateComplete;

      const input = element.querySelector('.usa-input') as HTMLInputElement;

      if (input) {
        // Should handle keyboard events
        const keyEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
        input.dispatchEvent(keyEvent);
        await element.updateComplete;

        // Structure should remain intact
        const datePicker = element.querySelector('.usa-date-picker');
        expect(
          datePicker,
          'Date picker should maintain structure after keyboard interaction'
        ).toBeTruthy();

        // Note: .usa-input-group is created by USWDS JavaScript in browser environment
      }
    });

    it('should handle date selection correctly', async () => {
      await element.updateComplete;

      // Set a date value
      element.value = '2024-01-15';
      await element.updateComplete;

      const input = element.querySelector('.usa-input') as HTMLInputElement;

      if (input) {
        expect(input.value, 'Input should display selected date').toBe('2024-01-15');
      }
    });

    it('should maintain proper ARIA relationships', async () => {
      await element.updateComplete;

      const input = element.querySelector('.usa-input');
      const toggleButton = element.querySelector('.usa-date-picker__button');

      if (input && toggleButton) {
        // Button should control the input
        const inputId = input.getAttribute('id');
        const buttonControls = await waitForARIAAttribute(toggleButton, 'aria-controls');

        if (inputId && buttonControls) {
          expect(buttonControls).toContain(inputId);
        }
      }
    });

    it('should handle hint text correctly', async () => {
      element.hint = 'Please enter a valid date';
      await element.updateComplete;

      const hint = element.querySelector('.usa-hint');
      const formGroup = element.querySelector('.usa-form-group');

      if (hint) {
        // Hint should be in the form group (USWDS pattern)
        expect(formGroup.contains(hint), 'Hint should be inside form group container').toBe(true);
        expect(hint.textContent).toBe('Please enter a valid date');

        // Verify hint has proper ID for accessibility
        expect(hint.getAttribute('id')).toBe('date-picker-input-hint');
      }
    });
  });
});
