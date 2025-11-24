import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './usa-email-address-pattern.js';
import type { USAEmailAddressPattern } from './usa-email-address-pattern.js';

const meta: Meta<USAEmailAddressPattern> = {
  title: 'Patterns/User Profile/Email Address',
  component: 'usa-email-address-pattern',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
## USWDS Email Address Pattern

Email address pattern for collecting email addresses with optional consent for sensitive information.

**USWDS Documentation**: https://designsystem.digital.gov/patterns/create-a-user-profile/email-address/

### Pattern Responsibilities
- Collect email address with validation
- Optional consent for sensitive information
- Email format validation
- Support autocomplete and paste
- Emit email data changes

### Features
- **Email Validation**: Must contain @ with characters before/after, max 256 characters
- **Consent Section**: Optional section for sensitive information consent (hidden by default)
- **Autocomplete Support**: Proper attributes for browser autocomplete
- **Events**: Emits \`email-change\` events for data updates
- **Light DOM**: No Shadow DOM, USWDS styles cascade properly

### Accessibility
- Proper fieldset/legend structure
- Unique IDs for radio buttons
- ARIA-compliant form controls
- Keyboard navigation support
        `,
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Label for the email section',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Email address' },
      },
    },
    required: {
      control: 'boolean',
      description: 'Whether email is required',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    hint: {
      control: 'text',
      description: 'Hint text for email field',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' },
      },
    },
    showConsent: {
      control: 'boolean',
      description: 'Show sensitive information consent section',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    consentLabel: {
      control: 'text',
      description: 'Label for the consent question',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'May we send sensitive information to this email?' },
      },
    },
  },
  args: {
    label: 'Email address',
    required: true,
    hint: '',
    showConsent: false,
    consentLabel: 'May we send sensitive information to this email?',
  },
};

export default meta;
type Story = StoryObj<USAEmailAddressPattern>;

/**
 * Default email address pattern with basic email collection.
 */
export const Default: Story = {
  render: (args) => html`
    <usa-email-address-pattern
      label="${args.label}"
      ?required="${args.required}"
      hint="${args.hint}"
      ?show-consent="${args.showConsent}"
      consent-label="${args.consentLabel}"
    ></usa-email-address-pattern>
  `,
};

/**
 * Email pattern with hint text to explain why email is needed.
 */
export const WithHint: Story = {
  args: {
    hint: 'We will send a verification link to this email address',
  },
  render: (args) => html`
    <usa-email-address-pattern
      label="${args.label}"
      ?required="${args.required}"
      hint="${args.hint}"
    ></usa-email-address-pattern>
  `,
};

/**
 * Email pattern with sensitive information consent section.
 * Use when planning to send potentially sensitive content via email.
 */
export const WithConsent: Story = {
  args: {
    showConsent: true,
  },
  render: (args) => html`
    <usa-email-address-pattern
      label="${args.label}"
      ?required="${args.required}"
      hint="${args.hint}"
      ?show-consent="${args.showConsent}"
      consent-label="${args.consentLabel}"
    ></usa-email-address-pattern>
  `,
};

/**
 * Optional email pattern (not required).
 */
export const Optional: Story = {
  args: {
    required: false,
    label: 'Email address (optional)',
  },
  render: (args) => html`
    <usa-email-address-pattern
      label="${args.label}"
      ?required="${args.required}"
      hint="${args.hint}"
    ></usa-email-address-pattern>
  `,
};

/**
 * Custom labels and consent question.
 */
export const CustomLabels: Story = {
  args: {
    label: 'Contact email',
    showConsent: true,
    consentLabel: 'Can we send you account notifications via email?',
  },
  render: (args) => html`
    <usa-email-address-pattern
      label="${args.label}"
      ?required="${args.required}"
      hint="${args.hint}"
      ?show-consent="${args.showConsent}"
      consent-label="${args.consentLabel}"
    ></usa-email-address-pattern>
  `,
};

/**
 * Email pattern with pre-filled data.
 */
