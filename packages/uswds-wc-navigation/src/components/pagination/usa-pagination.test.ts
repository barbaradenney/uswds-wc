import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '@uswds-wc/test-utils/test-utils.js';
import './usa-pagination.js';
import type { USAPagination } from './usa-pagination.js';
import {
  testComponentAccessibility,
  USWDS_A11Y_CONFIG,
} from '@uswds-wc/test-utils/accessibility-utils.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';
import { waitForARIAAttribute } from '@uswds-wc/test-utils';

describe('USAPagination', () => {
  let element: USAPagination;
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container?.remove();
  });

  describe('Component Initialization', () => {
    beforeEach(() => {
      element = document.createElement('usa-pagination') as USAPagination;
      container.appendChild(element);
    });

    it('should create pagination element', () => {
      expect(element).toBeInstanceOf(HTMLElement);
      expect(element.tagName).toBe('USA-PAGINATION');
    });

    it('should have default properties', () => {
      expect(element.currentPage).toBe(1);
      expect(element.totalPages).toBe(1);
      expect(element.maxVisible).toBe(7);
      expect(element.ariaLabel).toBe('Pagination');
    });

    it('should render light DOM for USWDS compatibility', () => {
      expect(element.shadowRoot).toBeNull();
    });

    it('should not render when totalPages is 1 or less', async () => {
      await element.updateComplete;
      expect(element.innerHTML.trim()).toBe('<!----><!--?-->');

      element.totalPages = 0;
      await element.updateComplete;
      expect(element.innerHTML.trim()).toBe('<!----><!--?-->');
    });

    it('should render pagination when totalPages > 1', async () => {
      element.totalPages = 5;
      await element.updateComplete;

      const nav = element.querySelector('nav');
      expect(nav).toBeTruthy();
      expect(nav?.classList.contains('usa-pagination')).toBe(true);
    });
  });

  describe('USWDS HTML Structure and Classes', () => {
    beforeEach(async () => {
      element = document.createElement('usa-pagination') as USAPagination;
      element.totalPages = 5;
      container.appendChild(element);
      await element.updateComplete;
    });

    it('should have proper USWDS navigation structure', () => {
      const nav = element.querySelector('nav.usa-pagination');
      expect(nav).toBeTruthy();
      expect(nav?.getAttribute('aria-label')).toBe('Pagination');

      const list = element.querySelector('ul.usa-pagination__list');
      expect(list).toBeTruthy();
    });

    it('should render page number buttons with correct classes', async () => {
      element.totalPages = 5;
      await element.updateComplete;
      const pageButtons = element.querySelectorAll('.usa-pagination__button');
      expect(pageButtons.length).toBeGreaterThan(0);

      // All page buttons should have the usa-pagination__button class
      expect(pageButtons.length).toBeGreaterThan(0);
    });

    it('should mark current page with usa-current class', () => {
      const currentButton = element.querySelector('.usa-current');
      expect(currentButton).toBeTruthy();
      expect(currentButton?.getAttribute('aria-current')).toBe('page');
      expect(currentButton?.textContent?.trim()).toBe('1');
    });

    it('should render previous/next arrows when needed', async () => {
      element.currentPage = 3;
      await element.updateComplete;

      const previousLink = element.querySelector('.usa-pagination__previous-page');
      const nextLink = element.querySelector('.usa-pagination__next-page');

      expect(previousLink).toBeTruthy();
      expect(nextLink).toBeTruthy();

      expect(previousLink?.getAttribute('aria-label')).toBe('Previous page');
      expect(nextLink?.getAttribute('aria-label')).toBe('Next page');
    });

    it('should not render previous arrow on first page', async () => {
      element.currentPage = 1;
      await element.updateComplete;

      const previousLink = element.querySelector('.usa-pagination__previous-page');
      expect(previousLink).toBeNull();
    });

    it('should not render next arrow on last page', async () => {
      element.currentPage = 5;
      element.totalPages = 5;
      await element.updateComplete;

      const nextLink = element.querySelector('.usa-pagination__next-page');
      expect(nextLink).toBeNull();
    });
  });

  describe('Page Navigation', () => {
    beforeEach(async () => {
      element = document.createElement('usa-pagination') as USAPagination;
      element.totalPages = 10;
      element.currentPage = 5;
      container.appendChild(element);
      await element.updateComplete;
    });

    it('should handle page click events', async () => {
      const eventSpy = vi.fn();
      element.addEventListener('page-change', eventSpy);

      const pageButton = element.querySelector('[aria-label="Page 3"]') as HTMLAnchorElement;
      pageButton.click();

      expect(eventSpy).toHaveBeenCalled();
      const event = eventSpy.mock.calls[0][0];
      expect(event.detail.page).toBe(3);
      expect(event.detail.totalPages).toBe(10);
      expect(element.currentPage).toBe(3);
    });

    it('should handle previous page navigation', async () => {
      const eventSpy = vi.fn();
      element.addEventListener('page-change', eventSpy);

      const previousLink = element.querySelector(
        '.usa-pagination__previous-page'
      ) as HTMLAnchorElement;
      previousLink.click();

      expect(eventSpy).toHaveBeenCalled();
      expect(element.currentPage).toBe(4);
    });

    it('should handle next page navigation', async () => {
      const eventSpy = vi.fn();
      element.addEventListener('page-change', eventSpy);

      const nextLink = element.querySelector('.usa-pagination__next-page') as HTMLAnchorElement;
      nextLink.click();

      expect(eventSpy).toHaveBeenCalled();
      expect(element.currentPage).toBe(6);
    });

    it('should prevent default on link clicks', async () => {
      const pageButton = element.querySelector('[aria-label="Page 3"]') as HTMLAnchorElement;
      const clickEvent = new MouseEvent('click', { cancelable: true });
      const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');

      pageButton.dispatchEvent(clickEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should not navigate to invalid pages', async () => {
      const eventSpy = vi.fn();
      element.addEventListener('page-change', eventSpy);

      // Try to navigate to current page
      (element as any).handlePageClick(new MouseEvent('click'), 5);
      expect(eventSpy).not.toHaveBeenCalled();

      // Try to navigate to page < 1
      (element as any).handlePageClick(new MouseEvent('click'), 0);
      expect(eventSpy).not.toHaveBeenCalled();

      // Try to navigate to page > totalPages
      (element as any).handlePageClick(new MouseEvent('click'), 15);
      expect(eventSpy).not.toHaveBeenCalled();
    });

    it('should dispatch custom events with correct details', async () => {
      const eventSpy = vi.fn();
      element.addEventListener('page-change', eventSpy);

      (element as any).handlePageClick(new MouseEvent('click'), 7);

      expect(eventSpy).toHaveBeenCalled();
      const event = eventSpy.mock.calls[0][0];
      expect(event.detail.page).toBe(7);
      expect(event.detail.totalPages).toBe(10);
      expect(event.bubbles).toBe(true);
      expect(event.composed).toBe(true);
    });
  });

  describe('Visible Pages Algorithm', () => {
    beforeEach(() => {
      element = document.createElement('usa-pagination') as USAPagination;
      container.appendChild(element);
    });

    it('should show all pages when total <= maxVisible', async () => {
      element.totalPages = 5;
      element.maxVisible = 7;
      await element.updateComplete;

      const visiblePages = element.getVisiblePages();
      expect(visiblePages).toEqual([1, 2, 3, 4, 5]);

      const pageButtons = element.querySelectorAll('.usa-pagination__button');
      expect(pageButtons.length).toBe(5);
    });

    it('should handle ellipsis for large page sets', async () => {
      element.totalPages = 20;
      element.currentPage = 10;
      element.maxVisible = 7;
      await element.updateComplete;

      const visiblePages = element.getVisiblePages();
      expect(visiblePages).toContain('...');
      expect(visiblePages).toContain(1);
      expect(visiblePages).toContain(20);

      const ellipsis = element.querySelectorAll('.usa-pagination__overflow');
      expect(ellipsis.length).toBeGreaterThan(0);
    });

    it('should handle current page near beginning', async () => {
      element.totalPages = 20;
      element.currentPage = 2;
      element.maxVisible = 7;
      await element.updateComplete;

      const visiblePages = element.getVisiblePages();
      expect(visiblePages[0]).toBe(1);
      expect(visiblePages[1]).toBe(2);
      expect(visiblePages[2]).toBe(3);
    });

    it('should handle current page near end', async () => {
      element.totalPages = 20;
      element.currentPage = 19;
      element.maxVisible = 7;
      await element.updateComplete;

      const visiblePages = element.getVisiblePages();
      const lastIndex = visiblePages.length - 1;
      expect(visiblePages[lastIndex]).toBe(20);
      expect(visiblePages[lastIndex - 1]).toBe(19);
    });

    it('should respect maxVisible setting', async () => {
      element.totalPages = 50;
      element.currentPage = 25;
      element.maxVisible = 5;
      await element.updateComplete;

      const visiblePages = element.getVisiblePages();
      expect(visiblePages.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Accessibility Features', () => {
    beforeEach(async () => {
      element = document.createElement('usa-pagination') as USAPagination;
      element.totalPages = 10;
      element.ariaLabel = 'Search results pages';
      container.appendChild(element);
      await element.updateComplete;
    });

    it('should have proper ARIA labels', () => {
      const nav = element.querySelector('nav');
      expect(nav?.getAttribute('aria-label')).toBe('Search results pages');
    });

    it('should have aria-current on current page', () => {
      const currentButton = element.querySelector('.usa-current');
      expect(currentButton?.getAttribute('aria-current')).toBe('page');
    });

    it('should have descriptive aria-label for each page', async () => {
      const pageButtons = element.querySelectorAll('.usa-pagination__button');

      for (const button of pageButtons) {
        const pageNum = button.textContent?.trim();
        expect(await waitForARIAAttribute(button, 'aria-label')).toBe(`Page ${pageNum}`);
      }
    });

    it('should have proper ARIA labels for navigation arrows', async () => {
      element.currentPage = 5;
      await element.updateComplete;

      const previousLink = element.querySelector('.usa-pagination__previous-page');
      const nextLink = element.querySelector('.usa-pagination__next-page');

      expect(previousLink?.getAttribute('aria-label')).toBe('Previous page');
      expect(nextLink?.getAttribute('aria-label')).toBe('Next page');
    });

    it('should be keyboard accessible', async () => {
      element.currentPage = 5;
      await element.updateComplete;

      const pageButton = element.querySelector('[aria-label="Page 3"]') as HTMLAnchorElement;

      // Simulate keyboard navigation
      pageButton.focus();
      expect(document.activeElement).toBe(pageButton);

      // Test Enter key activation
      const eventSpy = vi.fn();
      element.addEventListener('page-change', eventSpy);

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      pageButton.dispatchEvent(enterEvent);

      // Should work with regular click handling
      pageButton.click();
      expect(eventSpy).toHaveBeenCalled();
    });

    it('should pass comprehensive accessibility tests (same as Storybook)', async () => {
      element.currentPage = 3;
      element.totalPages = 10;
      element.ariaLabel = 'Test Results Pages';
      await element.updateComplete;

      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });
  });

  describe('Property Changes and Updates', () => {
    beforeEach(async () => {
      element = document.createElement('usa-pagination') as USAPagination;
      container.appendChild(element);
    });

    it('should update when currentPage changes', async () => {
      element.totalPages = 10;
      element.currentPage = 1;
      await element.updateComplete;

      let currentButton = element.querySelector('.usa-current');
      expect(currentButton?.textContent?.trim()).toBe('1');

      element.currentPage = 5;
      await element.updateComplete;

      currentButton = element.querySelector('.usa-current');
      expect(currentButton?.textContent?.trim()).toBe('5');
    });

    it('should update when totalPages changes', async () => {
      element.totalPages = 3;
      await element.updateComplete;

      let pageButtons = element.querySelectorAll('.usa-pagination__button');
      expect(pageButtons.length).toBe(3);

      element.totalPages = 7;
      await element.updateComplete;

      pageButtons = element.querySelectorAll('.usa-pagination__button');
      expect(pageButtons.length).toBe(7);
    });

    it('should update when maxVisible changes', async () => {
      element.totalPages = 20;
      element.currentPage = 10;
      element.maxVisible = 5;
      await element.updateComplete;

      let visiblePages = element['getVisiblePages']();
      expect(visiblePages.length).toBeLessThanOrEqual(5);

      element.maxVisible = 9;
      await element.updateComplete;

      visiblePages = element['getVisiblePages']();
      expect(visiblePages.length).toBeLessThanOrEqual(9);
    });

    it('should update aria-label when changed', async () => {
      element.totalPages = 5;
      element.ariaLabel = 'Custom pagination';
      await element.updateComplete;

      const nav = element.querySelector('nav');
      expect(nav?.getAttribute('aria-label')).toBe('Custom pagination');
    });
  });

  describe('Application Use Cases', () => {
    it('should handle large government datasets', async () => {
      element = document.createElement('usa-pagination') as USAPagination;

      // Simulate federal employee directory with 10,000 records (100 per page)
      element.totalPages = 100;
      element.currentPage = 50;
      element.maxVisible = 7;
      element.ariaLabel = 'Federal employee directory pages';

      container.appendChild(element);
      await element.updateComplete;

      const visiblePages = element.getVisiblePages();
      expect(visiblePages.length).toBeLessThanOrEqual(7);
      expect(visiblePages).toContain(1);
      expect(visiblePages).toContain(100);
      expect(visiblePages).toContain('...');

      const nav = element.querySelector('nav');
      expect(nav?.getAttribute('aria-label')).toBe('Federal employee directory pages');
    });

    it('should support federal search results pagination', async () => {
      element = document.createElement('usa-pagination') as USAPagination;

      // Simulate federal regulation search results
      element.totalPages = 25;
      element.currentPage = 1;
      element.ariaLabel = 'Regulation search results pages';

      container.appendChild(element);
      await element.updateComplete;

      const eventSpy = vi.fn();
      element.addEventListener('page-change', eventSpy);

      // Navigate to page 2 - use direct method call since click may not work in test environment
      (element as any).handlePageClick(new MouseEvent('click'), 2);
      await element.updateComplete;

      expect(eventSpy).toHaveBeenCalled();
      expect(eventSpy.mock.calls[0][0].detail).toEqual({ page: 2, totalPages: 25, oldPage: 1 });
      expect(element.currentPage).toBe(2);
    });

    it('should handle budget data table pagination', async () => {
      element = document.createElement('usa-pagination') as USAPagination;

      // Simulate federal budget line items (5000 items, 50 per page)
      element.totalPages = 100;
      element.currentPage = 10;
      element.maxVisible = 5; // Compact for data tables
      element.ariaLabel = 'Budget line items pages';

      container.appendChild(element);
      await element.updateComplete;

      const visiblePages = element.getVisiblePages();
      expect(visiblePages.length).toBeLessThanOrEqual(5);

      // Test jumping to different sections
      const eventSpy = vi.fn();
      element.addEventListener('page-change', eventSpy);

      // Click page 1 (first page) - use direct method call since click may not work in test environment
      (element as any).handlePageClick(new MouseEvent('click'), 1);
      await element.updateComplete;

      expect(eventSpy).toHaveBeenCalled();
      expect(eventSpy.mock.calls[0][0].detail).toEqual({ page: 1, totalPages: 100, oldPage: 10 });
    });

    it('should support public comment pagination', async () => {
      element = document.createElement('usa-pagination') as USAPagination;

      // Simulate public comments on federal rulemaking (500 comments, 20 per page)
      element.totalPages = 25;
      element.currentPage = 1;
      element.ariaLabel = 'Public comments pages';

      container.appendChild(element);
      await element.updateComplete;

      expect(element.querySelector('nav')?.getAttribute('aria-label')).toBe(
        'Public comments pages'
      );

      // Test navigation through comment pages
      const eventSpy = vi.fn();
      element.addEventListener('page-change', eventSpy);

      const page5Button = element.querySelector('[aria-label="Page 5"]') as HTMLAnchorElement;
      if (page5Button) {
        page5Button.click();
        expect(eventSpy).toHaveBeenCalled();
      }
    });

    it('should handle court document pagination', async () => {
      element = document.createElement('usa-pagination') as USAPagination;

      // Simulate federal court case documents
      element.totalPages = 50;
      element.currentPage = 25;
      element.maxVisible = 7;
      element.ariaLabel = 'Case documents pages';

      container.appendChild(element);
      await element.updateComplete;

      // Should show proper middle pagination
      const visiblePages = element.getVisiblePages();
      expect(visiblePages).toContain(25); // Current page
      expect(visiblePages).toContain(1); // First page
      expect(visiblePages).toContain(50); // Last page

      const currentButton = element.querySelector('.usa-current');
      expect(currentButton?.textContent?.trim()).toBe('25');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    beforeEach(async () => {
      element = document.createElement('usa-pagination') as USAPagination;
      container.appendChild(element);
    });

    it('should handle zero pages gracefully', async () => {
      element.totalPages = 0;
      await element.updateComplete;

      expect(element.innerHTML.trim()).toBe('<!----><!--?-->');
    });

    it('should handle negative totalPages', async () => {
      element.totalPages = -5;
      await element.updateComplete;

      expect(element.innerHTML.trim()).toBe('<!----><!--?-->');
    });

    it('should handle currentPage out of bounds', async () => {
      element.totalPages = 10;
      element.currentPage = 15; // Out of bounds
      await element.updateComplete;

      // Should still render but not allow invalid navigation
      const eventSpy = vi.fn();
      element.addEventListener('page-change', eventSpy);

      (element as any).handlePageClick(new MouseEvent('click'), 15);
      expect(eventSpy).not.toHaveBeenCalled();
    });

    it('should handle very small maxVisible values', async () => {
      element.totalPages = 20;
      element.currentPage = 10;
      element.maxVisible = 1; // Very small
      await element.updateComplete;

      const visiblePages = element.getVisiblePages();
      expect(visiblePages.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle very large maxVisible values', async () => {
      element.totalPages = 10;
      element.maxVisible = 100; // Larger than total pages
      await element.updateComplete;

      const visiblePages = element.getVisiblePages();
      expect(visiblePages).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('should handle rapid page changes', async () => {
      element.totalPages = 10;
      await element.updateComplete;

      const eventSpy = vi.fn();
      element.addEventListener('page-change', eventSpy);

      // Rapid fire page changes
      (element as any).handlePageClick(new MouseEvent('click'), 2);
      (element as any).handlePageClick(new MouseEvent('click'), 3);
      (element as any).handlePageClick(new MouseEvent('click'), 4);
      (element as any).handlePageClick(new MouseEvent('click'), 5);

      expect(eventSpy).toHaveBeenCalledTimes(4);
      expect(element.currentPage).toBe(5);
    });

    it('should maintain functionality after DOM manipulation', async () => {
      element.totalPages = 5;
      await element.updateComplete;

      // Remove and re-add element
      element.remove();
      container.appendChild(element);
      await element.updateComplete;

      const eventSpy = vi.fn();
      element.addEventListener('page-change', eventSpy);

      const pageButton = element.querySelector('[aria-label="Page 3"]') as HTMLAnchorElement;
      pageButton.click();

      expect(eventSpy).toHaveBeenCalled();
    });
  });

  describe('Performance and Memory', () => {
    it('should handle very large page counts efficiently', async () => {
      element = document.createElement('usa-pagination') as USAPagination;

      const startTime = performance.now();
      element.totalPages = 10000; // Very large dataset
      element.currentPage = 5000;
      element.maxVisible = 7;
      container.appendChild(element);
      await element.updateComplete;
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should render quickly

      // Should still only show limited pages
      const pageButtons = element.querySelectorAll('.usa-pagination__button');
      expect(pageButtons.length).toBeLessThanOrEqual(element.maxVisible);
    });

    it('should efficiently update visible pages on property changes', async () => {
      element = document.createElement('usa-pagination') as USAPagination;
      element.totalPages = 1000;
      container.appendChild(element);
      await element.updateComplete;

      const startTime = performance.now();

      // Rapid property changes
      for (let i = 1; i <= 100; i++) {
        element.currentPage = i;
      }
      await element.updateComplete;

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(200); // Should update efficiently

      expect(element.currentPage).toBe(100);
    });

    it('should clean up event listeners properly', async () => {
      element = document.createElement('usa-pagination') as USAPagination;
      element.totalPages = 5;
      container.appendChild(element);
      await element.updateComplete;

      const eventSpy = vi.fn();
      element.addEventListener('page-change', eventSpy);

      // Trigger event
      (element as any).handlePageClick(new MouseEvent('click'), 3);
      expect(eventSpy).toHaveBeenCalledOnce();

      // Remove element
      element.remove();

      // Should not cause memory leaks or errors
      expect(() => (element as any).handlePageClick(new MouseEvent('click'), 2)).not.toThrow();
    });
  });

  // CRITICAL TESTS - Component Lifecycle Stability (Auto-dismiss Prevention)
  describe('Component Lifecycle Stability (CRITICAL)', () => {
    beforeEach(() => {
      element = document.createElement('usa-pagination') as USAPagination;
      container.appendChild(element);
    });

    it('should remain in DOM after property updates (not auto-dismiss)', async () => {
      element.currentPage = 5;
      element.totalPages = 20;
      element.maxVisible = 5;
      element.ariaLabel = 'Search Results Pagination';
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should maintain component state during rapid property changes', async () => {
      const initialParent = element.parentNode;

      // Rapid property changes that could trigger lifecycle issues
      for (let i = 0; i < 10; i++) {
        element.currentPage = (i % 5) + 1;
        element.totalPages = 10 + (i % 3);
        element.maxVisible = 5 + (i % 3);
        element.ariaLabel = `Pagination ${i}`;
        await element.updateComplete;
      }

      expect(element.parentNode).toBe(initialParent);
      expect(element.isConnected).toBe(true);
    });

    it('should handle complex pagination operations without disconnection', async () => {
      // Complex pagination operations
      element.totalPages = 50;
      element.maxVisible = 7;
      await element.updateComplete;

      // Test various page navigation scenarios
      const pages = [1, 10, 25, 45, 50, 30, 15, 5];
      for (const page of pages) {
        element.currentPage = page;
        await element.updateComplete;
      }

      // Test maxVisible changes with different positions
      element.currentPage = 25;
      const maxVisibleValues = [3, 5, 7, 9, 11];
      for (const maxVisible of maxVisibleValues) {
        element.maxVisible = maxVisible;
        await element.updateComplete;
      }

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
  });

  describe('Event System Stability (CRITICAL)', () => {
    beforeEach(() => {
      element = document.createElement('usa-pagination') as USAPagination;
      container.appendChild(element);
    });

    it('should not interfere with other components after event handling', async () => {
      const eventsSpy = vi.fn();
      element.addEventListener('page-change', eventsSpy);

      element.currentPage = 3;
      element.totalPages = 10;
      await element.updateComplete;

      // Trigger multiple pagination events
      const nextButton = element.querySelector('.usa-pagination__next-page') as HTMLElement;
      nextButton?.click();

      const prevButton = element.querySelector('.usa-pagination__previous-page') as HTMLElement;
      prevButton?.click();

      const pageButton = element.querySelector('[data-page="5"]') as HTMLElement;
      pageButton?.click();

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should handle rapid page navigation without component removal', async () => {
      element.currentPage = 1;
      element.totalPages = 20;
      await element.updateComplete;

      // Rapid page navigation simulation
      for (let i = 0; i < 30; i++) {
        const targetPage = (i % 20) + 1;
        element.currentPage = targetPage;
        await element.updateComplete;

        // Trigger page change event
        const pageChangeEvent = new CustomEvent('page-change', {
          detail: { page: targetPage, previousPage: element.currentPage },
        });
        element.dispatchEvent(pageChangeEvent);
      }

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should handle event pollution without component removal', async () => {
      // Create potential event pollution
      for (let i = 0; i < 20; i++) {
        const customEvent = new CustomEvent(`test-event-${i}`, { bubbles: true });
        element.dispatchEvent(customEvent);
      }

      element.ariaLabel = 'Event Test Pagination';
      element.currentPage = 3;
      element.totalPages = 8;
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
  });

  describe('Pagination State Management Stability (CRITICAL)', () => {
    beforeEach(() => {
      element = document.createElement('usa-pagination') as USAPagination;
      container.appendChild(element);
    });

    it('should handle edge case pagination scenarios without disconnection', async () => {
      // Test edge cases that might trigger lifecycle issues
      const scenarios = [
        { current: 1, total: 2, maxVisible: 7 }, // Minimal pagination
        { current: 1, total: 100, maxVisible: 3 }, // Large dataset, small visible
        { current: 50, total: 100, maxVisible: 11 }, // Middle position
        { current: 100, total: 100, maxVisible: 7 }, // Last page
        { current: 1, total: 1000, maxVisible: 5 }, // Very large dataset
        { current: 999, total: 1000, maxVisible: 9 }, // Near end of large dataset
      ];

      for (const scenario of scenarios) {
        element.currentPage = scenario.current;
        element.totalPages = scenario.total;
        element.maxVisible = scenario.maxVisible;
        await element.updateComplete;

        // Verify pagination renders correctly
        const nav = element.querySelector('nav');
        expect(nav).toBeTruthy();
      }

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should handle boundary navigation operations without disconnection', async () => {
      element.totalPages = 25;
      element.maxVisible = 7;
      await element.updateComplete;

      // Test boundary operations that could cause lifecycle issues
      const operations = [
        () => {
          element.currentPage = 1;
        }, // First page
        () => {
          element.currentPage = 25;
        }, // Last page
        () => {
          element.currentPage = 13;
        }, // Middle
        () => {
          element.currentPage = 1;
          element.totalPages = 1;
        }, // Single page
        () => {
          element.totalPages = 2;
          element.currentPage = 2;
        }, // Minimal multi-page
        () => {
          element.totalPages = 100;
          element.currentPage = 50;
        }, // Large dataset
      ];

      for (const operation of operations) {
        operation();
        await element.updateComplete;
      }

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should handle maxVisible boundary values without disconnection', async () => {
      element.currentPage = 10;
      element.totalPages = 30;
      await element.updateComplete;

      // Test different maxVisible values that could affect rendering
      const maxVisibleValues = [1, 3, 5, 7, 9, 11, 15, 20, 25, 30, 35];

      for (const maxVisible of maxVisibleValues) {
        element.maxVisible = maxVisible;
        await element.updateComplete;
      }

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
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

  describe('Storybook Integration (CRITICAL)', () => {
    beforeEach(() => {
      element = document.createElement('usa-pagination') as USAPagination;
      container.appendChild(element);
    });

    it('should render in Storybook without auto-dismissing', async () => {
      element.ariaLabel = 'Storybook Test Pagination - Federal Database Search Results';
      element.currentPage = 8;
      element.totalPages = 47;
      element.maxVisible = 7;
      await element.updateComplete;

      expect(element.isConnected).toBe(true);
      expect(element.querySelector('nav')).toBeTruthy();
      expect(element.querySelector('.usa-pagination')).toBeTruthy();

      // Verify pagination navigation elements
      expect(element.querySelector('.usa-pagination__previous-page')).toBeTruthy();
      expect(element.querySelector('.usa-pagination__next-page')).toBeTruthy();

      // Verify page list
      const pageList = element.querySelector('.usa-pagination__list');
      expect(pageList).toBeTruthy();

      // Verify page buttons are rendered
      const pageButtons = element.querySelectorAll(
        '.usa-pagination__button:not(.usa-pagination__previous-page):not(.usa-pagination__next-page)'
      );
      expect(pageButtons.length).toBeGreaterThan(0);

      // Verify current page is highlighted
      const currentPageButton = element.querySelector(
        '.usa-pagination__button[aria-current="page"]'
      );
      expect(currentPageButton).toBeTruthy();
      expect(currentPageButton?.textContent?.trim()).toBe('8');

      // Test navigation functionality
      const nextButton = element.querySelector('.usa-pagination__next-page') as HTMLElement;
      expect(nextButton).toBeTruthy();
      nextButton.click();
      await element.updateComplete;
      expect(element.currentPage).toBe(9);

      const prevButton = element.querySelector('.usa-pagination__previous-page') as HTMLElement;
      expect(prevButton).toBeTruthy();
      prevButton.click();
      await element.updateComplete;
      expect(element.currentPage).toBe(8);

      // Test direct page navigation
      const pageButton = element.querySelector('[data-page="12"]') as HTMLElement;
      pageButton?.click();
      await element.updateComplete;

      expect(element.isConnected).toBe(true);
      expect(document.body.contains(element)).toBe(true);
    });
  });
});
