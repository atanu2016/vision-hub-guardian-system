
#!/bin/bash
# Master deployment script for Vision Hub
# Run as root or with sudo permissions

echo "===== Starting Vision Hub deployment ====="

# Set script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd $SCRIPT_DIR

# Make all scripts executable
chmod +x *.sh

# 1. Install system dependencies
echo "Installing dependencies..."
./install-dependencies.sh

# 2. Create application user
echo "Creating application user..."
useradd -m -s /bin/bash visionhub || true
mkdir -p /opt/visionhub
chown -R visionhub:visionhub /opt/visionhub

# 3. Setup application
echo "Setting up application..."
sudo -u visionhub ./setup-application.sh

# 4. Configure Nginx
echo "Configuring Nginx..."
./nginx-config.sh

# 5. Setup PM2
echo "Setting up PM2..."
sudo -u visionhub ./setup-pm2.sh

# 6. Configure systemd service
echo "Setting up systemd service..."
cp ./visionhub.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable visionhub.service
systemctl start visionhub.service

# 7. Setup automated backups
echo "Setting up automated backups..."
cp ./backup-script.sh /etc/cron.daily/visionhub-backup
chmod +x /etc/cron.daily/visionhub-backup

echo "===== Vision Hub deployment completed ====="
echo "Access your application at http://visionhub.local or http://server-ip"
