#!/usr/bin/env node
/**
 * Component Changelog Management Script
 * Automatically manages per-component changelogs based on git changes and commit messages
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration - support both legacy and monorepo structures
const LEGACY_COMPONENTS_DIR = path.join(__dirname, '../../src/components');
const PACKAGES_DIR = path.join(__dirname, '../../packages');

// Backwards compatibility
const COMPONENTS_DIR = LEGACY_COMPONENTS_DIR;

// Changelog entry types based on conventional commits
const CHANGELOG_TYPES = {
  feat: 'Added',
  fix: 'Fixed',
  docs: 'Changed',
  style: 'Changed',
  refactor: 'Changed',
  test: 'Changed',
  chore: 'Changed',
  perf: 'Changed',
  build: 'Changed',
  ci: 'Changed',
  revert: 'Fixed',
  security: 'Security',
  deprecate: 'Deprecated',
  remove: 'Removed',
};

/**
 * Get all component directories from both legacy and monorepo structures
 * Returns array of { name, path } objects
 */
function getAllComponentDirs() {
  const dirs = [];

  // Legacy src/components structure
  if (fs.existsSync(LEGACY_COMPONENTS_DIR)) {
    try {
      fs.readdirSync(LEGACY_COMPONENTS_DIR)
        .filter(dir => fs.statSync(path.join(LEGACY_COMPONENTS_DIR, dir)).isDirectory())
        .forEach(dir => dirs.push({ name: dir, path: path.join(LEGACY_COMPONENTS_DIR, dir) }));
    } catch (e) {
      // Ignore errors
    }
  }

  // Monorepo packages/*/src/components structure
  if (fs.existsSync(PACKAGES_DIR)) {
    try {
      fs.readdirSync(PACKAGES_DIR)
        .filter(pkg => pkg.startsWith('uswds-wc-'))
        .forEach(pkg => {
          const componentsPath = path.join(PACKAGES_DIR, pkg, 'src/components');
          if (fs.existsSync(componentsPath)) {
            fs.readdirSync(componentsPath)
              .filter(dir => fs.statSync(path.join(componentsPath, dir)).isDirectory())
              .forEach(dir => dirs.push({ name: dir, path: path.join(componentsPath, dir) }));
          }
        });
    } catch (e) {
      // Ignore errors
    }
  }

  return dirs;
}

/**
 * Get all component directories (legacy function for backwards compatibility)
 */
function getComponentDirs() {
  return getAllComponentDirs().map(c => c.name);
}

/**
 * Parse conventional commit message
 */
function parseCommitMessage(message) {
  // Conventional commit pattern: type(scope): description
  const conventionalPattern = /^(\w+)(?:\(([^)]+)\))?: (.+)$/;
  const match = message.match(conventionalPattern);

  if (match) {
    const [, type, scope, description] = match;
    return {
      type,
      scope,
      description,
      isBreaking: message.includes('BREAKING CHANGE') || message.includes('!'),
    };
  }

  // Fallback for non-conventional commits
  return {
    type: 'chore',
    scope: null,
    description: message,
    isBreaking: false,
  };
}

/**
 * Get changed components with detailed file analysis
 * Supports both legacy src/components/ and monorepo packages/[pkg]/src/components/
 */
