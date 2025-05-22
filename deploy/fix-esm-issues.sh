
#!/bin/bash
# Script to fix common ES Module related issues
# Run as the application user (visionhub)

APP_DIR="/opt/visionhub"

echo "===== Fixing ES Module related issues ====="

# Check if we're in an ES Module project
IS_ESM=$(grep '"type": "module"' $APP_DIR/package.json || echo "")

# Navigate to application directory
cd $APP_DIR

if [ -n "$IS_ESM" ]; then
  echo "Detected ES Module project. Fixing server script..."
  
  # Fix the fallback server script if it exists
  if [ -f "dist/index.js" ]; then
    echo "Updating dist/index.js to use ES Module syntax..."
    cat > dist/index.js << EOF
// Basic Node.js server (ES Module version)
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
  
  res.end('<html><head><title>Vision Hub</title></head><body><h1>Vision Hub</h1><p>Server is running but application build may be incomplete.</p></body></html>');
});

server.listen(port, () => {
  console.log(\`Server running on port \${port}\`);
});
EOF
  fi
  
  # Update PM2 ecosystem file to handle ES modules
  echo "Updating PM2 ecosystem config for ES modules..."
  cat > ecosystem.config.cjs << EOF
module.exports = {
  apps: [{
    name: 'visionhub',
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
  echo "CommonJS project detected. Fixing configuration..."
  # Standard PM2 ecosystem file for CommonJS
  cat > ecosystem.config.cjs << EOF
module.exports = {
  apps: [{
    name: 'visionhub',
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

# Install required dependencies
echo "Installing required dependencies..."
npm install ws utf-8-validate bufferutil --no-save

# Restart the application using PM2
echo "Restarting application with PM2..."
pm2 delete visionhub 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save

echo "===== ES Module fixes completed ====="
echo "Check application status with: pm2 list"
echo "Check logs with: pm2 logs"
