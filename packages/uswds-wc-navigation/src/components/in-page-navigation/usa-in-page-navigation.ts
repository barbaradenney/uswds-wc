import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { USWDSBaseComponent } from '@uswds-wc/core';
import { initializeInPageNavigation } from './usa-in-page-navigation-behavior.js';

// Import official USWDS compiled CSS

/**
 * USA In-Page Navigation Web Component
 *
 * Minimal wrapper around USWDS in-page navigation functionality.
 * Uses USWDS-mirrored behavior pattern for 100% behavioral parity.
 *
 * @element usa-in-page-navigation
 * @fires nav-click - Dispatched when a navigation item is clicked
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-js-reference https://github.com/uswds/uswds/tree/develop/packages/usa-in-page-navigation/src/index.js
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-in-page-navigation/src/styles/_usa-in-page-navigation.scss
 * @uswds-docs https://designsystem.digital.gov/components/in-page-navigation/
 * @uswds-guidance https://designsystem.digital.gov/components/in-page-navigation/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/in-page-navigation/#accessibility
 */

/**
 * Represents a navigation item
 */
export interface InPageNavItem {
  id: string;
  text: string;
  href: string;
  level?: number;
  children?: InPageNavItem[];
}

/**
 * Represents a section for manual navigation
 */
export interface InPageNavSection {
  id: string;
  label: string;
}

@customElement('usa-in-page-navigation')
export class USAInPageNavigation extends USWDSBaseComponent {
  static override styles = css`
    :host {
      display: block;
    }
    :host([hidden]) {
      display: none;
    }
  `;

  @property({ type: String })
  override title = 'On this page';

  @property({ type: String })
  titleHeadingLevel = '4';

  @property({ type: String })
  rootSelector = 'main';

  @property({ type: String })
  headingSelector = 'h2 h3';

  @property({ type: Boolean, reflect: true })
  smoothScroll = true;

  @property({ type: Number })
  scrollOffset = 0;

  @property({ type: String })
  threshold = '0.5';

  @property({ type: String })
  rootMargin = '0px 0px -50% 0px';

  @property({ type: Array, hasChanged: () => true })
  sections: InPageNavSection[] = [];

  // Alias for sections (alternative property name)
  @property({ type: Array, hasChanged: () => true })
  get items(): InPageNavItem[] {
    return this.sections as unknown as InPageNavItem[];
  }
  set items(value: InPageNavItem[]) {
    this.sections = value as unknown as InPageNavSection[];
  }

  // Store cleanup function from behavior
  private cleanup?: () => void;

  override connectedCallback() {
    super.connectedCallback();

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');
  }

  // Observe data attributes and sync to properties
  static override get observedAttributes() {
    return [
      'data-title-text',
      'data-title-heading-level',
      'data-heading-elements',
      'data-main-content-selector',
      'data-scroll-offset',
      'data-threshold',
      'data-root-margin',
    ];
  }

  override attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ) {
    super.attributeChangedCallback(name, oldValue, newValue);

    // Sync data attributes to properties when they change
    if (name === 'data-title-text' && newValue !== null) {
      this.title = newValue;
    } else if (name === 'data-title-heading-level' && newValue !== null) {
      this.titleHeadingLevel = newValue.replace('h', '');
    } else if (name === 'data-heading-elements' && newValue !== null) {
      this.headingSelector = newValue;
    } else if (name === 'data-main-content-selector' && newValue !== null) {
      this.rootSelector = newValue;
    } else if (name === 'data-scroll-offset' && newValue !== null) {
      this.scrollOffset = Number(newValue);
    } else if (name === 'data-threshold' && newValue !== null) {
      this.threshold = newValue;
    } else if (name === 'data-root-margin' && newValue !== null) {
      this.rootMargin = newValue;
    }
  }

  override async firstUpdated(changedProperties: Map<string, any>) {
    // ARCHITECTURE: Script Tag Pattern
    // USWDS is loaded globally via script tag in .storybook/preview-head.html
    // Components just render HTML - USWDS enhances automatically via window.USWDS

    // ARCHITECTURE: USWDS-Mirrored Behavior Pattern
    // Uses dedicated behavior file (usa-in-page-navigation-behavior.ts) that replicates USWDS source exactly

    super.firstUpdated(changedProperties);

    // Wait for DOM to be fully rendered
    await this.updateComplete;
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));

    // Initialize using mirrored USWDS behavior
    this.cleanup = initializeInPageNavigation(this);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanup?.();
  }

  private renderHeading() {
    switch (this.titleHeadingLevel) {
      case '1':
        return html`<h1 class="usa-in-page-nav__heading">${this.title}</h1>`;
      case '2':
        return html`<h2 class="usa-in-page-nav__heading">${this.title}</h2>`;
      case '3':
        return html`<h3 class="usa-in-page-nav__heading">${this.title}</h3>`;
      case '4':
        return html`<h4 class="usa-in-page-nav__heading">${this.title}</h4>`;
      case '5':
        return html`<h5 class="usa-in-page-nav__heading">${this.title}</h5>`;
      case '6':
        return html`<h6 class="usa-in-page-nav__heading">${this.title}</h6>`;
      default:
        return html`<h4 class="usa-in-page-nav__heading">${this.title}</h4>`;
    }
  }

  private renderManualNavigation() {
    if (!this.sections || this.sections.length === 0) {
      return '';
    }

    return html`
      ${this.renderHeading()}
      <ul class="usa-in-page-nav__list">
        ${this.renderSectionItems()}
      </ul>
    `;
  }

  private renderSectionItems() {
    return this.sections.map((section) => this.renderSectionItem(section));
  }

  private renderSectionItem(section: InPageNavSection) {
    return html`
      <li class="usa-in-page-nav__item">
        <a href="#${section.id}"> ${section.label} </a>
      </li>
    `;
  }

  override render() {
    // If sections are provided manually, render the structure
    if (this.sections && this.sections.length > 0) {
      return html`
        <aside
          class="usa-in-page-nav"
          aria-label="${this.title || 'On this page navigation'}"
          data-title-text="${this.title}"
          data-title-heading-level="h${this.titleHeadingLevel}"
          data-heading-elements="${this.headingSelector}"
          data-main-content-selector="${this.rootSelector}"
          data-scroll-offset="${this.scrollOffset}"
          data-threshold="${this.threshold}"
          data-root-margin="${this.rootMargin}"
        >
          ${this.renderManualNavigation()}
        </aside>
      `;
    }

    // Render empty container - USWDS will populate it with navigation
    return html`
      <aside
        class="usa-in-page-nav"
        aria-label="${this.title || 'On this page navigation'}"
        data-title-text="${this.title}"
        data-title-heading-level="h${this.titleHeadingLevel}"
        data-heading-elements="${this.headingSelector}"
        data-main-content-selector="${this.rootSelector}"
        data-scroll-offset="${this.scrollOffset}"
        data-threshold="${this.threshold}"
        data-root-margin="${this.rootMargin}"
      ></aside>
    `;
  }
}
