#!/usr/bin/env bash
# ====================================================================
#  EventSphere MongoDB Automated Backup Script (Linux / macOS)
# ====================================================================

set -e

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="../backups/${TIMESTAMP}"

echo "[EventSphere] Initiating MongoDB database backup to: ${BACKUP_DIR}"

mkdir -p ../backups

if [ -z "$MONGO_URI" ]; then
  MONGO_URI="mongodb://localhost:27017/eventsphere"
fi

mongodump --uri="${MONGO_URI}" --out="${BACKUP_DIR}"

echo "[EventSphere] Backup successfully archived at: ${BACKUP_DIR}"
