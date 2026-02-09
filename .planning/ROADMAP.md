# Roadmap: VP Associates Website Modernization

## Overview

A modernization rebuild of vp-associates.com using Nuxt 3 headless architecture with WordPress CMS integration. The rebuild improves performance, SEO, and maintainability while preserving all existing functionality. Work proceeds section-by-section, systematically fixing styling/layout/functionality issues and migrating images from the live site.

## Milestones

- ✅ **v1.0 Website Modernization** - Phases 1-10 (shipped 2026-02-06) - [See archive](.planning/milestones/v1.0-ROADMAP.md)
- ✅ **v1.1 Performance Optimization & WordPress API Integration** - Phases 11-16 (shipped 2026-02-07) - [See archive](.planning/milestones/v1.1-ROADMAP.md)
- 🚧 **v1.2 Refinement** - Phases 17-22 (in progress)

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
<summary>✅ v1.1 Performance Optimization & WordPress API Integration (Phases 11-16) - SHIPPED 2026-02-07</summary>

**Milestone Goal:** VP Associates website achieves 90+ Lighthouse scores across all pages through measurement-driven optimization of critical path, code, and server-side caching. WordPress headless architecture established with live API integration.

#### Phase 11: Navigation Fixes
**Goal**: Critical navigation issues are resolved to enable routing to all pages
**Plans**: 1 plan

#### Phase 12: Performance Baseline
**Goal**: Comprehensive performance measurement establishes current state and identifies optimization targets
**Plans**: 3 plans

#### Phase 13: Critical Path Optimization
**Goal**: Render-blocking resources are eliminated and LCP elements load instantly
**Plans**: 3 plans

#### Phase 14: Code Optimization
**Goal**: JavaScript payload is reduced and server response times are improved through caching
**Plans**: 4 plans

#### Phase 15: Validation & Monitoring
**Goal**: Performance optimizations are verified and continuous monitoring prevents regression
**Plans**: 3 plans

#### Phase 16: WordPress API Integration
**Goal**: Establish headless WordPress architecture with Custom Post Types and integrate live API content into Nuxt frontend
**Plans**: 7 plans (6 complete, 1 manual)

</details>

### 🚧 v1.2 Refinement (In Progress)

**Milestone Goal:** VP Associates website has polished UX with smooth page transitions, responsive micro-interactions, full WCAG 2.1 AA accessibility, all known technical issues resolved, and modernized hero section.

#### Phase 17: Accessibility Foundation
**Goal**: WCAG 2.1 AA compliance with full keyboard navigation and screen reader support
**Depends on**: Phase 16
**Requirements**: A11Y-01 through A11Y-09 (9 requirements)
**Success Criteria** (what must be TRUE):
  1. User can navigate entire site using only keyboard (Tab, Enter, Escape, Arrow keys)
  2. Screen reader announces page changes and interactive elements correctly
  3. All interactive elements have visible focus indicators (2px minimum, high contrast)
  4. Color contrast meets WCAG AA standards (4.5:1 for text, 3:1 for large text)
  5. Modal/dialog focus traps work and focus returns after closing
**Plans**: 5 plans

**Wave Structure:**
- Wave 1 (parallel): 17-01 (@nuxt/a11y + semantic audit), 17-02 (ARIA labels + landmarks)
- Wave 2 (parallel): 17-03 (keyboard navigation), 17-04 (focus management + focus traps)
- Wave 3 (sequential): 17-05 (live regions + E2E tests)

Plans:
- [ ] 17-01-PLAN.md — Install @nuxt/a11y module, verify skip link, audit semantic HTML structure
- [ ] 17-02-PLAN.md — Add ARIA labels to icon buttons, cards, and interactive components
- [ ] 17-03-PLAN.md — Implement keyboard navigation (Escape, Arrow keys) using VueUse useMagicKeys
- [ ] 17-04-PLAN.md — Implement focus management with VueUse useFocusTrap and enhance focus indicators
- [ ] 17-05-PLAN.md — Create live region composable, add route announcements, E2E accessibility tests

