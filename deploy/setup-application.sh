
#!/bin/bash
# Application setup script for Vision Hub
# Run as the application user

VISION_HUB_DIR="/opt/visionhub"
GITHUB_REPO="https://github.com/yourusername/vision-hub.git"  # Replace with your actual GitHub repo URL

echo "===== Setting up Vision Hub Application ====="

# Create application directory if it doesn't exist
mkdir -p $VISION_HUB_DIR
cd $VISION_HUB_DIR

# Clone application from GitHub
echo "Cloning application from GitHub repository..."
if [ -d ".git" ]; then
  echo "Git repository already exists. Pulling latest changes..."
  git pull
else
  echo "Cloning fresh repository..."
  git clone $GITHUB_REPO .
  if [ $? -ne 0 ]; then
    echo "Failed to clone repository. Please check the repository URL and your internet connection."
    echo "You can manually copy the application files to $VISION_HUB_DIR and press Enter to continue."
    read -p ""
  fi
fi

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
