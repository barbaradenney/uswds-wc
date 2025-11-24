# Chromatic Visual Regression Testing Setup

## Overview

This guide explains how to configure Chromatic for visual regression testing in CI/CD.

## Problem

The Visual Regression Testing CI job fails with:
```
Error: ✖ Missing project token
Sign in to https://www.chromatic.com/start and create a new project,
or find your project token on the Manage screen in an existing project.
Set your project token as the CHROMATIC_PROJECT_TOKEN environment variable
```

## Solution

### Step 1: Get Chromatic Project Token

1. **Sign in to Chromatic**
   - Go to https://www.chromatic.com/start
   - Sign in with GitHub (recommended) or create account

2. **Create or Select Project**
   - **New Project**: Click "Add project" → Select repository → Click "Set up project"
   - **Existing Project**: Select your project from dashboard → Click "Manage"

3. **Copy Project Token**
   - On project settings/manage page, find "Project token" section
   - Click "Copy" to copy the token
   - **Keep this secure** - it's a secret credential

### Step 2: Add Token to GitHub Secrets

1. **Navigate to Repository Settings**
   - Go to your GitHub repository
   - Click "Settings" (top menu)
   - In left sidebar, click "Secrets and variables" → "Actions"

2. **Add New Secret**
   - Click "New repository secret" button
   - **Name**: `CHROMATIC_PROJECT_TOKEN`
   - **Value**: Paste the token from Step 1
   - Click "Add secret"

### Step 3: Verify Configuration

The GitHub Actions workflow is already configured to use this secret:

**File**: `.github/workflows/visual-regression.yml`
```yaml
- name: Run Chromatic tests
  uses: chromaui/action@v1
  with:
    projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}  # ← Uses the secret
    buildScriptName: build-storybook
    storybookBuildDir: storybook-static
```

Once the secret is added, the next CI run will automatically use it.

### Step 4: Test the Integration

1. **Trigger CI Run**
   - Push a commit to `develop` or `main` branch
   - OR create/update a pull request

2. **Monitor Visual Regression Job**
   - Go to GitHub Actions tab
   - Click on latest workflow run
   - Find "Visual Regression Tests" job
   - Should now show: ✅ Success

3. **View Chromatic Dashboard**
   - Click link in job logs: "View your Storybook at https://..."
   - Review visual snapshots in Chromatic UI
   - Accept/reject changes as needed

## What Gets Tested

The visual regression testing validates:

- **All 46 USWDS components** - Comprehensive screenshot comparison
- **Cross-browser compatibility** - Chrome, Firefox, Safari simulation
- **Responsive design** - Desktop, tablet, mobile viewports
- **Accessibility contrast** - Color contrast validation
- **Theme variations** - Light/dark mode if applicable

## Chromatic Features

Once configured, you get:

✅ **Automatic Screenshot Comparison** - Detects visual changes automatically
✅ **Pull Request Comments** - Results posted directly to PR
✅ **Baseline Management** - Maintains approved visual baseline
✅ **Change Approval Workflow** - Review and approve/reject changes
✅ **Cross-browser Testing** - Tests in multiple browsers
✅ **Component History** - Track visual changes over time

## Troubleshooting

### Token Not Working

**Symptoms**: Still getting "Missing project token" error after adding secret

**Fixes**:
1. **Check Secret Name**: Must be exactly `CHROMATIC_PROJECT_TOKEN` (case-sensitive)
2. **Regenerate Token**: Go to Chromatic → Project Settings → Regenerate token
3. **Update Secret**: Replace old token with new one in GitHub Secrets
4. **Verify Scope**: Ensure token has correct permissions in Chromatic

### Build Failures

**Symptoms**: Chromatic uploads fail or timeout

**Fixes**:
1. **Check Storybook Build**: Run `npm run build-storybook` locally
2. **Verify Stories**: Ensure all stories render without errors
3. **Check Bundle Size**: Large bundles may timeout (increase timeout in workflow)
4. **Review Logs**: Check Chromatic build logs for specific errors

### Visual Changes Detected

**Symptoms**: CI fails with "X visual changes detected"

