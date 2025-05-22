
#!/bin/bash
# Configure Nginx for Vision Hub
# Run as root or with sudo permissions

DOMAIN="visionhub.local"
PORT=8080

echo "===== Configuring Nginx for Vision Hub ====="

# Create Nginx configuration file
cat > /etc/nginx/sites-available/visionhub << EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # Add location blocks for static assets if needed
    location /assets/ {
        alias /opt/visionhub/dist/assets/;
        expires 7d;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/visionhub /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Reload Nginx if the configuration test passed
if [ $? -eq 0 ]; then
    systemctl reload nginx
    echo "Nginx configuration successful"
else
    echo "ERROR: Nginx configuration failed"
fi

echo "===== Nginx configuration completed ====="
