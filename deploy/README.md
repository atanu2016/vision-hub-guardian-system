
# Vision Hub Deployment Guide

This directory contains scripts and configuration files for deploying Vision Hub on an Ubuntu server.

## Before Deployment

1. **Update GitHub Repository URL**:
   - Edit `setup-application.sh` and change the `GITHUB_REPO` variable to your Vision Hub repository URL.

## Deployment Steps

1. **Prepare the server**:
   ```bash
   sudo ./deploy/install-dependencies.sh
   ```

2. **Create application user**:
   ```bash
   sudo useradd -m -s /bin/bash visionhub
   sudo chown -R visionhub:visionhub /opt/visionhub
   ```

3. **Setup the application**:
   ```bash
   sudo -u visionhub ./deploy/setup-application.sh
   ```

4. **Configure Nginx**:
   ```bash
   sudo ./deploy/nginx-config.sh
   ```

5. **Setup PM2 process manager**:
   ```bash
   sudo -u visionhub ./deploy/setup-pm2.sh
   ```

6. **Configure systemd service**:
   ```bash
   sudo cp ./deploy/visionhub.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable visionhub.service
   sudo systemctl start visionhub.service
   ```

7. **Setup automated backups**:
   ```bash
   sudo cp ./deploy/backup-script.sh /etc/cron.daily/visionhub-backup
   sudo chmod +x /etc/cron.daily/visionhub-backup
   ```

## One-Step Deployment

For a complete automated deployment, run:
```bash
sudo ./deploy/deploy.sh
```

## Environment Configuration

- Edit the `.env` file in the application directory to configure your environment settings.
- Update the PostgreSQL password in `install-dependencies.sh` and `backup-script.sh`.
- Modify the domain name in `nginx-config.sh`.

## Security Recommendations

1. Change default passwords in the scripts before running them.
2. Setup SSL/TLS certificates using Certbot/Let's Encrypt.
3. Configure firewall rules to restrict access.
4. Regularly update the system and applications.

## Troubleshooting

- Check application logs: `sudo journalctl -u visionhub`
- Check PM2 logs: `pm2 logs`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- See TROUBLESHOOTING.md for common issues and solutions
