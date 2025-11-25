#!/bin/bash

# Test with Monitor - Automatically launches test monitor when tests run
# Usage: bash scripts/test/test-with-monitor.sh [vitest args...]

MONITOR_SCRIPT="$(dirname "$0")/test-monitor.sh"
LOG_FILE="/tmp/test-monitor.log"
PID_FILE="/tmp/test-monitor.pid"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Start test monitor in background
if [ -f "$MONITOR_SCRIPT" ]; then
    echo -e "${CYAN}🧪 Starting test monitor...${NC}"

    # Kill any existing monitor
    if [ -f "$PID_FILE" ]; then
        OLD_PID=$(cat "$PID_FILE")
        kill $OLD_PID 2>/dev/null
        rm -f "$PID_FILE"
    fi

    # Start monitor in background with visible console output
    # The monitor will display a real-time terminal dashboard while tests run
    bash "$MONITOR_SCRIPT" &
    MONITOR_PID=$!

    # Wait for monitor to initialize
    sleep 1

    echo -e "${GREEN}✓${NC} Test monitor started (PID: $MONITOR_PID)"
    echo -e "${GREEN}✓${NC} HTML Dashboard: ${BLUE}file:///tmp/test-monitor.html${NC}"
    echo ""
fi

# Run tests with output logging for monitor
echo -e "${CYAN}🧪 Running tests...${NC}"
echo ""

# Determine test command
if [ $# -eq 0 ]; then
    # Default: run all tests (use vitest directly to avoid recursion)
    pnpm vitest run 2>&1 | tee "$LOG_FILE"
else
    # Custom arguments passed
    pnpm vitest "$@" 2>&1 | tee "$LOG_FILE"
fi

TEST_EXIT_CODE=$?

# Monitor will detect test completion and show final results
echo ""
echo -e "${CYAN}Tests completed. Monitor will show final results.${NC}"
echo -e "${BLUE}View dashboard: file:///tmp/test-monitor.html${NC}"

exit $TEST_EXIT_CODE
