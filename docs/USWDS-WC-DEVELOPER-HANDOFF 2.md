# USWDS Web Components: Developer Handoff Document

> This document provides actionable tasks and guidance for improving the uswds-wc repository for AI agent consumption and test stability. Feed this to Claude Code or use it to create GitHub issues.

## Project Context

**Repository:** https://github.com/barbaradenney/uswds-wc  
**Goal:** Create a USWDS Web Component library optimized for AI-assisted prototyping  
**Primary AI Agents:** Claude Code (primary), GitHub Copilot (contributor-friendly)  
**Constraint:** Prototypes built with AI agents should ONLY use components from this library

### Current Pain Points
1. Flaky tests requiring skips
2. Complex JavaScript causing reliability issues
3. No AI agent documentation (CLAUDE.md, etc.)
4. Missing Custom Elements Manifest for machine-readable API

---

## Priority 1: AI Agent Documentation (High Impact, Low Effort)

### Task 1.1: Create CLAUDE.md

**File:** `/CLAUDE.md`  
**Purpose:** Claude Code reads this file at session start for project context

```markdown
# USWDS Web Components Library

> Accessible, production-ready Web Components implementing the U.S. Web Design System for government digital services.

## Project Purpose
This library provides constrained Web Components for AI-assisted prototyping. When building prototypes, AI agents should ONLY use components from this library—never create custom HTML structures or use other UI libraries.

## Tech Stack
- **Framework:** Lit 3.x
- **Language:** TypeScript
- **Testing:** Web Test Runner + @open-wc/testing
- **Build:** Vite
- **Styling:** CSS Custom Properties following USWDS design tokens

## Component Usage Rules

### DO:
- Import components from this library's packages
- Use documented attributes and slots only
- Apply theming via CSS custom properties (--usa-*)
- Follow accessibility patterns built into components
- Use semantic slot names for content projection

### DO NOT:
- Create inline styles—use CSS custom properties
- Skip accessibility attributes (aria-*, role)
- Create new component variants without checking existing options
- Use non-USWDS HTML patterns for UI elements
- Detach from component constraints for "quick fixes"

## Available Components

[LIST EACH COMPONENT WITH ONE-LINE DESCRIPTION]
Example format:
- `usa-button` - Primary action component (variants: primary, secondary, accent-cool, accent-warm, base, outline, unstyled)
- `usa-card` - Content container with optional header, body, footer, and media slots
- `usa-banner` - Official government site identification banner (required on .gov sites)
- `usa-alert` - Notification messaging (variants: info, success, warning, error, emergency)
- `usa-accordion` - Expandable content sections (supports single/multi expand modes)

## Finding Information
- Component source: `./src/[component]/`
- Stories/examples: `./src/[component]/[component].stories.ts`
- Tests: `./src/[component]/[component].test.ts`
- Full machine-readable API: `./custom-elements.json`

## Code Patterns

### Creating a basic page with components
```html
<usa-banner></usa-banner>
<main class="usa-section">
  <usa-alert type="info">
    <span slot="heading">Information</span>
    This is an informational message.
  </usa-alert>
  
  <usa-card>
    <span slot="header">Card Title</span>
    <p>Card content goes here.</p>
    <div slot="footer">
      <usa-button variant="primary">Action</usa-button>
    </div>
  </usa-card>
</main>
```

### Event handling pattern
```html
<usa-button id="submit-btn" variant="primary">Submit</usa-button>
<script>
  document.getElementById('submit-btn').addEventListener('click', (e) => {
    console.log('Button clicked:', e.detail);
  });
</script>
```

## Testing Commands
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run storybook` - View component examples

## Build Commands
- `npm run build` - Production build
- `npm run dev` - Development server
- `npm run analyze` - Generate Custom Elements Manifest
```

**Acceptance Criteria:**
- [ ] File exists at repository root
- [ ] All available components are listed with descriptions
- [ ] Code examples are accurate and tested
- [ ] Commands match actual package.json scripts

---

### Task 1.2: Create GitHub Copilot Instructions

**File:** `/.github/copilot-instructions.md`  
**Purpose:** GitHub Copilot reads this for project-specific suggestions

```markdown
# Copilot Instructions for USWDS Web Components

## Project Type
Web Components library using Lit, implementing USWDS design patterns.

## Code Style
- Use TypeScript for all component files
- Use Lit decorators: @customElement, @property, @state, @query
- Follow USWDS naming: usa-[component] for tag names
- Use CSS custom properties for all themeable values

