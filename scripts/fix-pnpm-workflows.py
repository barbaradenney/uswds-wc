#!/usr/bin/env python3
"""
Script to add pnpm/action-setup@v2 step before setup-node@v4 in all workflows
"""

import os
import re
from pathlib import Path

PNPM_SETUP = """      - name: 📦 Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

"""

def find_workflow_files():
    """Find all workflow files that use pnpm cache"""
    workflows_dir = Path('.github/workflows')
    files = []
    for file in workflows_dir.glob('*.yml'):
        content = file.read_text()
        if "cache: 'pnpm'" in content:
            files.append(file)
    return files

def fix_workflow_file(file_path):
    """Add pnpm setup before setup-node in a workflow file"""
    content = file_path.read_text()

    # Check if already has pnpm setup
    if 'pnpm/action-setup' in content:
        return False, "Already has pnpm setup"

    # Pattern to find setup-node step
    # Match lines like "      - name: 🔧 Setup Node.js" followed by "        uses: actions/setup-node@v4"
    pattern = r'([ ]{6}- name: [^\n]+Setup Node[^\n]*\n[ ]{8}uses: actions/setup-node@v4)'

    # Replace with pnpm setup followed by setup-node
    def replacement(match):
        return PNPM_SETUP + match.group(1)

    new_content, count = re.subn(pattern, replacement, content)

    if count > 0:
        file_path.write_text(new_content)
        return True, f"Added pnpm setup ({count} locations)"
    else:
        return False, "No setup-node found"

def main():
    print("🔧 Fixing pnpm setup in workflow files...\n")

    workflow_files = find_workflow_files()
    print(f"Found {len(workflow_files)} workflow files using pnpm\n")

    modified = []
    for file in workflow_files:
        print(f"Processing: {file.name}")
        success, message = fix_workflow_file(file)
        print(f"  {'✓' if success else '•'} {message}")
        if success:
            modified.append(file.name)

    print(f"\n✅ Processed {len(workflow_files)} workflow files")
    print(f"Modified {len(modified)} files:\n")
    for name in modified:
        print(f"  - {name}")

if __name__ == '__main__':
    main()
