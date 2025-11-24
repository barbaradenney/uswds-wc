/**
 * USWDS In-Page Navigation Behavior
 *
 * Mirrors official USWDS in-page navigation JavaScript behavior exactly
 *
 * @uswds-source https://github.com/uswds/uswds/blob/develop/packages/usa-in-page-navigation/src/index.js
 * @uswds-version 3.10.0
 * @last-synced 2025-10-05
 * @sync-status ✅ UP TO DATE
 *
 * CRITICAL: This file replicates USWDS source code to maintain 100% behavior parity.
 * DO NOT add custom logic. ALL changes must come from USWDS source updates.
 */

import { selectOrMatches } from '@uswds-wc/core';
import { Sanitizer } from '@uswds-wc/core';

/**
 * Constants from USWDS
 *
 * SOURCE: index.js (Lines 9-24)
 */
const PREFIX = 'usa';
const CURRENT_CLASS = `${PREFIX}-current`;
const IN_PAGE_NAV_HEADINGS = 'h2 h3';
const IN_PAGE_NAV_VALID_HEADINGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
const IN_PAGE_NAV_TITLE_TEXT = 'On this page';
const IN_PAGE_NAV_TITLE_HEADING_LEVEL = 'h4';
const IN_PAGE_NAV_SCROLL_OFFSET = 0;
const IN_PAGE_NAV_ROOT_MARGIN = '0px 0px 0px 0px';
const IN_PAGE_NAV_THRESHOLD = '1';
const IN_PAGE_NAV_MINIMUM_HEADING_COUNT = 2;
const IN_PAGE_NAV_CLASS = `${PREFIX}-in-page-nav`;
const IN_PAGE_NAV_ANCHOR_CLASS = `${PREFIX}-anchor`;
const IN_PAGE_NAV_NAV_CLASS = `${IN_PAGE_NAV_CLASS}__nav`;
const IN_PAGE_NAV_LIST_CLASS = `${IN_PAGE_NAV_CLASS}__list`;
const IN_PAGE_NAV_ITEM_CLASS = `${IN_PAGE_NAV_CLASS}__item`;
const IN_PAGE_NAV_PRIMARY_ITEM_CLASS = `${IN_PAGE_NAV_ITEM_CLASS}--primary`;
const IN_PAGE_NAV_LINK_CLASS = `${IN_PAGE_NAV_CLASS}__link`;
const IN_PAGE_NAV_TITLE_CLASS = `${IN_PAGE_NAV_CLASS}__heading`;
const MAIN_ELEMENT = 'main';

/**
 * Set the active link state for the currently observed section
 *
 * SOURCE: index.js (Lines 26-38)
 * MODIFICATION: Uses configured threshold instead of hardcoded >= 1
 *
 * @param el - IntersectionObserver entries
 * @param threshold - Configured threshold value
 */
const setActive = (el: IntersectionObserverEntry[], threshold: number): void => {
  const allLinks = document.querySelectorAll(`.${IN_PAGE_NAV_LINK_CLASS}`);
  el.map((i) => {
    if (i.isIntersecting === true && i.intersectionRatio >= threshold) {
      allLinks.forEach((link) => link.classList.remove(CURRENT_CLASS));
      const activeLink = document.querySelector(`a[href="#${i.target.id}"]`);
      if (activeLink) {
        activeLink.classList.add(CURRENT_CLASS);
      }
      return true;
    }
    return false;
  });
};

/**
 * Return an array of the designated heading types found in the designated content region.
 * Throw an error if an invalid header element is designated.
 *
 * SOURCE: index.js (Lines 40-66)
 *
 * @param selectedContentRegion - The content region selector
 * @param selectedHeadingTypes - The heading types to include
 * @returns Array of heading elements
 */
const createSectionHeadingsArray = (
  selectedContentRegion: string,
  selectedHeadingTypes: string
): HTMLElement[] => {
  // Guard against missing document (test environment)
  if (typeof document === 'undefined') {
    return [];
  }

  // Convert designated headings list to an array
  const selectedHeadingTypesArray = selectedHeadingTypes.indexOf(' ')
    ? selectedHeadingTypes.split(' ')
    : [selectedHeadingTypes];
  const contentRegion = document.querySelector(selectedContentRegion);

  if (!contentRegion) {
    return [];
  }

  selectedHeadingTypesArray.forEach((headingType) => {
    if (!IN_PAGE_NAV_VALID_HEADINGS.includes(headingType)) {
      throw new Error(
        `In-page navigation: data-heading-elements attribute defined with an invalid heading type: "${headingType}".
        Define the attribute with one or more of the following: "${IN_PAGE_NAV_VALID_HEADINGS}".
        Do not use commas or other punctuation in the attribute definition.`
      );
    }
  });

  const sectionHeadingsArray = Array.from(
    contentRegion.querySelectorAll(selectedHeadingTypesArray.join(','))
  ) as HTMLElement[];

  return sectionHeadingsArray;
};

