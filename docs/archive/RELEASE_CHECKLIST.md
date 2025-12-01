# Release Checklist

Comprehensive checklist for systematic releases of USWDS Web Components.

## Quick Start

```bash
# Run the interactive release process
pnpm run release

# Or test with a dry-run first
pnpm run release:dry-run
```

## Pre-Release (Day Before)

- [ ] All PRs merged to `develop`
- [ ] `develop` merged to `main`
- [ ] All tests passing on `main`
- [ ] Visual regression tests passing
- [ ] USWDS compliance validated
- [ ] Bundle size within budget
- [ ] No known critical bugs
- [ ] Changelog reviewed and updated
- [ ] Release notes drafted

## Release Day

### 1. Preparation (5 min)

```bash
git checkout main
git pull origin main
pnpm run release:validate
```

- [ ] Working directory clean
- [ ] On `main` branch
- [ ] Up-to-date with remote
- [ ] All validations passing

### 2. Execute Release (15-20 min)

```bash
pnpm run release
```

The interactive script will guide you through:

1. Select release type (patch/minor/major)
2. Pre-release validation
3. Changelog generation
4. Version bump
5. Documentation sync
6. Build packages
7. Final tests
8. Review changes
9. Commit version bump
10. Create git tag
11. Publish to npm
12. Push to GitHub
13. Deploy Storybook
14. Create GitHub Release
15. Post-release verification
16. Merge to develop

### 3. Post-Release Verification (5 min)

```bash
# Verify everything worked
pnpm run release:verify <version>
```

- [ ] All packages on npm
- [ ] Correct version published
- [ ] GitHub Release created
- [ ] Git tag exists
- [ ] Storybook deployed
- [ ] Installation test passes

## Manual Commands

If you need to run specific steps manually:

```bash
# Pre-release validation only
pnpm run release:validate

# Documentation sync only
pnpm run release:sync-docs <version>

# Post-release verification only
pnpm run release:verify <version>

# Dry-run (no actual changes)
pnpm run release:dry-run
```

## Emergency Rollback

If a release fails or needs to be rolled back:

```bash
# 1. If npm publish failed but tag was created
git push --delete origin vX.X.X
git tag -d vX.X.X
git reset --hard HEAD~1
git push origin main --force

# 2. If packages were published (<72 hours)
npm unpublish @uswds-wc/core@X.X.X --force
# Repeat for all packages

# 3. Delete GitHub release
gh release delete vX.X.X

# 4. Notify team immediately
```

## Troubleshooting

### Tests Failing

**Issue**: Pre-release validation fails
**Solution**: Run `pnpm test` locally, fix issues, commit, try again

### npm Authentication

**Issue**: npm publish fails with auth error
**Solution**: Run `npm whoami`, if not logged in: `npm login`

### GitHub CLI Auth

**Issue**: GitHub release creation fails
**Solution**: Run `gh auth status`, if needed: `gh auth login`

### Version Mismatch

**Issue**: Packages have different versions
**Solution**: Use the release script which syncs all versions automatically

### Storybook Deployment

**Issue**: Storybook not deploying
**Solution**: Check GitHub Pages settings, re-run `pnpm run build-storybook && pnpm run deploy-storybook`

## What the Release Includes

Every release automatically:

- ✅ Bumps versions (all packages synced)
- ✅ Generates changelog from conventional commits
- ✅ Syncs all documentation
- ✅ Builds all packages
- ✅ Runs comprehensive tests
- ✅ Creates git tag
- ✅ Publishes to npm (with provenance)
- ✅ Pushes to GitHub
- ✅ Deploys Storybook
- ✅ Creates GitHub Release
- ✅ Verifies release success
- ✅ Merges to develop

## Release Logs

Each release creates a detailed log at `/tmp/release-YYYYMMDD-HHMMSS.log`

View the log if any step fails to see detailed error messages.

## Contact

If you encounter issues not covered here:

1. Check the log file
2. Review [RELEASE_PROCESS.md](RELEASE_PROCESS.md) for detailed documentation
3. Contact the maintainers

## Related Documentation

- [RELEASE_PROCESS.md](RELEASE_PROCESS.md) - Detailed release process documentation
- [CHANGELOG.md](../CHANGELOG.md) - Version history
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines
