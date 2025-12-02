import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// Import USWDS core styles
import '@uswds-wc/core/styles.css';

// Import USWDS web components
import '@uswds-wc/feedback';
import '@uswds-wc/navigation';
import '@uswds-wc/layout';

/**
 * USA Base Template
 *
 * Foundation template that provides the standard USWDS page structure.
 * All other templates extend or compose this base template.
 *
 * **Template Structure (from USWDS):**
 * - Skip navigation link
 * - Government banner
 * - Header
 * - Main content
 * - Footer
 * - Identifier
 *
 * **Architecture Note:**
 * Uses Light DOM (no Shadow DOM) to allow USWDS styles to cascade properly.
 * Provides slots for maximum customization while offering sensible defaults.
 *
 * @element usa-base-template
 *
 * @slot skipnav - Custom skip navigation (defaults to standard skip link)
 * @slot banner - Custom government banner (defaults to standard banner)
 * @slot header - Site header content
 * @slot main - Main page content
 * @slot footer - Site footer content
 * @slot identifier - Government identifier (defaults to standard identifier)
 *
 * @fires {CustomEvent} template-ready - Fired when template initializes
 *
 * @example Basic usage with slots
 * ```html
 * <usa-base-template>
 *   <div slot="header">
 *     <usa-header title="My Agency"></usa-header>
 *   </div>
 *   <div slot="main">
 *     <h1>Welcome</h1>
 *     <p>Main content goes here.</p>
 *   </div>
 *   <div slot="footer">
 *     <usa-footer></usa-footer>
 *   </div>
 * </usa-base-template>
 * ```
 *
 * @example With properties for defaults
 * ```html
 * <usa-base-template
 *   skip-text="Skip to main content"
 *   show-banner
 *   show-identifier
 * >
 *   <div slot="main">Content</div>
 * </usa-base-template>
 * ```
 *
 * @uswds-template https://designsystem.digital.gov/templates/
 */
@customElement('usa-base-template')
export class USABaseTemplate extends LitElement {
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
   * Text for the skip navigation link
   */
  @property({ type: String, attribute: 'skip-text' })
  skipText = 'Skip to main content';

  /**
   * Target for the skip navigation link
   */
  @property({ type: String, attribute: 'skip-href' })
  skipHref = '#main-content';

  /**
   * Domain name for the identifier (e.g., "example.gov")
   */
  @property({ type: String })
  domain = '';

  /**
   * Agency name for the identifier
   */
  @property({ type: String })
  agency = '';

  /**
   * Parent agency name for the identifier
   */
  @property({ type: String, attribute: 'parent-agency' })
  parentAgency = '';

  /**
   * Parent agency URL for the identifier
   */
  @property({ type: String, attribute: 'parent-agency-href' })
  parentAgencyHref = '';

  override connectedCallback() {
    super.connectedCallback();
    // Set lang attribute on the component
    if (this.lang) {
      this.setAttribute('lang', this.lang);
    }
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);
    // Update lang attribute when property changes
    if (changedProperties.has('lang')) {
      this.setAttribute('lang', this.lang);
    }
  }

  override firstUpdated(changedProperties: Map<string, any>) {
    super.firstUpdated(changedProperties);
    this.dispatchEvent(
      new CustomEvent('template-ready', {
        detail: { template: 'base' },
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
   * Render skip navigation
   */
  private renderSkipNav() {
    if (this.hasSlotContent('skipnav')) {
      return html`<slot name="skipnav"></slot>`;
    }
    return html` <usa-skip-link href="${this.skipHref}" text="${this.skipText}"></usa-skip-link> `;
  }

  /**
   * Render government banner
   */
  private renderBanner() {
    if (!this.showBanner) {
      return nothing;
    }
    if (this.hasSlotContent('banner')) {
      return html`<slot name="banner"></slot>`;
    }
    return html`<usa-banner></usa-banner>`;
  }

  /**
   * Render identifier
   */
  private renderIdentifier() {
    if (!this.showIdentifier) {
      return nothing;
    }
    if (this.hasSlotContent('identifier')) {
      return html`<slot name="identifier"></slot>`;
    }
    // If no slotted content but we have agency info, render default identifier
    if (this.agency || this.domain) {
      return html`
        <usa-identifier
          domain="${this.domain}"
          agency="${this.agency}"
          parent-agency="${this.parentAgency}"
          .parentAgencyHref="${this.parentAgencyHref}"
        ></usa-identifier>
      `;
    }
    // Otherwise render placeholder identifier
    return html`<usa-identifier></usa-identifier>`;
  }

  override render() {
    return html`
      <div class="usa-base-template">
        <!-- Skip Navigation -->
        ${this.renderSkipNav()}

        <!-- Government Banner -->
        ${this.renderBanner()}

        <!-- Header -->
        <slot name="header"></slot>

        <!-- Main Content -->
        <main id="main-content">
          <slot name="main"></slot>
        </main>

        <!-- Footer -->
        <slot name="footer"></slot>

        <!-- Identifier -->
        ${this.renderIdentifier()}
      </div>
    `;
  }

  /**
   * Public API: Get main content element
   */
  getMainContent(): HTMLElement | null {
    return this.querySelector('#main-content');
  }

  /**
   * Public API: Focus main content (for skip link)
   */
  focusMainContent(): void {
    const main = this.getMainContent();
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus();
    }
  }
}
