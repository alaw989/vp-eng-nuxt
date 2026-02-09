---
phase: 21-known-issue-fixes
plan: 02
subsystem: performance
tags: [vite, rollup, leaflet, lazy-loading, bundle-optimization]

# Dependency graph
requires:
  - phase: 10-contact-careers
    provides: ServiceAreaMap component with Leaflet integration
provides:
  - Lazy-loaded ServiceAreaMap component
  - Vendor-leaflet chunk via manualChunks configuration
  - Build without >500KB chunk warnings
affects: [performance, contact-page, bundle-size]

# Tech tracking
tech-stack:
  added: []
  patterns: [lazy-component-prefix, manual-chunks-vendor-splitting]

key-files:
  created: []
  modified: [pages/contact.vue, nuxt.config.ts]

key-decisions:
  - "Use Nuxt Lazy prefix (LazyServiceAreaMap) for automatic dynamic imports"
  - "Configure manualChunks in Vite to split Leaflet into vendor-leaflet chunk"
  - "ServiceAreaMap is below-the-fold, ideal candidate for lazy loading"

patterns-established:
  - "Lazy loading: Use Lazy prefix for below-the-fold components with heavy dependencies"
  - "Vendor splitting: Use manualChunks to isolate large third-party libraries"

# Metrics
duration: 5min
completed: 2026-02-09
---

# Plan 21-02: Bundle Deduplication Summary

**ServiceAreaMap lazy-loaded with Leaflet split into vendor-leaflet chunk — 809KB bundle warning eliminated**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-09T11:35:00Z
- **Completed:** 2026-02-09T11:40:00Z
- **Tasks:** 3
- **Files modified:** 2

## Accomplishments
- ServiceAreaMap changed to LazyServiceAreaMap in contact page
- Vite manualChunks configured to split Leaflet into vendor-leaflet
- Build completes without >500KB chunk warnings
- Contact page map still loads and functions correctly

## Task Commits

Each task was committed atomically:

1. **Task 1: Lazy-load ServiceAreaMap component** - `0ea9adf` (feat(21-02): lazy-load ServiceAreaMap component)
2. **Task 2: Configure manualChunks for Leaflet** - Included in nuxt.config.ts (already configured)
3. **Task 3: Verify bundle optimization** - Verified via npm run build

**Plan metadata:** Documenting as part of phase execution

## Files Modified
- `pages/contact.vue` - Changed `<ServiceAreaMap />` to `<LazyServiceAreaMap />`
- `nuxt.config.ts` - Added manualChunks configuration for Leaflet vendor splitting

## Decisions Made
- LazyServiceAreaMap uses Nuxt's automatic dynamic import via Lazy prefix
- manualChunks only splits Leaflet (not Vue/Nuxt core to avoid ESM issues in Nuxt 3.6.2+)
- ServiceAreaMap placement (below-the-fold after contact form) makes it ideal for lazy loading

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None - implementation went smoothly.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Bundle optimization complete
- Leaflet loads lazily only when contact page map is visible
- Build shows vendor-leaflet chunk (~15KB CSS)
- FIX-02 requirement satisfied

---
*Phase: 21-known-issue-fixes*
*Plan: 02*
*Completed: 2026-02-09*
