import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './usa-error-template.js';

const meta: Meta = {
  title: 'Templates/Error',
  component: 'usa-error-template',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
The error template provides a minimal layout for error pages (404, 500, etc.).

## Features
- Error code display
- Error title and message
- Return home button
- Optional contact link
- Government banner (optional)

## USWDS Reference
https://designsystem.digital.gov/templates/error-page/
        `,
      },
    },
  },
  argTypes: {
    errorCode: {
      control: 'text',
      description: 'Error code (e.g., 404, 500)',
    },
    errorTitle: {
      control: 'text',
      description: 'Error title',
    },
    errorMessage: {
      control: 'text',
      description: 'Error description',
    },
    homeUrl: {
      control: 'text',
      description: 'Home page URL',
    },
    homeText: {
      control: 'text',
      description: 'Home button text',
    },
    showContact: {
      control: 'boolean',
      description: 'Show contact link',
    },
    contactUrl: {
      control: 'text',
      description: 'Contact page URL',
    },
    contactText: {
      control: 'text',
      description: 'Contact link text',
    },
    showBanner: {
      control: 'boolean',
      description: 'Show government banner',
    },
  },
};

export default meta;
type Story = StoryObj;

export const NotFound404: Story = {
  args: {
    errorCode: '404',
    errorTitle: 'Page not found',
    errorMessage:
      "We couldn't find the page you're looking for. It might have been moved or deleted.",
    homeUrl: '/',
    homeText: 'Return to home',
    showContact: false,
    showBanner: true,
  },
  render: (args) => html`
    <usa-error-template
      error-code="${args.errorCode}"
      error-title="${args.errorTitle}"
      error-message="${args.errorMessage}"
      home-url="${args.homeUrl}"
      home-text="${args.homeText}"
      ?show-contact="${args.showContact}"
      ?show-banner="${args.showBanner}"
    ></usa-error-template>
  `,
};

export const ServerError500: Story = {
  args: {
    errorCode: '500',
    errorTitle: 'Server error',
    errorMessage: 'Something went wrong on our end. Please try again later.',
    homeUrl: '/',
    homeText: 'Return to home',
    showContact: true,
    contactUrl: '/contact',
    contactText: 'Contact support',
    showBanner: true,
  },
  render: (args) => html`
    <usa-error-template
      error-code="${args.errorCode}"
      error-title="${args.errorTitle}"
      error-message="${args.errorMessage}"
      home-url="${args.homeUrl}"
      home-text="${args.homeText}"
      ?show-contact="${args.showContact}"
      contact-url="${args.contactUrl}"
      contact-text="${args.contactText}"
      ?show-banner="${args.showBanner}"
    ></usa-error-template>
  `,
};

export const Forbidden403: Story = {
  args: {
    errorCode: '403',
    errorTitle: 'Access denied',
    errorMessage: "You don't have permission to access this resource.",
    homeUrl: '/',
    homeText: 'Return to home',
    showContact: true,
    contactUrl: '/help',
    contactText: 'Get help',
    helpText: 'If you believe this is an error, please contact support.',
    showBanner: true,
  },
  render: (args) => html`
    <usa-error-template
      error-code="${args.errorCode}"
      error-title="${args.errorTitle}"
      error-message="${args.errorMessage}"
      home-url="${args.homeUrl}"
      home-text="${args.homeText}"
      ?show-contact="${args.showContact}"
      contact-url="${args.contactUrl}"
      contact-text="${args.contactText}"
      help-text="${args.helpText}"
      ?show-banner="${args.showBanner}"
    ></usa-error-template>
  `,
};

export const ServiceUnavailable503: Story = {
  args: {
    errorCode: '503',
    errorTitle: 'Service unavailable',
    errorMessage: 'We are currently undergoing maintenance. Please check back soon.',
    homeUrl: '/',
    homeText: 'Try again',
    showContact: false,
    showBanner: true,
  },
  render: (args) => html`
    <usa-error-template
      error-code="${args.errorCode}"
      error-title="${args.errorTitle}"
      error-message="${args.errorMessage}"
      home-url="${args.homeUrl}"
      home-text="${args.homeText}"
      ?show-contact="${args.showContact}"
      ?show-banner="${args.showBanner}"
    ></usa-error-template>
  `,
};

export const CustomErrorContent: Story = {
  args: {
    showBanner: true,
  },
  render: (args) => html`
    <usa-error-template ?show-banner="${args.showBanner}">
      <div slot="error-content">
        <div class="grid-container usa-section">
          <div class="grid-row grid-gap">
            <div class="tablet:grid-col-8 tablet:grid-offset-2">
              <div class="usa-prose text-center">
                <h1>🔍 Oops! Page Not Found</h1>
                <p class="usa-intro">The page you're looking for seems to have wandered off.</p>
                <p>Here are some helpful links:</p>
                <ul class="usa-list">
                  <li><a href="/" class="usa-link">Home page</a></li>
                  <li><a href="/sitemap" class="usa-link">Site map</a></li>
                  <li><a href="/search" class="usa-link">Search</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </usa-error-template>
  `,
};
