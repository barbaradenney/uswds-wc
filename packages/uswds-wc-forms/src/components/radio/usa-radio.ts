import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

// Import official USWDS compiled CSS
import '@uswds-wc/core/styles.css';

/**
 * USA Radio Web Component
 *
 * A simple, accessible USWDS radio button implementation as a custom element.
 * Uses official USWDS classes and styling with minimal custom code.
 *
 * @element usa-radio
 * @fires change - Dispatched when the radio state changes
 * @fires input - Dispatched when the radio state changes (for consistency)
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-radio/src/styles/_usa-radio.scss
 * @uswds-docs https://designsystem.digital.gov/components/radio/
 * @uswds-guidance https://designsystem.digital.gov/components/radio/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/radio/#accessibility
 */
@customElement('usa-radio')
export class USARadio extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
  `;

  @property({ type: String })
  name = '';

  @property({ type: String })
  value = '';

  @property({ type: Boolean, reflect: true })
  checked = false;

  @property({ type: String })
  label = '';

  @property({ type: String })
  description = '';

  @property({ type: String })
  error = '';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  required = false;

  @property({ type: Boolean, reflect: true })
  tile = false;

  private radioElement?: HTMLInputElement;
  private _radioId?: string;
  private usingUSWDSEnhancement = false;

  // Store USWDS module for cleanup

  // Use light DOM for USWDS compatibility
  protected override createRenderRoot(): HTMLElement {
    return this as any;
  }

  override connectedCallback() {
    super.connectedCallback();

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');
    // Don't set role on the host element - it will be on the input
    // Initialize progressive enhancement
    this.initializeUSWDSRadio();
  }

  override firstUpdated() {
    // ARCHITECTURE: Script Tag Pattern
    // USWDS is loaded globally via script tag in .storybook/preview-head.html
    // Components just render HTML - USWDS enhances automatically via window.USWDS

    // Get reference to the radio element after first render
    this.radioElement = this.querySelector('input[type="radio"]') as HTMLInputElement;
    const label = this.querySelector('label') as HTMLLabelElement;

    if (this.radioElement && label) {
      this.updateRadioElement();

      // Listen to the native input element's change event
      this.radioElement.addEventListener('change', this.handleChange);
    }
  }

  override updated(_changedProperties: Map<string, any>) {
    // Update the radio element if it exists
    if (this.radioElement) {
      this.updateRadioElement();
    }
  }

  private updateRadioElement() {
    if (!this.radioElement) return;

    // Update radio properties
    this.radioElement.name = this.name;
    this.radioElement.value = this.value;
    this.radioElement.checked = this.checked;
    this.radioElement.disabled = this.disabled;
    this.radioElement.required = this.required;

    // Update classes
    // Remove existing USWDS classes
    const classesToRemove = Array.from(this.radioElement.classList).filter((className) =>
      className.startsWith('usa-radio__input')
    );
    classesToRemove.forEach((className) => this.radioElement?.classList.remove(className));

    // Always add base usa-radio__input class
    this.radioElement.classList.add('usa-radio__input');

    // Add tile class if needed
    if (this.tile) {
      this.radioElement.classList.add('usa-radio__input--tile');
    }

    // Add error class if error exists
    if (this.error) {
      this.radioElement.classList.add('usa-input--error');
    }

    // Update ARIA attributes
    if (this.error) {
      this.radioElement.setAttribute('aria-invalid', 'true');
    } else {
      this.radioElement.removeAttribute('aria-invalid');
    }
  }

  private handleChange = (e: Event) => {
    const radio = e.target as HTMLInputElement;
    this.checked = radio.checked;

    // Dispatch both change and input events for consistency with other form elements
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: {
          checked: this.checked,
          value: this.value,
          name: this.name,
        },
        bubbles: true,
        composed: true,
      })
    );

    this.dispatchEvent(
      new CustomEvent('input', {
        detail: {
          checked: this.checked,
          value: this.value,
          name: this.name,
        },
        bubbles: true,
        composed: true,
      })
    );
  };

  private get radioId() {
    // Always check for element id first, then use cached generated id
    if (this.id) {
      return this.id;
    }
    if (!this._radioId) {
      // Generate exactly 9 random characters to ensure consistent ID length
      // Math.random().toString(36) can produce varying lengths, so we pad if needed
      let randomPart = Math.random().toString(36).substring(2, 11);
      while (randomPart.length < 9) {
        randomPart += Math.random().toString(36).substring(2, 3);
      }
      this._radioId = `radio-${randomPart.substring(0, 9)}`;
    }
    return this._radioId;
  }
  private async initializeUSWDSRadio() {
    // Prevent multiple initializations
    if (this.usingUSWDSEnhancement) {
      console.log(
        `⚠️ ${this.constructor.name}: Already initialized, skipping duplicate initialization`
      );
      return;
    }

    console.log(`🔘 Radio: Initializing (presentational component - no USWDS JavaScript needed)`);

    try {
      // Check if global USWDS is available for potential future enhancements
      if (typeof window !== 'undefined' && typeof (window as any).USWDS !== 'undefined') {
        const USWDS = (window as any).USWDS;
        if (USWDS.radio && typeof USWDS.radio.on === 'function') {
          USWDS.radio.on(this);
          console.log(`🔘 Radio: Enhanced with global USWDS JavaScript`);
          return;
        }
      }

      console.log(`🔘 Radio: Using presentational component behavior (USWDS Radio is CSS-only)`);
    } catch (error) {
      console.warn(`🔘 Radio: Initialization completed with basic behavior:`, error);
    }
  }

  override disconnectedCallback() {
    // Clean up event listeners
    if (this.radioElement) {
      this.radioElement.removeEventListener('change', this.handleChange);
    }
    super.disconnectedCallback();
    this.cleanupUSWDS();
  }

  /**
   * Clean up USWDS module on component destruction
   */
  private cleanupUSWDS() {
    // Try cleanup with global USWDS (radio components are presentational)
    if (typeof window !== 'undefined' && typeof (window as any).USWDS !== 'undefined') {
      const USWDS = (window as any).USWDS;
      if (USWDS.radio?.off) {
        try {
          USWDS.radio.off(this);
          console.log(`🧹 Cleaned up USWDS radio`);
        } catch (error) {
          console.warn(`⚠️ Error cleaning up USWDS:`, error);
        }
      }
    }
  }

  private renderError(radioId: string) {
    if (!this.error) return '';

    return html`
      <span class="usa-error-message" id="${radioId}-error" role="alert">
        <span class="usa-sr-only">Error:</span> ${this.error}
      </span>
    `;
  }

  private renderLabelDescription(radioId: string) {
    if (!this.description || !this.tile) return '';

    return html`
      <span class="usa-radio__label-description" id="${radioId}-description">
        ${this.description}
      </span>
    `;
  }

  override render() {
    const radioId = this.radioId;

    const wrapperClasses = ['usa-radio', this.tile ? 'usa-radio--tile' : '']
      .filter(Boolean)
      .join(' ');

    const describedByIds: string[] = [];
    if (this.description && this.tile) {
      describedByIds.push(`${radioId}-description`);
    }
    if (this.error) {
      describedByIds.push(`${radioId}-error`);
    }

    return html`
      ${this.renderError(radioId)}
      <div class="${wrapperClasses}">
        <input
          id="${radioId}"
          class="usa-radio__input${this.tile ? ' usa-radio__input--tile' : ''}${this.error
            ? ' usa-input--error'
            : ''}"
          type="radio"
          name="${this.name}"
          value="${this.value}"
          ?checked="${this.checked}"
          ?disabled="${this.disabled}"
          ?required="${this.required}"
          aria-describedby="${ifDefined(
            describedByIds.length > 0 ? describedByIds.join(' ') : undefined
          )}"
          @change="${this.handleChange}"
        />
        <label class="usa-radio__label" for="${radioId}">
          ${this.label} ${this.renderLabelDescription(radioId)}
        </label>
      </div>
    `;
  }
}
