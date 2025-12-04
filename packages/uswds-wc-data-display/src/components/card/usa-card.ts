import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeStatic, html as staticHtml } from 'lit/static-html.js';

// Import official USWDS compiled CSS
import '@uswds-wc/core/styles.css';

/**
 * USA Card Web Component
 *
 * A simple, accessible USWDS card implementation as a custom element.
 * Uses official USWDS classes and styling with minimal custom code.
 *
 * @element usa-card
 *
 * @slot - Default slot for card body content
 * @slot header - Slot for card header content (alternative to heading attribute)
 * @slot media - Slot for card media content (images, videos)
 * @slot footer - Slot for card footer content (buttons, links)
 *
 * @attr {string} heading - Card heading text.
 * @attr {string} text - Card body text (alternative to using default slot).
 * @attr {string} mediaType - Media type: 'image' | 'video' | 'none'. Defaults to 'none'.
 * @attr {string} mediaSrc - URL for media source.
 * @attr {string} media-alt - Alt text for media.
 * @attr {string} mediaPosition - Media position: 'inset' | 'exdent' | 'right'. Defaults to 'inset'.
 * @attr {boolean} flagLayout - Use flag (horizontal) layout.
 * @attr {boolean} headerFirst - Show header before media.
 * @attr {boolean} actionable - Make entire card clickable.
 * @attr {string} href - Link URL for actionable cards.
 * @attr {string} target - Link target for actionable cards.
 * @attr {string} footer-text - Footer text content.
 * @attr {string} heading-level - Heading level: '1' | '2' | '3' | '4' | '5' | '6'. Defaults to '3'.
 *
 * @fires card-click - Dispatched when the card is clicked (if actionable)
 *
 * @example
 * ```html
 * <!-- Basic card with heading and text -->
 * <usa-card heading="Card Title">
 *   This is the card content.
 * </usa-card>
 *
 * <!-- Card with image -->
 * <usa-card
 *   heading="Featured Article"
 *   mediaType="image"
 *   mediaSrc="/images/hero.jpg"
 *   media-alt="Article hero image"
 * >
 *   Article preview text goes here.
 * </usa-card>
 *
 * <!-- Flag layout card -->
 * <usa-card heading="Horizontal Card" flagLayout>
 *   Content displayed beside the media.
 * </usa-card>
 *
 * <!-- Actionable card with link -->
 * <usa-card heading="Click Me" actionable href="/details">
 *   Click anywhere to navigate.
 * </usa-card>
 *
 * <!-- Card with slots -->
 * <usa-card>
 *   <span slot="header">Custom Header</span>
 *   <p>Card body content</p>
 *   <div slot="footer"><usa-button>Action</usa-button></div>
 * </usa-card>
 * ```
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-card/src/styles/_usa-card.scss
 * @uswds-docs https://designsystem.digital.gov/components/card/
 * @uswds-guidance https://designsystem.digital.gov/components/card/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/card/#accessibility
 */
