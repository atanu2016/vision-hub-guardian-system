
#!/bin/bash
# Real update checking script for Vision Hub
# This script checks GitHub for new commits and returns update status

REPO_DIR="/opt/visionhub"
LOG_FILE="/var/log/visionhub-update-check.log"

# Function to log with timestamp
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log "===== Checking for Vision Hub Updates ====="

# Check if we're in a git repository
if [ ! -d "$REPO_DIR/.git" ]; then
    log "ERROR: Not a Git repository: $REPO_DIR"
    echo '{"updatesAvailable": false, "error": "Not a Git repository"}'
    exit 1
fi

cd "$REPO_DIR" || {
    log "ERROR: Failed to change directory to $REPO_DIR"
    echo '{"updatesAvailable": false, "error": "Cannot access repository directory"}'
    exit 1
}

# Fetch latest changes from remote (without merging)
log "Fetching latest changes from remote repository..."
if ! git fetch origin 2>>"$LOG_FILE"; then
    log "WARNING: Failed to fetch from remote repository"
    echo '{"updatesAvailable": false, "error": "Failed to fetch from remote"}'
    exit 1
fi

# Get current commit hash
LOCAL_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse origin/main)

log "Local commit: $LOCAL_COMMIT"
log "Remote commit: $REMOTE_COMMIT"

# Check if updates are available
if [ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]; then
    # Count changes
    CHANGES_COUNT=$(git rev-list --count "$LOCAL_COMMIT".."$REMOTE_COMMIT")
    
    # Get list of changed files
    CHANGED_FILES=$(git diff --name-only "$LOCAL_COMMIT".."$REMOTE_COMMIT" | head -10)
    
    # Get commit messages
    COMMIT_MESSAGES=$(git log --oneline "$LOCAL_COMMIT".."$REMOTE_COMMIT" | head -5)
    
    log "Updates available: $CHANGES_COUNT changes found"
    log "Changed files: $CHANGED_FILES"
    
    # Return JSON response
    cat << EOF
{
    "updatesAvailable": true,
    "changesCount": $CHANGES_COUNT,
    "localCommit": "$LOCAL_COMMIT",
    "remoteCommit": "$REMOTE_COMMIT",
    "changedFiles": $(echo "$CHANGED_FILES" | jq -R -s -c 'split("\n")[:-1]'),
    "recentCommits": $(echo "$COMMIT_MESSAGES" | jq -R -s -c 'split("\n")[:-1]')
}
EOF
else
    log "No updates available - system is up to date"
    echo '{"updatesAvailable": false, "message": "System is up to date"}'
fi

log "===== Update check completed ====="
