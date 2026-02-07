# Requirements: VP Associates Website v1.1

**Defined:** 2026-02-06
**Core Value:** VP Associates has a fast, modern, SEO-optimized website that achieves 90+ Lighthouse scores

## v1.1 Requirements

Requirements for the performance optimization milestone. Each maps to roadmap phases.

### Measurement

- [ ] **PERF-01**: Run Lighthouse audit to establish baseline scores across all pages
- [ ] **PERF-02**: Perform bundle size analysis with rollup-plugin-visualizer
- [ ] **PERF-03**: Identify LCP (Largest Contentful Paint) element for each route

### Critical Path Optimization

- [ ] **PERF-04**: Implement critical CSS inlining to eliminate render-blocking styles
- [ ] **PERF-05**: Optimize LCP images with eager loading and priority hints
- [ ] **PERF-06**: Add preload hints for critical fonts and resources

### Code Optimization

- [ ] **PERF-07**: Implement lazy loading for below-fold components
- [ ] **PERF-08**: Implement lazy hydration for heavy components (hydrate-on-visible)
- [ ] **PERF-09**: Remove unused CSS and JavaScript, analyze bundle
- [ ] **PERF-10**: Implement server-side caching for API routes

### Navigation Fixes

- [x] **NAV-01**: Fix /careers route conflict (careers.vue → careers/index.vue)
- [x] **NAV-02**: Fix /services and /careers links to use NuxtLink (sitemap, header, footer)
- [x] **NAV-03**: Fix infinite redirect loop in routeRules (removed /services/ and /careers/ redirects)

### Validation

- [ ] **PERF-11**: Integrate Lighthouse CI with budget assertions
- [ ] **PERF-12**: Verify Brotli compression is enabled in production
- [ ] **PERF-13**: Verify cache headers are configured correctly

## Future Requirements

Deferred to future milestones.

### Advanced Performance

- **PERF-ADV-01**: Edge deployment evaluation (Cloudflare Workers, Vercel Edge)
- **PERF-ADV-02**: Islands architecture implementation
- **PERF-ADV-03**: Partytown integration for third-party scripts

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Full page transitions | Blocks interaction, delays hydration |
| Heavy animation libraries | Massive JS payload, CLS risk |
| Aggressive prefetching | Can waste bandwidth, hurt LCP |
| Font self-hosting without optimization | Often slower than CDN |
| Universal/Bridge mode | Polyfill bloat, slower performance |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| NAV-01, NAV-02, NAV-03 | Phase 11 | Complete |
| PERF-01, PERF-02, PERF-03 | Phase 12 | Pending |
| PERF-04, PERF-05, PERF-06 | Phase 13 | Pending |
| PERF-07, PERF-08, PERF-09, PERF-10 | Phase 14 | Pending |
| PERF-11, PERF-12, PERF-13 | Phase 15 | Pending |

**Coverage:**
- v1.1 active requirements: 13 total
- Mapped to phases: 13/13 (100%) ✓
- Unmapped: 0

---
*Requirements defined: 2026-02-06*
*Last updated: 2026-02-06 after v1.1 roadmap creation*
