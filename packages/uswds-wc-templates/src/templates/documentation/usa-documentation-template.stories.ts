import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './usa-documentation-template.js';

const meta: Meta = {
  title: 'Templates/Documentation',
  component: 'usa-documentation-template',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
The documentation template provides a layout with side navigation for documentation pages.

## Features
- Side navigation (left or right)
- Responsive design (sidenav moves below content on mobile)
- Breadcrumb slot
- Prose styling for content
- Government banner and identifier

## USWDS Reference
https://designsystem.digital.gov/templates/documentation-page/
        `,
      },
    },
  },
  argTypes: {
    sidenavPosition: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Side navigation position',
    },
    contentWidth: {
      control: 'select',
      options: ['narrow', 'wide'],
      description: 'Content column width',
    },
    showBanner: {
      control: 'boolean',
      description: 'Show government banner',
    },
    showIdentifier: {
      control: 'boolean',
      description: 'Show identifier',
    },
  },
};

export default meta;
type Story = StoryObj;

const sampleNavItems = [
  { label: 'Overview', href: '#overview', current: true },
  {
    label: 'Getting Started',
    href: '#getting-started',
    subnav: [
      { label: 'Installation', href: '#installation' },
      { label: 'Configuration', href: '#configuration' },
    ],
  },
  { label: 'Components', href: '#components' },
  { label: 'Patterns', href: '#patterns' },
  { label: 'Templates', href: '#templates' },
];

export const Default: Story = {
  args: {
    sidenavPosition: 'left',
    contentWidth: 'wide',
    showBanner: true,
    showIdentifier: true,
  },
  render: (args) => html`
    <usa-documentation-template
      sidenav-position="${args.sidenavPosition}"
      content-width="${args.contentWidth}"
      .navItems="${sampleNavItems}"
      ?show-banner="${args.showBanner}"
      ?show-identifier="${args.showIdentifier}"
    >
      <article slot="content">
        <h1 id="overview">Documentation Overview</h1>
        <p class="usa-intro">
          Welcome to our documentation. This template provides a clean layout for
          technical documentation with side navigation.
        </p>

        <h2 id="getting-started">Getting Started</h2>
        <p>
          To get started, follow the installation instructions below. Our documentation
          is organized into sections that cover all aspects of the system.
        </p>

        <h3 id="installation">Installation</h3>
        <p>Install the package using npm:</p>
        <pre><code>npm install @uswds/web-components</code></pre>

        <h3 id="configuration">Configuration</h3>
        <p>
          Configure your project by adding the following to your configuration file.
          Make sure to include all required dependencies.
        </p>

        <h2 id="components">Components</h2>
        <p>
          Our component library includes a variety of reusable UI elements that follow
          USWDS design patterns.
        </p>

        <h2 id="patterns">Patterns</h2>
        <p>
          Patterns combine multiple components to solve common design problems such as
          form layouts and navigation structures.
        </p>
      </article>
    </usa-documentation-template>
  `,
};

export const WithBreadcrumb: Story = {
  args: {
    showBanner: true,
    showIdentifier: true,
  },
  render: (args) => html`
    <usa-documentation-template
      .navItems="${sampleNavItems}"
      ?show-banner="${args.showBanner}"
      ?show-identifier="${args.showIdentifier}"
    >
      <nav slot="breadcrumb" class="usa-breadcrumb" aria-label="Breadcrumbs">
        <ol class="usa-breadcrumb__list">
          <li class="usa-breadcrumb__list-item">
            <a href="/" class="usa-breadcrumb__link">Home</a>
          </li>
          <li class="usa-breadcrumb__list-item">
            <a href="/docs" class="usa-breadcrumb__link">Documentation</a>
          </li>
          <li class="usa-breadcrumb__list-item usa-current" aria-current="page">
            <span>Getting Started</span>
          </li>
        </ol>
      </nav>
      <article slot="content">
        <h1>Getting Started Guide</h1>
        <p class="usa-intro">
          This guide will help you get up and running with our system.
        </p>
        <p>
          Follow the steps below to complete the initial setup. If you encounter
          any issues, please refer to our troubleshooting section.
        </p>
      </article>
    </usa-documentation-template>
  `,
};

export const SidenavRight: Story = {
  args: {
    sidenavPosition: 'right',
    showBanner: true,
    showIdentifier: true,
  },
  render: (args) => html`
    <usa-documentation-template
      sidenav-position="${args.sidenavPosition}"
      .navItems="${sampleNavItems}"
      ?show-banner="${args.showBanner}"
      ?show-identifier="${args.showIdentifier}"
    >
      <article slot="content">
        <h1>Documentation with Right Sidenav</h1>
        <p class="usa-intro">
          This layout places the side navigation on the right side of the content.
        </p>
        <p>
          This can be useful when the primary focus should be on the content, with
          navigation available as a secondary element.
        </p>
      </article>
    </usa-documentation-template>
  `,
};

export const NarrowContent: Story = {
  args: {
    contentWidth: 'narrow',
    showBanner: true,
    showIdentifier: true,
  },
  render: (args) => html`
    <usa-documentation-template
      content-width="${args.contentWidth}"
      .navItems="${sampleNavItems}"
      ?show-banner="${args.showBanner}"
      ?show-identifier="${args.showIdentifier}"
    >
      <article slot="content">
        <h1>Narrow Content Layout</h1>
        <p class="usa-intro">
          This layout uses a narrower content column for improved readability.
        </p>
        <p>
          Long-form content often benefits from narrower line lengths, making it
          easier for users to read and follow along.
        </p>
      </article>
    </usa-documentation-template>
  `,
};

export const CustomSidenav: Story = {
  args: {
    showBanner: true,
    showIdentifier: true,
  },
  render: (args) => html`
    <usa-documentation-template
      ?show-banner="${args.showBanner}"
      ?show-identifier="${args.showIdentifier}"
    >
      <nav slot="sidenav" aria-label="Documentation sections">
        <ul class="usa-sidenav">
          <li class="usa-sidenav__item">
            <a href="#" class="usa-current">Current Page</a>
          </li>
          <li class="usa-sidenav__item">
            <a href="#">Another Section</a>
            <ul class="usa-sidenav__sublist">
              <li class="usa-sidenav__item">
                <a href="#">Sub-item 1</a>
              </li>
              <li class="usa-sidenav__item">
                <a href="#">Sub-item 2</a>
              </li>
            </ul>
          </li>
          <li class="usa-sidenav__item">
            <a href="#">External Link</a>
          </li>
        </ul>
      </nav>
      <article slot="content">
        <h1>Custom Side Navigation</h1>
        <p class="usa-intro">
          This example shows how to use a custom sidenav slot for complete control
          over the navigation structure.
        </p>
      </article>
    </usa-documentation-template>
  `,
};

export const APIDocumentation: Story = {
  args: {
    showBanner: true,
    showIdentifier: true,
  },
  render: (args) => {
    const apiNavItems = [
      { label: 'Introduction', href: '#intro', current: true },
      {
        label: 'Authentication',
        href: '#auth',
        subnav: [
          { label: 'API Keys', href: '#api-keys' },
          { label: 'OAuth 2.0', href: '#oauth' },
        ],
      },
      {
        label: 'Endpoints',
        href: '#endpoints',
        subnav: [
          { label: 'Users', href: '#users' },
          { label: 'Resources', href: '#resources' },
        ],
      },
      { label: 'Error Handling', href: '#errors' },
      { label: 'Rate Limits', href: '#rate-limits' },
    ];

    return html`
      <usa-documentation-template
        .navItems="${apiNavItems}"
        ?show-banner="${args.showBanner}"
        ?show-identifier="${args.showIdentifier}"
      >
        <article slot="content">
          <h1 id="intro">API Reference</h1>
          <p class="usa-intro">
            Complete reference documentation for our REST API.
          </p>

          <h2 id="auth">Authentication</h2>
          <p>
            All API requests require authentication. Choose from the following methods:
          </p>

          <h3 id="api-keys">API Keys</h3>
          <p>
            Include your API key in the request header:
          </p>
          <pre><code>Authorization: Bearer YOUR_API_KEY</code></pre>

          <h3 id="oauth">OAuth 2.0</h3>
          <p>
            For user-specific operations, use OAuth 2.0 authorization flow.
          </p>

          <h2 id="endpoints">API Endpoints</h2>
          <p>
            Below you'll find detailed documentation for each API endpoint.
          </p>

          <h3 id="users">Users Endpoint</h3>
          <p>
            <code>GET /api/v1/users</code> - List all users
          </p>
          <p>
            <code>POST /api/v1/users</code> - Create a new user
          </p>

          <h3 id="resources">Resources Endpoint</h3>
          <p>
            <code>GET /api/v1/resources</code> - List all resources
          </p>

          <h2 id="errors">Error Handling</h2>
          <p>
            The API uses standard HTTP response codes to indicate success or failure.
          </p>

          <h2 id="rate-limits">Rate Limits</h2>
          <p>
            API requests are limited to 1000 requests per hour per API key.
          </p>
        </article>
      </usa-documentation-template>
    `;
  },
};

export const MinimalDocumentation: Story = {
  args: {
    showBanner: false,
    showIdentifier: false,
  },
  render: (args) => html`
    <usa-documentation-template
      ?show-banner="${args.showBanner}"
      ?show-identifier="${args.showIdentifier}"
    >
      <article slot="content">
        <h1>Minimal Documentation Page</h1>
        <p class="usa-intro">
          A documentation page without government banner, identifier, or sidenav.
        </p>
        <p>
          This is useful for internal documentation or simple help pages where
          the full template structure is not needed.
        </p>
      </article>
    </usa-documentation-template>
  `,
};
