import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './index.ts';
import type { USATimePicker } from './usa-time-picker.js';
import { waitForARIAAttribute } from '@uswds-wc/test-utils';

/**
 * Browser-dependent tests for USATimePicker
 *
 * These tests require actual browser behavior including:
 * - USWDS JavaScript initialization
 * - Combo box dropdown transformation
 * - Keyboard navigation and filtering
 * - Time option generation
 * - DOM restructuring by USWDS
 *
 * Run with: npm run test:browser
 *
 * NOTE: These tests are skipped in unit test runs to avoid failures
 * in environments where USWDS JavaScript cannot properly initialize.
 */
describe('USATimePicker Browser Tests', () => {
  let element: USATimePicker;
  let container: HTMLElement;

  beforeEach(async () => {
    container = document.createElement('div');
    document.body.appendChild(container);

    element = document.createElement('usa-time-picker') as USATimePicker;
    container.appendChild(element);

    await element.updateComplete;
    // Give USWDS time to initialize
    await new Promise((resolve) => setTimeout(resolve, 300));
  });

  afterEach(() => {
    container.remove();
  });

  describe('Dropdown Functionality', () => {
    it('should open dropdown on toggle button click', async () => {
      const toggle = element.querySelector('.usa-combo-box__toggle-list') as HTMLButtonElement;
      expect(toggle, 'Should have toggle button').toBeTruthy();

      const list = element.querySelector('.usa-combo-box__list') as HTMLElement;
      expect(list, 'Should have list element').toBeTruthy();

      // Click toggle to open
      toggle.click();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(
        list.classList.contains('is-visible') || list.hasAttribute('hidden') === false,
        'List should be visible after toggle click'
      ).toBe(true);
    });

    it('should close dropdown on second toggle button click', async () => {
      const toggle = element.querySelector('.usa-combo-box__toggle-list') as HTMLButtonElement;
      const list = element.querySelector('.usa-combo-box__list') as HTMLElement;

      // Open dropdown
      toggle.click();
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Close dropdown
      toggle.click();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(
        !list.classList.contains('is-visible') || list.hasAttribute('hidden'),
        'List should be hidden after second toggle click'
      ).toBe(true);
    });

    it('should not open dropdown when disabled', async () => {
      element.disabled = true;
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 100));

      const toggle = element.querySelector('.usa-combo-box__toggle-list') as HTMLButtonElement;
      const list = element.querySelector('.usa-combo-box__list') as HTMLElement;

      expect(toggle.disabled, 'Toggle should be disabled').toBe(true);

      toggle.click();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(!list.classList.contains('is-visible'), 'List should not open when disabled').toBe(
        true
      );
    });

    it('should show time options in dropdown', async () => {
      const toggle = element.querySelector('.usa-combo-box__toggle-list') as HTMLButtonElement;

      toggle.click();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const options = element.querySelectorAll('.usa-combo-box__list-option');
      expect(options.length, 'Should have time options in dropdown').toBeGreaterThan(0);
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(async () => {
      const toggle = element.querySelector('.usa-combo-box__toggle-list') as HTMLButtonElement;
      toggle.click();
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    it('should handle arrow down key to navigate options', async () => {
      const input = element.querySelector('.usa-combo-box__input') as HTMLInputElement;
      expect(input, 'Should have input element').toBeTruthy();

      input.focus();
      const arrowDown = new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      });
      input.dispatchEvent(arrowDown);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const options = element.querySelectorAll('.usa-combo-box__list-option');
      const focusedOption = Array.from(options).find((opt) =>
        opt.classList.contains('usa-combo-box__list-option--focused')
      );

      expect(focusedOption, 'Should have focused option after arrow down').toBeTruthy();
    });

    it('should handle arrow up key to navigate options', async () => {
      const input = element.querySelector('.usa-combo-box__input') as HTMLInputElement;

      // Navigate down twice
      input.focus();
      let arrowDown = new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      });
      input.dispatchEvent(arrowDown);
      await new Promise((resolve) => setTimeout(resolve, 50));

      arrowDown = new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      });
      input.dispatchEvent(arrowDown);
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Navigate up
      const arrowUp = new KeyboardEvent('keydown', {
        key: 'ArrowUp',
        bubbles: true,
        cancelable: true,
      });
      input.dispatchEvent(arrowUp);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const options = element.querySelectorAll('.usa-combo-box__list-option');
      expect(options.length, 'Should still have options after navigation').toBeGreaterThan(0);
    });

    it('should handle Enter key to select option', async () => {
      const input = element.querySelector('.usa-combo-box__input') as HTMLInputElement;

      // Navigate to first option
      input.focus();
      const arrowDown = new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      });
      input.dispatchEvent(arrowDown);
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Select with Enter
      const enter = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      });
      input.dispatchEvent(enter);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(input.value, 'Input should have value after selection').toBeTruthy();
    });

    it('should handle Escape key to close dropdown', async () => {
      const input = element.querySelector('.usa-combo-box__input') as HTMLInputElement;
      const list = element.querySelector('.usa-combo-box__list') as HTMLElement;

      input.focus();
      const escape = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      });
      input.dispatchEvent(escape);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(
        !list.classList.contains('is-visible') || list.hasAttribute('hidden'),
        'List should close on Escape'
      ).toBe(true);
    });
  });

  describe('Filtering', () => {
    it('should filter time options based on input', async () => {
      const input = element.querySelector('.usa-combo-box__input') as HTMLInputElement;

      // Focus to open dropdown
      input.focus();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const initialOptions = element.querySelectorAll('.usa-combo-box__list-option');
      const initialCount = initialOptions.length;

      // Type to filter
      input.value = '9';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 200));

      const filteredOptions = element.querySelectorAll('.usa-combo-box__list-option:not([hidden])');

      expect(filteredOptions.length <= initialCount, 'Should filter options based on input').toBe(
        true
      );
    });

    it('should show no results message when no matches', async () => {
      const input = element.querySelector('.usa-combo-box__input') as HTMLInputElement;

      input.focus();
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Type something that won't match
      input.value = 'xyz123';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 200));

      const visibleOptions = element.querySelectorAll('.usa-combo-box__list-option:not([hidden])');

      expect(visibleOptions.length, 'Should have no visible options for invalid filter').toBe(0);
    });

    it('should restore all options when input is cleared', async () => {
      const input = element.querySelector('.usa-combo-box__input') as HTMLInputElement;

      input.focus();
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Filter
      input.value = '9';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Clear
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 200));

      const allOptions = element.querySelectorAll('.usa-combo-box__list-option');
      expect(allOptions.length, 'Should restore all options when cleared').toBeGreaterThan(10);
    });
  });

  describe('Time Options Generation', () => {
    it('should generate time options based on step interval', async () => {
      const options = element.querySelectorAll('.usa-combo-box__list-option');
      expect(options.length, 'Should have generated time options').toBeGreaterThan(0);

      // Default step is 30 minutes, so should have 48 options (00:00, 00:30, 01:00, etc.)
      expect(options.length, 'Should have correct number of options for 30-minute step').toBe(48);
    });

    it('should respect custom step interval', async () => {
      // Create new element with 60-minute step
      element.remove();
      element = document.createElement('usa-time-picker') as USATimePicker;
      element.step = '60';
      container.appendChild(element);

      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 300));

      const options = element.querySelectorAll('.usa-combo-box__list-option');
      expect(options.length, 'Should have 24 options for 60-minute step').toBe(24);
    });

    it('should respect min and max time constraints', async () => {
      // Create new element with time constraints
      element.remove();
      element = document.createElement('usa-time-picker') as USATimePicker;
      element.minTime = '09:00';
      element.maxTime = '17:00';
      element.step = '60';
      container.appendChild(element);

      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 300));

      const options = element.querySelectorAll('.usa-combo-box__list-option');
      const optionValues = Array.from(options).map((opt) => opt.textContent?.trim());

      // Should only have options from 9:00 AM to 5:00 PM
      expect(
        optionValues.some((val) => val?.includes('9:00')),
        'Should include 9:00'
      ).toBe(true);
      expect(
        optionValues.some((val) => val?.includes('5:00')),
        'Should include 5:00'
      ).toBe(true);
      expect(
        optionValues.every((val) => !val?.includes('8:00') && !val?.includes('6:00')),
        'Should not include times outside range'
      ).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have correct ARIA attributes on combo box', async () => {
      const input = element.querySelector('.usa-combo-box__input') as HTMLInputElement;
      const list = element.querySelector('.usa-combo-box__list') as HTMLElement;

      expect(input.getAttribute('role'), 'Input should have combobox role').toBe('combobox');
      expect(
        await waitForARIAAttribute(input, 'aria-expanded'),
        'Should have aria-expanded'
      ).toBeTruthy();
      expect(await waitForARIAAttribute(input, 'aria-controls'), 'Should control list').toBe(
        list.id
      );
    });

    it('should update aria-expanded when dropdown opens/closes', async () => {
      const input = element.querySelector('.usa-combo-box__input') as HTMLInputElement;
      const toggle = element.querySelector('.usa-combo-box__toggle-list') as HTMLButtonElement;

      // Open
      toggle.click();
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(await waitForARIAAttribute(input, 'aria-expanded'), 'Should be expanded').toBe('true');

      // Close
      toggle.click();
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(await waitForARIAAttribute(input, 'aria-expanded'), 'Should be collapsed').toBe(
        'false'
      );
    });

    it('should have correct ARIA attributes on list options', async () => {
      const toggle = element.querySelector('.usa-combo-box__toggle-list') as HTMLButtonElement;
      toggle.click();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const options = element.querySelectorAll('.usa-combo-box__list-option');
      const firstOption = options[0] as HTMLElement;

      expect(firstOption.getAttribute('role'), 'Option should have role').toBe('option');
      expect(firstOption.id, 'Option should have ID').toBeTruthy();
    });
  });

  describe('Form Integration', () => {
    it('should update hidden input value when time is selected', async () => {
      const toggle = element.querySelector('.usa-combo-box__toggle-list') as HTMLButtonElement;
      const input = element.querySelector('.usa-combo-box__input') as HTMLInputElement;

      toggle.click();
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Navigate to first option and select
      input.focus();
      const arrowDown = new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      });
      input.dispatchEvent(arrowDown);
      await new Promise((resolve) => setTimeout(resolve, 50));

      const enter = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      });
      input.dispatchEvent(enter);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(element.value || input.value, 'Should have value after selection').toBeTruthy();
    });

    it('should include value in form submission', async () => {
      const form = document.createElement('form');
      form.appendChild(element);
      container.appendChild(form);

      element.value = '14:30';
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 100));

      const formData = new FormData(form);
      const timeValue = formData.get(element.name);

      expect(timeValue, 'Should include time value in form data').toBeTruthy();
    });

    it('should be invalid when required and empty', async () => {
      element.required = true;
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 100));

      const input = element.querySelector('.usa-combo-box__input') as HTMLInputElement;
      expect(input.required, 'Input should be required').toBe(true);

      // Empty value
      element.value = '';
      input.value = '';
      await element.updateComplete;

      // Check validity
      const isValid = input.checkValidity();
      expect(isValid, 'Should be invalid when required and empty').toBe(false);
    });
  });

  describe('Visual Regression Prevention', () => {
    it('should have correct USWDS structure and classes', async () => {
      const timePicker = element.querySelector('.usa-time-picker') as HTMLElement;
      expect(timePicker, 'Should have usa-time-picker element').toBeTruthy();

      const comboBox = element.querySelector('.usa-combo-box') as HTMLElement;
      expect(comboBox, 'Should have usa-combo-box element').toBeTruthy();

      const input = element.querySelector('.usa-combo-box__input') as HTMLInputElement;
      expect(input, 'Should have combo box input').toBeTruthy();

      const toggle = element.querySelector('.usa-combo-box__toggle-list') as HTMLButtonElement;
      expect(toggle, 'Should have toggle button').toBeTruthy();

      const list = element.querySelector('.usa-combo-box__list') as HTMLElement;
      expect(list, 'Should have list element').toBeTruthy();
    });

    it('should maintain structure after property changes', async () => {
      element.label = 'New Time Label';
      element.hint = 'Select your preferred time';
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 200));

      const timePicker = element.querySelector('.usa-time-picker');
      const comboBox = element.querySelector('.usa-combo-box');
      const input = element.querySelector('.usa-combo-box__input');

      expect(timePicker, 'Should maintain time picker structure').toBeTruthy();
      expect(comboBox, 'Should maintain combo box structure').toBeTruthy();
      expect(input, 'Should maintain input element').toBeTruthy();
    });
  });
});
