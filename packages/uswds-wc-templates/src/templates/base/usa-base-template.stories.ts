import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './usa-base-template.js';

const meta: Meta = {
  title: 'Templates/Base',
  component: 'usa-base-template',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
The base template provides the foundation structure for all USWDS pages.
It includes skip navigation, government banner, header/footer slots, and identifier.

## Features
- Skip navigation link
- Government banner (optional)
- Header slot
- Main content area
- Footer slot
- Identifier (optional)

## USWDS Reference
https://designsystem.digital.gov/templates/
        `,
      },
    },
  },
  argTypes: {
    lang: {
      control: 'select',
      options: ['en', 'es'],
      description: 'Page language',
    },
    showBanner: {
      control: 'boolean',
      description: 'Show government banner',
    },
    showIdentifier: {
      control: 'boolean',
      description: 'Show identifier at bottom',
    },
    skipText: {
      control: 'text',
      description: 'Skip link text',
    },
    skipHref: {
      control: 'text',
      description: 'Skip link target',
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    showBanner: true,
    showIdentifier: true,
    skipText: 'Skip to main content',
    skipHref: '#main-content',
  },
  render: (args) => html`
    <usa-base-template
      ?show-banner="${args.showBanner}"
      ?show-identifier="${args.showIdentifier}"
      skip-text="${args.skipText}"
      skip-href="${args.skipHref}"
    >
      <div slot="header">
        <div class="usa-header usa-header--basic">
          <div class="usa-nav-container">
            <div class="usa-navbar">
              <div class="usa-logo">
                <em class="usa-logo__text">
                  <a href="/" title="Home">Agency Name</a>
                </em>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div slot="main">
        <div class="grid-container usa-section">
          <h1>Welcome to Our Agency</h1>
          <p class="usa-intro">
            This is the main content area of the page. You can add any content here using the main
            slot.
          </p>
          <p>
            The base template provides the foundational structure for all government websites,
            including skip navigation, government banner, and identifier.
          </p>
        </div>
      </div>
      <div slot="footer">
        <footer class="usa-footer usa-footer--slim">
          <div class="usa-footer__primary-section">
            <div class="usa-footer__primary-container grid-row">
              <div class="mobile-lg:grid-col-8">
                <nav class="usa-footer__nav" aria-label="Footer navigation">
                  <ul class="grid-row grid-gap">
                    <li
                      class="mobile-lg:grid-col-6 desktop:grid-col-auto usa-footer__primary-content"
                    >
                      <a class="usa-footer__primary-link" href="#">About</a>
                    </li>
                    <li
                      class="mobile-lg:grid-col-6 desktop:grid-col-auto usa-footer__primary-content"
                    >
                      <a class="usa-footer__primary-link" href="#">Contact</a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </usa-base-template>
  `,
};

export const WithoutBanner: Story = {
  args: {
    showBanner: false,
    showIdentifier: true,
  },
  render: (args) => html`
    <usa-base-template ?show-banner="${args.showBanner}" ?show-identifier="${args.showIdentifier}">
      <div slot="main">
        <div class="grid-container usa-section">
          <h1>Page Without Banner</h1>
          <p>This page does not show the government banner.</p>
        </div>
      </div>
    </usa-base-template>
  `,
};

export const MinimalTemplate: Story = {
  args: {
    showBanner: false,
    showIdentifier: false,
  },
  render: (args) => html`
    <usa-base-template ?show-banner="${args.showBanner}" ?show-identifier="${args.showIdentifier}">
      <div slot="main">
        <div class="grid-container usa-section">
          <h1>Minimal Template</h1>
          <p>This template shows only the main content without banner or identifier.</p>
        </div>
      </div>
    </usa-base-template>
  `,
};

export const SpanishLanguage: Story = {
  args: {
    lang: 'es',
    showBanner: true,
    showIdentifier: true,
    skipText: 'Saltar al contenido principal',
  },
  render: (args) => html`
    <usa-base-template
      lang="${args.lang}"
      ?show-banner="${args.showBanner}"
      ?show-identifier="${args.showIdentifier}"
      skip-text="${args.skipText}"
    >
      <div slot="main">
        <div class="grid-container usa-section">
          <h1>Bienvenido</h1>
          <p>Esta página está en español.</p>
        </div>
      </div>
    </usa-base-template>
  `,
};
