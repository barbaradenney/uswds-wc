import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// Import official USWDS compiled CSS
import '@uswds-wc/core/styles.css';

/**
 * USA Checkbox Web Component
 *
 * A simple, accessible USWDS checkbox implementation as a custom element.
 * Uses official USWDS classes and styling with minimal custom code.
 *
 * @element usa-checkbox
 * @fires change - Dispatched when the checkbox state changes
 * @fires input - Dispatched when the checkbox state changes (for consistency)
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-checkbox/src/styles/_usa-checkbox.scss
 * @uswds-docs https://designsystem.digital.gov/components/checkbox/
 * @uswds-guidance https://designsystem.digital.gov/components/checkbox/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/checkbox/#accessibility
 */
@customElement('usa-checkbox')
export class USACheckbox extends LitElement {
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
  indeterminate = false;

  @property({ type: Boolean, reflect: true })
  tile = false;

  /**
   * Whether to render in compact mode (no form-group wrapper)
   * Use this when the checkbox is inside a fieldset or pattern where
   * the parent handles spacing and grouping
   */
  @property({ type: Boolean })
  compact = false;

  private checkboxElement?: HTMLInputElement;
  private _checkboxId?: string;
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

    // Initialize progressive enhancement
    this.initializeUSWDSCheckbox();
  }

  override firstUpdated() {
    // ARCHITECTURE: Script Tag Pattern
    // USWDS is loaded globally via script tag in .storybook/preview-head.html
    // Components just render HTML - USWDS enhances automatically via window.USWDS

    // Get reference to the checkbox element after first render
    this.checkboxElement = this.querySelector('input[type="checkbox"]') as HTMLInputElement;
    const label = this.querySelector('label') as HTMLLabelElement;

    if (this.checkboxElement && label) {
      this.updateCheckboxElement();

      // Listen to the native input element's change event
      this.checkboxElement.addEventListener('change', this.handleChange);
    }
  }

  override updated(_changedProperties: Map<string, any>) {
    // Update checkbox element reference if needed
    const currentCheckbox = this.querySelector('input[type="checkbox"]') as HTMLInputElement;
    if (currentCheckbox) {
      this.checkboxElement = currentCheckbox;
      this.updateCheckboxElement();
    }
  }

  private updateCheckboxElement() {
    if (!this.checkboxElement) return;

    // Update checkbox properties
    this.checkboxElement.name = this.name;
    this.checkboxElement.value = this.value;
    this.checkboxElement.checked = this.checked;
    this.checkboxElement.disabled = this.disabled;
    this.checkboxElement.required = this.required;
    this.checkboxElement.indeterminate = this.indeterminate;

    // Update classes
    // Remove existing USWDS classes
    const classesToRemove = Array.from(this.checkboxElement.classList).filter((className) =>
      className.startsWith('usa-checkbox__input')
    );
    classesToRemove.forEach((className) => this.checkboxElement?.classList.remove(className));

    // Always add base usa-checkbox__input class
    this.checkboxElement.classList.add('usa-checkbox__input');

    // Add tile class if needed
    if (this.tile) {
      this.checkboxElement.classList.add('usa-checkbox__input--tile');
    }

    // Add error class if error exists
    if (this.error) {
      this.checkboxElement.classList.add('usa-input--error');
    }

    // Update ARIA attributes
    if (this.error) {
      this.checkboxElement.setAttribute('aria-invalid', 'true');
    } else {
      this.checkboxElement.removeAttribute('aria-invalid');
    }
  }

  private handleChange = (e: Event) => {
    const checkbox = e.target as HTMLInputElement;
    this.checked = checkbox.checked;

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

  /**
   * Public API: Reset checkbox to unchecked state
   * Allows patterns to clear the checkbox without DOM manipulation
   */
  reset(): void {
    this.checked = false;
    this.requestUpdate();
  }

  private get checkboxId() {
    // Always check for element id first, then use cached generated id
    if (this.id) {
      return this.id;
    }
    if (!this._checkboxId) {
      this._checkboxId = `checkbox-${Math.random().toString(36).substring(2, 11)}`;
    }
    return this._checkboxId;
  }
  private async initializeUSWDSCheckbox() {
    // Prevent multiple initializations
    if (this.usingUSWDSEnhancement) {
      console.log(
        `⚠️ ${this.constructor.name}: Already initialized, skipping duplicate initialization`
      );
      return;
    }

    console.log(
      `☑️ Checkbox: Initializing (presentational component - no USWDS JavaScript needed)`
    );

    try {
      // Check if global USWDS is available for potential future enhancements
      if (typeof window !== 'undefined' && typeof (window as any).USWDS !== 'undefined') {
        const USWDS = (window as any).USWDS;
        if (USWDS.checkbox && typeof USWDS.checkbox.on === 'function') {
          USWDS.checkbox.on(this);
          console.log(`☑️ Checkbox: Enhanced with global USWDS JavaScript`);
          return;
        }
      }

      console.log(
        `☑️ Checkbox: Using presentational component behavior (USWDS Checkbox is CSS-only)`
      );
    } catch (error) {
      console.warn(`☑️ Checkbox: Initialization completed with basic behavior:`, error);
    }
  }

  override disconnectedCallback() {
    // Clean up event listeners
    if (this.checkboxElement) {
      this.checkboxElement.removeEventListener('change', this.handleChange);
    }
    super.disconnectedCallback();
    this.cleanupUSWDS();
  }

  /**
   * Clean up USWDS module on component destruction
   */
  private cleanupUSWDS() {
    // Try cleanup with global USWDS (checkbox components are presentational)
    if (typeof window !== 'undefined' && typeof (window as any).USWDS !== 'undefined') {
      const USWDS = (window as any).USWDS;
      if (USWDS.checkbox?.off) {
        try {
          USWDS.checkbox.off(this);
          console.log(`🧹 Cleaned up USWDS checkbox`);
        } catch (error) {
          console.warn(`⚠️ Error cleaning up USWDS:`, error);
        }
      }
    }
  }
  private renderError(checkboxId: string) {
    if (!this.error) return '';

    return html`
      <span class="usa-error-message" id="${checkboxId}-error" role="alert">
        <span class="usa-sr-only">Error:</span> ${this.error}
      </span>
    `;
  }

  private renderDescription(checkboxId: string) {
    if (!this.description) return '';

    return html`
      <span class="usa-checkbox__label-description" id="${checkboxId}-description">
        ${this.description}
      </span>
    `;
  }

  override render() {
    const checkboxId = this.checkboxId;

    const describedByIds: string[] = [];
    if (this.description) {
      describedByIds.push(`${checkboxId}-description`);
    }
    if (this.error) {
      describedByIds.push(`${checkboxId}-error`);
    }

    // Build wrapper classes
    const wrapperClasses = ['usa-checkbox', this.tile ? 'usa-checkbox--tile' : '']
      .filter(Boolean)
      .join(' ');

    const ariaDescribedby = describedByIds.length > 0 ? describedByIds.join(' ') : undefined;

    return html`
      ${this.renderError(checkboxId)}
      <div class="${wrapperClasses}">
        <input
          id="${checkboxId}"
          class="usa-checkbox__input ${this.tile ? 'usa-checkbox__input--tile' : ''} ${this.error
            ? 'usa-input--error'
            : ''}"
          type="checkbox"
          name="${this.name}"
          value="${this.value}"
          ?checked="${this.checked}"
          ?disabled="${this.disabled}"
          ?required="${this.required}"
          .indeterminate="${this.indeterminate}"
          aria-describedby="${ariaDescribedby || undefined}"
          aria-invalid="${this.error ? 'true' : undefined}"
        />
        <label class="usa-checkbox__label" for="${checkboxId}">
          ${this.label} ${this.renderDescription(checkboxId)}
        </label>
      </div>
    `;
  }
}
