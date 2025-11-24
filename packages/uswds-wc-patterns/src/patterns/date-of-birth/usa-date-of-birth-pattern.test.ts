import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { USADateOfBirthPattern } from './usa-date-of-birth-pattern.js';
import type { DateOfBirthData } from './usa-date-of-birth-pattern.js';

// Register the component
if (!customElements.get('usa-date-of-birth-pattern')) {
  customElements.define('usa-date-of-birth-pattern', USADateOfBirthPattern);
}

describe('USADateOfBirthPattern', () => {
  let element: USADateOfBirthPattern;

  beforeEach(async () => {
    element = document.createElement('usa-date-of-birth-pattern') as USADateOfBirthPattern;
    document.body.appendChild(element);
    await element.updateComplete;
  });

  afterEach(() => {
    element.remove();
  });

  describe('Initialization', () => {
    it('should create element', () => {
      expect(element).toBeInstanceOf(USADateOfBirthPattern);
    });

    it('should use Light DOM', () => {
      expect(element.shadowRoot).toBeNull();
    });

    it('should have default label', () => {
      expect(element.label).toBe('Date of birth');
    });

    it('should be required by default', () => {
      expect(element.required).toBe(true);
    });

    it('should have default hint', () => {
      expect(element.hint).toBe('For example: January 19 2000');
    });

    it('should fire pattern-ready event on first update', async () => {
      const element2 = document.createElement('usa-date-of-birth-pattern') as USADateOfBirthPattern;

      const readyPromise = new Promise((resolve) => {
        element2.addEventListener('pattern-ready', (e: Event) => {
          resolve((e as CustomEvent).detail);
        });
      });

      document.body.appendChild(element2);
      await element2.updateComplete;

      const detail = await readyPromise;
      expect(detail).toHaveProperty('dobData');

      element2.remove();
    });
  });

  describe('USWDS Styling', () => {
    it('should use usa-fieldset wrapper', () => {
      const fieldset = element.querySelector('.usa-fieldset');
      expect(fieldset).toBeTruthy();
      expect(fieldset?.tagName.toLowerCase()).toBe('fieldset');
    });

    it('should use usa-legend--large for pattern header', () => {
      const legend = element.querySelector('.usa-legend');
      expect(legend).toBeTruthy();
      expect(legend?.classList.contains('usa-legend--large')).toBe(true);
    });

    it('should use usa-memorable-date wrapper', () => {
      const memorableDate = element.querySelector('.usa-memorable-date');
      expect(memorableDate).toBeTruthy();
    });
  });

  describe('Properties', () => {
    it('should update label', async () => {
      element.label = 'Birth Date';
      await element.updateComplete;

      const legend = element.querySelector('.usa-legend--large');
      expect(legend?.textContent).toBe('Birth Date');
    });

    it('should update required', async () => {
      element.required = false;
      await element.updateComplete;

      const monthSelect = element.querySelector('usa-select[name="date_of_birth_month"]');
      expect(monthSelect?.hasAttribute('required')).toBe(false);
    });

    it('should update hint', async () => {
      element.hint = 'MM/DD/YYYY format';
      await element.updateComplete;

      const hint = element.querySelector('.usa-hint');
      expect(hint?.textContent).toBe('MM/DD/YYYY format');
    });

    it('should show hint when provided', async () => {
      element.hint = 'Enter your date of birth';
      await element.updateComplete;

      const hint = element.querySelector('.usa-hint');
      expect(hint).toBeTruthy();
    });
  });

  describe('Month Select Field', () => {
    it('should render month select', () => {
      const monthSelect = element.querySelector('usa-select[name="date_of_birth_month"]');
      expect(monthSelect).toBeTruthy();
    });

    it('should have 13 month options (including default)', () => {
      const monthSelect = element.querySelector('usa-select[name="date_of_birth_month"]');
      const options = monthSelect?.querySelectorAll('option');
      expect(options?.length).toBe(13); // "- Select -" + 12 months
    });

    it('should have correct month values', () => {
      const monthSelect = element.querySelector('usa-select[name="date_of_birth_month"]');
      const janOption = Array.from(monthSelect?.querySelectorAll('option') || []).find(
        (opt) => (opt as HTMLOptionElement).value === '01'
      ) as HTMLOptionElement;

      expect(janOption).toBeTruthy();
      expect(janOption?.textContent).toContain('January');
    });

    it('should update data on month change', async () => {
      const monthSelect = element.querySelector('usa-select[name="date_of_birth_month"]') as any;
      const select = monthSelect?.querySelector('select') as HTMLSelectElement;

      select.value = '03';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      await element.updateComplete;

      const data = element.getDateOfBirthData();
      expect(data.month).toBe('03');
    });

    it('should fire dob-change event on month change', async () => {
      const changePromise = new Promise((resolve) => {
        element.addEventListener('dob-change', (e: Event) => {
          resolve((e as CustomEvent).detail);
        });
      });

      const monthSelect = element.querySelector('usa-select[name="date_of_birth_month"]') as any;
      const select = monthSelect?.querySelector('select') as HTMLSelectElement;

      select.value = '05';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      await element.updateComplete;

      const detail = (await changePromise) as any;
      expect(detail.field).toBe('month');
      expect(detail.value).toBe('05');
    });
  });

  describe('Day Input Field', () => {
    it('should render day input', () => {
      const dayInput = element.querySelector('usa-text-input[name="date_of_birth_day"]');
      expect(dayInput).toBeTruthy();
    });

    it('should have correct day input attributes', () => {
      const dayInput = element.querySelector('usa-text-input[name="date_of_birth_day"]');
      expect(dayInput?.getAttribute('type')).toBe('text');
      expect(dayInput?.getAttribute('inputmode')).toBe('numeric');
      expect(dayInput?.getAttribute('pattern')).toBe('[0-9]*');
      expect(dayInput?.getAttribute('maxlength')).toBe('2');
    });

    it('should update data on day input', async () => {
      const dayInput = element.querySelector('usa-text-input[name="date_of_birth_day"]') as any;
      const input = dayInput?.querySelector('input') as HTMLInputElement;

      input.value = '15';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      const data = element.getDateOfBirthData();
      expect(data.day).toBe('15');
    });
  });

  describe('Year Input Field', () => {
    it('should render year input', () => {
      const yearInput = element.querySelector('usa-text-input[name="date_of_birth_year"]');
      expect(yearInput).toBeTruthy();
    });

    it('should have correct year input attributes', () => {
      const yearInput = element.querySelector('usa-text-input[name="date_of_birth_year"]');
      expect(yearInput?.getAttribute('type')).toBe('text');
      expect(yearInput?.getAttribute('inputmode')).toBe('numeric');
      expect(yearInput?.getAttribute('pattern')).toBe('[0-9]*');
      expect(yearInput?.getAttribute('minlength')).toBe('4');
      expect(yearInput?.getAttribute('maxlength')).toBe('4');
    });

    it('should update data on year input', async () => {
      const yearInput = element.querySelector('usa-text-input[name="date_of_birth_year"]') as any;
      const input = yearInput?.querySelector('input') as HTMLInputElement;

      input.value = '1990';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      const data = element.getDateOfBirthData();
      expect(data.year).toBe('1990');
    });
  });

  describe('Public API: getDateOfBirthData', () => {
    it('should return empty date data initially', () => {
      const data = element.getDateOfBirthData();
      expect(data.month).toBeUndefined();
      expect(data.day).toBeUndefined();
      expect(data.year).toBeUndefined();
    });

    it('should return current date data', async () => {
      const monthSelect = element.querySelector('usa-select[name="date_of_birth_month"]') as any;
      const select = monthSelect?.querySelector('select') as HTMLSelectElement;
      select.value = '06';
      select.dispatchEvent(new Event('change', { bubbles: true }));

      const dayInput = element.querySelector('usa-text-input[name="date_of_birth_day"]') as any;
      const dayEl = dayInput?.querySelector('input') as HTMLInputElement;
      dayEl.value = '20';
      dayEl.dispatchEvent(new Event('input', { bubbles: true }));

      const yearInput = element.querySelector('usa-text-input[name="date_of_birth_year"]') as any;
      const yearEl = yearInput?.querySelector('input') as HTMLInputElement;
      yearEl.value = '1985';
      yearEl.dispatchEvent(new Event('input', { bubbles: true }));

      await element.updateComplete;

      const data = element.getDateOfBirthData();
      expect(data.month).toBe('06');
      expect(data.day).toBe('20');
      expect(data.year).toBe('1985');
    });

    it('should return a copy of data', () => {
      const data1 = element.getDateOfBirthData();
      const data2 = element.getDateOfBirthData();

      expect(data1).not.toBe(data2);
      expect(data1).toEqual(data2);
    });
  });

  describe('Public API: setDateOfBirthData', () => {
    it('should set date data', async () => {
      const testData: DateOfBirthData = {
        month: '12',
        day: '25',
        year: '2000',
      };

      element.setDateOfBirthData(testData);
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 0));

      const data = element.getDateOfBirthData();
      expect(data.month).toBe('12');
      expect(data.day).toBe('25');
      expect(data.year).toBe('2000');
    });

    it('should update month select value', async () => {
      element.setDateOfBirthData({ month: '07' });
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 0));

      const monthSelect = element.querySelector('usa-select[name="date_of_birth_month"]') as any;
      expect(monthSelect?.value).toBe('07');
    });

    it('should update day input value', async () => {
      element.setDateOfBirthData({ day: '10' });
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 0));

      const dayInput = element.querySelector('usa-text-input[name="date_of_birth_day"]') as any;
      expect(dayInput?.value).toBe('10');
    });

    it('should update year input value', async () => {
      element.setDateOfBirthData({ year: '1995' });
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 0));

      const yearInput = element.querySelector('usa-text-input[name="date_of_birth_year"]') as any;
      expect(yearInput?.value).toBe('1995');
    });
  });

  describe('Public API: clearDateOfBirth', () => {
    it('should clear date data', async () => {
      element.setDateOfBirthData({ month: '01', day: '01', year: '2000' });
      await element.updateComplete;

      element.clearDateOfBirth();
      await element.updateComplete;

      const data = element.getDateOfBirthData();
      expect(data.month).toBeUndefined();
      expect(data.day).toBeUndefined();
      expect(data.year).toBeUndefined();
    });

    it('should reset all inputs', async () => {
      element.clearDateOfBirth();
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 0));

      const monthSelect = element.querySelector('usa-select[name="date_of_birth_month"]') as any;
      const dayInput = element.querySelector('usa-text-input[name="date_of_birth_day"]') as any;
      const yearInput = element.querySelector('usa-text-input[name="date_of_birth_year"]') as any;

      const select = monthSelect?.querySelector('select') as HTMLSelectElement;
      const dayEl = dayInput?.querySelector('input') as HTMLInputElement;
      const yearEl = yearInput?.querySelector('input') as HTMLInputElement;

      expect(select?.value).toBe('');
      expect(dayEl?.value).toBe('');
      expect(yearEl?.value).toBe('');
    });
  });

  describe('Public API: validateDateOfBirth', () => {
    it('should return true if not required', () => {
      element.required = false;
      expect(element.validateDateOfBirth()).toBe(true);
    });

    it('should return false for empty date when required', () => {
      element.required = true;
      expect(element.validateDateOfBirth()).toBe(false);
    });

    it('should return true for valid date', async () => {
      element.required = true;
      element.setDateOfBirthData({ month: '01', day: '15', year: '1990' });
      await element.updateComplete;

      expect(element.validateDateOfBirth()).toBe(true);
    });

    it('should return false for invalid month', async () => {
      element.setDateOfBirthData({ month: '13', day: '15', year: '1990' });
      await element.updateComplete;

      expect(element.validateDateOfBirth()).toBe(false);
    });

    it('should return false for invalid day', async () => {
      element.setDateOfBirthData({ month: '02', day: '30', year: '1990' });
      await element.updateComplete;

      expect(element.validateDateOfBirth()).toBe(false);
    });

    it('should return false for invalid year (not 4 digits)', async () => {
      element.setDateOfBirthData({ month: '01', day: '15', year: '90' });
      await element.updateComplete;

      expect(element.validateDateOfBirth()).toBe(false);
    });

    it('should validate leap year February 29', async () => {
      // 2000 is a leap year
      element.setDateOfBirthData({ month: '02', day: '29', year: '2000' });
      await element.updateComplete;

      expect(element.validateDateOfBirth()).toBe(true);
    });

    it('should invalidate non-leap year February 29', async () => {
      // 1900 is not a leap year
      element.setDateOfBirthData({ month: '02', day: '29', year: '1900' });
      await element.updateComplete;

      expect(element.validateDateOfBirth()).toBe(false);
    });

    it('should validate leap year February 29 (divisible by 4)', async () => {
      // 2024 is a leap year
      element.setDateOfBirthData({ month: '02', day: '29', year: '2024' });
      await element.updateComplete;

      expect(element.validateDateOfBirth()).toBe(true);
    });

    it('should validate 31 days in months with 31 days', async () => {
      const months31 = ['01', '03', '05', '07', '08', '10', '12'];

      for (const month of months31) {
        element.setDateOfBirthData({ month, day: '31', year: '2000' });
        await element.updateComplete;

        expect(element.validateDateOfBirth()).toBe(true);
      }
    });

    it('should invalidate 31 days in months with 30 days', async () => {
      const months30 = ['04', '06', '09', '11'];

      for (const month of months30) {
        element.setDateOfBirthData({ month, day: '31', year: '2000' });
        await element.updateComplete;

        expect(element.validateDateOfBirth()).toBe(false);
      }
    });
  });

  describe('Public API: getMonth', () => {
    it('should return empty string initially', () => {
      expect(element.getMonth()).toBe('');
    });

    it('should return current month value', async () => {
      element.setDateOfBirthData({ month: '08' });
      await element.updateComplete;

      expect(element.getMonth()).toBe('08');
    });
  });

  describe('Public API: getDay', () => {
    it('should return empty string initially', () => {
      expect(element.getDay()).toBe('');
    });

    it('should return current day value', async () => {
      element.setDateOfBirthData({ day: '22' });
      await element.updateComplete;

      expect(element.getDay()).toBe('22');
    });
  });

  describe('Public API: getYear', () => {
    it('should return empty string initially', () => {
      expect(element.getYear()).toBe('');
    });

    it('should return current year value', async () => {
      element.setDateOfBirthData({ year: '1988' });
      await element.updateComplete;

      expect(element.getYear()).toBe('1988');
    });
  });

  describe('Public API: getFormattedDate', () => {
    it('should return empty string for incomplete date', () => {
      expect(element.getFormattedDate()).toBe('');
    });

    it('should return formatted date MM/DD/YYYY', async () => {
      element.setDateOfBirthData({ month: '03', day: '15', year: '1992' });
      await element.updateComplete;

      expect(element.getFormattedDate()).toBe('03/15/1992');
    });
  });

  describe('Public API: getISODate', () => {
    it('should return empty string for incomplete date', () => {
      expect(element.getISODate()).toBe('');
    });

    it('should return ISO date YYYY-MM-DD', async () => {
      element.setDateOfBirthData({ month: '07', day: '04', year: '1985' });
      await element.updateComplete;

      expect(element.getISODate()).toBe('1985-07-04');
    });
  });

  describe('Accessibility Requirements', () => {
    it('should use type="text" with inputmode="numeric" (NOT type="number")', () => {
      const dayInput = element.querySelector('usa-text-input[name="date_of_birth_day"]');
      const yearInput = element.querySelector('usa-text-input[name="date_of_birth_year"]');

      expect(dayInput?.getAttribute('type')).toBe('text');
      expect(dayInput?.getAttribute('inputmode')).toBe('numeric');
      expect(yearInput?.getAttribute('type')).toBe('text');
      expect(yearInput?.getAttribute('inputmode')).toBe('numeric');
    });

    it('should have visible labels for all fields', () => {
      const monthSelect = element.querySelector('usa-select[name="date_of_birth_month"]');
      const dayInput = element.querySelector('usa-text-input[name="date_of_birth_day"]');
      const yearInput = element.querySelector('usa-text-input[name="date_of_birth_year"]');

      expect(monthSelect?.getAttribute('label')).toBe('Month');
      expect(dayInput?.getAttribute('label')).toBe('Day');
      expect(yearInput?.getAttribute('label')).toBe('Year');
    });

    it('should use fieldset and legend for grouping', () => {
      const fieldset = element.querySelector('fieldset.usa-fieldset');
      const legend = element.querySelector('legend.usa-legend');

      expect(fieldset).toBeTruthy();
      expect(legend).toBeTruthy();
      expect(fieldset?.contains(legend!)).toBe(true);
    });

    it('should have hint associated with fieldset', () => {
      const hint = element.querySelector('.usa-hint');
      const hintId = hint?.id;

      expect(hintId).toBeTruthy();
      expect(hintId).toContain('hint');
    });
  });

  describe('CRITICAL: NO Auto-Advance Focus', () => {
    it('should NOT auto-advance focus from month to day', async () => {
      const monthSelect = element.querySelector('usa-select[name="date_of_birth_month"]') as any;
      const dayInput = element.querySelector('usa-text-input[name="date_of_birth_day"]') as any;

      const select = monthSelect?.querySelector('select') as HTMLSelectElement;
      const dayEl = dayInput?.querySelector('input') as HTMLInputElement;

      // Focus month
      select.focus();
      expect(document.activeElement).toBe(select);

      // Change month value
      select.value = '06';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      await element.updateComplete;

      // Focus should NOT auto-advance to day input
      expect(document.activeElement).not.toBe(dayEl);
    });

    it('should NOT auto-advance focus from day to year', async () => {
      const dayInput = element.querySelector('usa-text-input[name="date_of_birth_day"]') as any;
      const yearInput = element.querySelector('usa-text-input[name="date_of_birth_year"]') as any;

      const dayEl = dayInput?.querySelector('input') as HTMLInputElement;
      const yearEl = yearInput?.querySelector('input') as HTMLInputElement;

      // Focus day
      dayEl.focus();
      expect(document.activeElement).toBe(dayEl);

      // Enter 2 digits in day
      dayEl.value = '25';
      dayEl.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      // Focus should NOT auto-advance to year input
      expect(document.activeElement).not.toBe(yearEl);
    });
  });
});
