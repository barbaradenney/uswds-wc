#!/bin/bash
# Interactive Release Script
# Comprehensive systematic release process with confirmations
# Usage: ./scripts/release/release-interactive.sh [--dry-run]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Configuration
DRY_RUN=false
if [ "$1" = "--dry-run" ]; then
  DRY_RUN=true
  echo -e "${YELLOW}🔍 DRY RUN MODE - No actual changes will be made${NC}"
  echo ""
fi

RELEASE_LOG="/tmp/release-$(date +%Y%m%d-%H%M%S).log"
echo "Release started at $(date)" | tee "$RELEASE_LOG"

# Function to prompt for confirmation
confirm() {
  local prompt="$1"
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

# Step 1: Select release type
echo -e "${BOLD}Step 1: Select Release Type${NC}"
echo "  1) patch (bug fixes)"
echo "  2) minor (new features)"
echo "  3) major (breaking changes)"
echo ""
echo -n "Enter selection (1-3): "
read -r release_choice

case $release_choice in
  1) VERSION_TYPE="patch" ;;
  2) VERSION_TYPE="minor" ;;
  3) VERSION_TYPE="major" ;;
  *)
    echo -e "${RED}Invalid selection${NC}"
    exit 1
    ;;
esac

echo -e "${GREEN}✓${NC} Selected: $VERSION_TYPE release"
echo ""

# Step 2: Pre-release validation
echo -e "${BOLD}Step 2: Pre-Release Validation${NC}"
confirm "Run comprehensive pre-release validation?"

run_step "Pre-Release Validation" "bash scripts/release/validate-pre-release.sh"

# Step 3: Generate changelog
echo -e "${BOLD}Step 3: Changelog Generation${NC}"
confirm "Generate changelog from conventional commits?"

run_step "Changelog Generation" "pnpm run changelog:generate"

echo -e "${CYAN}Preview of new changelog entries:${NC}"
if [ "$DRY_RUN" = false ]; then
  head -30 CHANGELOG.md
fi
echo ""

# Step 4: Version bump
echo -e "${BOLD}Step 4: Version Bump${NC}"

# Calculate new version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "Current version: $CURRENT_VERSION"

if [ "$DRY_RUN" = false ]; then
  # Try changesets first
  if pnpm changeset version >> "$RELEASE_LOG" 2>&1; then
    NEW_VERSION=$(node -p "require('./package.json').version")
  else
    # Fallback to manual bump
    NEW_VERSION=$(node -p "require('./package.json').version.split('.').map((n,i)=>i==={patch:2,minor:1,major:0}['$VERSION_TYPE']?+n+1:i>['major','minor','patch'].indexOf('$VERSION_TYPE')?0:n).join('.')")

    for pkg in packages/uswds-wc-*/package.json; do
      sed -i "" "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" "$pkg"
    done
    sed -i "" "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" package.json
  fi
else
  NEW_VERSION="$CURRENT_VERSION-dry-run"
fi

echo -e "${GREEN}New version will be: v$NEW_VERSION${NC}"
echo ""

confirm "Proceed with version v$NEW_VERSION?"

# Step 5: Documentation sync
echo -e "${BOLD}Step 5: Documentation Sync${NC}"
confirm "Sync all documentation for v$NEW_VERSION?"

run_step "Documentation Sync" "bash scripts/release/sync-documentation.sh $NEW_VERSION"

# Step 6: Build packages
echo -e "${BOLD}Step 6: Build All Packages${NC}"
confirm "Build all packages with Turborepo?"

run_step "Package Build" "pnpm turbo build"

# Step 7: Final tests
echo -e "${BOLD}Step 7: Final Test Run${NC}"
confirm "Run final comprehensive tests?"

run_step "Final Tests" "pnpm test"

# Step 8: Review changes
echo -e "${BOLD}Step 8: Review Changes${NC}"
if [ "$DRY_RUN" = false ]; then
  echo -e "${CYAN}Files that will be committed:${NC}"
  git status --short
  echo ""
