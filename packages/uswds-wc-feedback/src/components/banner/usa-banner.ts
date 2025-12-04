import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { USWDSBaseComponent } from '@uswds-wc/core';
import { initializeBanner } from './usa-banner-behavior.js';

// Import official USWDS compiled CSS
import '@uswds-wc/core/styles.css';

/**
 * USA Banner Web Component
 *
 * Official government website banner that identifies the site as an official U.S. government website.
 * Required on all .gov websites. Uses USWDS-mirrored behavior pattern for 100% behavioral parity.
 *
 * @element usa-banner
 *
 * @attr {string} flagImageSrc - URL for the U.S. flag image. Defaults to '/img/us_flag_small.png'.
 * @attr {string} flagImageAlt - Alt text for flag image. Defaults to 'U.S. flag'.
 * @attr {string} dotGovIconSrc - URL for .gov icon. Defaults to '/img/icon-dot-gov.svg'.
 * @attr {string} httpsIconSrc - URL for HTTPS lock icon. Defaults to '/img/icon-https.svg'.
 * @attr {string} headerText - Banner header text. Defaults to 'An official website of the United States government'.
 * @attr {string} actionText - Expandable action text. Defaults to "Here's how you know".
 * @attr {boolean} expanded - Whether the banner details are expanded.
 *
 * @fires banner-toggle - Dispatched when banner is expanded or collapsed. Detail: { expanded: boolean }
 *
 * @example
 * ```html
 * <!-- Default banner (required on .gov sites) -->
 * <usa-banner></usa-banner>
 *
 * <!-- Banner with custom images -->
 * <usa-banner
 *   flagImageSrc="/assets/us-flag.png"
 *   dotGovIconSrc="/assets/dot-gov.svg"
 *   httpsIconSrc="/assets/https.svg"
 * ></usa-banner>
 *
 * <!-- Pre-expanded banner -->
 * <usa-banner expanded></usa-banner>
 *
 * <!-- Banner with event handling -->
 * <usa-banner @banner-toggle=${(e) => console.log('Banner toggled:', e.detail.expanded)}></usa-banner>
 * ```
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 * @see usa-banner-behavior.ts - USWDS behavior mirror
 *
 * @uswds-js-reference https://github.com/uswds/uswds/tree/develop/packages/usa-banner/src/index.js
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-banner/src/styles/_usa-banner.scss
 * @uswds-docs https://designsystem.digital.gov/components/banner/
 * @uswds-guidance https://designsystem.digital.gov/components/banner/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/banner/#accessibility
 */
@customElement('usa-banner')
export class USABanner extends USWDSBaseComponent {
  // NOTE: static styles do NOT apply in Light DOM (createRenderRoot returns this)
  // The component uses USWDS CSS classes which handle all styling

  @property({ type: String })
  flagImageSrc = '/img/us_flag_small.png';

  @property({ type: String })
  flagImageAlt = 'U.S. flag';

  @property({ type: String })
  dotGovIconSrc = '/img/icon-dot-gov.svg';

  @property({ type: String })
  httpsIconSrc = '/img/icon-https.svg';

  @property({ type: String })
  headerText = 'An official website of the United States government';

  @property({ type: String })
  actionText = "Here's how you know";

  @property({ type: Boolean, reflect: true })
  expanded = false;

  // Store cleanup function from behavior
  private cleanup?: () => void;
  private mutationObserver?: MutationObserver;
  private isUpdatingFromMutation = false;

