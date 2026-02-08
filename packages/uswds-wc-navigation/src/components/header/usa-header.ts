import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { USWDSBaseComponent } from '@uswds-wc/core';
import { initializeHeader } from './usa-header-behavior.js';

// Import official USWDS compiled CSS

// Import usa-search component from actions package
// Using main package entry point since component subpaths are not built separately
import '@uswds-wc/actions';

// Import usa-language-selector component
import '../language-selector/index.js';

// Import usa-icon component for close icon
import '@uswds-wc/data-display';

export interface NavItem {
  label: string;
  href?: string;
  current?: boolean;
  submenu?: NavItem[];
  megamenu?: MegamenuColumn[];
}

export interface MegamenuColumn {
  links: NavItem[];
}

export interface SecondaryLink {
  label: string;
  href: string;
}

/**
 * USA Header Web Component
 *
 * Minimal wrapper around USWDS header functionality.
 * Uses USWDS-mirrored behavior pattern for 100% behavioral parity.
 *
 * @element usa-header
 *
 * @slot - Default slot for custom header content
 *
 * @attr {string} logoText - Text for the site logo/title.
 * @attr {string} logoHref - URL for the logo link. Defaults to '/'.
 * @attr {string} logoImageSrc - URL for logo image.
 * @attr {string} logoImageAlt - Alt text for logo image.
 * @attr {boolean} extended - Use extended header variant with megamenu support.
 * @attr {boolean} showSearch - Show search form in header.
 * @attr {string} searchPlaceholder - Placeholder text for search input. Defaults to 'Search'.
 * @attr {boolean} showLanguageSelector - Show language selector.
 * @attr {number} sec-count - Number of secondary (utility) links to display (0-4).
 * @attr {string} sec1-label - Label for secondary link 1.
 * @attr {string} sec1-href - URL for secondary link 1.
 * @attr {string} sec2-label - Label for secondary link 2.
 * @attr {string} sec2-href - URL for secondary link 2.
 * @attr {string} sec3-label - Label for secondary link 3.
 * @attr {string} sec3-href - URL for secondary link 3.
 * @attr {string} sec4-label - Label for secondary link 4.
 * @attr {string} sec4-href - URL for secondary link 4.
 *
 * @prop {Array<{label: string, href?: string, current?: boolean, submenu?: NavItem[], megamenu?: MegamenuColumn[]}>} navItems - Navigation items array.
 * @prop {Array<{label: string, href: string}>} secondaryLinks - Secondary navigation links.
 * @prop {Array<{value: string, label: string}>} languages - Available languages for selector.
 *
 * @fires nav-click - Dispatched when a navigation item is clicked
 * @fires mobile-menu-toggle - Dispatched when mobile menu is toggled
 * @fires search-submit - Dispatched when search form is submitted
 *
 * @example
 * ```html
 * <!-- Basic header with navigation -->
 * <usa-header
 *   logoText="Agency Name"
 *   .navItems=${[
 *     { label: 'Home', href: '/', current: true },
 *     { label: 'About', href: '/about' },
 *     { label: 'Services', href: '/services' }
 *   ]}
 * ></usa-header>
 *
 * <!-- Extended header with search -->
 * <usa-header
 *   extended
 *   logoText="Department Name"
 *   showSearch
 *   searchPlaceholder="Search site..."
 *   .navItems=${navItems}
 * ></usa-header>
 *
 * <!-- Header with dropdown menus -->
 * <usa-header
 *   logoText="Agency"
 *   .navItems=${[
 *     { label: 'Products', submenu: [
 *       { label: 'Product A', href: '/products/a' },
 *       { label: 'Product B', href: '/products/b' }
 *     ]}
 *   ]}
 * ></usa-header>
 *
 * <!-- Header with logo image -->
 * <usa-header
 *   logoImageSrc="/images/logo.svg"
 *   logoImageAlt="Agency Logo"
 *   .navItems=${navItems}
 * ></usa-header>
 * ```
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 * @see usa-header-behavior.ts - USWDS behavior mirror
 *
 * @uswds-js-reference https://github.com/uswds/uswds/tree/develop/packages/usa-header/src/index.js
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-header/src/styles/_usa-header.scss
 * @uswds-docs https://designsystem.digital.gov/components/header/
 * @uswds-guidance https://designsystem.digital.gov/components/header/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/header/#accessibility
 */
@customElement('usa-header')
export class USAHeader extends USWDSBaseComponent {
  static override styles = css`
    :host {
      display: block;
    }
  `;

  @property({ type: String })
  logoText = '';

