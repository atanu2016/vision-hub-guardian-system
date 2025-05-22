
#!/bin/bash
# Application update script for Vision Hub
# Run as the application user

APP_DIR="/opt/visionhub"

echo "===== Updating Vision Hub Application ====="

# Navigate to application directory
cd $APP_DIR

# Pull latest changes if using git
# git pull

# Install dependencies
npm install

# Build application
npm run build

# Restart using PM2
pm2 restart visionhub

echo "===== Vision Hub update completed ====="
