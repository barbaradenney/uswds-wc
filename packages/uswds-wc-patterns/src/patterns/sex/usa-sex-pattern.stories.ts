import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './usa-sex-pattern.js';
import type { USASexPattern } from './usa-sex-pattern.js';

const meta: Meta<USASexPattern> = {
  title: 'Patterns/User Profile/Sex',
  component: 'usa-sex-pattern',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
## USWDS Sex Pattern

Sex pattern for collecting sex information with proper USWDS compliance and terminology.

**USWDS Documentation**: https://designsystem.digital.gov/patterns/create-a-user-profile/sex/

### CRITICAL Requirements (per USWDS)
- **Use "sex" terminology ONLY** - Do NOT use "gender"
- **Only provide "Male" and "Female" options** - Do NOT include:
  - "Prefer not to answer"
  - "X" or non-binary options
  - Other options
- **Explain why you're asking** - Include helper text/modal explaining data usage
- If you're considering "prefer not to answer", reconsider if the question is needed at all

### Pattern Responsibilities
- Collect sex information using radio buttons
- Provide clear explanation of data usage
- Emit sex data changes

### When to Use
Only collect sex information when:
- Required for services (healthcare, demographics)
- Legal requirement (government forms)
- Statistical analysis with privacy protections

**Important**: If sex information is not absolutely required, do not ask for it.
        `,
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Label for the sex section',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Sex' },
      },
    },
    required: {
      control: 'boolean',
      description: 'Whether sex is required',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    hint: {
      control: 'text',
      description: 'Hint text explaining why this information is collected',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Please select your sex from the following options.' },
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
  },
  args: {
    label: 'Sex',
    required: false,
    hint: 'Please select your sex from the following options.',
    showWhyLink: false,
    whyUrl: '',
  },
};

export default meta;
type Story = StoryObj<USASexPattern>;

/**
 * Default sex pattern with basic sex collection.
 */
export const Default: Story = {
  render: (args) => html`
    <usa-sex-pattern
      label="${args.label}"
      ?required="${args.required}"
      hint="${args.hint}"
      ?show-why-link="${args.showWhyLink}"
      why-url="${args.whyUrl}"
    ></usa-sex-pattern>
  `,
};

/**
 * Required sex field for government forms.
 */
export const Required: Story = {
  args: {
    required: true,
    hint: 'This information is required for federal reporting purposes',
  },
  render: (args) => html`
    <usa-sex-pattern
      label="${args.label}"
      ?required="${args.required}"
      hint="${args.hint}"
    ></usa-sex-pattern>
  `,
};

/**
 * Sex pattern with explanation link.
 */
export const WithExplanationLink: Story = {
  args: {
    showWhyLink: true,
    whyUrl: '#privacy-policy',
    hint: 'We collect this information to provide appropriate healthcare services.',
  },
  render: (args) => html`
    <usa-sex-pattern
      label="${args.label}"
      ?required="${args.required}"
      hint="${args.hint}"
      ?show-why-link="${args.showWhyLink}"
      why-url="${args.whyUrl}"
    ></usa-sex-pattern>
  `,
};

/**
 * Healthcare application example.
 */
export const HealthcareExample: Story = {
  args: {
    label: 'Sex',
    required: true,
    hint: 'Sex information is used to determine appropriate medical care and screening guidelines.',
    showWhyLink: true,
    whyUrl: '#medical-privacy',
  },
  render: (args) => html`
    <usa-sex-pattern
      label="${args.label}"
      ?required="${args.required}"
      hint="${args.hint}"
      ?show-why-link="${args.showWhyLink}"
      why-url="${args.whyUrl}"
    ></usa-sex-pattern>
  `,
};

/**
 * Sex pattern with pre-filled data.
 */
export const WithData: Story = {
  render: (args) => {
    setTimeout(() => {
      const pattern = document.querySelector('usa-sex-pattern');
      if (pattern) {
        (pattern as USASexPattern).setSexData({
          sex: 'female',
        });
      }
    }, 100);

    return html`
      <usa-sex-pattern
        label="${args.label}"
        ?required="${args.required}"
        hint="${args.hint}"
      ></usa-sex-pattern>
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
      <usa-sex-pattern
        id="interactive-pattern"
        label="${args.label}"
        ?required="${args.required}"
        hint="${args.hint}"
        @sex-change="${(e: CustomEvent) => {
          const output = document.getElementById('sex-output');
          if (output) {
            output.textContent = JSON.stringify(e.detail.sexData, null, 2);
          }
        }}"
      ></usa-sex-pattern>

      <div>
        <h3 class="usa-legend">API Controls</h3>
        <div class="example-buttons">
          <button
            class="usa-button"
            @click="${() => {
              const pattern = document.getElementById('interactive-pattern') as USASexPattern;
              pattern.setSexData({ sex: 'male' });
              const output = document.getElementById('sex-output');
              if (output) {
                output.textContent = JSON.stringify(pattern.getSexData(), null, 2);
              }
            }}"
          >
            Set Male
          </button>
          <button
            class="usa-button"
            @click="${() => {
              const pattern = document.getElementById('interactive-pattern') as USASexPattern;
              pattern.setSexData({ sex: 'female' });
              const output = document.getElementById('sex-output');
              if (output) {
                output.textContent = JSON.stringify(pattern.getSexData(), null, 2);
              }
            }}"
          >
            Set Female
          </button>
          <button
            class="usa-button"
            @click="${() => {
              const pattern = document.getElementById('interactive-pattern') as USASexPattern;
              pattern.clearSex();
              const output = document.getElementById('sex-output');
              if (output) {
                output.textContent = JSON.stringify(pattern.getSexData(), null, 2);
              }
            }}"
          >
            Clear
          </button>
          <button
            class="usa-button"
            @click="${() => {
              const pattern = document.getElementById('interactive-pattern') as USASexPattern;
              const isValid = pattern.validateSex();
              alert('Sex is ' + (isValid ? 'valid' : 'invalid'));
            }}"
          >
            Validate
          </button>
          <button
            class="usa-button usa-button--outline"
            @click="${() => {
              const pattern = document.getElementById('interactive-pattern') as USASexPattern;
              const output = document.getElementById('sex-output');
              if (output) {
                output.textContent = JSON.stringify(pattern.getSexData(), null, 2);
              }
            }}"
          >
            Get Data
          </button>
        </div>
      </div>

      <div>
        <h3 class="usa-legend">Current Data</h3>
        <pre id="sex-output" class="example-output">{}</pre>
      </div>
    </div>
  `,
};

/**
 * Demonstrates USWDS compliance (only Male/Female options).
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
      <h4>✅ USWDS Compliance</h4>
      <p><strong>Per USWDS guidelines, this pattern:</strong></p>
      <ul>
        <li>✅ Uses "sex" terminology (NOT "gender")</li>
        <li>✅ Only provides "Male" and "Female" options</li>
        <li>✅ Does NOT include "Prefer not to answer"</li>
        <li>✅ Does NOT include non-binary or other options</li>
        <li>✅ Explains why information is collected</li>
      </ul>
      <p>
        <strong>Why these restrictions?</strong> Per USWDS, if you're considering adding "prefer not
        to answer", reconsider whether you need to ask the question at all.
      </p>
    </div>

    <usa-sex-pattern
      label="Sex"
      hint="Required for medical records and appropriate care"
      show-why-link
      why-url="#why-we-ask"
      required
    ></usa-sex-pattern>
  `,
};
