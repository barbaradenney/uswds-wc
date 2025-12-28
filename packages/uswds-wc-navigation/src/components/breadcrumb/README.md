---
meta:
  title: USABreadcrumb
  component: usa-breadcrumb
---

# USABreadcrumb

A USWDS breadcrumb component built with Lit Element.

## Usage

```html
<usa-breadcrumb></usa-breadcrumb>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/breadcrumb/index.js';
```

## Properties

| Property | Type               | Default | Description          |
| -------- | ------------------ | ------- | -------------------- |
| `items`  | `BreadcrumbItem[]` | `[]`    | Property description |
| `wrap`   | `any`              | `false` | Property description |
| `count`  | `any`              | `0`     | Property description |

## Events

| Event              | Type        | Description       |
| ------------------ | ----------- | ----------------- |
| `breadcrumb-click` | CustomEvent | Event description |

## Accessibility

This component implements USWDS accessibility standards:

- Proper ARIA attributes and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## USWDS Documentation

- [Breadcrumb - U.S. Web Design System](https://designsystem.digital.gov/components/breadcrumb/)
- [Breadcrumb Guidance](https://designsystem.digital.gov/components/breadcrumb/#guidance)
- [Breadcrumb Accessibility](https://designsystem.digital.gov/components/breadcrumb/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/breadcrumb/usa-breadcrumb.test.ts
```

## Storybook

View component examples: [USABreadcrumb Stories](http://localhost:6006/?path=/story/components-breadcrumb)

---

_This README is automatically updated when component code changes._
_Last updated: 2025-12-28_
