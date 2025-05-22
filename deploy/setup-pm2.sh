
#!/bin/bash
# Configure PM2 for Vision Hub
# Run as application user

APP_DIR="/opt/visionhub"
APP_NAME="visionhub"

echo "===== Setting up PM2 for Vision Hub ====="

# Navigate to application directory
cd $APP_DIR

# Create PM2 ecosystem file with .cjs extension to ensure CommonJS compatibility
cat > ecosystem.config.cjs << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'dist/main.js',
    instances: 1,
    exec_mode: 'fork',
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
pm2 start ecosystem.config.cjs

# Save PM2 configuration to start on system boot
pm2 save

echo "To make PM2 start on boot, run the following command:"
echo "pm2 startup systemd -u visionhub --hp /home/visionhub"

echo "===== PM2 setup completed ====="
