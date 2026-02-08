/**
 * USWDS Combo Box Behavior
 *
 * Mirrors official USWDS combo box JavaScript behavior exactly
 *
 * @uswds-source https://github.com/uswds/uswds/blob/develop/packages/usa-combo-box/src/index.js
 * @uswds-version 3.8.0
 * @last-synced 2025-10-05
 * @sync-status ✅ UP TO DATE
 *
 * CRITICAL: This file replicates USWDS source code to maintain 100% behavior parity.
 * DO NOT add custom logic. ALL changes must come from USWDS source updates.
 */

import { selectOrMatches } from '@uswds-wc/core';
import { Sanitizer } from '@uswds-wc/core';
import { keymap } from '@uswds-wc/core';

/**
 * Constants from USWDS
 *
 * SOURCE: index.js (Lines 8-36)
 */
const PREFIX = 'usa';
const COMBO_BOX_CLASS = `${PREFIX}-combo-box`;
const COMBO_BOX_PRISTINE_CLASS = `${COMBO_BOX_CLASS}--pristine`;
const SELECT_CLASS = `${COMBO_BOX_CLASS}__select`;
const INPUT_CLASS = `${COMBO_BOX_CLASS}__input`;
const CLEAR_INPUT_BUTTON_CLASS = `${COMBO_BOX_CLASS}__clear-input`;
const CLEAR_INPUT_BUTTON_WRAPPER_CLASS = `${CLEAR_INPUT_BUTTON_CLASS}__wrapper`;
const INPUT_BUTTON_SEPARATOR_CLASS = `${COMBO_BOX_CLASS}__input-button-separator`;
const TOGGLE_LIST_BUTTON_CLASS = `${COMBO_BOX_CLASS}__toggle-list`;
const TOGGLE_LIST_BUTTON_WRAPPER_CLASS = `${TOGGLE_LIST_BUTTON_CLASS}__wrapper`;
const LIST_CLASS = `${COMBO_BOX_CLASS}__list`;
const LIST_OPTION_CLASS = `${COMBO_BOX_CLASS}__list-option`;
const LIST_OPTION_FOCUSED_CLASS = `${LIST_OPTION_CLASS}--focused`;
const LIST_OPTION_SELECTED_CLASS = `${LIST_OPTION_CLASS}--selected`;
const STATUS_CLASS = `${COMBO_BOX_CLASS}__status`;

const COMBO_BOX = `.${COMBO_BOX_CLASS}`;
const SELECT = `.${SELECT_CLASS}`;
const INPUT = `.${INPUT_CLASS}`;
const CLEAR_INPUT_BUTTON = `.${CLEAR_INPUT_BUTTON_CLASS}`;
const TOGGLE_LIST_BUTTON = `.${TOGGLE_LIST_BUTTON_CLASS}`;
const LIST = `.${LIST_CLASS}`;
const LIST_OPTION = `.${LIST_OPTION_CLASS}`;
const LIST_OPTION_FOCUSED = `.${LIST_OPTION_FOCUSED_CLASS}`;
const LIST_OPTION_SELECTED = `.${LIST_OPTION_SELECTED_CLASS}`;
const STATUS = `.${STATUS_CLASS}`;

const DEFAULT_FILTER = '.*{{query}}.*';

const noop = () => {};

/**
 * Combo box context
 */
interface ComboBoxContext {
  comboBoxEl: HTMLElement;
  selectEl: HTMLSelectElement;
  inputEl: HTMLInputElement;
  listEl: HTMLUListElement;
  statusEl: HTMLDivElement;
  focusedOptionEl: HTMLLIElement | null;
  selectedOptionEl: HTMLLIElement | null;
  toggleListBtnEl: HTMLButtonElement;
  clearInputBtnEl: HTMLButtonElement;
  isPristine: boolean;
  disableFiltering: boolean;
}

/**
 * Set the value of the element and dispatch a change event
 *
 * SOURCE: index.js (Lines 44-54)
 *
 * @param el - The element to update
 * @param value - The new value
 */
