import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { USWDSBaseComponent } from '@uswds-wc/core';
import { USWDSVirtualScroller } from '@uswds-wc/core';
import { initializeTable } from './usa-table-behavior.js';

// Import official USWDS compiled CSS
import '@uswds-wc/core/styles.css';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  sortType?: 'text' | 'number' | 'date' | 'percentage';
  sticky?: boolean;
}

export interface TableRow {
  [key: string]: string | number | Date;
}

/**
 * USA Table Web Component
 *
 * Minimal wrapper around USWDS table functionality.
 * Uses USWDS-mirrored behavior pattern for 100% behavioral parity.
 *
 * @element usa-table
 * @fires table-sort - Dispatched when a sortable column is clicked
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-js-reference https://github.com/uswds/uswds/tree/develop/packages/usa-table/src/index.js
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-table/src/styles/_usa-table.scss
 * @uswds-docs https://designsystem.digital.gov/components/table/
 * @uswds-guidance https://designsystem.digital.gov/components/table/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/table/#accessibility
 */
@customElement('usa-table')
export class USATable extends USWDSBaseComponent {
  static override styles = css`
    :host {
      display: block;
    }
    :host([hidden]) {
      display: none;
    }
  `;

  @property({ type: String })
  caption = '';

  @property({ type: Array })
  headers: TableColumn[] = [];

  // Alias for headers to match common API expectations
  get columns() {
    return this.headers;
  }
  set columns(value: TableColumn[]) {
    this.headers = value;
  }

  @property({ type: Array })
  data: TableRow[] = [];

  @property({ type: Boolean })
  striped = false;

  @property({ type: Boolean })
  borderless = false;

  @property({ type: Boolean })
  compact = false;

  @property({ type: Boolean })
  stacked = false;

  @property({ type: Boolean })
  stackedHeader = false;

  @property({ type: Boolean })
  stickyHeader = false;

  @property({ type: Boolean })
  scrollable = false;

  @property({ type: String })
  sortColumn = '';

  @property({ type: String, attribute: 'sort-direction' })
  sortDirection: 'asc' | 'desc' = 'asc';

  @property({ type: Boolean })
  virtual = false;

  @property({ type: Number })
  rowHeight = 48;

  @property({ type: Number })
  containerHeight = 400;

  private virtualScroller?: USWDSVirtualScroller;
  private visibleRange = { start: 0, end: 0 };
  private slottedContent: string = '';
  private slottedContentApplied: boolean = false;

  // Store cleanup function from behavior
  private cleanup?: () => void;

  // Track initialization state for tests
  private _initialized = false;

  /** Returns true if USWDS behavior has been initialized */
  get initialized(): boolean {
    return this._initialized;
  }
  // Computed property for visible data
  private get visibleData(): TableRow[] {
    if (!this.virtual) {
      return this.data;
    }

    const { start, end } = this.visibleRange;
    return this.data.slice(start, end + 1);
  }

  // Light DOM is handled by USWDSBaseComponent

  override connectedCallback() {
    super.connectedCallback();

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');

    // Capture any initial slotted content before render
    // This allows using BOTH property-based data AND custom slotted table content
    if (this.childNodes.length > 0) {
      this.slottedContent = Array.from(this.childNodes)
        .map((node) =>
          node.nodeType === Node.TEXT_NODE ? node.textContent : (node as Element).outerHTML || ''
        )
        .join('');
      // Clear content to prevent duplication
      this.innerHTML = '';
    }

    if (this.virtual) {
      this.setupVirtualScrolling();
    }

    // Note: USWDS initialization moved to firstUpdated() to ensure DOM is ready
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanup?.();
    this.virtualScroller?.destroy();
  }

