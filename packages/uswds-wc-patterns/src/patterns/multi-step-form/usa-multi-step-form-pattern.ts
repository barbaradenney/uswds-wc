import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

// Import USWDS core styles
import '@uswds-wc/core/styles.css';

// Import button component for navigation
import '@uswds-wc/actions/components/button/index.js';

/**
 * Step configuration interface
 */
export interface FormStep {
  /**
   * Unique identifier for the step
   */
  id: string;
  /**
   * Label for the step
   */
  label: string;
  /**
   * Whether the step can be skipped
   */
  optional?: boolean;
  /**
   * Custom validation function for the step
   */
  validate?: () => boolean | Promise<boolean>;
}

/**
 * USA Multi-Step Form Pattern
 *
 * USWDS pattern for "Progress Easily" - helps users navigate multi-step forms.
 * Provides step navigation, progress tracking, and state management.
 *
 * **Pattern Responsibilities:**
 * - Manage current step state
 * - Handle navigation between steps (next, back, skip)
 * - Track form progress
 * - Persist form state (optional localStorage)
 * - Validate steps before progression
 * - Emit events for step changes
 *
 * **Architecture Note:**
 * Uses Light DOM (no Shadow DOM) to allow USWDS styles to cascade properly.
 * Patterns orchestrate workflows without encapsulation.
 *
 * **Simplicity Philosophy:**
 * This pattern is intentionally simple - it only manages step navigation and state.
 * Developers provide their own form content via slots and compose as needed.
 *
 * @element usa-multi-step-form-pattern
 *
 * @fires {CustomEvent} step-change - Fired when user navigates to a different step
 * @fires {CustomEvent} form-complete - Fired when user reaches the final step
 * @fires {CustomEvent} pattern-ready - Fired when pattern initializes
 *
 * @slot step-{id} - Slot for each step's content (e.g., slot="step-1")
 * @slot progress - Optional slot for custom progress indicator
 *
 * @example Basic usage
 * ```html
 * <usa-multi-step-form-pattern>
 *   <div slot="step-personal-info">
 *     <h2>Personal Information</h2>
 *     <usa-text-input label="Name" required></usa-text-input>
 *   </div>
 *   <div slot="step-contact">
 *     <h2>Contact Details</h2>
 *     <usa-text-input label="Email" type="email"></usa-text-input>
 *   </div>
 *   <div slot="step-review">
 *     <h2>Review Your Information</h2>
 *   </div>
 * </usa-multi-step-form-pattern>
 * ```
 *
 * @example With persistence
 * ```html
 * <usa-multi-step-form-pattern
 *   persist-state
 *   storage-key="my-form-progress"
 * >
 *   ...
 * </usa-multi-step-form-pattern>
 * ```
 *
 * @uswds-pattern https://designsystem.digital.gov/patterns/complete-a-complex-form/progress-easily/
 * @see docs/PATTERNS_GUIDE.md - Pattern development guidelines
 */
@customElement('usa-multi-step-form-pattern')
export class USAMultiStepFormPattern extends LitElement {
  // Use Light DOM for patterns - no Shadow DOM encapsulation
  protected override createRenderRoot() {
    return this;
  }

  /**
   * Array of form steps
   */
  @property({ type: Array })
  steps: FormStep[] = [];

  /**
   * Whether to show navigation buttons
   */
  @property({ type: Boolean, attribute: 'show-navigation' })
  showNavigation = true;

  /**
   * Label for the back button
   */
  @property({ type: String, attribute: 'back-button-label' })
  backButtonLabel = 'Back';

  /**
   * Label for the next button
   */
  @property({ type: String, attribute: 'next-button-label' })
  nextButtonLabel = 'Next';

  /**
   * Label for the skip button (shown for optional steps)
   */
  @property({ type: String, attribute: 'skip-button-label' })
  skipButtonLabel = 'Skip';

  /**
   * Label for the submit button (shown on final step)
   */
  @property({ type: String, attribute: 'submit-button-label' })
  submitButtonLabel = 'Submit';

  /**
   * Whether to persist form state to localStorage
   */
  @property({ type: Boolean, attribute: 'persist-state' })
  persistState = false;

  /**
   * LocalStorage key for persisting state
   */
  @property({ type: String, attribute: 'storage-key' })
  storageKey = 'uswds-form-progress';

  /**
   * Current step index
   */
  @state()
  private currentStepIndex = 0;

