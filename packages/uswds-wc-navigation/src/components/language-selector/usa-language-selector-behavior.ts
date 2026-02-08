/**
 * USWDS Language Selector Behavior
 *
 * Mirrors official USWDS language selector JavaScript behavior exactly
 *
 * @uswds-source https://github.com/uswds/uswds/blob/develop/packages/usa-language-selector/src/index.js
 * @uswds-version 3.10.0
 * @last-synced 2025-10-05
 * @sync-status ✅ UP TO DATE
 *
 * CRITICAL: This file replicates USWDS source code to maintain 100% behavior parity.
 * DO NOT add custom logic. ALL changes must come from USWDS source updates.
 */

import { FocusTrap } from '@uswds-wc/core';
import { keymap } from '@uswds-wc/core';
import { toggle } from '@uswds-wc/feedback';

/**
 * Constants from USWDS
 *
 * SOURCE: index.js (Lines 9-15)
 */
const PREFIX = 'usa';
// @ts-expect-error - Preserved from USWDS source for parity (unused in current implementation)
const BODY = 'body'; // eslint-disable-line @typescript-eslint/no-unused-vars
const LANGUAGE = `.${PREFIX}-language`;
const LANGUAGE_SUB = `.${PREFIX}-language__submenu`;
const LANGUAGE_PRIMARY = `.${PREFIX}-language__primary`;
const LANGUAGE_PRIMARY_ITEM = `.${PREFIX}-language__primary-item`;
const LANGUAGE_CONTROL = `button.${PREFIX}-language__link`;
const LANGUAGE_LINKS = `${LANGUAGE} a`;

let languageSelector: any;
let languageActive: HTMLElement | null = null;

/**
 * Close language dropdown
 *
 * SOURCE: index.js (Lines 20-21)
 */
const onLanguageClose = (): boolean => {
  hideActiveLanguageDropdown();
  return true;
};

/**
 * Hide active language dropdown
 *
 * SOURCE: index.js (Lines 23-30)
 *
 * MODIFICATION: Added defensive check for controlled element existence
 * In web components, elements can be removed/recreated during variant changes
 * Prevents toggle() from throwing when controlled element no longer exists
 */
const hideActiveLanguageDropdown = (): void => {
  if (!languageActive) {
    return;
  }

  // Check if controlled element still exists before toggling
  // Also check if the button itself is still in the DOM
  const controlsId = languageActive.getAttribute('aria-controls');
  if (controlsId && document.contains(languageActive)) {
    const controlledElement = document.getElementById(controlsId);

    if (controlledElement) {
      toggle(languageActive, false);
    }
  }

  languageActive = null;
};

/**
 * Focus language button
 *
 * SOURCE: index.js (Lines 32-38)
 *
 * @param event - Event object
 */
const focusLanguageButton = (event: Event): void => {
  const target = event.target as HTMLElement;
  const parentLanguageItem = target.closest(LANGUAGE_PRIMARY_ITEM);

  if (parentLanguageItem) {
    const control = parentLanguageItem.querySelector(LANGUAGE_CONTROL) as HTMLElement;
    // Focus the control button if it's not already focused
    // USWDS checks if target matches LANGUAGE_CONTROL, but we also need to check actual focus
    // to handle cases where event.target is manually set but focus is elsewhere
    if (control && (!target.matches(LANGUAGE_CONTROL) || document.activeElement !== control)) {
      control.focus();
    }
  }
};

/**
 * Handle escape key
 *
 * SOURCE: index.js (Lines 40-43)
 *
 * @param event - Keyboard event
 */
const handleEscape = (event: Event): void => {
  hideActiveLanguageDropdown();
  focusLanguageButton(event);
};

/**
 * Get accordion buttons (for closing accordion when link clicked)
 *
 * Simplified accordion helper since we don't want full accordion dependency
 *
 * @param accordion - Accordion element
 * @returns Array of accordion button elements
 */
const getAccordionButtons = (accordion: Element): HTMLElement[] => {
  return Array.from(accordion.querySelectorAll('.usa-accordion__button'));
};

/**
 * Hide accordion button
 *
 * @param button - Button element to hide
 */
const hideAccordion = (button: HTMLElement): void => {
  button.setAttribute('aria-expanded', 'false');
  const controls = button.getAttribute('aria-controls');
  if (controls) {
    const content = document.getElementById(controls);
    if (content) {
      content.setAttribute('hidden', '');
    }
  }
};

/**
 * Initialize language selector behavior
 *
 * SOURCE: index.js (Lines 45-89)
 *
 * @param root - Root element or document
 * @returns Cleanup function
 */
