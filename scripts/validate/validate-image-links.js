#!/usr/bin/env node

/**
 * Image Link Validator
 *
 * Validates all image links in story files to ensure they're not broken.
 *
 * Features:
 * - Validates local image paths exist in public/ directory
 * - Validates external URLs return HTTP 200
 * - Reports broken links with file locations
 * - Supports both Storybook story files and component files
 * - Can be integrated into pre-commit hooks and CI/CD
 *
 * Usage:
 *   node scripts/validate/validate-image-links.js
 *   node scripts/validate/validate-image-links.js --fix  # Suggest local alternatives
 *   node scripts/validate/validate-image-links.js --strict  # Exit 1 on any issues
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { globSync } from 'glob';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '../..');

// Configuration
const IMAGE_PATTERNS = [
  /['"](\/img\/[^'"]+\.(png|jpg|jpeg|svg|gif|webp))['"]/gi,
  /['"](https?:\/\/[^'"]+\.(png|jpg|jpeg|svg|gif|webp))['"]/gi,
  /src\s*=\s*['"](\/[^'"]+\.(png|jpg|jpeg|svg|gif|webp))['"]/gi,
  /\.(\w+ImageSrc|logoSrc|iconSrc)\s*=\s*['"](https?:\/\/[^'"]+)['"]/gi,
];

// Known good external domains (won't validate these to avoid rate limiting)
const TRUSTED_DOMAINS = [
  'designsystem.digital.gov',
  'unpkg.com',
  'cdn.jsdelivr.net',
];

// Files to check (exclude test files - they may use example.com intentionally)
const FILE_PATTERNS = [
  'src/components/**/*.stories.ts',
  '.storybook/**/*.ts',
  '.storybook/**/*.html',
];

const args = process.argv.slice(2);
const FIX_MODE = args.includes('--fix');
const STRICT_MODE = args.includes('--strict');

