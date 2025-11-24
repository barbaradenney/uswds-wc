#!/bin/bash
# Post-Release Verification Script
# Verifies release was successful
# Usage: ./scripts/release/verify-release.sh <version>

set -e

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Error: Version required"
  echo "Usage: ./verify-release.sh <version>"
  exit 1
fi

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

VERIFICATION_FAILED=0

echo "🔍 Post-Release Verification for v$VERSION"
echo "==========================================="
echo ""

# 1. Verify npm packages
echo -e "${BLUE}▶ Verifying NPM packages${NC}"

declare -a packages=(
  "@uswds-wc/core"
  "@uswds-wc/actions"
  "@uswds-wc/forms"
  "@uswds-wc/navigation"
  "@uswds-wc/data-display"
  "@uswds-wc/feedback"
  "@uswds-wc/layout"
  "@uswds-wc/structure"
  "@uswds-wc/patterns"
)

for pkg in "${packages[@]}"; do
  echo -n "  Checking $pkg@$VERSION... "

  if npm view "$pkg@$VERSION" version > /dev/null 2>&1; then
    PUBLISHED_VERSION=$(npm view "$pkg@$VERSION" version)
    if [ "$PUBLISHED_VERSION" = "$VERSION" ]; then
      echo -e "${GREEN}✓${NC}"
    else
      echo -e "${RED}✗ Version mismatch${NC}"
      VERIFICATION_FAILED=1
    fi
  else
    echo -e "${RED}✗ Not found${NC}"
    VERIFICATION_FAILED=1
  fi
done

echo ""

# 2. Test installation
echo -e "${BLUE}▶ Testing package installation${NC}"

TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

if npm install "@uswds-wc/core@$VERSION" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Package installation successful${NC}"
else
  echo -e "${RED}✗ Package installation failed${NC}"
  VERIFICATION_FAILED=1
fi

cd - > /dev/null
rm -rf "$TEMP_DIR"
echo ""

# 3. Verify GitHub release
echo -e "${BLUE}▶ Verifying GitHub release${NC}"

if gh release view "v$VERSION" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ GitHub release exists${NC}"
else
  echo -e "${RED}✗ GitHub release not found${NC}"
  VERIFICATION_FAILED=1
fi

echo ""

# 4. Verify git tag
echo -e "${BLUE}▶ Verifying git tag${NC}"

if git tag -l | grep -q "^v$VERSION$"; then
  echo -e "${GREEN}✓ Git tag exists${NC}"
else
  echo -e "${RED}✗ Git tag not found${NC}"
  VERIFICATION_FAILED=1
fi

echo ""

# 5. Verify Storybook deployment
echo -e "${BLUE}▶ Verifying Storybook deployment${NC}"

if curl -s "https://barbaradenney.github.io/uswds-wc/" | grep -q "uswds-wc" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Storybook is accessible${NC}"
else
  echo -e "${YELLOW}⚠ Could not verify Storybook deployment${NC}"
fi

echo ""

# Final result
echo "==========================================="

if [ $VERIFICATION_FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All verifications passed!${NC}"
  echo ""
  echo "Release v$VERSION is live and verified:"
  echo "  • NPM: https://www.npmjs.com/org/uswds-wc"
  echo "  • GitHub: https://github.com/barbaradenney/uswds-wc/releases/tag/v$VERSION"
  echo "  • Storybook: https://barbaradenney.github.io/uswds-wc/"
  exit 0
else
  echo -e "${RED}❌ Some verifications failed${NC}"
  echo ""
  echo "Please investigate the failures above."
  exit 1
fi
