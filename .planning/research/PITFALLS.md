# Pitfalls Research

**Domain:** Website Modernization and Migration (Nuxt 3)
**Researched:** 2026-02-04
**Confidence:** MEDIUM

## Critical Pitfalls

### Pitfall 1: Image Optimization Failure in Static Exports

**What goes wrong:**
Images are not properly optimized during static generation (`nuxt generate`), resulting in large unoptimized files being served to users, degrading page load times and Core Web Vitals scores.

**Why it happens:**
The Nuxt Image module uses IPX (default provider) which performs runtime optimization. During static export, there is no runtime server to handle image optimization requests. Images placed in `/public` bypass the optimization pipeline entirely. The module works correctly in development but fails at build time.

**How to avoid:**
- Pre-optimize all images before adding to `/public` using tools like TinyPNG, ImageOptim, or Squoosh
- Configure `image.format: ['webp', 'avif', 'jpg']` in `nuxt.config.ts` (already done)
- Consider using external image providers (Cloudinary, ImageKit) for runtime optimization
- Test with `npm run generate` and inspect output file sizes
- Use `<NuxtImg>` with explicit `width` and `height` props to enable responsive srcsets

**Warning signs:**
- Images load slowly in production despite working fine in development
- Large image file sizes (>200KB) in the `.output/public/_nuxt/` directory
- No WebP or AVIF variants being generated
- Lighthouse "Serve images in next-gen formats" warning

**Phase to address:**
Image Migration Phase — before committing to production deployment

---

### Pitfall 2: SEO Traffic Loss from Architecture Changes

**What goes wrong:**
Organic traffic drops 20-40% within two months of launch due to broken redirects, missing meta tags, or changed URL structures. Content rankings evaporate because search engines cannot properly index the new site.

**Why it happens:**
Teams focus on visual design and technical implementation while treating SEO as an afterthought. URL structures change without proper redirects. Meta descriptions and titles are not migrated. Canonical URLs point to the wrong domains. The new site's architecture makes previously accessible content harder for crawlers to discover.

**How to avoid:**
- Create a URL inventory spreadsheet before any changes (old URL -> new URL mapping)
- Implement 301 redirects for ALL changed URLs before launch
- Verify canonical URLs use the correct domain (`vp-associates.com` vs `www.vp-associates.com`)
- Test with Google Search Console's URL Inspection tool
- Maintain XML sitemap with proper `lastmod` timestamps (already implemented)
- Keep Open Graph and Twitter Card tags for all pages

**Warning signs:**
- Sitemaps showing different URLs than what exists on the old site
- 404 errors in logs for old URLs
- Meta descriptions missing on key pages
- Canonical URLs pointing to staging or development domains

**Phase to address:**
Audit and Planning Phase — must be completed before any public-facing changes

---

### Pitfall 3: Visual Regression False Positives Paralysis

**What goes wrong:**
Visual regression testing generates so many false positives that the team starts ignoring the results or spends hours manually approving trivial changes (single-pixel differences, font rendering variations, animation timing differences).

**Why it happens:**
Pixel-perfect comparison methods are extremely brittle. Anti-aliasing differences between machines, font rendering variations across operating systems, and dynamic content (dates, timestamps, random IDs) all trigger false positives. Teams configure tools with overly strict thresholds or fail to properly mock dynamic data.

**How to avoid:**
- Use visual AI tools (Applitools, TestMu AI) instead of strict pixel comparison
- Configure appropriate diff thresholds (0.1-1% pixel difference tolerance)
- Mock all dynamic content before capturing screenshots
- Use screenshot stabilization features for animations
- Maintain version-controlled baselines and review changes in batches
- Exclude "noisy" elements (timestamps, random IDs) from comparison

**Warning signs:**
- More than 20% of visual tests failing on expected changes
- Team routinely approving "known false positives"
- Different results across different machines or browsers
- Test suite takes hours to complete due to manual review

**Phase to address:**
Audit Tool Implementation Phase — before establishing comparison baselines

---

### Pitfall 4: Incremental Migration Styling Inconsistencies

**What goes wrong:**
When rebuilding section-by-section, the new Nuxt components look different from the legacy WordPress pages. Users experience jarring transitions when navigating between old and new sections. Typography, spacing, colors, and component styles are inconsistent.

**Why it happens:**
The team builds new components based on design mocks or assumptions without adequately comparing against the live site. Tailwind CSS default values differ from the legacy CSS. Font loading creates FOIT (Flash of Invisible Text) or FOUT (Flash of Unstyled Text). The legacy site has accumulated styling patches over years that are not documented.