## Component Structure
All components should follow this pattern:

```typescript
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * [Component description]
 * 
 * @slot - Default slot description
 * @slot [name] - Named slot description
 * 
 * @cssprop --usa-[component]-[property] - Description
 * 
 * @attr {type} attrname - Description
 */
@customElement('usa-[component]')
export class Usa[Component] extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @property({ type: String, reflect: true })
  variant: 'primary' | 'secondary' = 'primary';

  render() {
    return html`
      <div class="usa-[component]" part="base">
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

## Testing Pattern
Use @open-wc/testing with async patterns:

```typescript
import { fixture, html, expect, elementUpdated } from '@open-wc/testing';

describe('usa-[component]', () => {
  it('renders with default values', async () => {
    const el = await fixture(html`<usa-[component]></usa-[component]>`);
    expect(el).to.exist;
  });

  it('updates when properties change', async () => {
    const el = await fixture(html`<usa-[component]></usa-[component]>`);
    el.variant = 'secondary';
    await elementUpdated(el);
    expect(el.variant).to.equal('secondary');
  });
});
```

## Naming Conventions
- Components: `usa-[name]` (lowercase, hyphenated)
- Classes: `Usa[Name]` (PascalCase)
- Properties: camelCase
- Attributes: lowercase or kebab-case
- CSS properties: `--usa-[component]-[property]`
- Events: `usa-[component]-[action]`

## Accessibility Requirements
- All interactive components must be keyboard accessible
- Use appropriate ARIA attributes
- Support reduced motion preferences
- Maintain visible focus indicators
```

**Acceptance Criteria:**
- [ ] File exists at `.github/copilot-instructions.md`
- [ ] Code patterns match actual project structure
- [ ] Naming conventions are consistent with existing components

---

### Task 1.3: Create llms.txt

**File:** `/llms.txt`  
**Purpose:** Emerging standard for LLM-optimized documentation discovery

```markdown
# USWDS Web Components

> Accessible web components implementing the U.S. Web Design System for government websites.

## Overview
This library provides Web Components constrained to USWDS patterns. Use these components for building government website prototypes with AI assistance.

## Installation
npm install @uswds/wc

## Quick Start
```html
<script type="module">
  import '@uswds/wc';
</script>

<usa-banner></usa-banner>
<usa-button variant="primary">Get Started</usa-button>
```

## Components
[Auto-generate from component list - one line each]

## Key Files
- /CLAUDE.md - AI agent instructions
- /custom-elements.json - Machine-readable component API
- /src/ - Component source code

## Constraints
- Only use components from this library for prototypes
- Do not create custom HTML structures for UI patterns
- Theme using CSS custom properties only
```

**Acceptance Criteria:**
- [ ] File exists at repository root
- [ ] Component list is complete and accurate
- [ ] Links to key files are correct

---

## Priority 2: Custom Elements Manifest (High Impact, Medium Effort)

### Task 2.1: Set Up CEM Analyzer

**Purpose:** Generate machine-readable API documentation that AI agents and IDEs can consume

**Step 1: Install dependency**
```bash
npm install -D @custom-elements-manifest/analyzer
```

**Step 2: Create config file**

**File:** `/custom-elements-manifest.config.mjs`
```javascript
export default {
  globs: ['src/**/*.ts'],
  exclude: ['**/*.test.ts', '**/*.stories.ts'],
  outdir: './',
  litelement: true,
  packagejson: true,
};
```

**Step 3: Add to package.json**
```json
{
  "customElements": "custom-elements.json",
  "scripts": {
    "analyze": "cem analyze",
    "prepublishOnly": "npm run analyze && npm run build"
  }
}
```

**Step 4: Add to .gitignore (optional) or commit the file**
Recommend committing `custom-elements.json` so AI agents can read it without running build.

**Acceptance Criteria:**
- [ ] `@custom-elements-manifest/analyzer` is in devDependencies
- [ ] Config file exists and targets correct source paths
- [ ] `npm run analyze` generates valid `custom-elements.json`
- [ ] `package.json` has `"customElements"` field

---

### Task 2.2: Enhance JSDoc for CEM Extraction

**Purpose:** The CEM analyzer extracts documentation from JSDoc comments. Enhance existing components with complete annotations.

**Required JSDoc tags for each component:**

```typescript
/**
 * Brief description of the component.
 * 
 * Longer description with usage context if needed.
 * 
 * @slot - Default slot for [content type]
 * @slot header - Named slot for header content
 * @slot footer - Named slot for footer content
 * 
 * @cssprop [--usa-component-background=var(--color-base-lightest)] - Background color
 * @cssprop [--usa-component-border-color=var(--color-base-light)] - Border color
 * 
 * @csspart base - The component's base wrapper
 * @csspart header - The header section
 * 
 * @fires usa-component-change - Fired when value changes. Detail: { value: string }
 * @fires usa-component-submit - Fired on form submission
 * 
 * @attr {string} variant - Visual variant: 'default' | 'highlight' | 'minimal'
 * @attr {boolean} disabled - When true, disables all interaction
 * @attr {string} heading - Text for the component heading
 * 
 * @example
 * ```html
 * <usa-component variant="highlight">
 *   <span slot="header">Title</span>
 *   Content goes here
 * </usa-component>
 * ```
 */
