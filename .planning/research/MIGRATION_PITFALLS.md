# Migration Pitfalls Research: SSR/SSG Hybrid to Pure Static

**Domain:** Nuxt 3 Static Site Migration
**Researched:** 2026-02-23
**Confidence:** HIGH

## Executive Summary

Migrating a Nuxt 3 application from SSR/SSG hybrid (`nitro.preset: 'node-server'`) to pure static hosting (`nitro.preset: 'static'`) introduces several categories of breaking changes. The most critical issues are: (1) **Server routes become inaccessible** - all `server/api/*` and `server/routes/*` endpoints cease to function; (2) **SSR-specific composables fail** - `useRequestHeaders()`, `useRequestURL()`, and server-side `useCookie()` calls throw errors or return empty values; (3) **Contact forms and dynamic RSS feeds require external services**; (4) **Image optimization changes** from server-side IPX to static or external services.

This research identifies 11 critical pitfalls, 5 moderate pitfalls, and provides detection strategies, prevention methods, and phase-specific mitigation for each.

## Critical Pitfalls

### Pitfall 1: Server API Routes Become Inaccessible

**What goes wrong:**
All files in `server/api/` and `server/routes/` stop working. Requests to `/api/*` return 404 errors. This breaks:
- WordPress API proxy routes (`/api/projects`, `/api/services`, `/api/team`, etc.)
- Contact form submission (`/api/contact.post`)
- Dynamic RSS feed (`/api/rss.xml.get`)
- Dynamic sitemap (`server/routes/sitemap.xml.ts`)
- Search endpoint (`/api/search`)

**Why it happens:**
Nitro server routes require a Node.js runtime (or serverless function runtime). Static hosting only serves pre-generated HTML, CSS, and JS files. There is no server process to handle API requests.

**Code example - BREAKS in static:**
```typescript
// server/api/projects.get.ts - This file will NOT work in static deployment
export default defineEventHandler(async (event) => {
  // This event handler never executes in static mode
  const response = await $fetch('https://www.vp-associates.com/wp-json/wp/v2/projects')
  return response
})
```

```vue
<!-- Component using server API - BREAKS in static -->
<script setup>
const { data } = await useFetch('/api/projects')
// In static mode, this returns 404 error
</script>
```

**Code example - WORKS in static:**
```vue
<!-- Client-side direct fetch -->
<script setup>
const config = useRuntimeConfig()
const wpApiUrl = config.public.wpApiUrl

const { data, pending, error } = await useLazyFetch(
  `${wpApiUrl}/projects?_embed=true`,
  { server: false }  // Client-side only
)
</script>
```

**Warning signs:**
- Build succeeds but API calls return 404 in production
- Contact form submissions fail silently
- RSS feed returns 404
- Console errors: `Failed to fetch /api/projects`

**Detection strategy:**
```bash
# 1. Audit server routes
find server/api -name "*.ts" | wc -l
find server/routes -name "*.ts" | wc -l

# 2. Search for API route usage in components
grep -r "useFetch.*'/api/" pages/ components/

# 3. Check for server route imports
grep -r "from.*server/" composables/
```

**Prevention:**
1. Before migration, catalog all server routes and their consumers
2. For each route, determine: external API proxy, form handler, or data transformer
3. Replace external API proxies with direct client-side `useLazyFetch`
4. Replace form handlers with external services (Formspree, Resend, Web3Forms)
5. Replace dynamic feeds with build-time generation or external services

**Phase to address:** **Phase 1 - Pre-Migration Audit**
- Must be completed before any static deployment attempt
- Creates inventory of breaking changes

---

### Pitfall 2: useRequestHeaders() Returns Empty Object

**What goes wrong:**
`useRequestHeaders()` is designed to access incoming HTTP request headers during SSR. In static generation, there is no incoming request during build time, and in SPA mode, there is no server at all. The function returns an empty object `{}`, breaking authentication, cookie passing, and header-based logic.

**Why it happens:**
Static sites have no server request context. The function is SSR-specific and has no equivalent in client-side or static environments.

**Code example - BREAKS in static:**
```typescript
// This pattern fails in static mode
const headers = useRequestHeaders(['cookie', 'authorization'])
const { data } = await useFetch('/api/user', {
  headers: {
    cookie: headers.cookie,
    authorization: headers.authorization
  }
})
// headers.cookie is undefined in static mode
```

