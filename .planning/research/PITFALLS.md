# Pitfalls Research: Nuxt 3 Performance Optimization

**Domain:** Nuxt 3 Website Performance Optimization
**Researched:** 2026-02-06
**Confidence:** HIGH

## Executive Summary

This document focuses specifically on **common mistakes when optimizing Nuxt 3 sites for 90+ Lighthouse scores**. These pitfalls have been identified from official Nuxt documentation, performance experts, and real-world case studies. The VP Associates site already has good foundations (lazy loading, WebP images, caching headers), but specific optimization traps can still cause Lighthouse scores to plateau in the 70-85 range.

**Key insight:** Most performance failures come from over-optimizing (lazy loading critical content), under-optimizing (missing hydration delays), or measuring incorrectly (lab vs. field data mismatch). The path to 90+ requires targeted, not blanket, optimizations.

---

## Critical Pitfalls

### Pitfall 1: Over-Lazy-Loading Critical Content

**What goes wrong:**
Applying lazy loading to above-the-fold content delays Largest Contentful Paint (LCP), causing Lighthouse scores to drop below 60. Images and components needed for initial view should load immediately but are incorrectly deferred.

**Why it happens:**
Developers apply lazy loading universally as a "performance best practice" without distinguishing between critical (above-fold) and non-critical (below-fold) content. The `<Lazy*>` prefix is used for all components, and `<NuxtImg>` defaults to `loading="lazy"` everywhere.

**How to avoid:**
- Identify LCP element on each page (usually hero image or large text)
- Use `<NuxtImg>` with `loading="eager"` and `fetchpriority="high"` for LCP images
- Use `preload` attribute for critical images
- Never lazy load components in the initial viewport
- Use `preload` links for critical CSS and fonts in `nuxt.config.ts`

**Warning signs:**
- Lighthouse LCP score below 60 (target: <2.5s)
- LCP element is marked as "lazy loaded" in Lighthouse report
- "Defer offscreen images" warning but LCP is below the fold
- Low LCP score despite small bundle sizes

**Phase to address:**
Performance Audit Phase — run Lighthouse to identify LCP element, then apply eager loading

---

### Pitfall 2: Not Using Lazy Hydration for Below-Fold Components

**What goes wrong:**
All components hydrate immediately on page load, causing large Total Blocking Time (TBT) and poor Interaction to Next Paint (INP) scores. The site feels sluggish even though LCP is fast.

**Why it happens:**
Default Nuxt SSR hydrates all components simultaneously. Teams focus on initial load metrics (LCP, FCP) but ignore interaction metrics (TBT, INP). Non-interactive components (footer, testimonials) consume JavaScript execution time.

**How to avoid:**
- Use `hydrate-on-visible` directive for components below the fold
- Use `hydrate-on-idle` for non-critical interactive elements
- Use `hydrate-on-interaction` for rarely-used components (modals, dropdowns)
- Apply to: carousels, contact forms, testimonial sections, newsletters

```vue
<!-- Hero slider - hydrate immediately (no directive) -->
<HeroSlider />

<!-- Testimonials - hydrate when visible -->
<LazyTestimonials hydrate-on-visible />

<!-- Newsletter - hydrate on interaction -->
<LazyNewsletter hydrate-on-interaction />
```

**Warning signs:**
- Lighthouse TBT score above 300ms (target: <200ms)
- Lighthouse Speed Index above 3.4s
- Chrome DevTools shows long tasks (>50ms) during hydration
- High JavaScript execution time in Performance panel

**Phase to address:**
Component Optimization Phase — apply lazy hydration strategically

---

### Pitfall 3: Bundle Size Inflation from Unoptimized Dependencies

**What goes wrong:**
JavaScript bundle exceeds 500KB after minification, causing slow downloads on mobile networks and delayed hydration. Lighthouse "Reduce JavaScript execution time" warning appears.

**Why it happens:**
- Dependencies include unused code (full library instead of tree-shakeable module)
- Heavy icon libraries loading entire icon sets instead of individual icons
- Multiple date/validation libraries when one would suffice
- Server-side dependencies accidentally bundled for client

**How to avoid:**
- Run `npx nuxi analyze` to visualize bundle composition
- Use tree-shakeable libraries (lodash-es instead of lodash)
- Prefer `@iconify/vue` (already installed) which loads icons on-demand
- Check for dependencies in `dependencies` that should be in `devDependencies`
- Use dynamic imports for heavy libraries

