import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './usa-sign-in-template.js';

const meta: Meta = {
  title: 'Templates/Sign In',
  component: 'usa-sign-in-template',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
The sign-in template provides a centered authentication form following USWDS patterns.

## Features
- Email and password fields
- Remember me option
- Forgot password link
- Create account link
- Government banner and identifier

## USWDS Reference
https://designsystem.digital.gov/templates/sign-in-page/
        `,
      },
    },
  },
  argTypes: {
    heading: {
      control: 'text',
      description: 'Page heading',
    },
    submitText: {
      control: 'text',
      description: 'Submit button text',
    },
    showCreateAccount: {
      control: 'boolean',
      description: 'Show create account link',
    },
    showForgotPassword: {
      control: 'boolean',
      description: 'Show forgot password link',
    },
    showRememberMe: {
      control: 'boolean',
      description: 'Show remember me checkbox',
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
    heading: 'Sign in',
    submitText: 'Sign in',
    showCreateAccount: true,
    showForgotPassword: true,
    showRememberMe: false,
    showBanner: true,
    showIdentifier: true,
  },
  render: (args) => html`
    <usa-sign-in-template
      heading="${args.heading}"
      submit-text="${args.submitText}"
      ?show-create-account="${args.showCreateAccount}"
      ?show-forgot-password="${args.showForgotPassword}"
      ?show-remember-me="${args.showRememberMe}"
      ?show-banner="${args.showBanner}"
      ?show-identifier="${args.showIdentifier}"
      @sign-in-submit="${(e: CustomEvent) => console.log('Sign in submitted:', e.detail)}"
    ></usa-sign-in-template>
  `,
};

export const WithRememberMe: Story = {
  args: {
    heading: 'Sign in',
    submitText: 'Sign in',
    showCreateAccount: true,
    showForgotPassword: true,
    showRememberMe: true,
    showBanner: true,
    showIdentifier: true,
  },
  render: (args) => html`
    <usa-sign-in-template
      heading="${args.heading}"
      submit-text="${args.submitText}"
      ?show-create-account="${args.showCreateAccount}"
      ?show-forgot-password="${args.showForgotPassword}"
      ?show-remember-me="${args.showRememberMe}"
      ?show-banner="${args.showBanner}"
      ?show-identifier="${args.showIdentifier}"
    ></usa-sign-in-template>
  `,
};

export const CustomLinks: Story = {
  args: {
    heading: 'Log in to your account',
    submitText: 'Log in',
    createAccountUrl: '/register',
    createAccountText: 'Register now',
    forgotPasswordUrl: '/reset-password',
    forgotPasswordText: 'Reset your password',
    showBanner: true,
    showIdentifier: true,
  },
  render: (args) => html`
    <usa-sign-in-template
      heading="${args.heading}"
      submit-text="${args.submitText}"
      create-account-url="${args.createAccountUrl}"
      create-account-text="${args.createAccountText}"
      forgot-password-url="${args.forgotPasswordUrl}"
      forgot-password-text="${args.forgotPasswordText}"
      ?show-banner="${args.showBanner}"
      ?show-identifier="${args.showIdentifier}"
    ></usa-sign-in-template>
  `,
};

export const WithAdditionalOptions: Story = {
  args: {
    heading: 'Sign in',
    showBanner: true,
    showIdentifier: true,
  },
  render: (args) => html`
    <usa-sign-in-template
      heading="${args.heading}"
      ?show-banner="${args.showBanner}"
      ?show-identifier="${args.showIdentifier}"
    >
      <div slot="additional-options">
        <div class="margin-top-4">
          <p class="text-center margin-bottom-2">Or sign in with:</p>
          <div class="display-flex flex-justify-center">
            <button class="usa-button usa-button--outline margin-right-2">Login.gov</button>
            <button class="usa-button usa-button--outline">ID.me</button>
          </div>
        </div>
      </div>
    </usa-sign-in-template>
  `,
};

export const MinimalSignIn: Story = {
  args: {
    heading: 'Sign in',
    showCreateAccount: false,
    showForgotPassword: false,
    showBanner: false,
    showIdentifier: false,
  },
  render: (args) => html`
    <usa-sign-in-template
      heading="${args.heading}"
      ?show-create-account="${args.showCreateAccount}"
      ?show-forgot-password="${args.showForgotPassword}"
      ?show-banner="${args.showBanner}"
      ?show-identifier="${args.showIdentifier}"
    ></usa-sign-in-template>
  `,
};
