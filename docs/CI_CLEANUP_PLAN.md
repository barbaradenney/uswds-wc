# CI/CD Cleanup Plan

**Goal**: Get all CI processes working comprehensively without skipped tests or missing tokens.

**Created**: 2025-11-26
**Status**: In Progress

## Overview

This document tracks all skipped tests and missing tokens in our CI/CD pipeline, with priority levels and action plans.

## 1. Skipped Tests

### High Priority

#### 1.1 Modal Browser Tests (`usa-modal.browser.test.ts`)

**File**: `packages/uswds-wc-feedback/src/components/modal/usa-modal.browser.test.ts`

**Status**: ✅ RESOLVED - File to be deleted (duplicate coverage)

**Reason**: Tests fail in jsdom environment, but **comprehensive Cypress coverage already exists**

**Existing Cypress Coverage**:
- `usa-modal.component.cy.ts` (53 tests)
- `usa-modal.behavioral.cy.ts` (20 tests)
- `usa-modal-timing-regression.component.cy.ts` (11 tests)
- `cypress/e2e/modal-*.cy.ts` (4 additional test files)

**Total**: 84+ tests in Cypress covering all browser-specific functionality

**Action Plan**:
1. Delete `usa-modal.browser.test.ts` (2333 lines of duplicate coverage)
2. Document in test file header that browser tests run in Cypress
3. Update vitest config to remove browser test pattern

**Priority**: HIGH - Reduce test duplication, improve maintainability

#### 1.2 Tooltip Browser Tests (`usa-tooltip.browser.test.ts`)

**File**: `packages/uswds-wc-feedback/src/components/tooltip/usa-tooltip.browser.test.ts`

**Status**: ✅ RESOLVED - File to be deleted (duplicate coverage)

**Reason**: Tests fail in jsdom environment, but **comprehensive Cypress coverage already exists**

**Existing Cypress Coverage**:
- `usa-tooltip.component.cy.ts`
- `usa-tooltip-timing-regression.component.cy.ts`
- `cypress/e2e/tooltip.cy.ts`
- `cypress/e2e/tooltip-positioning.cy.ts`

**Total**: 4 Cypress test files covering all browser-specific functionality

**Action Plan**:
1. Delete `usa-tooltip.browser.test.ts` (275 lines of duplicate coverage)
2. Document in test file header that browser tests run in Cypress
3. Update vitest config to remove browser test pattern

**Priority**: HIGH - Reduce test duplication, improve maintainability

### Medium Priority

#### 1.3 Process List Performance Tests (`usa-process-list.test.ts`)

**File**: `packages/uswds-wc-layout/src/components/process-list/usa-process-list.test.ts`

**Status**: ⚠️ 2 tests conditionally skipped in CI only

**Skipped Tests**:
- `should handle large lists efficiently`
- Performance test for large lists

**Reason**: `it.skipIf(process.env.CI === 'true')` - Performance tests may be too slow/flaky in CI

**Impact**: No CI validation of performance characteristics

**Action Plan**:
1. Investigate if performance tests can be made faster/more reliable
2. Consider moving to separate performance test suite
3. Document if intentional skip is correct approach

**Priority**: MEDIUM - Performance testing, not core functionality

## 2. Missing Tokens/Secrets

### Critical Priority

#### 2.1 CHROMATIC_PROJECT_TOKEN

**Used In**:
- `.github/workflows/visual-regression.yml` (ACTIVE)
- `.github/workflows/visual-testing.yml` (DISABLED due to missing token)
- `.github/workflows/comprehensive-testing.yml`

**Purpose**: Visual regression testing with Chromatic

**Impact**:
- Visual regression tests cannot run
- No visual change detection in PRs
- One workflow completely disabled

**Status**: ❌ NOT CONFIGURED

**Action Plan**:
1. User needs to create Chromatic account
2. Get project token from Chromatic dashboard
3. Add to GitHub repository secrets
4. Re-enable `visual-testing.yml`

**Priority**: CRITICAL - Visual testing completely blocked

#### 2.2 NPM_TOKEN

**Used In**:
- `.github/workflows/release.yml`

**Purpose**: Publishing packages to npm registry

**Impact**: Cannot publish releases

**Status**: ❌ NOT CONFIGURED

**Action Plan**:
1. User needs to create npm account/organization
2. Generate publish token
3. Add to GitHub repository secrets

**Priority**: CRITICAL - Required for releases

### High Priority

#### 2.3 CODECOV_TOKEN

**Used In**:
- `.github/workflows/quality-gates.yml`
- `.github/workflows/ci.yml`

**Purpose**: Code coverage reporting and tracking

**Impact**: No coverage reports, quality gates may fail

**Status**: ❌ NOT CONFIGURED

**Action Plan**:
1. Create Codecov account
2. Link repository
3. Get token and add to GitHub secrets

**Priority**: HIGH - Quality metrics

#### 2.4 SNYK_TOKEN

**Used In**:
- `.github/workflows/security.yml`

**Purpose**: Security vulnerability scanning

