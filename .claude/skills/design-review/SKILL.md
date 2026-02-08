---
name: design-review
description: UX designer review of a USWDS web component — shows all visual variants and states, USWDS design tokens, Storybook story completeness, accessibility features, and visual regression test status. Use when reviewing visual/UX aspects of components or checking design coverage.
argument-hint: "<component-name> (e.g., 'button', 'alert', 'card')"
---

# Design Review — USWDS Web Component Visual & UX Audit

You are acting as a UX design reviewer. Provide a comprehensive visual and interaction audit of the specified component, focusing on design fidelity to USWDS standards.

## Instructions

The target component is: `$ARGUMENTS`

If no component name is provided, ask the user which component they want to review.

### 1. Locate the Component

Search across all feature packages for `usa-$ARGUMENTS` (try with and without `usa-` prefix):
```
packages/uswds-wc-*/src/components/usa-*/
```

### 2. Variants and States

Read the Storybook stories file (`usa-[name].stories.ts`). Document:

**Variants**: List all story exports (each represents a variant). For each variant, note:
- What visual variation it represents
- Args/props that drive it
- Whether it covers USWDS-documented variants

**States**: Check component source for state-driven rendering:
- Default, hover, focus, active, disabled states
- Error/warning/success/info states (if applicable)
- Expanded/collapsed states (if applicable)
- Loading states (if applicable)

### 3. USWDS Design Token Usage

Read the component source (`usa-[name].ts`) and check:
- Which USWDS CSS classes are used (e.g., `usa-button`, `usa-button--big`)
- Whether all USWDS modifier classes are exposed as properties
- Any USWDS utility classes used for layout

Cross-reference with the USWDS reference:
```
node_modules/@uswds/uswds/packages/usa-[component]/src/
```

List the USWDS modifier classes available vs. what the component exposes.

### 4. Storybook Story Completeness

Evaluate story coverage:
- Does each USWDS variant have a corresponding story?
- Are interactive controls (argTypes) provided for all visual properties?
- Is the `padded` layout decorator used?
- Are there stories for edge cases (long text, empty content, many items)?
- Are responsive behaviors demonstrated?

Provide a coverage assessment: Complete / Mostly Complete / Gaps Found

### 5. Accessibility Features

Read the component source and tests for:
- ARIA attributes (`role`, `aria-label`, `aria-expanded`, etc.)
- Keyboard navigation support
- Focus management
- Screen reader announcements
- Color contrast (handled by USWDS CSS, but note any custom styles)
- Motion/animation considerations

Check if accessibility tests exist:
- axe-core tests in `usa-[name].test.ts`
- Keyboard interaction tests
- Screen reader compatibility tests

### 6. Official USWDS Reference

Point to the official USWDS documentation URL pattern:
`https://designsystem.digital.gov/components/[component-name]/`

Note: This is for reference only — do not fetch the URL.

### 7. Visual Regression Status

Check for visual regression test files:
```
tests/visual/components/[name]*
tests/visual/*[name]*
```

Report whether visual regression baselines exist and their status.

### 8. Design Review Summary

Provide a structured assessment:

| Aspect | Status | Notes |
|--------|--------|-------|
| USWDS Fidelity | Pass/Needs Work | ... |
| Variant Coverage | X/Y covered | ... |
| Story Completeness | Complete/Gaps | ... |
| Accessibility | Pass/Issues | ... |
| Visual Regression | Covered/Missing | ... |

List specific recommendations for design improvements.
