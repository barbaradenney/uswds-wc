import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

// Import USWDS core styles

// Import USWDS web components
import '@uswds-wc/feedback';
import '@uswds-wc/navigation';
import '@uswds-wc/layout';
import '@uswds-wc/actions';
import '@uswds-wc/forms';
import '@uswds-wc/patterns';

/**
 * Form step interface
 */
export interface FormStep {
  label: string;
  status?: 'complete' | 'current' | 'incomplete';
}

/**
 * USA Form Template
 *
 * Multi-step form page template following USWDS patterns.
 * Supports step indicators, form sections, and progress tracking.
 *
 * **Template Structure (from USWDS):**
 * - Skip navigation + Banner + Header
 * - Optional step indicator
 * - Form content area (patterns/components)
 * - Action buttons (next, back, submit)
 * - Optional sidebar
 * - Footer + Identifier
 *
 * @element usa-form-template
 *
 * @slot form-header - Content above the form (title, intro)
 * @slot form-content - Form fields and patterns
 * @slot form-actions - Submit/navigation buttons
 * @slot form-sidebar - Optional sidebar content
 * @slot header - Site header
 * @slot footer - Site footer
 *
 * @fires {CustomEvent} form-submit - Fired when form is submitted
 * @fires {CustomEvent} step-change - Fired when step changes
 * @fires {CustomEvent} template-ready - Fired when template initializes
 *
 * @example Basic single-step form
 * ```html
 * <usa-form-template
 *   heading="Contact Information"
 * >
 *   <div slot="form-content">
 *     <usa-name-pattern></usa-name-pattern>
 *     <usa-email-address-pattern></usa-email-address-pattern>
 *   </div>
 * </usa-form-template>
 * ```
 *
 * @example Multi-step form with step indicator
 * ```html
 * <usa-form-template
 *   heading="Application"
 *   show-step-indicator
 *   current-step="2"
 *   total-steps="4"
 *   .steps="${[
 *     { label: 'Personal Info', status: 'complete' },
 *     { label: 'Contact', status: 'current' },
 *     { label: 'Review', status: 'incomplete' },
 *     { label: 'Submit', status: 'incomplete' }
 *   ]}"
 * >
 *   <div slot="form-content">...</div>
 * </usa-form-template>
 * ```
 *
 * @uswds-template https://designsystem.digital.gov/templates/form-templates/
 */
@customElement('usa-form-template')
export class USAFormTemplate extends LitElement {
  // Use Light DOM for USWDS compatibility
  protected override createRenderRoot() {
    return this;
  }

  /**
   * Page language attribute
   */
  @property({ type: String })
  override lang = 'en';

  /**
   * Whether to show the government banner
   */
  @property({ type: Boolean, attribute: 'show-banner' })
  showBanner = true;

  /**
   * Whether to show the identifier at the bottom
   */
  @property({ type: Boolean, attribute: 'show-identifier' })
  showIdentifier = true;

  /**
   * Form heading/title
   */
  @property({ type: String })
  heading = '';

  /**
   * Form subheading/description
   */
  @property({ type: String })
  subheading = '';

  /**
   * Whether to show step indicator
   */
  @property({ type: Boolean, attribute: 'show-step-indicator' })
  showStepIndicator = false;

  /**
   * Current step number (1-based)
   */
  @property({ type: Number, attribute: 'current-step' })
  currentStep = 1;

  /**
   * Total number of steps
   */
  @property({ type: Number, attribute: 'total-steps' })
  totalSteps = 1;

  /**
   * Step labels and statuses
   */
  @property({ type: Array })
  steps: FormStep[] = [];

  /**
   * Whether to center the step indicator labels
   */
  @property({ type: Boolean, attribute: 'center-step-labels' })
  centerStepLabels = true;

  /**
   * Whether to show sidebar
   */
  @property({ type: Boolean, attribute: 'show-sidebar' })
  showSidebar = false;

  /**
   * Sidebar position
   */
  @property({ type: String, attribute: 'sidebar-position' })
  sidebarPosition: 'left' | 'right' = 'right';

  /**
   * Submit button text
   */
  @property({ type: String, attribute: 'submit-text' })
  submitText = 'Submit';

