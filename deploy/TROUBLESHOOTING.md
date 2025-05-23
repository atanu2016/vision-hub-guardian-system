# Vision Hub Deployment Troubleshooting Guide

## Common Issues and Solutions

### GitHub Repository Issues

**Error:** `Failed to clone repository`

**Solution:**
1. Verify the GitHub repository URL in `setup-application.sh`:
   ```
   GITHUB_REPO="https://github.com/atanu2016/vision-hub-guardian-system.git"
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
1. This error occurs when there's a conflict between ES modules and CommonJS:
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

5. For ES modules in index.js, make sure the PM2 configuration includes the correct node arguments:
   ```
   node_args: '--experimental-specifier-resolution=node'
   ```

6. Restart the service:
   ```
   sudo systemctl daemon-reload
   sudo systemctl restart visionhub.service
   ```

### "Server is running" Placeholder Page Shown Instead of Application

**Problem:** Browser shows "Server is running. Application served through Nginx" instead of your actual application.

**Solution:**

1. This happens when the basic fallback server is running instead of your full React application:
   ```
   systemctl status visionhub.service
   ```

2. Check if the React application was properly built:
   ```
   ls -la /opt/visionhub/dist/
   ```
   Look for index.html and asset files (CSS/JS). If they're missing, the build failed.

3. Fix the server file to properly serve static assets:
   ```
   sudo -u visionhub bash -c "cd /opt/visionhub && ./deploy/fix-esm-issues.sh"
   ```

4. Check if the server correctly identifies your files:
   ```
   sudo -u visionhub pm2 logs
   ```
   Look for messages showing "Server directory: /opt/visionhub/dist" and "Available files: index.html, ..."

5. If needed, rebuild the application:
   ```
   cd /opt/visionhub
   sudo -u visionhub npm run build
   sudo -u visionhub pm2 restart all
   ```

6. Clear browser cache and reload the page

### Missing Module Error

**Error:** `Error: Cannot find module 'utf-8-validate'` or similar missing module errors

**Solution:**
1. This typically happens when PM2 or its dependencies have missing modules:
   ```
   cd /opt/visionhub
   npm install ws utf-8-validate bufferutil --no-save
   ```

2. If using global PM2, install the modules globally:
   ```
   sudo npm install -g ws utf-8-validate bufferutil
   ```

3. Restart the service:
   ```
   sudo systemctl restart visionhub.service
   ```

### ES Module Issues

**Error:** `ReferenceError: require is not defined in ES module scope`

**Solution:**
1. This happens when the application is configured as an ES module but uses CommonJS syntax:
   ```
   cat /opt/visionhub/package.json | grep \"type\"
   ```

2. If package.json has `"type": "module"`, update your fallback server to use ES module syntax:
   ```
   sudo nano /opt/visionhub/dist/index.js
   ```
   Change `const http = require('http')` to `import http from 'http';`

3. Make sure PM2 is configured to handle ES modules:
   ```
   sudo nano /opt/visionhub/ecosystem.config.cjs
   ```
   Add `node_args: '--experimental-specifier-resolution=node'` to the config

4. Restart the application:
   ```
   sudo -u visionhub pm2 restart visionhub
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
   Change `script: 'main.js'` to `script: 'index.js'` or whatever your main entry file is called.

3. Make sure a valid script exists by creating a basic fallback server:
   ```
   mkdir -p /opt/visionhub/dist
   nano /opt/visionhub/dist/index.js
   ```
   
4. Create a basic HTTP server in index.js using ES module syntax:
   ```javascript
   import http from 'http';
   
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

### Systemd Service Issues

**Error:** `Service immediately stops after starting` or `Failed to start Vision Hub Application Service`

**Solution:**
1. The most common issue is PM2 not being properly configured for systemd:
   ```
   systemctl status visionhub.service
   journalctl -u visionhub.service -n 50
   ```

2. Make sure the systemd service file has the correct settings:
   ```
   sudo nano /etc/systemd/system/visionhub.service
   ```
   Ensure it has:
   - `Type=forking` 
   - `RemainAfterExit=yes`
   - Correct `WorkingDirectory` pointing to `/opt/visionhub`

3. Ensure PM2 has a home directory with proper permissions:
   ```
   sudo mkdir -p /home/visionhub/.pm2
   sudo chown -R visionhub:visionhub /home/visionhub/.pm2
   ```

4. Try starting PM2 manually first:
   ```
   sudo -u visionhub bash -c 'cd /opt/visionhub && pm2 start ecosystem.config.cjs && pm2 save'
   ```

5. Generate and run the PM2 startup script:
   ```
   sudo -u visionhub pm2 startup systemd -u visionhub --hp /home/visionhub
   ```
   Then run the command it outputs (starts with `sudo env PATH=...`)

6. Reload systemd and try starting the service again:
   ```
   sudo systemctl daemon-reload
   sudo systemctl restart visionhub.service
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
   sudo mkdir -p /var/log/visionhub
   sudo chown -R visionhub:visionhub /var/lib/visionhub
   sudo chown -R visionhub:visionhub /var/log/visionhub
   sudo chmod 755 /var/lib/visionhub/recordings
   sudo chmod 755 /var/log/visionhub
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

