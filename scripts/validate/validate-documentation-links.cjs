#!/usr/bin/env node

/**
 * Documentation Link Validator
 *
 * Validates all links in markdown documentation to prevent 404 errors.
 *
 * Features:
 * - Validates local file references exist
 * - Validates anchor links exist in target files
 * - Validates external URLs return HTTP 200
 * - Caches results to avoid rate limiting
 * - Reports broken links with file locations and suggestions
 * - Skips example/placeholder URLs
 * - Can be integrated into pre-commit hooks and CI/CD
 *
 * Link Types Validated:
 * - Relative file links: [Text](docs/FILE.md)
 * - Anchor links: [Text](#section)
 * - Combined: [Text](docs/FILE.md#section)
 * - External URLs: [Text](https://example.com)
 * - Bare URLs: https://example.com
 *
 * Usage:
 *   node scripts/validate/validate-documentation-links.cjs
 *   node scripts/validate/validate-documentation-links.cjs --fix
 *   node scripts/validate/validate-documentation-links.cjs --strict
 *   node scripts/validate/validate-documentation-links.cjs --external  # Also check external URLs
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const https = require('https');
const http = require('http');

// ANSI colors
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

// Configuration
const projectRoot = path.resolve(__dirname, '../..');

// Patterns for documentation files
const DOC_PATTERNS = [
  'docs/**/*.md',
  'src/components/**/*.md',
  'src/components/**/*.mdx',
  // Monorepo package documentation
  'packages/*/src/components/**/*.md',
  'packages/*/src/components/**/*.mdx',
  'packages/*/*.md',
  'packages/*/README.md',
  '.storybook/**/*.md',
  '.storybook/**/*.mdx',
  'CLAUDE.md',
  'README.md',
];

// Placeholder/example domains to skip
const PLACEHOLDER_PATTERNS = [
  'example.com',
  'your-org',
  'your-domain',
  'localhost',
  '127.0.0.1',
];

// Trusted external domains (skip validation to avoid rate limiting unless --external flag)
const TRUSTED_DOMAINS = [
  'github.com',
  'designsystem.digital.gov',
  'claude.com',
  'anthropic.com',
  'npmjs.com',
  'unpkg.com',
  'jsdelivr.net',
];

// Parse command line arguments
const args = process.argv.slice(2);
const FIX_MODE = args.includes('--fix');
const STRICT_MODE = args.includes('--strict');
const CHECK_EXTERNAL = args.includes('--external');

/**
 * Extract all links from markdown content
 */
function extractLinks(content, filePath) {
  const links = [];

  // Markdown link pattern: [text](url)
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  while ((match = markdownLinkRegex.exec(content)) !== null) {
    const text = match[1];
    const url = match[2];
    const line = content.substring(0, match.index).split('\n').length;

    links.push({
      type: 'markdown',
      text,
      url,
      line,
      filePath,
      raw: match[0],
    });
  }

  // Bare URLs in text
  const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/g;
  while ((match = urlRegex.exec(content)) !== null) {
    const url = match[1];
    const line = content.substring(0, match.index).split('\n').length;

    // Skip if already captured as markdown link
    const isDuplicate = links.some(
      (link) => link.line === line && link.url === url
    );

    if (!isDuplicate) {
      links.push({
        type: 'bare',
        text: url,
        url,
        line,
        filePath,
        raw: url,
      });
    }
  }

  return links;
}

/**
 * Check if URL is a placeholder/example
 */
function isPlaceholder(url) {
  return PLACEHOLDER_PATTERNS.some((pattern) => url.includes(pattern));
}

/**
 * Check if URL is external
 */
