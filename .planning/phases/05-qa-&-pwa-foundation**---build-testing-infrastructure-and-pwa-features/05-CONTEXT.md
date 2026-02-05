# Phase 5: QA & PWA Foundation - Context

**Gathered:** 2026-02-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish quality assurance infrastructure and Progressive Web App capabilities. This includes offline support via service workers, install prompts for PWA installation, a build + preview testing workflow, and Lighthouse performance benchmarking.

This phase builds the foundation for safe iteration and modern app features. It does not add user-facing content (that's phases 6-10), but rather infrastructure and testing.

</domain>

<decisions>
## Implementation Decisions

### Offline/Caching Strategy
- **Caching strategy:** Cache-first for app shell (layouts, CSS, JS)
- **Resources to cache:** App shell only — layouts, CSS, JS, fonts, icons (~10-20 resources)
- **Offline fallback:** Friendly offline page with "You're offline" message
- **Uninstall behavior:** Uninstall = full reset (clear all caches, disable service worker)

### Install Prompt UX
- **Discovery method:** Browser native prompt only (no custom button)
- **Timing:** After 30-60 seconds on site
- **Dismiss behavior:** Never ask again (respect user choice)
- **App icon:** Site logo/favicon (not generic PWA icon)

### Testing Workflow
- **Enforcement:** Pre-commit git hook
- **What runs:** Full CI pipeline (build + preview + Lighthouse)
- **Hydration errors:** Zero tolerance — any hydration error fails the commit
- **Failure handling:** Claude's discretion (flexible based on workflow impact)

### Performance Benchmarks
- **Score targets:** Relaxed 85+ (Performance, SEO, Accessibility all ≥85)
- **Gate behavior:** Fail build on low scores
- **Pages to audit:** Claude's discretion (based on what's practical)
- **Result storage:** JSON report in `.planning/audit/lighthouse.json` for trend tracking

### Claude's Discretion
- Pre-commit failure handling mechanism
- Which pages to Lighthouse audit
- Specific implementation details for service worker caching
- Exact offline page design and messaging

</decisions>

<specifics>
## Specific Ideas

- Want fast feedback loop — pre-commit hook should be quick but comprehensive
- Zero tolerance for hydration errors means no broken client-server mismatches allowed
- Lighthouse tracking in audit file creates performance history for regression detection

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 05-qa-&-pwa-foundation*
*Context gathered: 2026-02-05*