  /**
   * Whether the current step is being validated
   */
  @state()
  private isValidating = false;

  /**
   * Whether we're currently navigating (prevents duplicate navigation)
   */
  private isNavigating = false;

  override connectedCallback() {
    super.connectedCallback();
    this.initializeFormState();
  }

  /**
   * Initialize form state from localStorage if persistence enabled
   */
  private initializeFormState() {
    if (this.persistState) {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        try {
          const { stepIndex } = JSON.parse(stored);
          if (typeof stepIndex === 'number' && stepIndex >= 0 && stepIndex < this.steps.length) {
            this.currentStepIndex = stepIndex;
          }
        } catch (e) {
          // Invalid stored data, ignore
        }
      }
    }
  }

  /**
   * Save current state to localStorage
   */
  private saveState() {
    if (this.persistState) {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify({
          stepIndex: this.currentStepIndex,
          timestamp: Date.now(),
        })
      );
    }
  }

  /**
   * Emit ready event after first render
   */
  override firstUpdated(changedProperties: Map<string, any>) {
    super.firstUpdated(changedProperties);
    this.dispatchEvent(
      new CustomEvent('pattern-ready', {
        detail: {
          currentStep: this.currentStepIndex,
          totalSteps: this.steps.length,
          step: this.steps[this.currentStepIndex],
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Get current step
   */
  private getCurrentStep(): FormStep | undefined {
    return this.steps[this.currentStepIndex];
  }

  /**
   * Check if on first step
   */
  private isFirstStep(): boolean {
    return this.currentStepIndex === 0;
  }

  /**
   * Check if on last step
   */
  private isLastStep(): boolean {
    return this.currentStepIndex === this.steps.length - 1;
  }

  /**
   * Validate current step before proceeding
   */
  private async validateCurrentStep(): Promise<boolean> {
    const currentStep = this.getCurrentStep();
    if (!currentStep?.validate) {
      return true;
    }

    this.isValidating = true;
    try {
      const result = await currentStep.validate();
      return result;
    } finally {
      this.isValidating = false;
    }
  }

  /**
   * Navigate to next step
   */
  private async handleNext() {
    // Prevent duplicate navigation
    if (this.isNavigating) {
      return;
    }

    this.isNavigating = true;

    try {
      if (this.isLastStep()) {
        await this.handleSubmit();
        return;
      }

      // Validate current step
      const isValid = await this.validateCurrentStep();
      if (!isValid) {
        return;
      }

      const previousStep = this.currentStepIndex;
      this.currentStepIndex++;
      this.saveState();

      this.dispatchEvent(
        new CustomEvent('step-change', {
          detail: {
            currentStep: this.currentStepIndex,
            previousStep,
            direction: 'forward',
            step: this.getCurrentStep(),
          },
          bubbles: true,
          composed: true,
        })
      );
    } finally {
      // Clear navigation lock
      this.isNavigating = false;
    }
  }

  /**
   * Navigate to previous step
   */
  private handleBack() {
    if (this.isFirstStep()) {
      return;
    }

    const previousStep = this.currentStepIndex;
    this.currentStepIndex--;
    this.saveState();

    this.dispatchEvent(
      new CustomEvent('step-change', {
        detail: {
          currentStep: this.currentStepIndex,
          previousStep,
          direction: 'back',
          step: this.getCurrentStep(),
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Skip current step (if optional)
   */
  private handleSkip() {
    const currentStep = this.getCurrentStep();
    if (!currentStep?.optional) {
      return;
    }

    const previousStep = this.currentStepIndex;
    this.currentStepIndex++;
    this.saveState();

    this.dispatchEvent(
      new CustomEvent('step-change', {
        detail: {
          currentStep: this.currentStepIndex,
          previousStep,
          direction: 'skip',
          step: this.getCurrentStep(),
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Handle form submission
   */
  private async handleSubmit() {
    // Validate current step
    const isValid = await this.validateCurrentStep();
    if (!isValid) {
      return;
    }

    // Clear persisted state on completion
    if (this.persistState) {
      localStorage.removeItem(this.storageKey);
    }

    this.dispatchEvent(
      new CustomEvent('form-complete', {
        detail: {
          totalSteps: this.steps.length,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * After update, clean up duplicate button groups created by Light DOM rendering
   * This is necessary because Lit doesn't automatically remove old elements in Light DOM
   */
  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    // If step changed, manually update button text content (Light DOM workaround)
    // Because usa-button moves text content in firstUpdated() (which only runs once),
    // we need to manually update the button's internal <button> element when step changes
    if (changedProperties.has('currentStepIndex')) {
      // Find all usa-button elements and their internal <button> elements
      const buttons = this.querySelectorAll('usa-button');

      buttons.forEach((usaButton) => {
        const internalButton = usaButton.querySelector('button');
        if (internalButton) {
          const currentText = internalButton.textContent?.trim();

          // Determine what the text SHOULD be based on the button's position
          const isBackButton = currentText === this.backButtonLabel;
          const isSkipButton = currentText === this.skipButtonLabel;

          if (!isBackButton && !isSkipButton) {
            // This is the Next/Submit button
            const expectedText = this.isLastStep() ? this.submitButtonLabel : this.nextButtonLabel;
            if (currentText !== expectedText) {
              internalButton.textContent = expectedText;
            }
          }
        }
      });
    }
  }

  /**
   * Render the pattern
   */
  override render() {
    const currentStep = this.getCurrentStep();

    return html`
      <div class="usa-form usa-form--large">
        <!-- Progress indicator slot -->
        <div class="margin-bottom-4">
          <slot name="progress">
            <div class="usa-prose">
              <p class="text-base">
                Step ${this.currentStepIndex + 1} of ${this.steps.length}:
                <strong>${currentStep?.label || ''}</strong>
              </p>
            </div>
          </slot>
        </div>

        <!-- Current step content -->
        <div class="margin-bottom-4">
          <slot name="step-${currentStep?.id}"></slot>
        </div>

        <!-- Navigation buttons -->
        ${this.showNavigation
          ? html`
              <div class="usa-button-group">
                ${!this.isFirstStep()
                  ? html`
                      <usa-button
                        variant="outline"
                        @click="${this.handleBack}"
                        ?disabled="${this.isValidating}"
                      >
                        ${this.backButtonLabel}
                      </usa-button>
                    `
                  : ''}
                ${currentStep?.optional
                  ? html`
                      <usa-button
                        variant="outline"
                        @click="${this.handleSkip}"
                        ?disabled="${this.isValidating}"
                      >
                        ${this.skipButtonLabel}
                      </usa-button>
                    `
                  : ''}
                <usa-button @click="${this.handleNext}" ?disabled="${this.isValidating}">
                  ${this.isLastStep() ? this.submitButtonLabel : this.nextButtonLabel}
                </usa-button>
              </div>
            `
          : ''}
      </div>
    `;
  }

  /**
   * Public API: Set form steps
   */
  setSteps(steps: FormStep[]) {
    this.steps = steps;
    // Reset to first step if current step index is now invalid
    if (this.currentStepIndex >= steps.length) {
      this.currentStepIndex = 0;
      this.saveState();
    }
  }

  /**
   * Public API: Navigate to specific step by index
   */
  async goToStep(stepIndex: number) {
    if (stepIndex >= 0 && stepIndex < this.steps.length) {
      const previousStep = this.currentStepIndex;
      this.currentStepIndex = stepIndex;
      this.saveState();

      // For Light DOM, explicitly request update with property name to ensure tracking
      this.requestUpdate('currentStepIndex', previousStep);
      await this.updateComplete;
      // Wait for:
      // 1. Child usa-button elements to complete their firstUpdated lifecycle
      // 2. updated() cleanup to remove duplicate button groups
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      await new Promise((resolve) => setTimeout(resolve, 100)); // Intentional delay for child component init

      this.dispatchEvent(
        new CustomEvent('step-change', {
          detail: {
            currentStep: this.currentStepIndex,
            previousStep,
            direction: stepIndex > previousStep ? 'forward' : 'back',
            step: this.getCurrentStep(),
          },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  /**
   * Public API: Get current step index
   */
  getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }

  /**
   * Public API: Get current step data
   */
  getCurrentStepData(): FormStep | undefined {
    return this.getCurrentStep();
  }

  /**
   * Public API: Clear persisted state
   */
  clearPersistedState() {
    if (this.persistState) {
      localStorage.removeItem(this.storageKey);
    }
  }

  /**
   * Public API: Reset to first step
   */
  reset() {
    this.currentStepIndex = 0;
    this.isNavigating = false; // Clear navigation lock
    this.saveState();
  }
}
