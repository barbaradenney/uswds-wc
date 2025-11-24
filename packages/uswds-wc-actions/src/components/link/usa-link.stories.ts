import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import '@uswds-wc/data-display';
import type { USALink } from './usa-link.js';

const meta: Meta<USALink> = {
  title: 'Actions/Link',
  component: 'usa-link',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# USA Link

The USA Link component provides consistent link styling and behavior using official USWDS standards. 
It automatically handles external link security, accessibility attributes, and proper visual styling 
for web applications.

## Features
- Automatic external link detection with security attributes
- Multiple variants (default, external, alt, unstyled)
- Built-in accessibility support with ARIA labels
- Consistent USWDS styling and visual indicators
- Download link support
- Custom event handling for analytics and tracking

## Usage Guidelines

- Use for navigation within and outside your application
- External links automatically get security attributes (noopener, noreferrer)
- Provide descriptive link text that makes sense out of context
- Use aria-label for additional context when needed
- Consider download attribute for file links

## Accessibility

- Links are keyboard accessible by default
- External links include proper security attributes
- ARIA labels supported for additional context
- Focus indicators meet WCAG contrast requirements
- Link text should be descriptive and meaningful
        `,
      },
    },
  },
  argTypes: {
    href: {
      control: 'text',
      description: 'URL destination for the link',
    },
    target: {
      control: { type: 'select' },
      options: ['', '_blank', '_self', '_parent', '_top'],
      description: 'How to open the link (auto-set for external links)',
    },
    rel: {
      control: 'text',
      description: 'Relationship attributes (auto-enhanced for external links)',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'external', 'alt', 'unstyled'],
      description: 'Visual variant of the link',
    },
    external: {
      control: 'boolean',
      description: 'Force external link styling and behavior',
    },
    unstyled: {
      control: 'boolean',
      description: 'Remove USWDS styling',
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label for screen readers',
    },
    download: {
      control: 'text',
      description: 'Filename for download links',
    },
  },
};

export default meta;
type Story = StoryObj<USALink>;

export const Default: Story = {
  args: {
    href: '/about',
    variant: 'default',
  },
  render: (args) => html`
    <usa-link
      href="${args.href}"
      target="${args.target}"
      rel="${args.rel}"
      variant="${args.variant}"
      ?external=${args.external}
      ?unstyled=${args.unstyled}
      aria-label="${args.ariaLabel}"
      download="${args.download}"
    >
      About Our Company
    </usa-link>
  `,
};

export const ExternalLink: Story = {
  args: {
    href: 'https://www.usa.gov',
    variant: 'external',
  },
  render: (args) => html`
    <usa-link
      href="${args.href}"
      target="${args.target}"
      rel="${args.rel}"
      variant="${args.variant}"
      ?external=${args.external}
      ?unstyled=${args.unstyled}
      aria-label="${args.ariaLabel}"
      download="${args.download}"
    >
      Visit USA.gov
    </usa-link>
  `,
};

export const AlternativeVariant: Story = {
  args: {
    href: '/services',
    variant: 'alt',
  },
  render: (args) => html`
    <usa-link
      href="${args.href}"
      target="${args.target}"
      rel="${args.rel}"
      variant="${args.variant}"
      ?external=${args.external}
      ?unstyled=${args.unstyled}
      aria-label="${args.ariaLabel}"
      download="${args.download}"
    >
      Our Services
    </usa-link>
  `,
};

export const UnstyledLink: Story = {
  args: {
    href: '/contact',
    variant: 'unstyled',
  },
  render: (args) => html`
    <usa-link
      href="${args.href}"
      target="${args.target}"
      rel="${args.rel}"
      variant="${args.variant}"
      ?external=${args.external}
      ?unstyled=${args.unstyled}
      aria-label="${args.ariaLabel}"
      download="${args.download}"
    >
      Contact Us (Unstyled)
    </usa-link>
  `,
};

export const DownloadLink: Story = {
  args: {
    href: '/documents/annual-report.pdf',
    download: 'annual-report-2024.pdf',
    ariaLabel: 'Download the 2024 Annual Report PDF',
  },
  render: (args) => html`
    <usa-link
      href="${args.href}"
      target="${args.target}"
      rel="${args.rel}"
      variant="${args.variant}"
      ?external=${args.external}
      ?unstyled=${args.unstyled}
      aria-label="${args.ariaLabel}"
      download="${args.download}"
    >
      <usa-icon name="file_download" decorative class="text-middle"></usa-icon>
      Download Annual Report (PDF)
    </usa-link>
  `,
};

export const NavigationMenu: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="display-flex flex-column gap-1 maxw-mobile-lg">
      <h3>Navigation Menu</h3>

      <usa-link href="/about">About Our Company</usa-link>
      <usa-link href="/services" variant="alt">Services & Programs</usa-link>
      <usa-link href="/news">News & Updates</usa-link>
      <usa-link href="/contact">Contact Information</usa-link>

      <h4>External Resources</h4>
      <usa-link href="https://example.com" variant="external">External Site</usa-link>
      <usa-link href="https://partner.com" variant="external">Partner Portal</usa-link>
      <usa-link href="https://support.com" variant="external">Support Center</usa-link>

      <h4>Downloads</h4>
      <usa-link href="/documents/policy.pdf" download="company-policy.pdf">
        <usa-icon name="file_download" decorative class="text-middle"></usa-icon>
        Download Policy Document
      </usa-link>
      <usa-link href="/forms/application.pdf" download="application-form.pdf">
        <usa-icon name="file_download" decorative class="text-middle"></usa-icon>
        Application Form (PDF)
      </usa-link>
    </div>
  `,
};

