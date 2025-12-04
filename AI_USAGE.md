# USWDS Web Components - AI Agent Usage Guide

> Accessible, production-ready Web Components implementing the U.S. Web Design System for government digital services.

## Purpose

This library provides **constrained Web Components** for AI-assisted prototyping of government websites. When building prototypes:

- **ONLY** use components from this library
- **DO NOT** create custom HTML structures for UI patterns
- **DO NOT** use other UI libraries

## Quick Start

### Installation

```bash
npm install @uswds-wc/all
```

### Basic Page Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Government Service</title>
  <script type="module">
    import '@uswds-wc/all';
  </script>
</head>
<body>
  <!-- Official government banner (required on .gov sites) -->
  <usa-banner></usa-banner>

  <!-- Site header -->
  <usa-header title="Agency Name">
    <nav slot="navigation">
      <a href="/">Home</a>
      <a href="/services">Services</a>
      <a href="/contact">Contact</a>
    </nav>
  </usa-header>

  <!-- Main content -->
  <main class="usa-section">
    <div class="grid-container">
      <usa-alert type="info">
        <span slot="heading">Welcome</span>
        Important information for visitors.
      </usa-alert>

      <usa-card>
        <span slot="header">Service Card</span>
        <p>Description of government service.</p>
        <div slot="footer">
          <usa-button variant="primary">Get Started</usa-button>
        </div>
      </usa-card>
    </div>
  </main>

  <!-- Site footer -->
  <usa-footer variant="medium"></usa-footer>
