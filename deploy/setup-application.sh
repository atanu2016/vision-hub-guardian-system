
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