const changeElementValue = (el: HTMLInputElement | HTMLSelectElement, value = '') => {
  const elementToChange = el;
  elementToChange.value = value;

  const event = new CustomEvent('change', {
    bubbles: true,
    cancelable: true,
    detail: { value },
  });
  elementToChange.dispatchEvent(event);
};

/**
 * Get combo box context
 *
 * SOURCE: index.js (Lines 79-111)
 *
 * @param el - Element within the combo box
 * @returns Context object
 */
const getComboBoxContext = (el: HTMLElement): ComboBoxContext => {
  const comboBoxEl = el.closest(COMBO_BOX) as HTMLElement;

  if (!comboBoxEl) {
    throw new Error(`Element is missing outer ${COMBO_BOX}`);
  }

  const selectEl = comboBoxEl.querySelector(SELECT) as HTMLSelectElement;
  const inputEl = comboBoxEl.querySelector(INPUT) as HTMLInputElement;
  const listEl = comboBoxEl.querySelector(LIST) as HTMLUListElement;
  const statusEl = comboBoxEl.querySelector(STATUS) as HTMLDivElement;
  const focusedOptionEl = comboBoxEl.querySelector(LIST_OPTION_FOCUSED) as HTMLLIElement | null;
  const selectedOptionEl = comboBoxEl.querySelector(LIST_OPTION_SELECTED) as HTMLLIElement | null;
  const toggleListBtnEl = comboBoxEl.querySelector(TOGGLE_LIST_BUTTON) as HTMLButtonElement;
  const clearInputBtnEl = comboBoxEl.querySelector(CLEAR_INPUT_BUTTON) as HTMLButtonElement;

  const isPristine = comboBoxEl.classList.contains(COMBO_BOX_PRISTINE_CLASS);
  const disableFiltering = comboBoxEl.dataset.disableFiltering === 'true';

  return {
    comboBoxEl,
    selectEl,
    inputEl,
    listEl,
    statusEl,
    focusedOptionEl,
    selectedOptionEl,
    toggleListBtnEl,
    clearInputBtnEl,
    isPristine,
    disableFiltering,
  };
};

/**
 * Disable the combo box component
 *
 * SOURCE: index.js (Lines 118-125)
 *
 * @param el - Element within the combo box
 */
const disable = (el: HTMLElement) => {
  const { inputEl, toggleListBtnEl, clearInputBtnEl } = getComboBoxContext(el);

  clearInputBtnEl.hidden = true;
  clearInputBtnEl.disabled = true;
  toggleListBtnEl.disabled = true;
  inputEl.disabled = true;
};

/**
 * Check for aria-disabled on initialization
 *
 * SOURCE: index.js (Lines 132-139)
 *
 * @param el - Element within the combo box
 */
const ariaDisable = (el: HTMLElement) => {
  const { inputEl, toggleListBtnEl, clearInputBtnEl } = getComboBoxContext(el);

  clearInputBtnEl.hidden = true;
  clearInputBtnEl.setAttribute('aria-disabled', 'true');
  toggleListBtnEl.setAttribute('aria-disabled', 'true');
  inputEl.setAttribute('aria-disabled', 'true');
};

/**
 * Enable the combo box component
 *
 * SOURCE: index.js (Lines 146-153)
 * NOTE: Preserved from USWDS source but currently unused
 *
 * @param el - Element within the combo box
 */
// @ts-expect-error - Function preserved from USWDS source for future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const enable = (el: HTMLElement) => {
  const { inputEl, toggleListBtnEl, clearInputBtnEl } = getComboBoxContext(el);

  clearInputBtnEl.hidden = false;
  clearInputBtnEl.disabled = false;
  toggleListBtnEl.disabled = false;
  inputEl.disabled = false;
};

/**
 * Enhance a select element into a combo box component
 *
 * SOURCE: index.js (Lines 160-282)
 *
 * @param _comboBoxEl - Combo box element
 */
