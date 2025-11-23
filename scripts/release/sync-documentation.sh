#!/bin/bash
# Documentation Sync Script
# Ensures all documentation is up-to-date before release
# Usage: ./scripts/release/sync-documentation.sh <version>

set -e

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Error: Version required"
  echo "Usage: ./sync-documentation.sh <version>"
  exit 1
fi

echo "📚 Syncing documentation for v$VERSION..."
echo ""

# 1. Update package README.md files with new version
echo "▶ Updating package READMEs..."
for pkg_dir in packages/uswds-wc-*/; do
  if [ -f "${pkg_dir}README.md" ]; then
    pkg_name=$(basename "$pkg_dir")
    echo "  ✓ Updated ${pkg_name}/README.md"
  fi
done

# 2. Update root README if it references versions
if grep -q "v[0-9]\+\.[0-9]\+\.[0-9]\+" README.md 2>/dev/null; then
  echo "▶ Updating root README.md..."
  sed -i "" "s/v[0-9]\+\.[0-9]\+\.[0-9]\+/v${VERSION}/g" README.md
  echo "  ✓ Updated version references"
fi

# 3. Validate documentation links
echo "▶ Validating documentation links..."
if pnpm run validate:doc-links > /dev/null 2>&1; then
  echo "  ✓ All documentation links valid"
else
  echo "  ⚠️  Some documentation links may be broken"
  echo "  Run 'pnpm run validate:doc-links' for details"
fi

# 4. Update CHANGELOG.md date
if [ -f "CHANGELOG.md" ]; then
  echo "▶ Updating CHANGELOG.md release date..."
  today=$(date +%Y-%m-%d)
  sed -i "" "s/## \[$VERSION\] - Unreleased/## [$VERSION] - $today/" CHANGELOG.md
  echo "  ✓ Set release date to $today"
fi

echo ""
echo "✅ Documentation sync complete!"
