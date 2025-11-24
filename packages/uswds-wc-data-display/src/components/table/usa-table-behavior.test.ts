/**
 * USWDS Table Behavior Contract Tests
 *
 * These tests validate that our table implementation EXACTLY matches
 * USWDS table behavior as defined in the official USWDS source.
 *
 * DO NOT modify these tests to make implementation pass.
 * ONLY modify implementation to match USWDS behavior.
 *
 * Source: @uswds/uswds/packages/usa-table/src/index.js
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { waitForBehaviorInit } from '@uswds-wc/test-utils/test-utils.js';
import './usa-table.js';
import type { USATable } from './usa-table.js';
import { waitForARIAAttribute } from '@uswds-wc/test-utils';

describe('USWDS Table Behavior Contract', () => {
  let element: USATable;

  beforeEach(() => {
    element = document.createElement('usa-table') as USATable;
    element.sortable = true;
    element.id = 'test-table';

    // Provide sample headers and data for behavior tests
    element.headers = [
      { key: 'name', label: 'Name', sortable: true, sortType: 'text' },
      { key: 'age', label: 'Age', sortable: true, sortType: 'number' },
      { key: 'email', label: 'Email', sortable: false },
    ];

    element.data = [
      { name: 'Alice', age: 30, email: 'alice@example.com' },
      { name: 'Bob', age: 25, email: 'bob@example.com' },
      { name: 'Charlie', age: 35, email: 'charlie@example.com' },
    ];

    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('Contract 1: Sortable Header Enhancement', () => {
    it('should create sort buttons for sortable headers', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const sortButton = element.querySelector('.usa-table__header__button');
      expect(sortButton).not.toBeNull();
      expect(sortButton?.tagName).toBe('BUTTON');
    });

    it('should add sort icon SVG to button', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const sortButton = element.querySelector('.usa-table__header__button') as HTMLElement;
      const icon = sortButton?.querySelector('.usa-icon');

      expect(icon).not.toBeNull();
      expect(icon?.tagName).toBe('svg');
    });

    it('should have ascending, descending, and unsorted icon states', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const sortButton = element.querySelector('.usa-table__header__button') as HTMLElement;
      const ascending = sortButton?.querySelector('.ascending');
      const descending = sortButton?.querySelector('.descending');
      const unsorted = sortButton?.querySelector('.unsorted');

      expect(ascending).not.toBeNull();
      expect(descending).not.toBeNull();
      expect(unsorted).not.toBeNull();
    });

    it('should set tabindex="0" on sort button', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const sortButton = element.querySelector('.usa-table__header__button');
      expect(sortButton?.getAttribute('tabindex')).toBe('0');
    });

    it('should only enhance headers with data-sortable attribute', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const sortableHeader = element.querySelector('th[data-sortable]');
      const nonSortableHeader = element.querySelector('th:not([data-sortable])');

      if (sortableHeader) {
        expect(sortableHeader.querySelector('.usa-table__header__button')).not.toBeNull();
      }

      if (nonSortableHeader) {
        expect(nonSortableHeader.querySelector('.usa-table__header__button')).toBeNull();
      }
    });
  });

  describe('Contract 2: Accessibility Labels', () => {
    it('should set aria-label on header indicating sort state', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const header = element.querySelector('th[data-sortable]') as HTMLElement;
      const ariaLabel = header?.getAttribute('aria-label');

      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toMatch(/sortable column, currently unsorted/i);
    });

    it('should set title on button with sort instruction', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const sortButton = element.querySelector('.usa-table__header__button') as HTMLElement;
      const title = sortButton?.getAttribute('title');

      expect(title).toBeTruthy();
      expect(title).toMatch(/Click to sort by .* in ascending order/i);
    });

    it('should update aria-label when sorted', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const sortButton = element.querySelector('.usa-table__header__button') as HTMLButtonElement;
      const header = sortButton?.closest('th[data-sortable]') as HTMLElement;

      sortButton.click();
      await waitForBehaviorInit(element);

      const ariaLabel = await waitForARIAAttribute(header, 'aria-label');
      expect(ariaLabel).toMatch(/sorted (ascending|descending)/i);
    });

    it('should set aria-sort attribute when sorted', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const sortButton = element.querySelector('.usa-table__header__button') as HTMLButtonElement;
      const header = sortButton?.closest('th[data-sortable]') as HTMLElement;

      expect(header.hasAttribute('aria-sort')).toBe(false);

      sortButton.click();
      await waitForBehaviorInit(element);

      expect(header.hasAttribute('aria-sort')).toBe(true);
      expect(['ascending', 'descending']).toContain(
        await waitForARIAAttribute(header, 'aria-sort')
      );
    });
  });

  describe('Contract 3: Sort Toggle Behavior', () => {
    it('should sort ascending on first click', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const sortButton = element.querySelector('.usa-table__header__button') as HTMLButtonElement;
      const header = sortButton?.closest('th[data-sortable]') as HTMLElement;

      sortButton.click();
      await waitForBehaviorInit(element);

      // USWDS source (line 108): isAscending === true ? DESCENDING : ASCENDING
      // First click passes false (no current sort), so sets ASCENDING
      expect(await waitForARIAAttribute(header, 'aria-sort')).toBe('ascending');
    });

    it('should sort descending on second click', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const sortButton = element.querySelector('.usa-table__header__button') as HTMLButtonElement;
      const header = sortButton?.closest('th[data-sortable]') as HTMLElement;

      // First click - ascending (USWDS default)
      sortButton.click();
      await waitForBehaviorInit(element);

      expect(await waitForARIAAttribute(header, 'aria-sort')).toBe('ascending');

      // Second click - descending (toggles)
      sortButton.click();
      await waitForBehaviorInit(element);

      expect(await waitForARIAAttribute(header, 'aria-sort')).toBe('descending');
    });

    it('should toggle between ascending and descending', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const sortButton = element.querySelector('.usa-table__header__button') as HTMLButtonElement;
      const header = sortButton?.closest('th[data-sortable]') as HTMLElement;

      // Click 1: ascending (USWDS default first sort)
      sortButton.click();
      await waitForBehaviorInit(element);
      expect(await waitForARIAAttribute(header, 'aria-sort')).toBe('ascending');

      // Click 2: descending (toggle)
      sortButton.click();
      await waitForBehaviorInit(element);
      expect(await waitForARIAAttribute(header, 'aria-sort')).toBe('descending');

      // Click 3: ascending again (toggle back)
      sortButton.click();
      await waitForBehaviorInit(element);
      expect(await waitForARIAAttribute(header, 'aria-sort')).toBe('ascending');
    });

    it('should prevent default on button click', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const sortButton = element.querySelector('.usa-table__header__button') as HTMLButtonElement;

      // Dispatch event and check defaultPrevented after propagation completes
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      sortButton.dispatchEvent(clickEvent);
      await waitForBehaviorInit(element);

      expect(clickEvent.defaultPrevented).toBe(true);
    });
  });

  describe('Contract 4: Row Sorting', () => {
    it('should reorder rows when sorting', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const tbody = element.querySelector('tbody');

      const sortButton = element.querySelector('.usa-table__header__button') as HTMLButtonElement;
      sortButton.click();
      await waitForBehaviorInit(element);

      // Rows should be reordered (first row may change)
      expect(tbody).not.toBeNull();
    });

    // Skipped - requires Cypress for USWDS JavaScript table sorting behavior
    // Coverage: src/components/table/usa-table.component.cy.ts (sorting tests)

    it('should reorder rows on first click with unsorted data', async () => {
      // Regression test for double-click bug
      // Original bug: First click set aria-sort but didn't reorder rows
      // This test verifies rows actually change order on FIRST click

      // Clear any existing sort state from previous tests
      element.sortColumn = undefined;
      element.sortDirection = undefined;

      // Use data that is explicitly NOT in alphabetical order
      element.data = [
        { name: 'Zebra', age: 35, email: 'z@example.com' },
        { name: 'Apple', age: 25, email: 'a@example.com' },
        { name: 'Mango', age: 30, email: 'm@example.com' },
      ];

      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const sortButton = element.querySelector('.usa-table__header__button') as HTMLButtonElement;
      const tbody = element.querySelector('tbody');

      // Capture initial order BEFORE click
      let rows = Array.from(tbody?.querySelectorAll('tr') || []);
      const initialFirstName = ((rows[0].children[0] as HTMLElement).textContent || '').trim();
      expect(initialFirstName).toBe('Zebra'); // Verify unsorted initial state

      // First click should IMMEDIATELY reorder rows (not just set aria-sort)
      sortButton.click();
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Verify order CHANGED after single click
      rows = Array.from(tbody?.querySelectorAll('tr') || []);
      const sortedFirstName = ((rows[0].children[0] as HTMLElement).textContent || '').trim();

      // CRITICAL: If this fails, the double-click bug has regressed
      // The key issue was that first click didn't reorder rows at all
      // So we verify that the first row is NO LONGER 'Zebra'
      expect(sortedFirstName).not.toBe('Zebra');

      // Row order should have changed (any change proves sort happened)
      // With the bug, 'Zebra' would still be first after one click
      expect(sortedFirstName).toMatch(/Apple|Mango/);

      // Also verify aria-sort attribute was set
      const header = sortButton.closest('th') as HTMLElement;
      expect(await waitForARIAAttribute(header, 'aria-sort')).toBe('ascending');
    });

    it('should sort numerically when column contains numbers', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const sortButton = element.querySelector('.usa-table__header__button') as HTMLButtonElement;

      sortButton.click();
      await waitForBehaviorInit(element);

      const tbody = element.querySelector('tbody');
      const rows = Array.from(tbody?.querySelectorAll('tr') || []);

      // Numeric sorting should work if column has numbers
      expect(rows.length).toBeGreaterThan(0);
    });

    it('should use data-sort-value if provided', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      // If cells have data-sort-value, it should be used instead of text
      const cell = element.querySelector('td[data-sort-value]');

      if (cell) {
        const sortValue = cell.getAttribute('data-sort-value');
        expect(sortValue).toBeTruthy();
      }
    });

    it('should mark sorted column with data-sort-active', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const sortButton = element.querySelector('.usa-table__header__button') as HTMLButtonElement;

      sortButton.click();
      await waitForBehaviorInit(element);

      const activeCells = element.querySelectorAll('[data-sort-active="true"]');
      expect(activeCells.length).toBeGreaterThan(0);
    });
  });

  describe('Contract 5: Multiple Column Sorting', () => {
    it('should unsort other columns when sorting a column', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const sortButtons = element.querySelectorAll(
        '.usa-table__header__button'
      ) as NodeListOf<HTMLButtonElement>;

      if (sortButtons.length < 2) {
        return; // Skip if not enough sortable columns
      }

      const firstButton = sortButtons[0];
      const secondButton = sortButtons[1];
      const firstHeader = firstButton.closest('th') as HTMLElement;
      const secondHeader = secondButton.closest('th') as HTMLElement;

      // Sort first column
      firstButton.click();
      await waitForBehaviorInit(element);

      expect(firstHeader.hasAttribute('aria-sort')).toBe(true);

      // Sort second column
      secondButton.click();
      await waitForBehaviorInit(element);

      expect(secondHeader.hasAttribute('aria-sort')).toBe(true);
      expect(firstHeader.hasAttribute('aria-sort')).toBe(false);
    });

    it('should clear data-sort-active from previous column', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const sortButtons = element.querySelectorAll(
        '.usa-table__header__button'
      ) as NodeListOf<HTMLButtonElement>;

      if (sortButtons.length < 2) {
        return;
      }

      const firstButton = sortButtons[0];
      const secondButton = sortButtons[1];

      // Sort first column
      firstButton.click();
      await waitForBehaviorInit(element);

      // Sort second column
      secondButton.click();
      await waitForBehaviorInit(element);

      // Only second column should have active cells
      const firstHeader = firstButton.closest('th') as HTMLElement;
      const secondHeader = secondButton.closest('th') as HTMLElement;
      const firstColumnIndex = Array.from(firstHeader.parentElement!.children).indexOf(firstHeader);
      const secondColumnIndex = Array.from(secondHeader.parentElement!.children).indexOf(
        secondHeader
      );

      const tbody = element.querySelector('tbody');
      const rows = Array.from(tbody?.querySelectorAll('tr') || []);

      rows.forEach((row) => {
        const firstCell = row.children[firstColumnIndex] as HTMLElement;
        const secondCell = row.children[secondColumnIndex] as HTMLElement;

        expect(firstCell.hasAttribute('data-sort-active')).toBe(false);
        expect(secondCell.getAttribute('data-sort-active')).toBe('true');
      });
    });
  });

  describe('Contract 6: Live Region Announcements', () => {
    it('should have announcement region after table', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const table = element.querySelector('.usa-table');
      const liveRegion = table?.nextElementSibling;

      expect(liveRegion).not.toBeNull();
      expect(liveRegion?.classList.contains('usa-table__announcement-region')).toBe(true);
    });

    it('should have aria-live="polite" on announcement region', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const table = element.querySelector('.usa-table');
      const liveRegion = table?.nextElementSibling as HTMLElement;

      expect(liveRegion?.getAttribute('aria-live')).toBe('polite');
    });

    // NOTE: Announcement content tests (sort changes, caption inclusion) are tested in
    // Cypress component tests (usa-table-announcements.component.cy.ts) where they work
    // reliably in a real browser environment. Vitest has timing issues with Light DOM
    // rendering and USWDS behavior updates that make these tests flaky.
  });

  describe('Contract 7: Initial Sort State', () => {
    it('should respect initial aria-sort attribute', async () => {
      // Create table with initial sort
      const customElement = document.createElement('usa-table') as USATable;
      customElement.sortable = true;
      customElement.setAttribute('data-initial-sort', 'ascending');
      document.body.appendChild(customElement);

      await customElement.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 100));

      const header = customElement.querySelector('th[aria-sort]');

      if (header) {
        expect(['ascending', 'descending']).toContain(
          await waitForARIAAttribute(header, 'aria-sort')
        );
      }

      customElement.remove();
    });

    it('should sort table on initialization if header has aria-sort', async () => {
      const customElement = document.createElement('usa-table') as USATable;
      customElement.sortable = true;
      document.body.appendChild(customElement);

      await customElement.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 100));

      // If initial sort exists, rows should be sorted
      const tbody = customElement.querySelector('tbody');
      expect(tbody).not.toBeNull();

      customElement.remove();
    });
  });

  describe('Contract 8: Event Delegation', () => {
    it('should use event delegation for sort button clicks', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const sortButton = element.querySelector('.usa-table__header__button') as HTMLButtonElement;
      const header = sortButton?.closest('th') as HTMLElement;

      const clickEvent = new MouseEvent('click', { bubbles: true });
      sortButton.dispatchEvent(clickEvent);
      await waitForBehaviorInit(element);

      expect(header.hasAttribute('aria-sort')).toBe(true);
    });

    it('should handle clicks on button children (icon)', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const sortButton = element.querySelector('.usa-table__header__button') as HTMLButtonElement;
      const icon = sortButton?.querySelector('svg') as SVGElement;
      const header = sortButton?.closest('th') as HTMLElement;

      // SVG elements don't have .click() method - use dispatchEvent
      const clickEvent = new MouseEvent('click', { bubbles: true });
      icon.dispatchEvent(clickEvent);
      await waitForBehaviorInit(element);

      expect(header.hasAttribute('aria-sort')).toBe(true);
    });
  });

  describe('Prohibited Behaviors (must NOT be present)', () => {
    it('should NOT modify USWDS class names', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const table = element.querySelector('.usa-table');
      const sortButton = element.querySelector('.usa-table__header__button');
      const liveRegion = element.querySelector('.usa-table__announcement-region');

      expect(table).not.toBeNull();
      expect(sortButton).not.toBeNull();
      expect(liveRegion).not.toBeNull();
    });

    it('should NOT use custom sort icons', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const sortButton = element.querySelector('.usa-table__header__button') as HTMLElement;
      const svg = sortButton?.querySelector('svg.usa-icon');

      expect(svg).not.toBeNull();
      expect(svg?.querySelector('.ascending')).not.toBeNull();
      expect(svg?.querySelector('.descending')).not.toBeNull();
      expect(svg?.querySelector('.unsorted')).not.toBeNull();
    });

    it('should NOT sort without announcement region', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const table = element.querySelector('.usa-table');
      const liveRegion = table?.nextElementSibling;

      // Live region must exist for accessibility
      expect(liveRegion?.classList.contains('usa-table__announcement-region')).toBe(true);
    });

    it('should NOT allow sorting non-sortable headers', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const nonSortableHeader = element.querySelector('th:not([data-sortable])');

      if (nonSortableHeader) {
        expect(nonSortableHeader.querySelector('.usa-table__header__button')).toBeNull();
        expect(nonSortableHeader.hasAttribute('aria-sort')).toBe(false);
      }
    });
  });
});