export const WithData: Story = {
  render: (args) => {
    setTimeout(() => {
      const pattern = document.querySelector('usa-email-address-pattern');
      if (pattern) {
        (pattern as USAEmailAddressPattern).setEmailData({
          email: 'user@example.com',
          sensitiveInfoConsent: 'yes-info',
        });
      }
    }, 100);

    return html`
      <usa-email-address-pattern
        label="${args.label}"
        ?required="${args.required}"
        hint="${args.hint}"
        ?show-consent="${true}"
        consent-label="${args.consentLabel}"
      ></usa-email-address-pattern>
    `;
  },
};

/**
 * Interactive example demonstrating events and API.
 */
export const Interactive: Story = {
  args: {
    showConsent: true,
  },
  render: (args) => html`
    <style>
      .example-container {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }
      .example-output {
        padding: 1rem;
        background-color: #f0f0f0;
        border-radius: 0.25rem;
        font-family: monospace;
        font-size: 0.875rem;
      }
      .example-buttons {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
    </style>

    <div class="example-container">
      <usa-email-address-pattern
        id="interactive-pattern"
        label="${args.label}"
        ?required="${args.required}"
        hint="${args.hint}"
        ?show-consent="${args.showConsent}"
        consent-label="${args.consentLabel}"
        @email-change="${(e: CustomEvent) => {
          const output = document.getElementById('email-output');
          if (output) {
            output.textContent = JSON.stringify(e.detail.emailData, null, 2);
          }
        }}"
      ></usa-email-address-pattern>

      <div>
        <h3 class="usa-legend">API Controls</h3>
        <div class="example-buttons">
          <button
            class="usa-button"
            @click="${() => {
              const pattern = document.getElementById(
                'interactive-pattern'
              ) as USAEmailAddressPattern;
              pattern.setEmailData({
                email: 'test@example.com',
                sensitiveInfoConsent: 'yes-info',
              });
              const output = document.getElementById('email-output');
              if (output) {
                output.textContent = JSON.stringify(pattern.getEmailData(), null, 2);
              }
            }}"
          >
            Set Test Data
          </button>
          <button
            class="usa-button"
            @click="${() => {
              const pattern = document.getElementById(
                'interactive-pattern'
              ) as USAEmailAddressPattern;
              pattern.clearEmail();
              const output = document.getElementById('email-output');
              if (output) {
                output.textContent = JSON.stringify(pattern.getEmailData(), null, 2);
              }
            }}"
          >
            Clear
          </button>
          <button
            class="usa-button"
            @click="${() => {
              const pattern = document.getElementById(
                'interactive-pattern'
              ) as USAEmailAddressPattern;
              const isValid = pattern.validateEmail();
              alert('Email is ' + (isValid ? 'valid' : 'invalid'));
            }}"
          >
            Validate
          </button>
          <button
            class="usa-button usa-button--outline"
            @click="${() => {
              const pattern = document.getElementById(
                'interactive-pattern'
              ) as USAEmailAddressPattern;
              const output = document.getElementById('email-output');
              if (output) {
                output.textContent = JSON.stringify(pattern.getEmailData(), null, 2);
              }
            }}"
          >
            Get Data
          </button>
        </div>
      </div>

      <div>
        <h3 class="usa-legend">Current Data</h3>
        <pre id="email-output" class="example-output">{}</pre>
      </div>
    </div>
  `,
};

/**
 * Multiple email patterns in a form.
 */
export const MultiplePatterns: Story = {
  render: () => html`
    <form>
      <usa-email-address-pattern
        label="Primary email"
        hint="Your main contact email"
        required
      ></usa-email-address-pattern>

      <usa-email-address-pattern
        label="Secondary email (optional)"
        hint="An alternate email address"
        ?required="${false}"
      ></usa-email-address-pattern>

      <usa-email-address-pattern
        label="Notification email"
        hint="Where should we send important updates?"
        show-consent
        consent-label="May we send security alerts to this email?"
        required
      ></usa-email-address-pattern>

      <button type="submit" class="usa-button margin-top-3">Submit</button>
    </form>
  `,
};
