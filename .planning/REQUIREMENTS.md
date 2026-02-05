# Requirements

**Project:** VP Associates Website Modernization
**Last Updated:** 2026-02-04
**Status:** Draft

## Overview

This document defines all requirements for the VP Associates website modernization project. Requirements are organized by category and assigned unique identifiers (REQ-XXX) for tracking through development.

## Requirement Categories

- **AUD** - Audit & Baseline Capture
- **CMP** - Comparison Infrastructure
- **IMG** - Image Migration
- **LNK** - Link & Content Validation
- **SEO** - SEO Preservation
- **PWA** - Progressive Web App
- **QA** - Quality Assurance

---

## v1 Requirements (MVP)

### AUD: Audit & Baseline Capture

#### REQ-AUD-001: Page List Enumeration
**Priority:** P1 (Must have)
**Status:** Complete

The system must enumerate all pages from the source website (vp-associates.com) to establish the full scope of migration.

**Acceptance Criteria:**
- Crawl sitemap.xml or traverse site navigation to discover all pages
- Output a list of URLs grouped by page type (home, about, services, projects, careers, contact)
- Include page metadata: URL, title, last modified date
- Save enumeration results to `.planning/audit/pages.json`

**Rationale:** Cannot measure improvement without knowing the full scope. Essential for audit-first discovery approach.

**Addresses:** SEO Traffic Loss pitfall (full URL inventory before changes)

---

#### REQ-AUD-002: Screenshot Baseline Capture
**Priority:** P1 (Must have)
**Status:** Complete

The system must capture visual screenshots of all pages from the source website to establish a baseline for comparison.

**Acceptance Criteria:**
- Capture screenshots for all pages from REQ-AUD-001
- Support multiple viewports: mobile (375px), tablet (768px), desktop (1920px)
- Save screenshots to `.planning/audit/baselines/{page}/{viewport}.png`
- Include full page capture (not just above the fold)
- Configurable delay for dynamic content to load

**Rationale:** Visual baselines enable safe iteration. Without them, every change is risky.

**Addresses:** Visual Regression False Positives pitfall (establish baseline before changes)

---

### CMP: Comparison Infrastructure

#### REQ-CMP-001: Side-by-Side Visual Diff
**Priority:** P1 (Must have)
**Status:** Complete

The system must provide a side-by-side comparison interface for viewing baseline screenshots against current implementations.

**Acceptance Criteria:**
- Display old (baseline) and new (current) screenshots simultaneously
- Support viewport selection (mobile/tablet/desktop)
- Independent scrolling between both views (per CONTEXT.md decision)
- Highlight pixel differences using overlay (odiff-bin integration)
- Configurable diff threshold (0.1 default)

**Rationale:** Core QA capability for migration. Manual review is essential before automated validation.

**Addresses:** Incremental Migration Styling Inconsistencies pitfall

---

#### REQ-CMP-002: HTML Source Comparison
**Priority:** P1 (Must have)
**Status:** Complete

The system must compare the semantic HTML structure between source and target pages.

**Acceptance Criteria:**
- Extract and compare semantic elements: h1-h6, nav, main, footer, article
- Report missing or extra elements
- Compare heading hierarchy structure
- Output structured diff report in both TXT and JSON formats

**Rationale:** Ensures semantic HTML is preserved during migration. Critical for accessibility and SEO.

---

### IMG: Image Migration

#### REQ-IMG-001: Bulk Image Download
**Priority:** P1 (Must have)
**Status:** Pending

The system must download all images from the source website and organize them for use in the new application.

**Acceptance Criteria:**
- Crawl all pages from REQ-AUD-001 to extract image URLs
- Download images with retry logic (3 attempts with exponential backoff)
- Organize images by type: hero, project, team, general
- Save to `public/images/` with descriptive filenames
- Generate mapping file: `.planning/audit/image-mapping.json` (source URL -> local path)
- Report any missing or failed images

**Rationale:** Manual download of hundreds of images is not viable. Systematic migration ensures nothing is lost.

**Addresses:** Image Optimization Failure in Static Exports pitfall (pre-optimize before adding to /public)

---

#### REQ-IMG-002: Image Optimization
**Priority:** P1 (Must have)
**Status:** Pending

The system must optimize all downloaded images for web performance.

**Acceptance Criteria:**
- Convert to modern formats: WebP (primary), AVIF (if supported), JPG (fallback)
- Target quality: 80-85% (visually lossless)
- Max file sizes: Hero images <200KB, project images <100KB, team photos <50KB
- Generate responsive variants: 640w, 1280w, 1920w
- Use `<NuxtImg>` component with explicit width/height props

**Rationale:** Large unoptimized images degrade Core Web Vitals and search rankings.

**Addresses:** Image Optimization Failure in Static Exports pitfall

---

### LNK: Link & Content Validation

#### REQ-LNK-001: Internal Link Validation
**Priority:** P1 (Must have)
**Status:** Complete

The system must validate all internal links to ensure no broken navigation after migration.

