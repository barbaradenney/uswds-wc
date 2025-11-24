import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './usa-name-pattern.js';

const meta: Meta = {
  title: 'Patterns/User Profile/Name',
  component: 'usa-name-pattern',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

/**
 * Default single full name field - recommended approach for most use cases.
 */
export const Default: Story = {
  render: () => html` <usa-name-pattern></usa-name-pattern> `,
};

/**
 * Required full name field with validation.
 */
export const Required: Story = {
  render: () => html` <usa-name-pattern required></usa-name-pattern> `,
};

/**
 * Separate name fields (given name, family name).
 * Use when you need parsed name components for identity validation.
 */
export const SeparateFields: Story = {
  render: () => html` <usa-name-pattern format="separate" label="Legal Name"></usa-name-pattern> `,
};

/**
 * Separate fields with middle name and suffix.
 * Comprehensive name collection for formal contexts.
 */
export const WithMiddleAndSuffix: Story = {
  render: () => html`
    <usa-name-pattern
      format="separate"
      show-middle
      show-suffix
      required
      label="Full Legal Name"
    ></usa-name-pattern>
  `,
};

/**
 * With preferred name field for correspondence.
 * Allows users to specify how they'd like to be addressed.
 */
export const WithPreferredName: Story = {
  render: () => html` <usa-name-pattern show-preferred required></usa-name-pattern> `,
};

/**
 * Flexible format - provides both full name and separate fields.
 * Users can choose their preferred input method.
 */
export const FlexibleFormat: Story = {
  render: () => html`
    <usa-name-pattern
      format="flexible"
      show-preferred
      required
      label="Your Name"
    ></usa-name-pattern>
  `,
};

/**
 * Pattern with event handling and validation.
 * Demonstrates API usage and event listening.
 */
export const WithEventHandling: Story = {
  render: () => html`
    <usa-name-pattern
      id="name-pattern"
      format="separate"
      show-middle
      show-suffix
      show-preferred
      required
    ></usa-name-pattern>

    <div class="margin-top-2">
      <button
        class="usa-button"
        onclick="const pattern = document.getElementById('name-pattern'); const isValid = pattern.validateName(); alert(isValid ? 'Name is valid!' : 'Please fill all required fields.');"
      >
        Validate Name
      </button>
      <button
        class="usa-button usa-button--outline"
        onclick="const pattern = document.getElementById('name-pattern'); const data = pattern.getNameData(); alert(JSON.stringify(data, null, 2));"
      >
        Get Name Data
      </button>
      <button
        class="usa-button usa-button--outline"
        onclick="const pattern = document.getElementById('name-pattern'); const formatted = pattern.getFormattedName(); alert('Formatted: ' + formatted);"
      >
        Get Formatted Name
      </button>
      <button
        class="usa-button usa-button--secondary"
        onclick="document.getElementById('name-pattern').clearName();"
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
        const pattern = document.getElementById('name-pattern');
        const log = document.getElementById('event-log');

        pattern.addEventListener('name-change', (e) => {
          log.textContent = 'name-change: ' + JSON.stringify(e.detail, null, 2);
        });
      })();
    </script>
  `,
};

/**
 * Cultural sensitivity example - supports diverse naming conventions.
 * Demonstrates flexibility for international users.
 */
export const CulturalSensitivity: Story = {
  render: () => html`
    <div class="usa-prose">
      <h2>Name Collection with Cultural Sensitivity</h2>
      <p>This pattern supports diverse naming conventions including:</p>
      <ul>
        <li>Single names (Indonesian, Icelandic)</li>
        <li>Multiple family names (Spanish, Brazilian)</li>
        <li>Different name ordering (Chinese, Korean, Hungarian)</li>
        <li>Diacritics and special characters (José, François, Müller)</li>
        <li>Names up to 128 characters</li>
      </ul>
    </div>

    <usa-name-pattern format="full" label="Name"></usa-name-pattern>

    <div class="margin-top-4 usa-prose">
      <h3>Examples of Valid Names:</h3>
      <ul>
        <li><strong>Single name:</strong> Sukarno</li>
        <li><strong>Multiple family names:</strong> María García López</li>
        <li><strong>With diacritics:</strong> François Müller</li>
        <li><strong>Family name first:</strong> Kim Jong Un</li>
        <li><strong>Hyphenated:</strong> Mary-Kate Smith-Jones</li>
      </ul>
    </div>
  `,
};