#### Phase 18: Core Micro-interactions
**Goal**: Responsive visual feedback on all interactive elements
**Depends on**: Phase 17
**Requirements**: MICRO-01 through MICRO-06 (6 requirements)
**Success Criteria** (what must be TRUE):
  1. All buttons show hover state (color + subtle transform, 150-200ms)
  2. All links show hover indication (underline or color shift)
  3. Cards (ProjectCard, ServiceCard, TeamMember) show subtle lift on hover
  4. Form fields show real-time validation feedback (visual + ARIA)
  5. Loading states display skeleton screens for async content
  6. Focus indicators are visible on all focusable elements
**Plans**: 5 plans

**Wave Structure:**
- Wave 1 (parallel): 18-01 (buttons/links + global reduced motion), 18-02 (cards), 18-05 (focus indicators)
- Wave 2 (sequential): 18-03 (form validation), 18-04 (loading states)

Plans:
- [x] 18-01-PLAN.md — Update all button and link hover states with consistent 300ms timing, add global reduced motion support
- [x] 18-02-PLAN.md — Add hover lift effects (-translate-y-1) to ProjectCard, ServiceCard, TeamMember, TestimonialCard
- [x] 18-03-PLAN.md — Implement real-time form validation with blur/change handlers, create useFormValidation composable
- [x] 18-04-PLAN.md — Add skeleton loading states to projects and services index pages
- [x] 18-05-PLAN.md — Verify and document focus indicators across all interactive elements

#### Phase 19: Page Transitions
**Goal**: Smooth navigation with accessibility-aware page transitions
**Depends on**: Phase 18
**Requirements**: TRANS-01 through TRANS-06 (6 requirements)
**Success Criteria** (what must be TRUE):
  1. Page transitions are smooth (150ms cross-fade)
  2. Transitions respect `prefers-reduced-motion` OS setting
  3. Layout transitions work smoothly during navigation
  4. Route changes are announced to screen readers
  5. Directional transitions (slide based on route depth) work appropriately
  6. Custom transitions exist for pages where appropriate
**Plans**: 5 plans

**Wave Structure:**
- Wave 1 (parallel): 19-01 (global config), 19-02 (reduced motion)
- Wave 2 (sequential): 19-03 (layout transitions), 19-04 (verification), 19-05 (directional)

Plans:
- [ ] 19-01-PLAN.md — Update page/layout transitions to 150ms cross-fade, create usePageTransition composable
- [ ] 19-02-PLAN.md — Update reduced motion CSS to 150ms linear transitions (no transforms)
- [ ] 19-03-PLAN.md — Verify layout transitions work smoothly with NuxtLayout wrapper
- [ ] 19-04-PLAN.md — Verify screen reader route announcements (TRANS-04 already satisfied)
- [ ] 19-05-PLAN.md — Implement directional transitions for projects/services detail navigation

#### Phase 20: Advanced Micro-interactions
**Goal**: Engaging scroll-triggered and animated interactions
**Depends on**: Phase 19
**Requirements**: MICRO-07 through MICRO-10 (4 requirements)
**Success Criteria** (what must be TRUE):
  1. Elements animate smoothly when scrolling into viewport (Intersection Observer)
  2. Stats counter animates (count-up) when visible
  3. Service filter changes layout smoothly (FLIP technique)
  4. Testimonial carousel transitions are smooth
**Plans**: 4 plans

**Wave Structure:**
- Wave 1 (parallel): 20-01 (scroll-triggered animations), 20-02 (stats counter)
- Wave 2 (parallel): 20-03 (filter FLIP animations), 20-04 (carousel polish)

Plans:
- [x] 20-01-PLAN.md — Enhanced scroll-triggered animations with once, rootMargin, stagger options, and reduced-motion support
- [x] 20-02-PLAN.md — Add reduced-motion support to StatCounter (instant display for motion-sensitive users)
- [x] 20-03-PLAN.md — Implement FLIP technique for smooth service/project filter layout transitions
- [x] 20-04-PLAN.md — Polish testimonial carousel with 300ms transitions, card fade-in, and reduced-motion support

#### Phase 21: Known Issue Fixes
**Goal**: Resolve remaining technical debt and CLS issues
**Depends on**: Phase 20
**Requirements**: FIX-01, FIX-02 (2 requirements)
**Success Criteria** (what must be TRUE):
  1. Hero images have explicit dimensions preventing Cumulative Layout Shift
  2. Duplicate chunks eliminated from bundle (verified via bundle analysis)
