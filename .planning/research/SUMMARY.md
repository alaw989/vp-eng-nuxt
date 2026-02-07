# Project Research Summary

**Project:** VP Associates Website v1.1 - Performance Optimization
**Domain:** Nuxt 3 Website Performance Optimization
**Researched:** 2026-02-06
**Confidence:** HIGH

## Executive Summary

This is a performance optimization project for an existing Nuxt 3 website targeting 90+ Lighthouse scores. The existing stack is well-positioned for success with Nuxt 3.15, @nuxt/image, PWA caching, and route-based prerendering already configured. Experts achieve high performance through a layered approach: configuration-first optimizations (route rules, caching headers), component-level optimizations (lazy loading, lazy hydration), and build-level optimizations (bundle analysis, code splitting).

The recommended approach is additive, not disruptive. No major framework changes are needed. The path to 90+ focuses on: (1) measurement with rollup-plugin-visualizer and unlighthouse, (2) critical path optimization with @nuxtjs/critters for critical CSS inlining, (3) strategic lazy loading and hydration for below-fold components, and (4) server-side caching for API routes. The biggest risk is "over-optimizing" by lazy loading critical above-fold content, which devastates LCP scores. Another key risk is optimizing without measuring—baseline Lighthouse scores must be established before any changes.

Key mitigation strategies include: always use `loading="eager"` and `fetchpriority="high"` for LCP elements, apply lazy hydration only to below-fold components, use `defineCachedEventHandler` for API routes, and validate improvements with both lab (Lighthouse) and field (PageSpeed Insights CrUX) data.

## Key Findings

### Recommended Stack

The existing Nuxt 3 stack is optimal for 90+ Lighthouse scores. Three additions are recommended for measurement and optimization:

**Core technologies (no changes needed):**
- **Nuxt 3.15**: Already optimal—SSR/SSG hybrid with Nitro engine provides best-in-class performance
- **@nuxt/image 2.0**: Already optimal—WebP/AVIF conversion, responsive sizing, lazy loading built-in
- **@vite-pwa/nuxt 1.1**: Already optimal—Workbox caching configured for offline support

**Recommended additions:**
- **rollup-plugin-visualizer**: Bundle visualization—essential for data-driven optimization decisions, cannot optimize what you cannot measure
- **@nuxtjs/critters**: Critical CSS inlining—eliminates render-blocking CSS (10-20 point Performance improvement), includes PurgeCSS
- **unlighthouse**: Automated Lighthouse auditing—CI/CD integration ensures regressions are caught, site-wide crawling for comprehensive coverage

**Optional (lower priority):**
- **Font self-hosting**: 200-300ms improvement but high maintenance—only pursue if other optimizations insufficient

### Expected Features

Performance optimization features fall into three categories based on Lighthouse impact.

**Must have (table stakes for 90+):**
- **Image optimization** — Images account for 50%+ of page weight; @nuxt/image already configured, verify all images use it with proper sizing
- **Critical CSS inlining** — Eliminates render-blocking CSS; inline above-the-fold only, defer rest
- **Bundle code splitting** — Reduces initial JS payload; route-based automatic, component-level requires manual work
- **Lazy loading below-fold content** — Reduces initial payload; images, components, iframes below viewport
- **Font optimization** — Prevents FOIT/FOUT, reduces CLS; use font-display: swap, preload critical fonts
- **Remove unused CSS/JS** — Reduces payload size; PurgeCSS (included in critters), tree shaking verification
- **Third-party script optimization** — Scripts block main thread; defer non-critical, consider Partytown for web workers

**Should have (for 95+ scores):**
- **Lazy hydration** — Defers component hydration until interaction; reduces TBT/INP for heavy components
- **Partytown integration** — Moves third-party scripts to web workers; frees main thread
- **Advanced code splitting** — Component-level splitting for heavy pages
- **Performance budgets** — Automated size limits prevent regression

**Defer (v2+):**
- **Islands architecture** — Interactive islands in static page; experimental in Nuxt 3, consider when Nuxt 4 support stabilizes
- **Server components** — Zero client JS for server-only content; when Nuxt implementation matures
- **Edge rendering** — Server closer to user; requires Cloudflare Workers or Vercel Edge deployment
- **Early hints** — Send resources while server processes; requires server support for 103 status

