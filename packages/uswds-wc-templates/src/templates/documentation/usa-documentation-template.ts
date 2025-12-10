import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// Import USWDS core styles

// Import USWDS web components
import '@uswds-wc/feedback';
import '@uswds-wc/navigation';
import '@uswds-wc/layout';

/**
 * Navigation item interface for sidenav
 */
export interface NavItem {
  label: string;
  href?: string;
  current?: boolean;
  subnav?: NavItem[];
}

/**
 * USA Documentation Template
 *
 * Documentation/content page template with side navigation.
 * Ideal for help pages, guides, and structured content.
 *
 * **Template Structure (from USWDS):**
 * - Skip navigation + Banner + Header
 * - Side navigation (responsive)
 * - Main content area with prose styling
 * - Footer + Identifier
 *
 * @element usa-documentation-template
 *
 * @slot sidenav - Custom side navigation
 * @slot breadcrumb - Breadcrumb navigation
 * @slot content - Main documentation content
 * @slot header - Site header
 * @slot footer - Site footer
 *
 * @fires {CustomEvent} template-ready - Fired when template initializes
 *
 * @example Basic usage with content
 * ```html
 * <usa-documentation-template>
 *   <nav slot="sidenav">
 *     <usa-sidenav></usa-sidenav>
 *   </nav>
 *   <article slot="content">
 *     <h1>Documentation Title</h1>
 *     <p>Content goes here...</p>
 *   </article>
 * </usa-documentation-template>
 * ```
 *
 * @example With navigation items property
 * ```html
 * <usa-documentation-template
 *   .navItems="${[
 *     { label: 'Overview', href: '#overview', current: true },
 *     { label: 'Getting Started', href: '#getting-started' }
 *   ]}"
 * >
 *   <article slot="content">...</article>
 * </usa-documentation-template>
 * ```
 *
 * @uswds-template https://designsystem.digital.gov/templates/documentation-page/
 */
@customElement('usa-documentation-template')
export class USADocumentationTemplate extends LitElement {
  // Use Light DOM for USWDS compatibility
  protected override createRenderRoot() {
    return this;
  }

  /**
   * Page language attribute
   */
  @property({ type: String })
  override lang = 'en';

  /**
   * Whether to show the government banner
   */
  @property({ type: Boolean, attribute: 'show-banner' })
  showBanner = true;

  /**
   * Whether to show the identifier at the bottom
   */
  @property({ type: Boolean, attribute: 'show-identifier' })
  showIdentifier = true;

  /**
   * Side navigation position
   */
  @property({ type: String, attribute: 'sidenav-position' })
  sidenavPosition: 'left' | 'right' = 'left';

  /**
   * Content column width
   */
  @property({ type: String, attribute: 'content-width' })
  contentWidth: 'narrow' | 'wide' = 'wide';

  /**
   * Side navigation items (JSON array)
   */
  @property({ type: Array })
  navItems: NavItem[] = [];

  /**
   * Side navigation aria label
   */
  @property({ type: String, attribute: 'sidenav-label' })
  sidenavLabel = 'Secondary navigation';

  override connectedCallback() {
    super.connectedCallback();
    if (this.lang) {
      this.setAttribute('lang', this.lang);
    }
  }

  override firstUpdated(changedProperties: Map<string, any>) {
    super.firstUpdated(changedProperties);
    this.dispatchEvent(
      new CustomEvent('template-ready', {
        detail: { template: 'documentation' },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Check if a slot has content
   */
  private hasSlotContent(slotName: string): boolean {
    return this.querySelector(`[slot="${slotName}"]`) !== null;
  }

  /**
   * Render a single navigation item
   */
  private renderNavItem(item: NavItem): any {
    const hasSubnav = item.subnav && item.subnav.length > 0;

    return html`
      <li class="usa-sidenav__item">
        <a href="${item.href || '#'}" class="${item.current ? 'usa-current' : ''}">
          ${item.label}
        </a>
        ${hasSubnav
          ? html`
              <ul class="usa-sidenav__sublist">
                ${item.subnav!.map((subitem) => this.renderNavItem(subitem))}
              </ul>
            `
          : nothing}
      </li>
    `;
  }

  /**
   * Render side navigation
   */
  private renderSidenav() {
    if (this.hasSlotContent('sidenav')) {
      return html`<slot name="sidenav"></slot>`;
    }

    // Only render default sidenav if we have items
    if (!this.navItems?.length) {
      return nothing;
    }

    return html`
      <nav aria-label="${this.sidenavLabel}">
        <ul class="usa-sidenav">
          ${this.navItems.map((item) => this.renderNavItem(item))}
        </ul>
      </nav>
    `;
  }

  /**
   * Get sidenav column classes
   */
  private getSidenavClasses(): string {
    return 'usa-layout-docs__sidenav display-none desktop:display-block desktop:grid-col-3';
  }

  /**
   * Get content column classes
   */
  private getContentClasses(): string {
    const baseClasses = 'usa-prose';
    const colWidth = this.contentWidth === 'narrow' ? 'desktop:grid-col-6' : 'desktop:grid-col-9';
    return `${colWidth} ${baseClasses}`;
  }

  override render() {
    const sidenavFirst = this.sidenavPosition === 'left';

    return html`
      <div class="usa-documentation-template">
        <!-- Skip Navigation -->
        <usa-skip-link href="#main-content" text="Skip to main content"></usa-skip-link>

        <!-- Government Banner -->
        ${this.showBanner ? html`<usa-banner></usa-banner>` : nothing}

        <!-- Header -->
        <slot name="header"></slot>

        <!-- Breadcrumb -->
        <slot name="breadcrumb"></slot>

        <!-- Main Content Area -->
        <div class="usa-section">
          <div class="grid-container">
            <div class="grid-row grid-gap">
              ${sidenavFirst
                ? html`
                    <div class="${this.getSidenavClasses()}">${this.renderSidenav()}</div>
                    <main id="main-content" class="${this.getContentClasses()}">
                      <slot name="content"></slot>
                    </main>
                  `
                : html`
                    <main id="main-content" class="${this.getContentClasses()}">
                      <slot name="content"></slot>
                    </main>
                    <div class="${this.getSidenavClasses()}">${this.renderSidenav()}</div>
                  `}
            </div>

            <!-- Mobile Sidenav (below content) -->
            <div class="usa-layout-docs__sidenav desktop:display-none">${this.renderSidenav()}</div>
          </div>
        </div>

        <!-- Footer -->
        <slot name="footer"></slot>

        <!-- Identifier -->
        ${this.showIdentifier ? html`<usa-identifier></usa-identifier>` : nothing}
      </div>
    `;
  }

  /**
   * Public API: Set navigation items
   */
  setNavItems(items: NavItem[]): void {
    this.navItems = [...items];
  }

  /**
   * Public API: Add a navigation item
   */
  addNavItem(item: NavItem): void {
    this.navItems = [...this.navItems, item];
  }

  /**
   * Public API: Set current page in navigation
   */
  setCurrentPage(href: string): void {
    const updateCurrent = (items: NavItem[]): NavItem[] => {
      return items.map((item) => ({
        ...item,
        current: item.href === href,
        subnav: item.subnav ? updateCurrent(item.subnav) : undefined,
      }));
    };

    this.navItems = updateCurrent(this.navItems);
  }
}
