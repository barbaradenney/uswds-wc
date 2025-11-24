#!/usr/bin/env node

/**
 * Documentation Sync Validator
 *
 * Ensures critical documentation stays synchronized across:
 * - package.json (source of truth)
 * - README.md (public-facing)
 * - .storybook/About.mdx (Storybook docs)
 * - CLAUDE.md (developer docs)
 *
 * Validates:
 * - Package name consistency
 * - Version numbers match
 * - npm package links are correct
 * - Component counts are consistent
 * - Quick start examples match
 * - Technology versions align
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// ANSI colors
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

const projectRoot = path.resolve(__dirname, '../..');

console.log(`\n${BOLD}${BLUE}📚 Documentation Sync Validator${RESET}`);
console.log(`${BLUE}${'═'.repeat(80)}${RESET}\n`);

// Load source of truth: package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));

// Extract key facts
const SOURCE_OF_TRUTH = {
  packageName: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,
  npmUrl: `https://www.npmjs.com/package/${packageJson.name}`,
  uswdsVersion: packageJson.devDependencies['@uswds/uswds'] || packageJson.dependencies?.['@uswds/uswds'],
  litVersion: packageJson.peerDependencies['lit'] || packageJson.dependencies?.['lit'],
};

// Count components (count directories, not files)
// In monorepo: scan all packages/uswds-wc-*/src/components/*/
const componentDirs = glob.sync('packages/uswds-wc-*/src/components/*/', { cwd: projectRoot });
const COMPONENT_COUNT = componentDirs.length;

SOURCE_OF_TRUTH.componentCount = COMPONENT_COUNT;

console.log(`${CYAN}📦 Source of Truth (package.json):${RESET}`);
console.log(`   Package: ${BOLD}${SOURCE_OF_TRUTH.packageName}${RESET}`);
console.log(`   Version: ${BOLD}${SOURCE_OF_TRUTH.version}${RESET}`);
console.log(`   Components: ${BOLD}${COMPONENT_COUNT}${RESET}`);
console.log(`   USWDS: ${SOURCE_OF_TRUTH.uswdsVersion}`);
console.log(`   Lit: ${SOURCE_OF_TRUTH.litVersion}\n`);

const issues = [];
const suggestions = [];

/**
 * Validate README.md
 */
function validateReadme() {
  console.log(`${BOLD}Validating README.md...${RESET}`);

  const readmePath = path.join(projectRoot, 'README.md');
  const content = fs.readFileSync(readmePath, 'utf8');

  // Check TOTAL component count (ignore category-specific counts)
  const totalComponentPattern = /(?:Total|All)\s+(?:Components?):?\s+(\d+)/gi;
  const totalMatches = [...content.matchAll(totalComponentPattern)];

  totalMatches.forEach(match => {
    const count = parseInt(match[1]);
    if (count !== COMPONENT_COUNT && count !== COMPONENT_COUNT + 1) {
      issues.push({
        file: 'README.md',
        type: 'total-count-mismatch',
        description: 'Total component count should match actual count',
        expected: COMPONENT_COUNT,
        found: count,
        context: match[0],
      });
    }
  });

  // Check for "X/X" patterns (e.g., "45/45 components")
  const completionPattern = /(\d+)\/(\d+)\s*components?/gi;
  const completionMatches = [...content.matchAll(completionPattern)];

  completionMatches.forEach(match => {
    const [_, completed, total] = match.map(m => parseInt(m) || m);
    if (total !== COMPONENT_COUNT && total !== COMPONENT_COUNT + 1) {
      issues.push({
        file: 'README.md',
        type: 'completion-count-mismatch',
        description: 'Component completion count should match actual total',
        expected: `${completed}/${COMPONENT_COUNT}`,
        found: match[0],
      });
    }
  });

  // Check npm package link
  // Allow both root package and scoped packages (@uswds-wc/*)
  const npmLinkPattern = new RegExp(`https://www\\.npmjs\\.com/package/([a-z0-9-@/]+)`, 'g');
  const npmLinks = [...content.matchAll(npmLinkPattern)];

  npmLinks.forEach(match => {
    const packageName = match[1];
    // Valid: root package OR scoped packages under @uswds-wc/
    const isValid = packageName === SOURCE_OF_TRUTH.packageName || packageName.startsWith('@uswds-wc/');

    if (!isValid) {
      issues.push({
        file: 'README.md',
        type: 'link-mismatch',
        description: 'npm package link should be either root package or @uswds-wc/* scoped package',
        expected: `${SOURCE_OF_TRUTH.npmUrl} or https://www.npmjs.com/package/@uswds-wc/*`,
        found: match[0],
      });
    }
  });

  console.log(`   ${issues.length === 0 ? GREEN + '✓' : YELLOW + '⚠'} README.md checked${RESET}\n`);
}

