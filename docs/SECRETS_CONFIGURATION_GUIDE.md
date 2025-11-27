# GitHub Secrets Configuration Guide

**Purpose**: Step-by-step guide for configuring all required tokens and secrets for CI/CD workflows.

**Created**: 2025-11-26
**Status**: Active Guide

## Overview

This guide helps you configure the 7 types of tokens/secrets needed for full CI/CD functionality.

**Priority Levels**:
- 🔴 **CRITICAL** - Workflows completely blocked without this
- 🟡 **HIGH** - Important quality/security features disabled
- 🟢 **MEDIUM** - Performance optimizations disabled

## Where to Add Secrets

All secrets are configured in the same place:

1. Navigate to your GitHub repository
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Enter **Name** and **Secret** value
6. Click **Add secret**

## Required Secrets

### 🔴 1. CHROMATIC_PROJECT_TOKEN (CRITICAL)

**Priority**: CRITICAL
**Purpose**: Visual regression testing with Chromatic
**Impact**: Visual testing completely blocked

**Workflows Affected**:
- `visual-regression.yml` (ACTIVE - failing without token)
- `visual-testing.yml` (DISABLED due to missing token)
- `comprehensive-testing.yml`

**Setup Steps**:

1. **Create Chromatic Account**:
   - Visit https://www.chromatic.com/
   - Sign up with your GitHub account
   - Free tier: 5,000 snapshots/month

2. **Link Repository**:
   - Click "Add project"
   - Select your `uswds-wc` repository
   - Follow setup instructions

3. **Get Project Token**:
   - Go to Project Settings → Configure
   - Copy the **Project token** (starts with `chpt_`)

4. **Add to GitHub Secrets**:
   - Name: `CHROMATIC_PROJECT_TOKEN`
   - Value: `chpt_xxxxxxxxxxxxx` (your token)

5. **Re-enable Workflow**:
   After adding the token, re-enable `visual-testing.yml`:
   ```bash
   # Edit .github/workflows/visual-testing.yml
   # Remove: if: false
   git commit -m "feat(ci): re-enable visual testing workflow"
   ```

**Verification**:
- Push to develop branch
- Check GitHub Actions → Visual Regression Testing workflow
- Should show ✅ success (not ❌ failure)

---

### 🔴 2. NPM_TOKEN (CRITICAL)

**Priority**: CRITICAL
**Purpose**: Publishing packages to npm registry
**Impact**: Cannot publish releases

**Workflows Affected**:
- `release.yml`

**Setup Steps**:

