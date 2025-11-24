#!/bin/bash

# CI Simulation Script
# Runs the same tests that CI runs to catch all failures locally

set -e  # Exit on first error

echo "🚀 Simulating CI Pipeline Locally..."
echo "================================================"

# Track start time
START_TIME=$(date +%s)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print section headers
print_section() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  $1"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Step 1: Install dependencies (frozen lockfile like CI)
print_section "📦 Installing Dependencies (frozen-lockfile)"
if pnpm install --frozen-lockfile; then
    print_success "Dependencies installed"
else
    print_error "Dependency installation failed"
    exit 1
fi

# Step 2: Build packages
print_section "🏗️  Building Packages"
if pnpm run build; then
    print_success "Packages built successfully"
else
    print_error "Package build failed"
    exit 1
fi

# Step 3: TypeScript compilation
print_section "📘 TypeScript Compilation"
if pnpm run typecheck; then
    print_success "TypeScript compilation passed"
else
    print_error "TypeScript compilation failed"
    exit 1
fi

# Step 4: Linting
print_section "🔍 Linting"
if pnpm run lint; then
    print_success "Linting passed"
else
    print_error "Linting failed"
    exit 1
fi

# Step 5: Unit Tests
print_section "🧪 Running Unit Tests"
if pnpm test; then
    print_success "Unit tests passed"
else
    print_error "Unit tests failed"
    exit 1
fi

# Step 6: Build Storybook
print_section "🏗️  Building Storybook"
if [ -d "storybook-static" ]; then
    print_warning "Storybook already built, skipping..."
else
    if pnpm run build:storybook; then
        print_success "Storybook built successfully"
    else
        print_error "Storybook build failed"
        exit 1
    fi
fi

# Step 7: Check if Storybook is running
print_section "🌐 Checking Storybook Server"
if curl -s http://localhost:6006 > /dev/null 2>&1; then
    print_success "Storybook is running on port 6006"
else
    print_warning "Storybook is not running"
    echo ""
    echo "Please start Storybook in another terminal:"
    echo "  pnpm run storybook"
    echo ""
    echo "Then re-run this script, or continue with just unit tests."
    read -p "Continue without Playwright tests? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
    SKIP_PLAYWRIGHT=true
fi

# Step 8: Playwright Tests (if Storybook is running)
if [ "$SKIP_PLAYWRIGHT" != "true" ]; then
    print_section "🎭 Running Playwright Integration Tests"
    echo "This will run the EXACT tests that CI runs..."
    echo ""

    if npx playwright test --config=playwright.comprehensive.config.ts; then
        print_success "Playwright tests passed"
    else
        print_error "Playwright tests failed"
        echo ""
        echo "To see detailed results:"
        echo "  npx playwright show-report ./test-reports/playwright-html"
        exit 1
    fi
fi

# Calculate execution time
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

print_section "✨ CI Simulation Complete"
print_success "All checks passed!"
echo ""
echo "Total time: ${MINUTES}m ${SECONDS}s"
echo ""
echo "Your code is ready to push to CI! 🚀"
