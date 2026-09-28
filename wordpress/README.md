# WordPress (cms.vp-associates.com)

Code that runs inside the headless CMS the site reads at build time.

- `mu-plugins/vp-headless-api.php`: REST fields the static site depends on (`project_pdfs_resolved`). Deploy it to `wp-content/mu-plugins/`, owned by `root:www-data` with mode 644. Must-use plugins load automatically and can't be switched off from the admin.

The live `vp-associates-cpt` plugin is **1.2.0**. `../vp-associates-cpt.php` in this repo is an undeployed 1.5.0 draft (positions, certificates, locations, media picker), so check it before deploying.

Operations (see `../deploy/`):
- WP-CLI runs as `sudo -u www-data wp` in `/var/www/cms.vp-associates.com`. Core files are root-owned, so core updates use `wp --allow-root core update`.
- Nightly backups: `/root/backups/nightly/` (`deploy/backup/backup-cms.sh`).
- After content changes, rebuild the site: `gh workflow run "Deploy to Production" --ref master`.
