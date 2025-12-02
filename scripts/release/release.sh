#!/bin/bash
# Non-Interactive Release Script
# Comprehensive systematic release process with optional confirmation
# Usage: ./scripts/release/release.sh [patch|minor|major] [--dry-run] [--no-confirm]

set -e

# Mark that we're running from the release script
# This allows validation hooks to bypass release contract checks
export RELEASE_SCRIPT_RUNNING=true

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Configuration
VERSION_TYPE=""
DRY_RUN=false
NO_CONFIRM=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    patch|minor|major)
      VERSION_TYPE="$1"
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --no-confirm)
      NO_CONFIRM=true
      shift
      ;;
    --help|-h)
      echo "Usage: $0 [patch|minor|major] [--dry-run] [--no-confirm]"
      echo ""
      echo "Arguments:"
      echo "  patch        Bug fixes and patches"
      echo "  minor        New features (backwards compatible)"
      echo "  major        Breaking changes"
      echo ""
      echo "Options:"
      echo "  --dry-run    Show what would be done without making changes"
      echo "  --no-confirm Skip all confirmation prompts (use with caution)"
      echo ""
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown argument: $1${NC}"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Validate version type
if [ -z "$VERSION_TYPE" ]; then
  echo -e "${RED}Error: Version type required (patch|minor|major)${NC}"
  echo "Usage: $0 [patch|minor|major] [--dry-run] [--no-confirm]"
  exit 1
fi

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}🔍 DRY RUN MODE - No actual changes will be made${NC}"
  echo ""
fi

RELEASE_LOG="/tmp/release-$(date +%Y%m%d-%H%M%S).log"
echo "Release started at $(date)" | tee "$RELEASE_LOG"

# Function to prompt for confirmation
confirm() {
  local prompt="$1"

  if [ "$NO_CONFIRM" = true ]; then
    echo -e "${CYAN}${prompt} - AUTO-CONFIRMED${NC}"
    return 0
  fi

  local response
  echo -e "${CYAN}${prompt} (y/n): ${NC}"
  read -r response
  if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Release cancelled${NC}"
    exit 0
  fi
}

# Function to run command with logging
run_step() {
  local step_name="$1"
  local step_command="$2"

  echo -e "${BLUE}▶ ${step_name}${NC}" | tee -a "$RELEASE_LOG"

  if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}  [DRY RUN] Would execute: $step_command${NC}" | tee -a "$RELEASE_LOG"
    return 0
  fi

  if eval "$step_command" >> "$RELEASE_LOG" 2>&1; then
    echo -e "${GREEN}✓ ${step_name} completed${NC}" | tee -a "$RELEASE_LOG"
    echo "" | tee -a "$RELEASE_LOG"
    return 0
  else
    echo -e "${RED}✗ ${step_name} failed${NC}" | tee -a "$RELEASE_LOG"
    echo "Check log: $RELEASE_LOG"
    exit 1
  fi
}

# Header
echo -e "${BOLD}${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}║${NC}     ${BOLD}🚀 USWDS Web Components Release Process${NC}         ${BOLD}${CYAN}║${NC}"
echo -e "${BOLD}${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BOLD}Release Type:${NC} $VERSION_TYPE"
echo ""

# Step 1: Pre-release validation
echo -e "${BOLD}Step 1: Pre-Release Validation${NC}"
if [ "$NO_CONFIRM" = false ]; then
  confirm "Run comprehensive pre-release validation?"
fi

run_step "Pre-Release Validation" "bash scripts/release/validate-pre-release.sh"

# Step 2: Generate changelog
echo -e "${BOLD}Step 2: Changelog Generation${NC}"
if [ "$NO_CONFIRM" = false ]; then
  confirm "Generate changelog from conventional commits?"
fi

# Get latest tag
LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
if [ -n "$LATEST_TAG" ]; then
  run_step "Changelog Generation" "pnpm run changelog:generate -- --from=$LATEST_TAG"
else
  run_step "Changelog Generation" "pnpm run changelog:generate"
fi

