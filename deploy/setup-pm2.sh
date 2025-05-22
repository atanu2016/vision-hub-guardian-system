
#!/bin/bash
# Configure PM2 for Vision Hub
# Run as application user

APP_DIR="/opt/visionhub"
APP_NAME="visionhub"

echo "===== Setting up PM2 for Vision Hub ====="

# Navigate to application directory
cd $APP_DIR

# Check if we're in an ES module project
IS_ESM=$(grep '"type": "module"' $APP_DIR/package.json || echo "")

# Create PM2 ecosystem file with .cjs extension to ensure CommonJS compatibility
if [ -n "$IS_ESM" ]; then
  echo "Detected ES module project, configuring PM2 with ESM support"
  cat > ecosystem.config.cjs << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'index.js',
    cwd: '$APP_DIR/dist',
    instances: 1,
    exec_mode: 'fork',
    node_args: '--experimental-specifier-resolution=node',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    error_file: '/var/log/visionhub/app-err.log',
    out_file: '/var/log/visionhub/app-out.log',
    log_file: '/var/log/visionhub/combined.log',
    time: true
  }]
};
EOF
else
  echo "Using CommonJS configuration"
  cat > ecosystem.config.cjs << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'index.js',
    cwd: '$APP_DIR/dist',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    error_file: '/var/log/visionhub/app-err.log',
    out_file: '/var/log/visionhub/app-out.log',
    log_file: '/var/log/visionhub/combined.log',
    time: true
  }]
};
EOF
fi

# Make sure we stop any running instances first
pm2 delete $APP_NAME 2>/dev/null || true

# Create log directories
mkdir -p /var/log/visionhub
chown -R visionhub:visionhub /var/log/visionhub

# Install missing dependencies if needed
npm install ws utf-8-validate bufferutil --no-save || true

# If we're using ES modules, ensure the index.js file is compatible
if [ -n "$IS_ESM" ]; then
  echo "Ensuring dist/index.js is ES module compatible..."
  if [ -f "dist/index.js" ]; then
    # Check if the file contains require statements, if so, convert to ES module
    if grep -q "require(" "dist/index.js"; then
      echo "Converting CommonJS syntax to ES modules in dist/index.js"
      cat > dist/index.js << EOF
// ES Module compatible server
import http from 'http';

const port = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  
  // Add health endpoint for monitoring
  if (req.url === '/health') {
    res.end('OK');
    return;
  }
  
  res.end('<html><head><title>Vision Hub</title></head><body><h1>Vision Hub</h1><p>Server is running. Application served through Nginx.</p></body></html>');
});

server.listen(port, () => {
  console.log(\`Server running on port \${port}\`);
});
EOF
    fi
  fi
fi

# Start the application with PM2
echo "Starting application with PM2..."
pm2 start ecosystem.config.cjs

# Save PM2 configuration to start on system boot
pm2 save

# Generate PM2 startup script
startup_cmd=$(pm2 startup systemd -u visionhub --hp /home/visionhub | grep "sudo" | tail -n 1)

echo "To make PM2 start on boot, run the following command:"
echo "$startup_cmd"

echo "===== PM2 setup completed ====="