  override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('data-web-component-managed', 'true');
  }

  override async firstUpdated(changedProperties: Map<string, any>) {
    // ARCHITECTURE: Script Tag Pattern
    // USWDS is loaded globally via script tag in .storybook/preview-head.html
    // Components just render HTML - USWDS enhances automatically via window.USWDS

    // ARCHITECTURE: USWDS-Mirrored Behavior Pattern
    // Uses dedicated behavior file (usa-banner-behavior.ts) that replicates USWDS source exactly

    super.firstUpdated(changedProperties);

    // Wait for DOM to be fully rendered
    await this.updateComplete;
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));

    // CRITICAL: Set hidden attribute on content BEFORE initializing behavior
    // This ensures content starts hidden, then behavior manages it based on expanded state
    const content = this.querySelector('.usa-banner__content');
    if (content && !this.expanded) {
      content.setAttribute('hidden', '');
    }

    // Use mirrored behavior for 100% USWDS parity (avoids timing issues with global init)
    this.cleanup = initializeBanner(this);

    // Watch for aria-expanded changes from behavior and sync component property
    const button = this.querySelector('.usa-banner__button');
    if (button) {
      this.mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'aria-expanded') {
            const newExpanded = button.getAttribute('aria-expanded') === 'true';
            if (this.expanded !== newExpanded && !this.isUpdatingFromMutation) {
              this.isUpdatingFromMutation = true;
              this.expanded = newExpanded;
              this.dispatchEvent(
                new CustomEvent('banner-toggle', {
                  detail: { expanded: newExpanded },
                  bubbles: true,
                  composed: true,
                })
              );
              this.isUpdatingFromMutation = false;
            }
          }
        });
      });

      this.mutationObserver.observe(button, {
        attributes: true,
        attributeFilter: ['aria-expanded'],
      });
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanup?.();
    this.mutationObserver?.disconnect();
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    // Handle programmatic expanded property changes (but not from mutation observer)
    if (changedProperties.has('expanded') && !this.isUpdatingFromMutation) {
      const button = this.querySelector('.usa-banner__button') as HTMLElement;
      const content = this.querySelector('.usa-banner__content') as HTMLElement;
      const header = this.querySelector('.usa-banner__header') as HTMLElement;

      if (button && content && header) {
        // Sync ARIA expanded attribute
        button.setAttribute('aria-expanded', String(this.expanded));

        // Sync hidden attribute
        if (this.expanded) {
          content.removeAttribute('hidden');
          header.classList.add('usa-banner__header--expanded');
        } else {
          content.setAttribute('hidden', '');
          header.classList.remove('usa-banner__header--expanded');
        }
      }
    }
  }

  override render() {
    return html`
      <div class="usa-banner">
        <div class="usa-accordion">
          <header class="usa-banner__header ${this.expanded ? 'usa-banner__header--expanded' : ''}">
            <div class="usa-banner__inner">
              <div class="grid-col-auto">
                <img
                  class="usa-banner__header-flag"
                  src="${this.flagImageSrc}"
                  alt="${this.flagImageAlt}"
                />
              </div>
              <div class="grid-col-fill tablet:grid-col-auto">
                <p class="usa-banner__header-text">${this.headerText}</p>
                <p class="usa-banner__header-action" aria-hidden="true">${this.actionText}</p>
              </div>
              <button
                class="usa-accordion__button usa-banner__button"
                aria-expanded="${this.expanded}"
                aria-controls="gov-banner-default"
              >
                <span class="usa-banner__button-text">${this.actionText}</span>
              </button>
            </div>
          </header>
          <div class="usa-banner__content usa-accordion__content" id="gov-banner-default">
            <div class="grid-row grid-gap-lg">
              <div class="usa-banner__guidance tablet:grid-col-6">
                <img
                  class="usa-banner__icon usa-media-block__img"
                  src="${this.dotGovIconSrc}"
                  role="img"
                  alt="Dot gov"
                />
                <div class="usa-media-block__body">
                  <p>
                    <strong>Official websites use .gov</strong><br />
                    A <strong>.gov</strong> website belongs to an official government organization
                    in the United States.
                  </p>
                </div>
              </div>
              <div class="usa-banner__guidance tablet:grid-col-6">
                <img
                  class="usa-banner__icon usa-media-block__img"
                  src="${this.httpsIconSrc}"
                  role="img"
                  alt="Https"
                />
                <div class="usa-media-block__body">
                  <p>
                    <strong>Secure .gov websites use HTTPS</strong><br />
                    A <strong>lock</strong> (
                    <span class="icon-lock"
                      ><svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="52"
                        height="64"
                        viewBox="0 0 52 64"
                        class="usa-banner__lock-image"
                        role="img"
                        aria-labelledby="banner-lock-title banner-lock-description"
                      >
                        <title id="banner-lock-title">Lock</title>
                        <desc id="banner-lock-description">A locked padlock</desc>
                        <path
                          fill="#000000"
                          fill-rule="evenodd"
                          d="M26 0c10.493 0 19 8.507 19 19v9h3a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V32a4 4 0 0 1 4-4h3v-9C7 8.507 15.507 0 26 0zm0 8c-5.979 0-10.843 4.77-10.996 10.712L15 19v9h22v-9c0-6.075-4.925-11-11-11z"
                        /></svg></span
                    >) or <strong>https://</strong> means you've safely connected to the .gov
                    website. Share sensitive information only on official, secure websites.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
