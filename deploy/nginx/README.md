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
- `cms.vp-associates.com.conf`: headless WordPress. PHP runs **only** for `index.php`, `wp-login.php`, `wp-cron.php`, `wp-admin/*.php` and TinyMCE. Any other `.php` (plugins, themes, uploads) is denied. This matters because this install was compromised on its previous host, and dropped files must never execute.
- `snippets/vp-security-headers.conf`: included in every location of the main site, because nginx drops inherited `add_header` in locations that set their own.

Certbot manages the certificate lines. If `certbot renew` rewrites a file, copy the change back here.
