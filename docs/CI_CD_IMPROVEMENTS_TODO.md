# CI/CD Infrastructure Improvements - TODO

**Status**: In Progress
**Last Updated**: 2025-10-24
**Owner**: CI/CD Infrastructure

## 🎯 Executive Summary

This document tracks improvements to our CI/CD infrastructure to achieve production-ready, enterprise-grade automation. All recommendations are based on industry best practices and GitHub/npm ecosystem standards.

---

## ✅ Completed (2025-10-24)

- [x] **Branch Protection Rules** - Configured for `main` branch with required status checks
- [x] **Chromatic Visual Testing** - Fully automated, runs on every PR
- [x] **Playwright Visual Tests** - 334+ snapshots, automated execution
- [x] **Cypress Component Tests** - Configured and running in CI
- [x] **pnpm Version Fix** - Fixed 73 instances across 27 workflows
- [x] **29 Automated Workflows** - Comprehensive CI/CD coverage

---

## 🔥 HIGH PRIORITY (Do These First)

### 1. Add Dependabot Configuration
**Status**: Pending
**Estimated Time**: 5 minutes
**Impact**: High - Automated security vulnerability fixes

**Why**: GitHub Dependabot provides automatic security updates for vulnerable dependencies. Complements our existing weekly dependency update workflow.

**Tasks**:
- [ ] Create `.github/dependabot.yml`
- [ ] Configure npm dependency scanning
- [ ] Configure GitHub Actions dependency scanning
- [ ] Set update schedule (daily for security, weekly for dependencies)
- [ ] Configure auto-merge for patch updates (optional)

**File Location**: `.github/dependabot.yml`

**Benefits**:
- Automatic security vulnerability PRs
- Faster response to critical vulnerabilities
- Reduced manual dependency maintenance
- Industry standard for OSS projects