**Warning signs:**
- `npx nuxi analyze` shows blocks larger than 100KB
- Lighthouse "Reduce unused JavaScript" warning
- Initial JS download >500KB on mobile 3G simulation
- Large variance between dev and production bundle sizes

**Phase to address:**
Bundle Analysis Phase — analyze and optimize before deployment

---

### Pitfall 4: Font Loading Causing Layout Shift (CLS)

**What goes wrong:**
Cumulative Layout Shift (CLS) score exceeds 0.1 due to fonts loading late and causing content to reflow. Lighthouse flags "Ensure text remains visible during webfont load."

**Why it happens:**
- Google Fonts loaded synchronously without `font-display: swap`
- No fallback font metrics defined
- Font face declarations missing from critical CSS
- Web Font Loader or similar script blocking render

**How to avoid:**
- Use `font-display: swap` on all `@font-face` declarations
- Consider using `@nuxtjs/fonts` module for automatic optimization
- Define `font-family` fallback stacks that match web font dimensions
- Preload critical fonts with `<link rel="preload">`
- Use `preconnect` for font domains (already configured in nuxt.config.ts)

**Current state:** The site uses `preconnect` for Google Fonts, which is good. Verify `font-display: swap` is applied.

**Warning signs:**
- Lighthouse CLS score above 0.1
- Visible text "jumps" when fonts load
- Font URL appears in waterfall after render
- Lighthouse "Ensure text remains visible during webfont load" audit fails

**Phase to address:**
Font Optimization Phase — verify and fix font loading strategy

---

### Pitfall 5: Not Leveraging Nuxt's Hybrid Rendering

**What goes wrong:**
All routes use the same rendering mode (SSR for everything), causing unnecessary server load and slower response times for static content that could be pre-rendered.

**Why it happens:**
Teams configure a single rendering mode in `nuxt.config.ts` and don't leverage route-specific rules. Static pages (about, contact) are dynamically rendered on every request.

**How to avoid:**
- Configure `routeRules` in `nuxt.config.ts` for each route type
- Use `prerender: true` for static pages
- Use `isr: true` for semi-static content with periodic updates
- Use `ssr: false` for truly client-only sections

```typescript
// Already configured in nuxt.config.ts - verify this is optimal
routeRules: {
  '/': { prerender: true },  // Static homepage
  '/about': { prerender: true },
  '/projects': { isr: 3600 },  // Revalidate every hour
  // etc.
}
```

**Current state:** Route rules are already configured in `nuxt.config.ts`. Verify they match actual usage patterns.

**Warning signs:**
- Server response times >500ms for static pages
- Build times excessive due to pre-rendering too many dynamic routes
- Content feels stale when it should update frequently

**Phase to address:**
Rendering Strategy Phase — audit route rules and adjust based on content change frequency

---

### Pitfall 6: Waterfall of Sequential Requests

**What goes wrong:**
Page load shows a "waterfall" pattern where each resource waits for the previous one to load. TTFB is high, and resources load sequentially instead of in parallel.

**Why it happens:**
- Critical CSS not inlined
- No resource hints (preload, prefetch, preconnect)
- JavaScript blocking render
- Multiple redirect chains
- API requests made client-side instead of server-side

**How to avoid:**
- Use `useAsyncData` or `useFetch` for server-side data fetching
- Add `<link rel="preload">` for critical resources
- Ensure `preconnect` is configured for external domains (already done for fonts and iconify)
- Minimize redirects (already handled in route rules)
- Use async/defer attributes for non-critical scripts

**Warning signs:**
- Network waterfall in Chrome DevTools shows sequential loading
- TTFB >600ms in Lighthouse
- Multiple redirect chains in waterfall
- Fonts or API responses block render

**Phase to address:**
Resource Loading Phase — optimize critical path and resource hints

---

### Pitfall 7: Client-Side Heavy Components

**What goes wrong:**
Components like carousels, sliders, and galleries hydrate immediately and register many event listeners, blocking the main thread. TBT scores suffer.

**Why it happens:**
Interactive components are complex (touch handlers, keyboard navigation, animation loops). Teams focus on functionality without considering hydration cost. The site has multiple carousels (HeroSlider, ProjectsCarousel).

