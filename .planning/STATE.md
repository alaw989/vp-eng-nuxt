# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-04)

**Core value:** VP Associates has a fast, modern, SEO-optimized website that's easy to maintain and incrementally improve through methodical, section-by-section refinement.
**Current focus:** Phase 3: Image Migration (In Progress)

## Current Position

Phase: 3 of 10 (Image Migration)
Plan: 1 of 4 in current phase
Status: In progress
Last activity: 2026-02-04 — Completed 03-01 image discovery and download

Progress: [███████░░░] 30%

## Performance Metrics

**Velocity:**
- Total plans completed: 8
- Average duration: ~5 min
- Total execution time: 0.7 hours

**By Phase:**

| Phase | Plans | Complete | Avg/Plan |
|-------|-------|----------|----------|
| 01    | 3     | 3        | ~4 min   |
| 02    | 4     | 4        | ~6 min   |
| 03    | 1     | 4        | ~7 min   |

**Recent Trend:**
- Last 5 plans: 02-02 (~2 min), 02-03 (~5 min), 02-04 (~4 min), 03-01 (~7 min)
- Trend: Phase 3 started, image discovery complete

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

**From 01-01 (Page Enumeration):**
- Cheerio for XML parsing: lighter than xml2js, better API for sitemap scraping
- Sitemap index recursion: WordPress uses wp-sitemap.xml as index, sub-sitemaps for posts/pages
- Type-based classification: URLs normalized to slug/type for downstream baseline capture
- Custom post types (services/projects) not exposed via wp/v2 REST API - captured via sitemap only

**From 01-02 (Visual Baseline Capture):**
- Playwright with Chromium only for screenshot automation
- Multi-viewport capture: mobile (375x812), tablet (768x1024), desktop (1920x1080)
- Graceful error handling: individual page failures don't stop entire process
- about-3 page has timeout issues on live site - noted for Lighthouse audit

**From 01-03 (Metadata Documentation):**
- metadata.json structure: captureDate, captureTool, viewports, pages array with fileSizes, summary
- README.md structure: directory diagram, file descriptions, viewing/regeneration instructions
- Total baseline size: 12.5 MB across 36 screenshots (12 pages x 3 viewports)
- All pages have complete screenshot sets (no missing viewports)

**From 02-01 (Pixel Comparison Infrastructure):**
- odiff-bin for ultra-fast pixel comparison with SIMD acceleration (faster than PNG.js pixel-by-pixel)
- Threshold 0.1 (10%) with antialiasing enabled for fair visual comparison
- Exit code 22 indicates pixel differences (not 1)
- odiff outputs percentage data to stderr, not stdout
- Flag name is --diff-color not --diffColor (kebab-case)
- spawnSync for synchronous odiff execution (simpler than async spawn)
- Diff color #cd2cc9 (magenta) for high visibility
- Timestamp format: YYYY-MM-DD_HH-mm-ss for sortable directory names

**From 02-02 (Visual Comparison Viewer):**
- Vanilla HTML/CSS/JS instead of framework - simpler to serve via Express, no build step needed
- Three-column layout with independent scrolling for detailed visual comparison
- CSS custom properties for theming and easy maintenance
- SVG placeholder for failed image loads - graceful degradation
- Keyboard navigation (arrow keys) for viewport switching
- Image path pattern: /comparisons/{timestamp}/{page}/{viewport}.png
- API endpoints: /api/comparisons, /api/comparisons/{timestamp}

**From 02-04 (Wire Viewer UI to Comparison Data):**
- Port 4321 for viewer server - avoids conflict with Nuxt dev server on port 3000
- Auto-browser launch after 500ms delay - ensures server is ready before opening
- Data transformation in viewer.js - converts flat results array to nested pages structure
- Express static middleware serves both comparisons and viewer from single origin
- Graceful shutdown on SIGINT/SIGTERM with cleanup logging
- EADDRINUSE error handling with clear user messaging

**From 03-01 (Image Discovery and Download):**
- Content-addressable storage: Images named by SHA-256 hash for deduplication
- Dual discovery method: WordPress Media API + HTML crawling for comprehensive coverage
- Exponential backoff retry: 1s, 2s, 4s delays for network resilience
- 21 WordPress Media Library entries return 404 (expected - deleted files still referenced in API)
- 26 valid images downloaded (6.3 MB), 84.6% JPEG, 11.5% PNG, 3.8% SVG

### Pending Todos

None yet.

### Blockers/Concerns

**Minor concern:** about-3 page has timeout issues during screenshot capture. May also affect Lighthouse audit.

**Note:** Initial comparison shows 41.26% average diff from baseline. This is expected for new implementation.

**Note:** 21 WordPress media library entries return 404. These are legacy deleted files still referenced in the Media API - expected behavior for WordPress sites with content management history.

## Session Continuity

Last session: 2026-02-04
Stopped at: Completed 03-01 image discovery and download
Resume file: None

## Phase 1 Summary (Complete)

**Phase 1: Audit & Baseline Capture - COMPLETE**

All 3 plans executed successfully:
- 01-01: Page enumeration (12 pages discovered from sitemap/API)
- 01-02: Visual baseline capture (36 screenshots across 3 viewports)
- 01-03: Metadata documentation (complete audit documentation)

**Deliverables:**
- `.planning/audit/pages.json` - Complete page inventory
- `.planning/audit/baselines/` - 36 PNG screenshots
- `.planning/audit/baselines/metadata.json` - Capture session metadata
- `.planning/audit/README.md` - Directory documentation

## Phase 2 Summary (Complete)

**Phase 2: Comparison Infrastructure - COMPLETE**

All 4 plans executed successfully:
- 02-01: Pixel comparison infrastructure (COMPLETE)
- 02-02: Visual comparison viewer UI (COMPLETE)
- 02-03: HTML content verification (COMPLETE)
- 02-04: Wire viewer UI to comparison data (COMPLETE)

**Deliverables:**
- `.planning/scripts/generate-comparison.ts` - Screenshot capture and pixel diff generation (471 lines)
- `.planning/scripts/compare-html.ts` - HTML content verification with Cheerio (484 lines)
- `.planning/scripts/start-viewer.ts` - Express web server with auto-browser launch (251 lines)
- `.planning/comparisons/2026-02-05_21-34-09/` - Initial comparison results with 41.26% average diff
- `.planning/comparisons/html-reports/` - HTML verification reports (TXT + JSON)
- `.planning/comparison-viewer/` - Complete viewer UI (index.html, viewer.css, viewer.js)

**Viewer URL:** http://localhost:4321
**Start command:** `npx tsx .planning/scripts/start-viewer.ts`

## Phase 3 Summary (In Progress)

**Phase 3: Image Migration - IN PROGRESS**

Plans executed:
- 03-01: Image discovery and download (COMPLETE) - 26 images (6.3 MB) downloaded with SHA-256 deduplication

**Deliverables:**
- `.planning/scripts/download-images.ts` - Image download script with retry logic (370 lines)
- `.planning/audit/raw-images.json` - Image catalog with metadata
- `.planning/audit/images/raw/` - 26 original images (content-addressable by SHA-256 hash)

**Remaining plans:**
- 03-02: Image optimization (WebP conversion, responsive sizes)
- 03-03: Nuxt Image module configuration
- 03-04: Image migration and deployment