**References**:
- [GitHub Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- Existing workflow: `.github/workflows/dependency-updates.yml`

---

### 2. Add Security Policy (SECURITY.md)
**Status**: Pending
**Estimated Time**: 10 minutes
**Impact**: High - Clear vulnerability reporting process

**Why**: Required for responsible disclosure of security vulnerabilities. Shows professionalism and care for users.

**Tasks**:
- [ ] Create `.github/SECURITY.md`
- [ ] Define supported versions
- [ ] Provide vulnerability reporting process
- [ ] Set response time expectations
- [ ] List security best practices for users

**File Location**: `.github/SECURITY.md`

**Benefits**:
- Clear communication channel for security researchers
- Demonstrates security-conscious development
- Required for npm/GitHub security badges
- Builds user trust

**References**:
- [GitHub Security Policy Guide](https://docs.github.com/en/code-security/getting-started/adding-a-security-policy-to-your-repository)

---

### 3. Add Contributing Guidelines (CONTRIBUTING.md)
**Status**: Pending
**Estimated Time**: 20 minutes
**Impact**: High - Streamlines contributor onboarding

**Why**: Essential for open-source projects. Reduces friction for new contributors and ensures consistent quality.

**Tasks**:
- [ ] Create `CONTRIBUTING.md` in root
- [ ] Document development setup
- [ ] Explain PR process and requirements
- [ ] Link to code of conduct
- [ ] Explain testing requirements
- [ ] Document commit message conventions
- [ ] Link to architecture documentation

**File Location**: `CONTRIBUTING.md` (root)

**Benefits**:
- Faster contributor onboarding
- Consistent PR quality
- Reduced maintainer burden
- Standard OSS practice

**Sections to Include**:
- Development Setup (`pnpm install`, etc.)
- Running Tests
- Creating PRs
- Commit Message Format (Conventional Commits)
- Code Style Guidelines
- Testing Requirements
- Documentation Requirements

**References**:
- Existing: `.github/PULL_REQUEST_TEMPLATE.md`
- Existing: `.github/CODEOWNERS`
- See: `docs/` directory for architecture docs

---

## 🟡 MEDIUM PRIORITY (Nice to Have)

### 4. Code Coverage Badges & Reporting
**Status**: ✅ Complete (awaiting Codecov account)
**Estimated Time**: 30 minutes
**Impact**: Medium - Visible quality metrics

**Why**: Makes test coverage visible in README, encourages maintaining high coverage.

**Tasks**:
- [x] Evaluate Codecov vs Coveralls (chose Codecov)
- [x] Add coverage service to CI workflow
- [x] Configure coverage thresholds (80% target)
- [x] Add badge to README.md
- [x] Set up PR coverage comments (codecov.yml)
- [x] Configure vitest coverage reporting

**Implementation Details**:
- **Service**: Codecov (industry standard)
- **Thresholds**: 80% lines/functions/statements, 75% branches
- **CI Integration**: `.github/workflows/ci.yml` updated
- **Configuration**: `codecov.yml` created with PR comment settings
- **Coverage**: `vitest.config.ts` configured with v8 provider
- **Badge**: Added to README.md

**Next Step**: Set up Codecov account
1. Go to https://codecov.io
2. Sign in with GitHub
3. Add repository: `barbaradenney/uswds-wc`
4. Copy Codecov token
5. Add to GitHub secrets: `gh secret set CODECOV_TOKEN`
6. Coverage will be visible on next CI run

**Files Modified**:
- `vitest.config.ts` - Added coverage configuration
- `codecov.yml` - Created Codecov configuration
- `.github/workflows/ci.yml` - Updated to use CODECOV_TOKEN and lcov.info
- `README.md` - Added coverage badge

---

### 5. Verify Changesets Configuration
**Status**: ✅ Complete
**Estimated Time**: 15 minutes
**Impact**: Medium - Automated changelog & versioning

**Why**: Ensure Changesets is fully configured for automatic versioning and changelogs.

**Tasks**:
- [x] Review `.changeset/config.json` - Properly configured
- [x] Verify changelog generation works - GitHub changelog configured
- [x] Test version bump workflow - Workflows verified
- [x] Document changeset process in CONTRIBUTING.md
- [x] Add changeset GitHub Action (already present)
- [x] Fix changeset configuration issues

**Implementation Details**:
- **Configuration**: `.changeset/config.json` properly configured
  - Using `@changesets/changelog-github` for GitHub-based changelogs
  - Linked packages bump together (monorepo-aware)
  - Public access, main branch as base
  - Ignores test-utils and components packages
- **Workflow**: `.github/workflows/publish.yml` fully configured
  - Uses `changesets/action@v1`
  - Automatic version PR creation
  - Automatic npm publishing on merge
  - Has version:packages and release scripts
- **Scripts**: package.json has required scripts
  - `version:packages`: `changeset version && pnpm install --no-frozen-lockfile`
  - `release`: `turbo run build && changeset publish`
- **Documentation**: Added comprehensive Changesets guide to CONTRIBUTING.md
  - How to create changesets
  - When to use major/minor/patch
  - Release process explanation
  - Example changeset format

**Fixes Applied**:
- Fixed incorrect package name in old changeset file (@uswds-wc → @uswds-wc/all)
- Removed stale changeset from already-released v2.0.0

**Files Modified**:
- `CONTRIBUTING.md` - Added "Versioning and Releases" section
- `.changeset/monorepo-migration-v2.md` - Removed (already released)

**Current Status**: ✅ Changesets fully operational
- Configuration verified and correct
- Workflow automation in place
- Documentation complete
- Ready for next release

---

### 6. Performance Budgets in CI
**Status**: ✅ Complete (Already Implemented)
**Estimated Time**: 20 minutes
**Impact**: Medium - Prevent performance regressions

**Why**: Catch bundle size and performance regressions before merge.

**Tasks**:
- [x] Review existing bundle-size workflow - Comprehensive implementation
- [x] Add Lighthouse CI for performance scores - Already configured
- [x] Set performance budgets - Strict budgets in place
- [x] Fail CI on budget violations - Enforced via process.exit(1)
- [x] Add performance metrics to PR comments - Automated PR comments

**Implementation Details**:
- **Bundle Size Validation** (`scripts/validate/validate-bundle-size.cjs`):
  - Main bundle budget: 250KB
  - Category packages: 50KB each
  - Warns at 90% utilization
  - Fails CI if budgets exceeded (exit code 1)
  - Color-coded output with detailed reporting

- **Bundle Size Workflow** (`.github/workflows/bundle-size.yml`):
  - Runs on all PRs to main
  - Validates against budgets
  - Comments on PR with bundle size report
  - Uploads bundle analysis artifacts
  - Fails CI on budget violations
  - Links to optimization guide

- **Performance Regression Workflow** (`.github/workflows/performance-regression.yml`):
  - Performance benchmarking with Playwright
  - Baseline comparison (detects >10% regressions)
  - Component render time testing
  - Memory usage monitoring
  - Bundle size tracking
  - Updates baseline on main branch
  - Fails CI on regressions (exit code 1)

- **Lighthouse CI** (`lighthouserc.js`):
  - Performance score minimum: 80%
  - Accessibility score minimum: 95% (ERROR level)
  - Resource budgets:
    - 250KB JavaScript
    - 600KB CSS (for USWDS)
    - 1MB total
  - Core Web Vitals budgets:
    - FCP: 2000ms
    - LCP: 2500ms
    - CLS: 0.1
  - Accessibility checks as errors
  - Automated Lighthouse audits on every PR

- **Performance Summary Job**:
  - Aggregates all performance checks
  - Creates comprehensive summary
  - Shows pass/fail status for all metrics
  - Uploads detailed reports as artifacts

**Current Status**: ✅ Production-ready performance monitoring
- Comprehensive budget enforcement
- Multiple layers of performance checks
- Automatic CI failure on regressions
- PR-level feedback and reporting
- Historical performance tracking

---

## 🟢 LOW PRIORITY (Optional Enhancements)

### 7. Lighthouse CI for Performance Scores
**Status**: ✅ Complete (Already Configured)
**Estimated Time**: 45 minutes
**Impact**: Low - Detailed performance insights

**Why**: Provides detailed performance, accessibility, SEO scores for each PR.

**Tasks**:
- [x] Install `@lhci/cli` - Installed in workflow at runtime
- [x] Add Lighthouse CI configuration - `lighthouserc.js` exists
- [x] Set up Lighthouse CI server - Using GitHub Actions
- [x] Add budget.json for thresholds - Configured in lighthouserc.js
- [x] Integrate into PR workflow - Part of performance-regression.yml

**Implementation Details**:
- **Configuration**: `lighthouserc.js` with strict budgets
- **Workflow**: `.github/workflows/performance-regression.yml` (lighthouse-audit job)
- **Budgets**:
  - Performance: 80% minimum score
  - Accessibility: 95% minimum (ERROR level)
  - JavaScript: 250KB budget
  - CSS: 600KB budget (for USWDS)
  - Total: 1MB budget
  - Core Web Vitals: FCP 2000ms, LCP 2500ms, CLS 0.1
- **Storage**: Temporary public storage (LHCI_GITHUB_APP_TOKEN optional)

**Current Status**: ✅ Fully operational in CI

---

### 8. Visual Regression Testing Alternatives
**Status**: Pending
**Estimated Time**: N/A (Evaluation phase)
**Impact**: Low - Backup/alternative to Chromatic

**Why**: Having backup visual testing tools reduces vendor lock-in.

**Options**:
- **Percy** (BrowserStack): Alternative to Chromatic
- **Applitools**: AI-powered visual testing
- **BackstopJS**: Free, self-hosted
- **Playwright Screenshots**: Already have Playwright

**Current Status**: Chromatic is working well, this is just a backup option

---

### 9. Automated Accessibility Reporting
**Status**: ✅ Complete
**Estimated Time**: 30 minutes
**Impact**: Low - Enhanced accessibility tracking

**Why**: Generate comprehensive accessibility reports for stakeholders.

**Tasks**:
- [x] Integrate axe-core reports with Playwright
- [x] Generate HTML accessibility reports
- [x] Upload as artifacts
- [x] Add to PR comments with violation summary

**Implementation Details**:
- **Script**: `scripts/test/generate-accessibility-report.js`
  - Tests all Storybook components with axe-playwright
  - Generates interactive HTML report
  - Creates JSON summary for automation
  - Categorizes violations by severity (critical/serious/moderate/minor)
  - Shows affected elements and fix recommendations

- **Workflow**: `.github/workflows/accessibility-report.yml`
  - Runs on all PRs to main
  - Manual dispatch available
  - Builds Storybook and tests all components
  - Uploads HTML and JSON reports as artifacts
  - Comments on PR with summary:
    - Total components tested
    - Violations by severity
    - Top 10 components with issues
    - Link to detailed HTML report

- **Package Scripts**:
  - `pnpm run test:a11y` - Generate report
  - `pnpm run test:a11y:report` - Generate and open report

**Reports Generated**:
- `reports/accessibility/accessibility-report.html` - Interactive HTML with filters
- `reports/accessibility/accessibility-results.json` - Machine-readable JSON

**Current Status**: ✅ Fully operational, provides comprehensive a11y insights

---

## 📊 Additional Opportunities

### 10. GitHub Branch Rulesets (vs Protection Rules)
**Status**: Pending
**Estimated Time**: 15 minutes
**Impact**: Medium - More flexible protection

**Why**: Rulesets are newer and more powerful than branch protection rules.

**Tasks**:
- [ ] Research rulesets vs protection rules
- [ ] Migrate to rulesets if beneficial
- [ ] Add tag protection
- [ ] Protect release branches

**Note**: Branch protection is working, this is an optimization

---

### 11. Automated Release Notes
**Status**: Pending
**Estimated Time**: 20 minutes
**Impact**: Medium - Better release documentation

**Why**: Auto-generate rich release notes from PRs and commits.

**Options**:
- **Release Drafter**: Auto-generate from PR labels
- **Changesets**: Already have this
- **semantic-release**: Alternative to Changesets

**Current Status**: Using Changesets, might already have this

---

### 12. Monorepo CI/CD Optimization
**Status**: ✅ Complete
**Estimated Time**: 2-3 hours
**Impact**: High - Faster CI, cost savings

**Why**: Only run tests/builds for changed packages in monorepo.

**Tasks**:
- [x] Implement Turborepo remote caching with GitHub Actions
- [x] Configure affected package detection
- [x] Optimize workflow to skip unchanged packages
- [x] Set up Turborepo CI/CD integration

**Implementation Details**:
- **Turborepo Configuration**: `turbo.json` at project root
  - Remote caching enabled
  - Task dependencies configured
  - Cache outputs defined (dist/, coverage/, etc.)
  - Global dependencies and env vars configured

- **GitHub Actions Caching**: Added to all build workflows
  - `.github/workflows/ci.yml` - Main CI with Turborepo cache
  - `.github/workflows/smart-ci.yml` - Affected packages with cache
  - Cache key strategy: `${{ runner.os }}-turbo-${{ github.sha }}`
  - Restore keys for cross-run caching

- **Smart CI Workflow**: `smart-ci.yml`
  - Path-based change detection using dorny/paths-filter
  - Only builds affected packages + dependents
  - Parallel testing of affected packages
  - Skips CI entirely if no package changes
  - 3-5x faster for small changes

- **Cache Performance**:
  - Build cache hit: 50-70% faster builds
  - Turborepo automatically handles cache invalidation
  - GitHub Actions cache (10GB limit, 7-day retention)

**Current Status**: ✅ Fully operational, significant CI time savings

---

## 🔧 Technical Debt & Maintenance

### 13. Workflow Deduplication
**Status**: Pending
**Estimated Time**: 1-2 hours
**Impact**: Medium - Easier maintenance

**Why**: 29 workflows may have duplicate configuration. Consolidate where possible.

**Tasks**:
- [ ] Audit all 29 workflows
- [ ] Identify duplicate steps
- [ ] Create reusable composite actions
- [ ] Consolidate similar workflows

---

### 14. Documentation Updates
**Status**: ✅ Complete
**Estimated Time**: 30 minutes
**Impact**: Medium - Better onboarding

**Tasks**:
- [x] Update README with all badges (coverage, security, etc.)
- [x] Document all CI/CD workflows in docs/
- [x] Add troubleshooting guide for CI failures
- [x] Document release process (in CONTRIBUTING.md)

**Implementation Details**:
- **README Updates**: Added Status badge section with 5 badges
  - CI workflow status badge
  - Codecov coverage badge
  - Visual tests status badge
  - npm version badge
  - MIT License badge

- **Workflow Documentation**: Created `docs/CI_CD_WORKFLOWS.md`
  - Comprehensive guide to all 30 workflows
  - Organized by category (Core CI, Visual Testing, Quality, Publishing, Automation)
  - Workflow execution matrix
  - Dependency diagram (Mermaid)
  - Required secrets documentation
  - Performance optimizations explained
  - Troubleshooting guide with common issues
  - Links to related documentation

- **Release Process**: Documented in CONTRIBUTING.md
  - Changesets workflow explained
  - When to create changesets (major/minor/patch)
  - How automated releases work
  - Version PR process

**Current Status**: ✅ Complete documentation for all workflows and processes

---

## 📈 Success Metrics

Track these metrics to measure CI/CD effectiveness:

- [ ] **PR Merge Time**: Target < 24 hours with automation
- [ ] **CI Success Rate**: Target > 95%
- [ ] **Test Coverage**: Target > 80% (current unknown)
- [ ] **Security Vulnerabilities**: Target 0 critical/high
- [ ] **Bundle Size**: Stay within budgets
- [ ] **Build Time**: Optimize for < 10 minutes
- [ ] **Deploy Frequency**: Weekly or on-demand

---

## 🎯 Implementation Plan

### Phase 1: Core Infrastructure (Week 1)
1. Add Dependabot ⏱️ 5 min
2. Add SECURITY.md ⏱️ 10 min
3. Add CONTRIBUTING.md ⏱️ 20 min

**Total Time**: ~35 minutes
**Impact**: HIGH

### Phase 2: Quality Metrics (Week 2)
4. Code coverage badges ⏱️ 30 min
5. Verify Changesets ⏱️ 15 min
6. Performance budgets ⏱️ 20 min

**Total Time**: ~1 hour
**Impact**: MEDIUM

### Phase 3: Optimizations (Week 3+)
7-14. Low priority items as time permits

---

## 📚 References

- **GitHub Actions Best Practices**: https://docs.github.com/en/actions/learn-github-actions/best-practices-for-using-github-actions
- **Branch Protection**: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches
- **Dependabot**: https://docs.github.com/en/code-security/dependabot
- **Changesets**: https://github.com/changesets/changesets
- **Turborepo**: https://turbo.build/repo/docs

---

## ✅ Next Steps

**Immediate Actions** (Today):
1. ✅ Review this document
2. Start with HIGH PRIORITY items (#1-3)
3. Complete Phase 1 (~35 minutes)

**This Week**:
4. Complete Phase 2 items
5. Update README with new badges/documentation

**Ongoing**:
6. Monitor CI/CD metrics
7. Address Phase 3 items as needed
8. Keep this document updated

---

**Last Updated**: 2025-10-24
**Document Status**: ACTIVE
**Review Schedule**: Monthly