function isExternal(url) {
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Check if external URL should be validated
 */
function shouldValidateExternal(url) {
  if (!CHECK_EXTERNAL) {
    // Skip validation unless --external flag is set
    const urlObj = new URL(url);
    if (TRUSTED_DOMAINS.some((domain) => urlObj.hostname.includes(domain))) {
      return false;
    }
  }
  return true;
}

/**
 * Extract anchors from markdown content
 */
function extractAnchors(content) {
  const anchors = new Set();

  // Standard markdown headers: # Header
  const headerRegex = /^#{1,6}\s+(.+)$/gm;
  let match;

  while ((match = headerRegex.exec(content)) !== null) {
    const headerText = match[1].trim();
    // Convert to GitHub-style anchor
    const anchor = headerText
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    anchors.add(anchor);
  }

  // MDX anchor links: <a name="anchor">
  const anchorRegex = /<a\s+(?:id|name)=["']([^"']+)["']/gi;
  while ((match = anchorRegex.exec(content)) !== null) {
    anchors.add(match[1]);
  }

  return anchors;
}

/**
 * Validate local file reference
 */
function validateLocalFile(url, filePath) {
  // Split URL into path and anchor
  const [urlPath, anchor] = url.split('#');

  // Resolve file path relative to current file
  const currentDir = path.dirname(filePath);
  let targetPath;

  if (urlPath.startsWith('/')) {
    // Absolute path from project root
    targetPath = path.join(projectRoot, urlPath);
  } else if (urlPath.startsWith('.')) {
    // Relative path
    targetPath = path.resolve(currentDir, urlPath);
  } else {
    // Relative path without ./
    targetPath = path.resolve(currentDir, urlPath);
  }

  // Check if file exists
  if (!fs.existsSync(targetPath)) {
    return {
      valid: false,
      message: `File not found: ${urlPath}`,
      suggestion: suggestSimilarFile(urlPath),
    };
  }

  // If anchor is specified, validate it exists in target file
  if (anchor) {
    try {
      const targetContent = fs.readFileSync(targetPath, 'utf-8');
      const anchors = extractAnchors(targetContent);

      if (!anchors.has(anchor)) {
        return {
          valid: false,
          message: `Anchor #${anchor} not found in ${urlPath}`,
          suggestion: `Available anchors: ${Array.from(anchors).join(', ')}`,
        };
      }
    } catch (error) {
      return {
        valid: false,
        message: `Could not read file to validate anchor: ${error.message}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Suggest similar file path
 */
function suggestSimilarFile(urlPath) {
  const basename = path.basename(urlPath);
  const allDocs = glob.sync('**/*.{md,mdx}', { cwd: projectRoot });

  const similar = allDocs.filter((file) => file.includes(basename));

  if (similar.length > 0) {
    return `Did you mean: ${similar.slice(0, 3).join(', ')}?`;
  }

  return null;
}

/**
 * Validate anchor-only link (within same file)
 */
function validateAnchorLink(anchor, filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const anchors = extractAnchors(content);

    if (!anchors.has(anchor)) {
      return {
        valid: false,
        message: `Anchor #${anchor} not found in current file`,
        suggestion: `Available anchors: ${Array.from(anchors).slice(0, 5).join(', ')}`,
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      message: `Could not validate anchor: ${error.message}`,
    };
  }
}

/**
 * Validate external URL
 */
function validateExternalUrl(url) {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url);
      const protocol = urlObj.protocol === 'https:' ? https : http;

      const req = protocol.request(
        url,
        {
          method: 'HEAD',
          timeout: 5000,
          headers: {
            'User-Agent': 'USWDS-WebComponents-Link-Validator/1.0',
          },
        },
        (res) => {
          if (res.statusCode >= 200 && res.statusCode < 400) {
            resolve({ valid: true, status: res.statusCode });
          } else {
            resolve({
              valid: false,
              status: res.statusCode,
              message: `HTTP ${res.statusCode} ${res.statusMessage}`,
            });
          }
        }
      );

      req.on('error', (error) => {
        resolve({
          valid: false,
          message: `Request failed: ${error.message}`,
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          valid: false,
          message: 'Request timed out after 5 seconds',
        });
      });

      req.end();
    } catch (error) {
      resolve({
        valid: false,
        message: `Invalid URL: ${error.message}`,
      });
    }
  });
}

/**
 * Main validation function
 */
