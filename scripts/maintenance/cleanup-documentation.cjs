#!/usr/bin/env node

/**
 * Documentation Cleanup System
 *
 * Automatically archives obsolete session documentation and maintains
 * clean docs/ directory with only current, relevant documentation.
 *
 * Categories:
 * 1. PERMANENT - Core guides that should never be archived
 * 2. TEMPORARY - Session reports/analysis that should be archived after 30 days
 * 3. STATUS - Status reports that should be archived when superseded
 *
 * Usage:
 *   node scripts/maintenance/cleanup-documentation.cjs [--dry-run] [--force]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Configuration
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * PERMANENT DOCS - Core guides that should NEVER be archived
 * These are the canonical documentation that developers actively use
 */
const PERMANENT_DOCS = [
  // Architecture & Patterns
  'ARCHITECTURE_PATTERNS.md',
  'LIT_USWDS_INTEGRATION_PATTERNS.md',
  'MINIMAL_WRAPPER_PATTERN.md',
  'USWDS_INTEGRATION_GUIDE.md',
  'USWDS_COMPLIANCE_METHODOLOGY.md',
  'USWDS_JAVASCRIPT_DEBUGGING_PROTOCOL.md',
  'ARCHITECTURE_DECISION_ACCORDION_BEHAVIOR_APPROACH.md',
  'ARCHITECTURE_DECISION_SCRIPT_TAG_VS_COMPONENT_INIT.md',
  'JAVASCRIPT_INTEGRATION_STRATEGY.md',
  'PREVENTING_DUPLICATE_INITIALIZATION.md',
  'HIGH_RISK_COMPONENT_VALIDATION_SYSTEM.md',
  'SELECTIVE_COMPLIANCE_SYSTEM.md',

  // Monorepo Migration
  'MONOREPO_MIGRATION_GUIDE.md',
  'MONOREPO_MIGRATION_SUMMARY.md',
  'MONOREPO_ACTIVATION_PLAN.md',
  'MONOREPO_PHASE_6_CI_CD_MIGRATION.md',
  'MONOREPO_PHASE_7_DOCUMENTATION.md',
  'MONOREPO_PHASE_8_PUBLISHING.md',

  // Development Guides
  'COMPONENT_TEMPLATES.md',
  'COMPONENT_DEVELOPMENT_GUIDE.md',
  'GETTING_STARTED.md',
  'TESTING_GUIDE.md',
  'PLAYWRIGHT_TESTING.md',
  'DEBUGGING_GUIDE.md',
  'JAVASCRIPT_GUIDE.md',
  'STORYBOOK_BEST_PRACTICES.md',
  'LINK_VALIDATION_GUIDE.md',
  'PRE_POST_COMMIT_OPTIMIZATION_PROPOSAL.md',
  'STORYBOOK_CONFIGURATION.md',
  'TESTING_QUICK_REFERENCE.md',
  'LIT_DIRECTIVE_BEST_PRACTICES.md',

  // Reference
  'COMPONENTS.md',
  'NPM_SCRIPTS_REFERENCE.md',
  'CODE_QUALITY_ARCHITECTURAL_REVIEW.md',
  'README.md',
  'SCRIPT_ORGANIZATION.md',

  // Processes & Policies
  'RELEASE_PROCESS.md',
  'TEST_SKIP_POLICY.md',
  'AI_COLLABORATION_GUIDE.md',
  'AI_CODE_QUALITY_GUIDE.md',
  'CI_CD_BUNDLE_SIZE_MONITORING.md',
  'CI_SETUP_CHROMATIC.md',
  'GITHUB_SECRETS_SETUP.md',
  'REGRESSION_TEST_AUTOMATION.md',
  'DOCUMENTATION_LIFECYCLE.md',
  'GIT_HOOKS_COMPREHENSIVE_GUIDE.md',
  'MAINTENANCE_STRATEGY.md',

  // Optimization Guides
  'BUNDLE_SIZE_OPTIMIZATION_GUIDE.md',
  'PERFORMANCE_GUIDE.md',
  'PERFORMANCE_MIGRATION.md',
  'EDGE_CACHING_GUIDE.md',

  // Component-Specific Strategies
  'BEHAVIOR_TEST_STRATEGY.md',
  'COMPONENT_BASED_TESTING.md',
  'MODAL_TESTING_STRATEGY.md',
  'TESTING_LAYOUT_VISUAL_REGRESSIONS.md',
  'SLOT_TEST_ISSUE.md',
  'STORY_INLINE_STYLE_MIGRATION_GUIDE.md',

  // Current Issue Tracking
  'TEST_POLLUTION_KNOWN_ISSUES.md',
  'DISCOVERED_ISSUES_ENFORCEMENT_IMPLEMENTATION.md',
  'TEST_ADDITIONS_REQUIRED.md',
  'TEST_SKIP_IMMEDIATE_ACTIONS.md',
  'TODO_TRACKER.md',
];

