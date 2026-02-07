# Feature Research: Performance Optimization for 90+ Lighthouse Scores

**Domain:** Nuxt 3 Performance Optimization
**Researched:** 2026-02-06
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Required for 90+ Lighthouse)

Features required to achieve 90+ Lighthouse scores. Missing these = cannot reach target.

| Feature | Why Expected | Complexity | Lighthouse Impact | Notes |
|---------|--------------|------------|-------------------|-------|
| **Image Optimization** | Images account for 50%+ of page weight | LOW | Performance, LCP | Already using @nuxt/image - verify all images optimized |
| **Critical CSS Inlining** | Eliminates render-blocking CSS | MEDIUM | Performance, LCP | Inline above-the-fold CSS only |
| **Font Optimization** | Prevents FOIT/FOUT, reduces CLS | LOW | Performance, CLS | Use font-display: swap, preload critical fonts |
| **Bundle Code Splitting** | Reduces initial JS payload | MEDIUM | Performance, FID/INP | Route-based splitting automatic, component-level manual |
| **Compression (Brotli/Gzip)** | Reduces transfer size 60-80% | LOW | Performance | Nitro supports both, prefer Brotli |
| **Cache Headers** | Enables browser caching | LOW | Performance | Static assets: immutable, HTML: short TTL |
| **Preconnect/DNS-Prefetch** | Reduces connection latency | LOW | Performance | Already configured for fonts/iconify |
| **Remove Unused CSS/JS** | Reduces payload size | MEDIUM | Performance | Use purgecss, analyze bundle |
| **Minify HTML/CSS/JS** | Standard optimization | LOW | Performance | Built into Nuxt build |
| **Third-Party Script Optimization** | Scripts block main thread | HIGH | Performance, FID/INP | Defer non-critical, consider Partytown |
| **Lazy Loading Below-Fold** | Reduces initial payload | LOW | Performance, LCP | Images, components, iframes |
| **Proper Image Sizing** | Prevents layout shift | LOW | CLS | Use width/height, aspect-ratio |
| **Avoid Large Layout Shifts** | CLS is pass/fail metric | MEDIUM | CLS | Reserve space for dynamic content |

### Differentiators (Advanced Optimizations)

Features that push scores from 90-95 to 95-100.

| Feature | Value Proposition | Complexity | Lighthouse Impact | Notes |
|---------|-------------------|------------|-------------------|-------|
| **Lazy Hydration** | Defers component hydration until interaction | HIGH | Performance, INP | Use defineLazyHydrationComponent for heavy components |
| **Islands Architecture** | Interactive islands in static page | HIGH | Performance | Experimental in Nuxt 3 (.island.vue) |
| **Edge Rendering** | Server closer to user | MEDIUM | Performance, LCP | Deploy to Cloudflare Workers, Vercel Edge |
| **Server Components** | Zero client JS for server-only content | HIGH | Performance | Reduces bundle significantly |
| **Advanced Script Loading** | Partytown for third-party scripts | HIGH | Performance, INP | Moves scripts to web workers |
| **HTTP/2 Server Push** | Proactive resource delivery | MEDIUM | Performance | Less critical with H3 priority |
| **Resource Hints Optimization** | Smart prefetch based on user behavior | MEDIUM | Performance | IntersectionObserver already used by NuxtLink |
| **Speculative Rules API** | Chrome-level prefetch | MEDIUM | Performance | Newer browser API, Chrome-only |
| **Early Hints** | Send resources while server processes | HIGH | Performance | Requires server support (103 Early Hints) |
| **Client Component Boundaries** | Minimize hydration boundaries | MEDIUM | Performance | Strategic use of ClientOnly |
| **Build-Time Optimization** | Static generation where possible | LOW | Performance | ISR for dynamic content |
| **Performance Monitoring** | Real-user measurement | MEDIUM | N/A | RUM, Core Web Vitals API |
| **Bundle Size Budgets** | Prevent regression | LOW | Performance | Set limits in build config |
| **Tree Shaking** | Remove unused code | LOW | Performance | Automatic for ES modules |
| **Module/Nitro Optimization** | Runtime performance | HIGH | Performance | Async context, route rules |

### Anti-Features (Avoid for Performance)

Features that hurt performance despite seeming beneficial.