async function validateDocumentationLinks() {
  console.log(`${BLUE}🔗 Documentation Link Validator${RESET}\n`);

  // Find all documentation files
  const files = DOC_PATTERNS.flatMap((pattern) =>
    glob.sync(pattern, { cwd: projectRoot, absolute: true })
  );

  console.log(`${GREEN}✓${RESET} Found ${files.length} documentation files\n`);

  const issues = [];
  const warnings = [];
  const externalUrlCache = new Map();
  let totalLinks = 0;
  let validatedLinks = 0;
  let skippedLinks = 0;

  for (const file of files) {
    const relativePath = path.relative(projectRoot, file);
    const content = fs.readFileSync(file, 'utf-8');
    const links = extractLinks(content, file);

    if (links.length === 0) continue;

    console.log(`${BLUE}📄${RESET} ${relativePath} (${links.length} links)`);

    for (const link of links) {
      totalLinks++;

      // Skip placeholders
      if (isPlaceholder(link.url)) {
        console.log(`   ${YELLOW}⊘${RESET} Line ${link.line}: ${link.url} (placeholder - skipped)`);
        skippedLinks++;
        continue;
      }

      // Handle different link types
      if (link.url.startsWith('#')) {
        // Anchor-only link
        const anchor = link.url.substring(1);
        const result = validateAnchorLink(anchor, file);

        if (!result.valid) {
          issues.push({
            file: relativePath,
            line: link.line,
            url: link.url,
            message: result.message,
            suggestion: result.suggestion,
          });
          console.log(`   ${RED}✗${RESET} Line ${link.line}: ${link.url} - ${result.message}`);
        } else {
          console.log(`   ${GREEN}✓${RESET} Line ${link.line}: ${link.url}`);
          validatedLinks++;
        }
      } else if (isExternal(link.url)) {
        // External URL
        if (!shouldValidateExternal(link.url)) {
          warnings.push({
            file: relativePath,
            line: link.line,
            url: link.url,
            message: 'Trusted external URL (not validated)',
          });
          console.log(`   ${YELLOW}⚠${RESET} Line ${link.line}: ${link.url} (trusted - skipped)`);
          skippedLinks++;
          continue;
        }

        // Check cache first
        let result;
        if (externalUrlCache.has(link.url)) {
          result = externalUrlCache.get(link.url);
          console.log(`   ${GREEN}✓${RESET} Line ${link.line}: ${link.url} (cached)`);
        } else {
          result = await validateExternalUrl(link.url);
          externalUrlCache.set(link.url, result);

          if (!result.valid) {
            issues.push({
              file: relativePath,
              line: link.line,
              url: link.url,
              message: result.message,
            });
            console.log(`   ${RED}✗${RESET} Line ${link.line}: ${link.url} - ${result.message}`);
          } else {
            console.log(`   ${GREEN}✓${RESET} Line ${link.line}: ${link.url} (${result.status})`);
            validatedLinks++;
          }
        }
      } else {
        // Local file reference
        const result = validateLocalFile(link.url, file);

        if (!result.valid) {
          issues.push({
            file: relativePath,
            line: link.line,
            url: link.url,
            message: result.message,
            suggestion: result.suggestion,
          });
          console.log(`   ${RED}✗${RESET} Line ${link.line}: ${link.url} - ${result.message}`);
        } else {
          console.log(`   ${GREEN}✓${RESET} Line ${link.line}: ${link.url}`);
          validatedLinks++;
        }
      }
    }

    console.log('');
  }

  // Print summary
  console.log('='.repeat(80));
  console.log(`${BLUE}📊 VALIDATION SUMMARY${RESET}`);
  console.log('='.repeat(80));
  console.log(`Total links found: ${totalLinks}`);
  console.log(`${GREEN}Valid links: ${validatedLinks}${RESET}`);
  console.log(`${YELLOW}Skipped links: ${skippedLinks}${RESET}`);
  console.log(`${RED}Broken links: ${issues.length}${RESET}`);
  console.log('='.repeat(80));

  if (issues.length > 0) {
    console.log(`\n${RED}❌ BROKEN LINKS FOUND:${RESET}\n`);
    for (const issue of issues) {
      console.log(`   📄 ${issue.file}:${issue.line}`);
      console.log(`   🔗 ${issue.url}`);
      console.log(`   ❌ ${issue.message}`);
      if (issue.suggestion) {
        console.log(`   💡 ${issue.suggestion}`);
      }
      console.log('');
    }
  }

  if (warnings.length > 0 && !CHECK_EXTERNAL) {
    console.log(`${YELLOW}💡 Tip: Run with --external flag to validate trusted external URLs${RESET}\n`);
  }

  if (issues.length === 0 && warnings.length === 0) {
    console.log(`\n${GREEN}✅ All documentation links are valid!${RESET}\n`);
    process.exit(0);
  }

  if (issues.length > 0) {
    if (STRICT_MODE) {
      console.error(`${RED}❌ Validation failed in strict mode.${RESET}\n`);
      process.exit(1);
    }
    console.log(`${YELLOW}⚠️  Some links are broken. Please fix them.${RESET}\n`);
    process.exit(1);
  }

  process.exit(0);
}

// Run validator
validateDocumentationLinks().catch((error) => {
  console.error(`${RED}❌ Validation error:${RESET}`, error);
  process.exit(1);
});