**Code example - WORKS in static:**
```typescript
// Option 1: Use useCookie for client-side cookie access
const token = useCookie('auth_token')
const { data } = await useFetch('/api/user', {
  headers: {
    authorization: token.value ? `Bearer ${token.value}` : undefined
  }
})

// Option 2: Direct client-side fetch with credentials
const { data } = await useFetch('/api/user', {
  credentials: 'include',  // Includes cookies automatically
  server: false
})
```

**Warning signs:**
- Console shows: `Cannot read property 'cookie' of undefined` or similar
- Authentication flows break immediately
- API calls missing required headers

**Detection strategy:**
```bash
# Find all useRequestHeaders usage
grep -rn "useRequestHeaders" .

# Check for header-based conditional logic
grep -rn "headers\.cookie\|headers\.authorization\|headers\['x-"
```

**Prevention:**
1. Search codebase for all `useRequestHeaders` usage
2. Replace authentication header passing with `useCookie` composable
3. Use `credentials: 'include'` for automatic cookie inclusion
4. Add environment checks: `if (process.server) { ... }` for SSR-only code

**Phase to address:** **Phase 1 - Pre-Migration Audit**

---

### Pitfall 3: useRequestURL() Loses Server Context

**What goes wrong:**
`useRequestURL()` works differently in static vs SSR modes. In SSR, it reflects the incoming request URL. In static/SPA, it reflects the browser's URL, which may not match during build-time pre-rendering. This breaks:
- Dynamic OG meta tags based on URL
- Language detection from hostname
- Environment-specific API URLs

**Why it happens:**
During static generation, there is no actual incoming request. The URL is either the build server's URL (undefined) or a placeholder.

**Code example - POTENTIAL ISSUE:**
```typescript
// In nuxt.config.ts or plugin
const url = useRequestURL()
const apiUrl = url.hostname === 'localhost'
  ? 'https://dev-api.example.com'
  : 'https://api.example.com'
// During static build, url.hostname is not what you expect
```

**Code example - WORKS in static:**
```typescript
// Use runtime config for environment-specific values
const config = useRuntimeConfig()
const apiUrl = config.public.apiUrl  // Set via environment variable
```

**Warning signs:**
- Meta tags showing wrong URLs in production
- API calls going to wrong environment
- Language detection failing

**Detection strategy:**
```bash
grep -rn "useRequestURL" .
grep -rn "\.hostname\|\.protocol\|\.host" composables/ plugins/
```

**Prevention:**
1. Replace URL-based environment detection with `runtimeConfig`
2. Set environment-specific values via `NUXT_PUBLIC_*` env variables
3. Use `useRoute().path` for path-based logic (works in static)

**Phase to address:** **Phase 1 - Pre-Migration Audit**

---

### Pitfall 4: Server Middleware Stops Executing

**What goes wrong:**
Files in `server/middleware/` don't execute in static mode. This breaks:
- Request logging
- CORS configuration
- Request/response transformation
- Custom authentication middleware

**Why it happens:**
Server middleware runs on every incoming request to the Nitro server. Static hosting serves files directly without a Nitro server process.

**Code example - BREAKS in static:**
```typescript
// server/middleware/cors.ts - Won't execute in static
export default defineEventHandler((event) => {
  setHeader(event, 'Access-Control-Allow-Origin', '*')
  // This never runs in static mode
})
```

**Code example - WORKS in static:**
```typescript
// For client-side CORS, configure the external API
// For static site CORS, configure hosting provider (Netlify/Vercel headers)

// netlify.toml example:
[[headers]]
  for = "/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
```

**Warning signs:**
- CORS errors in browser console
- Headers missing from responses
- Middleware-side effects not occurring

**Detection strategy:**
```bash
# List all server middleware
ls -la server/middleware/

# Check for middleware configuration
grep -rn "serverMiddleware\|routeMiddleware" nuxt.config.ts
```

**Prevention:**
1. Move CORS configuration to hosting provider headers
2. Replace request logging with external analytics
3. Replace authentication middleware with client-side checks
4. Use `routeRules` for cache headers (works in static)

**Phase to address:** **Phase 2 - Configuration Migration**

---

### Pitfall 5: Contact Form Submission Fails

