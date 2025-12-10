import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { USWDSBaseComponent } from '@uswds-wc/core';
import { initializeFooter } from './usa-footer-behavior.js';

// Import official USWDS compiled CSS

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

/**
 * USA Footer Web Component
 *
 * Minimal wrapper around USWDS footer functionality.
 * Uses USWDS-mirrored behavior pattern for 100% behavioral parity.
 *
 * IMPORTANT: The footer and identifier are separate components in USWDS.
 * Place <usa-identifier> AFTER <usa-footer> on the page, not inside it.
 *
 * @element usa-footer
 *
 * @slot - Default slot for custom footer content
 *
 * @attr {string} variant - Footer variant: 'slim' | 'medium' | 'big'. Defaults to 'medium'.
 * @attr {string} agencyName - Name of the agency/organization.
 *
 * @prop {Array<{title: string, links: Array<{label: string, href: string}>}>} sections - Footer link sections.
 *
 * @fires footer-link-click - Dispatched when a footer link is clicked
 *
 * @example
 * ```html
 * <!-- Slim footer -->
 * <usa-footer variant="slim" agencyName="Example Agency"></usa-footer>
 *
 * <!-- Medium footer with sections -->
 * <usa-footer
 *   variant="medium"
 *   agencyName="Example Agency"
 *   .sections=${[
 *     {
 *       title: 'About',
 *       links: [
 *         { label: 'Our Mission', href: '/mission' },
 *         { label: 'Contact Us', href: '/contact' }
 *       ]
 *     },
 *     {
 *       title: 'Resources',
 *       links: [
 *         { label: 'Documentation', href: '/docs' },
 *         { label: 'FAQ', href: '/faq' }
 *       ]
 *     }
 *   ]}
 * ></usa-footer>
 *
 * <!-- Big footer with multiple columns -->
 * <usa-footer variant="big" agencyName="Department of Example" .sections=${sections}></usa-footer>
 *
 * <!-- Footer with identifier (recommended pattern) -->
 * <usa-footer variant="medium" agencyName="Example Agency" .sections=${sections}></usa-footer>
 * <usa-identifier domain="example.gov" agency="Example Agency"></usa-identifier>
 * ```
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 * @see usa-footer-behavior.ts - USWDS behavior mirror
 *
 * @uswds-js-reference https://github.com/uswds/uswds/tree/develop/packages/usa-footer/src/index.js
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-footer/src/styles/_usa-footer.scss
 * @uswds-docs https://designsystem.digital.gov/components/footer/
 * @uswds-guidance https://designsystem.digital.gov/components/footer/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/footer/#accessibility
 */
@customElement('usa-footer')
export class USAFooter extends USWDSBaseComponent {
  static override styles = css`
    :host {
      display: block;
    }
    :host([hidden]) {
      display: none;
    }
  `;

  @property({ type: String })
  variant: 'slim' | 'medium' | 'big' = 'medium';

  @property({ type: String })
  agencyName = '';

  @property({ type: Array })
  sections: FooterSection[] = [];

  private slottedContent: string = '';
  private slottedContentApplied: boolean = false;

  // Store cleanup function from behavior
  private cleanup?: () => void;

  override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('data-web-component-managed', 'true');

