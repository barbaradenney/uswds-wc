---
meta:
  title: USAStepIndicator
  component: usa-step-indicator
---

# USAStepIndicator

A USWDS step-indicator component built with Lit Element.

## Usage

```html
<usa-step-indicator></usa-step-indicator>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/step-indicator/index.js';
```

## Properties

| Property      | Type         | Default | Description          |
| ------------- | ------------ | ------- | -------------------- |
| `steps`       | `StepItem[]` | `[]`    | Property description |
| `currentStep` | `any`        | `1`     | Property description |
| `showLabels`  | `any`        | `true`  | Property description |
| `counters`    | `any`        | `false` | Property description |
| `center`      | `any`        | `false` | Property description |
| `small`       | `any`        | `false` | Property description |
| `heading`     | `any`        | `''`    | Property description |

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

- [Step-indicator - U.S. Web Design System](https://designsystem.digital.gov/components/step-indicator/)
- [Step-indicator Guidance](https://designsystem.digital.gov/components/step-indicator/#guidance)
- [Step-indicator Accessibility](https://designsystem.digital.gov/components/step-indicator/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/step-indicator/usa-step-indicator.test.ts
```

## Storybook

View component examples: [USAStepIndicator Stories](http://localhost:6006/?path=/story/components-step-indicator)

---

_This README is automatically updated when component code changes._
_Last updated: 2025-12-06_