**Current components with optimization potential:**
- `HeroSlider.vue` - 9 slides, parallax, autoplay, touch handlers
- `ProjectsCarousel.vue` - similar functionality
- `ProjectGallery.vue` - lightbox with navigation

**How to avoid:**
- Apply `hydrate-on-visible` to carousels below the fold
- Use passive event listeners for scroll/touch handlers
- Debounce/throttle scroll handlers (already using VueUse's `useWindowScroll`)
- Consider CSS-only solutions for simple carousels
- Use `requestAnimationFrame` for animations

**Warning signs:**
- Performance profiler shows heavy component rendering
- Long tasks >50ms during hydration
- Scroll jank when carousels are in viewport
- High main thread blocking time in Lighthouse

**Phase to address:**
Component Refactoring Phase — optimize heavy interactive components

---

### Pitfall 8: Missing or Incorrect Caching Headers

**What goes wrong:**
Assets are re-downloaded on repeat visits, causing poor performance for returning visitors. Browser cache score in Lighthouse is below 90.

**Why it happens:**
Cache headers not configured or misconfigured. Static assets served without `Cache-Control` headers or with very short TTL.

**Current state:** The site has `nitro.routeRules` with cache headers configured. Verify they're being applied correctly in production.

```typescript
// Already in nuxt.config.ts
'/images/**': { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
'/_nuxt/**': { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
```

**How to verify:**
1. Open Chrome DevTools Network tab
2. Reload page twice
3. Check that assets return `304 Not Modified` or are served from disk cache
4. Verify `Cache-Control` headers are present

**Warning signs:**
- Lighthouse "Uses efficient cache policy" score <90
- Assets download fully on repeat visits (200 status instead of 304)
- Missing `Cache-Control` or `ETag` headers in Network panel
- Service worker not caching static assets

**Phase to address:**
Cache Verification Phase — verify headers in production environment

---

### Pitfall 9: Excessive or Misconfigured PWA Precaching

**What goes wrong:**
PWA service worker precaches too many resources, causing initial install to fail or take excessive time. Storage quota exceeded on some devices.

**Why it happens:**
PWA configuration precaches all static files without size limits. Large image sets cached unnecessarily. Precache list not cleaned up between deployments.

**Current state:** Site uses `@vite-pwa/nuxt` with glob pattern precaching. Review the `globPatterns` configuration.

```typescript
workbox: {
  globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,woff2}'],
  // This may be too broad - consider excluding large images
}
```

**How to avoid:**
- Exclude large images from precache (they'll use runtime caching)
- Limit precache to critical app shell (JS, CSS, critical icons)
- Use runtime caching for content images
- Set `modifyURLPrefix` to handle CDN paths
- Monitor storage usage and set appropriate limits

**Warning signs:**
- PWA install fails or takes >30 seconds
- "Quota exceeded" errors in console
- Service worker storage >50MB
- Slow first load even with cache

**Phase to address:**
PWA Optimization Phase — review and trim precache configuration

---

### Pitfall 10: Measuring Lab Scores Instead of Real User Experience

**What goes wrong:**
Lighthouse scores in development are 95+, but real users report slow experiences. Field data (CrUX) shows poor Core Web Vitals despite perfect lab scores.

**Why it happens:**
- Testing on desktop with fast connection
- Not simulating mobile devices or slow networks
- Caching warm during tests but cold for real users
- Lab tests don't capture real-world variability
- Testing on localhost which has zero network latency

**How to avoid:**
- Run Lighthouse with "Mobile" and "4x slowdown" settings
- Use PageSpeed Insights for both lab and field data
- Implement Real User Monitoring (RUM) for production metrics
- Test on actual devices, not simulators
- Test with cold cache (disable cache in DevTools)

**Warning signs:**
- Lighthouse 95+ but PageSpeed Insights "Needs Improvement"
- User complaints about slow site despite good lab scores
- Field data (CrUX) shows different results than lab data
- No RUM implementation for production monitoring

**Phase to address:**
Performance Monitoring Phase — set up both lab and field measurement

---

## Moderate Pitfalls

### Pitfall 11: Not Using `v-memo` for Expensive Renders

**What goes wrong:**
Lists or complex components re-render unnecessarily when parent data changes, causing jank during user interactions.

**How to avoid:**
- Use `v-memo` for list items that only re-render when specific props change
- Combine with `v-for` on lists with expensive item rendering
- Apply to cards, table rows, gallery items

**Phase to address:** Component Optimization Phase

---

### Pitfall 12: Missing `will-change` Hints for Animated Elements

**What goes wrong:**
Animations (parallax, transitions) cause jank because browser doesn't optimize layer compositing.

**How to avoid:**
- Add `will-change: transform` to animated elements (already in HeroSlider)
- Remove `will-change` after animation completes
- Don't overuse — only apply to actively animating properties

**Phase to address:** Animation Optimization Phase

---

### Pitfall 13: Using `window.scrollY` Without Throttling

**What goes wrong:**
Scroll handlers fire on every pixel of scroll, causing jank. Already partially mitigated by using VueUse's `useWindowScroll` which is optimized.

**How to avoid:**
- Use VueUse composables (already in use)
- Implement throttle/debounce if custom scroll handlers
- Use `requestAnimationFrame` for scroll-based updates

**Phase to address:** Scroll Handler Review Phase

---

## Performance Traps Matrix

| Trap | Impact on Lighthouse | Detection | Prevention |
|------|---------------------|-----------|------------|
| Lazy loading LCP element | LCP drops 20-40 points | LCP element marked lazy | Always use `loading="eager"` for above-fold images |
| No lazy hydration | TBT 300-600ms, INP poor | Long tasks during hydration | Use `hydrate-on-visible` for below-fold |
| Bundle bloat | All scores suffer | `nuxi analyze` >500KB | Tree-shake, dynamic imports |
| Font layout shift | CLS >0.1 | Lighthouse CLS audit | `font-display: swap`, metric overrides |
| Sequential waterfalls | TTFB high, FCP slow | DevTools waterfall | Preload critical resources |
| Heavy carousels | TBT, INP suffer | Profiler shows component time | Lazy hydrate, passive listeners |
| No caching | Return visit slow | Cache score <90 | Proper `Cache-Control` headers |
| Over-precaching PWA | Install fails | Storage >50MB | Limit precache to app shell |
| Lab vs field mismatch | Real users suffer | CrUX differs from Lighthouse | Test on mobile, throttle, RUM |

---

## Anti-Patterns: Things That Seem Fast But Aren't

| Anti-Pattern | Why It Seems Good | Why It's Bad | Alternative |
|--------------|-------------------|--------------|-------------|
| Lazy loading everything | Reduces initial load | Delays LCP element, hurts score | Eager load above-fold, lazy below |
| Aggressive code splitting | Smaller individual chunks | More HTTP requests, overhead | Split at route boundaries only |
| Defer all scripts | "Non-blocking" | Critical JS delayed, interactivity suffers | Defer non-critical, inline critical |
| CDN everything | "Faster delivery" | More DNS lookups, connection overhead | Self-host static, CDN for heavy assets |
| Disable SSR for speed | No hydration | Terrible SEO, slow initial paint | Hybrid rendering with route rules |
| Minify everything | Smaller files | Build complexity, source maps broken | Vite handles this automatically |
| Infinite scroll | "Smooth UX" | Memory issues, no URL state | Pagination with load more button |

---

## Component-Specific Warnings

### HeroSlider.vue
**Current issues:**
- 9 slides with large images
- Parallax and zoom effects on scroll
- Autoplay with progress bar
- Touch handlers

**Optimizations needed:**
- First slide should use `loading="eager"` and `fetchpriority="high"`
- Other slides use `loading="lazy"`
- Consider lazy hydration if slider is below LCP element
- Verify parallax doesn't cause jank

### AppHeader.vue
**Current issues:**
- Scroll listener for shadow effect
- Multiple navigation links

**Optimizations needed:**
- Scroll handler already uses direct listener (good)
- Consider `hydrate-on-idle` since header is always visible but not immediately interactive

### ProjectGallery.vue
**Current issues:**
- Lightbox with all thumbnails
- Multiple NuxtImg components

**Optimizations needed:**
- Lazy load lightbox (only open on interaction)
- Use `loading="lazy"` for all gallery images
- Consider progressive image loading for large galleries

### ProjectsCarousel.vue
**Current issues:**
- Similar to HeroSlider
- Touch handlers
- Autoplay

**Optimizations needed:**
- Use `hydrate-on-visible` if below fold
- Lazy load non-visible slides

---

## "Looks Fast But Scores Poorly" Checklist

Things that appear fast but fail Lighthouse audits:

- [ ] **LCP Image:** Appears to load instantly but lazy loaded → Lighthouse LCP fail
- [ ] **Interactivity:** Site feels responsive but TBT high → Lighthouse Performance fail
- [ ] **Images:** Look good but no WebP/AVIF → "Serve images in next-gen formats" fail
- [ ] **Fonts:** Display immediately but cause shift → CLS fail
- [ ] **JavaScript:** Works fine but too much of it → "Reduce unused JavaScript" warning
- [ ] **Cache:** Works on refresh but poor score → "Uses efficient cache policy" fail
- [ ] **Accessibility:** Works with mouse → Accessibility score fail

---

## Phase-to-Pitfall Mapping

| Phase | Pitfalls Addressed | Success Criteria |
|-------|-------------------|------------------|
| Performance Audit | 1, 3, 4, 6, 8, 10 | Lighthouse baseline documented |
| Critical Path Optimization | 1, 6 | LCP <2.5s, FCP <1.8s |
| Bundle Optimization | 3 | JS bundle <500KB, unused JS <200KB |
| Component Lazy Hydration | 2, 7, 11 | TBT <200ms, INP <200ms |
| Font Optimization | 4 | CLS <0.1, text remains visible |
| Cache Strategy | 5, 8 | Browser cache >90% |
| PWA Optimization | 9 | Service worker <50MB storage |
| Field Monitoring | 10 | RUM implemented, CrUX tracked |

---

## Quick Wins (90+ Points)

These optimizations provide the biggest impact for least effort:

1. **Eager load LCP image** (+10-20 Lighthouse points)
   ```vue
   <NuxtImg
     src="/hero.jpg"
     loading="eager"
     fetchpriority="high"
     preload
   />
   ```

2. **Add `hydrate-on-visible` to carousels** (+5-10 TBT improvement)
   ```vue
   <LazyProjectsCarousel hydrate-on-visible />
   ```

3. **Verify `font-display: swap`** (+5 CLS improvement)
   ```css
   @font-face {
     font-display: swap;
   }
   ```

4. **Run `npx nuxi analyze` and remove top 3 largest dependencies** (+10-15 bundle reduction)

5. **Preconnect all external domains** (already configured, verify working)

---

## Sources

### Official Documentation (HIGH confidence)
- [Nuxt Performance Best Practices](https://nuxt.com/docs/guide/best-practices/performance) — Core performance features, lazy loading, lazy hydration, profiling tools
- [Nuxt Image Module Documentation](https://image.nuxt.com) — Image optimization, format conversion, loading strategies
- [Nuxt Hydration Guide](https://nuxt.com/docs/guide/best-practices/hydration) — Hydration best practices, common issues

### Authoritative Guides (HIGH confidence)
- [DebugBear - Nuxt Performance Optimization](https://debugbear.com/blog/optimize-nuxt-performance) — Comprehensive Nuxt optimization guide, rendering modes, modules
- [Ali Soueidan - Nuxt SSR, Hydration & Islands](https://alisoueidan.com/blog/deep-dive-into-nuxt-ssr-hydration-and-islands) — Deep dive on hydration, lazy hydration strategies, Islands architecture

### Performance Resources (MEDIUM confidence)
- [WebPageTest - Nuxt Optimization](https://www.webpagetest.org/) — Real-world performance testing
- [PageSpeed Insights](https://pagespeed.web.dev/) — Lab and field data comparison
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/) — Main thread analysis, long tasks

### Community Wisdom (MEDIUM confidence)
- [Nuxt Discord Performance Discussions](https://discord.com/invite/nuxt) — Real-world optimization discussions
- [Nuxt GitHub Performance Issues](https://github.com/nuxt/nuxt/issues?q=is%3Aissue+performance) — Known performance issues and workarounds

### Core Web Vitals (HIGH confidence)
- [Google - Core Web Vitals](https://web.dev/vitals/) — LCP, FID, INP, CLS definitions and thresholds
- [HTTP Archive Web Almanac 2025 - Performance](https://almanac.httparchive.org/en/2025/performance) — Industry benchmarks

---
*Pitfalls research for: VP Associates Website Performance Optimization*
*Researched: 2026-02-06*
*Focus: Nuxt 3 performance mistakes preventing 90+ Lighthouse scores*
