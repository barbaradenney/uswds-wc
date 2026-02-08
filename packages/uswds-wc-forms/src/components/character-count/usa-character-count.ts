import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { USWDSBaseComponent } from '@uswds-wc/core';

// Import official USWDS compiled CSS

/**
 * USA Character Count Web Component
 *
 * ARCHITECTURE: Pure Lit Implementation (USWDS Behavior Disabled)
 * The USWDS character-count JavaScript behavior directly manipulates textContent
 * which destroys Lit's ChildPart markers in Light DOM. This component implements
 * 100% behavioral parity with USWDS through Lit's reactive system instead.
 *
 * @element usa-character-count
 * @fires character-count-change - Dispatched when character count changes
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-js-reference https://github.com/uswds/uswds/tree/develop/packages/usa-character-count/src/index.js
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-character-count/src/styles/_usa-character-count.scss
 * @uswds-docs https://designsystem.digital.gov/components/character-count/
 * @uswds-guidance https://designsystem.digital.gov/components/character-count/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/character-count/#accessibility
 * @uswds-behavior-disabled Lit incompatibility - pure Lit implementation maintains behavioral parity
 */
@customElement('usa-character-count')
export class USACharacterCount extends USWDSBaseComponent {
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

  @property({ type: Number })
  maxlength = 0;

  @property({ type: String })
  label = 'Text input with character count';

  @property({ type: String })
  hint = '';

  @property({ type: String })
  name = 'character-count';

  @property({ type: String })
  inputType: 'input' | 'textarea' = 'textarea';

  @property({ type: Number })
  rows = 5;

  @property({ type: String })
  placeholder = '';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  required = false;

  @property({ type: Boolean, reflect: true })
  readonly = false;

  @property({ type: String })
  error = '';

  @state()
  private _currentLength = 0;

  @state()
  private _isNearLimit = false;

  @state()
  private _isOverLimit = false;

  override connectedCallback() {
    super.connectedCallback();
    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');
  }

  override async firstUpdated(changedProperties: Map<string, any>) {
    // ARCHITECTURE: Script Tag Pattern
    // USWDS is loaded globally via script tag in .storybook/preview-head.html
    // Components just render HTML - USWDS enhances automatically via window.USWDS

    // ARCHITECTURE NOTE: USWDS-Mirrored Behavior DISABLED for character-count
    // The USWDS behavior directly manipulates textContent which breaks Lit's ChildPart tracking
    // in Light DOM. Instead, we handle all updates through Lit's reactive system.

    super.firstUpdated(changedProperties);

    // Wait for DOM to be fully rendered
    await this.updateComplete;
    // Use setTimeout instead of requestAnimationFrame for test environment compatibility
    // requestAnimationFrame doesn't work in jsdom test environments
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Do NOT initialize USWDS behavior - it conflicts with Lit's DOM management
    // All character counting is handled by Lit's reactive properties
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    // Update internal state when value or maxlength changes
    if (changedProperties.has('value') || changedProperties.has('maxlength')) {
      this.updateCharacterCountSync();
    }
  }

  private updateCharacterCountSync() {
    const newLength = this.value.length;

    let newIsNearLimit = false;
    let newIsOverLimit = false;

    if (this.maxlength > 0) {
      const remaining = this.maxlength - newLength;
      newIsNearLimit = remaining <= Math.floor(this.maxlength * 0.1) && remaining > 0;
      newIsOverLimit = remaining < 0;
    }

    // Update state properties
    const oldLength = this._currentLength;
    const oldNearLimit = this._isNearLimit;
    const oldOverLimit = this._isOverLimit;

    this._currentLength = newLength;
    this._isNearLimit = newIsNearLimit;
    this._isOverLimit = newIsOverLimit;

    // Dispatch event if something changed
    const hasChanges =
      oldLength !== newLength || oldNearLimit !== newIsNearLimit || oldOverLimit !== newIsOverLimit;

    if (hasChanges) {
      this.dispatchEvent(
        new CustomEvent('character-count-change', {
          detail: {
            currentLength: this._currentLength,
            maxLength: this.maxlength,
            remaining: this.maxlength > 0 ? this.maxlength - this._currentLength : null,
            isNearLimit: this._isNearLimit,
            isOverLimit: this._isOverLimit,
            value: this.value,
          },
          bubbles: true,
          composed: true,
        })
      );

      // Request update to re-render with new state
      this.requestUpdate();
    }
  }

  private handleInput(e: Event) {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    this.value = target.value;

    // Match USWDS behavior: set custom validity when over limit
    const isOverLimit = this.maxlength > 0 && this.value.length > this.maxlength;
    if (isOverLimit) {
      target.setCustomValidity('The content is too long.');
    } else {
      target.setCustomValidity('');
    }
  }

  private getCharacterCountMessage(): string {
    const currentLength = this.value.length;

    if (this.maxlength <= 0) {
      return `${currentLength} characters`;
    }

    const remaining = this.maxlength - currentLength;

    // Zero case: "Character limit reached"
    if (remaining === 0) {
      return 'Character limit reached';
    }

    // Over limit case: "6 characters over limit"
    if (remaining < 0) {
      const overBy = Math.abs(remaining);
      const characters = overBy === 1 ? 'character' : 'characters';
      return `${overBy} ${characters} over limit`;
    }

    // USWDS spec: Use "remaining" for all states
    // Initial state (empty input): "100 characters remaining"
    // Typing state: "95 characters remaining"
    const characters = remaining === 1 ? 'character' : 'characters';
    const suffix = 'remaining';
    return `${remaining} ${characters} ${suffix}`;
  }

