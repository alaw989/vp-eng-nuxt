# cPanel Migration Research Summary

**Project:** VP Associates Nuxt 3 Static Migration
**Domain:** Static Site Deployment / cPanel Hosting
**Researched:** 2026-02-23
**Confidence:** HIGH

## Executive Summary

The VP Associates Nuxt 3 website currently runs as an SSR/SSG hybrid with Node.js server routes that proxy WordPress API calls, handle contact forms, generate RSS feeds, and provide search functionality. Migrating to cPanel shared hosting requires converting to a pure static deployment since **cPanel 110 does NOT support Node.js natively** on standard shared hosting plans. The recommended approach is a **two-phase migration**: first convert to SPA mode with client-side data fetching (quickest path), then optionally implement full static site generation with build-time pre-rendering for better SEO.

The most critical finding is that **all server-side routes will become inaccessible**. The current `server/api/` directory contains Nitro event handlers that require a Node.js runtime—these must be replaced with either direct client-side API calls (for WordPress content), third-party SaaS services (for contact forms), or build-time generation (for RSS/sitemap). Research identifies Web3Forms (250 free submissions/month), Fuse.js for client-side search, and build-time RSS generation as viable replacements. The existing PWA caching configuration already handles WordPress API responses optimally for static deployments.

Key risks include SEO degradation in pure SPA mode (mitigated by `nuxt generate` pre-rendering), contact form downtime during migration (mitigated by external form service), and potential image optimization failures with IPX provider (switch to static provider or pre-optimize images). The migration timeline is estimated at 1-2 weeks with proper testing.

## Key Findings

### Recommended Stack

**From NUXT_STATIC.md:**

The recommended approach depends on SEO requirements and time constraints:

**Quick Path (1-2 days):** Pure SPA mode with `ssr: false` and client-side `useLazyFetch` for WordPress API calls. Simplest migration, works with any static host, but poorer SEO.

**Optimal Path (3-5 days):** Full static site generation with `nuxt generate`, `nitro.prerender.crawlLinks: true`, and a `prerender:routes` hook to fetch all WordPress slugs at build time. Best SEO, truly static, requires CI/CD pipeline.

**Core technologies:**
- **Nuxt 3 SPA mode** (`ssr: false`) — Client-side only rendering for simplest static hosting
- **`useLazyFetch`** — Non-blocking client-side data fetching with pending/error states
- **Nuxt Static Generation** (`nuxt generate`) — Build-time HTML pre-rendering for SEO-critical pages
- **Runtime Config** — Public WordPress API URL exposure for client-side access
- **PWA Module** — Already configured with NetworkFirst caching for WordPress API responses

### cPanel Capabilities

**From CPANEL_CAPABILITIES.md:**

cPanel 110.0.88 supports static file hosting via Apache with PHP 8.1-8.3 available, but **no native Node.js runtime**. Key capabilities and constraints:

**Supported:**
- Static HTML/CSS/JS serving via Apache
- SPA client-side routing via `.htaccess` mod_rewrite
- Gzip compression and browser caching headers
- PHP 8.1-8.3 via EasyApache 4
- Free Let's Encrypt SSL certificates

**NOT Supported:**
- Nuxt SSR/SSG hybrid modes
- Nuxt API routes (requires server-side JavaScript execution)
- Server middleware
- WebSocket connections
- Runtime environment variables

**Workarounds available:**
- PHP proxy scripts for external API calls
- PHP mail handlers or third-party form services
- CGI binaries (limited, host-dependent)

### Serverless Alternatives

**From SERVERLESS_ALTERNATIVES.md:**

Server-side features require replacement with third-party services:

**Contact Form:**
- **Web3Forms (recommended):** 250 free submissions/month, built-in spam protection, unlimited forms
- **Formspree:** 50 free submissions/month, established service with integrations
- **FormSubmit.co:** 1,000 submissions/hour, AJAX support
- **Netlify Forms:** 100 free submissions/month (only if using Netlify hosting)

**Search Functionality:**
- **Fuse.js (recommended):** Fuzzy search library, ~24KB bundle, instant results, works offline
- **Pagefind:** For very large sites (5k+ pages), more complex setup
- **Lunr.js:** Build-time index generation, ~8KB bundle, less sophisticated matching

**Rate Limiting & Spam Protection:**
- **Cloudflare Turnstile (recommended):** Free, invisible CAPTCHA, no user friction
- **Honeypot fields:** Zero-cost supplemental protection
- **Form service built-in limits:** Service-level rate limiting included

