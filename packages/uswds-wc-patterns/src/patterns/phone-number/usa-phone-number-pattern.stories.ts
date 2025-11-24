import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './usa-phone-number-pattern.js';

const meta: Meta = {
  title: 'Patterns/User Profile/Phone Number',
  component: 'usa-phone-number-pattern',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

/**
 * Default phone number pattern with automatic formatting.
 * Formats input as 999-999-9999 as user types.
 */
export const Default: Story = {
  render: () => html` <usa-phone-number-pattern></usa-phone-number-pattern> `,
};

/**
 * Required phone number field with validation.
 */
export const Required: Story = {
  render: () => html` <usa-phone-number-pattern required></usa-phone-number-pattern> `,
};

/**
 * With phone type selector (mobile, home, work).
 * Useful when multiple contact numbers might be provided.
 */
export const WithType: Story = {
  render: () => html`
    <usa-phone-number-pattern show-type required label="Contact Number"></usa-phone-number-pattern>
  `,
};

/**
 * With extension field for business lines.
 * Useful for corporate phone systems or switchboards.
 */
export const WithExtension: Story = {
  render: () => html`
    <usa-phone-number-pattern show-extension label="Business Phone"></usa-phone-number-pattern>
  `,
};

/**
 * SMS-capable mobile number required.
 * Used for two-factor authentication or verification codes.
 */
export const SMSRequired: Story = {
  render: () => html`
    <usa-phone-number-pattern
      sms-required
      show-type
      required
      label="Mobile Number for Verification"
    ></usa-phone-number-pattern>
  `,
};

/**
 * Complete phone collection with all options.
 * Type, extension, and SMS notification.
 */
export const Complete: Story = {
  render: () => html`
    <usa-phone-number-pattern
      show-type
      show-extension
      required
      label="Contact Information"
    ></usa-phone-number-pattern>
  `,
};

/**
 * Pattern with event handling and validation.
 * Demonstrates API usage and event listening.
 */
export const WithEventHandling: Story = {
  render: () => html`
    <usa-phone-number-pattern
      id="phone-pattern"
      show-type
      show-extension
      required
    ></usa-phone-number-pattern>

    <div class="margin-top-2">
      <button
        class="usa-button"
        onclick="const pattern = document.getElementById('phone-pattern'); const isValid = pattern.validatePhoneNumber(); alert(isValid ? 'Phone number is valid!' : 'Please enter a valid 10-digit phone number.');"
      >
        Validate Phone
      </button>
      <button
        class="usa-button usa-button--outline"
        onclick="const pattern = document.getElementById('phone-pattern'); const data = pattern.getPhoneData(); alert(JSON.stringify(data, null, 2));"
      >
        Get Phone Data
      </button>
      <button
        class="usa-button usa-button--outline"
        onclick="const pattern = document.getElementById('phone-pattern'); const formatted = pattern.getFormattedPhoneNumber(); alert('Formatted: ' + formatted);"
      >
        Get Formatted
      </button>
      <button
        class="usa-button usa-button--outline"
        onclick="const pattern = document.getElementById('phone-pattern'); const raw = pattern.getRawPhoneNumber(); alert('Raw digits: ' + raw);"
      >
        Get Raw Digits
      </button>
      <button
        class="usa-button usa-button--secondary"
        onclick="document.getElementById('phone-pattern').clearPhoneNumber();"
      >
        Clear
      </button>
    </div>

    <div class="margin-top-4 usa-prose">
      <h3>Event Log:</h3>
      <pre id="event-log" style="background: #f0f0f0; padding: 1rem;">Waiting for events...</pre>
    </div>

    <script>
      (() => {
        const pattern = document.getElementById('phone-pattern');
        const log = document.getElementById('event-log');

        pattern.addEventListener('phone-change', (e) => {
          log.textContent = 'phone-change: ' + JSON.stringify(e.detail, null, 2);
        });
      })();
    </script>
  `,
};

/**
 * Multiple phone numbers in a form (primary and secondary).
 * Common pattern for collecting backup contact information.
 */
export const MultiplePhoneNumbers: Story = {
  render: () => html`
    <div class="usa-prose">
      <h2>Contact Information</h2>
      <p>Please provide at least one phone number where we can reach you.</p>
    </div>

    <usa-phone-number-pattern
      show-type
      required
      label="Primary Phone Number"
    ></usa-phone-number-pattern>

    <div class="margin-top-4">
      <usa-phone-number-pattern
        show-type
        show-extension
        label="Secondary Phone Number (Optional)"
      ></usa-phone-number-pattern>
    </div>

    <div class="margin-top-4 usa-alert usa-alert--info usa-alert--slim">
      <div class="usa-alert__body">
        <p class="usa-alert__text">
          We will only use these numbers to contact you about your application. Please be aware that
          we may leave voicemail messages.
        </p>
      </div>
    </div>
  `,
};