/**
 * Return an array of the visible headings from sectionHeadingsArray.
 * This function removes headings that are hidden with display:none or visibility:none style rules.
 * These items will be added to the component nav list.
 *
 * SOURCE: index.js (Lines 68-91)
 *
 * @param selectedContentRegion - The content region selector
 * @param selectedHeadingTypes - The heading types to include
 * @returns Array of visible heading elements
 */
const getVisibleSectionHeadings = (
  selectedContentRegion: string,
  selectedHeadingTypes: string
): HTMLElement[] => {
  const sectionHeadings = createSectionHeadingsArray(selectedContentRegion, selectedHeadingTypes);

  // Find all headings with hidden styling and remove them from the array
  const visibleSectionHeadings = sectionHeadings.filter((heading) => {
    const headingStyle = window.getComputedStyle(heading);
    const visibleHeading =
      headingStyle.getPropertyValue('display') !== 'none' &&
      headingStyle.getPropertyValue('visibility') !== 'hidden';

    return visibleHeading;
  });

  return visibleSectionHeadings;
};

/**
 * Return the highest-level header tag included in the link list
 *
 * SOURCE: index.js (Lines 93-102)
 *
 * @param sectionHeadings - The array of headings
 * @returns Tag name of the top-level heading
 */
const getTopLevelHeading = (sectionHeadings: HTMLElement[]): string => {
  const topHeading = sectionHeadings[0].tagName.toLowerCase();
  return topHeading;
};

/**
 * Return a node list of section anchor tags
 *
 * SOURCE: index.js (Lines 104-111)
 *
 * @returns Array of anchor elements
 */
const getSectionAnchors = (): NodeListOf<Element> => {
  const sectionAnchors = document.querySelectorAll(`.${IN_PAGE_NAV_ANCHOR_CLASS}`);
  return sectionAnchors;
};

/**
 * Generates a unique ID for the given heading element.
 *
 * SOURCE: index.js (Lines 113-139)
 *
 * @param heading - Heading element
 * @returns Unique ID string
 */
const getHeadingId = (heading: HTMLElement): string => {
  const baseId = (heading.textContent || '')
    .toLowerCase()
    // Replace non-alphanumeric characters with dashes
    .replace(/[^a-z\d]/g, '-')
    // Replace a sequence of two or more dashes with a single dash
    .replace(/-{2,}/g, '-')
    // Trim leading or trailing dash (there should only ever be one)
    .replace(/^-|-$/g, '');

  let id: string;
  let suffix = 0;
  do {
    id = baseId;

    // To avoid conflicts with existing IDs on the page, loop and append an
    // incremented suffix until a unique ID is found.
    suffix += 1;
    if (suffix > 1) {
      id += `-${suffix}`;
    }
  } while (document.getElementById(id));

  return id;
};

/**
 * Return a section id/anchor hash without the number sign
 *
 * SOURCE: index.js (Lines 141-152)
 *
 * @param value - Event or element
 * @returns ID string without hash
 */
const getSectionId = (value: Event | HTMLElement): string => {
  let id: string;

  // Check if value is an event or element and get the cleaned up id
  if (value && (value as HTMLElement).nodeType === 1) {
    id = (value as HTMLElement).getAttribute('href')?.replace('#', '') || '';
  } else {
    id = (value as Event & { target: { hash: string } }).target.hash.replace('#', '');
  }

  return id;
};

/**
 * Calculates the total offset of an element from the top of the page.
 *
 * SOURCE: index.js (Lines 154-165)
 *
 * @param el - Heading element
 * @returns Total offset from top
 */
const getTotalElementOffset = (el: HTMLElement): number => {
  const calculateOffset = (currentEl: HTMLElement): number => {
    if (!currentEl.offsetParent) {
      return currentEl.offsetTop;
    }

    return currentEl.offsetTop + calculateOffset(currentEl.offsetParent as HTMLElement);
  };

  return calculateOffset(el);
};

/**
 * Scroll smoothly to a section based on the passed in element
 *
 * SOURCE: index.js (Lines 167-180)
 *
 * @param el - Heading element to scroll to
 */