**How to avoid:**
- Use visual regression tools to compare legacy pages against new implementations
- Document all design tokens (colors, spacing, typography) from the legacy site first
- Run both sites in parallel during development for side-by-side comparison
- Test on multiple browsers and devices — legacy sites often have browser-specific fixes
- Preserve legacy CSS classes during transition if they're referenced externally
- Use the same Google Fonts with matching `font-display: swap` strategy

**Warning signs:**
- Screenshots of legacy vs. new pages show visible spacing differences
- Fonts appear different weights or sizes
- Colors don't match when comparing hex values
- Mobile layouts break at different breakpoints

**Phase to address:**
Section-by-Section Polishing Phase — for each component/page migrated

---

### Pitfall 5: Hydration Mismatch Errors in Production

**What goes wrong:**
Pages work perfectly in development but throw "Hydration mismatch" errors in production. React/Nuxt cannot reconcile server-rendered HTML with client-side rendering, causing flickering, broken interactivity, or complete page failures.

**Why it happens:**
Server and client render different content due to:
- API endpoints returning different data in production vs. development
- User-specific data rendered during SSR
- Date/time-based content that changes between render and hydration
- Browser APIs used before component mount
- Random values or non-deterministic rendering

**How to avoid:**
- Use `onMounted()` for any browser-only APIs
- Store API responses in normalized format
- Ensure development environment uses production-like API data
- Test with `npm run build && npm run preview` before deploying
- Check for data fetching happening only on client or only on server
- Use `<ClientOnly>` wrapper for truly client-specific components

**Warning signs:**
- "Hydration failed" or "Hydration mismatch" console errors
- Content flickers on page load
- Interactive elements don't respond to clicks initially
- Different HTML structure when viewing page source vs. DevTools

**Phase to address:**
Testing Phase — after each major feature or page implementation

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoding API responses in components | Faster development, no server setup | Impossible to update content without code deployment | Never — use server API routes with fallbacks |
| Skipping TypeScript for "simple" components | Faster prototyping | Type errors cascade, refactoring becomes hazardous | Only for throwaway prototypes |
| Using `any` types to fix errors quickly | Unblocks development immediately | Loses all type safety benefits, errors resurface later | Never — use `unknown` and proper type guards |
| Copying styles instead of creating design tokens | Component looks correct immediately | Inconsistent styling across site, difficult to theme | Never — define tokens first |
| Skipping error states | Fewer components to build | Poor UX when things fail, harder to debug | Never — error states are part of the UI |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| WordPress API | Hardcoding `wp-json` URLs directly in components | Use `runtimeConfig` for API URLs, server routes for data fetching |
| Google Analytics | Adding GA scripts directly in `app.vue` | Use Nuxt analytics modules or composables with privacy controls |
| PWA Manifest | Manually creating manifest.json without Nuxt PWA module | Use `@vite-pwa/nuxt` with `registerWebManifestInRouteRules` |
| Image Optimization | Using `<img>` tags for static images in `/public` | Use `<NuxtImg>` or pre-optimize all images before adding to public |
| Sitemap | Manually writing sitemap.xml in public folder | Use `@nuxtjs/sitemap` module with dynamic route generation |
| Fonts | Loading fonts synchronously in CSS | Use `preconnect` and `preload` with `font-display: swap` |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Fetching all data on every page load | Slow page loads, high server costs | Implement route-based caching, use ISR | At 100+ concurrent users |
| Unoptimized images in /public | Lighthouse failures, slow LCP | Pre-optimize with TinyPNG, use WebP/AVIF | Immediately — no scale threshold |
| Client-only search implementation | Empty results on initial page load | Server-side search API with pre-rendered fallback | At production launch |
| Not implementing chunk splitting | Large JS bundles, slow initial load | Configure `build.rollupOptions.output.manualChunks` | When bundle exceeds 500KB |
| Ignoring Core Web Vitals | Poor search rankings, high bounce rate | Test with Lighthouse CI, set performance budgets | Continuous metric |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing API URLs in client code | API abuse, rate limiting, potential data scraping | Use server routes (`/server/api/`) as proxy, never call WP API directly from client |
| CORS misconfiguration | Data leakage, unauthorized access | Explicitly configure `nitro.routeRules` for each route type |
| Hardcoded credentials in runtime config | Credentials exposed in client bundle | Never put secrets in `runtimeConfig.public` — server-side only |
| Missing CSP headers | XSS vulnerabilities | Add `Content-Security-Policy` headers in `nitro.routeRules` |
| Unvalidated API responses | Server-side XSS if WP API is compromised | Validate and sanitize all API data before rendering |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No loading states during API fetches | Users think site is broken | Implement skeleton screens for all async content |
| Generic error messages | Users don't know how to proceed | Show specific error with retry option and support contact |
| Missing mobile touch targets | Frustrating mobile experience | Ensure all interactive elements are 44x44px minimum |
| Form validation only on submit | Users must retry submission | Validate on blur, show inline errors |
| No offline fallback for PWA | Broken experience when offline | Implement `/offline` page with helpful navigation |
| Back button not working after navigation | Users feel trapped | Use proper Nuxt routing, never `window.history.pushState` manually |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Image Optimization:** Often missing WebP/AVIF variants — verify with Lighthouse "Serve images in next-gen formats" audit
- [ ] **Meta Tags:** Often missing Open Graph images — verify with Facebook Sharing Debugger
- [ ] **Accessibility:** Often missing skip links and ARIA labels — verify with keyboard-only navigation
- [ ] **Error Handling:** Often missing API failure states — test by breaking API endpoint URLs
- [ ] **Mobile Navigation:** Often broken on small screens — test on iPhone SE viewport (375px)
- [ ] **Form Validation:** Often only validates on submit — test with invalid data and check for inline errors
- [ ] **Search Functionality:** Often missing empty state and loading states — test with no results and slow network
- [ ] **Sitemap:** Often missing dynamic routes — verify `/sitemap.xml` includes all pages
- [ ] **Analytics:** Often missing event tracking for key actions — verify GA4 receives events

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Images not optimized in production | MEDIUM | Batch-optimize existing images with Squoosh CLI, deploy, update source files |
| SEO traffic loss | HIGH | Audit 404s, implement missing 301 redirects, submit updated sitemap to Google, wait 2-4 weeks for recovery |
| Hydration errors | LOW | Add `onMounted` guards for browser-only code, wrap problematic components in `<ClientOnly>` |
| Visual test false positives | LOW | Adjust diff thresholds, add ignored zones, re-baseline affected tests |
| Styling inconsistencies | MEDIUM | Extract design tokens, systematically update affected components, regression test |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Image optimization failure | Image Migration | Lighthouse audit after each image batch |
| SEO traffic loss | Audit & Planning | Crawl comparison report, Search Console verification |
| Visual false positives | Audit Tool Setup | Run test suite, measure false positive rate |
| Styling inconsistencies | Section Polish | Side-by-side screenshot comparison |
| Hydration errors | Implementation | `npm run build && npm run preview` testing |
| Performance degradation | Continuous | Lighthouse CI on every pull request |
| PWA broken offline | PWA Implementation | Test in airplane mode, verify offline page loads |
| Missing meta tags | Implementation | Test with social media preview tools |