```

**Audit each component for:**
- [ ] All public `@property` fields have `@attr` JSDoc
- [ ] All slots documented with `@slot`
- [ ] All CSS custom properties documented with `@cssprop`
- [ ] All custom events documented with `@fires`
- [ ] At least one `@example` showing basic usage

**Acceptance Criteria:**
- [ ] All components have complete JSDoc annotations
- [ ] Generated `custom-elements.json` includes all properties, slots, events, CSS props
- [ ] No warnings during CEM analysis

---

## Priority 3: Test Stability (High Impact, High Effort)

### Task 3.1: Audit and Fix Flaky Tests

**Investigation steps for each skipped/flaky test:**

1. **Identify the flaky test** - Note the file and test name
2. **Categorize the failure type:**
   - Timing/async issue
   - Shadow DOM query failure
   - Event race condition
   - State not updated before assertion
   - JSDOM limitation

3. **Apply appropriate fix pattern:**

**Pattern A: Missing await for property changes**
```typescript
// ❌ FLAKY
it('updates variant', async () => {
  const el = await fixture(html`<usa-button></usa-button>`);
  el.variant = 'secondary';
  expect(el.shadowRoot.querySelector('button').classList.contains('usa-button--secondary')).to.be.true;
});

// ✅ STABLE
it('updates variant', async () => {
  const el = await fixture(html`<usa-button></usa-button>`);
  el.variant = 'secondary';
  await elementUpdated(el);  // Wait for Lit to re-render
  expect(el.shadowRoot.querySelector('button').classList.contains('usa-button--secondary')).to.be.true;
});
```

**Pattern B: Event timing issues**
```typescript
// ❌ FLAKY
it('fires click event', async () => {
  const el = await fixture(html`<usa-button></usa-button>`);
  let clicked = false;
  el.addEventListener('click', () => clicked = true);
  el.shadowRoot.querySelector('button').click();
  expect(clicked).to.be.true;
});

// ✅ STABLE
it('fires click event', async () => {
  const el = await fixture(html`<usa-button></usa-button>`);
  const clickPromise = oneEvent(el, 'click');
  setTimeout(() => el.shadowRoot.querySelector('button').click());
  await clickPromise;
  // If we get here, event fired successfully
});
```

**Pattern C: Waiting for async content**
```typescript
// ❌ FLAKY
it('loads async content', async () => {
  const el = await fixture(html`<usa-data-loader></usa-data-loader>`);
  expect(el.shadowRoot.querySelector('.data')).to.exist;
});

// ✅ STABLE
it('loads async content', async () => {
  const el = await fixture(html`<usa-data-loader></usa-data-loader>`);
  await waitUntil(
    () => el.shadowRoot.querySelector('.data'),
    'Data never loaded',
    { timeout: 5000, interval: 100 }
  );
  expect(el.shadowRoot.querySelector('.data')).to.exist;
});
```

**Pattern D: Component registration conflicts**
```typescript
// ❌ FLAKY (if same test file run multiple times)
@customElement('usa-test-button')
class TestButton extends LitElement {}

// ✅ STABLE
import { defineCE } from '@open-wc/testing';

