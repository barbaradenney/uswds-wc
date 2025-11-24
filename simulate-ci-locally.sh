#!/bin/bash

# ========================================
# Local CI Simulation Script
# ========================================
# Runs the same tests as CI to catch issues before pushing
# Usage: bash simulate-ci-locally.sh

set -e  # Exit on error

echo "=========================================="
echo "🧪 LOCAL CI SIMULATION"
echo "Running all CI checks locally to catch issues before push"
echo "=========================================="
echo ""

# Track failures
FAILURES=()
TOTAL_START=$(date +%s)

# Helper function to run and log
run_test() {
    local name="$1"
    local command="$2"
    local start=$(date +%s)

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "▶️  $name"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    if eval "$command"; then
        local end=$(date +%s)
        local duration=$((end - start))
        echo "✅ $name - Passed (${duration}s)"
        echo ""
    else
        local end=$(date +%s)
        local duration=$((end - start))
        echo "❌ $name - Failed (${duration}s)"
        FAILURES+=("$name")
        echo ""
    fi
}

# 1. Unit Tests (Vitest)
run_test "Unit Tests" "pnpm test 2>&1 | tail -100"

# 2. TypeScript Compilation
run_test "TypeScript" "pnpm run typecheck"

# 3. Linting
run_test "Linting" "pnpm run lint"

# 4. Build Verification
run_test "Build" "pnpm run build"

# 5. Playwright Integration Tests (the ones that were failing in CI)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "▶️  Playwright Integration Tests (CI Exact Match)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
START=$(date +%s)

# First, check if Storybook is needed
if [ ! -d "storybook-static" ]; then
    echo "📚 Building Storybook (required for integration tests)..."
    if pnpm run build-storybook; then
        echo "✅ Storybook built successfully"
    else
        echo "❌ Storybook build failed"
        FAILURES+=("Storybook Build")
    fi
fi

# Run the exact command from CI
if npx playwright test tests/integration/ tests/error-recovery/ tests/api-contracts/ \
    --project=integration-testing \
    --config=playwright.comprehensive.config.ts \
    --reporter=list 2>&1 | tee /tmp/playwright-integration-output.log; then
    END=$(date +%s)
    DURATION=$((END - START))
    echo "✅ Playwright Integration Tests - Passed (${DURATION}s)"
    echo ""
else
    END=$(date +%s)
    DURATION=$((END - START))
    echo "❌ Playwright Integration Tests - Failed (${DURATION}s)"
    echo ""
    echo "📋 Failed test details:"
    grep -A5 "Error:" /tmp/playwright-integration-output.log | head -50 || echo "No error details found"
    FAILURES+=("Playwright Integration Tests")
    echo ""
fi

# 6. Component Tests (Cypress - the other source of CI failures)
run_test "Cypress Component Tests" "pnpm run test:cypress:component --browser chrome"

# Summary
TOTAL_END=$(date +%s)
TOTAL_DURATION=$((TOTAL_END - TOTAL_START))

echo "=========================================="
echo "📊 SIMULATION SUMMARY"
echo "=========================================="
echo "⏱️  Total Time: ${TOTAL_DURATION}s"
echo ""

if [ ${#FAILURES[@]} -eq 0 ]; then
    echo "✅ ALL CHECKS PASSED!"
    echo "🚀 Safe to push to CI"
    echo ""
    exit 0
else
    echo "❌ FAILURES DETECTED:"
    for failure in "${FAILURES[@]}"; do
        echo "   • $failure"
    done
    echo ""
    echo "🔍 Fix these issues before pushing to avoid CI failures"
    echo ""

    # Provide helpful debugging info
    if [[ " ${FAILURES[@]} " =~ " Playwright Integration Tests " ]]; then
        echo "💡 Playwright Integration Test Debugging:"
        echo "   - Full output saved to: /tmp/playwright-integration-output.log"
        echo "   - Run individually: npx playwright test tests/integration/component-interaction.spec.ts --project=integration-testing --config=playwright.comprehensive.config.ts"
        echo "   - Debug mode: npx playwright test tests/integration/component-interaction.spec.ts --debug --project=integration-testing"
        echo ""
    fi

    exit 1
fi
