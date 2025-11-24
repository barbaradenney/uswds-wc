import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '@uswds-wc/test-utils/test-utils.js';
import './usa-name-pattern.js';
import type { USANamePattern, NameData } from './usa-name-pattern.js';
import {
  verifyChildComponent,
  verifyPropertyBinding,
  verifyUSWDSStructure,
  verifyCompactMode,
} from '@uswds-wc/test-utils/slot-testing-utils.js';

describe('USANamePattern', () => {
  let pattern: USANamePattern;
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container?.remove();
  });

  describe('Pattern Initialization', () => {
    beforeEach(() => {
      pattern = document.createElement('usa-name-pattern') as USANamePattern;
      container.appendChild(pattern);
    });

    it('should create pattern element', () => {
      expect(pattern).toBeInstanceOf(HTMLElement);
      expect(pattern.tagName).toBe('USA-NAME-PATTERN');
    });

    it('should have default properties', () => {
      expect(pattern.label).toBe('Name');
      expect(pattern.format).toBe('full');
      expect(pattern.required).toBe(false);
      expect(pattern.showMiddle).toBe(false);
      expect(pattern.showSuffix).toBe(false);
      expect(pattern.showPreferred).toBe(false);
    });

    it('should use Light DOM for USWDS style compatibility', () => {
      expect(pattern.shadowRoot).toBeNull();
    });

    it('should render fieldset with legend', async () => {
      await pattern.updateComplete;
      const fieldset = pattern.querySelector('fieldset.usa-fieldset');
      const legend = pattern.querySelector('legend.usa-legend');

      expect(fieldset).toBeTruthy();
      expect(legend).toBeTruthy();
      expect(legend?.textContent).toBe('Name');
    });

    it('should render full name field by default', async () => {
      await pattern.updateComplete;

      const fullName = pattern.querySelector('usa-text-input[name="fullName"]');
      expect(fullName).toBeTruthy();
    });

    it('should emit pattern-ready event on initialization', async () => {
      const newPattern = document.createElement('usa-name-pattern') as USANamePattern;

      const readyPromise = new Promise<CustomEvent>((resolve) => {
        newPattern.addEventListener('pattern-ready', (e) => resolve(e as CustomEvent));
      });

      container.appendChild(newPattern);
      await newPattern.updateComplete;

      const event = await readyPromise;
      expect(event.detail.nameData).toBeDefined();
      expect(event.detail.nameData).toEqual({});

      newPattern.remove();
    });
  });

  describe('Name Format - Full', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-name-pattern') as USANamePattern;
      pattern.format = 'full';
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should render only full name field', () => {
      const fullName = pattern.querySelector('usa-text-input[name="fullName"]');
      const givenName = pattern.querySelector('usa-text-input[name="givenName"]');
      const familyName = pattern.querySelector('usa-text-input[name="familyName"]');

      expect(fullName).toBeTruthy();
      expect(fullName?.closest('.display-none')).toBe(null); // Full name visible

      // Separate fields exist but are hidden
      expect(givenName).toBeTruthy();
      expect(familyName).toBeTruthy();
      expect(givenName?.closest('.display-none')).toBeTruthy(); // Hidden with USWDS utility class
      expect(familyName?.closest('.display-none')).toBeTruthy(); // Hidden with USWDS utility class
    });

    it('should have maxlength of 128 characters', () => {
      const fullName = pattern.querySelector('usa-text-input[name="fullName"]');
      expect(fullName?.getAttribute('maxlength')).toBe('128');
    });

    it('should have descriptive hint text', () => {
      const fullName = pattern.querySelector('usa-text-input[name="fullName"]');
      expect(fullName?.getAttribute('hint')).toContain('as you would like it to appear');
    });
  });

  describe('Name Format - Separate', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-name-pattern') as USANamePattern;
      pattern.format = 'separate';
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should render separate name fields', () => {
      const givenName = pattern.querySelector('usa-text-input[name="givenName"]');
      const familyName = pattern.querySelector('usa-text-input[name="familyName"]');
      const fullName = pattern.querySelector('usa-text-input[name="fullName"]');

      expect(givenName).toBeTruthy();
      expect(familyName).toBeTruthy();
      expect(givenName?.closest('.display-none')).toBe(null); // Given name visible
      expect(familyName?.closest('.display-none')).toBe(null); // Family name visible

      // Full name field exists but is hidden
      expect(fullName).toBeTruthy();
      expect(fullName?.closest('.display-none')).toBeTruthy(); // Hidden with USWDS utility class
    });

    it('should use culturally sensitive labels', () => {
      const givenName = pattern.querySelector('usa-text-input[name="givenName"]');
      const familyName = pattern.querySelector('usa-text-input[name="familyName"]');

      expect(givenName?.getAttribute('label')).toBe('Given name');
      expect(familyName?.getAttribute('label')).toBe('Family name');
    });

    it('should have hints explaining terminology', () => {
      const givenName = pattern.querySelector('usa-text-input[name="givenName"]');
      const familyName = pattern.querySelector('usa-text-input[name="familyName"]');

      expect(givenName?.getAttribute('hint')).toContain('first name');
      expect(familyName?.getAttribute('hint')).toContain('last name');
    });

    it('should not show middle name by default', () => {
      const middleName = pattern.querySelector('usa-text-input[name="middleName"]');
      expect(middleName).toBeTruthy(); // Element exists
      expect(middleName?.classList.contains('display-none')).toBe(true); // But hidden with USWDS utility class
    });

    it('should not show suffix by default', () => {
      const suffix = pattern.querySelector('usa-select[name="suffix"]');
      expect(suffix).toBeTruthy(); // Element exists
      expect(suffix?.classList.contains('display-none')).toBe(true); // But hidden with USWDS utility class
    });
  });

  describe('Name Format - Flexible', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-name-pattern') as USANamePattern;
      pattern.format = 'flexible';
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should render both full name and separate fields', () => {
      const fullName = pattern.querySelector('usa-text-input[name="fullName"]');
      const givenName = pattern.querySelector('usa-text-input[name="givenName"]');
      const familyName = pattern.querySelector('usa-text-input[name="familyName"]');

      expect(fullName).toBeTruthy();
      expect(givenName).toBeTruthy();
      expect(familyName).toBeTruthy();
    });
  });

  describe('Field Visibility', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-name-pattern') as USANamePattern;
      pattern.format = 'separate';
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should show middle name when showMiddle is true', async () => {
      pattern.showMiddle = true;
      await pattern.updateComplete;

      const middleName = pattern.querySelector('usa-text-input[name="middleName"]');
      expect(middleName).toBeTruthy();
      expect(middleName?.getAttribute('hint')).toContain('optional');
    });

    it('should show suffix when showSuffix is true', async () => {
      pattern.showSuffix = true;
      await pattern.updateComplete;

      const suffix = pattern.querySelector('usa-select[name="suffix"]');
      expect(suffix).toBeTruthy();
      expect(suffix?.getAttribute('hint')).toContain('optional');
    });

    it('should not show preferred name by default', () => {
      const preferredName = pattern.querySelector('usa-text-input[name="preferredName"]');
      expect(preferredName).toBeTruthy(); // Element exists
      expect(preferredName?.classList.contains('display-none')).toBe(true); // But hidden with USWDS utility class
    });

    it('should show preferred name when showPreferred is true', async () => {
      pattern.showPreferred = true;
      await pattern.updateComplete;

      const preferredName = pattern.querySelector('usa-text-input[name="preferredName"]');
      expect(preferredName).toBeTruthy();
      expect(preferredName?.getAttribute('hint')).toContain('correspondence');
    });
  });

  describe('Required Fields', () => {
    it('should not mark fields as required by default - full format', async () => {
      pattern = document.createElement('usa-name-pattern') as USANamePattern;
      pattern.format = 'full';
      container.appendChild(pattern);
      await pattern.updateComplete;

      const fullName = pattern.querySelector('usa-text-input[name="fullName"]');
      expect(fullName?.hasAttribute('required')).toBe(false);
    });

    it('should mark full name as required when required prop is true', async () => {
      pattern = document.createElement('usa-name-pattern') as USANamePattern;
      pattern.format = 'full';
      pattern.required = true;
      container.appendChild(pattern);
      await pattern.updateComplete;

      const fullName = pattern.querySelector('usa-text-input[name="fullName"]');
      expect(fullName?.hasAttribute('required')).toBe(true);
    });

    it('should mark given and family names as required when required prop is true - separate format', async () => {
      pattern = document.createElement('usa-name-pattern') as USANamePattern;
      pattern.format = 'separate';
      pattern.required = true;
      container.appendChild(pattern);
      await pattern.updateComplete;

      const givenName = pattern.querySelector('usa-text-input[name="givenName"]');
      const familyName = pattern.querySelector('usa-text-input[name="familyName"]');

      expect(givenName?.hasAttribute('required')).toBe(true);
      expect(familyName?.hasAttribute('required')).toBe(true);
    });

    it('should never mark middle name as required', async () => {
      pattern = document.createElement('usa-name-pattern') as USANamePattern;
      pattern.format = 'separate';
      pattern.required = true;
      pattern.showMiddle = true;
      container.appendChild(pattern);
      await pattern.updateComplete;

      const middleName = pattern.querySelector('usa-text-input[name="middleName"]');
      expect(middleName?.hasAttribute('required')).toBe(false);
    });

    it('should never mark preferred name as required', async () => {
      pattern = document.createElement('usa-name-pattern') as USANamePattern;
      pattern.required = true;
      pattern.showPreferred = true;
      container.appendChild(pattern);
      await pattern.updateComplete;

      const preferredName = pattern.querySelector('usa-text-input[name="preferredName"]');
      expect(preferredName?.hasAttribute('required')).toBe(false);
    });
  });

  describe('Data Changes', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-name-pattern') as USANamePattern;
      pattern.format = 'separate';
      pattern.showMiddle = true;
      pattern.showSuffix = true;
      pattern.showPreferred = true;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should emit name-change event when field changes', async () => {
      const changePromise = new Promise<CustomEvent>((resolve) => {
        pattern.addEventListener('name-change', (e) => resolve(e as CustomEvent), { once: true });
      });

      const givenName = pattern.querySelector('usa-text-input[name="givenName"]') as any;
      givenName.value = 'John';
      givenName.dispatchEvent(new Event('input', { bubbles: true }));

      const event = await changePromise;
      expect(event.detail.nameData).toBeDefined();
      expect(event.detail.field).toBe('givenName');
    });

    it('should track all field values', async () => {
      const givenName = pattern.querySelector('usa-text-input[name="givenName"]') as any;
      const middleName = pattern.querySelector('usa-text-input[name="middleName"]') as any;
      const familyName = pattern.querySelector('usa-text-input[name="familyName"]') as any;
      const suffix = pattern.querySelector('usa-select[name="suffix"]') as any;
      const preferredName = pattern.querySelector('usa-text-input[name="preferredName"]') as any;

      givenName.value = 'John';
      givenName.dispatchEvent(new Event('input', { bubbles: true }));
      await pattern.updateComplete;

      middleName.value = 'Michael';
      middleName.dispatchEvent(new Event('input', { bubbles: true }));
      await pattern.updateComplete;

      familyName.value = 'Smith';
      familyName.dispatchEvent(new Event('input', { bubbles: true }));
      await pattern.updateComplete;

      suffix.value = 'Jr.';
      suffix.dispatchEvent(new Event('change', { bubbles: true }));
      await pattern.updateComplete;

      preferredName.value = 'Mike';
      preferredName.dispatchEvent(new Event('input', { bubbles: true }));
      await pattern.updateComplete;

      const data = pattern.getNameData();
      expect(data.givenName).toBe('John');
      expect(data.middleName).toBe('Michael');
      expect(data.familyName).toBe('Smith');
      expect(data.suffix).toBe('Jr.');
      expect(data.preferredName).toBe('Mike');
    });
  });

  describe('Public API', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-name-pattern') as USANamePattern;
      pattern.format = 'separate';
      pattern.showMiddle = true;
      pattern.showSuffix = true;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should get name data', () => {
      const data = pattern.getNameData();
      expect(data).toBeDefined();
      expect(data).toEqual({});
    });

    it('should set name data', async () => {
      const nameData: NameData = {
        givenName: 'Jane',
        middleName: 'Marie',
        familyName: 'Doe',
        suffix: 'III',
      };

      pattern.setNameData(nameData);
      await pattern.updateComplete;

      const data = pattern.getNameData();
      expect(data).toEqual(nameData);
    });

    it('should clear name', async () => {
      const nameData: NameData = {
        givenName: 'Jane',
        familyName: 'Doe',
      };

      pattern.setNameData(nameData);
      await pattern.updateComplete;

      pattern.clearName();
      await pattern.updateComplete;

      const data = pattern.getNameData();
      expect(data).toEqual({});
    });

    it('should validate required name - full format', async () => {
      pattern.format = 'full';
      pattern.required = true;
      await pattern.updateComplete;

      // Empty name should not be valid
      expect(pattern.validateName()).toBe(false);

      // Complete name should be valid
      pattern.setNameData({ fullName: 'John Doe' });
      await pattern.updateComplete;
      expect(pattern.validateName()).toBe(true);
    });

    it('should validate required name - separate format', async () => {
      pattern.format = 'separate';
      pattern.required = true;
      await pattern.updateComplete;

      // Empty name should not be valid
      expect(pattern.validateName()).toBe(false);

      // Only given name should not be valid
      pattern.setNameData({ givenName: 'John' });
      await pattern.updateComplete;
      expect(pattern.validateName()).toBe(false);

      // Complete name should be valid
      pattern.setNameData({
        givenName: 'John',
        familyName: 'Doe',
      });
      await pattern.updateComplete;
      expect(pattern.validateName()).toBe(true);
    });

    it('should validate required name - flexible format', async () => {
      pattern.format = 'flexible';
      pattern.required = true;
      await pattern.updateComplete;

      // Empty name should not be valid
      expect(pattern.validateName()).toBe(false);

      // Full name should be valid
      pattern.setNameData({ fullName: 'John Doe' });
      await pattern.updateComplete;
      expect(pattern.validateName()).toBe(true);

      // Given + family should be valid
      pattern.clearName();
      pattern.setNameData({ givenName: 'John', familyName: 'Doe' });
      await pattern.updateComplete;
      expect(pattern.validateName()).toBe(true);
    });

    it('should always validate true when not required', async () => {
      pattern.required = false;
      await pattern.updateComplete;

      expect(pattern.validateName()).toBe(true);

      pattern.setNameData({ givenName: 'John' });
      await pattern.updateComplete;
      expect(pattern.validateName()).toBe(true);
    });

    it('should get formatted name from full name', async () => {
      pattern.format = 'full';
      await pattern.updateComplete;

      pattern.setNameData({ fullName: 'John Doe' });
      await pattern.updateComplete;

      expect(pattern.getFormattedName()).toBe('John Doe');
    });

    it('should get formatted name from separate fields', async () => {
      pattern.setNameData({
        givenName: 'John',
        middleName: 'Michael',
        familyName: 'Smith',
        suffix: 'Jr.',
      });
      await pattern.updateComplete;

      expect(pattern.getFormattedName()).toBe('John Michael Smith Jr.');
    });

    it('should get formatted name with only required fields', async () => {
      pattern.setNameData({
        givenName: 'John',
        familyName: 'Doe',
      });
      await pattern.updateComplete;

      expect(pattern.getFormattedName()).toBe('John Doe');
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-name-pattern') as USANamePattern;
      pattern.format = 'separate';
      pattern.showMiddle = true;
      pattern.showSuffix = true;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should have fieldset and legend for screen readers', () => {
      const fieldset = pattern.querySelector('fieldset');
      const legend = pattern.querySelector('legend');

      expect(fieldset).toBeTruthy();
      expect(legend).toBeTruthy();
      expect(legend?.textContent).toContain('Name');
    });

    it('should have proper label associations', async () => {
      await pattern.updateComplete;

      const givenName = pattern.querySelector('usa-text-input[name="givenName"]');
      const familyName = pattern.querySelector('usa-text-input[name="familyName"]');
      const middleName = pattern.querySelector('usa-text-input[name="middleName"]');

      expect(givenName?.getAttribute('label')).toBeTruthy();
      expect(familyName?.getAttribute('label')).toBeTruthy();
      expect(middleName?.getAttribute('label')).toBeTruthy();
    });

    it('should use USWDS form markup structure', () => {
      const fieldset = pattern.querySelector('.usa-fieldset');
      const legend = pattern.querySelector('.usa-legend');

      expect(fieldset).toBeTruthy();
      expect(legend).toBeTruthy();
    });

    it('should have descriptive hints for all fields', () => {
      const givenName = pattern.querySelector('usa-text-input[name="givenName"]');
      const familyName = pattern.querySelector('usa-text-input[name="familyName"]');
      const middleName = pattern.querySelector('usa-text-input[name="middleName"]');

      expect(givenName?.getAttribute('hint')).toBeTruthy();
      expect(familyName?.getAttribute('hint')).toBeTruthy();
      expect(middleName?.getAttribute('hint')).toBeTruthy();
    });

    it('should mark optional fields appropriately', () => {
      const middleName = pattern.querySelector('usa-text-input[name="middleName"]');
      const suffix = pattern.querySelector('usa-select[name="suffix"]');

      expect(middleName?.getAttribute('hint')).toContain('optional');
      expect(suffix?.getAttribute('hint')).toContain('optional');
    });
  });

  describe('Suffix Selection', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-name-pattern') as USANamePattern;
      pattern.format = 'separate';
      pattern.showSuffix = true;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should render common name suffixes', async () => {
      const selectComponent = pattern.querySelector('usa-select[name="suffix"]') as any;
      await selectComponent?.updateComplete; // Wait for select component to render

      // Options are rendered as Light DOM children of the pattern before <usa-select> projects them
      const options = selectComponent?.querySelectorAll('option');

      // Should have "- Select -" plus suffixes (Jr., Sr., II, III, IV, V)
      expect(options?.length).toBeGreaterThanOrEqual(7);
    });

    it('should have default empty option', async () => {
      const selectComponent = pattern.querySelector('usa-select[name="suffix"]') as any;
      await selectComponent?.updateComplete; // Wait for select component to render

      // Options are rendered as Light DOM children of the pattern before <usa-select> projects them
      const firstOption = selectComponent?.querySelector('option');

      expect(firstOption?.value).toBe('');
      expect(firstOption?.textContent).toContain('Select');
    });

    it('should have Jr. option', async () => {
      const selectComponent = pattern.querySelector('usa-select[name="suffix"]') as any;
      await selectComponent?.updateComplete; // Wait for select component to render

      // Options are rendered as Light DOM children of the pattern before <usa-select> projects them
      const jrOption = Array.from(selectComponent?.querySelectorAll('option') || []).find(
        (opt) => (opt as HTMLOptionElement).value === 'Jr.'
      );

      expect(jrOption).toBeTruthy();
    });

    it('should have Sr. option', async () => {
      const selectComponent = pattern.querySelector('usa-select[name="suffix"]') as any;
      await selectComponent?.updateComplete; // Wait for select component to render

      // Options are rendered as Light DOM children of the pattern before <usa-select> projects them
      const srOption = Array.from(selectComponent?.querySelectorAll('option') || []).find(
        (opt) => (opt as HTMLOptionElement).value === 'Sr.'
      );

      expect(srOption).toBeTruthy();
    });

    it('should have roman numeral options', async () => {
      const selectComponent = pattern.querySelector('usa-select[name="suffix"]') as any;
      await selectComponent?.updateComplete; // Wait for select component to render

      // Options are rendered as Light DOM children of the pattern before <usa-select> projects them
      const iiOption = Array.from(selectComponent?.querySelectorAll('option') || []).find(
        (opt) => (opt as HTMLOptionElement).value === 'II'
      );
      const iiiOption = Array.from(selectComponent?.querySelectorAll('option') || []).find(
        (opt) => (opt as HTMLOptionElement).value === 'III'
      );

      expect(iiOption).toBeTruthy();
      expect(iiiOption).toBeTruthy();
    });
  });

  describe('Character Limits', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-name-pattern') as USANamePattern;
      pattern.format = 'separate';
      pattern.showMiddle = true;
      pattern.showPreferred = true;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should have 128 character limit for given name', () => {
      const givenName = pattern.querySelector('usa-text-input[name="givenName"]');
      expect(givenName?.getAttribute('maxlength')).toBe('128');
    });

    it('should have 128 character limit for middle name', () => {
      const middleName = pattern.querySelector('usa-text-input[name="middleName"]');
      expect(middleName?.getAttribute('maxlength')).toBe('128');
    });

    it('should have 128 character limit for family name', () => {
      const familyName = pattern.querySelector('usa-text-input[name="familyName"]');
      expect(familyName?.getAttribute('maxlength')).toBe('128');
    });

    it('should have 128 character limit for preferred name', () => {
      const preferredName = pattern.querySelector('usa-text-input[name="preferredName"]');
      expect(preferredName?.getAttribute('maxlength')).toBe('128');
    });
  });

  describe('Custom Labels', () => {
    it('should use custom label', async () => {
      pattern = document.createElement('usa-name-pattern') as USANamePattern;
      pattern.label = 'Full Legal Name';
      container.appendChild(pattern);
      await pattern.updateComplete;

      const legend = pattern.querySelector('legend');
      expect(legend?.textContent).toBe('Full Legal Name');
    });
  });

  describe('Cultural Sensitivity', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-name-pattern') as USANamePattern;
      pattern.format = 'separate';
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should use "given name" instead of "first name"', () => {
      const givenName = pattern.querySelector('usa-text-input[name="givenName"]');
      expect(givenName?.getAttribute('label')).toBe('Given name');
    });

    it('should use "family name" instead of "last name"', () => {
      const familyName = pattern.querySelector('usa-text-input[name="familyName"]');
      expect(familyName?.getAttribute('label')).toBe('Family name');
    });

    it('should support long names (128 chars)', () => {
      const givenName = pattern.querySelector('usa-text-input[name="givenName"]');
      const familyName = pattern.querySelector('usa-text-input[name="familyName"]');

      expect(givenName?.getAttribute('maxlength')).toBe('128');
      expect(familyName?.getAttribute('maxlength')).toBe('128');
    });
  });

  describe('Slot Rendering & Composition', () => {
    describe('Child Component Initialization', () => {
      beforeEach(async () => {
        pattern = document.createElement('usa-name-pattern') as USANamePattern;
        pattern.format = 'separate';
        pattern.showMiddle = true;
        pattern.showSuffix = true;
        pattern.showPreferred = true;
        container.appendChild(pattern);
        await pattern.updateComplete;
      });

      it('should initialize full name text input component', async () => {
        pattern.format = 'full';
        await pattern.updateComplete;

        const fullName = await verifyChildComponent(pattern, 'usa-text-input[name="fullName"]');
        expect(fullName).toBeTruthy();

        // Verify internal structure rendered
        const input = fullName.querySelector('input.usa-input');
        expect(input).toBeTruthy();
      });

      it('should initialize given name text input component', async () => {
        const givenName = await verifyChildComponent(pattern, 'usa-text-input[name="givenName"]');
        expect(givenName).toBeTruthy();

        const input = givenName.querySelector('input.usa-input');
        expect(input).toBeTruthy();
      });

      it('should initialize middle name text input component', async () => {
        const middleName = await verifyChildComponent(pattern, 'usa-text-input[name="middleName"]');
        expect(middleName).toBeTruthy();

        const input = middleName.querySelector('input.usa-input');
        expect(input).toBeTruthy();
      });

      it('should initialize family name text input component', async () => {
        const familyName = await verifyChildComponent(pattern, 'usa-text-input[name="familyName"]');
        expect(familyName).toBeTruthy();

        const input = familyName.querySelector('input.usa-input');
        expect(input).toBeTruthy();
      });

      it('should initialize suffix select component', async () => {
        const suffix = await verifyChildComponent(pattern, 'usa-select[name="suffix"]');
        expect(suffix).toBeTruthy();

        const select = suffix.querySelector('select.usa-select');
        expect(select).toBeTruthy();
      });

      it('should initialize preferred name text input component', async () => {
        const preferredName = await verifyChildComponent(
          pattern,
          'usa-text-input[name="preferredName"]'
        );
        expect(preferredName).toBeTruthy();

        const input = preferredName.querySelector('input.usa-input');
        expect(input).toBeTruthy();
      });

      it('should render all child components for full format', async () => {
        pattern.format = 'full';
        await pattern.updateComplete;

        // Full name should be visible
        const fullName = pattern.querySelector('usa-text-input[name="fullName"]');
        expect(fullName).toBeTruthy();
        expect(fullName?.closest('.display-none')).toBe(null);

        // Other fields should exist but be hidden
        const givenName = pattern.querySelector('usa-text-input[name="givenName"]');
        const familyName = pattern.querySelector('usa-text-input[name="familyName"]');
        expect(givenName).toBeTruthy();
        expect(familyName).toBeTruthy();
        expect(givenName?.closest('.display-none')).toBeTruthy();
      });

      it('should render all child components for separate format', async () => {
        pattern.format = 'separate';
        await pattern.updateComplete;

        // Separate fields should be visible
        const givenName = pattern.querySelector('usa-text-input[name="givenName"]');
        const familyName = pattern.querySelector('usa-text-input[name="familyName"]');
        expect(givenName).toBeTruthy();
        expect(familyName).toBeTruthy();
        expect(givenName?.closest('.display-none')).toBe(null);
        expect(familyName?.closest('.display-none')).toBe(null);

        // Full name should exist but be hidden
        const fullName = pattern.querySelector('usa-text-input[name="fullName"]');
        expect(fullName).toBeTruthy();
        expect(fullName?.closest('.display-none')).toBeTruthy();
      });

      it('should render all child components for flexible format', async () => {
        pattern.format = 'flexible';
        await pattern.updateComplete;

        // Both full name and separate fields should be visible
        const fullName = pattern.querySelector('usa-text-input[name="fullName"]');
        const givenName = pattern.querySelector('usa-text-input[name="givenName"]');
        const familyName = pattern.querySelector('usa-text-input[name="familyName"]');

        expect(fullName).toBeTruthy();
        expect(givenName).toBeTruthy();
        expect(familyName).toBeTruthy();

        expect(fullName?.closest('.display-none')).toBe(null);
        expect(givenName?.closest('.display-none')).toBe(null);
        expect(familyName?.closest('.display-none')).toBe(null);
      });
    });

    describe('Child Component DOM Structure', () => {
      beforeEach(async () => {
        pattern = document.createElement('usa-name-pattern') as USANamePattern;
        pattern.format = 'separate';
        pattern.showMiddle = true;
        pattern.showSuffix = true;
        pattern.showPreferred = true;
        container.appendChild(pattern);
        await pattern.updateComplete;
      });

      it('should render child components in correct DOM structure', async () => {
        // Wait for all child components to initialize
        const components = pattern.querySelectorAll('usa-text-input, usa-select');
        await Promise.all(
          Array.from(components).map((c: any) => c.updateComplete || Promise.resolve())
        );

        // Verify each component rendered its internal structure
        const givenName = pattern.querySelector('usa-text-input[name="givenName"]');
        const middleName = pattern.querySelector('usa-text-input[name="middleName"]');
        const familyName = pattern.querySelector('usa-text-input[name="familyName"]');
        const suffix = pattern.querySelector('usa-select[name="suffix"]');
        const preferredName = pattern.querySelector('usa-text-input[name="preferredName"]');

        expect(givenName?.querySelector('input')).toBeTruthy();
        expect(middleName?.querySelector('input')).toBeTruthy();
        expect(familyName?.querySelector('input')).toBeTruthy();
        expect(suffix?.querySelector('select')).toBeTruthy();
        expect(preferredName?.querySelector('input')).toBeTruthy();
      });

      it('should have correct USWDS classes on child components', async () => {
        const givenName = pattern.querySelector('usa-text-input[name="givenName"]');
        const suffix = pattern.querySelector('usa-select[name="suffix"]');

        const givenInput = givenName?.querySelector('input');
        const suffixSelect = suffix?.querySelector('select');

        expect(givenInput?.classList.contains('usa-input')).toBe(true);
        expect(suffixSelect?.classList.contains('usa-select')).toBe(true);
      });

      it('should have labels for all child components', async () => {
        const givenName = pattern.querySelector('usa-text-input[name="givenName"]');
        const middleName = pattern.querySelector('usa-text-input[name="middleName"]');
        const familyName = pattern.querySelector('usa-text-input[name="familyName"]');
        const suffix = pattern.querySelector('usa-select[name="suffix"]');

        expect(givenName?.querySelector('label')).toBeTruthy();
        expect(middleName?.querySelector('label')).toBeTruthy();
        expect(familyName?.querySelector('label')).toBeTruthy();
        expect(suffix?.querySelector('label')).toBeTruthy();
      });
    });

    describe('Pattern Composition', () => {
      beforeEach(async () => {
        pattern = document.createElement('usa-name-pattern') as USANamePattern;
        pattern.format = 'separate';
        pattern.showMiddle = true;
        pattern.showSuffix = true;
        pattern.showPreferred = true;
        container.appendChild(pattern);
        await pattern.updateComplete;
      });

      it('should compose all expected fields for full format', async () => {
        pattern.format = 'full';
        await pattern.updateComplete;

        await verifyUSWDSStructure(pattern, {
          fieldsetClass: 'usa-fieldset',
          legendClass: 'usa-legend usa-legend--large',
          expectedChildren: ['usa-text-input[name="fullName"]'],
        });
      });

      it('should compose all expected fields for separate format', async () => {
        await verifyUSWDSStructure(pattern, {
          fieldsetClass: 'usa-fieldset',
          legendClass: 'usa-legend usa-legend--large',
          expectedChildren: [
            'usa-text-input[name="givenName"]',
            'usa-text-input[name="middleName"]',
            'usa-text-input[name="familyName"]',
            'usa-select[name="suffix"]',
            'usa-text-input[name="preferredName"]',
          ],
        });
      });

      it('should compose all expected fields for flexible format', async () => {
        pattern.format = 'flexible';
        await pattern.updateComplete;

        await verifyUSWDSStructure(pattern, {
          fieldsetClass: 'usa-fieldset',
          legendClass: 'usa-legend usa-legend--large',
          expectedChildren: [
            'usa-text-input[name="fullName"]',
            'usa-text-input[name="givenName"]',
            'usa-text-input[name="familyName"]',
          ],
        });
      });

      it('should show/hide middle name based on showMiddle property', async () => {
        pattern.showMiddle = false;
        await pattern.updateComplete;

        const middleName = pattern.querySelector('usa-text-input[name="middleName"]');
        expect(middleName?.classList.contains('display-none')).toBe(true);

        pattern.showMiddle = true;
        await pattern.updateComplete;
        expect(middleName?.classList.contains('display-none')).toBe(false);
      });

      it('should show/hide suffix based on showSuffix property', async () => {
        pattern.showSuffix = false;
        await pattern.updateComplete;

        const suffix = pattern.querySelector('usa-select[name="suffix"]');
        expect(suffix?.classList.contains('display-none')).toBe(true);

        pattern.showSuffix = true;
        await pattern.updateComplete;
        expect(suffix?.classList.contains('display-none')).toBe(false);
      });

      it('should show/hide preferred name based on showPreferred property', async () => {
        pattern.showPreferred = false;
        await pattern.updateComplete;

        const preferredName = pattern.querySelector('usa-text-input[name="preferredName"]');
        expect(preferredName?.classList.contains('display-none')).toBe(true);

        pattern.showPreferred = true;
        await pattern.updateComplete;
        expect(preferredName?.classList.contains('display-none')).toBe(false);
      });
    });

    describe('Event Propagation from Child Components', () => {
      beforeEach(async () => {
        pattern = document.createElement('usa-name-pattern') as USANamePattern;
        pattern.format = 'separate';
        pattern.showMiddle = true;
        pattern.showSuffix = true;
        pattern.showPreferred = true;
        container.appendChild(pattern);
        await pattern.updateComplete;
      });

      it('should propagate input event from given name child component', async () => {
        const events: any[] = [];
        pattern.addEventListener('name-change', (e: Event) => {
          events.push((e as CustomEvent).detail);
        });

        const givenName = pattern.querySelector('usa-text-input[name="givenName"]') as any;
        await givenName?.updateComplete;

        const input = givenName?.querySelector('input') as HTMLInputElement;
        input.value = 'Jane';
        input.dispatchEvent(new Event('input', { bubbles: true }));

        expect(events.length).toBeGreaterThan(0);
        expect(events[0].field).toBe('givenName');
        expect(events[0].value).toBe('Jane');
      });

      it('should propagate input event from middle name child component', async () => {
        const events: any[] = [];
        pattern.addEventListener('name-change', (e: Event) => {
          events.push((e as CustomEvent).detail);
        });

        const middleName = pattern.querySelector('usa-text-input[name="middleName"]') as any;
        await middleName?.updateComplete;

        const input = middleName?.querySelector('input') as HTMLInputElement;
        input.value = 'Marie';
        input.dispatchEvent(new Event('input', { bubbles: true }));

        expect(events.length).toBeGreaterThan(0);
        expect(events[0].field).toBe('middleName');
        expect(events[0].value).toBe('Marie');
      });

      it('should propagate input event from family name child component', async () => {
        const events: any[] = [];
        pattern.addEventListener('name-change', (e: Event) => {
          events.push((e as CustomEvent).detail);
        });

        const familyName = pattern.querySelector('usa-text-input[name="familyName"]') as any;
        await familyName?.updateComplete;

        const input = familyName?.querySelector('input') as HTMLInputElement;
        input.value = 'Smith';
        input.dispatchEvent(new Event('input', { bubbles: true }));

        expect(events.length).toBeGreaterThan(0);
        expect(events[0].field).toBe('familyName');
        expect(events[0].value).toBe('Smith');
      });

      it('should propagate change event from suffix select child component', async () => {
        const events: any[] = [];
        pattern.addEventListener('name-change', (e: Event) => {
          events.push((e as CustomEvent).detail);
        });

        const suffix = pattern.querySelector('usa-select[name="suffix"]') as any;
        await suffix?.updateComplete;

        const select = suffix?.querySelector('select') as HTMLSelectElement;
        select.value = 'Jr.';
        select.dispatchEvent(new Event('change', { bubbles: true }));

        expect(events.length).toBeGreaterThan(0);
        expect(events[0].field).toBe('suffix');
        expect(events[0].value).toBe('Jr.');
      });

      it('should propagate input event from preferred name child component', async () => {
        const events: any[] = [];
        pattern.addEventListener('name-change', (e: Event) => {
          events.push((e as CustomEvent).detail);
        });

        const preferredName = pattern.querySelector('usa-text-input[name="preferredName"]') as any;
        await preferredName?.updateComplete;

        const input = preferredName?.querySelector('input') as HTMLInputElement;
        input.value = 'Jay';
        input.dispatchEvent(new Event('input', { bubbles: true }));

        expect(events.length).toBeGreaterThan(0);
        expect(events[0].field).toBe('preferredName');
        expect(events[0].value).toBe('Jay');
      });

      it('should include full name data in name-change event', async () => {
        const events: any[] = [];
        pattern.addEventListener('name-change', (e: Event) => {
          events.push((e as CustomEvent).detail);
        });

        // Set some initial values
        const givenName = pattern.querySelector('usa-text-input[name="givenName"]') as any;
        const givenInput = givenName?.querySelector('input') as HTMLInputElement;
        givenInput.value = 'John';
        givenInput.dispatchEvent(new Event('input', { bubbles: true }));
        await pattern.updateComplete;

        const familyName = pattern.querySelector('usa-text-input[name="familyName"]') as any;
        const familyInput = familyName?.querySelector('input') as HTMLInputElement;
        familyInput.value = 'Doe';
        familyInput.dispatchEvent(new Event('input', { bubbles: true }));

        expect(events.length).toBeGreaterThan(0);
        const lastEvent = events[events.length - 1];
        expect(lastEvent.nameData).toBeDefined();
        expect(lastEvent.nameData.givenName).toBe('John');
        expect(lastEvent.nameData.familyName).toBe('Doe');
      });
    });

    describe('Suffix Select Property Binding', () => {
      beforeEach(async () => {
        pattern = document.createElement('usa-name-pattern') as USANamePattern;
        pattern.format = 'separate';
        pattern.showSuffix = true;
        container.appendChild(pattern);
        await pattern.updateComplete;
      });

      it('should render suffix options via property binding', async () => {
        const suffix = pattern.querySelector('usa-select[name="suffix"]') as any;
        await suffix?.updateComplete;

        // Verify options were created from property binding
        await verifyPropertyBinding(suffix, 'select', 'option', 7); // - Select - + 6 suffixes
      });

      it('should have correct suffix option values', async () => {
        const suffix = pattern.querySelector('usa-select[name="suffix"]');
        const select = suffix?.querySelector('select');
        const options = select?.querySelectorAll('option');

        const values = Array.from(options || []).map((opt) => (opt as HTMLOptionElement).value);

        expect(values).toContain('');
        expect(values).toContain('Jr.');
        expect(values).toContain('Sr.');
        expect(values).toContain('II');
        expect(values).toContain('III');
        expect(values).toContain('IV');
        expect(values).toContain('V');
      });
    });

    describe('Compact Mode', () => {
      beforeEach(async () => {
        pattern = document.createElement('usa-name-pattern') as USANamePattern;
        pattern.format = 'separate';
        container.appendChild(pattern);
        await pattern.updateComplete;
      });

      it('should use compact mode for child text input components', async () => {
        const givenName = pattern.querySelector('usa-text-input[name="givenName"]');
        await verifyCompactMode(givenName as HTMLElement);
      });

      it('should use compact mode for suffix select component', async () => {
        pattern.showSuffix = true;
        await pattern.updateComplete;

        const suffix = pattern.querySelector('usa-select[name="suffix"]');
        await verifyCompactMode(suffix as HTMLElement);
      });

      it('should not have form-group wrappers in compact mode', async () => {
        const components = pattern.querySelectorAll('usa-text-input, usa-select');
        await Promise.all(
          Array.from(components).map((c: any) => c.updateComplete || Promise.resolve())
        );

        components.forEach((component) => {
          const formGroup = component.querySelector('.usa-form-group');
          expect(formGroup).toBeFalsy();
        });
      });
    });

    describe('Programmatic Access to Child Components', () => {
      beforeEach(async () => {
        pattern = document.createElement('usa-name-pattern') as USANamePattern;
        pattern.format = 'separate';
        pattern.showMiddle = true;
        pattern.showSuffix = true;
        pattern.showPreferred = true;
        container.appendChild(pattern);
        await pattern.updateComplete;
      });

      it('should allow direct access to child component APIs', async () => {
        const givenName = pattern.querySelector('usa-text-input[name="givenName"]') as any;
        const suffix = pattern.querySelector('usa-select[name="suffix"]') as any;

        expect(typeof givenName?.reset).toBe('function');
        expect(typeof suffix?.reset).toBe('function');
      });

      it('should allow setting child component values programmatically', async () => {
        const givenName = pattern.querySelector('usa-text-input[name="givenName"]') as any;
        await givenName?.updateComplete;

        givenName.value = 'Alice';
        await givenName.updateComplete;

        expect(givenName.value).toBe('Alice');
        const input = givenName.querySelector('input') as HTMLInputElement;
        expect(input.value).toBe('Alice');
      });

      it('should allow resetting child components via pattern API', async () => {
        // Set some values
        pattern.setNameData({
          givenName: 'John',
          middleName: 'Michael',
          familyName: 'Smith',
          suffix: 'Jr.',
          preferredName: 'Mike',
        });
        await pattern.updateComplete;

        // Clear via pattern API
        pattern.clearName();
        await pattern.updateComplete;

        // Verify all children were reset
        const givenName = pattern.querySelector('usa-text-input[name="givenName"]') as any;
        const middleName = pattern.querySelector('usa-text-input[name="middleName"]') as any;
        const familyName = pattern.querySelector('usa-text-input[name="familyName"]') as any;
        const suffix = pattern.querySelector('usa-select[name="suffix"]') as any;
        const preferredName = pattern.querySelector('usa-text-input[name="preferredName"]') as any;

        const givenInput = givenName?.querySelector('input') as HTMLInputElement;
        const middleInput = middleName?.querySelector('input') as HTMLInputElement;
        const familyInput = familyName?.querySelector('input') as HTMLInputElement;
        const suffixSelect = suffix?.querySelector('select') as HTMLSelectElement;
        const preferredInput = preferredName?.querySelector('input') as HTMLInputElement;

        expect(givenInput?.value).toBe('');
        expect(middleInput?.value).toBe('');
        expect(familyInput?.value).toBe('');
        expect(suffixSelect?.value).toBe('');
        expect(preferredInput?.value).toBe('');
      });
    });
  });
});