  @property({ type: String })
  logoHref = '/';

  @property({ type: String })
  logoImageSrc = '';

  @property({ type: String })
  logoImageAlt = '';

  @property({ type: Array })
  navItems: NavItem[] = [];

  @property({ type: Array })
  secondaryLinks: SecondaryLink[] = [];

  // Store slotted content for Light DOM compatibility
  private slottedContent: string = '';
  private slottedContentApplied: boolean = false;

  @property({ type: Boolean, reflect: true })
  extended = false;

  @property({ type: Boolean, reflect: true })
  showSearch = false;

  @property({ type: String })
  searchPlaceholder = 'Search';

  @property({ type: Boolean, reflect: true })
  mobileMenuOpen = false;

  // Store cleanup function from behavior
  private cleanup?: () => void;

  override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('data-web-component-managed', 'true');

    // Capture any initial slotted content before render
    // This allows using BOTH property-based navItems AND custom slotted navigation
    if (this.childNodes.length > 0) {
      this.slottedContent = this.innerHTML;
      this.innerHTML = '';
    }

    // Initialize secondary links from sec-count/sec1-label/sec1-href attributes
    this.initSecondaryLinksFromAttributes();
  }

  /**
   * Read sec-count, sec1-label, sec1-href, etc. attributes and populate
   * the existing secondaryLinks property.
   */
  private initSecondaryLinksFromAttributes() {
    const count = parseInt(this.getAttribute('sec-count') || '0', 10);
    if (count > 0) {
      const links: SecondaryLink[] = [];
      for (let i = 1; i <= count; i++) {
        links.push({
          label: this.getAttribute(`sec${i}-label`) || `Link ${i}`,
          href: this.getAttribute(`sec${i}-href`) || '#',
        });
      }
      this.secondaryLinks = links;
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanup?.();
  }

  override async firstUpdated(changedProperties: Map<string, any>) {
    // ARCHITECTURE: Script Tag Pattern
    // USWDS is loaded globally via script tag in .storybook/preview-head.html
    // Components just render HTML - USWDS enhances automatically via window.USWDS

    // ARCHITECTURE: USWDS-Mirrored Behavior Pattern
    // Uses dedicated behavior file (usa-header-behavior.ts) that replicates USWDS source exactly

    super.firstUpdated(changedProperties);

    // Wait for DOM to be fully rendered
    await this.updateComplete;
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));

    // Initialize using mirrored USWDS behavior
    // Disable hideNonNavElements to prevent ancestor elements from being hidden
    // The web component handles visibility via CSS class toggle instead
    this.cleanup = initializeHeader(this, { hideNonNavElements: false });
  }

  override shouldUpdate(changedProperties: Map<string, any>): boolean {
    // Protect USWDS transformations from re-rendering after enhancement
    const componentElement = this.querySelector('.usa-header');
    const hasEnhancedElements =
      componentElement?.querySelector('.usa-header__button') ||
      componentElement?.querySelector('.usa-header__wrapper') ||
      componentElement?.querySelector('.usa-header__list');

    if (hasEnhancedElements) {
      // Only allow critical property updates that need DOM changes
      const criticalProps = ['disabled', 'required', 'readonly', 'value', 'error', 'placeholder'];
      const hasCriticalChange = Array.from(changedProperties.keys()).some((prop) =>
        criticalProps.includes(prop as string)
      );

      if (!hasCriticalChange) {
        return false; // Preserve USWDS transformation
      }
    }

    return super.shouldUpdate(changedProperties);
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    // Apply captured content using DOM manipulation (avoids directive compatibility issues)
    this.applySlottedContent();
  }

  private applySlottedContent() {
    // Only apply slotted content once to prevent duplication
    if (this.slottedContent && !this.slottedContentApplied) {
      const slotElement = this.querySelector('slot');
      if (slotElement) {
        slotElement.innerHTML = this.slottedContent;
        this.slottedContentApplied = true;
      }
    }
  }

  /**
   * Handle mobile menu toggle
   */
  private handleMobileMenuToggle = (event: Event) => {
    event.preventDefault();
    this.mobileMenuOpen = !this.mobileMenuOpen;

    this.dispatchEvent(
      new CustomEvent('mobile-menu-toggle', {
        detail: { open: this.mobileMenuOpen },
        bubbles: true,
        composed: true,
      })
    );
  };

  /**
   * Handle mobile menu close
   */
  private handleMobileMenuClose = (event: Event) => {
    event.preventDefault();
    this.mobileMenuOpen = false;

    this.dispatchEvent(
      new CustomEvent('mobile-menu-toggle', {
        detail: { open: this.mobileMenuOpen },
        bubbles: true,
        composed: true,
      })
    );
  };

  /**
   * Handle navigation item clicks
   */
  private handleNavClick = (_event: Event, item: NavItem) => {
    this.dispatchEvent(
      new CustomEvent('nav-click', {
        detail: {
          label: item.label,
          href: item.href,
        },
        bubbles: true,
        composed: true,
      })
    );
  };

  /**
   * Handle submenu toggle
   */
  private handleSubmenuToggle = (event: Event) => {
    event.preventDefault();
    const button = event.target as HTMLButtonElement;
    const submenu = button.nextElementSibling as HTMLElement | null;
    const isExpanded = button.getAttribute('aria-expanded') === 'true';

    // Return early if submenu doesn't exist
    if (!submenu) {
      return;
    }

    // Close all other submenus
    const allButtons = this.querySelectorAll('.usa-accordion__button');
    const allSubmenus = this.querySelectorAll('.usa-nav__submenu');

    allButtons.forEach((btn) => {
      if (btn !== button) {
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    allSubmenus.forEach((menu) => {
      if (menu !== submenu) {
        menu.setAttribute('hidden', 'true');
      }
    });

    // Toggle current submenu
    button.setAttribute('aria-expanded', String(!isExpanded));
    if (isExpanded) {
      submenu.setAttribute('hidden', 'true');
    } else {
      submenu.removeAttribute('hidden');
    }
  };

  /**
   * Handle search form submission from usa-search component
   */
  private handleSearch = (event: CustomEvent) => {
    // usa-search component already dispatches a 'search-submit' event with { query, form }
    // We just need to re-dispatch it as 'header-search' for backwards compatibility
    this.dispatchEvent(
      new CustomEvent('header-search', {
        detail: { query: event.detail.query },
        bubbles: true,
        composed: true,
      })
    );
  };

  private renderLogo() {
    return html`
      <div class="usa-logo" id="logo">
        <em class="usa-logo__text">
          <a href="${this.logoHref}" title="Home" aria-label="Home">
            ${this.logoImageSrc
              ? html`<img
                  class="usa-logo__img"
                  src="${this.logoImageSrc}"
                  alt="${this.logoImageAlt}"
                />`
              : this.logoText}
          </a>
        </em>
      </div>
    `;
  }

  private renderSecondaryLinks() {
    if (!this.secondaryLinks || this.secondaryLinks.length === 0) {
      return html``;
    }

    return html`
      ${this.secondaryLinks.map(
        (link) => html`
          <li class="usa-nav__secondary-item">
            <a href="${link.href}" class="usa-nav__secondary-link">${link.label}</a>
          </li>
        `
      )}
    `;
  }

  private renderNavItem(item: NavItem): any {
    const hasMegamenu = item.megamenu && item.megamenu.length > 0;
    const hasSubmenu = item.submenu && item.submenu.length > 0;

    // Megamenu (multi-column grid layout)
    if (hasMegamenu) {
      const submenuId = `nav-${Math.random().toString(36).substring(2, 11)}`;

      return html`
        <li class="usa-nav__primary-item">
          <button
            class="usa-accordion__button usa-nav__link"
            aria-expanded="false"
            aria-controls="${submenuId}"
            @click="${this.handleSubmenuToggle}"
          >
            <span>${item.label}</span>
          </button>
          <div id="${submenuId}" class="usa-nav__submenu usa-megamenu" hidden>
            <div class="grid-row grid-gap-4">
              ${item.megamenu?.map(
                (column) => html`
                  <div class="usa-col">
                    <ul class="usa-nav__submenu-list">
                      ${column.links.map(
                        (link) => html`
                          <li class="usa-nav__submenu-item">
                            <a
                              href="${link.href || '#'}"
                              @click="${(e: Event) => this.handleNavClick(e, link)}"
                            >
                              ${link.label}
                            </a>
                          </li>
                        `
                      )}
                    </ul>
                  </div>
                `
              )}
            </div>
          </div>
        </li>
      `;
    }

    // Regular submenu (simple list)
    if (hasSubmenu) {
      const submenuId = `nav-${Math.random().toString(36).substring(2, 11)}`;

      return html`
        <li class="usa-nav__primary-item">
          <button
            class="usa-accordion__button usa-nav__link"
            aria-expanded="false"
            aria-controls="${submenuId}"
            @click="${this.handleSubmenuToggle}"
          >
            <span>${item.label}</span>
          </button>
          <ul id="${submenuId}" class="usa-nav__submenu" hidden>
            ${item.submenu?.map(
              (subItem) => html`
                <li class="usa-nav__submenu-item">
                  <a
                    href="${subItem.href || '#'}"
                    class="usa-nav__submenu-link"
                    @click="${(e: Event) => this.handleNavClick(e, subItem)}"
                  >
                    ${subItem.label}
                  </a>
                </li>
              `
            )}
          </ul>
        </li>
      `;
    }

    // Simple link (no submenu)
    return html`
      <li class="usa-nav__primary-item">
        <a
          href="${item.href || '#'}"
          class="usa-nav__link ${item.current ? 'usa-current' : ''}"
          aria-current="${ifDefined(item.current ? 'page' : undefined)}"
          @click="${(e: Event) => this.handleNavClick(e, item)}"
        >
          <span>${item.label}</span>
        </a>
      </li>
    `;
  }

  private renderBasicHeader() {
    return html`
      <div class="usa-nav-container">
        <div class="usa-navbar">
          ${this.renderLogo()}
          <button
            class="usa-menu-btn"
            aria-label="Menu"
            aria-expanded="${this.mobileMenuOpen}"
            aria-controls="header-nav"
            @click="${this.handleMobileMenuToggle}"
          >
            Menu
          </button>
        </div>
        <nav
          class="usa-nav ${this.mobileMenuOpen ? 'is-visible' : ''}"
          aria-label="Primary navigation"
          id="header-nav"
        >
          <div class="usa-nav__inner">
            <button
              class="usa-nav__close"
              aria-label="Close"
              @click="${this.handleMobileMenuClose}"
            >
              <usa-icon name="close" role="img" aria-label="Close"></usa-icon>
            </button>
            <ul class="usa-nav__primary usa-accordion">
              ${this.navItems.map((item) => this.renderNavItem(item))}
            </ul>
            ${this.showSearch || this.secondaryLinks.length > 0
              ? html`
                  <div class="usa-nav__secondary">
                    <ul class="usa-nav__secondary-links">
                      ${this.renderSecondaryLinks()}
                    </ul>
                    ${this.showSearch
                      ? html`
                          <usa-search
                            size="small"
                            placeholder="${this.searchPlaceholder}"
                            input-id="header-search-field"
                            @search-submit="${this.handleSearch}"
                          ></usa-search>
                        `
                      : ''}
                  </div>
                `
              : ''}
          </div>
        </nav>
      </div>
      <div class="usa-overlay"></div>
    `;
  }

  private renderExtendedHeader() {
    return html`
      <div class="usa-navbar">
        ${this.renderLogo()}
        <button
          class="usa-menu-btn"
          aria-label="Menu"
          aria-expanded="${this.mobileMenuOpen}"
          aria-controls="header-nav"
          @click="${this.handleMobileMenuToggle}"
        >
          Menu
        </button>
      </div>
      <nav
        class="usa-nav ${this.mobileMenuOpen ? 'is-visible' : ''}"
        aria-label="Primary navigation"
        id="header-nav"
      >
        <div class="usa-nav__inner">
          <button class="usa-nav__close" aria-label="Close" @click="${this.handleMobileMenuClose}">
            <usa-icon name="close" role="img" aria-label="Close"></usa-icon>
          </button>
          <ul class="usa-nav__primary usa-accordion">
            ${this.navItems.map((item) => this.renderNavItem(item))}
          </ul>
          ${this.showSearch || this.secondaryLinks.length > 0
            ? html`
                <div class="usa-nav__secondary">
                  <ul class="usa-nav__secondary-links">
                    ${this.renderSecondaryLinks()}
                  </ul>
                  ${this.showSearch
                    ? html`
                        <usa-search
                          size="small"
                          placeholder="${this.searchPlaceholder}"
                          input-id="header-search-field-extended"
                          @search-submit="${this.handleSearch}"
                        ></usa-search>
                      `
                    : ''}
                </div>
              `
            : ''}
        </div>
      </nav>
      <div class="usa-overlay"></div>
    `;
  }

  override render() {
    const headerClasses = [
      'usa-header',
      this.extended ? 'usa-header--extended' : 'usa-header--basic',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <a class="usa-skipnav" href="#main-content">Skip to main content</a>
      <header class="${headerClasses}" role="banner">
        ${this.extended ? this.renderExtendedHeader() : this.renderBasicHeader()}
        <slot></slot>
        <slot name="secondary"></slot>
      </header>
    `;
  }
}