| Anti-Feature | Why Requested | Why Problematic | Alternative |
|--------------|---------------|-----------------|-------------|
| **Aggressive Prefetching** | Faster navigation | Can waste bandwidth, hurt LCP | Smart viewport-based prefetching |
| **Client-Side Only Routing** | Faster transitions after load | Hurts initial SEO, performance metrics | Hybrid SSR for critical pages |
| **Heavy Animation Libraries** | Visual appeal | Massive JS payload, CLS risk | CSS animations, lightweight alternatives |
| **Too Many Third-Party Scripts** | Analytics, chat, social | #1 cause of poor performance | Defer loading, Partytown, self-host |
| **Full Page Transitions** | Polished UX | Blocks interaction, delays hydration | Subtle micro-interactions only |
| **Non-Critical Client State** | Interactive features | Unnecessary hydration | Server-render when possible |
| **Universal/Bridge Mode** | Support older browsers | Polyfill bloat, slower | Progressive enhancement |
| **Infinite Scroll** | UX pattern | Increases DOM size, CLS risk | Pagination with proper caching |
| **Heavy Framework Components** | Developer convenience | Bundle bloat | Native web APIs where possible |
| **Unoptimized LCP Images** | Hero image quality | Largest factor in Performance score | Use @nuxt/image, proper sizing |
| **Font self-hosting without optimization** | Privacy/control | Often slower than CDN | Use @nuxt/fonts, WOFF2 only |
| **Inline CSS for everything** | Reduce requests | HTML bloat, poor caching | Critical CSS inline, rest external |
| **Javascript for layouts** | Dynamic layouts | Layout shift risk | CSS Grid/Flexbox |

## Feature Dependencies

```
[Image Optimization]
    └──required-for──> [90+ Lighthouse Performance]
                     └──enhanced-by──> [AVIF Format, Responsive Images]

[Critical CSS Inlining]
    └──required-for──> [90+ Lighthouse Performance]
                     └──enhanced-by──> [PurgeCSS, Tailwind CSS JIT]

[Bundle Code Splitting]
    └──required-for──> [90+ Lighthouse Performance]
    └──enables──> [Lazy Hydration]
    └──enables──> [Dynamic Imports]

[Lazy Hydration]
    └──requires──> [Code Splitting]
    └──enhances──> [INP Score]
    └──reduces-need-for──> [Heavy Initial JS]

[Font Optimization]
    └──required-for──> [90+ CLS Score]
    └──requires──> [font-display: swap]

[Third-Party Script Optimization]
    └──required-for──> [90+ INP Score]
    └──enables──> [Partytown Implementation]

[Islands Architecture]
    └──requires──> [Component Boundaries]
    └──enhances──> [Bundle Size, Hydration Speed]

[Edge Rendering]
    └──enhances──> [LCP Score]
    └──requires──> [Edge Deployment]
```

### Dependency Notes

- **Image Optimization enables 90+ LCP**: Largest Contentful Paint is usually an image. Optimized images are the single biggest performance lever.
- **Code Splitting enables Lazy Hydration**: Cannot defer hydration without component boundaries and dynamic imports.
- **Critical CSS prevents render-blocking**: Above-the-fold content must render immediately; non-critical CSS can load later.
- **Font Optimization prevents CLS**: Without font-display: swap and proper sizing, text causes layout shifts when fonts load.
- **Third-Party Scripts are the #1 Performance Killer**: Analytics, chat, and social widgets often dominate main thread time. Partytown moves them to web workers.
- **Lazy Hydration reduces INP**: Interaction to Next Paint improves when fewer components compete for main thread during initial hydration.

## MVP Definition (For Performance Milestone)

### Launch With (Phase 1: Foundation)

Must-have optimizations to reach 90+ baseline.

- [ ] **Image Audit & Optimization** — Verify all images use @nuxt/image, proper sizing, WebP/AVIF
- [ ] **Critical CSS Extraction** — Inline above-the-fold CSS, defer rest
- [ ] **Font Optimization** — Verify font-display: swap, preload critical fonts
- [ ] **Bundle Analysis** — Identify largest chunks, plan splitting strategy
- [ ] **Remove Unused Code** — PurgeCSS, tree shaking verification
- [ ] **Lazy Loading Components** — Below-fold components using Lazy prefix
- [ ] **Script Deferment** — Defer all non-critical third-party scripts
- [ ] **Compression Verification** — Enable Brotli for static assets
- [ ] **Cache Headers** — Verify proper caching rules for all asset types
- [ ] **LCP Element Optimization** — Identify and optimize LCP elements per page

### Add After Validation (Phase 2: Advanced)

Add when Phase 1 achieves 90+ but room for improvement.

- [ ] **Lazy Hydration** — Implement for heavy interactive components
- [ ] **Partytown Integration** — Move third-party scripts to web workers
- [ ] **Advanced Code Splitting** — Component-level splitting for heavy pages
- [ ] **Route-Specific Optimization** — Tailor strategy per route type
- [ ] **Performance Budgets** — Add automated size limits to build

### Future Consideration (Phase 3: Edge/Experimental)

