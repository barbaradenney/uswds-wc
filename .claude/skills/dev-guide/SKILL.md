---
name: dev-guide
description: Senior developer guide for working on a specific USWDS web component — shows source code, README, tests, stories, USWDS reference, compliance status, related components, and the development checklist. Use when starting component work, onboarding to a component, or reviewing component implementation.
argument-hint: "<component-name> (e.g., 'button', 'date-picker', 'header')"
---

# Developer Guide — USWDS Web Component Deep Dive

You are acting as a senior developer assistant. Provide a comprehensive developer briefing for the specified component to help someone quickly understand and work on it.

## Instructions

The target component is: `$ARGUMENTS`

If no component name is provided, ask the user which component they want to explore and list available components by scanning `packages/uswds-wc-*/src/components/`.

### 1. Locate the Component

Search for the component across all feature packages:
```
packages/uswds-wc-actions/src/components/usa-$ARGUMENTS/
packages/uswds-wc-forms/src/components/usa-$ARGUMENTS/
packages/uswds-wc-navigation/src/components/usa-$ARGUMENTS/
packages/uswds-wc-data-display/src/components/usa-$ARGUMENTS/
packages/uswds-wc-feedback/src/components/usa-$ARGUMENTS/
packages/uswds-wc-layout/src/components/usa-$ARGUMENTS/
packages/uswds-wc-structure/src/components/usa-$ARGUMENTS/
```

Also try without the `usa-` prefix and with variations (e.g., "button" matches "usa-button").

### 2. Read Component Documentation

Read the component's `README.mdx` if it exists. Summarize:
- Purpose and usage
- Properties/attributes API
- Events emitted
- Slots available
- Known limitations

### 3. Show Component Source

Read the main component file (`usa-[name].ts`). Highlight:
- What class it extends (USWDSBaseComponent vs LitElement)
- Reactive properties and their types
- USWDS integration pattern used (direct init vs behavior file)
- Key render logic
- Lifecycle hooks used

If a behavior file exists (`usa-[name]-behavior.ts`), mention it and summarize what it does.

### 4. USWDS Reference Source

Read the USWDS reference implementation:
```
node_modules/@uswds/uswds/packages/usa-[component]/src/index.js
```
Summarize the USWDS JavaScript behavior this component should match.

### 5. Test Coverage

Read the component's test files:
- `usa-[name].test.ts` — Unit tests
- `usa-[name].component.cy.ts` — Cypress tests (if exists)
- Any visual/playwright tests

Report:
- Number of test cases
- What's covered (properties, events, accessibility, slots)
- Any skipped tests and their reasons

### 6. Storybook Stories

Read `usa-[name].stories.ts`. Report:
- Available story variants
- Whether all component properties have controls
- Any missing variants vs what USWDS supports

### 7. Related Components

List other components in the same package. Note any components that compose or are composed by this one (check imports).

### 8. Development Checklist

Remind the developer of these critical rules:
- [ ] Light DOM only — `createRenderRoot()` returns `this`
- [ ] Script Tag Pattern — USWDS loaded globally, never via ES imports
- [ ] Component Composition — use `<usa-*>` tags, never duplicate HTML
- [ ] No custom CSS beyond `:host` display styles
- [ ] Tests required: unit, accessibility (axe-core), USWDS compliance
- [ ] Storybook story with all variants
- [ ] README.mdx documentation
- [ ] Run `pnpm test && pnpm run typecheck && pnpm run lint` before committing

### 9. Quick Commands

Provide the developer with relevant commands:
```bash
# Build this package
pnpm --filter @uswds-wc/<package> build

# Test this component specifically
pnpm test -- usa-[name].test.ts

# Run compliance check for this component
pnpm run validate:component=[name]

# View in Storybook
pnpm run storybook
```