function getChangedComponents(fromCommit = 'HEAD~1', toCommit = 'HEAD') {
  try {
    const diffOutput = execSync(`git diff --name-status ${fromCommit} ${toCommit}`, {
      encoding: 'utf8',
    });
    const changedFiles = diffOutput.split('\n').filter(Boolean);

    const componentChanges = new Map();

    changedFiles.forEach((line) => {
      const [status, file] = line.split('\t');
      if (!file) return;

      // Try legacy path first: src/components/component-name/file
      let match = file.match(/^src\/components\/([^/]+)\/(.+)$/);
      let componentPath = null;

      if (match) {
        componentPath = path.join(LEGACY_COMPONENTS_DIR, match[1]);
      } else {
        // Try monorepo path: packages/uswds-wc-*/src/components/component-name/file
        match = file.match(/^packages\/(uswds-wc-[^/]+)\/src\/components\/([^/]+)\/(.+)$/);
        if (match) {
          const [, pkgName, componentName, fileName] = match;
          componentPath = path.join(PACKAGES_DIR, pkgName, 'src/components', componentName);
          // Reconstruct match to have consistent structure
          match = [null, componentName, fileName];
        }
      }

      if (match && componentPath) {
        const [, componentName, fileName] = match;

        // Use componentPath as unique key to handle same component name in different packages
        const key = `${componentName}:${componentPath}`;

        if (!componentChanges.has(key)) {
          componentChanges.set(key, {
            component: componentName,
            componentPath: componentPath,
            files: [],
            types: new Set(),
          });
        }

        const change = componentChanges.get(key);
        change.files.push({ status, fileName });

        // Categorize the type of change
        if (
          fileName.endsWith('.ts') &&
          !fileName.includes('.test.') &&
          !fileName.includes('.stories.')
        ) {
          change.types.add('implementation');
        } else if (fileName.endsWith('.test.ts')) {
          change.types.add('tests');
        } else if (fileName.endsWith('.stories.ts')) {
          change.types.add('stories');
        } else if (fileName.endsWith('.scss') || fileName.endsWith('.css')) {
          change.types.add('styles');
        } else if (fileName === 'README.mdx' || fileName === 'README.md') {
          change.types.add('documentation');
        } else if (fileName === 'CHANGELOG.mdx' || fileName === 'CHANGELOG.md') {
          change.types.add('changelog');
        } else if (fileName.endsWith('.mdx')) {
          change.types.add('docs');
        }
      }
    });

    return Array.from(componentChanges.values());
  } catch (error) {
    console.warn('⚠️  Could not get changed components from git:', error.message);
    return [];
  }
}

/**
 * Create changelog content for a component as MDX
 */
function createComponentChangelog(componentName) {
  const today = new Date().toISOString().split('T')[0];
  const componentTitle = componentName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return `---
meta:
  title: ${componentTitle} Changelog
  component: usa-${componentName}
---

# ${componentTitle} Changelog

All notable changes to the ${componentName} component will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - ${today}

### Added
- Initial ${componentName} component implementation
- USWDS styling and design system compliance
- Accessibility features and ARIA support
- Comprehensive test coverage
- Storybook stories and documentation
- TypeScript definitions and type safety

### Dependencies
- lit: ^3.3.1
- USWDS classes: .usa-${componentName}

---
*This changelog is automatically updated by git hooks and scripts.*
*See \`docs/CHANGELOG_MANAGEMENT.md\` for more information.*
`;
}

/**
 * Generate component-specific changelog entry based on changes
 */
