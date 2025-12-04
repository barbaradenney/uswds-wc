---
meta:
  title: USAProse
  component: usa-prose
---

# USAProse

A USWDS prose component built with Lit Element.

## Usage

```html
<usa-prose></usa-prose>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/prose/index.js';
```

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `variant` | `'default' | 'condensed' | 'expanded'` | `'default'` | Property description |
| `width` | `'default' | 'narrow' | 'wide'` | `'default'` | Property description |
| `content` | `any` | `''` | Property description |

## Events

| Event | Type | Description |
|-------|------|-------------|
| `prose-change` | CustomEvent | Event description |

## Accessibility

This component implements USWDS accessibility standards:

- Proper ARIA attributes and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## USWDS Documentation

- [Prose - U.S. Web Design System](https://designsystem.digital.gov/components/prose/)
- [Prose Guidance](https://designsystem.digital.gov/components/prose/#guidance)
- [Prose Accessibility](https://designsystem.digital.gov/components/prose/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/prose/usa-prose.test.ts
```

## Storybook

View component examples: [USAProse Stories](http://localhost:6006/?path=/story/components-prose)

---

_This README is automatically updated when component code changes._
_Last updated: 2025-12-04_
