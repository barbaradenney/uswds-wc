# GitHub Secrets Setup Guide

This document lists all GitHub secrets required for CI/CD workflows to function properly.

## Required Secrets

### Visual Regression Testing

#### `CHROMATIC_PROJECT_TOKEN`
- **Used by**: `.github/workflows/visual-regression.yml`
- **Purpose**: Authenticates with Chromatic for visual regression testing
- **How to obtain**:
  1. Go to [chromatic.com](https://www.chromatic.com/)
  2. Sign in with GitHub
  3. Create a new project or select existing project
  4. Copy the project token from project settings
- **How to add**:
  ```bash
  gh secret set CHROMATIC_PROJECT_TOKEN
  # Paste your token when prompted
  ```

### Performance Regression Testing

#### `LHCI_GITHUB_APP_TOKEN`
- **Used by**: `.github/workflows/performance-regression.yml`
- **Purpose**: Lighthouse CI GitHub App authentication for performance audits
- **How to obtain**:
  1. Go to [GitHub Apps](https://github.com/apps/lighthouse-ci)
  2. Install the Lighthouse CI app on your repository
  3. Generate a token from the app settings
- **How to add**:
  ```bash
  gh secret set LHCI_GITHUB_APP_TOKEN
  # Paste your token when prompted
  ```

## Optional Secrets

### Codecov (Code Coverage)

#### `CODECOV_TOKEN`
- **Used by**: `.github/workflows/quality-gates.yml`
- **Purpose**: Uploads test coverage reports to Codecov
- **How to obtain**:
  1. Go to [codecov.io](https://codecov.io/)
  2. Sign in with GitHub
  3. Add your repository
  4. Copy the upload token
- **How to add**:
  ```bash
  gh secret set CODECOV_TOKEN
  # Paste your token when prompted
  ```

## Verifying Secrets

To verify secrets are set correctly:

```bash
# List all secrets (values are hidden)
gh secret list

# Expected output:
# CHROMATIC_PROJECT_TOKEN  Updated 2024-XX-XX
# LHCI_GITHUB_APP_TOKEN    Updated 2024-XX-XX
# CODECOV_TOKEN            Updated 2024-XX-XX
```

## Workflow Impact

### Without CHROMATIC_PROJECT_TOKEN
- ❌ Visual regression tests will fail
- ❌ Cross-browser visual tests will fail
- ❌ PR comments won't include visual regression links

### Without LHCI_GITHUB_APP_TOKEN
- ❌ Lighthouse CI audits will fail
- ❌ Performance regression tracking won't work
- ❌ Bundle size reports won't be generated

### Without CODECOV_TOKEN
- ⚠️  Coverage reports won't upload to Codecov
- ✅ Local coverage still works
- ✅ Tests still run and pass

## Security Notes

- Secrets are encrypted and only exposed to workflow runs
- Never commit secrets to the repository
- Rotate secrets periodically (every 90 days recommended)
- Use least-privilege principle - only grant necessary permissions
- Review secret access in repository settings regularly

## Troubleshooting

### Secret not found error
```
Error: Secret CHROMATIC_PROJECT_TOKEN not found
```
**Solution**: Add the secret using `gh secret set CHROMATIC_PROJECT_TOKEN`

### Invalid token error
```
Error: Invalid authentication token
```
**Solution**: Regenerate the token and update the secret

### Permission denied error
```
Error: Resource not accessible by integration
```
**Solution**: Ensure the GitHub App has correct repository permissions

## Reference

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Chromatic Documentation](https://www.chromatic.com/docs/)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Codecov Documentation](https://docs.codecov.com/docs)
