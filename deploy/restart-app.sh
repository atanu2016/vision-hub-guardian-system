
#!/bin/bash
# Application restart script for Vision Hub
# Run as the application user with sudo privileges

echo "===== Restarting Vision Hub Application ====="
echo "Started restart at: $(date)"

# Restart using systemctl
echo "Restarting service via systemctl..."
systemctl restart visionhub.service

# Check if restart succeeded
if [ $? -ne 0 ]; then
  echo "ERROR: Failed to restart via systemctl. Trying PM2..."
  
  # Try PM2 as fallback
  cd /opt/visionhub || { echo "Failed to change directory to /opt/visionhub"; exit 1; }
  
  pm2 restart visionhub || pm2 reload all
  
  if [ $? -ne 0 ]; then
    echo "ERROR: Failed to restart via PM2."
    exit 1
  fi
fi

echo "===== Vision Hub restart completed at: $(date) ====="

exit 0