**RSS Generation:**
- **Build-time generation:** Generate RSS during Nuxt build, static file output
- **Third-party services:** RSS.app, FetchRSS (external dependency)

### Critical Pitfalls

**From MIGRATION_PITFALLS.md:**

**Top 5 critical pitfalls with prevention strategies:**

1. **Server API Routes Become Inaccessible** — All `server/api/*` and `server/routes/*` endpoints cease to function. Prevention: Catalog all routes before migration; replace WordPress API proxies with direct `useLazyFetch` calls; replace form handlers with external services; pre-render RSS/sitemap at build time.

2. **Contact Form Submission Fails** — The `/api/contact.post.ts` route becomes inaccessible. Prevention: Replace with Web3Forms, Formspree, or similar service before deploying; consider Cloudflare Turnstile for spam protection.

3. **Hydration Mismatches** — Server-fetched data no longer available causes Vue hydration warnings. Prevention: Use `useLazyFetch` with `server: false` for all data fetching; ensure loading states match between server and client; add `<ClientOnly>` wrappers where needed.

4. **Image Optimization (IPX) Stops Working** — The `@nuxt/image` module with `provider: 'ipx'` requires server-side processing. Prevention: Pre-optimize images during build, switch to `provider: 'static'`, or use external service (Cloudinary, ImageKit).

5. **useRequestHeaders() Returns Empty Object** — SSR-specific function returns `{}` in static mode, breaking authentication patterns. Prevention: Replace with `useCookie` for client-side cookie access; use `credentials: 'include'` for automatic cookie inclusion.

## Implications for Roadmap

Based on combined research, the migration should proceed in **four phases**:

### Phase 1: Pre-Migration Audit

**Rationale:** Server routes are the biggest migration blocker. Cataloging them first prevents unexpected breakage and allows parallel work on replacements.

**Delivers:**
- Complete inventory of all server routes and their consumers
- List of components using `useRequestHeaders`, `useRequestURL`, `useStorage`
- Data fetching pattern documentation
- Migration checklist specific to codebase

**Addresses:**
- Critical Pitfall #1 (Server API Routes)
- Critical Pitfall #2 (useRequestHeaders failures)
- Critical Pitfall #3 (useRequestURL context loss)

**Timeline:** 2-3 days

### Phase 2: Configuration & Data Fetching Migration

**Rationale:** Core architecture change from server-proxied to direct client-side API calls. Must be completed before static deployment attempt.

**Delivers:**
- Updated `nuxt.config.ts` with `ssr: false` or `nitro.preset: 'static'`
- All components refactored from `/api/*` calls to direct WordPress API calls
- `useLazyFetch` with `server: false` pattern established
- `.htaccess` file for SPA routing on cPanel
- Local build verification (`npm run build && npm run preview`)

**Addresses:**
- Server API proxy routes
- Hydration mismatch prevention
- SPA routing configuration
- WordPress CORS verification

**Timeline:** 3-5 days

### Phase 3: Function Replacement

**Rationale:** Server-side features (form, search, RSS) require external services or build-time generation. Independent of Phase 2, can be done in parallel.

**Delivers:**
- Contact form integrated with Web3Forms or Formspree
- Cloudflare Turnstile implemented for spam protection
- Client-side search with Fuse.js (or external service)
- Build-time RSS generation configured
- Image optimization resolved (pre-optimized or external service)
- All `server/api/` files removed or replaced

**Addresses:**
- Critical Pitfall #5 (Contact Form)
- Serverless Alternatives (form, search, RSS)
- Critical Pitfall #8 (Image Optimization)

**Timeline:** 3-4 days

### Phase 4: Testing & cPanel Deployment

**Rationale:** Final verification before production. Static deployment has unique failure modes that need thorough testing.

**Delivers:**
- All page transitions tested
- PWA service worker verified
- Form submission end-to-end tested
- RSS feed accessibility verified
- Sitemap validity confirmed
- All images loading correctly
- Search functionality verified
- Console free of hydration warnings
- Deployed to cPanel with `.htaccess`

**Addresses:**
- Critical Pitfall #9 (Hydration Mismatches)
- Moderate Pitfall #14 (PWA registration issues)
- "Looks Done But Isn't" verification

**Timeline:** 2-3 days

### Phase Ordering Rationale