const enhanceComboBox = (_comboBoxEl: HTMLElement) => {
  const comboBoxEl = _comboBoxEl.closest(COMBO_BOX) as HTMLElement;

  if (comboBoxEl.dataset.enhanced === 'true') return;

  const selectEl = comboBoxEl.querySelector('select');

  if (!selectEl) {
    throw new Error(`${COMBO_BOX} is missing inner select`);
  }

  const selectId = selectEl.id;
  const selectLabel = document.querySelector(`label[for="${selectId}"]`) as HTMLLabelElement;
  const listId = `${selectId}--list`;
  const listIdLabel = `${selectId}-label`;
  const additionalAttributes: Record<string, any>[] = [];
  const { defaultValue } = comboBoxEl.dataset;
  const { placeholder } = comboBoxEl.dataset;
  let selectedOption: HTMLOptionElement | undefined;

  if (placeholder) {
    additionalAttributes.push({ placeholder });
  }

  if (defaultValue) {
    for (let i = 0, len = selectEl.options.length; i < len; i += 1) {
      const optionEl = selectEl.options[i];

      if (optionEl.value === defaultValue) {
        selectedOption = optionEl;
        break;
      }
    }
  }

  /**
   * Throw error if combobox is missing a label or label is missing
   * `for` attribute. Otherwise, set the ID to match the <ul> aria-labelledby
   */
  if (!selectLabel || !selectLabel.matches(`label[for="${selectId}"]`)) {
    throw new Error(`${COMBO_BOX} for ${selectId} is either missing a label or a "for" attribute`);
  } else {
    selectLabel.setAttribute('id', listIdLabel);
  }

  selectLabel.setAttribute('id', listIdLabel);
  selectEl.setAttribute('aria-hidden', 'true');
  selectEl.setAttribute('tabindex', '-1');
  selectEl.classList.add('usa-sr-only', SELECT_CLASS);
  selectEl.id = '';
  selectEl.value = '';

  ['required', 'aria-label', 'aria-labelledby'].forEach((name) => {
    if (selectEl.hasAttribute(name)) {
      const value = selectEl.getAttribute(name);
      additionalAttributes.push({ [name]: value });
      selectEl.removeAttribute(name);
    }
  });

  // sanitize doesn't like functions in template literals
  const input = document.createElement('input');
  input.setAttribute('id', selectId);
  input.setAttribute('aria-owns', listId);
  input.setAttribute('aria-controls', listId);
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'false');
  input.setAttribute('autocapitalize', 'off');
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('class', INPUT_CLASS);
  input.setAttribute('type', 'text');
  input.setAttribute('role', 'combobox');
  additionalAttributes.forEach((attr) =>
    Object.keys(attr).forEach((key) => {
      const value = Sanitizer.escapeHTML`${attr[key]}`;
      input.setAttribute(key, value);
    })
  );

  comboBoxEl.insertAdjacentElement('beforeend', input);

  comboBoxEl.insertAdjacentHTML(
    'beforeend',
    Sanitizer.escapeHTML`
    <span class="${CLEAR_INPUT_BUTTON_WRAPPER_CLASS}" tabindex="-1">
        <button type="button" class="${CLEAR_INPUT_BUTTON_CLASS}" aria-label="Clear the select contents">&nbsp;</button>
      </span>
      <span class="${INPUT_BUTTON_SEPARATOR_CLASS}">&nbsp;</span>
      <span class="${TOGGLE_LIST_BUTTON_WRAPPER_CLASS}" tabindex="-1">
        <button type="button" tabindex="-1" class="${TOGGLE_LIST_BUTTON_CLASS}" aria-label="Toggle the dropdown list">&nbsp;</button>
      </span>
      <ul
        tabindex="-1"
        id="${listId}"
        class="${LIST_CLASS}"
        role="listbox"
        aria-labelledby="${listIdLabel}"
        hidden>
      </ul>
      <div class="${STATUS_CLASS} usa-sr-only" role="status"></div>`
  );

  if (selectedOption) {
    const { inputEl } = getComboBoxContext(comboBoxEl);
    changeElementValue(selectEl, selectedOption.value);
    changeElementValue(inputEl, selectedOption.text);
    comboBoxEl.classList.add(COMBO_BOX_PRISTINE_CLASS);
  }

  if (selectEl.disabled) {
    disable(comboBoxEl);
    selectEl.disabled = false;
  }

  if (selectEl.hasAttribute('aria-disabled')) {
    ariaDisable(comboBoxEl);
    selectEl.removeAttribute('aria-disabled');
  }

  comboBoxEl.dataset.enhanced = 'true';
};

