
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

# Create and set ownership of application directory
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

# Try to start the service, but don't fail the whole deployment if it doesn't work
echo "Starting visionhub service..."
if ! systemctl restart visionhub.service; then
  echo "WARNING: Service failed to start. Will try manual PM2 setup."
  
  # Try to run the ES module fix script
  echo "Attempting to fix ES module issues..."
  sudo -u visionhub $SCRIPT_DIR/fix-esm-issues.sh
  
  # Try direct PM2 setup as fallback
  cd /opt/visionhub
  sudo -u visionhub pm2 delete all || true
  sudo -u visionhub npm install ws utf-8-validate bufferutil --no-save || true
  sudo -u visionhub pm2 start ecosystem.config.cjs || {
    echo "WARNING: PM2 direct start failed. Check logs for details."
    echo "You may need to run: cd /opt/visionhub && sudo -u visionhub pm2 start ecosystem.config.cjs"
  }
fi

# Check if service started correctly
sleep 5
if ! systemctl is-active --quiet visionhub.service; then
  echo "WARNING: Service failed to start. Check logs with 'journalctl -u visionhub.service'"
  journalctl -u visionhub.service --no-pager -n 50
else
  echo "Service started successfully."
fi

# 7. Setup automated backups
echo "Setting up automated backups..."

# Create backup script if it doesn't exist
cat > /etc/cron.daily/visionhub-backup << EOF
#!/bin/bash
# Database backup script for Vision Hub
# Add to crontab for automated backups

BACKUP_DIR="/var/backups/visionhub"
DB_NAME="visionhub"
DB_USER="visionadmin"
TIMESTAMP=\$(date +"%Y%m%d-%H%M%S")
BACKUP_FILE="\${BACKUP_DIR}/visionhub-backup-\${TIMESTAMP}.sql"

# Create backup directory if it doesn't exist
mkdir -p \$BACKUP_DIR

# Perform database backup
echo "Creating database backup: \$BACKUP_FILE"
PGPASSWORD=SecurePassword123 pg_dump -U \$DB_USER \$DB_NAME > \$BACKUP_FILE

# Compress the backup
gzip \$BACKUP_FILE

# Remove backups older than 30 days
find \$BACKUP_DIR -type f -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: \${BACKUP_FILE}.gz"
EOF

chmod +x /etc/cron.daily/visionhub-backup

# 8. Setup health check script
echo "Setting up health check cron job..."

# Copy health check script to application directory
cp ./healthcheck.sh /opt/visionhub/healthcheck.sh
chmod +x /opt/visionhub/healthcheck.sh
chown visionhub:visionhub /opt/visionhub/healthcheck.sh

# Add to crontab if not already there
if ! crontab -l | grep -q "healthcheck.sh"; then
  (crontab -l 2>/dev/null; echo "*/5 * * * * /opt/visionhub/healthcheck.sh") | crontab -
fi

echo "===== Vision Hub deployment completed ====="
echo "Access your application at http://visionhub.local or http://server-ip"
echo ""
echo "To check service status run: systemctl status visionhub.service"
echo "To check application logs run: journalctl -u visionhub.service"
echo "To check PM2 logs run: sudo -u visionhub pm2 logs"
echo "Application logs are also available at: /var/log/visionhub/"
