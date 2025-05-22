
#!/bin/bash
# Configure PM2 for Vision Hub
# Run as application user

APP_DIR="/opt/visionhub"
APP_NAME="visionhub"

echo "===== Setting up PM2 for Vision Hub ====="

# Navigate to application directory
cd $APP_DIR

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'dist/main.js',  # Changed from server.js to main.js to match Vite output
    instances: 'max',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    }
  }]
};
EOF

# Start the application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration to start on system boot
pm2 save

echo "To make PM2 start on boot, run the following command:"
pm2 startup

echo "===== PM2 setup completed ====="
