import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { USWDSBaseComponent } from '@uswds-wc/core';
// Import icon component (used in template)
import '../icon/index.js';

// Import official USWDS compiled CSS

export interface IconListItem {
  icon: string;
  content: string;
  iconColor?: string;
}

/**
 * USA Icon List Web Component
 *
 * A simple, accessible USWDS icon list implementation as a custom element.
 * Displays a list of items with leading icons to reinforce meaning.
 * Uses official USWDS classes and styling with minimal custom code.
 *
 * @element usa-icon-list
 *
 * @see README.md - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 *
 * @uswds-docs https://designsystem.digital.gov/components/icon-list/
 * @uswds-guidance https://designsystem.digital.gov/components/icon-list/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/icon-list/#accessibility
 */
@customElement('usa-icon-list')
export class USAIconList extends USWDSBaseComponent {
  @property({ type: Array })
  items: IconListItem[] = [];

  @property({ type: String })
  color: '' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' = '';

  @property({ type: String })
  size: '' | 'lg' | 'xl' = '';

  // Use light DOM for USWDS compatibility
  protected override createRenderRoot(): HTMLElement {
    return this as HTMLElement;
  }

  override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('data-web-component-managed', 'true');
  }

  private renderIconListItem(item: IconListItem) {
    const iconColorClass = item.iconColor || '';

    return html`
      <li class="usa-icon-list__item">
        <div class="usa-icon-list__icon ${iconColorClass}">
          <usa-icon name="${item.icon}" decorative="true"></usa-icon>
        </div>
        <div class="usa-icon-list__content">${item.content}</div>
      </li>
    `;
  }

  override render() {
    const classList = [
      'usa-icon-list',
      this.color ? `usa-icon-list--${this.color}` : '',
      this.size ? `usa-icon-list--size-${this.size}` : '',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <ul class="${classList}">
        ${this.items.map((item) => this.renderIconListItem(item))}
        <slot></slot>
      </ul>
    `;
  }
}
