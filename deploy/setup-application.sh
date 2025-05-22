
#!/bin/bash
# Application setup script for Vision Hub
# Run as the application user

VISION_HUB_DIR="/opt/visionhub"

echo "===== Setting up Vision Hub Application ====="

# Create application directory if it doesn't exist
mkdir -p $VISION_HUB_DIR
cd $VISION_HUB_DIR

# Clone or copy application (assuming Git repository)
# git clone https://your-repo-url.git .
# OR copy the application files
echo "Copy your application files to $VISION_HUB_DIR"
echo "Press Enter after copying the files..."
read -p ""

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
# Vision Hub Environment Configuration
NODE_ENV=production
PORT=8080

# Database connection
DATABASE_URL=postgres://visionadmin:SecurePassword123@localhost:5432/visionhub

# Application settings
APP_URL=http://localhost
APP_SECRET=$(openssl rand -hex 32)

# Storage settings
STORAGE_TYPE=local
STORAGE_PATH=/var/lib/visionhub/recordings

# Logging
LOG_LEVEL=info
EOF

echo "Building application..."
# Use the correct build script as defined in package.json
npm run build

# Create server.js entry point to ensure backward compatibility
cat > server.js << EOF
// Server entry point
// This file exists to maintain compatibility with deployment scripts
// It simply requires the built application
require('./dist/main');
EOF

# Apply database migrations
echo "Setting up database schema..."
npx supabase db start
npx supabase db push

# Create storage directories
mkdir -p /var/lib/visionhub/recordings
chmod 755 /var/lib/visionhub/recordings

echo "===== Application setup completed ====="
