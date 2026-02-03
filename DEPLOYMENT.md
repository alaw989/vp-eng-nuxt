# Deployment Guide - VP Associates Nuxt 3 Website

This guide covers deploying the VP Associates website to Digital Ocean using GitHub Actions.

## Prerequisites

1. **GitHub Repository**
   - Create a new GitHub repository for the project
   - Push the code to GitHub (see "Initial Setup" below)

2. **Digital Ocean Account**
   - Create a Digital Ocean account at https://www.digitalocean.com
   - Choose deployment option: App Platform (recommended) or Droplet

3. **Digital Ocean Access Token**
   - Generate a Personal Access Token in Digital Ocean dashboard
   - Settings > API > Tokens/New Token
   - Save the token - you'll need it for GitHub Secrets

## Initial Setup

### 1. Create GitHub Repository

```bash
# From the project directory
cd /home/deck/Sites/vp-eng-nuxt

# Add GitHub remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/vp-eng-nuxt.git

# Push to GitHub (using main branch)
git branch -M main
git push -u origin main
```

### 2. Configure GitHub Secrets

Navigate to your GitHub repository settings and add the following secrets:

**Settings > Secrets and variables > Actions > New repository secret**

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `DIGITALOCEAN_ACCESS_TOKEN` | Your Digital Ocean API token | Token for DO API access |
| `NUXT_PUBLIC_SITE_URL` | `https://vp-associates.com` | Production site URL |

### 3. Configure Digital Ocean

#### Option A: App Platform (Recommended)

1. Go to Digital Ocean Dashboard > Apps
2. Click "Create App"
3. Select "GitHub" as source
4. Choose your repository and branch (main)
5. Digital Ocean will detect Nuxt app automatically
6. Configure the app:

**Build Settings:**
- Build Command: `npm run build`
- Run Command: `npm run start`
- Output Directory: `.output`

**Environment Variables:**
- `NODE_ENV`: `production`
- `NUXT_PUBLIC_SITE_URL`: `https://vp-associates.com`
- `PORT`: `3000`

**Instance Size:**
- Basic (Basic XXS for development/small traffic)
- Scale up as needed

7. Deploy!

#### Option B: Droplet (VPS)

1. Create a new Droplet (Ubuntu 22.04 LTS recommended)
2. SSH into the droplet
3. Install Node.js 20.x:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
4. Install PM2 for process management:
   ```bash
   sudo npm install -g pm2
   ```
5. Clone your repository
6. Install dependencies and build:
   ```bash
   npm ci
   npm run build
   ```
7. Start with PM2:
   ```bash
   pm2 start npm --name "vp-associates" -- start
   pm2 save
   pm2 startup
   ```
8. Configure Nginx reverse proxy (optional but recommended):
   ```nginx
   server {
       listen 80;
       server_name vp-associates.com www.vp-associates.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## GitHub Actions CI/CD

The project includes a GitHub Actions workflow for automated deployment:

**File:** `.github/workflows/deploy.yml`

### Workflow Triggers:
- Push to `main` or `master` branch
- Manual trigger via GitHub Actions UI

### Workflow Steps:
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Build Nuxt application
5. Deploy to Digital Ocean App Platform
6. Notify deployment status

## Environment Variables

### Local Development

Create a `.env` file in the project root (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` with your local settings:
```bash
NUXT_PUBLIC_SITE_URL=http://localhost:3000
NUXT_PUBLIC_WP_API_URL=https://whataustinhasmade.com/vp-eng/wp-json/wp/v2
```

### Production

Set environment variables in Digital Ocean App Platform settings or in your Droplet's `.env` file.

## Deployment Commands

### Local Testing

```bash
# Development server
npm run dev

# Production build (local test)
npm run build

# Preview production build locally
npm run preview
```

### Manual Deployment (Droplet)

```bash
# SSH into your droplet
ssh root@your-droplet-ip

# Navigate to project
cd /path/to/vp-eng-nuxt

# Pull latest changes
git pull origin main

# Install dependencies
npm ci

# Build
npm run build

# Restart PM2
pm2 restart vp-associates
```

## Troubleshooting

### Build Fails

1. Check Node.js version: `node --version` (should be 20.x)
2. Clear cache and rebuild:
   ```bash
   rm -rf .nuxt .output node_modules
   npm install
   npm run build
   ```

### Deploy Returns 404

1. Check `NUXT_PUBLIC_SITE_URL` is set correctly
2. Verify the build output directory is `.output`
3. Check Digital Ocean logs for errors

### Images Not Loading

1. Verify image paths in `/public/images/`
2. Check Nuxt Image module configuration
3. Ensure `@nuxt/image` is installed

### API Routes Not Working

1. Verify `server/api/` routes are properly built
2. Check Nitro preset is set to `node-server` in `nuxt.config.ts`
3. Check server logs for errors

## Performance Optimization

### Pre-rendering Routes

The app pre-renders static routes for better performance. Add routes in `nuxt.config.ts`:

```typescript
nitro: {
  routeRules: {
    '/': { prerender: true },
    '/about': { prerender: true },
    // Add more routes as needed
  },
}
```

### Image Optimization

Images are automatically optimized by `@nuxt/image`:
- Formats: WebP, AVIF
- Quality: 80%
- Responsive sizes configured

## Monitoring

### Digital Ocean App Platform

- View logs in the App Console
- Set up alerts for CPU/memory usage
- Monitor deployment history

### Droplet

```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs vp-associates

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Post-Deployment Checklist

- [ ] Site loads at production URL
- [ ] All pages render correctly
- [ ] Images display properly
- [ ] Contact form submits (if backend configured)
- [ ] SSL certificate is active (HTTPS)
- [ ] Sitemap is accessible: `/sitemap.xml`
- [ ] Robots.txt is accessible: `/robots.txt`
- [ ] Run Lighthouse audit (target >90)
- [ ] Test on mobile devices
- [ ] Test across browsers

## Rollback Procedure

### App Platform

1. Go to App Console
2. Click "Deployments"
3. Select a previous successful deployment
4. Click "Deploy" to redeploy that version

### Droplet

```bash
# Revert to previous commit
git log --oneline
git revert HEAD
# or
git checkout <commit-hash>

# Rebuild and restart
npm run build
pm2 restart vp-associates
```

## Additional Resources

- [Nuxt 3 Deployment](https://nuxt.com/docs/getting-started/deployment)
- [Digital Ocean App Platform](https://docs.digitalocean.com/products/app-platform/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
