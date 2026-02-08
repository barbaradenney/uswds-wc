import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { USWDSVirtualScroller } from '@uswds-wc/core';

// Import official USWDS compiled CSS

export interface CollectionItem {
  id: string;
  title: string;
  description?: string;
  date?: string;
  author?: string;
  tags?: string[];
  media?: CollectionMedia;
  href?: string;
  metadata?: CollectionMetadata[];
}

export interface CollectionMedia {
  src: string;
  alt: string;
}

export interface CollectionMetadata {
  label: string;
  value: string;
}

/**
 * USA Collection Web Component
 *
 * A USWDS-compliant collection implementation as a custom element.
 * Displays a list of items with official USWDS structure and classes.
 *
 * @element usa-collection
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-collection/src/styles/_usa-collection.scss
 * @uswds-docs https://designsystem.digital.gov/components/collection/
 * @uswds-guidance https://designsystem.digital.gov/components/collection/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/collection/#accessibility
 */
@customElement('usa-collection')
export class USACollection extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
    :host([hidden]) {
      display: none;
    }
  `;

  @property({ type: Array })
  items: CollectionItem[] = [];

  @property({ type: Number, attribute: 'count' })
  count = 0;

  private usingUSWDSEnhancement = false;

  @property({ type: Boolean, reflect: true })
  virtual = false;

  @property({ type: Number })
  itemHeight = 120;

  @property({ type: Number })
  containerHeight = 600;

  private virtualScroller?: USWDSVirtualScroller;
  private visibleRange = { start: 0, end: 0 };

  // Store USWDS module for cleanup

  // Computed property for visible items
  private get visibleItems(): CollectionItem[] {
    if (!this.virtual) {
      return this.items;
    }

    const { start, end } = this.visibleRange;
    return this.items.slice(start, end + 1);
  }

  // Use light DOM for USWDS compatibility
  protected override createRenderRoot(): HTMLElement {
    return this as any;
  }

  override connectedCallback() {
    super.connectedCallback();

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');

    // Parse item attributes if items array is empty
    this.parseItemAttributes();

    // Initialize CSS custom property for container height
    this.style.setProperty('--usa-collection-container-height', `${this.containerHeight}px`);

    if (this.virtual) {
      this.setupVirtualScrolling();
      // Initialize progressive enhancement
      this.initializeUSWDSCollection();
    }
  }

  /**
   * Parse item1-title, item1-description, etc. attributes into items array
   * This supports declarative HTML usage for prototyping tools
   */
  private parseItemAttributes() {
    // Only parse if items is empty and we have count or item attributes
    if (this.items.length > 0) return;

    const itemCount = this.count || this.getAttributeCount();
    if (itemCount === 0) return;

    const parsedItems: CollectionItem[] = [];
    for (let i = 1; i <= itemCount; i++) {
      const title = this.getAttribute(`item${i}-title`);
      if (title) {
        parsedItems.push({
          id: `item-${i}`,
          title,
          description: this.getAttribute(`item${i}-description`) || undefined,
          href: this.getAttribute(`item${i}-href`) || undefined,
          date: this.getAttribute(`item${i}-date`) || undefined,
          author: this.getAttribute(`item${i}-author`) || undefined,
        });
      }
    }

    if (parsedItems.length > 0) {
      this.items = parsedItems;
    }
  }

  /**
   * Detect item count from attributes if not explicitly set
   */
  private getAttributeCount(): number {
    let itemCount = 0;
    for (let i = 1; i <= 20; i++) {
      if (this.getAttribute(`item${i}-title`)) {
        itemCount = i;
      } else {
        break;
      }
    }
    return itemCount;
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.virtualScroller?.destroy();
    this.cleanupUSWDS();
  }

  /**
   * Clean up USWDS module on component destruction
   */
  private cleanupUSWDS() {
    // Try cleanup with global USWDS (collection components are presentational)
    if (typeof window !== 'undefined' && typeof window.USWDS !== 'undefined') {
      const USWDS = window.USWDS;
      if (USWDS.collection?.off) {
        try {
          USWDS.collection.off(this);
        } catch {
          // Cleanup may fail if USWDS was already torn down
        }
      }
    }
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    // Update CSS custom property when containerHeight changes
    if (changedProperties.has('containerHeight')) {
      this.style.setProperty('--usa-collection-container-height', `${this.containerHeight}px`);
    }

    if (changedProperties.has('items') && this.virtual) {
      this.updateVirtualData();
    }

    if (changedProperties.has('virtual') && this.virtual && !this.virtualScroller) {
      this.setupVirtualScrolling();
    }
  }

  private setupVirtualScrolling() {
    if (!this.virtual || this.items.length === 0) return;

    // Find or create scrollable container
    const scrollContainer =
      (this.querySelector('.usa-collection__virtual-container') as HTMLElement) ||
      this.createVirtualContainer();

    this.virtualScroller = new USWDSVirtualScroller(scrollContainer, {
      itemHeight: this.itemHeight,
      containerHeight: this.containerHeight,
      overscan: 3,
      onRender: (start: number, end: number) => {
        this.visibleRange = { start, end };
        this.requestUpdate(); // Trigger re-render with new visible range
      },
    });

    this.virtualScroller.setTotalItems(this.items.length);

    // Listen for virtual render events
    scrollContainer.addEventListener(
      'virtual-render',
      this.handleVirtualRender.bind(this) as EventListener
    );
  }

  private createVirtualContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'usa-collection__virtual-container';
    return container;
  }

  private updateVirtualData() {
    if (!this.virtualScroller) return;

    this.virtualScroller.setTotalItems(this.items.length);
  }

  private handleVirtualRender(event: CustomEvent) {
    const { startIndex, endIndex } = event.detail;
    this.visibleRange = { start: startIndex, end: endIndex };
    this.requestUpdate(); // Trigger re-render with new visible range
  }

  private renderMedia(media: CollectionMedia) {
    if (!media) return '';

    return html`<img class="usa-collection__img" src="${media.src}" alt="${media.alt}" />`;
  }

  private renderTag(tag: string) {
    return html`<li class="usa-collection__meta-item usa-tag">${tag}</li>`;
  }

  private renderTags(tags: string[]) {
    if (!tags || tags.length === 0) return '';

    return html`
      <ul class="usa-collection__meta" aria-label="Topics">
        ${tags.map((tag) => this.renderTag(tag))}
      </ul>
    `;
  }

  private renderAuthorItem(author: string) {
    return html`<li class="usa-collection__meta-item">By ${author}</li>`;
  }

  private renderDateItem(date: string) {
    return html`
      <li class="usa-collection__meta-item">
        <time datetime="${date}">${date}</time>
      </li>
    `;
  }

  private renderAuthorAndDate(item: CollectionItem) {
    const hasAuthor = item.author;
    const hasDate = item.date;

    if (!hasAuthor && !hasDate) return '';

    return html`
      <ul class="usa-collection__meta" aria-label="More information">
        ${hasAuthor ? this.renderAuthorItem(item.author!) : ''}
        ${hasDate ? this.renderDateItem(item.date!) : ''}
      </ul>
    `;
  }

  private renderMetadataItem(meta: CollectionMetadata) {
    return html`<li class="usa-collection__meta-item">${meta.label}: ${meta.value}</li>`;
  }

  private renderMetadata(metadata: CollectionMetadata[]) {
    if (!metadata || metadata.length === 0) return '';

    return html`
      <ul class="usa-collection__meta" aria-label="More information">
        ${metadata.map((meta) => this.renderMetadataItem(meta))}
      </ul>
    `;
  }

  private renderTitle(item: CollectionItem) {
    if (item.href) {
      return html`<a class="usa-link" href="${item.href}">${item.title}</a>`;
    }
    return item.title;
  }

  private renderDescription(description: string) {
    return html`<p class="usa-collection__description">${description}</p>`;
  }

  private renderItem(item: CollectionItem) {
    return html`
      <li class="usa-collection__item">
        ${item.media ? this.renderMedia(item.media) : ''}
        <div class="usa-collection__body">
          <h3 class="usa-collection__heading">${this.renderTitle(item)}</h3>
          ${item.description ? this.renderDescription(item.description) : ''}
          ${this.renderAuthorAndDate(item)} ${this.renderMetadata(item.metadata || [])}
          ${this.renderTags(item.tags || [])}
        </div>
      </li>
    `;
  }
  private async initializeUSWDSCollection() {
    // Prevent multiple initializations
    if (this.usingUSWDSEnhancement) {
      return;
    }

    try {
      // Check if global USWDS is available for potential future enhancements
      if (typeof window !== 'undefined' && typeof window.USWDS !== 'undefined') {
        const USWDS = window.USWDS;
        if (USWDS.collection && typeof USWDS.collection.on === 'function') {
          USWDS.collection.on(this);
          return;
        }
      }
    } catch {
      // Initialization continues with basic behavior
    }
  }

  private renderVirtualCollection() {
    const collectionClasses = ['usa-collection'];

    return html`
      <div class="usa-collection__virtual-container">
        <ul class="${collectionClasses.join(' ')}">
          ${this.visibleItems.map((item) => this.renderItem(item))}
        </ul>
      </div>
    `;
  }

  private renderStandardCollection() {
    const collectionClasses = ['usa-collection'];

    return html`
      <ul class="${collectionClasses.join(' ')}">
        ${this.items.map((item) => this.renderItem(item))}
      </ul>
    `;
  }

  override render() {
    return this.virtual ? this.renderVirtualCollection() : this.renderStandardCollection();
  }
}
