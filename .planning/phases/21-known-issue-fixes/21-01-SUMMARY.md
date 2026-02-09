---
phase: 21-known-issue-fixes
plan: 01
subsystem: ui
tags: [nuxt-img, lighthouse, cls, hero]

# Dependency graph
requires:
  - phase: 22-hero-modernization
    provides: HeroStatic component with image handling
provides:
  - Hero image without conflicting width/height attributes
  - Container-based CLS prevention (h-[80vh] min-h-[600px])
affects: [lighthouse, performance, hero]

# Tech tracking
tech-stack:
  added: []
  patterns: [container-based-cls-prevention]

key-files:
  created: []
  modified: [components/HeroStatic.vue]

key-decisions:
  - "Omit width/height from NuxtImg when parent container has explicit dimensions"
  - "Use h-[80vh] min-h-[600px] on parent section for CLS prevention instead of image attributes"
  - "Add explanatory comment documenting why width/height are intentionally omitted"

patterns-established:
  - "Container-based CLS: Use explicit container dimensions (h-[Xvh], min-h-[Xpx]) instead of width/height on images with object-cover"

# Metrics
duration: 0min
completed: 2026-02-09
---

# Plan 21-01: Hero Image Fix Summary

**Hero NuxtImg width/height attributes removed to fix Lighthouse "incorrect aspect ratio" warning — container dimensions (h-[80vh] min-h-[600px]) prevent CLS**

## Performance

- **Duration:** 0 min (work was folded into Phase 22-03)
- **Started:** 2026-02-08
- **Completed:** 2026-02-08
- **Tasks:** 2 (completed as part of hero modernization)
- **Files modified:** 1

## Accomplishments
- Removed conflicting width="1920" height="1080" from hero NuxtImg
- Added explanatory comment documenting why dimensions are intentionally omitted
- Container dimensions (h-[80vh] min-h-[600px]) continue to prevent CLS
- Lighthouse "incorrect aspect ratio" warning resolved

## Task Commits

Work was folded into Phase 22 hero modernization:

1. **Task 1: Remove width/height from hero NuxtImg** - `df53f67` (feat(22-03): add responsive sizes prop to hero image)
2. **Task 2: Verify CLS prevention** - Verified via build and visual inspection

**Note:** This fix was naturally incorporated during Phase 22-03 when implementing responsive image sizes.

## Files Modified
- `components/HeroStatic.vue` - Removed width/height, added explanatory comment, kept container dimensions

## Decisions Made
- width/height attributes cause Lighthouse "incorrect aspect ratio" warning because actual image (1920x1441) differs from declared (1920x1080)
- Container-based CLS prevention is the correct pattern for object-cover images
- Added comment explaining the intentional omission for future developers

## Deviations from Plan
None - the fix was already implemented correctly as part of Phase 22-03 work.

## Issues Encountered
None - work was already complete when Phase 21 execution began.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Hero image displays correctly without layout shift
- Lighthouse aspect ratio warning resolved
- FIX-01 requirement satisfied

---
*Phase: 21-known-issue-fixes*
*Plan: 01*
*Completed: 2026-02-09*