export const AccessibilityExample: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="maxw-tablet">
      <h3>Accessibility Features Demo</h3>
      <p>This example shows proper link accessibility patterns for websites.</p>

      <div class="display-flex flex-column gap-05">
        <usa-link href="/application-form" aria-label="Complete the application form online">
          Application Form
        </usa-link>

        <usa-link
          href="https://example.com"
          variant="external"
          aria-label="Visit example.com for more information (opens in new window)"
        >
          Additional Information
        </usa-link>

        <usa-link href="tel:1-800-555-0123" aria-label="Call support at 1-800-555-0123">
          Call Support: 1-800-555-0123
        </usa-link>

        <usa-link
          href="mailto:help@example.com?subject=Assistance Request"
          aria-label="Send email to help desk for assistance"
        >
          Email for Help: help@example.com
        </usa-link>

        <usa-link
          href="/documents/accessibility-policy.pdf"
          download="accessibility-policy.pdf"
          aria-label="Download our accessibility policy document as a PDF file"
        >
          Download Accessibility Policy (PDF, 245 KB)
        </usa-link>
      </div>

      <div class="margin-top-4 padding-2 bg-base-lightest radius-md">
        <h4>Features demonstrated:</h4>
        <ul>
          <li>Descriptive aria-label attributes for context</li>
          <li>External link indicators and security attributes</li>
          <li>File type and size information for downloads</li>
          <li>Keyboard accessibility (try Tab navigation)</li>
          <li>Screen reader friendly link text</li>
          <li>Proper focus indicators</li>
        </ul>
      </div>
    </div>
  `,
};

export const EventHandling: Story = {
  parameters: {
    controls: { disable: true }, // Static demo - no interactive controls needed
  },
  render: () => html`
    <div class="maxw-card-lg">
      <h3>Event Handling Demo</h3>
      <p>Click links to see custom events in the browser console.</p>

      <div class="display-flex flex-column gap-1">
        <usa-link
          href="/internal-page"
          @link-click=${(e: CustomEvent) => {
            console.log('Internal link clicked:', e.detail);
            e.preventDefault(); // Prevent navigation in demo
            alert(`Clicked: ${e.detail.href}`);
          }}
        >
          Internal Link (with event handling)
        </usa-link>

        <usa-link
          href="https://example.com"
          variant="external"
          @link-click=${(e: CustomEvent) => {
            console.log('External link clicked:', e.detail);
            // Don't prevent default for external links in real apps
            alert(`External link: ${e.detail.href}\nWill open in new tab`);
          }}
        >
          External Link (with analytics tracking)
        </usa-link>

        <usa-link
          href="/download/report.pdf"
          download="annual-report.pdf"
          @link-click=${(e: CustomEvent) => {
            console.log('Download link clicked:', e.detail);
            alert(`Download started: ${e.detail.href}`);
          }}
        >
          Download Link (with tracking)
        </usa-link>
      </div>

      <div class="margin-top-2 padding-1 bg-info-lighter radius-md">
        <h4>Event Details Available:</h4>
        <ul>
          <li><code>href</code>: The link destination</li>
          <li><code>target</code>: The target window/frame</li>
          <li><code>external</code>: Boolean indicating external link</li>
          <li><code>event</code>: The original click event</li>
        </ul>
        <p><em>Open browser console to see event details.</em></p>
      </div>
    </div>
  `,
};
