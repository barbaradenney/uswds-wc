---
meta:
  title: USASideNavigation
  component: usa-side-navigation
---

# USASideNavigation

A USWDS side-navigation component built with Lit Element.

## Usage

```html
<usa-side-navigation></usa-side-navigation>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/side-navigation/index.js';
```

## Properties

| Property | Type            | Default | Description          |
| -------- | --------------- | ------- | -------------------- |
| `items`  | `SideNavItem[]` | `[]`    | Property description |

## Events

| Event           | Type        | Description       |
| --------------- | ----------- | ----------------- |
| `sidenav-click` | CustomEvent | Event description |

## Accessibility

This component implements USWDS accessibility standards:

- Proper ARIA attributes and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## USWDS Documentation

- [Side-navigation - U.S. Web Design System](https://designsystem.digital.gov/components/side-navigation/)
- [Side-navigation Guidance](https://designsystem.digital.gov/components/side-navigation/#guidance)
- [Side-navigation Accessibility](https://designsystem.digital.gov/components/side-navigation/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/side-navigation/usa-side-navigation.test.ts
```

## Storybook

View component examples: [USASideNavigation Stories](http://localhost:6006/?path=/story/components-side-navigation)

---

_This README is automatically updated when component code changes._
_Last updated: 2025-12-07_
