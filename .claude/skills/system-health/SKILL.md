---
name: system-health
description: Design system health dashboard — runs health check, reports bundle sizes, component count, test count, compliance score, USWDS version, and lists components with issues. Use when checking overall project status, system health, or before releases.
argument-hint: "[optional: 'quick' for fast summary, 'full' for deep analysis]"
---

# System Health — USWDS Web Components Dashboard

You are acting as a design system health monitor. Provide a comprehensive health dashboard for the entire USWDS Web Components library.

## Instructions

Run a health assessment. If `$ARGUMENTS` is "quick", provide a condensed summary. If "full" or no argument, provide the complete analysis.

### 1. Quick Health Check

Run the built-in health check:
```bash
pnpm run health:check
```

Report the output — this provides the fastest overview of project status.

### 2. Component Census

Count components across all packages by scanning directories:
```
packages/uswds-wc-actions/src/components/
packages/uswds-wc-forms/src/components/
packages/uswds-wc-navigation/src/components/
packages/uswds-wc-data-display/src/components/
packages/uswds-wc-feedback/src/components/
packages/uswds-wc-layout/src/components/
packages/uswds-wc-structure/src/components/
```

Report total component count and per-package breakdown.

### 3. Test Health

Gather test metrics:
- Count test files: `find packages/uswds-wc-*/src -name "*.test.ts" | wc -l`
- Check for recent test failures in CI or local runs
- Check test timing validation: `pnpm run validate:test-timing`
- Skipped test count: `pnpm run audit:skipped-tests --json`

### 4. USWDS Version & Sync Status

Check:
- USWDS package version: read from `node_modules/@uswds/uswds/package.json`
- Installed version vs declared dependency in root `package.json`
- Any USWDS sync issues

### 5. Compliance Score

Run compliance validation:
```bash
pnpm run validate:uswds-compliance
```

Report:
- Overall score (target: 46/46 = 100%)
- Any non-compliant components and their issues

### 6. Bundle Size Report

Check bundle sizes:
```bash
pnpm run validate:bundle-size 2>/dev/null || echo "Bundle size validation not available"
```

Also check individual package sizes by reading their `package.json` files and any build output.

### 7. Discovered Issues

Check for blocking issues:
```bash
cat .git/DISCOVERED_ISSUES.json 2>/dev/null || echo "No discovered issues"
```

### 8. Package Versions

Read version fields from all package.json files to check version alignment:
```
packages/*/package.json → version field
```

Flag any version inconsistencies.

### 9. Dependency Health

Check for:
- Outdated dependencies (if time permits): note key dependencies and their versions
- Peer dependency warnings
- Any `pnpm audit` security issues

### 10. Dashboard Output

Present a health dashboard:

```
USWDS Web Components — Health Dashboard
========================================

Overall Status: HEALTHY / DEGRADED / CRITICAL

Components:    XX total (across Y packages)
Tests:         XXXX passing / X failing / X skipped
Compliance:    XX/XX (100%)
USWDS Version: X.X.X
Bundle:        XXX KB total

Package Status:
  actions      ✅  X components | vX.X.X
  forms        ✅  X components | vX.X.X
  navigation   ✅  X components | vX.X.X
  data-display ✅  X components | vX.X.X
  feedback     ✅  X components | vX.X.X
  layout       ✅  X components | vX.X.X
  structure    ✅  X components | vX.X.X

Issues: X blocking | X warnings
```

Add recommendations for any degraded areas.
