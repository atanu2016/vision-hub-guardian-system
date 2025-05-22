
#!/bin/bash
# Application update script for Vision Hub
# Run as the application user

APP_DIR="/opt/visionhub"

echo "===== Updating Vision Hub Application ====="
echo "Started update at: $(date)"

# Navigate to application directory
cd $APP_DIR || { echo "Failed to change directory to $APP_DIR"; exit 1; }

# Pull latest changes using git
echo "Pulling latest changes from repository..."
git pull

# If git pull failed (possibly due to local changes), offer options
if [ $? -ne 0 ]; then
  echo "Git pull failed. This may be due to local changes."
  echo "Forcing pull and discarding local changes..."
  git fetch --all
  git reset --hard origin/main
  
  # Check if the forced pull succeeded
  if [ $? -ne 0 ]; then
    echo "ERROR: Force pull failed. Manual intervention required."
    exit 1
  fi
fi

# Install dependencies
echo "Installing dependencies..."
npm install --prefer-offline --no-audit

# Check if npm install succeeded
if [ $? -ne 0 ]; then
  echo "ERROR: Failed to install dependencies."
  exit 1
fi

# Build application
echo "Building application..."
npm run build

# Check if build succeeded
if [ $? -ne 0 ]; then
  echo "ERROR: Application build failed."
  exit 1
fi

# Update complete
echo "===== Vision Hub update completed successfully at: $(date) ====="
echo "To restart the application, use 'systemctl restart visionhub.service'"

exit 0
