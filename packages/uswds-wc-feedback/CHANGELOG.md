# @uswds-wc/feedback

## 2.5.5

### Patch Changes

- Fix broken banner image URLs by changing defaults from relative paths to absolute CDN URLs

## 2.5.4

### Patch Changes

- fix: remove CSS imports for CDN compatibility

  Removes `import '@uswds-wc/core/styles.css'` from all components.
  This fixes the "Expected JavaScript module but got text/css" error
  when loading components via CDN (esm.sh).

  The USWDS CSS should be loaded separately via a `<link>` tag, which
  is the standard pattern for CDN usage.
