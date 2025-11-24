import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './usa-race-ethnicity-pattern.js';
import type { USARaceEthnicityPattern } from './usa-race-ethnicity-pattern.js';

const meta: Meta<USARaceEthnicityPattern> = {
  title: 'Patterns/User Profile/Race and Ethnicity',
  component: 'usa-race-ethnicity-pattern',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
## USWDS Race and Ethnicity Pattern

Collects race and ethnicity information according to OMB standards.

**USWDS Documentation**: https://designsystem.digital.gov/patterns/create-a-user-profile/race-and-ethnicity/

### CRITICAL Requirements (per USWDS)
- **Use OMB race categories** - 5 standard categories (multi-select checkboxes)
- **Separate ethnicity question** - Open text input for self-identification
- **Two-part structure** - Race and ethnicity asked together but not combined
- **"Prefer not to share" option** - Allow users to decline
- **Explain why you're asking** - Privacy and transparency

### OMB Race Categories (Multi-Select)
- American Indian or Alaska Native
- Asian
- Black or African American
- Native Hawaiian or Other Pacific Islander
- White

### Pattern Responsibilities
- Collect race using OMB standard categories
- Collect ethnicity via self-identification
- Provide "Prefer not to share" option
- Emit race-ethnicity-change events

### When to Use
- **Required by law** for federal programs
- **Demographic data** for research or service delivery
- **Equal opportunity** monitoring
- **Healthcare** disparities research

**Important**: Only collect when required by law. Always explain data usage.
        `,
      },
    },
  },
  argTypes: {
    raceLabel: {
      control: 'text',
      description: 'Label for the race section',
      table: {
        type: { summary: 'string' },
        defaultValue: {
          summary: 'Which of the following race classifications best describe you?',
        },
      },
    },
    ethnicityLabel: {
      control: 'text',
      description: 'Label for the ethnicity section',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'I identify my ethnicity as:' },
      },
    },
    raceHint: {
      control: 'text',
      description: 'Hint text for race section',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Select all that apply' },
      },
    },
    ethnicityHint: {
      control: 'text',
      description: 'Hint text for ethnicity section',
      table: {
        type: { summary: 'string' },
        defaultValue: {
          summary: 'You may report more than one ethnicity. For example, "Hmong and Italian"',
        },
      },
    },
    required: {
      control: 'boolean',
      description: 'Whether race/ethnicity is required',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    showWhyLink: {
      control: 'boolean',
      description: 'Show "Why do we ask for this?" link',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    whyUrl: {
      control: 'text',
      description: 'URL for "Why do we ask for this?" link',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' },
      },
    },
    showPreferNotToShare: {
      control: 'boolean',
      description: 'Show "Prefer not to share" option',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
  },
  args: {
    raceLabel: 'Which of the following race classifications best describe you?',
    ethnicityLabel: 'I identify my ethnicity as:',
    raceHint: 'Select all that apply',
    ethnicityHint: 'You may report more than one ethnicity. For example, "Hmong and Italian"',
    required: false,
    showWhyLink: false,
    whyUrl: '',
    showPreferNotToShare: true,
  },
};

export default meta;
type Story = StoryObj<USARaceEthnicityPattern>;

/**
 * Default race and ethnicity pattern with all OMB categories.
 */
export const Default: Story = {
  render: (args) => html`
    <usa-race-ethnicity-pattern
      race-label="${args.raceLabel}"
      ethnicity-label="${args.ethnicityLabel}"
      race-hint="${args.raceHint}"
      ethnicity-hint="${args.ethnicityHint}"
      ?required="${args.required}"
      ?show-why-link="${args.showWhyLink}"
      why-url="${args.whyUrl}"
      ?show-prefer-not-to-share="${args.showPreferNotToShare}"
    ></usa-race-ethnicity-pattern>
  `,
};

/**
 * Required race and ethnicity for government forms.
 */
export const Required: Story = {
  args: {
    required: true,
    showWhyLink: true,
    whyUrl: '#privacy-policy',
  },
  render: (args) => html`
    <usa-race-ethnicity-pattern
      race-label="${args.raceLabel}"
      ethnicity-label="${args.ethnicityLabel}"
      race-hint="${args.raceHint}"
      ethnicity-hint="${args.ethnicityHint}"
      ?required="${args.required}"
      ?show-why-link="${args.showWhyLink}"
      why-url="${args.whyUrl}"
      ?show-prefer-not-to-share="${args.showPreferNotToShare}"
    ></usa-race-ethnicity-pattern>
  `,
};

/**
 * With explanation link for data usage.
 */
export const WithExplanationLink: Story = {
  args: {
    showWhyLink: true,
    whyUrl: '#data-usage',
  },
  render: (args) => html`
    <usa-race-ethnicity-pattern
      race-label="${args.raceLabel}"
      ethnicity-label="${args.ethnicityLabel}"
      race-hint="${args.raceHint}"
      ethnicity-hint="${args.ethnicityHint}"
      ?required="${args.required}"
      ?show-why-link="${args.showWhyLink}"
      why-url="${args.whyUrl}"
      ?show-prefer-not-to-share="${args.showPreferNotToShare}"
    ></usa-race-ethnicity-pattern>
  `,
};

/**
 * Healthcare demographic data collection example.
 */
export const HealthcareExample: Story = {
  args: {
    raceLabel: 'Race',
    ethnicityLabel: 'Ethnicity',
    raceHint:
      'Select all that apply. This information helps us identify and address healthcare disparities.',
    ethnicityHint: 'You may report more than one ethnicity',
    showWhyLink: true,
    whyUrl: '#healthcare-privacy',
    required: false,
  },
  render: (args) => html`
    <usa-race-ethnicity-pattern
      race-label="${args.raceLabel}"
      ethnicity-label="${args.ethnicityLabel}"
      race-hint="${args.raceHint}"
      ethnicity-hint="${args.ethnicityHint}"
      ?required="${args.required}"
      ?show-why-link="${args.showWhyLink}"
      why-url="${args.whyUrl}"
      ?show-prefer-not-to-share="${args.showPreferNotToShare}"
    ></usa-race-ethnicity-pattern>
  `,
};

/**
 * Federal program eligibility example.
 */
export const FederalProgramExample: Story = {
  args: {
    raceLabel: 'Which of the following race classifications best describe you?',
    ethnicityLabel: 'I identify my ethnicity as:',
    raceHint: 'Select all that apply. Required for federal program eligibility determination.',
    ethnicityHint: 'You may report more than one ethnicity',
    required: true,
    showWhyLink: true,
    whyUrl: '#federal-requirements',
  },
  render: (args) => html`
    <usa-race-ethnicity-pattern
      race-label="${args.raceLabel}"
      ethnicity-label="${args.ethnicityLabel}"
      race-hint="${args.raceHint}"
      ethnicity-hint="${args.ethnicityHint}"
      ?required="${args.required}"
      ?show-why-link="${args.showWhyLink}"
      why-url="${args.whyUrl}"
      ?show-prefer-not-to-share="${args.showPreferNotToShare}"
    ></usa-race-ethnicity-pattern>
  `,
};

/**
 * Pattern with pre-filled data.
 */
export const WithData: Story = {
  render: (args) => {
    setTimeout(() => {
      const pattern = document.querySelector('usa-race-ethnicity-pattern');
      if (pattern) {
        (pattern as USARaceEthnicityPattern).setRaceEthnicityData({
          race: ['asian', 'white'],
          ethnicity: 'Chinese and Irish',
          preferNotToShare: false,
        });
      }
    }, 100);

    return html`
      <usa-race-ethnicity-pattern
        race-label="${args.raceLabel}"
        ethnicity-label="${args.ethnicityLabel}"
        race-hint="${args.raceHint}"
        ethnicity-hint="${args.ethnicityHint}"
        ?required="${args.required}"
        ?show-why-link="${args.showWhyLink}"
        why-url="${args.whyUrl}"
        ?show-prefer-not-to-share="${args.showPreferNotToShare}"
      ></usa-race-ethnicity-pattern>
    `;
  },
};

/**
 * Interactive example demonstrating events and API.
 */
export const Interactive: Story = {
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
      <usa-race-ethnicity-pattern
        id="interactive-pattern"
        race-label="${args.raceLabel}"
        ethnicity-label="${args.ethnicityLabel}"
        race-hint="${args.raceHint}"
        ethnicity-hint="${args.ethnicityHint}"
        ?required="${args.required}"
        ?show-why-link="${args.showWhyLink}"
        why-url="${args.whyUrl}"
        ?show-prefer-not-to-share="${args.showPreferNotToShare}"
        @race-ethnicity-change="${(e: CustomEvent) => {
          const output = document.getElementById('race-ethnicity-output');
          if (output) {
            const { raceEthnicityData } = e.detail;
            output.textContent = JSON.stringify(raceEthnicityData, null, 2);
          }
        }}"
      ></usa-race-ethnicity-pattern>

      <div>
        <h3 class="usa-legend">API Controls</h3>
        <div class="example-buttons">
          <button
            class="usa-button"
            @click="${() => {
              const pattern = document.getElementById(
                'interactive-pattern'
              ) as USARaceEthnicityPattern;
              pattern.setRaceEthnicityData({
                race: ['asian', 'white'],
                ethnicity: 'Chinese and Irish',
              });
              const output = document.getElementById('race-ethnicity-output');
              if (output) {
                output.textContent = JSON.stringify(pattern.getRaceEthnicityData(), null, 2);
              }
            }}"
          >
            Set Sample Data
          </button>
          <button
            class="usa-button"
            @click="${() => {
              const pattern = document.getElementById(
                'interactive-pattern'
              ) as USARaceEthnicityPattern;
              pattern.setRaceEthnicityData({
                race: ['black-african-american'],
                ethnicity: 'Jamaican',
              });
              const output = document.getElementById('race-ethnicity-output');
              if (output) {
                output.textContent = JSON.stringify(pattern.getRaceEthnicityData(), null, 2);
              }
            }}"
          >
            Set Different Data
          </button>
          <button
            class="usa-button"
            @click="${() => {
              const pattern = document.getElementById(
                'interactive-pattern'
              ) as USARaceEthnicityPattern;
              pattern.clearRaceEthnicity();
              const output = document.getElementById('race-ethnicity-output');
              if (output) {
                output.textContent = JSON.stringify(pattern.getRaceEthnicityData(), null, 2);
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
              ) as USARaceEthnicityPattern;
              const isValid = pattern.validateRaceEthnicity();
              alert('Race/Ethnicity is ' + (isValid ? 'valid' : 'invalid'));
            }}"
          >
            Validate
          </button>
          <button
            class="usa-button usa-button--outline"
            @click="${() => {
              const pattern = document.getElementById(
                'interactive-pattern'
              ) as USARaceEthnicityPattern;
              const output = document.getElementById('race-ethnicity-output');
              if (output) {
                output.textContent = JSON.stringify(pattern.getRaceEthnicityData(), null, 2);
              }
            }}"
          >
            Get Data
          </button>
        </div>
      </div>

      <div>
        <h3 class="usa-legend">Current Data</h3>
        <pre id="race-ethnicity-output" class="example-output">{}</pre>
      </div>
    </div>
  `,
};

