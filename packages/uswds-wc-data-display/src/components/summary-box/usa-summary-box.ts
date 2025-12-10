import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// Import official USWDS compiled CSS

/**
 * USA Summary Box Web Component
 *
 * A simple, accessible USWDS summary box implementation as a custom element.
 * Uses official USWDS classes and styling with minimal custom code.
 *
 * @element usa-summary-box
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-summary-box/src/styles/_usa-summary-box.scss
 * @uswds-docs https://designsystem.digital.gov/components/summary-box/
 * @uswds-guidance https://designsystem.digital.gov/components/summary-box/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/summary-box/#accessibility
 */
@customElement('usa-summary-box')
export class USASummaryBox extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
  `;

  @property({ type: String })
  heading = '';

  @property({ type: String })
  content = '';

  @property({ type: String, attribute: 'heading-level' })
  headingLevel = 'h3';

  // Track whether we're using innerHTML mode to avoid Lit marker conflicts
  private isUsingInnerHTML = false;

  // Slotted content capture for Light DOM
  private slottedContent: string = '';
  private slottedContentApplied: boolean = false;

  // Use light DOM for USWDS compatibility
  protected override createRenderRoot(): HTMLElement {
    return this as any;
  }

  override connectedCallback() {
    // CRITICAL: Capture slotted content BEFORE calling super.connectedCallback()
    // This ensures we capture it before Lit's rendering lifecycle starts
    console.log('[SummaryBox] connectedCallback', {
      childNodesCount: this.childNodes.length,
      innerHTML: this.innerHTML?.substring(0, 100),
    });

    if (this.childNodes.length > 0) {
      this.slottedContent = this.innerHTML;
      this.innerHTML = '';
      console.log('[SummaryBox] Captured and cleared slotted content', {
        capturedLength: this.slottedContent.length,
      });
    }

    super.connectedCallback();

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');
  }

  private renderHeading() {
    if (!this.heading) return '';

    switch (this.headingLevel) {
      case 'h1':
        return html`<h1 class="usa-summary-box__heading">${this.heading}</h1>`;
      case 'h2':
        return html`<h2 class="usa-summary-box__heading">${this.heading}</h2>`;
      case 'h3':
        return html`<h3 class="usa-summary-box__heading">${this.heading}</h3>`;
      case 'h4':
        return html`<h4 class="usa-summary-box__heading">${this.heading}</h4>`;
      case 'h5':
        return html`<h5 class="usa-summary-box__heading">${this.heading}</h5>`;
      case 'h6':
        return html`<h6 class="usa-summary-box__heading">${this.heading}</h6>`;
      default:
        return html`<h3 class="usa-summary-box__heading">${this.heading}</h3>`;
    }
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    // Apply slotted content first (before content property handling)
    this.applySlottedContent();

    // Update content via innerHTML when content property changes
    // CRITICAL: Cannot use unsafeHTML directive in Light DOM components
    // Must use innerHTML imperatively instead
    if (changedProperties.has('content')) {
      const textElement = this.querySelector('.usa-summary-box__text');
      if (textElement) {
        if (this.content) {
          // Switching to property content - use innerHTML
          textElement.innerHTML = this.content;
          this.isUsingInnerHTML = true;
        } else if (this.isUsingInnerHTML) {
          // Switching back to slot content - clear innerHTML and trigger re-render
          // This ensures Lit's slot markers are restored properly
          textElement.innerHTML = '';
          this.isUsingInnerHTML = false;
          this.requestUpdate();
        }
      }
    }
  }

  private applySlottedContent() {
    // Only apply slotted content once to prevent duplication
    // Only apply if NOT using content property (content property takes precedence)
    console.log('[SummaryBox] applySlottedContent called', {
      hasSlottedContent: !!this.slottedContent,
      slottedContentLength: this.slottedContent?.length,
      alreadyApplied: this.slottedContentApplied,
      hasContentProp: !!this.content,
      slotElement: this.querySelector('slot'),
    });

    if (this.slottedContent && !this.slottedContentApplied && !this.content) {
      const slotElement = this.querySelector('slot');
      console.log('[SummaryBox] Applying slotted content', {
        slotElement,
        content: this.slottedContent.substring(0, 100),
      });
      if (slotElement) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.slottedContent;
        slotElement.replaceWith(...Array.from(tempDiv.childNodes));
        this.slottedContentApplied = true;
        console.log('[SummaryBox] Slotted content applied successfully');
      } else {
        console.warn('[SummaryBox] Slot element not found!');
      }
    } else {
      console.log('[SummaryBox] Skipping slot application', {
        reason: !this.slottedContent
          ? 'no slotted content'
          : this.slottedContentApplied
            ? 'already applied'
            : this.content
              ? 'using content property'
              : 'unknown',
      });
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    // Clean up USWDS behavior
    try {
      if (typeof window !== 'undefined' && typeof (window as any).USWDS !== 'undefined') {
        const USWDS = (window as any).USWDS;
        if (USWDS['summary-box'] && typeof USWDS['summary-box'].off === 'function') {
          USWDS['summary-box'].off(this);
        }
      }
    } catch (error) {
      console.warn('📋 SummaryBox: Cleanup failed:', error);
    }
    // Additional cleanup for event listeners would go here
  }

  override render() {
    return html`
      <div class="usa-summary-box">
        <div class="usa-summary-box__body">
          ${this.renderHeading()}
          <div class="usa-summary-box__text">
            <!-- Content set via innerHTML in updated() when content property is used -->
            <!-- Otherwise slot content is used -->
            ${this.content ? '' : html`<slot></slot>`}
          </div>
        </div>
      </div>
    `;
  }
}
