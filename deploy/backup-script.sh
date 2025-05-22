
#!/bin/bash
# Database backup script for Vision Hub
# Add to crontab for automated backups

BACKUP_DIR="/var/backups/visionhub"
DB_NAME="visionhub"
DB_USER="visionadmin"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/visionhub-backup-${TIMESTAMP}.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Perform database backup
echo "Creating database backup: $BACKUP_FILE"
PGPASSWORD=SecurePassword123 pg_dump -U $DB_USER $DB_NAME > $BACKUP_FILE

# Compress the backup
gzip $BACKUP_FILE

# Remove backups older than 30 days
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
