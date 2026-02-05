---
phase: 04-content-seo-validation
plan: 04
subsystem: seo
tags: [redirects, 301, url-migration, routeRules, seo-preservation]

# Dependency graph
requires:
  - phase: 04-content-seo-validation
    plan: 01
    provides: URL inventory and link validation data
  - phase: 04-content-seo-validation
    plan: 03
    provides: Meta tag verification and page structure
provides:
  - URL inventory with WordPress to Nuxt mappings (.planning/audit/url-inventory.csv)
  - 301 redirect rules for Nuxt routeRules (.planning/audit/redirect-rules.json)
  - Nuxt config updated with 15 redirect rules for SEO preservation
affects: [04-05-sitemap-generation, deployment]

# Tech tracking
tech-stack:
  added: []
  patterns: [301-redirects, trailing-slash-normalization, url-migration]

key-files:
  created: [.planning/scripts/generate-url-inventory.ts, .planning/audit/url-inventory.csv, .planning/audit/url-inventory.json, .planning/audit/redirect-rules.json]
  modified: [nuxt.config.ts]

key-decisions:
  - "301 redirects for all changed URLs preserve SEO value"
  - "Trailing slash redirects handle WordPress vs Nuxt URL differences"
  - "410 Gone status for WordPress system pages not migrated"
  - "Redirects configured at top-level routeRules (not in nitro)"

patterns-established:
  - "Pattern: 301 redirects use Nuxt routeRules with redirect.to and statusCode"
  - "Pattern: Both /path and /path/ variations handled for comprehensive coverage"
  - "Pattern: URL inventory generation from pages.json for SEO planning"

# Metrics
duration: 2min
completed: 2026-02-05
---

# Phase 4 Plan 4: URL Structure and Redirects Summary

**URL inventory generation and 301 redirect configuration preserving SEO value across WordPress to Nuxt migration with 15 redirect rules covering all changed URLs**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-05T13:24:54Z
- **Completed:** 2026-02-05T13:26:48Z
- **Tasks:** 5
- **Files modified:** 5

## Accomplishments

- Created TypeScript URL inventory generation script with visual summary output
- Generated complete URL inventory from 13 WordPress pages
- Configured 15 301 redirect rules in Nuxt routeRules
- Identified 3 URLs for 410 Gone status (WordPress system pages)
- Verified config syntax and redirect rule coverage

## Task Commits

Each task was committed atomically:

1. **Task 1: Create URL inventory generation script** - `5e89838` (feat)
2. **Task 2: Execute URL inventory generation** - `fa0dd0f` (feat)
3. **Task 3: Configure Nuxt routeRules with 301 redirects** - `e7675f6` (feat)
4. **Task 4: Verify redirect configuration** - `5dd843e` (test)
5. **Task 5: Document URL structure and redirects** - (this commit)

**Plan metadata:** TBD (docs: complete plan)

## Files Created/Modified

- `.planning/scripts/generate-url-inventory.ts` (375 lines) - URL inventory generation script
- `.planning/audit/url-inventory.json` - Structured inventory with 13 URL mappings
- `.planning/audit/url-inventory.csv` - Human-readable CSV report
- `.planning/audit/redirect-rules.json` - Redirect rules for Nuxt configuration
- `nuxt.config.ts` - Added top-level routeRules with 15 301 redirects

## URL Inventory Summary

### Statistics

| Category | Count | Percentage |
| -------- | ----- | ---------- |
| Total URLs | 13 | 100% |
| Unchanged | 1 | 8% |
| Changed (301) | 9 | 69% |
| Removed (410) | 3 | 23% |

### Redirect Mappings Configured

**Page Name Changes:**
- `/about-3`, `/about-3/` -> `/about`

**Section Rename:**
- `/portfolio`, `/portfolio/` -> `/projects`

**Gallery Structure Changes:**
- `/gallery/132`, `/gallery/132/` -> `/projects/132`
- `/gallery/bridges`, `/gallery/bridges/` -> `/projects/bridges`
- `/gallery/commercial`, `/gallery/commercial/` -> `/projects/commercial`
- `/gallery/misc`, `/gallery/misc/` -> `/projects/misc`

**Trailing Slash Normalization:**
- `/services/` -> `/services`
- `/careers/` -> `/careers`
- `/contact/` -> `/contact`

### Removed URLs (410 Gone)

- `/hello-world` - Default WordPress test post
- `/category/uncategorized` - WordPress category page
- `/author/root` - WordPress author page

## Testing Notes

### How to Verify Redirects

**1. After deployment, test redirects with curl:**
```bash
# Should return 301 with Location header
curl -I https://vp-associates.com/about-3
curl -I https://vp-associates.com/portfolio
curl -I https://vp-associates.com/gallery/bridges
```

**2. Check for redirect chains:**
```bash
# Use -L to follow redirects, verify final destination
curl -I -L https://vp-associates.com/about-3
```

**3. Browser testing:**
- Visit old URLs directly
- Verify browser redirects to new location
- Check browser network tab for 301 status code

**4. Development testing:**
```bash
# Start dev server and test locally
npm run dev
curl -I http://localhost:3000/about-3
```

## Google Search Console Verification Steps

**After deployment:**

1. **Add site property to GSC**
   - Go to https://search.google.com/search-console
   - Add new property: https://vp-associates.com
   - Verify ownership via DNS or HTML file upload

2. **Submit sitemap.xml**
   - Navigate to Sitemaps section
   - Submit: https://vp-associates.com/sitemap.xml
   - Wait for Google to crawl

3. **Use URL Inspection tool**
   - Inspect old URLs: /about-3, /portfolio, /gallery/*
   - Verify redirect chain is recognized
   - Check that new URL is indexed

4. **Check Coverage report**
   - Look for 404 errors on old URLs
   - Verify redirects are working correctly
   - Address any unexpected 404s

5. **Monitor for redirect chain issues**
   - Avoid chains longer than 2 hops
   - Fix any loops detected
   - Ensure final URLs return 200 status

## How to Add New Redirects

**To add additional 301 redirects:**

1. **Update the URL inventory script:**
   ```typescript
   // In .planning/scripts/generate-url-inventory.ts
   const URL_MAPPINGS: Record<string, string> = {
     '/old-url/': '/new-url',
     // Add your mapping here
   }
   ```

2. **Regenerate redirect rules:**
   ```bash
   npx tsx .planning/scripts/generate-url-inventory.ts
   ```

3. **Update nuxt.config.ts routeRules:**
   ```typescript
   routeRules: {
     '/old-url': { redirect: { to: '/new-url', statusCode: 301 } },
     '/old-url/': { redirect: { to: '/new-url', statusCode: 301 } },
   }
   ```

4. **Redeploy** to apply changes

## REQ-SEO-002 Acceptance Criteria

**Status: PASSED**

- [x] Source URLs documented in url-inventory.csv
- [x] Changed URLs mapped to target locations
- [x] 301 redirects implemented via routeRules
- [x] Redirect configuration verified (15 rules)
- [x] Removed URLs documented for 410 status
- [x] Both /path and /path/ variations handled

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks completed successfully.

## Next Steps

1. **Proceed to 04-05** - Sitemap generation and SEO optimization
2. **After deployment** - Verify redirects in Google Search Console
3. **Monitor 404s** - Check for any missing redirects post-launch

---
*Phase: 04-content-seo-validation*
*Plan: 04*
*Completed: 2026-02-05*