**What goes wrong:**
The `/api/contact.post.ts` server route that handles form submissions becomes inaccessible. Form submissions fail silently or with 404 errors.

**Current implementation:**
The existing `server/api/contact.post.ts` uses:
- `getRequestHeader()` to get client IP for rate limiting
- `readBody()` to parse form data
- Resend API to send emails
- In-memory rate limiting (`submissionLog` Map)

**Why it happens:**
Static hosting has no server process to handle POST requests.

**Code example - BREAKS in static:**
```vue
<script setup>
const submitForm = async () => {
  await $fetch('/api/contact', {
    method: 'POST',
    body: formData
  })
  // 404 error in static mode
}
</script>
```

**Code example - WORKS in static:**

**Option 1: Formspree (simplest)**
```vue
<script setup>
const submitForm = async () => {
  await $fetch('https://formspree.io/f/YOUR_FORM_ID', {
    method: 'POST',
    body: formData
  })
}
</script>
```

**Option 2: Resend with client-side call**
```vue
<script setup>
// NOTE: This exposes Resend API key - not recommended
// Use serverless function instead
const submitForm = async () => {
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${runtimeConfig.public.resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'onboarding@resend.dev',
      to: 'info@vp-associates.com',
      subject: 'New contact form submission',
      html: formData.message
    })
  })
}
</script>
```

**Warning signs:**
- Form submissions fail with 404
- Network error in console
- No email received after submission

**Detection strategy:**
```bash
# Find form API usage
grep -rn "/api/contact" components/ pages/
grep -rn "\.post(" server/api/
```

**Prevention:**
1. **Recommended:** Replace with Formspree or Web3Forms (no server needed)
2. **Alternative:** Deploy contact form as serverless function (Vercel/Netlify Functions)
3. **Last resort:** Keep entire app on serverful hosting for form handling

**Phase to address:** **Phase 3 - Function Replacement**
- Form handling must be replaced before full static deployment
- Can use hybrid approach with form on serverless

---

### Pitfall 6: Dynamic RSS Feed Generation Fails

**What goes wrong:**
The `/api/rss.xml.get.ts` route that dynamically generates RSS feeds from WordPress content becomes inaccessible. The `/rss.xml` URL returns 404.

**Why it happens:**
RSS generation is currently server-side, fetching data from WordPress API and returning XML. Static hosting has no server to execute this handler.

**Current implementation analysis:**
```typescript
// server/api/rss.xml.get.ts
export default defineEventHandler(async (event) => {
  // Uses useRuntimeConfig(), setHeader(), returns XML
  // All server-side functionality
})
```

**Code example - WORKS in static:**

**Option 1: Pre-render at build time**
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    prerender: {
      routes: ['/rss.xml']
    }
  }
})
// Keep server/api/rss.xml.get.ts - it runs during build
```

**Option 2: External RSS service**
- Use RSS.app, RSS Hub, or WordPress built-in RSS
- Link to external RSS URL in `<head>`

**Option 3: Generate static file**
```typescript
// scripts/generate-rss.ts - Run at build time
const fs = await import('fs/promises')
const rssContent = generateRSSXml()
await fs.writeFile('.output/public/rss.xml', rssContent)
```

**Warning signs:**
- `/rss.xml` returns 404
- RSS validators fail
- Feed readers can't subscribe

**Detection strategy:**
```bash
# Check RSS route
grep -rn "rss\.xml" nuxt.config.ts components/ head/

