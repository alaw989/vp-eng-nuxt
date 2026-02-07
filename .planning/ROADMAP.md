# Roadmap: VP Associates Website Modernization

## Overview

The v1.0 milestone delivered a complete Nuxt 3 headless website with visual and functional parity to the source WordPress site. The v1.1 milestone focuses on performance optimization to achieve 90+ Lighthouse scores across all pages. The approach is measurement-driven: establish baselines, optimize the critical path first (highest ROI), then implement code-level optimizations, and finally set up continuous monitoring to prevent regression.

## Milestones

- ✅ **v1.0 Website Modernization** - Phases 1-10 (shipped 2026-02-06) - [See archive](.planning/milestones/v1.0-ROADMAP.md)
- ✅ **v1.1 Performance Optimization & WordPress API** - Phases 11-16 (shipped 2026-02-07) - [See archive](.planning/milestones/v1.1-ROADMAP.md)

## Phases

<details>
<summary>✅ v1.0 Website Modernization (Phases 1-10) - SHIPPED 2026-02-06</summary>

### Phase 1: Audit & Baseline Capture
**Goal**: Capture baseline screenshots, page inventory, and metadata from live site
**Plans**: 3 plans

### Phase 2: Comparison Infrastructure
**Goal**: Build side-by-side visual diff and HTML content verification tools
**Plans**: 4 plans

### Phase 3: Image Migration
**Goal**: Download, optimize, and generate responsive variants for all images
**Plans**: 3 plans

### Phase 4: Content & SEO Validation
**Goal**: Validate content integrity, links, meta tags, and sitemap generation
**Plans**: 5 plans

### Phase 5: QA & PWA Foundation
**Goal**: Establish QA infrastructure and implement PWA features
**Plans**: 4 plans

### Phase 6: Homepage Polish
**Goal**: Polish homepage with hero parallax, featured sections, and testimonials
**Plans**: 4 plans

### Phase 7: Section Polish - Projects
**Goal**: Polish projects listing with filters and detail pages with galleries
**Plans**: 4 plans

### Phase 8: Section Polish - Services
**Goal**: Polish services listing with categories and detail pages with hero images
**Plans**: 4 plans

### Phase 9: Section Polish - About & Team
**Goal**: Polish about page content and team member cards with optimized photos
**Plans**: 4 plans

### Phase 10: Section Polish - Contact & Careers
**Goal**: Polish contact form styling, map integration, and job listings
**Plans**: 4 plans

</details>

<details>
<summary>✅ v1.1 Performance Optimization & WordPress API (Phases 11-16) - SHIPPED 2026-02-07</summary>

**Milestone Goal:** VP Associates website achieves 90+ Lighthouse scores across all pages through measurement-driven optimization of critical path, code, and server-side caching. WordPress headless architecture established with live API integration.

#### Phase 11: Navigation Fixes
**Goal**: Critical navigation issues are resolved to enable routing to all pages
**Depends on**: Phase 10 (v1.0 complete)
**Requirements**: NAV-01, NAV-02, NAV-03
**Success Criteria** (what must be TRUE):
  1. User can navigate to /careers page without encountering route conflicts
  2. User can navigate to /services and /careers pages via header, footer, and sitemap links using client-side routing
  3. User does not encounter infinite redirect loops when accessing /services/ or /careers/ with trailing slash
**Plans**: 1 plan

Plans:
- [x] 11-01: Fix careers route conflict, update NuxtLink navigation, remove redirect loop

#### Phase 12: Performance Baseline
**Goal**: Comprehensive performance measurement establishes current state and identifies optimization targets
**Depends on**: Phase 11
**Requirements**: PERF-01, PERF-02, PERF-03
**Success Criteria** (what must be TRUE):
  1. Lighthouse audit has been run on all major pages and baseline scores are documented
  2. Bundle analysis visualization exists showing JavaScript payload sizes by chunk
  3. LCP (Largest Contentful Paint) element is identified for each route to prioritize optimization
**Plans**: 3 plans

Plans:
- [x] 12-01: Run Lighthouse audit across all pages and document baseline scores
- [x] 12-02: Perform bundle size analysis with rollup-plugin-visualizer
- [x] 12-03: Identify LCP element for each route

#### Phase 13: Critical Path Optimization
**Goal**: Render-blocking resources are eliminated and LCP elements load instantly
**Depends on**: Phase 12
**Requirements**: PERF-04, PERF-05, PERF-06
**Success Criteria** (what must be TRUE):
  1. Above-the-fold content renders immediately without waiting for CSS (critical CSS inlined)
  2. LCP images load with eager loading and priority hints (no delay on largest content element)
  3. Critical fonts and resources have preload hints in document head
**Plans**: 3 plans

