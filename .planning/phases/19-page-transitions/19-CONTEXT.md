# Phase 19: Page Transitions - Context

**Gathered:** 2026-02-08
**Status:** Ready for planning

## Phase Boundary

Smooth navigation with accessibility-aware page transitions. This phase delivers global transition configuration using cross-fade effects, reduced motion support for OS preferences, layout transition optimization, screen reader route announcements, and directional transitions based on explicit route pairs.

## Implementation Decisions

### Transition style
- Cross-fade only (no slide effects)
- Main content area transitions; header/footer participation is at Claude's discretion
- Page-specific variations available (but consistent cross-fade preferred)

### Timing
- 150ms duration for standard transitions (snappy, responsive feel)
- Easing curve at Claude's discretion
- Same 150ms duration for reduced-motion users (just simpler effect)

### Directional behavior
- Explicit route pairs define directional transitions
- Which route pairs get directionality is at Claude's discretion
- Routes without explicit pairs: fallback at Claude's discretion

### Layout handling
- Use Nuxt's built-in transition system with default.vue layout handling
- Consistent cross-fade everywhere (including initial page load)
- Mobile vs desktop behavior at Claude's discretion

### Reduced motion support
- Minimal transition (not instant switch) for `prefers-reduced-motion` users
- Same duration (150ms) with simpler effect

### Claude's Discretion
- Easing curve choice (ease-in-out, ease-out, or linear based on what feels most natural)
- Header/footer participation in transitions
- Which specific route pairs get directional transitions
- Fallback behavior for routes not in explicit pairs
- Mobile vs desktop transition differences

## Specific Ideas

- "Snappy and responsive" feel - 150ms chosen for this reason
- Cross-fade preferred over slide effects for simplicity and elegance

## Deferred Ideas

None — discussion stayed within phase scope.

---

*Phase: 19-page-transitions*
*Context gathered: 2026-02-08*
