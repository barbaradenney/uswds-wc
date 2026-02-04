import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

// Import official USWDS compiled CSS

export interface SelectOption {
  value: string;
  text: string;
  disabled?: boolean;
}

/**
 * USA Select Web Component
 *
 * A simple, accessible USWDS select implementation as a custom element.
 * Uses official USWDS classes and styling with minimal custom code.
 *
 * @element usa-select
 *
 * @attr {string} name - Select name for form submission.
 * @attr {string} value - Currently selected value.
 * @attr {string} label - Label text displayed above the select.
 * @attr {string} hint - Helper text displayed below the label.
 * @attr {string} error - Error message displayed in red below the select.
 * @attr {string} success - Success message displayed in green below the select.
 * @attr {boolean} disabled - Whether the select is disabled.
 * @attr {boolean} required - Whether the select is required.
 * @attr {string} defaultOption - Placeholder text for default empty option.
 * @attr {boolean} compact - Render without form-group wrapper for use in patterns.
 *
 * @prop {Array<{value: string, text: string, disabled?: boolean}>} options - Array of select options.
 *
 * @fires change - Dispatched when the select value changes
 * @fires input - Dispatched when the select value changes (for consistency)
 *
 * @example
 * ```html
 * <!-- Basic select with options -->
 * <usa-select
 *   label="State"
 *   name="state"
 *   .options=${[
 *     { value: 'ca', text: 'California' },
 *     { value: 'ny', text: 'New York' },
 *     { value: 'tx', text: 'Texas' }
 *   ]}
 * ></usa-select>
 *
 * <!-- Select with default placeholder -->
 * <usa-select
 *   label="Country"
 *   defaultOption="Select a country"
 *   .options=${[{ value: 'us', text: 'United States' }]}
 * ></usa-select>
 *
 * <!-- Required select with error -->
 * <usa-select
 *   label="Category"
 *   required
 *   error="Please select a category"
 *   .options=${[{ value: 'a', text: 'Option A' }]}
 * ></usa-select>
 *
 * <!-- Compact select for patterns -->
 * <usa-select compact label="Month" .options=${months}></usa-select>
 * ```
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-select/src/styles/_usa-select.scss
 * @uswds-docs https://designsystem.digital.gov/components/select/
 * @uswds-guidance https://designsystem.digital.gov/components/select/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/select/#accessibility
 */
@customElement('usa-select')
export class USASelect extends LitElement {
  private _selectId = '';
  static override styles = css`
    :host {
      display: inline-block;
      width: 100%;
    }
  `;

  @property({ type: String })
  name = '';

  @property({ type: String })
  value = '';

  @property({ type: String })
  label = '';

  @property({ type: String })
  hint = '';

  @property({ type: String })
  error = '';

