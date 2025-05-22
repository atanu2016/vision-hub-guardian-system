
#!/bin/bash
# Application update script for Vision Hub
# Run as the application user

APP_DIR="/opt/visionhub"

echo "===== Updating Vision Hub Application ====="

# Navigate to application directory
cd $APP_DIR

# Pull latest changes using git
echo "Pulling latest changes from repository..."
git pull

# If git pull failed (possibly due to local changes), offer options
if [ $? -ne 0 ]; then
  echo "Git pull failed. This may be due to local changes."
  echo "Options:"
  echo "  1. Force pull (will discard local changes)"
  echo "  2. Continue without updating code"
  read -p "Select option (1-2): " option
  
  case $option in
    1)
      echo "Forcing pull and discarding local changes..."
      git fetch --all
      git reset --hard origin/main
      ;;
    *)
      echo "Continuing without code update."
      ;;
  esac
fi

# Install dependencies
npm install

# Build application
npm run build

# Restart using PM2
pm2 reload visionhub || pm2 restart visionhub

echo "===== Vision Hub update completed ====="