</body>
</html>
```

---

## Component Reference

### Actions Package (`@uswds-wc/actions`)

| Component | Description | Key Attributes |
|-----------|-------------|----------------|
| `usa-button` | Primary action button | `variant`: primary, secondary, accent-cool, accent-warm, base, outline, unstyled; `disabled`, `big` |
| `usa-button-group` | Group of related buttons | `segmented`: boolean for connected buttons |
| `usa-link` | Styled hyperlink | `href`, `external`: shows external link icon |
| `usa-search` | Search form with input and button | `size`: small, default, big; `placeholder`, `label` |

### Forms Package (`@uswds-wc/forms`)

| Component | Description | Key Attributes |
|-----------|-------------|----------------|
| `usa-text-input` | Single-line text input | `type`: text, email, password, tel, url; `error`, `success`, `disabled`, `required` |
| `usa-textarea` | Multi-line text input | `rows`, `maxlength`, `error`, `disabled` |
| `usa-select` | Dropdown select | `options`: array of {value, label}; `disabled`, `required` |
| `usa-checkbox` | Checkbox input | `checked`, `disabled`, `tile`: card-style checkbox |
| `usa-radio` | Radio button input | `checked`, `disabled`, `tile`: card-style radio |
| `usa-date-picker` | Calendar date picker | `value`, `min-date`, `max-date`, `disabled` |
| `usa-time-picker` | Time selection dropdown | `value`, `min-time`, `max-time`, `step` |
| `usa-combo-box` | Searchable dropdown | `options`: array; `filter-mode`: contains, starts-with |
| `usa-file-input` | File upload input | `accept`, `multiple`, `disabled` |
| `usa-range-slider` | Range/slider input | `min`, `max`, `step`, `value` |
| `usa-memorable-date` | Month/Day/Year inputs | `value`, `legend`, `hint` |
| `usa-character-count` | Input with character limit | `maxlength`, `threshold` |
| `usa-date-range-picker` | Start and end date picker | `start-date`, `end-date` |
| `usa-input-prefix-suffix` | Input with prefix/suffix | `prefix`, `suffix` |
| `usa-validation` | Form validation wrapper | `rules`, `messages` |

### Navigation Package (`@uswds-wc/navigation`)

| Component | Description | Key Attributes |
|-----------|-------------|----------------|
| `usa-header` | Site header with navigation | `title`, `extended`: boolean for mega menu style |
| `usa-footer` | Site footer | `variant`: slim, medium, big; `logo`, `name` |
| `usa-breadcrumb` | Breadcrumb navigation | `items`: array of {href, label}; `wrap` |
| `usa-pagination` | Page navigation | `current-page`, `total-pages`, `pathname` |
| `usa-side-navigation` | Sidebar navigation | `items`: nested array; `current` |
| `usa-in-page-navigation` | Jump links for long pages | `headings-selector`, `root-margin` |
| `usa-language-selector` | Language switcher | `languages`: array; `current-lang` |
| `usa-skip-link` | Accessibility skip link | `href`: target anchor |

### Data Display Package (`@uswds-wc/data-display`)

| Component | Description | Key Attributes |
|-----------|-------------|----------------|
| `usa-card` | Content card container | `flag`: horizontal layout; `header-first` |
| `usa-table` | Data table | `data`: array; `columns`: array; `sortable`, `scrollable` |
| `usa-tag` | Status/category label | `big`: larger variant |
| `usa-list` | Styled list | `type`: unordered, ordered; `unstyled` |
| `usa-icon` | USWDS icon | `name`: icon name from USWDS icon set; `size` |
| `usa-icon-list` | List with icons | `icon`: default icon; `size` |
| `usa-collection` | Collection of items | `condensed`: compact layout |
| `usa-summary-box` | Highlighted summary | `heading` |

### Feedback Package (`@uswds-wc/feedback`)

| Component | Description | Key Attributes |
|-----------|-------------|----------------|
| `usa-alert` | Notification message | `type`: info, success, warning, error, emergency; `slim`, `no-icon` |
| `usa-site-alert` | Page-level alert banner | `type`: info, emergency; `slim` |
| `usa-banner` | Official government banner | `expanded`: show full message |
| `usa-modal` | Dialog/modal window | `open`, `size`: default, large; `force-action` |
| `usa-tooltip` | Hover/focus tooltip | `position`: top, bottom, left, right |

### Layout Package (`@uswds-wc/layout`)

| Component | Description | Key Attributes |
|-----------|-------------|----------------|
| `usa-step-indicator` | Multi-step progress | `steps`: array; `current-step`; `counters`, `center`, `small` |
| `usa-process-list` | Numbered process steps | `items`: array of {heading, content} |
| `usa-identifier` | Agency identifier footer | `agency`, `logo`, `parent-agency` |
| `usa-prose` | Styled prose content | `variant`: condensed, expanded; `width`: narrow, wide |

### Structure Package (`@uswds-wc/structure`)

| Component | Description | Key Attributes |
|-----------|-------------|----------------|
| `usa-accordion` | Expandable sections | `bordered`, `multiselect`: allow multiple open |

---

## Patterns Package (`@uswds-wc/patterns`)

Pre-built form patterns following USWDS design guidelines:

| Pattern | Description | Key Attributes |
|---------|-------------|----------------|
| `usa-name-pattern` | Full name inputs | `show-middle-name`, `show-suffix`, `compact` |
| `usa-address-pattern` | Address form fields | `show-address2`, `international`, `compact` |
| `usa-phone-number-pattern` | Phone input with extension | `show-extension`, `international` |
| `usa-email-address-pattern` | Email with confirmation | `show-confirmation` |
| `usa-date-of-birth-pattern` | DOB memorable date | `compact` |
| `usa-ssn-pattern` | Social Security Number | `show-full`, `masked` |
| `usa-contact-preferences-pattern` | Communication preferences | `options`: email, phone, mail |
| `usa-language-selector-pattern` | Language preference | `languages`: array |
| `usa-race-ethnicity-pattern` | Race/ethnicity form | Standard census categories |
| `usa-sex-pattern` | Sex/gender selection | `options` |
| `usa-form-summary-pattern` | Form review summary | `sections`: array |
| `usa-multi-step-form-pattern` | Multi-page form wrapper | `steps`: array; `current-step` |

---

## Templates Package (`@uswds-wc/templates`)

Full page templates:

| Template | Description |
|----------|-------------|
| `usa-base-template` | Base page structure |
| `usa-landing-template` | Landing/home page |
| `usa-documentation-template` | Documentation page |
| `usa-form-template` | Form page layout |
| `usa-sign-in-template` | Login page |
| `usa-create-account-template` | Registration page |
| `usa-error-template` | Error page (404, 500) |

---

## Usage Patterns

### Form with Validation

```html
<form>
  <usa-text-input
    label="Email address"
    type="email"
    name="email"
    required
    error="Please enter a valid email"
  ></usa-text-input>

  <usa-select
    label="State"
    name="state"
    .options=${[
      { value: '', label: 'Select a state' },
      { value: 'CA', label: 'California' },
      { value: 'NY', label: 'New York' },
    ]}
  ></usa-select>

  <usa-button type="submit" variant="primary">Submit</usa-button>