## Sources

- [Website Migration Mistakes - SEO Impact](https://www.oncrawl.com/technical-seo/common-website-migration-mistakes-drag-down-seo-performance/) (HIGH confidence)
- [Visual Regression Testing False Positives - BrowserStack](https://www.browserstack.com/guide/how-to-reduce-false-positives-in-visual-testing) (HIGH confidence)
- [Nuxt Image Static Export Issues - GitHub Discussion](https://github.com/nuxt/image/discussions/1588) (MEDIUM confidence - GitHub discussions may be dated)
- [Next.js Static Export Image Optimization - Reddit](https://www.reddit.com/r/statichosting/comments/1o13sll/how_are_people_handling_image_optimization_for/) (MEDIUM confidence - community discussion)
- [Website Redesign Mistakes - Digital Volcanoes](https://digitalvolcanoes.com/blogs/dont-make-these-common-website-redesign-mistakes-in-2026) (LOW confidence - general advice)
- [SEO Audit Mistakes - Acclaim Agency](https://acclaim.agency/blog/common-website-audit-mistakes-and-how-to-avoid-them) (MEDIUM confidence)
- [Visual Regression Testing Best Practices - Medium](https://medium.com/@ss-tech/the-ui-visual-regression-testing-best-practices-playbook-dc27db61ebe0) (MEDIUM confidence)
- [Common Website Migration Mistakes - Gaia Digital](https://www.gaiadigital.nl/en/the-most-common-mistakes-in-website-migrations-and-how-to-avoid-them/) (MEDIUM confidence)
- [Why Nuxt Migrations Fail - Nunuqs](https://www.nunuqs.com/blog/why-nuxt-migrations-fail-and-how-to-de-risk-them-before-writing-code) (MEDIUM confidence)
- [Nuxt 3 Migration Guide - Official Docs](https://nuxt.com/docs/3.x/migration) (HIGH confidence)

---
*Pitfalls research for: VP Associates Website Modernization*
*Researched: 2026-02-04*
