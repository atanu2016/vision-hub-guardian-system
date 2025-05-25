
#!/bin/bash
# Auto-update script for Vision Hub
# This script performs automatic updates when changes are detected

REPO_DIR="/opt/visionhub"
LOG_FILE="/var/log/visionhub-auto-update.log"
LOCK_FILE="/tmp/visionhub-update.lock"

# Function to log with timestamp
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Check if another update is in progress
if [ -f "$LOCK_FILE" ]; then
    log "Update already in progress, skipping..."
    exit 0
fi

# Create lock file
touch "$LOCK_FILE"

# Cleanup function
cleanup() {
    rm -f "$LOCK_FILE"
}
trap cleanup EXIT

log "===== Starting Auto-Update Process ====="

# Check for updates first
UPDATE_CHECK_RESULT=$(/opt/visionhub/deploy/check-updates.sh)
UPDATES_AVAILABLE=$(echo "$UPDATE_CHECK_RESULT" | jq -r '.updatesAvailable // false')

if [ "$UPDATES_AVAILABLE" != "true" ]; then
    log "No updates available, exiting"
    exit 0
fi

log "Updates detected, proceeding with auto-update..."

# Run the update script
if /opt/visionhub/deploy/update-app.sh; then
    log "Auto-update completed successfully"
    
    # Restart the service
    log "Restarting VisionHub service..."
    if systemctl restart visionhub.service; then
        log "Service restarted successfully"
        
        # Send notification (if notification system is available)
        if command -v curl >/dev/null 2>&1; then
            curl -X POST "http://localhost:3000/api/notifications" \
                -H "Content-Type: application/json" \
                -d '{"type":"info","message":"System auto-updated successfully","timestamp":"'$(date -Iseconds)'"}' \
                >/dev/null 2>&1 || true
        fi
    else
        log "ERROR: Failed to restart service after update"
        exit 1
    fi
else
    log "ERROR: Auto-update failed"
    exit 1
fi

log "===== Auto-update process completed ====="
