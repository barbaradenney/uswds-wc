import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './usa-ssn-pattern.js';
import type { USASSNPattern } from './usa-ssn-pattern.js';

const meta: Meta<USASSNPattern> = {
  title: 'Patterns/User Profile/SSN',
  component: 'usa-ssn-pattern',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
## USWDS SSN Pattern

Social Security Number pattern for collecting SSN information with proper USWDS compliance.

**USWDS Documentation**: https://designsystem.digital.gov/patterns/create-a-user-profile/social-security-number/

### CRITICAL Requirements (per USWDS)
- **Use SINGLE text field** - Do NOT split into three separate fields
- **Input type: text** with inputmode="numeric"
- **Accept hyphens and spaces** - Fault tolerance for user entry
- **NO placeholder text** - Use hint text instead
- **Only collect when necessary** - Identity verification only
- **Explain why you're asking** - Privacy and security transparency

### Pattern Responsibilities
- Collect SSN using single input field
- Validate SSN format and SSA rules
- Provide clear format example
- Emit SSN data changes

### When to Use
Only collect SSN when:
- **Confirming identity** for government services/benefits
- **Federal student loans**, public assistance, Medicare applications
- **Legal requirement** with no alternative

**Important**: If SSN is not absolutely required, do not ask for it. Consider alternatives for users without SSNs.
        `,
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Label for the SSN section',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Social Security number' },
      },
    },
    required: {
      control: 'boolean',
      description: 'Whether SSN is required',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    hint: {
      control: 'text',
      description: 'Hint text explaining format',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'For example, 555 11 0000' },
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
    label: 'Social Security number',
    required: false,
    hint: 'For example, 555 11 0000',
    showWhyLink: false,
    whyUrl: '',
  },
};

export default meta;
type Story = StoryObj<USASSNPattern>;

/**
 * Default SSN pattern with basic input.
 */
export const Default: Story = {
  render: (args) => html`
    <usa-ssn-pattern
      label="${args.label}"
      ?required="${args.required}"
      hint="${args.hint}"
      ?show-why-link="${args.showWhyLink}"
      why-url="${args.whyUrl}"
    ></usa-ssn-pattern>
  `,
};

/**
 * Required SSN field for government forms.
 */
export const Required: Story = {
  args: {
    required: true,
    hint: 'Required for identity verification and benefits eligibility',
  },
  render: (args) => html`
    <usa-ssn-pattern
      label="${args.label}"
      ?required="${args.required}"
      hint="${args.hint}"
    ></usa-ssn-pattern>
  `,
};

/**
 * SSN pattern with explanation link.
 */
export const WithExplanationLink: Story = {
  args: {
    showWhyLink: true,
    whyUrl: '#privacy-policy',
    hint: 'We ask for this information to verify your identity. For example, 555 11 0000',
  },
  render: (args) => html`
    <usa-ssn-pattern
      label="${args.label}"
      ?required="${args.required}"
      hint="${args.hint}"
      ?show-why-link="${args.showWhyLink}"
      why-url="${args.whyUrl}"
    ></usa-ssn-pattern>
  `,
};

/**
 * Federal student loan application example.
 */
export const StudentLoanExample: Story = {
  args: {
    label: 'Social Security number',
    required: true,
    hint: 'Required for federal student loan application. For example, 555 11 0000',
    showWhyLink: true,
    whyUrl: '#student-loan-privacy',
  },
  render: (args) => html`
    <usa-ssn-pattern
      label="${args.label}"
      ?required="${args.required}"
      hint="${args.hint}"
      ?show-why-link="${args.showWhyLink}"
      why-url="${args.whyUrl}"
    ></usa-ssn-pattern>
  `,
};

/**
 * Medicare application example.
 */
export const MedicareExample: Story = {
  args: {
    label: 'Social Security number',
    required: true,
    hint: 'Required to verify Medicare eligibility. For example, 555 11 0000',
    showWhyLink: true,
    whyUrl: '#medicare-privacy',
  },
  render: (args) => html`
    <usa-ssn-pattern
      label="${args.label}"
      ?required="${args.required}"
      hint="${args.hint}"
      ?show-why-link="${args.showWhyLink}"
      why-url="${args.whyUrl}"
    ></usa-ssn-pattern>
  `,
};

/**
 * SSN pattern with pre-filled data.
 */
export const WithData: Story = {
  render: (args) => {
    setTimeout(() => {
      const pattern = document.querySelector('usa-ssn-pattern');
      if (pattern) {
        (pattern as USASSNPattern).setSSNData({
          ssn: '123-45-6789',
        });
      }
    }, 100);

    return html`
      <usa-ssn-pattern
        label="${args.label}"
        ?required="${args.required}"
        hint="${args.hint}"
      ></usa-ssn-pattern>
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
      <usa-ssn-pattern
        id="interactive-pattern"
        label="${args.label}"
        ?required="${args.required}"
        hint="${args.hint}"
        @ssn-change="${(e: CustomEvent) => {
          const output = document.getElementById('ssn-output');
          if (output) {
            const { ssnData } = e.detail;
            const pattern = document.getElementById('interactive-pattern') as USASSNPattern;
            output.textContent = JSON.stringify(
              {
                ssn: ssnData.ssn,
                normalized: pattern.getNormalizedSSN(),
                formatted: pattern.getFormattedSSN(),
                valid: pattern.validateSSN(),
              },
              null,
              2
            );
          }
        }}"
      ></usa-ssn-pattern>

      <div>
        <h3 class="usa-legend">API Controls</h3>
        <div class="example-buttons">
          <button
            class="usa-button"
            @click="${() => {
              const pattern = document.getElementById('interactive-pattern') as USASSNPattern;
              pattern.setSSNData({ ssn: '123-45-6789' });
              const output = document.getElementById('ssn-output');
              if (output) {
                output.textContent = JSON.stringify(
                  {
                    ssn: pattern.getSSN(),
                    normalized: pattern.getNormalizedSSN(),
                    formatted: pattern.getFormattedSSN(),
                    valid: pattern.validateSSN(),
                  },
                  null,
                  2
                );
              }
            }}"
          >
            Set Valid SSN
          </button>
          <button
            class="usa-button"
            @click="${() => {
              const pattern = document.getElementById('interactive-pattern') as USASSNPattern;
              pattern.setSSNData({ ssn: '000-45-6789' });
              const output = document.getElementById('ssn-output');
              if (output) {
                output.textContent = JSON.stringify(
                  {
                    ssn: pattern.getSSN(),
                    normalized: pattern.getNormalizedSSN(),
                    formatted: pattern.getFormattedSSN(),
                    valid: pattern.validateSSN(),
                  },
                  null,
                  2
                );
              }
            }}"
          >
            Set Invalid SSN (000)
          </button>
          <button
            class="usa-button"
            @click="${() => {
              const pattern = document.getElementById('interactive-pattern') as USASSNPattern;
              pattern.clearSSN();
              const output = document.getElementById('ssn-output');
              if (output) {
                output.textContent = JSON.stringify(pattern.getSSNData(), null, 2);
              }
            }}"
          >
            Clear
          </button>
          <button
            class="usa-button"
            @click="${() => {
              const pattern = document.getElementById('interactive-pattern') as USASSNPattern;
              const isValid = pattern.validateSSN();
              alert('SSN is ' + (isValid ? 'valid' : 'invalid'));
            }}"
          >
            Validate
          </button>
          <button
            class="usa-button usa-button--outline"
            @click="${() => {
              const pattern = document.getElementById('interactive-pattern') as USASSNPattern;
              const output = document.getElementById('ssn-output');
              if (output) {
                output.textContent = JSON.stringify(
                  {
                    ssn: pattern.getSSN(),
                    normalized: pattern.getNormalizedSSN(),
                    formatted: pattern.getFormattedSSN(),
                    valid: pattern.validateSSN(),
                  },
                  null,
                  2
                );
              }
            }}"
          >
            Get Data
          </button>
        </div>
      </div>

      <div>
        <h3 class="usa-legend">Current Data</h3>
        <pre id="ssn-output" class="example-output">{}</pre>
      </div>
    </div>
  `,
};

/**
 * Demonstrates USWDS compliance (single field, accepts hyphens/spaces).
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
        <li>✅ Uses SINGLE text field (NOT three separate fields)</li>
        <li>✅ Input type="text" with inputmode="numeric"</li>
        <li>✅ Accepts hyphens and spaces (fault tolerance)</li>
        <li>✅ NO placeholder text (uses hint text)</li>
        <li>✅ Validates per SSA standards</li>
        <li>✅ Explains why information is collected</li>
      </ul>
      <p>
        <strong>Why single field?</strong> Per USWDS, splitting SSN into three fields creates
        unnecessary friction and accessibility issues. A single field with fault tolerance for
        hyphens/spaces is the recommended approach.
      </p>
    </div>

    <usa-ssn-pattern
      label="Social Security number"
      hint="Required for benefits verification. For example, 555 11 0000"
      show-why-link
      why-url="#why-we-ask"
      required
    ></usa-ssn-pattern>
  `,
};