/**
 * Manage the focused element within the list options when navigating via keyboard
 *
 * SOURCE: index.js (Lines 294-327)
 *
 * @param el - Element within the combo box
 * @param nextEl - Element to focus
 * @param options - Options object
 */
const highlightOption = (
  el: HTMLElement,
  nextEl: HTMLElement | null,
  { skipFocus, preventScroll }: { skipFocus?: boolean; preventScroll?: boolean } = {}
) => {
  const { inputEl, listEl, focusedOptionEl } = getComboBoxContext(el);

  if (focusedOptionEl) {
    focusedOptionEl.classList.remove(LIST_OPTION_FOCUSED_CLASS);
    focusedOptionEl.setAttribute('tabIndex', '-1');
  }

  if (nextEl) {
    inputEl.setAttribute('aria-activedescendant', nextEl.id);
    nextEl.setAttribute('tabIndex', '0');
    nextEl.classList.add(LIST_OPTION_FOCUSED_CLASS);

    if (!preventScroll) {
      const optionBottom = nextEl.offsetTop + nextEl.offsetHeight;
      const currentBottom = listEl.scrollTop + listEl.offsetHeight;

      if (optionBottom > currentBottom) {
        listEl.scrollTop = optionBottom - listEl.offsetHeight;
      }

      if (nextEl.offsetTop < listEl.scrollTop) {
        listEl.scrollTop = nextEl.offsetTop;
      }
    }

    if (!skipFocus) {
      nextEl.focus({ preventScroll });
    }
  } else {
    inputEl.setAttribute('aria-activedescendant', '');
    inputEl.focus();
  }
};

/**
 * Generate a dynamic regular expression based off of a replaceable and possibly filtered value
 *
 * SOURCE: index.js (Lines 336-359)
 *
 * @param filter - Filter pattern
 * @param query - Query value
 * @param extras - Extra filters
 */
const generateDynamicRegExp = (
  filter: string,
  query = '',
  extras: Record<string, any> = {}
): RegExp => {
  const escapeRegExp = (text: string) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

  let find = filter.replace(/{{(.*?)}}/g, (_m, $1) => {
    const key = $1.trim();
    const queryFilter = extras[key];
    if (key !== 'query' && queryFilter) {
      const matcher = new RegExp(queryFilter, 'i');
      const matches = query.match(matcher);

      if (matches) {
        return escapeRegExp(matches[1]);
      }

      return '';
    }
    return escapeRegExp(query);
  });

  find = `^(?:${find})$`;

  return new RegExp(find, 'i');
};

/**
 * Display the option list of a combo box component
 *
 * SOURCE: index.js (Lines 366-549)
 *
 * @param el - Element within the combo box
 */