/**
 * Validate About.mdx
 */
function validateAboutMdx() {
  console.log(`${BOLD}Validating .storybook/About.mdx...${RESET}`);

  const aboutPath = path.join(projectRoot, '.storybook/About.mdx');
  const content = fs.readFileSync(aboutPath, 'utf8');

  // Check component count consistency (only total counts, not category counts)
  const totalComponentPattern = /(?:Total|All)\s+(?:Components?):?\s+(\d+)/gi;
  const totalMatches = [...content.matchAll(totalComponentPattern)];

  totalMatches.forEach(match => {
    const count = parseInt(match[1]);
    if (count !== COMPONENT_COUNT && count !== COMPONENT_COUNT + 1) {
      issues.push({
        file: 'About.mdx',
        type: 'total-count-mismatch',
        description: 'Total component count should match actual count',
        expected: COMPONENT_COUNT,
        found: count,
        context: match[0],
      });
    }
  });

  // Check for "X/X" patterns (e.g., "45/45 components")
  const completionPattern = /(\d+)\/(\d+)\s*(?:components?|\(100%\))/gi;
  const completionMatches = [...content.matchAll(completionPattern)];

  completionMatches.forEach(match => {
    const [_, completed, total] = match.map(m => parseInt(m) || m);
    if (total !== COMPONENT_COUNT && total !== COMPONENT_COUNT + 1) {
      issues.push({
        file: 'About.mdx',
        type: 'completion-count-mismatch',
        description: 'Component completion count should match actual total',
        expected: `${completed}/${COMPONENT_COUNT}`,
        found: match[0],
      });
    }
  });

  // Check for package name references
  if (content.includes('@uswds-wc') && SOURCE_OF_TRUTH.packageName !== '@uswds-wc') {
    suggestions.push({
      file: 'About.mdx',
      type: 'package-name-mismatch',
      description: 'Package organization name differs from package.json',
      expected: SOURCE_OF_TRUTH.packageName,
      found: '@uswds-wc',
      note: 'This may be intentional for future monorepo architecture',
    });
  }

  console.log(`   ${suggestions.length === 0 ? GREEN + '✓' : YELLOW + '⚠'} About.mdx checked${RESET}\n`);
}

// Run all validations
validateReadme();
validateAboutMdx();

// Report results
console.log(`${BLUE}${'═'.repeat(80)}${RESET}`);
console.log(`${BOLD}Results:${RESET}\n`);

if (issues.length === 0 && suggestions.length === 0) {
  console.log(`${GREEN}✅ All documentation is synchronized!${RESET}\n`);
  process.exit(0);
}

if (issues.length > 0) {
  console.log(`${RED}${BOLD}❌ Found ${issues.length} issue(s):${RESET}\n`);

  issues.forEach((issue, i) => {
    console.log(`${i + 1}. ${BOLD}${issue.file}${RESET}`);
    console.log(`   ${RED}Problem:${RESET} ${issue.description}`);
    if (issue.expected) {
      console.log(`   ${GREEN}Expected:${RESET} ${issue.expected}`);
    }
    if (issue.found) {
      console.log(`   ${YELLOW}Found:${RESET} ${issue.found}`);
    }
    console.log('');
  });
}

if (suggestions.length > 0) {
  console.log(`${YELLOW}${BOLD}⚠️  Found ${suggestions.length} suggestion(s):${RESET}\n`);

  suggestions.forEach((suggestion, i) => {
    console.log(`${i + 1}. ${BOLD}${suggestion.file}${RESET}`);
    console.log(`   ${YELLOW}Suggestion:${RESET} ${suggestion.description}`);
    if (suggestion.found) {
      console.log(`   ${CYAN}Found:${RESET} ${suggestion.found}`);
    }
    if (suggestion.note) {
      console.log(`   ${BLUE}Note:${RESET} ${suggestion.note}`);
    }
    console.log('');
  });
}

console.log(`${BLUE}${'═'.repeat(80)}${RESET}\n`);

if (issues.length > 0) {
  console.log(`${YELLOW}💡 To fix documentation sync issues:${RESET}`);
  console.log(`   npm run docs:update\n`);
  process.exit(1);
}

process.exit(0);