### Architecture Approach

Performance optimizations integrate at multiple architectural boundaries: config layer (nuxt.config.ts), component layer (lazy loading, hydration), server layer (cached event handlers), and build layer (bundle analysis).

**Major components:**
1. **nuxt.config.ts** — Central configuration point for route rules, image optimization, caching headers; highest ROI, lowest risk
2. **Nitro routeRules** — Hybrid rendering (SSR/SSG/ISR) and cache headers; per-route optimization strategy
3. **Lazy components** — Code-split non-critical components using `Lazy` prefix; reduces initial bundle size
4. **Lazy hydration** — Delay component interactivity using hydrate-on-visible/interaction directives; reduces TBT
5. **defineCachedEventHandler** — Server-side caching wrapper for API routes; zero logic changes for significant response time improvement
6. **@nuxt/image** — Automatic image optimization; verify all images use it with correct loading strategy

**Key architectural pattern:** Config-first optimization. Maximize gains through nuxt.config.ts changes (route rules, caching, image settings) before code modifications. This provides the highest impact with lowest risk.

### Critical Pitfalls

1. **Over-lazy-loading critical content** — Applying lazy loading to above-fold content delays LCP, causing scores to drop below 60. Always use `loading="eager"` and `fetchpriority="high"` for LCP elements.

2. **Not using lazy hydration for below-fold components** — All components hydrate immediately, causing large TBT and poor INP. Use `hydrate-on-visible` directive for components below the fold.

3. **Bundle size inflation from unoptimized dependencies** — JavaScript bundle exceeds 500KB, causing slow downloads and delayed hydration. Run `npx nuxi analyze` to identify oversized chunks, use tree-shakeable libraries.

4. **Font loading causing layout shift** — CLS exceeds 0.1 when fonts load late and cause reflow. Use `font-display: swap`, define fallback font metrics, preload critical fonts.

5. **Measuring lab scores instead of real user experience** — Lighthouse 95+ but real users report slow experiences. Test on mobile with throttling, use PageSpeed Insights for CrUX field data, implement RUM.

## Implications for Roadmap

Based on research, suggested phase structure follows the architectural layers from highest-ROI config changes to lower-risk refinements.