/**
 * TEMPORARY DOCS - Session reports/analysis (archive after 30 days)
 * Pattern matching for session-specific docs
 */
const TEMPORARY_PATTERNS = [
  /SESSION\d+/i,                    // SESSION1, SESSION2, etc.
  /IMPROVEMENTS/i,                  // CYPRESS_IMPROVEMENTS, VITEST_IMPROVEMENTS
  /SUMMARY/i,                       // Various summaries
  /ANALYSIS/i,                      // TEST_COVERAGE_ANALYSIS, etc.
  /INVESTIGATION/i,                 // TEST_TIMEOUT_INVESTIGATION, etc.
  /FINDINGS/i,                      // TEST_SKIP_WEEK3_FINDINGS, etc.
  /RESULTS/i,                       // VITEST_RESULTS_SUMMARY, etc.
  /POST_MORTEM/i,                   // POST_MORTEM_TIME_PICKER, etc.
  /AUDIT/i,                         // TESTING_AUDIT, LEGACY_CODE_AUDIT
  /PLAN/i,                          // CYPRESS_FIXES_PLAN, TEST_SKIP_MIGRATION_PLAN
  /PATH_TO/i,                       // PATH_TO_100_PERCENT, etc.
  /CHECKLIST/i,                     // PRE_PUBLICATION_CHECKLIST, etc.
];

/**
 * STATUS DOCS - Should be archived when superseded or work is complete
 */
const STATUS_PATTERNS = [
  /STATUS/i,                        // CYPRESS_E2E_TEST_STATUS, TEST_100_PERCENT_STATUS
  /COMPLETE/i,                      // TESTING_WORK_COMPLETE_SUMMARY
  /KNOWN_ISSUES/i,                  // TEST_POLLUTION_KNOWN_ISSUES (keep current, archive old)
];

/**
 * ALWAYS KEEP - Even if they match temporary patterns
 */
const ALWAYS_KEEP = [
  'TESTING_GUIDE.md',               // Permanent guide, not temporary
  'BEHAVIOR_TEST_STRATEGY.md',      // Strategy doc, not session report
  'COMPONENT_TEMPLATES.md',         // Templates, not temporary
];

const DOCS_DIR = path.join(process.cwd(), 'docs');
const ARCHIVE_DIR = path.join(DOCS_DIR, 'archive');
const ARCHIVE_README = path.join(ARCHIVE_DIR, 'README.md');

const ARCHIVE_AGE_DAYS = 7; // Archive temporary docs after 7 days (weekly cleanup)
const DRY_RUN = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Utility Functions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function getFileAge(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const ageMs = Date.now() - stats.mtime.getTime();
    return Math.floor(ageMs / (1000 * 60 * 60 * 24)); // Convert to days
  } catch (e) {
    return 0;
  }
}

