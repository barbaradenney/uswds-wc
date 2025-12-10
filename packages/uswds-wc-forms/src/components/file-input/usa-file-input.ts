import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { USWDSBaseComponent } from '@uswds-wc/core';
import { initializeFileInput } from './usa-file-input-behavior.js';

// Import official USWDS compiled CSS

/**
 * USA File Input Web Component
 *
 * Minimal wrapper around USWDS file input functionality.
 * Uses USWDS-mirrored behavior pattern for 100% behavioral parity.
 *
 * @element usa-file-input
 * @fires file-change - Dispatched when files are selected
 * @fires file-remove - Dispatched when a file is removed
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-js-reference https://github.com/uswds/uswds/tree/develop/packages/usa-file-input/src/index.js
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-file-input/src/styles/_usa-file-input.scss
 * @uswds-docs https://designsystem.digital.gov/components/file-input/
 * @uswds-guidance https://designsystem.digital.gov/components/file-input/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/file-input/#accessibility
 */
@customElement('usa-file-input')
export class USAFileInput extends USWDSBaseComponent {
  static override styles = css`
    :host {
      display: block;
    }
    :host([hidden]) {
      display: none;
    }
  `;

  @property({ type: String })
  name = 'file-input';

  @property({ type: String })
  inputId = 'file-input';

  @property({ type: String })
  label = 'Select file';

  @property({ type: String })
  hint = '';

  @property({ type: Boolean, reflect: true })
  multiple = false;

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  required = false;

  @property({ type: String })
  accept = '';

  @property({ type: String })
  maxFileSize = '';

  @property({ type: Array })
  selectedFiles: File[] = [];

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
    // Uses dedicated behavior file (usa-file-input-behavior.ts) that replicates USWDS source exactly

    super.firstUpdated(changedProperties);

    // Wait for DOM to be fully rendered
    await this.updateComplete;
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));

    // Initialize using mirrored USWDS behavior
    this.cleanup = initializeFileInput(this);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanup?.();
  }

  private renderRequiredIndicator() {
    return this.required
      ? html`<abbr title="required" class="usa-hint usa-hint--required">*</abbr>`
      : '';
  }

  private renderHint() {
    return this.hint
      ? html`<div class="usa-hint" id="${this.inputId}-hint">${this.hint}</div>`
      : '';
  }

  // Light DOM is handled by USWDSBaseComponent

  override render() {
    const groupClasses = ['usa-form-group', this.required ? 'usa-form-group--required' : '']
      .filter(Boolean)
      .join(' ');

    const ariaDescribedBy = this.hint ? `${this.inputId}-hint` : '';

    // Provide EXACTLY what USWDS file input expects:
    // Simple input with usa-file-input class
    // USWDS will create the full drag-and-drop structure
    return html`
      <div class="${groupClasses}">
        <label class="usa-label" for="${this.inputId}">
          ${this.label} ${this.renderRequiredIndicator()}
        </label>
        ${this.renderHint()}
        <input
          id="${this.inputId}"
          class="usa-file-input"
          type="file"
          name="${this.name}"
          ?multiple=${this.multiple}
          ?disabled=${this.disabled}
          ?required=${this.required}
          accept="${this.accept}"
          aria-describedby="${ariaDescribedBy}"
        />
      </div>
    `;
  }
}
