#!/usr/bin/env node

/**
 * Documentation Validation Script
 * Validates consistency between components and their documentation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src', 'components');

console.log('🔍 Validating documentation consistency...\n');

let errors = [];
let warnings = [];

async function validateComponents() {
  // Find all component directories
  const componentDirs = fs.readdirSync(srcDir)
    .filter(name => fs.statSync(path.join(srcDir, name)).isDirectory())
    .filter(name => !name.startsWith('.'));

  for (const componentName of componentDirs) {
    const componentDir = path.join(srcDir, componentName);
    await validateComponent(componentName, componentDir);
  }
}

async function validateComponent(name, dir) {
  console.log(`📋 Checking ${name}...`);
  
  const files = {
    component: path.join(dir, `usa-${name}.ts`),
    test: path.join(dir, `usa-${name}.test.ts`),
    stories: path.join(dir, `usa-${name}.stories.ts`),
    readme: path.join(dir, 'README.md'),
    index: path.join(dir, 'index.ts')
  };

  // Check required files exist
  const requiredFiles = ['component', 'test', 'stories', 'readme', 'index'];
  requiredFiles.forEach(fileType => {
    if (!fs.existsSync(files[fileType])) {
      errors.push(`❌ Missing ${fileType} file: ${files[fileType]}`);
    }
  });

  // Validate component file
  if (fs.existsSync(files.component)) {
    await validateComponentFile(files.component, name);
  }

  // Validate README
  if (fs.existsSync(files.readme)) {
    await validateReadmeFile(files.readme, name);
  }

  // Validate test file
  if (fs.existsSync(files.test)) {
    await validateTestFile(files.test, name);
  }

  console.log(`   ✅ ${name} validation complete\n`);
}

async function validateComponentFile(filePath, name) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for required imports
  const requiredImports = [
    'import { html',
    'import { customElement',
    'USWDSBaseComponent'
  ];

  requiredImports.forEach(importText => {
    if (!content.includes(importText)) {
      warnings.push(`⚠️  ${name}: Missing recommended import "${importText}"`);
    }
  });

  // Check for USWDS CSS import
  if (!content.includes('../../styles/styles.css')) {
    errors.push(`❌ ${name}: Missing USWDS styles import`);
  }

  // Check for light DOM usage
  if (!content.includes('createRenderRoot()') && !content.includes('USWDSBaseComponent')) {
    warnings.push(`⚠️  ${name}: Consider using USWDSBaseComponent for light DOM`);
  }
}

async function validateReadmeFile(filePath, name) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for required sections
  const requiredSections = [
    '# USA',
    '## Overview',
    '## Usage',
    '## Properties',
    '## USWDS Documentation'
  ];

  requiredSections.forEach(section => {
    if (!content.includes(section)) {
      warnings.push(`⚠️  ${name} README: Missing section "${section}"`);
    }
  });

  // Check for USWDS links
  if (!content.includes('designsystem.digital.gov')) {
    warnings.push(`⚠️  ${name} README: Missing USWDS documentation links`);
  }

  // Check for code examples
  if (!content.includes('```html') && !content.includes('```typescript')) {
    warnings.push(`⚠️  ${name} README: Missing code examples`);
  }
}

async function validateTestFile(filePath, name) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for basic test structure
  const requiredTests = [
    'describe(',
    'beforeEach(',
    'afterEach(',
    'it('
  ];

  requiredTests.forEach(testPattern => {
    if (!content.includes(testPattern)) {
      errors.push(`❌ ${name} tests: Missing test pattern "${testPattern}"`);
    }
  });

  // Check for accessibility tests
  if (!content.includes('aria-') && !content.includes('accessibility')) {
    warnings.push(`⚠️  ${name} tests: Consider adding accessibility tests`);
  }
}

// Check for orphaned documentation
async function validateOrphanedDocs() {
  console.log('🔍 Checking for orphaned documentation...\n');
  
  // Find all README files in components
  const readmeFiles = await glob('packages/*/src/components/*/README.md', { cwd: rootDir });
  const componentNames = readmeFiles.map(file => {
    const parts = file.split('/');
    return parts[parts.length - 2]; // component directory name
  });

  // Check if component implementations exist
  for (const name of componentNames) {
    const componentFile = path.join(srcDir, name, `usa-${name}.ts`);
    if (!fs.existsSync(componentFile)) {
      warnings.push(`⚠️  Orphaned documentation: ${name} README exists but no component file`);
    }
  }
}

// Check package.json scripts
function validatePackageScripts() {
  console.log('🔍 Checking package.json scripts...\n');
  
  const packagePath = path.join(rootDir, 'package.json');
  if (!fs.existsSync(packagePath)) {
    errors.push('❌ package.json not found');
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const scripts = packageJson.scripts || {};

  const recommendedScripts = [
    'test',
    'typecheck',
    'lint',
    'storybook',
    'build'
  ];

  recommendedScripts.forEach(script => {
    if (!scripts[script]) {
      warnings.push(`⚠️  Missing recommended script: "${script}"`);
    }
  });

  console.log('   ✅ Package scripts validation complete\n');
}

// Main execution
async function main() {
  try {
    await validateComponents();
    await validateOrphanedDocs();
    validatePackageScripts();

    console.log('\n📊 Validation Results:');
    console.log(`   ✅ Components checked: ${fs.readdirSync(srcDir).filter(name => fs.statSync(path.join(srcDir, name)).isDirectory()).length}`);
    console.log(`   ❌ Errors: ${errors.length}`);
    console.log(`   ⚠️  Warnings: ${warnings.length}\n`);

    if (errors.length > 0) {
      console.log('🚨 ERRORS:\n');
      errors.forEach(error => console.log(`   ${error}`));
      console.log('');
    }

    if (warnings.length > 0) {
      console.log('⚠️  WARNINGS:\n');
      warnings.forEach(warning => console.log(`   ${warning}`));
      console.log('');
    }

    if (errors.length === 0 && warnings.length === 0) {
      console.log('🎉 All documentation is valid and consistent!\n');
      process.exit(0);
    } else {
      console.log('📋 Review the above issues to improve documentation quality.\n');
      process.exit(errors.length > 0 ? 1 : 0);
    }

  } catch (error) {
    console.error('💥 Validation failed:', error);
    process.exit(1);
  }
}

main();