# Test RSS endpoint
curl https://yoursite.com/rss.xml
```

**Prevention:**
1. Add `/rss.xml` to `nitro.prerender.routes` for build-time generation
2. Or set up external RSS generation via webhook/CI
3. Update head link to point to correct URL

**Phase to address:** **Phase 2 - Configuration Migration**

---

### Pitfall 7: Server-Side Storage (useStorage) Fails

**What goes wrong:**
`useStorage()` calls in server routes fail. The current API proxy routes use in-memory storage for caching:
```typescript
// server/api/projects.get.ts
const projectsStorage = useStorage('projects')
const cached = await projectsStorage.getItem(cacheKey)
```

This caching breaks in static mode.

**Why it happens:**
Nitro storage is a server-side feature. Static hosting has no persistent storage layer.

**Code example - BREAKS in static:**
```typescript
// In server route
const storage = useStorage()
await storage.setItem('key', value)
// Fails or doesn't persist in static mode
```

**Code example - WORKS in static:**

**Option 1: Remove caching, fetch directly**
```typescript
// In component, client-side
const { data } = await useLazyFetch(`${wpApiUrl}/projects`, {
  server: false
})
```

**Option 2: Use PWA caching (already configured)**
```typescript
// nuxt.config.ts PWA config already includes:
runtimeCaching: [{
  urlPattern: /^https:\/\/www\.vp-associates\.com\/wp-json\/wp\/v2\/.*/i,
  handler: 'NetworkFirst',
  // ... caching config
}]
```

**Warning signs:**
- Caching errors in build logs
- Data not caching as expected
- `useStorage is not defined` errors

**Detection strategy:**
```bash
# Find all useStorage usage
grep -rn "useStorage" server/
```

**Prevention:**
1. Remove server-side storage usage
2. Rely on PWA caching for client-side caching
3. Use CDN caching headers via hosting provider

**Phase to address:** **Phase 1 - Pre-Migration Audit**

---

### Pitfall 8: Image Optimization (IPX) Stops Working

**What goes wrong:**
The `@nuxt/image` module with `provider: 'ipx'` uses server-side image optimization. In static mode, images fail to optimize or return 404.

**Current configuration:**
```typescript
// nuxt.config.ts
image: {
  provider: 'ipx',  // Server-side optimization
  quality: 80,
  format: ['webp', 'jpg'],
}
```

**Why it happens:**
IPX (Nuxt Image Optimization) is a Nitro server feature. Static hosting can't run the optimization server.

**Code example - BREAKS in static:**
```vue
<NuxtImg
  src="/images/project.jpg"
  width="800"
  quality="80"
/>
<!-- Returns 404 for optimized image in static mode -->
```

**Code example - WORKS in static:**

**Option 1: Use static images (pre-optimize)**
```bash
# Pre-optimize images before deployment
# Use sharp, imagemin, or external service
```

**Option 2: Switch to external provider**
```typescript
// nuxt.config.ts
image: {
  provider: 'cloudinary' | 'imagekit' | 'twicpics',
  // Configure external service
}
```

**Option 3: Use static provider with presized images**
```typescript
image: {
  provider: 'static',  // No server-side optimization
  // Presize all images during build
}
```

**Warning signs:**
- Images return 404
- `/_ipx/` URLs fail
- Optimized image formats not served

**Detection strategy:**
```bash
# Check image provider config
grep -A5 "image:" nuxt.config.ts

# Test image URLs in production
curl -I https://yoursite.com/_ipx/...
```

**Prevention:**
1. Pre-optimize all images during build process
2. Or switch to external image optimization service
3. Use `provider: 'static'` with presized assets

**Phase to address:** **Phase 3 - Function Replacement**

---

### Pitfall 9: Hydration Mismatches from Server-Side Data

**What goes wrong:**
When moving to static/SPA, components that previously received server-fetched data now receive nothing on initial render. This causes hydration mismatches:

```
[HMR] [Vue warn]: Hydration mismatch: The client-side rendered virtual DOM tree is not matching the server-rendered content.
```

**Why it happens:**
Server-side data fetching (`useAsyncData` with `server: true`) no longer runs. Components render empty states on server but populated states on client.

**Code example - CAUSES hydration mismatch:**
```vue
<script setup>
// In SSR: data is fetched on server, HTML contains content
// In SPA: data is undefined on initial render, HTML is empty
const { data } = await useAsyncData('projects', () =>
  $fetch('/api/projects')
)
</script>

<template>
  <div v-if="data">{{ data.length }} projects</div>
  <div v-else>Loading...</div>
  <!-- Server renders "Loading", client renders "X projects" -->
</template>
```

**Code example - WORKS in static:**
```vue
<script setup>
// Explicitly client-side only
const { data, pending } = await useLazyFetch('/api/projects', {
  server: false
})
</script>

<template>
  <div v-if="pending">Loading...</div>
  <div v-else>{{ data?.length }} projects</div>
  <!-- Both server and client show "Loading" initially -->
</template>
```

**Warning signs:**
- Hydration mismatch warnings in console
- Content flashing/flickering on load
- Layout shift during page load

**Detection strategy:**
```bash
# Run development build and check console
npm run build && npm run preview

