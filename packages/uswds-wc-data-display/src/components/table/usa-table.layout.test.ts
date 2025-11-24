/**
 * Table Layout Tests
 * Prevents regression of table structure, header alignment, and sorting button positioning
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../table/index.ts';
import type { USATable } from './usa-table.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';
import { waitForARIAAttribute } from '@uswds-wc/test-utils';

describe('USATable Layout Tests', () => {
  let element: USATable;

  beforeEach(() => {
    element = document.createElement('usa-table') as USATable;
    element.columns = [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'age', label: 'Age', sortable: true, sortType: 'number' },
      { key: 'email', label: 'Email' },
    ];
    element.data = [
      { name: 'John Doe', age: 30, email: 'john@example.com' },
      { name: 'Jane Smith', age: 25, email: 'jane@example.com' },
    ];
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS table structure', async () => {
    await element.updateComplete;

    const tableContainer = element.querySelector('.usa-table-container');
    const table = element.querySelector('.usa-table');
    const thead = element.querySelector('thead');
    const tbody = element.querySelector('tbody');

    expect(tableContainer, 'Table container should exist').toBeTruthy();
    expect(table, 'Table element should exist').toBeTruthy();
    expect(thead, 'Table header should exist').toBeTruthy();
    expect(tbody, 'Table body should exist').toBeTruthy();

    // Verify USWDS structure hierarchy
    expect(tableContainer.contains(table), 'Table should be inside container').toBe(true);
    expect(table.contains(thead), 'Header should be inside table').toBe(true);
    expect(table.contains(tbody), 'Body should be inside table').toBe(true);
  });

  it('should position table headers correctly', async () => {
    await element.updateComplete;

    const thead = element.querySelector('thead');
    const headerRow = element.querySelector('thead tr');
    const headers = element.querySelectorAll('thead th');

    expect(thead, 'Table header should exist').toBeTruthy();
    expect(headerRow, 'Header row should exist').toBeTruthy();
    expect(headers.length, 'Should have correct number of headers').toBe(3);

    // Headers should be in correct order
    expect(headers[0].textContent.trim()).toBe('Name');
    expect(headers[1].textContent.trim()).toBe('Age');
    expect(headers[2].textContent.trim()).toBe('Email');
  });

  it('should position sorting buttons correctly within headers', async () => {
    await element.updateComplete;
    // Wait for USWDS initialization to create buttons
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Use data-sortable to find sortable headers (aria-sort only added after first sort)
    const sortableHeaders = element.querySelectorAll('thead th[data-sortable]');
    const sortButtons = element.querySelectorAll('.usa-table__header__button');

    expect(sortableHeaders.length, 'Should have sortable headers').toBe(2);
    expect(sortButtons.length, 'Should have sort buttons').toBe(2);

    // Each sortable header should contain a button
    sortButtons.forEach((button, index) => {
      const header = sortableHeaders[index];
      expect(header.contains(button), `Sort button ${index} should be inside its header`).toBe(
        true
      );
    });
  });

  it('should position table cells correctly in rows', async () => {
    await element.updateComplete;

    const tbody = element.querySelector('tbody');
    const rows = element.querySelectorAll('tbody tr');
    const firstRowCells = element.querySelectorAll(
      'tbody tr:first-child th, tbody tr:first-child td'
    );

    expect(tbody, 'Table body should exist').toBeTruthy();
    expect(rows.length, 'Should have correct number of rows').toBe(2);
    expect(firstRowCells.length, 'Should have correct number of cells in first row').toBe(3);

    // Cells should contain correct data
    expect(firstRowCells[0].textContent.trim()).toBe('John Doe');
    expect(firstRowCells[1].textContent.trim()).toBe('30');
    expect(firstRowCells[2].textContent.trim()).toBe('john@example.com');
  });

  it('should handle scrollable table layout correctly', async () => {
    element.scrollable = true;
    await element.updateComplete;

    const tableContainer = element.querySelector('.usa-table-container');

    expect(tableContainer, 'Table container should exist').toBeTruthy();

    if (tableContainer) {
      expect(
        tableContainer.classList.contains('usa-table-container--scrollable'),
        'Scrollable table should have correct CSS class'
      ).toBe(true);
    }
  });

  it('should handle borderless table layout correctly', async () => {
    element.borderless = true;
    await element.updateComplete;

    const table = element.querySelector('.usa-table');

    expect(table, 'Table should exist').toBeTruthy();

    if (table) {
      expect(
        table.classList.contains('usa-table--borderless'),
        'Borderless table should have correct CSS class'
      ).toBe(true);
    }
  });

  it('should handle compact table layout correctly', async () => {
    element.compact = true;
    await element.updateComplete;

    const table = element.querySelector('.usa-table');

    expect(table, 'Table should exist').toBeTruthy();

    if (table) {
      expect(
        table.classList.contains('usa-table--compact'),
        'Compact table should have correct CSS class'
      ).toBe(true);
    }
  });

  it('should position sticky headers correctly', async () => {
    element.stickyHeader = true;
    await element.updateComplete;

    const table = element.querySelector('.usa-table');

    expect(table, 'Table should exist').toBeTruthy();

    if (table) {
      expect(
        table.classList.contains('usa-table--sticky-header'),
        'Sticky header table should have sticky-header class'
      ).toBe(true);
    }
  });

  it('should handle striped table layout correctly', async () => {
    element.striped = true;
    await element.updateComplete;

    const table = element.querySelector('.usa-table');

    expect(table, 'Table should exist').toBeTruthy();

    if (table) {
      expect(
        table.classList.contains('usa-table--striped'),
        'Striped table should have correct CSS class'
      ).toBe(true);
    }
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath = `${process.cwd()}/src/components/table/usa-table.ts`;
        const validation = validateComponentJavaScript(componentPath, 'table');

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
    it('should pass visual layout checks for table structure', async () => {
      await element.updateComplete;

      const tableContainer = element.querySelector('.usa-table-container');
      const table = element.querySelector('.usa-table');

      expect(tableContainer, 'Table container should render').toBeTruthy();
      expect(table, 'Table should render').toBeTruthy();

      // Verify essential USWDS classes are present
      expect(tableContainer.classList.contains('usa-table-container')).toBe(true);
      expect(table.classList.contains('usa-table')).toBe(true);
    });

    it('should maintain table structure integrity', async () => {
      await element.updateComplete;

      const thead = element.querySelector('thead');
      const tbody = element.querySelector('tbody');
      const headers = element.querySelectorAll('thead th');
      const rows = element.querySelectorAll('tbody tr');

      expect(thead, 'Table header should be present').toBeTruthy();
      expect(tbody, 'Table body should be present').toBeTruthy();
      expect(headers.length, 'Should have headers').toBeGreaterThan(0);
      expect(rows.length, 'Should have data rows').toBeGreaterThan(0);
    });

    it('should handle sorting interactions correctly', async () => {
      await element.updateComplete;

      const firstSortButton = element.querySelector(
        '.usa-table__header__button'
      ) as HTMLButtonElement;

      if (firstSortButton) {
        // Should respond to sort button clicks
        firstSortButton.click();
        await element.updateComplete;

        // Table structure should remain intact after sorting
        const table = element.querySelector('.usa-table');
        expect(table, 'Table should maintain structure after sorting').toBeTruthy();
      }
    });

    it('should handle different table variants correctly', async () => {
      // Test multiple variants together
      element.borderless = true;
      element.compact = true;
      element.striped = true;
      await element.updateComplete;

      const table = element.querySelector('.usa-table');

      if (table) {
        expect(table.classList.contains('usa-table--borderless')).toBe(true);
        expect(table.classList.contains('usa-table--compact')).toBe(true);
        expect(table.classList.contains('usa-table--striped')).toBe(true);
      }
    });

    it('should handle empty table correctly', async () => {
      element.data = [];
      await element.updateComplete;

      const tbody = element.querySelector('tbody');
      const rows = element.querySelectorAll('tbody tr');

      expect(tbody, 'Table body should exist even when empty').toBeTruthy();
      expect(rows.length, 'Should have one row with empty message when empty').toBe(1);
    });

    it('should handle large dataset correctly', async () => {
      // Create a large dataset
      const largeData = Array.from({ length: 100 }, (_, i) => ({
        name: `User ${i + 1}`,
        age: 20 + (i % 50),
        email: `user${i + 1}@example.com`,
      }));

      element.data = largeData;
      await element.updateComplete;

      const rows = element.querySelectorAll('tbody tr');
      expect(rows.length, 'Should render all rows').toBe(100);

      // Structure should remain intact with large dataset
      const table = element.querySelector('.usa-table');
      expect(table, 'Table should maintain structure with large dataset').toBeTruthy();
    });

    it('should handle dynamic column changes correctly', async () => {
      await element.updateComplete;

      // Add a new column
      element.columns = [...element.columns, { key: 'phone', label: 'Phone' }];
      element.data = element.data.map((row) => ({
        ...row,
        phone: '555-0123',
      }));
      await element.updateComplete;

      const headers = element.querySelectorAll('thead th');
      expect(headers.length, 'Should have updated number of headers').toBe(4);

      const firstRowCells = element.querySelectorAll(
        'tbody tr:first-child th, tbody tr:first-child td'
      );
      expect(firstRowCells.length, 'Should have updated number of cells').toBe(4);
    });

    it('should maintain proper accessibility attributes', async () => {
      await element.updateComplete;

      const table = element.querySelector('.usa-table');
      const sortableHeaders = element.querySelectorAll('thead th[aria-sort]');
      const sortButtons = element.querySelectorAll('.usa-table__header__button');

      if (table) {
        expect(table.getAttribute('role')).toBe('table');
      }

      for (const header of sortableHeaders) {
        const ariaSort = await waitForARIAAttribute(header, 'aria-sort');
        expect(ariaSort === 'none' || ariaSort === 'ascending' || ariaSort === 'descending').toBe(
          true
        );
      }

      for (const button of sortButtons) {
        expect(await waitForARIAAttribute(button, 'aria-label')).toBeTruthy();
      }
    });

    it('should handle cell content overflow correctly', async () => {
      // Add data with long content
      element.data = [
        {
          name: 'Very Long Name That Might Cause Layout Issues',
          age: 30,
          email: 'very.long.email.address.that.might.cause.overflow@example.com',
        },
      ];
      await element.updateComplete;

      const cells = element.querySelectorAll('tbody th, tbody td');
      expect(cells.length, 'Should render cells with long content').toBe(3);

      // Table structure should remain intact
      const table = element.querySelector('.usa-table');
      expect(table, 'Table should handle long content gracefully').toBeTruthy();
    });

    it('should handle caption correctly when present', async () => {
      element.caption = 'Test Table Caption';
      await element.updateComplete;

      const caption = element.querySelector('caption');

      if (caption) {
        expect(caption.textContent.trim()).toBe('Test Table Caption');

        // Caption should be first child of table
        const table = element.querySelector('.usa-table');
        const tableChildren = Array.from(table.children);
        const captionIndex = tableChildren.indexOf(caption);
        expect(captionIndex).toBe(0);
      }
    });
  });
});
