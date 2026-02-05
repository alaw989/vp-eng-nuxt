---
phase: 04-content-seo-validation
plan: 05
subsystem: seo
tags: [sitemap, xml, seo, google-search-console]

# Dependency graph
requires:
  - phase: 04-content-seo-validation
    plan: "04-01 through 04-04"
    provides: link validation, content comparison, meta tag verification, URL structure
provides:
  - XML sitemap at /sitemap.xml with all static and dynamic routes
  - Sitemap verification script for automated testing
  - Sitemap verification report documenting 18 URLs
affects: [05-qa-pwa-foundation, deployment]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Server route sitemap generation with static fallback
    - XML sitemap with proper namespace and formatting
    - Graceful API degradation to static content

key-files:
  created:
    - .planning/scripts/verify-sitemap.ts
    - .planning/audit/sitemap-verification.json
  modified:
    - server/routes/sitemap.xml.ts
    - nuxt.config.ts

key-decisions:
  - "Set sitemap.enabled=false to use custom server route instead of @nuxtjs/sitemap module"
  - "Use static fallback data matching server/api/*.get.ts when WordPress API returns 404"
  - "Include /search in sitemap (was incorrectly excluded in nuxt.config.ts)"

patterns-established:
  - "Sitemap server route pattern: define XML output with proper Content-Type header"
  - "Static fallback pattern: mirror API proxy fallbacks for consistency"

# Metrics
duration: 5min
completed: 2026-02-05
---

# Phase 4 Plan 5: XML Sitemap Verification Summary

**Dynamic XML sitemap generation with 18 URLs (7 static + 6 services + 5 projects) using server routes and static fallback data**

## Performance

- **Duration:** ~5 minutes
- **Started:** 2026-02-05T13:47:45Z
- **Completed:** 2026-02-05T13:52:47Z
- **Tasks:** 5
- **Files modified:** 4

## Accomplishments

1. **Enhanced sitemap with missing routes** - Added /search page and careers detail page fetching with graceful 404 handling
2. **Added static fallback data** - Sitemap includes 6 services and 5 projects using same fallback data as API routes
3. **Created verification script** - TypeScript script fetches, parses, and validates sitemap coverage
4. **Completed sitemap verification** - 18 URLs confirmed accessible at /sitemap.xml

## Task Commits

Each task was committed atomically:

1. **Task 2: Enhance sitemap with missing routes** - `ce4d4c7` (feat)
2. **Task 3: Create sitemap verification script** - `f33be18` (feat)
3. **Task 5: Add static fallback data for sitemap** - `f743aec` (feat)
4. **Task 6: Execute sitemap verification** - `dd24751` (feat)

**Note:** Task 1 was review only (no code changes). Task 4 was a checkpoint requiring human verification (sitemap endpoint confirmed working).

**Plan metadata:** TBD (docs: complete plan)

## Files Created/Modified

- `server/routes/sitemap.xml.ts` - Enhanced with error handling, timeouts, and static fallback data
- `nuxt.config.ts` - Changed sitemap.enabled=false to use custom server route, removed /search from exclude list
- `.planning/scripts/verify-sitemap.ts` - Verification script that fetches, parses, and validates sitemap
- `.planning/audit/sitemap-verification.json` - Verification results with URL counts and coverage stats

## Sitemap Verification Results

**Total URLs in sitemap:** 18

**Breakdown:**
- Static pages: 7 (/, /about, /services, /projects, /contact, /careers, /search)
- Service detail pages: 6 (structural-steel-design, concrete-design, masonry-design, foundation-design, seawall-design, steel-detailing)
- Project detail pages: 5 (tampa-marina-complex, downtown-office-tower, coastal-seawall-system, luxury-residential-estate, industrial-warehouse-complex)