const handleScrollToSection = (el: HTMLElement): void => {
  const inPageNavEl = document.querySelector(`.${IN_PAGE_NAV_CLASS}`) as HTMLElement;
  const inPageNavScrollOffset =
    inPageNavEl?.dataset.scrollOffset || String(IN_PAGE_NAV_SCROLL_OFFSET);

  const offsetTop = getTotalElementOffset(el);

  window.scroll({
    behavior: 'smooth',
    top: offsetTop - Number(inPageNavScrollOffset),
  });

  if (window.location.hash.slice(1) !== el.id) {
    window.history.pushState(null, '', `#${el.id}`);
  }
};

/**
 * Scrolls the page to the section corresponding to the current hash fragment, if one exists.
 *
 * SOURCE: index.js (Lines 182-191)
 */
const scrollToCurrentSection = (): void => {
  // Guard against undefined window in test teardown (prevents "window is not defined" in CI)
  if (typeof window === 'undefined' || !window.location || !window.location.hash) {
    return;
  }
  const hashFragment = window.location.hash.slice(1);
  if (hashFragment) {
    const anchorTag = document.getElementById(hashFragment);
    if (anchorTag) {
      handleScrollToSection(anchorTag);
    }
  }
};

/**
 * Check if the number of specified headings meets the minimum required count.
 *
 * SOURCE: index.js (Lines 193-207)
 *
 * @param sectionHeadings - Array of section headings
 * @param minimumHeadingCount - Minimum number required
 * @param acceptedHeadingLevels - Valid heading levels
 * @returns True if minimum is met
 */
const shouldRenderInPageNav = (
  sectionHeadings: HTMLElement[],
  minimumHeadingCount: number,
  acceptedHeadingLevels: string[]
): boolean => {
  // Filter headings that are included in the acceptedHeadingLevels
  const validHeadings = sectionHeadings.filter((heading) =>
    acceptedHeadingLevels.includes(heading.tagName.toLowerCase())
  );
  return validHeadings.length >= minimumHeadingCount;
};

/**
 * Create the in-page navigation component
 *
 * SOURCE: index.js (Lines 209-321)
 *
 * @param inPageNavEl - In-page nav element
 */
const createInPageNav = (inPageNavEl: HTMLElement): void => {
  const inPageNavTitleText = Sanitizer.escapeHTML`${
    inPageNavEl.dataset.titleText || IN_PAGE_NAV_TITLE_TEXT
  }`;
  const inPageNavTitleHeadingLevel = Sanitizer.escapeHTML`${
    inPageNavEl.dataset.titleHeadingLevel || IN_PAGE_NAV_TITLE_HEADING_LEVEL
  }`;
  const inPageNavRootMargin = Sanitizer.escapeHTML`${
    inPageNavEl.dataset.rootMargin || IN_PAGE_NAV_ROOT_MARGIN
  }`;
  const inPageNavThreshold = Sanitizer.escapeHTML`${
    inPageNavEl.dataset.threshold || IN_PAGE_NAV_THRESHOLD
  }`;
  const inPageNavContentSelector = Sanitizer.escapeHTML`${
    inPageNavEl.dataset.mainContentSelector || MAIN_ELEMENT
  }`;
  const inPageNavHeadingSelector = Sanitizer.escapeHTML`${
    inPageNavEl.dataset.headingElements || IN_PAGE_NAV_HEADINGS
  }`;

  const inPageNavMinimumHeadingCount = Number(
    Sanitizer.escapeHTML`${
      inPageNavEl.dataset.minimumHeadingCount || IN_PAGE_NAV_MINIMUM_HEADING_COUNT
    }`
  );

  const acceptedHeadingLevels = inPageNavHeadingSelector.split(' ').map((h) => h.toLowerCase());

  const sectionHeadings = getVisibleSectionHeadings(
    inPageNavContentSelector,
    inPageNavHeadingSelector
  );

  if (
    !shouldRenderInPageNav(sectionHeadings, inPageNavMinimumHeadingCount, acceptedHeadingLevels)
  ) {
    return;
  }

  const options: IntersectionObserverInit = {
    root: null,
    rootMargin: inPageNavRootMargin,
    threshold: [Number(inPageNavThreshold)],
  };

  const inPageNav = document.createElement('nav');
  inPageNav.setAttribute('aria-label', inPageNavTitleText);
  inPageNav.classList.add(IN_PAGE_NAV_NAV_CLASS);

  const inPageNavTitle = document.createElement(inPageNavTitleHeadingLevel);
  inPageNavTitle.classList.add(IN_PAGE_NAV_TITLE_CLASS);
  inPageNavTitle.setAttribute('tabindex', '0');
  inPageNavTitle.textContent = inPageNavTitleText;
  inPageNav.appendChild(inPageNavTitle);

  const inPageNavList = document.createElement('ul');
  inPageNavList.classList.add(IN_PAGE_NAV_LIST_CLASS);
  inPageNav.appendChild(inPageNavList);

  sectionHeadings.forEach((el) => {
    const listItem = document.createElement('li');
    const navLinks = document.createElement('a');
    const anchorTag = document.createElement('a');
    const textContentOfLink = el.textContent || '';
    const tag = el.tagName.toLowerCase();
    const topHeadingLevel = getTopLevelHeading(sectionHeadings);
    const headingId = getHeadingId(el);

    listItem.classList.add(IN_PAGE_NAV_ITEM_CLASS);

    if (tag === topHeadingLevel) {
      listItem.classList.add(IN_PAGE_NAV_PRIMARY_ITEM_CLASS);
    }

    navLinks.setAttribute('href', `#${headingId}`);
    navLinks.setAttribute('class', IN_PAGE_NAV_LINK_CLASS);
    navLinks.textContent = textContentOfLink;

    anchorTag.setAttribute('id', headingId);
    anchorTag.setAttribute('class', IN_PAGE_NAV_ANCHOR_CLASS);
    el.insertAdjacentElement('afterbegin', anchorTag);

    inPageNavList.appendChild(listItem);
    listItem.appendChild(navLinks);
  });

  inPageNavEl.appendChild(inPageNav);

  const anchorTags = getSectionAnchors();
  const thresholdValue = Number(inPageNavThreshold);
  const observeSections = new window.IntersectionObserver(
    (entries) => setActive(entries, thresholdValue),
    options
  );

  anchorTags.forEach((tag) => {
    observeSections.observe(tag);
  });
};