**Plans**: 2 plans

**Wave Structure:**
- Wave 1 (parallel): 21-01 (hero image fix), 21-02 (bundle deduplication)

Plans:
- [x] 21-01-PLAN.md — Remove conflicting width/height from hero NuxtImg, rely on container dimensions for CLS prevention
- [x] 21-02-PLAN.md — Lazy-load ServiceAreaMap, configure manualChunks to split Leaflet into vendor-leaflet chunk

#### Phase 22: Hero Modernization
**Goal**: Modernize hero section based on competitive research of top engineering company websites
**Depends on**: Phase 21
**Requirements**: HERO-01 through HERO-05 (5 requirements)
**Success Criteria** (what must be TRUE):
  1. Hero visual design reflects modern engineering industry standards (typography, layout, imagery)
  2. Hero messaging/copy communicates VP Associates' value proposition clearly
  3. Hero interactions are polished (smooth transitions, engaging animations)
  4. Hero performs well on mobile devices (responsive, fast loading)
  5. Hero accessibility is maintained (WCAG 2.1 AA compliance preserved)
**Plans**: 5 plans

**Wave Structure:**
- Wave 1 (parallel): 22-01 (static hero implementation), 22-02 (messaging refinement)
- Wave 2 (parallel): 22-03 (image optimization + parallax), 22-04 (animations)
- Wave 3 (sequential): 22-05 (testing + verification)

Plans:
- [x] 22-01-PLAN.md — Create static hero component replacing 9-slide carousel
- [x] 22-02-PLAN.md — Refine messaging and copy based on competitive research
- [x] 22-03-PLAN.md — Optimize background imagery and implement subtle parallax
- [x] 22-04-PLAN.md — Add polished entrance animations and hover effects
- [x] 22-05-PLAN.md — Comprehensive testing across devices, browsers, accessibility standards

## Progress

**Execution Order:**
Phases execute in numeric order: 17 → 18 → 19 → 20 → 21 → 22

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Audit & Baseline Capture | v1.0 | 3/3 | Complete | 2026-02-03 |
| 2. Comparison Infrastructure | v1.0 | 4/4 | Complete | 2026-02-03 |
| 3. Image Migration | v1.0 | 3/3 | Complete | 2026-02-04 |
| 4. Content & SEO Validation | v1.0 | 5/5 | Complete | 2026-02-04 |
| 5. QA & PWA Foundation | v1.0 | 4/4 | Complete | 2026-02-04 |
| 6. Homepage Polish | v1.0 | 4/4 | Complete | 2026-02-05 |
| 7. Section Polish - Projects | v1.0 | 4/4 | Complete | 2026-02-05 |
| 8. Section Polish - Services | v1.0 | 4/4 | Complete | 2026-02-06 |
| 9. Section Polish - About & Team | v1.0 | 4/4 | Complete | 2026-02-06 |
| 10. Section Polish - Contact & Careers | v1.0 | 4/4 | Complete | 2026-02-06 |
| 11. Navigation Fixes | v1.1 | 1/1 | Complete | 2026-02-06 |
| 12. Performance Baseline | v1.1 | 3/3 | Complete | 2026-02-06 |
| 13. Critical Path Optimization | v1.1 | 3/3 | Complete | 2026-02-06 |
| 14. Code Optimization | v1.1 | 4/4 | Complete | 2026-02-06 |
| 15. Validation & Monitoring | v1.1 | 3/3 | Complete | 2026-02-06 |
| 16. WordPress API Integration | v1.1 | 6/7 | Complete | 2026-02-07 |
| 17. Accessibility Foundation | v1.2 | 5/5 | Complete | 2026-02-07 |
| 18. Core Micro-interactions | v1.2 | 5/5 | Complete | 2026-02-08 |
| 19. Page Transitions | v1.2 | 5/5 | Complete | 2026-02-08 |
| 20. Advanced Micro-interactions | v1.2 | 4/4 | Complete | 2026-02-09 |
| 21. Known Issue Fixes | v1.2 | 2/2 | Complete | 2026-02-09 |
| 22. Hero Modernization | v1.2 | 5/5 | Complete | 2026-02-08 |

**Overall Progress:** 86/86 plans complete (100%) - Plan 16-03 is manual content migration by user
