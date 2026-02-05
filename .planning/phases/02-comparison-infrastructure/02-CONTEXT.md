# Phase 2: Comparison Infrastructure - Context

**Gathered:** 2026-02-05
**Status:** Ready for planning

## Phase Boundary

Build developer tools for visual regression testing — NOT for matching the old site's HTML structure. The old site baselines are visual references only. The actual implementation is a new modern design based on analysis of other engineering websites, with VP Associates content fitted into that design.

Comparison tools exist to: (1) visually verify the new design looks good, (2) catch unintended regressions during development, (3) provide a reference for what the old site looked like.

## Implementation Decisions

### Visual diff viewer UI
- **Web-based interactive viewer** — Open in browser, can zoom/pan, click between images
- **Independent scrolling** — Each side scrolls independently (user controls position manually)
- **Switchable viewports** — Tabs or dropdown to switch between mobile/tablet/desktop views (not all at once)
- **Page selector navigation** — Dropdown menu to jump between pages (home, about, services, etc.)

### Pixel diff algorithm
- **Diff overlay image** — Third image showing changes highlighted in red/magenta on neutral background
- **Configurable threshold** — User can set pixel threshold (ignore differences under X% color change)
- **Visual only** — No numerical metrics about pixel change percentage
- **Ignore regions** — Allow specifying areas to exclude (dynamic content like dates, timestamps, randomized elements)

### HTML comparison scope
- **Not applicable for structure matching** — This is a redesign, not a rebuild. HTML structure will differ significantly from old site.
- **Content verification only** — Test that content exists, not structure matching
- **Textual report** — List of findings, not visual HTML diff

### Output format
- **Open in browser automatically** — Launch browser to view comparison results after generation
- **Save to .planning directory** — Results go in `.planning/comparisons/` with timestamps
- **Keep history** — Preserve all comparison runs for tracking progress over time
- **On-demand only** — Manual run via explicit command (no automatic hooks)

### Claude's Discretion
- Exact styling of the web-based viewer
- Default pixel threshold value
- File naming conventions for comparison history
- Exact format of textual HTML report

## Specific Ideas

- Key insight: "We are not rebuilding the old site. We are redesigning based on analysis of other modern, beautiful engineering websites and fitting our content into the design."
- Old site baselines are visual reference, not template to match
- Comparison tools help catch regressions, not enforce parity

## Deferred Ideas

None — discussion stayed within phase scope.

---

*Phase: 02-comparison-infrastructure*
*Context gathered: 2026-02-05*
