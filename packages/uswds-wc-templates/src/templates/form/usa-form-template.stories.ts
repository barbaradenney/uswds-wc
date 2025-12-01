import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './usa-form-template.js';

const meta: Meta = {
  title: 'Templates/Form',
  component: 'usa-form-template',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
The form template provides a layout for single or multi-step forms.

## Features
- Optional step indicator for multi-step forms
- Form heading and subheading
- Configurable action buttons (back, next, submit)
- Optional sidebar
- Government banner and identifier

## USWDS Reference
https://designsystem.digital.gov/templates/form-templates/
        `,
      },
    },
  },
  argTypes: {
    heading: {
      control: 'text',
      description: 'Form heading',
    },
    subheading: {
      control: 'text',
      description: 'Form subheading/description',
    },
    showStepIndicator: {
      control: 'boolean',
      description: 'Show step indicator',
    },
    currentStep: {
      control: 'number',
      description: 'Current step number (1-based)',
    },
    totalSteps: {
      control: 'number',
      description: 'Total number of steps',
    },
    showBackButton: {
      control: 'boolean',
      description: 'Show back button',
    },
    submitText: {
      control: 'text',
      description: 'Submit button text',
    },
    nextText: {
      control: 'text',
      description: 'Next button text',
    },
    backText: {
      control: 'text',
      description: 'Back button text',
    },
    showSidebar: {
      control: 'boolean',
      description: 'Show sidebar',
    },
    sidebarPosition: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Sidebar position',
    },
    showBanner: {
      control: 'boolean',
      description: 'Show government banner',
    },
    showIdentifier: {
      control: 'boolean',
      description: 'Show identifier',
    },
  },
};

export default meta;
type Story = StoryObj;

export const SingleStepForm: Story = {
  args: {
    heading: 'Contact Information',
    subheading: 'Please provide your contact details.',
    submitText: 'Submit',
    showBanner: true,
    showIdentifier: true,
  },
  render: (args) => html`
    <usa-form-template
      heading="${args.heading}"
      subheading="${args.subheading}"
      submit-text="${args.submitText}"
      ?show-banner="${args.showBanner}"
      ?show-identifier="${args.showIdentifier}"
      @form-submit="${(e: CustomEvent) => console.log('Form submitted:', e.detail)}"
    >
      <div slot="form-content">
        <usa-text-input
          id="fullName"
          name="fullName"
          label="Full name"
          required
        ></usa-text-input>
        <usa-text-input
          id="email"
          name="email"
          type="email"
          label="Email address"
          required
        ></usa-text-input>
        <usa-text-input
          id="phone"
          name="phone"
          type="tel"
          label="Phone number"
        ></usa-text-input>
        <usa-textarea
          id="message"
          name="message"
          label="Message"
          rows="5"
        ></usa-textarea>
      </div>
    </usa-form-template>
  `,
};

export const MultiStepForm: Story = {
  args: {
    heading: 'Application Form',
    showStepIndicator: true,
    currentStep: 2,
    totalSteps: 4,
    showBackButton: true,
    nextText: 'Continue',
    backText: 'Back',
    showBanner: true,
    showIdentifier: true,
  },
  render: (args) => {
    const steps = [
      { label: 'Personal Info', status: 'complete' as const },
      { label: 'Contact Details', status: 'current' as const },
      { label: 'Review', status: 'incomplete' as const },
      { label: 'Submit', status: 'incomplete' as const },
    ];

    return html`
      <usa-form-template
        heading="${args.heading}"
        ?show-step-indicator="${args.showStepIndicator}"
        current-step="${args.currentStep}"
        total-steps="${args.totalSteps}"
        .steps="${steps}"
        ?show-back-button="${args.showBackButton}"
        next-text="${args.nextText}"
        back-text="${args.backText}"
        ?show-banner="${args.showBanner}"
        ?show-identifier="${args.showIdentifier}"
        @form-submit="${(e: CustomEvent) => console.log('Form submitted:', e.detail)}"
        @step-change="${(e: CustomEvent) => console.log('Step changed:', e.detail)}"
      >
        <div slot="form-content">
          <h2>Contact Details</h2>
          <usa-text-input
            id="email"
            name="email"
            type="email"
            label="Email address"
            required
          ></usa-text-input>
          <usa-text-input
            id="phone"
            name="phone"
            type="tel"
            label="Phone number"
            required
          ></usa-text-input>
          <usa-text-input
            id="address"
            name="address"
            label="Street address"
          ></usa-text-input>
        </div>
      </usa-form-template>
    `;
  },
};

export const WithSidebar: Story = {
  args: {
    heading: 'Registration Form',
    subheading: 'Complete the form to register.',
    showSidebar: true,
    sidebarPosition: 'right',
    showBanner: true,
    showIdentifier: true,
  },
  render: (args) => html`
    <usa-form-template
      heading="${args.heading}"
      subheading="${args.subheading}"
      ?show-sidebar="${args.showSidebar}"
      sidebar-position="${args.sidebarPosition}"
      ?show-banner="${args.showBanner}"
      ?show-identifier="${args.showIdentifier}"
    >
      <div slot="form-content">
        <usa-text-input
          id="username"
          name="username"
          label="Username"
          required
        ></usa-text-input>
        <usa-text-input
          id="email"
          name="email"
          type="email"
          label="Email"
          required
        ></usa-text-input>
        <usa-text-input
          id="password"
          name="password"
          type="password"
          label="Password"
          required
        ></usa-text-input>
      </div>
      <div slot="form-sidebar">
        <div class="usa-alert usa-alert--info usa-alert--slim">
          <div class="usa-alert__body">
            <p class="usa-alert__text">
              Your information is secure and will not be shared with third parties.
            </p>
          </div>
        </div>
        <div class="margin-top-3">
          <h3>Need Help?</h3>
          <p>Contact us at <a href="tel:1-800-555-1234">1-800-555-1234</a></p>
        </div>
      </div>
    </usa-form-template>
  `,
};

export const FirstStepOfMultiStep: Story = {
  args: {
    heading: 'New Application',
    showStepIndicator: true,
    currentStep: 1,
    totalSteps: 3,
    showBackButton: false,
    nextText: 'Continue',
    showBanner: true,
    showIdentifier: true,
  },
  render: (args) => {
    const steps = [
      { label: 'Personal Information', status: 'current' as const },
      { label: 'Employment History', status: 'incomplete' as const },
      { label: 'Review & Submit', status: 'incomplete' as const },
    ];

    return html`
      <usa-form-template
        heading="${args.heading}"
        ?show-step-indicator="${args.showStepIndicator}"
        current-step="${args.currentStep}"
        total-steps="${args.totalSteps}"
        .steps="${steps}"
        ?show-back-button="${args.showBackButton}"
        next-text="${args.nextText}"
        ?show-banner="${args.showBanner}"
        ?show-identifier="${args.showIdentifier}"
      >
        <div slot="form-content">
          <div class="grid-row grid-gap">
            <div class="grid-col-12 tablet:grid-col-6">
              <usa-text-input
                id="firstName"
                name="firstName"
                label="First name"
                required
              ></usa-text-input>
            </div>
            <div class="grid-col-12 tablet:grid-col-6">
              <usa-text-input
                id="lastName"
                name="lastName"
                label="Last name"
                required
              ></usa-text-input>
            </div>
          </div>
          <usa-text-input
            id="dob"
            name="dob"
            type="date"
            label="Date of birth"
            required
          ></usa-text-input>
          <usa-text-input
            id="ssn"
            name="ssn"
            label="Social Security Number"
            hint="We need this to verify your identity"
            required
          ></usa-text-input>
        </div>
      </usa-form-template>
    `;
  },
};

export const FinalStepOfMultiStep: Story = {
  args: {
    heading: 'Review & Submit',
    showStepIndicator: true,
    currentStep: 3,
    totalSteps: 3,
    showBackButton: true,
    submitText: 'Submit Application',
    backText: 'Previous',
    showBanner: true,
    showIdentifier: true,
  },
  render: (args) => {
    const steps = [
      { label: 'Personal Information', status: 'complete' as const },
      { label: 'Employment History', status: 'complete' as const },
      { label: 'Review & Submit', status: 'current' as const },
    ];

    return html`
      <usa-form-template
        heading="${args.heading}"
        ?show-step-indicator="${args.showStepIndicator}"
        current-step="${args.currentStep}"
        total-steps="${args.totalSteps}"
        .steps="${steps}"
        ?show-back-button="${args.showBackButton}"
        submit-text="${args.submitText}"
        back-text="${args.backText}"
        ?show-banner="${args.showBanner}"
        ?show-identifier="${args.showIdentifier}"
      >
        <div slot="form-content">
          <div class="usa-alert usa-alert--info margin-bottom-3">
            <div class="usa-alert__body">
              <h4 class="usa-alert__heading">Review your information</h4>
              <p class="usa-alert__text">
                Please review all the information below before submitting your application.
              </p>
            </div>
          </div>

          <h3>Personal Information</h3>
          <dl class="usa-prose">
            <div class="grid-row">
              <dt class="grid-col-4"><strong>Name:</strong></dt>
              <dd class="grid-col-8">John Doe</dd>
            </div>
            <div class="grid-row">
              <dt class="grid-col-4"><strong>Email:</strong></dt>
              <dd class="grid-col-8">john.doe@example.com</dd>
            </div>
          </dl>

          <h3>Employment History</h3>
          <dl class="usa-prose">
            <div class="grid-row">
              <dt class="grid-col-4"><strong>Current Employer:</strong></dt>
              <dd class="grid-col-8">Acme Corporation</dd>
            </div>
            <div class="grid-row">
              <dt class="grid-col-4"><strong>Position:</strong></dt>
              <dd class="grid-col-8">Software Developer</dd>
            </div>
          </dl>

          <usa-checkbox
            id="confirm"
            name="confirm"
            required
            label="I confirm that all information provided is accurate and complete."
          ></usa-checkbox>
        </div>
      </usa-form-template>
    `;
  },
};

export const CustomActions: Story = {
  args: {
    heading: 'Custom Form Actions',
    showBanner: true,
    showIdentifier: true,
  },
  render: (args) => html`
    <usa-form-template
      heading="${args.heading}"
      ?show-banner="${args.showBanner}"
      ?show-identifier="${args.showIdentifier}"
    >
      <div slot="form-content">
        <usa-text-input
          id="data"
          name="data"
          label="Enter some data"
        ></usa-text-input>
      </div>
      <div slot="form-actions" class="margin-top-4">
        <usa-button type="button" variant="outline" class="margin-right-2">
          Save Draft
        </usa-button>
        <usa-button type="button" variant="outline" class="margin-right-2">
          Cancel
        </usa-button>
        <usa-button type="submit">
          Submit
        </usa-button>
      </div>
    </usa-form-template>
  `,
};

export const WithPatterns: Story = {
  args: {
    heading: 'User Profile',
    subheading: 'Update your profile information',
    showBanner: true,
    showIdentifier: true,
  },
  render: (args) => html`
    <usa-form-template
      heading="${args.heading}"
      subheading="${args.subheading}"
      ?show-banner="${args.showBanner}"
      ?show-identifier="${args.showIdentifier}"
    >
      <div slot="form-content">
        <usa-name
          first-name-label="First name"
          last-name-label="Last name"
        ></usa-name>

        <usa-email-address></usa-email-address>

        <usa-phone-number></usa-phone-number>

        <usa-address></usa-address>
      </div>
    </usa-form-template>
  `,
};

export const MinimalForm: Story = {
  args: {
    heading: 'Quick Feedback',
    submitText: 'Send',
    showBanner: false,
    showIdentifier: false,
  },
  render: (args) => html`
    <usa-form-template
      heading="${args.heading}"
      submit-text="${args.submitText}"
      ?show-banner="${args.showBanner}"
      ?show-identifier="${args.showIdentifier}"
    >
      <div slot="form-content">
        <usa-textarea
          id="feedback"
          name="feedback"
          label="Your feedback"
          rows="4"
          required
        ></usa-textarea>
      </div>
    </usa-form-template>
  `,
};
