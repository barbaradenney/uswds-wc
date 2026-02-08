---
name: product-review
description: Product manager view of the USWDS web components library — component inventory, coverage gaps, compliance status, recent changes, and release readiness. Use when discussing roadmap, component coverage, release notes, or project health from a PM perspective.
argument-hint: "[optional: focus area like 'coverage', 'releases', 'issues']"
---

# Product Review — USWDS Web Components

You are acting as a product management assistant for the USWDS Web Components library. Provide a comprehensive product overview covering inventory, compliance, recent activity, and gaps.

## Instructions

When invoked, perform ALL of the following sections. If `$ARGUMENTS` specifies a focus area (e.g., "coverage", "releases", "issues"), emphasize that section but still provide a brief summary of all others.

### 1. Component Inventory

Scan all feature packages to count components:

```
packages/uswds-wc-actions/src/components/
packages/uswds-wc-forms/src/components/
packages/uswds-wc-navigation/src/components/
packages/uswds-wc-data-display/src/components/
packages/uswds-wc-feedback/src/components/
packages/uswds-wc-layout/src/components/
packages/uswds-wc-structure/src/components/
```

For each package, list the component directories found. Present a summary table:

| Package | Component Count | Components |
|---------|----------------|------------|
| actions | N | usa-button, ... |

### 2. USWDS Coverage Gap Analysis

Compare implemented components against the full USWDS component catalog. The official USWDS components include (at minimum):
accordion, alert, banner, breadcrumb, button, button-group, card, character-count, checkbox, collection, combo-box, date-picker, date-range-picker, dropdown (select), file-input, footer, form, header, icon, icon-list, identifier, in-page-navigation, input-prefix-suffix, link, list, memo, modal, pagination, process-list, prose, radio, range-slider, search, side-navigation, site-alert, step-indicator, summary-box, table, tag, text-input, textarea, time-picker, tooltip, validation.

Identify which USWDS components are NOT yet implemented as web components.

### 3. Compliance Status

Run or read the output of compliance checking:
- `pnpm run validate:uswds-compliance` (if quick) or read recent validation output
- Report the compliance score (target: 46/46)
- Note any components with compliance issues

### 4. Recent Activity

Use git and GitHub CLI to gather:
- Recent commits (last 10-15): `git log --oneline -15`
- Open PRs: `gh pr list --state open` (if gh is available)
- Open issues: `gh issue list --state open --limit 10` (if gh is available)
- Recent tags/releases: `git tag --sort=-creatordate | head -5`

Summarize changes suitable for release notes.

### 5. Release Readiness Assessment

Check:
- Are all tests passing? (`pnpm test` recent status or `pnpm run health:check`)
- Any discovered issues blocking? (`cat .git/DISCOVERED_ISSUES.json 2>/dev/null`)
- Bundle versions across packages: read `packages/*/package.json` version fields
- Any pending deprecations or breaking changes in recent commits?

### 6. Output Format

Present findings in a structured report with:
- Executive summary (2-3 sentences)
- Detailed sections with tables where appropriate
- Action items / recommendations at the bottom
- Use markdown formatting for readability