  /**
   * Back button text
   */
  @property({ type: String, attribute: 'back-text' })
  backText = 'Back';

  /**
   * Next button text
   */
  @property({ type: String, attribute: 'next-text' })
  nextText = 'Continue';

  /**
   * Whether to show back button
   */
  @property({ type: Boolean, attribute: 'show-back-button' })
  showBackButton = false;

  /**
   * Form action URL
   */
  @property({ type: String, attribute: 'action-url' })
  actionUrl = '';

  /**
   * Form method
   */
  @property({ type: String })
  method = 'POST';

  /**
   * Form validation state
   */
  @state()
  private isValid = true;

  override connectedCallback() {
    super.connectedCallback();
    if (this.lang) {
      this.setAttribute('lang', this.lang);
    }
  }

  override firstUpdated(changedProperties: Map<string, any>) {
    super.firstUpdated(changedProperties);
    this.dispatchEvent(
      new CustomEvent('template-ready', {
        detail: { template: 'form', currentStep: this.currentStep },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Handle form submission
   */
  private handleSubmit(e: Event) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;

    // Collect form data
    const formData = new FormData(form);
    const data: Record<string, any> = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    this.dispatchEvent(
      new CustomEvent('form-submit', {
        detail: {
          formData: data,
          step: this.currentStep,
          isLastStep: this.currentStep === this.totalSteps,
        },
        bubbles: true,
        composed: true,
      })
    );

    // If action URL is set and this is the last step, submit the form
    if (this.actionUrl && this.currentStep === this.totalSteps) {
      form.submit();
    }
  }

  /**
   * Handle back button click
   */
  private handleBack() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.dispatchEvent(
        new CustomEvent('step-change', {
          detail: { step: this.currentStep, direction: 'back' },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  /**
   * Check if a slot has content
   */
  private hasSlotContent(slotName: string): boolean {
    return this.querySelector(`[slot="${slotName}"]`) !== null;
  }

  /**
   * Render step indicator
   */
  private renderStepIndicator() {
    if (!this.showStepIndicator) {
      return nothing;
    }

    // Generate steps from property or create default
    const stepsToRender =
      this.steps.length > 0
        ? this.steps
        : Array.from({ length: this.totalSteps }, (_, i) => ({
            label: `Step ${i + 1}`,
            status:
              i + 1 < this.currentStep
                ? 'complete'
                : i + 1 === this.currentStep
                  ? 'current'
                  : 'incomplete',
          }));

    return html`
      <div
        class="usa-step-indicator ${this.centerStepLabels ? 'usa-step-indicator--center' : ''}"
        aria-label="progress"
      >
        <ol class="usa-step-indicator__segments">
          ${stepsToRender.map(
            (step) => html`
              <li
                class="usa-step-indicator__segment ${step.status === 'complete'
                  ? 'usa-step-indicator__segment--complete'
                  : step.status === 'current'
                    ? 'usa-step-indicator__segment--current'
                    : ''}"
              >
                <span class="usa-step-indicator__segment-label">
                  ${step.label}
                  ${step.status === 'complete'
                    ? html`<span class="usa-sr-only">completed</span>`
                    : step.status !== 'current'
                      ? html`<span class="usa-sr-only">not completed</span>`
                      : nothing}
                </span>
              </li>
            `
          )}
        </ol>
        <div class="usa-step-indicator__header">
          <h2 class="usa-step-indicator__heading">
            <span class="usa-step-indicator__heading-counter">
              <span class="usa-sr-only">Step</span>
              <span class="usa-step-indicator__current-step">${this.currentStep}</span>
              <span class="usa-step-indicator__total-steps">of ${this.totalSteps}</span>
            </span>
            <span class="usa-step-indicator__heading-text">
              ${stepsToRender[this.currentStep - 1]?.label || `Step ${this.currentStep}`}
            </span>
          </h2>
        </div>
      </div>
    `;
  }

  /**
   * Render form actions
   */
  private renderFormActions() {
    if (this.hasSlotContent('form-actions')) {
      return html`<slot name="form-actions"></slot>`;
    }

    const isLastStep = this.currentStep === this.totalSteps;
    const isFirstStep = this.currentStep === 1;

    return html`
      <div class="margin-top-4">
        ${this.showBackButton && !isFirstStep
          ? html`
              <usa-button
                type="button"
                variant="outline"
                @click="${this.handleBack}"
                class="margin-right-2"
              >
                ${this.backText}
              </usa-button>
            `
          : nothing}
        <usa-button type="submit">${isLastStep ? this.submitText : this.nextText}</usa-button>
      </div>
    `;
  }

  /**
   * Render form content area
   */
  private renderFormContent() {
    const formClasses = this.showSidebar ? 'grid-col-12 tablet:grid-col-8' : 'grid-col-12';

    return html`
      <div class="${formClasses}">
        <!-- Form Header -->
        ${this.heading || this.subheading
          ? html`
              <div class="margin-bottom-4">
                ${this.heading ? html`<h1>${this.heading}</h1>` : nothing}
                ${this.subheading ? html`<p class="usa-intro">${this.subheading}</p>` : nothing}
              </div>
            `
          : nothing}
        <slot name="form-header"></slot>

        <!-- Step Indicator -->
        ${this.renderStepIndicator()}

        <!-- Form -->
        <form
          class="usa-form usa-form--large"
          @submit="${this.handleSubmit}"
          action="${this.actionUrl || nothing}"
          method="${this.method}"
        >
          <!-- Form Content -->
          <slot name="form-content"></slot>

          <!-- Form Actions -->
          ${this.renderFormActions()}
        </form>
      </div>
    `;
  }

  /**
   * Render sidebar
   */
  private renderSidebar() {
    if (!this.showSidebar) {
      return nothing;
    }

    return html`
      <div class="grid-col-12 tablet:grid-col-4">
        <slot name="form-sidebar"></slot>
      </div>
    `;
  }

  override render() {
    const sidebarFirst = this.sidebarPosition === 'left';

    return html`
      <div class="usa-form-template">
        <!-- Skip Navigation -->
        <usa-skip-link href="#main-content" text="Skip to main content"></usa-skip-link>

        <!-- Government Banner -->
        ${this.showBanner ? html`<usa-banner></usa-banner>` : nothing}

        <!-- Header -->
        <slot name="header"></slot>

        <!-- Main Content -->
        <main id="main-content">
          <div class="grid-container usa-section">
            <div class="grid-row grid-gap">
              ${sidebarFirst && this.showSidebar
                ? html` ${this.renderSidebar()} ${this.renderFormContent()} `
                : html`
                    ${this.renderFormContent()} ${this.showSidebar ? this.renderSidebar() : nothing}
                  `}
            </div>
          </div>
        </main>

        <!-- Footer -->
        <slot name="footer"></slot>

        <!-- Identifier -->
        ${this.showIdentifier ? html`<usa-identifier></usa-identifier>` : nothing}
      </div>
    `;
  }

  /**
   * Public API: Go to next step
   */
  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.dispatchEvent(
        new CustomEvent('step-change', {
          detail: { step: this.currentStep, direction: 'forward' },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  /**
   * Public API: Go to previous step
   */
  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.dispatchEvent(
        new CustomEvent('step-change', {
          detail: { step: this.currentStep, direction: 'back' },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  /**
   * Public API: Go to specific step
   */
  goToStep(step: number): void {
    if (step >= 1 && step <= this.totalSteps) {
      const direction = step > this.currentStep ? 'forward' : 'back';
      this.currentStep = step;
      this.dispatchEvent(
        new CustomEvent('step-change', {
          detail: { step: this.currentStep, direction },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  /**
   * Public API: Set step status
   */
  setStepStatus(stepIndex: number, status: 'complete' | 'current' | 'incomplete'): void {
    if (stepIndex >= 0 && stepIndex < this.steps.length) {
      this.steps = this.steps.map((step, i) => (i === stepIndex ? { ...step, status } : step));
    }
  }

  /**
   * Public API: Get form element
   */
  getForm(): HTMLFormElement | null {
    return this.querySelector('form');
  }

  /**
   * Public API: Validate form
   */
  validateForm(): boolean {
    const form = this.getForm();
    if (form) {
      this.isValid = form.checkValidity();
      return this.isValid;
    }
    return false;
  }
}
