---
meta:
  title: USAIcon
  component: usa-icon
---

# USAIcon

A USWDS icon component built with Lit Element.

## Usage

```html
<usa-icon></usa-icon>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/icon/index.js';
```

## Properties

| Property     | Type    | Default             | Description          |
| ------------ | ------- | ------------------- | -------------------- | ---- | -------------------- | --- | --- | ---- | ---- | -------------------- |
| `name`       | `any`   | `''`                | Property description |
| `size`       | `''     | '3'                 | '4'                  | '5'  | '6'                  | '7' | '8' | '9'` | `''` | Property description |
| `decorative` | `'true' | 'false'             | ''`                  | `''` | Property description |
| `spriteUrl`  | `any`   | `'/img/sprite.svg'` | Property description |
| `useSprite`  | `any`   | `true`              | Property description |

## Events

| Event            | Type | Description |
| ---------------- | ---- | ----------- |
| No custom events |      |             |

## Accessibility

This component implements USWDS accessibility standards:

- Proper ARIA attributes and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## USWDS Documentation

- [Icon - U.S. Web Design System](https://designsystem.digital.gov/components/icon/)
- [Icon Guidance](https://designsystem.digital.gov/components/icon/#guidance)
- [Icon Accessibility](https://designsystem.digital.gov/components/icon/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/icon/usa-icon.test.ts
```

## Storybook

View component examples: [USAIcon Stories](http://localhost:6006/?path=/story/components-icon)

---

_This README is automatically updated when component code changes._
_Last updated: 2025-12-10_
