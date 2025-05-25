
#!/bin/bash
# System service restart script for Vision Hub
# This script performs actual service restart operations

SERVICE_NAME="visionhub.service"
LOG_FILE="/var/log/visionhub-restart.log"

# Function to log with timestamp
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log "===== Starting Vision Hub Service Restart ====="

# Check if running as correct user (should be root or have sudo for systemctl)
if [ "$EUID" -ne 0 ] && ! command -v sudo >/dev/null 2>&1; then
    log "ERROR: This script requires root privileges or sudo access"
    exit 1
fi

# Function to run systemctl with appropriate privileges
run_systemctl() {
    if [ "$EUID" -eq 0 ]; then
        systemctl "$@"
    else
        sudo systemctl "$@"
    fi
}

# Check if service exists
if ! run_systemctl list-unit-files | grep -q "$SERVICE_NAME"; then
    log "WARNING: Service $SERVICE_NAME not found in systemctl"
    log "Attempting to restart using alternative methods..."
    
    # Try to find and restart the process directly
    if pgrep -f "visionhub" >/dev/null; then
        log "Found running visionhub processes, attempting restart..."
        pkill -f "visionhub" && sleep 2
        
        # Try to start from common locations
        for start_script in "/opt/visionhub/start.sh" "/usr/local/bin/visionhub" "./start.sh"; do
            if [ -x "$start_script" ]; then
                log "Starting visionhub using: $start_script"
                nohup "$start_script" >/dev/null 2>&1 &
                sleep 3
                if pgrep -f "visionhub" >/dev/null; then
                    log "VisionHub restarted successfully using $start_script"
                    exit 0
                fi
            fi
        done
        
        log "ERROR: Could not restart visionhub application"
        exit 1
    else
        log "ERROR: No running visionhub processes found and no systemd service"
        exit 1
    fi
fi

# Stop the service
log "Stopping VisionHub service..."
if run_systemctl stop "$SERVICE_NAME"; then
    log "Service stopped successfully"
else
    log "WARNING: Failed to stop service gracefully, continuing..."
fi

# Wait for graceful shutdown
sleep 3

# Check if process is still running
if pgrep -f "visionhub" >/dev/null; then
    log "Process still running, waiting additional time..."
    sleep 5
    
    # Force kill if still running
    if pgrep -f "visionhub" >/dev/null; then
        log "Force stopping remaining processes..."
        pkill -9 -f "visionhub"
        sleep 2
    fi
fi

# Start the service
log "Starting VisionHub service..."
if run_systemctl start "$SERVICE_NAME"; then
    log "Service start command executed"
else
    log "ERROR: Failed to start service"
    exit 1
fi

# Wait and check status
sleep 5

# Verify service is running
if run_systemctl is-active --quiet "$SERVICE_NAME"; then
    log "✓ VisionHub service is running successfully"
    
    # Show service status
    log "Service status:"
    run_systemctl status "$SERVICE_NAME" --no-pager -l | while read line; do
        log "  $line"
    done
    
    log "===== VisionHub restart completed successfully ====="
    exit 0
else
    log "ERROR: Service failed to start properly"
    log "Service status:"
    run_systemctl status "$SERVICE_NAME" --no-pager -l | while read line; do
        log "  $line"
    done
    exit 1
fi
