#!/bin/bash

# Local Workflow Testing Script
# Simulates GitHub Actions workflows locally to catch issues before pushing

set -e

echo "🧪 Local Workflow Testing"
echo "========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track failures
FAILURES=()

run_test() {
    local name="$1"
    local command="$2"

    echo -e "${YELLOW}▶ Running: $name${NC}"

    if eval "$command"; then
        echo -e "${GREEN}✓ PASSED: $name${NC}"
        echo ""
        return 0
    else
        echo -e "${RED}✗ FAILED: $name${NC}"
        FAILURES+=("$name")
        echo ""
        return 1
    fi
}

# 1. Security Audit (from CI/CD Pipeline)
run_test "Security Audit" "pnpm audit --audit-level=moderate" || true

# 2. Code Quality (from CI/CD Pipeline)
run_test "ESLint" "pnpm run lint"
run_test "TypeScript Compilation" "pnpm run typecheck"

# 3. Unit Tests (from multiple workflows)
run_test "Unit Tests" "pnpm test --run"

# 4. Build Verification (from CI/CD Pipeline)
run_test "Build All Packages" "pnpm run build"
run_test "Build Storybook" "pnpm run build-storybook"

# 5. Component Tests (Cypress - from CI/CD Pipeline)
echo -e "${YELLOW}▶ Running: Cypress Component Tests${NC}"
echo "⚠️  Note: This requires Storybook to be running"
echo "   Run in separate terminal: pnpm run storybook"
read -p "Is Storybook running? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    run_test "Cypress Component Tests" "pnpm run cypress:component" || true
else
    echo -e "${YELLOW}⏭️  Skipped: Cypress Component Tests${NC}"
    echo ""
fi

# 6. USWDS Compliance Validation
run_test "USWDS Compliance" "pnpm run validate:uswds-structure" || true

# 7. Documentation Validation
run_test "Documentation Links" "node scripts/validate/validate-documentation-links.cjs" || true

# 8. Pattern Standards (if patterns exist)
if [ -d "packages/uswds-wc-patterns" ]; then
    run_test "Pattern Standards" "node scripts/validate/pattern-standards-validator.cjs" || true
fi

# 9. Bundle Size Validation
run_test "Bundle Size Check" "pnpm run validate:bundle-size" || true

# 10. AI Code Quality (non-blocking)
run_test "AI Code Quality" "node scripts/validate/ai-code-quality-validator.cjs" || true

echo ""
echo "========================="
echo "📊 Test Summary"
echo "========================="
echo ""

if [ ${#FAILURES[@]} -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo ""
    echo "🚀 Your changes are ready to push!"
    exit 0
else
    echo -e "${RED}✗ ${#FAILURES[@]} test(s) failed:${NC}"
    for failure in "${FAILURES[@]}"; do
        echo "  - $failure"
    done
    echo ""
    echo "💡 Fix these issues before pushing to avoid CI failures"
    exit 1
fi