Defer until standard optimizations are exhausted.

- [ ] **Islands Architecture** — Evaluate when Nuxt 4 support stabilizes
- [ ] **Edge Deployment** — Move to Cloudflare Workers or Vercel Edge
- [ ] **Server Components** — When Nuxt implementation matures
- [ ] **Early Hints** — When hosting platform supports 103 status
- [ ] **Speculative Rules** — Chrome-specific prefetch optimization

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority | Lighthouse Metric |
|---------|------------|---------------------|----------|-------------------|
| Image Optimization | HIGH | LOW | P1 | Performance, LCP |
| Critical CSS Inlining | HIGH | MEDIUM | P1 | Performance, LCP |
| Font Optimization | HIGH | LOW | P1 | CLS |
| Remove Unused CSS/JS | HIGH | MEDIUM | P1 | Performance |
| Lazy Loading Below-Fold | HIGH | LOW | P1 | Performance, LCP |
| Bundle Code Splitting | HIGH | LOW | P1 | Performance, INP |
| Third-Party Script Optimization | HIGH | HIGH | P1 | Performance, INP |
| Compression (Brotli) | MEDIUM | LOW | P1 | Performance |
| Cache Headers | MEDIUM | LOW | P1 | Performance |
| Lazy Hydration | MEDIUM | HIGH | P2 | Performance, INP |
| Partytown Integration | MEDIUM | HIGH | P2 | Performance, INP |
| Edge Rendering | MEDIUM | MEDIUM | P2 | Performance, LCP |
| Islands Architecture | LOW | HIGH | P3 | Performance |
| Server Components | LOW | HIGH | P3 | Performance |
| Early Hints | LOW | HIGH | P3 | Performance |
| Speculative Rules | LOW | MEDIUM | P3 | Performance |

**Priority key:**
- P1: Must have for 90+ Lighthouse (launch)
- P2: Should have for 95+ Lighthouse (post-launch)
- P3: Nice to have for 98+ Lighthouse (future)

## Lighthouse Metric Mapping

### Performance Score (Weighted Average)

| Metric | Weight | Target | Key Features |
|--------|--------|--------|--------------|
| **LCP** (Largest Contentful Paint) | 25% | < 2.5s | Image optimization, critical CSS, preload, compression |
| **INP** (Interaction to Next Paint) | 25% | < 200ms | Code splitting, lazy hydration, Partytown, main thread reduction |
| **CLS** (Cumulative Layout Shift) | 25% | < 0.1 | Font optimization, image dimensions, reserve space |
| **FCP** (First Contentful Paint) | 10% | < 1.8s | Critical CSS, preload key resources |
| **TBT** (Total Blocking Time) | 25% | < 200ms | Code splitting, defer scripts, reduce JS payload |
| **SI** (Speed Index) | 10% | < 3.4s | Progressive rendering, above-fold optimization |

### Best Practices Score

| Check | Impact | Feature |
|-------|--------|---------|
| Uses HTTPS | High | Deployment |
| Uses HTTP/2 or HTTP/3 | Medium | Server config |
| Avoids document.write() | High | No legacy scripts |
| Avoids enormous network payloads | High | Bundle analysis, compression |
| Avoids an excessive DOM size | Medium | Component optimization |
| No vulnerable libraries | Medium | Dependency audit |

### Accessibility Score (Performance-Related)

| Check | Impact | Feature |
|-------|--------|---------|
| Low contrast text | Medium | CSS optimization |
| Missing alt text | Medium | Image optimization |
| Form labels | Low | N/A |

### SEO Score (Performance-Related)

| Check | Impact | Feature |
|-------|--------|---------|
| Structured data | Medium | Meta tags |
| HTTP status codes | High | 301 redirects (configured) |
| Crawlable links | Medium | Sitemap |
| Mobile-friendly | High | Responsive design |

## Current State Analysis (VP Associates Site)

### Already Implemented (Good Foundation)

| Feature | Status | Notes |
|---------|--------|-------|
| @nuxt/image module | Active | Configured with WebP/AVIF |
| PWA caching | Active | Service worker, offline support |
| Route-based prerendering | Active | All main routes prerendered |
| Cache headers | Active | Proper TTLs configured |
| Font preconnect | Active | Google Fonts, Iconify |
| Compression | Partial | Nitro supports, verify Brotli enabled |
| 301 redirects | Active | WordPress migration preserved |

### Gap Analysis (What's Missing)

| Gap | Impact | Priority |
|-----|--------|----------|
| Critical CSS inlining | High LCP impact | P1 |
| Lazy component loading | Medium JS reduction | P1 |
| Third-party script audit | Unknown (no scripts visible) | P1 |
| Bundle size analysis | Unknown current state | P1 |
| Image sizing verification | CLS risk | P1 |
| Lazy hydration | High INP improvement | P2 |
| Partytown evaluation | Depends on third-party usage | P2 |