function generateComponentEntry(componentChange, commitInfo, commitHash) {
  const { files, types } = componentChange;
  const { type, description, isBreaking } = commitInfo;
  const today = new Date().toISOString().split('T')[0];

  let entries = [];
  let changelogSection = CHANGELOG_TYPES[type] || 'Changed';

  // Convert types Set to Array for easier processing
  const changeTypes = Array.from(types);

  // Generate specific entries based on what actually changed
  if (changeTypes.includes('implementation')) {
    const implFiles = files.filter(
      (f) =>
        f.fileName.endsWith('.ts') &&
        !f.fileName.includes('.test.') &&
        !f.fileName.includes('.stories.')
    );

    if (type === 'feat') {
      entries.push('Enhanced component functionality and features');
    } else if (type === 'fix') {
      entries.push('Fixed component behavior and resolved issues');
    } else if (type === 'refactor') {
      entries.push('Improved component structure and code quality');
    } else {
      entries.push('Updated component implementation');
    }

    // Check for specific patterns
    const hasStructuralChanges = implFiles.some(
      (f) => f.status === 'M' && description.toLowerCase().includes('restructure')
    );
    const hasBreakingChanges = isBreaking || description.includes('BREAKING');
    const hasComplianceChanges =
      description.toLowerCase().includes('uswds') ||
      description.toLowerCase().includes('compliance');

    if (hasStructuralChanges) {
      entries.push('Major architectural improvements for better maintainability');
    }

    if (hasComplianceChanges) {
      entries.push('Enhanced USWDS design system compliance');
      entries.push('Improved CSS class usage to match official USWDS patterns');
    }

    if (hasBreakingChanges) {
      changelogSection = 'Changed'; // Breaking changes go in Changed section
    }
  }

  if (changeTypes.includes('styles')) {
    const styleFiles = files.filter(
      (f) => f.fileName.endsWith('.scss') || f.fileName.endsWith('.css')
    );
    const removedStyles = styleFiles.filter((f) => f.status === 'D');
    const modifiedStyles = styleFiles.filter((f) => f.status === 'M');

    if (removedStyles.length > 0) {
      entries.push('Removed custom CSS in favor of pure USWDS styling');
      entries.push('Eliminated component-specific SCSS files for better compliance');
    } else if (modifiedStyles.length > 0) {
      entries.push('Updated component styling and CSS structure');
    }
  }

  if (changeTypes.includes('tests')) {
    entries.push('Enhanced test coverage and validation');
    if (type === 'fix') {
      entries.push('Fixed test assertions and improved reliability');
    }
  }

  if (changeTypes.includes('stories')) {
    entries.push('Updated Storybook stories and interactive examples');
    if (description.toLowerCase().includes('co-located')) {
      entries.push('Migrated stories to co-located structure for better organization');
    }
  }

  if (changeTypes.includes('documentation')) {
    entries.push('Updated component documentation and usage guidelines');
  }

  if (changeTypes.includes('docs')) {
    entries.push('Enhanced MDX documentation and examples');
  }

  // If no specific changes detected, fall back to generic entry
  if (entries.length === 0) {
    entries.push(`${description} (${commitHash.substring(0, 8)})`);
  }

  // Add date and breaking change markers
  const formattedEntries = entries.map((entry) => {
    const breakingPrefix = isBreaking ? '**BREAKING**: ' : '';
    return `${breakingPrefix}${entry} (${today})`;
  });

  return {
    section: changelogSection,
    entries: formattedEntries,
    date: today,
  };
}

/**
 * Update component changelog with new entry
 * @param {string} componentName - Name of the component
 * @param {object} entryData - Entry data with section and entries
 * @param {string} version - Version string (default: 'Unreleased')
 * @param {string} componentPath - Optional path to component directory (for monorepo support)
 */
