# Roadmap: VP Associates Website Modernization

## Overview

This roadmap delivers a modern Nuxt 3 headless website that systematically improves the VP Associates web presence through methodical section-by-section refinement. Starting with comprehensive audit and baseline capture, we build comparison infrastructure and quality assurance foundations before migrating images and validating content integrity. The final phases focus on polishing each section (homepage, projects, services, about/team, contact/careers) with visual and functional parity against the live site.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Audit & Baseline Capture** - Establish content inventory, SEO baseline, and visual screenshots
- [x] **Phase 2: Comparison Infrastructure** - Build visual diff tools and HTML comparison capabilities
- [x] **Phase 3: Image Migration** - Download and optimize all images from source site
- [x] **Phase 4: Content & SEO Validation** - Validate links, content integrity, and SEO preservation
- [x] **Phase 5: QA & PWA Foundation** - Build testing infrastructure and PWA features
- [x] **Phase 6: Homepage Polish** - Fix homepage styling, layout, and migrate homepage images
- [ ] **Phase 7: Section Polish - Projects** - Fix project listing/detail pages, migrate project images
- [ ] **Phase 8: Section Polish - Services** - Fix service listing/detail pages, migrate service images
- [ ] **Phase 9: Section Polish - About & Team** - Fix about/team pages, migrate team photos
- [ ] **Phase 10: Section Polish - Contact & Careers** - Fix contact/careers pages and form styling

## Phase Details

### Phase 1: Audit & Baseline Capture
**Goal**: Establish comprehensive baseline of source site before any changes
**Depends on**: Nothing (first phase)
**Requirements**: REQ-AUD-001, REQ-AUD-002
**Success Criteria** (what must be TRUE):
  1. All pages from vp-associates.com are enumerated and saved to pages.json
  2. Visual screenshots captured for all pages across mobile, tablet, and desktop viewports
  3. Baseline images organized in `.planning/audit/baselines/` with consistent naming
  4. Audit results include page metadata (URL, title, last modified) for comparison
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Page enumeration script with sitemap + REST API hybrid approach
- [x] 01-02-PLAN.md — Playwright screenshot capture across mobile, tablet, desktop viewports
- [x] 01-03-PLAN.md — Metadata generation and audit directory documentation

### Phase 2: Comparison Infrastructure
**Goal**: Enable safe iteration through visual and HTML comparison tools
**Depends on**: Phase 1 (baselines required for comparison)
**Requirements**: REQ-CMP-001, REQ-CMP-002
**Success Criteria** (what must be TRUE):
  1. Side-by-side comparison interface displays old vs new screenshots simultaneously
  2. Visual diff highlights pixel differences between baseline and current implementations
  3. HTML source comparison reports semantic element differences (headings, nav, main, footer)
  4. Comparison results export to structured format for review
**Plans**: 4 plans

Plans:
- [x] 02-01-PLAN.md — Pixel diff infrastructure with odiff-bin for current screenshots and diff generation
- [x] 02-02-PLAN.md — Viewer UI files (HTML, CSS, JavaScript) for side-by-side comparison
- [x] 02-03-PLAN.md — HTML content verification using Cheerio for semantic elements and text presence
- [x] 02-04-PLAN.md — Express server wiring viewer UI to comparison data with auto-open

### Phase 3: Image Migration
**Goal**: Download and optimize all images from source site for use in new application
**Depends on**: Phase 1 (page enumeration needed for image discovery)
**Requirements**: REQ-IMG-001, REQ-IMG-002
**Success Criteria** (what must be TRUE):
  1. All images from vp-associates.com downloaded and organized in `public/images/`
  2. Images converted to modern formats (WebP primary, JPG fallback) with responsive variants
  3. Image sizes meet targets (hero <200KB, project <100KB, team <50KB)
  4. Image mapping file documents source URL to local path relationships
**Plans**: 3 plans

Plans:
- [ ] 03-01-PLAN.md — Install Sharp and create image download script with WordPress Media API + HTML crawling
- [x] 03-02-PLAN.md — Generate WebP+JPG responsive variants (640w, 1280w, 1920w) with size cap enforcement
- [x] 03-03-PLAN.md — Generate image mapping file with source URL to local path documentation

### Phase 4: Content & SEO Validation
**Goal**: Verify content integrity and SEO preservation during migration
**Depends on**: Phase 1 (page list needed for validation)
**Requirements**: REQ-LNK-001, REQ-LNK-002, REQ-SEO-001, REQ-SEO-002, REQ-SEO-003
**Success Criteria** (what must be TRUE):
  1. All internal links validated with HTTP 200 status, broken links documented
  2. Text content compared between source and target with changes >10% flagged
  3. All SEO meta tags (title, description, Open Graph, Twitter) preserved from source
  4. URL structure documented with 301 redirects implemented for any changed URLs
  5. XML sitemap generated at /sitemap.xml and ready for Search Console submission
**Plans**: 5 plans

Plans:
- [x] 04-01-PLAN.md — Internal link validation with broken link report generation
- [x] 04-02-PLAN.md — Content integrity comparison between source and target
- [x] 04-03-PLAN.md — Meta tag migration verification (Open Graph, Twitter Cards)
- [x] 04-04-PLAN.md — URL structure documentation and redirect implementation
- [x] 04-05-PLAN.md — Sitemap generation and Search Console preparation

### Phase 5: QA & PWA Foundation
**Goal**: Establish quality assurance infrastructure and PWA capabilities
**Depends on**: Phase 4 (content validated before testing infrastructure)
**Requirements**: REQ-PWA-001, REQ-PWA-002, REQ-QA-001, REQ-QA-002
**Success Criteria** (what must be TRUE):
  1. Application functions offline with helpful fallback page and cached core resources
  2. Install prompt appears when criteria met (browser native per Phase 5 Context)
  3. All changes tested with `npm run build && npm run preview` before deployment
  4. Lighthouse scores meet targets (Performance, SEO, Accessibility all >= 85 per Phase 5 Context)
