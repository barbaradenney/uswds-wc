import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// Import USWDS core styles

// Import USWDS web components
import '@uswds-wc/feedback';
import '@uswds-wc/navigation';
import '@uswds-wc/layout';
import '@uswds-wc/actions';

/**
 * Graphic item interface for the graphics list section
 */
export interface GraphicItem {
  heading: string;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
}

/**
 * USA Landing Template
 *
 * Hero-focused landing page template following USWDS patterns.
 * Extends the base template structure with hero, tagline, graphics list, and CTA sections.
 *
 * **Template Structure (from USWDS):**
 * - Skip navigation + Banner + Header (inherited)
 * - Hero section with callout
 * - Tagline section
 * - Graphics list section (dark background)
 * - Call-to-action section
 * - Footer + Identifier (inherited)
 *
 * @element usa-landing-template
 *
 * @slot hero - Custom hero section content
 * @slot tagline - Custom tagline section
 * @slot graphics - Custom graphics list section
 * @slot cta - Custom call-to-action section
 * @slot header - Site header (inherited from base)
 * @slot footer - Site footer (inherited from base)
 *
 * @fires {CustomEvent} template-ready - Fired when template initializes
 *
 * @example Basic usage with properties
 * ```html
 * <usa-landing-template
 *   hero-heading="Welcome to Our Agency"
 *   hero-description="We serve the American public."
 *   hero-cta-text="Learn More"
 *   hero-cta-url="/about"
 *   tagline-heading="Our Approach"
 *   tagline-description="How we do our work."
 * ></usa-landing-template>
 * ```
 *
 * @example With custom slotted content
 * ```html
 * <usa-landing-template>
 *   <section slot="hero" class="usa-hero">
 *     <!-- Custom hero content -->
 *   </section>
 * </usa-landing-template>
 * ```
 *
 * @uswds-template https://designsystem.digital.gov/templates/landing-page/
 */
@customElement('usa-landing-template')
export class USALandingTemplate extends LitElement {
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

  // Hero section properties
  /**
   * Hero heading text (main headline)
   */
  @property({ type: String, attribute: 'hero-heading' })
  heroHeading = '';

  /**
   * Hero heading accent (smaller text above main heading)
   */
  @property({ type: String, attribute: 'hero-heading-accent' })
  heroHeadingAccent = '';

  /**
   * Hero description text
   */
  @property({ type: String, attribute: 'hero-description' })
  heroDescription = '';

  /**
   * Hero call-to-action button text
   */
  @property({ type: String, attribute: 'hero-cta-text' })
  heroCtaText = '';

  /**
   * Hero call-to-action button URL
   */
  @property({ type: String, attribute: 'hero-cta-url' })
  heroCtaUrl = '#';

  /**
   * Hero background image URL
   */
  @property({ type: String, attribute: 'hero-image-url' })
  heroImageUrl = '';

  // Tagline section properties
  /**
   * Tagline heading text
   */
  @property({ type: String, attribute: 'tagline-heading' })
  taglineHeading = '';

  /**
   * Tagline description text
   */
  @property({ type: String, attribute: 'tagline-description' })
  taglineDescription = '';

  // CTA section properties
  /**
   * CTA section heading text
   */
  @property({ type: String, attribute: 'cta-heading' })
  ctaHeading = '';

  /**
   * CTA section description text
   */
  @property({ type: String, attribute: 'cta-description' })
  ctaDescription = '';

  /**
   * CTA button text
   */
  @property({ type: String, attribute: 'cta-button-text' })
  ctaButtonText = '';

  /**
   * CTA button URL
   */
  @property({ type: String, attribute: 'cta-button-url' })
  ctaButtonUrl = '#';

  /**
   * Graphics list items (JSON array)
   */
  @property({ type: Array })
  graphics: GraphicItem[] = [];

