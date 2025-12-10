import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { USWDSBaseComponent } from '@uswds-wc/core';
import { initializeComboBox } from './usa-combo-box-behavior.js';

// Import official USWDS compiled CSS

export interface ComboBoxOption {
  value: string;
  label: string;
  text?: string; // Alias for compatibility
  disabled?: boolean;
}

export interface ComboBoxChangeDetail {
  value: string;
  displayValue: string;
}

/**
 * USA Combo Box Web Component
 *
 * Minimal wrapper around USWDS combo box functionality.
 * All option filtering, dropdown behavior, and interaction is managed by USWDS JavaScript.
 * USWDS transforms the simple select element into a full combo box with input and dropdown.
 *
 * @element usa-combo-box
 * @fires combo-box-change - Dispatched when selection changes (via USWDS)
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-js-reference https://github.com/uswds/uswds/tree/develop/packages/usa-combo-box/src/index.js
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-combo-box/src/styles/_usa-combo-box.scss
 * @uswds-docs https://designsystem.digital.gov/components/combo-box/
 * @uswds-guidance https://designsystem.digital.gov/components/combo-box/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/combo-box/#accessibility
 */
@customElement('usa-combo-box')
export class USAComboBox extends USWDSBaseComponent {
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
  name = '';

  @property({ type: String })
  inputId = 'uswds-combo-box-select';

  @property({ type: String })
  selectId = '';

  @property({ type: String })
  label = '';

  @property({ type: String })
  hint = '';

  @property({ type: String })
  placeholder = '';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  required = false;

  @property({ type: String })
  error = '';

  @property({ type: Boolean, reflect: true })
  errorState = false;

  @property({ type: Array })
  options: ComboBoxOption[] = [];

  @property({ type: Boolean, reflect: true })
  disableFiltering = false;

  // Let USWDS handle all state management

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
    // Uses dedicated behavior file (usa-combo-box-behavior.ts) that replicates USWDS source exactly

    super.firstUpdated(changedProperties);

    // Wait for DOM to be fully rendered
    await this.updateComplete;
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));

    // Initialize using mirrored USWDS behavior
    this.cleanup = initializeComboBox(this);
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    // Handle options changes - need to reinitialize for new option list
    if (changedProperties.has('options')) {
      this.cleanup?.();
      this.cleanup = initializeComboBox(this);
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanup?.();
  }

  private renderError() {
    if (!this.error) return '';
    return html`
      <div class="usa-error-message" id="${this.inputId}-error" role="alert">
        <span class="usa-sr-only">Error:</span> ${this.error}
      </div>
    `;
  }

  private renderRequiredIndicator() {
    if (!this.required) return '';
    return html`<abbr title="required" class="usa-hint usa-hint--required">*</abbr>`;
  }

  private renderHint() {
    if (!this.hint) return '';
    return html`<div class="usa-hint" id="${this.inputId}-hint">${this.hint}</div>`;
  }

  private renderLabel(selectId: string) {
    // Always provide a label for accessibility
    return html`
      <label class="usa-label" for="${selectId}">
        ${this.label || 'Combo Box'} ${this.renderRequiredIndicator()}
      </label>
    `;
  }

  private renderPlaceholderOption() {
    if (!this.placeholder) return '';
    return html`<option value="" ?selected=${!this.value}>${this.placeholder}</option>`;
  }

  private renderSelectOption(option: ComboBoxOption) {
    return html`
      <option
        value="${option.value}"
        ?selected=${this.value === option.value}
        ?disabled=${option.disabled}
      >
        ${option.label}
      </option>
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

    // Ensure we always have a valid, unique ID for the select element
    // Using a more robust ID that's less likely to conflict with USWDS internals
    const selectId =
      this.selectId || this.inputId || `uswds-combo-box-${Math.random().toString(36).substr(2, 9)}`;

    const ariaDescribedBy = [
      this.hint ? `${selectId}-hint` : '',
      this.error ? `${selectId}-error` : '',
    ]
      .filter(Boolean)
      .join(' ');

    // Render simple select structure that USWDS will transform into a combo box

    return html`
      <div class="${formGroupClasses}">
        ${this.renderError()} ${this.renderLabel(selectId)} ${this.renderHint()}
        <div
          class="usa-combo-box"
          data-enhanced="false"
          data-default-value="${this.value || ''}"
          data-placeholder="${this.placeholder || ''}"
          data-disable-filtering="${this.disableFiltering}"
        >
          <select
            id="${selectId}"
            name="${this.name}"
            class="usa-select usa-sr-only"
            .value="${this.value}"
            ?disabled=${this.disabled}
            ?required=${this.required}
            aria-describedby="${ifDefined(ariaDescribedBy || undefined)}"
          >
            ${this.renderPlaceholderOption()}
            ${this.options.map((option) => this.renderSelectOption(option))}
          </select>
        </div>
      </div>
    `;
  }

  // Public API methods - delegate to USWDS
  show() {
    // USWDS will handle opening the combo box when user interacts
    const selectElement = this.querySelector('.usa-combo-box select') as HTMLSelectElement;
    if (selectElement) {
      selectElement.focus();
    }
  }

  hide() {
    // USWDS will handle closing the combo box
    const selectElement = this.querySelector('.usa-combo-box select') as HTMLSelectElement;
    if (selectElement) {
      selectElement.blur();
    }
  }

  updateOptions() {
    console.log('Combo Box: Update options triggered - requesting re-render');
    // Trigger re-render to update the select options
    this.requestUpdate();
  }
}
