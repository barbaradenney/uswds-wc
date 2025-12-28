---
meta:
  title: USAButtonGroup
  component: usa-button-group
---

# USAButtonGroup

A USWDS button-group component built with Lit Element.

## Usage

```html
<usa-button-group></usa-button-group>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/button-group/index.js';
```

## Properties

| Property      | Type                | Default      | Description          |
| ------------- | ------------------- | ------------ | -------------------- | -------------------- |
| `type`        | `'default'          | 'segmented'` | `'default'`          | Property description |
| `buttons`     | `ButtonGroupItem[]` | `[]`         | Property description |
| `activeIndex` | `any`               | `0`          | Property description |
| `btnCount`    | `any`               | `0`          | Property description |

## Events

| Event          | Type        | Description       |
| -------------- | ----------- | ----------------- |
| `button-click` | CustomEvent | Event description |

## Accessibility

This component implements USWDS accessibility standards:

- Proper ARIA attributes and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## USWDS Documentation

- [Button-group - U.S. Web Design System](https://designsystem.digital.gov/components/button-group/)
- [Button-group Guidance](https://designsystem.digital.gov/components/button-group/#guidance)
- [Button-group Accessibility](https://designsystem.digital.gov/components/button-group/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/button-group/usa-button-group.test.ts
```

## Storybook

View component examples: [USAButtonGroup Stories](http://localhost:6006/?path=/story/components-button-group)

---

_This README is automatically updated when component code changes._
_Last updated: 2025-12-28_
