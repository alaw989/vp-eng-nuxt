# Roadmap: VP Associates Website Modernization

## Overview

A modernization rebuild of vp-associates.com using Nuxt 3 headless architecture with WordPress CMS integration. The rebuild improves performance, SEO, and maintainability while preserving all existing functionality. Work proceeds section-by-section, systematically fixing styling/layout/functionality issues and migrating images from the live site.

## Milestones

- [See archive](.planning/milestones/v1.0-ROADMAP.md) **v1.0 Website Modernization** - Phases 1-10 (shipped 2026-02-06)
- [See archive](.planning/milestones/v1.1-ROADMAP.md) **v1.1 Performance Optimization & WordPress API Integration** - Phases 11-16 (shipped 2026-02-07)
- [See archive](.planning/milestones/v1.2-ROADMAP.md) **v1.2 Refinement** - Phases 17-23 (shipped 2026-02-09)
- **v1.4 Content Parity Audit** - Phases 24-28 (in progress)

## Phases

<details>
<summary>v1.0 Website Modernization (Phases 1-10) - SHIPPED 2026-02-06</summary>

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
<summary>v1.1 Performance Optimization & WordPress API Integration (Phases 11-16) - SHIPPED 2026-02-07</summary>

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

<details>
<summary>v1.2 Refinement (Phases 17-23) - SHIPPED 2026-02-09</summary>

**Milestone Goal:** VP Associates website has polished UX with smooth page transitions, responsive micro-interactions, full WCAG 2.1 AA accessibility, all known technical issues resolved, and modernized hero section.

- [x] Phase 17: Accessibility Foundation (5/5 plans) - completed 2026-02-07
- [x] Phase 18: Core Micro-interactions (5/5 plans) - completed 2026-02-08
- [x] Phase 19: Page Transitions (5/5 plans) - completed 2026-02-08
- [x] Phase 20: Advanced Micro-interactions (4/4 plans) - completed 2026-02-09
- [x] Phase 21: Known Issue Fixes (2/2 plans) - completed 2026-02-09
- [x] Phase 22: Hero Modernization (5/5 plans) - completed 2026-02-08
- [x] Phase 23: Tech Debt Cleanup (3/3 plans) - completed 2026-02-09

</details>

### v1.4 Content Parity Audit (In Progress)

**Milestone Goal:** All text content from the live WordPress site (vp-associates.com) is present and accurate on the new Nuxt site. Every page section verified through systematic comparison.

#### Phase 24: Homepage Content Parity
**Goal**: Homepage text content matches live vp-associates.com exactly
**Depends on**: Nothing (first phase of milestone)
**Requirements**: HOME-01, HOME-02, HOME-03, HOME-04, HOME-05
**Success Criteria** (what must be TRUE):
  1. Hero section headline, subheadline, and CTA text match live site
  2. About section paragraph text matches live site word-for-word
  3. Services preview section text and service names match live site
  4. Projects preview section text and project names match live site
  5. Testimonials content (quotes, names, titles) match live site
**Plans**: TBD

#### Phase 25: Service Pages Content Parity
**Goal**: Services listing and all individual service pages match live site content
**Depends on**: Phase 24
**Requirements**: SERV-01, SERV-02, SERV-03
**Success Criteria** (what must be TRUE):
  1. Services listing page intro text matches live site
  2. All individual service page descriptions are complete and accurate
  3. Service page CTAs and supplementary text match live site
**Plans**: TBD

#### Phase 26: Project Pages Content Parity
**Goal**: Projects listing and all individual project pages match live site content
**Depends on**: Phase 24
**Requirements**: PROJ-01, PROJ-02, PROJ-03
**Success Criteria** (what must be TRUE):
  1. Projects listing page intro text matches live site
  2. All individual project page descriptions are complete and accurate
  3. Project details (location, scope, outcomes) match live site
**Plans**: TBD

#### Phase 27: About & Team Content Parity
**Goal**: About page and team member information match live site content
**Depends on**: Phase 24
**Requirements**: ABOUT-01, ABOUT-02, ABOUT-03
**Success Criteria** (what must be TRUE):
  1. Company description on about page matches live site
  2. Company history/timeline content matches live site
  3. All team member bios match live site
**Plans**: TBD

#### Phase 28: Contact & Careers Content Parity
**Goal**: Contact and careers page text content matches live site
**Depends on**: Phase 24
**Requirements**: CONT-01, CONT-02
**Success Criteria** (what must be TRUE):
  1. Contact page text content matches live site
  2. Careers page text content matches live site
**Plans**: TBD

## Progress

**Overall Progress:** 89/89 plans complete (100%) across v1.0, v1.1, and v1.2

| Milestone | Phases | Plans | Status | Shipped |
|-----------|--------|-------|--------|---------|
| v1.0 Website Modernization | 1-10 | 55/55 | Complete | 2026-02-06 |
| v1.1 Performance & WordPress | 11-16 | 20/21 | Complete | 2026-02-07 |
| v1.2 Refinement | 17-23 | 29/29 | Complete | 2026-02-09 |
| v1.4 Content Parity Audit | 24-28 | 0/TBD | In progress | - |

*Note: Plan 16-03 (v1.1) is manual content migration by user*

### v1.4 Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 24. Homepage Content Parity | 0/TBD | Not started | - |
| 25. Service Pages Content Parity | 0/TBD | Not started | - |
| 26. Project Pages Content Parity | 0/TBD | Not started | - |
| 27. About & Team Content Parity | 0/TBD | Not started | - |
| 28. Contact & Careers Content Parity | 0/TBD | Not started | - |