  // Public API methods
  override focus() {
    const input = this.querySelector(`#${this.name}`) as HTMLInputElement | HTMLTextAreaElement;
    if (input) {
      input.focus();
    }
  }

  override blur() {
    const input = this.querySelector(`#${this.name}`) as HTMLInputElement | HTMLTextAreaElement;
    if (input) {
      input.blur();
    }
  }

  select() {
    const input = this.querySelector(`#${this.name}`) as HTMLInputElement | HTMLTextAreaElement;
    if (input) {
      input.select();
    }
  }

  clear() {
    this.value = '';
    this.updateCharacterCountSync();
  }

  getCharacterCount(): number {
    return this._currentLength;
  }

  getRemainingCharacters(): number | null {
    return this.maxlength > 0 ? this.maxlength - this._currentLength : null;
  }

  isNearLimit(): boolean {
    return this._isNearLimit;
  }

  isOverLimit(): boolean {
    return this._isOverLimit;
  }

  private renderRequiredIndicator() {
    if (!this.required) return '';

    return html`<span class="usa-hint--required">*</span>`;
  }

  private renderHint() {
    if (!this.hint) return '';

    return html`<div class="usa-hint" id="${this.name}-hint">${this.hint}</div>`;
  }

  private renderTextarea() {
    const ariaDescribedby = `${this.name}-info ${this.name}-status${this.hint ? ` ${this.name}-hint` : ''}${this.error ? ` ${this.name}-error` : ''}`;
    const isOverLimit = this.maxlength > 0 && this.value.length > this.maxlength;
    const inputClasses = `usa-textarea usa-character-count__field${isOverLimit ? ' usa-input--error' : ''}`;

    return html`
      <textarea
        class="${inputClasses}"
        id="${this.name}"
        name="${this.name}"
        placeholder="${this.placeholder}"
        ?disabled=${this.disabled}
        ?required=${this.required}
        ?readonly=${this.readonly}
        maxlength="${this.maxlength > 0 ? this.maxlength : ''}"
        rows="${this.rows}"
        .value="${this.value}"
        @input=${this.handleInput}
        aria-describedby="${ariaDescribedby}"
        aria-invalid="${isOverLimit ? 'true' : 'false'}"
      ></textarea>
    `;
  }

  private renderInput() {
    const ariaDescribedby = `${this.name}-info ${this.name}-status${this.hint ? ` ${this.name}-hint` : ''}${this.error ? ` ${this.name}-error` : ''}`;
    const isOverLimit = this.maxlength > 0 && this.value.length > this.maxlength;
    const inputClasses = `usa-input usa-character-count__field${isOverLimit ? ' usa-input--error' : ''}`;

    return html`
      <input
        class="${inputClasses}"
        type="text"
        id="${this.name}"
        name="${this.name}"
        placeholder="${this.placeholder}"
        ?disabled=${this.disabled}
        ?required=${this.required}
        ?readonly=${this.readonly}
        maxlength="${this.maxlength > 0 ? this.maxlength : ''}"
        .value="${this.value}"
        @input=${this.handleInput}
        aria-describedby="${ariaDescribedby}"
        aria-invalid="${isOverLimit ? 'true' : 'false'}"
      />
    `;
  }

  private renderField() {
    return this.inputType === 'textarea' ? this.renderTextarea() : this.renderInput();
  }

  override render() {
    // Calculate over limit state directly from current value
    const isOverLimit = this.maxlength > 0 && this.value.length > this.maxlength;
    const hasError = this.error || isOverLimit;
    const containerClasses = `usa-character-count usa-form-group${hasError ? ' usa-form-group--error' : ''}`;

    // Render the initial structure that USWDS expects
    return html`
      <div class="${containerClasses}" data-maxlength="${this.maxlength}" data-enhanced="false">
        <label class="usa-label" for="${this.name}">
          ${this.label} ${this.renderRequiredIndicator()}
        </label>
        ${this.renderHint()}
        ${this.error
          ? html`<div class="usa-error-message" id="${this.name}-error">${this.error}</div>`
          : ''}
        ${this.renderField()}
        <!-- Render message element (hidden per USWDS spec for backwards compatibility) -->
        <span class="usa-character-count__message usa-sr-only" id="${this.name}-info">
          ${this.getCharacterCountMessage()}
        </span>
        <!-- This status element matches USWDS structure -->
        <span
          class="usa-character-count__status usa-hint${this._isOverLimit
            ? ' usa-character-count__status--invalid'
            : ''}"
          id="${this.name}-status"
          aria-hidden="true"
        >
          ${this.getCharacterCountMessage()}
        </span>
        <span
          class="usa-sr-only usa-character-count__sr-status"
          aria-live="polite"
          aria-atomic="true"
        >
          ${this.getCharacterCountMessage()}
        </span>
      </div>
    `;
  }
}
