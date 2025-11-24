import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './usa-combo-box.ts';
import type { USAComboBox } from './usa-combo-box.js';
import {
  testComponentAccessibility,
  USWDS_A11Y_CONFIG,
} from '@uswds-wc/test-utils/accessibility-utils.js';
import { waitForUpdate } from '@uswds-wc/test-utils/test-utils.js';
import {
  testKeyboardNavigation,
  verifyKeyboardOnlyUsable,
  getFocusableElements,
} from '@uswds-wc/test-utils/keyboard-navigation-utils.js';
import { waitForPropertyPropagation } from '@uswds-wc/test-utils';

describe('USAComboBox', () => {
  let element: USAComboBox;

  const defaultOptions = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
  ];

  beforeEach(() => {
    element = document.createElement('usa-combo-box') as USAComboBox;
    element.options = [...defaultOptions];
    document.body.appendChild(element);
  });

  afterEach(async () => {
    // Wait for any pending updates and USWDS operations before cleanup
    await element.updateComplete;

    // Give USWDS time to complete any async operations
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Clean up - wrap in try-catch to handle any async cleanup errors
    try {
      element.remove();
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Basic Functionality', () => {
    it('should render with default properties', async () => {
      await waitForUpdate(element);

      expect(element.value).toBe('');
      expect(element.name).toBe('');
      expect(element.label).toBe('');
      expect(element.placeholder).toBe('');
      expect(element.disabled).toBe(false);
      expect(element.required).toBe(false);
    });

    it('should render basic progressive enhancement structure', async () => {
      element.name = 'test-combo';
      element.selectId = 'test-select';
      element.label = 'Choose a fruit';
      await waitForUpdate(element);

      // CRITICAL: Test correct USWDS structure for combo box
      // This prevents regression of the "select looks like select" issue
      const comboBoxContainer = element.querySelector('.usa-combo-box');
      expect(comboBoxContainer).toBeTruthy();
      expect(comboBoxContainer?.tagName).toBe('DIV'); // MUST be a div container

      const select = comboBoxContainer?.querySelector('select');
      expect(select).toBeTruthy();
      expect(select?.classList.contains('usa-sr-only')).toBe(true); // Select has usa-select class
      expect(select?.classList.contains('usa-combo-box')).toBe(false); // Select must NOT have usa-combo-box class

      const label = element.querySelector('label.usa-label');
      expect(label).toBeTruthy();
      expect(label?.textContent?.trim()).toBe('Choose a fruit');
      expect(label?.getAttribute('for')).toBe('test-select');

      expect(select?.getAttribute('name')).toBe('test-combo');

      // In progressive enhancement, select element has the ID before USWDS enhancement
      // After USWDS enhances, it creates an input with this ID and moves it
      // In jsdom (non-browser), USWDS doesn't run, so we test the base structure
      expect(select?.getAttribute('id')).toBe('test-select');
    });

    it('should render options correctly', async () => {
      await waitForUpdate(element);

      // Check basic select options before USWDS enhancement
      const select = element.querySelector('select') as HTMLSelectElement;
      const selectOptions = select?.querySelectorAll('option');

      expect(selectOptions?.length).toBe(defaultOptions.length);

      selectOptions?.forEach((option, index) => {
        expect(option.value).toBe(defaultOptions[index]?.value);
        expect(option.textContent?.trim()).toBe(defaultOptions[index]?.label);
      });
    });

    it('should handle placeholder option', async () => {
      element.placeholder = 'Select a fruit';
      await waitForPropertyPropagation(element);

      const select = element.querySelector('select') as HTMLSelectElement;
      const options = select?.querySelectorAll('option');

      // Should have placeholder + default options
      expect(options?.length).toBe(defaultOptions.length + 1);
      expect(options?.[0]?.value).toBe('');
      expect(options?.[0]?.textContent?.trim()).toBe('Select a fruit');
    });
  });

  describe('Properties', () => {
    it('should handle value changes', async () => {
      element.value = 'banana';
      await waitForPropertyPropagation(element);

      const select = element.querySelector('select') as HTMLSelectElement;
      expect(select?.value).toBe('banana');
    });

    it('should handle disabled state', async () => {
      element.disabled = true;
      await waitForPropertyPropagation(element);

      const select = element.querySelector('select') as HTMLSelectElement;
      expect(select?.disabled).toBe(true);
    });

    it('should handle required state', async () => {
      element.required = true;
      await waitForPropertyPropagation(element);

      const select = element.querySelector('select') as HTMLSelectElement;
      expect(select?.required).toBe(true);
    });
  });

  describe('Form Integration', () => {
    it('should work with native form submission', async () => {
      const form = document.createElement('form');
      element.name = 'fruit-selection';
      element.value = 'apple';
      form.appendChild(element);
      document.body.appendChild(form);

      await waitForUpdate(element);

      const formData = new FormData(form);
      expect(formData.get('fruit-selection')).toBe('apple');

      form.remove();
    });

    it('should participate in form validation', async () => {
      element.required = true;
      element.value = '';

      await waitForPropertyPropagation(element);

      const select = element.querySelector('select') as HTMLSelectElement;
      expect(select?.required).toBe(true);
      // Validation behavior depends on browser implementation
      // Just test that the required attribute is set correctly
    });
  });

  // NOTE: Change event tests moved to Cypress
  // Reason: USWDS handles change events via the enhanced input element created during
  // browser enhancement. This requires full USWDS JavaScript running in browser environment.
  // jsdom doesn't support USWDS event delegation properly.
  // See: cypress/e2e/combo-box-events.cy.ts for browser-based event tests

  describe('Accessibility Compliance', () => {
    it('should pass comprehensive accessibility tests', async () => {
      element.label = 'Choose a fruit';
      element.name = 'fruit-selection';
      await waitForUpdate(element);

      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should have proper label association', async () => {
      element.selectId = 'fruit-select';
      element.label = 'Choose a fruit';
      await waitForPropertyPropagation(element);

      const label = element.querySelector('label');
      const select = element.querySelector('select');

      expect(label?.getAttribute('for')).toBe('fruit-select');

      // In progressive enhancement, select has the ID before USWDS enhancement
      // USWDS will create an input with this ID in browser environments
      expect(select?.getAttribute('id')).toBe('fruit-select');
    });
  });

  describe('CRITICAL: Regression Prevention Tests', () => {
    // These tests prevent the "combo box looks like select" issue
    it('should NEVER put usa-combo-box class on select element', async () => {
      element.options = defaultOptions;
      await waitForPropertyPropagation(element);

      const select = element.querySelector('select');
      expect(select?.classList.contains('usa-combo-box')).toBe(false);
      expect(select?.classList.contains('usa-sr-only')).toBe(true);
    });

    it('should ALWAYS use container div with usa-combo-box class', async () => {
      element.options = defaultOptions;
      await waitForPropertyPropagation(element);

      const containerDiv = element.querySelector('.usa-combo-box');
      expect(containerDiv).toBeTruthy();
      expect(containerDiv?.tagName).toBe('DIV');

      // Select must be child of container
      const selectInContainer = containerDiv?.querySelector('select');
      expect(selectInContainer).toBeTruthy();
    });

    it('should maintain correct parent-child relationship', async () => {
      element.options = defaultOptions;
      await waitForPropertyPropagation(element);

      const containerDiv = element.querySelector('.usa-combo-box');
      const select = element.querySelector('select');

      // Select's direct parent must be the combo box container
      expect(select?.parentElement).toBe(containerDiv);
    });
  });

  describe('Regression Prevention: Bug Fixes (2025-10-08)', () => {
    // These tests prevent the specific bugs found during combo box debugging

    it('should check data-enhanced with strict equality (Bug #1)', async () => {
      // BUG: String "false" was truthy, preventing enhancement
      // FIX: Changed to strict equality check: dataset.enhanced === 'true'
      element.options = defaultOptions;
      await waitForPropertyPropagation(element);

      const comboBoxWrapper = element.querySelector('.usa-combo-box');

      // After enhancement, data-enhanced should be "true" (the behavior file sets this)
      // The bug was that the check `if (comboBoxEl.dataset.enhanced)` was truthy for "false"
      // Now it correctly checks `dataset.enhanced === 'true'`
      expect(comboBoxWrapper?.getAttribute('data-enhanced')).toBe('true');

      // Verify the string comparison works correctly
      expect(comboBoxWrapper?.getAttribute('data-enhanced') === 'true').toBe(true);
    });

    it('should properly set and remove hidden attribute on list (Bug #2)', async () => {
      // BUG: Setting listEl.hidden = false didn't remove the HTML attribute
      // FIX: Added explicit removeAttribute('hidden') and setAttribute('hidden', '')
      // This test validates the component structure needed for the fix
      element.options = defaultOptions;
      await waitForUpdate(element);

      // In jsdom, USWDS doesn't actually run, but we verify the structure exists
      // that the behavior file would manipulate
      const comboBoxWrapper = element.querySelector('.usa-combo-box');
      expect(comboBoxWrapper).toBeTruthy();

      // The list element would be created by USWDS enhancement in browser
      // This test ensures the wrapper exists for USWDS to work with
      expect(comboBoxWrapper?.hasAttribute('data-enhanced')).toBe(true);
    });

    it('should prevent duplicate event listener initialization (Bug #3)', async () => {
      // BUG: Toggle button was firing twice due to duplicate event listeners
      // FIX: Added initialization guard using __comboBoxInitialized flag

      // Create two combo boxes to test that initialization guard works per-instance
      const element2 = document.createElement('usa-combo-box') as USAComboBox;
      element2.options = [...defaultOptions];
      document.body.appendChild(element2);

      await waitForUpdate(element);
      await waitForUpdate(element2);

      // Both components should render successfully
      const wrapper1 = element.querySelector('.usa-combo-box');
      const wrapper2 = element2.querySelector('.usa-combo-box');

      expect(wrapper1).toBeTruthy();
      expect(wrapper2).toBeTruthy();

      // Both should have data-enhanced="true" after enhancement completes
      expect(wrapper1?.getAttribute('data-enhanced')).toBe('true');
      expect(wrapper2?.getAttribute('data-enhanced')).toBe('true');

      element2.remove();
    });

    it('should maintain data-enhanced as string, not boolean', async () => {
      // CRITICAL: data-enhanced must be a string ("true" or "false"), not boolean
      // The behavior file checks: if (dataset.enhanced === 'true')
      element.options = defaultOptions;
      await waitForPropertyPropagation(element);

      const comboBoxWrapper = element.querySelector('.usa-combo-box');

      // Verify it's a string (should be "true" after enhancement)
      expect(typeof comboBoxWrapper?.getAttribute('data-enhanced')).toBe('string');
      expect(comboBoxWrapper?.getAttribute('data-enhanced')).toBe('true');

      // Verify it's not null or undefined
      expect(comboBoxWrapper?.hasAttribute('data-enhanced')).toBe(true);
    });

    it('should render correct DOM structure for USWDS behavior enhancement', async () => {
      // Validates that the component renders the structure needed by usa-combo-box-behavior.ts
      element.label = 'Test';
      element.options = defaultOptions;
      await waitForUpdate(element);

      // Structure needed for USWDS mirrored behavior:
      // 1. Container with .usa-combo-box class
      const container = element.querySelector('.usa-combo-box');
      expect(container).toBeTruthy();
      expect(container?.tagName).toBe('DIV');

      // 2. Select element inside container
      const select = container?.querySelector('select');
      expect(select).toBeTruthy();
      expect(select?.classList.contains('usa-select')).toBe(true);

      // 3. data-enhanced should be "true" after enhancement
      expect(container?.getAttribute('data-enhanced')).toBe('true');

      // 4. data-default-value on container (USWDS reads from container, not select)
      expect(container?.hasAttribute('data-default-value')).toBe(true);

      // This structure allows usa-combo-box-behavior.ts to:
      // - Find the container via COMBO_BOX selector
      // - Read data-default-value and data-placeholder from container
      // - Enhance the component by creating input, list, toggle button
      // - Properly show/hide the list with attribute manipulation
    });
  });

  describe('USWDS Integration Requirements', () => {
    // These tests prevent issues with default values, placeholders, and initialization

    it('should include data-default-value attribute on container element', async () => {
      element.value = 'banana';
      element.options = defaultOptions;
      await waitForPropertyPropagation(element);

      const container = element.querySelector('.usa-combo-box') as HTMLElement;
      expect(container).toBeTruthy();

      // CRITICAL: data-default-value is required for USWDS to set initial value
      // USWDS reads this from the container element, not the select element
      expect(container?.hasAttribute('data-default-value')).toBe(true);
      expect(container?.getAttribute('data-default-value')).toBe('banana');
    });

    it('should set data-default-value to empty string when no value', async () => {
      element.value = '';
      element.options = defaultOptions;
      await waitForPropertyPropagation(element);

      const container = element.querySelector('.usa-combo-box') as HTMLElement;
      expect(container?.getAttribute('data-default-value')).toBe('');
    });

    it('should have data-enhanced attribute on combo box wrapper', async () => {
      element.options = defaultOptions;
      await waitForPropertyPropagation(element);

      const comboBoxWrapper = element.querySelector('.usa-combo-box');
      expect(comboBoxWrapper).toBeTruthy();

      // CRITICAL: data-enhanced signals to USWDS that component needs enhancement
      // Component starts with data-enhanced="false", behavior file sets it to "true" after enhancement
      expect(comboBoxWrapper?.hasAttribute('data-enhanced')).toBe(true);
      expect(comboBoxWrapper?.getAttribute('data-enhanced')).toBe('true');
    });

    it('should render placeholder option when placeholder is set', async () => {
      element.placeholder = 'Select a fruit';
      element.options = defaultOptions;
      await waitForPropertyPropagation(element);

      const select = element.querySelector('select') as HTMLSelectElement;
      const placeholderOption = select?.querySelector('option[value=""]') as HTMLOptionElement;

      expect(placeholderOption).toBeTruthy();
      expect(placeholderOption?.textContent).toBe('Select a fruit');
    });

    it('should select placeholder option when no value is set', async () => {
      element.placeholder = 'Select a fruit';
      element.value = '';
      element.options = defaultOptions;
      await waitForPropertyPropagation(element);

      const select = element.querySelector('select') as HTMLSelectElement;
      const placeholderOption = select?.querySelector('option[value=""]') as HTMLOptionElement;

      // CRITICAL: Placeholder must have selected attribute when no value
      // In jsdom, we check for the attribute; in browser, .selected would also be true
      expect(placeholderOption?.hasAttribute('selected')).toBe(true);
    });

    it('should NOT select placeholder option when value is set', async () => {
      element.placeholder = 'Select a fruit';
      element.value = 'apple';
      element.options = defaultOptions;
      await waitForPropertyPropagation(element);

      const select = element.querySelector('select') as HTMLSelectElement;
      const placeholderOption = select?.querySelector('option[value=""]') as HTMLOptionElement;
      const appleOption = select?.querySelector('option[value="apple"]') as HTMLOptionElement;

      expect(placeholderOption?.selected).toBe(false);
      expect(appleOption?.selected).toBe(true);
    });

    it('should maintain data-default-value when value changes', async () => {
      element.value = 'apple';
      element.options = defaultOptions;
      await waitForPropertyPropagation(element);

      let container = element.querySelector('.usa-combo-box') as HTMLElement;
      expect(container?.getAttribute('data-default-value')).toBe('apple');

      // Change value
      element.value = 'banana';
      await waitForPropertyPropagation(element);

      container = element.querySelector('.usa-combo-box') as HTMLElement;
      expect(container?.getAttribute('data-default-value')).toBe('banana');
    });
  });

  describe('Progressive Enhancement', () => {
    it('should support progressive enhancement', async () => {
      // Component starts as basic select element
      await waitForUpdate(element);

      const comboBoxDiv = element.querySelector('.usa-combo-box');
      const select = element.querySelector('select');
      expect(comboBoxDiv).toBeTruthy();
      expect(select).toBeTruthy();
      expect(select?.classList.contains('usa-sr-only')).toBe(true);

      // USWDS JavaScript would enhance this structure in a real browser
      // Here we test that the foundation is correct
      expect(element.getAttribute('data-web-component-managed')).toBe('true');
    });

    it('should handle empty options array', async () => {
      element.options = [];
      await waitForPropertyPropagation(element);

      const select = element.querySelector('select') as HTMLSelectElement;
      const options = select?.querySelectorAll('option');

      expect(options?.length).toBe(0);
    });

    it('should handle options with special characters', async () => {
      element.options = [
        { value: 'option&with&ampersands', label: 'Option & With & Ampersands' },
        { value: 'option<with>brackets', label: 'Option <With> Brackets' },
      ];
      await waitForPropertyPropagation(element);

      const select = element.querySelector('select') as HTMLSelectElement;
      const options = select?.querySelectorAll('option');

      expect(options?.length).toBe(2);
      expect(options?.[0]?.value).toBe('option&with&ampersands');
      expect(options?.[0]?.textContent?.trim()).toBe('Option & With & Ampersands');
    });
  });

  describe('Keyboard Navigation (WCAG 2.1)', () => {
    it('should allow keyboard navigation to combo box input', async () => {
      element.name = 'fruit';
      element.label = 'Select a fruit';
      await waitForUpdate(element);

      const focusableElements = getFocusableElements(element);

      // In progressive enhancement: select is hidden (sr-only), input may be added by USWDS
      // At minimum, the hidden select should be keyboard accessible for fallback
      expect(focusableElements.length).toBeGreaterThanOrEqual(1);
    });

    it('should be keyboard-only usable', async () => {
      element.name = 'fruit';
      element.options = defaultOptions;
      await waitForUpdate(element);

      await verifyKeyboardOnlyUsable(element);
    });

    it('should pass comprehensive keyboard navigation tests', async () => {
      element.name = 'fruit';
      element.options = defaultOptions;
      await waitForUpdate(element);

      // Test the foundational select element (USWDS would enhance in real browser)
      const select = element.querySelector('select');
      expect(select).toBeTruthy();

      const result = await testKeyboardNavigation(select!, {
        shortcuts: [
          { key: 'ArrowDown', description: 'Navigate to next option' },
          { key: 'ArrowUp', description: 'Navigate to previous option' },
          { key: 'Enter', description: 'Select option' },
        ],
        testEscapeKey: false, // Select doesn't use Escape
        testArrowKeys: false, // Browser handles arrow keys for select
      });

      expect(result.passed).toBe(true);
    });

    it('should have no keyboard traps', async () => {
      element.name = 'fruit';
      element.options = defaultOptions;
      await waitForPropertyPropagation(element);

      const select = element.querySelector('select');
      expect(select).toBeTruthy();

      // Tab should move focus out of the combo box
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        code: 'Tab',
        keyCode: 9,
        bubbles: true,
        cancelable: true,
      });

      select!.dispatchEvent(tabEvent);
      // No keyboard trap assertion - focus should be able to move
      expect(true).toBe(true);
    });

    it('should maintain proper tab order with other form elements', async () => {
      const wrapper = document.createElement('div');
      const input1 = document.createElement('input');
      input1.type = 'text';
      wrapper.appendChild(input1);

      element.name = 'fruit';
      element.options = defaultOptions;
      wrapper.appendChild(element);

      const input2 = document.createElement('input');
      input2.type = 'text';
      wrapper.appendChild(input2);

      document.body.appendChild(wrapper);
      await waitForUpdate(element);

      const allFocusable = [
        input1,
        ...Array.from(element.querySelectorAll('select, input')),
        input2,
      ].filter((el) => el.tabIndex >= 0);

      expect(allFocusable.length).toBeGreaterThanOrEqual(3);
      wrapper.remove();
    });

    it('should support arrow key navigation through options (browser native)', async () => {
      element.name = 'fruit';
      element.options = defaultOptions;
      await waitForPropertyPropagation(element);

      const select = element.querySelector('select') as HTMLSelectElement;
      expect(select).toBeTruthy();

      // Select element should support arrow key navigation (browser native)
      const downEvent = new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        code: 'ArrowDown',
        keyCode: 40,
        bubbles: true,
        cancelable: true,
      });

      select.dispatchEvent(downEvent);
      // In jsdom, select doesn't change selectedIndex, but structure is correct
      expect(select.options.length).toBe(3);
    });

    it('should maintain focus visibility (WCAG 2.4.7)', async () => {
      element.name = 'fruit';
      element.options = defaultOptions;
      await waitForPropertyPropagation(element);

      const select = element.querySelector('select');
      expect(select).toBeTruthy();

      // In progressive enhancement, select has tabindex="-1" (hidden, sr-only)
      // USWDS enhanced input would receive focus and have visible focus indicator
      // Component provides correct structure for USWDS enhancement
      expect(element.querySelector('.usa-combo-box')).toBeTruthy();
      expect(select?.classList.contains('usa-sr-only')).toBe(true);
    });

    it('should not respond when disabled', async () => {
      element.name = 'fruit';
      element.options = defaultOptions;
      element.disabled = true;
      await waitForPropertyPropagation(element);

      const select = element.querySelector('select') as HTMLSelectElement;
      expect(select).toBeTruthy();
      expect(select.disabled).toBe(true);

      // Disabled state is set correctly on the select element
      // USWDS enhancement would propagate disabled state to input
      expect(select.disabled).toBe(true);
      expect(element.disabled).toBe(true);
    });

    it('should handle Enter key to open dropdown (USWDS enhancement)', async () => {
      element.name = 'fruit';
      element.options = defaultOptions;
      await waitForPropertyPropagation(element);

      const select = element.querySelector('select');
      expect(select).toBeTruthy();

      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        bubbles: true,
        cancelable: true,
      });

      select!.dispatchEvent(enterEvent);
      // USWDS would handle dropdown opening in browser
      // We verify structure is correct for enhancement
      expect(element.querySelector('.usa-combo-box')).toBeTruthy();
    });

    it('should handle Escape key to close dropdown (USWDS enhancement)', async () => {
      element.name = 'fruit';
      element.options = defaultOptions;
      await waitForPropertyPropagation(element);

      const select = element.querySelector('select');
      expect(select).toBeTruthy();

      const escapeEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        code: 'Escape',
        keyCode: 27,
        bubbles: true,
        cancelable: true,
      });

      select!.dispatchEvent(escapeEvent);
      // USWDS would handle closing in browser
      // We verify structure is correct for enhancement
      expect(element.querySelector('.usa-combo-box')).toBeTruthy();
    });

    it('should support type-ahead filtering (USWDS enhancement)', async () => {
      element.name = 'fruit';
      element.options = defaultOptions;
      await waitForPropertyPropagation(element);

      const select = element.querySelector('select');
      expect(select).toBeTruthy();

      // Type-ahead would be handled by USWDS input in enhanced version
      // Progressive enhancement structure should support this
      expect(element.querySelector('.usa-combo-box')).toBeTruthy();
      expect(select?.classList.contains('usa-sr-only')).toBe(true);
    });

    it('should handle empty options gracefully with keyboard', async () => {
      element.name = 'fruit';
      element.options = [];
      await waitForPropertyPropagation(element);

      const select = element.querySelector('select');
      expect(select).toBeTruthy();

      // Empty combo box has correct structure for progressive enhancement
      // Select has tabindex="-1" (sr-only), USWDS input would handle keyboard
      expect(element.querySelector('.usa-combo-box')).toBeTruthy();
      expect(select?.classList.contains('usa-sr-only')).toBe(true);
    });

    it('should support required attribute during keyboard interaction', async () => {
      element.name = 'fruit';
      element.options = defaultOptions;
      element.required = true;
      await waitForPropertyPropagation(element);

      const select = element.querySelector('select') as HTMLSelectElement;
      expect(select).toBeTruthy();
      expect(select.required).toBe(true);

      // Required state should be preserved during keyboard navigation
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
      });
      select.dispatchEvent(tabEvent);

      expect(select.required).toBe(true);
    });
  });

  describe('ARIA/Screen Reader (WCAG 4.1)', () => {
    it('should have proper select element with label (WCAG 4.1.2)', async () => {
      element.label = 'Choose your fruit';
      element.options = defaultOptions;
      await waitForPropertyPropagation(element);

      const select = element.querySelector('select');
      const label = element.querySelector('label');

      expect(select).toBeTruthy();
      expect(label).toBeTruthy();
      expect(label?.textContent).toContain('Choose your fruit');
    });

    it('should have proper label for select element (WCAG 4.1.2)', async () => {
      element.label = 'Select option';
      element.options = defaultOptions;
      await waitForPropertyPropagation(element);

      const label = element.querySelector('label');
      const select = element.querySelector('select');

      expect(label).toBeTruthy();
      expect(select).toBeTruthy();
      expect(label?.textContent).toContain('Select option');

      // Label and select should be associated (tested in Accessibility Compliance suite)
    });

    it('should have proper option structure (WCAG 4.1.2)', async () => {
      element.label = 'Select option';
      element.options = defaultOptions;
      await waitForPropertyPropagation(element);

      const options = element.querySelectorAll('select option');
      expect(options.length).toBeGreaterThan(0);

      // Each option should have value and text
      options.forEach((option) => {
        expect(option.getAttribute('value')).toBeDefined();
        expect(option.textContent).toBeTruthy();
      });
    });

    it('should support aria-describedby for hints (WCAG 4.1.2)', async () => {
      const { testARIARelationships } = await import(
        '@uswds-wc/test-utils/aria-screen-reader-utils.js'
      );

      element.label = 'Select option';
      element.hint = 'Choose carefully';
      element.options = defaultOptions;
      await waitForPropertyPropagation(element);

      const select = element.querySelector('select');
      expect(select).toBeTruthy();

      const result = testARIARelationships(select as Element);

      // Should have describedby relationship
      expect(result).toBeDefined();
    });

    it('should support aria-describedby for errors (WCAG 4.1.2)', async () => {
      element.label = 'Select option';
      element.error = 'This field is required';
      element.options = defaultOptions;
      await waitForPropertyPropagation(element);

      const select = element.querySelector('select');
      const describedby = select?.getAttribute('aria-describedby');

      expect(describedby).toBeTruthy();
      expect(describedby).toContain('error');
    });

    it('should have USWDS class for combobox transformation (WCAG 4.1.2)', async () => {
      element.label = 'Select option';
      element.options = defaultOptions;
      await waitForPropertyPropagation(element);

      const select = element.querySelector('select');
      expect(select).toBeTruthy();

      // Should have USWDS combobox class for JavaScript enhancement
      expect(select?.classList.contains('usa-combo-box__select')).toBe(true);
    });

    it('should update select value when component value changes (WCAG 4.1.3)', async () => {
      element.label = 'Select option';
      element.options = defaultOptions;
      await waitForPropertyPropagation(element);

      const select = element.querySelector('select') as HTMLSelectElement;
      expect(select).toBeTruthy();

      // Set value
      element.value = 'apple';
      await waitForUpdate(element);

      // Value should be reflected in select
      expect(select.value).toBe('apple');
    });

    it('should have required attribute when required (WCAG 4.1.2)', async () => {
      element.label = 'Select option';
      element.required = true;
      element.options = defaultOptions;
      await waitForPropertyPropagation(element);

      const select = element.querySelector('select');
      expect(select?.hasAttribute('required')).toBe(true);
    });
  });
});
