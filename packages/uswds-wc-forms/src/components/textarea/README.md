---
meta:
  title: USATextarea
  component: usa-textarea
---

# USATextarea

A USWDS textarea component built with Lit Element.

## Usage

```html
<usa-textarea></usa-textarea>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/textarea/index.js';
```

## Properties

| Property       | Type    | Default | Description          |
| -------------- | ------- | ------- | -------------------- | -------------------- |
| `name`         | `any`   | `''`    | Property description |
| `value`        | `any`   | `''`    | Property description |
| `placeholder`  | `any`   | `''`    | Property description |
| `label`        | `any`   | `''`    | Property description |
| `hint`         | `any`   | `''`    | Property description |
| `error`        | `any`   | `''`    | Property description |
| `success`      | `any`   | `''`    | Property description |
| `disabled`     | `any`   | `false` | Property description |
| `required`     | `any`   | `false` | Property description |
| `readonly`     | `any`   | `false` | Property description |
| `rows`         | `any`   | `4`     | Property description |
| `cols`         | `number | null`   | `null`               | Property description |
| `maxlength`    | `number | null`   | `null`               | Property description |
| `minlength`    | `number | null`   | `null`               | Property description |
| `autocomplete` | `any`   | `''`    | Property description |
| `compact`      | `any`   | `false` | Property description |

## Events

| Event    | Type        | Description       |
| -------- | ----------- | ----------------- |
| `input`  | CustomEvent | Event description |
| `change` | CustomEvent | Event description |

## Accessibility

This component implements USWDS accessibility standards:

- Proper ARIA attributes and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## USWDS Documentation

- [Textarea - U.S. Web Design System](https://designsystem.digital.gov/components/textarea/)
- [Textarea Guidance](https://designsystem.digital.gov/components/textarea/#guidance)
- [Textarea Accessibility](https://designsystem.digital.gov/components/textarea/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/textarea/usa-textarea.test.ts
```

## Storybook

View component examples: [USATextarea Stories](http://localhost:6006/?path=/story/components-textarea)

---

_This README is automatically updated when component code changes._
_Last updated: 2025-12-07_
