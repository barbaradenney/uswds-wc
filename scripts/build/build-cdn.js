#!/usr/bin/env node
/**
 * Build script for CDN distribution
 * Creates bundled JS and copies CSS to the packages/uswds-wc-bundle/ directory
 */

import { execSync } from 'child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '../..');
const bundleDir = resolve(rootDir, 'packages/uswds-wc-bundle');
const cdnBuildDir = resolve(rootDir, 'cdn');

console.log('🏗️  Building CDN bundle...\n');

// Step 1: Ensure CSS is built
console.log('📦 Step 1: Building CSS...');
try {
  execSync('pnpm --filter @uswds-wc/core build:css', {
    cwd: rootDir,
    stdio: 'inherit'
  });
} catch (error) {
  console.error('❌ CSS build failed');
  process.exit(1);
}

// Step 2: Build the CDN bundle with Vite
console.log('\n📦 Step 2: Building JavaScript bundle...');
try {
  execSync('vite build --config vite.config.cdn.ts', {
    cwd: rootDir,
    stdio: 'inherit'
  });
} catch (error) {
  console.error('❌ JavaScript bundle build failed');
  process.exit(1);
}

// Step 3: Copy files to bundle package directory
console.log('\n📦 Step 3: Copying files to bundle package...');

if (!existsSync(bundleDir)) {
  mkdirSync(bundleDir, { recursive: true });
}

// Copy JS files from cdn/ to packages/uswds-wc-bundle/
if (existsSync(cdnBuildDir)) {
  const files = readdirSync(cdnBuildDir);
  for (const file of files) {
    if (file.startsWith('uswds-wc.js')) {
      copyFileSync(resolve(cdnBuildDir, file), resolve(bundleDir, file));
      console.log(`✅ Copied ${file}`);
    }
  }
}

// Copy CSS
const cssSource = resolve(rootDir, 'packages/uswds-wc-core/src/styles/styles.css');
const cssDest = resolve(bundleDir, 'uswds-wc.css');

if (existsSync(cssSource)) {
  copyFileSync(cssSource, cssDest);
  console.log('✅ Copied uswds-wc.css');
} else {
  console.error(`❌ CSS source not found at ${cssSource}`);
  process.exit(1);
}

// Copy CSS sourcemap if it exists
const cssMapSource = resolve(rootDir, 'packages/uswds-wc-core/src/styles/styles.css.map');
if (existsSync(cssMapSource)) {
  copyFileSync(cssMapSource, resolve(bundleDir, 'uswds-wc.css.map'));
  console.log('✅ Copied uswds-wc.css.map');
}

console.log('\n✅ CDN bundle build complete!');
console.log('\n📁 Output files in packages/uswds-wc-bundle/:');
console.log('   uswds-wc.js      - JavaScript bundle (ES module)');
console.log('   uswds-wc.js.gz   - Gzipped JavaScript');
console.log('   uswds-wc.js.br   - Brotli JavaScript');
console.log('   uswds-wc.css     - Stylesheet');
console.log('\n📖 CDN Usage (after publishing):');
console.log('   <link rel="stylesheet" href="https://unpkg.com/@uswds-wc/bundle/uswds-wc.css">');
console.log('   <script type="module" src="https://unpkg.com/@uswds-wc/bundle/uswds-wc.js"></script>');
console.log('\n📖 Or from jsdelivr:');
console.log('   <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@uswds-wc/bundle/uswds-wc.css">');
console.log('   <script type="module" src="https://cdn.jsdelivr.net/npm/@uswds-wc/bundle/uswds-wc.js"></script>');
