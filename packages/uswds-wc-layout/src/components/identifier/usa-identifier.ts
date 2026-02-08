import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// Import official USWDS compiled CSS

export interface IdentifierLink {
  href: string;
  text: string;
}

export interface IdentifierLogo {
  src: string;
  alt: string;
  href?: string;
}

/**
 * USA Identifier Web Component
 *
 * A simple, accessible USWDS identifier implementation as a custom element.
 * Displays organization identification with required links and logos.
 * Uses official USWDS classes and styling with minimal custom code.
 *
 * @element usa-identifier
 * @fires link-click - Dispatched when an identifier link is clicked
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-identifier/src/styles/_usa-identifier.scss
 * @uswds-docs https://designsystem.digital.gov/components/identifier/
 * @uswds-guidance https://designsystem.digital.gov/components/identifier/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/identifier/#accessibility
 */
@customElement('usa-identifier')
export class USAIdentifier extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
  `;

  @property({ type: String })
  domain = '';

  @property({ type: String })
  agency = '';

  @property({ type: String })
  description = '';

  @property({ type: Array })
  requiredLinks: IdentifierLink[] = [
    { href: '/about', text: 'About' },
    { href: '/accessibility', text: 'Accessibility support' },
    { href: '/foia', text: 'FOIA requests' },
    { href: '/no-fear-act', text: 'No FEAR Act data' },
    { href: '/inspector-general', text: 'Office of the Inspector General' },
    { href: '/performance', text: 'Performance reports' },
    { href: '/privacy', text: 'Privacy policy' },
  ];

  @property({ type: Array })
  logos: IdentifierLogo[] = [];

  @property({ type: String, attribute: 'parent-agency' })
  parentAgency = '';

  @property({ type: String })
  parentAgencyHref = '';

  @property({ type: Boolean, reflect: true })
  showLogos = true;

  @property({ type: Boolean, reflect: true })
  showRequiredLinks = true;

  @property({ type: String })
  mastheadLogoSrc =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0Ij48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNjY2NjY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNGRkZGRkYiPkdPVjwvdGV4dD48L3N2Zz4=';

  @property({ type: String, attribute: 'masthead-logo-alt' })
  mastheadLogoAlt = '';

  // Use light DOM for USWDS compatibility
  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  override connectedCallback() {
    super.connectedCallback();

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');
  }

  private handleLinkClick(_e: Event, link: IdentifierLink) {
    this.dispatchEvent(
      new CustomEvent('link-click', {
        detail: {
          link: link,
          href: link.href,
          text: link.text,
        },
        bubbles: true,
        composed: true,
      })
    );

    // Allow default navigation behavior unless prevented
  }

  private renderParentAgencyText() {
    return this.parentAgencyHref
      ? html`<a href="${this.parentAgencyHref}" class="usa-link">${this.parentAgency}</a>`
      : this.parentAgency || 'United States government';
  }

  private renderMasthead() {
    const logoAltText =
      this.mastheadLogoAlt ||
      (this.parentAgency ? `${this.parentAgency} logo` : 'Parent agency logo');

    return html`
      <div
        class="usa-identifier__section usa-identifier__section--masthead"
        aria-label="Agency identifier"
      >
        <div class="usa-identifier__container">
          <div class="usa-identifier__logos">
            <a href="${this.parentAgencyHref || '/'}" class="usa-identifier__logo usa-link">
              <img
                class="usa-identifier__logo-img"
                src="${this.mastheadLogoSrc}"
                alt="${logoAltText}"
                role="img"
              />
            </a>
          </div>
          <section class="usa-identifier__identity" aria-label="Agency description">
            <p class="usa-identifier__identity-domain">${this.domain}</p>
            <p class="usa-identifier__identity-disclaimer">
              An official website of the ${this.renderParentAgencyText()}
            </p>
          </section>
        </div>
      </div>
    `;
  }

  private renderRequiredLink(link: IdentifierLink) {
    const handleClick = (e: Event) => this.handleLinkClick(e, link);

    return html`
      <li class="usa-identifier__required-links-item">
        <a
          class="usa-identifier__required-link usa-link"
          href="${link.href}"
          @click="${handleClick}"
        >
          ${link.text}
        </a>
      </li>
    `;
  }

  private renderRequiredLinks() {
    return this.showRequiredLinks && this.requiredLinks.length
      ? html`
          <div
            class="usa-identifier__section usa-identifier__section--required-links"
            aria-label="Important links"
          >
            <div class="usa-identifier__container">
              <ul class="usa-identifier__required-links-list">
                ${this.renderRequiredLinkItems()}
              </ul>
            </div>
          </div>
        `
      : '';
  }

  private renderLogoContent(logo: IdentifierLogo) {
    return logo.href
      ? html`
          <a href="${logo.href}" class="usa-identifier__logo usa-link">
            <img class="usa-identifier__logo-img" src="${logo.src}" alt="${logo.alt}" role="img" />
          </a>
        `
      : html`
          <div class="usa-identifier__logo">
            <img class="usa-identifier__logo-img" src="${logo.src}" alt="${logo.alt}" role="img" />
          </div>
        `;
  }

  private renderLogo(logo: IdentifierLogo) {
    return this.renderLogoContent(logo);
  }

  private renderLogos() {
    return this.showLogos && this.logos.length
      ? html`
          <div class="usa-identifier__section" aria-label="Agency logos">
            <div class="usa-identifier__container">
              <div class="usa-identifier__logos">${this.renderLogoItems()}</div>
            </div>
          </div>
        `
      : '';
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
  }
  override render() {
    return html`
      <div class="usa-identifier">
        ${this.renderMasthead()} ${this.renderRequiredLinks()} ${this.renderLogos()}
      </div>
    `;
  }

  private renderRequiredLinkItems() {
    return this.requiredLinks.map((link) => this.renderRequiredLink(link));
  }

  private renderLogoItems() {
    return this.logos.map((logo) => this.renderLogo(logo));
  }

  // Public API methods
  addRequiredLink(link: IdentifierLink) {
    this.requiredLinks = [...this.requiredLinks, link];
  }

  removeRequiredLink(href: string) {
    this.requiredLinks = this.requiredLinks.filter((link) => link.href !== href);
  }

  updateRequiredLink(href: string, updatedLink: Partial<IdentifierLink>) {
    this.requiredLinks = this.requiredLinks.map((link) =>
      link.href === href ? { ...link, ...updatedLink } : link
    );
  }

  addLogo(logo: IdentifierLogo) {
    this.logos = [...this.logos, logo];
  }

  removeLogo(src: string) {
    this.logos = this.logos.filter((logo) => logo.src !== src);
  }

  clearLogos() {
    this.logos = [];
  }

  clearRequiredLinks() {
    this.requiredLinks = [];
  }
}