/**
 * Demonstrates USWDS OMB compliance.
 */
export const USWDSCompliance: Story = {
  render: () => html`
    <style>
      .compliance-note {
        padding: 1rem;
        background-color: #e7f6f8;
        border-left: 4px solid #00bde3;
        margin-bottom: 2rem;
      }
      .compliance-note h4 {
        margin-top: 0;
        color: #005ea2;
      }
      .compliance-note ul {
        margin-bottom: 0;
      }
    </style>

    <div class="compliance-note">
      <h4>✅ USWDS OMB Compliance</h4>
      <p><strong>Per USWDS guidelines, this pattern:</strong></p>
      <ul>
        <li>✅ Uses OMB standard race categories (5 categories)</li>
        <li>✅ Supports multi-select for race (checkboxes, not radio)</li>
        <li>✅ Separates race and ethnicity questions</li>
        <li>✅ Provides open text input for ethnicity self-identification</li>
        <li>✅ Includes "Prefer not to share" option</li>
        <li>✅ Explains why information is collected</li>
      </ul>
      <p>
        <strong>OMB Categories:</strong> American Indian or Alaska Native, Asian, Black or African
        American, Native Hawaiian or Other Pacific Islander, White
      </p>
    </div>

    <usa-race-ethnicity-pattern
      race-label="Which of the following race classifications best describe you?"
      ethnicity-label="I identify my ethnicity as:"
      race-hint="Select all that apply"
      ethnicity-hint="You may report more than one ethnicity. For example, 'Hmong and Italian'"
      show-why-link
      why-url="#why-we-ask"
    ></usa-race-ethnicity-pattern>
  `,
};