  @property({ type: String })
  success = '';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean })
  required = false;

  @property({ type: Array })
  options: Array<{ value: string; text: string; disabled?: boolean }> = [];

  @property({ type: String })
  defaultOption = '';

  /**
   * Whether to render in compact mode (no form-group wrapper)
   * Use this when the select is inside a fieldset or pattern where
   * the parent handles spacing and grouping
   */
  @property({ type: Boolean })
  compact = false;

  private selectElement?: HTMLSelectElement;

  // Use light DOM for USWDS compatibility
  protected override createRenderRoot(): HTMLElement {
    return this as any;
  }

  override connectedCallback() {
    super.connectedCallback();

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');

    // Note: USWDS Select is CSS-only - no JavaScript initialization needed.
    // The native <select> element with USWDS CSS classes provides all styling.
    // This component works in all environments (bundled, CDN, SSR) without
    // any dynamic imports or external dependencies.
  }

  override firstUpdated() {
    // Get reference to the select element after first render
    this.selectElement = this.querySelector('select') as HTMLSelectElement;
  }

  override updated(_changedProperties: Map<string, any>) {
    // Update the select element if it exists
    if (this.selectElement) {
      this.updateSelectElement();
    }

    // Slotted content is handled naturally via <slot> in template
    // No manual content application needed for Light DOM components
  }

  private updateSelectElement() {
    if (!this.selectElement) return;

    // Update select properties
    this.selectElement.name = this.name;
    this.selectElement.value = this.value;
    this.selectElement.disabled = this.disabled;
    this.selectElement.required = this.required;

    // Update classes
    // Remove existing USWDS classes
    const classesToRemove = Array.from(this.selectElement.classList).filter((className) =>
      className.startsWith('usa-select')
    );
    classesToRemove.forEach((className) => this.selectElement?.classList.remove(className));

    // Always add base usa-select class
    this.selectElement.classList.add('usa-select');

    // Add error class if error exists
    if (this.error) {
      this.selectElement.classList.add('usa-select--error');
    }

    // Add success class if success exists
    if (this.success) {
      this.selectElement.classList.add('usa-select--success');
    }

    // Update ARIA attributes
    const describedByIds: string[] = [];

    if (this.hint) {
      describedByIds.push(`${this.selectId}-hint`);
    }
    if (this.error) {
      describedByIds.push(`${this.selectId}-error`);
    }
    if (this.success) {
      describedByIds.push(`${this.selectId}-success`);
    }

    if (describedByIds.length > 0) {
      this.selectElement.setAttribute('aria-describedby', describedByIds.join(' '));
    } else {
      this.selectElement.removeAttribute('aria-describedby');
    }

    if (this.error) {
      this.selectElement.setAttribute('aria-invalid', 'true');
    } else {
      this.selectElement.removeAttribute('aria-invalid');
    }
  }

  private handleChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    this.value = select.value;

    // Dispatch both change and input events for consistency with other form elements
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      })
    );

    this.dispatchEvent(
      new CustomEvent('input', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Public API: Reset select to empty value
   * Allows patterns to clear the select without DOM manipulation
   */
  reset(): void {
    this.value = '';
    this.requestUpdate();
  }

  private get selectId() {
    // Always check for element id first, then use cached generated id
    if (this.id) {
      return this.id;
    }
    if (!this._selectId) {
      this._selectId = `select-${Math.random().toString(36).substring(2, 11)}`;
    }
    return this._selectId;
  }

  private renderLabel(selectId: string) {
    if (!this.label) return '';

    return html`
      <label class="usa-label ${this.error ? 'usa-label--error' : ''}" for="${selectId}">
        ${this.label} ${this.renderRequiredIndicator()}
      </label>
    `;
  }

  private renderRequiredIndicator() {
    if (!this.required) return '';

    return html`<abbr title="required" class="usa-hint usa-hint--required">*</abbr>`;
  }

  private renderHint(selectId: string) {
    if (!this.hint) return '';

    return html`<span class="usa-hint" id="${selectId}-hint">${this.hint}</span>`;
  }

  private renderError(selectId: string) {
    if (!this.error) return '';

    return html`
      <span class="usa-error-message" id="${selectId}-error" role="alert">
        <span class="usa-sr-only">Error:</span> ${this.error}
      </span>
    `;
  }

  private renderSuccess(selectId: string) {
    if (!this.success) return '';

    return html`
      <span class="usa-hint" id="${selectId}-success" role="status">
        <span class="usa-sr-only">Success:</span> ${this.success}
      </span>
    `;
  }

  private renderDefaultOption() {
    if (!this.defaultOption) return '';

    return html`<option value="">${this.defaultOption}</option>`;
  }

  private renderOption(option: SelectOption) {
    return html`
      <option
        value="${option.value}"
        ?selected=${this.value === option.value}
        ?disabled=${option.disabled}
      >
        ${option.text}
      </option>
    `;
  }

  override render() {
    const selectId = this.selectId;

    const describedByIds: string[] = [];
    if (this.hint) {
      describedByIds.push(`${selectId}-hint`);
    }
    if (this.error) {
      describedByIds.push(`${selectId}-error`);
    }
    if (this.success) {
      describedByIds.push(`${selectId}-success`);
    }

    const formGroupClasses = ['usa-form-group', this.error ? 'usa-form-group--error' : '']
      .filter(Boolean)
      .join(' ');

    const selectElement = html`
      <select
        class="usa-select"
        id="${selectId}"
        name="${this.name}"
        aria-describedby="${ifDefined(
          describedByIds.length > 0 ? describedByIds.join(' ') : undefined
        )}"
        ?disabled=${this.disabled}
        ?required=${this.required}
        .value="${this.value}"
        @change=${this.handleChange}
      >
        ${this.renderDefaultOption()} ${(this.options || []).map((option) => this.renderOption(option))}
        <slot></slot>
      </select>
    `;

    const selectTemplate = html`
      ${this.renderLabel(selectId)} ${this.renderHint(selectId)} ${this.renderError(selectId)}
      ${this.renderSuccess(selectId)}
      ${selectElement}
    `;

    // Compact mode: no form-group wrapper (for use inside fieldsets/patterns)
    if (this.compact) {
      return selectTemplate;
    }

    // Standard mode: wrap in form-group
    return html`<div class="${formGroupClasses}">${selectTemplate}</div>`;
  }
}
