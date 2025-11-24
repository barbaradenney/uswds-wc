#!/usr/bin/env python3

"""
Fix GitHub Actions workflows to use pnpm instead of npm.
This script:
1. Replaces cache: 'npm' with cache: 'pnpm'
2. Replaces 'npm ci' with 'pnpm install --frozen-lockfile'
3. Adds pnpm setup step before Node.js setup if missing
"""

import os
import re
import sys
from pathlib import Path

WORKFLOWS_DIR = Path('.github/workflows')
PNPM_SETUP = """      - name: Install pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

"""


def has_pnpm_setup(content: str) -> bool:
    """Check if workflow already has pnpm setup step."""
    return 'pnpm/action-setup' in content


def needs_pnpm_setup(content: str) -> bool:
    """Check if workflow needs pnpm (uses npm commands)."""
    return ("cache: 'npm'" in content or
            'run: npm ci' in content or
            'run: npm install' in content)


def add_pnpm_setup(content: str) -> str:
    """Add pnpm setup step before first Node.js setup."""
    # Find the first setup-node action
    pattern = r'(\s+- name: Setup Node\.js[^\n]*\n\s+uses: actions/setup-node@)'

    match = re.search(pattern, content)
    if not match:
        print("   ⚠️  Could not find 'Setup Node.js' step to insert pnpm setup")
        return content

    # Insert pnpm setup before Node.js setup
    pos = match.start()
    return content[:pos] + PNPM_SETUP + content[pos:]


def fix_workflow(file_path: Path) -> bool:
    """Fix a single workflow file. Returns True if modified."""
    with open(file_path, 'r') as f:
        original_content = f.read()

    content = original_content
    modified = False

    # Check if workflow needs fixing
    if not needs_pnpm_setup(content):
        return False

    # 1. Replace cache: 'npm' with cache: 'pnpm'
    if "cache: 'npm'" in content:
        content = content.replace("cache: 'npm'", "cache: 'pnpm'")
        modified = True

    # 2. Replace npm ci with pnpm install --frozen-lockfile
    if 'run: npm ci' in content:
        content = re.sub(
            r'run: npm ci$',
            'run: pnpm install --frozen-lockfile',
            content,
            flags=re.MULTILINE
        )
        modified = True

    # 3. Replace npm install with pnpm install (but not global installs)
    # Only replace bare "npm install" not "npm install -g"
    if re.search(r'run: npm install$', content, re.MULTILINE):
        content = re.sub(
            r'run: npm install$',
            'run: pnpm install',
            content,
            flags=re.MULTILINE
        )
        modified = True

    # 4. Add pnpm setup step if not present
    if not has_pnpm_setup(content):
        content = add_pnpm_setup(content)
        modified = True

    # Write back if modified
    if modified:
        # Create backup
        backup_path = file_path.with_suffix(file_path.suffix + '.bak')
        with open(backup_path, 'w') as f:
            f.write(original_content)

        with open(file_path, 'w') as f:
            f.write(content)

    return modified


def main():
    print("🔧 Fixing GitHub Actions workflows to use pnpm...\n")

    if not WORKFLOWS_DIR.exists():
        print(f"❌ Error: {WORKFLOWS_DIR} not found")
        sys.exit(1)

    workflow_files = sorted(WORKFLOWS_DIR.glob('*.yml'))
    fixed_count = 0
    skipped_count = 0

    for file_path in workflow_files:
        filename = file_path.name
        print(f"Processing: {filename}")

        if fix_workflow(file_path):
            print(f"   ✅ Fixed\n")
            fixed_count += 1
        else:
            print(f"   ⏭️  Skipped (already uses pnpm or no npm commands)\n")
            skipped_count += 1

    print("━" * 70)
    print(f"✅ Fixed: {fixed_count} workflows")
    print(f"⏭️  Skipped: {skipped_count} workflows")
    print(f"\n📁 Backup files created with .bak extension")
    print("━" * 70)


if __name__ == '__main__':
    main()