**Coverage:** 163.6% vs expected (18 found vs 11 expected)
- The sitemap has MORE content than the original WordPress site
- Old WordPress URLs (/gallery/132, /gallery/bridges, etc.) have been replaced with new Nuxt project pages
- No lastmod timestamps present (static fallback data doesn't include dates)

## Google Search Console Submission Steps

After deployment to production, submit the sitemap to Google Search Console:

1. **Add site property to GSC**
   - Go to https://search.google.com/search-console
   - Click "Add a property" and select "URL prefix"
   - Enter: https://vp-associates.com
   - Verify ownership (HTML file, DNS, or Google Analytics)

2. **Submit sitemap**
   - Navigate to: Indexing > Sitemaps
   - Enter sitemap URL in the text box: `sitemap.xml`
   - Click "Submit"
   - Verify "Submitted" count shows ~18 URLs

3. **Monitor indexing**
   - Check "Indexed" status in Coverage report
   - Use URL Inspection tool for sample pages
   - Monitor for crawl errors in Coverage report

4. **Post-deployment verification**
   - Test sitemap at: https://vp-associates.com/sitemap.xml
   - Confirm Content-Type: application/xml
   - Verify all URLs return 200 status

## Decisions Made

1. **Disabled @nuxtjs/sitemap module auto-generation** - Set `sitemap.enabled=false` to use custom server route instead
   - Rationale: Server route provides full control over XML formatting and static fallback behavior
   - Impact: Sitemap generated by `server/routes/sitemap.xml.ts` instead of module

2. **Used static fallback data** - Mirror the same static services/projects from `server/api/*.get.ts`
   - Rationale: WordPress REST API doesn't expose custom post types (services/projects return 404)
   - Impact: Sitemap always includes full content even when WordPress API unavailable

3. **Included /search in sitemap** - Removed from nuxt.config.ts exclude list
   - Rationale: Search page is public and should be discoverable
   - Impact: Search page now indexed by search engines

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed @nuxtjs/sitemap module conflict**
- **Found during:** Task 2 (Enhance sitemap with missing routes)
- **Issue:** @nuxtjs/sitemap module was intercepting /sitemap.xml before server route, returning empty urlset
- **Fix:** Set `sitemap.enabled=false` in nuxt.config.ts to disable module's automatic generation
- **Files modified:** nuxt.config.ts, server/routes/sitemap.xml.ts
- **Verification:** Sitemap now returns 18 URLs from custom server route
- **Committed in:** f743aec (Task 5 commit)

**2. [Rule 2 - Missing Critical] Added static fallback data for sitemap routes**
- **Found during:** Task 5 (Execute sitemap verification)
- **Issue:** WordPress REST API returns 404 for /services and /projects endpoints, leaving sitemap with only static pages
- **Fix:** Added static service/project slugs matching server/api/*.get.ts fallback data
- **Files modified:** server/routes/sitemap.xml.ts
- **Verification:** Sitemap now includes 6 services and 5 projects
- **Committed in:** f743aec (Task 5 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 missing critical)
**Impact on plan:** Both auto-fixes essential for correct sitemap operation. Static fallback ensures sitemap always has complete content even when WordPress API is unavailable.

## Issues Encountered

1. **@nuxtjs/sitemap module conflict** - Module was intercepting /sitemap.xml before server route, returning empty urlset with only 3 URLs. Fixed by disabling module with `sitemap.enabled=false`.

2. **WordPress API missing custom post types** - The /services and /projects endpoints return 404 because WordPress site doesn't expose custom post types via REST API. Fixed by adding static fallback data matching the API proxy routes.

## User Setup Required

None - sitemap is automatically generated and accessible at /sitemap.xml. Google Search Console submission is a post-deployment activity.

## Phase 4 Completion Summary

**Phase 4: Content & SEO Validation - COMPLETE**

All 5 plans executed successfully:

| Plan | Name | Status |
|------|------|--------|
| 04-01 | Link Validation | Complete |
| 04-02 | Content Comparison | Complete |
| 04-03 | Meta Tag Verification | Complete |
| 04-04 | URL Structure and Redirects | Complete |
| 04-05 | XML Sitemap Verification | Complete |

### Requirements Met

- **REQ-LNK-001:** Link validation complete - 13 pages checked, 58 links validated
- **REQ-LNK-002:** Content integrity verified - 11 pages compared, content enrichment confirmed
- **REQ-SEO-001:** Meta tags compared - 12 pages checked, 100% critical tags pass
- **REQ-SEO-002:** URL structure and redirects configured - 15 301 redirects mapped
- **REQ-SEO-003:** Sitemap verified - 18 URLs accessible at /sitemap.xml

### Deliverables

- `.planning/scripts/validate-links.ts` - Link validation script
- `.planning/audit/broken-links.json` - Broken link report
- `.planning/scripts/compare-content.ts` - Content comparison script
- `.planning/audit/content-comparison.json` - Content similarity report
- `.planning/scripts/extract-meta.ts` - Meta tag extraction script
- `.planning/audit/seo-comparison.json` - SEO comparison report
- `.planning/scripts/generate-url-inventory.ts` - URL inventory generator
- `.planning/audit/url-inventory.json` - Structured URL inventory
- `nuxt.config.ts` - Updated with 15 301 redirect rules
- `.planning/scripts/verify-sitemap.ts` - Sitemap verification script
- `.planning/audit/sitemap-verification.json` - Sitemap verification report
- `server/routes/sitemap.xml.ts` - Dynamic sitemap generation

### Next Steps

Proceed to **Phase 5: QA & PWA Foundation** to:
- Implement comprehensive testing (unit, integration, E2E)
- Set up PWA manifest and service worker
- Configure offline support and app installation

---
*Phase: 04-content-seo-validation*
*Completed: 2026-02-05*