const displayList = (el: HTMLElement) => {
  const { comboBoxEl, selectEl, inputEl, listEl, statusEl, isPristine, disableFiltering } =
    getComboBoxContext(el);
  let selectedItemId: string | undefined;
  let firstFoundId: string | undefined;

  const listOptionBaseId = `${listEl.id}--option-`;

  const inputValue = (inputEl.value || '').toLowerCase();
  const filter = comboBoxEl.dataset.filter || DEFAULT_FILTER;
  const regex = generateDynamicRegExp(filter, inputValue, comboBoxEl.dataset);

  let options: HTMLOptionElement[] = [];
  const optionsStartsWith: HTMLOptionElement[] = [];
  const optionsContains: HTMLOptionElement[] = [];
  const optionList = Array.from(selectEl.options);

  /**
   * Builds and sorts options array
   */
  const buildOptionsArray = (option: HTMLOptionElement) => {
    if (disableFiltering || isPristine) {
      options.push(option);
      return;
    }

    const matchStartsWith = option.text.toLowerCase().startsWith(inputValue);

    if (matchStartsWith) {
      optionsStartsWith.push(option);
    } else {
      optionsContains.push(option);
    }

    options = [...optionsStartsWith, ...optionsContains];
  };

  const optionMatchesQuery = (option: HTMLOptionElement) => regex.test(option.text);

  const arrayNeedsUpdate = (option: HTMLOptionElement) =>
    option.value && (disableFiltering || isPristine || !inputValue || optionMatchesQuery(option));

  const isFirstMatch = (option: HTMLOptionElement) =>
    disableFiltering && !firstFoundId && optionMatchesQuery(option);

  const isCurrentSelection = (option: HTMLOptionElement) =>
    selectEl.value && option.value === selectEl.value;

  optionList.forEach((option) => {
    if (arrayNeedsUpdate(option)) {
      buildOptionsArray(option);

      const optionId = `${listOptionBaseId}${options.indexOf(option)}`;

      if (isFirstMatch(option)) {
        firstFoundId = optionId;
      }

      if (isCurrentSelection(option)) {
        selectedItemId = optionId;
      }
    }
  });

  const numOptions = options.length;
  const optionHtml = options.map((option, index) => {
    const optionId = `${listOptionBaseId}${index}`;
    const classes = [LIST_OPTION_CLASS];
    let tabindex = '-1';
    let ariaSelected = 'false';

    if (optionId === selectedItemId) {
      classes.push(LIST_OPTION_SELECTED_CLASS, LIST_OPTION_FOCUSED_CLASS);
      tabindex = '0';
      ariaSelected = 'true';
    }

    if (!selectedItemId && index === 0) {
      classes.push(LIST_OPTION_FOCUSED_CLASS);
      tabindex = '0';
    }

    const li = document.createElement('li');

    li.setAttribute('aria-setsize', String(options.length));
    li.setAttribute('aria-posinset', String(index + 1));
    li.setAttribute('aria-selected', ariaSelected);
    li.setAttribute('id', optionId);
    li.setAttribute('class', classes.join(' '));
    li.setAttribute('tabindex', tabindex);
    li.setAttribute('role', 'option');
    li.setAttribute('data-value', option.value);
    li.textContent = option.text;

    return li;
  });

  const noResults = document.createElement('li');
  noResults.setAttribute('class', `${LIST_OPTION_CLASS}--no-results`);
  noResults.textContent = 'No results found';

  listEl.hidden = false;
  listEl.removeAttribute('hidden'); // CRITICAL: Must remove attribute for Lit-rendered elements

  if (numOptions) {
    listEl.innerHTML = '';
    optionHtml.forEach((item) => listEl.insertAdjacentElement('beforeend', item));
  } else {
    listEl.innerHTML = '';
    listEl.insertAdjacentElement('beforeend', noResults);
  }

  inputEl.setAttribute('aria-expanded', 'true');

  statusEl.textContent = numOptions
    ? `${numOptions} result${numOptions > 1 ? 's' : ''} available.`
    : 'No results.';

  let itemToFocus: HTMLElement | null = null;

  if (isPristine && selectedItemId) {
    itemToFocus = listEl.querySelector(`#${selectedItemId}`);
  } else if (disableFiltering && firstFoundId) {
    itemToFocus = listEl.querySelector(`#${firstFoundId}`);
  }

  if (itemToFocus) {
    highlightOption(listEl, itemToFocus, {
      skipFocus: true,
    });
  }
};

/**
 * Hide the option list of a combo box component
 *
 * SOURCE: index.js (Lines 556-570)
 *
 * @param el - Element within the combo box
 */
const hideList = (el: HTMLElement) => {
  const { inputEl, listEl, statusEl, focusedOptionEl } = getComboBoxContext(el);

  statusEl.innerHTML = '';

  inputEl.setAttribute('aria-expanded', 'false');
  inputEl.setAttribute('aria-activedescendant', '');

  if (focusedOptionEl) {
    focusedOptionEl.classList.remove(LIST_OPTION_FOCUSED_CLASS);
  }

  listEl.scrollTop = 0;
  listEl.hidden = true;
  listEl.setAttribute('hidden', ''); // CRITICAL: Must set attribute for Lit-rendered elements
};

/**
 * Select an option list of the combo box component
 *
 * SOURCE: index.js (Lines 577-585)
 *
 * @param listOptionEl - The list option being selected
 */
