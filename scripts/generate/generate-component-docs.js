#!/usr/bin/env node
/**
 * Component Documentation Generator
 *
 * Generates README.mdx files for each component by reading from:
 * 1. Custom Elements Manifest (custom-elements.json)
 * 2. Component JSDoc comments
 * 3. Storybook stories for examples
 *
 * @usage
 *   node scripts/generate/generate-component-docs.js
 *   node scripts/generate/generate-component-docs.js --component=button
 *   node scripts/generate/generate-component-docs.js --dry-run
 *   node scripts/generate/generate-component-docs.js --force  # Overwrite existing
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, relative, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const rootDir = join(__filename, '..', '..', '..');

// USWDS documentation base URL
const USWDS_DOC_BASE = 'https://designsystem.digital.gov/components';

// Component to USWDS doc path mapping (when not matching tag name)
const USWDS_DOC_PATHS = {
  'usa-button': 'button',
  'usa-text-input': 'text-input',
  'usa-select': 'select',
  'usa-alert': 'alert',
  'usa-card': 'card',
  'usa-modal': 'modal',
  'usa-accordion': 'accordion',
  'usa-header': 'header',
  'usa-footer': 'footer',
  'usa-banner': 'banner',
  'usa-breadcrumb': 'breadcrumb',
  'usa-pagination': 'pagination',
  'usa-table': 'table',
  'usa-tag': 'tag',
  'usa-tooltip': 'tooltip',
  'usa-checkbox': 'checkbox',
  'usa-radio': 'radio',
  'usa-textarea': 'textarea',
  'usa-date-picker': 'date-picker',
  'usa-time-picker': 'time-picker',
  'usa-combo-box': 'combo-box',
  'usa-file-input': 'file-input',
  'usa-range': 'range-slider',
  'usa-character-count': 'character-count',
  'usa-input-mask': 'input-mask',
  'usa-memorable-date': 'memorable-date',
  'usa-search': 'search',
  'usa-icon': 'icon',
  'usa-icon-list': 'icon-list',
  'usa-process-list': 'process-list',
  'usa-step-indicator': 'step-indicator',
  'usa-identifier': 'identifier',
  'usa-language-selector': 'language-selector',
  'usa-side-navigation': 'sidenav',
  'usa-in-page-navigation': 'in-page-navigation',
};

/**
 * Load and parse Custom Elements Manifest
 */
