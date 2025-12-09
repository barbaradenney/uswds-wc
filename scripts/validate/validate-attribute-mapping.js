#!/usr/bin/env node

/**
 * Attribute Mapping Validation Script
 *
 * Prevents issues like the pagination bug where Storybook stories use hyphenated
 * attributes but components don't have explicit attribute mappings.
 *
 * This script:
 * 1. Scans component .ts files for @property decorators with camelCase names
 * 2. Scans story .ts files for hyphenated attribute usage
 * 3. Validates that hyphenated attributes have explicit attribute mapping
 * 4. Reports components that need attribute declarations
 *
 * Usage:
 *   node scripts/validate-attribute-mapping.js
 *   npm run validate:attribute-mapping
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { globSync } from 'glob';

const PACKAGES_DIR = 'packages';

/**
 * Extract property decorators from component source
 * Returns array of { propertyName, hasAttributeMapping, decoratorText }
 */
function extractProperties(componentSource) {
  const properties = [];

  // Match @property decorators with their property names
  // Pattern: @property({ ... }) propertyName = value;
  const propertyRegex = /@property\(\{([^}]+)\}\)\s*(?:override\s+)?(\w+)\s*[=:]/g;

  let match;
  while ((match = propertyRegex.exec(componentSource)) !== null) {
    const decoratorContent = match[1];
    const propertyName = match[2];
    const hasAttributeMapping = /attribute:\s*['"`]/.test(decoratorContent);

    properties.push({
      propertyName,
      hasAttributeMapping,
      decoratorText: match[0],
      decoratorContent: decoratorContent.trim()
    });
  }

  return properties;
}

/**
 * Extract attribute usage from story file
 * Returns array of attribute names used in html`` templates
 */
function extractStoryAttributes(storySource) {
  const attributes = new Set();

  // Match attributes in html`` templates
  // Pattern: <usa-component attribute-name="${...}"
  const attributeRegex = /<usa-\w+[^>]*\s+(\w+(?:-\w+)+)=/g;

  let match;
  while ((match = attributeRegex.exec(storySource)) !== null) {
    const attributeName = match[1];
    // Only include hyphenated attributes (those that need mapping)
    // Exclude data- attributes (these are handled by USWDS, not the component)
    if (attributeName.includes('-') && !attributeName.startsWith('data-')) {
      attributes.add(attributeName);
    }
  }

  return Array.from(attributes);
}

/**
 * Convert kebab-case to camelCase
 */
function kebabToCamel(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

/**
 * Convert camelCase to kebab-case
 */
function camelToKebab(str) {
  return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

/**
 * Check if a camelCase property needs explicit attribute mapping
 */
function needsAttributeMapping(propertyName) {
  // If property name contains uppercase letters, it's camelCase
  // and will need explicit mapping for hyphenated attributes
  return /[A-Z]/.test(propertyName);
}

/**
 * Validate a single component
 */
async function validateComponent(componentName, componentPath) {
  const issues = [];

  // Read component file
  const componentFile = join(componentPath, `usa-${componentName}.ts`);
  const storyFile = join(componentPath, `usa-${componentName}.stories.ts`);

  let componentSource, storySource;

  try {
    componentSource = await readFile(componentFile, 'utf-8');
  } catch (error) {
    return { componentName, issues: [`Component file not found: ${componentFile}`] };
  }

  try {
    storySource = await readFile(storyFile, 'utf-8');
  } catch (error) {
    // No story file is OK - component might not have stories yet
    return { componentName, issues: [], skipped: 'No story file' };
  }

  // Extract properties and attributes
  const properties = extractProperties(componentSource);
  const storyAttributes = extractStoryAttributes(storySource);

  // Check each story attribute
  for (const attribute of storyAttributes) {
    const expectedPropertyName = kebabToCamel(attribute);

    // Find matching property
    const matchingProperty = properties.find(p => p.propertyName === expectedPropertyName);

    if (!matchingProperty) {
      issues.push({
        type: 'MISSING_PROPERTY',
        attribute,
        expectedProperty: expectedPropertyName,
        message: `Story uses attribute "${attribute}" but no matching property "${expectedPropertyName}" found in component`
      });
      continue;
    }

    // Check if property needs explicit attribute mapping
    if (needsAttributeMapping(matchingProperty.propertyName)) {
      if (!matchingProperty.hasAttributeMapping) {
        issues.push({
          type: 'MISSING_ATTRIBUTE_MAPPING',
          attribute,
          propertyName: matchingProperty.propertyName,
          expectedKebab: camelToKebab(matchingProperty.propertyName),
          currentDecorator: matchingProperty.decoratorText,
          suggestedFix: `@property({ ${matchingProperty.decoratorContent}, attribute: '${attribute}' })`,
          message: `Property "${matchingProperty.propertyName}" is used with hyphenated attribute "${attribute}" but lacks explicit attribute mapping`
        });
      } else {
        // Has mapping - verify it's correct
        const attributeMatch = matchingProperty.decoratorContent.match(/attribute:\s*['"`]([^'"`]+)['"`]/);
        if (attributeMatch) {
          const declaredAttribute = attributeMatch[1];
          if (declaredAttribute !== attribute) {
            issues.push({
              type: 'ATTRIBUTE_MISMATCH',
              attribute,
              propertyName: matchingProperty.propertyName,
              declaredAttribute,
              message: `Property "${matchingProperty.propertyName}" declares attribute "${declaredAttribute}" but story uses "${attribute}"`
            });
          }
        }
      }
    }
  }

  return { componentName, issues, properties: properties.length, attributes: storyAttributes.length };
}

/**
 * Main validation function
 */
async function validateAllComponents() {
  console.log('🔍 Validating attribute mappings across all components...\n');

  // Scan all monorepo packages for components
  const componentPaths = globSync('packages/uswds-wc-*/src/components/*/');
  const results = [];
  let totalIssues = 0;

  for (const componentPathRelative of componentPaths) {
    // Extract component name from path (e.g., packages/uswds-wc-forms/src/components/checkbox/ → checkbox)
    const parts = componentPathRelative.split('/').filter(p => p);
    const componentName = parts[parts.length - 1];
    const componentPath = join(process.cwd(), componentPathRelative);
    const result = await validateComponent(componentName, componentPath);

    if (result.skipped) {
      continue; // Skip components without stories
    }

    if (result.issues.length > 0) {
      totalIssues += result.issues.length;
      results.push(result);
    }
  }

  // Report results
  if (totalIssues === 0) {
    console.log('✅ All attribute mappings are valid!\n');
    console.log(`Validated ${componentPaths.length} components`);
    return true;
  }

  console.log(`❌ Found ${totalIssues} attribute mapping issues:\n`);

  for (const result of results) {
    console.log(`\n📦 ${result.componentName}:`);
    console.log(`   Properties: ${result.properties}, Story Attributes: ${result.attributes}`);

    for (const issue of result.issues) {
      console.log(`\n   ❌ ${issue.type}:`);
      console.log(`      ${issue.message}`);

      if (issue.suggestedFix) {
        console.log(`\n      Current:  ${issue.currentDecorator}`);
        console.log(`      Suggested: ${issue.suggestedFix}`);
      }

      if (issue.expectedProperty) {
        console.log(`      Expected property: ${issue.expectedProperty}`);
      }
    }
  }

  console.log('\n\n💡 Fix by adding explicit attribute mapping to @property decorators:');
  console.log('   @property({ type: Number, attribute: "kebab-case-name" })');
  console.log('   propertyName = defaultValue;\n');

  return false;
}

// Run validation
validateAllComponents()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Validation failed with error:', error);
    process.exit(1);
  });