fi

confirm "Commit these changes?"

# Step 9: Commit version bump
run_step "Commit Version Bump" "git add -A && git commit --no-verify -m 'chore(release): bump version to $NEW_VERSION

- Updated package versions
- Generated changelog
- Synced documentation

🤖 Generated with [Claude Code](https://claude.com/claude-code)'"

# Step 10: Create git tag
run_step "Create Git Tag" "git tag -a \"v$NEW_VERSION\" -m \"Release v$NEW_VERSION\""

# Step 11: Publish to npm
echo -e "${BOLD}Step 9: NPM Publishing${NC}"
confirm "Publish all packages to npm?"

if [ "$DRY_RUN" = false ]; then
  run_step "NPM Publish" "pnpm -r publish --access public --no-git-checks --provenance"
else
  echo -e "${YELLOW}[DRY RUN] Would publish to npm with provenance${NC}"
fi

# Step 12: Push to GitHub
echo -e "${BOLD}Step 10: Push to GitHub${NC}"
confirm "Push commits and tags to GitHub?"

run_step "Push to GitHub" "git push origin main --no-verify && git push origin \"v$NEW_VERSION\" --no-verify"

# Step 13: Deploy Storybook
echo -e "${BOLD}Step 11: Storybook Deployment${NC}"
confirm "Deploy Storybook to GitHub Pages?"

run_step "Build Storybook" "pnpm run build-storybook"
run_step "Deploy Storybook" "pnpm run deploy-storybook"

# Step 14: Create GitHub Release
echo -e "${BOLD}Step 12: GitHub Release${NC}"
confirm "Create GitHub Release with auto-generated notes?"

# Extract changelog section for this version
if [ "$DRY_RUN" = false ] && [ -f "CHANGELOG.md" ]; then
  RELEASE_NOTES=$(sed -n "/## \[$NEW_VERSION\]/,/## \[/p" CHANGELOG.md | head -n -1)

  run_step "Create GitHub Release" "gh release create \"v$NEW_VERSION\" \\
    --title \"v$NEW_VERSION\" \\
    --notes \"$RELEASE_NOTES\" \\
    --latest"
else
  echo -e "${YELLOW}[DRY RUN] Would create GitHub release${NC}"
fi

# Step 15: Post-release verification
echo -e "${BOLD}Step 13: Post-Release Verification${NC}"
confirm "Run post-release verification checks?"

run_step "Post-Release Verification" "bash scripts/release/verify-release.sh $NEW_VERSION"

# Step 16: Merge to develop
echo -e "${BOLD}Step 14: Merge to Develop${NC}"
confirm "Merge release to develop branch?"

run_step "Merge to Develop" "git checkout develop && \\
  git pull origin develop && \\
  git merge main --no-ff -m 'Merge v$NEW_VERSION release from main' --no-verify && \\
  git push origin develop --no-verify && \\
  git checkout main"

# Success!
echo ""
echo -e "${BOLD}${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}║${NC}        ${BOLD}✅ Release v$NEW_VERSION Completed Successfully!${NC}      ${BOLD}${GREEN}║${NC}"
echo -e "${BOLD}${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}📦 NPM Packages:${NC}"
echo "   https://www.npmjs.com/org/uswds-wc"
echo ""
echo -e "${CYAN}🐙 GitHub Release:${NC}"
echo "   https://github.com/barbaradenney/uswds-wc/releases/tag/v$NEW_VERSION"
echo ""
echo -e "${CYAN}📖 Storybook:${NC}"
echo "   https://barbaradenney.github.io/uswds-wc/"
echo ""
echo -e "${CYAN}📝 Release Log:${NC}"
echo "   $RELEASE_LOG"
echo ""

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}Note: This was a DRY RUN - no actual changes were made${NC}"
  echo ""
fi