  override async firstUpdated(changedProperties: Map<string, any>) {
    // ARCHITECTURE: Script Tag Pattern
    // USWDS is loaded globally via script tag in .storybook/preview-head.html
    // Components just render HTML - USWDS enhances automatically via window.USWDS

    // ARCHITECTURE: USWDS-Mirrored Behavior Pattern
    // Uses dedicated behavior file (usa-table-behavior.ts) that replicates USWDS source exactly

    super.firstUpdated(changedProperties);

    // Wait for DOM to be fully rendered
    await this.updateComplete;
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));

    // Ensure required elements exist before initialization
    this.ensureRequiredElements();

    // Initialize using mirrored USWDS behavior
    // Pass `this` as root so selectOrMatches can find sortable headers within this component
    this.cleanup = initializeTable(this);

    // Mark as initialized for tests
    this._initialized = true;
    this.dispatchEvent(
      new CustomEvent('table-initialized', {
        bubbles: true,
        composed: true,
      })
    );

    // Bridge USWDS behavior with component state
    // Listen for clicks on sort buttons to sync USWDS sorting with component properties
    this.setupSortSync();
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    if (changedProperties.has('data') && this.virtual) {
      this.updateVirtualData();
    }

    if (changedProperties.has('virtual') && this.virtual && !this.virtualScroller) {
      this.setupVirtualScrolling();
    }

    // Apply captured content using DOM manipulation
    this.applySlottedContent();

    // Ensure announcement region persists after re-renders
    // (Lit re-renders wipe out USWDS-set live region content otherwise)
    // Only run when properties that affect the table structure change
    // to avoid infinite update loops from DOM manipulation
    if (
      changedProperties.has('headers') ||
      changedProperties.has('data') ||
      changedProperties.has('scrollable') ||
      changedProperties.has('sortColumn') ||
      changedProperties.has('sortDirection') ||
      changedProperties.has('striped') ||
      changedProperties.has('borderless')
    ) {
      this.ensureRequiredElements();
    }
  }

  private applySlottedContent() {
    // Only apply slotted content once to prevent duplication
    if (this.slottedContent && !this.slottedContentApplied) {
      const slotElement = this.querySelector('slot:not([name])');
      if (slotElement) {
        // Parse content safely using DOMParser instead of innerHTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<div>${this.slottedContent}</div>`, 'text/html');
        const tempDiv = doc.querySelector('div');

        if (tempDiv) {
          // Replace slot with parsed nodes
          const nodes = Array.from(tempDiv.childNodes);
          if (nodes.length > 0) {
            // Insert nodes before slot
            this.slottedContentApplied = true;
            nodes.forEach((node) => {
              slotElement.parentNode?.insertBefore(node, slotElement);
            });
            // Remove the slot
            slotElement.remove();
          }
        }
      }
    }
  }

  private setupVirtualScrolling() {
    if (!this.virtual || this.data.length === 0) return;

    // Find or create scrollable container
    const scrollContainer =
      (this.querySelector('.usa-table-virtual-container') as HTMLElement) ||
      this.createVirtualContainer();

    this.virtualScroller = new USWDSVirtualScroller(scrollContainer, {
      itemHeight: this.rowHeight,
      containerHeight: this.containerHeight,
      overscan: 5,
      onRender: (start: number, end: number) => {
        this.visibleRange = { start, end };
        this.requestUpdate(); // Trigger re-render with new visible range
      },
    });

    this.virtualScroller.setTotalItems(this.data.length);

    // Listen for virtual render events - only when USWDS table isn't handling scroll
    // Note: This is functional CSS for virtualization performance, not overlapping with USWDS table sorting
    if (!(this as any).uswdsInitialized) {
      scrollContainer.addEventListener(
        'virtual-render',
        this.handleVirtualRender.bind(this) as EventListener
      );
    }
  }

  private createVirtualContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'usa-table-virtual-container';
    return container;
  }

  private updateVirtualData() {
    if (!this.virtualScroller) return;

    this.virtualScroller.setTotalItems(this.data.length);
  }

  private handleVirtualRender(event: CustomEvent) {
    const { startIndex, endIndex } = event.detail;
    this.visibleRange = { start: startIndex, end: endIndex };
    this.requestUpdate(); // Trigger re-render with new visible range
  }

  private getSortValue(value: string | number | Date, _column: TableColumn): string {
    if (value === undefined || value === null) return '';
    return String(value);
  }

  /**
   * Format cell value based on column type
   */
  private formatCellValue(value: string | number | Date, column: TableColumn): string {
    if (value === undefined || value === null) return 'undefined';

    switch (column.sortType) {
      case 'percentage': {
        const numValue = typeof value === 'number' ? value : parseFloat(String(value));
        return isNaN(numValue) ? String(value) : `${numValue}%`;
      }

      case 'date': {
        if (value instanceof Date) {
          return isNaN(value.getTime()) ? 'Invalid Date' : value.toLocaleDateString();
        }
        const dateValue = new Date(String(value));
        return isNaN(dateValue.getTime()) ? 'Invalid Date' : dateValue.toLocaleDateString();
      }

      case 'number': {
        const num = typeof value === 'number' ? value : parseFloat(String(value));
        return isNaN(num) ? String(value) : num.toString();
      }

      case 'text':
      default:
        return String(value);
    }
  }

  /**
   * Setup sync between USWDS behavior and component state
   * Listens for USWDS sort actions and updates component properties
   */
  private setupSortSync() {
    // Listen for clicks on sortable headers or sort buttons (USWDS creates buttons dynamically)
    this.addEventListener('click', (event: Event) => {
      const target = event.target as HTMLElement;

      // Try to find sort button first (USWDS pattern)
      const sortButton = target.closest('.usa-table__header__button') as HTMLElement | null;
      let header: HTMLTableHeaderCellElement | null = null;

      if (sortButton) {
        // Found the USWDS-created button, get its parent header
        header = sortButton.closest('th[data-sortable]') as HTMLTableHeaderCellElement;
      } else {
        // No button found - check if clicked directly on sortable header (test scenario)
        header = target.closest('th[data-sortable]') as HTMLTableHeaderCellElement;
      }

      if (header) {
        // Get column index from header position
        const allHeaders = Array.from(header.parentNode?.children || []) as HTMLElement[];
        const headerIndex = allHeaders.indexOf(header);

        if (headerIndex >= 0 && headerIndex < this.headers.length) {
          const column = this.headers[headerIndex];

          // Check if we're sorting a new column or toggling the same column
          // CRITICAL: Read aria-sort from USWDS behavior instead of managing our own state!
          // The USWDS behavior has already set the aria-sort attribute correctly.
          // We just need to sync our component state with it.
          const currentAriaSort = header.getAttribute('aria-sort');
          let newDirection: 'asc' | 'desc';

          if (currentAriaSort === 'ascending') {
            newDirection = 'asc';
          } else if (currentAriaSort === 'descending') {
            newDirection = 'desc';
          } else {
            // Fallback - should not happen if USWDS behavior ran first
            newDirection = 'asc';
          }

          // Capture old data before sorting
          const oldData = this.data;

          // Update component state synchronously
          this.sortColumn = column.key;
          this.sortDirection = newDirection;

          // Sort the component's data array synchronously
          this.sortData();

          // Force a re-render after sorting with correct old/new values
          this.requestUpdate('data', oldData);

          // Dispatch event synchronously for external listeners
          this.dispatchEvent(
            new CustomEvent('table-sort', {
              detail: {
                column: column.key,
                direction: this.sortDirection,
                sortType: column.sortType || 'text',
              },
              bubbles: true,
              composed: true,
            })
          );

          // DO NOT update aria-sort here! USWDS behavior has already set it correctly.
          // We are just syncing our component state with what USWDS did.
        }
      }
    });
  }

  /**
   * Sort the table data based on current sort column and direction
   */
  private sortData() {
    if (!this.sortColumn || !this.data) return;

    const column = this.headers.find((h) => h.key === this.sortColumn);
    if (!column || !column.sortable) return;

    // Create a sorted copy of the data
    const sortedData = [...this.data].sort((a, b) => {
      const aValue = a[this.sortColumn];
      const bValue = b[this.sortColumn];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      let comparison = 0;

      switch (column.sortType) {
        case 'number':
        case 'percentage': {
          const aNum = typeof aValue === 'number' ? aValue : parseFloat(String(aValue));
          const bNum = typeof bValue === 'number' ? bValue : parseFloat(String(bValue));
          comparison = aNum - bNum;
          break;
        }

        case 'date': {
          const aDate = aValue instanceof Date ? aValue : new Date(String(aValue));
          const bDate = bValue instanceof Date ? bValue : new Date(String(bValue));
          comparison = aDate.getTime() - bDate.getTime();
          break;
        }

        case 'text':
        default:
          comparison = String(aValue).localeCompare(String(bValue));
          break;
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });

    // Assign the sorted array to trigger Lit's reactivity
    // In light DOM, we need to ensure the array reference changes
    this.data = sortedData;
  }

  /**
   * Ensure required DOM elements exist before USWDS initialization
   * USWDS table expects certain elements for accessibility features
   */
  private ensureRequiredElements() {
    const table = this.querySelector('table');
    if (!table) return;

    // Ensure table has proper USWDS classes
    if (!table.classList.contains('usa-table')) {
      table.classList.add('usa-table');
    }

    // Create announcement region if it doesn't exist
    // This must persist across renders (not in template) so USWDS updates aren't wiped out
    const nextEl = table.nextElementSibling;
    if (!nextEl || !nextEl.classList.contains('usa-table__announcement-region')) {
      // Only create if it truly doesn't exist
      // Check if it exists elsewhere in the container first (might have been moved by Lit)
      const existingRegion = this.querySelector('.usa-table__announcement-region') as HTMLElement;

      if (existingRegion) {
        // Move it to the correct position (after table)
        table.after(existingRegion);
      } else {
        // Create new one
        const liveRegion = document.createElement('div');
        liveRegion.className = 'usa-table__announcement-region usa-sr-only';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        table.after(liveRegion);
      }
    }
  }

  private renderHeaderCell(column: TableColumn) {
    if (column.sortable) {
      // CRITICAL: Do NOT render aria-sort attribute until after first sort!
      // USWDS behavior adds aria-sort dynamically via setAttribute() in sortRows().
      // Rendering aria-sort="none" initially breaks USWDS's assumption that
      // unsorted headers have NO aria-sort attribute.
      //
      // USWDS pattern (from usa-table-behavior.ts):
      // - Unsorted headers: no aria-sort attribute (checked via getAttribute(SORTED) === null)
      // - After first click: setAttribute(SORTED, ...) adds the attribute
      // - unsetSort(): removeAttribute(SORTED) removes it when unsorting
      //
      // The component syncs state but lets USWDS control the attribute lifecycle.

      return html`
        <th
          role="columnheader"
          scope="col"
          data-sortable
          aria-sort="${ifDefined(
            this.sortColumn === column.key
              ? this.sortDirection === 'asc'
                ? 'ascending'
                : 'descending'
              : undefined
          )}"
        >
          ${column.label}
        </th>
      `;
    }

    return html`<th role="columnheader" scope="col">${column.label}</th>`;
  }

  private renderDataCell(
    row: TableRow,
    column: TableColumn,
    _rowIndex: number,
    columnIndex: number
  ) {
    const value = row[column.key];
    const formattedValue = this.formatCellValue(value, column);

    // Add data-sort-value for proper sorting when display value differs
    const sortValue = this.getSortValue(value, column);

    // Add USWDS utility classes for numeric data
    const cellClasses = [];
    if (column.sortType === 'number' || column.sortType === 'percentage') {
      cellClasses.push('font-mono-sm', 'text-tabular', 'text-right');
    }

    // First column should be th with scope="row" for accessibility
    if (columnIndex === 0) {
      return html`
        <th
          scope="row"
          role="rowheader"
          data-label="${column.label}"
          data-sort-value="${ifDefined(sortValue !== formattedValue ? sortValue : undefined)}"
          class="${cellClasses.join(' ')}"
        >
          ${formattedValue}
        </th>
      `;
    }

    return html`
      <td
        data-label="${column.label}"
        data-sort-value="${ifDefined(sortValue !== formattedValue ? sortValue : undefined)}"
        class="${cellClasses.join(' ')}"
      >
        ${formattedValue}
      </td>
    `;
  }

  private renderTableRow(row: TableRow, rowIndex: number) {
    return html`
      <tr>
        ${this.headers.map((column, columnIndex) =>
          this.renderDataCell(
            row,
            column,
            this.virtual ? this.visibleRange.start + rowIndex : rowIndex,
            columnIndex
          )
        )}
      </tr>
    `;
  }

  private renderCaption() {
    // Always render caption (USWDS requires it), but hide with usa-sr-only if not set
    const captionClass = this.caption ? '' : 'usa-sr-only';
    const captionText = this.caption || 'Data table';

    return html`
      <caption class="${captionClass}">
        ${captionText}
      </caption>
    `;
  }

  private renderTableHead() {
    if (this.headers.length === 0) return '';

    return html`
      <thead class="usa-table__head">
        <tr>
          ${this.headers.map((column) => this.renderHeaderCell(column))}
        </tr>
      </thead>
    `;
  }

  private renderEmptyRow() {
    return html`
      <tr>
        <td colspan="${this.headers.length || 1}">
          <slot name="empty">No data available</slot>
        </td>
      </tr>
    `;
  }

  private renderTableBody() {
    return html`
      <tbody class="usa-table__body">
        ${this.visibleData.length === 0
          ? this.renderEmptyRow()
          : this.visibleData.map((row, rowIndex) => this.renderTableRow(row, rowIndex))}
      </tbody>
    `;
  }

  private renderTable() {
    const tableClasses = [
      'usa-table',
      this.striped ? 'usa-table--striped' : '',
      this.borderless ? 'usa-table--borderless' : '',
      this.compact ? 'usa-table--compact' : '',
      this.stacked ? 'usa-table--stacked' : '',
      this.stackedHeader ? 'usa-table--stacked-header' : '',
      this.stickyHeader ? 'usa-table--sticky-header' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <table class="${tableClasses}" role="table">
        ${this.renderCaption()} ${this.renderTableHead()} ${this.renderTableBody()}

        <!-- Allow for custom content -->
        <slot></slot>
      </table>

      <!-- Announcement region is created in ensureRequiredElements() and persists across renders -->
    `;
  }

  // Use light DOM for USWDS compatibility
  protected override createRenderRoot(): HTMLElement {
    return this as any;
  }

  override render() {
    // Always include table container wrapper for USWDS compatibility
    const containerClasses = [
      'usa-table-container',
      this.scrollable ? 'usa-table-container--scrollable' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <div
        class="${containerClasses}"
        tabindex="${this.scrollable ? '0' : ''}"
        role="${this.scrollable ? 'region' : ''}"
        aria-labelledby="${this.scrollable ? 'table-title' : ''}"
      >
        ${this.renderTable()}
      </div>
    `;
  }
}