    // Capture any initial slotted content before render
    // This allows using BOTH property-based sections AND custom slotted content
    if (this.childNodes.length > 0) {
      this.slottedContent = this.innerHTML;
      this.innerHTML = '';
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
    // Uses dedicated behavior file (usa-footer-behavior.ts) that replicates USWDS source exactly

    super.firstUpdated(changedProperties);

    // Wait for DOM to be fully rendered
    await this.updateComplete;
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));

    // Initialize using mirrored USWDS behavior
    this.cleanup = initializeFooter(this);
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
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.slottedContent;
        slotElement.replaceWith(...Array.from(tempDiv.childNodes));
        this.slottedContentApplied = true;
      }
    }
  }

  private handleLinkClick(link: FooterLink, e: Event) {
    const event = new CustomEvent('footer-link-click', {
      detail: {
        label: link.label,
        href: link.href,
      },
      bubbles: true,
      composed: true,
      cancelable: true,
    });

    this.dispatchEvent(event);

    // Only navigate if event wasn't cancelled and href is provided
    if (!event.defaultPrevented && link.href) {
      // Allow the default link behavior to handle navigation
      return;
    } else {
      e.preventDefault();
    }
  }

  private renderFooterNav() {
    if (this.sections.length === 0) return '';

    if (this.variant === 'big') {
      return this.renderBigFooterNav();
    } else {
      return this.renderMediumFooterNav();
    }
  }

  private renderMediumFooterNav() {
    return html`
      <div class="usa-footer__primary-section">
        <nav class="usa-footer__nav" aria-label="Footer navigation">
          <div class="grid-container">
            <ul class="grid-row grid-gap usa-list--unstyled">
              ${this.renderMediumFooterSections()}
            </ul>
          </div>
        </nav>
      </div>
    `;
  }

  private renderBigFooterNav() {
    return html`
      <div class="usa-footer__primary-section">
        <div class="grid-container">
          <div class="grid-row grid-gap">
            <div class="tablet:grid-col-8">
              <nav class="usa-footer__nav" aria-label="Footer navigation">
                <div class="grid-row grid-gap-4">${this.renderBigFooterSections()}</div>
              </nav>
            </div>
            <div class="tablet:grid-col-4">
              <!-- Newsletter signup could go here in the future -->
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderFooterSecondary() {
    // Only render secondary section for medium and big variants
    // This provides agency info and contact details per USWDS structure
    if (this.variant === 'slim') {
      return '';
    }

    return html`
      <div class="usa-footer__secondary-section">
        <div class="grid-container">
          <div class="grid-row grid-gap">
            <div class="usa-footer__logo grid-row mobile-lg:grid-col-6 mobile-lg:grid-gap-2">
              ${this.agencyName
                ? html`
                    <div class="mobile-lg:grid-col-auto">
                      <p class="usa-footer__logo-heading">${this.agencyName}</p>
                    </div>
                  `
                : ''}
            </div>
            <div class="usa-footer__contact-links mobile-lg:grid-col-6">
              <p class="usa-footer__contact-heading">Agency Contact Center</p>
              <address class="usa-footer__address">
                <div class="usa-footer__contact-info grid-row grid-gap">
                  <div class="grid-col-auto">
                    <a href="tel:1-800-555-5555">(800) 555-GOVT</a>
                  </div>
                  <div class="grid-col-auto">
                    <a href="mailto:info@agency.gov">info@agency.gov</a>
                  </div>
                </div>
              </address>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderMediumFooterSections() {
    return this.sections.map((section) => this.renderMediumFooterSection(section));
  }

  private renderMediumFooterSection(section: FooterSection) {
    // For medium footer, render section title as primary link (USWDS pattern)
    const primaryLink =
      section.links.length > 0 ? section.links[0] : { label: section.title, href: '#' };

    return html`
      <li class="mobile-lg:grid-col-4 desktop:grid-col-auto usa-footer__primary-content">
        <a
          class="usa-footer__primary-link"
          href="${primaryLink.href}"
          @click="${(e: Event) => this.handleLinkClick(primaryLink, e)}"
        >
          ${section.title}
        </a>
      </li>
    `;
  }

  private renderBigFooterSections() {
    return this.sections.map((section) => this.renderBigFooterSection(section));
  }

  private renderBigFooterSection(section: FooterSection) {
    // For big footer, render collapsible sections with headings and sublists (USWDS pattern)
    return html`
      <div class="mobile-lg:grid-col-6 desktop:grid-col-3">
        <section class="usa-footer__primary-content usa-footer__primary-content--collapsible">
          <h4 class="usa-footer__primary-link">${section.title}</h4>
          <ul class="usa-list usa-list--unstyled">
            ${this.renderSectionLinks(section.links)}
          </ul>
        </section>
      </div>
    `;
  }

  private renderSectionLinks(links: FooterLink[]) {
    return links.map((link) => this.renderSectionLink(link));
  }

  private renderSectionLink(link: FooterLink) {
    return html`
      <li class="usa-footer__secondary-link">
        <a href="${link.href}" @click="${(e: Event) => this.handleLinkClick(link, e)}">
          ${link.label}
        </a>
      </li>
    `;
  }

  // Use light DOM for USWDS compatibility
  protected override createRenderRoot(): HTMLElement {
    return this as any;
  }

  override render() {
    const footerClasses = ['usa-footer', `usa-footer--${this.variant}`].filter(Boolean).join(' ');

    return html`
      <footer class="${footerClasses}" role="contentinfo">
        ${this.renderFooterNav()} ${this.renderFooterSecondary()}

        <!-- Custom content slot -->
        <slot></slot>
      </footer>
    `;
  }
}
