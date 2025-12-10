---
meta:
  title: USATag
  component: usa-tag
---

# USATag

A USWDS tag component built with Lit Element.

## Usage

```html
<usa-tag></usa-tag>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/tag/index.js';
```

## Properties

| Property    | Type  | Default | Description          |
| ----------- | ----- | ------- | -------------------- |
| `text`      | `any` | `''`    | Property description |
| `big`       | `any` | `false` | Property description |
| `removable` | `any` | `false` | Property description |
| `value`     | `any` | `''`    | Property description |

## Events

| Event        | Type        | Description       |
| ------------ | ----------- | ----------------- |
| `tag-remove` | CustomEvent | Event description |

## Accessibility

This component implements USWDS accessibility standards:

- Proper ARIA attributes and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## USWDS Documentation

- [Tag - U.S. Web Design System](https://designsystem.digital.gov/components/tag/)
- [Tag Guidance](https://designsystem.digital.gov/components/tag/#guidance)
- [Tag Accessibility](https://designsystem.digital.gov/components/tag/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/tag/usa-tag.test.ts
```

## Storybook

View component examples: [USATag Stories](http://localhost:6006/?path=/story/components-tag)

---

_This README is automatically updated when component code changes._
_Last updated: 2025-12-10_
