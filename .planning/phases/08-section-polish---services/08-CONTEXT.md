# Phase 8: Section Polish - Services - Context

**Gathered:** 2026-02-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix services listing and detail pages with image migration. Services pages should reach visual parity with the polished Projects pages from Phase 7, with appropriate adaptations for the differences between services (abstract offerings) and projects (completed work).

</domain>

<decisions>
## Implementation Decisions

### Listing Page Features
- **Grid-only layout** — No grid/list toggle needed. Services are less visual than projects; the current 2-column grid is appropriate.
- **Category tag filtering** — Add category pills for filtering services by type (Structural, Inspection, CAD/Modeling, etc.)
- **Horizontal scrollable pills** — Category filters display as a horizontally-scrollable row, with active state highlighted (bg-primary, scale-105)
- **URL state persistence** — Filtered category syncs with URL query param (?category=structural) for shareable links and browser back/forward support
- **Filter resets pagination** — If services ever add pagination, changing category filter resets to page 1 (consistent with Projects behavior)

### Detail Page Layout
- **No sidebar** — Services are content-focused; keep the current 2-column layout (content + benefits box) rather than adding a metadata sidebar like Projects
- **Add "How This Service Works" section** — Insert a 4-step process section (Consultation → Design → Review → Support) between capabilities and related projects
- **Generic process steps** — Use the same 4-step process for all services (Consultation, Design, Review, Support) rather than service-specific custom steps
- **Keep current 2-column content layout** — The "About This Service" content and "Why Choose VP Associates?" benefits box remains the primary detail layout

### Service Images/Icons
- **Icons + hero images** — Keep MDI icons for service cards (services are abstract concepts, icons communicate this well). Add a hero image for each service detail page header.
- **Hero image source** — Use images from related projects tagged with that service (e.g., Structural Steel Design → photos from steel projects). This leverages Phase 3 images and creates thematic connection.
- **Background overlay treatment** — Full-width hero image with dark overlay (60/50/70% neutral like homepage) and white text/icon on top.
- **Icon remains visible** — Keep the service icon box alongside the title in the header, superimposed on the hero background.

### Visual Consistency
- **Match Projects patterns** — Services and Projects should feel like the same system: similar card styling, hover effects, and interaction patterns.
- **Keep capabilities in cards** — Service listing cards continue to show the full capabilities list (6-7 bullet points) — this helps users understand scope at a glance.
- **Related services on detail** — Replace the static "Other Services" section with a dynamic "Related Services" section showing 3 services in the same category or commonly paired services.

### Claude's Discretion
- Exact category groupings for services (which services belong to which filter category)
- Horizontal scrolling behavior for category pills (snap-to-scroll, hide scrollbar styling)
- Fallback behavior when no related projects exist for a service's hero image
- "Related services" algorithm (same category vs. commonly paired vs. random excluding current)
- Exact spacing and typography for the new process section

</decisions>

<specifics>
## Specific Ideas

- Match Projects horizontal scroll category filter behavior from Phase 7
- Hero image background overlay should match the treatment used on homepage slides
- Service detail process section should visually match the "Our Process" section on the services listing page
- The 4-step process: Consultation (project review) → Design (analysis/calculations) → Review (plans/permitting) → Support (construction admin)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 08-section-polish---services*
*Context gathered: 2026-02-05*