export function initializeLanguageSelector(root: HTMLElement | Document = document): () => void {
  const trapContainer = (root as HTMLElement).matches?.(LANGUAGE_SUB)
    ? (root as HTMLElement)
    : (root as Document | HTMLElement).querySelector(LANGUAGE_SUB);

  if (trapContainer) {
    languageSelector = {
      focusTrap: FocusTrap(trapContainer, {
        Escape: onLanguageClose,
      }),
    };

    // Activate focus trap to listen for Escape
    // Save and restore focus to prevent focus trap init() from stealing focus
    const previouslyFocused = document.activeElement as HTMLElement;
    languageSelector.focusTrap.on();
    // Restore focus if it wasn't body (preventing unwanted focus steal during init)
    if (
      previouslyFocused &&
      previouslyFocused !== document.body &&
      typeof previouslyFocused.focus === 'function'
    ) {
      previouslyFocused.focus();
    } else {
      // If body was focused, blur the first tab stop to return focus to body
      if (
        document.activeElement &&
        document.activeElement !== document.body &&
        typeof (document.activeElement as HTMLElement).blur === 'function'
      ) {
        (document.activeElement as HTMLElement).blur();
      }
    }
  } else {
    // Minimal language selector object if no submenu container
    languageSelector = {
      focusTrap: { update: () => {}, off: () => {} },
    };
  }

  // Event delegation for clicks
  const handleClick = (event: Event) => {
    const target = event.target as HTMLElement;

    // LANGUAGE_CONTROL clicks
    const languageControl = target.closest(LANGUAGE_CONTROL);
    if (languageControl) {
      if (languageActive !== languageControl) {
        hideActiveLanguageDropdown();
      }
      if (languageActive === languageControl) {
        hideActiveLanguageDropdown();
        event.stopImmediatePropagation();
        return;
      }
      if (!languageActive) {
        languageActive = languageControl as HTMLElement;
        toggle(languageActive, true);
      }

      event.stopImmediatePropagation();
      return;
    }

    // LANGUAGE_LINKS clicks (check before outside click logic)
    const languageLink = target.closest(LANGUAGE_LINKS);
    if (languageLink) {
      // Find parent accordion
      // The language selector uses .usa-language__primary.usa-accordion internally
      // but it doesn't have .usa-accordion__button children, so we can distinguish
      const acc = languageLink.closest('.usa-accordion');

      if (acc) {
        const buttons = getAccordionButtons(acc);
        // Only hide accordion if it actually has accordion buttons
        // (skip language selector's own .usa-accordion class which has no buttons)
        if (buttons.length > 0) {
          buttons.forEach((btn) => hideAccordion(btn));
        }
      }
      return;
    }

    // Click outside dropdown - hide if clicking anywhere except language control/submenu
    if (!target.closest(LANGUAGE)) {
      hideActiveLanguageDropdown();
    }
  };

  // Event delegation for keydown on LANGUAGE_PRIMARY
  const handleKeydown = (event: Event) => {
    const target = event.target as HTMLElement;
    const languagePrimary = target.closest(LANGUAGE_PRIMARY);

    if (languagePrimary) {
      const handler = keymap({ Escape: handleEscape });
      handler.call(languagePrimary as HTMLElement, event as KeyboardEvent);
    }
  };

  // Event delegation for focusout on LANGUAGE_PRIMARY
  const handleFocusOut = (event: FocusEvent) => {
    const target = event.target as HTMLElement;
    const language = target.closest(LANGUAGE_PRIMARY);

    if (language && !language.contains(event.relatedTarget as Node)) {
      hideActiveLanguageDropdown();
    }
  };

  // Add event listeners (cleanup via removeEventListener in returned function)
  const rootEl = root === document ? document.body : (root as HTMLElement);
  rootEl.addEventListener('click', handleClick); // removeEventListener
  rootEl.addEventListener('keydown', handleKeydown); // removeEventListener
  rootEl.addEventListener('focusout', handleFocusOut); // removeEventListener

  return () => {
    rootEl.removeEventListener('click', handleClick);
    rootEl.removeEventListener('keydown', handleKeydown);
    rootEl.removeEventListener('focusout', handleFocusOut);

    // Deactivate focus trap
    if (languageSelector?.focusTrap && typeof languageSelector.focusTrap.off === 'function') {
      languageSelector.focusTrap.off();
    }

    languageActive = null;
  };
}

// Export utilities for potential reuse
export { hideActiveLanguageDropdown, focusLanguageButton };
