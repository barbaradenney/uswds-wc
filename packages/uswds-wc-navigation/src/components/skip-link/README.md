---
meta:
  title: USASkipLink
  component: usa-skip-link
---

# USASkipLink

A USWDS skip-link component built with Lit Element.

## Usage

```html
<usa-skip-link></usa-skip-link>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/skip-link/index.js';
```

## Properties

| Property   | Type  | Default                  | Description          |
| ---------- | ----- | ------------------------ | -------------------- |
| `href`     | `any` | `'#main-content'`        | Property description |
| `text`     | `any` | `'Skip to main content'` | Property description |
| `multiple` | `any` | `false`                  | Property description |

## Events

| Event             | Type        | Description       |
| ----------------- | ----------- | ----------------- |
| `skip-link-click` | CustomEvent | Event description |

## Accessibility

This component implements USWDS accessibility standards:

- Proper ARIA attributes and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## USWDS Documentation

- [Skip-link - U.S. Web Design System](https://designsystem.digital.gov/components/skip-link/)
- [Skip-link Guidance](https://designsystem.digital.gov/components/skip-link/#guidance)
- [Skip-link Accessibility](https://designsystem.digital.gov/components/skip-link/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/skip-link/usa-skip-link.test.ts
```

## Storybook

View component examples: [USASkipLink Stories](http://localhost:6006/?path=/story/components-skip-link)

---

_This README is automatically updated when component code changes._
_Last updated: 2025-12-06_
