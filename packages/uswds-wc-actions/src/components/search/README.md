---
meta:
  title: USASearch
  component: usa-search
---

# USASearch

A USWDS search component built with Lit Element.

## Usage

```html
<usa-search></usa-search>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/search/index.js';
```

## Properties

| Property      | Type     | Default           | Description          |
| ------------- | -------- | ----------------- | -------------------- | ---------- | -------------------- |
| `placeholder` | `any`    | `'Search'`        | Property description |
| `label`       | `any`    | `''`              | Property description |
| `buttonText`  | `any`    | `'Search'`        | Property description |
| `value`       | `any`    | `''`              | Property description |
| `size`        | `'small' | 'medium'          | 'big'`               | `'medium'` | Property description |
| `disabled`    | `any`    | `false`           | Property description |
| `name`        | `any`    | `'search'`        | Property description |
| `inputId`     | `any`    | `'search-field'`  | Property description |
| `buttonId`    | `any`    | `'search-button'` | Property description |
| `toggleable`  | `any`    | `false`           | Property description |

## Events

| Event           | Type        | Description       |
| --------------- | ----------- | ----------------- |
| `search-submit` | CustomEvent | Event description |
| `search-input`  | CustomEvent | Event description |

## Accessibility

This component implements USWDS accessibility standards:

- Proper ARIA attributes and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## USWDS Documentation

- [Search - U.S. Web Design System](https://designsystem.digital.gov/components/search/)
- [Search Guidance](https://designsystem.digital.gov/components/search/#guidance)
- [Search Accessibility](https://designsystem.digital.gov/components/search/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/search/usa-search.test.ts
```

## Storybook

View component examples: [USASearch Stories](http://localhost:6006/?path=/story/components-search)

---

_This README is automatically updated when component code changes._
_Last updated: 2025-12-10_
