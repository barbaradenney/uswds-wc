import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import './usa-select.ts';
import type { USASelect } from './usa-select.js';
import {
  testComponentAccessibility,
  USWDS_A11Y_CONFIG,
} from '@uswds-wc/test-utils/accessibility-utils.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';

describe('USASelect', () => {
  let element: USASelect;

  beforeEach(() => {
    element = document.createElement('usa-select') as USASelect;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('Default Properties', () => {
    it('should have correct default properties', async () => {
      await element.updateComplete;

      expect(element.name).toBe('');
      expect(element.value).toBe('');
      expect(element.label).toBe('');
      expect(element.hint).toBe('');
      expect(element.error).toBe('');
      expect(element.success).toBe('');
      expect(element.disabled).toBe(false);
      expect(element.required).toBe(false);
      expect(element.options).toEqual([]);
      expect(element.defaultOption).toBe('');
    });
  });

  describe('Basic Select Properties', () => {
    it('should set name property', async () => {
      element.name = 'test-name';
      await element.updateComplete;

      const select = element.querySelector('select') as HTMLSelectElement;
      expect(select?.name).toBe('test-name');
    });

    it('should set value property', async () => {
      element.options = [
        { value: 'option1', text: 'Option 1' },
        { value: 'option2', text: 'Option 2' },
      ];
      element.value = 'option1';
      await element.updateComplete;

      const select = element.querySelector('select') as HTMLSelectElement;
      expect(select?.value).toBe('option1');
    });

    it('should set disabled state', async () => {
      element.disabled = true;
      await element.updateComplete;

      const select = element.querySelector('select') as HTMLSelectElement;
      expect(select?.disabled).toBe(true);
    });

    it('should set required state', async () => {
      element.required = true;
      await element.updateComplete;

      const select = element.querySelector('select') as HTMLSelectElement;
      expect(select?.required).toBe(true);
    });
  });

  describe('Light DOM Initial Render (CRITICAL)', () => {
    it('should render options from array in initial render', async () => {
      const freshElement = document.createElement('usa-select') as USASelect;
      freshElement.options = [
        { value: 'opt1', text: 'Option 1' },
        { value: 'opt2', text: 'Option 2' },
        { value: 'opt3', text: 'Option 3' },
      ];
      freshElement.label = 'Test';
      document.body.appendChild(freshElement);

      // Wait for Lit's async first render
      await freshElement.updateComplete;

      const select = freshElement.querySelector('select') as HTMLSelectElement;
      const options = select?.querySelectorAll('option');

      expect(options?.length).toBe(3);
      expect(options?.[0].value).toBe('opt1');
      expect(options?.[1].value).toBe('opt2');
      expect(options?.[2].value).toBe('opt3');

      freshElement.remove();
    });

    it('should render options inside select element not as siblings', async () => {
      const freshElement = document.createElement('usa-select') as USASelect;
      freshElement.options = [
        { value: 'opt1', text: 'Option 1' },
        { value: 'opt2', text: 'Option 2' },
      ];
      freshElement.label = 'Test';
      document.body.appendChild(freshElement);

      // Wait for Lit's async first render
      await freshElement.updateComplete;

      const select = freshElement.querySelector('select') as HTMLSelectElement;
      const options = select?.querySelectorAll('option');

      // Verify options are children of select, not siblings
      expect(select?.contains(options?.[0])).toBe(true);
      expect(select?.contains(options?.[1])).toBe(true);

      // Verify no options exist outside select
      const allOptions = freshElement.querySelectorAll('option');
      const selectOptions = select?.querySelectorAll('option');
      expect(allOptions?.length).toBe(selectOptions?.length);

      freshElement.remove();
    });

    it('should set selected option in initial render', async () => {
      const freshElement = document.createElement('usa-select') as USASelect;
      freshElement.options = [
        { value: 'opt1', text: 'Option 1' },
        { value: 'opt2', text: 'Option 2' },
      ];
      freshElement.value = 'opt2';
      freshElement.label = 'Test';
      document.body.appendChild(freshElement);

      // Wait for Lit's async first render
      await freshElement.updateComplete;

      const select = freshElement.querySelector('select') as HTMLSelectElement;
      expect(select?.value).toBe('opt2');

      freshElement.remove();
    });

    it('should set disabled state in initial render', async () => {
      const freshElement = document.createElement('usa-select') as USASelect;
      freshElement.disabled = true;
      freshElement.label = 'Test';
      document.body.appendChild(freshElement);

      // Wait for Lit's async first render
      await freshElement.updateComplete;

      const select = freshElement.querySelector('select') as HTMLSelectElement;
      expect(select?.disabled).toBe(true);

      freshElement.remove();
    });

    it('should apply USWDS classes in initial render', async () => {
      const freshElement = document.createElement('usa-select') as USASelect;
      freshElement.error = 'Error message';
      freshElement.label = 'Test';
      document.body.appendChild(freshElement);

      // Wait for Lit's async first render
      await freshElement.updateComplete;

      const select = freshElement.querySelector('select') as HTMLSelectElement;
      expect(select?.classList.contains('usa-select')).toBe(true);

      freshElement.remove();
    });
  });

  describe('Label and Helper Text', () => {
    it('should render label text', async () => {
      element.label = 'Test select';
      await element.updateComplete;

      const label = element.querySelector('.usa-label');
      expect(label?.textContent?.trim()).toContain('Test select');
    });

    it('should associate label with select via ID', async () => {
      element.id = 'test-select';
      element.label = 'Test select';
      await element.updateComplete;

      const select = element.querySelector('select');
      const label = element.querySelector('label');

      expect(select?.id).toBe('test-select');
      expect(label?.getAttribute('for')).toBe('test-select');
    });

    it('should render hint text', async () => {
      element.hint = 'This is helper text';
      await element.updateComplete;

      const hint = element.querySelector('.usa-hint');
      expect(hint?.textContent?.trim()).toBe('This is helper text');
    });

    it('should not render label when empty', async () => {
      element.label = '';
      await element.updateComplete;

      const label = element.querySelector('label');
      expect(label).toBeNull();
    });

    it('should generate ID when not provided', async () => {
      await element.updateComplete;

      const select = element.querySelector('select');
      expect(select?.id).toMatch(/^select-[a-z0-9]{9}$/);
    });

    it('should show required asterisk in label', async () => {
      element.label = 'Required field';
      element.required = true;
      await element.updateComplete;

      const requiredSpan = element.querySelector('.usa-hint--required');
      expect(requiredSpan?.textContent?.trim()).toBe('*');
    });
  });

  describe('Options Rendering', () => {
    it('should render options from array', async () => {
      element.options = [
        { value: 'value1', text: 'Option 1' },
        { value: 'value2', text: 'Option 2' },
        { value: 'value3', text: 'Option 3' },
      ];
      await element.updateComplete;

      const options = element.querySelectorAll('option');
      expect(options.length).toBe(3);
      expect(options[0].value).toBe('value1');
      expect(options[0].textContent?.trim()).toBe('Option 1');
      expect(options[1].value).toBe('value2');
      expect(options[1].textContent?.trim()).toBe('Option 2');
    });

    it('should render default option when provided', async () => {
      element.defaultOption = '- Select an option -';
      element.options = [{ value: 'value1', text: 'Option 1' }];
      await element.updateComplete;

      const options = element.querySelectorAll('option');
      expect(options.length).toBe(2);
      expect(options[0].value).toBe('');
      expect(options[0].textContent?.trim()).toBe('- Select an option -');
    });

    it('should handle disabled options', async () => {
      element.options = [
        { value: 'value1', text: 'Option 1' },
        { value: 'value2', text: 'Option 2', disabled: true },
      ];
      await element.updateComplete;

      const options = element.querySelectorAll('option');
      expect(options[0].disabled).toBe(false);
      expect(options[1].disabled).toBe(true);
    });

    it('should mark selected option', async () => {
      element.options = [
        { value: 'value1', text: 'Option 1' },
        { value: 'value2', text: 'Option 2' },
      ];
      element.value = 'value2';
      await element.updateComplete;

      const options = element.querySelectorAll('option');
      expect(options[0].selected).toBe(false);
      expect(options[1].selected).toBe(true);
    });

    it('should support slotted options', async () => {
      element.innerHTML = `
        <option value="slot1">Slotted Option 1</option>
        <option value="slot2">Slotted Option 2</option>
      `;
      await element.updateComplete;

      const slottedOptions = element.querySelectorAll('option');
      expect(slottedOptions.length).toBe(2);
      expect(slottedOptions[0].value).toBe('slot1');
    });
  });

  describe('Error State', () => {
    it('should render error message when provided', async () => {
      element.error = 'This field is required';
      await element.updateComplete;

      const errorMsg = element.querySelector('.usa-error-message');
      expect(errorMsg?.textContent?.includes('This field is required')).toBe(true);
      expect(errorMsg?.getAttribute('role')).toBe('alert');
    });

    it('should apply error class to select when error exists', async () => {
      element.error = 'Test error';
      await element.updateComplete;

      const select = element.querySelector('select');
      expect(select?.classList.contains('usa-select--error')).toBe(true);
    });

    it('should set aria-invalid when error exists', async () => {
      element.error = 'Test error';
      await element.updateComplete;

      const select = element.querySelector('select');
      expect(select?.getAttribute('aria-invalid')).toBe('true');
    });

    it('should not render error message when empty', async () => {
      element.error = '';
      await element.updateComplete;

      const errorMsg = element.querySelector('.usa-error-message');
      expect(errorMsg).toBeNull();
    });
  });

  describe('Success State', () => {
    it('should render success message when provided', async () => {
      element.success = 'Good choice!';
      await element.updateComplete;

      const successMsg = element.querySelector('span[role="status"].usa-hint');
      expect(successMsg?.textContent?.includes('Good choice!')).toBe(true);
      expect(successMsg?.getAttribute('role')).toBe('status');
    });

    it('should apply success class to select when success exists', async () => {
      element.success = 'Test success';
      await element.updateComplete;

      const select = element.querySelector('select');
      expect(select?.classList.contains('usa-select--success')).toBe(true);
    });

    it('should not render success message when empty', async () => {
      element.success = '';
      await element.updateComplete;

      const successMsg = element.querySelector('span[role="status"].usa-hint');
      expect(successMsg).toBeNull();
    });
  });

  describe('ARIA Attributes', () => {
    it('should associate select with hint via aria-describedby', async () => {
      element.id = 'test-select';
      element.hint = 'Test hint';
      await element.updateComplete;

      const select = element.querySelector('select');
      expect(select?.getAttribute('aria-describedby')).toBe('test-select-hint');
    });

    it('should associate select with error via aria-describedby', async () => {
      element.id = 'test-select';
      element.error = 'Test error';
      await element.updateComplete;

      const select = element.querySelector('select');
      expect(select?.getAttribute('aria-describedby')).toBe('test-select-error');
    });

    it('should associate select with success via aria-describedby', async () => {
      element.id = 'test-select';
      element.success = 'Test success';
      await element.updateComplete;

      const select = element.querySelector('select');
      expect(select?.getAttribute('aria-describedby')).toBe('test-select-success');
    });

    it('should associate select with multiple elements via aria-describedby', async () => {
      element.id = 'test-select';
      element.hint = 'Test hint';
      element.error = 'Test error';
      await element.updateComplete;

      const select = element.querySelector('select');
      expect(select?.getAttribute('aria-describedby')).toBe('test-select-hint test-select-error');
    });

    it('should have correct IDs for hint, error, and success elements', async () => {
      element.id = 'test-select';
      element.hint = 'Test hint';
      element.error = 'Test error';
      element.success = 'Test success';
      await element.updateComplete;

      const hint = element.querySelector('.usa-hint');
      const error = element.querySelector('.usa-error-message');
      const success = element.querySelector('span[role="status"].usa-hint');

      expect(hint?.id).toBe('test-select-hint');
      expect(error?.id).toBe('test-select-error');
      expect(success?.id).toBe('test-select-success');
    });

    it('should not set aria-describedby when no hint, error, or success', async () => {
      element.id = 'test-select';
      await element.updateComplete;

      const select = element.querySelector('select');
      expect(select?.hasAttribute('aria-describedby')).toBe(false);
    });

    it('should pass comprehensive accessibility tests (same as Storybook)', async () => {
      element.label = 'Test Select';
      element.options = [
        { value: 'option1', text: 'Option 1' },
        { value: 'option2', text: 'Option 2' },
      ];
      await element.updateComplete;

      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });
  });

  describe('Event Handling', () => {
    it('should dispatch change event when selection changes', async () => {
      element.options = [
        { value: 'option1', text: 'Option 1' },
        { value: 'option2', text: 'Option 2' },
      ];
      await element.updateComplete;

      let changeEventDetail: any;
      element.addEventListener('change', (e: any) => {
        changeEventDetail = e.detail;
      });

      const select = element.querySelector('select') as HTMLSelectElement;

      // Simulate the change by setting value and creating a change event
      select.value = 'option1';
      const changeEvent = new Event('change', { bubbles: true });
      Object.defineProperty(changeEvent, 'target', {
        writable: false,
        value: select,
      });

      // Manually trigger the component's handleChange method
      (element as any).handleChange(changeEvent);

      await element.updateComplete;

      expect(changeEventDetail.value).toBe('option1');
      expect(element.value).toBe('option1');
    });

    it('should dispatch input event when selection changes', async () => {
      element.options = [
        { value: 'option1', text: 'Option 1' },
        { value: 'option2', text: 'Option 2' },
      ];
      await element.updateComplete;

      let inputEventDetail: any;
      element.addEventListener('input', (e: any) => {
        inputEventDetail = e.detail;
      });

      const select = element.querySelector('select') as HTMLSelectElement;

      // Simulate the change by setting value and creating a change event
      select.value = 'option2';
      const changeEvent = new Event('change', { bubbles: true });
      Object.defineProperty(changeEvent, 'target', {
        writable: false,
        value: select,
      });

      // Manually trigger the component's handleChange method
      (element as any).handleChange(changeEvent);

      await element.updateComplete;

      expect(inputEventDetail.value).toBe('option2');
    });
  });

  describe('USWDS CSS Classes', () => {
    it('should always have base usa-select class', async () => {
      await element.updateComplete;

      const select = element.querySelector('select');
      expect(select?.classList.contains('usa-select')).toBe(true);
    });

    it('should have correct label class', async () => {
      element.label = 'Test';
      await element.updateComplete;

      const label = element.querySelector('label');
      expect(label?.classList.contains('usa-label')).toBe(true);
    });

    it('should have correct hint class', async () => {
      element.hint = 'Test hint';
      await element.updateComplete;

      const hint = element.querySelector('.usa-hint');
      expect(hint).toBeTruthy();
    });

    it('should have proper USWDS structure', async () => {
      element.label = 'Test Label';
      element.hint = 'Test Hint';
      element.error = 'Test Error';
      element.success = 'Test Success';
      await element.updateComplete;

      const label = element.querySelector('.usa-label');
      const hint = element.querySelector('.usa-hint');
      const error = element.querySelector('.usa-error-message');
      const success = element.querySelector('span[role="status"].usa-hint');
      const select = element.querySelector('.usa-select');

      expect(label).toBeTruthy();
      expect(hint).toBeTruthy();
      expect(error).toBeTruthy();
      expect(success).toBeTruthy();
      expect(select).toBeTruthy();
    });
  });

  describe('Light DOM Rendering', () => {
    it('should render in light DOM for USWDS compatibility', async () => {
      await element.updateComplete;

      expect(element.shadowRoot).toBeNull();
      expect(element.querySelector('select')).toBeTruthy();
    });
  });

  // NOTE: Form integration tests moved to Cypress (usa-select.component.cy.ts:259-287)
  // These tests require real browser form behavior which is unreliable in jsdom

  describe('ID Management', () => {
    it('should use provided ID consistently', async () => {
      const newElement = document.createElement('usa-select') as USASelect;
      newElement.id = 'custom-select';
      newElement.label = 'Test';
      newElement.hint = 'Test hint';
      newElement.error = 'Test error';
      newElement.success = 'Test success';
      document.body.appendChild(newElement);
      await newElement.updateComplete;

      const select = newElement.querySelector('select');
      const label = newElement.querySelector('label');
      const hint = newElement.querySelector('.usa-hint');
      const error = newElement.querySelector('.usa-error-message');
      const success = newElement.querySelector('span[role="status"].usa-hint');

      expect(select?.id).toBe('custom-select');
      expect(label?.getAttribute('for')).toBe('custom-select');
      expect(hint?.id).toBe('custom-select-hint');
      expect(error?.id).toBe('custom-select-error');
      expect(success?.id).toBe('custom-select-success');

      newElement.remove();
    });
  });

  describe('Options Update', () => {
    it('should update options dynamically', async () => {
      element.options = [{ value: 'option1', text: 'Option 1' }];
      await element.updateComplete;

      let options = element.querySelectorAll('option');
      expect(options.length).toBe(1);

      // Update options
      element.options = [
        { value: 'option1', text: 'Option 1' },
        { value: 'option2', text: 'Option 2' },
        { value: 'option3', text: 'Option 3' },
      ];
      await element.updateComplete;

      options = element.querySelectorAll('option');
      expect(options.length).toBe(3);
    });

    it('should preserve selection when options change', async () => {
      element.options = [
        { value: 'option1', text: 'Option 1' },
        { value: 'option2', text: 'Option 2' },
      ];
      element.value = 'option2';
      await element.updateComplete;

      // Update options but keep the selected one
      element.options = [
        { value: 'option1', text: 'Updated Option 1' },
        { value: 'option2', text: 'Updated Option 2' },
        { value: 'option3', text: 'New Option 3' },
      ];
      await element.updateComplete;

      const select = element.querySelector('select') as HTMLSelectElement;
      expect(select.value).toBe('option2');
      expect(element.value).toBe('option2');
    });
  });

  describe('Application Use Cases', () => {
    describe('Federal Geographic Selection', () => {
      it('should handle US states selection', async () => {
        const stateOptions = [
          { value: 'AL', text: 'Alabama' },
          { value: 'AK', text: 'Alaska' },
          { value: 'CA', text: 'California' },
          { value: 'FL', text: 'Florida' },
          { value: 'TX', text: 'Texas' },
        ];

        element.label = 'State of Residence';
        element.name = 'state';
        element.required = true;
        element.defaultOption = '- Select your state -';
        element.options = stateOptions;
        element.hint = 'Required for tax and legal purposes';
        await element.updateComplete;

        const options = element.querySelectorAll('option');
        expect(options.length).toBe(6); // 5 states + default option
        expect(options[0].value).toBe('');
        expect(options[0].textContent?.trim()).toBe('- Select your state -');
        expect(options[1].value).toBe('AL');
        expect(options[1].textContent?.trim()).toBe('Alabama');

        const select = element.querySelector('select');
        expect(select?.required).toBe(true);
      });

      it('should handle federal territories and districts', async () => {
        const territoryOptions = [
          { value: 'DC', text: 'District of Columbia' },
          { value: 'PR', text: 'Puerto Rico' },
          { value: 'VI', text: 'U.S. Virgin Islands' },
          { value: 'GU', text: 'Guam' },
          { value: 'AS', text: 'American Samoa' },
          { value: 'MP', text: 'Northern Mariana Islands' },
        ];

        element.label = 'Federal Territory';
        element.options = territoryOptions;
        element.defaultOption = '- Select territory -';
        await element.updateComplete;

        const options = element.querySelectorAll('option');
        expect(options.length).toBe(7); // 6 territories + default
        expect(options[1].value).toBe('DC');
        expect(options[2].value).toBe('PR');
      });

      it('should handle federal regional offices', async () => {
        const regionalOptions = [
          { value: 'region1', text: 'Region 1 - Boston' },
          { value: 'region2', text: 'Region 2 - New York' },
          { value: 'region3', text: 'Region 3 - Philadelphia' },
          { value: 'region4', text: 'Region 4 - Atlanta' },
          { value: 'region5', text: 'Region 5 - Chicago' },
          { value: 'region6', text: 'Region 6 - Dallas' },
          { value: 'region7', text: 'Region 7 - Kansas City' },
          { value: 'region8', text: 'Region 8 - Denver' },
          { value: 'region9', text: 'Region 9 - San Francisco' },
          { value: 'region10', text: 'Region 10 - Seattle' },
        ];

        element.label = 'EPA Regional Office';
        element.options = regionalOptions;
        element.hint = 'Select your EPA regional jurisdiction';
        await element.updateComplete;

        expect(element.options.length).toBe(10);
        expect(element.options[0].text).toContain('Boston');
        expect(element.options[9].text).toContain('Seattle');
      });
    });

    describe('Federal Agency Selection', () => {
      it('should handle cabinet-level departments', async () => {
        const departmentOptions = [
          { value: 'DOD', text: 'Department of Defense' },
          { value: 'DHS', text: 'Department of Homeland Security' },
          { value: 'DOJ', text: 'Department of Justice' },
          { value: 'DOT', text: 'Department of Transportation' },
          { value: 'HHS', text: 'Department of Health and Human Services' },
          { value: 'ED', text: 'Department of Education' },
          { value: 'VA', text: 'Department of Veterans Affairs' },
          { value: 'USDA', text: 'Department of Agriculture' },
          { value: 'DOI', text: 'Department of the Interior' },
          { value: 'DOE', text: 'Department of Energy' },
          { value: 'DOL', text: 'Department of Labor' },
          { value: 'HUD', text: 'Department of Housing and Urban Development' },
          { value: 'STATE', text: 'Department of State' },
          { value: 'TREASURY', text: 'Department of the Treasury' },
          { value: 'COMMERCE', text: 'Department of Commerce' },
        ];

        element.label = 'Federal Department';
        element.name = 'federal_department';
        element.options = departmentOptions;
        element.defaultOption = '- Select department -';
        element.required = true;
        await element.updateComplete;

        const options = element.querySelectorAll('option');
        expect(options.length).toBe(16); // 15 departments + default
        expect(options[1].textContent?.trim()).toBe('Department of Defense');
        expect(options[15].textContent?.trim()).toBe('Department of Commerce');
      });

      it('should handle independent federal agencies', async () => {
        const agencyOptions = [
          { value: 'EPA', text: 'Environmental Protection Agency' },
          { value: 'NASA', text: 'National Aeronautics and Space Administration' },
          { value: 'NSF', text: 'National Science Foundation' },
          { value: 'SBA', text: 'Small Business Administration' },
          { value: 'SSA', text: 'Social Security Administration' },
          { value: 'USAID', text: 'U.S. Agency for International Development' },
          { value: 'GSA', text: 'General Services Administration' },
          { value: 'OPM', text: 'Office of Personnel Management' },
        ];

        element.label = 'Independent Agency';
        element.options = agencyOptions;
        element.hint = 'Select the independent organization';
        await element.updateComplete;

        expect(element.options.length).toBe(8);
        const epaOption = element.options.find((opt) => opt.value === 'EPA');
        expect(epaOption?.text).toBe('Environmental Protection Agency');
      });
    });

    describe('Federal Employment Classifications', () => {
      it('should handle GS pay scales', async () => {
        const gsLevels = [
          { value: 'GS-7', text: 'GS-7 ($35,854 - $46,609)' },
          { value: 'GS-9', text: 'GS-9 ($43,251 - $56,227)' },
          { value: 'GS-11', text: 'GS-11 ($52,276 - $67,960)' },
          { value: 'GS-12', text: 'GS-12 ($62,722 - $81,540)' },
          { value: 'GS-13', text: 'GS-13 ($74,596 - $97,020)' },
          { value: 'GS-14', text: 'GS-14 ($88,136 - $114,579)' },
          { value: 'GS-15', text: 'GS-15 ($103,690 - $134,798)' },
        ];

        element.label = 'Target GS Level';
        element.name = 'gs_level';
        element.options = gsLevels;
        element.hint = 'Select desired pay grade for federal position';
        await element.updateComplete;

        const options = element.querySelectorAll('option');
        expect(options.length).toBe(7);
        expect(options[0].value).toBe('GS-7');
        expect(options[0].textContent?.includes('$35,854')).toBe(true);
      });

      it('should handle security clearance levels', async () => {
        const clearanceLevels = [
          { value: 'PUBLIC_TRUST', text: 'Public Trust' },
          { value: 'CONFIDENTIAL', text: 'Confidential' },
          { value: 'SECRET', text: 'Secret' },
          { value: 'TOP_SECRET', text: 'Top Secret' },
          { value: 'TOP_SECRET_SCI', text: 'Top Secret/SCI' },
          { value: 'Q_CLEARANCE', text: 'Q Clearance (DOE)' },
          { value: 'L_CLEARANCE', text: 'L Clearance (DOE)' },
        ];

        element.label = 'Security Clearance Level';
        element.name = 'clearance_level';
        element.options = clearanceLevels;
        element.defaultOption = '- Select clearance level -';
        element.hint = 'Current or eligible security clearance';
        await element.updateComplete;

        const secretOption = element.options.find((opt) => opt.value === 'SECRET');
        expect(secretOption?.text).toBe('Secret');

        const topSecretOption = element.options.find((opt) => opt.value === 'TOP_SECRET_SCI');
        expect(topSecretOption?.text).toBe('Top Secret/SCI');
      });

      it('should handle federal work schedules', async () => {
        const scheduleOptions = [
          { value: 'FULL_TIME', text: 'Full-Time (40 hours/week)' },
          { value: 'PART_TIME', text: 'Part-Time (less than 40 hours)' },
          { value: 'INTERMITTENT', text: 'Intermittent (as needed)' },
          { value: 'SEASONAL', text: 'Seasonal' },
          { value: 'TEMPORARY', text: 'Temporary (1 year or less)' },
          { value: 'TELEWORK', text: 'Telework Eligible' },
          { value: 'REMOTE', text: 'Remote Work' },
        ];

        element.label = 'Work Schedule Type';
        element.options = scheduleOptions;
        element.defaultOption = '- Select schedule -';
        await element.updateComplete;

        const options = element.querySelectorAll('option');
        expect(options.length).toBe(8); // 7 schedules + default
        expect(options[1].textContent?.includes('Full-Time')).toBe(true);
      });
    });

    describe('Federal Benefits and Services', () => {
      it('should handle Medicare plan types', async () => {
        const medicareOptions = [
          { value: 'PART_A', text: 'Part A - Hospital Insurance' },
          { value: 'PART_B', text: 'Part B - Medical Insurance' },
          { value: 'PART_C', text: 'Part C - Medicare Advantage' },
          { value: 'PART_D', text: 'Part D - Prescription Drug Coverage' },
          { value: 'SUPPLEMENT', text: 'Medicare Supplement Insurance' },
          { value: 'MEDICAID_DUAL', text: 'Medicare-Medicaid (Dual Eligible)' },
        ];

        element.label = 'Medicare Plan Type';
        element.name = 'medicare_plan';
        element.options = medicareOptions;
        element.hint = 'Select your current Medicare coverage';
        element.required = true;
        await element.updateComplete;

        const partAOption = element.options.find((opt) => opt.value === 'PART_A');
        expect(partAOption?.text).toBe('Part A - Hospital Insurance');

        const select = element.querySelector('select');
        expect(select?.required).toBe(true);
      });

      it('should handle VA disability ratings', async () => {
        const disabilityRatings = [
          { value: '0', text: '0% - Non-compensable' },
          { value: '10', text: '10% - Minimal disability' },
          { value: '20', text: '20% - Slight disability' },
          { value: '30', text: '30% - Moderate disability' },
          { value: '40', text: '40% - More than moderate' },
          { value: '50', text: '50% - Considerable disability' },
          { value: '60', text: '60% - Considerable disability' },
          { value: '70', text: '70% - Severe disability' },
          { value: '80', text: '80% - Severe disability' },
          { value: '90', text: '90% - Very severe disability' },
          { value: '100', text: '100% - Total disability' },
        ];

        element.label = 'VA Disability Rating';
        element.name = 'disability_rating';
        element.options = disabilityRatings;
        element.hint = 'Current VA disability compensation rating';
        element.defaultOption = '- Select rating -';
        await element.updateComplete;

        const options = element.querySelectorAll('option');
        expect(options.length).toBe(12); // 11 ratings + default
        expect(options[11].value).toBe('100');
        expect(options[11].textContent?.includes('Total disability')).toBe(true);
      });

      it('should handle Social Security benefit types', async () => {
        const benefitTypes = [
          { value: 'RETIREMENT', text: 'Retirement Benefits' },
          { value: 'DISABILITY', text: 'Social Security Disability Insurance (SSDI)' },
          { value: 'SSI', text: 'Supplemental Security Income (SSI)' },
          { value: 'SURVIVOR', text: 'Survivor Benefits' },
          { value: 'SPOUSAL', text: 'Spousal Benefits' },
          { value: 'CHILD', text: 'Child Benefits' },
          { value: 'MEDICARE', text: 'Medicare Benefits Only' },
        ];

        element.label = 'Social Security Benefit Type';
        element.name = 'benefit_type';
        element.options = benefitTypes;
        element.defaultOption = '- Select benefit type -';
        element.hint = 'Type of Social Security benefits you receive or are applying for';
        await element.updateComplete;

        const ssdiOption = element.options.find((opt) => opt.value === 'DISABILITY');
        expect(ssdiOption?.text).toBe('Social Security Disability Insurance (SSDI)');
      });
    });

    describe('Federal Tax and Legal Classifications', () => {
      it('should handle tax filing status', async () => {
        const filingStatus = [
          { value: 'SINGLE', text: 'Single' },
          { value: 'MARRIED_JOINT', text: 'Married Filing Jointly' },
          { value: 'MARRIED_SEPARATE', text: 'Married Filing Separately' },
          { value: 'HEAD_HOUSEHOLD', text: 'Head of Household' },
          { value: 'QUALIFYING_WIDOW', text: 'Qualifying Widow(er)' },
        ];

        element.label = 'Federal Tax Filing Status';
        element.name = 'filing_status';
        element.options = filingStatus;
        element.required = true;
        element.hint = 'Your filing status for the most recent tax year';
        await element.updateComplete;

        const marriedJointOption = element.options.find((opt) => opt.value === 'MARRIED_JOINT');
        expect(marriedJointOption?.text).toBe('Married Filing Jointly');

        const select = element.querySelector('select');
        expect(select?.required).toBe(true);
      });

      it('should handle federal court jurisdictions', async () => {
        const courtJurisdictions = [
          { value: 'FIRST', text: '1st Circuit - Boston' },
          { value: 'SECOND', text: '2nd Circuit - New York' },
          { value: 'THIRD', text: '3rd Circuit - Philadelphia' },
          { value: 'FOURTH', text: '4th Circuit - Richmond' },
          { value: 'FIFTH', text: '5th Circuit - New Orleans' },
          { value: 'SIXTH', text: '6th Circuit - Cincinnati' },
          { value: 'SEVENTH', text: '7th Circuit - Chicago' },
          { value: 'EIGHTH', text: '8th Circuit - St. Louis' },
          { value: 'NINTH', text: '9th Circuit - San Francisco' },
          { value: 'TENTH', text: '10th Circuit - Denver' },
          { value: 'ELEVENTH', text: '11th Circuit - Atlanta' },
          { value: 'DC', text: 'D.C. Circuit - Washington' },
          { value: 'FEDERAL', text: 'Federal Circuit - Washington' },
        ];

        element.label = 'Federal Circuit Court';
        element.name = 'court_circuit';
        element.options = courtJurisdictions;
        element.defaultOption = '- Select circuit -';
        element.hint = 'Federal appellate court jurisdiction';
        await element.updateComplete;

        expect(element.options.length).toBe(13);
        const ninthCircuit = element.options.find((opt) => opt.value === 'NINTH');
        expect(ninthCircuit?.text).toBe('9th Circuit - San Francisco');
      });

      it('should handle immigration status categories', async () => {
        const immigrationStatus = [
          { value: 'CITIZEN', text: 'U.S. Citizen' },
          { value: 'PERMANENT_RESIDENT', text: 'Permanent Resident (Green Card)' },
          { value: 'H1B', text: 'H-1B Temporary Worker' },
          { value: 'L1', text: 'L-1 Intracompany Transfer' },
          { value: 'F1', text: 'F-1 Student' },
          { value: 'J1', text: 'J-1 Exchange Visitor' },
          { value: 'TN', text: 'TN NAFTA Professional' },
          { value: 'O1', text: 'O-1 Extraordinary Ability' },
          { value: 'ASYLUM', text: 'Asylum Status' },
          { value: 'REFUGEE', text: 'Refugee Status' },
          { value: 'TPS', text: 'Temporary Protected Status' },
          { value: 'DACA', text: 'DACA Recipient' },
        ];

        element.label = 'Immigration Status';
        element.name = 'immigration_status';
        element.options = immigrationStatus;
        element.required = true;
        element.hint = 'Current U.S. immigration or citizenship status';
        await element.updateComplete;

        const citizenOption = element.options.find((opt) => opt.value === 'CITIZEN');
        expect(citizenOption?.text).toBe('U.S. Citizen');

        const h1bOption = element.options.find((opt) => opt.value === 'H1B');
        expect(h1bOption?.text).toBe('H-1B Temporary Worker');
      });
    });

    describe('Federal Industry and Classification Codes', () => {
      it('should handle NAICS codes (major sectors)', async () => {
        const naicsCodes = [
          { value: '11', text: '11 - Agriculture, Forestry, Fishing and Hunting' },
          { value: '21', text: '21 - Mining, Quarrying, and Oil and Gas Extraction' },
          { value: '22', text: '22 - Utilities' },
          { value: '23', text: '23 - Construction' },
          { value: '31-33', text: '31-33 - Manufacturing' },
          { value: '42', text: '42 - Wholesale Trade' },
          { value: '44-45', text: '44-45 - Retail Trade' },
          { value: '48-49', text: '48-49 - Transportation and Warehousing' },
          { value: '51', text: '51 - Information' },
          { value: '52', text: '52 - Finance and Insurance' },
          { value: '53', text: '53 - Real Estate and Rental and Leasing' },
          { value: '54', text: '54 - Professional, Scientific, and Technical Services' },
          { value: '55', text: '55 - Management of Companies and Enterprises' },
          { value: '56', text: '56 - Administrative and Support and Waste Management' },
          { value: '61', text: '61 - Educational Services' },
          { value: '62', text: '62 - Health Care and Social Assistance' },
          { value: '71', text: '71 - Arts, Entertainment, and Recreation' },
          { value: '72', text: '72 - Accommodation and Food Services' },
          { value: '81', text: '81 - Other Services (except Public Administration)' },
          { value: '92', text: '92 - Public Administration' },
        ];

        element.label = 'NAICS Industry Code';
        element.name = 'naics_code';
        element.options = naicsCodes;
        element.defaultOption = '- Select industry sector -';
        element.hint = 'North American Industry Classification System code';
        await element.updateComplete;

        const publicAdminOption = element.options.find((opt) => opt.value === '92');
        expect(publicAdminOption?.text).toBe('92 - Public Administration');

        const manufacturingOption = element.options.find((opt) => opt.value === '31-33');
        expect(manufacturingOption?.text).toBe('31-33 - Manufacturing');
      });

      it('should handle SOC occupation codes (major groups)', async () => {
        const socCodes = [
          { value: '11-0000', text: '11-0000 - Management Occupations' },
          { value: '13-0000', text: '13-0000 - Business and Financial Operations' },
          { value: '15-0000', text: '15-0000 - Computer and Mathematical Occupations' },
          { value: '17-0000', text: '17-0000 - Architecture and Engineering Occupations' },
          { value: '19-0000', text: '19-0000 - Life, Physical, and Social Science Occupations' },
          { value: '21-0000', text: '21-0000 - Community and Social Service Occupations' },
          { value: '23-0000', text: '23-0000 - Legal Occupations' },
          { value: '25-0000', text: '25-0000 - Education, Training, and Library Occupations' },
          { value: '27-0000', text: '27-0000 - Arts, Design, Entertainment, Sports, and Media' },
          { value: '29-0000', text: '29-0000 - Healthcare Practitioners and Technical' },
          { value: '31-0000', text: '31-0000 - Healthcare Support Occupations' },
          { value: '33-0000', text: '33-0000 - Protective Service Occupations' },
          { value: '35-0000', text: '35-0000 - Food Preparation and Serving Related' },
          { value: '37-0000', text: '37-0000 - Building and Grounds Cleaning and Maintenance' },
        ];

        element.label = 'SOC Occupation Code';
        element.name = 'soc_code';
        element.options = socCodes;
        element.defaultOption = '- Select occupation group -';
        element.hint = 'Standard Occupational Classification code';
        await element.updateComplete;

        const legalOption = element.options.find((opt) => opt.value === '23-0000');
        expect(legalOption?.text).toBe('23-0000 - Legal Occupations');

        const computerOption = element.options.find((opt) => opt.value === '15-0000');
        expect(computerOption?.text).toBe('15-0000 - Computer and Mathematical Occupations');
      });
    });
  });

  describe('Event Handling for Application Use Cases', () => {
    it('should handle state selection change for tax purposes', async () => {
      element.name = 'tax_state';
      element.label = 'State for Tax Purposes';
      element.options = [
        { value: 'CA', text: 'California' },
        { value: 'TX', text: 'Texas' },
        { value: 'FL', text: 'Florida' },
      ];
      await element.updateComplete;

      let changeEventDetail: any;
      element.addEventListener('change', (e: any) => {
        changeEventDetail = e.detail;
      });

      const select = element.querySelector('select') as HTMLSelectElement;
      select.value = 'CA';
      const changeEvent = new Event('change', { bubbles: true });
      Object.defineProperty(changeEvent, 'target', {
        writable: false,
        value: select,
      });

      (element as any).handleChange(changeEvent);
      await element.updateComplete;

      expect(changeEventDetail.value).toBe('CA');
      expect(element.value).toBe('CA');
    });

    it('should handle organization selection for employment', async () => {
      element.name = 'target_agency';
      element.label = 'Target Federal Agency';
      element.options = [
        { value: 'DOD', text: 'Department of Defense' },
        { value: 'DHS', text: 'Department of Homeland Security' },
        { value: 'EPA', text: 'Environmental Protection Agency' },
      ];
      await element.updateComplete;

      let inputEventDetail: any;
      element.addEventListener('input', (e: any) => {
        inputEventDetail = e.detail;
      });

      const select = element.querySelector('select') as HTMLSelectElement;
      select.value = 'EPA';
      const changeEvent = new Event('change', { bubbles: true });
      Object.defineProperty(changeEvent, 'target', {
        writable: false,
        value: select,
      });

      (element as any).handleChange(changeEvent);
      await element.updateComplete;

      expect(inputEventDetail.value).toBe('EPA');
      expect(element.value).toBe('EPA');
    });
  });

  describe('Accessibility for Government Compliance', () => {
    it('should meet Section 508 requirements for federal forms', async () => {
      element.id = 'federal-agency-select';
      element.label = 'Federal Agency';
      element.hint = 'Select the organization for your application';
      element.required = true;
      element.options = [
        { value: 'DOD', text: 'Department of Defense' },
        { value: 'DHS', text: 'Department of Homeland Security' },
      ];
      await element.updateComplete;

      const select = element.querySelector('select');
      const label = element.querySelector('label');
      const hint = element.querySelector('.usa-hint:not(.usa-hint--required)');

      // Label association
      expect(label?.getAttribute('for')).toBe('federal-agency-select');
      expect(select?.id).toBe('federal-agency-select');

      // ARIA attributes
      expect(select?.getAttribute('aria-describedby')).toBe('federal-agency-select-hint');
      expect(hint?.id).toBe('federal-agency-select-hint');

      // Required field indication
      expect(select?.required).toBe(true);
      const requiredSpan = element.querySelector('.usa-hint--required');
      expect(requiredSpan?.textContent?.trim()).toBe('*');
    });

    it('should provide proper error announcements for government forms', async () => {
      element.label = 'Security Clearance Level';
      element.error = 'Security clearance level is required for this position';
      element.options = [
        { value: 'SECRET', text: 'Secret' },
        { value: 'TOP_SECRET', text: 'Top Secret' },
      ];
      await element.updateComplete;

      const select = element.querySelector('select');
      const errorMsg = element.querySelector('.usa-error-message');

      expect(select?.getAttribute('aria-invalid')).toBe('true');
      expect(errorMsg?.getAttribute('role')).toBe('alert');
      expect(errorMsg?.textContent?.includes('Security clearance level is required')).toBe(true);
    });

    it('should support keyboard navigation for federal accessibility', async () => {
      element.label = 'Federal Department';
      element.options = [
        { value: 'DOJ', text: 'Department of Justice' },
        { value: 'DOT', text: 'Department of Transportation' },
        { value: 'HHS', text: 'Department of Health and Human Services' },
      ];
      await element.updateComplete;

      const select = element.querySelector('select') as HTMLSelectElement;

      // Should be keyboard accessible
      expect(select.tabIndex).toBeGreaterThanOrEqual(0);
      expect(select.tagName).toBe('SELECT');

      // Native select provides keyboard navigation automatically
      expect(select.options.length).toBe(3);
    });
  });

  describe('Performance for Government Applications', () => {
    // FIXME: Flaky timing test - fails in CI (239ms > 200ms threshold)
    // Issue: Performance timing is environment-dependent and unreliable in CI
    // TODO: Either increase threshold to 250ms or move to performance regression suite
    it.skip('should handle large government option sets efficiently', async () => {
      // Simulate all US states + territories (56 total)
      const allStatesTerritories = [
        // US States (50)
        { value: 'AL', text: 'Alabama' },
        { value: 'AK', text: 'Alaska' },
        { value: 'AZ', text: 'Arizona' },
        { value: 'AR', text: 'Arkansas' },
        { value: 'CA', text: 'California' },
        { value: 'CO', text: 'Colorado' },
        { value: 'CT', text: 'Connecticut' },
        { value: 'DE', text: 'Delaware' },
        { value: 'FL', text: 'Florida' },
        { value: 'GA', text: 'Georgia' },
        { value: 'HI', text: 'Hawaii' },
        { value: 'ID', text: 'Idaho' },
        { value: 'IL', text: 'Illinois' },
        { value: 'IN', text: 'Indiana' },
        { value: 'IA', text: 'Iowa' },
        { value: 'KS', text: 'Kansas' },
        { value: 'KY', text: 'Kentucky' },
        { value: 'LA', text: 'Louisiana' },
        { value: 'ME', text: 'Maine' },
        { value: 'MD', text: 'Maryland' },
        { value: 'MA', text: 'Massachusetts' },
        { value: 'MI', text: 'Michigan' },
        { value: 'MN', text: 'Minnesota' },
        { value: 'MS', text: 'Mississippi' },
        { value: 'MO', text: 'Missouri' },
        { value: 'MT', text: 'Montana' },
        { value: 'NE', text: 'Nebraska' },
        { value: 'NV', text: 'Nevada' },
        { value: 'NH', text: 'New Hampshire' },
        { value: 'NJ', text: 'New Jersey' },
        { value: 'NM', text: 'New Mexico' },
        { value: 'NY', text: 'New York' },
        { value: 'NC', text: 'North Carolina' },
        { value: 'ND', text: 'North Dakota' },
        { value: 'OH', text: 'Ohio' },
        { value: 'OK', text: 'Oklahoma' },
        { value: 'OR', text: 'Oregon' },
        { value: 'PA', text: 'Pennsylvania' },
        { value: 'RI', text: 'Rhode Island' },
        { value: 'SC', text: 'South Carolina' },
        { value: 'SD', text: 'South Dakota' },
        { value: 'TN', text: 'Tennessee' },
        { value: 'TX', text: 'Texas' },
        { value: 'UT', text: 'Utah' },
        { value: 'VT', text: 'Vermont' },
        { value: 'VA', text: 'Virginia' },
        { value: 'WA', text: 'Washington' },
        { value: 'WV', text: 'West Virginia' },
        { value: 'WI', text: 'Wisconsin' },
        { value: 'WY', text: 'Wyoming' },
        // Federal District and Territories (6)
        { value: 'DC', text: 'District of Columbia' },
        { value: 'AS', text: 'American Samoa' },
        { value: 'GU', text: 'Guam' },
        { value: 'MP', text: 'Northern Mariana Islands' },
        { value: 'PR', text: 'Puerto Rico' },
        { value: 'VI', text: 'U.S. Virgin Islands' },
      ];

      const startTime = performance.now();

      element.label = 'State/Territory';
      element.options = allStatesTerritories;
      element.defaultOption = '- Select state or territory -';
      await element.updateComplete;

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render large option set quickly (under 200ms in test environment)
      expect(renderTime).toBeLessThan(200);

      const options = element.querySelectorAll('option');
      expect(options.length).toBe(57); // 56 + default option

      // Verify first and last options
      expect(options[1].value).toBe('AL');
      expect(options[1].textContent?.trim()).toBe('Alabama');
      expect(options[56].value).toBe('VI');
      expect(options[56].textContent?.trim()).toBe('U.S. Virgin Islands');
    });

    it('should handle rapid government form updates efficiently', async () => {
      const startTime = performance.now();

      // Simulate rapid updates like user navigating through government form
      const scenarios = [
        {
          options: [
            { value: 'AL', text: 'Alabama' },
            { value: 'AK', text: 'Alaska' },
          ],
          value: 'AL',
        },
        {
          options: [
            { value: 'DOD', text: 'Department of Defense' },
            { value: 'DHS', text: 'Homeland Security' },
          ],
          value: 'DOD',
        },
        {
          options: [
            { value: 'GS-11', text: 'GS-11' },
            { value: 'GS-12', text: 'GS-12' },
          ],
          value: 'GS-12',
        },
        {
          options: [
            { value: 'SECRET', text: 'Secret' },
            { value: 'TOP_SECRET', text: 'Top Secret' },
          ],
          value: 'SECRET',
        },
      ];

      for (let i = 0; i < scenarios.length; i++) {
        element.options = scenarios[i].options;
        element.value = scenarios[i].value;
        await element.updateComplete;
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete rapid updates within reasonable time (500ms)
      expect(duration).toBeLessThan(500);
      expect(element.value).toBe('SECRET');
      expect(element.options.length).toBe(2);
    });

    it('should maintain performance with complex government content', async () => {
      const complexOptions = [
        {
          value: 'COMPLEX_1',
          text: 'Department of Health and Human Services - Centers for Disease Control and Prevention (CDC) - National Center for Environmental Health',
        },
        {
          value: 'COMPLEX_2',
          text: 'Department of Defense - Defense Logistics Agency - Defense Contract Management Agency (DCMA) - International Directorate',
        },
        {
          value: 'COMPLEX_3',
          text: 'Department of Homeland Security - U.S. Citizenship and Immigration Services (USCIS) - Field Operations Directorate',
        },
      ];

      const startTime = performance.now();

      element.label = 'Detailed Federal Organization';
      element.options = complexOptions;
      element.hint = 'Select the specific federal organization unit';
      await element.updateComplete;

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50); // Should render complex content quickly
      expect(element.textContent?.includes('Centers for Disease Control')).toBeTruthy();
    });
  });

  describe('Form Integration for Government Applications', () => {
    // NOTE: Federal form integration test moved to Cypress (usa-select.component.cy.ts:259-287)
    // Tests require real browser form behavior which is unreliable in jsdom

    it('should integrate with federal employment applications', async () => {
      const form = document.createElement('form');

      // Create multiple government-related selects
      const agencySelect = document.createElement('usa-select') as USASelect;
      agencySelect.name = 'target_agency';
      agencySelect.label = 'Target Agency';
      agencySelect.options = [
        { value: 'EPA', text: 'Environmental Protection Agency' },
        { value: 'NASA', text: 'National Aeronautics and Space Administration' },
      ];
      agencySelect.value = 'EPA';

      const clearanceSelect = document.createElement('usa-select') as USASelect;
      clearanceSelect.name = 'clearance_level';
      clearanceSelect.label = 'Security Clearance';
      clearanceSelect.options = [
        { value: 'PUBLIC_TRUST', text: 'Public Trust' },
        { value: 'SECRET', text: 'Secret' },
      ];
      clearanceSelect.value = 'SECRET';

      form.appendChild(agencySelect);
      form.appendChild(clearanceSelect);
      document.body.appendChild(form);

      await agencySelect.updateComplete;
      await clearanceSelect.updateComplete;

      const formData = new FormData(form);
      expect(formData.get('target_agency')).toBe('EPA');
      expect(formData.get('clearance_level')).toBe('SECRET');

      form.remove();
    });
  });

  // CRITICAL TESTS - Prevent auto-dismiss and lifecycle bugs
  describe('Component Lifecycle Stability (CRITICAL)', () => {
    let element: USASelect;

    beforeEach(() => {
      element = document.createElement('usa-select') as USASelect;
      document.body.appendChild(element);
    });

    afterEach(() => {
      element?.remove();
    });

    it('should remain in DOM after property updates (not auto-dismiss)', async () => {
      // Apply initial properties with options
      element.name = 'test-select';
      element.value = '';
      element.label = 'Test Select';
      element.hint = 'Test hint';
      element.disabled = false;
      element.required = false;
      element.options = [
        { value: 'option1', text: 'Option 1' },
        { value: 'option2', text: 'Option 2' },
      ];
      element.defaultOption = 'Choose an option';
      await element.updateComplete;

      // Verify element exists after initial render
      expect(document.body.contains(element)).toBe(true);
      expect(element.querySelector(`[class*="usa-"]`)).toBeTruthy();

      // Update properties (this is where bugs often occur)
      element.value = 'option1';
      element.disabled = true;
      element.error = 'Test error';
      await element.updateComplete;

      // CRITICAL: Element should still exist in DOM
      expect(document.body.contains(element)).toBe(true);
      expect(element.querySelector(`[class*="usa-"]`)).toBeTruthy();

      // Multiple rapid property updates
      const propertySets = [
        {
          name: 'select1',
          value: 'opt1',
          label: 'Select 1',
          hint: 'First hint',
          disabled: false,
          required: true,
          error: '',
          success: 'Success message',
          options: [
            { value: 'opt1', text: 'First Option' },
            { value: 'opt2', text: 'Second Option' },
          ],
        },
        {
          name: 'select2',
          value: 'opt2',
          label: 'Select 2',
          hint: 'Second hint',
          disabled: true,
          required: false,
          error: 'Error message',
          success: '',
          options: [
            { value: 'opt1', text: 'Option A' },
            { value: 'opt2', text: 'Option B', disabled: true },
            { value: 'opt3', text: 'Option C' },
          ],
        },
        {
          name: 'select3',
          value: '',
          label: 'Select 3',
          hint: '',
          disabled: false,
          required: true,
          error: 'Another error',
          success: '',
          options: [
            { value: 'a', text: 'A' },
            { value: 'b', text: 'B' },
            { value: 'c', text: 'C' },
          ],
        },
      ];

      for (const props of propertySets) {
        Object.assign(element, props);
        await element.updateComplete;

        // CRITICAL: Element should survive all updates
        expect(document.body.contains(element)).toBe(true);
        expect(element.querySelector(`[class*="usa-"]`)).toBeTruthy();
      }
    });

    it('should not fire unintended events on property changes', async () => {
      const eventSpies = [
        vi.fn(), // Generic event spy
        vi.fn(), // Close/dismiss spy
        vi.fn(), // Submit/action spy
      ];

      // Common event names that might be fired accidentally
      const commonEvents = ['close', 'dismiss', 'submit', 'action'];

      commonEvents.forEach((eventName, index) => {
        if (eventSpies[index]) {
          element.addEventListener(eventName, eventSpies[index]);
        }
      });

      // Set up initial state
      element.name = 'test';
      element.label = 'Test Select';
      element.options = [
        { value: 'test1', text: 'Test Option 1' },
        { value: 'test2', text: 'Test Option 2' },
      ];
      await element.updateComplete;

      // Update properties should NOT fire these unintended events
      element.value = 'test1';
      await element.updateComplete;

      element.disabled = true;
      await element.updateComplete;

      element.error = 'Test error';
      await element.updateComplete;

      element.options = [
        { value: 'new1', text: 'New Option 1' },
        { value: 'new2', text: 'New Option 2' },
        { value: 'new3', text: 'New Option 3' },
      ];
      await element.updateComplete;

      element.success = 'Success message';
      await element.updateComplete;

      // Verify no unintended events were fired
      eventSpies.forEach((spy, _index) => {
        if (spy) {
          expect(spy).not.toHaveBeenCalled();
        }
      });

      // Verify element is still in DOM
      expect(document.body.contains(element)).toBe(true);
    });

    it('should handle rapid property updates without breaking', async () => {
      // Simulate rapid updates like form validation or dynamic option changes
      const startTime = performance.now();

      const propertySets = [
        {
          value: 'rapid1',
          disabled: false,
          error: '',
          required: true,
          options: [{ value: 'rapid1', text: 'Rapid Option 1' }],
        },
        {
          value: 'rapid2',
          disabled: true,
          error: 'Error',
          required: false,
          options: [{ value: 'rapid2', text: 'Rapid Option 2' }],
        },
        {
          value: '',
          disabled: false,
          error: '',
          required: true,
          options: [{ value: 'rapid3', text: 'Rapid Option 3' }],
        },
        {
          value: 'rapid4',
          disabled: false,
          error: 'Number error',
          required: false,
          options: [
            { value: 'rapid4', text: 'Option A' },
            { value: 'rapid5', text: 'Option B' },
          ],
        },
      ];

      element.label = 'Rapid Test';
      element.name = 'rapid-select';

      for (let i = 0; i < 20; i++) {
        const props = propertySets[i % propertySets.length];
        Object.assign(element, props);
        await element.updateComplete;

        // Element should remain stable
        expect(document.body.contains(element)).toBe(true);
        expect(element.querySelector(`[class*="usa-"]`)).toBeTruthy();

        // Verify select element is still properly connected
        const select = element.querySelector('select');
        expect(select).toBeTruthy();
      }

      const endTime = performance.now();

      // Should complete updates reasonably fast (under 1000ms for select complexity)
      expect(endTime - startTime).toBeLessThan(1000);

      // Final verification
      expect(document.body.contains(element)).toBe(true);
    });
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath = `${process.cwd()}/src/components/select/usa-select.ts`;
        const validation = validateComponentJavaScript(componentPath, 'select');

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
  });

  describe('Storybook Integration Tests (CRITICAL)', () => {
    let element: USASelect;

    beforeEach(() => {
      element = document.createElement('usa-select') as USASelect;
      document.body.appendChild(element);
    });

    afterEach(() => {
      element?.remove();
    });

    it('should render correctly when created via Storybook patterns', async () => {
      // Simulate how Storybook creates components with args
      const storybookArgs = {
        name: 'storybook-select',
        value: 'option2',
        label: 'Storybook Select',
        hint: 'Choose your preferred option from the dropdown',
        disabled: false,
        required: true,
        options: [
          { value: 'option1', text: 'Option 1' },
          { value: 'option2', text: 'Option 2' },
          { value: 'option3', text: 'Option 3', disabled: true },
        ],
        defaultOption: 'Please select an option',
      };

      // Apply args like Storybook would
      Object.assign(element, storybookArgs);
      await element.updateComplete;

      // Should render without blank frames
      expect(document.body.contains(element)).toBe(true);
      expect(element.querySelector(`[class*="usa-"]`)).toBeTruthy();

      // Should have expected content structure
      const hasContent =
        element.querySelector('select') !== null &&
        element.querySelector('label') !== null &&
        (element.textContent?.trim().length || 0) > 0;
      expect(hasContent).toBe(true);

      // Verify select-specific rendering
      const select = element.querySelector('select') as HTMLSelectElement;
      const label = element.querySelector('label');
      const hint = element.querySelector('.usa-hint:not(.usa-hint--required)');
      const options = element.querySelectorAll('option');

      expect(select?.value).toBe('option2');
      expect(select?.required).toBe(true);
      expect(select?.name).toBe('storybook-select');
      expect(label).toBeTruthy();
      expect(hint?.textContent?.trim()).toBe('Choose your preferred option from the dropdown');
      expect(options).toHaveLength(4); // 3 options + default option
      expect(options[0]?.textContent?.trim()).toBe('Please select an option');
      expect(options[1]?.textContent?.trim()).toBe('Option 1');
      expect(options[2]?.textContent?.trim()).toBe('Option 2');
      expect(options[3]?.disabled).toBe(true);
    });

    it('should handle Storybook controls updates without breaking', async () => {
      // Simulate initial Storybook state
      const initialArgs = {
        name: 'controls-test',
        value: '',
        label: 'Controls Test',
        hint: '',
        disabled: false,
        required: false,
        error: '',
        success: '',
        options: [
          { value: 'initial1', text: 'Initial Option 1' },
          { value: 'initial2', text: 'Initial Option 2' },
        ],
      };
      Object.assign(element, initialArgs);
      await element.updateComplete;

      // Verify initial state
      expect(document.body.contains(element)).toBe(true);

      // Simulate user changing controls in Storybook
      const storybookUpdates = [
        { value: 'initial1' },
        { disabled: true },
        { label: 'Updated Label' },
        { hint: 'Updated hint text' },
        { error: 'Validation error' },
        { required: true },
        {
          options: [
            { value: 'new1', text: 'New Option 1' },
            { value: 'new2', text: 'New Option 2' },
            { value: 'new3', text: 'New Option 3' },
          ],
        },
        { value: 'new2' },
        { success: 'Success message' },
        { disabled: false, error: '', value: 'new3' },
      ];

      for (const update of storybookUpdates) {
        Object.assign(element, update);
        await element.updateComplete;

        // Should not cause blank frame or auto-dismiss
        expect(document.body.contains(element)).toBe(true);
        expect(element.querySelector(`[class*="usa-"]`)).toBeTruthy();

        // Verify select element remains functional
        const select = element.querySelector('select');
        expect(select).toBeTruthy();
      }
    });

    it('should maintain visual state during hot reloads', async () => {
      const initialArgs = {
        name: 'hotreload-test',
        value: 'selected-option',
        label: 'Hot Reload Test',
        hint: 'Test hint for hot reload',
        disabled: true,
        required: true,
        error: 'Test error',
        success: '',
        options: [
          { value: 'option-a', text: 'Option A' },
          { value: 'selected-option', text: 'Selected Option' },
          { value: 'option-c', text: 'Option C', disabled: true },
        ],
        defaultOption: 'Select an option',
      };

      Object.assign(element, initialArgs);
      await element.updateComplete;

      // Verify initial complex state
      const select = element.querySelector('select') as HTMLSelectElement;
      const initialValue = select?.value;
      const initialDisabled = select?.disabled;
      const initialName = select?.name;
      const initialOptionsCount = select?.options.length;

      // Simulate hot reload (property reassignment with same values)
      Object.assign(element, initialArgs);
      await element.updateComplete;

      // Should maintain state without disappearing
      expect(document.body.contains(element)).toBe(true);
      expect(element.querySelector(`[class*="usa-"]`)).toBeTruthy();

      // Should maintain form state
      const selectAfter = element.querySelector('select') as HTMLSelectElement;
      expect(selectAfter?.value).toBe(initialValue);
      expect(selectAfter?.disabled).toBe(initialDisabled);
      expect(selectAfter?.name).toBe(initialName);
      expect(selectAfter?.options.length).toBe(initialOptionsCount);
      expect(element.querySelector('.usa-error-message')).toBeTruthy();
      expect(element.querySelector('.usa-hint')).toBeTruthy();
    });
  });
});