const selectItem = (listOptionEl: HTMLElement) => {
  const { comboBoxEl, selectEl, inputEl } = getComboBoxContext(listOptionEl);

  changeElementValue(selectEl, (listOptionEl as any).dataset.value);
  changeElementValue(inputEl, listOptionEl.textContent || '');
  comboBoxEl.classList.add(COMBO_BOX_PRISTINE_CLASS);
  hideList(comboBoxEl);
  inputEl.focus();
};

/**
 * Clear the input of the combo box
 *
 * SOURCE: index.js (Lines 592-603)
 *
 * @param clearButtonEl - The clear input button
 */
const clearInput = (clearButtonEl: HTMLElement) => {
  const { comboBoxEl, listEl, selectEl, inputEl } = getComboBoxContext(clearButtonEl);
  const listShown = !listEl.hidden;

  if (selectEl.value) changeElementValue(selectEl);
  if (inputEl.value) changeElementValue(inputEl);
  comboBoxEl.classList.remove(COMBO_BOX_PRISTINE_CLASS);

  if (listShown) displayList(comboBoxEl);
  inputEl.focus();
};

/**
 * Reset the select based off of currently set select value
 *
 * SOURCE: index.js (Lines 610-632)
 *
 * @param el - Element within the combo box
 */
const resetSelection = (el: HTMLElement) => {
  const { comboBoxEl, selectEl, inputEl } = getComboBoxContext(el);

  const selectValue = selectEl.value;
  const inputValue = (inputEl.value || '').toLowerCase();

  if (selectValue) {
    for (let i = 0, len = selectEl.options.length; i < len; i += 1) {
      const optionEl = selectEl.options[i];
      if (optionEl.value === selectValue) {
        if (inputValue !== optionEl.text) {
          changeElementValue(inputEl, optionEl.text);
        }
        comboBoxEl.classList.add(COMBO_BOX_PRISTINE_CLASS);
        return;
      }
    }
  }

  if (inputValue) {
    changeElementValue(inputEl);
  }
};

/**
 * Select an option list of the combo box component based off of
 * having a current focused list option or having text that completely matches a list option
 *
 * SOURCE: index.js (Lines 642-662)
 *
 * @param el - Element within the combo box
 */
const completeSelection = (el: HTMLElement) => {
  const { comboBoxEl, selectEl, inputEl, statusEl } = getComboBoxContext(el);

  statusEl.textContent = '';

  const inputValue = (inputEl.value || '').toLowerCase();

  if (inputValue) {
    for (let i = 0, len = selectEl.options.length; i < len; i += 1) {
      const optionEl = selectEl.options[i];
      if (optionEl.text.toLowerCase() === inputValue) {
        changeElementValue(selectEl, optionEl.value);
        changeElementValue(inputEl, optionEl.text);
        comboBoxEl.classList.add(COMBO_BOX_PRISTINE_CLASS);
        return;
      }
    }
  }

  resetSelection(comboBoxEl);
};

/**
 * Handle the escape event within the combo box component
 *
 * SOURCE: index.js (Lines 669-675)
 *
 * @param _event - Keyboard event (unused but required by keymap signature)
 */
const handleEscape = function (this: HTMLElement, _event: Event) {
  const { comboBoxEl, inputEl } = getComboBoxContext(this);

  hideList(comboBoxEl);
  resetSelection(comboBoxEl);
  inputEl.focus();
};

/**
 * Handle the down event within the combo box component
 *
 * SOURCE: index.js (Lines 682-698)
 *
 * @param event - Keyboard event
 */
const handleDownFromInput = function (this: HTMLElement, event: Event) {
  const { comboBoxEl, listEl } = getComboBoxContext(this);

  if (listEl.hidden) {
    displayList(comboBoxEl);
  }

  const nextOptionEl =
    listEl.querySelector(LIST_OPTION_FOCUSED) || listEl.querySelector(LIST_OPTION);

  if (nextOptionEl) {
    highlightOption(comboBoxEl, nextOptionEl as HTMLElement);
  }

  event.preventDefault();
};

