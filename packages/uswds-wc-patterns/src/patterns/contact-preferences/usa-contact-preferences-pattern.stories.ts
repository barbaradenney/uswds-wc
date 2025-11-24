import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './usa-contact-preferences-pattern.js';
import type {
  ContactMethod,
  USAContactPreferencesPattern,
} from './usa-contact-preferences-pattern.js';

const meta: Meta = {
  title: 'Patterns/User Profile/Contact Preferences',
  component: 'usa-contact-preferences-pattern',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

/**
 * Default contact preferences with standard communication channels.
 * Allows users to select multiple preferred contact methods.
 */
export const Default: Story = {
  render: () => html` <usa-contact-preferences-pattern></usa-contact-preferences-pattern> `,
};

/**
 * With timeline hint explaining when users will be contacted.
 * Sets clear expectations about contact frequency and timeline.
 */
export const WithHint: Story = {
  render: () => html`
    <usa-contact-preferences-pattern
      hint="We will contact you within 5 business days with updates on your application"
    ></usa-contact-preferences-pattern>
  `,
};

/**
 * With additional information field for special accommodations.
 * Allows users to specify accessibility needs, preferred language, best time to contact, etc.
 */
export const WithAdditionalInfo: Story = {
  render: () => html`
    <usa-contact-preferences-pattern
      show-additional-info
      hint="We will contact you about your appointment"
      label="How should we contact you?"
    ></usa-contact-preferences-pattern>
  `,
};

/**
 * Custom contact methods for specialized scenarios.
 * Example: application-specific communication channels.
 */
export const CustomMethods: Story = {
  render: () => {
    const customMethods: ContactMethod[] = [
      {
        value: 'phone',
        label: 'Phone call',
        description: 'We will call you during business hours (9 AM - 5 PM)',
      },
      {
        value: 'text',
        label: 'Text message (SMS)',
        description: 'Quick updates via text',
      },
      {
        value: 'email',
        label: 'Email',
        description: 'Detailed information sent to your inbox',
      },
      {
        value: 'portal',
        label: 'Secure portal message',
        description: 'Log in to your account to view messages',
      },
    ];

    const pattern = document.createElement(
      'usa-contact-preferences-pattern'
    ) as USAContactPreferencesPattern;
    pattern.methods = customMethods;
    pattern.setAttribute('show-additional-info', '');
    pattern.setAttribute(
      'hint',
      'Select your preferred methods for receiving appointment reminders'
    );
    pattern.setAttribute('label', 'Notification preferences');

    return pattern;
  },
};

/**
 * Pattern with event handling and validation.
 * Demonstrates API usage and event listening.
 */
export const WithEventHandling: Story = {
  render: () => html`
    <usa-contact-preferences-pattern
      id="prefs-pattern"
      show-additional-info
      hint="We will contact you about important account updates"
    ></usa-contact-preferences-pattern>

    <div class="margin-top-2">
      <button
        class="usa-button"
        onclick="const pattern = document.getElementById('prefs-pattern'); const count = pattern.getSelectedMethodCount(); alert('Selected methods: ' + count);"
      >
        Count Selections
      </button>
      <button
        class="usa-button usa-button--outline"
        onclick="const pattern = document.getElementById('prefs-pattern'); const data = pattern.getPreferencesData(); alert(JSON.stringify(data, null, 2));"
      >
        Get Preferences Data
      </button>
      <button
        class="usa-button usa-button--outline"
        onclick="const pattern = document.getElementById('prefs-pattern'); const hasEmail = pattern.isMethodSelected('email'); alert('Email selected: ' + hasEmail);"
      >
        Check Email Selected
      </button>
      <button
        class="usa-button usa-button--secondary"
        onclick="document.getElementById('prefs-pattern').clearPreferences();"
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
        const pattern = document.getElementById('prefs-pattern');
        const log = document.getElementById('event-log');

        pattern.addEventListener('preferences-change', (e) => {
          log.textContent = 'preferences-change: ' + JSON.stringify(e.detail, null, 2);
        });
      })();
    </script>
  `,
};

/**
 * Complete user profile form example.
 * Demonstrates contact preferences integrated with other profile patterns.
 */
export const ProfileFormExample: Story = {
  render: () => html`
    <div class="usa-prose">
      <h1>Create Your Profile</h1>
      <p class="usa-intro">
        Please provide your information so we can keep you updated about your application.
      </p>
    </div>

    <div class="margin-top-4">
      <usa-contact-preferences-pattern
        show-additional-info
        hint="We will send you important updates about your application status"
        label="How would you like us to contact you?"
      ></usa-contact-preferences-pattern>
    </div>

    <div class="margin-top-4 usa-alert usa-alert--info usa-alert--slim">
      <div class="usa-alert__body">
        <p class="usa-alert__text">
          <strong>Privacy notice:</strong> We will only use your contact information for
          application-related communications. Your preferences can be updated at any time in your
          account settings.
        </p>
      </div>
    </div>

    <div class="margin-top-4">
      <button class="usa-button" type="submit">Save preferences</button>
      <button class="usa-button usa-button--outline" type="button">Cancel</button>
    </div>
  `,
};

/**
 * Accessibility-focused example.
 * Emphasizes accommodation requests and inclusive communication.
 */
export const AccessibilityFocused: Story = {
  render: () => html`
    <usa-contact-preferences-pattern
      show-additional-info
      label="Communication preferences"
      hint="We want to ensure our communications are accessible to you"
    ></usa-contact-preferences-pattern>

    <div class="margin-top-4 usa-prose">
      <h3>Examples of accessibility accommodations:</h3>
      <ul>
        <li>ASL interpreter for video calls</li>
        <li>Large print for postal mail</li>
        <li>Screen reader compatible email formats</li>
        <li>Preferred language for communications</li>
        <li>Best time of day for phone calls</li>
        <li>TTY/TDD service for hearing impaired</li>
      </ul>
    </div>
  `,
};
