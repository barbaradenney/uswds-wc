import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import './usa-breadcrumb.ts';
import type { USABreadcrumb, BreadcrumbItem } from './usa-breadcrumb.js';
import {
  waitForUpdate,
  testPropertyChanges,
  validateComponentJavaScript,
} from '@uswds-wc/test-utils/test-utils.js';
import {
  testComponentAccessibility,
  USWDS_A11Y_CONFIG,
} from '@uswds-wc/test-utils/accessibility-utils.js';
import {
  testKeyboardNavigation,
  verifyKeyboardOnlyUsable,
  getFocusableElements,
} from '@uswds-wc/test-utils/keyboard-navigation-utils.js';
import { waitForPropertyPropagation } from '@uswds-wc/test-utils';

describe('USABreadcrumb', () => {
  let element: USABreadcrumb;

  beforeEach(() => {
    element = document.createElement('usa-breadcrumb') as USABreadcrumb;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('Basic Functionality', () => {
    it('should create and render correctly', async () => {
      await waitForUpdate(element);

      expect(element).toBeTruthy();
      expect(element.tagName).toBe('USA-BREADCRUMB');
    });

    it('should have default properties', () => {
      expect(element.items).toEqual([]);
      expect(element.wrap).toBe(false);
    });
  });

  describe('Properties', () => {
    it('should handle items changes', async () => {
      const items: BreadcrumbItem[] = [
        { label: 'Home', href: '/' },
        { label: 'Section', href: '/section' },
        { label: 'Current Page', current: true },
      ];

      element.items = items;
      await waitForPropertyPropagation(element);

      const listItems = element.querySelectorAll('.usa-breadcrumb__list-item');
      expect(listItems.length).toBe(3);

      const links = element.querySelectorAll('.usa-breadcrumb__link');
      expect(links.length).toBe(2); // Only non-current items have links

      const currentItem = element.querySelector('.usa-current');
      expect(currentItem).toBeTruthy();
      expect(currentItem?.textContent?.trim()).toBe('Current Page');
    });

    it('should handle wrap property changes', async () => {
      await testPropertyChanges(element, 'wrap', [true, false], async (el, value) => {
        expect(el.wrap).toBe(value);
        const nav = el.querySelector('.usa-breadcrumb');
        if (value) {
          expect(nav?.classList.contains('usa-breadcrumb--wrap')).toBe(true);
        } else {
          expect(nav?.classList.contains('usa-breadcrumb--wrap')).toBe(false);
        }
      });
    });
  });

  describe('Rendering', () => {
    it('should render breadcrumb with correct structure', async () => {
      element.items = [
        { label: 'Home', href: '/' },
        { label: 'Current', current: true },
      ];
      await waitForPropertyPropagation(element);

      const nav = element.querySelector('nav.usa-breadcrumb');
      const list = element.querySelector('.usa-breadcrumb__list');
      const listItems = element.querySelectorAll('.usa-breadcrumb__list-item');

      expect(nav).toBeTruthy();
      expect(nav?.getAttribute('aria-label')).toBe('Breadcrumbs');
      expect(list).toBeTruthy();
      expect(list?.tagName).toBe('OL');
      expect(listItems.length).toBe(2);
    });

    it('should render non-current items as links', async () => {
      element.items = [
        { label: 'Home', href: '/' },
        { label: 'Section', href: '/section' },
        { label: 'Current Page' },
      ];
      await waitForPropertyPropagation(element);

      const links = element.querySelectorAll('.usa-breadcrumb__link');
      expect(links.length).toBe(2);

      const homeLink = links[0] as HTMLAnchorElement;
      const sectionLink = links[1] as HTMLAnchorElement;

      expect(homeLink.href).toContain('/');
      expect(homeLink.textContent?.trim()).toBe('Home');
      expect(sectionLink.href).toContain('/section');
      expect(sectionLink.textContent?.trim()).toBe('Section');
    });

    it('should render current item without link', async () => {
      element.items = [
        { label: 'Home', href: '/' },
        { label: 'Current Page', current: true },
      ];
      await waitForPropertyPropagation(element);

      const currentItem = element.querySelector('.usa-current');
      const currentSpan = currentItem?.querySelector('span');

      expect(currentItem).toBeTruthy();
      expect(currentItem?.classList.contains('usa-breadcrumb__list-item')).toBe(true);
      expect(currentSpan?.getAttribute('aria-current')).toBe('page');
      expect(currentSpan?.textContent?.trim()).toBe('Current Page');
    });

    it('should treat last item as current when no current flag is set', async () => {
      element.items = [
        { label: 'Home', href: '/' },
        { label: 'Section', href: '/section' },
        { label: 'Last Item' }, // No current flag, but should be treated as current
      ];
      await waitForPropertyPropagation(element);

      const listItems = element.querySelectorAll('.usa-breadcrumb__list-item');
      const currentItems = element.querySelectorAll('.usa-current');
      const links = element.querySelectorAll('.usa-breadcrumb__link');

      expect(listItems.length).toBe(3);
      expect(currentItems.length).toBe(1);
      expect(links.length).toBe(2); // Home and Section only

      const lastItem = listItems[2];
      expect(lastItem.classList.contains('usa-current')).toBe(true);
      expect(lastItem.textContent?.trim()).toBe('Last Item');
    });

    it('should render with wrap class when wrap is true', async () => {
      element.wrap = true;
      element.items = [{ label: 'Home', href: '/' }, { label: 'Current' }];
      await waitForPropertyPropagation(element);

      const nav = element.querySelector('.usa-breadcrumb');
      expect(nav?.classList.contains('usa-breadcrumb--wrap')).toBe(true);
    });

    it('should not render wrap class when wrap is false', async () => {
      element.wrap = false;
      element.items = [{ label: 'Home', href: '/' }, { label: 'Current' }];
      await waitForPropertyPropagation(element);

      const nav = element.querySelector('.usa-breadcrumb');
      expect(nav?.classList.contains('usa-breadcrumb--wrap')).toBe(false);
    });
  });

  describe('Responsive Wrapping Behavior', () => {
    const longBreadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Company', href: '/company' },
      { label: 'Technology and Innovation', href: '/company/technology' },
      { label: 'Development Team', href: '/company/technology/development' },
      { label: 'Web Services Division', href: '/company/technology/development/web' },
      { label: 'Current Documentation', current: true },
    ];

    it('should apply usa-breadcrumb--wrap class when wrap=true', async () => {
      element.items = longBreadcrumbs;
      element.wrap = true;
      await waitForPropertyPropagation(element);

      const nav = element.querySelector('.usa-breadcrumb');
      expect(nav?.classList.contains('usa-breadcrumb--wrap')).toBe(true);
    });

    it('should not apply wrap class when wrap=false', async () => {
      element.items = longBreadcrumbs;
      element.wrap = false;
      await waitForPropertyPropagation(element);

      const nav = element.querySelector('.usa-breadcrumb');
      expect(nav?.classList.contains('usa-breadcrumb--wrap')).toBe(false);
    });

    it('should render all breadcrumb items regardless of wrap setting', async () => {
      element.items = longBreadcrumbs;

      // Test with wrap=false
      element.wrap = false;
      await waitForPropertyPropagation(element);
      let listItems = element.querySelectorAll('.usa-breadcrumb__list-item');
      expect(listItems.length).toBe(longBreadcrumbs.length);

      // Test with wrap=true
      element.wrap = true;
      await waitForPropertyPropagation(element);
      listItems = element.querySelectorAll('.usa-breadcrumb__list-item');
      expect(listItems.length).toBe(longBreadcrumbs.length);
    });

    it('should maintain proper list-item structure for wrapping', async () => {
      element.items = longBreadcrumbs;
      element.wrap = true;
      await waitForPropertyPropagation(element);

      const listItems = element.querySelectorAll('.usa-breadcrumb__list-item');

      // Each list item should be properly structured
      listItems.forEach((item, index) => {
        expect(item.classList.contains('usa-breadcrumb__list-item')).toBe(true);

        // Check if it's the current item
        if (index === longBreadcrumbs.length - 1) {
          expect(item.classList.contains('usa-current')).toBe(true);
          const ariaCurrent = item.querySelector('[aria-current="page"]');
          expect(ariaCurrent).toBeTruthy();
        } else {
          // Non-current items should have links
          const link = item.querySelector('.usa-breadcrumb__link');
          expect(link).toBeTruthy();
        }
      });
    });

    it('should preserve CSS classes when toggling wrap property', async () => {
      element.items = longBreadcrumbs;

      // Start with wrap=false
      element.wrap = false;
      await waitForPropertyPropagation(element);
      let nav = element.querySelector('.usa-breadcrumb');
      expect(nav?.classList.contains('usa-breadcrumb')).toBe(true);
      expect(nav?.classList.contains('usa-breadcrumb--wrap')).toBe(false);

      // Toggle to wrap=true
      element.wrap = true;
      await waitForPropertyPropagation(element);
      nav = element.querySelector('.usa-breadcrumb');
      expect(nav?.classList.contains('usa-breadcrumb')).toBe(true);
      expect(nav?.classList.contains('usa-breadcrumb--wrap')).toBe(true);

      // Toggle back to wrap=false
      element.wrap = false;
      await waitForPropertyPropagation(element);
      nav = element.querySelector('.usa-breadcrumb');
      expect(nav?.classList.contains('usa-breadcrumb')).toBe(true);
      expect(nav?.classList.contains('usa-breadcrumb--wrap')).toBe(false);
    });

    it('should handle empty items array with wrap setting', async () => {
      element.items = [];
      element.wrap = true;
      await waitForPropertyPropagation(element);

      const nav = element.querySelector('.usa-breadcrumb');
      expect(nav?.classList.contains('usa-breadcrumb--wrap')).toBe(true);

      const listItems = element.querySelectorAll('.usa-breadcrumb__list-item');
      expect(listItems.length).toBe(0);
    });

    it('should handle single item with wrap setting', async () => {
      element.items = [{ label: 'Single Page', current: true }];
      element.wrap = true;
      await waitForPropertyPropagation(element);

      const nav = element.querySelector('.usa-breadcrumb');
      expect(nav?.classList.contains('usa-breadcrumb--wrap')).toBe(true);

      const listItems = element.querySelectorAll('.usa-breadcrumb__list-item');
      expect(listItems.length).toBe(1);
      expect(listItems[0].classList.contains('usa-current')).toBe(true);
    });

    it('should validate CSS structure matches USWDS wrapping expectations', async () => {
      element.items = longBreadcrumbs;
      element.wrap = true;
      await waitForUpdate(element);

      // Verify the correct DOM structure for USWDS wrapping
      const nav = element.querySelector('nav.usa-breadcrumb.usa-breadcrumb--wrap');
      expect(nav).toBeTruthy();

      const list = nav?.querySelector('ol.usa-breadcrumb__list');
      expect(list).toBeTruthy();

      const listItems = list?.querySelectorAll('li.usa-breadcrumb__list-item');
      expect(listItems?.length).toBe(longBreadcrumbs.length);

      // Each list item should exist and be properly structured
      listItems?.forEach((item, index) => {
        expect(item.tagName).toBe('LI');
        expect(item.classList.contains('usa-breadcrumb__list-item')).toBe(true);

        if (longBreadcrumbs[index].current) {
          expect(item.classList.contains('usa-current')).toBe(true);
        }
      });
    });

    it('should maintain component stability during rapid wrap changes', async () => {
      element.items = longBreadcrumbs;

      // Rapidly toggle wrap setting
      const toggleStates = [false, true, false, true, false, true];

      for (const wrapState of toggleStates) {
        element.wrap = wrapState;
        await waitForUpdate(element);

        // Verify component remains stable
        expect(element.isConnected).toBe(true);
        const nav = element.querySelector('.usa-breadcrumb');
        expect(nav).toBeTruthy();

        if (wrapState) {
          expect(nav?.classList.contains('usa-breadcrumb--wrap')).toBe(true);
        } else {
          expect(nav?.classList.contains('usa-breadcrumb--wrap')).toBe(false);
        }

        // All items should still be rendered
        const listItems = element.querySelectorAll('.usa-breadcrumb__list-item');
        expect(listItems.length).toBe(longBreadcrumbs.length);
      }
    });

    it('should handle wrapping behavior regression testing', async () => {
      // This test validates the specific issue that was reported:
      // "The breadcrumb is supposed to have a wrapping options where the breadcrumbs go to a second line"

      element.items = longBreadcrumbs;

      // First, verify wrap=false does NOT have wrap class
      element.wrap = false;
      await waitForPropertyPropagation(element);
      let nav = element.querySelector('.usa-breadcrumb');
      expect(nav?.classList.contains('usa-breadcrumb--wrap')).toBe(false);
      expect(nav?.classList.contains('usa-breadcrumb')).toBe(true);

      // Then verify wrap=true DOES have wrap class
      element.wrap = true;
      await waitForPropertyPropagation(element);
      nav = element.querySelector('.usa-breadcrumb');
      expect(nav?.classList.contains('usa-breadcrumb--wrap')).toBe(true);
      expect(nav?.classList.contains('usa-breadcrumb')).toBe(true);

      // Verify all breadcrumb items are present (not showing condensed mobile view)
      const allItems = element.querySelectorAll('.usa-breadcrumb__list-item');
      expect(allItems.length).toBe(longBreadcrumbs.length);

      // Verify each item is visible and structured correctly
      allItems.forEach((item, index) => {
        const breadcrumbItem = longBreadcrumbs[index];
        expect(item.textContent?.includes(breadcrumbItem.label)).toBe(true);

        if (breadcrumbItem.current) {
          expect(item.classList.contains('usa-current')).toBe(true);
        } else {
          const link = item.querySelector('.usa-breadcrumb__link');
          expect(link).toBeTruthy();
          expect(link?.getAttribute('href')).toBe(breadcrumbItem.href);
        }
      });
    });
  });

  describe('Item Click Events', () => {
    it('should dispatch breadcrumb-click event for non-current items', async () => {
      let eventDetail: any = null;

      element.addEventListener('breadcrumb-click', (e: any) => {
        eventDetail = e.detail;
      });

      element.items = [
        { label: 'Home', href: '/' },
        { label: 'Current', current: true },
      ];
      await waitForPropertyPropagation(element);

      const homeLink = element.querySelector('.usa-breadcrumb__link') as HTMLAnchorElement;
      homeLink.click();

      expect(eventDetail).toBeTruthy();
      expect(eventDetail.label).toBe('Home');
      expect(eventDetail.href).toBe('/');
    });

    it('should not dispatch event for current items', async () => {
      let eventFired = false;

      element.addEventListener('breadcrumb-click', () => {
        eventFired = true;
      });

      element.items = [
        { label: 'Home', href: '/' },
        { label: 'Current', current: true },
      ];
      await waitForUpdate(element);

      // Try to click the current item (which should be a span, not a link)
      const currentSpan = element.querySelector('.usa-current span') as HTMLSpanElement;
      currentSpan.click();

      expect(eventFired).toBe(false);
    });

    it('should prevent default navigation for current items', async () => {
      element.items = [{ label: 'Current Item', href: '/current', current: true }];
      await waitForUpdate(element);

      // Current items should render as spans, not links, so no default to prevent
      const currentElement = element.querySelector('.usa-current');
      const link = currentElement?.querySelector('a');
      const span = currentElement?.querySelector('span');

      expect(link).toBe(null);
      expect(span).toBeTruthy();
      expect(span?.getAttribute('aria-current')).toBe('page');
    });
  });

  describe('Empty and Edge Cases', () => {
    it('should render empty breadcrumb when no items provided', async () => {
      element.items = [];
      await waitForPropertyPropagation(element);

      const nav = element.querySelector('.usa-breadcrumb');
      const list = element.querySelector('.usa-breadcrumb__list');
      const listItems = element.querySelectorAll('.usa-breadcrumb__list-item');

      expect(nav).toBeTruthy();
      expect(list).toBeTruthy();
      expect(listItems.length).toBe(0);
    });

    it('should handle single item breadcrumb', async () => {
      element.items = [{ label: 'Only Item', href: '/only' }];
      await waitForPropertyPropagation(element);

      const listItems = element.querySelectorAll('.usa-breadcrumb__list-item');
      const currentItems = element.querySelectorAll('.usa-current');
      const links = element.querySelectorAll('.usa-breadcrumb__link');

      expect(listItems.length).toBe(1);
      expect(currentItems.length).toBe(1); // Last item is treated as current
      expect(links.length).toBe(0); // Single item treated as current, so no link
    });

    it('should handle items without href', async () => {
      element.items = [{ label: 'No Href Item' }, { label: 'Another No Href', href: undefined }];
      await waitForPropertyPropagation(element);

      const links = element.querySelectorAll('.usa-breadcrumb__link');
      expect(links.length).toBe(1); // First item gets a link (href defaults to '#')

      const firstLink = links[0] as HTMLAnchorElement;
      expect(firstLink.href).toContain('#');
    });
  });

  describe('Complex Breadcrumb Scenarios', () => {
    it('should handle long breadcrumb trail', async () => {
      const items: BreadcrumbItem[] = [
        { label: 'Home', href: '/' },
        { label: 'Category', href: '/category' },
        { label: 'Subcategory', href: '/category/subcategory' },
        { label: 'Product Type', href: '/category/subcategory/type' },
        { label: 'Product', href: '/category/subcategory/type/product' },
        { label: 'Current Page', current: true },
      ];

      element.items = items;
      await waitForPropertyPropagation(element);

      const listItems = element.querySelectorAll('.usa-breadcrumb__list-item');
      const links = element.querySelectorAll('.usa-breadcrumb__link');
      const currentItems = element.querySelectorAll('.usa-current');

      expect(listItems.length).toBe(6);
      expect(links.length).toBe(5); // All except current
      expect(currentItems.length).toBe(1);
    });

    it('should handle multiple current items correctly', async () => {
      element.items = [
        { label: 'Home', href: '/' },
        { label: 'Middle Current', href: '/middle', current: true },
        { label: 'Last Item' },
      ];
      await waitForPropertyPropagation(element);

      const currentItems = element.querySelectorAll('.usa-current');
      const links = element.querySelectorAll('.usa-breadcrumb__link');

      // Both middle and last should be treated as current (middle explicitly, last by position)
      expect(currentItems.length).toBe(2);
      expect(links.length).toBe(1); // Only Home link
    });
  });

  describe('Accessibility', () => {
    it('should have correct ARIA attributes', async () => {
      element.items = [
        { label: 'Home', href: '/' },
        { label: 'Current Page', current: true },
      ];
      await waitForPropertyPropagation(element);

      const nav = element.querySelector('nav');
      const currentSpan = element.querySelector('.usa-current span');
      const list = element.querySelector('ol');

      expect(nav?.getAttribute('aria-label')).toBe('Breadcrumbs');
      expect(currentSpan?.getAttribute('aria-current')).toBe('page');
      expect(list?.tagName).toBe('OL'); // Should be ordered list for semantic meaning
    });

    it('should pass comprehensive accessibility tests (same as Storybook)', async () => {
      element.items = [
        { label: 'Home', href: '/' },
        { label: 'Section', href: '/section' },
        { label: 'Current Page' },
      ];
      await waitForUpdate(element);

      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should have proper semantic structure', async () => {
      element.items = [
        { label: 'Home', href: '/' },
        { label: 'Section', href: '/section' },
        { label: 'Current' },
      ];
      await waitForPropertyPropagation(element);

      const nav = element.querySelector('nav.usa-breadcrumb');
      const list = nav?.querySelector('ol.usa-breadcrumb__list');
      const listItems = list?.querySelectorAll('li.usa-breadcrumb__list-item');

      expect(nav).toBeTruthy();
      expect(list).toBeTruthy();
      expect(listItems?.length).toBe(3);

      // Check that non-current items have proper link structure
      const firstItem = listItems?.[0];
      const link = firstItem?.querySelector('a.usa-breadcrumb__link');
      const linkSpan = link?.querySelector('span');

      expect(link).toBeTruthy();
      expect(linkSpan?.textContent?.trim()).toBe('Home');
    });

    it('should provide screen reader friendly navigation', async () => {
      element.items = [
        { label: 'Home', href: '/' },
        { label: 'Current Page', current: true },
      ];
      await waitForUpdate(element);

      // Navigation should be identifiable by screen readers
      const nav = element.querySelector('nav[aria-label="Breadcrumbs"]');
      expect(nav).toBeTruthy();

      // Current page should be properly announced
      const currentElement = element.querySelector('span[aria-current="page"]');
      expect(currentElement).toBeTruthy();
      expect(currentElement?.textContent?.trim()).toBe('Current Page');
    });
  });

  describe('Event Handling Details', () => {
    it('should provide complete event details', async () => {
      let capturedEvent: any = null;

      element.addEventListener('breadcrumb-click', (e: any) => {
        capturedEvent = e;
      });

      element.items = [{ label: 'Test Item', href: '/test-path' }];
      await waitForUpdate(element);

      // Since single item becomes current, we need to add another item to make the first clickable
      element.items = [{ label: 'Test Item', href: '/test-path' }, { label: 'Current' }];
      await waitForPropertyPropagation(element);

      const link = element.querySelector('.usa-breadcrumb__link') as HTMLAnchorElement;
      link.click();

      expect(capturedEvent).toBeTruthy();
      expect(capturedEvent.type).toBe('breadcrumb-click');
      expect(capturedEvent.bubbles).toBe(true);
      expect(capturedEvent.composed).toBe(true);
      expect(capturedEvent.detail.label).toBe('Test Item');
      expect(capturedEvent.detail.href).toBe('/test-path');
    });
  });

  describe('CRITICAL: Component Lifecycle Stability', () => {
    beforeEach(() => {
      element = document.createElement('usa-breadcrumb') as USABreadcrumb;
      document.body.appendChild(element);
    });

    it('should remain in DOM after property changes', async () => {
      await waitForUpdate(element);
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      element.ariaLabel = 'Custom breadcrumb navigation';
      await waitForUpdate(element);
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      element.wrap = true;
      await waitForUpdate(element);
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      element.items = [
        { label: 'Home', href: '/' },
        { label: 'Section', href: '/section' },
        { label: 'Current Page' },
      ];
      await waitForUpdate(element);
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should maintain element stability during breadcrumb item updates', async () => {
      const originalElement = element;
      const breadcrumbSets = [
        [{ label: 'Home', href: '/' }],
        [
          { label: 'Home', href: '/' },
          { label: 'Products', href: '/products' },
        ],
        [
          { label: 'Home', href: '/' },
          { label: 'Products', href: '/products' },
          { label: 'Current' },
        ],
        [{ label: 'New Home', href: '/new-home' }, { label: 'New Current' }],
      ];

      for (const items of breadcrumbSets) {
        element.items = items;
        await waitForUpdate(element);
        expect(element).toBe(originalElement);
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });

    it('should preserve DOM connection through wrap setting changes', async () => {
      element.items = [
        { label: 'Very Long Breadcrumb Item Name', href: '/long' },
        { label: 'Another Very Long Item Name', href: '/another' },
        { label: 'Current Very Long Page Name' },
      ];

      const wrapStates = [false, true, false, true];
      for (const wrap of wrapStates) {
        element.wrap = wrap;
        await waitForUpdate(element);
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });
  });

  describe('CRITICAL: Event System Stability', () => {
    beforeEach(async () => {
      element = document.createElement('usa-breadcrumb') as USABreadcrumb;
      element.items = [
        { label: 'Home', href: '/home' },
        { label: 'Products', href: '/products' },
        { label: 'Current Page' },
      ];
      document.body.appendChild(element);
      await waitForUpdate(element);
    });

    it('should not pollute global event handling', async () => {
      const globalClickSpy = vi.fn();
      document.addEventListener('click', globalClickSpy);

      const breadcrumbClickSpy = vi.fn();
      element.addEventListener('breadcrumb-click', breadcrumbClickSpy);

      const link = element.querySelector('a[href="/home"]') as HTMLAnchorElement;
      if (link) {
        link.click();
        await waitForUpdate(element);
      }

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      document.removeEventListener('click', globalClickSpy);
    });

    it('should maintain stability during breadcrumb navigation clicks', async () => {
      const breadcrumbClickSpy = vi.fn();
      element.addEventListener('breadcrumb-click', breadcrumbClickSpy);

      const links = element.querySelectorAll(
        '.usa-breadcrumb__link'
      ) as NodeListOf<HTMLAnchorElement>;

      for (const link of links) {
        link.click();
        await waitForUpdate(element);
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }

      expect(breadcrumbClickSpy.mock.calls.length).toBe(links.length);
    });

    it('should maintain stability during rapid item array changes', async () => {
      const itemArrays = [
        [{ label: 'Set 1', href: '/set1' }],
        [{ label: 'Set 2 Home', href: '/set2' }, { label: 'Set 2 Current' }],
        [
          { label: 'Set 3 Home', href: '/set3' },
          { label: 'Set 3 Mid', href: '/mid' },
          { label: 'Set 3 Current' },
        ],
        [],
      ];

      for (const items of itemArrays) {
        element.items = items;
        await waitForUpdate(element);
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });
  });

  describe('CRITICAL: Breadcrumb State Management Stability', () => {
    beforeEach(async () => {
      element = document.createElement('usa-breadcrumb') as USABreadcrumb;
      document.body.appendChild(element);
      await waitForUpdate(element);
    });

    it('should maintain DOM connection during slot to items transition', async () => {
      // Start with empty items (slot content)
      expect(element.items.length).toBe(0);
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      // Switch to items array
      element.items = [
        { label: 'Transition Home', href: '/transition' },
        { label: 'Transition Current' },
      ];
      await waitForUpdate(element);
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      // Switch back to empty (slot)
      element.items = [];
      await waitForUpdate(element);
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should preserve element stability during complex breadcrumb updates', async () => {
      const originalElement = element;

      const complexUpdates = [
        {
          items: [{ label: 'Government', href: '/gov' }],
          ariaLabel: 'Government navigation',
          wrap: false,
        },
        {
          items: [
            { label: 'Government', href: '/gov' },
            { label: 'Services', href: '/services' },
          ],
          ariaLabel: 'Government services navigation',
          wrap: true,
        },
        {
          items: [
            { label: 'Government', href: '/gov' },
            { label: 'Services', href: '/services' },
            { label: 'Benefits', href: '/benefits' },
            { label: 'Apply for Benefits', href: '/apply', current: true },
          ],
          ariaLabel: 'Benefits application breadcrumb',
        },
      ];

      for (const update of complexUpdates) {
        Object.assign(element, update);
        await waitForUpdate(element);
        expect(element).toBe(originalElement);
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });

    it('should maintain stability during current item variations', async () => {
      const currentItemScenarios = [
        [{ label: 'Home', href: '/' }, { label: 'Auto Current' }], // Last item auto-current
        [
          { label: 'Home', href: '/' },
          { label: 'Explicit Current', current: true },
        ], // Explicit current
        [
          { label: 'Home', href: '/' },
          { label: 'Mid Current', href: '/mid', current: true },
          { label: 'Also Current' },
        ], // Multiple current
        [{ label: 'Single Current' }], // Single item (auto-current)
      ];

      for (const items of currentItemScenarios) {
        element.items = items;
        await waitForUpdate(element);
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath = `${process.cwd()}/src/components/breadcrumb/usa-breadcrumb.ts`;
        const validation = validateComponentJavaScript(componentPath, 'breadcrumb');

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

  describe('CRITICAL: Storybook Integration', () => {
    it('should render in Storybook-like environment without auto-dismiss', async () => {
      const storyContainer = document.createElement('div');
      storyContainer.id = 'storybook-root';
      document.body.appendChild(storyContainer);

      element = document.createElement('usa-breadcrumb') as USABreadcrumb;
      element.items = [
        { label: 'Storybook Home', href: '/storybook' },
        { label: 'Components', href: '/components' },
        { label: 'Breadcrumb Example' },
      ];
      element.ariaLabel = 'Storybook breadcrumb navigation';
      element.wrap = false;

      storyContainer.appendChild(element);
      await waitForUpdate(element);

      // Simulate Storybook control updates
      element.wrap = true;
      element.ariaLabel = 'Updated Storybook breadcrumb';
      element.items = [
        { label: 'Updated Home', href: '/updated' },
        { label: 'Updated Section', href: '/updated-section' },
        { label: 'Updated Current Page' },
      ];
      await waitForUpdate(element);

      expect(storyContainer.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
      expect(element.wrap).toBe(true);
      expect(element.ariaLabel).toBe('Updated Storybook breadcrumb');

      storyContainer.remove();
    });

    it('should handle Storybook args updates without component removal', async () => {
      element = document.createElement('usa-breadcrumb') as USABreadcrumb;
      document.body.appendChild(element);
      await waitForUpdate(element);

      const storyArgs = [
        {
          wrap: false,
          ariaLabel: 'Story args test 1',
          items: [{ label: 'Args Home 1', href: '/args1' }],
        },
        {
          wrap: true,
          ariaLabel: 'Story args test 2',
          items: [
            { label: 'Args Home 2', href: '/args2' },
            { label: 'Args Section 2', href: '/section2' },
            { label: 'Args Current 2' },
          ],
        },
        {
          wrap: false,
          items: [],
        },
      ];

      for (const args of storyArgs) {
        Object.assign(element, args);
        await waitForUpdate(element);
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });

    it('should maintain stability during complex Storybook interactions', async () => {
      element = document.createElement('usa-breadcrumb') as USABreadcrumb;
      document.body.appendChild(element);

      // Simulate complex Storybook scenario with rapid changes
      const interactions = [
        () => {
          element.wrap = true;
        },
        () => {
          element.items = [{ label: 'Interactive Home', href: '/interactive' }];
        },
        () => {
          element.ariaLabel = 'Interactive breadcrumb';
        },
        () => {
          element.items = [
            { label: 'Interactive Home', href: '/interactive' },
            { label: 'Interactive Current' },
          ];
        },
        () => {
          element.wrap = false;
        },
        () => {
          element.items = [];
        },
      ];

      for (const interaction of interactions) {
        interaction();
        await waitForUpdate(element);
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });
  });

  describe('Keyboard Navigation (WCAG 2.1)', () => {
    it('should allow keyboard navigation to breadcrumb links', async () => {
      element.items = [
        { label: 'Home', href: '/' },
        { label: 'Section', href: '/section' },
        { label: 'Subsection', href: '/section/subsection' },
        { label: 'Current Page' },
      ];
      await waitForUpdate(element);

      // Get all focusable links
      const focusableElements = getFocusableElements(element);
      const links = focusableElements.filter((el) => el.tagName === 'A');

      // Should have 3 links (current page is not a link)
      expect(links.length).toBe(3);

      // Verify each link is keyboard accessible
      links.forEach((link) => {
        expect((link as HTMLElement).tabIndex).toBeGreaterThanOrEqual(0);
        expect(link.getAttribute('href')).toBeTruthy();
      });
    });

    it('should be keyboard-only usable', async () => {
      element.items = [
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
        { label: 'Current' },
      ];
      await waitForUpdate(element);

      const result = await verifyKeyboardOnlyUsable(element);
      expect(result.passed).toBe(true);
      expect(result.report).toContain('keyboard accessible');
    });

    it('should pass comprehensive keyboard navigation tests', async () => {
      element.items = [
        { label: 'Home', href: '/' },
        { label: 'Page', href: '/page' },
        { label: 'Current' },
      ];
      await waitForUpdate(element);

      const result = await testKeyboardNavigation(element, {
        testEscapeKey: false, // Breadcrumbs don't respond to Escape
        testArrowKeys: false, // Breadcrumbs use Tab navigation, not arrows
      });

      expect(result.passed).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should have no keyboard traps', async () => {
      element.items = [
        { label: 'First', href: '/first' },
        { label: 'Second', href: '/second' },
        { label: 'Third', href: '/third' },
        { label: 'Current' },
      ];
      await waitForPropertyPropagation(element);

      const links = element.querySelectorAll('a');
      expect(links.length).toBe(3);

      // Focus first link
      (links[0] as HTMLElement).focus();
      expect(document.activeElement).toBe(links[0]);

      // Verify Tab key is not trapped
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        code: 'Tab',
        keyCode: 9,
        bubbles: true,
        cancelable: true,
      });

      links[0].dispatchEvent(tabEvent);
      expect(tabEvent.defaultPrevented).toBe(false);
    });

    it('should maintain proper tab order through breadcrumb trail', async () => {
      element.items = [
        { label: 'Level 1', href: '/l1' },
        { label: 'Level 2', href: '/l1/l2' },
        { label: 'Level 3', href: '/l1/l2/l3' },
        { label: 'Level 4', href: '/l1/l2/l3/l4' },
        { label: 'Current Page' },
      ];
      await waitForUpdate(element);

      const focusableElements = getFocusableElements(element);
      const links = focusableElements.filter((el) => el.tagName === 'A');

      // Should have 4 links in sequential tab order
      expect(links.length).toBe(4);

      // Verify tab order is sequential
      links.forEach((link) => {
        expect((link as HTMLElement).tabIndex).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle Enter key activation on links', async () => {
      element.items = [{ label: 'Home', href: '/' }, { label: 'Current' }];
      await waitForPropertyPropagation(element);

      const link = element.querySelector('a') as HTMLAnchorElement;
      expect(link).toBeTruthy();

      // Focus the link
      link.focus();
      expect(document.activeElement).toBe(link);

      // Links naturally handle Enter key for navigation
      // Verify link is properly configured for keyboard activation
      expect(link.href).toBeTruthy();
      expect(link.tabIndex).toBeGreaterThanOrEqual(0);
    });

    it('should maintain focus visibility (WCAG 2.4.7)', async () => {
      element.items = [
        { label: 'Home', href: '/' },
        { label: 'Section', href: '/section' },
        { label: 'Current' },
      ];
      await waitForPropertyPropagation(element);

      const link = element.querySelector('a') as HTMLElement;
      expect(link).toBeTruthy();

      // Focus the link
      link.focus();
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Check that link is focused
      expect(document.activeElement).toBe(link);

      // USWDS applies :focus styles via CSS - we verify element is focusable
      expect(link.tabIndex).toBeGreaterThanOrEqual(0);
    });

    it('should handle breadcrumbs with only current page (no links)', async () => {
      element.items = [{ label: 'Current Page Only' }];
      await waitForUpdate(element);

      const focusableElements = getFocusableElements(element);
      expect(focusableElements.length).toBe(0); // No links, nothing focusable

      // Breadcrumb should still be accessible via screen readers
      const nav = element.querySelector('nav');
      expect(nav).toBeTruthy();
      expect(nav?.getAttribute('aria-label')).toBe('Breadcrumbs');
    });

    it('should support wrapped breadcrumbs keyboard navigation', async () => {
      element.items = [
        { label: 'Very Long Breadcrumb Item 1', href: '/item1' },
        { label: 'Very Long Breadcrumb Item 2', href: '/item2' },
        { label: 'Very Long Breadcrumb Item 3', href: '/item3' },
        { label: 'Very Long Current Page' },
      ];
      element.wrap = true;
      await waitForUpdate(element);

      const focusableElements = getFocusableElements(element);
      const links = focusableElements.filter((el) => el.tagName === 'A');

      // All links should be keyboard accessible even when wrapped
      expect(links.length).toBe(3);
      links.forEach((link) => {
        expect((link as HTMLElement).tabIndex).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle aria-current attribute on current page', async () => {
      element.items = [
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
        { label: 'Current Product' },
      ];
      await waitForUpdate(element);

      // Find current page (should have aria-current="page")
      const currentPage = element.querySelector('[aria-current="page"]');
      expect(currentPage).toBeTruthy();
      expect(currentPage?.textContent).toContain('Current Product');

      // Current page should not be a link (not keyboard focusable)
      expect(currentPage?.tagName).not.toBe('A');
    });

    it('should handle single breadcrumb item as current page', async () => {
      element.items = [{ label: 'Single Current Page' }];
      await waitForUpdate(element);

      // No links should be present
      const links = element.querySelectorAll('a');
      expect(links.length).toBe(0);

      // Current page should have aria-current
      const currentPage = element.querySelector('[aria-current="page"]');
      expect(currentPage).toBeTruthy();

      // Breadcrumb navigation should still be keyboard accessible via nav element
      const nav = element.querySelector('nav');
      expect(nav).toBeTruthy();
      expect(nav?.getAttribute('aria-label')).toBe('Breadcrumbs');
    });

    it('should provide accessible name for navigation landmark', async () => {
      element.items = [{ label: 'Home', href: '/' }, { label: 'Current' }];
      await waitForUpdate(element);

      // Navigation landmark should have accessible name
      const nav = element.querySelector('nav');
      expect(nav).toBeTruthy();
      expect(nav?.getAttribute('aria-label')).toBe('Breadcrumbs');
    });
  });
});
