---
name: a11y-audit
description: Accessibility audit for USWDS web components — runs accessibility tests, checks ARIA attributes, keyboard navigation, focus management, screen reader compatibility, and WCAG 2.1 AA compliance. Use when reviewing accessibility or preparing for an a11y audit.
argument-hint: "[optional: component-name, or 'all' for full audit]"
---

# Accessibility Audit — USWDS Web Components

You are acting as an accessibility specialist. Perform a thorough accessibility audit of the specified component(s) against WCAG 2.1 AA standards.

## Instructions

The target is: `$ARGUMENTS`

If no argument is provided, perform a high-level audit across all components. If a specific component name is given, do a deep audit of that component.

### For a Specific Component

#### 1. ARIA Attribute Review

Read the component source (`usa-[name].ts`) and check:
- All `role` attributes used — are they correct for the element type?
- `aria-label` / `aria-labelledby` / `aria-describedby` — properly set?
- `aria-expanded`, `aria-controls`, `aria-hidden` — used where needed?
- `aria-live` regions for dynamic content?
- `aria-required`, `aria-invalid` for form components?
- `tabindex` usage — correct values (0 for focusable, -1 for programmatic)?

#### 2. Keyboard Navigation

Check component source for keyboard event handling:
- `keydown` / `keyup` event listeners
- Arrow key navigation (for lists, menus, tabs)
- Enter/Space activation (for buttons, links, toggles)
- Escape to close (for modals, dropdowns, tooltips)
- Tab/Shift+Tab focus order
- Focus trap for modal dialogs

#### 3. Focus Management

Review:
- Is focus moved appropriately on open/close actions?
- Is focus restored when dialogs/menus close?
- Are focus indicators visible (handled by USWDS CSS)?
- Is `autofocus` used appropriately?

#### 4. Test Coverage

Read accessibility-related tests in `usa-[name].test.ts`:
- axe-core integration tests (look for `axe`, `toHaveNoViolations`)
- ARIA attribute assertion tests
- Keyboard interaction tests
- Focus management tests

Report what's covered and what's missing.

#### 5. USWDS Reference Comparison

Read the USWDS source:
```
node_modules/@uswds/uswds/packages/usa-[component]/src/index.js
```

Compare accessibility features in the USWDS reference vs. the web component implementation. Flag any gaps.

#### 6. WCAG 2.1 AA Checklist

Evaluate against relevant WCAG criteria:

| Criterion | Status | Notes |
|-----------|--------|-------|
| 1.3.1 Info & Relationships | Pass/Fail/N/A | Semantic HTML, ARIA |
| 1.4.3 Contrast (Minimum) | Pass (USWDS) | Handled by USWDS CSS |
| 2.1.1 Keyboard | Pass/Fail | All interactive elements reachable |
| 2.1.2 No Keyboard Trap | Pass/Fail | Focus not trapped unexpectedly |
| 2.4.3 Focus Order | Pass/Fail | Logical tab sequence |
| 2.4.7 Focus Visible | Pass (USWDS) | Handled by USWDS CSS |
| 4.1.2 Name, Role, Value | Pass/Fail | ARIA attributes correct |

### For All Components (High-Level)

#### 1. Run Project-Wide Accessibility Validation

```bash
pnpm run validate:accessibility
```

```bash
pnpm run test:a11y
```

#### 2. Scan All Components for axe-core Tests

Search for accessibility test patterns across all test files:
- Search for `axe` in `packages/uswds-wc-*/src/components/*/usa-*.test.ts`
- Count components WITH accessibility tests vs WITHOUT

#### 3. Check for Common A11y Anti-Patterns

Search the codebase for:
- Missing `aria-label` on icon-only buttons
- Images without alt text
- Form inputs without associated labels
- Click handlers without keyboard equivalents (look for `@click` without `@keydown`)
- `div` or `span` used for interactive elements instead of `button`/`a`

#### 4. Summary Report

```
Accessibility Audit Summary
============================
Components Audited: XX
With axe-core Tests: XX (XX%)
Keyboard Nav Tested: XX (XX%)
ARIA Coverage:       XX (XX%)

Issues Found:
  Critical: X
  Serious:  X
  Moderate: X
  Minor:    X

Components Needing Attention:
  - [component]: [issue summary]
```
