---
phase: 02-comparison-infrastructure
plan: 04
subsystem: testing
tags: [express, visual-comparison, screenshot-testing, pixel-diff, odiff-bin]

# Dependency graph
requires:
  - phase: 02-comparison-infrastructure
    plan: 01
    provides: Pixel comparison infrastructure with odiff-bin, comparison data generation
  - phase: 02-comparison-infrastructure
    plan: 02
    provides: Visual comparison viewer HTML/CSS/JS files
provides:
  - Express web server serving comparison viewer at http://localhost:4321
  - API endpoints for listing and retrieving comparison metadata
  - Auto-browser launch functionality for immediate visual verification
affects: []

# Tech tracking
tech-stack:
  added: [express - web server framework]
  patterns: Express static middleware for file serving, RESTful API for comparison data

key-files:
  created: [.planning/scripts/start-viewer.ts - Express server with auto-open]
  modified: [.planning/comparison-viewer/viewer.js - Fixed image paths for current screenshots]
  modified: [package.json, package-lock.json - Added express dependency]

key-decisions:
  - "Port 4321 for viewer server - avoids conflict with Nuxt dev server on port 3000"
  - "Auto-browser launch after 500ms delay - ensures server is ready before opening"
  - "Data transformation in viewer.js - converts flat results array to nested pages structure"

patterns-established:
  - "Pattern 1: Express static middleware serves both comparisons and viewer from single server"
  - "Pattern 2: API endpoints follow /api/{resource} and /api/{resource}/:id conventions"
  - "Pattern 3: Graceful shutdown on SIGINT/SIGTERM with cleanup logging"

# Metrics
duration: 4min
completed: 2026-02-05
---

# Phase 2 Plan 4: Wire Viewer UI to Comparison Data Summary

**Express web server on port 4321 serving comparison viewer with auto-browser launch and RESTful API for comparison metadata**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-05T03:45:05Z
- **Completed:** 2026-02-05T03:49:08Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Full end-to-end visual comparison workflow is now functional
- Express server serves both comparison images and viewer UI from single origin
- API endpoints provide structured access to comparison metadata
- Auto-browser launch provides immediate visual feedback after starting server
- Fixed image path mismatch between viewer expectations and actual file structure

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Express server dependency** - `f65d926` (feat)
2. **Task 2: Create Express server with auto-browser launch** - `192965a` (feat)
3. **Task 3: Test viewer startup and verify functionality** - (included in Task 2)

## Files Created/Modified

- `package.json` - Added express devDependency
- `package-lock.json` - Updated with express and its dependencies
- `.planning/scripts/start-viewer.ts` - Express server with:
  - Static file serving for comparisons and viewer
  - API endpoints: GET /api/comparisons, GET /api/comparisons/:timestamp
  - Auto-browser launch using open package
  - Graceful shutdown handling
- `.planning/comparison-viewer/viewer.js` - Fixed image paths and added data transformation

## Decisions Made

1. **Port 4321 for viewer server** - Avoids conflict with Nuxt dev server on port 3000, which is used during comparison generation
2. **Auto-browser launch after 500ms** - Gives server time to bind to port before browser attempts connection
3. **Data transformation in viewer.js** - Converts flat results array from comparison.json to nested pages structure expected by UI components
4. **EADDRINUSE error handling** - Provides clear message when port is already in use, preventing confusing errors

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed image path mismatch**

- **Found during:** Task 2 (Server creation verification)
- **Issue:** viewer.js referenced current images as `{viewport}.png` but actual files are named `current-{viewport}.png`
- **Fix:** Updated viewer.js line 249 to use correct path `current-${state.currentViewport}.png`
- **Files modified:** `.planning/comparison-viewer/viewer.js`
- **Verification:** curl tests confirm all image types (baseline, current, diff) return 200 status
- **Committed in:** `192965a` (part of Task 2 commit)

**2. [Rule 2 - Missing Critical] Added data transformation for comparison metadata**

- **Found during:** Task 2 (API endpoint testing)
- **Issue:** comparison.json uses flat results array but viewer.js expected nested pages structure with viewports under each page
- **Fix:** Added transformation in loadComparison() function to group flat results by slug and nest viewport data
- **Files modified:** `.planning/comparison-viewer/viewer.js`
- **Verification:** Stats display correctly shows diff percentages for each page/viewport combination
- **Committed in:** `192965a` (part of Task 2 commit)

**3. [Rule 2 - Missing Critical] Added total pixels calculation for stats display**

- **Found during:** Task 2 (Stats display verification)
- **Issue:** comparison.json doesn't include totalPixels field, only diffCount and diffPercentage
- **Fix:** Calculate total pixels from diffPixels / (diffPercent / 100) when both values are available
- **Files modified:** `.planning/comparison-viewer/viewer.js`
- **Verification:** Stats display shows calculated total pixel count
- **Committed in:** `192965a` (part of Task 2 commit)

---

**Total deviations:** 3 auto-fixed (1 bug, 2 missing critical)
**Impact on plan:** All fixes required for correct operation - viewer would not display images or stats without them.

## Issues Encountered

None - all functionality worked as expected after fixes.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Phase 2: Comparison Infrastructure is now COMPLETE.**

All 3 plans executed successfully:
- 02-01: Pixel comparison infrastructure (COMPLETE)
- 02-02: Visual comparison viewer UI (COMPLETE)
- 02-04: Wire viewer UI to comparison data (COMPLETE)

**Ready for Phase 3:** Implementation with Iterative Refinement

**Viewer URL:** http://localhost:4321
**Start command:** `npx tsx .planning/scripts/start-viewer.ts`

---
*Phase: 02-comparison-infrastructure*
*Completed: 2026-02-05*