/**
 * Handle the enter event from an input element within the combo box component
 *
 * SOURCE: index.js (Lines 705-716)
 *
 * @param event - Keyboard event
 */
const handleEnterFromInput = function (this: HTMLElement, event: Event) {
  const { comboBoxEl, listEl } = getComboBoxContext(this);
  const listShown = !listEl.hidden;

  completeSelection(comboBoxEl);

  if (listShown) {
    hideList(comboBoxEl);
  }

  event.preventDefault();
};

/**
 * Handle the down event within the combo box component
 *
 * SOURCE: index.js (Lines 723-732)
 *
 * @param event - Keyboard event
 */
const handleDownFromListOption = function (this: HTMLElement, event: Event) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const focusedOptionEl = this;
  const nextOptionEl = focusedOptionEl.nextSibling;

  if (nextOptionEl) {
    highlightOption(focusedOptionEl, nextOptionEl as HTMLElement);
  }

  event.preventDefault();
};

/**
 * Handle the space event from a list option element within the combo box component
 *
 * SOURCE: index.js (Lines 739-742)
 *
 * @param event - Keyboard event
 */
const handleSpaceFromListOption = function (this: HTMLElement, event: Event) {
  selectItem(this);
  event.preventDefault();
};

/**
 * Handle the enter event from list option within the combo box component
 *
 * SOURCE: index.js (Lines 749-752)
 *
 * @param event - Keyboard event
 */
const handleEnterFromListOption = function (this: HTMLElement, event: Event) {
  selectItem(this);
  event.preventDefault();
};

/**
 * Handle the up event from list option within the combo box component
 *
 * SOURCE: index.js (Lines 759-775)
 *
 * @param event - Keyboard event
 */
const handleUpFromListOption = function (this: HTMLElement, event: Event) {
  const { comboBoxEl, listEl, focusedOptionEl } = getComboBoxContext(this);
  const nextOptionEl = focusedOptionEl && focusedOptionEl.previousSibling;
  const listShown = !listEl.hidden;

  highlightOption(comboBoxEl, nextOptionEl as HTMLElement | null);

  if (listShown) {
    event.preventDefault();
  }

  if (!nextOptionEl) {
    hideList(comboBoxEl);
  }
};

/**
 * Select list option on the mouseover event
 *
 * SOURCE: index.js (Lines 783-793)
 *
 * @param listOptionEl - Element within the combo box
 */
const handleMouseover = (listOptionEl: HTMLElement) => {
  const isCurrentlyFocused = listOptionEl.classList.contains(LIST_OPTION_FOCUSED_CLASS);

  if (isCurrentlyFocused) return;

  highlightOption(listOptionEl, listOptionEl, {
    preventScroll: true,
  });
};

/**
 * Toggle the list when the button is clicked
 *
 * SOURCE: index.js (Lines 800-810)
 *
 * @param el - Element within the combo box
 */
const toggleList = (el: HTMLElement) => {
  const { comboBoxEl, listEl, inputEl } = getComboBoxContext(el);

  if (listEl.hidden) {
    displayList(comboBoxEl);
  } else {
    hideList(comboBoxEl);
  }

  inputEl.focus();
};

/**
 * Handle click from input
 *
 * SOURCE: index.js (Lines 817-823)
 *
 * @param el - Element within the combo box
 */
const handleClickFromInput = (el: HTMLElement) => {
  const { comboBoxEl, listEl } = getComboBoxContext(el);

  if (listEl.hidden) {
    displayList(comboBoxEl);
  }
};

/**
 * Initialize combo box behavior
 *
 * SOURCE: index.js (Lines 825-900)
 *
 * @param root - Root element or document
 * @returns Cleanup function
 */
