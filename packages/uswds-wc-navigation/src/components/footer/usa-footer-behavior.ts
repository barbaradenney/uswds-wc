/**
 * USWDS Footer Behavior
 *
 * Mirrors official USWDS footer JavaScript behavior exactly
 *
 * @uswds-source https://github.com/uswds/uswds/blob/develop/packages/usa-footer/src/index.js
 * @uswds-version 3.10.0
 * @last-synced 2025-10-05
 * @sync-status ✅ UP TO DATE
 *
 * CRITICAL: This file replicates USWDS source code to maintain 100% behavior parity.
 * DO NOT add custom logic. ALL changes must come from USWDS source updates.
 */

/**
 * Constants from USWDS
 *
 * SOURCE: index.js (Lines 5-8)
 */
const PREFIX = 'usa';
const SCOPE = `.${PREFIX}-footer--big`;
const NAV = `${SCOPE} nav`;
const BUTTON = `${NAV} .${PREFIX}-footer__primary-link`;
const HIDE_MAX_WIDTH = 480;

/**
 * Expands selected footer menu panel, while collapsing others
 *
 * SOURCE: index.js (Lines 10-23)
 */
function showPanel(this: HTMLElement): void {
  if (window.innerWidth < HIDE_MAX_WIDTH) {
    const isOpen = this.getAttribute('aria-expanded') === 'true';
    const thisFooter = this.closest(SCOPE);

    if (!thisFooter) return;

    // Close all other menus
    thisFooter.querySelectorAll(BUTTON).forEach((button) => {
      button.setAttribute('aria-expanded', 'false');
    });

    this.setAttribute('aria-expanded', String(!isOpen));
  }
}

/**
 * Swaps the <h4> element for a <button> element (and vice-versa) and sets id
 * of menu list
 *
 * SOURCE: index.js (Lines 25-69)
 *
 * @param isMobile - If the footer is in mobile configuration
 */
function toggleHtmlTag(isMobile: boolean): void {
  const bigFooter = document.querySelector(SCOPE);

  if (!bigFooter) {
    return;
  }

  const primaryLinks = bigFooter.querySelectorAll(BUTTON);

  primaryLinks.forEach((currentElement) => {
    const currentElementClasses = currentElement.getAttribute('class');
    const preservedHtmlTag = currentElement.getAttribute('data-tag') || currentElement.tagName;

    const newElementType = isMobile ? 'button' : preservedHtmlTag;

    // Create the new element
    const newElement = document.createElement(newElementType);
    newElement.setAttribute('class', currentElementClasses || '');
    newElement.classList.toggle(`${PREFIX}-footer__primary-link--button`, isMobile);
    newElement.textContent = currentElement.textContent;

    if (isMobile) {
      newElement.setAttribute('data-tag', currentElement.tagName);
      const menuId = `${PREFIX}-footer-menu-list-${Math.floor(Math.random() * 100000)}`;

      newElement.setAttribute('aria-controls', menuId);
      newElement.setAttribute('aria-expanded', 'false');
      const nextElement = currentElement.nextElementSibling;
      if (nextElement) {
        nextElement.setAttribute('id', menuId);
      }
      newElement.setAttribute('type', 'button');
    }

    // Insert the new element and delete the old
    currentElement.after(newElement);
    currentElement.remove();
  });
}

/**
 * Resize handler
 *
 * SOURCE: index.js (Lines 71-73)
 *
 * @param event - MediaQueryList event
 */
const resize = (event: MediaQueryListEvent): void => {
  toggleHtmlTag(event.matches);
};

/**
 * Initialize footer behavior
 *
 * SOURCE: index.js (Lines 75-95)
 *
 * @param root - Root element or document
 * @returns Cleanup function
 */
export function initializeFooter(root: HTMLElement | Document = document): () => void {
  // Guard against undefined window in test teardown (prevents "window is not defined" in CI)
  if (typeof window === 'undefined') {
    return () => {}; // Return noop cleanup function
  }

  // Initialize HTML tag based on window width
  toggleHtmlTag(window.innerWidth < HIDE_MAX_WIDTH);

  // Set up media query listener (skip if window.matchMedia not available in test environment)
  const mediaQueryList =
    window.matchMedia && window.matchMedia(`(max-width: ${HIDE_MAX_WIDTH - 0.1}px)`);

  // Define removeListener for cleanup (noop if mediaQueryList not available)
  let removeListener: ((handler: (event: MediaQueryListEvent) => void) => void) | null = null;

  if (mediaQueryList) {
    // Use the modern API if available, fallback to deprecated addListener
    const addListener = mediaQueryList.addEventListener
      ? (handler: (event: MediaQueryListEvent) => void) =>
          mediaQueryList.addEventListener('change', handler)
      : (handler: (event: MediaQueryListEvent) => void) =>
          (mediaQueryList as any).addListener(handler);

    removeListener = mediaQueryList.removeEventListener
      ? (handler: (event: MediaQueryListEvent) => void) =>
          mediaQueryList.removeEventListener('change', handler)
      : (handler: (event: MediaQueryListEvent) => void) =>
          (mediaQueryList as any).removeListener(handler);

    addListener(resize);
  }

  // Event delegation for button clicks
  const handleClick = (event: Event) => {
    const target = event.target as HTMLElement;
    const button = target.closest(BUTTON);

    if (button) {
      showPanel.call(button as HTMLElement);
    }
  };

  // Add event listener
  const rootEl = root === document ? document.body : (root as HTMLElement);
  rootEl.addEventListener('click', handleClick);

  return () => {
    if (removeListener) {
      removeListener(resize);
    }
    rootEl.removeEventListener('click', handleClick);
  };
}

// Export utilities for potential reuse
export { HIDE_MAX_WIDTH, toggleHtmlTag, showPanel };