  /**
   * Default image path for graphics
   */
  @property({ type: String, attribute: 'image-path' })
  imagePath = '/img';

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
        detail: { template: 'landing' },
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
   * Render the hero section
   */
  private renderHero() {
    if (this.hasSlotContent('hero')) {
      return html`<slot name="hero"></slot>`;
    }

    // Only render default hero if we have content
    if (!this.heroHeading && !this.heroDescription) {
      return nothing;
    }

    const heroStyle = this.heroImageUrl ? `background-image: url('${this.heroImageUrl}')` : '';

    return html`
      <section class="usa-hero" aria-label="Introduction" style="${heroStyle}">
        <div class="grid-container">
          <div class="usa-hero__callout">
            <h1 class="usa-hero__heading">
              ${this.heroHeadingAccent
                ? html`<span class="usa-hero__heading--alt">${this.heroHeadingAccent}</span>`
                : nothing}
              ${this.heroHeading}
            </h1>
            ${this.heroDescription ? html`<p>${this.heroDescription}</p>` : nothing}
            ${this.heroCtaText
              ? html`<a class="usa-button" href="${this.heroCtaUrl}">${this.heroCtaText}</a>`
              : nothing}
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Render the tagline section
   */
  private renderTagline() {
    if (this.hasSlotContent('tagline')) {
      return html`<slot name="tagline"></slot>`;
    }

    // Only render default tagline if we have content
    if (!this.taglineHeading && !this.taglineDescription) {
      return nothing;
    }

    return html`
      <section class="grid-container usa-section">
        <div class="grid-row grid-gap">
          <div class="tablet:grid-col-4">
            <h2 class="font-heading-xl margin-top-0 tablet:margin-bottom-0">
              ${this.taglineHeading}
            </h2>
          </div>
          <div class="tablet:grid-col-8 usa-prose">
            <p>${this.taglineDescription}</p>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Render the graphics list section
   */
  private renderGraphics() {
    if (this.hasSlotContent('graphics')) {
      return html`<slot name="graphics"></slot>`;
    }

    // Only render default graphics if we have items
    if (!this.graphics?.length) {
      return nothing;
    }

    // Group graphics into rows of 2
    const rows: GraphicItem[][] = [];
    for (let i = 0; i < this.graphics.length; i += 2) {
      rows.push(this.graphics.slice(i, i + 2));
    }

    return html`
      <section class="usa-graphic-list usa-section usa-section--dark">
        <div class="grid-container">
          ${rows.map(
            (row) => html`
              <div class="usa-graphic-list__row grid-row grid-gap">
                ${row.map(
                  (item) => html`
                    <div class="usa-media-block tablet:grid-col">
                      ${item.imageSrc
                        ? html`<img
                            class="usa-media-block__img"
                            src="${item.imageSrc}"
                            alt="${item.imageAlt || ''}"
                          />`
                        : nothing}
                      <div class="usa-media-block__body">
                        <h2 class="usa-graphic-list__heading">${item.heading}</h2>
                        <p>${item.description}</p>
                      </div>
                    </div>
                  `
                )}
              </div>
            `
          )}
        </div>
      </section>
    `;
  }

  /**
   * Render the CTA section
   */
  private renderCta() {
    if (this.hasSlotContent('cta')) {
      return html`<slot name="cta"></slot>`;
    }

    // Only render default CTA if we have content
    if (!this.ctaHeading && !this.ctaDescription) {
      return nothing;
    }

    return html`
      <section class="usa-section">
        <div class="grid-container">
          <h2 class="font-heading-xl margin-y-0">${this.ctaHeading}</h2>
          ${this.ctaDescription ? html`<p class="usa-intro">${this.ctaDescription}</p>` : nothing}
          ${this.ctaButtonText
            ? html`<a class="usa-button usa-button--big" href="${this.ctaButtonUrl}">
                ${this.ctaButtonText}
              </a>`
            : nothing}
        </div>
      </section>
    `;
  }

  override render() {
    return html`
      <div class="usa-landing-template">
        <!-- Skip Navigation -->
        <usa-skip-link href="#main-content" text="Skip to main content"></usa-skip-link>

        <!-- Government Banner -->
        ${this.showBanner ? html`<usa-banner></usa-banner>` : nothing}

        <!-- Header -->
        <slot name="header"></slot>

        <!-- Main Content -->
        <main id="main-content">
          ${this.renderHero()} ${this.renderTagline()} ${this.renderGraphics()} ${this.renderCta()}
          <!-- Additional content slot -->
          <slot name="main"></slot>
        </main>

        <!-- Footer -->
        <slot name="footer"></slot>

        <!-- Identifier -->
        ${this.showIdentifier ? html`<usa-identifier></usa-identifier>` : nothing}
      </div>
    `;
  }

  /**
   * Public API: Set graphics items
   */
  setGraphics(items: GraphicItem[]): void {
    this.graphics = [...items];
  }

  /**
   * Public API: Add a graphic item
   */
  addGraphic(item: GraphicItem): void {
    this.graphics = [...this.graphics, item];
  }
}