**Acceptance Criteria:**
- Extract all internal links from sitemap pages
- Check HTTP status for each link (expect 200 OK)
- Generate broken link report: `.planning/audit/broken-links.json`
- Categorize by severity: critical (404), warning (redirect), info (external)

**Rationale:** Broken internal links indicate migration failure and hurt SEO.

**Addresses:** SEO Traffic Loss pitfall

---

#### REQ-LNK-002: Content Integrity Validation
**Priority:** P2 (Should have)
**Status:** Complete

The system must verify that text content has been preserved during migration.

**Acceptance Criteria:**
- Extract text content from source pages
- Extract text content from corresponding Nuxt pages
- Compare headings, paragraphs, lists
- Report missing or significantly changed content (>10% difference)
- Allow for approved content changes via ignore list

**Rationale:** Ensures migration preserves all important content.

---

### SEO: SEO Preservation

#### REQ-SEO-001: Meta Tag Migration
**Priority:** P1 (Must have)
**Status:** Complete

The system must preserve all SEO meta tags from the source website.

**Acceptance Criteria:**
- Extract title, meta description, keywords from source pages
- Verify corresponding meta tags exist in Nuxt pages
- Compare Open Graph tags (og:title, og:description, og:image)
- Compare Twitter Card tags
- Generate SEO comparison report

**Rationale:** Missing or changed meta tags directly impact search rankings.

**Addresses:** SEO Traffic Loss pitfall (critical - 20-40% traffic drops common)

---

#### REQ-SEO-002: URL Structure Preservation
**Priority:** P1 (Must have)
**Status:** Complete

The system must maintain the same URL structure or implement proper redirects.

**Acceptance Criteria:**
- Document all source URLs in `.planning/audit/url-inventory.csv`
- Map any changed URLs to source (old -> new)
- Implement 301 redirects for all changed URLs
- Verify no 404 errors for previously valid URLs
- Test with Google Search Console URL Inspection tool

**Rationale:** Changed URL structures without redirects cause search traffic loss.

**Addresses:** SEO Traffic Loss pitfall

---

#### REQ-SEO-003: Sitemap Generation
**Priority:** P1 (Must have)
**Status:** Complete

The system must generate a dynamic XML sitemap for the new site.

**Acceptance Criteria:**
- Use @nuxtjs/sitemap module (already configured)
- Include all dynamic routes (projects, services, careers)
- Include proper lastmod timestamps
- Sitemap accessible at /sitemap.xml
- Submit to Google Search Console

**Rationale:** XML sitemap helps search engines discover and index all pages.

**Note:** @nuxtjs/sitemap is already configured in nuxt.config.ts

---

### PWA: Progressive Web App

#### REQ-PWA-001: Offline Support
**Priority:** P2 (Should have)
**Status:** Pending

The application must function offline with appropriate fallbacks.

**Acceptance Criteria:**
- Implement /offline.vue page with helpful navigation
- Cache core resources (HTML, CSS, JS, critical images)
- Show "You're offline" message when network unavailable
- Allow browsing previously viewed content offline
- Service worker updates trigger user-friendly reload prompt

**Rationale:** PWA capability improves user experience and engagement.

**Note:** @vite-pwa/nuxt is already configured in nuxt.config.ts

---

#### REQ-PWA-002: Install Prompt
**Priority:** P2 (Should have)
**Status:** Pending

The application must provide an install prompt for adding to home screen.

**Acceptance Criteria:**
- Show native install prompt when criteria met
- Custom install button in navigation as alternative
- App launches in standalone mode when installed
- Proper app icons (192x192, 512x512)

**Rationale:** Home screen installation improves user retention.

---

### QA: Quality Assurance

#### REQ-QA-001: Build & Preview Testing
**Priority:** P1 (Must have)
**Status:** Pending

All changes must be tested with production build before deployment.

**Acceptance Criteria:**
- Run `npm run build && npm run preview` before each commit
- Check for hydration errors in console
- Verify all pages render correctly
- Test on mobile viewport (375px)
- Test on desktop viewport (1920px)

**Rationale:** Development environment can mask production issues. Build testing catches hydration errors early.

**Addresses:** Hydration Mismatch Errors in Production pitfall

---

#### REQ-QA-002: Lighthouse Performance
**Priority:** P2 (Should have)
**Status:** Pending

The application must meet performance benchmarks.

**Acceptance Criteria:**
- Target Lighthouse scores: Performance 90+, SEO 95+, Accessibility 100
- All images use next-gen formats (WebP/AVIF)
- No layout shift (CLS <0.1)
- Largest Contentful Paint <2.5s
- First Input Delay <100ms

**Rationale:** Performance directly impacts user experience and search rankings.

---

## v2 Requirements (Future)

These requirements are deferred until v1 is complete and validated.

### CMP: Advanced Comparison

| ID | Requirement | Priority | Description |
|----|-------------|----------|-------------|
| REQ-CMP-003 | Section-by-Section Comparison | P2 | Compare hero, content, footer independently |
| REQ-CMP-004 | Interactive Diff Viewer | P2 | Slider comparison, hover-to-reveal UX |
| REQ-CMP-005 | Smart Ignore Rules | P2 | Ignore dates, timestamps, random IDs |

