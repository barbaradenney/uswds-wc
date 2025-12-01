import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './usa-landing-template.js';

const meta: Meta = {
  title: 'Templates/Landing',
  component: 'usa-landing-template',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
The landing template provides a hero-focused layout for landing pages.

## Features
- Hero section with callout
- Tagline section
- Graphics list (dark background)
- Call-to-action section
- Government banner and identifier

## USWDS Reference
https://designsystem.digital.gov/templates/landing-page/
        `,
      },
    },
  },
  argTypes: {
    heroHeading: {
      control: 'text',
      description: 'Hero heading text',
    },
    heroHeadingAccent: {
      control: 'text',
      description: 'Hero heading accent (smaller text)',
    },
    heroDescription: {
      control: 'text',
      description: 'Hero description text',
    },
    heroCtaText: {
      control: 'text',
      description: 'Hero button text',
    },
    heroCtaUrl: {
      control: 'text',
      description: 'Hero button URL',
    },
    taglineHeading: {
      control: 'text',
      description: 'Tagline heading',
    },
    taglineDescription: {
      control: 'text',
      description: 'Tagline description',
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

export const Default: Story = {
  args: {
    heroHeading: 'Bring attention to a project priority',
    heroHeadingAccent: 'Hero callout:',
    heroDescription:
      'Support the callout with some short explanatory text. You don\'t need more than a couple of sentences.',
    heroCtaText: 'Call to action',
    heroCtaUrl: '#',
    taglineHeading: 'A tagline highlights your approach',
    taglineDescription:
      'The tagline should inspire confidence and interest, focusing on the value that your overall approach offers to your audience.',
    ctaHeading: 'Section heading',
    ctaDescription:
      'Everything up to this point should help people understand your agency or project. Use this section to encourage them to act.',
    ctaButtonText: 'Call to action',
    ctaButtonUrl: '#',
    showBanner: true,
    showIdentifier: true,
  },
  render: (args) => html`
    <usa-landing-template
      hero-heading="${args.heroHeading}"
      hero-heading-accent="${args.heroHeadingAccent}"
      hero-description="${args.heroDescription}"
      hero-cta-text="${args.heroCtaText}"
      hero-cta-url="${args.heroCtaUrl}"
      tagline-heading="${args.taglineHeading}"
      tagline-description="${args.taglineDescription}"
      cta-heading="${args.ctaHeading}"
      cta-description="${args.ctaDescription}"
      cta-button-text="${args.ctaButtonText}"
      cta-button-url="${args.ctaButtonUrl}"
      ?show-banner="${args.showBanner}"
      ?show-identifier="${args.showIdentifier}"
    ></usa-landing-template>
  `,
};

export const WithGraphics: Story = {
  args: {
    heroHeading: 'Welcome to Our Agency',
    heroDescription: 'We serve the American public with dedication and excellence.',
    heroCtaText: 'Learn More',
    taglineHeading: 'Our Mission',
    taglineDescription: 'We are committed to transparency, efficiency, and public service.',
    showBanner: true,
    showIdentifier: true,
  },
  render: (args) => {
    const graphics = [
      {
        heading: 'Transparency',
        description: 'We believe in open government and clear communication.',
        imageSrc: 'https://designsystem.digital.gov/img/circle-124.png',
        imageAlt: 'Transparency icon',
      },
      {
        heading: 'Efficiency',
        description: 'We work to streamline processes and reduce waste.',
        imageSrc: 'https://designsystem.digital.gov/img/circle-124.png',
        imageAlt: 'Efficiency icon',
      },
      {
        heading: 'Innovation',
        description: 'We embrace new technologies and approaches.',
        imageSrc: 'https://designsystem.digital.gov/img/circle-124.png',
        imageAlt: 'Innovation icon',
      },
      {
        heading: 'Service',
        description: 'We put the public first in everything we do.',
        imageSrc: 'https://designsystem.digital.gov/img/circle-124.png',
        imageAlt: 'Service icon',
      },
    ];

    return html`
      <usa-landing-template
        hero-heading="${args.heroHeading}"
        hero-description="${args.heroDescription}"
        hero-cta-text="${args.heroCtaText}"
        tagline-heading="${args.taglineHeading}"
        tagline-description="${args.taglineDescription}"
        .graphics="${graphics}"
        ?show-banner="${args.showBanner}"
        ?show-identifier="${args.showIdentifier}"
      ></usa-landing-template>
    `;
  },
};

export const CustomHero: Story = {
  args: {
    showBanner: true,
    showIdentifier: true,
  },
  render: (args) => html`
    <usa-landing-template ?show-banner="${args.showBanner}" ?show-identifier="${args.showIdentifier}">
      <section slot="hero" class="usa-hero" style="background-image: url('https://designsystem.digital.gov/img/hero.png')">
        <div class="grid-container">
          <div class="usa-hero__callout">
            <h1 class="usa-hero__heading">
              <span class="usa-hero__heading--alt">Custom Hero:</span>
              This is a custom slotted hero section
            </h1>
            <p>You can provide your own hero content using the hero slot.</p>
            <a class="usa-button" href="#">Custom Button</a>
          </div>
        </div>
      </section>
    </usa-landing-template>
  `,
};

export const HeroOnly: Story = {
  args: {
    heroHeading: 'Simple Landing Page',
    heroDescription: 'Sometimes less is more. This landing page focuses on a single message.',
    heroCtaText: 'Get Started',
    showBanner: true,
    showIdentifier: true,
  },
  render: (args) => html`
    <usa-landing-template
      hero-heading="${args.heroHeading}"
      hero-description="${args.heroDescription}"
      hero-cta-text="${args.heroCtaText}"
      ?show-banner="${args.showBanner}"
      ?show-identifier="${args.showIdentifier}"
    ></usa-landing-template>
  `,
};
