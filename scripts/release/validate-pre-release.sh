#!/bin/bash
# Pre-Release Validation Script
# Comprehensive validation before allowing a release
# Usage: ./scripts/release/validate-pre-release.sh

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track validation results
VALIDATION_FAILED=0
VALIDATION_LOG="/tmp/pre-release-validation.log"

echo "🔍 Pre-Release Validation Starting..." | tee "$VALIDATION_LOG"
echo "================================================" | tee -a "$VALIDATION_LOG"
echo "" | tee -a "$VALIDATION_LOG"

# Function to run validation check
run_check() {
  local check_name="$1"
  local check_command="$2"

  echo -e "${BLUE}▶ $check_name${NC}" | tee -a "$VALIDATION_LOG"

  if eval "$check_command" >> "$VALIDATION_LOG" 2>&1; then
    echo -e "${GREEN}✓ $check_name passed${NC}" | tee -a "$VALIDATION_LOG"
    echo "" | tee -a "$VALIDATION_LOG"
    return 0
  else
    echo -e "${RED}✗ $check_name failed${NC}" | tee -a "$VALIDATION_LOG"
    echo "" | tee -a "$VALIDATION_LOG"
    VALIDATION_FAILED=1
    return 1
  fi
}

# 1. Check working directory is clean
run_check "Clean Working Directory" "test -z \"\$(git status --porcelain)\""

# 2. Check on main or develop branch
CURRENT_BRANCH=$(git branch --show-current)
run_check "On Release Branch (main or develop)" "test \"$CURRENT_BRANCH\" = \"main\" || test \"$CURRENT_BRANCH\" = \"develop\""

# 3. Check up-to-date with remote
run_check "Up-to-date with Remote" "git fetch origin $CURRENT_BRANCH && test \"\$(git rev-parse HEAD)\" = \"\$(git rev-parse @{u})\""

# 4. Run linting
run_check "ESLint" "pnpm run lint"

# 5. Run TypeScript compilation
run_check "TypeScript Compilation" "pnpm run typecheck"

# 6. Run all unit tests
echo -e "${BLUE}▶ Running Unit Tests${NC}" | tee -a "$VALIDATION_LOG"
if pnpm test >> "$VALIDATION_LOG" 2>&1; then
  echo -e "${GREEN}✓ Unit Tests passed${NC}" | tee -a "$VALIDATION_LOG"
  echo "" | tee -a "$VALIDATION_LOG"
else
  echo -e "${RED}✗ Unit Tests failed${NC}" | tee -a "$VALIDATION_LOG"
  echo "" | tee -a "$VALIDATION_LOG"
  VALIDATION_FAILED=1
fi

# 7. Run visual regression tests (if enabled)
if [ "${SKIP_VISUAL_TESTS}" != "1" ]; then
  run_check "Visual Regression Tests" "pnpm run test:visual"
fi

# 8. Validate bundle sizes
run_check "Bundle Size Validation" "pnpm run validate:bundle-size"

# 9. Run USWDS compliance validation
run_check "USWDS Compliance" "pnpm run validate:uswds-compliance"

# 10. Check for uncommitted dependency changes
run_check "Lock File Up-to-date" "test -z \"\$(git diff pnpm-lock.yaml)\""

# 11. Verify npm authentication
run_check "NPM Authentication" "npm whoami"

# 12. Verify GitHub CLI authentication
run_check "GitHub CLI Authentication" "gh auth status"

# Final result
echo "" | tee -a "$VALIDATION_LOG"
echo "================================================" | tee -a "$VALIDATION_LOG"

if [ $VALIDATION_FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All pre-release validations passed!${NC}" | tee -a "$VALIDATION_LOG"
  echo "" | tee -a "$VALIDATION_LOG"
  echo "✓ Ready to proceed with release" | tee -a "$VALIDATION_LOG"
  exit 0
else
  echo -e "${RED}❌ Pre-release validation failed${NC}" | tee -a "$VALIDATION_LOG"
  echo "" | tee -a "$VALIDATION_LOG"
  echo "Please fix the issues above before releasing." | tee -a "$VALIDATION_LOG"
  echo "Full log: $VALIDATION_LOG" | tee -a "$VALIDATION_LOG"
  exit 1
fi
