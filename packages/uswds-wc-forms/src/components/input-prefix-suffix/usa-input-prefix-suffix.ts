import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// Import official USWDS compiled CSS
import '@uswds-wc/core/styles.css';
// Import usa-icon component for icon support
import '@uswds-wc/data-display';

/**
 * USA Input Prefix/Suffix Web Component
 *
 * A simple, accessible USWDS input with prefix/suffix implementation as a custom element.
 * Uses official USWDS classes and styling with minimal custom code.
 *
 * @element usa-input-prefix-suffix
 * @fires input-change - Dispatched when input value changes
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-input-prefix-suffix/src/styles/_usa-input-prefix-suffix.scss
 * @uswds-docs https://designsystem.digital.gov/components/input-prefix-suffix/
 * @uswds-guidance https://designsystem.digital.gov/components/input-prefix-suffix/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/input-prefix-suffix/#accessibility
 */
@customElement('usa-input-prefix-suffix')
export class USAInputPrefixSuffix extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
  `;

  @property({ type: String })
  value = '';

  @property({ type: String })
  name = 'input-prefix-suffix';

  @property({ type: String })
  inputId = 'input-prefix-suffix';

  @property({ type: String })
  label = 'Input';

  @property({ type: String })
  hint = '';

  @property({ type: String })
  placeholder = '';

  @property({ type: String })
  override prefix = '';

  @property({ type: String })
  suffix = '';

  @property({ type: String })
  prefixIcon = '';

  @property({ type: String })
  suffixIcon = '';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  required = false;

  @property({ type: Boolean, reflect: true })
  readonly = false;

  @property({ type: String })
  type = 'text';

  @property({ type: String })
  autocomplete = '';

  @property({ type: String })
  error = '';

  // Use light DOM for USWDS compatibility
  protected override createRenderRoot(): HTMLElement {
    return this as any;
  }

  override connectedCallback() {
    super.connectedCallback();

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');
  }

  private handleInputChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.value = input.value;

    this.dispatchEvent(
      new CustomEvent('input-change', {
        detail: {
          value: this.value,
          name: this.name,
          input: input,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private renderPrefixContent() {
    if (this.prefixIcon) {
      return html`<usa-icon name="${this.prefixIcon}" decorative="true"></usa-icon>`;
    }
    return this.prefix;
  }

  private renderPrefix() {
    if (!this.prefix && !this.prefixIcon) return '';

    return html`
      <div class="usa-input-prefix" aria-hidden="true">${this.renderPrefixContent()}</div>
    `;
  }

  private renderSuffixContent() {
    if (this.suffixIcon) {
      return html`<usa-icon name="${this.suffixIcon}" decorative="true"></usa-icon>`;
    }
    return this.suffix;
  }

  private renderSuffix() {
    if (!this.suffix && !this.suffixIcon) return '';

    return html`
      <div class="usa-input-suffix" aria-hidden="true">${this.renderSuffixContent()}</div>
    `;
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    // Clean up USWDS behavior
    try {
      if (typeof window !== 'undefined' && typeof (window as any).USWDS !== 'undefined') {
        const USWDS = (window as any).USWDS;
        if (
          USWDS['input-prefix-suffix'] &&
          typeof USWDS['input-prefix-suffix'].off === 'function'
        ) {
          USWDS['input-prefix-suffix'].off(this);
        }
      }
    } catch (error) {
      console.warn('📋 InputPrefixSuffix: Cleanup failed:', error);
    }
    // Additional cleanup for event listeners would go here
  }

  private renderRequiredIndicator() {
    if (!this.required) return '';
    return html`<abbr title="required" class="usa-hint usa-hint--required">*</abbr>`;
  }

  private renderHint() {
    if (!this.hint) return '';
    return html`<div class="usa-hint" id="${this.inputId}-hint">${this.hint}</div>`;
  }

  private renderErrorMessage() {
    const hasError = !!(this.error && this.error.trim() !== '');
    if (!hasError) return '';

    return html`
      <div class="usa-error-message" id="${this.inputId}-error-message" role="alert">
        ${this.error}
      </div>
    `;
  }

  private getAriaDescribedBy(hasError: boolean): string {
    const parts = [];
    if (this.hint) {
      parts.push(`${this.inputId}-hint`);
    }
    if (hasError) {
      parts.push(`${this.inputId}-error-message`);
    }
    return parts.join(' ');
  }

  override render() {
    const hasError = !!(this.error && this.error.trim() !== '');
    const formGroupClasses = ['usa-form-group', hasError ? 'usa-form-group--error' : '']
      .filter(Boolean)
      .join(' ');

    const labelClasses = ['usa-label', hasError ? 'usa-label--error' : '']
      .filter(Boolean)
      .join(' ');

    const inputGroupClasses = ['usa-input-group', hasError ? 'usa-input-group--error' : '']
      .filter(Boolean)
      .join(' ');

    const inputClasses = ['usa-input', hasError ? 'usa-input--error' : '']
      .filter(Boolean)
      .join(' ');

    return html`
      <div class="${formGroupClasses}">
        <label class="${labelClasses}" for="${this.inputId}">
          ${this.label} ${this.renderRequiredIndicator()}
        </label>
        ${this.renderHint()} ${this.renderErrorMessage()}

        <div class="${inputGroupClasses}">
          ${this.renderPrefix()}

          <input
            class="${inputClasses}"
            id="${this.inputId}"
            name="${this.name}"
            type="${this.type}"
            .value="${this.value}"
            placeholder="${this.placeholder}"
            ?disabled=${this.disabled}
            ?required=${this.required}
            ?readonly=${this.readonly}
            autocomplete="${this.autocomplete}"
            aria-describedby="${this.getAriaDescribedBy(hasError)}"
            aria-invalid="${hasError ? 'true' : 'false'}"
            @input="${this.handleInputChange}"
            @change="${this.handleInputChange}"
          />

          ${this.renderSuffix()}
        </div>
      </div>
    `;
  }
}