/**
 * Handle click from link
 *
 * SOURCE: index.js (Lines 323-328)
 *
 * @param el - Link element
 */
const handleClickFromLink = (el: HTMLAnchorElement): void => {
  const elementToScrollTo = document.getElementById(el.hash.slice(1));
  if (elementToScrollTo) {
    handleScrollToSection(elementToScrollTo);
  }
};

/**
 * Handle the enter event from a link within the in-page nav component
 *
 * SOURCE: index.js (Lines 330-348)
 *
 * @param event - Keyboard event
 */
const handleEnterFromLink = (event: Event): void => {
  const id = getSectionId(event);
  const targetAnchor = document.getElementById(id);
  if (!targetAnchor) return;

  const target = targetAnchor.parentElement;

  if (target) {
    target.setAttribute('tabindex', '0');
    target.focus();
    target.addEventListener(
      'blur',
      () => {
        target.setAttribute('tabindex', '-1');
      },
      { once: true }
    );
  }
  handleScrollToSection(targetAnchor);
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
 * Initialize in-page navigation behavior
 *
 * SOURCE: index.js (Lines 350-370)
 *
 * @param root - Root element or document
 * @returns Cleanup function
 */
export function initializeInPageNavigation(root: HTMLElement | Document = document): () => void {
  // Guard against undefined document in test teardown (prevents "document is not defined" in CI)
  if (typeof document === 'undefined') {
    return () => {}; // Return noop cleanup function
  }

  const inPageNavElements = selectOrMatches(`.${IN_PAGE_NAV_CLASS}`, root);

  inPageNavElements.forEach((inPageNavEl) => {
    createInPageNav(inPageNavEl as HTMLElement);
    scrollToCurrentSection();
  });

  // Event delegation for clicks
  const handleClick = (event: Event) => {
    const target = event.target as HTMLElement;
    const link = target.closest(`.${IN_PAGE_NAV_LINK_CLASS}`);

    if (link) {
      event.preventDefault();
      if (!(link as HTMLAnchorElement).hasAttribute('disabled')) {
        handleClickFromLink(link as HTMLAnchorElement);
      }
    }
  };

  // Event delegation for keydown
  const handleKeydown = (event: Event) => {
    const target = event.target as HTMLElement;
    const link = target.closest(`.${IN_PAGE_NAV_LINK_CLASS}`);

    if (link) {
      const handler = keymap({ Enter: handleEnterFromLink });
      handler.call(link as HTMLElement, event as KeyboardEvent);
    }
  };

  // Add event listeners
  const rootEl = root === document ? document.body : (root as HTMLElement);
  rootEl.addEventListener('click', handleClick);
  rootEl.addEventListener('keydown', handleKeydown);

  return () => {
    rootEl.removeEventListener('click', handleClick);
    rootEl.removeEventListener('keydown', handleKeydown);
  };
}

// Export utilities for potential reuse
export { handleScrollToSection, scrollToCurrentSection, createInPageNav };