function getLastCommitDate(filePath) {
  try {
    const relativePath = path.relative(process.cwd(), filePath);
    const timestamp = execSync(`git log -1 --format=%ct -- "${relativePath}"`, { encoding: 'utf-8' }).trim();
    if (!timestamp) return null;

    const date = new Date(parseInt(timestamp) * 1000);
    const ageMs = Date.now() - date.getTime();
    return Math.floor(ageMs / (1000 * 60 * 60 * 24));
  } catch (e) {
    return null;
  }
}

function isTemporaryDoc(filename) {
  if (ALWAYS_KEEP.includes(filename)) return false;
  if (PERMANENT_DOCS.includes(filename)) return false;

  return TEMPORARY_PATTERNS.some(pattern => pattern.test(filename));
}

function isStatusDoc(filename) {
  if (ALWAYS_KEEP.includes(filename)) return false;
  if (PERMANENT_DOCS.includes(filename)) return false;

  return STATUS_PATTERNS.some(pattern => pattern.test(filename));
}

function shouldArchive(filePath, filename) {
  // Never archive permanent docs
  if (PERMANENT_DOCS.includes(filename)) return false;
  if (ALWAYS_KEEP.includes(filename)) return false;

  const age = getLastCommitDate(filePath) || getFileAge(filePath);

  // Archive temporary docs older than ARCHIVE_AGE_DAYS
  if (isTemporaryDoc(filename) && age > ARCHIVE_AGE_DAYS) {
    return { shouldArchive: true, reason: `Temporary doc older than ${ARCHIVE_AGE_DAYS} days (${age} days)` };
  }

  // Archive status docs older than 60 days (they're likely superseded)
  if (isStatusDoc(filename) && age > 60) {
    return { shouldArchive: true, reason: `Status doc older than 60 days (${age} days)` };
  }

  return { shouldArchive: false, reason: null };
}

