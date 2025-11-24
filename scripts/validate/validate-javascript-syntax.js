#!/usr/bin/env node

/**
 * JavaScript Syntax Validator
 *
 * Catches common syntax errors that TypeScript might miss:
 * - Hyphenated property access without brackets
 * - Duplicate method definitions
 * - Malformed USWDS patterns
 */

import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

const errors = [];
let fileCount = 0;

// Patterns that cause JavaScript syntax errors
const DANGEROUS_PATTERNS = [
  // Hyphenated property access without brackets
  {
    pattern: /USWDS\.[a-zA-Z]+-[a-zA-Z]/g,
    message: 'Hyphenated property access must use bracket notation: USWDS["property-name"]',
    severity: 'error',
  },

  // Duplicate method definitions (common pattern)
  {
    pattern:
      /(override\s+disconnectedCallback\(\)\s*\{[\s\S]*?override\s+disconnectedCallback\(\))/g,
    message: 'Duplicate method definition detected',
    severity: 'error',
  },
  // Duplicate ANY method definitions
  {
    pattern: /((?:private|public|protected|async)\s+(\w+)\s*\([^)]*\)\s*\{[\s\S]*?)(?:private|public|protected|async)\s+\2\s*\(/g,
    message: 'Duplicate method definition detected',
    severity: 'error'
  },


  // Missing closing braces in try/catch blocks
  {
    pattern: /try\s*\{[^}]*try\s*\{/g,
    message: 'Nested try blocks without proper closure detected',
    severity: 'warning',
  },

  // Malformed USWDS cleanup patterns
  {
    pattern: /USWDS\.[a-zA-Z]+-[a-zA-Z]+\.off\(/g,
    message: 'USWDS cleanup method uses invalid property access',
    severity: 'error',
  },
];

function validateFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);

    DANGEROUS_PATTERNS.forEach(({ pattern, message, severity }) => {
      const matches = [...content.matchAll(pattern)];

      matches.forEach((match) => {
        const lines = content.substring(0, match.index).split('\n');
        const lineNumber = lines.length;
        const columnNumber = match.index - lines.slice(0, -1).join('\n').length - 1;

        errors.push({
          file: relativePath,
          line: lineNumber,
          column: columnNumber,
          message,
          severity,
          code: match[0],
          pattern: pattern.toString(),
        });
      });
    });

    fileCount++;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
  }
}

function main() {
  console.log('🔍 Validating JavaScript syntax patterns...');

  // Find all TypeScript files in components
  const files = globSync('src/components/**/*.ts', {
    ignore: ['**/*.test.ts', '**/*.stories.ts', '**/*.d.ts'],
  });

  files.forEach(validateFile);

  console.log(`📊 Validated ${fileCount} files`);

  if (errors.length === 0) {
    console.log('✅ No JavaScript syntax issues found');
    process.exit(0);
  }

  // Group errors by severity
  const criticalErrors = errors.filter((e) => e.severity === 'error');
  const warnings = errors.filter((e) => e.severity === 'warning');

  if (criticalErrors.length > 0) {
    console.log('\n❌ Critical JavaScript syntax errors found:');
    criticalErrors.forEach((error) => {
      console.log(`  ${error.file}:${error.line}:${error.column}`);
      console.log(`    Error: ${error.message}`);
      console.log(`    Code: ${error.code}`);
      console.log();
    });
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  JavaScript syntax warnings:');
    warnings.forEach((warning) => {
      console.log(`  ${warning.file}:${warning.line}:${warning.column}`);
      console.log(`    Warning: ${warning.message}`);
      console.log(`    Code: ${warning.code}`);
      console.log();
    });
  }

  console.log(`\n📊 Summary: ${criticalErrors.length} errors, ${warnings.length} warnings`);

  if (criticalErrors.length > 0) {
    console.log('\n💡 Common fixes:');
    console.log('  • Change USWDS.component-name to USWDS["component-name"]');
    console.log('  • Remove duplicate method definitions');
    console.log('  • Fix malformed try/catch blocks');
    process.exit(1);
  }

  process.exit(0);
}

main();
