import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './usa-create-account-template.js';

const meta: Meta = {
  title: 'Templates/Create Account',
  component: 'usa-create-account-template',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
The create account template provides a registration form following USWDS patterns.

## Features
- Name fields (optional)
- Email and password fields
- Password confirmation with validation
- Terms of service checkbox
- Sign-in link for existing users
- Government banner and identifier

## USWDS Reference
https://designsystem.digital.gov/templates/create-account-page/
        `,
      },
    },
  },
  argTypes: {
    heading: {
      control: 'text',
      description: 'Page heading',
    },
    showNameFields: {
      control: 'boolean',
      description: 'Show first and last name fields',
    },
    showPasswordRequirements: {
      control: 'boolean',
      description: 'Show password requirements text',
    },
    showTerms: {
      control: 'boolean',
      description: 'Show terms checkbox',
    },
    termsUrl: {
      control: 'text',
      description: 'Terms of service URL',
    },
    privacyUrl: {
      control: 'text',
      description: 'Privacy policy URL',
    },
    submitText: {
      control: 'text',
      description: 'Submit button text',
    },
    showSignInLink: {
      control: 'boolean',
      description: 'Show sign-in link',
    },
    signInUrl: {
      control: 'text',
      description: 'Sign-in page URL',
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

export const Default: Story = {
  args: {
    heading: 'Create account',
    showNameFields: true,
    showPasswordRequirements: true,
    showTerms: true,
    termsUrl: '/terms',
    privacyUrl: '/privacy',
    submitText: 'Create account',
    showSignInLink: true,
    signInUrl: '/sign-in',
    showBanner: true,
    showIdentifier: true,
  },
  render: (args) => html`
    <usa-create-account-template
      heading="${args.heading}"
      ?show-name-fields="${args.showNameFields}"
      ?show-password-requirements="${args.showPasswordRequirements}"
      ?show-terms="${args.showTerms}"
      terms-url="${args.termsUrl}"
      privacy-url="${args.privacyUrl}"
      submit-text="${args.submitText}"
      ?show-sign-in-link="${args.showSignInLink}"
      sign-in-url="${args.signInUrl}"
      ?show-banner="${args.showBanner}"
      ?show-identifier="${args.showIdentifier}"
      @create-account-submit="${(e: CustomEvent) => console.log('Account created:', e.detail)}"
    ></usa-create-account-template>
  `,
};

export const EmailOnly: Story = {
  args: {
    heading: 'Create account',
    showNameFields: false,
    showPasswordRequirements: true,
    showTerms: true,
    showBanner: true,
    showIdentifier: true,
  },
  render: (args) => html`
    <usa-create-account-template
      heading="${args.heading}"
      ?show-name-fields="${args.showNameFields}"
      ?show-password-requirements="${args.showPasswordRequirements}"
      ?show-terms="${args.showTerms}"
      ?show-banner="${args.showBanner}"
      ?show-identifier="${args.showIdentifier}"
    ></usa-create-account-template>
  `,
};

export const WithoutTerms: Story = {
  args: {
    heading: 'Register',
    submitText: 'Register',
    showNameFields: true,
    showPasswordRequirements: true,
    showTerms: false,
    showBanner: true,
    showIdentifier: true,
  },
  render: (args) => html`
    <usa-create-account-template
      heading="${args.heading}"
      submit-text="${args.submitText}"
      ?show-name-fields="${args.showNameFields}"
      ?show-password-requirements="${args.showPasswordRequirements}"
      ?show-terms="${args.showTerms}"
      ?show-banner="${args.showBanner}"
      ?show-identifier="${args.showIdentifier}"
    ></usa-create-account-template>
  `,
};

export const CustomPasswordRequirements: Story = {
  args: {
    heading: 'Create account',
    passwordRequirementsText:
      'Password must be at least 12 characters long and include uppercase, lowercase, numbers, and symbols.',
    showBanner: true,
    showIdentifier: true,
  },
  render: (args) => html`
    <usa-create-account-template
      heading="${args.heading}"
      password-requirements-text="${args.passwordRequirementsText}"
      ?show-banner="${args.showBanner}"
      ?show-identifier="${args.showIdentifier}"
    ></usa-create-account-template>
  `,
};

export const CustomLinks: Story = {
  args: {
    heading: 'Join our agency',
    signInLabel: 'Already a member?',
    signInText: 'Log in here',
    signInUrl: '/login',
    termsUrl: '/legal/terms',
    privacyUrl: '/legal/privacy',
    showBanner: true,
    showIdentifier: true,
  },
  render: (args) => html`
    <usa-create-account-template
      heading="${args.heading}"
      sign-in-label="${args.signInLabel}"
      sign-in-text="${args.signInText}"
      sign-in-url="${args.signInUrl}"
      terms-url="${args.termsUrl}"
      privacy-url="${args.privacyUrl}"
      ?show-banner="${args.showBanner}"
      ?show-identifier="${args.showIdentifier}"
    ></usa-create-account-template>
  `,
};

export const WithAdditionalFields: Story = {
  args: {
    heading: 'Create account',
    showBanner: true,
    showIdentifier: true,
  },
  render: (args) => html`
    <usa-create-account-template
      heading="${args.heading}"
      ?show-banner="${args.showBanner}"
      ?show-identifier="${args.showIdentifier}"
    >
      <div slot="form-fields">
        <usa-text-input
          id="phone"
          name="phone"
          type="tel"
          label="Phone number (optional)"
          autocomplete="tel"
        ></usa-text-input>
        <usa-text-input
          id="organization"
          name="organization"
          label="Organization (optional)"
          autocomplete="organization"
        ></usa-text-input>
      </div>
    </usa-create-account-template>
  `,
};

export const MinimalForm: Story = {
  args: {
    heading: 'Quick Sign Up',
    submitText: 'Sign Up',
    showNameFields: false,
    showPasswordRequirements: false,
    showTerms: false,
    showSignInLink: false,
    showBanner: false,
    showIdentifier: false,
  },
  render: (args) => html`
    <usa-create-account-template
      heading="${args.heading}"
      submit-text="${args.submitText}"
      ?show-name-fields="${args.showNameFields}"
      ?show-password-requirements="${args.showPasswordRequirements}"
      ?show-terms="${args.showTerms}"
      ?show-sign-in-link="${args.showSignInLink}"
      ?show-banner="${args.showBanner}"
      ?show-identifier="${args.showIdentifier}"
    ></usa-create-account-template>
  `,
};
