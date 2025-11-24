/**
 * USWDS Header Behavior
 *
 * Mirrors official USWDS header JavaScript behavior exactly
 *
 * @uswds-source https://github.com/uswds/uswds/blob/develop/packages/usa-header/src/index.js
 * @uswds-version 3.10.0
 * @last-synced 2025-10-05
 * @sync-status ✅ UP TO DATE
 *
 * CRITICAL: This file replicates USWDS source code to maintain 100% behavior parity.
 * DO NOT add custom logic. ALL changes must come from USWDS source updates.
 */

import { selectOrMatches } from '@uswds-wc/core';
import { FocusTrap } from '@uswds-wc/core';
import { getScrollbarWidth } from '@uswds-wc/core';
import { toggle } from '@uswds-wc/feedback';

/**
 * Constants from USWDS
 *
 * SOURCE: index.js (Lines 11-29)
 */
const PREFIX = 'usa';
const BODY = 'body';
const HEADER = `.${PREFIX}-header`;
const NAV = `.${PREFIX}-nav`;
const NAV_CONTAINER = `.${PREFIX}-nav-container`;
const NAV_PRIMARY = `.${PREFIX}-nav__primary`;
const NAV_PRIMARY_ITEM = `.${PREFIX}-nav__primary-item`;
const NAV_CONTROL = `button.${PREFIX}-nav__link`;
const NAV_LINKS = `${NAV} a`;
const NON_NAV_HIDDEN_ATTRIBUTE = `data-nav-hidden`;
const OPENERS = `.${PREFIX}-menu-btn`;
const CLOSE_BUTTON = `.${PREFIX}-nav__close`;
const OVERLAY = `.${PREFIX}-overlay`;
const CLOSERS = `${CLOSE_BUTTON}, .${PREFIX}-overlay`;
const TOGGLES = [NAV, OVERLAY].join(', ');
const NON_NAV_ELEMENTS = `body *:not(${HEADER}, ${NAV_CONTAINER}, ${NAV}, ${NAV} *):not([aria-hidden])`;
const NON_NAV_HIDDEN = `[${NON_NAV_HIDDEN_ATTRIBUTE}]`;

const ACTIVE_CLASS = 'usa-js-mobile-nav--active';
const VISIBLE_CLASS = 'is-visible';

let navigation: any;
let navActive: HTMLElement | null = null;
let nonNavElements: NodeListOf<Element>;

/**
 * Check if mobile nav is active
 *
 * SOURCE: index.js (Lines 31)
 */
const isActive = (): boolean => document.body.classList.contains(ACTIVE_CLASS);

/**
 * Detect Safari browser
 *
 * SOURCE: index.js (Lines 33-36)
 */
const isSafari = navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome');

/**
 * Calculate scrollbar width and padding
 *
 * SOURCE: index.js (Lines 37-44)
 */
const SCROLLBAR_WIDTH = getScrollbarWidth();
const INITIAL_PADDING = window.getComputedStyle(document.body).getPropertyValue('padding-right');
const TEMPORARY_PADDING = `${
  parseInt(INITIAL_PADDING.replace(/px/, ''), 10) + parseInt(SCROLLBAR_WIDTH.replace(/px/, ''), 10)
}px`;

/**
 * Hide non-navigation items
 *
 * SOURCE: index.js (Lines 46-56)
 */
const hideNonNavItems = (): void => {
  const headerParent = document.querySelector(`${HEADER}`)?.parentNode;
  nonNavElements = document.querySelectorAll(NON_NAV_ELEMENTS);

  nonNavElements.forEach((nonNavElement) => {
    if (nonNavElement !== headerParent) {
      nonNavElement.setAttribute('aria-hidden', 'true');
      nonNavElement.setAttribute(NON_NAV_HIDDEN_ATTRIBUTE, '');
    }
  });
};

/**
 * Show non-navigation items
 *
 * SOURCE: index.js (Lines 58-70)
 */
const showNonNavItems = (): void => {
  nonNavElements = document.querySelectorAll(NON_NAV_HIDDEN);

  if (!nonNavElements) {
    return;
  }

  // Remove aria-hidden from non-header elements
  nonNavElements.forEach((nonNavElement) => {
    nonNavElement.removeAttribute('aria-hidden');
    nonNavElement.removeAttribute(NON_NAV_HIDDEN_ATTRIBUTE);
  });
};

