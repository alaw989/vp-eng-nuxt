---
phase: 02-comparison-infrastructure
plan: 01
subsystem: testing
tags: [odiff-bin, playwright, visual-regression, pixel-diff, screenshot-comparison]

# Dependency graph
requires:
  - phase: 01-audit-baseline-capture
    provides: baseline screenshots (.planning/audit/baselines/), pages inventory (.planning/audit/pages.json)
provides:
  - Pixel diff comparison script (.planning/scripts/generate-comparison.ts)
  - Timestamped comparison results with current/baseline/diff images
  - comparison.json metadata for web viewer consumption
affects: 02-02-web-viewer

# Tech tracking
tech-stack:
  added: [odiff-bin, open]
  patterns: [screenshot capture with Playwright, timestamped comparison directories, structured diff metadata]

key-files:
  created: [.planning/scripts/generate-comparison.ts, .planning/comparisons/2026-02-05_21-34-09/]
  modified: [package.json, package-lock.json]

key-decisions:
  - "Used odiff-bin for ultra-fast pixel comparison with SIMD acceleration"
  - "Exit code 22 indicates pixel differences (not 1 as initially assumed)"
  - "odiff outputs percentage data to stderr, not stdout"
  - "Flag name is --diff-color not --diffColor"
  - "Used spawnSync instead of spawn for synchronous odiff execution"
  - "Threshold 0.1 (10%) with antialiasing enabled for fair visual comparison"

patterns-established:
  - "Viewport capture pattern: mobile (375x812), tablet (768x1024), desktop (1920x1080)"
  - "Comparison directory structure: {timestamp}/{page}/{baseline,current,diff}-{viewport}.png"
  - "Timestamp format: YYYY-MM-DD_HH-mm-ss for sortable directory names"

# Metrics
duration: 14min
completed: 2026-02-05
---

# Phase 2 Plan 1: Pixel Comparison Infrastructure Summary

**Playwright-based screenshot capture with odiff-bin pixel diff generation, producing 41.26% average visual deviation from baseline**

## Performance

- **Duration:** 14 min
- **Started:** 2026-02-05T03:22:53Z
- **Completed:** 2026-02-05T03:36:34Z
- **Tasks:** 3
- **Files modified:** 113 (108 comparison images + 3 script files + 2 config files)

## Accomplishments

- Installed odiff-bin and open packages for pixel diff generation
- Created generate-comparison.ts script with Playwright screenshot capture
- Generated initial comparison results: 12 pages, 36 comparisons across 3 viewports
- comparison.json provides structured metadata for web viewer (next plan)

## Task Commits

Each task was committed atomically:

1. **Task 1-2: Install pixel diff dependencies and create comparison script** - `b4949ce` (feat)
2. **Task 3: Fix odiff integration and generate initial comparison** - `7808ed7` (fix)

**Plan metadata:** (pending final commit)

## Files Created/Modified

- `package.json` - Added odiff-bin and open dev dependencies
- `package-lock.json` - Lockfile updated for new dependencies
- `.planning/scripts/generate-comparison.ts` - Screenshot capture and pixel diff script (460 lines)
- `.planning/comparisons/2026-02-05_21-34-09/` - Initial comparison results
  - `comparison.json` - Metadata with match status, diff counts, percentages
  - `{page}/baseline-{viewport}.png` - Copied from Phase 1 baselines
  - `{page}/current-{viewport}.png` - Current Nuxt implementation screenshots
  - `{page}/diff-{viewport}.png` - Pixel diff overlays (magenta highlights)

## Decisions Made

- **odiff-bin**: Chosen for SIMD-accelerated pixel comparison (much faster than PNG.js pixel-by-pixel)
- **Threshold 0.1**: 10% color difference threshold matches odiff default
- **Antialiasing enabled**: Ignores antialiased pixels to avoid false positives on font rendering
- **Diff color #cd2cc9**: Magenta for high visibility against most content
- **spawnSync over spawn**: Simpler synchronous code, no callback complexity for batch processing

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed odiff exit code parsing**
- **Found during:** Task 3 (running comparison script)
- **Issue:** Initial script checked for exit code 1, but odiff uses code 22 for pixel differences
- **Fix:** Changed to check for code 22, parse stderr for "Found X different pixels (Y%)"
- **Files modified:** .planning/scripts/generate-comparison.ts
- **Committed in:** 7808ed7 (Task 3 commit)

**2. [Rule 1 - Bug] Fixed odiff flag name**
- **Found during:** Task 3 (running comparison script)
- **Issue:** Script used --diffColor but odiff expects --diff-color (kebab-case)
- **Fix:** Changed to --diff-color flag
- **Files modified:** .planning/scripts/generate-comparison.ts
- **Committed in:** 7808ed7 (Task 3 commit)

**3. [Rule 1 - Bug] Fixed screenshot path for diff generation**
- **Found during:** Task 3 (running comparison script)
- **Issue:** Passed original screenshot path to odiff, but file was renamed to current-{viewport}.png
- **Fix:** Use currentPath for odiff comparison after rename
- **Files modified:** .planning/scripts/generate-comparison.ts
- **Committed in:** 7808ed7 (Task 3 commit)

**4. [Rule 1 - Bug] Fixed odiff output parsing**
- **Found during:** Task 3 (running comparison script)
- **Issue:** odiff outputs to stderr, not stdout. Script only read stdout.
- **Fix:** Changed from spawn (async) to spawnSync, read both stdout and stderr
- **Files modified:** .planning/scripts/generate-comparison.ts
- **Committed in:** 7808ed7 (Task 3 commit)

---

**Total deviations:** 4 auto-fixed (all Rule 1 - Bug fixes)
**Impact on plan:** All fixes were necessary for correct odiff operation. No scope creep.

## Issues Encountered

None - all issues were auto-fixed via deviation rules.

## Comparison Results Summary

**Initial comparison (2026-02-05_21-34-09):**
- 12 pages compared against Phase 1 baselines
- 36 total comparisons (12 pages x 3 viewports)
- Average diff: 41.26%
- Highest diffs: home (96-98%) - completely redesigned
- Lowest diffs: gallery pages (8-22%) - likely 404 vs template pages
- 0 matches, 36 mismatches, 0 errors

## Next Phase Readiness

- comparison.json structure ready for web viewer consumption (02-02)
- Image paths follow predictable pattern for easy rendering
- No blockers or concerns

---
*Phase: 02-comparison-infrastructure*
*Completed: 2025-02-05*