# Look for hydration warnings
```

**Prevention:**
1. Use `useLazyFetch` with `server: false` for all data fetching
2. Ensure loading states match between server and client
3. Use `<ClientOnly>` for components that require client-side data
4. Add `key` attributes to lists to prevent key mismatches

**Phase to address:** **Phase 2 - Configuration Migration**

---

### Pitfall 10: Dynamic Sitemap Generation Fails

**What goes wrong:**
The `server/routes/sitemap.xml.ts` route that fetches all WordPress slugs and generates a dynamic sitemap becomes inaccessible.

**Current implementation:**
```typescript
// server/routes/sitemap.xml.ts
export default defineEventHandler(async (event) => {
  // Fetches services/projects from WordPress
  // Generates XML dynamically
  // Returns at build time or runtime
})
```

**Why it happens:**
Dynamic sitemap requires server to execute. Static hosting can only serve pre-generated files.

**Code example - WORKS in static:**

**Option 1: Pre-render at build time**
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    prerender: {
      routes: ['/sitemap.xml']
    }
  }
})
// server/routes/sitemap.xml.ts runs during build only
```

**Option 2: Use @nuxtjs/sitemap module with static config**
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/sitemap'],
  sitemap: {
    urls: [
      { loc: '/', changefreq: 'daily' },
      { loc: '/about', changefreq: 'monthly' },
      // Must manually list all routes
    ]
  }
})
```

**Option 3: External sitemap generation**
- Use CI to generate sitemap from WordPress API
- Commit to repo or deploy separately

**Warning signs:**
- `/sitemap.xml` returns 404
- Google Search Console shows sitemap errors
- New pages not indexed

**Detection strategy:**
```bash
# Check sitemap endpoint
curl https://yoursite.com/sitemap.xml

# Validate sitemap
# Use Google Search Console or online validator
```

**Prevention:**
1. Add `/sitemap.xml` to prerender routes
2. Or use static sitemap module with manual URL list
3. Or generate via CI/CD on content changes

**Phase to address:** **Phase 2 - Configuration Migration**

---

### Pitfall 11: Rate Limiting and Security Middleware Lost

**What goes wrong:**
Server-side rate limiting (in-memory Map) and security checks in `/api/contact.post.ts` are lost. This exposes forms to abuse.

**Current implementation:**
```typescript
// server/api/contact.post.ts
const submissionLog = new Map<string, number[]>()
const RATE_LIMIT_WINDOW = 60 * 60 * 1000
// In-memory storage is lost on static deploy
```

**Why it happens:**
Static hosting has no server process to maintain in-memory state or execute middleware.

**Code example - WORKS in static:**

**Option 1: Use external form service with built-in protection**
- Formspree: Includes rate limiting, spam protection
- Web3Forms: Includes CAPTCHA, rate limiting
- No server-side code needed

**Option 2: Client-side CAPTCHA**
```vue
<script setup>
// Use Google reCAPTCHA or hCaptcha
// Verify token before submission
</script>

<template>
  <div class="h-captcha" data-sitekey="YOUR_KEY"></div>
</template>
```

**Option 3: Serverless function with Redis/upstash**
```typescript
// Deploy as Vercel/Netlify function with Redis rate limiting
import { Redis } from '@upstash/redis'
const redis = new Redis({ /* ... */ })
```

**Warning signs:**
- Increase in spam submissions
- No rate limiting errors
- Form abuse without detection

**Detection strategy:**
```bash
# Find rate limiting code
grep -rn "rate.*limit\|RATE_LIMIT" server/

