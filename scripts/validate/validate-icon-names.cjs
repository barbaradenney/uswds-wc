#!/usr/bin/env node

/**
 * Icon Name Validator
 *
 * Validates that all icon names used in the codebase match USWDS sprite file.
 * Prevents issues like using "email" instead of "mail".
 *
 * Usage:
 *   node scripts/validate/validate-icon-names.cjs
 *
 * Exit codes:
 *   0 - All icon names valid
 *   1 - Invalid icon names found
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI colors
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

console.log(`${BLUE}🔍 Validating icon names against USWDS sprite file...${RESET}\n`);

// 1. Extract icon IDs from sprite file
const spriteFilePath = path.join(__dirname, '../../public/img/sprite.svg');

if (!fs.existsSync(spriteFilePath)) {
  console.error(`${RED}❌ Error: Sprite file not found at ${spriteFilePath}${RESET}`);
  process.exit(1);
}

const spriteContent = fs.readFileSync(spriteFilePath, 'utf8');
const iconIdMatches = spriteContent.matchAll(/<symbol[^>]+id="([^"]+)"/g);
const validIconNames = new Set([...iconIdMatches].map(match => match[1]));

console.log(`${GREEN}✓${RESET} Found ${validIconNames.size} valid icon names in sprite file\n`);

// 2. Search codebase for icon name references using Node.js file system
const issues = [];
const checkedIcons = new Set();

function searchDirectory(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  files.forEach(file => {
    const filePath = path.join(dir, file.name);

    // Skip certain directories
    if (file.isDirectory()) {
      if (['node_modules', 'dist', '.git', 'coverage'].includes(file.name)) {
        return;
      }
      searchDirectory(filePath, extensions);
      return;
    }

    // Only check relevant file extensions
    if (!extensions.some(ext => file.name.endsWith(ext))) {
      return;
    }

    // Skip test files (they may test invalid icon names)
    if (file.name.endsWith('.test.ts') ||
        file.name.endsWith('.test.tsx') ||
        file.name.endsWith('.cy.ts') ||
        file.name.endsWith('.spec.ts')) {
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(path.join(__dirname, '../..'), filePath);

    // Pattern 1: <usa-icon name="icon_name">
    const usaIconPattern = /<usa-icon[^>]+name=["']([^"']+)["']/g;
    let match;

    while ((match = usaIconPattern.exec(content)) !== null) {
      const iconName = match[1];

      // Skip if it's a variable or placeholder
      if (iconName.includes('$') || iconName.includes('{') || iconName.startsWith('this.')) {
        continue;
      }

      checkedIcons.add(iconName);

      if (!validIconNames.has(iconName)) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        issues.push({
          iconName,
          location: `${relativePath}:${lineNumber}`,
          context: '<usa-icon name="...">',
          suggestion: findSimilarIcon(iconName, validIconNames)
        });
      }
    }

    // Pattern 2: Icon paths in usa-icon.ts (iconPaths object)
    if (file.name === 'usa-icon.ts') {
      const iconPathPattern = /^\s+(\w+):\s*$/gm;

      while ((match = iconPathPattern.exec(content)) !== null) {
        const iconName = match[1];

        // Skip common object properties that aren't icon names
        if (['iconPaths', 'constructor', 'render', 'connectedCallback'].includes(iconName)) {
          continue;
        }

        checkedIcons.add(iconName);

        if (!validIconNames.has(iconName)) {
          const lineNumber = content.substring(0, match.index).split('\n').length;
          issues.push({
            iconName,
            location: `${relativePath}:${lineNumber}`,
            context: 'iconPaths object key',
            suggestion: findSimilarIcon(iconName, validIconNames)
          });
        }
      }
    }
  });
}

const srcDir = path.join(__dirname, '../../src');
const packagesDir = path.join(__dirname, '../../packages');

if (fs.existsSync(srcDir)) {
  searchDirectory(srcDir);
}
if (fs.existsSync(packagesDir)) {
  searchDirectory(packagesDir);
}

console.log(`${GREEN}✓${RESET} Checked ${checkedIcons.size} icon references in codebase\n`);

// 3. Report results
if (issues.length === 0) {
  console.log(`${GREEN}✅ All icon names are valid!${RESET}\n`);
  process.exit(0);
} else {
  console.log(`${RED}❌ Found ${issues.length} invalid icon name(s):${RESET}\n`);

  issues.forEach(({ iconName, location, context, suggestion }) => {
    console.log(`  ${RED}✗${RESET} Invalid icon: "${iconName}"`);
    console.log(`    Location: ${location}`);
    console.log(`    Context: ${context}`);
    if (suggestion) {
      console.log(`    ${YELLOW}Suggestion:${RESET} Did you mean "${suggestion}"?`);
    }
    console.log('');
  });

  console.log(`${BLUE}ℹ${RESET} Valid USWDS icon names can be found in:`);
  console.log(`  - Sprite file: public/img/sprite.svg`);
  console.log(`  - USWDS docs: https://designsystem.digital.gov/components/icon/\n`);

  process.exit(1);
}

/**
 * Find similar icon name using simple string distance
 */
function findSimilarIcon(iconName, validNames) {
  // Known mappings
  const knownMappings = {
    'email': 'mail',
    'e-mail': 'mail',
    'envelope': 'mail'
  };

  if (knownMappings[iconName]) {
    return knownMappings[iconName];
  }

  // Find closest match by prefix
  const matches = [...validNames].filter(name =>
    name.startsWith(iconName.substring(0, 3)) ||
    iconName.startsWith(name.substring(0, 3))
  );

  if (matches.length > 0) {
    return matches[0];
  }

  return null;
}
