import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// Import official USWDS compiled CSS

/**
 * USA Range Slider Web Component
 *
 * A simple, accessible USWDS range slider implementation as a custom element.
 * Uses official USWDS classes and styling with minimal custom code.
 *
 * @element usa-range-slider
 * @fires range-change - Dispatched when range value changes
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-js-reference https://github.com/uswds/uswds/tree/develop/packages/usa-range/src/index.js
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-range/src/styles/_usa-range.scss
 * @uswds-docs https://designsystem.digital.gov/components/range/
 * @uswds-guidance https://designsystem.digital.gov/components/range/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/range/#accessibility
 */
@customElement('usa-range-slider')
export class USARangeSlider extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
  `;

  @property({ type: Number })
  value = 50;

  @property({ type: Number })
  min = 0;

  @property({ type: Number })
  max = 100;

  @property({ type: Number })
  step = 1;

  @property({ type: String })
  name = 'range-slider';

  @property({ type: String })
  inputId = 'range-slider-input';

  @property({ type: String })
  label = 'Range';

  @property({ type: String })
  hint = '';

  @property({ type: String })
  error = '';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  required = false;

  @property({ type: String })
  unit = '';

  @property({ type: Boolean, reflect: true })
  showValue = true;

  @property({ type: Boolean, reflect: true })
  showOutput = true;

  @property({ type: Boolean, reflect: true })
  showMinMax = true;

  // Use light DOM for USWDS compatibility
  protected override createRenderRoot(): HTMLElement {
    return this as any;
  }

  override connectedCallback() {
    super.connectedCallback();

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');
  }

  override async firstUpdated(changedProperties: Map<string, any>) {
    // ARCHITECTURE: Script Tag Pattern
    // USWDS is loaded globally via script tag in .storybook/preview-head.html
    // Components just render HTML - USWDS enhances automatically via window.USWDS

    super.firstUpdated(changedProperties);
    await this.initializeUSWDSRange();
  }

  private async initializeUSWDSRange() {
    try {
      await this.updateComplete;

      // Wait one frame to ensure DOM is queryable
      await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));

      // NOTE: We render the wrapper ourselves to have control over showValue property
      // USWDS.range.on() would create a duplicate wrapper, so we don't call it
      // Instead, we handle value updates manually in updated() lifecycle
    } catch {
      // Initialization failed, component will still render with basic behavior
    }
  }

  private updateProgress() {
    // USWDS range elements handle their own styling automatically
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);
    if (
      changedProperties.has('value') ||
      changedProperties.has('min') ||
      changedProperties.has('max')
    ) {
      this.updateProgress();

      // Update USWDS callout if available
      this.updateUSWDSCallout();
    }
  }

  private updateUSWDSCallout() {
    try {
      if (typeof window !== 'undefined' && (window as any).USWDS?.range) {
        const input = this.querySelector('.usa-range') as HTMLInputElement;
        if (input) {
          (window as any).USWDS.range.updateCallout(input);
          (window as any).USWDS.range.updateVisualCallout(input);
        }
      }
    } catch (error) {
      // Silently fail if USWDS methods aren't available
    }
  }

  private formatValue(value: number): string {
    return `${value}${this.unit || ''}`;
  }

  private getAriaDescribedBy(): string | undefined {
    const descriptions = [
      this.hint ? `${this.inputId}-hint` : '',
      this.error ? `${this.inputId}-error` : '',
    ]
      .filter(Boolean)
      .join(' ');

    return descriptions || undefined;
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    // No USWDS cleanup needed since we manage the wrapper ourselves
  }

  private renderRequiredIndicator() {
    if (!this.required) return '';
    return html`<abbr title="required" class="usa-hint usa-hint--required">*</abbr>`;
  }

  private renderHint() {
    if (!this.hint) return '';
    return html`<span class="usa-hint" id="${this.inputId}-hint">${this.hint}</span>`;
  }

  private renderError() {
    if (!this.error) return '';

    return html`
      <span class="usa-error-message" id="${this.inputId}-error" role="alert">
        <span class="usa-sr-only">Error:</span> ${this.error}
      </span>
    `;
  }

  private renderValue() {
    if (!this.showValue) return '';
    return html`<span class="usa-range__value">${this.formatValue(this.value)}</span>`;
  }

  private renderMinMax() {
    if (!this.showMinMax) return '';

    return html`
      <div class="display-flex flex-justify margin-top-05">
        <span>${this.formatValue(this.min)}</span>
        <span>${this.formatValue(this.max)}</span>
      </div>
    `;
  }

  private calculatePercentage(value: number): number {
    const range = this.max - this.min;
    return range === 0 ? 0 : ((value - this.min) / range) * 100;
  }

  private dispatchRangeChange(newValue: number) {
    this.dispatchEvent(
      new CustomEvent('range-change', {
        detail: {
          value: newValue,
          formattedValue: this.formatValue(newValue).replace(this.unit, ''), // Remove unit for formatted value
          percentage: this.calculatePercentage(newValue),
          target: this,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const newValue = parseInt(target.value, 10);

    if (!isNaN(newValue) && newValue !== this.value) {
      this.value = newValue;
      this.dispatchRangeChange(newValue);
    }
  }

  private handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const newValue = parseInt(target.value, 10);

    if (!isNaN(newValue)) {
      this.value = newValue;
      this.dispatchRangeChange(newValue);
    }
  }

  private handleKeydown(event: KeyboardEvent) {
    const target = event.target as HTMLInputElement;
    let newValue = this.value;
    const largeStep = Math.max(this.step * 10, (this.max - this.min) / 10);

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        newValue = Math.max(this.min, this.value - this.step);
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        newValue = Math.min(this.max, this.value + this.step);
        break;
      case 'Home':
        newValue = this.min;
        break;
      case 'End':
        newValue = this.max;
        break;
      case 'PageUp':
        newValue = Math.min(this.max, this.value + largeStep);
        break;
      case 'PageDown':
        newValue = Math.max(this.min, this.value - largeStep);
        break;
      default:
        return; // Don't prevent default for other keys
    }

    event.preventDefault();
    target.value = newValue.toString();
    this.value = newValue;
    this.dispatchRangeChange(newValue);
  }

  override render() {
    const hasError = Boolean(this.error);
    const formGroupClasses = [
      'usa-form-group',
      hasError ? 'usa-form-group--error' : '',
      this.required ? 'usa-form-group--required' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const labelClasses = ['usa-label', hasError ? 'usa-label--error' : '']
      .filter(Boolean)
      .join(' ');

    const inputClasses = ['usa-range', 'usa-range__input', hasError ? 'usa-range--error' : '']
      .filter(Boolean)
      .join(' ');

    return html`
      <div class="${formGroupClasses}">
        <label class="${labelClasses}" for="${this.inputId}">
          ${this.label} ${this.renderRequiredIndicator()}
        </label>
        ${this.renderHint()} ${this.renderError()}

        <div class="usa-range__wrapper">
          <input
            class="${inputClasses}"
            id="${this.inputId}"
            name="${this.name}"
            type="range"
            min="${this.min}"
            max="${this.max}"
            step="${this.step}"
            .value="${this.value.toString()}"
            ?disabled=${this.disabled}
            ?required=${this.required}
            aria-describedby="${this.getAriaDescribedBy()}"
            aria-valuemin="${this.min}"
            aria-valuemax="${this.max}"
            aria-valuenow="${this.value}"
            aria-valuetext="${this.formatValue(this.value)}"
            aria-invalid="${this.error ? 'true' : 'false'}"
            @input=${this.handleInput}
            @change=${this.handleChange}
            @keydown=${this.handleKeydown}
          />
          ${this.renderValue()}
        </div>
        ${this.renderMinMax()}
      </div>
    `;
  }
}
