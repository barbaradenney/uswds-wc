import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './usa-multi-step-form-pattern.js';
import type { FormStep } from './usa-multi-step-form-pattern.js';

const meta: Meta = {
  title: 'Patterns/Multi-Step Form',
  component: 'usa-multi-step-form-pattern',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

/**
 * Default multi-step form with three steps: personal info, contact details, and review.
 * Shows basic step navigation with next/back buttons.
 */
export const Default: Story = {
  render: () => {
    const steps: FormStep[] = [
      { id: 'personal-info', label: 'Personal Information' },
      { id: 'contact', label: 'Contact Details' },
      { id: 'review', label: 'Review' },
    ];

    // Use requestAnimationFrame to access DOM after render
    requestAnimationFrame(() => {
      const pattern = document.querySelector('usa-multi-step-form-pattern');
      const log = document.getElementById('event-log');

      if (pattern && log) {
        pattern.addEventListener('step-change', (e: Event) => {
          log.textContent = 'step-change: ' + JSON.stringify((e as CustomEvent).detail, null, 2);
        });

        pattern.addEventListener('form-complete', (e: Event) => {
          log.textContent = 'form-complete: ' + JSON.stringify((e as CustomEvent).detail, null, 2);
          alert('Form completed! Check the event log.');
        });
      }
    });

    return html`
      <usa-multi-step-form-pattern .steps=${steps}>
        <div slot="step-personal-info">
          <h2 class="usa-prose">Personal Information</h2>
          <p class="usa-prose">Please provide your basic information.</p>
          <div class="usa-form-group">
            <label class="usa-label" for="first-name">First name</label>
            <input class="usa-input" id="first-name" name="first-name" type="text" />
          </div>
          <div class="usa-form-group">
            <label class="usa-label" for="last-name">Last name</label>
            <input class="usa-input" id="last-name" name="last-name" type="text" />
          </div>
        </div>

        <div slot="step-contact">
          <h2 class="usa-prose">Contact Details</h2>
          <p class="usa-prose">How can we reach you?</p>
          <div class="usa-form-group">
            <label class="usa-label" for="email">Email</label>
            <input class="usa-input" id="email" name="email" type="email" />
          </div>
          <div class="usa-form-group">
            <label class="usa-label" for="phone">Phone</label>
            <input class="usa-input" id="phone" name="phone" type="tel" />
          </div>
        </div>

        <div slot="step-review">
          <h2 class="usa-prose">Review Your Information</h2>
          <p class="usa-prose">Please review your information before submitting.</p>
          <div class="usa-alert usa-alert--info usa-alert--slim">
            <div class="usa-alert__body">
              <p class="usa-alert__text">
                Review your information carefully. You can go back to make changes.
              </p>
            </div>
          </div>
        </div>
      </usa-multi-step-form-pattern>

      <div class="margin-top-4 usa-prose">
        <h3>Event Log:</h3>
        <pre id="event-log" style="background: #f0f0f0; padding: 1rem;">Waiting for events...</pre>
      </div>
    `;
  },
};

/**
 * Multi-step form with state persistence to localStorage.
 * Refresh the page and your progress will be saved!
 */
export const WithPersistence: Story = {
  render: () => {
    const steps: FormStep[] = [
      { id: 'step1', label: 'Getting Started' },
      { id: 'step2', label: 'Additional Information' },
      { id: 'step3', label: 'Final Details' },
    ];

    return html`
      <div class="usa-alert usa-alert--info">
        <div class="usa-alert__body">
          <p class="usa-alert__text">
            <strong>State persistence enabled:</strong> Your progress is automatically saved. Try
            navigating steps and refreshing the page!
          </p>
        </div>
      </div>

      <usa-multi-step-form-pattern .steps=${steps} persist-state storage-key="demo-form-progress">
        <div slot="step-step1">
          <h2 class="usa-prose">Step 1: Getting Started</h2>
          <p class="usa-prose">This is the first step of the form.</p>
          <div class="usa-form-group">
            <label class="usa-label" for="field1">Field 1</label>
            <input class="usa-input" id="field1" type="text" />
          </div>
        </div>

        <div slot="step-step2">
          <h2 class="usa-prose">Step 2: Additional Information</h2>
          <p class="usa-prose">Provide more details here.</p>
          <div class="usa-form-group">
            <label class="usa-label" for="field2">Field 2</label>
            <textarea class="usa-textarea" id="field2"></textarea>
          </div>
        </div>

        <div slot="step-step3">
          <h2 class="usa-prose">Step 3: Final Details</h2>
          <p class="usa-prose">Almost done!</p>
          <div class="usa-form-group">
            <label class="usa-label" for="field3">Field 3</label>
            <input class="usa-input" id="field3" type="text" />
          </div>
        </div>
      </usa-multi-step-form-pattern>

      <button
        class="usa-button usa-button--secondary margin-top-2"
        onclick="document.querySelector('usa-multi-step-form-pattern').clearPersistedState(); location.reload();"
      >
        Clear Saved Progress
      </button>
    `;
  },
};

/**
 * Multi-step form with optional steps that can be skipped.
 * The middle step shows a "Skip" button.
 */
export const WithOptionalSteps: Story = {
  render: () => {
    const steps: FormStep[] = [
      { id: 'required1', label: 'Required Information' },
      { id: 'optional', label: 'Optional Details', optional: true },
      { id: 'required2', label: 'Final Step' },
    ];

    return html`
      <usa-multi-step-form-pattern .steps=${steps}>
        <div slot="step-required1">
          <h2 class="usa-prose">Required Information</h2>
          <p class="usa-prose">This step is required.</p>
          <div class="usa-form-group">
            <label class="usa-label" for="required-field">Required field</label>
            <input class="usa-input" id="required-field" type="text" required />
          </div>
        </div>

        <div slot="step-optional">
          <h2 class="usa-prose">Optional Details</h2>
          <div class="usa-alert usa-alert--info usa-alert--slim">
            <div class="usa-alert__body">
              <p class="usa-alert__text">This step is optional. You can skip it if you wish.</p>
            </div>
          </div>
          <div class="usa-form-group">
            <label class="usa-label" for="optional-field">Optional field</label>
            <input class="usa-input" id="optional-field" type="text" />
          </div>
        </div>

        <div slot="step-required2">
          <h2 class="usa-prose">Final Step</h2>
          <p class="usa-prose">Complete your submission.</p>
          <div class="usa-form-group">
            <label class="usa-label" for="final-field">Final field</label>
            <input class="usa-input" id="final-field" type="text" required />
          </div>
        </div>
      </usa-multi-step-form-pattern>
    `;
  },
};

/**
 * Multi-step form with validation on each step.
 * Try clicking "Next" without filling out the required field.
 */
export const WithValidation: Story = {
  render: () => {
    const steps: FormStep[] = [
      {
        id: 'step1',
        label: 'Step 1',
        validate: () => {
          const input = document.getElementById('validated-field') as HTMLInputElement;
          if (!input.value) {
            alert('Please fill out the required field!');
            input.focus();
            return false;
          }
          return true;
        },
      },
      { id: 'step2', label: 'Step 2' },
    ];

    return html`
      <div class="usa-alert usa-alert--warning">
        <div class="usa-alert__body">
          <p class="usa-alert__text">
            <strong>Validation enabled:</strong> Try clicking "Next" without filling the field.
          </p>
        </div>
      </div>

      <usa-multi-step-form-pattern .steps=${steps}>
        <div slot="step-step1">
          <h2 class="usa-prose">Step 1: Validation Demo</h2>
          <div class="usa-form-group">
            <label class="usa-label" for="validated-field">
              Required field <span class="usa-required">*</span>
            </label>
            <input class="usa-input" id="validated-field" type="text" required />
          </div>
        </div>

        <div slot="step-step2">
          <h2 class="usa-prose">Step 2: Success!</h2>
          <p class="usa-prose">You validated the first step correctly.</p>
        </div>
      </usa-multi-step-form-pattern>
    `;
  },
};

/**
 * Multi-step form with custom progress indicator.
 * Uses the "progress" slot to show a custom step indicator.
 */
export const WithCustomProgress: Story = {
  render: () => {
    const steps: FormStep[] = [
      { id: 'step1', label: 'Personal' },
      { id: 'step2', label: 'Contact' },
      { id: 'step3', label: 'Review' },
    ];

    return html`
      <usa-multi-step-form-pattern .steps=${steps}>
        <div slot="progress">
          <div class="usa-prose">
            <ol class="usa-process-list">
              <li class="usa-process-list__item">
                <h3 class="usa-process-list__heading">Personal</h3>
              </li>
              <li class="usa-process-list__item">
                <h3 class="usa-process-list__heading">Contact</h3>
              </li>
              <li class="usa-process-list__item">
                <h3 class="usa-process-list__heading">Review</h3>
              </li>
            </ol>
          </div>
        </div>

        <div slot="step-step1">
          <h2 class="usa-prose">Personal Information</h2>
          <div class="usa-form-group">
            <label class="usa-label" for="name">Name</label>
            <input class="usa-input" id="name" type="text" />
          </div>
        </div>

        <div slot="step-step2">
          <h2 class="usa-prose">Contact Information</h2>
          <div class="usa-form-group">
            <label class="usa-label" for="email2">Email</label>
            <input class="usa-input" id="email2" type="email" />
          </div>
        </div>

        <div slot="step-step3">
          <h2 class="usa-prose">Review & Submit</h2>
          <p class="usa-prose">Please review your information.</p>
        </div>
      </usa-multi-step-form-pattern>
    `;
  },
};

/**
 * Multi-step form with custom navigation.
 * Demonstrates programmatic control using the public API.
 */
export const ProgrammaticControl: Story = {
  render: () => {
    const steps: FormStep[] = [
      { id: 'intro', label: 'Introduction' },
      { id: 'content', label: 'Content' },
      { id: 'conclusion', label: 'Conclusion' },
    ];

    const handleGoToStep = (stepIndex: number) => {
      const pattern = document.querySelector('usa-multi-step-form-pattern') as any;
      pattern?.goToStep(stepIndex);
    };

    const handleReset = () => {
      const pattern = document.querySelector('usa-multi-step-form-pattern') as any;
      pattern?.reset();
    };

    // Use requestAnimationFrame to access DOM after render
    requestAnimationFrame(() => {
      const pattern = document.querySelector('usa-multi-step-form-pattern');
      const display = document.getElementById('current-step-display');

      if (pattern && display) {
        pattern.addEventListener('step-change', (e: Event) => {
          display.textContent = String((e as CustomEvent).detail.currentStep + 1);
        });
      }
    });

    return html`
      <div class="margin-bottom-2">
        <button class="usa-button usa-button--outline" @click="${() => handleGoToStep(0)}">
          Jump to Step 1
        </button>
        <button class="usa-button usa-button--outline" @click="${() => handleGoToStep(1)}">
          Jump to Step 2
        </button>
        <button class="usa-button usa-button--outline" @click="${() => handleGoToStep(2)}">
          Jump to Step 3
        </button>
        <button class="usa-button usa-button--secondary" @click="${handleReset}">Reset</button>
      </div>

      <usa-multi-step-form-pattern .steps=${steps} show-navigation="false">
        <div slot="step-intro">
          <h2 class="usa-prose">Introduction</h2>
          <p class="usa-prose">This form demonstrates programmatic navigation.</p>
          <p class="usa-prose">Use the buttons above to navigate between steps.</p>
        </div>

        <div slot="step-content">
          <h2 class="usa-prose">Content</h2>
          <p class="usa-prose">This is the content step.</p>
        </div>

        <div slot="step-conclusion">
          <h2 class="usa-prose">Conclusion</h2>
          <p class="usa-prose">You've reached the final step!</p>
        </div>
      </usa-multi-step-form-pattern>

      <div class="margin-top-4 usa-prose">
        <p>
          <strong>Current Step:</strong>
          <span id="current-step-display">1</span>
        </p>
      </div>
    `;
  },
};

/**
 * Multi-step form simulating a real application form.
 * Shows a practical example with job application steps.
 */
export const JobApplicationForm: Story = {
  render: () => {
    const steps: FormStep[] = [
      { id: 'applicant', label: 'Applicant Information' },
      { id: 'experience', label: 'Work Experience' },
      { id: 'education', label: 'Education', optional: true },
      { id: 'references', label: 'References', optional: true },
      { id: 'review', label: 'Review & Submit' },
    ];

    return html`
      <div class="usa-prose">
        <h1>Job Application</h1>
        <p class="usa-intro">
          Complete this multi-step form to apply for the position. Some steps are optional.
        </p>
      </div>

      <usa-multi-step-form-pattern .steps=${steps} persist-state storage-key="job-application">
        <div slot="step-applicant">
          <h2 class="usa-prose">Applicant Information</h2>
          <div class="usa-form-group">
            <label class="usa-label" for="applicant-name">
              Full name <span class="usa-required">*</span>
            </label>
            <input class="usa-input" id="applicant-name" type="text" required />
          </div>
          <div class="usa-form-group">
            <label class="usa-label" for="applicant-email">
              Email address <span class="usa-required">*</span>
            </label>
            <input class="usa-input" id="applicant-email" type="email" required />
          </div>
          <div class="usa-form-group">
            <label class="usa-label" for="applicant-phone">Phone number</label>
            <input class="usa-input" id="applicant-phone" type="tel" />
          </div>
        </div>

        <div slot="step-experience">
          <h2 class="usa-prose">Work Experience</h2>
          <div class="usa-form-group">
            <label class="usa-label" for="current-employer">Current or most recent employer</label>
            <input class="usa-input" id="current-employer" type="text" />
          </div>
          <div class="usa-form-group">
            <label class="usa-label" for="job-title">Job title</label>
            <input class="usa-input" id="job-title" type="text" />
          </div>
          <div class="usa-form-group">
            <label class="usa-label" for="responsibilities">Key responsibilities</label>
            <textarea class="usa-textarea" id="responsibilities"></textarea>
          </div>
        </div>

        <div slot="step-education">
          <h2 class="usa-prose">Education</h2>
          <div class="usa-alert usa-alert--info usa-alert--slim">
            <div class="usa-alert__body">
              <p class="usa-alert__text">This section is optional.</p>
            </div>
          </div>
          <div class="usa-form-group">
            <label class="usa-label" for="school">School or institution</label>
            <input class="usa-input" id="school" type="text" />
          </div>
          <div class="usa-form-group">
            <label class="usa-label" for="degree">Degree or certificate</label>
            <input class="usa-input" id="degree" type="text" />
          </div>
        </div>

        <div slot="step-references">
          <h2 class="usa-prose">References</h2>
          <div class="usa-alert usa-alert--info usa-alert--slim">
            <div class="usa-alert__body">
              <p class="usa-alert__text">This section is optional.</p>
            </div>
          </div>
          <div class="usa-form-group">
            <label class="usa-label" for="reference-name">Reference name</label>
            <input class="usa-input" id="reference-name" type="text" />
          </div>
          <div class="usa-form-group">
            <label class="usa-label" for="reference-email">Reference email</label>
            <input class="usa-input" id="reference-email" type="email" />
          </div>
        </div>

        <div slot="step-review">
          <h2 class="usa-prose">Review & Submit</h2>
          <p class="usa-prose">
            Please review your application before submitting. You can go back to make changes.
          </p>
          <div class="usa-alert usa-alert--success">
            <div class="usa-alert__body">
              <h4 class="usa-alert__heading">Ready to submit</h4>
              <p class="usa-alert__text">
                Click "Submit" to complete your application. You'll receive a confirmation email.
              </p>
            </div>
          </div>
        </div>
      </usa-multi-step-form-pattern>
    `;
  },
};
