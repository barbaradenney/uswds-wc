#!/usr/bin/env node

/**
 * Component README Management Script
 * Automatically updates component README.md files based on git changes and component analysis
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

// Get all component directories from both locations
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

// Backwards compatibility
const COMPONENTS_DIR = LEGACY_COMPONENTS_DIR;

console.log('📖 Component README Manager');
console.log('============================');
console.log('');

/**
 * Get all component directories
 */
function getComponentDirs() {
  try {
    return fs
      .readdirSync(COMPONENTS_DIR)
      .filter((dir) => {
        const fullPath = path.join(COMPONENTS_DIR, dir);
        return fs.statSync(fullPath).isDirectory();
      })
      .sort();
  } catch (error) {
    console.error('❌ Error reading components directory:', error.message);
    return [];
  }
}

/**
 * Parse component TypeScript file to extract information
 */
function analyzeComponentFile(componentPath) {
  if (!fs.existsSync(componentPath)) {
    return null;
  }

  const content = fs.readFileSync(componentPath, 'utf8');
  const analysis = {
    className: null,
    elementName: null,
    properties: [],
    events: [],
    methods: [],
    description: null,
  };

  // Extract class name
  const classMatch = content.match(/export class (USA\w+)/);
  if (classMatch) {
    analysis.className = classMatch[1];
  }

  // Extract custom element name
  const elementMatch = content.match(/@customElement\(['"](usa-[^'"]+)['"]\)/);
  if (elementMatch) {
    analysis.elementName = elementMatch[1];
  }

  // Extract properties
  const propertyMatches = content.matchAll(
    /@property\([^)]*\)\s*(\w+)(?::([^=;]+))?(?:\s*=\s*([^;]+))?;/g
  );
  for (const match of propertyMatches) {
    const [, name, type, defaultValue] = match;
    analysis.properties.push({
      name,
      type: type?.trim().replace(/\s+/g, ' ') || 'any',
      defaultValue: defaultValue?.trim() || undefined,
    });
  }

  // Extract events from dispatchEvent calls
  const eventMatches = content.matchAll(
    /dispatchEvent\([^)]*new CustomEvent\(['"]([\w-]+)['"][^)]*\)/g
  );
  const events = new Set();
  for (const match of eventMatches) {
    events.add(match[1]);
  }
  analysis.events = Array.from(events);

  // Extract JSDoc description from class
  const classDescMatch = content.match(
    /\/\*\*\s*\n([^*]*\*(?:[^/][^*]*\*)*)\s*\*\/\s*@customElement/
  );
  if (classDescMatch) {
    const desc = classDescMatch[1]
      .split('\n')
      .map((line) => line.replace(/^\s*\*\s?/, ''))
      .filter((line) => line.trim())
      .join(' ')
      .trim();
    analysis.description = desc;
  }

  return analysis;
}

/**
 * Generate updated README content as MDX for Storybook compatibility
 */
function generateReadmeMDXContent(componentName, analysis) {
  const elementName = analysis.elementName || `usa-${componentName}`;
  const className =
    analysis.className || `USA${componentName.charAt(0).toUpperCase() + componentName.slice(1)}`;

  return `---
meta:
  title: ${className}
  component: ${elementName}
---

# ${className}

${analysis.description || `A USWDS ${componentName} component built with Lit Element.`}

## Usage

\`\`\`html
<${elementName}></${elementName}>
\`\`\`

\`\`\`javascript
import '${process.cwd().includes('uswds-webcomponents') ? '../' : ''}path/to/uswds-webcomponents/src/components/${componentName}/index.js';
\`\`\`

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
${
  analysis.properties
    .map(
      (prop) =>
        `| \`${prop.name}\` | \`${prop.type}\` | \`${prop.defaultValue || ''}\` | Property description |`
    )
    .join('\n') || '| No public properties | | | |'
}

## Events

