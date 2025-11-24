#!/usr/bin/env python3
"""
Script to fix all pnpm workflow issues:
1. Change pnpm/action-setup@v4 to pnpm/action-setup@v2
2. Change version: 9 to version: 10 (when used with pnpm action)
"""

import re
from pathlib import Path

def fix_workflow_file(file_path):
    """Fix pnpm configuration in a workflow file"""
    content = file_path.read_text()
    original_content = content
    changes = []

    # Fix 1: Change @v4 to @v2
    pattern1 = r'pnpm/action-setup@v4'
    if re.search(pattern1, content):
        content = re.sub(pattern1, 'pnpm/action-setup@v2', content)
        count = len(re.findall(pattern1, original_content))
        changes.append(f"Updated action version v4 → v2 ({count} occurrences)")

    # Fix 2: Change version: 9 to version: 10 (in pnpm action context)
    # Look for pnpm action setup followed by version: 9
    pattern2 = r'(pnpm/action-setup@v\d+\s+with:\s+version:)\s*9'
    if re.search(pattern2, content):
        content = re.sub(pattern2, r'\1 10', content)
        count = len(re.findall(pattern2, original_content))
        changes.append(f"Updated pnpm version 9 → 10 ({count} occurrences)")

    if content != original_content:
        file_path.write_text(content)
        return True, changes
    else:
        return False, []

def main():
    print("🔧 Fixing pnpm configuration in all workflow files...\n")

    workflows_dir = Path('.github/workflows')
    workflow_files = list(workflows_dir.glob('*.yml'))

    print(f"Found {len(workflow_files)} workflow files\n")

    modified = []
    for file in sorted(workflow_files):
        success, changes = fix_workflow_file(file)
        if success:
            print(f"✓ {file.name}")
            for change in changes:
                print(f"  - {change}")
            modified.append(file.name)
        else:
            print(f"• {file.name} - no changes needed")

    print(f"\n{'='*80}")
    print(f"✅ Processed {len(workflow_files)} workflow files")
    if modified:
        print(f"📝 Modified {len(modified)} files")
    else:
        print("📝 No files needed modifications")

if __name__ == '__main__':
    main()
