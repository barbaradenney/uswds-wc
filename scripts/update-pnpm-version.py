#!/usr/bin/env python3
"""
Script to update pnpm version from 8 to 10 in all workflow files
"""

import os
import re
from pathlib import Path

def find_workflow_files():
    """Find all workflow files that use pnpm/action-setup"""
    workflows_dir = Path('.github/workflows')
    files = []
    for file in workflows_dir.glob('*.yml'):
        content = file.read_text()
        if 'pnpm/action-setup' in content:
            files.append(file)
    return files

def update_pnpm_version(file_path):
    """Update pnpm version from 8 to 10"""
    content = file_path.read_text()
    original_content = content

    # Pattern to find pnpm setup with version: 8
    pattern = r'(uses: pnpm/action-setup@v2\s+with:\s+version:)\s*8'

    # Replace version 8 with version 10
    new_content = re.sub(pattern, r'\1 10', content)

    if new_content != original_content:
        file_path.write_text(new_content)
        # Count occurrences
        count = len(re.findall(pattern, content))
        return True, f"Updated pnpm version 8 → 10 ({count} locations)"
    else:
        return False, "No version 8 found (already updated or different version)"

def main():
    print("🔧 Updating pnpm version in workflow files...\n")

    workflow_files = find_workflow_files()
    print(f"Found {len(workflow_files)} workflow files using pnpm/action-setup\n")

    modified = []
    for file in workflow_files:
        print(f"Processing: {file.name}")
        success, message = update_pnpm_version(file)
        print(f"  {'✓' if success else '•'} {message}")
        if success:
            modified.append(file.name)

    print(f"\n✅ Processed {len(workflow_files)} workflow files")
    if modified:
        print(f"Modified {len(modified)} files:\n")
        for name in modified:
            print(f"  - {name}")
    else:
        print("No files needed updates")

if __name__ == '__main__':
    main()