# Check for in-memory security storage
grep -rn "Map<.*number" server/
```

**Prevention:**
1. **Recommended:** Use external form service with built-in security
2. Add client-side CAPTCHA (hCaptcha invisible preferred)
3. If using serverless, add Redis-backed rate limiting

**Phase to address:** **Phase 3 - Function Replacement**

## Moderate Pitfalls

### Pitfall 12: Environment Variable Leaks

**What goes wrong:**
`runtimeConfig` values that were server-only may leak into client bundles. Specifically, `process.env` values referenced in client code become visible in browser.

**Code example - LEAKS to client:**
```typescript
// nuxt.config.ts
runtimeConfig: {
  wpApiUrl: process.env.WP_API_URL,  // This can leak
  public: {
    wpApiUrl: process.env.NUXT_PUBLIC_WP_API_URL,  // Explicitly public
  }
}
```

**Prevention:**
1. Use `NUXT_PUBLIC_*` prefix for client-accessible values
2. Keep sensitive values (API keys) out of `runtimeConfig.public`
3. Use server-side only for truly private values (won't work in static anyway)

**Phase to address:** **Phase 1 - Pre-Migration Audit**

---

### Pitfall 13: Search Functionality Changes

**What goes wrong:**
The `/api/search.get.ts` endpoint that searches WordPress content becomes inaccessible. Search must be reimplemented client-side.

**Current implementation:**
```typescript
// server/api/search.get.ts
export default defineEventHandler(async (event) => {
  // Fetches from WordPress API
  // Searches and ranks results
  // Returns JSON
})
```

**Code example - WORKS in static:**

**Option 1: Client-side search with flexsearch**
```vue
<script setup>
import FlexSearch from 'flexsearch'

// Fetch all content once, index client-side
const { data: allContent } = await useFetch(wpApiUrl + '/content')
const index = new FlexSearch.Index()

// Index on mount
onMounted(() => {
  allContent.value.forEach(item => {
    index.add(item.id, item.title + ' ' + item.description)
  })
})

