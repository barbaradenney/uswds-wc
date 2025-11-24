import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import '@uswds-wc/layout';
import type { USAFooter, FooterSection } from './usa-footer.js';

const meta: Meta<USAFooter> = {
  title: 'Navigation/Footer',
  component: 'usa-footer',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The USWDS footer provides consistent site information and links across websites. It supports multiple variants (slim, medium, big) and includes sections for navigation links and agency information.

## Important: Footer + Identifier Architecture

**The footer and identifier are separate components in USWDS:**
- \`<usa-footer>\` - Contains navigation links and agency contact information
- \`<usa-identifier>\` - The black section with agency identification and required links

**Correct Usage:**
\`\`\`html
<usa-footer variant="medium" agencyName="Example Agency" .sections=\${sections}></usa-footer>
<usa-identifier domain="example.gov" agency="Example Agency"></usa-identifier>
\`\`\`

**Why Separate?** The identifier can be used on any page (not just with footers), and keeping them separate follows USWDS architecture and prevents spacing issues.

This web component implementation maintains full USWDS compliance while providing a modern custom element API.
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['slim', 'medium', 'big'],
      description: 'Footer size variant',
    },
    agencyName: {
      control: 'text',
      description: 'Name of the organization',
    },
    sections: {
      control: 'object',
      description: 'Array of footer navigation sections with links',
    },
  },
};

export default meta;
type Story = StoryObj<USAFooter>;

// Sample data for stories
const basicSections: FooterSection[] = [
  {
    title: 'About',
    links: [
      { label: 'Our Mission', href: '/about/mission' },
      { label: 'Leadership', href: '/about/leadership' },
      { label: 'History', href: '/about/history' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Digital Services', href: '/services/digital' },
      { label: 'Consulting', href: '/services/consulting' },
      { label: 'Training', href: '/services/training' },
    ],
  },
];

const extendedSections: FooterSection[] = [
  {
    title: 'About Us',
    links: [
      { label: 'Our Mission', href: '/about/mission' },
      { label: 'Leadership', href: '/about/leadership' },
      { label: 'History', href: '/about/history' },
      { label: 'Careers', href: '/about/careers' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Digital Services', href: '/services/digital' },
      { label: 'Consulting', href: '/services/consulting' },
      { label: 'Training', href: '/services/training' },
      { label: 'Support', href: '/services/support' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/resources/docs' },
      { label: 'Downloads', href: '/resources/downloads' },
      { label: 'FAQ', href: '/resources/faq' },
    ],
  },
  {
    title: 'Contact',
    links: [
      { label: 'Contact Us', href: '/contact' },
      { label: 'Office Locations', href: '/contact/locations' },
      { label: 'Media Inquiries', href: '/contact/media' },
    ],
  },
];

export const Default: Story = {
  args: {
    variant: 'medium',
    agencyName: 'Example Organization',
    sections: basicSections,
  },
  render: (args) => html`
    <usa-footer
      .variant=${args.variant}
      .agencyName=${args.agencyName}
      .sections=${args.sections}
    ></usa-footer>

    <usa-identifier
      domain="example.gov"
      agency="Example Organization"
      .requiredLinks=${[
        { href: '/about', text: 'About Us' },
        { href: '/accessibility', text: 'Accessibility support' },
        { href: '/privacy', text: 'Privacy policy' },
        { href: '/foia', text: 'FOIA requests' },
      ]}
    ></usa-identifier>
  `,
};

export const Slim: Story = {
  args: {
    variant: 'slim',
    agencyName: 'Organization Name',
    sections: [],
  },
  render: (args) => html`
    <usa-footer
      .variant=${args.variant}
      .agencyName=${args.agencyName}
      .sections=${args.sections}
    ></usa-footer>

    <usa-identifier
      domain="organization.gov"
      agency="Organization Name"
      .requiredLinks=${[
        { href: '/about', text: 'About Us' },
        { href: '/privacy', text: 'Privacy policy' },
        { href: '/contact', text: 'Contact' },
      ]}
    ></usa-identifier>
  `,
};

export const Medium: Story = {
  args: {
    variant: 'medium',
    agencyName: 'Example Corporation',
    sections: basicSections,
  },
  render: (args) => html`
    <usa-footer
      .variant=${args.variant}
      .agencyName=${args.agencyName}
      .sections=${args.sections}
    ></usa-footer>

    <usa-identifier
      domain="example.gov"
      agency="Example Corporation"
      .requiredLinks=${[
        { href: '/about', text: 'About Us' },
        { href: '/accessibility', text: 'Accessibility support' },
        { href: '/privacy', text: 'Privacy policy' },
        { href: '/foia', text: 'FOIA requests' },
        { href: '/no-fear-act', text: 'No FEAR Act data' },
        { href: '/inspector-general', text: 'Office of the Inspector General' },
      ]}
    ></usa-identifier>
  `,
};

export const Big: Story = {
  args: {
    variant: 'big',
    agencyName: 'Example Web Services Inc',
    sections: extendedSections,
  },
  render: (args) => html`
    <usa-footer
      .variant=${args.variant}
      .agencyName=${args.agencyName}
      .sections=${args.sections}
    ></usa-footer>

    <usa-identifier
      domain="example-services.gov"
      agency="Example Web Services Inc"
      .requiredLinks=${[
        { href: '/about', text: 'About Us' },
        { href: '/accessibility', text: 'Accessibility support' },
        { href: '/privacy', text: 'Privacy policy' },
        { href: '/foia', text: 'FOIA requests' },
        { href: '/no-fear-act', text: 'No FEAR Act data' },
        { href: '/inspector-general', text: 'Office of the Inspector General' },
        { href: '/performance', text: 'Performance reports' },
      ]}
    ></usa-identifier>
  `,
};

export const MinimalFooter: Story = {
  args: {
    variant: 'slim',
    agencyName: 'Simple Organization',
    sections: [],
  },
  render: (args) => html`
    <usa-footer
      .variant=${args.variant}
      .agencyName=${args.agencyName}
      .sections=${args.sections}
    ></usa-footer>

    <usa-identifier
      domain="simple.gov"
      agency="Simple Organization"
      .requiredLinks=${[{ href: '/privacy', text: 'Privacy policy' }]}
    ></usa-identifier>
  `,
};

export const FooterOnly: Story = {
  args: {
    variant: 'medium',
    agencyName: 'Test Organization',
    sections: basicSections,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Footer without an identifier component. The identifier is optional and can be omitted.',
      },
    },
  },
};

export const NavigationOnly: Story = {
  args: {
    variant: 'medium',
    agencyName: '',
    sections: basicSections,
  },
  parameters: {
    docs: {
      description: {
        story: 'Footer with navigation only, no agency name or identifier.',
      },
    },
  },
};

export const IdentifierOnly: Story = {
  render: () => html`
    <usa-identifier
      domain="identifier-only.gov"
      agency="Identifier Only Organization"
      .requiredLinks=${[
        { href: '/about', text: 'About Us' },
        { href: '/accessibility', text: 'Accessibility support' },
        { href: '/privacy', text: 'Privacy policy' },
        { href: '/foia', text: 'FOIA requests' },
        { href: '/no-fear-act', text: 'No FEAR Act data' },
        { href: '/inspector-general', text: 'Office of the Inspector General' },
      ]}
    ></usa-identifier>
  `,
  parameters: {
    docs: {
      description: {
        story:
          'Identifier component used independently without a footer. This demonstrates that the identifier can be used on any page, not just with footers.',
      },
    },
  },
};

export const ComplexFooter: Story = {
  args: {
    variant: 'big',
    agencyName: 'Comprehensive Services Corporation',
    sections: extendedSections,
  },
  render: (args) => html`
    <usa-footer
      .variant=${args.variant}
      .agencyName=${args.agencyName}
      .sections=${args.sections}
    ></usa-footer>

    <usa-identifier
      domain="comprehensive-services.gov"
      agency="Comprehensive Services Corporation"
      .requiredLinks=${[
        { href: '/about', text: 'About Us' },
        { href: '/accessibility', text: 'Accessibility support' },
        { href: '/privacy', text: 'Privacy policy' },
        { href: '/foia', text: 'FOIA requests' },
        { href: '/no-fear-act', text: 'No FEAR Act data' },
        { href: '/inspector-general', text: 'Office of the Inspector General' },
        { href: '/performance', text: 'Performance reports' },
        { href: '/budget', text: 'Budget and performance' },
      ]}
    ></usa-identifier>
  `,
};

export const SingleSection: Story = {
  args: {
    variant: 'medium',
    agencyName: 'Single Section Organization',
    sections: [
      {
        title: 'Quick Links',
        links: [
          { label: 'Home', href: '/' },
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' },
        ],
      },
    ],
  },
  render: (args) => html`
    <usa-footer
      .variant=${args.variant}
      .agencyName=${args.agencyName}
      .sections=${args.sections}
    ></usa-footer>

    <usa-identifier
      domain="single-section.gov"
      agency="Single Section Organization"
      .requiredLinks=${[
        { href: '/privacy', text: 'Privacy policy' },
        { href: '/terms', text: 'Terms of service' },
      ]}
    ></usa-identifier>
  `,
};

export const InteractiveDemo: Story = {
  args: {
    variant: 'big',
    agencyName: 'Interactive Demo Organization',
    sections: extendedSections,
  },
  render: (args) => html`
    <usa-footer
      .variant=${args.variant}
      .agencyName=${args.agencyName}
      .sections=${args.sections}
      @footer-link-click=${(e: CustomEvent) => {
        console.log('Footer link clicked:', e.detail);
        alert(`Footer link clicked: ${e.detail.label} (${e.detail.href})`);
        e.preventDefault(); // Prevent navigation in Storybook
      }}
    >
      <div class="bg-base-lightest padding-1 margin-y-1 text-center radius-md">
        <strong>Custom Footer Content Slot</strong>
        <p>This content is inserted via the default slot and can include any custom HTML.</p>
      </div>
    </usa-footer>

    <usa-identifier
      domain="interactive-demo.gov"
      agency="Interactive Demo Organization"
      .requiredLinks=${[
        { href: '/about', text: 'About Us' },
        { href: '/accessibility', text: 'Accessibility support' },
        { href: '/privacy', text: 'Privacy policy' },
        { href: '/foia', text: 'FOIA requests' },
        { href: '/no-fear-act', text: 'No FEAR Act data' },
        { href: '/inspector-general', text: 'Office of the Inspector General' },
      ]}
      @link-click=${(e: CustomEvent) => {
        console.log('Identifier link clicked:', e.detail);
        alert(`Identifier link clicked: ${e.detail.text} (${e.detail.href})`);
        e.preventDefault();
      }}
    ></usa-identifier>

    <div class="margin-top-4 padding-2 bg-primary-lighter radius-md">
      <h3>Footer + Identifier Testing Guide</h3>
      <p>Try these interactions:</p>
      <ul>
        <li>Click any footer link to see the footer custom event</li>
        <li>Click any identifier link to see the identifier custom event</li>
        <li>Use keyboard navigation (Tab, Enter)</li>
        <li>Test with different screen sizes</li>
        <li>Verify accessibility with screen readers</li>
        <li>Check footer variants in the controls panel</li>
      </ul>

      <h4>USWDS Footer Variants:</h4>
      <ul>
        <li><strong>Slim:</strong> Minimal footer with identifier links only</li>
        <li><strong>Medium:</strong> Standard footer with navigation sections</li>
        <li><strong>Big:</strong> Extended footer with multiple navigation sections</li>
      </ul>

      <h4>Important Architecture Note:</h4>
      <p>
        The <code>&lt;usa-identifier&gt;</code> is a separate component from
        <code>&lt;usa-footer&gt;</code>. They should be placed one after another on the page, not
        nested.
      </p>
    </div>
  `,
};

export const CustomContent: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Demonstrates using the default slot for custom content.',
      },
    },
  },
  render: () => html`
    <usa-footer>
      <p>This is custom slotted content.</p>
      <p>Slots allow you to provide your own HTML content to the component.</p>
    </usa-footer>
  `,
};