function categorizeDoc(filename) {
  if (PERMANENT_DOCS.includes(filename)) return 'PERMANENT';
  if (ALWAYS_KEEP.includes(filename)) return 'PERMANENT';
  if (isTemporaryDoc(filename)) return 'TEMPORARY';
  if (isStatusDoc(filename)) return 'STATUS';
  return 'UNCATEGORIZED';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Archive Operations
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function ensureArchiveDir() {
  if (!fs.existsSync(ARCHIVE_DIR)) {
    if (!DRY_RUN) {
      fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
      console.log('📁 Created archive directory');
    } else {
      console.log('📁 [DRY RUN] Would create archive directory');
    }
  }
}

function updateArchiveReadme(archivedFiles) {
  if (archivedFiles.length === 0) return;

  const today = new Date().toISOString().split('T')[0];

  let readme = '';
  if (fs.existsSync(ARCHIVE_README)) {
    readme = fs.readFileSync(ARCHIVE_README, 'utf-8');
  } else {
    readme = `# Archived Documentation

This directory contains historical documentation that has been superseded or is no longer actively maintained.

## Archive Policy

- **Temporary Docs**: Session reports and analysis archived after ${ARCHIVE_AGE_DAYS} days
- **Status Docs**: Status reports archived after 60 days or when superseded
- **Permanent Docs**: Core guides never archived (see cleanup-documentation.cjs)

## Archived Files

`;
  }

  // Add new archive entries
  const newEntries = archivedFiles.map(file => {
    const basename = path.basename(file.source);
    return `### ${basename} (Archived ${today})
- **Reason**: ${file.reason}
- **Category**: ${file.category}
- **Age**: ${file.age} days

`;
  }).join('');

  readme += '\n' + newEntries;

  if (!DRY_RUN) {
    fs.writeFileSync(ARCHIVE_README, readme);
    console.log(`📝 Updated archive README with ${archivedFiles.length} entries`);
  } else {
    console.log(`📝 [DRY RUN] Would update archive README with ${archivedFiles.length} entries`);
  }
}

function archiveFile(filePath, reason, category, age) {
  const filename = path.basename(filePath);
  const archivePath = path.join(ARCHIVE_DIR, filename);

  // Check if already archived
  if (fs.existsSync(archivePath)) {
    console.log(`⏭️  ${filename} - Already archived`);
    return null;
  }

  if (!DRY_RUN) {
    fs.renameSync(filePath, archivePath);
    console.log(`📦 ${filename} → archive/ (${reason})`);
  } else {
    console.log(`📦 [DRY RUN] ${filename} → archive/ (${reason})`);
  }

  return { source: filePath, reason, category, age };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Analysis & Reporting
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function analyzeDocumentation() {
  const files = fs.readdirSync(DOCS_DIR)
    .filter(f => f.endsWith('.md') && !f.startsWith('.'))
    .map(f => path.join(DOCS_DIR, f));

  const analysis = {
    total: files.length,
    permanent: 0,
    temporary: 0,
    status: 0,
    uncategorized: 0,
    archivable: [],
    byCategory: {}
  };

  files.forEach(filePath => {
    const filename = path.basename(filePath);
    const category = categorizeDoc(filename);
    const age = getLastCommitDate(filePath) || getFileAge(filePath);
    const archiveCheck = shouldArchive(filePath, filename);

    analysis[category.toLowerCase()]++;

    if (!analysis.byCategory[category]) {
      analysis.byCategory[category] = [];
    }
    analysis.byCategory[category].push({ filename, age });

    if (archiveCheck.shouldArchive) {
      analysis.archivable.push({
        filePath,
        filename,
        category,
        age,
        reason: archiveCheck.reason
      });
    }
  });

  return analysis;
}

function printAnalysis(analysis) {
  console.log('\n📊 Documentation Analysis');
  console.log('═'.repeat(70));
  console.log(`Total files: ${analysis.total}`);
  console.log(`  ✅ Permanent: ${analysis.permanent}`);
  console.log(`  ⏱️  Temporary: ${analysis.temporary}`);
  console.log(`  📊 Status: ${analysis.status}`);
  console.log(`  ❓ Uncategorized: ${analysis.uncategorized}`);
  console.log(`  📦 Archivable: ${analysis.archivable.length}`);
  console.log();

  if (analysis.archivable.length > 0) {
    console.log('📦 Files Ready for Archive:');
    console.log('─'.repeat(70));
    analysis.archivable.forEach(file => {
      console.log(`  ${file.filename}`);
      console.log(`    Category: ${file.category} | Age: ${file.age} days`);
      console.log(`    Reason: ${file.reason}`);
      console.log();
    });
  }

  if (analysis.uncategorized > 0) {
    console.log('❓ Uncategorized Files:');
    console.log('─'.repeat(70));
    analysis.byCategory.UNCATEGORIZED?.forEach(file => {
      console.log(`  ${file.filename} (${file.age} days old)`);
    });
    console.log();
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Main Execution
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function main() {
  console.log('🧹 Documentation Cleanup System');
  console.log('═'.repeat(70));

  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No files will be moved\n');
  }

  if (FORCE) {
    console.log('⚠️  FORCE MODE - Ignoring age thresholds\n');
  }

  // Analyze current state
  const analysis = analyzeDocumentation();
  printAnalysis(analysis);

  if (analysis.archivable.length === 0) {
    console.log('✅ No files need archiving');
    return 0;
  }

  // Perform archiving
  ensureArchiveDir();

  const archived = [];
  analysis.archivable.forEach(file => {
    const result = archiveFile(file.filePath, file.reason, file.category, file.age);
    if (result) archived.push(result);
  });

  if (archived.length > 0) {
    updateArchiveReadme(archived);

    console.log();
    console.log('═'.repeat(70));
    console.log(`✅ Archived ${archived.length} file(s)`);
    console.log();
    console.log('💡 Next steps:');
    console.log('   1. Review archived files in docs/archive/');
    console.log('   2. Update permanent docs if needed');
    console.log('   3. Commit changes: git add docs/ && git commit -m "chore: archive obsolete documentation"');
  }

  return 0;
}

// Run if called directly
if (require.main === module) {
  try {
    process.exit(main());
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

module.exports = { analyzeDocumentation, shouldArchive, categorizeDoc };
