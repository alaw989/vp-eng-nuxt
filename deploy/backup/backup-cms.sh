#!/bin/bash
# Nightly backup of the WordPress CMS (database + uploads), outside the web root.
# Installed as /usr/local/sbin/backup-cms.sh; runs from /etc/cron.d/backup-cms.
# Restore: wp db import <db.sql.gz after gunzip>; tar -xzf uploads.tgz -C /var/www/cms.vp-associates.com/wp-content
set -euo pipefail

SITE=/var/www/cms.vp-associates.com
DEST_ROOT=/root/backups/nightly
KEEP_DAYS=14
DEST="$DEST_ROOT/$(date +%F)"

umask 077
mkdir -p "$DEST"

sudo -u www-data wp --path="$SITE" --skip-plugins --skip-themes db export - | gzip -9 > "$DEST/db.sql.gz.tmp"
mv "$DEST/db.sql.gz.tmp" "$DEST/db.sql.gz"
tar -C "$SITE/wp-content" -czf "$DEST/uploads.tgz.tmp" uploads
mv "$DEST/uploads.tgz.tmp" "$DEST/uploads.tgz"

# Fail loudly if the dump is truncated
gzip -t "$DEST/db.sql.gz"
zcat "$DEST/db.sql.gz" | tail -c 200 | grep -q "Dump completed"

find "$DEST_ROOT" -mindepth 1 -maxdepth 1 -type d -mtime +"$KEEP_DAYS" -exec rm -rf {} +
echo "$(date -Is) backup ok: $(du -sh "$DEST" | cut -f1) in $DEST"
