# nginx configs (production droplet)

These are the live nginx configs for the droplet that serves both sites. Edit them here, then apply:

```sh
H=root@165.245.141.179; K=~/.ssh/droplet-vp-nuxt
scp -i $K deploy/nginx/vp-associates.com.conf $H:/etc/nginx/sites-available/vp-associates.com
scp -i $K deploy/nginx/cms.vp-associates.com.conf $H:/etc/nginx/sites-available/cms.vp-associates.com
scp -i $K deploy/nginx/snippets/vp-security-headers.conf $H:/etc/nginx/snippets/
ssh -i $K $H 'nginx -t && systemctl reload nginx'
```

- `vp-associates.com.conf`: the static site from `nuxt generate`. Real 404s, legacy WordPress redirects, `www` to apex, no trailing slashes, precompressed `.gz`, and cache rules per asset type.
- `cms.vp-associates.com.conf`: headless WordPress, served by the dedicated `cms` PHP-FPM pool (`../php/cms.conf`). PHP runs **only** for `index.php`, `wp-login.php`, `wp-cron.php`, `wp-admin/*.php` and TinyMCE. Any other `.php` (plugins, themes, uploads) is denied. This matters because this install was compromised on its previous host, and dropped files must never execute.
- `snippets/vp-security-headers.conf`: included in every location of the main site, because nginx drops inherited `add_header` in locations that set their own.

Certbot manages the certificate lines. If `certbot renew` rewrites a file, copy the change back here.

## PHP

One PHP (8.4, from the sury PPA) serves everything on the droplet, in two FPM pools:

- `www` (user `www-data`): the whiteboard Laravel apps.
- `cms` (user `wp-cms`, `../php/cms.conf`): WordPress. It can write only `wp-content/uploads` and `wp-content/upgrade`. Core, plugins, themes and mu-plugins are `root`-owned, `exec`/`system`/`proc_open` are disabled and `open_basedir` is the web root. Run WP-CLI as `sudo -u wp-cms wp --path=/var/www/cms.vp-associates.com` for anything that writes, or as root (`wp --allow-root`) to update core and plugins.

```sh
scp -i $K deploy/php/cms.conf $H:/etc/php/8.4/fpm/pool.d/cms.conf
ssh -i $K $H 'php-fpm8.4 -t && systemctl reload php8.4-fpm'
```

**Patching PHP is manual.** `unattended-upgrades` trusts only `noble` and `noble-security`, so it never touches sury PHP, and it never reboots. After any PHP security advisory (the 2026-10-21 "php2shell" CVE-2026-109618/-109619 is why this exists):

```sh
apt-get update && apt-get install --only-upgrade 'php8.4-*' && systemctl restart php8.4-fpm
php -v; php-fpm8.4 -v     # compare with the advisory's fixed version
```

Run `apt-get update` first: the cached lists can be a release behind. Reboot when `/var/run/reboot-required` exists; `pm2-root` brings the whiteboard apps back. `ufw` allows only 22, 80 and 443.
