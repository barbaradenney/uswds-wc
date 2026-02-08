---
meta:
  title: USAIdentifier
  component: usa-identifier
---

# USAIdentifier

A USWDS identifier component built with Lit Element.

## Usage

```html
<usa-identifier></usa-identifier>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/identifier/index.js';
```

## Properties

| Property        | Type               | Default | Description          |
| --------------- | ------------------ | ------- | -------------------- |
| `domain`        | `any`              | `''`    | Property description |
| `agency`        | `any`              | `''`    | Property description |
| `description`   | `any`              | `''`    | Property description |
| `requiredLinks` | `IdentifierLink[]` | `[      |

    { href: '/about', text: 'About' },
    { href: '/accessibility', text: 'Accessibility support' },
    { href: '/foia', text: 'FOIA requests' },
    { href: '/no-fear-act', text: 'No FEAR Act data' },
    { href: '/inspector-general', text: 'Office of the Inspector General' },
    { href: '/performance', text: 'Performance reports' },
    { href: '/privacy', text: 'Privacy policy' },

]`| Property description |
|`logos`|`IdentifierLogo[]`|`[]`| Property description |
|`parentAgency`|`any`|`''`| Property description |
|`parentAgencyHref`|`any`|`''`| Property description |
|`showLogos`|`any`|`true`| Property description |
|`showRequiredLinks`|`any`|`true`| Property description |
|`mastheadLogoSrc`|`any`|`'data:image/svg+xml`| Property description |
|`mastheadLogoAlt`|`any`|`''` | Property description |

## Events

| Event        | Type        | Description       |
| ------------ | ----------- | ----------------- |
| `link-click` | CustomEvent | Event description |

## Accessibility

This component implements USWDS accessibility standards:

- Proper ARIA attributes and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## USWDS Documentation

- [Identifier - U.S. Web Design System](https://designsystem.digital.gov/components/identifier/)
- [Identifier Guidance](https://designsystem.digital.gov/components/identifier/#guidance)
- [Identifier Accessibility](https://designsystem.digital.gov/components/identifier/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/identifier/usa-identifier.test.ts
```

## Storybook

View component examples: [USAIdentifier Stories](http://localhost:6006/?path=/story/components-identifier)

---

_This README is automatically updated when component code changes._
_Last updated: 2026-02-08_
