/**
 * USWDS Combo Box Behavior Contract Tests
 *
 * These tests validate that our combo box implementation EXACTLY matches
 * USWDS combo box behavior as defined in the official USWDS source.
 *
 * DO NOT modify these tests to make implementation pass.
 * ONLY modify implementation to match USWDS behavior.
 *
 * Source: @uswds/uswds/packages/usa-combo-box/src/index.js
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { waitForBehaviorInit } from '@uswds-wc/test-utils/test-utils.js';
import './usa-combo-box.js';
import type { USAComboBox } from './usa-combo-box.js';
import { waitForARIAAttribute } from '@uswds-wc/test-utils';

describe('USWDS Combo Box Behavior Contract', () => {
  let element: USAComboBox;
  let selectEl: HTMLSelectElement;

  beforeEach(async () => {
    element = document.createElement('usa-combo-box') as USAComboBox;
    element.label = 'Test Combo Box';
    element.name = 'test-combo';
    element.options = [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
      { value: 'cherry', label: 'Cherry' },
      { value: 'date', label: 'Date' },
    ];
    document.body.appendChild(element);
    // Wait for initial render before querying select element
    await element.updateComplete;
    selectEl = element.querySelector('select') as HTMLSelectElement;
  });

  afterEach(() => {
    element.remove();
  });

  describe('Contract 1: Component Enhancement', () => {
    it('should enhance select element into combo box', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const comboBoxEl = element.querySelector('.usa-combo-box');
      expect(comboBoxEl).not.toBeNull();
    });

    it('should create input element for filtering', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const inputEl = element.querySelector('.usa-combo-box__input');
      expect(inputEl).not.toBeNull();
      expect((inputEl as HTMLInputElement).type).toBe('text');
    });

    it('should create list element for options', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const listEl = element.querySelector('.usa-combo-box__list');
      expect(listEl).not.toBeNull();
      expect(listEl?.tagName).toBe('UL');
    });

    it('should create toggle button for dropdown', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const toggleBtn = element.querySelector('.usa-combo-box__toggle-list');
      expect(toggleBtn).not.toBeNull();
      expect(toggleBtn?.tagName).toBe('BUTTON');
    });

    it('should create clear input button', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const clearBtn = element.querySelector('.usa-combo-box__clear-input');
      expect(clearBtn).not.toBeNull();
      expect(clearBtn?.tagName).toBe('BUTTON');
    });
  });

  describe('Contract 2: Filtering Behavior', () => {
    it('should filter options when typing in input', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const inputEl = element.querySelector('.usa-combo-box__input') as HTMLInputElement;
      const listEl = element.querySelector('.usa-combo-box__list') as HTMLElement;

      // Type to filter
      inputEl.value = 'app';
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      await waitForBehaviorInit(element);

      // List should be visible
      expect(listEl.hidden).toBe(false);

      // Should show filtered results
      const options = listEl.querySelectorAll('.usa-combo-box__list-option');
      expect(options.length).toBeGreaterThan(0);
    });

    it('should prioritize options starting with query', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const inputEl = element.querySelector('.usa-combo-box__input') as HTMLInputElement;
      const listEl = element.querySelector('.usa-combo-box__list') as HTMLElement;

      inputEl.value = 'a';
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      await waitForBehaviorInit(element);

      const options = listEl.querySelectorAll('.usa-combo-box__list-option');
      const firstOption = options[0] as HTMLElement;

      // First option should start with query
      expect(firstOption.textContent?.toLowerCase().startsWith('a')).toBe(true);
    });

    it('should show "No results" when no matches found', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const inputEl = element.querySelector('.usa-combo-box__input') as HTMLInputElement;
      const listEl = element.querySelector('.usa-combo-box__list') as HTMLElement;

      inputEl.value = 'xyz';
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      await waitForBehaviorInit(element);

      const noResults = listEl.querySelector('.usa-combo-box__list-option--no-results');
      expect(noResults).not.toBeNull();
      expect(noResults?.textContent).toBe('No results found');
    });
  });

  describe('Contract 3: List Display', () => {
    // Skipped in jsdom - requires Cypress for USWDS JavaScript interaction
    // Coverage: src/components/combo-box/usa-combo-box.component.cy.ts

    it('should display list when clicking input', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const inputEl = element.querySelector('.usa-combo-box__input') as HTMLInputElement;
      const listEl = element.querySelector('.usa-combo-box__list') as HTMLElement;

      expect(listEl.hidden).toBe(true);

      inputEl.click();
      await waitForBehaviorInit(element);

      expect(listEl.hidden).toBe(false);
    });

    it('should set aria-expanded on input when list opens/closes', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const inputEl = element.querySelector('.usa-combo-box__input') as HTMLInputElement;
      const toggleBtn = element.querySelector('.usa-combo-box__toggle-list') as HTMLButtonElement;

      expect(await waitForARIAAttribute(inputEl, 'aria-expanded')).toBe('false');

      toggleBtn.click();
      await waitForBehaviorInit(element);

      expect(await waitForARIAAttribute(inputEl, 'aria-expanded')).toBe('true');

      toggleBtn.click();
      await waitForBehaviorInit(element);

      expect(await waitForARIAAttribute(inputEl, 'aria-expanded')).toBe('false');
    });
  });

  describe('Contract 4: Option Selection', () => {
    it('should select option when clicking list item', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const toggleBtn = element.querySelector('.usa-combo-box__toggle-list') as HTMLButtonElement;
      toggleBtn.click();
      await waitForBehaviorInit(element);

      const option = element.querySelector('.usa-combo-box__list-option') as HTMLElement;
      option.click();
      await waitForBehaviorInit(element);

      // Input should have selected value
      const inputEl = element.querySelector('.usa-combo-box__input') as HTMLInputElement;
      expect(inputEl.value).toBeTruthy();

      // List should close
      const listEl = element.querySelector('.usa-combo-box__list') as HTMLElement;
      expect(listEl.hidden).toBe(true);

      // Select should be updated
      expect(selectEl.value).toBeTruthy();
    });

    it('should mark selected option with aria-selected', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const toggleBtn = element.querySelector('.usa-combo-box__toggle-list') as HTMLButtonElement;
      toggleBtn.click();
      await waitForBehaviorInit(element);

      const option = element.querySelector('.usa-combo-box__list-option') as HTMLElement;
      option.click();
      await waitForBehaviorInit(element);

      toggleBtn.click();
      await waitForBehaviorInit(element);

      const selectedOption = element.querySelector('.usa-combo-box__list-option--selected');
      expect(selectedOption).not.toBeNull();
      expect(selectedOption?.getAttribute('aria-selected')).toBe('true');
    });

    it('should add pristine class after selection', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const comboBoxEl = element.querySelector('.usa-combo-box') as HTMLElement;
      const toggleBtn = element.querySelector('.usa-combo-box__toggle-list') as HTMLButtonElement;

      toggleBtn.click();
      await waitForBehaviorInit(element);

      const option = element.querySelector('.usa-combo-box__list-option') as HTMLElement;
      option.click();
      await waitForBehaviorInit(element);

      expect(comboBoxEl.classList.contains('usa-combo-box--pristine')).toBe(true);
    });
  });

  describe('Contract 5: Keyboard Navigation', () => {
    it('should navigate list with arrow down key', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const inputEl = element.querySelector('.usa-combo-box__input') as HTMLInputElement;
      const listEl = element.querySelector('.usa-combo-box__list') as HTMLElement;

      // Open list
      inputEl.click();
      await waitForBehaviorInit(element);

      expect(listEl.hidden).toBe(false);

      // Press down arrow
      const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
      inputEl.dispatchEvent(downEvent);
      await waitForBehaviorInit(element);

      // Should focus first option
      const focusedOption = listEl.querySelector('.usa-combo-box__list-option--focused');
      expect(focusedOption).not.toBeNull();
    });

    it('should close list with Escape key', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const inputEl = element.querySelector('.usa-combo-box__input') as HTMLInputElement;
      const listEl = element.querySelector('.usa-combo-box__list') as HTMLElement;

      // Open list
      inputEl.click();
      await waitForBehaviorInit(element);

      expect(listEl.hidden).toBe(false);

      // Press Escape - dispatch to combo box element to match USWDS behavior
      const comboBoxEl = element.querySelector('.usa-combo-box') as HTMLElement;
      const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      comboBoxEl.dispatchEvent(escEvent);
      await waitForBehaviorInit(element);

      expect(listEl.hidden).toBe(true);
    });

    it('should select option with Enter key', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const inputEl = element.querySelector('.usa-combo-box__input') as HTMLInputElement;
      const listEl = element.querySelector('.usa-combo-box__list') as HTMLElement;

      // Open list
      inputEl.click();
      await waitForBehaviorInit(element);

      // Navigate to option
      const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
      inputEl.dispatchEvent(downEvent);
      await waitForBehaviorInit(element);

      // Press Enter
      const focusedOption = listEl.querySelector(
        '.usa-combo-box__list-option--focused'
      ) as HTMLElement;
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      focusedOption.dispatchEvent(enterEvent);
      await waitForBehaviorInit(element);

      expect(inputEl.value).toBeTruthy();
      expect(listEl.hidden).toBe(true);
    });
  });

  describe('Contract 6: Clear Input', () => {
    it('should clear input when clicking clear button', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const inputEl = element.querySelector('.usa-combo-box__input') as HTMLInputElement;
      const clearBtn = element.querySelector('.usa-combo-box__clear-input') as HTMLButtonElement;

      // Set value
      inputEl.value = 'test';
      await waitForBehaviorInit(element);

      // Click clear
      clearBtn.click();
      await waitForBehaviorInit(element);

      expect(inputEl.value).toBe('');
    });

    it('should remove pristine class when clearing input', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const comboBoxEl = element.querySelector('.usa-combo-box') as HTMLElement;
      const toggleBtn = element.querySelector('.usa-combo-box__toggle-list') as HTMLButtonElement;

      // Select option
      toggleBtn.click();
      await waitForBehaviorInit(element);

      const option = element.querySelector('.usa-combo-box__list-option') as HTMLElement;
      option.click();
      await waitForBehaviorInit(element);

      expect(comboBoxEl.classList.contains('usa-combo-box--pristine')).toBe(true);

      // Clear
      const clearBtn = element.querySelector('.usa-combo-box__clear-input') as HTMLButtonElement;
      clearBtn.click();
      await waitForBehaviorInit(element);

      expect(comboBoxEl.classList.contains('usa-combo-box--pristine')).toBe(false);
    });
  });

  describe('Contract 7: Accessibility', () => {
    it('should have role="combobox" on input', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const inputEl = element.querySelector('.usa-combo-box__input') as HTMLInputElement;
      expect(inputEl.getAttribute('role')).toBe('combobox');
    });

    it('should have aria-autocomplete="list" on input', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const inputEl = element.querySelector('.usa-combo-box__input') as HTMLInputElement;
      expect(await waitForARIAAttribute(inputEl, 'aria-autocomplete')).toBe('list');
    });

    it('should have role="listbox" on list', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const listEl = element.querySelector('.usa-combo-box__list');
      expect(listEl?.getAttribute('role')).toBe('listbox');
    });

    it('should update aria-activedescendant when focusing options', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const inputEl = element.querySelector('.usa-combo-box__input') as HTMLInputElement;

      // Open list
      inputEl.click();
      await waitForBehaviorInit(element);

      // Navigate to option
      const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
      inputEl.dispatchEvent(downEvent);
      await waitForBehaviorInit(element);

      const activeDescendant = await waitForARIAAttribute(inputEl, 'aria-activedescendant');
      expect(activeDescendant).toBeTruthy();
    });

    it('should announce status changes', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const statusEl = element.querySelector('.usa-combo-box__status') as HTMLElement;
      expect(statusEl).not.toBeNull();
      expect(statusEl.getAttribute('role')).toBe('status');
    });
  });

  describe('Contract 8: Focus Management', () => {
    it('should close list when focus leaves component', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const inputEl = element.querySelector('.usa-combo-box__input') as HTMLInputElement;
      const listEl = element.querySelector('.usa-combo-box__list') as HTMLElement;

      // Open list
      inputEl.click();
      await waitForBehaviorInit(element);

      expect(listEl.hidden).toBe(false);

      // Focus something outside
      const outsideBtn = document.createElement('button');
      document.body.appendChild(outsideBtn);

      const focusoutEvent = new FocusEvent('focusout', {
        bubbles: true,
        relatedTarget: outsideBtn,
      });
      inputEl.dispatchEvent(focusoutEvent);
      await waitForBehaviorInit(element);

      expect(listEl.hidden).toBe(true);

      outsideBtn.remove();
    });

    it('should return focus to input after selection', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const toggleBtn = element.querySelector('.usa-combo-box__toggle-list') as HTMLButtonElement;
      toggleBtn.click();
      await waitForBehaviorInit(element);

      const option = element.querySelector('.usa-combo-box__list-option') as HTMLElement;
      option.click();
      await waitForBehaviorInit(element);

      const inputEl = element.querySelector('.usa-combo-box__input') as HTMLInputElement;
      expect(document.activeElement).toBe(inputEl);
    });
  });

  describe('Prohibited Behaviors (must NOT be present)', () => {
    it('should NOT use custom filtering when disable-filtering is set', async () => {
      element.disableFiltering = true;
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const inputEl = element.querySelector('.usa-combo-box__input') as HTMLInputElement;
      const listEl = element.querySelector('.usa-combo-box__list') as HTMLElement;

      // Type to filter
      inputEl.value = 'app';
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      await waitForBehaviorInit(element);

      // Should show all options
      const options = listEl.querySelectorAll('.usa-combo-box__list-option');
      expect(options.length).toBe(element.options?.length);
    });

    it('should NOT modify USWDS class names', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const comboBoxEl = element.querySelector('.usa-combo-box');
      const inputEl = element.querySelector('.usa-combo-box__input');
      const listEl = element.querySelector('.usa-combo-box__list');

      expect(comboBoxEl).not.toBeNull();
      expect(inputEl).not.toBeNull();
      expect(listEl).not.toBeNull();
    });
  });
});
