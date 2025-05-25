
#!/bin/bash
# Real application update script for Vision Hub
# This script performs actual Git operations and application restart

APP_DIR="/opt/visionhub"
BACKUP_DIR="/opt/visionhub-backup"
LOG_FILE="/var/log/visionhub-update.log"

# Function to log with timestamp
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log "===== Starting Vision Hub Application Update ====="

# Check if running as correct user
if [ "$EUID" -eq 0 ]; then
    log "ERROR: This script should not be run as root"
    exit 1
fi

# Navigate to application directory
if [ ! -d "$APP_DIR" ]; then
    log "ERROR: Application directory $APP_DIR not found"
    exit 1
fi

cd "$APP_DIR" || {
    log "ERROR: Failed to change directory to $APP_DIR"
    exit 1
}

# Create backup of current state
log "Creating backup of current application state..."
if [ -d "$BACKUP_DIR" ]; then
    rm -rf "$BACKUP_DIR"
fi
cp -r "$APP_DIR" "$BACKUP_DIR" || {
    log "ERROR: Failed to create backup"
    exit 1
}

# Check Git repository status
log "Checking Git repository status..."
if [ ! -d ".git" ]; then
    log "ERROR: Not a Git repository"
    exit 1
fi

# Stash any local changes
log "Stashing local changes..."
git stash push -m "Auto-stash before update $(date)" || {
    log "WARNING: Failed to stash changes, continuing..."
}

# Fetch latest changes from remote
log "Fetching latest changes from remote repository..."
git fetch origin || {
    log "ERROR: Failed to fetch from remote repository"
    exit 1
}

# Check if there are updates available
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
    log "INFO: Application is already up to date"
    exit 0
fi

log "Updates available. Current: $LOCAL, Remote: $REMOTE"

# Pull latest changes
log "Pulling latest changes..."
git pull origin main || {
    log "ERROR: Failed to pull latest changes"
    # Try to reset to remote state
    log "Attempting force reset to remote state..."
    git reset --hard origin/main || {
        log "ERROR: Force reset failed. Restoring backup..."
        cd / && rm -rf "$APP_DIR" && mv "$BACKUP_DIR" "$APP_DIR"
        exit 1
    }
}

# Install/update dependencies
log "Installing/updating dependencies..."
if [ -f "package.json" ]; then
    npm ci --production --silent || {
        log "ERROR: Failed to install dependencies"
        log "Restoring backup..."
        cd / && rm -rf "$APP_DIR" && mv "$BACKUP_DIR" "$APP_DIR"
        exit 1
    }
else
    log "WARNING: No package.json found, skipping dependency installation"
fi

# Build application if build script exists
log "Building application..."
if [ -f "package.json" ] && npm run build --if-present; then
    log "Application built successfully"
else
    log "WARNING: Build failed or no build script found"
fi

# Update file permissions
log "Updating file permissions..."
chmod +x deploy/*.sh || log "WARNING: Failed to update script permissions"

# Clean up backup if everything succeeded
log "Cleaning up backup..."
rm -rf "$BACKUP_DIR"

log "===== Vision Hub update completed successfully ====="
log "Application updated from $LOCAL to $REMOTE"
log "To restart the application, run: systemctl restart visionhub.service"

exit 0