function updateComponentChangelog(componentName, entryData, version = 'Unreleased', componentPath = null) {
  // Use provided path or fall back to legacy path
  const componentDir = componentPath || path.join(COMPONENTS_DIR, componentName);
  const changelogPath = path.join(componentDir, 'CHANGELOG.mdx');

  // Create changelog if it doesn't exist
  if (!fs.existsSync(changelogPath)) {
    const initialContent = createComponentChangelog(componentName);
    fs.writeFileSync(changelogPath, initialContent, 'utf8');
    console.log(`📝 Created initial changelog for ${componentName}`);
  }

  // Read existing changelog
  let content = fs.readFileSync(changelogPath, 'utf8');

  // Handle both old format (single entry) and new format (multiple entries)
  const entries = entryData.entries || [entryData.text || entryData];
  const section = entryData.section || 'Changed';

  // Find the position to insert the new entry
  const versionHeader = version === 'Unreleased' ? '## [Unreleased]' : `## [${version}]`;
  let versionIndex = content.indexOf(versionHeader);

  // If [Unreleased] section doesn't exist, create it before the first version
  if (versionIndex === -1 && version === 'Unreleased') {
    // Find the first version section (e.g., ## [1.0.0])
    const firstVersionMatch = content.match(/## \[\d+\.\d+\.\d+\]/);
    if (firstVersionMatch) {
      const insertPos = content.indexOf(firstVersionMatch[0]);
      const unreleasedSection = '## [Unreleased]\n\n';
      content = content.slice(0, insertPos) + unreleasedSection + content.slice(insertPos);
      versionIndex = insertPos;
      console.log(`📝 Added [Unreleased] section to ${componentName} changelog`);
    } else {
      console.warn(`⚠️  Could not find ${versionHeader} or version section in ${componentName} changelog`);
      return false;
    }
  }

  if (versionIndex === -1) {
    console.warn(`⚠️  Could not find ${versionHeader} section in ${componentName} changelog`);
    return false;
  }

  // Find the appropriate subsection
  const sectionHeader = `### ${section}`;
  let insertPosition;

  // Look for existing section after the version header
  const afterVersionIndex = versionIndex + versionHeader.length;
  const sectionIndex = content.indexOf(sectionHeader, afterVersionIndex);

  if (sectionIndex !== -1 && sectionIndex < content.indexOf('## [', afterVersionIndex)) {
    // Section exists, find where to insert the entries
    const sectionEnd = content.indexOf('###', sectionIndex + sectionHeader.length);
    const nextVersionStart = content.indexOf('## [', sectionIndex);

    insertPosition =
      sectionEnd !== -1 && sectionEnd < nextVersionStart ? sectionEnd : nextVersionStart;
    insertPosition = content.lastIndexOf('\n', insertPosition) + 1;
  } else {
    // Section doesn't exist, create it
    const nextSectionIndex = content.indexOf('###', afterVersionIndex);
    const nextVersionIndex = content.indexOf('## [', afterVersionIndex);

    insertPosition =
      nextSectionIndex !== -1 && nextSectionIndex < nextVersionIndex
        ? nextSectionIndex
        : nextVersionIndex;

    if (insertPosition === -1) {
      insertPosition = content.length;
    }

    // Add the section header
    const entriesText = entries.map((entry) => `- ${entry}`).join('\n');
    const newSection = `\n${sectionHeader}\n\n${entriesText}\n`;
    content = content.slice(0, insertPosition) + newSection + content.slice(insertPosition);
    fs.writeFileSync(changelogPath, content, 'utf8');
    console.log(`✅ Added ${entries.length} changelog entries to ${componentName} (${section})`);
    return true;
  }

  // Insert the new entries
  const entriesText = entries.map((entry) => `- ${entry}\n`).join('');
  content = content.slice(0, insertPosition) + entriesText + content.slice(insertPosition);

  fs.writeFileSync(changelogPath, content, 'utf8');
  console.log(`✅ Added ${entries.length} changelog entries to ${componentName} (${section})`);
  return true;
}

/**
 * Process commit and update relevant changelogs
 */
function processCommit(commitHash, commitMessage) {
  console.log(`\n🔍 Processing commit: ${commitHash.substring(0, 8)}`);
  console.log(`   Message: ${commitMessage}`);

  const parsed = parseCommitMessage(commitMessage);

  // Get components changed in this commit with detailed file analysis
  const changedComponents = getChangedComponents(`${commitHash}~1`, commitHash);

  if (changedComponents.length === 0) {
    console.log('   No component changes detected');
    return;
  }

  console.log(`   Changed components: ${changedComponents.map((c) => c.component).join(', ')}`);

  // Generate intelligent, component-specific changelog entries
  changedComponents.forEach((componentChange) => {
    const entryData = generateComponentEntry(componentChange, parsed, commitHash);
    console.log(
      `   Generating ${entryData.entries.length} entries for ${componentChange.component}`
    );

    // Update changelog for this specific component (pass componentPath for monorepo support)
    updateComponentChangelog(componentChange.component, entryData, 'Unreleased', componentChange.componentPath);
  });
}

/**
 * Initialize changelogs for all components (supports monorepo)
 */
function initializeChangelogs() {
  console.log('🚀 Initializing changelogs for all components...\n');

  const components = getAllComponentDirs();
  let created = 0;
  let existing = 0;

  components.forEach(({ name, path: componentPath }) => {
    const changelogPath = path.join(componentPath, 'CHANGELOG.mdx');

    if (!fs.existsSync(changelogPath)) {
      const content = createComponentChangelog(name);
      fs.writeFileSync(changelogPath, content, 'utf8');
      console.log(`📝 Created: ${name}/CHANGELOG.mdx at ${componentPath}`);
      created++;
    } else {
      console.log(`✅ Exists: ${name}/CHANGELOG.mdx`);
      existing++;
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(`   Created: ${created} changelogs`);
  console.log(`   Existing: ${existing} changelogs`);
  console.log(`   Total components: ${components.length}`);
}

/**
 * Update changelogs from recent commits
 */
function updateFromCommits(numberOfCommits = 10) {
  console.log(`🔄 Updating changelogs from last ${numberOfCommits} commits...\n`);

  try {
    const commits = execSync(`git log --oneline -n ${numberOfCommits} --pretty=format:"%H|%s"`, {
      encoding: 'utf8',
    })
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const [hash, ...messageParts] = line.split('|');
        return { hash, message: messageParts.join('|') };
      });

    commits.reverse(); // Process oldest first

    commits.forEach(({ hash, message }) => {
      processCommit(hash, message);
    });

    console.log(`\n✅ Processed ${commits.length} commits`);
  } catch (error) {
    console.error('❌ Error processing commits:', error.message);
  }
}

/**
 * Validate all component changelogs (supports monorepo)
 */
function validateChangelogs() {
  console.log('🔍 Validating component changelogs...\n');

  const components = getAllComponentDirs();
  const issues = [];

  components.forEach(({ name, path: componentPath }) => {
    const changelogPath = path.join(componentPath, 'CHANGELOG.mdx');

    if (!fs.existsSync(changelogPath)) {
      issues.push(`❌ Missing: ${name}/CHANGELOG.mdx at ${componentPath}`);
      return;
    }

    try {
      const content = fs.readFileSync(changelogPath, 'utf8');

      // Basic validation - check for version sections (either [Unreleased] or numbered version)
      const hasVersionSection = content.includes('## [Unreleased]') || content.match(/## \[\d+\.\d+\.\d+\]/);
      if (!hasVersionSection) {
        issues.push(`⚠️  ${name}: Missing version section`);
      }

      if (content.length < 100) {
        issues.push(`⚠️  ${name}: Changelog appears incomplete`);
      }

      console.log(`✅ Valid: ${name}/CHANGELOG.mdx`);
    } catch (error) {
      issues.push(`❌ Error reading ${name}: ${error.message}`);
    }
  });

  if (issues.length > 0) {
    console.log(`\n⚠️  Found ${issues.length} issues:`);
    issues.forEach((issue) => console.log(`   ${issue}`));
  } else {
    console.log(`\n🎉 All ${components.length} component changelogs are valid!`);
  }

  return issues.length === 0;
}

/**
 * Main CLI handler
 */
function main() {
  const [, , command, ...args] = process.argv;

  console.log('📋 Component Changelog Manager');
  console.log('===============================\n');

  switch (command) {
    case 'init': {
      initializeChangelogs();
      break;
    }

    case 'update': {
      const commits = parseInt(args[0]) || 10;
      updateFromCommits(commits);
      break;
    }

    case 'validate': {
      const isValid = validateChangelogs();
      process.exit(isValid ? 0 : 1);
      break;
    }

    case 'process-commit': {
      const commitHash = args[0];
      const commitMessage = args.slice(1).join(' ');
      if (!commitHash || !commitMessage) {
        console.error('❌ Usage: process-commit <hash> <message>');
        process.exit(1);
      }
      processCommit(commitHash, commitMessage);
      break;
    }

    default:
      console.log('Usage:');
      console.log('  init                    - Initialize changelogs for all components');
      console.log('  update [commits=10]     - Update changelogs from recent commits');
      console.log('  validate                - Validate all component changelogs');
      console.log('  process-commit <hash> <message> - Process a specific commit');
      console.log('\nExamples:');
      console.log('  node scripts/manage-changelogs.js init');
      console.log('  node scripts/manage-changelogs.js update 20');
      console.log('  node scripts/manage-changelogs.js validate');
      break;
  }
}

// Run if called directly
const scriptPath = fileURLToPath(import.meta.url);
const argPath = process.argv[1];
// Handle both direct path comparison and resolved path comparison
if (scriptPath === argPath || import.meta.url === `file://${argPath}`) {
  main();
}

export {
  getComponentDirs,
  getAllComponentDirs,
  parseCommitMessage,
  updateComponentChangelog,
  initializeChangelogs,
  validateChangelogs,
};