**Impact**: No automated security scanning

**Status**: ❌ NOT CONFIGURED

**Action Plan**:
1. Create Snyk account
2. Get API token
3. Add to GitHub repository secrets

**Priority**: HIGH - Security concerns

### Medium Priority

#### 2.5 TURBO_TOKEN and TURBO_TEAM

**Used In**:
- `.github/workflows/ci.yml`

**Purpose**: Turborepo remote caching in CI

**Impact**: Slower CI builds without remote cache

**Status**: ❌ NOT CONFIGURED

**Action Plan**:
1. Create Vercel account (Turborepo owner)
2. Get Turbo token and team slug
3. Add to GitHub repository secrets

**Priority**: MEDIUM - Performance optimization, not blocking

**Note**: Local development already has remote caching configured (see `docs/TURBOREPO_REMOTE_CACHE_SETUP.md`)

#### 2.6 LHCI_GITHUB_APP_TOKEN

**Used In**:
- `.github/workflows/performance-regression.yml`

**Purpose**: Lighthouse CI performance testing

**Impact**: No automated performance regression testing

**Status**: ❌ NOT CONFIGURED

**Action Plan**:
1. Set up Lighthouse CI GitHub App
2. Get app token
3. Add to GitHub repository secrets

**Priority**: MEDIUM - Performance monitoring

## 3. Disabled Workflows

### 3.1 Visual Testing Workflow

**File**: `.github/workflows/visual-testing.yml`

**Status**: ❌ DISABLED with `if: false`

**Reason**: Missing `CHROMATIC_PROJECT_TOKEN`

**Action Plan**: Re-enable after configuring token (see 2.1)

## 4. Implementation Order

### Phase 1: Browser Test Migration (Week 1)
1. ✅ Document all issues (this file)
2. 🔲 Create Playwright test suite for modal browser tests
3. 🔲 Create Playwright test suite for tooltip browser tests
4. 🔲 Remove `.skip` from unit tests
5. 🔲 Verify all tests pass

### Phase 2: Critical Tokens (Week 1-2)
1. 🔲 Configure CHROMATIC_PROJECT_TOKEN
2. 🔲 Re-enable visual-testing.yml
3. 🔲 Verify visual regression tests work
4. 🔲 Configure NPM_TOKEN (for future releases)

### Phase 3: Quality & Security Tokens (Week 2)
1. 🔲 Configure CODECOV_TOKEN
2. 🔲 Configure SNYK_TOKEN
3. 🔲 Verify quality gates and security workflows

### Phase 4: Optimization Tokens (Week 3)
1. 🔲 Configure TURBO_TOKEN and TURBO_TEAM
2. 🔲 Configure LHCI_GITHUB_APP_TOKEN
3. 🔲 Verify performance improvements

### Phase 5: Performance Tests (Week 3)
1. 🔲 Investigate process-list performance tests
2. 🔲 Either optimize or document intentional skip

## 5. Success Criteria

- ✅ All test suites run without `.skip`
- ✅ All workflows enabled and functional
- ✅ All required tokens configured
- ✅ Visual regression tests working
- ✅ Security scanning active
- ✅ Code coverage reporting active
- ✅ Performance testing active

## 6. Token Configuration Guide

### Where to Add Secrets

GitHub Repository → Settings → Secrets and variables → Actions → New repository secret

### Required Secrets Summary

| Secret Name | Purpose | Priority | Provider |
|-------------|---------|----------|----------|
| CHROMATIC_PROJECT_TOKEN | Visual regression | CRITICAL | chromatic.com |
| NPM_TOKEN | Package publishing | CRITICAL | npmjs.com |
| CODECOV_TOKEN | Coverage reporting | HIGH | codecov.io |
| SNYK_TOKEN | Security scanning | HIGH | snyk.io |
| TURBO_TOKEN | Remote caching | MEDIUM | vercel.com |
| TURBO_TEAM | Remote caching | MEDIUM | vercel.com |
| LHCI_GITHUB_APP_TOKEN | Performance testing | MEDIUM | GitHub Apps |

## 7. Documentation Updates Needed

After completion:
- [ ] Update `docs/TESTING_GUIDE.md` with browser test patterns
- [ ] Update `docs/CI_CD_IMPROVEMENTS.md` with token configuration
- [ ] Create `docs/SECRETS_CONFIGURATION_GUIDE.md`
- [ ] Update `README.md` with CI status badges

## 8. Notes

- Some tokens require external service accounts (user decision)
- Browser test migration is technical work (can be done immediately)
- Token configuration depends on service sign-ups (user action required)
- Performance test skip may be intentional (needs investigation)

## 9. Related Documentation

- [docs/TESTING_GUIDE.md](TESTING_GUIDE.md) - Testing strategy
- [docs/CI_CD_IMPROVEMENTS.md](CI_CD_IMPROVEMENTS.md) - Recent CI fixes
- [docs/TURBOREPO_REMOTE_CACHE_SETUP.md](TURBOREPO_REMOTE_CACHE_SETUP.md) - Turbo cache setup