it('tests button behavior', async () => {
  const tag = defineCE(class extends UsaButton {});
  const el = await fixture(`<${tag}></${tag}>`);
  // unique tag name per test run
});
```

**Acceptance Criteria:**
- [ ] All previously skipped tests are either fixed or documented with clear reason
- [ ] No tests use arbitrary `setTimeout` for timing
- [ ] All property changes followed by `await elementUpdated(el)`
- [ ] All event tests use `oneEvent()` pattern

---

### Task 3.2: Configure Web Test Runner for Real Browser Testing

**Purpose:** JSDOM doesn't fully support Web Components. Run tests in real browsers.

**File:** `/web-test-runner.config.mjs`
```javascript
import { playwrightLauncher } from '@web/test-runner-playwright';
import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  files: 'src/**/*.test.ts',
  nodeResolve: true,
  plugins: [
    esbuildPlugin({ ts: true }),
  ],
  browsers: [
    playwrightLauncher({ product: 'chromium' }),
    // Optional: Add Firefox and WebKit for cross-browser testing
    // playwrightLauncher({ product: 'firefox' }),
    // playwrightLauncher({ product: 'webkit' }),
  ],
  testFramework: {
    config: {
      timeout: 5000,
      retries: 1,  // Allow one retry for genuinely flaky browser tests
    },
  },
  coverageConfig: {
    include: ['src/**/*.ts'],
    exclude: ['**/*.test.ts', '**/*.stories.ts'],
  },
};
```

**Install dependencies:**
```bash
npm install -D @web/test-runner @web/test-runner-playwright @web/dev-server-esbuild playwright
```

**Update package.json:**
```json
{
  "scripts": {
    "test": "web-test-runner",
    "test:watch": "web-test-runner --watch",
    "test:coverage": "web-test-runner --coverage"
  }
}
```

**Acceptance Criteria:**
- [ ] Tests run in real Chromium browser
- [ ] Test output shows browser name
- [ ] Previously JSDOM-failing tests now pass

---

## Priority 4: JavaScript Reliability Patterns (Medium Impact, Ongoing)

### Task 4.1: Audit Components for Anti-Patterns

Review each component for these issues:

**Anti-Pattern 1: Mutating arrays/objects instead of replacing**
```typescript
// ❌ BAD - Lit won't detect change
this.items.push(newItem);
this.config.enabled = true;

// ✅ GOOD - Replace to trigger update
this.items = [...this.items, newItem];
this.config = { ...this.config, enabled: true };
```

**Anti-Pattern 2: Missing cleanup in disconnectedCallback**
```typescript
// ❌ BAD - Memory leak
connectedCallback() {
  super.connectedCallback();
  window.addEventListener('resize', this.handleResize);
}

// ✅ GOOD - Proper cleanup
connectedCallback() {
  super.connectedCallback();
  this._boundHandleResize = this.handleResize.bind(this);
  window.addEventListener('resize', this._boundHandleResize);
}

disconnectedCallback() {
  window.removeEventListener('resize', this._boundHandleResize);
  super.disconnectedCallback();
}
```

**Anti-Pattern 3: Setting reactive properties in updated()**
```typescript
// ❌ BAD - Causes re-render loop
updated(changedProperties) {
  if (changedProperties.has('firstName')) {
    this.fullName = `${this.firstName} ${this.lastName}`;  // Triggers another update!
  }
}

// ✅ GOOD - Use willUpdate for derived state
willUpdate(changedProperties) {
  if (changedProperties.has('firstName') || changedProperties.has('lastName')) {
    this._fullName = `${this.firstName} ${this.lastName}`;
  }
}
```

**Anti-Pattern 4: Async operations in render()**
```typescript
// ❌ BAD - render() must be synchronous
render() {
  const data = await this.fetchData();  // This doesn't work!
  return html`${data}`;
}

// ✅ GOOD - Use @lit/task or trigger in lifecycle
import { Task } from '@lit/task';

_dataTask = new Task(this, {
  task: async () => fetch('/api/data').then(r => r.json()),
  args: () => []
});

render() {
  return this._dataTask.render({
    pending: () => html`<usa-spinner></usa-spinner>`,
    complete: (data) => html`<div>${data}</div>`,
    error: (e) => html`<usa-alert type="error">${e}</usa-alert>`
  });
}
```

**Anti-Pattern 5: Accessing children in connectedCallback synchronously**
```typescript
// ❌ BAD - Children may not be upgraded yet
connectedCallback() {
  super.connectedCallback();
  const childButton = this.querySelector('usa-button');
  childButton.variant = 'primary';  // May fail!
}

// ✅ GOOD - Wait for children or use slotchange
connectedCallback() {
  super.connectedCallback();
  this.updateComplete.then(() => {
    const childButton = this.querySelector('usa-button');
    if (childButton) childButton.variant = 'primary';
  });
}

