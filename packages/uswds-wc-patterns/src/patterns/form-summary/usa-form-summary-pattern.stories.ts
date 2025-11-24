import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './usa-form-summary-pattern.js';
import type { SummarySection } from './usa-form-summary-pattern.js';

const meta: Meta = {
  title: 'Patterns/Form Summary',
  component: 'usa-form-summary-pattern',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const sampleSections: SummarySection[] = [
  {
    heading: 'Personal Information',
    items: [
      { label: 'Full Name', value: 'John Smith' },
      { label: 'Date of Birth', value: 'January 15, 1985' },
      { label: 'Social Security Number', value: '***-**-6789' },
    ],
  },
  {
    heading: 'Contact Information',
    items: [
      { label: 'Email', value: 'john.smith@example.com' },
      { label: 'Phone', value: '(555) 123-4567' },
      { label: 'Address', value: '123 Main St, Anytown, ST 12345' },
    ],
  },
];

/**
 * Default form summary showing submitted information with print capability.
 */
export const Default: Story = {
  render: () => html`
    <usa-form-summary-pattern .sections=${sampleSections} show-print> </usa-form-summary-pattern>
  `,
};

/**
 * Form summary with confirmation message after successful submission.
 */
export const WithConfirmation: Story = {
  render: () => html`
    <usa-form-summary-pattern
      .sections=${sampleSections}
      show-confirmation
      confirmation-title="Application Submitted Successfully"
      confirmation-type="success"
      show-print
    >
      <div slot="confirmation">
        <p class="usa-alert__text">
          Your application #12345 has been received. You will receive a confirmation email shortly.
        </p>
      </div>
    </usa-form-summary-pattern>
  `,
};

/**
 * Form summary with edit capability for each field.
 */
export const WithEditCapability: Story = {
  render: () => {
    const editableSections: SummarySection[] = sampleSections.map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        onEdit: () => alert('Edit ' + item.label + ': ' + item.value),
      })),
    }));

    return html`
      <usa-form-summary-pattern
        .sections=${editableSections}
        show-edit
        show-print
        title="Review and Edit"
      >
      </usa-form-summary-pattern>
    `;
  },
};

/**
 * Form summary with both print and download options.
 */
export const WithDownload: Story = {
  render: () => html`
    <usa-form-summary-pattern
      .sections=${sampleSections}
      show-print
      show-download
      download-button-label="Download PDF"
    >
    </usa-form-summary-pattern>

    <script>
      (() => {
        const pattern = document.querySelector('usa-form-summary-pattern');
        pattern.addEventListener('download-summary', (e) => {
          alert('Download functionality would be implemented here');
          console.log('Download data:', e.detail);
        });
      })();
    </script>
  `,
};

/**
 * Complete application summary with custom header and footer.
 */
export const JobApplicationSummary: Story = {
  render: () => {
    const jobSections: SummarySection[] = [
      {
        heading: 'Applicant Information',
        items: [
          { label: 'Full Name', value: 'Jane Doe' },
          { label: 'Email', value: 'jane.doe@example.com' },
          { label: 'Phone', value: '(555) 987-6543' },
        ],
      },
      {
        heading: 'Position Details',
        items: [
          { label: 'Position Applied For', value: 'Software Engineer' },
          { label: 'Department', value: 'Engineering' },
          { label: 'Start Date', value: 'As soon as possible' },
        ],
      },
      {
        heading: 'Experience',
        items: [
          { label: 'Current Employer', value: 'Tech Company Inc.' },
          { label: 'Job Title', value: 'Senior Developer' },
          { label: 'Years of Experience', value: '8 years' },
        ],
      },
    ];

    return html`
      <usa-form-summary-pattern
        .sections=${jobSections}
        show-confirmation
        confirmation-title="Application Submitted"
        confirmation-type="success"
        show-print
        show-download
      >
        <div slot="confirmation">
          <p class="usa-alert__text">
            Thank you for your application. Our recruitment team will review your information and
            contact you within 5-7 business days.
          </p>
        </div>
        <div slot="footer">
          <div class="usa-alert usa-alert--info usa-alert--slim">
            <div class="usa-alert__body">
              <p class="usa-alert__text">
                Please save or print this page for your records. Reference number: APP-2025-001234
              </p>
            </div>
          </div>
        </div>
      </usa-form-summary-pattern>
    `;
  },
};