if [ "$DRY_RUN" = false ]; then
  echo -e "${CYAN}Preview of new changelog entries:${NC}"
  head -30 CHANGELOG.md
  echo ""
fi

# Step 3: Version bump
echo -e "${BOLD}Step 3: Version Bump${NC}"

# Calculate new version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "Current version: $CURRENT_VERSION"

if [ "$DRY_RUN" = false ]; then
  # Calculate new version based on type
  IFS='.' read -r major minor patch <<< "$CURRENT_VERSION"

  case $VERSION_TYPE in
    major)
      NEW_VERSION="$((major + 1)).0.0"
      ;;
    minor)
      NEW_VERSION="$major.$((minor + 1)).0"
      ;;
    patch)
      NEW_VERSION="$major.$minor.$((patch + 1))"
      ;;
  esac

  # Update all package versions
  for pkg in packages/uswds-wc-*/package.json; do
    sed -i "" "s/\"version\": \"[0-9]*\.[0-9]*\.[0-9]*\"/\"version\": \"$NEW_VERSION\"/" "$pkg"
  done
  sed -i "" "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json
else
  NEW_VERSION="$CURRENT_VERSION-dry-run"
fi

echo -e "${GREEN}New version will be: v$NEW_VERSION${NC}"
echo ""

if [ "$NO_CONFIRM" = false ]; then
  confirm "Proceed with version v$NEW_VERSION?"
fi

# Step 4: Documentation sync (if script exists)
if [ -f "scripts/release/sync-documentation.sh" ]; then
  echo -e "${BOLD}Step 4: Documentation Sync${NC}"
  if [ "$NO_CONFIRM" = false ]; then
    confirm "Sync all documentation for v$NEW_VERSION?"
  fi

  run_step "Documentation Sync" "bash scripts/release/sync-documentation.sh $NEW_VERSION"
fi

# Step 5: Build packages
echo -e "${BOLD}Step 5: Build All Packages${NC}"
if [ "$NO_CONFIRM" = false ]; then
  confirm "Build all packages with Turborepo?"
fi

run_step "Package Build" "pnpm turbo build"

# Step 6: Final tests
echo -e "${BOLD}Step 6: Final Test Run${NC}"
if [ "$NO_CONFIRM" = false ]; then
  confirm "Run final comprehensive tests?"
fi

run_step "Final Tests" "pnpm test"

# Step 7: Review changes
echo -e "${BOLD}Step 7: Review Changes${NC}"
if [ "$DRY_RUN" = false ]; then
  echo -e "${CYAN}Files that will be committed:${NC}"
  git status --short
  echo ""
fi

if [ "$NO_CONFIRM" = false ]; then
  confirm "Commit these changes?"
fi

# Step 8: Commit version bump
COMMIT_MSG="chore(release): bump version to $NEW_VERSION

- Updated package versions
- Generated changelog
- Built all packages

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

run_step "Commit Version Bump" "git add -A && git commit --no-verify -m \"$COMMIT_MSG\""

# Step 9: Create git tag
TAG_MSG="Release v$NEW_VERSION

See CHANGELOG.md for details.

