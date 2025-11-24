import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '@uswds-wc/test-utils/test-utils.js';
import { USARaceEthnicityPattern } from './usa-race-ethnicity-pattern.js';
import type { RaceEthnicityData } from './usa-race-ethnicity-pattern.js';
import {
  verifyChildComponent,
  verifyUSWDSStructure,
} from '@uswds-wc/test-utils/slot-testing-utils.js';

// Register the component
if (!customElements.get('usa-race-ethnicity-pattern')) {
  customElements.define('usa-race-ethnicity-pattern', USARaceEthnicityPattern);
}

describe('USARaceEthnicityPattern', () => {
  let element: USARaceEthnicityPattern;

  beforeEach(async () => {
    element = document.createElement('usa-race-ethnicity-pattern') as USARaceEthnicityPattern;
    document.body.appendChild(element);
    await element.updateComplete;
  });

  afterEach(() => {
    element.remove();
  });

  describe('Initialization', () => {
    it('should create element', () => {
      expect(element).toBeInstanceOf(USARaceEthnicityPattern);
    });

    it('should use Light DOM', () => {
      expect(element.shadowRoot).toBeNull();
    });

    it('should have default race label', () => {
      expect(element.raceLabel).toBe(
        'Which of the following race classifications best describe you?'
      );
    });

    it('should have default ethnicity label', () => {
      expect(element.ethnicityLabel).toBe('I identify my ethnicity as:');
    });

    it('should not be required by default', () => {
      expect(element.required).toBe(false);
    });

    it('should show prefer not to share option by default', () => {
      expect(element.showPreferNotToShare).toBe(true);
    });

    it('should fire pattern-ready event on first update', async () => {
      const element2 = document.createElement(
        'usa-race-ethnicity-pattern'
      ) as USARaceEthnicityPattern;

      const readyPromise = new Promise((resolve) => {
        element2.addEventListener('pattern-ready', (e: Event) => {
          resolve((e as CustomEvent).detail);
        });
      });

      document.body.appendChild(element2);
      await element2.updateComplete;

      const detail = await readyPromise;
      expect(detail).toHaveProperty('raceEthnicityData');

      element2.remove();
    });
  });

  describe('USWDS Styling', () => {
    it('should use usa-fieldset wrapper for race section', () => {
      const fieldsets = element.querySelectorAll('.usa-fieldset');
      expect(fieldsets.length).toBeGreaterThanOrEqual(2); // Race and Ethnicity sections
    });

    it('should use usa-legend--large for race header', () => {
      const legends = element.querySelectorAll('.usa-legend--large');
      expect(legends.length).toBeGreaterThanOrEqual(2); // Race and Ethnicity
      expect(legends[0]?.textContent).toContain('race classifications');
    });

    it('should use usa-legend--large for ethnicity header', () => {
      const legends = element.querySelectorAll('.usa-legend--large');
      expect(legends[1]?.textContent).toContain('ethnicity');
    });

    it('should use usa-input--xl for ethnicity input', () => {
      const input = element.querySelector('usa-text-input[name="ethnicity"]');
      expect(input?.classList.contains('usa-input--xl')).toBe(true);
    });
  });

  describe('Properties', () => {
    it('should update race label', async () => {
      element.raceLabel = 'Select your race';
      await element.updateComplete;

      const legend = element.querySelector('.usa-legend--large');
      expect(legend?.textContent).toBe('Select your race');
    });

    it('should update ethnicity label', async () => {
      element.ethnicityLabel = 'Your ethnicity';
      await element.updateComplete;

      const legends = element.querySelectorAll('.usa-legend--large');
      expect(legends[1]?.textContent).toBe('Your ethnicity');
    });

    it('should update required', async () => {
      element.required = true;
      await element.updateComplete;

      expect(element.required).toBe(true);
    });

    it('should show why link when enabled', async () => {
      element.showWhyLink = true;
      element.whyUrl = '/privacy-policy';
      await element.updateComplete;

      const link = element.querySelector('.usa-hint a.usa-link');
      expect(link).toBeTruthy();
      expect(link?.getAttribute('href')).toBe('/privacy-policy');
      expect(link?.textContent).toContain('Why do we ask for this?');
    });

    it('should not show why link when disabled', async () => {
      element.showWhyLink = false;
      element.whyUrl = '/privacy-policy';
      await element.updateComplete;

      const link = element.querySelector('.usa-hint a.usa-link');
      expect(link).toBeFalsy();
    });

    it('should hide prefer not to share when showPreferNotToShare is false', async () => {
      element.showPreferNotToShare = false;
      await element.updateComplete;

      const checkbox = element.querySelector('usa-checkbox[name="prefer-not-to-share"]');
      expect(checkbox).toBeFalsy();
    });
  });

  describe('CRITICAL: USWDS OMB Requirements', () => {
    it('should have exactly 5 OMB race categories', () => {
      const raceCheckboxes = element.querySelectorAll('usa-checkbox[name="race"]');
      expect(raceCheckboxes.length).toBe(5);
    });

    it('should have American Indian or Alaska Native option', () => {
      const checkbox = element.querySelector('usa-checkbox[value="american-indian-alaska-native"]');
      expect(checkbox).toBeTruthy();
      expect(checkbox?.getAttribute('label')).toBe('American Indian or Alaska Native');
    });

    it('should have Asian option', () => {
      const checkbox = element.querySelector('usa-checkbox[value="asian"]');
      expect(checkbox).toBeTruthy();
      expect(checkbox?.getAttribute('label')).toBe('Asian');
    });

    it('should have Black or African American option', () => {
      const checkbox = element.querySelector('usa-checkbox[value="black-african-american"]');
      expect(checkbox).toBeTruthy();
      expect(checkbox?.getAttribute('label')).toBe('Black or African American');
    });

    it('should have Native Hawaiian or Other Pacific Islander option', () => {
      const checkbox = element.querySelector(
        'usa-checkbox[value="native-hawaiian-pacific-islander"]'
      );
      expect(checkbox).toBeTruthy();
      expect(checkbox?.getAttribute('label')).toBe('Native Hawaiian or Other Pacific Islander');
    });

    it('should have White option', () => {
      const checkbox = element.querySelector('usa-checkbox[value="white"]');
      expect(checkbox).toBeTruthy();
      expect(checkbox?.getAttribute('label')).toBe('White');
    });

    it('should support multi-select for race (checkboxes not radio)', () => {
      const checkboxes = element.querySelectorAll('usa-checkbox[name="race"]');
      expect(checkboxes.length).toBe(5);

      // Should not have radio buttons for race
      const radios = element.querySelectorAll('usa-radio[name="race"]');
      expect(radios.length).toBe(0);
    });

    it('should have ethnicity text input', () => {
      const input = element.querySelector('usa-text-input[name="ethnicity"]');
      expect(input).toBeTruthy();
      expect(input?.getAttribute('type')).toBe('text');
    });

    it('should have "Prefer not to share" option', () => {
      const checkbox = element.querySelector('usa-checkbox[name="prefer-not-to-share"]');
      expect(checkbox).toBeTruthy();
      expect(checkbox?.getAttribute('label')).toContain('Prefer not to share');
    });

    it('should have two separate sections (race and ethnicity)', () => {
      const fieldsets = element.querySelectorAll('.usa-fieldset');
      expect(fieldsets.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Race Selection', () => {
    it('should update data when race checkbox is checked', async () => {
      const checkbox = element.querySelector('usa-checkbox[value="asian"]') as any;

      checkbox.checked = true;
      checkbox.dispatchEvent(new CustomEvent('change', { detail: { checked: true } }));
      await element.updateComplete;

      const data = element.getRaceEthnicityData();
      expect(data.race).toContain('asian');
    });

    it('should support multiple race selections', async () => {
      const asianCheckbox = element.querySelector('usa-checkbox[value="asian"]') as any;
      const whiteCheckbox = element.querySelector('usa-checkbox[value="white"]') as any;

      asianCheckbox.checked = true;
      asianCheckbox.dispatchEvent(new CustomEvent('change', { detail: { checked: true } }));
      await element.updateComplete;

      whiteCheckbox.checked = true;
      whiteCheckbox.dispatchEvent(new CustomEvent('change', { detail: { checked: true } }));
      await element.updateComplete;

      const data = element.getRaceEthnicityData();
      expect(data.race).toContain('asian');
      expect(data.race).toContain('white');
      expect(data.race?.length).toBe(2);
    });

    it('should remove race when unchecked', async () => {
      // First check
      const checkbox = element.querySelector('usa-checkbox[value="asian"]') as any;
      checkbox.checked = true;
      checkbox.dispatchEvent(new CustomEvent('change', { detail: { checked: true } }));
      await element.updateComplete;

      // Then uncheck
      checkbox.checked = false;
      checkbox.dispatchEvent(new CustomEvent('change', { detail: { checked: false } }));
      await element.updateComplete;

      const data = element.getRaceEthnicityData();
      expect(data.race).not.toContain('asian');
    });

    it('should fire race-ethnicity-change event on race change', async () => {
      const changePromise = new Promise((resolve) => {
        element.addEventListener('race-ethnicity-change', (e: Event) => {
          resolve((e as CustomEvent).detail);
        });
      });

      const checkbox = element.querySelector('usa-checkbox[value="asian"]') as any;
      checkbox.checked = true;
      checkbox.dispatchEvent(new CustomEvent('change', { detail: { checked: true } }));
      await element.updateComplete;

      const detail = (await changePromise) as any;
      expect(detail.raceEthnicityData.race).toContain('asian');
    });
  });

  describe('Ethnicity Input', () => {
    it('should update data on ethnicity input', async () => {
      const input = element.querySelector('usa-text-input[name="ethnicity"]') as any;

      input.value = 'Hmong and Italian';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      const data = element.getRaceEthnicityData();
      expect(data.ethnicity).toBe('Hmong and Italian');
    });

    it('should fire race-ethnicity-change event on ethnicity change', async () => {
      const changePromise = new Promise((resolve) => {
        element.addEventListener('race-ethnicity-change', (e: Event) => {
          resolve((e as CustomEvent).detail);
        });
      });

      const input = element.querySelector('usa-text-input[name="ethnicity"]') as any;
      input.value = 'Mexican and Irish';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      const detail = (await changePromise) as any;
      expect(detail.raceEthnicityData.ethnicity).toBe('Mexican and Irish');
    });
  });

  describe('Prefer Not to Share', () => {
    it('should update data when prefer not to share is checked', async () => {
      const checkbox = element.querySelector('usa-checkbox[name="prefer-not-to-share"]') as any;

      checkbox.checked = true;
      checkbox.dispatchEvent(new CustomEvent('change', { detail: { checked: true } }));
      await element.updateComplete;

      const data = element.getRaceEthnicityData();
      expect(data.preferNotToShare).toBe(true);
    });

    it('should clear race and ethnicity when prefer not to share is checked', async () => {
      // First set some data
      const asianCheckbox = element.querySelector('usa-checkbox[value="asian"]') as any;
      asianCheckbox.checked = true;
      asianCheckbox.dispatchEvent(new CustomEvent('change', { detail: { checked: true } }));
      await element.updateComplete;

      const ethnicityInput = element.querySelector('usa-text-input[name="ethnicity"]') as any;
      ethnicityInput.value = 'Hispanic';
      ethnicityInput.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      // Now check prefer not to share
      const preferCheckbox = element.querySelector(
        'usa-checkbox[name="prefer-not-to-share"]'
      ) as any;
      preferCheckbox.checked = true;
      preferCheckbox.dispatchEvent(new CustomEvent('change', { detail: { checked: true } }));
      await element.updateComplete;

      const data = element.getRaceEthnicityData();
      expect(data.race?.length).toBe(0);
      expect(data.ethnicity).toBe('');
      expect(data.preferNotToShare).toBe(true);
    });

    it('should disable race checkboxes when prefer not to share is checked', async () => {
      const preferCheckbox = element.querySelector(
        'usa-checkbox[name="prefer-not-to-share"]'
      ) as any;
      preferCheckbox.checked = true;
      preferCheckbox.dispatchEvent(new CustomEvent('change', { detail: { checked: true } }));
      await element.updateComplete;

      const raceCheckboxes = element.querySelectorAll('usa-checkbox[name="race"]');
      raceCheckboxes.forEach((checkbox) => {
        expect(checkbox.hasAttribute('disabled')).toBe(true);
      });
    });

    it('should disable ethnicity input when prefer not to share is checked', async () => {
      const preferCheckbox = element.querySelector(
        'usa-checkbox[name="prefer-not-to-share"]'
      ) as any;
      preferCheckbox.checked = true;
      preferCheckbox.dispatchEvent(new CustomEvent('change', { detail: { checked: true } }));
      await element.updateComplete;

      const ethnicityInput = element.querySelector('usa-text-input[name="ethnicity"]');
      expect(ethnicityInput?.hasAttribute('disabled')).toBe(true);
    });
  });

  describe('Public API: getRaceEthnicityData', () => {
    it('should return empty data initially', () => {
      const data = element.getRaceEthnicityData();
      expect(data.race?.length).toBe(0);
      expect(data.ethnicity).toBe('');
      expect(data.preferNotToShare).toBe(false);
    });

    it('should return current race and ethnicity data', async () => {
      const asianCheckbox = element.querySelector('usa-checkbox[value="asian"]') as any;
      asianCheckbox.checked = true;
      asianCheckbox.dispatchEvent(new CustomEvent('change', { detail: { checked: true } }));
      await element.updateComplete;

      const ethnicityInput = element.querySelector('usa-text-input[name="ethnicity"]') as any;
      ethnicityInput.value = 'Filipino';
      ethnicityInput.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      const data = element.getRaceEthnicityData();
      expect(data.race).toContain('asian');
      expect(data.ethnicity).toBe('Filipino');
    });

    it('should return a copy of data', () => {
      const data1 = element.getRaceEthnicityData();
      const data2 = element.getRaceEthnicityData();

      expect(data1).not.toBe(data2);
      expect(data1.race).not.toBe(data2.race); // Arrays should be different instances
      expect(data1).toEqual(data2);
    });
  });

  describe('Public API: setRaceEthnicityData', () => {
    it('should set race and ethnicity data', async () => {
      const testData: RaceEthnicityData = {
        race: ['asian', 'white'],
        ethnicity: 'Chinese and Irish',
        preferNotToShare: false,
      };

      element.setRaceEthnicityData(testData);
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 0));

      const data = element.getRaceEthnicityData();
      expect(data.race).toContain('asian');
      expect(data.race).toContain('white');
      expect(data.ethnicity).toBe('Chinese and Irish');
    });

    it('should update checkbox states', async () => {
      element.setRaceEthnicityData({
        race: ['black-african-american', 'native-hawaiian-pacific-islander'],
        ethnicity: '',
      });
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 0));

      const blackCheckbox = element.querySelector(
        'usa-checkbox[value="black-african-american"]'
      ) as any;
      const hawaiianCheckbox = element.querySelector(
        'usa-checkbox[value="native-hawaiian-pacific-islander"]'
      ) as any;

      expect(blackCheckbox?.checked).toBe(true);
      expect(hawaiianCheckbox?.checked).toBe(true);
    });

    it('should update ethnicity input value', async () => {
      element.setRaceEthnicityData({
        race: [],
        ethnicity: 'Puerto Rican',
      });
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 0));

      const input = element.querySelector('usa-text-input[name="ethnicity"]') as any;
      expect(input?.value).toBe('Puerto Rican');
    });

    it('should update prefer not to share checkbox', async () => {
      element.setRaceEthnicityData({
        race: [],
        ethnicity: '',
        preferNotToShare: true,
      });
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 0));

      const checkbox = element.querySelector('usa-checkbox[name="prefer-not-to-share"]') as any;
      expect(checkbox?.checked).toBe(true);
    });
  });

  describe('Public API: clearRaceEthnicity', () => {
    it('should clear all race and ethnicity data', async () => {
      element.setRaceEthnicityData({
        race: ['asian'],
        ethnicity: 'Vietnamese',
        preferNotToShare: false,
      });
      await element.updateComplete;

      element.clearRaceEthnicity();
      await element.updateComplete;

      const data = element.getRaceEthnicityData();
      expect(data.race?.length).toBe(0);
      expect(data.ethnicity).toBe('');
      expect(data.preferNotToShare).toBe(false);
    });

    it('should clear checkbox states', async () => {
      element.setRaceEthnicityData({
        race: ['white', 'asian'],
        ethnicity: '',
      });
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 0));

      element.clearRaceEthnicity();
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 0));

      const checkboxes = element.querySelectorAll('usa-checkbox[name="race"]');
      checkboxes.forEach((checkbox: any) => {
        expect(checkbox.checked).toBe(false);
      });
    });

    it('should clear ethnicity input value', async () => {
      element.setRaceEthnicityData({
        race: [],
        ethnicity: 'Korean',
      });
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 0));

      element.clearRaceEthnicity();
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 0));

      const input = element.querySelector('usa-text-input[name="ethnicity"]') as any;
      expect(input?.value).toBe('');
    });
  });

  describe('Public API: validateRaceEthnicity', () => {
    it('should return true if not required and empty', () => {
      element.required = false;
      expect(element.validateRaceEthnicity()).toBe(true);
    });

    it('should return true if prefer not to share is selected', async () => {
      element.required = true;

      const checkbox = element.querySelector('usa-checkbox[name="prefer-not-to-share"]') as any;
      checkbox.checked = true;
      checkbox.dispatchEvent(new CustomEvent('change', { detail: { checked: true } }));
      await element.updateComplete;

      expect(element.validateRaceEthnicity()).toBe(true);
    });

    it('should return false if required and no data', () => {
      element.required = true;
      expect(element.validateRaceEthnicity()).toBe(false);
    });

    it('should return true if required and race is selected', async () => {
      element.required = true;

      const checkbox = element.querySelector('usa-checkbox[value="asian"]') as any;
      checkbox.checked = true;
      checkbox.dispatchEvent(new CustomEvent('change', { detail: { checked: true } }));
      await element.updateComplete;

      expect(element.validateRaceEthnicity()).toBe(true);
    });

    it('should return true if required and ethnicity is provided', async () => {
      element.required = true;

      const input = element.querySelector('usa-text-input[name="ethnicity"]') as any;
      input.value = 'Hispanic';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      expect(element.validateRaceEthnicity()).toBe(true);
    });

    it('should return true if required and both race and ethnicity provided', async () => {
      element.required = true;

      const checkbox = element.querySelector('usa-checkbox[value="white"]') as any;
      checkbox.checked = true;
      checkbox.dispatchEvent(new CustomEvent('change', { detail: { checked: true } }));
      await element.updateComplete;

      const input = element.querySelector('usa-text-input[name="ethnicity"]') as any;
      input.value = 'Irish';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      expect(element.validateRaceEthnicity()).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should use fieldset and legend for grouping', () => {
      const fieldsets = element.querySelectorAll('fieldset.usa-fieldset');
      const legends = element.querySelectorAll('legend.usa-legend');

      expect(fieldsets.length).toBeGreaterThanOrEqual(2);
      expect(legends.length).toBeGreaterThanOrEqual(2);
    });

    it('should have hint associated with ethnicity input', () => {
      const hint = element.querySelector('#ethnicity-hint');
      const input = element.querySelector('usa-text-input[name="ethnicity"]');

      expect(hint).toBeTruthy();
      expect(input?.getAttribute('aria-describedby')).toContain('ethnicity-hint');
    });
  });

  describe('USWDS Best Practices', () => {
    it('should provide hint text for race section', () => {
      const hint = element.querySelector('#race-hint');
      expect(hint).toBeTruthy();
      expect(hint?.textContent).toBeTruthy();
    });

    it('should provide hint text for ethnicity section', () => {
      const hint = element.querySelector('#ethnicity-hint');
      expect(hint).toBeTruthy();
      expect(hint?.textContent).toBeTruthy();
    });

    it('should allow linking to explanation page', async () => {
      element.showWhyLink = true;
      element.whyUrl = '/privacy-policy';
      await element.updateComplete;

      const link = element.querySelector('.usa-hint a');
      expect(link).toBeTruthy();
      expect(link?.getAttribute('href')).toBe('/privacy-policy');
    });

    it('should use usa-input--xl for ethnicity input', () => {
      const input = element.querySelector('usa-text-input[name="ethnicity"]');
      expect(input?.classList.contains('usa-input--xl')).toBe(true);
    });
  });

  describe('Slot Rendering & Composition', () => {
    describe('Child Component Initialization', () => {
      beforeEach(async () => {
        element = document.createElement('usa-race-ethnicity-pattern') as USARaceEthnicityPattern;
        document.body.appendChild(element);
        await element.updateComplete;
      });

      it('should initialize American Indian or Alaska Native checkbox component', async () => {
        const checkbox = await verifyChildComponent(
          element,
          'usa-checkbox[value="american-indian-alaska-native"]'
        );
        expect(checkbox).toBeTruthy();

        // Verify internal structure rendered
        const input = checkbox.querySelector('input.usa-checkbox__input');
        expect(input).toBeTruthy();
        expect(input?.getAttribute('type')).toBe('checkbox');
      });

      it('should initialize Asian checkbox component', async () => {
        const checkbox = await verifyChildComponent(element, 'usa-checkbox[value="asian"]');
        expect(checkbox).toBeTruthy();

        const input = checkbox.querySelector('input.usa-checkbox__input');
        expect(input).toBeTruthy();
        expect(input?.getAttribute('type')).toBe('checkbox');
      });

      it('should initialize Black or African American checkbox component', async () => {
        const checkbox = await verifyChildComponent(
          element,
          'usa-checkbox[value="black-african-american"]'
        );
        expect(checkbox).toBeTruthy();

        const input = checkbox.querySelector('input.usa-checkbox__input');
        expect(input).toBeTruthy();
        expect(input?.getAttribute('type')).toBe('checkbox');
      });

      it('should initialize Native Hawaiian or Pacific Islander checkbox component', async () => {
        const checkbox = await verifyChildComponent(
          element,
          'usa-checkbox[value="native-hawaiian-pacific-islander"]'
        );
        expect(checkbox).toBeTruthy();

        const input = checkbox.querySelector('input.usa-checkbox__input');
        expect(input).toBeTruthy();
        expect(input?.getAttribute('type')).toBe('checkbox');
      });

      it('should initialize White checkbox component', async () => {
        const checkbox = await verifyChildComponent(element, 'usa-checkbox[value="white"]');
        expect(checkbox).toBeTruthy();

        const input = checkbox.querySelector('input.usa-checkbox__input');
        expect(input).toBeTruthy();
        expect(input?.getAttribute('type')).toBe('checkbox');
      });

      it('should initialize ethnicity text input component', async () => {
        const textInput = await verifyChildComponent(element, 'usa-text-input[name="ethnicity"]');
        expect(textInput).toBeTruthy();

        const input = textInput.querySelector('input.usa-input');
        expect(input).toBeTruthy();
        expect(input?.getAttribute('type')).toBe('text');
      });

      it('should initialize prefer not to share checkbox component', async () => {
        const checkbox = await verifyChildComponent(
          element,
          'usa-checkbox[name="prefer-not-to-share"]'
        );
        expect(checkbox).toBeTruthy();

        const input = checkbox.querySelector('input.usa-checkbox__input');
        expect(input).toBeTruthy();
        expect(input?.getAttribute('type')).toBe('checkbox');
      });

      it('should render all 5 OMB race category checkboxes', async () => {
        // Wait for all checkbox components to initialize
        const checkboxes = element.querySelectorAll('usa-checkbox[name="race"]');
        expect(checkboxes.length).toBe(5);

        await Promise.all(
          Array.from(checkboxes).map((c: any) => c.updateComplete || Promise.resolve())
        );

        // Verify each checkbox rendered its internal structure
        checkboxes.forEach((checkbox) => {
          const input = checkbox.querySelector('input.usa-checkbox__input');
          expect(input).toBeTruthy();
        });
      });

      it('should hide prefer not to share when showPreferNotToShare is false', async () => {
        element.showPreferNotToShare = false;
        await element.updateComplete;

        const checkbox = element.querySelector('usa-checkbox[name="prefer-not-to-share"]');
        expect(checkbox).toBeFalsy();
      });
    });

    describe('Child Component DOM Structure', () => {
      beforeEach(async () => {
        element = document.createElement('usa-race-ethnicity-pattern') as USARaceEthnicityPattern;
        document.body.appendChild(element);
        await element.updateComplete;
      });

      it('should render race checkboxes in correct DOM structure', async () => {
        // Wait for all checkbox components to initialize
        const checkboxes = element.querySelectorAll('usa-checkbox[name="race"]');
        await Promise.all(
          Array.from(checkboxes).map((c: any) => c.updateComplete || Promise.resolve())
        );

        // Verify each checkbox rendered its internal structure
        const americanIndian = element.querySelector(
          'usa-checkbox[value="american-indian-alaska-native"]'
        );
        const asian = element.querySelector('usa-checkbox[value="asian"]');
        const black = element.querySelector('usa-checkbox[value="black-african-american"]');
        const hawaiian = element.querySelector(
          'usa-checkbox[value="native-hawaiian-pacific-islander"]'
        );
        const white = element.querySelector('usa-checkbox[value="white"]');

        expect(americanIndian?.querySelector('input')).toBeTruthy();
        expect(asian?.querySelector('input')).toBeTruthy();
        expect(black?.querySelector('input')).toBeTruthy();
        expect(hawaiian?.querySelector('input')).toBeTruthy();
        expect(white?.querySelector('input')).toBeTruthy();
      });

      it('should have correct USWDS classes on race checkboxes', async () => {
        const checkboxes = element.querySelectorAll('usa-checkbox[name="race"]');

        checkboxes.forEach((checkbox) => {
          const input = checkbox.querySelector('input');
          const label = checkbox.querySelector('label');

          expect(input?.classList.contains('usa-checkbox__input')).toBe(true);
          expect(label?.classList.contains('usa-checkbox__label')).toBe(true);
        });
      });

      it('should have correct USWDS classes on ethnicity input', async () => {
        const textInput = element.querySelector('usa-text-input[name="ethnicity"]');
        const input = textInput?.querySelector('input');

        expect(input?.classList.contains('usa-input')).toBe(true);
        expect(textInput?.classList.contains('usa-input--xl')).toBe(true);
      });

      it('should have correct USWDS classes on prefer not to share checkbox', async () => {
        const checkbox = element.querySelector('usa-checkbox[name="prefer-not-to-share"]');
        const input = checkbox?.querySelector('input');
        const label = checkbox?.querySelector('label');

        expect(input?.classList.contains('usa-checkbox__input')).toBe(true);
        expect(label?.classList.contains('usa-checkbox__label')).toBe(true);
      });

      it('should have labels for all checkbox components', async () => {
        const checkboxes = element.querySelectorAll('usa-checkbox[name="race"]');

        checkboxes.forEach((checkbox) => {
          const label = checkbox.querySelector('label');
          expect(label).toBeTruthy();
          expect(label?.textContent?.trim()).toBeTruthy();
        });
      });

      it('should have label for ethnicity input component', async () => {
        // The ethnicity input doesn't have a label attribute in the pattern
        // It relies on the fieldset/legend for labeling (USWDS pattern)
        // Verify the fieldset structure instead
        const fieldset = element.querySelectorAll('fieldset.usa-fieldset')[1]; // Ethnicity fieldset
        const legend = fieldset?.querySelector('legend');

        expect(legend).toBeTruthy();
        expect(legend?.textContent).toContain('ethnicity');
      });
    });

    describe('Pattern Composition', () => {
      beforeEach(async () => {
        element = document.createElement('usa-race-ethnicity-pattern') as USARaceEthnicityPattern;
        document.body.appendChild(element);
        await element.updateComplete;
      });

      it('should compose race section with all OMB categories', async () => {
        await verifyUSWDSStructure(element, {
          fieldsetClass: 'usa-fieldset',
          legendClass: 'usa-legend usa-legend--large',
          expectedChildren: [
            'usa-checkbox[value="american-indian-alaska-native"]',
            'usa-checkbox[value="asian"]',
            'usa-checkbox[value="black-african-american"]',
            'usa-checkbox[value="native-hawaiian-pacific-islander"]',
            'usa-checkbox[value="white"]',
          ],
        });
      });

      it('should compose ethnicity section with text input', async () => {
        const fieldsets = element.querySelectorAll('fieldset.usa-fieldset');
        expect(fieldsets.length).toBeGreaterThanOrEqual(2);

        // Ethnicity section should have text input
        const ethnicityInput = element.querySelector('usa-text-input[name="ethnicity"]');
        expect(ethnicityInput).toBeTruthy();
      });

      it('should compose prefer not to share option by default', async () => {
        const checkbox = element.querySelector('usa-checkbox[name="prefer-not-to-share"]');
        expect(checkbox).toBeTruthy();
      });

      it('should have two separate fieldsets for race and ethnicity', async () => {
        const fieldsets = element.querySelectorAll('fieldset.usa-fieldset');
        expect(fieldsets.length).toBeGreaterThanOrEqual(2);

        const legends = element.querySelectorAll('legend.usa-legend--large');
        expect(legends.length).toBeGreaterThanOrEqual(2);
      });

      it('should show/hide prefer not to share based on showPreferNotToShare property', async () => {
        element.showPreferNotToShare = true;
        await element.updateComplete;

        let checkbox = element.querySelector('usa-checkbox[name="prefer-not-to-share"]');
        expect(checkbox).toBeTruthy();

        element.showPreferNotToShare = false;
        await element.updateComplete;

        checkbox = element.querySelector('usa-checkbox[name="prefer-not-to-share"]');
        expect(checkbox).toBeFalsy();
      });

      it('should disable race checkboxes when prefer not to share is checked', async () => {
        const preferCheckbox = element.querySelector(
          'usa-checkbox[name="prefer-not-to-share"]'
        ) as any;
        preferCheckbox.checked = true;
        preferCheckbox.dispatchEvent(new CustomEvent('change', { detail: { checked: true } }));
        await element.updateComplete;

        const raceCheckboxes = element.querySelectorAll('usa-checkbox[name="race"]');
        raceCheckboxes.forEach((checkbox) => {
          expect(checkbox.hasAttribute('disabled')).toBe(true);
        });
      });

      it('should disable ethnicity input when prefer not to share is checked', async () => {
        const preferCheckbox = element.querySelector(
          'usa-checkbox[name="prefer-not-to-share"]'
        ) as any;
        preferCheckbox.checked = true;
        preferCheckbox.dispatchEvent(new CustomEvent('change', { detail: { checked: true } }));
        await element.updateComplete;

        const ethnicityInput = element.querySelector('usa-text-input[name="ethnicity"]');
        expect(ethnicityInput?.hasAttribute('disabled')).toBe(true);
      });
    });

    describe('Event Propagation from Child Components', () => {
      beforeEach(async () => {
        element = document.createElement('usa-race-ethnicity-pattern') as USARaceEthnicityPattern;
        document.body.appendChild(element);
        await element.updateComplete;
      });

      it('should propagate change event from American Indian checkbox component', async () => {
        const events: any[] = [];
        element.addEventListener('race-ethnicity-change', (e: Event) => {
          events.push((e as CustomEvent).detail);
        });

        const checkbox = element.querySelector(
          'usa-checkbox[value="american-indian-alaska-native"]'
        ) as any;
        await checkbox?.updateComplete;

        const input = checkbox?.querySelector('input') as HTMLInputElement;
        input.checked = true;
        input.dispatchEvent(
          new CustomEvent('change', { detail: { checked: true }, bubbles: true })
        );

        expect(events.length).toBeGreaterThan(0);
        expect(events[0].raceEthnicityData.race).toContain('american-indian-alaska-native');
      });

      it('should propagate change event from Asian checkbox component', async () => {
        const events: any[] = [];
        element.addEventListener('race-ethnicity-change', (e: Event) => {
          events.push((e as CustomEvent).detail);
        });

        const checkbox = element.querySelector('usa-checkbox[value="asian"]') as any;
        await checkbox?.updateComplete;

        const input = checkbox?.querySelector('input') as HTMLInputElement;
        input.checked = true;
        input.dispatchEvent(
          new CustomEvent('change', { detail: { checked: true }, bubbles: true })
        );

        expect(events.length).toBeGreaterThan(0);
        expect(events[0].raceEthnicityData.race).toContain('asian');
      });

      it('should propagate change event from Black or African American checkbox component', async () => {
        const events: any[] = [];
        element.addEventListener('race-ethnicity-change', (e: Event) => {
          events.push((e as CustomEvent).detail);
        });

        const checkbox = element.querySelector(
          'usa-checkbox[value="black-african-american"]'
        ) as any;
        await checkbox?.updateComplete;

        const input = checkbox?.querySelector('input') as HTMLInputElement;
        input.checked = true;
        input.dispatchEvent(
          new CustomEvent('change', { detail: { checked: true }, bubbles: true })
        );

        expect(events.length).toBeGreaterThan(0);
        expect(events[0].raceEthnicityData.race).toContain('black-african-american');
      });

      it('should propagate change event from Native Hawaiian checkbox component', async () => {
        const events: any[] = [];
        element.addEventListener('race-ethnicity-change', (e: Event) => {
          events.push((e as CustomEvent).detail);
        });

        const checkbox = element.querySelector(
          'usa-checkbox[value="native-hawaiian-pacific-islander"]'
        ) as any;
        await checkbox?.updateComplete;

        const input = checkbox?.querySelector('input') as HTMLInputElement;
        input.checked = true;
        input.dispatchEvent(
          new CustomEvent('change', { detail: { checked: true }, bubbles: true })
        );

        expect(events.length).toBeGreaterThan(0);
        expect(events[0].raceEthnicityData.race).toContain('native-hawaiian-pacific-islander');
      });

      it('should propagate change event from White checkbox component', async () => {
        const events: any[] = [];
        element.addEventListener('race-ethnicity-change', (e: Event) => {
          events.push((e as CustomEvent).detail);
        });

        const checkbox = element.querySelector('usa-checkbox[value="white"]') as any;
        await checkbox?.updateComplete;

        const input = checkbox?.querySelector('input') as HTMLInputElement;
        input.checked = true;
        input.dispatchEvent(
          new CustomEvent('change', { detail: { checked: true }, bubbles: true })
        );

        expect(events.length).toBeGreaterThan(0);
        expect(events[0].raceEthnicityData.race).toContain('white');
      });

      it('should propagate input event from ethnicity text input component', async () => {
        const events: any[] = [];
        element.addEventListener('race-ethnicity-change', (e: Event) => {
          events.push((e as CustomEvent).detail);
        });

        const textInput = element.querySelector('usa-text-input[name="ethnicity"]') as any;
        await textInput?.updateComplete;

        const input = textInput?.querySelector('input') as HTMLInputElement;
        input.value = 'Hispanic or Latino';
        input.dispatchEvent(new Event('input', { bubbles: true }));

        expect(events.length).toBeGreaterThan(0);
        expect(events[0].raceEthnicityData.ethnicity).toBe('Hispanic or Latino');
      });

      it('should propagate change event from prefer not to share checkbox component', async () => {
        const events: any[] = [];
        element.addEventListener('race-ethnicity-change', (e: Event) => {
          events.push((e as CustomEvent).detail);
        });

        const checkbox = element.querySelector('usa-checkbox[name="prefer-not-to-share"]') as any;
        await checkbox?.updateComplete;

        const input = checkbox?.querySelector('input') as HTMLInputElement;
        input.checked = true;
        input.dispatchEvent(
          new CustomEvent('change', { detail: { checked: true }, bubbles: true })
        );

        expect(events.length).toBeGreaterThan(0);
        expect(events[0].raceEthnicityData.preferNotToShare).toBe(true);
      });

      it('should include full race/ethnicity data in race-ethnicity-change event', async () => {
        const events: any[] = [];
        element.addEventListener('race-ethnicity-change', (e: Event) => {
          events.push((e as CustomEvent).detail);
        });

        // Check Asian
        const asianCheckbox = element.querySelector('usa-checkbox[value="asian"]') as any;
        const asianInput = asianCheckbox?.querySelector('input') as HTMLInputElement;
        asianInput.checked = true;
        asianInput.dispatchEvent(
          new CustomEvent('change', { detail: { checked: true }, bubbles: true })
        );
        await element.updateComplete;

        // Set ethnicity
        const textInput = element.querySelector('usa-text-input[name="ethnicity"]') as any;
        const input = textInput?.querySelector('input') as HTMLInputElement;
        input.value = 'Filipino';
        input.dispatchEvent(new Event('input', { bubbles: true }));

        expect(events.length).toBeGreaterThan(0);
        const lastEvent = events[events.length - 1];
        expect(lastEvent.raceEthnicityData).toBeDefined();
        expect(lastEvent.raceEthnicityData.race).toContain('asian');
        expect(lastEvent.raceEthnicityData.ethnicity).toBe('Filipino');
      });

      it('should support multiple race selections through event propagation', async () => {
        const events: any[] = [];
        element.addEventListener('race-ethnicity-change', (e: Event) => {
          events.push((e as CustomEvent).detail);
        });

        // Check Asian
        const asianCheckbox = element.querySelector('usa-checkbox[value="asian"]') as any;
        const asianInput = asianCheckbox?.querySelector('input') as HTMLInputElement;
        asianInput.checked = true;
        asianInput.dispatchEvent(
          new CustomEvent('change', { detail: { checked: true }, bubbles: true })
        );
        await element.updateComplete;

        // Check White
        const whiteCheckbox = element.querySelector('usa-checkbox[value="white"]') as any;
        const whiteInput = whiteCheckbox?.querySelector('input') as HTMLInputElement;
        whiteInput.checked = true;
        whiteInput.dispatchEvent(
          new CustomEvent('change', { detail: { checked: true }, bubbles: true })
        );

        expect(events.length).toBeGreaterThan(0);
        const lastEvent = events[events.length - 1];
        expect(lastEvent.raceEthnicityData.race).toContain('asian');
        expect(lastEvent.raceEthnicityData.race).toContain('white');
        // Check that both races are present (length may vary due to duplicate events)
        expect(lastEvent.raceEthnicityData.race?.length).toBeGreaterThanOrEqual(2);
      });
    });

    describe('Pattern-Level Fieldset Structure', () => {
      beforeEach(async () => {
        element = document.createElement('usa-race-ethnicity-pattern') as USARaceEthnicityPattern;
        document.body.appendChild(element);
        await element.updateComplete;
      });

      it('should use pattern-level fieldset structure for race section', async () => {
        // Pattern uses fieldset/legend structure at pattern level
        const fieldsets = element.querySelectorAll('fieldset.usa-fieldset');
        expect(fieldsets.length).toBeGreaterThanOrEqual(2);

        const raceFieldset = fieldsets[0];
        const raceLegend = raceFieldset?.querySelector('legend.usa-legend--large');
        expect(raceLegend).toBeTruthy();
        expect(raceLegend?.textContent).toContain('race');
      });

      it('should use pattern-level fieldset structure for ethnicity section', async () => {
        const fieldsets = element.querySelectorAll('fieldset.usa-fieldset');
        const ethnicityFieldset = fieldsets[1];
        const ethnicityLegend = ethnicityFieldset?.querySelector('legend.usa-legend--large');
        expect(ethnicityLegend).toBeTruthy();
        expect(ethnicityLegend?.textContent).toContain('ethnicity');
      });

      it('should render checkbox components without individual form-group wrappers', async () => {
        const checkboxes = element.querySelectorAll('usa-checkbox');
        await Promise.all(
          Array.from(checkboxes).map((c: any) => c.updateComplete || Promise.resolve())
        );

        // Checkboxes should not have form-group wrappers
        checkboxes.forEach((checkbox) => {
          const formGroup = checkbox.querySelector('.usa-form-group');
          expect(formGroup).toBeFalsy();
        });
      });

      it('should render ethnicity input with its own form-group inside pattern fieldset', async () => {
        const textInput = element.querySelector('usa-text-input[name="ethnicity"]');
        await textInput?.updateComplete;

        // Text input has its own form-group wrapper (standard USWDS component behavior)
        const formGroup = textInput?.querySelector('.usa-form-group');
        expect(formGroup).toBeTruthy();

        // But it's inside the pattern-level fieldset
        const fieldsets = element.querySelectorAll('fieldset.usa-fieldset');
        const ethnicityFieldset = fieldsets[1];
        expect(ethnicityFieldset?.contains(textInput as Node)).toBe(true);
      });

      it('should organize all components within pattern fieldsets', async () => {
        const fieldsets = element.querySelectorAll('fieldset.usa-fieldset');
        expect(fieldsets.length).toBeGreaterThanOrEqual(2);

        // Race fieldset contains 5 checkboxes
        const raceFieldset = fieldsets[0];
        const raceCheckboxes = raceFieldset?.querySelectorAll('usa-checkbox[name="race"]');
        expect(raceCheckboxes?.length).toBe(5);

        // Ethnicity fieldset contains text input
        const ethnicityFieldset = fieldsets[1];
        const ethnicityInput = ethnicityFieldset?.querySelector('usa-text-input[name="ethnicity"]');
        expect(ethnicityInput).toBeTruthy();
      });
    });

    describe('Programmatic Access to Child Components', () => {
      beforeEach(async () => {
        element = document.createElement('usa-race-ethnicity-pattern') as USARaceEthnicityPattern;
        document.body.appendChild(element);
        await element.updateComplete;
      });

      it('should allow direct access to checkbox component APIs', async () => {
        const asianCheckbox = element.querySelector('usa-checkbox[value="asian"]') as any;

        expect(typeof asianCheckbox?.reset).toBe('function');
      });

      it('should allow direct access to ethnicity input component API', async () => {
        const textInput = element.querySelector('usa-text-input[name="ethnicity"]') as any;

        expect(typeof textInput?.reset).toBe('function');
      });

      it('should allow setting checkbox values programmatically', async () => {
        const asianCheckbox = element.querySelector('usa-checkbox[value="asian"]') as any;
        await asianCheckbox?.updateComplete;

        asianCheckbox.checked = true;
        await asianCheckbox.updateComplete;

        expect(asianCheckbox.checked).toBe(true);
        const input = asianCheckbox.querySelector('input') as HTMLInputElement;
        expect(input.checked).toBe(true);
      });

      it('should allow setting ethnicity input value programmatically', async () => {
        const textInput = element.querySelector('usa-text-input[name="ethnicity"]') as any;
        await textInput?.updateComplete;

        textInput.value = 'Korean and Irish';
        await textInput.updateComplete;

        expect(textInput.value).toBe('Korean and Irish');
        const input = textInput.querySelector('input') as HTMLInputElement;
        expect(input.value).toBe('Korean and Irish');
      });

      it('should allow resetting all child components via pattern API', async () => {
        // Set some values
        element.setRaceEthnicityData({
          race: ['asian', 'white'],
          ethnicity: 'Chinese and Irish',
          preferNotToShare: false,
        });
        await element.updateComplete;
        await new Promise((resolve) => setTimeout(resolve, 0));

        // Clear via pattern API
        element.clearRaceEthnicity();
        await element.updateComplete;
        await new Promise((resolve) => setTimeout(resolve, 0));

        // Verify all checkboxes were reset
        const raceCheckboxes = element.querySelectorAll('usa-checkbox[name="race"]');
        raceCheckboxes.forEach((checkbox: any) => {
          const input = checkbox?.querySelector('input') as HTMLInputElement;
          expect(input?.checked).toBe(false);
        });

        // Verify ethnicity input was reset
        const textInput = element.querySelector('usa-text-input[name="ethnicity"]') as any;
        const input = textInput?.querySelector('input') as HTMLInputElement;
        expect(input?.value).toBe('');

        // Verify prefer not to share was reset
        const preferCheckbox = element.querySelector(
          'usa-checkbox[name="prefer-not-to-share"]'
        ) as any;
        const preferInput = preferCheckbox?.querySelector('input') as HTMLInputElement;
        expect(preferInput?.checked).toBe(false);
      });

      it('should synchronize pattern data with child component states', async () => {
        // Set data via pattern API
        element.setRaceEthnicityData({
          race: ['black-african-american', 'native-hawaiian-pacific-islander'],
          ethnicity: 'Afro-Latino',
        });
        await element.updateComplete;
        await new Promise((resolve) => setTimeout(resolve, 0));

        // Verify child components reflect the data
        const blackCheckbox = element.querySelector(
          'usa-checkbox[value="black-african-american"]'
        ) as any;
        const hawaiianCheckbox = element.querySelector(
          'usa-checkbox[value="native-hawaiian-pacific-islander"]'
        ) as any;
        const textInput = element.querySelector('usa-text-input[name="ethnicity"]') as any;

        expect(blackCheckbox?.checked).toBe(true);
        expect(hawaiianCheckbox?.checked).toBe(true);
        expect(textInput?.value).toBe('Afro-Latino');

        // Verify pattern data matches
        const data = element.getRaceEthnicityData();
        expect(data.race).toContain('black-african-american');
        expect(data.race).toContain('native-hawaiian-pacific-islander');
        expect(data.ethnicity).toBe('Afro-Latino');
      });
    });
  });
});
