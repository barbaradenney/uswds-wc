import { html, css } from 'lit';
import { USWDSBaseComponent } from '@uswds-wc/core';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

// Import official USWDS compiled CSS

/**
 * ARCHITECTURE: Option B (Pure Global Init)
 * - USWDS is initialized globally via .on(document) in .storybook/preview-head.html
 * - This component ONLY renders HTML structure
 * - All behavior managed by USWDS event delegation
 * - Component properties synced to USWDS-created elements
 *
 * USA Pagination Web Component
 *
 * A simple, accessible USWDS pagination implementation as a custom element.
 * Uses official USWDS classes and styling with minimal custom code.
 *
 * @element usa-pagination
 * @fires page-change - Dispatched when page changes
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-js-reference https://github.com/uswds/uswds/tree/develop/packages/usa-pagination/src/index.js
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-pagination/src/styles/_usa-pagination.scss
 * @uswds-docs https://designsystem.digital.gov/components/pagination/
 * @uswds-guidance https://designsystem.digital.gov/components/pagination/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/pagination/#accessibility
 */
@customElement('usa-pagination')
export class USAPagination extends USWDSBaseComponent {
  static override styles = css`
    :host {
      display: block;
    }
  `;

  @property({ type: Number, attribute: 'current-page' })
  currentPage = 1;

  @property({ type: Number, attribute: 'total-pages' })
  totalPages = 1;

  @property({ type: Number, attribute: 'max-visible' })
  maxVisible = 7;

  @property({ type: String, attribute: 'aria-label' })
  override ariaLabel = 'Pagination';

  public getVisiblePages(): (number | string)[] {
    if (this.totalPages <= this.maxVisible) {
      // Show all pages if total pages is less than max visible
      const pages: number[] = [];
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // For maxVisible constraint, we need to be more careful
    // Structure: [1] [...] [start...end] [...] [last]
    // This means we have at most: 1 + 1 + (end-start+1) + 1 + 1 = maxVisible
    // So the window size should be maxVisible - 4 (for first, ellipsis, ellipsis, last)

    const pages: (number | string)[] = [];

    // If maxVisible is very small, just show current page and neighbors
    if (this.maxVisible <= 3) {
      const start = Math.max(1, this.currentPage - Math.floor(this.maxVisible / 2));
      const end = Math.min(this.totalPages, start + this.maxVisible - 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Determine if we need ellipsis
    const needsStartEllipsis = this.currentPage > Math.ceil(this.maxVisible / 2) + 1;
    const needsEndEllipsis = this.currentPage < this.totalPages - Math.ceil(this.maxVisible / 2);

    // Calculate the window size for the middle section
    let windowSize = this.maxVisible;
    if (needsStartEllipsis) windowSize -= 2; // Account for "1" and "..."
    if (needsEndEllipsis) windowSize -= 2; // Account for "..." and "last"

    // Calculate the window around current page
    const halfWindow = Math.floor(windowSize / 2);
    let startPage = Math.max(1, this.currentPage - halfWindow);
    let endPage = Math.min(this.totalPages, this.currentPage + halfWindow);

    // Adjust window if we're near boundaries
    if (!needsStartEllipsis) {
      endPage = Math.min(this.totalPages, this.maxVisible - (needsEndEllipsis ? 2 : 0));
      startPage = 1;
    }
    if (!needsEndEllipsis) {
      startPage = Math.max(1, this.totalPages - this.maxVisible + 1 + (needsStartEllipsis ? 2 : 0));
      endPage = this.totalPages;
    }

    // Build the pages array
    if (needsStartEllipsis) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }

    // Add the window pages
    for (let i = startPage; i <= endPage; i++) {
      if (!(needsStartEllipsis && i === 1)) {
        // Don't duplicate page 1
        pages.push(i);
      }
    }

    // Add end ellipsis and last page
    if (needsEndEllipsis) {
      if (endPage < this.totalPages - 1) {
        pages.push('...');
      }
      pages.push(this.totalPages);
    }

    return pages;
  }

  override connectedCallback() {
    super.connectedCallback();

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');
  }

  override firstUpdated(changedProperties: Map<string, any>) {
    super.firstUpdated(changedProperties);

    // Note: USWDS Pagination is CSS-only for styling.
    // Page navigation is handled by the component's handlePageClick method.
    // No dynamic imports needed - works in all environments (bundled, CDN, SSR).
  }

  private handlePageClick(event: Event, page: number) {
    event.preventDefault();

    if (page === this.currentPage || page < 1 || page > this.totalPages) {
      return;
    }

    const oldPage = this.currentPage;
    this.currentPage = page;

    // Dispatch page change event
    this.dispatchEvent(
      new CustomEvent('page-change', {
        detail: {
          page: this.currentPage,
          oldPage: oldPage,
          totalPages: this.totalPages,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private renderPreviousButton() {
    if (this.currentPage <= 1) return '';

    return html`
      <li class="usa-pagination__item usa-pagination__arrow">
        <a
          href="#"
          class="usa-pagination__link usa-pagination__previous-page"
          aria-label="Previous page"
          @click=${(e: Event) => this.handlePageClick(e, this.currentPage - 1)}
        >
          <span>‹ Previous</span>
        </a>
      </li>
    `;
  }

  private renderNextButton() {
    if (this.currentPage >= this.totalPages) return '';

    return html`
      <li class="usa-pagination__item usa-pagination__arrow">
        <a
          href="#"
          class="usa-pagination__link usa-pagination__next-page"
          aria-label="Next page"
          @click=${(e: Event) => this.handlePageClick(e, this.currentPage + 1)}
        >
          <span>Next ›</span>
        </a>
      </li>
    `;
  }

  private renderPageItem(page: number | string) {
    if (page === '...') {
      return html`
        <li class="usa-pagination__item usa-pagination__overflow">
          <span>…</span>
        </li>
      `;
    }

    const pageNum = page as number;
    const isCurrent = pageNum === this.currentPage;

    return html`
      <li class="usa-pagination__item">
        <a
          href="#"
          class="usa-pagination__button ${isCurrent ? 'usa-current' : ''}"
          aria-label="Page ${pageNum}"
          aria-current=${ifDefined(isCurrent ? 'page' : undefined)}
          data-page="${pageNum}"
          @click=${(e: Event) => this.handlePageClick(e, pageNum)}
        >
          ${pageNum}
        </a>
      </li>
    `;
  }

  override render() {
    if (this.totalPages <= 1) {
      // Return empty template for no pagination needed
      return html``;
    }

    const visiblePages = this.getVisiblePages();

    return html`
      <nav aria-label="${this.ariaLabel}" role="navigation" class="usa-pagination">
        <ul class="usa-pagination__list">
          ${this.renderPreviousButton()} ${visiblePages.map((page) => this.renderPageItem(page))}
          ${this.renderNextButton()}
        </ul>
      </nav>
    `;
  }
}
