import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { USWDSBaseComponent } from '@uswds-wc/core';
import { initializeDatePicker } from './usa-date-picker-behavior.js';

// Import official USWDS compiled CSS

/**
 * USA Date Picker Web Component
 *
 * Minimal wrapper around USWDS date picker functionality.
 * All date picker behavior and calendar popup is managed by USWDS JavaScript.
 *
 * **MANDATORY INITIAL VALUE PATTERN**:
 * This component uses USWDS-native `data-default-value` pattern for initial value persistence.
 * DO NOT create custom restoration logic. See docs/USWDS_INITIAL_VALUE_PATTERN.md
 *
 * @element usa-date-picker
 * @fires date-change - Dispatched when the date value changes
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 * @see ../../docs/USWDS_INITIAL_VALUE_PATTERN.md - MANDATORY initial value pattern
 *
 * @uswds-js-reference https://github.com/uswds/uswds/tree/develop/packages/usa-date-picker/src/index.js
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-date-picker/src/styles/_usa-date-picker.scss
 * @uswds-docs https://designsystem.digital.gov/components/date-picker/
 * @uswds-guidance https://designsystem.digital.gov/components/date-picker/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/date-picker/#accessibility
 */
@customElement('usa-date-picker')
export class USADatePicker extends USWDSBaseComponent {
  static override styles = css`
    :host {
      display: block;
    }
    :host([hidden]) {
      display: none;
    }
  `;

  @property({ type: String })
  value = '';

  @property({ type: String })
  name = 'date-picker';

  @property({ type: String })
  inputId = 'date-picker-input';

  @property({ type: String })
  label = 'Date';

  @property({ type: String })
  hint = '';

  @property({ type: String })
  placeholder = 'mm/dd/yyyy';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  required = false;

  @property({ type: Boolean, reflect: true })
  readonly = false;

  @property({ type: String })
  minDate = '';

  @property({ type: String })
  maxDate = '';

  @property({ type: String })
  error = '';

  @property({ type: Boolean, reflect: true })
  errorState = false;

  // Store cleanup function from behavior
  private cleanup?: () => void;

  override connectedCallback() {
    super.connectedCallback();
    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');
  }

  override async firstUpdated(changedProperties: Map<string, any>) {
    // ARCHITECTURE: Script Tag Pattern
    // USWDS is loaded globally via script tag in .storybook/preview-head.html
    // Components just render HTML - USWDS enhances automatically via window.USWDS

    // ARCHITECTURE: USWDS-Mirrored Behavior Pattern
    // Uses dedicated behavior file (usa-date-picker-behavior.ts) that replicates USWDS source exactly

    super.firstUpdated(changedProperties);

    // Wait for DOM to be fully rendered
    await this.updateComplete;
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));

    // Initialize using mirrored USWDS behavior
    this.cleanup = initializeDatePicker(this);
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    // CRITICAL: Do NOT sync value changes to USWDS-created inputs!
    // The USWDS behavior (setCalendarValue) handles ALL input synchronization.
    // The internal input uses YYYY-MM-DD format, external input uses MM/DD/YYYY.
    // Syncing here would overwrite the external input's formatted value with the internal format.
    // The component's value property is only used for the initial render.

    // Handle minDate/maxDate changes - update data attributes
    // These changes require re-initialization because USWDS caches these values during enhancement
    if (changedProperties.has('minDate') || changedProperties.has('maxDate')) {
      const datePickerWrapper = this.querySelector('.usa-date-picker') as HTMLElement;
      if (datePickerWrapper) {
        // Update data attributes - the behavior will read these on next calendar render
        if (this.minDate) {
          datePickerWrapper.dataset.minDate = this.minDate;
        } else {
          delete datePickerWrapper.dataset.minDate;
        }
        if (this.maxDate) {
          datePickerWrapper.dataset.maxDate = this.maxDate;
        } else {
          delete datePickerWrapper.dataset.maxDate;
        }
      }
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanup?.();
  }

  private handleInputChange(e: Event) {
    const input = e.target as HTMLInputElement;

    // Update component value from input
    this.value = input.value;

    // Dispatch web component events
    this.dispatchEvent(
      new CustomEvent('date-change', {
        detail: {
          value: this.value,
          date: this.value ? new Date(this.value) : null,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleKeydown(_e: KeyboardEvent) {
    // Keyboard navigation is handled by USWDS behavior file
    // This handler is kept minimal for basic input functionality
  }

  private renderLabel() {
    if (!this.label) return '';

    return html`
      <label class="usa-label" id="${this.inputId}-label" for="${this.inputId}">
        ${this.label}
        ${this.required
          ? html`<abbr title="required" class="usa-hint usa-hint--required">*</abbr>`
          : ''}
      </label>
    `;
  }

  private renderHint() {
    if (!this.hint) return '';
    return html`<div class="usa-hint" id="${this.inputId}-hint">${this.hint}</div>`;
  }

  private renderError() {
    if (!this.error) return '';
    return html`
      <div class="usa-error-message" id="${this.inputId}-error" role="alert">
        <span class="usa-sr-only">Error:</span> ${this.error}
      </div>
    `;
  }

  override render() {
    const formGroupClasses = [
      'usa-form-group',
      this.error || this.errorState ? 'usa-form-group--error' : '',
      this.required ? 'usa-form-group--required' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const ariaDescribedBy = [
      this.hint ? `${this.inputId}-hint` : '',
      this.error ? `${this.inputId}-error` : '',
    ]
      .filter(Boolean)
      .join(' ');

    // USWDS Progressive Enhancement: Provide minimal structure that USWDS transforms
    // CRITICAL USWDS Pattern for Initial Values:
    // 1. Set value attribute on input (USWDS reads this during initialization)
    // 2. Set data-default-value on wrapper (USWDS uses this to restore after clearing)
    // Why both? USWDS clears input.value at line 908, but needs it initially to read format
    return html`
      <div class="${formGroupClasses}">
        ${this.renderError()} ${this.renderLabel()} ${this.renderHint()}
        <div
          class="usa-date-picker"
          data-min-date="${this.minDate || ''}"
          data-max-date="${this.maxDate || ''}"
          data-default-value="${this.value || ''}"
          data-enhanced="false"
          data-web-component-managed="true"
          aria-haspopup="dialog"
          aria-controls="${this.inputId}-calendar"
        >
          <input
            class="usa-input"
            id="${this.inputId}"
            name="${this.name}"
            type="text"
            value="${this.value}"
            placeholder="${this.placeholder}"
            ?disabled=${this.disabled}
            ?required=${this.required}
            ?readonly=${this.readonly}
            aria-labelledby="${ifDefined(this.label ? `${this.inputId}-label` : undefined)}"
            aria-describedby="${ifDefined(ariaDescribedBy || undefined)}"
            @input="${this.handleInputChange}"
            @change="${this.handleInputChange}"
            @keydown="${this.handleKeydown}"
          />
        </div>
      </div>
    `;
  }

  // Public API methods
  override focus() {
    const input = this.querySelector(`#${this.inputId}`) as HTMLInputElement;
    input?.focus();
  }

  clear() {
    this.value = '';
    const input = this.querySelector(`#${this.inputId}`) as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  }

  toggleCalendar() {
    // Find the USWDS-created toggle button and click it to open/close calendar
    const toggleButton = this.querySelector('.usa-date-picker__button') as HTMLButtonElement;
    if (toggleButton) {
      toggleButton.click();
    }
  }

  isValid(): boolean {
    const input = this.querySelector(`#${this.inputId}`) as HTMLInputElement;
    return input ? input.checkValidity() : true;
  }
}