1. **Create npm Account** (if you don't have one):
   - Visit https://www.npmjs.com/signup
   - Verify email address

2. **Create Organization** (recommended for scoped packages):
   - Go to https://www.npmjs.com/org/create
   - Create `@uswds-wc` organization (or your preferred name)
   - Free for public packages

3. **Generate Publish Token**:
   - Go to Account → Access Tokens
   - Click "Generate New Token" → "Classic Token"
   - Select type: **Automation** (for CI/CD)
   - Copy the token (starts with `npm_`)

4. **Add to GitHub Secrets**:
   - Name: `NPM_TOKEN`
   - Value: `npm_xxxxxxxxxxxxx` (your token)

**Verification**:
- Run release workflow manually (when ready to publish)
- Check that packages publish successfully

**Important Notes**:
- **DO NOT** use this token locally (use `npm login` instead)
- **Automation tokens** don't require 2FA for CI/CD
- Keep this token secret - it can publish to your npm account

---

### 🟡 3. CODECOV_TOKEN (HIGH)

**Priority**: HIGH
**Purpose**: Code coverage reporting and tracking
**Impact**: No coverage reports in PRs, quality gates may fail

**Workflows Affected**:
- `quality-gates.yml`
- `ci.yml`

**Setup Steps**:

1. **Create Codecov Account**:
   - Visit https://codecov.io/
   - Sign up with GitHub account
   - Free for open source projects

2. **Add Repository**:
   - Click "Add Repository"
   - Select `uswds-wc` from list
   - Grant permissions

3. **Get Upload Token**:
   - Go to Settings → General
   - Copy the **Repository upload token**

4. **Add to GitHub Secrets**:
   - Name: `CODECOV_TOKEN`
   - Value: (your token from Codecov)

**Verification**:
- Push changes to trigger CI
- Check PR for Codecov comment with coverage report
- Visit https://codecov.io/gh/[your-username]/uswds-wc

**Benefits**:
- Coverage badges in README
- Coverage trends over time
- PR coverage diff comments
- Quality gate enforcement

---

### 🟡 4. SNYK_TOKEN (HIGH)

**Priority**: HIGH
**Purpose**: Security vulnerability scanning
**Impact**: No automated security scanning

**Workflows Affected**:
- `security.yml`

**Setup Steps**:

1. **Create Snyk Account**:
   - Visit https://snyk.io/signup
   - Sign up with GitHub account
   - Free for open source projects

2. **Add Repository**:
   - Connect your GitHub account
   - Import `uswds-wc` repository
   - Grant permissions

3. **Get API Token**:
   - Go to Account Settings → General
   - Copy the **API token** (UUID format)

4. **Add to GitHub Secrets**:
   - Name: `SNYK_TOKEN`
   - Value: (your UUID token)

**Verification**:
- Push changes to trigger security workflow
- Check GitHub Actions → Security workflow
- Visit Snyk dashboard for vulnerability reports

**Benefits**:
- Automatic dependency vulnerability scanning
- PR comments with security issues
- Fix suggestions
- License compliance checks

---

### 🟢 5. TURBO_TOKEN & TURBO_TEAM (MEDIUM)

**Priority**: MEDIUM
**Purpose**: Turborepo remote caching in CI
**Impact**: Slower CI builds (no remote cache)

**Workflows Affected**:
- `ci.yml`

**Current Status**:
- ✅ Local development already has remote caching configured
- ⚠️ CI builds don't use remote cache (slower)

**Setup Steps**:

1. **Create Vercel Account** (if you don't have one):
   - Visit https://vercel.com/signup
   - Sign up with GitHub account
   - Free tier available

2. **Enable Turborepo Remote Caching**:
   - Go to Account Settings → Turborepo
   - Enable remote caching

3. **Get Team Slug**:
   - Your team slug is in the URL: `https://vercel.com/[team-slug]`
   - For personal accounts, use your username

4. **Generate Token**:
   - Go to Account Settings → Tokens
   - Create new token with scope: **Turborepo**
   - Copy the token

5. **Add to GitHub Secrets**:
   - Name: `TURBO_TOKEN`
   - Value: (your Vercel token)
   - Name: `TURBO_TEAM`
   - Value: (your team slug or username)

**Verification**:
- Push changes to trigger CI
- Check CI logs for "Remote caching enabled"
- Second CI run should be much faster (cache hits)

**Benefits**:
- **111x faster builds** (39s → 0.35s with cache)
- Shared cache across CI runs
- Reduced CI minutes usage

**Documentation**: See [docs/TURBOREPO_REMOTE_CACHE_SETUP.md](TURBOREPO_REMOTE_CACHE_SETUP.md)

---

### 🟢 6. LHCI_GITHUB_APP_TOKEN (MEDIUM)

**Priority**: MEDIUM
**Purpose**: Lighthouse CI performance testing
**Impact**: No automated performance regression testing

**Workflows Affected**:
- `performance-regression.yml`

**Setup Steps**:

1. **Install Lighthouse CI GitHub App**:
   - Visit https://github.com/apps/lighthouse-ci
   - Click "Install"
   - Select your repository

2. **Get App Token**:
   - After installation, you'll receive a token
   - Or go to: https://github.com/settings/installations
   - Find Lighthouse CI → Configure
   - Generate new token

3. **Add to GitHub Secrets**:
   - Name: `LHCI_GITHUB_APP_TOKEN`
   - Value: (your Lighthouse CI token)

**Verification**:
- Push changes to trigger performance workflow
- Check PR for Lighthouse CI status checks
- View performance reports in PR

**Benefits**:
- Automated performance regression detection
- Performance budgets enforcement
- Lighthouse scores in PRs
- Performance trend tracking

---

### 7. GITHUB_TOKEN (Automatic)

**Priority**: N/A (automatic)
**Purpose**: GitHub API access for workflows
**Status**: ✅ Automatically provided by GitHub Actions

**No Setup Required**: GitHub Actions automatically provides `GITHUB_TOKEN` for all workflows.

## Configuration Checklist

Use this checklist to track your progress:

```markdown
## Critical Tokens (Required for Core Functionality)
- [ ] CHROMATIC_PROJECT_TOKEN - Visual regression testing
- [ ] NPM_TOKEN - Package publishing

## High Priority Tokens (Quality & Security)
- [ ] CODECOV_TOKEN - Code coverage reporting
- [ ] SNYK_TOKEN - Security vulnerability scanning

## Medium Priority Tokens (Performance Optimization)
- [ ] TURBO_TOKEN - Turborepo remote caching
- [ ] TURBO_TEAM - Turborepo team identifier
- [ ] LHCI_GITHUB_APP_TOKEN - Lighthouse CI performance testing

## Verification
- [ ] Visual regression tests pass
- [ ] Coverage reports appear in PRs
- [ ] Security scans run on schedule
- [ ] CI builds use remote cache
- [ ] Performance tests run
```

## Post-Configuration Steps

After adding all tokens:

1. **Re-enable Disabled Workflows**:
   ```bash
   # Edit .github/workflows/visual-testing.yml
   # Remove the `if: false` condition
   git commit -m "feat(ci): re-enable visual testing workflow"
   git push origin develop
   ```

2. **Verify All Workflows**:
   ```bash
   # Trigger all workflows with a test commit
   git commit --allow-empty -m "test: verify CI/CD workflows"
   git push origin develop
   ```

3. **Check GitHub Actions Dashboard**:
   - All workflows should show ✅ success
   - No workflows should be disabled
   - No workflows should fail due to missing tokens

4. **Update Documentation**:
   - Mark tokens as configured in [CI_CLEANUP_PLAN.md](CI_CLEANUP_PLAN.md)
   - Update README badges if needed

## Security Best Practices

### DO ✅
- Store all tokens as GitHub Secrets (never in code)
- Use minimum required permissions for each token
- Rotate tokens periodically (every 90 days)
- Use different tokens for different environments
- Use Automation tokens for npm (no 2FA required)
- Review token usage in audit logs

### DON'T ❌
- Commit tokens to repository (even in .env files)
- Share tokens in issues, PRs, or documentation
- Use personal access tokens for automation
- Grant more permissions than needed
- Use the same token across multiple projects
- Store tokens in local environment variables permanently

## Troubleshooting

### Token Not Working

**Symptoms**: Workflow fails with authentication error

**Solutions**:
1. Verify token was copied correctly (no extra spaces)
2. Check token hasn't expired
3. Verify token has correct permissions/scopes
4. Re-generate token and update secret
5. Check token is for correct account/organization

### Workflow Still Disabled

**Symptoms**: Workflow doesn't run after adding token

**Solutions**:
1. Check if workflow has `if: false` condition
2. Remove conditional and commit changes
3. Verify workflow file is in `.github/workflows/`
4. Check workflow triggers match your branch

### Coverage Not Appearing

**Symptoms**: Codecov token added but no coverage reports

**Solutions**:
1. Verify Codecov token is correct
2. Check repository is added in Codecov dashboard
3. Ensure tests are running and generating coverage
4. Check Codecov action is in workflow file
5. Visit Codecov dashboard for error messages

### Cache Not Working

**Symptoms**: Turbo token added but builds still slow

**Solutions**:
1. Verify both `TURBO_TOKEN` and `TURBO_TEAM` are set
2. Check team slug matches your Vercel account
3. Look for "Remote caching enabled" in CI logs
4. Verify `.turbo/` is not in `.gitignore`
5. Run `turbo login` locally to test token

## Related Documentation

- [docs/CI_CLEANUP_PLAN.md](CI_CLEANUP_PLAN.md) - Complete CI cleanup tracking
- [docs/TURBOREPO_REMOTE_CACHE_SETUP.md](TURBOREPO_REMOTE_CACHE_SETUP.md) - Detailed Turborepo setup
- [docs/CI_CD_IMPROVEMENTS.md](CI_CD_IMPROVEMENTS.md) - Recent CI/CD fixes
- [docs/TEST_COVERAGE_STRATEGY.md](TEST_COVERAGE_STRATEGY.md) - Testing strategy

## Support

If you encounter issues not covered in this guide:

1. Check workflow logs in GitHub Actions for specific error messages
2. Review service-specific documentation (Chromatic, npm, Codecov, etc.)
3. Search GitHub issues for similar problems
4. Create new issue with error logs and configuration details

## Summary

Configuring these tokens enables:
- ✅ Visual regression testing (Chromatic)
- ✅ Automated publishing (npm)
- ✅ Code coverage tracking (Codecov)
- ✅ Security scanning (Snyk)
- ✅ Fast CI builds (Turborepo)
- ✅ Performance monitoring (Lighthouse CI)

**Start with CRITICAL tokens first**, then add HIGH and MEDIUM priority tokens as time permits.