@customElement('usa-card')
export class USACard extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    /* Hide slotted elements that appear as direct children (light DOM slot workaround) */
    :host > [slot] {
      display: none !important;
    }
  `;

  @property({ type: String })
  heading = '';

  @property({ type: String })
  text = '';

  @property({ type: String })
  mediaType: 'image' | 'video' | 'none' = 'none';

  @property({ type: String })
  mediaSrc = '';

  @property({ type: String, attribute: 'media-alt' })
  mediaAlt = '';

  @property({ type: String })
  mediaPosition: 'inset' | 'exdent' | 'right' = 'inset';

  @property({ type: Boolean, reflect: true })
  flagLayout = false;

  @property({ type: Boolean, reflect: true })
  headerFirst = false;

  @property({ type: Boolean, reflect: true })
  actionable = false;

  @property({ type: String })
  href = '';

  @property({ type: String })
  target = '';

  @property({ type: String, attribute: 'footer-text' })
  footerText = '';

  @property({ type: String, attribute: 'heading-level' })
  headingLevel: '1' | '2' | '3' | '4' | '5' | '6' = '3';

  // Store bound event handlers for cleanup
  private boundHandleCardClick = this.handleCardClick.bind(this);
  private boundHandleCardKeydown = this.handleCardKeydown.bind(this);

  // Use light DOM for USWDS compatibility
  protected override createRenderRoot(): HTMLElement {
    return this as any;
  }

  override connectedCallback() {
    super.connectedCallback();

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');

    this.updateHostClasses();
    this.setupEventListeners();
  }

  override firstUpdated(changedProperties: Map<string, any>) {
    // ARCHITECTURE: Script Tag Pattern
    // USWDS is loaded globally via script tag in .storybook/preview-head.html
    // Components just render HTML - USWDS enhances automatically via window.USWDS

    super.firstUpdated(changedProperties);

    // Move slotted content into their slot placeholders (light DOM slot workaround)
    this.moveSlottedContent();
  }

  private moveSlottedContent() {
    // In light DOM, slots don't automatically project content
    // We need to manually move slotted elements into their slot locations
    const slottedElements = Array.from(this.querySelectorAll('[slot]'));

    slottedElements.forEach((element) => {
      const slotName = element.getAttribute('slot');
      if (slotName) {
        const slotElement = this.querySelector(`slot[name="${slotName}"]`);
        if (slotElement) {
          // Replace the slot element with the actual slotted content
          slotElement.replaceWith(element);
        }
      }
    });
  }

  private setupEventListeners() {
    // Add click listener for actionable cards
    this.addEventListener('click', this.boundHandleCardClick);
    this.addEventListener('keydown', this.boundHandleCardKeydown);
  }

  private handleCardClick(_event: Event) {
    if (this.actionable) {
      this.dispatchCardClickEvent();

      // Handle navigation if href is provided
      if (this.href) {
        if (this.target === '_blank') {
          window.open(this.href, '_blank');
        } else {
          window.location.href = this.href;
        }
      }
    }
  }

  private handleCardKeydown(event: KeyboardEvent) {
    if (this.actionable && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      this.dispatchCardClickEvent();

      // Handle navigation if href is provided
      if (this.href) {
        if (this.target === '_blank') {
          window.open(this.href, '_blank');
        } else {
          window.location.href = this.href;
        }
      }
    }
  }

  private dispatchCardClickEvent() {
    const detail = {
      heading: this.heading,
      href: this.href,
      target: this.target,
    };

    this.dispatchEvent(
      new CustomEvent('card-click', {
        detail,
        bubbles: true,
        cancelable: true,
      })
    );
  }

  override disconnectedCallback() {
    super.disconnectedCallback();

    // Clean up event listeners
    this.removeEventListener('click', this.boundHandleCardClick);
    this.removeEventListener('keydown', this.boundHandleCardKeydown);
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);
    // Update host classes when relevant properties change
    if (
      changedProperties.has('flagLayout') ||
      changedProperties.has('headerFirst') ||
      changedProperties.has('mediaPosition') ||
      changedProperties.has('mediaType') ||
      changedProperties.has('actionable')
    ) {
      this.updateHostClasses();
    }
  }

  private updateHostClasses() {
    // Apply card classes directly to the host element following USWDS structure
    const cardClasses = ['usa-card'];

    // Media right requires flag layout, so enable it automatically
    const shouldUseFlagLayout = this.flagLayout || this.mediaPosition === 'right';

    if (shouldUseFlagLayout) cardClasses.push('usa-card--flag');
    if (this.headerFirst) cardClasses.push('usa-card--header-first');
    if (this.mediaPosition === 'right') cardClasses.push('usa-card--media-right');

    // Apply classes to the host element (this becomes the card element)
    this.className = cardClasses.join(' ');

    // Handle actionable state
    if (this.actionable) {
      this.setAttribute('role', 'button');
      this.setAttribute('tabindex', '0');
    } else {
      this.removeAttribute('role');
      this.removeAttribute('tabindex');
    }
  }
  //   private async initializeUSWDSCard() {
  //     // Note: USWDS cards are purely presentational components with no JavaScript behavior
  //     // The card component only requires USWDS CSS for styling and layout
  //     console.log('📋 Card: Initialized as presentational component (no USWDS JavaScript required)');
  //   }

  private renderBodyText() {
    return html`<p>${this.text}</p>`;
  }

  private renderFooterText() {
    return html`<p>${this.footerText}</p>`;
  }

  private hasSlotContent(slotName: string): boolean {
    // Check if there are any elements with the specified slot attribute
    const slottedElements = this.querySelectorAll(`[slot="${slotName}"]`);
    return slottedElements.length > 0;
  }

  override render() {
    const renderMedia = () => {
      if (this.mediaType === 'none' || !this.mediaSrc) return '';

      if (this.mediaType === 'image') {
        return html`
          <div
            class="usa-card__media${this.mediaPosition === 'inset'
              ? ' usa-card__media--inset'
              : this.mediaPosition === 'exdent'
                ? ' usa-card__media--exdent'
                : ''}"
          >
            <div class="usa-card__img">
              <img src="${this.mediaSrc}" alt="${this.mediaAlt}" loading="lazy" />
            </div>
          </div>
        `;
      }

      if (this.mediaType === 'video') {
        return html`
          <div
            class="usa-card__media${this.mediaPosition === 'inset'
              ? ' usa-card__media--inset'
              : this.mediaPosition === 'exdent'
                ? ' usa-card__media--exdent'
                : ''}"
          >
            <div class="usa-card__img">
              <video controls aria-label="${this.mediaAlt}" src="${this.mediaSrc}">
                ${this.mediaAlt}
              </video>
            </div>
          </div>
        `;
      }

      return '';
    };

    const renderHeader = () => {
      if (!this.heading) return '';

      const headingTag = `h${this.headingLevel}`;

      return staticHtml`
        <div class="usa-card__header">
          <${unsafeStatic(headingTag)} class="usa-card__heading">${this.heading}</${unsafeStatic(headingTag)}>
        </div>
      `;
    };

    const renderBody = () => {
      // Always render body if there's text property or body slot
      if (!this.text && !this.hasSlotContent('body')) return '';

      return html`
        <div class="usa-card__body">
          ${this.text ? this.renderBodyText() : ''}
          <slot name="body"></slot>
        </div>
      `;
    };

    const renderFooter = () => {
      // Always render footer if there's footerText property or footer slot
      if (!this.footerText && !this.hasSlotContent('footer')) return '';

      return html`
        <div class="usa-card__footer">
          ${this.footerText ? this.renderFooterText() : ''}
          <slot name="footer"></slot>
        </div>
      `;
    };

    // Media right positioning is handled by CSS, not HTML order
    // Follow USWDS standard: Header -> Media -> Body -> Footer (unless headerFirst is false)
    const cardContent = this.headerFirst
      ? html` ${renderHeader()} ${renderMedia()} ${renderBody()} ${renderFooter()} `
      : html` ${renderMedia()} ${renderHeader()} ${renderBody()} ${renderFooter()} `;

    // USWDS Compliance: Only use official USWDS class 'usa-card__container'
    // No custom modifier classes - actionable behavior is handled via role/tabindex attributes
    return html` <div class="usa-card__container">${cardContent}</div> `;
  }
}
