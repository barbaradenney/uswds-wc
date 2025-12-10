import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

// Import official USWDS compiled CSS

export interface SideNavItem {
  label: string;
  href?: string;
  current?: boolean;
  subnav?: SideNavItem[];
}

/**
 * USA Side Navigation Web Component
 *
 * A simple, accessible USWDS side navigation implementation as a custom element.
 * Uses official USWDS classes and styling with minimal custom code.
 *
 * @element usa-side-navigation
 * @fires sidenav-click - Dispatched when navigation item is clicked
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-nav/src/styles/_usa-nav.scss
 * @uswds-docs https://designsystem.digital.gov/components/sidenav/
 * @uswds-guidance https://designsystem.digital.gov/components/sidenav/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/sidenav/#accessibility
 */
@customElement('usa-side-navigation')
export class USASideNavigation extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
  `;

  @property({ type: Array })
  items: SideNavItem[] = [];

  @property({ type: String, attribute: 'aria-label' })
  override ariaLabel = 'Secondary navigation';

  private slottedContent: string = '';
  private slottedContentApplied: boolean = false;
  private uswdsInitialized = false;

  // Use light DOM for USWDS compatibility
  protected override createRenderRoot(): HTMLElement {
    return this as any;
  }

  override connectedCallback() {
    super.connectedCallback();

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');

    // Capture any initial slotted content before render
    // This allows using BOTH property-based items AND custom slotted navigation
    if (this.childNodes.length > 0) {
      this.slottedContent = this.innerHTML;
      this.innerHTML = '';
    }

    this.initializeUSWDSSideNavigation();
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);
    // Apply captured content using DOM manipulation
    this.applySlottedContent();
  }

  private applySlottedContent() {
    // Only apply slotted content once to prevent duplication
    if (this.slottedContent && !this.slottedContentApplied) {
      const slotElement = this.querySelector('slot');
      if (slotElement) {
        // Parse content safely using DOMParser instead of innerHTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<div>${this.slottedContent}</div>`, 'text/html');
        const tempDiv = doc.querySelector('div');

        if (tempDiv) {
          slotElement.replaceWith(...Array.from(tempDiv.childNodes));
          this.slottedContentApplied = true;
        }
      }
    }
  }

  private handleItemClick(item: SideNavItem, e: Event) {
    // Don't prevent default if this is a real link
    if (!item.href) {
      e.preventDefault();
    }

    this.dispatchEvent(
      new CustomEvent('sidenav-click', {
        detail: {
          item: item,
          label: item.label,
          href: item.href,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private renderNavItem(item: SideNavItem): any {
    const itemClasses = 'usa-sidenav__item';
    const linkClasses = item.current ? 'usa-current' : '';

    return html`
      <li class="${itemClasses}">
        <a
          href="${item.href || 'javascript:void(0);'}"
          class="${linkClasses}"
          aria-current="${ifDefined(item.current ? 'page' : undefined)}"
          @click="${(e: Event) => this.handleItemClick(item, e)}"
        >
          ${item.label}
        </a>
        ${this.renderSubnav(item.subnav)}
      </li>
    `;
  }

  private initializeUSWDSSideNavigation() {
    if (this.uswdsInitialized) {
      return;
    }

    // Note: USWDS side navigation is purely presentational with no JavaScript behavior
    console.log(
      '📋 SideNavigation: Initialized as presentational component (no USWDS JavaScript required)'
    );
    this.uswdsInitialized = true;
  }

  private renderSubnav(subnav?: SideNavItem[]) {
    if (!subnav || subnav.length === 0) return '';

    return html`
      <ul class="usa-sidenav__sublist">
        ${subnav.map((subItem: SideNavItem) => this.renderNavItem(subItem))}
      </ul>
    `;
  }

  private renderNavItems() {
    return this.items.map((item) => this.renderNavItem(item));
  }
  override render() {
    if (this.items.length === 0) return html`<slot></slot>`;

    return html`
      <nav aria-label="${this.ariaLabel}">
        <ul class="usa-sidenav usa-sidenav__list">
          ${this.renderNavItems()}
        </ul>
      </nav>
    `;
  }
}
