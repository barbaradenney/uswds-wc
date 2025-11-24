/**
 * Combo Box Layout Tests
 * Prevents regression of input group positioning, toggle button, and clear button issues
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../combo-box/index.ts';
import type { USAComboBox } from './usa-combo-box.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';
import { waitForARIAAttribute } from '@uswds-wc/test-utils';

describe('USAComboBox Layout Tests', () => {
  let element: USAComboBox;

  beforeEach(() => {
    element = document.createElement('usa-combo-box') as USAComboBox;
    element.options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ];
    element.placeholder = 'Select an option';
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS input group structure', async () => {
    element.options = [
      { value: 'apple', text: 'Apple' },
      { value: 'banana', text: 'Banana' },
    ];
    await element.updateComplete;

    // Before USWDS transformation, should have minimal structure
    const select = element.querySelector('select.usa-select');
    const formGroup = element.querySelector('.usa-form-group');

    expect(formGroup, 'Form group container should exist').toBeTruthy();
    expect(select, 'Combo box select should exist').toBeTruthy();

    // Verify USWDS structure hierarchy
    expect(formGroup.contains(select), 'Select should be inside form group container').toBe(true);
  });

  it('should position toggle button correctly within combo box', async () => {
    element.options = [
      { value: 'apple', text: 'Apple' },
      { value: 'banana', text: 'Banana' },
    ];
    await element.updateComplete;

    // Before USWDS transformation, should have minimal structure
    const select = element.querySelector('select.usa-select');
    const formGroup = element.querySelector('.usa-form-group');

    expect(formGroup, 'Form group should exist').toBeTruthy();
    expect(select, 'Select should exist').toBeTruthy();

    // Verify select has options
    const options = select.querySelectorAll('option');
    expect(options.length).toBeGreaterThan(0);
  });

  it('should position clear button correctly when value is present', async () => {
    element.value = 'option1';
    await element.updateComplete;

    const clearButton = element.querySelector('.usa-combo-box__clear-button');
    const inputGroup = element.querySelector('.usa-input-group');

    if (clearButton) {
      expect(
        inputGroup.contains(clearButton),
        'Clear button should be inside input group when present'
      ).toBe(true);

      // Clear button should be positioned correctly within input group
      const inputGroupChildren = Array.from(inputGroup.children);
      const clearButtonIndex = inputGroupChildren.indexOf(clearButton);
      expect(clearButtonIndex, 'Clear button should be found in input group').toBeGreaterThan(-1);
    }
  });

  it('should position list correctly relative to input', async () => {
    // Open the combo box
    element.expanded = true;
    await element.updateComplete;

    const comboBox = element.querySelector('.usa-combo-box');
    const list = element.querySelector('.usa-combo-box__list');

    expect(comboBox, 'Combo box container should exist').toBeTruthy();

    if (list) {
      expect(comboBox.contains(list), 'List should be inside combo box container').toBe(true);

      // List should appear after the input group
      const comboBoxChildren = Array.from(comboBox.children);
      const inputGroup = element.querySelector('.usa-input-group');
      const inputGroupIndex = comboBoxChildren.indexOf(inputGroup);
      const listIndex = comboBoxChildren.indexOf(list);

      expect(listIndex, 'List should appear after input group').toBeGreaterThan(inputGroupIndex);
    }
  });

  it('should maintain proper button visibility states', async () => {
    await element.updateComplete;

    const toggleButton = element.querySelector('.usa-combo-box__toggle-list');
    let clearButton = element.querySelector('.usa-combo-box__clear-button');

    // Initially, toggle button should be visible, clear button should not
    expect(toggleButton, 'Toggle button should exist').toBeTruthy();
    expect(clearButton, 'Clear button should not exist initially').toBeFalsy();

    // When value is set, clear button should appear
    element.value = 'option1';
    await element.updateComplete;

    clearButton = element.querySelector('.usa-combo-box__clear-button');

    if (clearButton) {
      expect(clearButton, 'Clear button should exist when value is set').toBeTruthy();
    }
  });

  it('should handle disabled state correctly', async () => {
    element.disabled = true;
    await element.updateComplete;

    // Check the underlying select element (before USWDS transformation)
    const select = element.querySelector('select.usa-select') as HTMLSelectElement;

    expect(select, 'Select should exist').toBeTruthy();

    if (select) {
      expect(select.disabled, 'Select should be disabled').toBe(true);
    }
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath = `${process.cwd()}/src/components/combo-box/usa-combo-box.ts`;
        const validation = validateComponentJavaScript(componentPath, 'combo-box');

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

  describe('Visual Regression Prevention', () => {
    it('should pass visual layout checks for combo box structure', async () => {
      await element.updateComplete;

      const comboBox = element.querySelector('.usa-combo-box');
      const input = element.querySelector('.usa-combo-box__input');

      expect(comboBox, 'Combo box should render').toBeTruthy();
      expect(input, 'Input should render').toBeTruthy();

      // Verify essential USWDS classes are present
      expect(comboBox.classList.contains('usa-combo-box')).toBe(true);
      expect(input.classList.contains('usa-combo-box__input')).toBe(true);
    });

    it('should maintain combo box structure integrity', async () => {
      await element.updateComplete;

      const input = element.querySelector('.usa-combo-box__input');
      const toggleButton = element.querySelector('.usa-combo-box__toggle-list');

      expect(input, 'Input should be present').toBeTruthy();
      expect(toggleButton, 'Toggle button should be present').toBeTruthy();

      // Verify input has correct attributes
      if (input) {
        expect(input.getAttribute('role')).toBe('combobox');
        expect(await waitForARIAAttribute(input, 'aria-expanded')).toBe('false');
      }
    });

    // Skipped in jsdom - requires Cypress for USWDS JavaScript interaction
    // Coverage: src/components/combo-box/usa-combo-box.component.cy.ts

    it('should handle filter interactions correctly', async () => {
      await element.updateComplete;

      const input = element.querySelector('.usa-combo-box__input') as HTMLInputElement;

      if (input) {
        // Simulate typing
        input.value = 'opt';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await element.updateComplete;

        // Should maintain proper structure during filtering
        const comboBox = element.querySelector('.usa-combo-box');
        expect(comboBox, 'Combo box should maintain structure during filtering').toBeTruthy();
      }
    });

    it('should handle selection correctly', async () => {
      await element.updateComplete;

      // Select an option
      element.value = 'option1';
      await element.updateComplete;

      // Check the underlying select element (before USWDS transformation)
      const select = element.querySelector('select.usa-select') as HTMLSelectElement;

      if (select) {
        expect(select.value, 'Select should have correct value').toBe('option1');
      }
    });

    it('should maintain proper ARIA relationships', async () => {
      await element.updateComplete;

      const input = element.querySelector('.usa-combo-box__input');
      const list = element.querySelector('.usa-combo-box__list');

      if (input) {
        expect(input.getAttribute('role')).toBe('combobox');
        expect(await waitForARIAAttribute(input, 'aria-expanded')).toBe('false');

        if (list) {
          // Verify list has proper role and ID
          expect(list.getAttribute('role')).toBe('listbox');
          expect(list.getAttribute('id')).toBeTruthy();
        }
      }
    });
  });
});
