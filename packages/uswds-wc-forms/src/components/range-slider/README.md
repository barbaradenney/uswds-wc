---
meta:
  title: USARangeSlider
  component: usa-range-slider
---

# USARangeSlider

A USWDS range-slider component built with Lit Element.

## Usage

```html
<usa-range-slider></usa-range-slider>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/range-slider/index.js';
```

## Properties

| Property     | Type  | Default                | Description          |
| ------------ | ----- | ---------------------- | -------------------- |
| `value`      | `any` | `50`                   | Property description |
| `min`        | `any` | `0`                    | Property description |
| `max`        | `any` | `100`                  | Property description |
| `step`       | `any` | `1`                    | Property description |
| `name`       | `any` | `'range-slider'`       | Property description |
| `inputId`    | `any` | `'range-slider-input'` | Property description |
| `label`      | `any` | `'Range'`              | Property description |
| `hint`       | `any` | `''`                   | Property description |
| `error`      | `any` | `''`                   | Property description |
| `disabled`   | `any` | `false`                | Property description |
| `required`   | `any` | `false`                | Property description |
| `unit`       | `any` | `''`                   | Property description |
| `showValue`  | `any` | `true`                 | Property description |
| `showOutput` | `any` | `true`                 | Property description |
| `showMinMax` | `any` | `true`                 | Property description |

## Events

| Event          | Type        | Description       |
| -------------- | ----------- | ----------------- |
| `range-change` | CustomEvent | Event description |

## Accessibility

This component implements USWDS accessibility standards:

- Proper ARIA attributes and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## USWDS Documentation

- [Range-slider - U.S. Web Design System](https://designsystem.digital.gov/components/range-slider/)
- [Range-slider Guidance](https://designsystem.digital.gov/components/range-slider/#guidance)
- [Range-slider Accessibility](https://designsystem.digital.gov/components/range-slider/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/range-slider/usa-range-slider.test.ts
```

## Storybook

View component examples: [USARangeSlider Stories](http://localhost:6006/?path=/story/components-range-slider)

---

_This README is automatically updated when component code changes._
_Last updated: 2026-02-20_
