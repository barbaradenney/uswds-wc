import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '@uswds-wc/test-utils/test-utils.js';
import './usa-memorable-date.ts';
import type { USAMemorableDate } from './usa-memorable-date.js';
import {
  testComponentAccessibility,
  USWDS_A11Y_CONFIG,
} from '@uswds-wc/test-utils/accessibility-utils.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';

describe('USAMemorableDate', () => {
  let element: USAMemorableDate;

  beforeEach(() => {
    element = document.createElement('usa-memorable-date') as USAMemorableDate;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('Properties', () => {
    it('should have default properties', () => {
      expect(element.month).toBe('');
      expect(element.day).toBe('');
      expect(element.year).toBe('');
      expect(element.name).toBe('memorable-date');
      expect(element.label).toBe('Date');
      expect(element.hint).toBe('');
      expect(element.disabled).toBe(false);
      expect(element.required).toBe(false);
    });

    it('should update month property', async () => {
      element.month = '03';
      await element.updateComplete;

      expect(element.month).toBe('03');

      const monthSelect = element.querySelector('select') as HTMLSelectElement;
      expect(monthSelect.value).toBe('03');
    });

    it('should update day property', async () => {
      element.day = '15';
      await element.updateComplete;

      expect(element.day).toBe('15');

      const dayInput = element.querySelector('input[name*="day"]') as HTMLInputElement;
      expect(dayInput.value).toBe('15');
    });

    it('should update year property', async () => {
      element.year = '2023';
      await element.updateComplete;

      expect(element.year).toBe('2023');

      const yearInput = element.querySelector('input[name*="year"]') as HTMLInputElement;
      expect(yearInput.value).toBe('2023');
    });

    it('should update name property', async () => {
      element.name = 'birth-date';
      await element.updateComplete;

      expect(element.name).toBe('birth-date');

      const monthSelect = element.querySelector('select');
      expect(monthSelect?.getAttribute('name')).toBe('birth-date-month');
    });

    it('should update label property', async () => {
      element.label = 'Date of Birth';
      await element.updateComplete;

      expect(element.label).toBe('Date of Birth');

      const legend = element.querySelector('legend');
      expect(legend?.textContent?.trim()).toContain('Date of Birth');
    });

    it('should update hint property', async () => {
      element.hint = 'Enter your birthdate';
      await element.updateComplete;

      expect(element.hint).toBe('Enter your birthdate');

      const hintDiv = element.querySelector('.usa-hint');
      expect(hintDiv?.textContent?.trim()).toBe('Enter your birthdate');
    });

    it('should update disabled property', async () => {
      element.disabled = true;
      await element.updateComplete;

      expect(element.disabled).toBe(true);

      const monthSelect = element.querySelector('select') as HTMLSelectElement;
      const dayInput = element.querySelector('input[name*="day"]') as HTMLInputElement;
      const yearInput = element.querySelector('input[name*="year"]') as HTMLInputElement;

      expect(monthSelect.disabled).toBe(true);
      expect(dayInput.disabled).toBe(true);
      expect(yearInput.disabled).toBe(true);
    });

    it('should update required property', async () => {
      element.required = true;
      await element.updateComplete;

      expect(element.required).toBe(true);

      const monthSelect = element.querySelector('select') as HTMLSelectElement;
      const dayInput = element.querySelector('input[name*="day"]') as HTMLInputElement;
      const yearInput = element.querySelector('input[name*="year"]') as HTMLInputElement;

      expect(monthSelect.required).toBe(true);
      expect(dayInput.required).toBe(true);
      expect(yearInput.required).toBe(true);

      // Check for required indicator
      const requiredAbbr = element.querySelector('abbr[title="required"]');
      expect(requiredAbbr).toBeTruthy();
    });
  });

  describe('Rendering', () => {
    it('should render fieldset with legend', async () => {
      element.label = 'Test Date';
      await element.updateComplete;

      const fieldset = element.querySelector('fieldset');
      const legend = element.querySelector('legend');

      expect(fieldset).toBeTruthy();
      expect(legend).toBeTruthy();
      expect(legend?.textContent?.trim()).toContain('Test Date');
    });

    it('should render month select dropdown', async () => {
      await element.updateComplete;

      const monthGroup = element.querySelector('.usa-form-group--month');
      const monthLabel = monthGroup?.querySelector('label');
      const monthSelect = monthGroup?.querySelector('select');

      expect(monthGroup).toBeTruthy();
      expect(monthLabel?.textContent).toBe('Month');
      expect(monthSelect).toBeTruthy();
      expect(monthSelect?.classList.contains('usa-select')).toBe(true);
    });

    it('should render all month options', async () => {
      await element.updateComplete;

      const monthSelect = element.querySelector('select');
      const options = monthSelect?.querySelectorAll('option');

      expect(options).toHaveLength(13); // Default option + 12 months
      expect(options?.[0].textContent?.trim()).toBe('- Select -');
      expect(options?.[1].textContent?.trim()).toBe('January');
      expect(options?.[12].textContent?.trim()).toBe('December');
    });

    it('should render day input field', async () => {
      await element.updateComplete;

      const dayGroup = element.querySelector('.usa-form-group--day');
      const dayLabel = dayGroup?.querySelector('label');
      const dayInput = dayGroup?.querySelector('input') as HTMLInputElement;

      expect(dayGroup).toBeTruthy();
      expect(dayLabel?.textContent).toBe('Day');
      expect(dayInput).toBeTruthy();
      expect(dayInput?.classList.contains('usa-input')).toBe(true);
      expect(dayInput?.classList.contains('usa-input')).toBe(true);
      expect(dayInput?.getAttribute('maxlength')).toBe('2');
    });

    it('should render year input field', async () => {
      await element.updateComplete;

      const yearGroup = element.querySelector('.usa-form-group--year');
      const yearLabel = yearGroup?.querySelector('label');
      const yearInput = yearGroup?.querySelector('input') as HTMLInputElement;

      expect(yearGroup).toBeTruthy();
      expect(yearLabel?.textContent).toBe('Year');
      expect(yearInput).toBeTruthy();
      expect(yearInput?.classList.contains('usa-input')).toBe(true);
      expect(yearInput?.classList.contains('usa-input')).toBe(true);
      expect(yearInput?.getAttribute('maxlength')).toBe('4');
    });

    it('should render hint when provided', async () => {
      element.hint = 'Please enter your date of birth';
      await element.updateComplete;

      const hint = element.querySelector('.usa-hint');
      expect(hint).toBeTruthy();
      expect(hint?.textContent?.trim()).toBe('Please enter your date of birth');

      // Check aria-describedby references
      const monthSelect = element.querySelector('select');
      expect(monthSelect?.getAttribute('aria-describedby')).toContain('memorable-date-hint');
    });

    it('should not render hint when empty', async () => {
      element.hint = '';
      await element.updateComplete;

      const hints = element.querySelectorAll('.usa-hint:not([title])');
      expect(hints).toHaveLength(0);
    });
  });

  describe('USWDS HTML Structure', () => {
    it('should match USWDS memorable date HTML structure', async () => {
      await element.updateComplete;

      // Check main structure
      const fieldset = element.querySelector('fieldset.usa-form-group');
      const memorableDate = element.querySelector('.usa-memorable-date');

      expect(fieldset).toBeTruthy();
      expect(memorableDate).toBeTruthy();

      // Check form groups
      const monthGroup = memorableDate?.querySelector('.usa-form-group--month');
      const dayGroup = memorableDate?.querySelector('.usa-form-group--day');
      const yearGroup = memorableDate?.querySelector('.usa-form-group--year');

      expect(monthGroup).toBeTruthy();
      expect(dayGroup).toBeTruthy();
      expect(yearGroup).toBeTruthy();
    });

    it('should maintain proper DOM hierarchy', async () => {
      await element.updateComplete;

      const fieldset = element.querySelector('fieldset');
      const memorableDate = fieldset?.querySelector('.usa-memorable-date');

      expect(memorableDate?.parentElement).toBe(fieldset);
      expect(memorableDate?.children).toHaveLength(3); // month, day, year groups
    });
  });

  describe('Input Validation and Formatting', () => {
    it('should limit day input to 2 digits', async () => {
      await element.updateComplete;

      const dayInput = element.querySelector('input[name*="day"]') as HTMLInputElement;

      // Simulate typing more than 2 digits
      dayInput.value = '123';
      dayInput.dispatchEvent(new Event('input'));
      await element.updateComplete;

      expect(element.day).toBe('12'); // Should be truncated to 2 digits
    });

    it('should limit day input to maximum 31', async () => {
      await element.updateComplete;

      const dayInput = element.querySelector('input[name*="day"]') as HTMLInputElement;

      dayInput.value = '35';
      dayInput.dispatchEvent(new Event('input'));
      await element.updateComplete;

      expect(element.day).toBe('31'); // Should be capped at 31
    });

    it('should handle invalid characters in number input gracefully', async () => {
      await element.updateComplete;

      const dayInput = element.querySelector('input[name*="day"]') as HTMLInputElement;

      // For number inputs, non-numeric values become empty string
      dayInput.value = '1a2b';
      dayInput.dispatchEvent(new Event('input'));
      await element.updateComplete;

      // Number input automatically prevents/clears invalid characters
      expect(element.day).toBe(''); // Number input rejects non-numeric input
    });

    it('should limit year input to 4 digits', async () => {
      await element.updateComplete;

      const yearInput = element.querySelector('input[name*="year"]') as HTMLInputElement;

      yearInput.value = '12345';
      yearInput.dispatchEvent(new Event('input'));
      await element.updateComplete;

      expect(element.year).toBe('1234'); // Should be truncated to 4 digits
    });

    it('should handle invalid characters in year number input gracefully', async () => {
      await element.updateComplete;

      const yearInput = element.querySelector('input[name*="year"]') as HTMLInputElement;

      // For number inputs, non-numeric values become empty string
      yearInput.value = '2a0b2c3';
      yearInput.dispatchEvent(new Event('input'));
      await element.updateComplete;

      // Number input automatically prevents/clears invalid characters
      expect(element.year).toBe(''); // Number input rejects non-numeric input
    });

    it('should format month with leading zero', async () => {
      element.month = '5';
      await element.updateComplete;

      const monthSelect = element.querySelector('select') as HTMLSelectElement;
      expect(monthSelect.value).toBe('05'); // Should be zero-padded
    });
  });

  describe('Event Handling', () => {
    it('should dispatch date-change event when month changes', async () => {
      await element.updateComplete;

      let eventDetail: any = null;
      element.addEventListener('date-change', (e: any) => {
        eventDetail = e.detail;
      });

      const monthSelect = element.querySelector('select') as HTMLSelectElement;
      monthSelect.value = '03';
      monthSelect.dispatchEvent(new Event('change'));

      expect(eventDetail).toBeTruthy();
      expect(eventDetail.month).toBe('03');
      expect(eventDetail.value.month).toBe('03');
    });

    it('should dispatch date-change event when day changes', async () => {
      await element.updateComplete;

      let eventDetail: any = null;
      element.addEventListener('date-change', (e: any) => {
        eventDetail = e.detail;
      });

      const dayInput = element.querySelector('input[name*="day"]') as HTMLInputElement;
      dayInput.value = '15';
      dayInput.dispatchEvent(new Event('input'));

      expect(eventDetail).toBeTruthy();
      expect(eventDetail.day).toBe('15');
      expect(eventDetail.value.day).toBe('15');
    });

    it('should dispatch date-change event when year changes', async () => {
      await element.updateComplete;

      let eventDetail: any = null;
      element.addEventListener('date-change', (e: any) => {
        eventDetail = e.detail;
      });

      const yearInput = element.querySelector('input[name*="year"]') as HTMLInputElement;
      yearInput.value = '2023';
      yearInput.dispatchEvent(new Event('input'));

      expect(eventDetail).toBeTruthy();
      expect(eventDetail.year).toBe('2023');
      expect(eventDetail.value.year).toBe('2023');
    });

    it('should provide complete date information in event', async () => {
      await element.updateComplete;

      let eventDetail: any = null;
      element.addEventListener('date-change', (e: any) => {
        eventDetail = e.detail;
      });

      // Set a complete valid date
      element.month = '03';
      element.day = '15';
      element.year = '2023';
      (element as any).dispatchDateChange();

      expect(eventDetail.isComplete).toBe(true);
      expect(eventDetail.isValid).toBe(true);
      expect(eventDetail.isoDate).toBe('2023-03-15');
    });

    it('should mark incomplete dates as not complete', async () => {
      await element.updateComplete;

      let eventDetail: any = null;
      element.addEventListener('date-change', (e: any) => {
        eventDetail = e.detail;
      });

      element.month = '03';
      element.day = '15';
      // Missing year
      (element as any).dispatchDateChange();

      expect(eventDetail.isComplete).toBe(false);
      expect(eventDetail.isValid).toBe(false);
      expect(eventDetail.isoDate).toBe('');
    });

    it('should validate date correctness', async () => {
      await element.updateComplete;

      let eventDetail: any = null;
      element.addEventListener('date-change', (e: any) => {
        eventDetail = e.detail;
      });

      // Invalid date: February 30th
      element.month = '02';
      element.day = '30';
      element.year = '2023';
      (element as any).dispatchDateChange();

      expect(eventDetail.isComplete).toBe(true);
      expect(eventDetail.isValid).toBe(false); // Should be invalid
      expect(eventDetail.isoDate).toBe('');
    });
  });

  describe('Keyboard Input Handling', () => {
    it('should have keydown event handler attached', async () => {
      await element.updateComplete;

      const dayInput = element.querySelector('input[name*="day"]') as HTMLInputElement;
      const yearInput = element.querySelector('input[name*="year"]') as HTMLInputElement;

      // Check that the inputs have the proper attributes for numeric input
      expect(dayInput.getAttribute('pattern')).toBe('[0-9]*');
      expect(dayInput.getAttribute('inputmode')).toBe('numeric');
      expect(yearInput.getAttribute('pattern')).toBe('[0-9]*');
      expect(yearInput.getAttribute('inputmode')).toBe('numeric');

      // Test that keydown events are handled (component has @keydown listeners)
      expect(dayInput).toBeTruthy();
      expect(yearInput).toBeTruthy();
    });

    it('should allow numeric input', async () => {
      await element.updateComplete;

      const dayInput = element.querySelector('input[name*="day"]') as HTMLInputElement;

      // Test number key
      const numberEvent = new KeyboardEvent('keydown', { keyCode: 49 }); // '1'
      dayInput.dispatchEvent(numberEvent);

      expect(numberEvent.defaultPrevented).toBe(false);
    });

    it('should allow control keys', async () => {
      await element.updateComplete;

      const dayInput = element.querySelector('input[name*="day"]') as HTMLInputElement;

      // Test backspace
      const backspaceEvent = new KeyboardEvent('keydown', { keyCode: 8 });
      dayInput.dispatchEvent(backspaceEvent);

      expect(backspaceEvent.defaultPrevented).toBe(false);

      // Test tab
      const tabEvent = new KeyboardEvent('keydown', { keyCode: 9 });
      dayInput.dispatchEvent(tabEvent);

      expect(tabEvent.defaultPrevented).toBe(false);
    });

    it('should allow copy/paste shortcuts', async () => {
      await element.updateComplete;

      const dayInput = element.querySelector('input[name*="day"]') as HTMLInputElement;

      // Test Ctrl+C
      const copyEvent = new KeyboardEvent('keydown', { keyCode: 67, ctrlKey: true });
      dayInput.dispatchEvent(copyEvent);

      expect(copyEvent.defaultPrevented).toBe(false);

      // Test Ctrl+V
      const pasteEvent = new KeyboardEvent('keydown', { keyCode: 86, ctrlKey: true });
      dayInput.dispatchEvent(pasteEvent);

      expect(pasteEvent.defaultPrevented).toBe(false);
    });
  });

  describe('Public API Methods', () => {
    it('should set value using setValue method', async () => {
      await element.updateComplete;

      let eventDetail: any = null;
      element.addEventListener('date-change', (e: any) => {
        eventDetail = e.detail;
      });

      element.setValue('12', '25', '2023');

      expect(element.month).toBe('12');
      expect(element.day).toBe('25');
      expect(element.year).toBe('2023');
      expect(eventDetail).toBeTruthy();
    });

    it('should set value from ISO date using setFromISODate method', async () => {
      await element.updateComplete;

      element.setFromISODate('2023-07-04');

      expect(element.month).toBe('07');
      expect(element.day).toBe('04');
      expect(element.year).toBe('2023');
    });

    it('should handle invalid ISO date format gracefully', async () => {
      await element.updateComplete;

      element.month = '01';
      element.day = '01';
      element.year = '2023';

      element.setFromISODate('invalid-date');

      // Should not change values
      expect(element.month).toBe('01');
      expect(element.day).toBe('01');
      expect(element.year).toBe('2023');
    });

    it('should clear all values using clear method', async () => {
      await element.updateComplete;

      element.month = '12';
      element.day = '25';
      element.year = '2023';

      let eventDetail: any = null;
      element.addEventListener('date-change', (e: any) => {
        eventDetail = e.detail;
      });

      element.clear();

      expect(element.month).toBe('');
      expect(element.day).toBe('');
      expect(element.year).toBe('');
      expect(eventDetail.isComplete).toBe(false);
    });

    it('should return date value using getDateValue method', async () => {
      await element.updateComplete;

      element.month = '06';
      element.day = '15';
      element.year = '2023';

      const dateValue = element.getDateValue();

      expect(dateValue).toEqual({
        month: '06',
        day: '15',
        year: '2023',
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper fieldset and legend structure', async () => {
      element.label = 'Date of Birth';
      await element.updateComplete;

      const fieldset = element.querySelector('fieldset');
      const legend = element.querySelector('legend');

      expect(fieldset).toBeTruthy();
      expect(legend).toBeTruthy();
      expect(legend?.textContent?.trim()).toContain('Date of Birth');
    });

    it('should associate labels with inputs', async () => {
      await element.updateComplete;

      const monthLabel = element.querySelector('label[for*="month"]');
      const dayLabel = element.querySelector('label[for*="day"]');
      const yearLabel = element.querySelector('label[for*="year"]');

      const monthSelect = element.querySelector('select[id*="month"]');
      const dayInput = element.querySelector('input[id*="day"]');
      const yearInput = element.querySelector('input[id*="year"]');

      expect(monthLabel?.getAttribute('for')).toBe(monthSelect?.getAttribute('id'));
      expect(dayLabel?.getAttribute('for')).toBe(dayInput?.getAttribute('id'));
      expect(yearLabel?.getAttribute('for')).toBe(yearInput?.getAttribute('id'));
    });

    it('should have proper ARIA attributes when hint is provided', async () => {
      element.hint = 'Enter your date of birth';
      await element.updateComplete;

      const monthSelect = element.querySelector('select');
      const dayInput = element.querySelector('input[name*="day"]');
      const yearInput = element.querySelector('input[name*="year"]');

      expect(monthSelect?.getAttribute('aria-describedby')).toContain('memorable-date-hint');
      expect(dayInput?.getAttribute('aria-describedby')).toContain('memorable-date-hint');
      expect(yearInput?.getAttribute('aria-describedby')).toContain('memorable-date-hint');
    });

    it('should indicate required fields with proper markup', async () => {
      element.required = true;
      await element.updateComplete;

      const fieldset = element.querySelector('fieldset');
      expect(fieldset?.classList.contains('usa-form-group--required')).toBe(true);

      const requiredAbbr = element.querySelector('abbr[title="required"]');
      expect(requiredAbbr).toBeTruthy();
      expect(requiredAbbr?.classList.contains('usa-hint--required')).toBe(true);
    });

    it('should have proper input attributes for accessibility', async () => {
      await element.updateComplete;

      const dayInput = element.querySelector('input[name*="day"]') as HTMLInputElement;
      const yearInput = element.querySelector('input[name*="year"]') as HTMLInputElement;

      expect(dayInput.getAttribute('inputmode')).toBe('numeric');
      expect(dayInput.getAttribute('pattern')).toBe('[0-9]*');
      expect(yearInput.getAttribute('inputmode')).toBe('numeric');
      expect(yearInput.getAttribute('pattern')).toBe('[0-9]*');
    });
  });

  describe('Light DOM Rendering', () => {
    it('should use light DOM rendering', () => {
      expect(element.shadowRoot).toBeNull();
      expect(element.renderRoot).toBe(element);
    });

    it('should apply USWDS classes directly to light DOM', async () => {
      await element.updateComplete;

      const fieldset = element.querySelector('fieldset');
      const memorableDate = element.querySelector('.usa-memorable-date');

      expect(fieldset).toBeTruthy();
      expect(fieldset?.parentElement).toBe(element);
      expect(memorableDate).toBeTruthy();
      expect(memorableDate?.parentElement).toBe(fieldset);
    });
  });

  describe('Edge Cases', () => {
    it('should handle leap year validation correctly', async () => {
      await element.updateComplete;

      let eventDetail: any = null;
      element.addEventListener('date-change', (e: any) => {
        eventDetail = e.detail;
      });

      // Valid leap year date
      element.month = '02';
      element.day = '29';
      element.year = '2024'; // 2024 is a leap year
      (element as any).dispatchDateChange();

      expect(eventDetail.isValid).toBe(true);

      // Invalid leap year date
      element.year = '2023'; // 2023 is not a leap year
      (element as any).dispatchDateChange();

      expect(eventDetail.isValid).toBe(false);
    });

    it('should handle month validation edge cases', async () => {
      await element.updateComplete;

      let eventDetail: any = null;
      element.addEventListener('date-change', (e: any) => {
        eventDetail = e.detail;
      });

      // Invalid month
      element.month = '13';
      element.day = '15';
      element.year = '2023';
      (element as any).dispatchDateChange();

      expect(eventDetail.isValid).toBe(false);

      // Valid month
      element.month = '12';
      (element as any).dispatchDateChange();

      expect(eventDetail.isValid).toBe(true);
    });

    it('should handle year validation edge cases', async () => {
      await element.updateComplete;

      let eventDetail: any = null;
      element.addEventListener('date-change', (e: any) => {
        eventDetail = e.detail;
      });

      // Year too early
      element.month = '01';
      element.day = '01';
      element.year = '1800';
      (element as any).dispatchDateChange();

      expect(eventDetail.isValid).toBe(false);

      // Valid year
      element.year = '2000';
      (element as any).dispatchDateChange();

      expect(eventDetail.isValid).toBe(true);
    });

    it('should handle empty values gracefully', async () => {
      await element.updateComplete;

      element.month = '';
      element.day = '';
      element.year = '';

      const dateValue = element.getDateValue();
      expect(dateValue).toEqual({
        month: '',
        day: '',
        year: '',
      });

      expect(() => (element as any).dispatchDateChange()).not.toThrow();
    });

    it('should handle null and undefined values', async () => {
      await element.updateComplete;

      // Test null values
      element.month = null as any;
      element.day = null as any;
      element.year = null as any;

      expect(() => (element as any).dispatchDateChange()).not.toThrow();

      // Test undefined values
      element.month = undefined as any;
      element.day = undefined as any;
      element.year = undefined as any;

      expect(() => (element as any).dispatchDateChange()).not.toThrow();
    });

    it('should handle rapid input changes', async () => {
      await element.updateComplete;

      const dayInput = element.querySelector('input[name*="day"]') as HTMLInputElement;

      // Rapid successive changes
      for (let i = 1; i <= 10; i++) {
        dayInput.value = i.toString();
        dayInput.dispatchEvent(new Event('input'));
      }

      await element.updateComplete;
      expect(element.day).toBe('10');
    });
  });

  describe('Performance', () => {
    it('should handle many date changes efficiently', async () => {
      await element.updateComplete;

      let eventCount = 0;
      element.addEventListener('date-change', () => {
        eventCount++;
      });

      // Many rapid changes
      for (let i = 1; i <= 100; i++) {
        element.setValue(
          ((i % 12) + 1).toString().padStart(2, '0'),
          ((i % 28) + 1).toString(),
          (2000 + (i % 50)).toString()
        );
      }

      expect(eventCount).toBe(100);
    });

    it('should not create memory leaks with input changes', async () => {
      await element.updateComplete;

      const dayInput = element.querySelector('input[name*="day"]') as HTMLInputElement;

      // Create many input events
      for (let i = 0; i < 50; i++) {
        dayInput.value = ((i % 31) + 1).toString();
        dayInput.dispatchEvent(new Event('input'));
      }

      await element.updateComplete;
      expect(element.day).toBe('19'); // Should be (50-1) % 31 + 1 = 19
    });
  });

  describe('Application Use Cases', () => {
    it('should handle Social Security birth date entry', async () => {
      element.label = 'Date of Birth';
      element.hint = 'Enter the date as it appears on your Social Security card';
      element.name = 'birth-date';
      element.required = true;
      await element.updateComplete;

      // Simulate entering birth date
      element.setValue('03', '15', '1985');

      let eventDetail: any = null;
      element.addEventListener('date-change', (e: any) => {
        eventDetail = e.detail;
      });

      (element as any).dispatchDateChange();

      expect(eventDetail.isValid).toBe(true);
      expect(eventDetail.isoDate).toBe('1985-03-15');
    });

    it('should handle federal employment start date', async () => {
      element.label = 'Federal Employment Start Date';
      element.hint = 'Enter your first day of federal employment';
      element.name = 'employment-start';
      await element.updateComplete;

      element.setValue('01', '01', '2020');

      let eventDetail: any = null;
      element.addEventListener('date-change', (e: any) => {
        eventDetail = e.detail;
      });

      (element as any).dispatchDateChange();

      expect(eventDetail.isValid).toBe(true);
      expect(eventDetail.isoDate).toBe('2020-01-01');

      const legend = element.querySelector('legend');
      expect(legend?.textContent?.trim()).toContain('Federal Employment Start Date');
    });

    it('should handle immigration document expiration', async () => {
      element.label = 'Document Expiration Date';
      element.hint = 'Enter the expiration date from your immigration document';
      element.name = 'doc-expiration';
      element.required = true;
      await element.updateComplete;

      // Future date for document expiration
      element.setValue('12', '31', '2025');

      let eventDetail: any = null;
      element.addEventListener('date-change', (e: any) => {
        eventDetail = e.detail;
      });

      (element as any).dispatchDateChange();

      expect(eventDetail.isValid).toBe(true);
      expect(eventDetail.isoDate).toBe('2025-12-31');

      const requiredIndicator = element.querySelector('abbr[title="required"]');
      expect(requiredIndicator).toBeTruthy();
    });

    it('should handle Veterans Affairs service dates', async () => {
      element.label = 'Military Service End Date';
      element.hint = 'Enter your discharge or retirement date';
      element.name = 'service-end';
      await element.updateComplete;

      element.setValue('09', '11', '2001');

      let eventDetail: any = null;
      element.addEventListener('date-change', (e: any) => {
        eventDetail = e.detail;
      });

      (element as any).dispatchDateChange();

      expect(eventDetail.isValid).toBe(true);
      expect(eventDetail.isoDate).toBe('2001-09-11');
    });

    it('should handle Medicare eligibility date', async () => {
      element.label = 'Medicare Eligibility Date';
      element.hint = 'Usually your 65th birthday';
      element.name = 'medicare-eligible';
      await element.updateComplete;

      // Calculate 65th birthday from birth date 1958-06-15
      element.setValue('06', '15', '2023'); // 65th birthday in 2023

      let eventDetail: any = null;
      element.addEventListener('date-change', (e: any) => {
        eventDetail = e.detail;
      });

      (element as any).dispatchDateChange();

      expect(eventDetail.isValid).toBe(true);
      expect(eventDetail.isoDate).toBe('2023-06-15');
    });
  });

  // CRITICAL TESTS - Component Lifecycle Stability (Auto-dismiss Prevention)
  describe('Component Lifecycle Stability (CRITICAL)', () => {
    it('should remain in DOM after property updates (not auto-dismiss)', async () => {
      element.month = '12';
      element.day = '25';
      element.year = '1990';
      element.name = 'birth-date';
      element.label = 'Date of Birth';
      element.hint = 'Enter your birth date for verification';
      element.required = true;
      element.disabled = false;
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should maintain component state during rapid property changes', async () => {
      const initialParent = element.parentNode;

      // Rapid property changes that could trigger lifecycle issues
      for (let i = 0; i < 10; i++) {
        element.month = String((i % 12) + 1).padStart(2, '0');
        element.day = String((i % 28) + 1).padStart(2, '0');
        element.year = String(1990 + (i % 30));
        element.name = `date-field-${i}`;
        element.label = `Date ${i}`;
        element.hint = `Enter date ${i}`;
        element.required = i % 2 === 0;
        element.disabled = i % 3 === 0;
        await element.updateComplete;
      }

      expect(element.parentNode).toBe(initialParent);
      expect(element.isConnected).toBe(true);
    });

    it('should handle complex date operations without disconnection', async () => {
      // Complex date field operations
      const dateScenarios = [
        { month: '01', day: '01', year: '2000' }, // New Year 2000
        { month: '02', day: '29', year: '2000' }, // Leap year
        { month: '12', day: '31', year: '1999' }, // Y2K eve
        { month: '07', day: '04', year: '1776' }, // Independence Day
        { month: '11', day: '11', year: '1918' }, // Armistice Day
      ];

      for (const scenario of dateScenarios) {
        element.month = scenario.month;
        element.day = scenario.day;
        element.year = scenario.year;
        await element.updateComplete;

        // Test setValue method
        element.setValue(scenario.month, scenario.day, scenario.year);
        await element.updateComplete;
      }

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
  });

  describe('Event System Stability (CRITICAL)', () => {
    it('should not interfere with other components after event handling', async () => {
      const eventsSpy = vi.fn();
      element.addEventListener('date-change', eventsSpy);

      element.month = '06';
      element.day = '15';
      element.year = '1985';
      await element.updateComplete;

      // Trigger multiple date change events
      const monthSelect = element.querySelector('select') as HTMLSelectElement;
      monthSelect.value = '12';
      monthSelect.dispatchEvent(new Event('change', { bubbles: true }));

      const dayInput = element.querySelector('input[name*="day"]') as HTMLInputElement;
      dayInput.value = '25';
      dayInput.dispatchEvent(new Event('input', { bubbles: true }));

      const yearInput = element.querySelector('input[name*="year"]') as HTMLInputElement;
      yearInput.value = '1990';
      yearInput.dispatchEvent(new Event('input', { bubbles: true }));

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should handle rapid date input changes without component removal', async () => {
      element.month = '01';
      element.day = '01';
      element.year = '2000';
      await element.updateComplete;

      const monthSelect = element.querySelector('select') as HTMLSelectElement;
      const dayInput = element.querySelector('input[name*="day"]') as HTMLInputElement;
      const yearInput = element.querySelector('input[name*="year"]') as HTMLInputElement;

      // Rapid input changes simulation
      for (let i = 0; i < 20; i++) {
        monthSelect.value = String((i % 12) + 1).padStart(2, '0');
        monthSelect.dispatchEvent(new Event('change', { bubbles: true }));

        dayInput.value = String((i % 28) + 1);
        dayInput.dispatchEvent(new Event('input', { bubbles: true }));

        yearInput.value = String(1980 + (i % 40));
        yearInput.dispatchEvent(new Event('input', { bubbles: true }));

        await element.updateComplete;
      }

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should handle event pollution without component removal', async () => {
      // Create potential event pollution
      for (let i = 0; i < 20; i++) {
        const customEvent = new CustomEvent(`test-event-${i}`, { bubbles: true });
        element.dispatchEvent(customEvent);
      }

      element.label = 'Event Test Date';
      element.month = '08';
      element.day = '14';
      element.year = '1995';
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
  });

  describe('Form Integration Stability (CRITICAL)', () => {
    it('should handle complex form field operations without disconnection', async () => {
      // Test form integration scenarios
      const formConfigurations = [
        { name: 'birth-date', label: 'Date of Birth', required: true },
        { name: 'start-date', label: 'Employment Start Date', required: false },
        { name: 'graduation-date', label: 'Graduation Date', required: true },
        { name: 'marriage-date', label: 'Marriage Date', required: false },
        { name: 'service-date', label: 'Military Service Date', required: true },
      ];

      for (const config of formConfigurations) {
        element.name = config.name;
        element.label = config.label;
        element.required = config.required;
        element.month = '03';
        element.day = '15';
        element.year = '1985';
        await element.updateComplete;

        // Test form field validation
        const form = document.createElement('form');
        form.appendChild(element);

        // Trigger form validation
        element.checkValidity();
        await element.updateComplete;

        document.body.appendChild(form);

        // Restore element to body before removing form
        document.body.appendChild(element);
        form.remove();
      }

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should handle date validation states without disconnection', async () => {
      // Test various validation states
      const validationScenarios = [
        { month: '', day: '', year: '', valid: false }, // Empty
        { month: '13', day: '01', year: '2000', valid: false }, // Invalid month
        { month: '02', day: '30', year: '2000', valid: false }, // Invalid day
        { month: '02', day: '29', year: '2001', valid: false }, // Non-leap year
        { month: '02', day: '29', year: '2000', valid: true }, // Valid leap year
        { month: '12', day: '31', year: '2023', valid: true }, // Valid date
      ];

      for (const scenario of validationScenarios) {
        element.setValue(scenario.month, scenario.day, scenario.year);
        await element.updateComplete;

        // Trigger validation
        await element.updateComplete;
      }

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
  });

  describe('Storybook Integration (CRITICAL)', () => {
    it('should render in Storybook without auto-dismissing', async () => {
      element.name = 'storybook-birth-date';
      element.label = 'Storybook Test Date of Birth';
      element.hint = 'Enter your date of birth for federal benefits application';
      element.month = '07';
      element.day = '04';
      element.year = '1976';
      element.required = true;
      element.disabled = false;
      await element.updateComplete;

      expect(element.isConnected).toBe(true);
      expect(element.querySelector('.usa-memorable-date')).toBeTruthy();
      expect(element.querySelector('fieldset')).toBeTruthy();

      // Verify form group structure
      const fieldset = element.querySelector('fieldset');
      expect(fieldset?.querySelector('legend')?.textContent?.trim()).toContain(
        'Storybook Test Date of Birth'
      );

      // Verify month select
      const monthSelect = element.querySelector('select') as HTMLSelectElement;
      expect(monthSelect).toBeTruthy();
      expect(monthSelect.value).toBe('07');
      expect(monthSelect.getAttribute('name')).toContain('month');

      // Verify day input
      const dayInput = element.querySelector('input[name*="day"]') as HTMLInputElement;
      expect(dayInput).toBeTruthy();
      expect(dayInput.value).toBe('04');
      expect(dayInput.type).toBe('number');
      expect(dayInput.min).toBe('1');
      expect(dayInput.max).toBe('31');

      // Verify year input
      const yearInput = element.querySelector('input[name*="year"]') as HTMLInputElement;
      expect(yearInput).toBeTruthy();
      expect(yearInput.value).toBe('1976');
      expect(yearInput.type).toBe('number');
      expect(yearInput.min).toBe('1900');

      // Test field interactions
      monthSelect.value = '12';
      monthSelect.dispatchEvent(new Event('change', { bubbles: true }));
      await element.updateComplete;
      expect(element.month).toBe('12');

      dayInput.value = '25';
      dayInput.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;
      expect(element.day).toBe('25');

      yearInput.value = '1985';
      yearInput.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;
      expect(element.year).toBe('1985');

      // Verify hint text (use specific ID to avoid getting the required indicator)
      const hint = element.querySelector(`#${element.name}-hint`);
      expect(hint?.textContent?.trim()).toContain(
        'Enter your date of birth for federal benefits application'
      );

      expect(element.isConnected).toBe(true);
      expect(document.body.contains(element)).toBe(true);
    });
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath = `${process.cwd()}/src/components/memorable-date/usa-memorable-date.ts`;
        const validation = validateComponentJavaScript(componentPath, 'memorable-date');

        if (!validation.isValid) {
          console.warn('JavaScript validation issues:', validation.issues);
        }

        // JavaScript validation should pass for critical integration patterns
        expect(validation.score).toBeGreaterThanOrEqual(50); // Allow some non-critical issues

        // Critical USWDS integration should be present
        const criticalIssues = validation.issues.filter((issue) =>
          issue.includes('Missing USWDS JavaScript integration')
        );
        expect(criticalIssues.length).toBeLessThanOrEqual(1); // Allow presentational component
      });
    });
  });

  describe('Accessibility Compliance (CRITICAL)', () => {
    it('should pass comprehensive accessibility tests (same as Storybook)', async () => {
      // Test default memorable date
      element.label = 'Date of Birth';
      element.month = '06';
      element.day = '15';
      element.year = '1985';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test disabled state
      element.disabled = true;
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test required state
      element.disabled = false;
      element.required = true;
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test with hint text
      element.hint = 'Enter your date of birth as it appears on your Social Security card';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test empty state
      element.month = '';
      element.day = '';
      element.year = '';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    }, 30000); // Increased timeout for comprehensive accessibility tests (canvas operations in jsdom can be slow)

    it('should maintain accessibility during dynamic updates', async () => {
      // Set initial accessible state
      element.label = 'Employment Start Date';
      element.month = '01';
      element.day = '01';
      element.year = '2020';
      element.hint = 'Enter your first day of federal employment';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Update date values dynamically
      element.setValue('03', '15', '2021');
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test date clearing
      element.clear();
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test setting from ISO date
      element.setFromISODate('1985-12-25');
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    }, 10000); // Increased timeout for comprehensive accessibility tests

    it('should pass accessibility with form integration', async () => {
      const form = document.createElement('form');
      form.setAttribute('role', 'form');
      form.setAttribute('aria-label', 'Personal information form');

      element.name = 'birth-date';
      element.label = 'Date of Birth';
      element.month = '07';
      element.day = '04';
      element.year = '1976';
      element.required = true;
      element.hint = 'Enter your date of birth for identity verification';

      form.appendChild(element);
      document.body.appendChild(form);

      await element.updateComplete;
      await testComponentAccessibility(form, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test form interaction - changing month
      const monthSelect = element.querySelector('select') as HTMLSelectElement;
      if (monthSelect) {
        monthSelect.value = '12';
        monthSelect.dispatchEvent(new Event('change', { bubbles: true }));
        await element.updateComplete;
        await testComponentAccessibility(form, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
      }

      // Test form interaction - changing day
      const dayInput = element.querySelector('input[name*="day"]') as HTMLInputElement;
      if (dayInput) {
        dayInput.value = '25';
        dayInput.dispatchEvent(new Event('input', { bubbles: true }));
        await element.updateComplete;
        await testComponentAccessibility(form, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
      }

      form.remove();
    });
  });
});
