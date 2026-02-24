# Nuxt 3 Static Deployment Research

**Domain:** Static Site Generation with WordPress API
**Researched:** 2025-02-23
**Overall confidence:** HIGH

## Executive Summary

Nuxt 3 offers multiple approaches for deploying without a Node.js runtime: pure SPA mode (`ssr: false`), Static Site Generation (`nuxt generate`), and hybrid rendering. For the VP Associates site consuming WordPress REST API, the recommended approach is **SPA mode with client-side data fetching**, as the current architecture uses server-side API proxy routes (`/api/projects/*`, `/api/services/*`) that won't function in static deployments.

The key challenge is that **server routes are not available in static deployments**. The current `server/api/` directory contains Nitro event handlers that proxy WordPress API calls—these require a Node.js server. Static deployment requires refactoring to either: (1) fetch directly from WordPress API on the client side, or (2) pre-render all content at build time using `nuxt generate` with route prerendering.

## Recommended Stack

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **SPA Mode** (`ssr: false`) | Nuxt 3.15 | Client-side only rendering | Simplest migration path, no server routes needed, works with any static host |
| **`useLazyFetch`** | Nuxt 3.15 | Client-side data fetching | Non-blocking fetches that work in SPA mode with pending/error states |
| **Runtime Config** | Nuxt 3.15 | Public API URL | Expose WordPress API URL as public runtime config for client-side access |
| **PWA Module** | @vite-pwa/nuxt | Offline caching | Already configured—caches WordPress API responses with NetworkFirst strategy |

### Alternative: Full Static Site Generation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **`nuxt generate`** | Nuxt 3.15 | Build-time HTML generation | Pre-render all routes at build time, best SEO, truly static |
| **`nitro.prerender.crawlLinks`** | Nitro 2.x | Auto-discovery of routes | Automatically crawl and generate pages linked from known routes |
| **`prerender:routes` hook** | Nuxt 3.15 | Dynamic route registration | Fetch all WordPress slugs at build time and generate routes |

## Deployment Comparison

| Approach | Build Command | Output | Server Routes | SEO | Data Freshness |
|----------|--------------|--------|---------------|-----|----------------|
| **Current (SSR)** | `nuxt build` | `.output/server/` | ✅ Yes | ✅ Excellent | Real-time |
| **SPA Mode** | `nuxt build` | `.output/public/` | ❌ No | ⚠️ Poor (client-rendered) | Real-time |
| **Static Gen** | `nuxt generate` | `.output/public/` | ❌ No | ✅ Excellent | Build-time only |
| **Hybrid** | `nuxt generate` | `.output/public/` | ❌ No | ✅ Good | Per-route config |

## Configuration Changes Required

### Option 1: Pure SPA Mode (Simplest)

**nuxt.config.ts changes:**

```typescript
export default defineNuxtConfig({
  // Add this line to disable SSR
  ssr: false,

  // Keep existing Nitro config but note that server routes won't work
  nitro: {
    preset: 'static',  // Changed from 'node-server'
    // Note: server/api/* routes will NOT be available
  },

  runtimeConfig: {
    public: {
      // Must expose WordPress API URL to client
      wpApiUrl: process.env.NUXT_PUBLIC_WP_API_URL || 'https://www.vp-associates.com/wp-json/wp/v2',
    },
  },
})
```

**Component changes (data fetching):**

```typescript
// BEFORE (uses server API proxy)
const { data: apiResponse, pending, error } = await useFetch(`/api/projects/${slug}`)

// AFTER (fetches directly from WordPress API on client)
const wpApiUrl = useRuntimeConfig().public.wpApiUrl
const { data: apiResponse, pending, error } = await useLazyFetch(
  `${wpApiUrl}/projects?slug=${slug}&_embed=true`,
  { server: false }  // Client-side only
)
```

**Build/deploy commands:**

```bash
# Build (same as current, but with ssr: false)
npm run build

# Deploy .output/public directory to static host
# No Node.js server required
```

### Option 2: Full Static Site Generation (Best SEO)

**nuxt.config.ts changes:**

