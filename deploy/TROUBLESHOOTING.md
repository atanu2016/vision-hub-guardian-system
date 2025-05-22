
# Vision Hub Deployment Troubleshooting Guide

## Common Issues and Solutions

### GitHub Repository Issues

**Error:** `Failed to clone repository`

**Solution:**
1. Verify the GitHub repository URL in `setup-application.sh`:
   ```
   GITHUB_REPO="https://github.com/yourusername/vision-hub.git"
   ```

2. Check if git is installed:
   ```
   git --version
   ```

3. Make sure you have internet connectivity:
   ```
   ping github.com
   ```

4. If using a private repository, set up SSH keys or provide credentials:
   ```
   git clone https://username:personal-access-token@github.com/yourusername/vision-hub.git
   ```

5. Manually copy files if Git doesn't work:
   ```
   scp -r /path/to/local/vision-hub/ visionhub@server:/opt/visionhub/
   ```

### Application Fails to Start

**Error:** `Error: Script not found: /opt/visionhub/dist/server.js`

**Solution:** 
1. Verify the build process completed successfully:
   ```
   cd /opt/visionhub
   ls -la dist/
   ```

2. Check if the entry point is correctly specified in ecosystem.config.js:
   ```
   cat ecosystem.config.js
   ```

3. Rebuild the application:
   ```
   npm run build
   ```

4. Restart PM2:
   ```
   pm2 reload visionhub
   ```

### Database Connection Issues

**Error:** Cannot connect to database

**Solution:**
1. Verify PostgreSQL is running:
   ```
   systemctl status postgresql
   ```

2. Check database credentials in .env file:
   ```
   cat /opt/visionhub/.env | grep DATABASE
   ```

3. Test database connection:
   ```
   sudo -u postgres psql -c "\l" | grep visionhub
   ```

### Nginx Configuration Issues

**Error:** Cannot access application via HTTP

**Solution:**
1. Check Nginx is running:
   ```
   systemctl status nginx
   ```

2. Verify Nginx configuration is valid:
   ```
   nginx -t
   ```

3. Check site configuration:
   ```
   cat /etc/nginx/sites-enabled/visionhub
   ```

4. Look for errors in Nginx logs:
   ```
   tail -f /var/log/nginx/error.log
   ```

### PM2 Issues

**Error:** PM2 not managing the application

**Solution:**
1. Check PM2 status:
   ```
   pm2 list
   ```

2. Restart PM2:
   ```
   pm2 delete all
   pm2 start ecosystem.config.js
   pm2 save
   ```

3. Setup PM2 to start on boot:
   ```
   pm2 startup
   # Follow the instructions provided
   ```

### Systemd Service Issues

**Error:** Systemd service fails to start

**Solution:**
1. Check service status:
   ```
   systemctl status visionhub.service
   ```

2. Check service logs:
   ```
   journalctl -u visionhub.service
   ```

3. Verify service file:
   ```
   cat /etc/systemd/system/visionhub.service
   ```

4. Reload systemd and restart:
   ```
   systemctl daemon-reload
   systemctl restart visionhub.service
   ```

## Command Cheat Sheet

- **Check application status:** `pm2 list`
- **View application logs:** `pm2 logs visionhub`
- **Restart application:** `pm2 restart visionhub`
- **View systemd service logs:** `journalctl -u visionhub.service`
- **Test Nginx configuration:** `nginx -t`
- **Check database status:** `systemctl status postgresql`
