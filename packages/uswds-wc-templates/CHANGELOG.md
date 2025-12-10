# @uswds-wc/templates

## 2.5.4

### Patch Changes

- fix: remove CSS imports for CDN compatibility

  Removes `import '@uswds-wc/core/styles.css'` from all components.
  This fixes the "Expected JavaScript module but got text/css" error
  when loading components via CDN (esm.sh).

  The USWDS CSS should be loaded separately via a `<link>` tag, which
  is the standard pattern for CDN usage.

- Updated dependencies
  - @uswds-wc/actions@2.5.5
  - @uswds-wc/forms@2.5.4
  - @uswds-wc/feedback@2.5.4
  - @uswds-wc/navigation@2.5.5
  - @uswds-wc/data-display@2.5.4
  - @uswds-wc/layout@2.5.4
  - @uswds-wc/patterns@2.5.4
  - @uswds-wc/structure@2.5.4
