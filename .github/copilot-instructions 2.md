# Copilot Instructions for USWDS Web Components

## Project Type

Web Components library using **Lit 3.x** implementing USWDS (U.S. Web Design System) patterns. All components use **Light DOM** (not Shadow DOM) for USWDS CSS compatibility.

## Code Style

- Use **TypeScript** for all component files
- Use Lit decorators: `@customElement`, `@property`, `@state`, `@query`
- Follow USWDS naming: `usa-[component]` for tag names
- Use USWDS CSS classes directly (no custom CSS)
- Components extend `LitElement` or `USWDSBaseComponent`

## Component Structure

All components follow this pattern:

```typescript
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * Component description
 *
 * @element usa-[component]
 *
 * @slot - Default slot for main content
 * @slot header - Named slot for header content
 *
 * @attr {string} variant - Visual variant
 * @attr {boolean} disabled - Disables interaction
 *
 * @fires usa-[component]-change - Fired when value changes
 *
 * @example
 * ```html
 * <usa-[component] variant="primary">Content</usa-[component]>
 * ```
 */
@customElement('usa-[component]')
export class Usa[Component] extends LitElement {
  // CRITICAL: Light DOM - no Shadow DOM
  protected override createRenderRoot(): HTMLElement {
    return this as unknown as HTMLElement;
  }

  @property({ type: String, reflect: true })
  variant: 'primary' | 'secondary' = 'primary';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  render() {
    return html`
      <div class="usa-[component] ${this.variant ? `usa-[component]--${this.variant}` : ''}">
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'usa-[component]': Usa[Component];
  }
}
```

## Light DOM Pattern (CRITICAL)

This project uses **Light DOM**, not Shadow DOM:

```typescript
// REQUIRED in every component
protected override createRenderRoot(): HTMLElement {
  return this as unknown as HTMLElement;
}
```

This allows USWDS styles to apply directly to component markup.

## Testing Pattern

Use **Vitest** with custom test utilities (NOT @open-wc/testing):

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { waitForUpdate } from '@uswds-wc/test-utils/test-utils.js';
import { testComponentAccessibility } from '@uswds-wc/test-utils/accessibility-utils.js';
import './usa-[component].ts';
import type { Usa[Component] } from './usa-[component].js';

describe('Usa[Component]', () => {
  let element: Usa[Component];

  beforeEach(() => {
    element = document.createElement('usa-[component]') as Usa[Component];
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have default properties', () => {
    expect(element.variant).toBe('primary');
    expect(element.disabled).toBe(false);
  });

  it('should update when properties change', async () => {
    element.variant = 'secondary';
    await waitForUpdate(element);
    expect(element.variant).toBe('secondary');
  });

  it('should pass accessibility tests', async () => {
    await element.updateComplete;
    await testComponentAccessibility(element);
  });
});
```

## Naming Conventions

- **Components**: `usa-[name]` (lowercase, hyphenated)
- **Classes**: `Usa[Name]` (PascalCase)
- **Properties**: camelCase
- **Attributes**: lowercase or kebab-case
- **Events**: `usa-[component]-[action]`
- **Files**: `usa-[component].ts`, `usa-[component].test.ts`, `usa-[component].stories.ts`

## USWDS CSS Classes

Always use official USWDS classes:

```typescript
// Correct - use USWDS classes
return html`
  <div class="usa-alert usa-alert--info">
    <div class="usa-alert__body">
      <slot></slot>
    </div>
  </div>
`;

// WRONG - never create custom styles
return html`
  <div style="background: blue; padding: 20px;">
    <slot></slot>
  </div>
`;
```

## Property Decorators

```typescript
// Reflected to attribute (appears in DOM)
@property({ type: String, reflect: true })
variant: 'primary' | 'secondary' = 'primary';

// Boolean attributes
@property({ type: Boolean, reflect: true })
disabled = false;

// Complex types (no reflect)
@property({ type: Array })
items: Item[] = [];

// Internal state (never reflected)
@state()
private _isOpen = false;
```

## Event Dispatching

```typescript
// Dispatch custom event
this.dispatchEvent(
  new CustomEvent('usa-button-click', {
    detail: { value: this.value },
    bubbles: true,
    composed: true,
  })
);
```

## Lifecycle Hooks

```typescript
override connectedCallback() {
  super.connectedCallback();
  // Setup: add event listeners
  this._boundHandler = this._handleResize.bind(this);
  window.addEventListener('resize', this._boundHandler);
}

override disconnectedCallback() {
  // CRITICAL: Always cleanup
  window.removeEventListener('resize', this._boundHandler);
  super.disconnectedCallback();
}

override firstUpdated(changedProperties: Map<string, unknown>) {
  super.firstUpdated(changedProperties);
  // Initialize USWDS JavaScript behavior
  this.initializeUSWDSComponent();
}
```

## USWDS Initialization

Components that need USWDS JavaScript enhancement:

```typescript
protected initializeUSWDSComponent(): void {
  // ARCHITECTURE: Script Tag Pattern
  // USWDS is loaded globally via script tag in .storybook/preview-head.html
  // Components just render HTML - USWDS enhances automatically via window.USWDS

  if (typeof window !== 'undefined' && (window as any).USWDS) {
    const USWDS = (window as any).USWDS;
    if (USWDS.accordion) {
      USWDS.accordion.init(this);
    }
  }
}
```

## Accessibility Requirements

- All interactive components must be keyboard accessible
- Use appropriate ARIA attributes when needed
- Maintain visible focus indicators (USWDS handles this)
- Support screen readers with proper labeling
- Test with `testComponentAccessibility()` in tests

## Slot Usage

```typescript
render() {
  return html`
    <div class="usa-card">
      <div class="usa-card__header">
        <slot name="header"></slot>
      </div>
      <div class="usa-card__body">
        <slot></slot> <!-- Default slot -->
      </div>
      <div class="usa-card__footer">
        <slot name="footer"></slot>
      </div>
    </div>
  `;
}
```

## File Organization

```
packages/uswds-wc-[category]/src/components/[name]/
├── usa-[name].ts           # Component source
├── usa-[name].test.ts      # Unit tests
├── usa-[name].stories.ts   # Storybook stories
├── usa-[name].component.cy.ts  # Cypress tests (optional)
├── README.mdx              # Component documentation
└── index.ts                # Barrel export
```

## Monorepo Packages

- `@uswds-wc/core` - Base utilities and styles
- `@uswds-wc/actions` - Buttons, links, search
- `@uswds-wc/forms` - Form controls
- `@uswds-wc/navigation` - Header, footer, nav
- `@uswds-wc/data-display` - Cards, tables, tags
- `@uswds-wc/feedback` - Alerts, modals, tooltips
- `@uswds-wc/layout` - Step indicator, process list
- `@uswds-wc/structure` - Accordion
- `@uswds-wc/patterns` - Compound form patterns
- `@uswds-wc/templates` - Page templates
- `@uswds-wc/test-utils` - Testing utilities

## Common Patterns to Avoid

```typescript
// WRONG: Mutating arrays
this.items.push(newItem);

// CORRECT: Replace to trigger update
this.items = [...this.items, newItem];

// WRONG: Setting reactive props in updated()
updated() {
  this.computedValue = this.a + this.b; // Causes re-render loop
}

// CORRECT: Use willUpdate for derived state
willUpdate(changed: Map<string, unknown>) {
  if (changed.has('a') || changed.has('b')) {
    this._computedValue = this.a + this.b;
  }
}
```