function loadCEM() {
  const cemPath = join(rootDir, 'custom-elements.json');
  if (!existsSync(cemPath)) {
    console.error('❌ custom-elements.json not found. Run: pnpm run analyze');
    process.exit(1);
  }

  const content = readFileSync(cemPath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Find all component definitions from CEM
 */
function getComponentsFromCEM(cem) {
  const components = [];

  for (const module of cem.modules || []) {
    for (const declaration of module.declarations || []) {
      if (declaration.customElement && declaration.tagName) {
        components.push({
          tagName: declaration.tagName,
          name: declaration.name,
          description: declaration.description || '',
          summary: declaration.summary || '',
          attributes: declaration.attributes || [],
          properties: declaration.members?.filter((m) => m.kind === 'field' && !m.static) || [],
          methods: declaration.members?.filter((m) => m.kind === 'method' && !m.static) || [],
          events: declaration.events || [],
          slots: declaration.slots || [],
          cssProperties: declaration.cssProperties || [],
          cssParts: declaration.cssParts || [],
          superclass: declaration.superclass,
          mixins: declaration.mixins || [],
          path: module.path,
        });
      }
    }
  }

  return components;
}

/**
 * Find existing README.mdx for a component
 */
function findExistingReadme(componentPath) {
  const dir = dirname(componentPath);
  const fullPath = join(rootDir, dir);

  if (!existsSync(fullPath)) return null;

  const files = readdirSync(fullPath);
  const readme = files.find((f) => f.toLowerCase() === 'readme.mdx' || f.toLowerCase() === 'readme.md');

  return readme ? join(fullPath, readme) : null;
}

/**
 * Get USWDS documentation URL for a component
 */
function getUSWDSDocUrl(tagName) {
  const docPath = USWDS_DOC_PATHS[tagName] || tagName.replace('usa-', '');
  return `${USWDS_DOC_BASE}/${docPath}/`;
}

/**
 * Format type for display
 */
function formatType(type) {
  if (!type) return 'unknown';
  if (typeof type === 'string') return type;
  return type.text || 'unknown';
}

/**
 * Convert kebab-case to camelCase
 */
function kebabToCamel(str) {
  return str.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

/**
 * Generate properties table
 */
function generatePropertiesTable(properties, attributes) {
  if (properties.length === 0 && attributes.length === 0) {
    return 'No properties defined.';
  }

  // Combine properties and attributes, removing duplicates
  // Track both the property name and its kebab-case equivalent
  const allProps = new Map();
  const seenAttributes = new Set();

  for (const prop of properties) {
    const attrName = prop.attribute || prop.name;
    allProps.set(prop.name, {
      name: prop.name,
      attribute: attrName,
      type: formatType(prop.type),
      default: prop.default || '-',
      description: prop.description || '-',
    });
    // Track the attribute name to avoid duplicates
    seenAttributes.add(attrName);
  }

  for (const attr of attributes) {
    // Skip if this attribute is already covered by a property
    const camelName = kebabToCamel(attr.name);
    if (!allProps.has(attr.name) && !allProps.has(camelName) && !seenAttributes.has(attr.name)) {
      allProps.set(attr.name, {
        name: attr.name,
        attribute: attr.name,
        type: formatType(attr.type),
        default: attr.default || '-',
        description: attr.description || '-',
      });
    }
  }

  const rows = Array.from(allProps.values());
  if (rows.length === 0) return 'No properties defined.';

  let table = '| Property | Attribute | Type | Default | Description |\n';
  table += '|----------|-----------|------|---------|-------------|\n';

  for (const prop of rows) {
    const type = prop.type.replace(/\|/g, '\\|');
    const desc = prop.description.replace(/\|/g, '\\|').replace(/\n/g, ' ');
    table += `| \`${prop.name}\` | \`${prop.attribute}\` | \`${type}\` | \`${prop.default}\` | ${desc} |\n`;
  }

  return table;
}

/**
 * Generate events table
 */
function generateEventsTable(events) {
  if (events.length === 0) {
    return 'No custom events defined.';
  }

  let table = '| Event | Detail Type | Description |\n';
  table += '|-------|-------------|-------------|\n';

  for (const event of events) {
    const detailType = event.type?.text || 'CustomEvent';
    const desc = (event.description || '-').replace(/\|/g, '\\|').replace(/\n/g, ' ');
    table += `| \`${event.name}\` | \`${detailType}\` | ${desc} |\n`;
  }

  return table;
}

/**
 * Generate slots table
 */
function generateSlotsTable(slots) {
  if (slots.length === 0) {
    return 'No named slots defined. Uses default slot for content.';
  }

  let table = '| Slot | Description |\n';
  table += '|------|-------------|\n';

  for (const slot of slots) {
    const name = slot.name || '(default)';
    const desc = (slot.description || '-').replace(/\|/g, '\\|').replace(/\n/g, ' ');
    table += `| \`${name}\` | ${desc} |\n`;
  }

  return table;
}

/**
 * Generate CSS properties table
 */
function generateCSSPropsTable(cssProps) {
  if (cssProps.length === 0) {
    return 'Uses USWDS CSS classes. No custom CSS properties defined.';
  }

  let table = '| Property | Default | Description |\n';
  table += '|----------|---------|-------------|\n';

  for (const prop of cssProps) {
    const def = prop.default || '-';
    const desc = (prop.description || '-').replace(/\|/g, '\\|').replace(/\n/g, ' ');
    table += `| \`${prop.name}\` | \`${def}\` | ${desc} |\n`;
  }

  return table;
}

/**
 * Generate README.mdx content
 */
function generateReadmeContent(component) {
  const uswdsUrl = getUSWDSDocUrl(component.tagName);
  const componentName = component.tagName.replace('usa-', '').replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  return `# ${componentName}

${component.description || `USWDS ${componentName} component implemented as a web component.`}

## USWDS Reference

[USWDS ${componentName}](${uswdsUrl})

## Installation

\`\`\`bash
npm install @uswds-wc/core
\`\`\`

## Usage

\`\`\`html
<${component.tagName}></${component.tagName}>
\`\`\`

### TypeScript

\`\`\`typescript
import '@uswds-wc/core/styles.css';
import '${component.path?.replace('.ts', '.js') || `@uswds-wc/${component.tagName}`}';

// The component is now available as <${component.tagName}>
\`\`\`

## Properties

${generatePropertiesTable(component.properties, component.attributes)}

## Slots

${generateSlotsTable(component.slots)}

## Events

${generateEventsTable(component.events)}

## CSS Custom Properties

${generateCSSPropsTable(component.cssProperties)}

## Accessibility

This component follows USWDS accessibility guidelines:

- Uses semantic HTML elements
- Supports keyboard navigation
- Includes appropriate ARIA attributes
- Meets WCAG 2.1 Level AA requirements

## Examples

See the [Storybook documentation](/?path=/docs/components-${component.tagName.replace('usa-', '')}--docs) for interactive examples.
`;
}

/**
 * Main documentation generation function
 */
function generateComponentDocs() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');

  // Check for specific component
  const componentArg = args.find((a) => a.startsWith('--component='));
  const targetComponent = componentArg ? componentArg.split('=')[1] : null;

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║         COMPONENT DOCUMENTATION GENERATOR                      ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Load CEM
  const cem = loadCEM();
  const components = getComponentsFromCEM(cem);

  console.log(`📊 Found ${components.length} components in Custom Elements Manifest\n`);

  const results = {
    generated: [],
    skipped: [],
    errors: [],
  };

  // Filter to target component if specified
  const toProcess = targetComponent
    ? components.filter((c) => c.tagName.includes(targetComponent) || c.name.toLowerCase().includes(targetComponent.toLowerCase()))
    : components;

  if (toProcess.length === 0) {
    console.log(`❌ No components found matching "${targetComponent}"`);
    process.exit(1);
  }

  console.log(`📝 Processing ${toProcess.length} component(s)...\n`);

  for (const component of toProcess) {
    try {
      const existingReadme = findExistingReadme(component.path);

      if (existingReadme && !force) {
        results.skipped.push({
          tagName: component.tagName,
          reason: 'README already exists (use --force to overwrite)',
        });
        continue;
      }

      const content = generateReadmeContent(component);
      const outputPath = join(rootDir, dirname(component.path), 'README.mdx');

      if (dryRun) {
        console.log(`📄 Would generate: ${relative(rootDir, outputPath)}`);
        console.log(`   Properties: ${component.properties.length}`);
        console.log(`   Events: ${component.events.length}`);
        console.log(`   Slots: ${component.slots.length}`);
        results.generated.push({ tagName: component.tagName, path: outputPath });
      } else {
        writeFileSync(outputPath, content, 'utf-8');
        console.log(`✅ Generated: ${relative(rootDir, outputPath)}`);
        results.generated.push({ tagName: component.tagName, path: outputPath });
      }
    } catch (error) {
      results.errors.push({
        tagName: component.tagName,
        error: error.message,
      });
      console.error(`❌ Error processing ${component.tagName}: ${error.message}`);
    }
  }

  // Summary
  console.log('\n┌────────────────────────────────────────────────────────────────┐');
  console.log('│ SUMMARY                                                        │');
  console.log('└────────────────────────────────────────────────────────────────┘\n');

  console.log(`  ✅ Generated: ${results.generated.length}`);
  console.log(`  ⏭️  Skipped: ${results.skipped.length}`);
  console.log(`  ❌ Errors: ${results.errors.length}`);

  if (results.skipped.length > 0) {
    console.log('\n  Skipped files:');
    for (const skip of results.skipped) {
      console.log(`    - ${skip.tagName}: ${skip.reason}`);
    }
  }

  if (results.errors.length > 0) {
    console.log('\n  Errors:');
    for (const err of results.errors) {
      console.log(`    - ${err.tagName}: ${err.error}`);
    }
  }

  if (dryRun) {
    console.log('\n📝 Dry run complete. No files were written.');
    console.log('   Run without --dry-run to generate files.');
  }

  return results;
}

// Run if called directly
generateComponentDocs();

export { generateComponentDocs };
