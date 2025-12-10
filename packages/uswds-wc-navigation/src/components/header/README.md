---
meta:
  title: USAHeader
  component: usa-header
---

# USAHeader

A USWDS header component built with Lit Element.

## Usage

```html
<usa-header></usa-header>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/header/index.js';
```

## Properties

| Property            | Type              | Default    | Description          |
| ------------------- | ----------------- | ---------- | -------------------- |
| `logoText`          | `any`             | `''`       | Property description |
| `logoHref`          | `any`             | `'/'`      | Property description |
| `logoImageSrc`      | `any`             | `''`       | Property description |
| `logoImageAlt`      | `any`             | `''`       | Property description |
| `navItems`          | `NavItem[]`       | `[]`       | Property description |
| `secondaryLinks`    | `SecondaryLink[]` | `[]`       | Property description |
| `extended`          | `any`             | `false`    | Property description |
| `showSearch`        | `any`             | `false`    | Property description |
| `searchPlaceholder` | `any`             | `'Search'` | Property description |
| `mobileMenuOpen`    | `any`             | `false`    | Property description |

## Events

| Event                | Type        | Description       |
| -------------------- | ----------- | ----------------- |
| `mobile-menu-toggle` | CustomEvent | Event description |
| `nav-click`          | CustomEvent | Event description |
| `header-search`      | CustomEvent | Event description |

## Accessibility

This component implements USWDS accessibility standards:

- Proper ARIA attributes and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## USWDS Documentation

- [Header - U.S. Web Design System](https://designsystem.digital.gov/components/header/)
- [Header Guidance](https://designsystem.digital.gov/components/header/#guidance)
- [Header Accessibility](https://designsystem.digital.gov/components/header/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/header/usa-header.test.ts
```

## Storybook

View component examples: [USAHeader Stories](http://localhost:6006/?path=/story/components-header)

---

_This README is automatically updated when component code changes._
_Last updated: 2025-12-10_