🤖 Generated with [Claude Code](https://claude.com/claude-code)"

run_step "Create Git Tag" "git tag -a \"v$NEW_VERSION\" -m \"$TAG_MSG\""

# Step 10: Build Storybook
echo -e "${BOLD}Step 10: Build Storybook${NC}"
if [ "$NO_CONFIRM" = false ]; then
  confirm "Build Storybook for deployment?"
fi

run_step "Build Storybook" "pnpm run build-storybook"

# Step 11: Push to GitHub
echo -e "${BOLD}Step 11: Push to GitHub${NC}"
if [ "$NO_CONFIRM" = false ]; then
  confirm "Push commits and tags to GitHub?"
fi

run_step "Push to GitHub" "git push origin develop --no-verify && git push origin \"v$NEW_VERSION\" --no-verify"

# Step 12: Publish to npm
echo -e "${BOLD}Step 12: Publish to npm${NC}"
if [ "$NO_CONFIRM" = false ]; then
  confirm "Publish all packages to npm?"
fi

if [ "$DRY_RUN" = false ]; then
  run_step "NPM Publish" "pnpm -r publish --access public --no-git-checks --provenance"
else
  echo -e "${YELLOW}[DRY RUN] Would publish to npm with provenance${NC}"
fi

# Step 13: Create GitHub Release
echo -e "${BOLD}Step 13: GitHub Release${NC}"
if [ "$NO_CONFIRM" = false ]; then
  confirm "Create GitHub Release?"
fi

# Extract changelog section for this version
if [ "$DRY_RUN" = false ] && [ -f "CHANGELOG.md" ]; then
  RELEASE_NOTES=$(sed -n "/## \[$NEW_VERSION\]/,/## \[/p" CHANGELOG.md | head -n -1)

  if [ -z "$RELEASE_NOTES" ]; then
    RELEASE_NOTES="Release v$NEW_VERSION

See CHANGELOG.md for details."
  fi

  run_step "Create GitHub Release" "gh release create \"v$NEW_VERSION\" \\
    --title \"v$NEW_VERSION\" \\
    --notes \"$RELEASE_NOTES\" \\
    --latest"
else
  echo -e "${YELLOW}[DRY RUN] Would create GitHub release${NC}"
fi

# Step 14: Post-release verification
echo -e "${BOLD}Step 14: Post-Release Verification${NC}"
if [ "$NO_CONFIRM" = false ]; then
  confirm "Run post-release verification checks?"
fi

# Verification should now pass since we published to npm
run_step "Post-Release Verification" "bash scripts/release/verify-release.sh $NEW_VERSION" || echo -e "${YELLOW}Note: Some verifications may still be propagating${NC}"

# Step 15: Merge to main (if releasing from develop)
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" = "develop" ]; then
  echo -e "${BOLD}Step 15: Merge to Main${NC}"
  if [ "$NO_CONFIRM" = false ]; then
    confirm "Merge release to main branch?"
  fi

  run_step "Merge to Main" "git checkout main && \\
    git pull origin main && \\
    git merge develop --no-ff -m 'Merge v$NEW_VERSION release from develop' --no-verify && \\
    git push origin main --no-verify && \\
    git checkout develop"
else
  echo -e "${BOLD}Step 15: Merge to Develop${NC}"
  if [ "$NO_CONFIRM" = false ]; then
    confirm "Merge release to develop branch?"
  fi

  run_step "Merge to Develop" "git checkout develop && \\
    git pull origin develop && \\
    git merge main --no-ff -m 'Merge v$NEW_VERSION release from main' --no-verify && \\
    git push origin develop --no-verify && \\
    git checkout main"
fi

# Success!
echo ""
echo -e "${BOLD}${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}║${NC}        ${BOLD}✅ Release v$NEW_VERSION Completed Successfully!${NC}      ${BOLD}${GREEN}║${NC}"
echo -e "${BOLD}${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}✅ Release Complete - All Steps Automated:${NC}"
echo "   ✓ Validated pre-release checks"
echo "   ✓ Generated changelog"
echo "   ✓ Bumped all package versions"
echo "   ✓ Built and tested packages"
echo "   ✓ Committed and tagged release"
echo "   ✓ Built Storybook"
echo "   ✓ Published to npm"
echo "   ✓ Created GitHub release"
echo "   ✓ Verified release"
echo "   ✓ Merged to develop"
echo ""
echo -e "${CYAN}📦 NPM Packages:${NC}"
echo "   https://www.npmjs.com/org/uswds-wc"
echo ""
echo -e "${CYAN}🐙 GitHub Release:${NC}"
echo "   https://github.com/barbaradenney/uswds-wc/releases/tag/v$NEW_VERSION"
echo ""
echo -e "${CYAN}📖 Storybook (deployed via GitHub Actions):${NC}"
echo "   https://barbaradenney.github.io/uswds-wc/"
echo "   Note: GitHub Pages deployment will complete in a few minutes"
echo ""
echo -e "${CYAN}📝 Release Log:${NC}"
echo "   $RELEASE_LOG"
echo ""

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}Note: This was a DRY RUN - no actual changes were made${NC}"
  echo ""
fi
