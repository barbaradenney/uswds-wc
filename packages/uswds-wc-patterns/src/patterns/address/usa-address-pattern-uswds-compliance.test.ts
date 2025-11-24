import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '@uswds-wc/test-utils/test-utils.js';
import './usa-address-pattern.js';
import type { USAAddressPattern } from './usa-address-pattern.js';

/**
 * USWDS HTML Structure Compliance Tests
 *
 * These tests ensure the address pattern renders HTML that exactly matches
 * the official USWDS pattern documentation.
 *
 * Reference: https://designsystem.digital.gov/patterns/create-a-user-profile/address/
 */
describe('USAAddressPattern - USWDS Compliance', () => {
  let pattern: USAAddressPattern;
  let container: HTMLDivElement;

  beforeEach(async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    pattern = document.createElement('usa-address-pattern') as USAAddressPattern;
    container.appendChild(pattern);
    await pattern.updateComplete;
  });

  afterEach(() => {
    container?.remove();
  });

  describe('Field Labels (Exact USWDS Text)', () => {
    it('should use exact USWDS label for Street address', () => {
      const street1 = pattern.querySelector('usa-text-input[name="street1"]');
      expect(street1?.getAttribute('label')).toBe('Street address');
    });

    it('should use exact USWDS label for Street address line 2', () => {
      const street2 = pattern.querySelector('usa-text-input[name="street2"]');
      expect(street2?.getAttribute('label')).toBe('Street address line 2');
    });

    it('should use exact USWDS label for City', () => {
      const city = pattern.querySelector('usa-text-input[name="city"]');
      expect(city?.getAttribute('label')).toBe('City');
    });

    it('should use exact USWDS label for State', () => {
      const state = pattern.querySelector('usa-select[name="state"]');
      expect(state?.getAttribute('label')).toBe('State, territory, or military post');
    });

    it('should use exact USWDS label for ZIP code', () => {
      const zipCode = pattern.querySelector('usa-text-input[name="zipCode"]');
      expect(zipCode?.getAttribute('label')).toBe('ZIP code');
    });

    it('should use exact USWDS label for Urbanization', () => {
      const urbanization = pattern.querySelector('usa-text-input[name="urbanization"]');
      expect(urbanization?.getAttribute('label')).toBe('Urbanization (Puerto Rico only)');
    });
  });

  describe('Required Fields (USWDS Pattern)', () => {
    it('should have all USWDS-required fields present', () => {
      const street1 = pattern.querySelector('usa-text-input[name="street1"]');
      const city = pattern.querySelector('usa-text-input[name="city"]');
      const state = pattern.querySelector('usa-select[name="state"]');
      const zipCode = pattern.querySelector('usa-text-input[name="zipCode"]');
      const urbanization = pattern.querySelector('usa-text-input[name="urbanization"]');

      expect(street1).toBeTruthy();
      expect(city).toBeTruthy();
      expect(state).toBeTruthy();
      expect(zipCode).toBeTruthy();
      expect(urbanization).toBeTruthy();
    });

    it('should have optional street2 field', () => {
      const street2 = pattern.querySelector('usa-text-input[name="street2"]');
      expect(street2).toBeTruthy();
      expect(street2?.hasAttribute('required')).toBe(false);
    });
  });

  describe('Field Order (Matches USWDS)', () => {
    it('should render fields in correct USWDS order', () => {
      const allInputs = Array.from(pattern.querySelectorAll('usa-text-input, usa-select'));

      const names = allInputs.map((input) => input.getAttribute('name'));

      // Expected order from USWDS documentation
      expect(names.indexOf('street1')).toBeLessThan(names.indexOf('street2'));
      expect(names.indexOf('street2')).toBeLessThan(names.indexOf('city'));
      expect(names.indexOf('city')).toBeLessThan(names.indexOf('state'));
      expect(names.indexOf('state')).toBeLessThan(names.indexOf('zipCode'));
      expect(names.indexOf('zipCode')).toBeLessThan(names.indexOf('urbanization'));
    });
  });

  describe('Compact Mode (Pattern Requirement)', () => {
    it('should use compact mode on all form components', () => {
      const textInputs = pattern.querySelectorAll('usa-text-input');
      textInputs.forEach((input) => {
        expect(input.hasAttribute('compact')).toBe(true);
      });

      const selects = pattern.querySelectorAll('usa-select');
      selects.forEach((select) => {
        expect(select.hasAttribute('compact')).toBe(true);
      });
    });

    it('should not have form-group wrappers (compact mode result)', async () => {
      // Wait for components to render
      await new Promise((resolve) => setTimeout(resolve, 100));

      const formGroups = pattern.querySelectorAll('.usa-form-group');
      expect(formGroups.length).toBe(0);
    });
  });

  describe('Combo-Box Wrapper (USWDS Requirement)', () => {
    it('should wrap select in usa-combo-box div', async () => {
      const selectComponent = pattern.querySelector('usa-select[name="state"]') as any;
      await selectComponent?.updateComplete;

      const comboBox = selectComponent?.querySelector('.usa-combo-box');
      expect(comboBox).toBeTruthy();
      expect(comboBox?.tagName).toBe('DIV');
    });

    it('should have select as direct child of combo-box', async () => {
      const selectComponent = pattern.querySelector('usa-select[name="state"]') as any;
      await selectComponent?.updateComplete;

      const comboBox = selectComponent?.querySelector('.usa-combo-box');
      const select = comboBox?.querySelector('select.usa-select');

      expect(select).toBeTruthy();
      expect(select?.parentElement).toBe(comboBox);
    });
  });

  describe('State/Territory Options (USWDS Complete List)', () => {
    it('should have exactly 61 total options (50 states + DC + 6 territories + 3 military + Select)', async () => {
      const selectComponent = pattern.querySelector('usa-select[name="state"]') as any;
      await selectComponent?.updateComplete;

      const select = selectComponent?.querySelector('select');
      const options = select?.querySelectorAll('option');

      // 50 states + DC + 6 territories (AS, GU, MP, PR, UM, VI) + 3 military (AA, AE, AP) + 1 Select = 61
      expect(options?.length).toBe(61);
    });

    it('should include all US territories', async () => {
      const selectComponent = pattern.querySelector('usa-select[name="state"]') as any;
      await selectComponent?.updateComplete;

      const select = selectComponent?.querySelector('select');
      const optionValues = Array.from(select?.querySelectorAll('option') || []).map(
        (opt: any) => opt.value
      );

      // USWDS requires these territories
      expect(optionValues).toContain('AS'); // American Samoa
      expect(optionValues).toContain('DC'); // District of Columbia
      expect(optionValues).toContain('GU'); // Guam
      expect(optionValues).toContain('MP'); // Northern Mariana Islands
      expect(optionValues).toContain('PR'); // Puerto Rico
      expect(optionValues).toContain('UM'); // United States Minor Outlying Islands
      expect(optionValues).toContain('VI'); // Virgin Islands
    });

    it('should include all military post options', async () => {
      const selectComponent = pattern.querySelector('usa-select[name="state"]') as any;
      await selectComponent?.updateComplete;

      const select = selectComponent?.querySelector('select');
      const optionValues = Array.from(select?.querySelectorAll('option') || []).map(
        (opt: any) => opt.value
      );

      // USWDS requires these military posts
      expect(optionValues).toContain('AA'); // Armed Forces Americas
      expect(optionValues).toContain('AE'); // Armed Forces Europe
      expect(optionValues).toContain('AP'); // Armed Forces Pacific
    });

    it('should use USWDS label format (XX - Full Name)', async () => {
      const selectComponent = pattern.querySelector('usa-select[name="state"]') as any;
      await selectComponent?.updateComplete;

      const select = selectComponent?.querySelector('select');
      const options = Array.from(select?.querySelectorAll('option') || []) as HTMLOptionElement[];

      // Check a few sample states have correct format
      const alabama = options.find((opt) => opt.value === 'AL');
      expect(alabama?.textContent?.trim()).toBe('AL - Alabama');

      const california = options.find((opt) => opt.value === 'CA');
      expect(california?.textContent?.trim()).toBe('CA - California');

      const dc = options.find((opt) => opt.value === 'DC');
      expect(dc?.textContent?.trim()).toBe('DC - District of Columbia');

      const puertoRico = options.find((opt) => opt.value === 'PR');
      expect(puertoRico?.textContent?.trim()).toBe('PR - Puerto Rico');

      const military = options.find((opt) => opt.value === 'AA');
      expect(military?.textContent?.trim()).toBe('AA - Armed Forces Americas');
    });

    it('should have "- Select -" as first option', async () => {
      const selectComponent = pattern.querySelector('usa-select[name="state"]') as any;
      await selectComponent?.updateComplete;

      const select = selectComponent?.querySelector('select');
      const firstOption = select?.querySelector('option') as HTMLOptionElement;

      expect(firstOption?.value).toBe('');
      expect(firstOption?.textContent?.trim()).toBe('- Select -');
    });
  });

  describe('ZIP Code Field (USWDS Specifics)', () => {
    it('should have width="medium" for proper usa-input--medium class', () => {
      const zipCode = pattern.querySelector('usa-text-input[name="zipCode"]');
      expect(zipCode?.getAttribute('width')).toBe('medium');
    });

    it('should render with usa-input--medium class', async () => {
      const zipComponent = pattern.querySelector('usa-text-input[name="zipCode"]') as any;
      await zipComponent?.updateComplete;

      const input = zipComponent?.querySelector('input');
      expect(input?.classList.contains('usa-input--medium')).toBe(true);
    });

    it('should have USWDS ZIP pattern validation', () => {
      const zipCode = pattern.querySelector('usa-text-input[name="zipCode"]');
      expect(zipCode?.getAttribute('pattern')).toBe('[0-9]{5}(-[0-9]{4})?');
    });
  });

  describe('Layout Structure (No Grid Wrappers)', () => {
    it('should not have grid-row wrapper around State/ZIP', () => {
      // Check there's no grid-row div wrapping these fields
      const gridRows = pattern.querySelectorAll('.grid-row');
      expect(gridRows.length).toBe(0);
    });

    it('should stack fields vertically (no grid columns)', () => {
      const gridCols = pattern.querySelectorAll('[class*="grid-col"]');
      expect(gridCols.length).toBe(0);
    });

    it('should have fields as direct children of fieldset', () => {
      const fieldset = pattern.querySelector('fieldset');

      // All form components should be direct children (or siblings) within fieldset
      const formComponents = pattern.querySelectorAll('usa-text-input, usa-select');
      formComponents.forEach((component) => {
        // Check that parent is either fieldset or legend comes before it
        expect(component.parentElement === fieldset || fieldset?.contains(component)).toBe(true);
      });
    });
  });

  describe('Urbanization Field (Puerto Rico)', () => {
    it('should have urbanization field after ZIP code', () => {
      const allInputs = Array.from(pattern.querySelectorAll('usa-text-input, usa-select'));
      const names = allInputs.map((input) => input.getAttribute('name'));

      const zipIndex = names.indexOf('zipCode');
      const urbanizationIndex = names.indexOf('urbanization');

      expect(urbanizationIndex).toBeGreaterThan(zipIndex);
    });

    it('should mark urbanization as optional', () => {
      const urbanization = pattern.querySelector('usa-text-input[name="urbanization"]');
      expect(urbanization?.hasAttribute('required')).toBe(false);
      expect(urbanization?.getAttribute('hint')).toBe('(optional)');
    });
  });

  describe('Required Indicators', () => {
    it('should show required indicators when pattern is required', async () => {
      pattern.required = true;
      await pattern.updateComplete;

      // Wait for components to render
      await new Promise((resolve) => setTimeout(resolve, 100));

      const street1Component = pattern.querySelector('usa-text-input[name="street1"]') as any;
      await street1Component?.updateComplete;

      const label = street1Component?.querySelector('label');
      const abbr = label?.querySelector('abbr.usa-hint--required');

      expect(abbr).toBeTruthy();
      expect(abbr?.getAttribute('title')).toBe('required');
    });
  });

  describe('Overall USWDS HTML Structure', () => {
    it('should match USWDS fieldset structure', () => {
      const fieldset = pattern.querySelector('fieldset.usa-fieldset');
      const legend = fieldset?.querySelector('legend.usa-legend');

      expect(fieldset).toBeTruthy();
      expect(legend).toBeTruthy();
    });

    it('should use only USWDS classes', () => {
      const fieldset = pattern.querySelector('fieldset');
      const legend = pattern.querySelector('legend');

      expect(fieldset?.className).toBe('usa-fieldset');
      expect(legend?.className).toBe('usa-legend usa-legend--large');
    });

    it('should have compact form components rendering correctly', async () => {
      // Verify that form components in compact mode render label directly (no wrapper)
      const street1Component = pattern.querySelector('usa-text-input[name="street1"]') as any;
      await street1Component?.updateComplete;

      const label = street1Component?.querySelector('label.usa-label');
      const input = street1Component?.querySelector('input.usa-input');

      expect(label).toBeTruthy();
      expect(input).toBeTruthy();

      // In compact mode, label and input should be direct children (no form-group wrapper)
      expect(label?.parentElement).toBe(street1Component);
      expect(input?.parentElement).toBe(street1Component);
    });
  });
});