- **Phase 1 first**: Cannot fix what hasn't been identified. Server route inventory is foundational.
- **Phase 2 before Phase 3**: Core architecture change enables parallel work on feature replacements. Data fetching pattern affects everything.
- **Phase 2 and 3 can overlap**: Form/search replacements don't block core data fetching migration.
- **Phase 4 last**: Testing reveals issues from all previous phases. Production deployment requires complete confidence.

### Research Flags

**Phases likely needing deeper research during planning:**

- **Phase 3 (Image Optimization):** Current image sizes and optimization requirements unknown. May need to decide between pre-optimization pipeline vs. external service. Research: image inventory, current IPX usage patterns, performance requirements.

- **Phase 4 (WordPress CORS):** Client-side direct API calls require CORS verification on WordPress server. Research: WordPress CORS configuration, authentication requirements, rate limits.

**Phases with standard patterns (skip research-phase):**

- **Phase 1:** Straightforward code audit. Grep patterns provided in research.
- **Phase 2:** Nuxt static deployment is well-documented. Pattern established in NUXT_STATIC.md.
- **Phase 3 (Form/Search):** Third-party services have clear integration guides. Web3Forms and Fuse.js are drop-in replacements.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Nuxt Static Capabilities | HIGH | Based on official Nuxt 3 documentation |
| cPanel Constraints | HIGH | cPanel 110 release notes and Apache capabilities well-documented |
| Serverless Alternatives | MEDIUM | Pricing from web search may need verification; services are stable but free tiers can change |
| Migration Pitfalls | HIGH | Based on official Nuxt docs and codebase analysis; patterns are well-established |
| Cost Estimates | MEDIUM | Service pricing subject to change; verify before committing to paid tiers |

**Overall confidence:** HIGH

### Gaps to Address

- **WordPress CORS Configuration:** Verify that `vp-associates.com` allows cross-origin requests from the static deployment domain. May need WordPress CORS plugin configuration.

- **Web3Forms Current Pricing:** Research relied on 2025 web search. Free tier (250 submissions/month) should be verified before implementation.

- **FormSubmit AJAX Endpoint:** Low confidence in AJAX API documentation. Should test before committing to this option.

- **Image Inventory:** Current image sizes and optimization requirements unknown. Audit needed to decide between pre-optimization vs. external service.

- **Build Performance:** `nuxt generate` with WordPress API fetching at build time may be slow. Test with full content set before CI/CD setup.

## Sources

### Primary (HIGH confidence)

- [Nuxt 3 Rendering Concepts](https://nuxt.com/docs/guide/concepts/rendering) — SSR vs SPA vs Static generation comparison
- [Nuxt 3 Deployment Guide](https://nuxt.com/docs/getting-started/deployment) — Static hosting configuration
- [Nuxt 3 Nitro Presets](https://nitro.unjs.io/deploy/providers) — Static preset configuration
- [Nuxt 3 Prerendering](https://nuxt.com/docs/guide/concepts/rendering#prerendering) — Build-time route generation
- [Nuxt 3 useFetch/useLazyFetch API](https://nuxt.com/docs/api/composables/use-fetch) — Client-side data fetching
- [Nuxt 3 routeRules Configuration](https://nuxt.com/docs/api/nuxt-config#routerules) — Per-route rendering strategies
- [Apache mod_rewrite Documentation](https://httpd.apache.org/docs/current/mod/mod_rewrite.html) — .htaccess SPA routing
- [cPanel 110 Release Notes](https://docs.cpanel.net/release-notes/110-release-notes/) — Hosting capabilities verification
- [Netlify Forms Documentation](https://docs.netlify.com/forms/) — Form-as-a-service reference
- [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) — CAPTCHA alternative documentation
- [Fuse.js GitHub Repository](https://github.com/krisk/Fuse) — Client-side search library
- [Lunr.js Documentation](https://lunrjs.com/) — Build-time search index

### Secondary (MEDIUM confidence)

- [Web3Forms](https://web3forms.com/) — Form service, pricing from web search
- [Formspree](https://formspree.io/) — Form service, pricing from web search
- [Pagefind Documentation](https://pagefind.app/) — Static search for large sites
- VP Associates Nuxt 3 Codebase Analysis — Local codebase audit, HIGH confidence

### Tertiary (LOW confidence)

- [FormSubmit.co](https://formsubmit.co/) — AJAX endpoint needs verification
- Web search results for "Nuxt 3 static deployment pitfalls 2025" — General patterns, needs validation
- Web search results for "static site form pricing 2026" — Pricing may be outdated

---
*Research completed: 2026-02-23*
*Ready for roadmap: yes*