// OR use slotchange event
firstUpdated() {
  this.shadowRoot.querySelector('slot').addEventListener('slotchange', () => {
    this._handleSlottedContent();
  });
}
```

**Create checklist issue for each component:**
- [ ] No direct array/object mutations
- [ ] All external listeners cleaned up in disconnectedCallback
- [ ] No reactive property assignments in updated()
- [ ] No async operations in render()
- [ ] Child access properly timed

---

### Task 4.2: Standardize Property Definitions

**Consistent pattern for all components:**

```typescript
// Public API - can be set via attribute or property
@property({ type: String, reflect: true })
variant: 'primary' | 'secondary' = 'primary';

@property({ type: Boolean, reflect: true })
disabled = false;

@property({ type: String })  // No reflect for complex values
label = '';

// Internal state - never reflected to attributes
@state()
private _isOpen = false;

@state()
private _computedValue: string | null = null;
```

**Rules:**
- `reflect: true` for properties that should appear as attributes in DOM
- Union types for constrained values
- Default values for all properties
- `@state()` for internal-only values
- Prefix private properties with `_`

---

## Priority 5: Component Documentation (Medium Impact, Medium Effort)

### Task 5.1: Create Component Markdown Files

**Location:** `/docs/components/[component].md`

**Template:**
```markdown
# usa-[component]

Brief description of the component and when to use it.

## Usage

```html
<usa-[component] variant="primary">
  Content here
</usa-[component]>
```

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary'` | `'primary'` | Visual style variant |
| `disabled` | `boolean` | `false` | Disables interaction |

## Slots

| Slot | Description |
|------|-------------|
| (default) | Main content area |
| `header` | Header content |
| `footer` | Footer actions |

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--usa-[component]-background` | `var(--color-base-lightest)` | Background color |
| `--usa-[component]-border` | `var(--color-base-light)` | Border color |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `usa-[component]-change` | `{ value: string }` | Fired when value changes |

## Examples

### Basic usage
```html
<usa-[component]>Basic example</usa-[component]>
```

### With slots
```html
<usa-[component]>
  <span slot="header">Header</span>
  Main content
  <span slot="footer">Footer</span>
</usa-[component]>
```

### Themed
```html
<style>
  usa-[component] {
    --usa-[component]-background: var(--color-primary-lighter);
  }
</style>
<usa-[component]>Themed component</usa-[component]>
```

## Accessibility

- Component has `role="[role]"` by default
- Supports keyboard navigation with [keys]
- Announces [what] to screen readers

## Related Components

- [usa-other-component](./other-component.md) - For similar use case
```

**Acceptance Criteria:**
- [ ] Every component has a corresponding markdown doc
- [ ] All attributes match actual component implementation
- [ ] Examples are copy-paste ready and tested
- [ ] Accessibility section is accurate

---

## Implementation Order

1. **Week 1: AI Documentation**
   - Create CLAUDE.md
   - Create copilot-instructions.md
   - Create llms.txt

2. **Week 2: Custom Elements Manifest**
   - Install and configure CEM analyzer
   - Audit and enhance JSDoc on all components
   - Verify generated manifest is complete

3. **Week 3-4: Test Stability**
   - Configure Web Test Runner
   - Fix flaky tests using documented patterns
   - Remove all test skips or document permanent exclusions

4. **Week 5: JavaScript Patterns**
   - Audit each component for anti-patterns
   - Refactor identified issues
   - Add regression tests for fixed issues

5. **Week 6: Documentation**
   - Create component markdown docs
   - Update main README
   - Final review of all AI documentation

---

## Validation Checklist

Before considering this work complete:

- [ ] `npm run analyze` generates valid custom-elements.json
- [ ] `npm test` passes with no skipped tests
- [ ] CLAUDE.md accurately describes all components
- [ ] A fresh Claude Code session can correctly generate a prototype using only this library's components
- [ ] GitHub Copilot suggests correct component usage in a new file

---

## Notes for AI Agent Implementation

When Claude Code works on these tasks:

1. **Read existing code first** - Don't assume patterns, check actual implementations
2. **Run tests after changes** - Verify fixes don't break other things
3. **Commit incrementally** - One logical change per commit
4. **Update documentation together** - When fixing a component, update its docs
5. **Ask for clarification** - If component behavior is unclear, ask before changing
