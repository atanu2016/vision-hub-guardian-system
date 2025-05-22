
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

**Error:** `ERR_REQUIRE_ESM`

**Solution:**
1. This error occurs when PM2 tries to run an ES module with CommonJS:
   ```
   systemctl status visionhub.service
   ```

2. Make sure the ecosystem file has the .cjs extension:
   ```
   cd /opt/visionhub
   ls -la ecosystem.config.*
   ```
   
3. If you still see ecosystem.config.js instead of ecosystem.config.cjs, rename it:
   ```
   cd /opt/visionhub
   mv ecosystem.config.js ecosystem.config.cjs
   ```

4. Update the visionhub.service file to use .cjs:
   ```
   sudo nano /etc/systemd/system/visionhub.service
   ```
   Change `ExecStart=/usr/bin/pm2 start ecosystem.config.js` to 
   `ExecStart=/usr/bin/pm2 start ecosystem.config.cjs`

5. Restart the service:
   ```
   sudo systemctl daemon-reload
   sudo systemctl restart visionhub.service
   ```

### Script Not Found Errors

**Error:** `Error: Script not found: /opt/visionhub/dist/main.js`

**Solution:**
1. Check if the built application files exist:
   ```
   ls -la /opt/visionhub/dist/
   ```

2. If the dist directory doesn't contain the expected files, update ecosystem.config.cjs to point to the correct main script:
   ```
   cd /opt/visionhub
   nano ecosystem.config.cjs
   ```

3. Make sure a valid script exists by creating a basic fallback server:
   ```
   mkdir -p /opt/visionhub/dist
   nano /opt/visionhub/dist/index.js
   ```
   
4. Create a basic HTTP server in index.js:
   ```javascript
   const http = require('http');
   const port = process.env.PORT || 8080;
   
   const server = http.createServer((req, res) => {
     res.statusCode = 200;
     res.setHeader('Content-Type', 'text/html');
     res.end('<html><body><h1>Vision Hub</h1><p>Server is running.</p></body></html>');
   });
   
   server.listen(port, () => {
     console.log(`Server running on port ${port}`);
   });
   ```

### Supabase Configuration Issues

**Error:** `Failed to parse config: decoding failed due to invalid keys`

**Solution:**
1. Simplify the `supabase/config.toml` file to only include the necessary project_id:
   ```
   # A string used to distinguish different Supabase projects on the same host. Defaults to the project ID.
   project_id = "csmsqglfbycodrqipbca"
   ```

2. Skip Supabase migrations during initial setup if they're failing:
   ```
   # Comment out or remove these lines from setup-application.sh
   # npx supabase db start
   # npx supabase db push
   ```

3. Run migrations manually after setup is complete:
   ```
   cd /opt/visionhub
   npx supabase link --project-ref csmsqglfbycodrqipbca
   npx supabase db push
   ```

### Permission Issues

**Error:** `mkdir: cannot create directory '/var/lib/visionhub': Permission denied`

**Solution:**
1. Ensure directories are created with proper permissions:
   ```
   sudo mkdir -p /var/lib/visionhub/recordings
   sudo chown -R visionhub:visionhub /var/lib/visionhub
   sudo chmod 755 /var/lib/visionhub/recordings
   ```

2. Make sure the directory creation happens before the application setup:
   ```
   # In deploy.sh, move the directory creation before calling setup-application.sh
   ```

3. Use sudo when needed in scripts running as non-root users:
   ```
   sudo mkdir -p /var/lib/visionhub/recordings
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

## Command Cheat Sheet

- **Check application status:** `pm2 list`
- **View application logs:** `pm2 logs visionhub`
- **Restart application:** `pm2 restart visionhub`
- **View systemd service logs:** `journalctl -u visionhub.service`
- **Test Nginx configuration:** `nginx -t`
- **Check database status:** `systemctl status postgresql`
- **Manual PM2 start:** `cd /opt/visionhub && sudo -u visionhub pm2 start ecosystem.config.cjs`
- **View Vision Hub logs:** `cd /opt/visionhub && sudo -u visionhub pm2 logs`