### ONVIF Camera Connection Issues

**Problem:** Unable to connect to ONVIF cameras - seeing "Stream Unavailable" message

**Solution:**

1. Verify that the camera is accessible on the network:
   ```
   ping camera-ip-address
   ```

2. Check if the ONVIF port is open and accessible:
   ```
   nc -zv camera-ip-address onvif-port
   ```

3. Verify ONVIF credentials by testing with an ONVIF client:
   ```
   cd /opt/visionhub
   node -e "const onvif=require('onvif');new onvif.Cam({hostname:'camera-ip',port:8000,username:'admin',password:'password'}, function(err){console.log(err||'Connected')});"
   ```

4. Common ONVIF connection issues:
   - Wrong credentials (username/password)
   - Incorrect port (try common ports: 80, 8000, 8080)
   - Firewall blocking ONVIF traffic
   - Camera's ONVIF implementation might be non-standard

5. Check Vision Hub logs for detailed error messages:
   ```
   sudo -u visionhub pm2 logs
   ```

6. Ensure ONVIF dependencies are installed:
   ```
   cd /opt/visionhub
   npm install onvif ws node-rtsp-stream-jsmpeg buffer-to-arraybuffer --no-save
   ```

7. Many cameras require direct access to RTSP streams. Try using an RTSP connection instead of ONVIF:
   - Find your camera's RTSP URL format (often: `rtsp://username:password@camera-ip:port/stream`)
   - Add the camera as an RTSP type instead of ONVIF

8. Some ONVIF cameras need specific configuration:
   ```
   # Create a custom ONVIF test script
   cd /opt/visionhub
   cat > test-onvif.js << EOF
   const onvif = require('onvif');
   
   new onvif.Cam({
     hostname: 'camera-ip',
     port: 8000,
     username: 'admin',
     password: 'password'
   }, function(err, cam) {
     if (err) {
       console.error(err);
       return;
     }
     
     // Request camera information
     cam.getDeviceInformation((err, info) => {
       console.log('Device Information:', err || info);
     });
     
     // Get streaming URLs
     cam.getStreamUri({protocol:'RTSP'}, (err, stream) => {
       console.log('RTSP Stream URI:', err || stream);
     });
   });
   EOF
   
   # Run the test script
   node test-onvif.js
   ```

9. For IP cameras without ONVIF, get the direct RTSP URL and use that instead:
   - Hikvision: `rtsp://user:pass@camera-ip:554/Streaming/Channels/101`
   - Dahua: `rtsp://user:pass@camera-ip:554/cam/realmonitor?channel=1&subtype=0`
   - Generic: `rtsp://user:pass@camera-ip:554/stream1` or `rtsp://user:pass@camera-ip:554/h264`

## Command Cheat Sheet

- **Check application status:** `pm2 list`
- **View application logs:** `pm2 logs visionhub`
- **Restart application:** `pm2 restart visionhub`
- **View systemd service logs:** `journalctl -u visionhub.service`
- **Test Nginx configuration:** `nginx -t`
- **Check database status:** `systemctl status postgresql`
- **Manual PM2 start:** `cd /opt/visionhub && sudo -u visionhub pm2 start ecosystem.config.cjs`
- **View Vision Hub logs:** `cd /opt/visionhub && sudo -u visionhub pm2 logs` or `cat /var/log/visionhub/combined.log`
- **Check system resources:** `htop` or `top`
- **Check disk space:** `df -h`
- **Check file permissions:** `ls -la /opt/visionhub/`
