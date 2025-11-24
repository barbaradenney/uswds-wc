#!/usr/bin/env node

/**
 * Validates component composition patterns:
 * - Ensures components use web component tags (e.g., <usa-icon>) instead of hardcoded HTML
 * - Detects hardcoded <img> tags with broken paths
 * - Validates proper icon usage
 * - Prevents architectural violations
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '../..');

// Patterns to check for
const PATTERNS = {
  // Hardcoded img tags (potential broken paths)
  hardcodedImg: /<img[^>]+src=["']\/[^"']+["'][^>]*>/g,
  // usa-icon usage (correct pattern)
  usaIcon: /<usa-icon[^>]+name=["'][^"']+["'][^>]*>/g,
  // Import of usa-icon component
  iconImport: /import.*['"]@uswds-wc\/data-display['"]/,
};

// Icons that should use usa-icon component
const ICON_PATTERNS = [
  'search',
  'close',
  'menu',
  'chevron',
  'arrow',
  'check',
  'info',
  'warning',
  'error',
];

class CompositionValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.filesChecked = 0;
  }

  /**
   * Find all TypeScript component files
   */
  findComponentFiles(dir = join(ROOT_DIR, 'packages')) {
    let files = [];

    try {
      const items = readdirSync(dir);

      for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          // Skip node_modules and dist
          if (!item.includes('node_modules') && !item.includes('dist')) {
            files = files.concat(this.findComponentFiles(fullPath));
          }
        } else if (item.endsWith('.ts') && !item.endsWith('.test.ts') && !item.endsWith('.cy.ts') && !item.includes('.spec.ts')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}: ${error.message}`);
    }

    return files;
  }

  /**
   * Check if a path looks like an icon path
   */
  isIconPath(src) {
    return ICON_PATTERNS.some(icon => src.includes(icon)) ||
           src.includes('usa-icons') ||
           src.includes('/icons/');
  }

  /**
   * Extract src attribute from img tag
   */
  extractSrc(imgTag) {
    const match = imgTag.match(/src=["']([^"']+)["']/);
    return match ? match[1] : null;
  }

  /**
   * Validate a single file
   */
  validateFile(filePath) {
    this.filesChecked++;
    const fileName = filePath.split('packages/')[1] || filePath;

    let content;
    try {
      content = readFileSync(filePath, 'utf-8');
    } catch (error) {
      this.errors.push({
        file: fileName,
        issue: `Failed to read file: ${error.message}`,
      });
      return;
    }

    // Skip if file doesn't contain render method (not a component)
    if (!content.includes('render()') && !content.includes('render(')) {
      return;
    }

    // Check for hardcoded img tags with icon paths
    const hardcodedImgs = content.match(PATTERNS.hardcodedImg);
    if (hardcodedImgs) {
      const iconImgs = hardcodedImgs.filter(img => {
        const src = this.extractSrc(img);
        return src && this.isIconPath(src);
      });

      if (iconImgs.length > 0) {
        this.errors.push({
          file: fileName,
          issue: 'Found hardcoded <img> tags with icon paths (should use <usa-icon> component)',
          matches: iconImgs,
          line: this.getLineNumber(content, iconImgs[0]),
        });

        // Check if file imports usa-icon
        if (!content.match(PATTERNS.iconImport)) {
          this.errors.push({
            file: fileName,
            issue: 'Missing usa-icon component import',
            suggestion: "Add: import '@uswds-wc/data-display';",
          });
        }
      }
    }

    // Warning: Check for hardcoded img tags with other paths (non-icons)
    if (hardcodedImgs) {
      const nonIconImgs = hardcodedImgs.filter(img => {
        const src = this.extractSrc(img);
        return src && !this.isIconPath(src);
      });

      if (nonIconImgs.length > 0) {
        this.warnings.push({
          file: fileName,
          issue: 'Found hardcoded <img> tags with potentially broken paths',
          matches: nonIconImgs,
          line: this.getLineNumber(content, nonIconImgs[0]),
          suggestion: 'Consider if this should be a web component or use proper asset paths',
        });
      }
    }
  }

  /**
   * Get line number of a match in content
   */
  getLineNumber(content, match) {
    const index = content.indexOf(match);
    if (index === -1) return 0;
    const lines = content.substring(0, index).split('\n');
    return lines.length;
  }

  /**
   * Run validation on all component files
   */
  validate() {
    console.log('🔍 Validating component composition patterns...\n');

    const componentFiles = this.findComponentFiles();

    if (componentFiles.length === 0) {
      console.log('⚠️  No component files found');
      return true;
    }

    componentFiles.forEach(file => this.validateFile(file));

    this.printResults();

    return this.errors.length === 0;
  }

  /**
   * Print validation results
   */
  printResults() {
    console.log(`\n📊 Checked ${this.filesChecked} component file(s)\n`);

    if (this.errors.length > 0) {
      console.log('❌ ERRORS:\n');
      this.errors.forEach(({ file, issue, matches, line, suggestion }) => {
        if (line) {
          console.log(`  ${file}:${line}`);
        } else {
          console.log(`  ${file}`);
        }
        console.log(`    Issue: ${issue}`);
        if (matches) {
          console.log(`    Found: ${matches.slice(0, 3).join(', ')}${matches.length > 3 ? '...' : ''}`);
        }
        if (suggestion) {
          console.log(`    Suggestion: ${suggestion}`);
        }
        console.log('');
      });
    }

    if (this.warnings.length > 0) {
      console.log('⚠️  WARNINGS:\n');
      this.warnings.forEach(({ file, issue, matches, line, suggestion }) => {
        if (line) {
          console.log(`  ${file}:${line}`);
        } else {
          console.log(`  ${file}`);
        }
        console.log(`    Issue: ${issue}`);
        if (matches) {
          console.log(`    Found: ${matches.slice(0, 3).join(', ')}${matches.length > 3 ? '...' : ''}`);
        }
        if (suggestion) {
          console.log(`    Suggestion: ${suggestion}`);
        }
        console.log('');
      });
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ All component composition patterns are valid!\n');
    } else {
      console.log(`\n📋 Summary: ${this.errors.length} error(s), ${this.warnings.length} warning(s)\n`);

      if (this.errors.length > 0) {
        console.log('💡 Fix suggestions:');
        console.log('   - Replace <img> icon tags with <usa-icon> component');
        console.log("   - Add import: import '@uswds-wc/data-display';");
        console.log('   - Use proper component composition patterns\n');
      }
    }
  }
}

// Run validation
const validator = new CompositionValidator();
const isValid = validator.validate();

process.exit(isValid ? 0 : 1);
