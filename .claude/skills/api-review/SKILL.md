---
name: api-review
description: API consistency review across all USWDS web components — checks property naming, event naming, slot conventions, attribute mapping, and API shape against USWDS source. Use when checking component API consistency or preparing for a major release.
argument-hint: "[optional: 'properties', 'events', 'slots', or component-name]"
---

# API Review — USWDS Web Components Consistency Audit

You are acting as a component API architect. Review the public API surface of all web components for consistency, naming conventions, and USWDS alignment.

## Instructions

If `$ARGUMENTS` specifies a focus area ("properties", "events", "slots") or a specific component, narrow the review. Otherwise, perform a full API consistency audit.

### 1. Read Component API Manifest

Check if a Custom Elements Manifest exists:
```
custom-elements.json
```

If it exists, read it for the authoritative API surface. If not, generate it:
```bash
pnpm run analyze
```

Then read the generated `custom-elements.json`.

### 2. Property Naming Consistency

Scan all component source files (`usa-*.ts`) across all packages for `@property()` decorators. Collect:
- All property names and their types
- Attribute names (via `attribute:` option or automatic conversion)
- Default values

Check for inconsistencies:
- **Boolean naming**: should all use the same pattern (e.g., `disabled` vs `isDisabled`)
- **Size properties**: consistent values (e.g., `"small"`, `"big"` vs `"sm"`, `"lg"`)
- **Variant properties**: consistent naming (e.g., `variant` vs `type` vs `kind`)
- **Label properties**: consistent naming (e.g., `label` vs `ariaLabel` vs `heading`)
- **Attribute reflection**: are all public properties reflected to attributes?

Present findings in a table:

| Pattern | Components Using | Consistent? |
|---------|-----------------|-------------|
| `disabled` (boolean) | button, input, ... | Yes/No |
| `variant` (string) | alert, tag, ... | Yes/No |

### 3. Event Naming Consistency

Search for `this.dispatchEvent` and `@event` JSDoc tags across all components. Collect:
- All custom event names
- Event detail types
- Bubbling/composed configuration

Check conventions:
- Do all events use a consistent prefix pattern? (e.g., `usa-` prefix or no prefix)
- Are event names kebab-case?
- Do similar interactions use the same event name? (e.g., open/close events)
- Are CustomEvent detail types documented?

### 4. Slot Naming Conventions

Search for `<slot` usage and slot-related documentation across all components:
- Default slots
- Named slots
- Slot naming patterns

Check:
- Are named slots using consistent kebab-case?
- Do similar components use the same slot names for similar purposes?
- Are slots documented in README.mdx files?

### 5. USWDS Attribute Alignment

For each component, compare the web component's public API against the USWDS source:
```
node_modules/@uswds/uswds/packages/usa-[component]/src/
```

Check:
- Does the web component expose all USWDS data attributes as properties?
- Are USWDS class modifiers accessible via component properties?
- Are there USWDS features not yet exposed through the component API?

Run the attribute mapping validator:
```bash
pnpm run validate:attribute-mapping
```

### 6. API Surface Summary

Provide a comprehensive API report:

```
API Consistency Report
======================

Total Components: XX
Total Properties: XX
Total Events: XX
Total Slots: XX

Naming Consistency Score: XX%

Inconsistencies Found:
  - [description of inconsistency]
  - [description of inconsistency]

Missing USWDS Attributes:
  - [component]: [missing attribute]

Recommendations:
  1. [suggestion]
  2. [suggestion]
```

### 7. Breaking Change Risk

If inconsistencies are found, assess:
- Which fixes would be breaking changes?
- Which can be added as aliases (non-breaking)?
- Suggested migration path for any breaking fixes
