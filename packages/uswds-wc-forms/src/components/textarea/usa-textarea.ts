import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { USWDSBaseComponent } from '@uswds-wc/core';

// Import official USWDS compiled CSS
import '@uswds-wc/core/styles.css';

/**
 * USA Textarea Web Component
 *
 * Simple, accessible USWDS textarea implementation as a custom element.
 * Uses official USWDS classes and styling. Textarea is a presentational
 * component that requires no JavaScript enhancement.
 *
 * @element usa-textarea
 * @fires input - Dispatched when the textarea value changes
 * @fires change - Dispatched when the textarea loses focus after value change
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-textarea/src/styles/_usa-textarea.scss
 * @uswds-docs https://designsystem.digital.gov/components/textarea/
 * @uswds-guidance https://designsystem.digital.gov/components/textarea/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/textarea/#accessibility
 */
@customElement('usa-textarea')
export class USATextarea extends USWDSBaseComponent {
  static override styles = css`
    :host {
      display: block;
    }
    :host([hidden]) {
      display: none;
    }
  `;

  @property({ type: String })
  name = '';

  @property({ type: String })
  value = '';

  @property({ type: String })
  placeholder = '';

  @property({ type: String })
  label = '';

  @property({ type: String })
  hint = '';

  @property({ type: String })
  error = '';

  @property({ type: String })
  success = '';

  @property({ type: Boolean })
  disabled = false;

  @property({ type: Boolean })
  required = false;

  @property({ type: Boolean })
  readonly = false;

  @property({ type: Number })
  rows = 4;

  @property({ type: Number })
  cols: number | null = null;

  @property({ type: Number })
  maxlength: number | null = null;

  @property({ type: Number })
  minlength: number | null = null;

  @property({ type: String })
  autocomplete = '';

  @property({ type: String, reflect: true })
  override id = '';

  /**
   * Whether to render in compact mode (no form-group wrapper)
   * Use this when the textarea is inside a fieldset or pattern where
   * the parent handles spacing and grouping
   */
  @property({ type: Boolean })
  compact = false;

  private _textareaId?: string;

  override connectedCallback() {
    super.connectedCallback();

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');
    console.log(
      '📝 Textarea: Initialized as presentational component (no USWDS JavaScript required)'
    );
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    console.log('📝 Textarea: Cleanup complete (no USWDS JavaScript required)');
  }

  private handleInput(e: Event) {
    const textarea = e.target as HTMLTextAreaElement;
    this.value = textarea.value;

    this.dispatchEvent(
      new CustomEvent('input', {
        detail: {
          value: this.value,
          name: this.name,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleChange(e: Event) {
    const textarea = e.target as HTMLTextAreaElement;
    this.value = textarea.value;

    this.dispatchEvent(
      new CustomEvent('change', {
        detail: {
          value: this.value,
          name: this.name,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Public API: Reset textarea to empty value
   * Allows patterns to clear the textarea without DOM manipulation
   */
  reset(): void {
    this.value = '';
    this.requestUpdate();
  }

  private get textareaId() {
    // Check for element id first, then use cached generated id
    if (this.id) {
      return this.id;
    }
    if (!this._textareaId) {
      this._textareaId = `textarea-${Math.random().toString(36).substring(2, 11)}`;
    }
    return this._textareaId;
  }

  private getTextareaClasses(): string {
    const classes = ['usa-textarea'];

    if (this.error) {
      classes.push('usa-textarea--error');
    }

    if (this.success) {
      classes.push('usa-textarea--success');
    }

    return classes.join(' ');
  }

  private getFormGroupClasses(): string {
    const classes = ['usa-form-group'];

    if (this.error) {
      classes.push('usa-form-group--error');
    }

    return classes.join(' ');
  }

  private getLabelClasses(): string {
    const classes = ['usa-label'];

    if (this.error) {
      classes.push('usa-label--error');
    }

    return classes.join(' ');
  }

  private renderRequiredIndicator() {
    if (!this.required) return '';
    return html`<abbr title="required" class="usa-hint usa-hint--required">*</abbr>`;
  }

  private renderLabel(textareaId: string) {
    if (!this.label) return '';

    return html`
      <label class="${this.getLabelClasses()}" for="${textareaId}">
        ${this.label} ${this.renderRequiredIndicator()}
      </label>
    `;
  }

  private renderHint(textareaId: string) {
    if (!this.hint) return '';
    return html`<span class="usa-hint" id="${textareaId}-hint">${this.hint}</span>`;
  }

  private renderError(textareaId: string) {
    if (!this.error) return '';

    return html`
      <span class="usa-error-message" id="${textareaId}-error" role="alert">
        <span class="usa-sr-only">Error:</span> ${this.error}
      </span>
    `;
  }

  private renderSuccess() {
    if (!this.success) return '';

    return html`
      <div class="usa-alert usa-alert--success usa-alert--validation usa-alert--slim" role="status">
        <div class="usa-alert__body">
          <p class="usa-alert__text"><span class="usa-sr-only">Success:</span> ${this.success}</p>
        </div>
      </div>
    `;
  }

  // Use light DOM for USWDS compatibility
  protected override createRenderRoot(): HTMLElement {
    return this as any;
  }

  override render() {
    const textareaId = this.textareaId;

    const ariaDescribedBy = [
      this.hint ? `${textareaId}-hint` : '',
      this.error ? `${textareaId}-error` : '',
      this.success ? `${textareaId}-success` : '',
    ]
      .filter(Boolean)
      .join(' ');

    const textareaTemplate = html`
      ${this.renderLabel(textareaId)} ${this.renderHint(textareaId)} ${this.renderError(textareaId)}
      ${this.renderSuccess()}
      <textarea
        class="${this.getTextareaClasses()}"
        id="${textareaId}"
        name="${this.name}"
        .value="${this.value}"
        placeholder="${this.placeholder}"
        ?disabled=${this.disabled}
        ?required=${this.required}
        ?readonly=${this.readonly}
        rows="${this.rows}"
        cols="${this.cols || ''}"
        maxlength="${this.maxlength || ''}"
        minlength="${this.minlength || ''}"
        autocomplete="${this.autocomplete}"
        aria-describedby="${ifDefined(ariaDescribedBy.length > 0 ? ariaDescribedBy : undefined)}"
        aria-invalid="${ifDefined(this.error ? 'true' : undefined)}"
        @input="${this.handleInput}"
        @change="${this.handleChange}"
      ></textarea>
    `;

    // Compact mode: no form-group wrapper (for use inside fieldsets/patterns)
    if (this.compact) {
      return textareaTemplate;
    }

    // Standard mode: wrap in form-group
    return html`<div class="${this.getFormGroupClasses()}">${textareaTemplate}</div>`;
  }
}
