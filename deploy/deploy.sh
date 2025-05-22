
#!/bin/bash
# Master deployment script for Vision Hub
# Run as root or with sudo permissions

echo "===== Starting Vision Hub deployment ====="

# Set script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd $SCRIPT_DIR

# Make all scripts executable
chmod +x *.sh

# Function to handle errors
handle_error() {
  echo "ERROR: $1"
  echo "Deployment failed. See logs above for details."
  exit 1
}

# 1. Install system dependencies
echo "Installing dependencies..."
./install-dependencies.sh || handle_error "Failed to install dependencies"

# 2. Create application user and directories
echo "Creating application user and directories..."
useradd -m -s /bin/bash visionhub || true

# Create storage and log directories with correct permissions first
echo "Creating storage and log directories..."
mkdir -p /var/lib/visionhub/recordings
mkdir -p /var/log/visionhub
chown -R visionhub:visionhub /var/lib/visionhub
chown -R visionhub:visionhub /var/log/visionhub
chmod 755 /var/lib/visionhub/recordings
chmod 755 /var/log/visionhub

# Create PM2 home directory with correct permissions
mkdir -p /home/visionhub/.pm2
chown -R visionhub:visionhub /home/visionhub/.pm2

# Create and set ownership of application directory
mkdir -p /opt/visionhub
chown -R visionhub:visionhub /opt/visionhub

# 3. Setup application
echo "Setting up application..."
sudo -u visionhub ./setup-application.sh || handle_error "Failed to setup application"

# 4. Configure Nginx
echo "Configuring Nginx..."
./nginx-config.sh || handle_error "Failed to configure Nginx"

# 5. Fix ESM issues first if present (important to do this before PM2 setup)
echo "Checking for ES Module issues and fixing them..."
sudo -u visionhub ./fix-esm-issues.sh || echo "Warning: ESM fixes may not have completed successfully"

# 6. Setup PM2
echo "Setting up PM2..."
sudo -u visionhub ./setup-pm2.sh || handle_error "Failed to setup PM2"

# 7. Configure systemd service
echo "Setting up systemd service..."
cp ./visionhub.service /etc/systemd/system/ || handle_error "Failed to copy systemd service file"
systemctl daemon-reload
systemctl enable visionhub.service

# Try to start the service, but don't fail the whole deployment if it doesn't work
echo "Starting visionhub service..."
if ! systemctl restart visionhub.service; then
  echo "WARNING: Service failed to start. Will try manual PM2 setup."
  
  # Try direct PM2 setup as fallback
  cd /opt/visionhub
  sudo -u visionhub pm2 delete all || true
  sudo -u visionhub npm install ws utf-8-validate bufferutil --no-save || true
  sudo -u visionhub pm2 start ecosystem.config.cjs || {
    echo "WARNING: PM2 direct start failed. Check logs for details."
    echo "You may need to run: cd /opt/visionhub && sudo -u visionhub pm2 start ecosystem.config.cjs"
  }
  
  # Setup PM2 startup script
  pm2_startup=$(sudo -u visionhub pm2 startup systemd -u visionhub --hp /home/visionhub | grep "sudo" | tail -n 1)
  if [ -n "$pm2_startup" ]; then
    echo "Running PM2 startup command: $pm2_startup"
    eval $pm2_startup
    sudo -u visionhub pm2 save
  fi
fi

# Check if service started correctly
sleep 5
if ! systemctl is-active --quiet visionhub.service; then
  echo "WARNING: Service failed to start. Check logs with 'journalctl -u visionhub.service'"
  journalctl -u visionhub.service --no-pager -n 20
else
  echo "Service started successfully."
fi

# 8. Setup automated backups
echo "Setting up automated backups..."
# Keep existing code

# 9. Setup health check script
echo "Setting up health check cron job..."
# Keep existing code

echo "===== Vision Hub deployment completed ====="
echo "Access your application at http://visionhub.local or http://server-ip"
echo ""
echo "To check service status run: systemctl status visionhub.service"
echo "To restart the service run: systemctl restart visionhub.service"
echo "To check application logs run: journalctl -u visionhub.service"
echo "To check PM2 logs run: sudo -u visionhub pm2 logs"
echo "Application logs are also available at: /var/log/visionhub/"
echo ""
echo "If service does not start, try running these manual commands:"
echo "sudo -u visionhub bash -c 'cd /opt/visionhub && pm2 start ecosystem.config.cjs && pm2 save'"
echo "sudo $(sudo -u visionhub pm2 startup systemd -u visionhub --hp /home/visionhub | grep 'sudo' | tail -n 1)"
