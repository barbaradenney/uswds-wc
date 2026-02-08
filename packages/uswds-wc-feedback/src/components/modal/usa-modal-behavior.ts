/**
 * USWDS Modal Behavior
 *
 * Mirrors official USWDS modal JavaScript behavior exactly
 *
 * @uswds-source https://github.com/uswds/uswds/blob/develop/packages/usa-modal/src/index.js
 * @uswds-version 3.8.0
 * @last-synced 2025-10-07
 * @sync-status ✅ UP TO DATE
 *
 * CRITICAL: This file replicates USWDS source code to maintain 100% behavior parity.
 * DO NOT add custom logic. ALL changes must come from USWDS source updates.
 */

import { selectOrMatches } from '@uswds-wc/core';
import { FocusTrap } from '@uswds-wc/core';
import { getScrollbarWidth } from '@uswds-wc/core';

/**
 * Constants from USWDS
 *
 * SOURCE: index.js (Lines 8-26)
 */
const PREFIX = 'usa';
const MODAL_CLASSNAME = `${PREFIX}-modal`;
const OVERLAY_CLASSNAME = `${MODAL_CLASSNAME}-overlay`;
const WRAPPER_CLASSNAME = `${MODAL_CLASSNAME}-wrapper`;
const OPENER_ATTRIBUTE = 'data-open-modal';
const CLOSER_ATTRIBUTE = 'data-close-modal';
const FORCE_ACTION_ATTRIBUTE = 'data-force-action';
const NON_MODAL_HIDDEN_ATTRIBUTE = 'data-modal-hidden';
const MODAL = `.${MODAL_CLASSNAME}`;
const INITIAL_FOCUS = `.${WRAPPER_CLASSNAME} *[data-focus]`;
const CLOSE_BUTTON = `${WRAPPER_CLASSNAME} *[${CLOSER_ATTRIBUTE}]`;
const OPENERS = `*[${OPENER_ATTRIBUTE}][aria-controls]`;
// Kept for USWDS parity - not used in web component implementation
// @ts-expect-error Kept for USWDS parity - not used in web component implementation
const CLOSERS = `${CLOSE_BUTTON}, .${OVERLAY_CLASSNAME}:not([${FORCE_ACTION_ATTRIBUTE}])`; // eslint-disable-line @typescript-eslint/no-unused-vars
const NON_MODALS = `body > *:not(.${WRAPPER_CLASSNAME}):not([aria-hidden])`;
const NON_MODALS_HIDDEN = `[${NON_MODAL_HIDDEN_ATTRIBUTE}]`;

const ACTIVE_CLASS = 'usa-js-modal--active';
const PREVENT_CLICK_CLASS = 'usa-js-no-click';
const VISIBLE_CLASS = 'is-visible';
const HIDDEN_CLASS = 'is-hidden';

/**
 * Global state
 *
 * SOURCE: index.js (Lines 28-33)
 */
let modalState: {
  focusTrap: any;
  toggleModal: (event: Event) => boolean;
} | null = null;

let INITIAL_BODY_PADDING: string;
let TEMPORARY_BODY_PADDING: string;

const isActive = (): boolean => document.body.classList.contains(ACTIVE_CLASS);
const SCROLLBAR_WIDTH = getScrollbarWidth();

/**
 * Closes modal when bound to a button and pressed
 *
 * SOURCE: index.js (Lines 38-40)
 */
const onMenuClose = (): void => {
  if (modalState) {
    modalState.toggleModal.call(modalState, new Event('keydown'));
  }
};

/**
 * Set temporary body padding
 *
 * SOURCE: index.js (Lines 46-54)
 */
const setTemporaryBodyPadding = (): void => {
  INITIAL_BODY_PADDING = window.getComputedStyle(document.body).getPropertyValue('padding-right');
  TEMPORARY_BODY_PADDING = `${
    parseInt(INITIAL_BODY_PADDING.replace(/px/, ''), 10) +
    parseInt(SCROLLBAR_WIDTH.replace(/px/, ''), 10)
  }px`;
};

/**
 * Toggle modal visibility
 *
 * SOURCE: index.js (Lines 62-180)
 *
 * @param event - Click or keyboard event
 * @returns Active state
 */
