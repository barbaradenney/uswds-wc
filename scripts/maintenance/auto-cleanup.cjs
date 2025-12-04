#!/usr/bin/env node

/**
 * Auto-cleanup script
 * Automatically organizes repository files into correct locations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Starting automatic repository cleanup...\n');

let movedCount = 0;

// Helper function to move files
function moveFile(source, dest) {
  try {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.renameSync(source, dest);
    console.log(`✅ Moved: ${source} → ${dest}`);
    movedCount++;
    return true;
  } catch (error) {
    console.error(`❌ Failed to move ${source}:`, error.message);
    return false;
  }
}

// 1. Clean root directory
console.log('📂 Cleaning root directory...');
const rootFiles = fs.readdirSync('.');

// Files that should remain in root for discoverability (AI agent docs, etc.)
const ROOT_KEEPFILES = [
  'README.md', 'CLAUDE.md', 'CHANGELOG.md', 'LICENSE', 'CODE_OF_CONDUCT.md',
  'AI_USAGE.md', 'llms.txt',  // AI agent documentation - must be discoverable
  'custom-elements.json',     // Custom Elements Manifest - standard location per spec
];

rootFiles.forEach(file => {
  // Move documentation files (except those that should stay in root)
  if (file.endsWith('.md') && !ROOT_KEEPFILES.includes(file)) {
    moveFile(file, `docs/archived/${file}`);
  }

  // Move HTML test files
  if (file.endsWith('.html')) {
    moveFile(file, `debug/${file}`);
  }

  // Move JSON test results (except those that should stay in root)
  const jsonKeeFiles = ['package.json', 'package-lock.json', 'renovate.json', 'tsconfig.json', 'turbo.json', 'lighthouserc.json', 'custom-elements.json'];
  if (file.endsWith('.json') && !jsonKeeFiles.includes(file) && !file.startsWith('tsconfig.') && !file.startsWith('.eslintrc')) {
    moveFile(file, `reports/${file}`);
  }
  
  // Move test scripts
  if ((file.endsWith('.js') || file.endsWith('.sh')) && file.startsWith('test-')) {
    moveFile(file, `debug/${file}`);
  }

  // Move log files
  if (file.endsWith('.log')) {
    moveFile(file, `reports/logs/${file}`);
  }
});

// 2. Organize loose scripts
console.log('\n📜 Organizing loose scripts...');
if (fs.existsSync('scripts')) {
  const scriptFiles = fs.readdirSync('scripts');
  scriptFiles.forEach(file => {
    if (!fs.statSync(`scripts/${file}`).isFile()) return;
    if (!file.endsWith('.js') && !file.endsWith('.sh') && !file.endsWith('.cjs')) return;
    
    const filePath = `scripts/${file}`;
    
    // Categorize by filename patterns
    if (file.match(/test|spec|comprehensive-issue/)) {
      moveFile(filePath, `scripts/test/${file}`);
    } else if (file.match(/validate|compliance|audit|analyze|check|detect|gate|quality/)) {
      moveFile(filePath, `scripts/validate/${file}`);
    } else if (file.match(/build|css|sass/)) {
      moveFile(filePath, `scripts/build/${file}`);
    } else if (file.match(/auto-|fix|cleanup|migrate|optimize|monitor|maintain|setup|remove|add-|sync|batch/)) {
      moveFile(filePath, `scripts/maintenance/${file}`);
    } else if (file.match(/utils|helper|extract|convert|track|prevent|performance|comprehensive/)) {
      moveFile(filePath, `scripts/utils/${file}`);
    } else if (file.match(/ci|post-|pre-|commit|pr-|reporter|postinstall/)) {
      moveFile(filePath, `scripts/ci/${file}`);
    } else if (file.match(/generate|template|component-generator|story/)) {
      moveFile(filePath, `scripts/generate/${file}`);
    } else if (file.endsWith('.cjs') || file.match(/migrate-to-|fix-all-/)) {
      moveFile(filePath, `scripts/archived/${file}`);
    }
  });
}

// 3. Move component-specific tests from __tests__
console.log('\n🧪 Organizing component-specific tests...');
const components = [
  'accordion', 'alert', 'banner', 'breadcrumb', 'button', 'card', 'character-count',
  'combo-box', 'date-picker', 'date-range-picker', 'file-input', 'footer', 'header',
  'menu', 'modal', 'pagination', 'search', 'select', 'step-indicator', 'time-picker',
  'tooltip', 'in-page-navigation', 'language-selector'
];

if (fs.existsSync('__tests__')) {
  const testFiles = fs.readdirSync('__tests__');
  testFiles.forEach(file => {
    if (!file.endsWith('.test.ts')) return;
    
    components.forEach(comp => {
      if (file.startsWith(comp + '-') && fs.existsSync(`src/components/${comp}`)) {
        moveFile(`__tests__/${file}`, `src/components/${comp}/${file}`);
      }
    });
    
    // Move documentation files
    if (file.endsWith('.md')) {
      moveFile(`__tests__/${file}`, `docs/archived/${file}`);
    }
  });
}

// 4. Consolidate report directories
console.log('\n📊 Consolidating report directories...');
['compliance', 'compliance-reports', 'playwright-report'].forEach(dir => {
  if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const src = path.join(dir, file);
      if (fs.statSync(src).isFile()) {
        moveFile(src, `reports/${dir}/${file}`);
      }
    });
    // Try to remove empty directory
    try {
      if (fs.readdirSync(dir).length === 0) {
        fs.rmdirSync(dir);
        console.log(`✅ Removed empty directory: ${dir}`);
      }
    } catch (e) {
      // Directory not empty or can't be removed
    }
  }
});

// Summary
console.log(`\n✅ Cleanup complete! ${movedCount} files organized.`);

if (movedCount === 0) {
  console.log('🎉 Repository is already clean!');
} else {
  console.log('\n💡 Next steps:');
  console.log('   1. Review the changes: git status');
  console.log('   2. Test that everything still works: npm test');
  console.log('   3. Commit the cleanup: git add . && git commit -m "chore: auto-cleanup repository organization"');
}
