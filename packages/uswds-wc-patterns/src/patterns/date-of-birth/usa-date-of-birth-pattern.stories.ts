import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './usa-date-of-birth-pattern.js';
import type { USADateOfBirthPattern } from './usa-date-of-birth-pattern.js';

const meta: Meta<USADateOfBirthPattern> = {
  title: 'Patterns/User Profile/Date of Birth',
  component: 'usa-date-of-birth-pattern',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
## USWDS Date of Birth Pattern

Date of birth pattern for collecting birth dates with proper validation and accessibility.

**USWDS Documentation**: https://designsystem.digital.gov/patterns/create-a-user-profile/date-of-birth/

### Pattern Responsibilities
- Collect date of birth with three separate fields (month, day, year)
- Validate date format and ranges
- Support leap years
- NO auto-advance focus (critical accessibility requirement)
- Emit date data changes

### CRITICAL Accessibility Requirements
- **NO JavaScript auto-advance focus** between fields
- Use \`type="text"\` with \`inputmode="numeric"\` (NOT \`type="number"\`)
- Always include visible labels
- Avoid auto-submission
- Group fields in fieldset with legend

### Features
- **Date Validation**: Validates month (01-12), day (01-31 based on month), year (4 digits)
- **Leap Year Support**: Correctly validates February 29 for leap years
- **Memorable Date Pattern**: Uses USWDS memorable date structure
- **Events**: Emits \`dob-change\` events for data updates
- **Light DOM**: No Shadow DOM, USWDS styles cascade properly
        `,
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Label for the date of birth section',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Date of birth' },
      },
    },
    required: {
      control: 'boolean',
      description: 'Whether date of birth is required',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    hint: {
      control: 'text',
      description: 'Hint text for date field',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'For example: January 19 2000' },
      },
    },
  },
  args: {
    label: 'Date of birth',
    required: true,
    hint: 'For example: January 19 2000',
  },
};

export default meta;
type Story = StoryObj<USADateOfBirthPattern>;

/**
 * Default date of birth pattern with basic date collection.
 */
export const Default: Story = {
  render: (args) => html`
    <usa-date-of-birth-pattern
      label="${args.label}"
      ?required="${args.required}"
      hint="${args.hint}"
    ></usa-date-of-birth-pattern>
  `,
};

/**
 * Date of birth pattern with custom hint text.
 */
export const CustomHint: Story = {
  args: {
    hint: 'Enter your birth date in MM/DD/YYYY format',
  },
  render: (args) => html`
    <usa-date-of-birth-pattern
      label="${args.label}"
      ?required="${args.required}"
      hint="${args.hint}"
    ></usa-date-of-birth-pattern>
  `,
};

/**
 * Optional date of birth pattern (not required).
 */
export const Optional: Story = {
  args: {
    required: false,
    label: 'Date of birth (optional)',
  },
  render: (args) => html`
    <usa-date-of-birth-pattern
      label="${args.label}"
      ?required="${args.required}"
      hint="${args.hint}"
    ></usa-date-of-birth-pattern>
  `,
};

/**
 * Date of birth pattern with pre-filled data.
 */
