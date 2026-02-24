# cPanel 110.0.88 Hosting Capabilities Research

**Domain:** cPanel Shared Hosting for Static JavaScript Applications
**Researched:** 2026-02-23
**Overall confidence:** MEDIUM

## Executive Summary

cPanel 110.0.88 is a traditional shared hosting control panel released in March 2023. It **does NOT support Node.js natively** for most hosting plans, but can successfully host **static JavaScript applications** (Nuxt static exports, Vue, React builds) using Apache with proper `.htaccess` configuration. **PHP is the primary server-side technology available**, with versions 8.1, 8.2, and 8.3 supported through EasyApache 4.

**Key constraint:** No native Node.js runtime means server-side Nuxt features (SSR, API routes, server middleware) cannot run. The application must be built as a pure static site.

## Key Findings

**Static Hosting:** Fully supported via Apache with mod_rewrite for SPA routing
**Server-Side:** PHP 8.1-8.3 available; no Node.js runtime
**Email:** PHP mail() function works; recommend PHPMailer for reliability
**CGI/Binaries:** Supported but limited; compiled Go/Rust binaries possible with proper permissions
**Workarounds:** PHP proxy scripts, external APIs, third-party email services

## Hard Constraints (Things That Won't Work)

| Feature | Status | Why |
|---------|--------|-----|
| Nuxt SSR/SSG hybrid | **NOT SUPPORTED** | No Node.js runtime on standard cPanel 110 shared hosting |
| Nuxt API routes (`/api/*`) | **NOT SUPPORTED** | Requires server-side JavaScript execution |
| Nuxt server middleware | **NOT SUPPORTED** | Requires Node.js runtime |
| Environment variables (runtime) | **LIMITED** | Only `.env` at build time; no runtime `process.env` |
| WebSocket connections | **NOT SUPPORTED** | Requires Node.js or special server config |
| Server-side rendering | **NOT SUPPORTED** | No Node.js runtime |

## Supported Features

### Static File Hosting

**Table Stakes - Fully Supported:**

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| HTML/CSS/JS serving | Core web server functionality | LOW | Apache handles natively |
| SPA client-side routing | Users expect direct URLs to work | LOW | Requires `.htaccess` configuration |
| Static asset delivery | Images, fonts, icons | LOW | Direct file serving |
| Gzip compression | Performance expectation | LOW | Enable via `.htaccess` or cPanel |
| Browser caching | Performance expectation | LOW | Enable via `.htaccess` headers |
| HTTPS/SSL | Security standard | LOW | cPanel provides free Let's Encrypt SSL |

### .htaccess Capabilities

**URL Rewriting for SPA Routing** - Essential for single-page applications:

```apache
# Standard SPA .htaccess configuration
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # Handle index.html directly to prevent loops
    RewriteRule ^index\.html$ - [L]

    # If request is for existing file or directory, serve it
    RewriteCond %{REQUEST_FILENAME} -f [OR]
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteRule ^ - [L]

    # Otherwise, redirect to index.html for SPA routing
    RewriteRule . /index.html [L]
</IfModule>
```

**With Performance Optimizations:**

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # SPA routing fallback
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>

# Enable Gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/json
</IfModule>

# Browser caching for static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType text/css "access plus 1 year"
</IfModule>
```

### PHP Support

**Available Versions (via EasyApache 4):**
- PHP 8.1 (stable, widely supported)
- PHP 8.2 (performance improvements)
- PHP 8.3 (latest features)

**PHP Capabilities:**
| Feature | Support | Notes |
|---------|---------|-------|
| Email via `mail()` | YES | Native function; requires sendmail |
| Email via PHPMailer | YES | Recommended; supports SMTP |
| Database access | YES | MySQL/MariaDB via PDO/mysqli |
| cURL requests | YES | Can proxy to external APIs |
| File I/O | YES | Standard PHP filesystem functions |
| Session management | YES | For simple server-side state |

## Workarounds for Server-Side Functionality

### 1. PHP Proxy for API Requests

**Problem:** Need to call external APIs with CORS issues or hide API keys

**Solution:** PHP proxy script

```php
<?php
// api-proxy.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

$apiUrl = 'https://external-api.com/endpoint';
$apiToken = 'your-secret-token'; // Server-side, not exposed to client

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $apiToken,
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