## Competitor Analysis (Performance Leaders)

| Site | Lighthouse Score | Key Strategies |
|------|------------------|----------------|
| Vercel | 95-100 | Edge rendering, minimal JS, optimized images |
| GitHub | 90-95 | Progressive enhancement, lazy loading |
| Stripe | 95-100 | Server-side first, minimal client JS |
| Airbnb | 85-90 | Code splitting, aggressive lazy loading |

**Common Patterns:**
- Minimal JavaScript payload (< 100KB initial)
- Server-side rendering for critical content
- Aggressive lazy loading
- Native web APIs over libraries
- Edge deployment

## Sources

### Official Documentation
- [Nuxt Performance Best Practices](https://nuxt.com/docs/3.x/guide/best-practices/performance) - HIGH confidence
- [Nuxt Hydration Best Practices](https://nuxt.com/docs/3.x/guide/best-practices/hydration) - HIGH confidence
- [defineLazyHydrationComponent API](https://nuxt.com/docs/3.x/api/utils/define-lazy-hydration-component) - HIGH confidence
- [@nuxt/fonts Module](https://nuxt.com/modules/fonts) - HIGH confidence
- [NuxtLink Component Docs](https://nuxt.com/docs/3.x/api/components/nuxt-link) - HIGH confidence

### Performance Guides (2025-2026)
- [Nuxt 4 Performance Optimization: Complete Guide to Faster Apps in 2026](https://masteringnuxt.com/blog/nuxt-4-performance-optimization-complete-guide-to-faster-apps-in-2026) - MEDIUM confidence
- [Core Web Vitals Optimization: Complete Guide for 2026](https://skyseodigital.com/core-web-vitals-optimization-complete-guide-for-2026/) - MEDIUM confidence
- [Core Web Vitals 2026: Complete INP Guide & Assessment](https://koanthic.com/en/core-web-vitals-2026-complete-inp-guide-assessment/) - MEDIUM confidence
- [Critical CSS Inlining: Boost Above-the-Fold Page Speed](https://softwarehouse.au/blog/implementing-critical-css-inlining-for-above-the-fold-content/) - MEDIUM confidence
- [How We Achieve 90+ Lighthouse Performance Score](https://dev.to/jacobandrewsky/performance-checklist-for-vue-and-nuxt-cog) - MEDIUM confidence

### Third-Party Optimization
- [Partytown: Optimize Third Party Scripts with Web Workers](https://www.debugbear.com/blog/partytown-web-workers) - MEDIUM confidence
- [Introducing Nuxt Scripts](https://nuxt.com/blog/nuxt-scripts) - HIGH confidence
- [Using web workers to boost third-party script performance](https://blog.logrocket.com/using-web-workers-boost-third-party-script-performance/) - MEDIUM confidence

### Compression & Server
- [nuxt-precompress Module](https://nuxt.com/modules/precompress) - MEDIUM confidence
- [Nuxt on the Edge](https://nuxt.com/blog/nuxt-on-the-edge) - HIGH confidence
- [Diving Deep into Nitro](https://vueschool.io/articles/news/diving-deep-into-nitro-the-server-engine-behind-nuxt-insights-from-pooya-parsa-at-nuxt-nation-2024/) - MEDIUM confidence

### Community Resources
- [How To Optimize Performance In Nuxt Apps](https://www.debugbear.com/blog/optimize-nuxt-performance) - MEDIUM confidence
- [Optimizing Nuxt Apps for Core Web Vitals](https://dev.to/jacobandrewsky/optimizing-nuxt-apps-for-core-web-vitals-106j) - MEDIUM confidence
- [Lazy Hydration and Server Components in Nuxt](https://vueschool.io/articles/vuejs-tutorials/lazy-hydration-and-server-components-in-nuxt-vue-js-3-performance/) - MEDIUM confidence
- [Nuxt Scripts 介绍](https://nuxtjs.org.cn/blog/nuxt-scripts) - LOW confidence (translation)

### GitHub Discussions
- [Lazy Hydration in Nuxt Core #24242](https://github.com/nuxt/nuxt/issues/24242) - MEDIUM confidence
- [How to disable modulepreload/prefetch](https://github.com/nuxt/nuxt/discussions/16231) - MEDIUM confidence
- [Server component roadmap #19772](https://github.com/nuxt/nuxt/issues/19772) - MEDIUM confidence

---
*Feature research for: Nuxt 3 Performance Optimization*
*Researched: 2026-02-06*