| Event | Type | Description |
|-------|------|-------------|
${
  analysis.events.map((event) => `| \`${event}\` | CustomEvent | Event description |`).join('\n') ||
  '| No custom events | | |'
}

## Accessibility

This component implements USWDS accessibility standards:

- Proper ARIA attributes and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## USWDS Documentation

- [${componentName.charAt(0).toUpperCase() + componentName.slice(1)} - U.S. Web Design System](https://designsystem.digital.gov/components/${componentName}/)
- [${componentName.charAt(0).toUpperCase() + componentName.slice(1)} Guidance](https://designsystem.digital.gov/components/${componentName}/#guidance)
- [${componentName.charAt(0).toUpperCase() + componentName.slice(1)} Accessibility](https://designsystem.digital.gov/components/${componentName}/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

\`\`\`bash
npm test src/components/${componentName}/${elementName}.test.ts
\`\`\`

## Storybook

View component examples: [${className} Stories](${process.cwd().includes('uswds-webcomponents') ? '/?path=/story/components-' + componentName : 'http://localhost:6006/?path=/story/components-' + componentName})

---

_This README is automatically updated when component code changes._
_Last updated: ${new Date().toISOString().split('T')[0]}_
`;
}

/**
 * Update README for a specific component
 */
function updateComponentReadme(componentName) {
  const componentDir = path.join(COMPONENTS_DIR, componentName);
  const componentFile = path.join(componentDir, `usa-${componentName}.ts`);
  const readmePath = path.join(componentDir, 'README.md');

  console.log(`📖 Processing ${componentName}...`);

  // Analyze component
  const analysis = analyzeComponentFile(componentFile);
  if (!analysis) {
    console.log(`   ⚠️  Component file not found: ${componentFile}`);
    return false;
  }

  // Generate new README content
  const newContent = generateReadmeMDXContent(componentName, analysis);

  // Check if README exists and compare
  let shouldUpdate = true;
  if (fs.existsSync(readmePath)) {
    const currentContent = fs.readFileSync(readmePath, 'utf8');

    // Only update if content has meaningfully changed (ignore last updated date)
    const normalizeContent = (content) => content.replace(/_Last updated: \d{4}-\d{2}-\d{2}_/, '');
    if (normalizeContent(currentContent) === normalizeContent(newContent)) {
      console.log(`   ✓ No changes needed`);
      shouldUpdate = false;
    }
  }

  if (shouldUpdate) {
    fs.writeFileSync(readmePath, newContent);
    console.log(`   ✅ Updated README.md`);
    return true;
  }

  return false;
}

/**
 * Update README for a component at a specific path (for monorepo support)
 */
function updateComponentReadmeAtPath(componentName, componentDir) {
  const componentFile = path.join(componentDir, `usa-${componentName}.ts`);
  // Support both README.md and README.mdx
  const readmeMdPath = path.join(componentDir, 'README.md');
  const readmeMdxPath = path.join(componentDir, 'README.mdx');
  const readmePath = fs.existsSync(readmeMdxPath) ? readmeMdxPath : readmeMdPath;

  console.log(`📖 Processing ${componentName} at ${componentDir}...`);

  // Analyze component
  const analysis = analyzeComponentFile(componentFile);
  if (!analysis) {
    console.log(`   ⚠️  Component file not found: ${componentFile}`);
    return false;
  }

  // Generate new README content
  const newContent = generateReadmeMDXContent(componentName, analysis);

  // Check if README exists and compare
  let shouldUpdate = true;
  if (fs.existsSync(readmePath)) {
    const currentContent = fs.readFileSync(readmePath, 'utf8');

    // Only update if content has meaningfully changed (ignore last updated date)
    const normalizeContent = (content) => content.replace(/_Last updated: \d{4}-\d{2}-\d{2}_/, '');
    if (normalizeContent(currentContent) === normalizeContent(newContent)) {
      console.log(`   ✓ No changes needed`);
      shouldUpdate = false;
    }
  }

  if (shouldUpdate) {
    fs.writeFileSync(readmePath, newContent);
    console.log(`   ✅ Updated ${path.basename(readmePath)}`);
    return true;
  }

  return false;
}

/**
 * Process commit to update README files for changed components
 */
function processCommit(commitHash, commitMessage) {
  console.log(`🔍 Processing commit: ${commitHash}`);
  console.log(`   Message: ${commitMessage}`);

  try {
    // Get changed files
    const changedFiles = execSync(`git diff-tree --no-commit-id --name-only -r ${commitHash}`, {
      encoding: 'utf8',
    })
      .trim()
      .split('\n')
      .filter(Boolean);

    // Find changed components (exclude documentation files)
    // Support both legacy src/components/ and monorepo packages/*/src/components/
    const changedComponents = new Map(); // Map of componentName -> componentPath

    changedFiles.forEach((file) => {
      // Legacy path: src/components/component-name/
      if (file.startsWith('src/components/')) {
        const pathParts = file.split('/');
        if (
          pathParts.length >= 3 &&
          !file.includes('CHANGELOG') &&
          !file.includes('TESTING.md') &&
          !file.includes('README')
        ) {
          const componentName = pathParts[2];
          changedComponents.set(componentName, path.join(LEGACY_COMPONENTS_DIR, componentName));
        }
      }

      // Monorepo path: packages/uswds-wc-*/src/components/component-name/
      const monorepoMatch = file.match(/^packages\/(uswds-wc-[^/]+)\/src\/components\/([^/]+)\//);
      if (monorepoMatch) {
        const [, pkgName, componentName] = monorepoMatch;
        if (
          !file.includes('CHANGELOG') &&
          !file.includes('TESTING.md') &&
          !file.includes('README')
        ) {
          const componentPath = path.join(PACKAGES_DIR, pkgName, 'src/components', componentName);
          changedComponents.set(componentName, componentPath);
        }
      }
    });

    if (changedComponents.size === 0) {
      console.log('   No component code changes detected');
      return;
    }

    console.log(`   Changed components: ${Array.from(changedComponents.keys()).join(', ')}`);

    let updatedCount = 0;
    for (const [componentName, componentPath] of changedComponents) {
      if (updateComponentReadmeAtPath(componentName, componentPath)) {
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      console.log(`✅ Updated ${updatedCount} README files`);
    } else {
      console.log(`✅ All README files are up to date`);
    }
  } catch (error) {
    console.error('❌ Error processing commit:', error.message);
  }
}

/**
 * Update all component README files (supports monorepo structure)
 */
function updateAllReadmes() {
  console.log('📖 Updating all component README files...\n');

  const components = getAllComponentDirs();
  let updatedCount = 0;

  for (const { name, path: componentPath } of components) {
    if (updateComponentReadmeAtPath(name, componentPath)) {
      updatedCount++;
    }
  }

  console.log(`\n✨ Complete! Updated ${updatedCount} of ${components.length} README files.`);
}

// CLI interface
const [, , command, ...args] = process.argv;

switch (command) {
  case 'process-commit':
    if (args.length < 2) {
      console.error('❌ Usage: manage-readmes.js process-commit <commit-hash> <commit-message>');
      process.exit(1);
    }
    processCommit(args[0], args[1]);
    break;

  case 'update-all':
    updateAllReadmes();
    break;

  case 'update':
    if (args.length < 1) {
      console.error('❌ Usage: manage-readmes.js update <component-name>');
      process.exit(1);
    }
    updateComponentReadme(args[0]);
    break;

  default:
    console.log('📖 Component README Manager');
    console.log('Usage:');
    console.log('  manage-readmes.js process-commit <hash> <message>  - Update READMEs for commit');
    console.log(
      '  manage-readmes.js update-all                      - Update all README.md files'
    );
    console.log(
      '  manage-readmes.js update <component>              - Update specific README.md file'
    );
    break;
}