/**
 * Toggle all non-header elements
 *
 * SOURCE: index.js (Lines 73-79)
 *
 * @param active - Whether nav is active
 */
const toggleNonNavItems = (active: boolean): void => {
  if (active) {
    hideNonNavItems();
  } else {
    showNonNavItems();
  }
};

/**
 * Add Safari-specific class for CSS bug fix
 *
 * SOURCE: index.js (Lines 85-89)
 */
const addSafariClass = (): void => {
  if (isSafari) {
    document.body.classList.add('is-safari');
  }
};

/**
 * Set CSS var for Safari scroll position
 *
 * SOURCE: index.js (Lines 96-101)
 *
 * @param body - Document body element
 */
const setSafariScrollPosition = (body: HTMLElement): void => {
  const currentScrollPosition = `-${window.scrollY}px`;
  if (isSafari) {
    body.style.setProperty('--scrolltop', currentScrollPosition);
  }
};

/**
 * Toggle navigation menu
 *
 * SOURCE: index.js (Lines 103-138)
 *
 * @param active - Whether to activate nav
 * @returns The active state
 */
const toggleNav = (active?: boolean): boolean => {
  const { body } = document;
  const safeActive = typeof active === 'boolean' ? active : !isActive();

  setSafariScrollPosition(body);

  body.classList.toggle(ACTIVE_CLASS, safeActive);

  selectOrMatches(TOGGLES).forEach((el) =>
    (el as HTMLElement).classList.toggle(VISIBLE_CLASS, safeActive)
  );

  navigation.focusTrap.update(safeActive);

  const closeButton = body.querySelector(CLOSE_BUTTON) as HTMLElement;
  const menuButton = document.querySelector(OPENERS) as HTMLElement;

  body.style.paddingRight =
    body.style.paddingRight === TEMPORARY_PADDING ? INITIAL_PADDING : TEMPORARY_PADDING;

  toggleNonNavItems(safeActive);

  if (safeActive && closeButton) {
    // The mobile nav was just activated. Focus on the close button
    closeButton.focus();
  } else if (!safeActive && menuButton && getComputedStyle(menuButton).display !== 'none') {
    // The mobile nav was just deactivated. Focus on menu button if visible
    menuButton.focus();
  }

  return safeActive;
};

/**
 * Handle window resize
 *
 * SOURCE: index.js (Lines 140-148)
 */
const resize = (): void => {
  // Guard against undefined document in test teardown (prevents "document is not defined" in CI)
  if (typeof document === 'undefined') {
    return;
  }

  const closer = document.body.querySelector(CLOSE_BUTTON) as HTMLElement;

  if (isActive() && closer && closer.getBoundingClientRect().width === 0) {
    // When mobile nav is active and close box isn't visible,
    // viewport has been resized to be larger. Deactivate mobile nav.
    navigation.toggleNav.call(closer, false);
  }
};

/**
 * Close menu handler
 *
 * SOURCE: index.js (Lines 150)
 */
const onMenuClose = (): boolean => navigation.toggleNav.call(navigation, false);

/**
 * Hide active nav dropdown
 *
 * SOURCE: index.js (Lines 152-158)
 */
const hideActiveNavDropdown = (): void => {
  if (!navActive) {
    return;
  }

  toggle(navActive, false);
  navActive = null;
};

/**
 * Focus nav button
 *
 * SOURCE: index.js (Lines 160-169)
 *
 * @param event - Focus event
 */
const focusNavButton = (event: Event): void => {
  const target = event.target as HTMLElement;
  const parentNavItem = target.closest(NAV_PRIMARY_ITEM);

  // Only shift focus if within dropdown
  if (!target.matches(NAV_CONTROL)) {
    const navControl = parentNavItem?.querySelector(NAV_CONTROL) as HTMLElement;
    if (navControl) {
      navControl.focus();
    }
  }
};

/**
 * Handle escape key
 *
 * SOURCE: index.js (Lines 171-174)
 *
 * @param event - Keyboard event
 */
