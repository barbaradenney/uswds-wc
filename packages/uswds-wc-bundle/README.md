# @uswds-wc/bundle

Pre-bundled USWDS Web Components for CDN usage. This package includes all USWDS web components and the Lit library bundled into a single file that can be loaded directly in browsers without a build step.

## CDN Usage

### From unpkg

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>USWDS Web Components</title>

  <!-- Load USWDS Web Components CSS -->
  <link rel="stylesheet" href="https://unpkg.com/@uswds-wc/bundle/uswds-wc.css">
</head>
<body>
  <!-- Use web components -->
  <usa-button>Click me</usa-button>
  <usa-alert variant="info">
    <span slot="heading">Information</span>
    This is an informational alert.
  </usa-alert>

  <!-- Load USWDS Web Components JS (ES module) -->
  <script type="module" src="https://unpkg.com/@uswds-wc/bundle/uswds-wc.js"></script>
</body>
</html>
```

### From jsdelivr

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@uswds-wc/bundle/uswds-wc.css">
<script type="module" src="https://cdn.jsdelivr.net/npm/@uswds-wc/bundle/uswds-wc.js"></script>
```

## What's Included

This bundle includes:

- **All USWDS Web Components** - Actions, Forms, Navigation, Data Display, Feedback, Layout, Structure, and Patterns
- **Lit library** - The web component framework (bundled, no separate import needed)
- **USWDS Styles** - Complete USWDS 3.x stylesheet

## Available Components

### Actions
- `<usa-button>` - Button component
- `<usa-button-group>` - Button group container
- `<usa-link>` - Styled link
- `<usa-search>` - Search input

### Forms
- `<usa-text-input>` - Text input field
- `<usa-textarea>` - Textarea field
- `<usa-select>` - Select dropdown
- `<usa-checkbox>` - Checkbox input
- `<usa-radio>` - Radio button
- `<usa-date-picker>` - Date picker
- `<usa-time-picker>` - Time picker
- `<usa-file-input>` - File upload
- `<usa-combo-box>` - Combo box with autocomplete
- `<usa-range-slider>` - Range slider
- And more...

### Navigation
- `<usa-header>` - Site header
- `<usa-footer>` - Site footer
- `<usa-breadcrumb>` - Breadcrumb navigation
- `<usa-pagination>` - Pagination controls
- `<usa-side-navigation>` - Side navigation

### Data Display
- `<usa-card>` - Card component
- `<usa-table>` - Data table
- `<usa-tag>` - Tag/badge
- `<usa-collection>` - Collection list

### Feedback
- `<usa-alert>` - Alert messages
- `<usa-banner>` - Government banner
- `<usa-modal>` - Modal dialog
- `<usa-tooltip>` - Tooltip

### Layout
- `<usa-accordion>` - Accordion component
- `<usa-step-indicator>` - Step progress indicator

## Browser Support

This bundle uses ES modules and requires a modern browser:
- Chrome 61+
- Firefox 60+
- Safari 11+
- Edge 79+

## Bundle Size

- **JavaScript**: ~300KB (minified), ~80KB (gzipped)
- **CSS**: ~350KB (minified), ~40KB (gzipped)

## For Bundler Users

If you're using a bundler (Vite, webpack, etc.), we recommend using the individual packages instead for better tree-shaking:

```bash
npm install @uswds-wc/forms @uswds-wc/actions lit
```

```javascript
import '@uswds-wc/core/styles.css';
import { USAButton } from '@uswds-wc/actions';
import { USATextInput } from '@uswds-wc/forms';
```

## License

MIT
