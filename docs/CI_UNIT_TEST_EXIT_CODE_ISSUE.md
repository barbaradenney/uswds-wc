# CI Unit Test Exit Code Issue

## Problem Description

The CI/CD pipeline's "Unit Tests" job is failing even though all tests pass.

## Symptoms

- All 20,122 unit tests PASS (0 failures)
- The `pnpm test` command returns exit code 1
- This causes the entire CI job to fail
- Codecov upload subsequently fails with "Token required - not valid tokenless upload"

## Investigation Timeline

**Date**: 2025-11-13

### Initial Observations
- PR #45: https://github.com/barbaradenney/uswds-wc/pull/45
- CI Run: 19323022902
- Branch: `fix/cypress-test-failures`
- Tests: 20,122 passed, 0 failed
- Exit Code: 1 (failure)

### Steps Attempted

1. **Added CODECOV_TOKEN to GitHub Secrets** ✅
   - Token created at 15:46:36
   - Re-ran workflow with token in place
   - Issue persisted

2. **Investigated Codecov**
   - Found known issue with `codecov-action@v4`
   - Error: "Token required - not valid tokenless upload" for protected branches
   - Workflow already has `continue-on-error: true` for Codecov upload (line 113)
   - This is NOT the root cause

3. **Identified Root Cause**
   - The `pnpm test` step (line 102) returns exit code 1
   - Even though all tests pass successfully
   - This causes subsequent steps to fail

## Root Cause Analysis

**Suspected Issues**:
1. One of the monorepo packages may have a test configuration issue
2. Turborepo test caching may be returning a non-zero exit code
3. A package's test script may have additional checks beyond test execution
4. Build dependencies for tests may be failing

## Reproduction

Local testing required to determine if this is a CI-specific issue or reproducible locally.

```bash
pnpm test
echo "Exit code: $?"
```

## Proposed Solutions

### Option A: Investigate Test Package Failures (PREFERRED)
1. Run `pnpm test` locally and check exit code
2. Run `pnpm test --filter <package>` for each package individually
3. Identify which package is returning exit code 1
4. Fix the underlying issue in that package

### Option B: Add Explicit Error Handling (TEMPORARY)
Add `|| true` to the test command in CI to prevent false failures while investigating:

```yaml
- name: Run all unit tests
  run: pnpm test || true  # TEMPORARY: Allow exit code 1 while investigating
  env:
    TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
    TURBO_TEAM: ${{ secrets.TURBO_TEAM }}
```

**Trade-offs**: This allows CI to pass but masks the real issue.

### Option C: Split Test and Coverage Jobs
Separate unit testing from coverage generation:

```yaml
test:
  - name: Run unit tests (non-blocking)
    run: pnpm test
    continue-on-error: true

coverage:
  needs: test
  - name: Generate coverage
    run: pnpm run test:coverage
```

## Decision

Following the project rule: **"Failures should never be skipped. They should be placed on a document to fix later or fixed when found."**

**Action Plan**:
1. ✅ Document this issue (this file)
2. ⏳ Investigate locally to find root cause
3. ⏳ Apply proper fix once root cause is identified
4. ⏳ Remove any temporary workarounds

## Status

- **Created**: 2025-11-13
- **Status**: INVESTIGATING
- **Priority**: HIGH (blocks CI/CD pipeline)
- **Assigned**: Needs investigation

## Related Issues

- Codecov token issue (RESOLVED - not the root cause)
- PR #45 blocked by this issue

## Next Steps

1. Run `pnpm test` locally and capture exit code
2. If exit code is 0 locally, this is a CI-specific issue
3. If exit code is 1 locally, investigate which package is failing
4. Apply targeted fix to the failing package

## Resolution

*(To be updated once issue is resolved)*
