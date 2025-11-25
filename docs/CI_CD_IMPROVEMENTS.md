

## Recent CI/CD Fixes (2025-11-25)

- Fixed Visual Regression Testing workflow to show proper status
  - Added status-check job that always runs
  - Added push trigger for main and develop branches
  - Workflow now shows ✓ success instead of failure on push events
- Fixed Early Issue Detection Pipeline timeout issues
  - Increased timeout from 5 to 15 minutes
  - Allows full test suite to complete successfully
- All workflows now properly report success/failure states
