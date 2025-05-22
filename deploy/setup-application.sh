
#!/bin/bash
# Application setup script for Vision Hub
# Run as the application user

VISION_HUB_DIR="/opt/visionhub"
GITHUB_REPO="https://github.com/atanu2016/vision-hub-guardian-system.git"  # Updated GitHub repo URL

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
echo "Installing npm dependencies..."
npm install

# Install additional dependencies for ONVIF support
echo "Installing ONVIF-related dependencies..."
npm install onvif ws node-rtsp-stream-jsmpeg buffer-to-arraybuffer --no-save

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

# ONVIF settings
ONVIF_DISCOVERY_ENABLED=true
ONVIF_DISCOVERY_TIMEOUT=5000
EOF

echo "Building application..."
# Use the correct build script as defined in package.json
npm run build

# Create dist directory and properly serve static files
mkdir -p dist
if [ ! -f "dist/index.html" ]; then
  echo "Creating proper server file to serve React application..."
  cat > dist/index.js << EOF
// Modern ES Module server that serves React app
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 8080;
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  console.log(\`\${new Date().toISOString()} - \${req.method} \${req.url}\`);
  
  // Health check endpoint
  if (req.url === '/health') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('OK');
    return;
  }
  
  // Parse URL to get the path
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html';
  }
  
  // Determine content type based on file extension
  const extname = path.extname(filePath);
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // Read the file from disk
  fs.readFile(path.join(__dirname, filePath), (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // For client-side routing, serve index.html for all routes
        fs.readFile(path.join(__dirname, 'index.html'), (err, indexContent) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Internal Server Error');
            return;
          }
          
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html');
          res.end(indexContent);
        });
      } else {
        // Server error
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Internal Server Error: ' + error.code);
      }
      return;
    }
    
    // Success - serve the file
    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
  console.log(\`Server directory: \${__dirname}\`);
  console.log(\`Available files: \${fs.readdirSync(__dirname).join(', ')}\`);
});

// Handle termination gracefully
process.on('SIGINT', () => {
  console.log('Server shutting down...');
  server.close(() => {
    console.log('Server terminated');
    process.exit(0);
  });
});
EOF
fi

# Skip Supabase migrations for now since they're causing issues
echo "Note: Skipping database migrations. You may need to run them manually later."

# Storage directories are now created in the main deployment script
echo "===== Application setup completed ====="

# Create the fix-esm-issues script with ONVIF support
echo "Creating enhanced fix-esm-issues script with ONVIF support..."

cat > deploy/fix-esm-issues.sh << EOF
#!/bin/bash
# Script to fix common ES Module related issues and add ONVIF support
# Run as the application user (visionhub)

APP_DIR="/opt/visionhub"

echo "===== Fixing ES Module related issues and adding ONVIF support ====="

# Navigate to application directory
cd \$APP_DIR

# Check if we're in an ES Module project
IS_ESM=\$(grep '"type": "module"' \$APP_DIR/package.json || echo "")

# Install ONVIF-related dependencies
echo "Installing ONVIF dependencies..."
npm install onvif ws node-rtsp-stream-jsmpeg buffer-to-arraybuffer --no-save

if [ -n "\$IS_ESM" ]; then
  echo "Detected ES Module project. Fixing server script..."
  
  # Fix the server script
  echo "Updating dist/index.js to use ES Module syntax..."
  cat > dist/index.js << EOFJS
// Modern ES Module server that serves React app with ONVIF support
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 8080;
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  console.log(\\\`\\\${new Date().toISOString()} - \\\${req.method} \\\${req.url}\\\`);
  
  // CORS headers for API requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  
  // Health check endpoint
  if (req.url === '/health') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('OK');
    return;
  }
  
  // Parse URL to get the path
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html';
  }
  
  // Determine content type based on file extension
  const extname = path.extname(filePath);
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // Read the file from disk
  fs.readFile(path.join(__dirname, filePath), (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // For client-side routing, serve index.html for all routes
        fs.readFile(path.join(__dirname, 'index.html'), (err, indexContent) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Internal Server Error');
            return;
          }
          
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html');
          res.end(indexContent);
        });
      } else {
        // Server error
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Internal Server Error: ' + error.code);
      }
      return;
    }
    
    // Success - serve the file
    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(\\\`Server running on port \\\${PORT}\\\`);
  console.log(\\\`Server directory: \\\${__dirname}\\\`);
  console.log(\\\`Available files: \\\${fs.readdirSync(__dirname).join(', ')}\\\`);
});

// Handle termination gracefully
process.on('SIGINT', () => {
  console.log('Server shutting down...');
  server.close(() => {
    console.log('Server terminated');
    process.exit(0);
  });
});
EOFJS
  
  # Update PM2 ecosystem file to handle ES modules
  echo "Updating PM2 ecosystem config for ES modules..."
  cat > ecosystem.config.cjs << EOFCONFIG
module.exports = {
  apps: [{
    name: 'visionhub',
    script: 'index.js',
    cwd: '\$APP_DIR/dist',
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
EOFCONFIG

else
  echo "CommonJS project detected. Fixing configuration..."
  # Standard PM2 ecosystem file for CommonJS
  cat > ecosystem.config.cjs << EOFCONFIG
module.exports = {
  apps: [{
    name: 'visionhub',
    script: 'index.js',
    cwd: '\$APP_DIR/dist',
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
EOFCONFIG
fi

# Install required dependencies
echo "Installing required dependencies..."
npm install ws utf-8-validate bufferutil fs path url --no-save || true

# Create a valid PM2_HOME directory and set proper permissions
mkdir -p /home/visionhub/.pm2
chown -R visionhub:visionhub /home/visionhub/.pm2

# Make sure local directories are available
mkdir -p /var/lib/visionhub/recordings 
mkdir -p /var/log/visionhub
chown -R visionhub:visionhub /var/lib/visionhub /var/log/visionhub

# Restart the application using PM2
echo "Restarting application with PM2..."
pm2 delete visionhub 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save

# Generate PM2 startup script
startup_cmd=\$(pm2 startup systemd -u visionhub --hp /home/visionhub | grep "sudo" | tail -n 1)

echo "===== ES Module and ONVIF fixes completed ====="
echo "To make PM2 start on boot, run: \$startup_cmd"
echo "Check application status with: pm2 list"
echo "Check logs with: pm2 logs"

EOF

chmod +x deploy/fix-esm-issues.sh

# Run the fix script to ensure everything is properly set up
echo "Applying fixes for ES Module issues and ONVIF support..."
./deploy/fix-esm-issues.sh