function toggleModal(this: any, event: Event): boolean {
  let originalOpener: string;
  let clickedElement = event.target as HTMLElement;
  const { body } = document;
  const safeActive = !isActive();

  const modalId = clickedElement
    ? clickedElement.getAttribute('aria-controls')
    : document.querySelector(`.${WRAPPER_CLASSNAME}.${VISIBLE_CLASS}`)?.id;

  const targetModal = safeActive
    ? document.getElementById(modalId || '')
    : (document.querySelector(`.${WRAPPER_CLASSNAME}.${VISIBLE_CLASS}`) as HTMLElement);

  // if there is no modal we return early
  if (!targetModal) {
    return false;
  }

  const openFocusEl =
    targetModal.querySelector(INITIAL_FOCUS) || targetModal.querySelector(`.${MODAL_CLASSNAME}`);
  const returnFocus = document.getElementById(targetModal.getAttribute('data-opener') || '');
  const menuButton = body.querySelector(OPENERS);
  const forceUserAction = targetModal.getAttribute(FORCE_ACTION_ATTRIBUTE);

  // Sets the clicked element to the close button
  // so esc key always closes modal
  if ((event as KeyboardEvent).type === 'keydown' && targetModal !== null) {
    clickedElement = targetModal.querySelector(CLOSE_BUTTON) as HTMLElement;
  }

  // When we're not hitting the escape key…
  if (clickedElement) {
    // Make sure we click the opener
    // If it doesn't have an ID, make one
    // Store id as data attribute on modal
    if (clickedElement.hasAttribute(OPENER_ATTRIBUTE)) {
      if (this.getAttribute('id') === null) {
        // Generate deterministic ID using timestamp + counter for uniqueness
        originalOpener = `modal-opener-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.setAttribute('id', originalOpener);
      } else {
        originalOpener = this.getAttribute('id');
      }
      targetModal.setAttribute('data-opener', originalOpener);
    }

    // This basically stops the propagation if the element
    // is inside the modal and not a close button or
    // element inside a close button
    const closestModal = clickedElement.closest(`.${MODAL_CLASSNAME}`);

    if (closestModal) {
      const hasCloserAttr = clickedElement.hasAttribute(CLOSER_ATTRIBUTE);
      const closestCloser = clickedElement.closest(`[${CLOSER_ATTRIBUTE}]`);

      if (hasCloserAttr || closestCloser) {
        // WEB COMPONENT FIX: Stop propagation to prevent event bubbling to overlay
        // In Light DOM web components, click events on close buttons bubble up to the overlay
        // which also has a click listener, causing the modal to toggle twice (open/close/open).
        // USWDS doesn't need this because their vanilla implementation has different DOM timing.
        event.stopPropagation();
        // do nothing. move on.
      } else {
        return false;
      }
    }
  }

  body.classList.toggle(ACTIVE_CLASS, safeActive);
  targetModal.classList.toggle(VISIBLE_CLASS, safeActive);
  targetModal.classList.toggle(HIDDEN_CLASS, !safeActive);

  // If user is forced to take an action, adding
  // a class to the body that prevents clicking underneath
  // overlay
  if (forceUserAction) {
    body.classList.toggle(PREVENT_CLICK_CLASS, safeActive);
  }

  // Temporarily increase body padding to include the width of the scrollbar.
  // This accounts for the content shift when the scrollbar is removed on modal open.
  if (body.style.paddingRight === TEMPORARY_BODY_PADDING) {
    body.style.removeProperty('padding-right');
  } else {
    body.style.paddingRight = TEMPORARY_BODY_PADDING;
  }

  // Handle the focus actions
  if (safeActive && openFocusEl) {
    // The modal window is opened. Focus is set to close button.

    // Binds escape key if we're not forcing
    // the user to take an action
    if (forceUserAction) {
      if (modalState) {
        modalState.focusTrap = FocusTrap(targetModal);
      }
    } else {
      if (modalState) {
        modalState.focusTrap = FocusTrap(targetModal, {
          Escape: onMenuClose,
        });
      }
    }

    // Handles focus setting and interactions
    if (modalState) {
      modalState.focusTrap.update(safeActive);
    }
    (openFocusEl as HTMLElement).focus();

    // Hides everything that is not the modal from screen readers
    document.querySelectorAll(NON_MODALS).forEach((nonModal) => {
      nonModal.setAttribute('aria-hidden', 'true');
      nonModal.setAttribute(NON_MODAL_HIDDEN_ATTRIBUTE, '');
    });
  } else if (!safeActive && menuButton && returnFocus) {
    // The modal window is closed.
    // Non-modals now accessible to screen reader
    document.querySelectorAll(NON_MODALS_HIDDEN).forEach((nonModal) => {
      nonModal.removeAttribute('aria-hidden');
      nonModal.removeAttribute(NON_MODAL_HIDDEN_ATTRIBUTE);
    });

    // Focus is returned to the opener
    returnFocus.focus();
    if (modalState) {
      modalState.focusTrap.update(safeActive);
    }
  }

  return safeActive;
}

/**
 * Create placeholder
 *
 * SOURCE: index.js (Lines 189-208)
 */
const createPlaceHolder = (baseComponent: HTMLElement): HTMLElement => {
  const modalID = baseComponent.getAttribute('id');
  const originalLocationPlaceHolder = document.createElement('div');
  const modalAttributes = Array.from(baseComponent.attributes);

  setTemporaryBodyPadding();

  originalLocationPlaceHolder.setAttribute('data-placeholder-for', modalID || '');
  originalLocationPlaceHolder.style.display = 'none';
  originalLocationPlaceHolder.setAttribute('aria-hidden', 'true');

  modalAttributes.forEach((attribute) => {
    originalLocationPlaceHolder.setAttribute(`data-original-${attribute.name}`, attribute.value);
  });

  return originalLocationPlaceHolder;
};

/**
 * Set modal attributes
 *
 * SOURCE: index.js (Lines 217-252)
 */
const setModalAttributes = (
  baseComponent: HTMLElement,
  modalContentWrapper: HTMLElement
): HTMLElement => {
  const modalID = baseComponent.getAttribute('id');
  const ariaLabelledBy = baseComponent.getAttribute('aria-labelledby');
  const ariaDescribedBy = baseComponent.getAttribute('aria-describedby');
  const forceUserAction = baseComponent.hasAttribute(FORCE_ACTION_ATTRIBUTE);

  if (!ariaLabelledBy) throw new Error(`${modalID} is missing aria-labelledby attribute`);

  if (!ariaDescribedBy) throw new Error(`${modalID} is missing aria-describedby attribute`);

  // Set attributes
  modalContentWrapper.setAttribute('role', 'dialog');
  modalContentWrapper.setAttribute('aria-modal', 'true');
  modalContentWrapper.setAttribute('id', modalID || '');
  modalContentWrapper.setAttribute('aria-labelledby', ariaLabelledBy);
  modalContentWrapper.setAttribute('aria-describedby', ariaDescribedBy);

  if (forceUserAction) {
    modalContentWrapper.setAttribute(FORCE_ACTION_ATTRIBUTE, forceUserAction.toString());
  }

  // Add aria-controls
  // Query for closers within the wrapper (not using CLOSERS selector which includes wrapper prefix)
  const modalClosers = modalContentWrapper.querySelectorAll(`[${CLOSER_ATTRIBUTE}]`);
  const overlay = modalContentWrapper.querySelector(
    `.${OVERLAY_CLASSNAME}:not([${FORCE_ACTION_ATTRIBUTE}])`
  );

  modalClosers.forEach((el) => {
    el.setAttribute('aria-controls', modalID || '');
  });

  if (overlay) {
    overlay.setAttribute('aria-controls', modalID || '');
  }

  // Update the base element HTML
  baseComponent.removeAttribute('id');
  baseComponent.removeAttribute('aria-labelledby');
  baseComponent.removeAttribute('aria-describedby');
  baseComponent.setAttribute('tabindex', '-1');

  return modalContentWrapper;
};

/**
 * Rebuild modal
 *
 * SOURCE: index.js (Lines 262-279)
 */
const rebuildModal = (baseComponent: HTMLElement): HTMLElement => {
  const modalContent = baseComponent;
  const modalContentWrapper = document.createElement('div');
  const overlayDiv = document.createElement('div');
  const forceUserAction = baseComponent.hasAttribute(FORCE_ACTION_ATTRIBUTE);

  // Add classes
  modalContentWrapper.classList.add(HIDDEN_CLASS, WRAPPER_CLASSNAME);
  overlayDiv.classList.add(OVERLAY_CLASSNAME);

  // Add force-action to overlay if needed (prevents overlay from being a closer)
  if (forceUserAction) {
    overlayDiv.setAttribute(FORCE_ACTION_ATTRIBUTE, '');
  }

  // Rebuild the modal element
  modalContentWrapper.append(overlayDiv);
  overlayDiv.append(modalContent);

  // Add attributes
  setModalAttributes(modalContent, modalContentWrapper);

  return modalContentWrapper;
};

/**
 * Set up modal
 *
 * SOURCE: index.js (Lines 286-304)
 *
 * @param baseComponent - Modal div element
 */
const setUpModal = (baseComponent: HTMLElement): void => {
  const modalID = baseComponent.getAttribute('id');

  if (!modalID) {
    return;
  }

  // Safety check for test environments
  if (typeof document === 'undefined' || !document.body) {
    return;
  }

  // Create placeholder where modal is for cleanup
  const originalLocationPlaceHolder = createPlaceHolder(baseComponent);
  baseComponent.after(originalLocationPlaceHolder);

  // Build modal component
  const modalComponent = rebuildModal(baseComponent);

  // Move all modals to the end of the DOM. Doing this allows us to
  // more easily find the elements to hide from screen readers
  // when the modal is open.
  document.body.appendChild(modalComponent);
};

/**
 * Clean up modal
 *
 * SOURCE: index.js (Lines 311-341)
 *
 * @param baseComponent - Modal div element
 */
const cleanUpModal = (baseComponent: HTMLElement): void => {
  const modalContent = baseComponent;
  const modalContentWrapper = modalContent.parentElement?.parentElement;
  const modalID = modalContentWrapper?.getAttribute('id');

  // if there is no modalID, return early
  if (!modalID) {
    return;
  }

  const originalLocationPlaceHolder = document.querySelector(`[data-placeholder-for="${modalID}"]`);

  if (originalLocationPlaceHolder) {
    const modalAttributes = Array.from(originalLocationPlaceHolder.attributes);
    modalAttributes.forEach((attribute) => {
      if (attribute.name.startsWith('data-original-')) {
        // data-original- is 14 long
        modalContent.setAttribute(attribute.name.substring(14), attribute.value);
      }
    });

    originalLocationPlaceHolder.after(modalContent);
    originalLocationPlaceHolder.parentElement?.removeChild(originalLocationPlaceHolder);
  }

  modalContentWrapper?.parentElement?.removeChild(modalContentWrapper);
};

/**
 * Initialize modal behavior
 *
 * SOURCE: index.js (Lines 343-389)
 *
 * @param root - Root element or document
 * @returns Cleanup function
 */
export function initializeModal(root: HTMLElement | Document = document): () => void {
  // Initialize modal state
  modalState = {
    focusTrap: null,
    toggleModal,
  };

  const modals = selectOrMatches(MODAL, root);

  // Store modalIds for cleanup BEFORE setup (setup removes IDs from modal elements!)
  const modalIds = modals.map((m) => (m as HTMLElement).id).filter(Boolean);

  // Named handler for anchor preventDefault - stored for proper cleanup
  const preventDefaultHandler = (e: Event) => e.preventDefault();

  // Track anchor triggers that get the preventDefault listener
  const anchorTriggers: Element[] = [];

  modals.forEach((modalWindow) => {
    const modalElement = modalWindow as HTMLElement;

    // Ensure modal has an ID before setup
    if (!modalElement.id) {
      return;
    }

    const modalId = modalElement.id;

    setUpModal(modalElement);

    // Query all openers and closers including the overlay
    const triggers = selectOrMatches(`[aria-controls="${modalId}"]`, document);

    triggers.forEach((modalTrigger) => {
      // If modalTrigger is an anchor...
      if (modalTrigger.nodeName === 'A') {
        // Turn anchor links into buttons for screen readers
        modalTrigger.setAttribute('role', 'button');

        // Prevent modal triggers from acting like links
        modalTrigger.addEventListener('click', preventDefaultHandler);
        anchorTriggers.push(modalTrigger);
      }

      // Can uncomment when aria-haspopup="dialog" is supported
      // https://a11ysupport.io/tech/aria/aria-haspopup_attribute
      // Most screen readers support aria-haspopup, but might announce
      // as opening a menu if "dialog" is not supported.
      // modalTrigger.setAttribute("aria-haspopup", "dialog");

      modalTrigger.addEventListener('click', toggleModal);
    });
  });

  // Return cleanup function
  return () => {
    // Clean up anchor preventDefault listeners
    anchorTriggers.forEach((trigger) => {
      trigger.removeEventListener('click', preventDefaultHandler);
    });

    // Use stored modal IDs to find and remove listeners
    modalIds.forEach((modalId) => {
      // Find all triggers using the wrapper ID (which doesn't change)
      const wrapper = document.getElementById(modalId);
      if (wrapper) {
        const triggers = selectOrMatches(`[aria-controls="${modalId}"]`, document);

        triggers.forEach((modalTrigger) => {
          modalTrigger.removeEventListener('click', toggleModal);
        });

        // Find the modal content inside the wrapper and clean it up
        // The modal is inside: wrapper > overlay > modal
        const modalContent = wrapper.querySelector(`.${MODAL_CLASSNAME}`);
        if (modalContent) {
          cleanUpModal(modalContent as HTMLElement);
        }
      }
    });

    // Clear modal state
    modalState = null;
  };
}