**Plans**: 4 plans

Plans:
- [x] 05-01-PLAN.md — Offline support verification and service worker caching refinement
- [x] 05-02-PLAN.md — Install prompt configuration (browser native only per context decision)
- [x] 05-03-PLAN.md — Pre-commit hook with Husky for build & preview testing
- [x] 05-04-PLAN.md — Lighthouse performance benchmarking and optimization

### Phase 6: Homepage Polish
**Goal**: Fix homepage styling, layout, and functionality to match or exceed live site
**Depends on**: Phase 2 (comparison tools), Phase 3 (images), Phase 5 (QA infrastructure)
**Requirements**: None (section polish work, builds on validated requirements)
**Success Criteria** (what must be TRUE):
  1. Homepage hero section displays correctly with proper images and text overlay
  2. Featured projects and services sections match live site styling and spacing
  3. Testimonials section displays with proper card layout and formatting
  4. Visual comparison shows no regressions from live site baseline
  5. Build and preview testing passes without hydration errors
**Plans**: 4 plans

Plans:
- [x] 06-01-PLAN.md — Hero section with parallax motion and optimized hero images
- [x] 06-02-PLAN.md — Featured Projects and Services grid layouts
- [x] 06-03-PLAN.md — Testimonials section with decorative quote marks
- [x] 06-04-PLAN.md — Visual comparison and QA verification

### Phase 7: Section Polish - Projects
**Goal**: Fix projects listing and detail pages with image migration
**Depends on**: Phase 2 (comparison tools), Phase 3 (images), Phase 5 (QA infrastructure)
**Requirements**: None (section polish work)
**Success Criteria** (what must be TRUE):
  1. Projects listing page displays all projects with proper filtering and card layout
  2. Project detail pages show full content with proper image galleries
  3. All project images migrated and displaying correctly
  4. Category filtering works with URL-based state
  5. Visual comparison shows no regressions from live site baseline
**Plans**: 4 plans

Plans:
- [ ] 07-01-PLAN.md — Grid/list view toggle and category pill filters with URL state
- [ ] 07-02-PLAN.md — Project detail page layout with content sections and related projects
- [ ] 07-03-PLAN.md — Project image gallery migration from Phase 3 and responsive optimization
- [ ] 07-04-PLAN.md — Visual comparison and QA verification with Lighthouse audits

### Phase 8: Section Polish - Services
**Goal**: Fix services listing and detail pages with image migration
**Depends on**: Phase 2 (comparison tools), Phase 3 (images), Phase 5 (QA infrastructure)
**Requirements**: None (section polish work)
**Success Criteria** (what must be TRUE):
  1. Services listing page displays all services with proper card layout
  2. Service detail pages show full content with proper formatting
  3. Service-related images migrated and displaying correctly
  4. Category/filtering functionality works as expected
  5. Visual comparison shows no regressions from live site baseline
**Plans**: TBD

Plans:
- [ ] 08-01: Services listing page styling fixes
- [ ] 08-02: Service detail page layout and content display
- [ ] 08-03: Service image migration and optimization
- [ ] 08-04: Visual comparison and QA verification

### Phase 9: Section Polish - About & Team
**Goal**: Fix about and team pages with team photo migration
**Depends on**: Phase 2 (comparison tools), Phase 3 (images), Phase 5 (QA infrastructure)
**Requirements**: None (section polish work)
**Success Criteria** (what must be TRUE):
  1. About page displays company information with proper styling
  2. Team member cards show photos, names, titles, and bios correctly
  3. All team member photos migrated and displaying with proper aspect ratios
  4. Company history/culture sections formatted properly
  5. Visual comparison shows no regressions from live site baseline
**Plans**: TBD

Plans:
- [ ] 09-01: About page content section styling
- [ ] 09-02: Team member card layout and styling fixes
- [ ] 09-03: Team photo migration and optimization
- [ ] 09-04: Visual comparison and QA verification

### Phase 10: Section Polish - Contact & Careers
**Goal**: Fix contact and careers pages with form styling
**Depends on**: Phase 2 (comparison tools), Phase 5 (QA infrastructure)
**Requirements**: None (section polish work)
**Success Criteria** (what must be TRUE):
  1. Contact form displays with proper styling and validation
  2. Contact information and map integration work correctly
  3. Careers listing page shows open positions with proper formatting
  4. Individual job pages display full descriptions with apply functionality
  5. Visual comparison shows no regressions from live site baseline
**Plans**: TBD

Plans:
- [ ] 10-01: Contact form styling and validation fixes
- [ ] 10-02: Contact information display and map integration
- [ ] 10-03: Careers listing and job detail page styling
- [ ] 10-04: Visual comparison and final QA verification

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9 -> 10

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Audit & Baseline Capture | 3/3 | Complete | 2026-02-04 |
| 2. Comparison Infrastructure | 4/4 | Complete | 2026-02-05 |
| 3. Image Migration | 3/3 | Complete | 2026-02-05 |
| 4. Content & SEO Validation | 5/5 | Complete | 2026-02-05 |
| 5. QA & PWA Foundation | 4/4 | Complete | 2026-02-05 |
| 6. Homepage Polish | 4/4 | Complete | 2026-02-05 |
| 7. Section Polish - Projects | 0/4 | Not started | - |
| 8. Section Polish - Services | 0/4 | Not started | - |
| 9. Section Polish - About & Team | 0/4 | Not started | - |
| 10. Section Polish - Contact & Careers | 0/4 | Not started | - |