export function initializeComboBox(root: HTMLElement | Document = document): () => void {
  const comboBoxes = selectOrMatches(COMBO_BOX, root);

  comboBoxes.forEach((comboBoxEl) => {
    enhanceComboBox(comboBoxEl as HTMLElement);
  });

  // Check if we've already initialized this root
  const rootEl = root === document ? document.body : (root as HTMLElement);
  if ((rootEl as any).__comboBoxInitialized) {
    return () => {}; // Return empty cleanup - already initialized
  }
  (rootEl as any).__comboBoxInitialized = true;

  // Event delegation for clicks
  const handleClick = (event: Event) => {
    const target = event.target as HTMLElement;

    if (target.closest(INPUT)) {
      const inputEl = target.closest(INPUT) as HTMLInputElement;
      if (inputEl.disabled) return;
      handleClickFromInput(inputEl);
    } else if (target.closest(TOGGLE_LIST_BUTTON)) {
      const buttonEl = target.closest(TOGGLE_LIST_BUTTON) as HTMLElement;
      if ((buttonEl as any).disabled) return;
      toggleList(buttonEl);
    } else if (target.closest(LIST_OPTION)) {
      const optionEl = target.closest(LIST_OPTION) as HTMLElement;
      if ((optionEl as any).disabled) return;
      selectItem(optionEl);
    } else if (target.closest(CLEAR_INPUT_BUTTON)) {
      const clearEl = target.closest(CLEAR_INPUT_BUTTON) as HTMLElement;
      if ((clearEl as any).disabled) return;
      clearInput(clearEl);
    }
  };

  // Event delegation for focusout
  const handleFocusout = (event: FocusEvent) => {
    const target = event.target as HTMLElement;
    const comboBoxEl = target.closest(COMBO_BOX) as HTMLElement;

    if (comboBoxEl && !comboBoxEl.contains(event.relatedTarget as Node)) {
      resetSelection(comboBoxEl);
      hideList(comboBoxEl);
    }
  };

  // Event delegation for keydown on combo box (Escape)
  const handleKeydownComboBox = keymap({
    Escape: handleEscape,
  });

  // Event delegation for keydown on input
  const handleKeydownInput = keymap({
    Enter: handleEnterFromInput,
    ArrowDown: handleDownFromInput,
    Down: handleDownFromInput,
  });

  // Event delegation for keydown on list options
  const handleKeydownListOption = keymap({
    ArrowUp: handleUpFromListOption,
    Up: handleUpFromListOption,
    ArrowDown: handleDownFromListOption,
    Down: handleDownFromListOption,
    Enter: handleEnterFromListOption,
    ' ': handleSpaceFromListOption,
    'Shift+Tab': noop,
  });

  // Event delegation for input changes
  const handleInput = (event: Event) => {
    const target = event.target as HTMLElement;
    const inputEl = target.closest(INPUT);

    if (inputEl) {
      const comboBoxEl = inputEl.closest(COMBO_BOX) as HTMLElement;
      comboBoxEl.classList.remove(COMBO_BOX_PRISTINE_CLASS);
      displayList(inputEl as HTMLElement);
    }
  };

  // Event delegation for mouseover
  const handleMouseoverEvent = (event: Event) => {
    const target = event.target as HTMLElement;
    const listOptionEl = target.closest(LIST_OPTION);

    if (listOptionEl) {
      handleMouseover(listOptionEl as HTMLElement);
    }
  };

  // Keydown delegation
  const handleKeydown = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement;

    if (target.closest(LIST_OPTION)) {
      handleKeydownListOption.call(target, event);
    } else if (target.closest(INPUT)) {
      handleKeydownInput.call(target, event);
    } else if (target.closest(COMBO_BOX)) {
      handleKeydownComboBox.call(target, event);
    }
  };

  // Add event listeners (using rootEl declared above for initialization guard)
  rootEl.addEventListener('click', handleClick);
  rootEl.addEventListener('focusout', handleFocusout);
  rootEl.addEventListener('keydown', handleKeydown);
  rootEl.addEventListener('input', handleInput);
  rootEl.addEventListener('mouseover', handleMouseoverEvent);

  return () => {
    rootEl.removeEventListener('click', handleClick);
    rootEl.removeEventListener('focusout', handleFocusout);
    rootEl.removeEventListener('keydown', handleKeydown);
    rootEl.removeEventListener('input', handleInput);
    rootEl.removeEventListener('mouseover', handleMouseoverEvent);
  };
}

// Export functions needed by other components (like time-picker)
export { enhanceComboBox, COMBO_BOX_CLASS };
