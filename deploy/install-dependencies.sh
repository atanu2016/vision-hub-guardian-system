
#!/bin/bash
# Install dependencies script for Vision Hub application
# Run as root or with sudo permissions

echo "===== Installing Vision Hub Dependencies ====="

# Update system packages
apt update && apt upgrade -y

# Install Node.js 18 (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Check Node.js and NPM versions
echo "Node.js version: $(node -v)"
echo "NPM version: $(npm -v)"

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL service
systemctl start postgresql
systemctl enable postgresql

echo "Setting up PostgreSQL..."
sudo -u postgres psql -c "CREATE DATABASE visionhub;"
sudo -u postgres psql -c "CREATE USER visionadmin WITH ENCRYPTED PASSWORD 'SecurePassword123';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE visionhub TO visionadmin;"

# Install Nginx
apt install -y nginx

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx

# Install PM2 globally
npm install -g pm2

# Install additional required packages
apt install -y git unzip build-essential certbot python3-certbot-nginx

echo "===== Dependencies installation completed ====="
