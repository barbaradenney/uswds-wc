import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

// Import official USWDS compiled CSS
import '@uswds-wc/core/styles.css';

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
 * @fires change - Dispatched when the select value changes
 * @fires input - Dispatched when the select value changes (for consistency)
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
  // Store USWDS module for cleanup
  private uswdsModule: any = null;
  private usingUSWDSEnhancement = false;
  private uswdsInitialized = false;
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

  /**
   * Whether to disable the combo-box wrapper
   * Use this for simple selects like memorable date month field
   * that don't need combo-box enhancement
   */
  @property({ type: Boolean, attribute: 'no-combo-box' })
  noComboBox = false;

  private selectElement?: HTMLSelectElement;

  // Use light DOM for USWDS compatibility
  protected override createRenderRoot(): HTMLElement {
    return this as any;
  }

  override connectedCallback() {
    super.connectedCallback();

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');

    // Don't capture innerHTML in connectedCallback - it's too early for composed components
    // Light DOM parent components haven't rendered their children yet
    // The <slot> in render() will handle slotted content naturally

    // Note: For direct HTML usage like <usa-select><option>...</option></usa-select>,
    // the options will be preserved via the <slot> element in the template

    // Don't set role on the host element - it will be on the select
    // Initialize progressive enhancement
    this.initializeUSWDSSelect();
  }

  override firstUpdated() {
    // ARCHITECTURE: Script Tag Pattern
    // USWDS is loaded globally via script tag in .storybook/preview-head.html
    // Components just render HTML - USWDS enhances automatically via window.USWDS

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
  private async initializeUSWDSSelect() {
    // Prevent multiple initializations
    if (this.usingUSWDSEnhancement) {
      console.log(
        `⚠️ ${this.constructor.name}: Already initialized, skipping duplicate initialization`
      );
      return;
    }

    // Check if select is CSS-only before attempting to load JavaScript
    const { isCSSOnlyComponent } = await import('@uswds-wc/core');
    if (isCSSOnlyComponent('select')) {
      console.log('✅ USWDS select is CSS-only, using web component behavior');
      this.setupFallbackBehavior();
      return;
    }

    console.log(`🎯 Select: Initializing with tree-shaking optimization`);

    try {
      // Tree-shaking: Import only the specific USWDS component module
      // @ts-expect-error - @uswds/uswds doesn't have type definitions
      const module = await import('@uswds/uswds');
      this.uswdsModule = module.default;

      // Initialize the USWDS component
      if (this.uswdsModule && typeof this.uswdsModule.on === 'function') {
        this.uswdsModule.on(this);
        console.log(`✅ Tree-shaken USWDS select initialized successfully`);
        this.usingUSWDSEnhancement = true;
        return; // USWDS will handle component behavior
      } else {
        console.warn(`⚠️ Select: Module doesn't have expected initialization methods`);
        console.log(`🔍 Available methods:`, Object.keys(this.uswdsModule || {}));
        this.setupFallbackBehavior();
      }
    } catch (error) {
      console.warn(`⚠️ Tree-shaking failed for Select, falling back to full USWDS:`, error);
      await this.loadFullUSWDSLibrary();
    }
  }

  private async loadFullUSWDSLibrary() {
    try {
      if (typeof (window as any).USWDS === 'undefined') {
        // Full USWDS library not available, setup fallback
        console.warn('⚠️ Full USWDS library not available, using fallback behavior');
        this.setupFallbackBehavior();
        return;
      }
      await this.initializeWithGlobalUSWDS();
    } catch (error) {
      console.warn('⚠️ Full USWDS initialization failed:', error);
      this.setupFallbackBehavior();
    }
  }

  private async initializeWithGlobalUSWDS() {
    // Prevent multiple initializations
    if (this.uswdsInitialized) {
      console.log(`⚠️ Select: Already initialized globally, skipping duplicate initialization`);
      return;
    }

    const USWDS = (window as any).USWDS;
    if (USWDS && USWDS.select && typeof USWDS.select.on === 'function') {
      USWDS.select.on(this);
      this.uswdsInitialized = true;
      console.log('✅ Global USWDS select initialized successfully');
    } else {
      console.warn('⚠️ Global USWDS select not available');
      this.setupFallbackBehavior();
    }
  }

  private setupFallbackBehavior() {
    console.log('🚀 Setting up fallback select behavior');
    // Basic select functionality is handled by the browser
  }

  private cleanupUSWDS() {
    try {
      if (this.uswdsModule && typeof this.uswdsModule.off === 'function') {
        this.uswdsModule.off(this);
        console.log('✅ Tree-shaken USWDS select cleaned up');
      } else if (typeof window !== 'undefined' && typeof (window as any).USWDS !== 'undefined') {
        const USWDS = (window as any).USWDS;
        if (USWDS.select && typeof USWDS.select.off === 'function') {
          USWDS.select.off(this);
          console.log('✅ Global USWDS select cleaned up');
        }
      }
    } catch (error) {
      console.warn('⚠️ USWDS cleanup failed:', error);
    }
    this.uswdsModule = null;
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    // Clean up tree-shaken USWDS module
    this.cleanupUSWDS();

    // Reset enhancement flag to allow reinitialization
    this.usingUSWDSEnhancement = false;
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
        ${this.renderDefaultOption()} ${this.options.map((option) => this.renderOption(option))}
        <slot></slot>
      </select>
    `;

    const selectTemplate = html`
      ${this.renderLabel(selectId)} ${this.renderHint(selectId)} ${this.renderError(selectId)}
      ${this.renderSuccess(selectId)}
      ${this.noComboBox ? selectElement : html`<div class="usa-combo-box">${selectElement}</div>`}
    `;

    // Compact mode: no form-group wrapper (for use inside fieldsets/patterns)
    if (this.compact) {
      return selectTemplate;
    }

    // Standard mode: wrap in form-group
    return html`<div class="${formGroupClasses}">${selectTemplate}</div>`;
  }
}
