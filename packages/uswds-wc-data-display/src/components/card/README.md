---
meta:
  title: USACard
  component: usa-card
---

# USACard

A USWDS card component built with Lit Element.

## Usage

```html
<usa-card></usa-card>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/card/index.js';
```

## Properties

| Property        | Type     | Default  | Description          |
| --------------- | -------- | -------- | -------------------- | --------- | -------------------- | ---- | ----- | -------------------- |
| `heading`       | `any`    | `''`     | Property description |
| `text`          | `any`    | `''`     | Property description |
| `mediaType`     | `'image' | 'video'  | 'none'`              | `'none'`  | Property description |
| `mediaSrc`      | `any`    | `''`     | Property description |
| `mediaAlt`      | `any`    | `''`     | Property description |
| `mediaPosition` | `'inset' | 'exdent' | 'right'`             | `'inset'` | Property description |
| `flagLayout`    | `any`    | `false`  | Property description |
| `headerFirst`   | `any`    | `false`  | Property description |
| `actionable`    | `any`    | `false`  | Property description |
| `href`          | `any`    | `''`     | Property description |
| `target`        | `any`    | `''`     | Property description |
| `footerText`    | `any`    | `''`     | Property description |
| `headingLevel`  | `'1'     | '2'      | '3'                  | '4'       | '5'                  | '6'` | `'3'` | Property description |

## Events

| Event        | Type        | Description       |
| ------------ | ----------- | ----------------- |
| `card-click` | CustomEvent | Event description |

## Accessibility

This component implements USWDS accessibility standards:

- Proper ARIA attributes and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## USWDS Documentation

- [Card - U.S. Web Design System](https://designsystem.digital.gov/components/card/)
- [Card Guidance](https://designsystem.digital.gov/components/card/#guidance)
- [Card Accessibility](https://designsystem.digital.gov/components/card/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/card/usa-card.test.ts
```

## Storybook

View component examples: [USACard Stories](http://localhost:6006/?path=/story/components-card)

---

_This README is automatically updated when component code changes._
_Last updated: 2025-12-07_