function search(query) {
  return index.search(query)
}
</script>
```

**Option 2: External search service**
- Algolia
- Typesense
- Google Programmable Search

**Phase to address:** **Phase 3 - Function Replacement**

---

### Pitfall 14: PWA Service Worker Registration Issues

**What goes wrong:**
PWA service worker may not register correctly in static mode, especially if using `nitro.preset: 'static'`. The `registerWebManifestInRouteRules` option may not work as expected.

**Current configuration:**
```typescript
// nuxt.config.ts
pwa: {
  registerWebManifestInRouteRules: true,
  // ...
}
```

**Prevention:**
1. Test PWA functionality thoroughly after migration
2. Manually verify service worker registration in browser DevTools
3. Check that manifest.json is accessible

**Phase to address:** **Phase 4 - Testing & Verification**

---

### Pitfall 15: Build-Time Data Availability

**What goes wrong:**
When using `nuxt generate`, external APIs must be accessible during build. If WordPress API is down or slow, the build fails or times out.

**Code example - FAILS at build time:**
```typescript
// nuxt.config.ts
hooks: {
  async 'prerender:routes'(ctx) {
    // This runs during build
    const projects = await $fetch('https://www.vp-associates.com/wp-json/wp/v2/projects')
    // If API is down, build fails
  }
}
```

**Prevention:**
1. Add timeout and error handling in prerender hooks
2. Use `failOnError: false` in nitro config
3. Provide fallback routes if API is unavailable
4. Consider CI/CD build with API fallback

**Phase to address:** **Phase 2 - Configuration Migration**

---

### Pitfall 16: Page Transition Animation Glitches

**What goes wrong:**
The `middleware/transition-direction.global.ts` file may cause issues in static/SPA mode if page transitions don't complete cleanly before route changes.

**Current implementation:**
```typescript
// middleware/transition-direction.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  // Sets transition names based on route pairs
})
```

**Prevention:**
1. Test all page transitions after migration
2. Add transition end handling before navigation
3. Consider disabling complex transitions if issues persist

**Phase to address:** **Phase 4 - Testing & Verification**

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Keep server routes "for now" | Faster initial migration | Ongoing hosting costs, can't fully migrate to static | Never - blocks static deployment |
| Mixed API usage (some proxy, some direct) | Incremental changes | Confusing code, harder to debug | During migration phase only |
| Skip form handling | Faster deployment | Lost contact submissions | Only if form not critical |
| Ignore hydration warnings | App still "works" | Poor UX, potential React/Vue errors | Never |
| Build-time only API access | Simpler code | Stale content, requires rebuilds | If content updates are infrequent |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| WordPress API | Using server proxy routes | Fetch directly from client with `useLazyFetch` |
| Contact Form | Keeping `/api/contact.post` | Use Formspree, Web3Forms, or serverless function |
| RSS Feed | Dynamic server generation | Pre-render at build time or use WordPress RSS |
| Sitemap | Server route generation | Pre-render or use static sitemap module |
| Search | Server-side search | Client-side FlexSearch or external service |
| Images | IPX server optimization | Pre-optimize or external service (Cloudinary) |
| Analytics | Server-side logging | Client-side analytics (Google Analytics, Plausible) |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Waterfall API calls | Slow page load, sequential loading | Use `useLazyFetch` with `server: false`, parallel calls | SPA mode with multiple API calls |
| No caching | Repeated API calls, slow navigation | PWA caching already configured, ensure it works | All static deployments |
| Large bundle sizes | Slow initial load | Keep server routes out of client bundle | When moving to SPA |
| No pre-rendering | Poor SEO, empty initial HTML | Use `nuxt generate` for critical pages | SEO-critical sites |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| API keys in runtimeConfig.public | Exposed in browser bundle | Use `NUXT_PUBLIC_*` only for non-sensitive values |
| No rate limiting on forms | Spam, abuse | Use external form service with built-in protection |
| No input sanitization | XSS attacks | Keep sanitization in form validation composables |
| Exposed WordPress API | Content scraping, API abuse | Use CORS on WordPress, consider authentication |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No loading states | Content flashes, appears broken | Use `pending` from `useLazyFetch` for loading indicators |
| Broken page transitions | Jarring navigation | Test transitions, simplify if needed |
| No offline indication | Confusion when offline | PWA already configured, ensure offline page works |
| Form submission errors | Lost submissions, user frustration | Clear error messages, retry functionality |

## "Looks Done But Isn't" Checklist

- [ ] **Contact Form:** API route removed but external service not configured - Verify form submits successfully to external service
- [ ] **RSS Feed:** /rss.xml returns 404 - Verify feed is accessible and validates
- [ ] **Sitemap:** /sitemap.xml returns 404 - Verify sitemap includes all pages
- [ ] **Images:** Optimized images return 404 - Verify all images load, check for /_ipx/ URLs
- [ ] **Search:** Search returns 404 or empty - Verify search works client-side
- [ ] **API Routes:** All /api/* calls return 404 - Verify all data fetching converted to direct WordPress API calls
- [ ] **Hydration:** Console shows hydration warnings - Verify no mismatches between server and client render
- [ ] **PWA:** Service worker doesn't register - Verify PWA works in production

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Server routes not working | LOW | Refactor to client-side `useLazyFetch` or use external service |
| Hydration mismatches | MEDIUM | Add `server: false` to all `useFetch` calls, ensure loading states match |
| Form submission fails | LOW | Integrate Formspree (5 min) or set up serverless function (1-2 hours) |
| Images not loading | MEDIUM | Pre-optimize images or switch to external service (1-2 days) |
| RSS/Sitemap 404 | LOW | Add to prerender routes or use external generation (1 hour) |
| API keys exposed | HIGH | Rotate keys, move to environment variables (varies) |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Server routes inaccessible | Phase 1 - Pre-Migration Audit | Catalog all routes and consumers |
| useRequestHeaders failures | Phase 1 - Pre-Migration Audit | Search codebase, replace with useCookie |
| useRequestURL context loss | Phase 1 - Pre-Migration Audit | Replace with runtimeConfig |
| Server middleware stops | Phase 2 - Configuration Migration | Move to hosting config or remove |
| Contact form fails | Phase 3 - Function Replacement | Integrate external form service |
| RSS feed fails | Phase 2 - Configuration Migration | Add to prerender routes |
| Server storage fails | Phase 1 - Pre-Migration Audit | Remove, rely on PWA caching |
| Image optimization fails | Phase 3 - Function Replacement | Pre-optimize or external service |
| Hydration mismatches | Phase 2 - Configuration Migration | Use `server: false`, test thoroughly |
| Sitemap fails | Phase 2 - Configuration Migration | Pre-render or static module |
| Rate limiting lost | Phase 3 - Function Replacement | Use service with built-in protection |
| Search fails | Phase 3 - Function Replacement | Implement client-side search |
| PWA issues | Phase 4 - Testing & Verification | Test service worker registration |
| Build-time API access | Phase 2 - Configuration Migration | Add error handling, timeouts |
| Page transition glitches | Phase 4 - Testing & Verification | Test all navigation paths |

## Migration Checklist by Phase

### Phase 1: Pre-Migration Audit (Week 1)
- [ ] Catalog all `server/api/*` routes and their consumers
- [ ] Catalog all `server/routes/*` files
- [ ] Search for all `useRequestHeaders` usage
- [ ] Search for all `useRequestURL` usage
- [ ] Search for all `useStorage` usage
- [ ] Review `runtimeConfig` for potential leaks
- [ ] Document all data fetching patterns

### Phase 2: Configuration Migration (Week 1-2)
- [ ] Update `nuxt.config.ts`: `ssr: false` or `nitro.preset: 'static'`
- [ ] Add `nitro.prerender.routes` for RSS and sitemap
- [ ] Configure route rules for cache headers
- [ ] Set up PWA testing
- [ ] Update data fetching to use `useLazyFetch` with `server: false`
- [ ] Test build locally: `npm run build && npm run preview`

### Phase 3: Function Replacement (Week 2-3)
- [ ] Replace contact form with Formspree or serverless function
- [ ] Replace image optimization (pre-optimize or external service)
- [ ] Implement client-side search or external service
- [ ] Verify all API route usage replaced

### Phase 4: Testing & Verification (Week 3-4)
- [ ] Test all page transitions
- [ ] Verify PWA service worker registration
- [ ] Test form submission end-to-end
- [ ] Verify RSS feed accessibility
- [ ] Verify sitemap accessibility and validity
- [ ] Test all images load correctly
- [ ] Verify search functionality
- [ ] Check console for hydration warnings
- [ ] Test offline functionality
- [ ] Deploy to staging and full regression test

## Current Codebase Analysis

Based on the existing VP Associates Nuxt 3 application:

**Server API Routes to Replace:**
| Route | Type | Replacement Strategy |
|-------|------|---------------------|
| `/api/projects` | GET WordPress proxy | `useLazyFetch(wpApiUrl + '/projects')` |
| `/api/projects/[slug]` | GET WordPress proxy | `useLazyFetch(wpApiUrl + '/projects?slug=')` |
| `/api/services` | GET WordPress proxy | `useLazyFetch(wpApiUrl + '/services')` |
| `/api/services/[slug]` | GET WordPress proxy | `useLazyFetch(wpApiUrl + '/services?slug=')` |
| `/api/careers/[slug]` | GET WordPress proxy | `useLazyFetch(wpApiUrl + '/careers?slug=')` |
| `/api/team` | GET WordPress proxy | `useLazyFetch(wpApiUrl + '/team')` |
| `/api/testimonials` | GET WordPress proxy | `useLazyFetch(wpApiUrl + '/testimonials')` |
| `/api/search` | GET search endpoint | Client-side FlexSearch or external |
| `/api/contact` | POST form handler | Formspree or serverless function |
| `/api/rss.xml` | GET RSS feed | Pre-render at build time |
| `/sitemap.xml` | GET sitemap | Pre-render at build time |

**Composables to Update:**
- `useInternalApi.ts` - Entire file uses server API routes, must be refactored
- `useApi.ts` - Direct WordPress API calls, already compatible
- `usePageMeta.ts` - Uses `useRuntimeConfig`, compatible

**Middleware to Review:**
- `middleware/transition-direction.global.ts` - Route transitions, test thoroughly

**Existing Static Fallbacks:**
The codebase already includes static fallback data in `useInternalApi.ts`. This is good for graceful degradation but may hide API failures during migration.

## Sources

- Nuxt 3 Static Site Generation Guide - HIGH confidence
- Nuxt 3 Rendering Concepts Documentation - HIGH confidence
- Nuxt 3 Nitro Presets Documentation - HIGH confidence
- Nuxt 3 Prerendering Documentation - HIGH confidence
- Nuxt 3 `useRequestHeaders` API Documentation - HIGH confidence
- Nuxt 3 `useRequestURL` API Documentation - HIGH confidence
- Nuxt 3 `useFetch`/`useLazyFetch` API Documentation - HIGH confidence
- Nuxt 3 Route Rules Configuration - HIGH confidence
- VP Associates Nuxt 3 Codebase Analysis - HIGH confidence
- Existing `.planning/research/NUXT_STATIC.md` - HIGH confidence
- Web search results for Nuxt 3 static generation pitfalls - MEDIUM confidence
- Web search results for Nuxt 3 Nitro static preset - MEDIUM confidence
- Web search results for SSR to static migration issues - MEDIUM confidence

---
*Migration pitfalls research for: VP Associates Nuxt 3 Website SSR to Static Migration*
*Researched: 2026-02-23*