const handleEscape = (event: Event): void => {
  hideActiveNavDropdown();
  focusNavButton(event);
};

/**
 * Keymap helper for keyboard events
 *
 * SOURCE: receptor/keymap pattern
 */
function keymap(mappings: Record<string, (this: HTMLElement, event: Event) => void>) {
  return function (this: HTMLElement, event: KeyboardEvent) {
    const key = event.shiftKey ? `Shift+${event.key}` : event.key;
    const handler = mappings[key];
    if (handler) {
      handler.call(this, event);
    }
  };
}

/**
 * Initialize header behavior
 *
 * SOURCE: index.js (Lines 176-228)
 *
 * @param root - Root element or document
 * @returns Cleanup function
 */
export function initializeHeader(root: HTMLElement | Document = document): () => void {
  // Guard against undefined window/document in test teardown (prevents "window is not defined" in CI)
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {}; // Return noop cleanup function
  }

  const trapContainer = (root as HTMLElement).matches?.(NAV)
    ? (root as HTMLElement)
    : (root as Document | HTMLElement).querySelector(NAV);

  if (trapContainer) {
    navigation = {
      focusTrap: FocusTrap(trapContainer, {
        Escape: onMenuClose,
      }),
      toggleNav,
    };
  } else {
    // Minimal navigation object if no nav container
    navigation = {
      focusTrap: { update: () => {} },
      toggleNav,
    };
  }

  addSafariClass();
  resize();
  window.addEventListener('resize', resize, false);

  // Event delegation for clicks
  const handleClick = (event: Event) => {
    const target = event.target as HTMLElement;

    // NAV_CONTROL clicks
    const navControl = target.closest(NAV_CONTROL);
    if (navControl) {
      // If another nav is open, close it
      if (navActive !== navControl) {
        hideActiveNavDropdown();
      }
      // Store reference to last clicked nav link
      if (!navActive) {
        navActive = navControl as HTMLElement;
        toggle(navActive, true);
      }
      event.stopPropagation();
      return;
    }

    // BODY clicks (hide dropdown)
    if (target.matches(BODY) || target.closest(BODY)) {
      hideActiveNavDropdown();
    }

    // OPENERS/CLOSERS clicks
    if (target.closest(OPENERS) || target.closest(CLOSERS)) {
      toggleNav();
      return;
    }

    // NAV_LINKS clicks
    const navLink = target.closest(NAV_LINKS);
    if (navLink) {
      // Collapse accordions if present
      const acc = navLink.closest('.usa-accordion');
      if (acc) {
        const buttons = acc.querySelectorAll('.usa-accordion__button');
        buttons.forEach((btn) => {
          const button = btn as HTMLElement;
          if (button.getAttribute('aria-expanded') === 'true') {
            button.click();
          }
        });
      }

      // Hide mobile nav if active
      if (isActive()) {
        navigation.toggleNav.call(navigation, false);
      }
    }
  };

  // Event delegation for keydown on NAV_PRIMARY
  const handleKeydown = (event: Event) => {
    const target = event.target as HTMLElement;
    const navPrimary = target.closest(NAV_PRIMARY);

    if (navPrimary) {
      const handler = keymap({ Escape: handleEscape });
      handler.call(navPrimary as HTMLElement, event as KeyboardEvent);
    }
  };

  // Event delegation for focusout on NAV_PRIMARY
  const handleFocusOut = (event: FocusEvent) => {
    const target = event.target as HTMLElement;
    const nav = target.closest(NAV_PRIMARY);

    if (nav && !nav.contains(event.relatedTarget as Node)) {
      hideActiveNavDropdown();
    }
  };

  // Add event listeners
  const rootEl = root === document ? document.body : (root as HTMLElement);
  rootEl.addEventListener('click', handleClick);
  rootEl.addEventListener('keydown', handleKeydown);
  rootEl.addEventListener('focusout', handleFocusOut);

  return () => {
    window.removeEventListener('resize', resize, false);
    rootEl.removeEventListener('click', handleClick);
    rootEl.removeEventListener('keydown', handleKeydown);
    rootEl.removeEventListener('focusout', handleFocusOut);
    navActive = null;
  };
}

// Export utilities for potential reuse
export { toggleNav, isActive };
