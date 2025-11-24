/**
 * Pagination Layout Tests
 * Prevents regression of pagination button positioning and navigation structure issues
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../pagination/index.ts';
import type { USAPagination } from './usa-pagination.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';
import { waitForARIAAttribute } from '@uswds-wc/test-utils';

describe('USAPagination Layout Tests', () => {
  let element: USAPagination;

  beforeEach(() => {
    element = document.createElement('usa-pagination') as USAPagination;
    element.currentPage = 5;
    element.totalPages = 20;
    element.maxVisible = 7;
    element.ariaLabel = 'Test Pagination';
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS pagination DOM structure', async () => {
    await element.updateComplete;

    const nav = element.querySelector('nav.usa-pagination');
    const list = element.querySelector('.usa-pagination__list');
    const items = element.querySelectorAll('.usa-pagination__item');
    const previousButton = element.querySelector('.usa-pagination__previous-page');
    const nextButton = element.querySelector('.usa-pagination__next-page');
    const pageButtons = element.querySelectorAll('.usa-pagination__button');

    expect(nav, 'Should have pagination nav').toBeTruthy();
    expect(list, 'Should have pagination list').toBeTruthy();
    expect(items.length, 'Should have pagination items').toBeGreaterThan(0);
    expect(previousButton, 'Should have previous button').toBeTruthy();
    expect(nextButton, 'Should have next button').toBeTruthy();
    expect(pageButtons.length, 'Should have page buttons').toBeGreaterThan(0);

    // Check nesting structure
    expect(nav!.contains(list!), 'List should be inside nav').toBe(true);
    expect(list!.contains(previousButton!), 'Previous button should be inside list').toBe(true);
    expect(list!.contains(nextButton!), 'Next button should be inside list').toBe(true);
  });

  it('should position pagination buttons correctly within list items', async () => {
    await element.updateComplete;

    const list = element.querySelector('.usa-pagination__list');
    element.querySelectorAll('.usa-pagination__item');
    const buttons = element.querySelectorAll('.usa-pagination__link, .usa-pagination__button');

    // Each button should be within its corresponding list item
    buttons.forEach((button, index) => {
      const parentItem = button.closest('.usa-pagination__item');
      expect(parentItem, `Button ${index} should be inside a pagination item`).toBeTruthy();
      expect(list!.contains(parentItem!), `Item ${index} should be inside pagination list`).toBe(
        true
      );
    });
  });

  it('should position previous/next buttons correctly at edges', async () => {
    await element.updateComplete;

    element.querySelector('.usa-pagination__list') as HTMLElement;
    const previousItem = element.querySelector('.usa-pagination__item:first-child');
    const nextItem = element.querySelector('.usa-pagination__item:last-child');
    const previousButton = element.querySelector('.usa-pagination__previous-page');
    const nextButton = element.querySelector('.usa-pagination__next-page');

    // Previous button should be in first item
    expect(previousItem!.contains(previousButton!), 'Previous button should be in first item').toBe(
      true
    );

    // Next button should be in last item
    expect(nextItem!.contains(nextButton!), 'Next button should be in last item').toBe(true);
  });

  it('should handle current page highlighting correctly', async () => {
    await element.updateComplete;

    const currentButton = element.querySelector('.usa-current');
    const currentPageButton = element.querySelector(`[data-page="${element.currentPage}"]`);

    expect(currentButton, 'Should have current page button').toBeTruthy();
    expect(currentButton, 'Current button should be the current page').toBe(currentPageButton);
    expect(
      currentButton!.getAttribute('aria-current'),
      'Current button should have aria-current'
    ).toBe('page');
  });

  it('should position ellipsis correctly between page numbers', async () => {
    // Set up scenario with ellipsis
    element.currentPage = 10;
    element.totalPages = 50;
    await element.updateComplete;

    const overflowItems = element.querySelectorAll('.usa-pagination__overflow');
    const list = element.querySelector('.usa-pagination__list') as HTMLElement;

    // Ellipsis items should be positioned between page numbers
    overflowItems.forEach((overflow, index) => {
      expect(list.contains(overflow), `Overflow item ${index} should be in pagination list`).toBe(
        true
      );
      expect(
        overflow.textContent!.includes('…'),
        `Overflow item ${index} should contain ellipsis`
      ).toBe(true);
    });
  });

  it('should handle edge cases for first page correctly', async () => {
    element.currentPage = 1;
    element.totalPages = 10;
    await element.updateComplete;

    const previousButton = element.querySelector('.usa-pagination__previous-page');
    const nextButton = element.querySelector('.usa-pagination__next-page');
    const currentButton = element.querySelector('.usa-current');

    expect(previousButton, 'Should not have previous button on first page').toBeFalsy();
    expect(nextButton, 'Should have next button on first page').toBeTruthy();
    expect(currentButton!.getAttribute('data-page'), 'Current page should be 1').toBe('1');
  });

  it('should handle edge cases for last page correctly', async () => {
    element.currentPage = 20;
    element.totalPages = 20;
    await element.updateComplete;

    const previousButton = element.querySelector('.usa-pagination__previous-page');
    const nextButton = element.querySelector('.usa-pagination__next-page');
    const currentButton = element.querySelector('.usa-current');

    expect(previousButton, 'Should have previous button on last page').toBeTruthy();
    expect(nextButton, 'Should not have next button on last page').toBeFalsy();
    expect(currentButton!.getAttribute('data-page'), 'Current page should be 20').toBe('20');
  });

  it('should handle single page scenario correctly', async () => {
    element.currentPage = 1;
    element.totalPages = 1;
    await element.updateComplete;

    const nav = element.querySelector('nav.usa-pagination');
    expect(nav, 'Should not render pagination for single page').toBeFalsy();
  });

  it('should handle small maxVisible values correctly', async () => {
    element.maxVisible = 3;
    element.currentPage = 5;
    element.totalPages = 10;
    await element.updateComplete;

    const pageButtons = element.querySelectorAll('.usa-pagination__button');
    expect(
      pageButtons.length,
      'Should have limited page buttons with small maxVisible'
    ).toBeLessThanOrEqual(3);
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath = `${process.cwd()}/src/components/pagination/usa-pagination.ts`;
        const validation = validateComponentJavaScript(componentPath, 'pagination');

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
    it('should pass visual layout checks for pagination structure', async () => {
      await element.updateComplete;

      const nav = element.querySelector('nav.usa-pagination') as HTMLElement;
      const list = element.querySelector('.usa-pagination__list') as HTMLElement;
      const items = element.querySelectorAll('.usa-pagination__item') as NodeListOf<HTMLElement>;

      const navRect = nav.getBoundingClientRect();
      const listRect = list.getBoundingClientRect();

      // List should be within nav
      expect(
        listRect.top >= navRect.top && listRect.bottom <= navRect.bottom,
        'Pagination list should be vertically within nav'
      ).toBe(true);

      expect(
        listRect.left >= navRect.left && listRect.right <= navRect.right,
        'Pagination list should be horizontally within nav'
      ).toBe(true);

      // All items should be within list and horizontally aligned
      if (items.length > 1) {
        const firstItemRect = items[0].getBoundingClientRect();

        items.forEach((item, index) => {
          const itemRect = item.getBoundingClientRect();

          // Item should be within list
          expect(
            itemRect.top >= listRect.top && itemRect.bottom <= listRect.bottom,
            `Pagination item ${index} should be vertically within list`
          ).toBe(true);

          // Items should be horizontally aligned (within tolerance)
          expect(
            Math.abs(itemRect.top - firstItemRect.top) <= 5,
            `Pagination item ${index} should be horizontally aligned with other items`
          ).toBe(true);

          // Each item (except first) should be positioned to the right of previous
          if (index > 0) {
            const prevItemRect = items[index - 1].getBoundingClientRect();
            expect(
              itemRect.left >= prevItemRect.left,
              `Pagination item ${index} should be positioned at or to the right of previous item`
            ).toBe(true);
          }
        });
      }
    });

    it('should pass visual layout checks for button positioning', async () => {
      await element.updateComplete;

      element.querySelectorAll('.usa-pagination__item') as NodeListOf<HTMLElement>;
      const buttons = element.querySelectorAll(
        '.usa-pagination__link, .usa-pagination__button'
      ) as NodeListOf<HTMLElement>;

      // Each button should be properly contained within its item
      buttons.forEach((button, index) => {
        const buttonRect = button.getBoundingClientRect();
        const parentItem = button.closest('.usa-pagination__item') as HTMLElement;
        const itemRect = parentItem.getBoundingClientRect();

        expect(
          buttonRect.top >= itemRect.top && buttonRect.bottom <= itemRect.bottom,
          `Button ${index} should be vertically within its item`
        ).toBe(true);

        expect(
          buttonRect.left >= itemRect.left && buttonRect.right <= itemRect.right,
          `Button ${index} should be horizontally within its item`
        ).toBe(true);
      });
    });

    it('should pass visual layout checks for different page scenarios', async () => {
      // Test various pagination scenarios
      const scenarios = [
        { currentPage: 1, totalPages: 5, description: 'small pagination' },
        { currentPage: 1, totalPages: 20, description: 'first page of large pagination' },
        { currentPage: 10, totalPages: 20, description: 'middle page with ellipsis' },
        { currentPage: 20, totalPages: 20, description: 'last page of large pagination' },
      ];

      for (const scenario of scenarios) {
        element.currentPage = scenario.currentPage;
        element.totalPages = scenario.totalPages;
        await element.updateComplete;

        const nav = element.querySelector('nav.usa-pagination') as HTMLElement;
        if (nav) {
          // Only test if pagination renders
          const items = element.querySelectorAll(
            '.usa-pagination__item'
          ) as NodeListOf<HTMLElement>;

          // Items should maintain horizontal alignment in all scenarios
          if (items.length > 1) {
            const firstItemRect = items[0].getBoundingClientRect();

            items.forEach((item, index) => {
              const itemRect = item.getBoundingClientRect();
              expect(
                Math.abs(itemRect.top - firstItemRect.top) <= 5,
                `${scenario.description}: Item ${index} should be horizontally aligned`
              ).toBe(true);
            });
          }
        }
      }
    });

    it('should maintain proper pagination interaction states', async () => {
      await element.updateComplete;

      const buttons = element.querySelectorAll(
        '.usa-pagination__link, .usa-pagination__button'
      ) as NodeListOf<HTMLElement>;

      // Test focus states
      buttons.forEach((button, index) => {
        button.focus();
        expect(document.activeElement, `Button ${index} should be focusable`).toBe(button);
      });
    });

    it('should handle pagination click interactions correctly', async () => {
      await element.updateComplete;

      // Set up event listener to test page change events
      let pageChangeEventFired = false;
      let pageChangeDetail: any = null;
      element.addEventListener('page-change', (e: any) => {
        pageChangeEventFired = true;
        pageChangeDetail = e.detail;
      });

      // Click next button
      const nextButton = element.querySelector('.usa-pagination__next-page') as HTMLAnchorElement;
      nextButton.click();
      await element.updateComplete;

      expect(pageChangeEventFired, 'Page change event should be fired').toBe(true);
      expect(pageChangeDetail.page, 'Should navigate to next page').toBe(6);
      expect(element.currentPage, 'Current page should be updated').toBe(6);

      // Reset event tracking
      pageChangeEventFired = false;
      pageChangeDetail = null;

      // Click a specific page button
      const pageButton = element.querySelector('[data-page="3"]') as HTMLAnchorElement;
      if (pageButton) {
        pageButton.click();
        await element.updateComplete;

        expect(pageChangeEventFired, 'Page change event should be fired for specific page').toBe(
          true
        );
        expect(pageChangeDetail.page, 'Should navigate to clicked page').toBe(3);
        expect(element.currentPage, 'Current page should be updated to clicked page').toBe(3);
      }
    });

    it('should handle ARIA attributes correctly', async () => {
      await element.updateComplete;

      const nav = element.querySelector('nav');
      const currentButton = element.querySelector('.usa-current') as HTMLElement;
      const previousButton = element.querySelector('.usa-pagination__previous-page') as HTMLElement;
      const nextButton = element.querySelector('.usa-pagination__next-page') as HTMLElement;

      expect(nav!.getAttribute('aria-label'), 'Nav should have aria-label').toBe('Test Pagination');
      expect(
        await waitForARIAAttribute(currentButton, 'aria-current'),
        'Current button should have aria-current'
      ).toBe('page');
      expect(
        await waitForARIAAttribute(previousButton, 'aria-label'),
        'Previous button should have aria-label'
      ).toBe('Previous page');
      expect(
        await waitForARIAAttribute(nextButton, 'aria-label'),
        'Next button should have aria-label'
      ).toBe('Next page');

      // Page buttons should have descriptive labels
      const pageButtons = element.querySelectorAll('.usa-pagination__button');
      for (const button of pageButtons) {
        const page = button.getAttribute('data-page');
        expect(
          await waitForARIAAttribute(button, 'aria-label'),
          `Page button should have descriptive aria-label`
        ).toBe(`Page ${page}`);
      }
    });

    it('should prevent invalid navigation correctly', async () => {
      await element.updateComplete;
      const initialPage = element.currentPage;

      // Set up event listener
      let eventFiredCount = 0;
      element.addEventListener('page-change', () => {
        eventFiredCount++;
      });

      // Try to click current page (should not trigger event)
      const currentButton = element.querySelector('.usa-current') as HTMLAnchorElement;
      currentButton.click();
      await element.updateComplete;

      expect(eventFiredCount, 'Should not fire event when clicking current page').toBe(0);
      expect(element.currentPage, 'Current page should not change').toBe(initialPage);
    });

    it('should handle responsive layout considerations', async () => {
      await element.updateComplete;

      const nav = element.querySelector('nav.usa-pagination') as HTMLElement;
      const list = element.querySelector('.usa-pagination__list') as HTMLElement;

      // Pagination should maintain semantic structure
      expect(nav.tagName, 'Should use nav element for accessibility').toBe('NAV');
      expect(list.tagName, 'Should use list element for structure').toBe('UL');

      // All items should be proper list items
      const items = element.querySelectorAll('.usa-pagination__item');
      items.forEach((item, index) => {
        expect(item.tagName, `Item ${index} should be a list item`).toBe('LI');
      });
    });

    it('should handle maxVisible constraint correctly', async () => {
      element.maxVisible = 5;
      element.currentPage = 10;
      element.totalPages = 50;
      await element.updateComplete;

      const pageButtons = element.querySelectorAll('.usa-pagination__button');
      const overflowItems = element.querySelectorAll('.usa-pagination__overflow');
      const totalVisiblePages = pageButtons.length + overflowItems.length;

      // Should respect maxVisible constraint (allowing for previous/next buttons)
      expect(
        totalVisiblePages <= element.maxVisible,
        'Should not exceed maxVisible page elements'
      ).toBe(true);
    });
  });
});