Plans:
- [x] 13-01: Implement critical CSS inlining with @nuxtjs/critters
- [x] 13-02: Optimize LCP images with eager loading and priority hints
- [x] 13-03: Add preload hints for critical fonts and resources

#### Phase 14: Code Optimization
**Goal**: JavaScript payload is reduced and server response times are improved through caching
**Depends on**: Phase 13
**Requirements**: PERF-07, PERF-08, PERF-09, PERF-10
**Success Criteria** (what must be TRUE):
  1. Below-fold components load lazily reducing initial JavaScript payload
  2. Heavy interactive components hydrate only when visible (reduces main thread blocking)
  3. Unused CSS and JavaScript have been removed from production bundle
  4. API routes respond quickly with server-side caching enabled
**Plans**: 4 plans

Plans:
- [x] 14-01: Implement lazy loading for below-fold components
- [x] 14-02: Implement lazy hydration for heavy components
- [x] 14-03: Remove unused CSS and JavaScript with bundle analysis
- [x] 14-04: Implement server-side caching for API routes

#### Phase 15: Validation & Monitoring
**Goal**: Performance optimizations are verified and continuous monitoring prevents regression
**Depends on**: Phase 14
**Requirements**: PERF-11, PERF-12, PERF-13
**Success Criteria** (what must be TRUE):
  1. Lighthouse CI runs on each build with budget assertions enforcing score thresholds
  2. Brotli compression is active in production reducing asset transfer sizes
  3. Cache headers are configured correctly for static assets and API responses
**Plans**: 3 plans

Plans:
- [x] 15-01: Integrate Lighthouse CI with budget assertions
- [x] 15-02: Verify Brotli compression is enabled in production
- [x] 15-03: Verify cache headers are configured correctly

#### Phase 16: WordPress API Integration
**Goal**: Establish headless WordPress architecture with Custom Post Types and integrate live API content into Nuxt frontend
**Depends on**: None (can run parallel to performance phases)
**Requirements**: WPAPI-01, WPAPI-02, WPAPI-03
**Success Criteria** (what must be TRUE):
  1. WordPress Custom Post Types (Services, Projects, Team, Testimonials) registered with REST API enabled ✓
  2. Custom field meta boxes created for each CPT with appropriate fields (using native custom fields) ✓
  3. Nuxt site successfully fetches and displays content from live WordPress API ✓
  4. Circular elements render as perfect circles ✓
  5. Testimonials display as single-row slider ✓
  6. Hero section has gradient enhancement ✓
**Plans**: 7 plans

Plans:
- [x] 16-01: Create WordPress CPT Registration Plugin
- [x] 16-02: Create ACF Field Groups for CPTs (using native custom fields instead)
- [ ] 16-03: Migrate Existing Content to CPTs (user to complete via WordPress admin)
- [x] 16-04: Update Nuxt API Integration
- [x] 16-05: Fix Circle Elements Styling
- [x] 16-06: Create Testimonials Slider Component
- [x] 16-07: Enhance Hero Section with Gradients

</details>

## Progress

**Execution Order:**
Phases execute in numeric order: 11 → 12 → 13 → 14 → 15

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Audit & Baseline Capture | v1.0 | 3/3 | Complete | 2025-02-03 |
| 2. Comparison Infrastructure | v1.0 | 4/4 | Complete | 2025-02-03 |
| 3. Image Migration | v1.0 | 3/3 | Complete | 2025-02-03 |
| 4. Content & SEO Validation | v1.0 | 5/5 | Complete | 2025-02-04 |
| 5. QA & PWA Foundation | v1.0 | 4/4 | Complete | 2025-02-04 |
| 6. Homepage Polish | v1.0 | 4/4 | Complete | 2025-02-05 |
| 7. Section Polish - Projects | v1.0 | 4/4 | Complete | 2025-02-05 |
| 8. Section Polish - Services | v1.0 | 4/4 | Complete | 2025-02-06 |
| 9. Section Polish - About & Team | v1.0 | 4/4 | Complete | 2025-02-06 |
| 10. Section Polish - Contact & Careers | v1.0 | 4/4 | Complete | 2025-02-06 |
| 11. Navigation Fixes | v1.1 | 1/1 | Complete | 2026-02-06 |
| 12. Performance Baseline | v1.1 | 3/3 | Complete | 2026-02-06 |
| 13. Critical Path Optimization | v1.1 | 3/3 | Complete | 2026-02-06 |
| 14. Code Optimization | v1.1 | 4/4 | Complete | 2026-02-06 |
| 15. Validation & Monitoring | v1.1 | 3/3 | Complete | 2026-02-06 |
| 16. WordPress API Integration | v1.1 | 6/7 | Complete | 2026-02-07 |

**Overall Progress:** 59/62 plans complete (95%) - Plan 16-03 is manual content migration by user