</form>
```

### Card Grid Layout

```html
<div class="grid-row grid-gap">
  <div class="tablet:grid-col-4">
    <usa-card>
      <span slot="header">Service 1</span>
      <p>Description of first service.</p>
      <div slot="footer">
        <usa-button>Learn More</usa-button>
      </div>
    </usa-card>
  </div>
  <div class="tablet:grid-col-4">
    <usa-card>
      <span slot="header">Service 2</span>
      <p>Description of second service.</p>
      <div slot="footer">
        <usa-button>Learn More</usa-button>
      </div>
    </usa-card>
  </div>
</div>
```

### Modal Dialog

```html
<usa-button id="open-modal">Open Dialog</usa-button>

<usa-modal id="my-modal" heading="Confirm Action">
  <p>Are you sure you want to proceed?</p>
  <div slot="footer">
    <usa-button variant="secondary" data-close-modal>Cancel</usa-button>
    <usa-button variant="primary">Confirm</usa-button>
  </div>
</usa-modal>

<script>
  document.getElementById('open-modal').addEventListener('click', () => {
    document.getElementById('my-modal').open = true;
  });
</script>
```

### Multi-Step Form

```html
<usa-step-indicator
  .steps=${['Personal Info', 'Address', 'Review', 'Submit']}
  current-step="1"
></usa-step-indicator>

<usa-name-pattern></usa-name-pattern>

<usa-button-group>
  <usa-button variant="outline">Back</usa-button>
  <usa-button variant="primary">Continue</usa-button>
</usa-button-group>
```

---

## Constraints & Best Practices

### DO

- Import components from `@uswds-wc/*` packages
- Use documented attributes and slots only
- Apply theming via USWDS utility classes (`grid-`, `margin-`, `padding-`)
- Follow accessibility patterns built into components
- Use semantic slot names for content projection

### DO NOT

- Create inline styles—use USWDS utility classes
- Skip accessibility attributes (`aria-*`, `role`)
- Create new component variants without checking existing options
- Use non-USWDS HTML patterns for UI elements
- Override component styles with custom CSS

### Light DOM Pattern

All components use **Light DOM** (not Shadow DOM). This means:

- USWDS styles apply directly to component markup
- Components render their HTML as direct children
- CSS selectors work normally

---

## File Discovery

| Resource | Location |
|----------|----------|
| Component source | `packages/uswds-wc-*/src/components/` |
| Storybook examples | `packages/uswds-wc-*/src/components/*/*.stories.ts` |
| Component tests | `packages/uswds-wc-*/src/components/*/*.test.ts` |
| Project guidelines | `/CLAUDE.md` |
| Machine-readable API | `/custom-elements.json` (after running `pnpm run analyze`) |

---

## Commands

```bash
# Development
pnpm run dev           # Start development server
pnpm run storybook     # View component examples

# Testing
pnpm test              # Run all tests
pnpm run test:run      # Consolidated test orchestrator

# Build
pnpm run build         # Production build
pnpm run analyze       # Generate Custom Elements Manifest
```

---

## Event Handling

Components dispatch standard DOM events. Listen using `addEventListener`:

```javascript
// Button click
document.querySelector('usa-button').addEventListener('click', (e) => {
  console.log('Button clicked');
});

// Modal open/close
document.querySelector('usa-modal').addEventListener('usa-modal-close', (e) => {
  console.log('Modal closed');
});

// Form input change
document.querySelector('usa-text-input').addEventListener('input', (e) => {
  console.log('Value:', e.target.value);
});

// Accordion toggle
document.querySelector('usa-accordion').addEventListener('usa-accordion-toggle', (e) => {
  console.log('Section toggled:', e.detail);
});
```

---

## Related Documentation

- [USWDS Design System](https://designsystem.digital.gov/)
- [USWDS Components](https://designsystem.digital.gov/components/overview/)
- [USWDS Design Tokens](https://designsystem.digital.gov/design-tokens/)
- [USWDS Utility Classes](https://designsystem.digital.gov/utilities/)
