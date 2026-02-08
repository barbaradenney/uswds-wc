---
meta:
  title: USALink
  component: usa-link
---

# USALink

A USWDS link component built with Lit Element.

## Usage

```html
<usa-link></usa-link>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/link/index.js';
```

## Properties

| Property   | Type       | Default    | Description          |
| ---------- | ---------- | ---------- | -------------------- | ----------- | ----------- | -------------------- |
| `href`     | `any`      | `''`       | Property description |
| `text`     | `any`      | `''`       | Property description |
| `target`   | `any`      | `''`       | Property description |
| `rel`      | `any`      | `''`       | Property description |
| `variant`  | `'default' | 'external' | 'alt'                | 'unstyled'` | `'default'` | Property description |
| `external` | `any`      | `false`    | Property description |
| `unstyled` | `any`      | `false`    | Property description |
| `download` | `any`      | `''`       | Property description |

## Events

| Event        | Type        | Description       |
| ------------ | ----------- | ----------------- |
| `link-click` | CustomEvent | Event description |

## Accessibility

This component implements USWDS accessibility standards:

- Proper ARIA attributes and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## USWDS Documentation

- [Link - U.S. Web Design System](https://designsystem.digital.gov/components/link/)
- [Link Guidance](https://designsystem.digital.gov/components/link/#guidance)
- [Link Accessibility](https://designsystem.digital.gov/components/link/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/link/usa-link.test.ts
```

## Storybook

View component examples: [USALink Stories](http://localhost:6006/?path=/story/components-link)

---

_This README is automatically updated when component code changes._
_Last updated: 2026-02-08_