class ImageLinkValidator {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.checkedUrls = new Map(); // Cache for external URL checks
  }

  /**
   * Extract all image URLs from a file
   */
  extractImageUrls(content, filePath) {
    const urls = new Set();

    for (const pattern of IMAGE_PATTERNS) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const url = match[1] || match[2];
        if (url) {
          urls.add({
            url,
            filePath,
            line: this.getLineNumber(content, match.index),
          });
        }
      }
    }

    return Array.from(urls);
  }

  /**
   * Get line number for a character index
   */
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  /**
   * Validate a local image path
   */
  validateLocalPath(url, filePath) {
    // Remove leading slash and resolve from public directory
    const localPath = url.replace(/^\//, '');
    const fullPath = join(projectRoot, 'public', localPath);

    if (!existsSync(fullPath)) {
      return {
        valid: false,
        message: `Local image not found: ${url}`,
        suggestion: this.suggestAlternative(localPath),
      };
    }

    return { valid: true };
  }

  /**
   * Suggest alternative image paths
   */
  suggestAlternative(path) {
    const basename = path.split('/').pop();
    const alternatives = globSync('public/img/**/*', { cwd: projectRoot })
      .filter((file) => file.includes(basename))
      .map((file) => file.replace('public', ''));

    if (alternatives.length > 0) {
      return `Did you mean: ${alternatives.join(', ')}?`;
    }

    return 'Consider adding the image to public/img/ directory.';
  }

  /**
   * Validate an external URL
   */
  async validateExternalUrl(url, filePath) {
    // Check cache first
    if (this.checkedUrls.has(url)) {
      return this.checkedUrls.get(url);
    }

    // Skip trusted domains to avoid rate limiting
    const urlObj = new URL(url);
    if (TRUSTED_DOMAINS.some((domain) => urlObj.hostname.includes(domain))) {
      const result = {
        valid: true,
        trusted: true,
        message: `Trusted domain: ${urlObj.hostname}`,
      };
      this.checkedUrls.set(url, result);
      return result;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'follow',
      });

      clearTimeout(timeoutId);

      const result = {
        valid: response.ok,
        status: response.status,
        message: response.ok
          ? `Valid (${response.status})`
          : `HTTP ${response.status} - ${response.statusText}`,
      };

      this.checkedUrls.set(url, result);
      return result;
    } catch (error) {
      const result = {
        valid: false,
        error: true,
        message: `Failed to fetch: ${error.message}`,
        suggestion: 'Consider using a local image instead for reliability.',
      };

      this.checkedUrls.set(url, result);
      return result;
    }
  }

  /**
   * Validate all images in a file
   */
  async validateFile(filePath) {
    const content = readFileSync(filePath, 'utf-8');
    const imageUrls = this.extractImageUrls(content, filePath);

    if (imageUrls.length === 0) {
      return;
    }

    console.log(`\n📄 Checking ${filePath.replace(projectRoot + '/', '')}`);

    for (const { url, line } of imageUrls) {
      const isExternal = url.startsWith('http://') || url.startsWith('https://');
      const result = isExternal
        ? await this.validateExternalUrl(url, filePath)
        : this.validateLocalPath(url, filePath);

      if (!result.valid) {
        this.issues.push({
          file: filePath.replace(projectRoot + '/', ''),
          line,
          url,
          message: result.message,
          suggestion: result.suggestion,
        });

        console.log(`   ❌ Line ${line}: ${url}`);
        console.log(`      ${result.message}`);
        if (result.suggestion) {
          console.log(`      💡 ${result.suggestion}`);
        }
      } else if (result.trusted) {
        this.warnings.push({
          file: filePath.replace(projectRoot + '/', ''),
          line,
          url,
          message: result.message,
        });

        console.log(`   ⚠️  Line ${line}: ${url}`);
        console.log(`      ${result.message} (not validated to avoid rate limiting)`);
      } else {
        console.log(`   ✅ Line ${line}: ${url} - ${result.message || 'OK'}`);
      }
    }
  }

  /**
   * Validate all story files
   */
  async validateAllFiles() {
    console.log('🔍 Image Link Validator\n');
    console.log('Scanning story files for image links...\n');

    const files = FILE_PATTERNS.flatMap((pattern) =>
      globSync(pattern, { cwd: projectRoot, absolute: true })
    );

    console.log(`Found ${files.length} files to check\n`);

    for (const file of files) {
      await this.validateFile(file);
    }

    this.printSummary();
  }

  /**
   * Print validation summary
   */
  printSummary() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 VALIDATION SUMMARY');
    console.log('='.repeat(80));

    if (this.issues.length === 0 && this.warnings.length === 0) {
      console.log('\n✅ All image links are valid!\n');
      return;
    }

    if (this.issues.length > 0) {
      console.log('\n❌ BROKEN LINKS FOUND:\n');
      for (const issue of this.issues) {
        console.log(`   ${issue.file}:${issue.line}`);
        console.log(`   URL: ${issue.url}`);
        console.log(`   Issue: ${issue.message}`);
        if (issue.suggestion) {
          console.log(`   Suggestion: ${issue.suggestion}`);
        }
        console.log('');
      }
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  EXTERNAL URLS (NOT VALIDATED):\n');
      for (const warning of this.warnings) {
        console.log(`   ${warning.file}:${warning.line}`);
        console.log(`   URL: ${warning.url}`);
        console.log(`   Note: ${warning.message}`);
        console.log('');
      }
      console.log(
        '   💡 Consider downloading external images to public/img/ for reliability.\n'
      );
    }

    console.log('='.repeat(80));
    console.log(`Total Issues: ${this.issues.length}`);
    console.log(`Total Warnings: ${this.warnings.length}`);
    console.log('='.repeat(80) + '\n');

    if (STRICT_MODE && this.issues.length > 0) {
      console.error('❌ Validation failed in strict mode.\n');
      process.exit(1);
    }

    if (this.issues.length > 0) {
      console.log('💡 Run with --fix flag to see suggested fixes.\n');
      process.exit(1);
    }
  }
}

// Main execution
const validator = new ImageLinkValidator();
validator.validateAllFiles().catch((error) => {
  console.error('❌ Validation error:', error);
  process.exit(1);
});