### QA: Automated Testing

| ID | Requirement | Priority | Description |
|----|-------------|----------|-------------|
| REQ-QA-003 | Visual Regression Tests | P2 | Automated visual comparison on every change |
| REQ-QA-004 | E2E Test Integration | P2 | User flow validation with Playwright |
| REQ-QA-005 | CI/CD Pipeline | P3 | Continuous validation on pull requests |

### AI: Intelligent Analysis

| ID | Requirement | Priority | Description |
|----|-------------|----------|-------------|
| REQ-AI-001 | AI-Powered Visual Analysis | P3 | Distinguish meaningful from trivial changes |
| REQ-AI-002 | Automated Fix Suggestions | P3 | Generate code to fix visual diffs |

---

## Out of Scope

The following items are explicitly out of scope for this modernization project:

- **Brand redesign** - Colors, logos, typography will remain consistent
- **New features beyond parity** - Only features that exist on source site
- **Full automation** - Human review required for each section
- **CMS migration** - WordPress remains the content backend
- **Content creation** - Only migrating existing content
- **Third-party integrations** - No new CRM, analytics, or marketing tools

---

## Requirements Mapping to Roadmap Phases

| Requirement | Phase | Status | Critical Pitfall Addressed |
|-------------|-------|--------|---------------------------|
| REQ-AUD-001 | Phase 1: Audit & Baseline Capture | Complete | SEO Traffic Loss |
| REQ-AUD-002 | Phase 1: Audit & Baseline Capture | Complete | Visual False Positives |
| REQ-CMP-001 | Phase 2: Comparison Infrastructure | Pending | Styling Inconsistencies |
| REQ-CMP-002 | Phase 2: Comparison Infrastructure | Pending | SEO Traffic Loss |
| REQ-IMG-001 | Phase 3: Image Migration | Pending | Image Optimization Failure |
| REQ-IMG-002 | Phase 3: Image Migration | Pending | Image Optimization Failure |
| REQ-LNK-001 | Phase 4: Content & SEO Validation | Pending | SEO Traffic Loss |
| REQ-LNK-002 | Phase 4: Content & SEO Validation | Pending | SEO Traffic Loss |
| REQ-SEO-001 | Phase 4: Content & SEO Validation | Pending | SEO Traffic Loss |
| REQ-SEO-002 | Phase 4: Content & SEO Validation | Pending | SEO Traffic Loss |
| REQ-SEO-003 | Phase 4: Content & SEO Validation | Pending | SEO Traffic Loss |
| REQ-PWA-001 | Phase 5: QA & PWA Foundation | Pending | N/A |
| REQ-PWA-002 | Phase 5: QA & PWA Foundation | Pending | N/A |
| REQ-QA-001 | Phase 5: QA & PWA Foundation | Pending | Hydration Errors |
| REQ-QA-002 | Phase 5: QA & PWA Foundation | Pending | Performance Degradation |

### Traceability Summary

**Coverage:** 15/15 v1 requirements mapped to roadmap phases

| Phase | Requirements | Count |
|-------|-------------|-------|
| Phase 1: Audit & Baseline Capture | AUD-001, AUD-002 | 2 |
| Phase 2: Comparison Infrastructure | CMP-001, CMP-002 | 2 |
| Phase 3: Image Migration | IMG-001, IMG-002 | 2 |
| Phase 4: Content & SEO Validation | LNK-001, LNK-002, SEO-001, SEO-002, SEO-003 | 5 |
| Phase 5: QA & PWA Foundation | PWA-001, PWA-002, QA-001, QA-002 | 4 |
| Phase 6-10: Section Polish | (Implementation work using validated requirements) | - |

**Note:** Phases 6-10 (Homepage, Projects, Services, About & Team, Contact & Careers) execute section-by-section polish using the infrastructure and capabilities delivered in Phases 1-5. These phases focus on styling, layout, and image placement rather than new functional requirements.

---

## Definition of Done

A requirement is considered complete when:

1. **Implementation:** Code is written and committed to main branch
2. **Testing:** Passes `npm run build && npm run preview` without errors
3. **Verification:** Acceptance criteria are met and documented
4. **Review:** Visual comparison against source site shows no regression
5. **Documentation:** Any new patterns or decisions are recorded in SHARED_TASK_NOTES.md

---

## Status Summary

| Category | Pending | In Progress | Complete |
|----------|---------|-------------|----------|
| AUD | 0 | 0 | 2 |
| CMP | 2 | 0 | 0 |
| IMG | 2 | 0 | 0 |
| LNK | 0 | 0 | 2 |
| SEO | 0 | 0 | 3 |
| PWA | 2 | 0 | 0 |
| QA | 2 | 0 | 0 |
| **Total** | **8** | **0** | **7** |

---

*Requirements generated from research synthesis*
*Based on MVP definition from FEATURES.md*
*Validated against pitfall prevention strategies from PITFALLS.md*
