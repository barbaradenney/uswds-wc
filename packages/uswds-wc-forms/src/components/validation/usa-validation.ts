import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

// Import official USWDS compiled CSS
import '@uswds-wc/core/styles.css';

export interface ValidationRule {
  type:
    | 'required'
    | 'email'
    | 'url'
    | 'pattern'
    | 'minlength'
    | 'maxlength'
    | 'min'
    | 'max'
    | 'custom';
  message: string;
  value?: string | number;
  pattern?: string;
  minlength?: number;
  maxlength?: number;
  min?: number;
  max?: number;
  validator?: (value: string) => boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * USA Validation Web Component
 *
 * A simple, accessible USWDS validation implementation as a custom element.
 * Provides real-time validation feedback with customizable rules and messages.
 * Uses official USWDS classes and styling with minimal custom code.
 *
 * @element usa-validation
 * @fires validation-change - Dispatched when validation status changes
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-validation/src/styles/_usa-validation.scss
 * @uswds-docs https://designsystem.digital.gov/components/validation/
 * @uswds-guidance https://designsystem.digital.gov/components/validation/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/validation/#accessibility
 */
@customElement('usa-validation')
export class USAValidation extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
  `;

  @property({ type: String })
  value = '';

  @property({ type: String })
  label = 'Input with validation';

  @property({ type: String })
  hint = '';

  @property({ type: String })
  name = 'validation-input';

  @property({ type: String })
  inputType: 'input' | 'textarea' | 'select' = 'input';

  @property({ type: String })
  type = 'text';

  @property({ type: Array })
  options: { value: string; text: string }[] = [];

  @property({ type: Number })
  rows = 3;

  @property({ type: String })
  placeholder = '';

  @property({ type: Boolean })
  disabled = false;

  @property({ type: Boolean })
  readonly = false;

  @property({ type: Array })
  rules: ValidationRule[] = [];

  @property({ type: Array })
  errors: string[] = [];

  @property({ type: Boolean })
  validateOnInput = true;

  @property({ type: Boolean })
  validateOnBlur = true;

  @property({ type: Boolean })
  showSuccessState = true;

  @property({ type: String })
  message = '';

  @property({ type: Boolean })
  valid = true;

  @state()
  private _validationResult: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  @state()
  private _hasBeenValidated = false;

  @state()
  private _showValidation = false;

  // Use light DOM for USWDS compatibility
  protected override createRenderRoot(): HTMLElement {
    return this as HTMLElement;
  }

  private validateValue(value: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const rule of this.rules) {
      switch (rule.type) {
        case 'required':
          if (!value || value.trim() === '') {
            errors.push(rule.message || 'This field is required');
          }
          break;

        case 'email':
          if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors.push(rule.message || 'Please enter a valid email address');
          }
          break;

        case 'url':
          if (value && !/^https?:\/\/.+\..+/.test(value)) {
            errors.push(rule.message || 'Please enter a valid URL');
          }
          break;

        case 'pattern': {
          const pattern = rule.pattern || (rule.value as string);
          if (value && pattern && !new RegExp(pattern).test(value)) {
            errors.push(rule.message || 'Please match the requested format');
          }
          break;
        }

        case 'minlength': {
          const minLength = rule.minlength || (rule.value as number);
          if (value && value.length < minLength) {
            errors.push(rule.message || `Must be at least ${minLength} characters long`);
          }
          break;
        }

        case 'maxlength': {
          const maxLength = rule.maxlength || (rule.value as number);
          if (value && value.length > maxLength) {
            errors.push(rule.message || `Must be no more than ${maxLength} characters long`);
          }
          break;
        }

        case 'min': {
          const minValue = rule.min || (rule.value as number);
          if (value && parseFloat(value) < minValue) {
            errors.push(rule.message || `Must be at least ${minValue}`);
          }
          break;
        }

        case 'max': {
          const maxValue = rule.max || (rule.value as number);
          if (value && parseFloat(value) > maxValue) {
            errors.push(rule.message || `Must be no more than ${maxValue}`);
          }
          break;
        }

        case 'custom':
          if (rule.validator && value && !rule.validator(value)) {
            errors.push(rule.message || 'Please enter a valid value');
          }
          break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private handleInput(e: Event) {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    this.value = target.value;

    if (this.validateOnInput) {
      this.performValidation();
    }
  }

  private handleBlur(_e: Event) {
    if (this.validateOnBlur) {
      this.performValidation();
      this._hasBeenValidated = true;
      this._showValidation = true;
    }
  }

  private performValidation() {
    const result = this.validateValue(this.value);
    this._validationResult = result;
    this._hasBeenValidated = true;
    this._showValidation = true;

    this.dispatchEvent(
      new CustomEvent('validation-change', {
        detail: {
          value: this.value,
          isValid: result.isValid,
          errors: result.errors,
          warnings: result.warnings,
          hasBeenValidated: this._hasBeenValidated,
        },
        bubbles: true,
        composed: true,
      })
    );

    this.requestUpdate();
  }

  private getFormGroupClasses(): string {
    const classes: string[] = ['usa-form-group'];

    // Check if any rule is required
    if (this.rules.some((rule) => rule.type === 'required')) {
      classes.push('usa-form-group--required');
    }

    // Check both validation result and explicit valid property
    const isInvalid = (this._hasBeenValidated && !this._validationResult.isValid) || !this.valid;
    if (isInvalid) {
      classes.push('usa-form-group--error');
    }

    return classes.join(' ');
  }

  private getInputClasses(): string {
    const baseClass =
      this.inputType === 'textarea'
        ? 'usa-textarea'
        : this.inputType === 'select'
          ? 'usa-select'
          : 'usa-input';
    const classes: string[] = [baseClass];

    if (this._hasBeenValidated && !this._validationResult.isValid) {
      classes.push(`${baseClass}--error`);
    } else if (this._hasBeenValidated && this._validationResult.isValid && this.showSuccessState) {
      classes.push(`${baseClass}--success`);
    }

    return classes.join(' ');
  }

  private renderSelectOption(option: { value: string; text: string }) {
    return html`<option value="${option.value}" ?selected=${option.value === this.value}>
      ${option.text}
    </option>`;
  }

  private renderInput() {
    const ariaDescribedBy = this.getAriaDescribedBy();

    if (this.inputType === 'textarea') {
      return html`
        <textarea
          class="${this.getInputClasses()}"
          id="${this.name}"
          name="${this.name}"
          rows="${this.rows}"
          placeholder="${this.placeholder}"
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          .value="${this.value}"
          @input="${this.handleInput}"
          @blur="${this.handleBlur}"
          aria-describedby="${ariaDescribedBy}"
        ></textarea>
      `;
    } else if (this.inputType === 'select') {
      return html`
        <select
          class="${this.getInputClasses()}"
          id="${this.name}"
          name="${this.name}"
          ?disabled=${this.disabled}
          @input="${this.handleInput}"
          @blur="${this.handleBlur}"
          aria-describedby="${ariaDescribedBy}"
        >
          <option value="">Choose an option</option>
          ${this.options.map((option) => this.renderSelectOption(option))}
        </select>
      `;
    } else {
      return html`
        <input
          class="${this.getInputClasses()}"
          type="${this.type}"
          id="${this.name}"
          name="${this.name}"
          placeholder="${this.placeholder}"
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          .value="${this.value}"
          @input="${this.handleInput}"
          @blur="${this.handleBlur}"
          aria-describedby="${ariaDescribedBy}"
        />
      `;
    }
  }

  private getAriaDescribedBy(): string {
    const ids = [];
    if (this.hint) {
      ids.push(`${this.name}-hint`);
    }
    if (this._hasBeenValidated && !this._validationResult.isValid) {
      ids.push(`${this.name}-error`);
    }
    return ids.join(' ');
  }

  // Public API methods
  validate(): ValidationResult {
    this.performValidation();
    this._hasBeenValidated = true;
    this._showValidation = true;
    return this._validationResult;
  }

  clearValidation() {
    this._hasBeenValidated = false;
    this._showValidation = false;
    this._validationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };
    this.requestUpdate();
  }

  addRule(rule: ValidationRule) {
    this.rules = [...this.rules, rule];
    if (this._hasBeenValidated) {
      this.performValidation();
    }
  }

  removeRule(ruleType: string) {
    this.rules = this.rules.filter((rule) => rule.type !== ruleType);
    if (this._hasBeenValidated) {
      this.performValidation();
    }
  }

  isValid(): boolean {
    return this._validationResult.isValid;
  }

  getErrors(): string[] {
    return this._validationResult.errors;
  }

  override focus() {
    const input = this.querySelector(`#${this.name}`) as
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement;
    if (input) {
      input.focus();
    }
  }

  reset() {
    this.value = '';
    this.clearValidation();
  }

  override connectedCallback() {
    super.connectedCallback();

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    // USWDS Validation is CSS-only - no JavaScript initialization needed
    this.setAttribute('data-web-component-managed', 'true');
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    // Clean up USWDS behavior
    try {
      if (typeof window !== 'undefined' && typeof (window as any).USWDS !== 'undefined') {
        // USWDS available but no setup needed
      }
    } catch (error) {
      console.warn('📋 Validation: Cleanup failed:', error);
    }
    // Additional cleanup for event listeners would go here
  }

  private renderRequiredIndicator() {
    const isRequired = this.rules.some((rule) => rule.type === 'required');
    if (!isRequired) return '';
    return html`<abbr title="required" class="usa-hint--required">*</abbr>`;
  }

  private renderHint() {
    if (!this.hint) return '';
    return html`<div class="usa-hint" id="${this.name}-hint">${this.hint}</div>`;
  }

  private renderErrorMessage(error: string) {
    return html`<div class="usa-error-message" id="${this.name}-error" role="alert">
      <span class="usa-sr-only">Error:</span> ${error}
    </div>`;
  }

  private renderSuccessState() {
    const shouldShowSuccess =
      this._showValidation &&
      this._hasBeenValidated &&
      this._validationResult.isValid &&
      this.showSuccessState;

    if (!shouldShowSuccess) return '';

    return html`<div
      class="usa-alert usa-alert--success usa-alert--validation usa-alert--slim"
      role="status"
    >
      <div class="usa-alert__body">
        <p class="usa-alert__text">Input is valid</p>
      </div>
    </div>`;
  }

  private renderLiveRegion() {
    // USWDS live region pattern for screen reader announcements
    // Creates sr-only element with aria-live and aria-atomic attributes
    // This announces validation state changes to screen readers
    const statusText = this._hasBeenValidated
      ? this._validationResult.isValid
        ? 'Input is valid'
        : `Error: ${this._validationResult.errors.join(', ')}`
      : '';

    return html`<div
      class="usa-sr-only"
      data-validation-status
      aria-live="polite"
      aria-atomic="true"
      role="status"
    >
      ${statusText}
    </div>`;
  }

  override render() {
    // Show errors either from validation result or from errors property or from message property
    // Show errors if:
    // 1. Errors property is set (always show)
    // 2. OR message property is set and valid is false (simple API)
    // 3. OR validation has been triggered and there are validation errors
    const errorsToShow =
      this.errors.length > 0
        ? this.errors
        : this.message && !this.valid
          ? [this.message]
          : this._showValidation && this._hasBeenValidated && !this._validationResult.isValid
            ? this._validationResult.errors
            : [];

    return html`
      <div class="${this.getFormGroupClasses()}">
        <label class="usa-label" for="${this.name}">
          ${this.label} ${this.renderRequiredIndicator()}
        </label>

        ${this.renderHint()} ${errorsToShow.map((error) => this.renderErrorMessage(error))}
        ${this.renderSuccessState()} ${this.renderInput()} ${this.renderLiveRegion()}
      </div>
    `;
  }
}