```typescript
export default defineNuxtConfig({
  // Keep SSR enabled for pre-rendering
  ssr: true,

  nitro: {
    preset: 'static',
    prerender: {
      crawlLinks: true,  // Auto-discover routes by crawling links
      routes: ['/', '/projects', '/services', '/about', '/contact', '/careers', '/search'],
      // Add sitemap and RSS
      failOnError: false,  // Don't fail build if a route fails
    },
    // Server routes still won't work at runtime, but can run during build
  },

  // Hook to generate dynamic routes from WordPress at build time
  hooks: {
    async 'prerender:routes'(ctx) {
      const wpApiUrl = 'https://www.vp-associates.com/wp-json/wp/v2'

      // Fetch all project slugs
      try {
        const projects = await $fetch(`${wpApiUrl}/projects?per_page=100&_fields=slug`)
        for (const project of projects) {
          ctx.routes.add(`/projects/${project.slug}`)
        }
      } catch (e) {
        console.warn('Could not fetch projects for prerendering:', e.message)
      }

      // Fetch all service slugs
      try {
        const services = await $fetch(`${wpApiUrl}/services?per_page=100&_fields=slug`)
        for (const service of services) {
          ctx.routes.add(`/services/${service.slug}`)
        }
      } catch (e) {
        console.warn('Could not fetch services for prerendering:', e.message)
      }

      // Fetch all career slugs
      try {
        const careers = await $fetch(`${wpApiUrl}/careers?per_page=100&_fields=slug`)
        for (const career of careers) {
          ctx.routes.add(`/careers/${career.slug}`)
        }
      } catch (e) {
        console.warn('Could not fetch careers for prerendering:', e.message)
      }
    }
  },
})
```

**package.json scripts:**

```json
{
  "scripts": {
    "generate": "nuxt generate",
    "preview": "nuxt preview"
  }
}
```

**Build/deploy commands:**

```bash
# Generate static site
npm run generate

# Output is in .output/public/
# Deploy to Netlify, Vercel, GitHub Pages, etc.
```

