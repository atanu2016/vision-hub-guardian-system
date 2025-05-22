
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

# 2. Create application user
echo "Creating application user..."
useradd -m -s /bin/bash visionhub || true
mkdir -p /opt/visionhub
chown -R visionhub:visionhub /opt/visionhub

# 3. Setup application
echo "Setting up application..."
sudo -u visionhub ./setup-application.sh || handle_error "Failed to setup application"

# 4. Configure Nginx
echo "Configuring Nginx..."
./nginx-config.sh || handle_error "Failed to configure Nginx"

# 5. Setup PM2
echo "Setting up PM2..."
sudo -u visionhub ./setup-pm2.sh || handle_error "Failed to setup PM2"

# 6. Configure systemd service
echo "Setting up systemd service..."
cp ./visionhub.service /etc/systemd/system/ || handle_error "Failed to copy systemd service file"
systemctl daemon-reload
systemctl enable visionhub.service
systemctl start visionhub.service || echo "Warning: Service failed to start. Check logs with 'journalctl -u visionhub.service'"

# 7. Setup automated backups
echo "Setting up automated backups..."
cp ./backup-script.sh /etc/cron.daily/visionhub-backup
chmod +x /etc/cron.daily/visionhub-backup

# 8. Setup health check script
echo "Setting up health check cron job..."
cp ./healthcheck.sh /opt/visionhub/
chmod +x /opt/visionhub/healthcheck.sh
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/visionhub/healthcheck.sh") | crontab -

echo "===== Vision Hub deployment completed ====="
echo "Access your application at http://visionhub.local or http://server-ip"
echo ""
echo "To check service status run: systemctl status visionhub.service"
echo "To check application logs run: journalctl -u visionhub.service"
echo "To check PM2 logs run: sudo -u visionhub pm2 logs"