export const WithData: Story = {
  render: (args) => {
    setTimeout(() => {
      const pattern = document.querySelector('usa-date-of-birth-pattern');
      if (pattern) {
        (pattern as USADateOfBirthPattern).setDateOfBirthData({
          month: '06',
          day: '15',
          year: '1990',
        });
      }
    }, 100);

    return html`
      <usa-date-of-birth-pattern
        label="${args.label}"
        ?required="${args.required}"
        hint="${args.hint}"
      ></usa-date-of-birth-pattern>
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
      <usa-date-of-birth-pattern
        id="interactive-pattern"
        label="${args.label}"
        ?required="${args.required}"
        hint="${args.hint}"
        @dob-change="${(e: CustomEvent) => {
          const output = document.getElementById('dob-output');
          if (output) {
            const data = e.detail.dobData;
            const formatted = (e.target as USADateOfBirthPattern).getFormattedDate();
            const iso = (e.target as USADateOfBirthPattern).getISODate();
            output.textContent = JSON.stringify(
              {
                ...data,
                formatted: formatted || '(incomplete)',
                iso: iso || '(incomplete)',
              },
              null,
              2
            );
          }
        }}"
      ></usa-date-of-birth-pattern>

      <div>
        <h3 class="usa-legend">API Controls</h3>
        <div class="example-buttons">
          <button
            class="usa-button"
            @click="${() => {
              const pattern = document.getElementById(
                'interactive-pattern'
              ) as USADateOfBirthPattern;
              pattern.setDateOfBirthData({
                month: '01',
                day: '01',
                year: '2000',
              });
              const output = document.getElementById('dob-output');
              if (output) {
                output.textContent = JSON.stringify(
                  {
                    ...pattern.getDateOfBirthData(),
                    formatted: pattern.getFormattedDate(),
                    iso: pattern.getISODate(),
                  },
                  null,
                  2
                );
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
              ) as USADateOfBirthPattern;
              pattern.setDateOfBirthData({
                month: '02',
                day: '29',
                year: '2000',
              });
              const output = document.getElementById('dob-output');
              if (output) {
                output.textContent = JSON.stringify(
                  {
                    ...pattern.getDateOfBirthData(),
                    formatted: pattern.getFormattedDate(),
                    iso: pattern.getISODate(),
                  },
                  null,
                  2
                );
              }
            }}"
          >
            Set Leap Year
          </button>
          <button
            class="usa-button"
            @click="${() => {
              const pattern = document.getElementById(
                'interactive-pattern'
              ) as USADateOfBirthPattern;
              pattern.clearDateOfBirth();
              const output = document.getElementById('dob-output');
              if (output) {
                output.textContent = JSON.stringify(pattern.getDateOfBirthData(), null, 2);
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
              ) as USADateOfBirthPattern;
              const isValid = pattern.validateDateOfBirth();
              alert('Date is ' + (isValid ? 'valid' : 'invalid'));
            }}"
          >
            Validate
          </button>
          <button
            class="usa-button usa-button--outline"
            @click="${() => {
              const pattern = document.getElementById(
                'interactive-pattern'
              ) as USADateOfBirthPattern;
              const output = document.getElementById('dob-output');
              if (output) {
                output.textContent = JSON.stringify(
                  {
                    ...pattern.getDateOfBirthData(),
                    formatted: pattern.getFormattedDate(),
                    iso: pattern.getISODate(),
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
        <pre id="dob-output" class="example-output">{}</pre>
      </div>
    </div>
  `,
};

/**
 * Demonstrates leap year validation.
 */
export const LeapYearValidation: Story = {
  render: () => html`
    <style>
      .leap-year-examples {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }
      .leap-year-example {
        padding: 1rem;
        border: 1px solid #ddd;
        border-radius: 0.25rem;
      }
      .leap-year-example h4 {
        margin-top: 0;
      }
    </style>

    <div class="leap-year-examples">
      <div class="leap-year-example">
        <h4>✅ Valid: Leap Year February 29, 2000</h4>
        <usa-date-of-birth-pattern
          label="Date of birth"
          hint="2000 is a leap year (divisible by 400)"
        ></usa-date-of-birth-pattern>
        <button
          class="usa-button margin-top-2"
          @click="${(e: Event) => {
            const pattern = (e.target as HTMLElement).previousElementSibling;
            (pattern as USADateOfBirthPattern).setDateOfBirthData({
              month: '02',
              day: '29',
              year: '2000',
            });
            const isValid = (pattern as USADateOfBirthPattern).validateDateOfBirth();
            alert('Valid: ' + isValid);
          }}"
        >
          Set & Validate
        </button>
      </div>

      <div class="leap-year-example">
        <h4>❌ Invalid: Non-Leap Year February 29, 1900</h4>
        <usa-date-of-birth-pattern
          label="Date of birth"
          hint="1900 is NOT a leap year (divisible by 100 but not 400)"
        ></usa-date-of-birth-pattern>
        <button
          class="usa-button margin-top-2"
          @click="${(e: Event) => {
            const pattern = (e.target as HTMLElement).previousElementSibling;
            (pattern as USADateOfBirthPattern).setDateOfBirthData({
              month: '02',
              day: '29',
              year: '1900',
            });
            const isValid = (pattern as USADateOfBirthPattern).validateDateOfBirth();
            alert('Valid: ' + isValid);
          }}"
        >
          Set & Validate
        </button>
      </div>

      <div class="leap-year-example">
        <h4>✅ Valid: Leap Year February 29, 2024</h4>
        <usa-date-of-birth-pattern
          label="Date of birth"
          hint="2024 is a leap year (divisible by 4)"
        ></usa-date-of-birth-pattern>
        <button
          class="usa-button margin-top-2"
          @click="${(e: Event) => {
            const pattern = (e.target as HTMLElement).previousElementSibling;
            (pattern as USADateOfBirthPattern).setDateOfBirthData({
              month: '02',
              day: '29',
              year: '2024',
            });
            const isValid = (pattern as USADateOfBirthPattern).validateDateOfBirth();
            alert('Valid: ' + isValid);
          }}"
        >
          Set & Validate
        </button>
      </div>
    </div>
  `,
};

/**
 * Multiple date of birth patterns in a form.
 */
export const MultiplePatterns: Story = {
  render: () => html`
    <form>
      <usa-date-of-birth-pattern
        label="Your date of birth"
        hint="For verification purposes"
        required
      ></usa-date-of-birth-pattern>

      <usa-date-of-birth-pattern
        label="Spouse's date of birth (optional)"
        hint="Only if applying jointly"
        ?required="${false}"
      ></usa-date-of-birth-pattern>

      <usa-date-of-birth-pattern
        label="Dependent's date of birth"
        hint="First dependent"
        required
      ></usa-date-of-birth-pattern>

      <button type="submit" class="usa-button margin-top-3">Submit</button>
    </form>
  `,
};

/**
 * Demonstrates proper accessibility (NO auto-advance).
 */
export const AccessibilityCompliance: Story = {
  render: () => html`
    <style>
      .accessibility-note {
        padding: 1rem;
        background-color: #e7f6f8;
        border-left: 4px solid #00bde3;
        margin-bottom: 2rem;
      }
      .accessibility-note h4 {
        margin-top: 0;
        color: #005ea2;
      }
    </style>

    <div class="accessibility-note">
      <h4>✅ Accessibility Compliance</h4>
      <ul>
        <li>
          <strong>NO auto-advance focus:</strong> Focus does NOT automatically move to the next
          field
        </li>
        <li>
          <strong>Type="text" with inputmode="numeric":</strong> NOT type="number" (better for
          mobile)
        </li>
        <li><strong>Visible labels:</strong> All fields have clear, visible labels</li>
        <li><strong>Fieldset grouping:</strong> Fields grouped in fieldset with legend</li>
      </ul>
      <p>
        <strong>Try it:</strong> Select a month, then press Tab. Notice focus moves to Month
        dropdown (natural tab order), NOT auto-advanced to Day field.
      </p>
    </div>

    <usa-date-of-birth-pattern
      label="Date of birth"
      hint="Tab between fields - NO auto-advance"
      required
    ></usa-date-of-birth-pattern>
  `,
};