### Option 3: Hybrid Rendering (Flexible)

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    // Static pages - pre-rendered at build time
    '/': { prerender: true },
    '/about': { prerender: true },
    '/contact': { prerender: true },

    // Dynamic listings - pre-render with SWR revalidation
    '/projects': { swr: 3600 },  // Revalidate every hour
    '/services': { swr: 3600 },

    // Dynamic detail pages - client-side only (no build-time knowledge)
    '/projects/**': { ssr: false },
    '/services/**': { ssr: false },
    '/careers/**': { ssr: false },

    // Search - must be client-side
    '/search': { ssr: false },
  },
})
```

## Limitations by Approach

### SPA Mode Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **Poor SEO** | Search engines see empty page initially | Use pre-rendering service or switch to SSG |
| **Slower initial load** | Page content shows after JS loads | Use skeleton loading states (already implemented) |
| **Server routes don't work** | All `/api/*` routes must be replaced | Fetch directly from WordPress API |
| **No server-side caching** | Each client fetches data independently | PWA caching already configured for this |

### Static Generation Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **Build-time data only** | Content updates require rebuild | Set up CI/CD to rebuild on content changes |
| **Longer build times** | More routes = longer builds | Use ISR (SWR) for selective regeneration |
| **Dynamic routes unknown** | Must explicitly declare all routes | Use `prerender:routes` hook to fetch from CMS |
| **Server routes don't work at runtime** | Same as SPA | Same as SPA |

### Server Routes Incompatibility

**Critical:** All files in `server/api/` will NOT function in static deployment.

Current server API routes that must be addressed:
- `/api/projects` → Fetch directly from WordPress
- `/api/projects/[slug]` → Fetch directly from WordPress
- `/api/services` → Fetch directly from WordPress
- `/api/services/[slug]` → Fetch directly from WordPress
- `/api/careers/[slug]` → Fetch directly from WordPress
- `/api/team` → Fetch directly from WordPress
- `/api/testimonials` → Fetch directly from WordPress
- `/api/search` → Client-side search of fetched data
- `/api/contact.post` → Must use external form service (e.g., Formspree, Resend)
- `/api/rss.xml.get` → Pre-render at build time or external service

## Hosting Platform Compatibility

| Platform | SPA Mode | Static Gen | Build Command | Publish Directory |
|----------|----------|------------|---------------|-------------------|
| **Netlify** | ✅ | ✅ | `npm run build` or `npm run generate` | `.output/public` |
| **Vercel** | ✅ | ✅ | `npm run build` or `npm run generate` | `.output/public` |
| **GitHub Pages** | ✅ | ✅ | `npm run generate` | `.output/public` |
| **Cloudflare Pages** | ✅ | ✅ | `npm run generate` | `.output/public` |
| **AWS S3 + CloudFront** | ✅ | ✅ | `npm run generate` | `.output/public` |
| **Firebase Hosting** | ✅ | ✅ | `npm run generate` | `.output/public` |
| **Nginx/Apache** | ✅ | ✅ | `npm run generate` | `.output/public` |

## Migration Path Recommendations

### Phase 1: Quick Win - SPA Mode
1. Add `ssr: false` to `nuxt.config.ts`
2. Change `nitro.preset` from `node-server` to `static`
3. Refactor data fetching to use `useLazyFetch` with direct WordPress API calls
4. Test locally with `npm run build && npm run preview`
5. Deploy to static hosting

**Timeline:** 1-2 days
**Risk:** Low (SEO impact may be acceptable for business site)

### Phase 2: SEO Improvement - Static Generation
1. Enable `ssr: true` with `nitro.preset: 'static'`
2. Add `prerender:routes` hook to fetch all WordPress slugs at build time
3. Use `nuxt generate` instead of `nuxt build`
4. Set up CI/CD pipeline to rebuild on WordPress content changes
5. Add `swr` route rules for incremental regeneration

**Timeline:** 3-5 days
**Risk:** Medium (requires build infrastructure setup)

### Phase 3: Hybrid Approach (Optional)
1. Configure `routeRules` for per-route rendering strategy
2. Pre-render marketing pages (home, about, services listing)
3. Keep dynamic content client-side (project detail, search)
4. Implement ISR for frequently updated content

**Timeline:** 2-3 days (after Phase 2)
**Risk:** Low

## Key Findings

1. **Server routes are incompatible with static deployment** - The current `server/api/` directory structure uses Nitro event handlers that require a Node.js runtime.

2. **WordPress API must be accessed directly from client** - In static mode, there's no server proxy. The WordPress API URL becomes a public runtime config value.

3. **PWA caching is already configured** - The existing `@vite-pwa/nuxt` configuration includes NetworkFirst caching for WordPress API responses, which is ideal for static deployments.

4. **Two viable paths**: Quick migration to SPA mode vs. full static generation with build-time prerendering.

5. **Hybrid rendering offers flexibility** - Route rules allow mixing static, SPA, and SWR strategies within the same application.

## Gaps to Address

- **Contact form handling** - Current `/api/contact.post.ts` server route won't work. Need external form service (Formspree, Resend, Web3Forms).
- **RSS feed generation** - Current `/api/rss.xml.get.ts` server route won't work. Options: pre-render at build time, use external RSS service, or generate on client side.
- **Search functionality** - Current `/api/search.get.ts` server route won't work. Could implement client-side search using `flexsearch` or similar library.
- **Image optimization** - `@nuxt/image` with IPX provider uses server-side optimization. In static mode, may need to switch to static images or external image service (Cloudinary, ImageKit).
- **Sitemap generation** - Current dynamic sitemap won't work. Can use `@nuxtjs/sitemap` module with static configuration or pre-render at build time.

## Sources

- Nuxt 3 Rendering Concepts (official docs) - HIGH confidence
- Nuxt 3 Deployment Guide (official docs) - HIGH confidence
- Nitro Deployment Presets documentation - HIGH confidence
- Nuxt 3 Prerendering documentation - HIGH confidence
- Nuxt 3 useFetch/useLazyFetch API docs - HIGH confidence
- Nuxt 3 routeRules configuration (official docs) - HIGH confidence
- Web search results for "Nuxt 3 static deployment nuxt generate nitro preset 2025" - MEDIUM confidence
- Web search results for "Nuxt 3 SPA mode client-side data fetching patterns" - MEDIUM confidence

---
*Static deployment research for: VP Associates Nuxt 3 Website*
*Researched: 2025-02-23*
