#!/bin/bash

# Test Monitor - Real-time terminal dashboard for test progress
# Usage: bash scripts/test/test-monitor.sh

LOG_FILE="/tmp/test-monitor.log"
HTML_FILE="/tmp/test-monitor.html"
PID_FILE="/tmp/test-monitor.pid"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Function to check if tests are running
check_tests_running() {
    pgrep -f "vitest run" > /dev/null
    return $?
}

# Function to get test progress
get_test_progress() {
    if [ -f "$LOG_FILE" ]; then
        # Extract test counts
        TOTAL=$(grep -o "[0-9]* tests" "$LOG_FILE" | tail -1 | grep -o "[0-9]*" | head -1)
        PASSED=$(grep "✓" "$LOG_FILE" | wc -l | tr -d ' ')
        FAILED=$(grep "✗" "$LOG_FILE" | wc -l | tr -d ' ')

        # Get current test file
        CURRENT=$(grep "stdout |" "$LOG_FILE" | tail -1 | sed 's/.*stdout | //')

        echo "$PASSED:$FAILED:$TOTAL:$CURRENT"
    else
        echo "0:0:0:Starting..."
    fi
}

# Function to update HTML dashboard
update_html_dashboard() {
    local passed=$1
    local failed=$2
    local total=$3
    local current=$4
    local percent=0

    if [ "$total" -gt 0 ]; then
        percent=$(( (passed * 100) / total ))
    fi

    cat > "$HTML_FILE" << EOF
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="2">
    <title>Test Monitor - USWDS Web Components</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            text-align: center;
        }
        .subtitle {
            text-align: center;
            opacity: 0.9;
            margin-bottom: 40px;
            font-size: 1.1em;
        }
        .status {
            background: rgba(255, 255, 255, 0.15);
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
        }
        .progress-bar {
            width: 100%;
            height: 40px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 20px;
            overflow: hidden;
            margin: 20px 0;
            position: relative;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #4ade80 0%, #22c55e 100%);
            transition: width 0.5s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 1.1em;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin: 30px 0;
        }
        .stat-card {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 20px;
            text-align: center;
        }
        .stat-value {
            font-size: 3em;
            font-weight: bold;
            margin: 10px 0;
        }
        .stat-label {
            font-size: 0.9em;
            opacity: 0.8;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .passed { color: #4ade80; }
        .failed { color: #f87171; }
        .total { color: #60a5fa; }
        .current-test {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
            padding: 20px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            word-break: break-all;
            margin-top: 20px;
        }
        .spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255,255,255,.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .timestamp {
            text-align: center;
            opacity: 0.6;
            margin-top: 20px;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 Test Monitor</h1>
        <p class="subtitle">USWDS Web Components Test Suite</p>

        <div class="status">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percent}%;">
                    ${percent}%
                </div>
            </div>

            <div class="stats">
                <div class="stat-card">
                    <div class="stat-label">Passed</div>
                    <div class="stat-value passed">$passed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Failed</div>
                    <div class="stat-value failed">$failed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Total</div>
                    <div class="stat-value total">$total</div>
                </div>
            </div>

            <div style="text-align: center; margin: 20px 0;">
                <span class="spinner"></span>
                <span style="margin-left: 10px;">Tests running...</span>
            </div>

            <div class="current-test">
                <strong>Current:</strong><br>
                $current
            </div>
        </div>

        <div class="timestamp">
            Last updated: $(date '+%Y-%m-%d %H:%M:%S')
        </div>
    </div>
</body>
</html>
EOF
}

# Function to display terminal dashboard
display_terminal_dashboard() {
    local passed=$1
    local failed=$2
    local total=$3
    local current=$4

    clear
    echo -e "${BOLD}${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${CYAN}║${NC}              ${BOLD}🧪 USWDS Web Components Test Monitor${NC}           ${BOLD}${CYAN}║${NC}"
    echo -e "${BOLD}${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BOLD}Test Progress:${NC}"
    echo ""

    # Progress bar
    local percent=0
    if [ "$total" -gt 0 ]; then
        percent=$(( (passed * 100) / total ))
    fi

    local bar_length=50
    local filled=$(( (percent * bar_length) / 100 ))
    local empty=$(( bar_length - filled ))

    echo -ne "  ["
    for ((i=0; i<filled; i++)); do echo -ne "${GREEN}█${NC}"; done
    for ((i=0; i<empty; i++)); do echo -ne "░"; done
    echo -e "] ${BOLD}${percent}%${NC}"
    echo ""

    # Stats
    echo -e "${GREEN}✓ Passed:${NC}  ${BOLD}$passed${NC}"
    echo -e "${RED}✗ Failed:${NC}  ${BOLD}$failed${NC}"
    echo -e "${BLUE}📊 Total:${NC}   ${BOLD}$total${NC}"
    echo ""

    echo -e "${YELLOW}Current Test:${NC}"
    echo -e "  ${current}"
    echo ""

    echo -e "${CYAN}Press Ctrl+C to exit${NC}"
    echo ""
    echo -e "Dashboard: ${BLUE}file://$HTML_FILE${NC}"
}

# Main monitoring loop
main() {
    echo "Starting test monitor..."
    echo "$$" > "$PID_FILE"

    # Create initial HTML dashboard
    update_html_dashboard 0 0 0 "Initializing..."
    echo ""
    echo -e "${GREEN}✓${NC} HTML Dashboard created: ${BLUE}file://$HTML_FILE${NC}"
    echo -e "${GREEN}✓${NC} Open in browser to see real-time progress"
    echo ""

    # Start monitoring
    while true; do
        if check_tests_running; then
            # Get progress
            IFS=':' read -r passed failed total current <<< "$(get_test_progress)"

            # Update displays
            update_html_dashboard "$passed" "$failed" "$total" "$current"
            display_terminal_dashboard "$passed" "$failed" "$total" "$current"

            sleep 2
        else
            # Tests finished or not running
            IFS=':' read -r passed failed total current <<< "$(get_test_progress)"

            clear
            echo -e "${BOLD}${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
            echo -e "${BOLD}${GREEN}║${NC}                  ${BOLD}Tests Completed!${NC}                        ${BOLD}${GREEN}║${NC}"
            echo -e "${BOLD}${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
            echo ""
            echo -e "${GREEN}✓ Passed:${NC}  ${BOLD}$passed${NC}"
            echo -e "${RED}✗ Failed:${NC}  ${BOLD}$failed${NC}"
            echo -e "${BLUE}📊 Total:${NC}   ${BOLD}$total${NC}"
            echo ""

            # Create final HTML
            cat > "$HTML_FILE" << EOF
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Test Monitor - Complete</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 40px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            max-width: 600px;
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 60px 40px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        h1 { font-size: 3em; margin-bottom: 20px; }
        .checkmark {
            font-size: 5em;
            animation: scaleIn 0.5s ease-out;
        }
        @keyframes scaleIn {
            from { transform: scale(0); }
            to { transform: scale(1); }
        }
        .stats {
            display: flex;
            justify-content: center;
            gap: 40px;
            margin: 40px 0;
        }
        .stat { font-size: 1.5em; }
        .stat-value { font-size: 2em; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="checkmark">✅</div>
        <h1>Tests Complete!</h1>
        <div class="stats">
            <div class="stat">
                <div>Passed</div>
                <div class="stat-value">$passed</div>
            </div>
            <div class="stat">
                <div>Failed</div>
                <div class="stat-value">$failed</div>
            </div>
            <div class="stat">
                <div>Total</div>
                <div class="stat-value">$total</div>
            </div>
        </div>
        <p>Completed at $(date '+%Y-%m-%d %H:%M:%S')</p>
    </div>
</body>
</html>
EOF

            break
        fi
    done

    rm -f "$PID_FILE"
}

# Cleanup on exit
trap "rm -f $PID_FILE; clear; echo 'Monitor stopped.'; exit" INT TERM

# Run main
main
