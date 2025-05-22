
#!/bin/bash
# Health check script for Vision Hub
# Can be run from cron to monitor application health

APP_NAME="visionhub"
SERVICE_URL="http://localhost:8080/health"
LOG_FILE="/var/log/visionhub-healthcheck.log"

echo "$(date): Running health check" >> $LOG_FILE

# Check if PM2 is running
if ! pgrep -x "pm2" > /dev/null; then
  echo "$(date): ERROR - PM2 is not running. Starting PM2..." >> $LOG_FILE
  systemctl restart visionhub.service
  sleep 10
fi

# Check if the application process is running
if ! pm2 show $APP_NAME &>/dev/null; then
  echo "$(date): ERROR - $APP_NAME is not running in PM2. Attempting restart..." >> $LOG_FILE
  cd /opt/visionhub
  pm2 restart $APP_NAME
  sleep 5
fi

# Check if the application endpoint is accessible
response=$(curl -s -o /dev/null -w "%{http_code}" $SERVICE_URL || echo "failed")

if [ "$response" != "200" ]; then
  echo "$(date): ERROR - Health check failed with response: $response. Restarting service..." >> $LOG_FILE
  systemctl restart visionhub.service
  echo "$(date): Service restart triggered" >> $LOG_FILE
else
  echo "$(date): Health check passed with response: $response" >> $LOG_FILE
fi