http_response_code($httpCode);
echo $response;
?>
```

**Frontend usage:**
```javascript
// Call your PHP proxy instead of external API directly
const response = await fetch('/api-proxy.php?endpoint=your-path');
const data = await response.json();
```

### 2. Contact Form Without Database

**Problem:** Need form submission but no Node.js API routes

**Solution:** PHP mail handler

```php
<?php
// contact-form.php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Sanitize input
    $name = htmlspecialchars(strip_tags(trim($_POST['name'])));
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $message = htmlspecialchars(strip_tags(trim($_POST['message'])));

    // Validate
    if (empty($name) || !filter_var($email, FILTER_VALIDATE_EMAIL) || empty($message)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid input']);
        exit;
    }

    // Email configuration
    $to = "your-email@example.com";
    $subject = "Contact Form: " . $name;
    $body = "Name: $name\n";
    $body .= "Email: $email\n\n";
    $body .= "Message:\n$message\n";

    $headers = "From: $email\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    // Send
    if (mail($to, $subject, $body, $headers)) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to send email']);
    }
}
?>
```

**Alternative: Use third-party service**
- Formspree, Formsubmit, Web3Forms
- No server-side code needed
- Free tiers available

### 3. Dynamic Content via Headless CMS

**Problem:** Need content management without database

**Solution:** The VP Associates project already uses this approach
- WordPress REST API at `vp-associates.com/wp-json`
- Static site generation with client-side data fetching
- No server-side processing needed on cPanel

### 4. CGI for Compiled Binaries

**Problem:** Need server-side processing without PHP/Node.js

**Solution:** CGI scripts (Go, Rust binaries)

**Go CGI Example:**
```go
package main

import (
    "fmt"
    "log"
    "net/http/cgi"
)

func main() {
    if err := cgi.Serve(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        fmt.Fprintf(w, `{"message": "Hello from Go CGI"}`)
    })); err != nil {
        log.Fatal(err)
    }
}
```

**Compile:**
```bash
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o myapp
```

**Deploy:**
- Upload to `public_html/cgi-bin/`
- Set permissions: `chmod 755 myapp`
- Access via: `https://domain.com/cgi-bin/myapp`

**Note:** Many shared hosts restrict CGI execution; verify with hosting provider.

## Feature Dependencies

```
Static Site Generation (Nuxt generate)
    └──requires──> SPA Routing (.htaccess)
                    └──requires──> Apache mod_rewrite (available)

Server-Side Functionality
    ├──option 1──> PHP Scripts (available)
    ├──option 2──> CGI Binaries (limited, host-dependent)
    └──option 3──> External APIs (recommended)
```

## MVP Recommendation for cPanel Deployment

**Must Have:**
- [ ] Nuxt static export (`npm run generate`)
- [ ] `.htaccess` for SPA routing
- [ ] Gzip compression enabled
- [ ] Browser caching headers
- [ ] Contact form via PHP or third-party service

**Cannot Do (without external services):**
- Server-side rendering
- API routes (use PHP proxy or external API instead)
- Server middleware
- Runtime environment variables

## Deployment Strategy for VP Associates Nuxt Site

### Step 1: Configure for Static Export

**nuxt.config.ts:**
```typescript
export default defineNuxtConfig({
  ssr: false,  // Disable SSR for static-only hosting
  nitro: {
    preset: 'static'  // Static generation
  },
  app: {
    baseURL: './',  // Relative paths for cPanel
    head: {
      htmlAttrs: {
        lang: 'en'
      }
    }
  }
})
```

### Step 2: Build Static Site

```bash
npm run generate
```

Output: `.output/public/` directory with all static files

### Step 3: Upload to cPanel

1. Compress `.output/public/` contents
2. Upload to `public_html/` via cPanel File Manager or FTP
3. Extract contents

### Step 4: Create .htaccess

Create `.htaccess` in `public_html/`:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>

<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript
</IfModule>
```

### Step 5: Contact Form Workaround

**Option A: PHP Handler** (if PHP available)
- Create `contact.php` with mail logic
- Update Nuxt form to POST to `/contact.php`

**Option B: Third-party** (recommended for simplicity)
- Formspree: Create form at formspree.io
- Update Nuxt form action to Formspree endpoint
- No server code needed

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Static file hosting | HIGH | Standard Apache functionality |
| .htaccess SPA routing | HIGH | Well-documented Apache pattern |
| PHP 8.1-8.3 support | MEDIUM | EasyApache 4 supports; exact versions vary by host |
| Node.js support | HIGH | Confirmed NOT available on standard cPanel 110 shared hosting |
| CGI binary support | LOW | Host-dependent; often restricted |
| Email functionality | MEDIUM | mail() works but unreliable; PHPMailer better |

## Gaps to Address

1. **Node.js Application Manager:** Some cPanel hosts offer Node.js via "Setup Node.js App" feature. Verify with hosting provider if this is available.

2. **CGI Support:** Varies significantly between hosts. Need to test actual hosting environment.

3. **Email Deliverability:** Shared hosting IP addresses often have poor reputation. Consider using SMTP relay service (Sendgrid, Mailgun, Resend).

4. **Rate Limiting:** No built-in rate limiting for forms. Consider:
   - Cloudflare layer (if available)
   - Third-party form services
   - Simple PHP session-based limiting

## Sources

- [cPanel 110 Release Notes](https://docs.cpanel.net/release-notes/110-release-notes/) - Official release documentation
- [Nuxt Static Deployment Guides](https://nuxt.com/docs/getting-started/deployment#static-hosting) - Nuxt 3 static generation
- [Apache mod_rewrite Documentation](https://httpd.apache.org/docs/current/mod/mod_rewrite.html) - URL rewriting capabilities
- Various community resources on cPanel hosting, SPA deployment, and PHP workarounds (2025-2026)

---
*Research for: VP Associates Nuxt Deployment to cPanel 110.0.88*
*Researched: 2026-02-23*