**This is expected behavior!** Chromatic detects legitimate visual changes.

**Next Steps**:
1. Click Chromatic dashboard link in CI logs
2. Review each visual change
3. **Accept** if intentional (updates baseline)
4. **Reject** if unintended (investigate cause)

## CI Workflow Configuration

### Current Setup

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Only when relevant files change:
  - `src/**`
  - `stories/**`
  - `.storybook/**`
  - `package.json`
  - `package-lock.json`

**Environment**:
- **OS**: Ubuntu latest
- **Node**: 18
- **Timeout**: 30 minutes
- **Storybook Build**: Automated
- **Upload**: Automatic on build success

### Customization Options

Edit `.github/workflows/visual-regression.yml`:

```yaml
- name: Run Chromatic tests
  uses: chromaui/action@v1
  with:
    projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}

    # Optional: Only upload changed stories (faster)
    onlyChanged: true

    # Optional: Auto-accept changes on main branch
    autoAcceptChanges: main

    # Optional: Skip certain branches
    skip: 'dependabot/**'

    # Optional: Exit with 0 even if changes detected
    exitZeroOnChanges: true

    # Optional: Debug mode
    debug: true
```

## Cost Considerations

**Chromatic Pricing** (as of 2025):

- **Free Tier**: 5,000 snapshots/month
- **Paid Tiers**: Starting at $149/month for 35,000 snapshots/month

**Snapshot Calculation**:
- 46 components × 1 story average = ~46 snapshots per build
- ~100 builds/month = 4,600 snapshots/month
- **Fits within free tier** for moderate usage

**Optimization Tips**:
1. **Use `onlyChanged: true`** - Only test changed components
2. **Skip `dependabot/**` branches** - Reduce automated PR snapshots
3. **TurboSnap** - Chromatic feature to detect changed components automatically
4. **Batch PRs** - Combine small changes to reduce builds

## Alternative: Percy or Playwright Screenshots

If Chromatic costs are prohibitive, consider alternatives:

### Percy (BrowserStack)
- Similar visual regression testing
- $449/month starting price
- More expensive than Chromatic

### Playwright Visual Comparisons
- Free (self-hosted)
- Uses Playwright built-in screenshot comparison
- Requires more setup and maintenance
- No web UI for reviewing changes

### Storybook Test Runner
- Free (runs locally or CI)
- Uses `@storybook/test-runner` with Playwright
- No visual regression, only interaction tests
- Already configured in this project

## Security Notes

🔒 **Project Token Security**:
- Never commit `CHROMATIC_PROJECT_TOKEN` to Git
- Store only in GitHub Secrets
- Rotate token if compromised
- Use separate tokens for staging/production if needed

🔒 **Access Control**:
- Token grants upload access to Chromatic project
- Limit access to GitHub repository settings
- Review Chromatic project members regularly

## Support Resources

- **Chromatic Docs**: https://www.chromatic.com/docs/
- **Chromatic GitHub Action**: https://github.com/chromaui/action
- **Storybook Docs**: https://storybook.js.org/docs/react/workflows/visual-testing
- **This Project's Workflow**: `.github/workflows/visual-regression.yml`

## Related CI Fixes

This is part of a series of CI configuration fixes. See also:

- **Playwright Reporter Fix**: `playwright.comprehensive.config.ts` - Fixed missing reporter path
- **Test Skip Policy**: `scripts/validate/validate-no-skipped-tests.cjs` - Updated approved skips
- **CI Pipeline Overview**: `.github/workflows/` - All workflow configurations

## Quick Start Checklist

- [ ] Sign in to Chromatic (https://www.chromatic.com/start)
- [ ] Create or select project for this repository
- [ ] Copy project token
- [ ] Add `CHROMATIC_PROJECT_TOKEN` to GitHub Secrets
- [ ] Push commit to trigger CI
- [ ] Verify "Visual Regression Tests" job passes
- [ ] Review snapshots in Chromatic dashboard
- [ ] Accept initial baseline snapshots

Once complete, visual regression testing will run automatically on all PRs! 🎨
