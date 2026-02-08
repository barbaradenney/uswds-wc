import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// Import official USWDS compiled CSS

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

/**
 * USA Breadcrumb Web Component
 *
 * A simple, accessible USWDS breadcrumb implementation as a custom element.
 * Uses official USWDS classes and styling with minimal custom code.
 *
 * @element usa-breadcrumb
 * @fires breadcrumb-click - Dispatched when a breadcrumb item is clicked
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-js-reference https://github.com/uswds/uswds/tree/develop/packages/usa-breadcrumb/src/index.js
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-breadcrumb/src/styles/_usa-breadcrumb.scss
 * @uswds-docs https://designsystem.digital.gov/components/breadcrumb/
 * @uswds-guidance https://designsystem.digital.gov/components/breadcrumb/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/breadcrumb/#accessibility
 */
@customElement('usa-breadcrumb')
export class USABreadcrumb extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
  `;

  @property({ type: Array })
  items: BreadcrumbItem[] = [];

  @property({ type: Boolean, reflect: true })
  wrap = false;

  @property({ type: Number, attribute: 'count' })
  count = 0;

  // Use light DOM for USWDS compatibility
  protected override createRenderRoot(): HTMLElement {
    return this as any;
  }

  override connectedCallback() {
    super.connectedCallback();

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');

    // Parse item attributes if items array is empty and count is specified
    this.parseItemAttributes();
  }

  /**
   * Parse item1-label, item1-href, item2-label, etc. attributes into items array
   * This supports declarative HTML usage for prototyping tools
   */
  private parseItemAttributes() {
    // Only parse if items is empty and we have count or item attributes
    if (this.items.length > 0) return;

    const count = this.count || this.getAttributeCount();
    if (count === 0) return;

    const parsedItems: BreadcrumbItem[] = [];
    for (let i = 1; i <= count; i++) {
      const label = this.getAttribute(`item${i}-label`);
      if (label) {
        parsedItems.push({
          label,
          href: this.getAttribute(`item${i}-href`) || undefined,
          current: i === count, // Last item is current by default
        });
      }
    }

    if (parsedItems.length > 0) {
      this.items = parsedItems;
    }
  }

  /**
   * Detect item count from attributes if not explicitly set
   */
  private getAttributeCount(): number {
    let count = 0;
    for (let i = 1; i <= 10; i++) {
      if (this.getAttribute(`item${i}-label`)) {
        count = i;
      } else {
        break;
      }
    }
    return count;
  }

  private handleItemClick(item: BreadcrumbItem, e: Event) {
    if (item.current) {
      e.preventDefault();
      return;
    }

    this.dispatchEvent(
      new CustomEvent('breadcrumb-click', {
        detail: {
          label: item.label,
          href: item.href,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
  }
  private renderBreadcrumbItem(item: BreadcrumbItem) {
    return html`
      <li class="usa-breadcrumb__list-item ${item.current ? 'usa-current' : ''}">
        ${this.renderBreadcrumbLink(item)}
      </li>
    `;
  }

  private renderBreadcrumbLink(item: BreadcrumbItem) {
    if (item.href && !item.current) {
      return html`
        <a
          href="${item.href}"
          class="usa-breadcrumb__link"
          @click="${(e: Event) => this.handleItemClick(item, e)}"
        >
          <span>${item.label}</span>
        </a>
      `;
    }

    if (item.current) {
      return html`<span aria-current="page">${item.label}</span>`;
    }

    return html`<span>${item.label}</span>`;
  }

  override render() {
    // Process items to determine current status and default hrefs
    const processedItems = this.items.map((item, index) => {
      const isLast = index === this.items.length - 1;
      const hasExplicitCurrent = this.items.some((i) => i.current);

      return {
        ...item,
        current: item.current || (isLast && (!hasExplicitCurrent || !item.href)),
        href: item.href || (item.current || (isLast && !hasExplicitCurrent) ? undefined : '#'),
      } as BreadcrumbItem;
    });

    return html`
      <nav
        class="usa-breadcrumb${this.wrap ? ' usa-breadcrumb--wrap' : ''}"
        aria-label="Breadcrumbs"
      >
        <ol class="usa-breadcrumb__list">
          ${processedItems.map((item) => this.renderBreadcrumbItem(item))}
        </ol>
      </nav>
    `;
  }
}