### Phase 1: Performance Audit & Baseline
**Rationale:** Cannot optimize what is not measured. Baseline scores identify which metrics need focus and prevent wasted effort on already-optimized areas.
**Delivers:** Lighthouse baseline report, bundle analysis, current score documentation
**Addresses:** Performance measurement (rollup-plugin-visualizer, unlighthouse setup)
**Avoids:** Optimizing without measuring (Anti-pattern #3)
**Research flag:** Standard patterns—no additional research needed

### Phase 2: Config-First Optimization
**Rationale:** nuxt.config.ts changes affect entire site with no code modifications. Fastest path to 90+ scores with lowest risk.
**Delivers:** Optimized route rules, verified image configuration, Nitro cache headers
**Addresses:** Route rules (prerender static, ISR for semi-static), image config verification, cache headers
**Avoids:** Pitfall #5 (not leveraging hybrid rendering)
**Research flag:** Standard patterns—well-documented in Nuxt docs

### Phase 3: Critical Path Optimization
**Rationale:** Critical CSS inlining and LCP element optimization provide 10-30 point improvements in Performance score.
**Delivers:** @nuxtjs/critters integration, eager-loaded LCP images, critical CSS inlined
**Addresses:** Critical CSS inlining, image loading strategy (eager vs lazy)
**Avoids:** Pitfall #1 (over-lazy-loading critical content)
**Research flag:** Standard patterns—@nuxtjs/critters has official documentation

### Phase 4: Server-Side Caching
**Rationale:** Server-side caching has massive impact with minimal code changes. Reduces WordPress API dependency.
**Delivers:** Cached API handlers (projects, services, team, testimonials)
**Addresses:** defineCachedEventHandler wrappers, cache invalidation strategy
**Uses:** defineCachedEventHandler pattern from ARCHITECTURE.md
**Research flag:** Standard patterns—Nitro caching is well-documented

### Phase 5: Component Lazy Loading & Hydration
**Rationale:** Component-level optimizations reduce JavaScript payload and improve TTI. Requires testing for visual issues.
**Delivers:** Lazy-loaded below-fold components, lazy hydration for heavy interactive components
**Addresses:** Lazy component loading, hydrate-on-visible directive
**Avoids:** Pitfall #2 (not using lazy hydration), Anti-pattern #1 (universal lazy loading)
**Research flag:** Standard patterns—Nuxt lazy loading and hydration well-documented

### Phase 6: Image Optimization Completion
**Rationale:** Images are typically the #1 performance factor. Already partially optimized, this completes the work.
**Delivers:** All images converted to WebP/AVIF, proper loading strategies applied, responsive sizing verified
**Addresses:** Image audit, loading strategies (eager for above-fold, lazy below), next-gen format conversion
**Uses:** @nuxt/image module configuration
**Research flag:** Standard patterns—@nuxt/image has comprehensive documentation

### Phase 7: Advanced Optimizations
**Rationale:** These optimizations yield diminishing returns after phases 1-6. Higher complexity requires more testing.
**Delivers:** Bundle optimization, plugin-to-composable conversion, Vue performance directives
**Addresses:** Bundle analysis and code splitting, analytics lazy loading, v-memo/v-once directives
**Uses:** rollup-plugin-visualizer, Vue performance patterns
**Research flag:** Standard patterns—Vue and Nuxt performance docs cover these

### Phase 8: Monitoring & CI Integration
**Rationale:** Monitoring prevents regression but doesn't improve scores directly. Add after optimizations complete.
**Delivers:** Lighthouse CI integration, automated performance regression testing, optional RUM
**Addresses:** CI/CD performance gates, score thresholds
**Uses:** unlighthouse CI integration
**Research flag:** Standard patterns—Unlighthouse CI docs available

### Phase Ordering Rationale

The order follows impact-to-effort ratio and architectural dependencies. Config changes (Phase 2-3) affect the entire application with minimal risk. Server-side caching (Phase 4) reduces load times before client-side optimizations. Component work (Phase 5-6) comes after server optimizations to avoid optimizing the wrong things. Advanced optimizations (Phase 7) are deferred until foundational work is complete. Monitoring (Phase 8) ensures gains are maintained.

This ordering also avoids the key pitfalls identified in research: we measure before optimizing (Phase 1), eagerly load critical content (Phase 3), apply lazy hydration strategically (Phase 5), and validate with real-world data (Phase 8).

### Research Flags

Phases with standard patterns (skip `/gsd:research-phase`):
- **Phase 1-8**: All phases rely on well-documented Nuxt features and established performance patterns. Official documentation is comprehensive. No additional research needed during planning.

Phases potentially needing deeper research:
- **None identified** — All optimization techniques are well-documented in official Nuxt documentation and authoritative performance guides.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Official Nuxt documentation provides comprehensive guidance. All recommended additions have official support. |
| Features | HIGH | Core Web Vitals and Lighthouse metrics are well-defined industry standards. Feature-Lighthouse mapping is definitive. |
| Architecture | HIGH | Nuxt 3 architecture patterns are documented in official guides. Caching and rendering patterns have authoritative sources. |
| Pitfalls | HIGH | Identified from official Nuxt docs, authoritative performance guides, and real-world case studies. Warning signs are concrete. |

**Overall confidence:** HIGH

All research sources are either official documentation (Nuxt, Vite, Google Core Web Vitals) or authoritative performance guides from recognized experts. No inference required—recommendations are based on established best practices with concrete implementation examples.

### Gaps to Address

- **Current baseline scores unknown**: Run Lighthouse audit in Phase 1 to establish baseline. Cannot know which optimizations are most critical without measuring first.
- **Image optimization status partial**: HERO images are optimized, but projects/ and other directories need verification. Address in Phase 6 image audit.
- **Third-party script usage unclear**: Analytics plugin exists but implementation unknown. Review during Phase 5 component optimization.
- **Production caching headers unverified**: Configured in nuxt.config.ts but need production verification. Test in Phase 2.

---

*Research completed: 2026-02-06*
*Ready for roadmap: yes*
