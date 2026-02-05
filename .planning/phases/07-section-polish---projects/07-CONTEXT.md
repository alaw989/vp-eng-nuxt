# Phase 7: Section Polish - Projects - Context

**Gathered:** 2026-02-05
**Status:** Ready for planning

## Phase Boundary

Fix projects listing and detail pages with image migration. The listing page should display all projects with filtering and a toggle between grid/list views. Detail pages should showcase project content with image galleries and proper information hierarchy.

## Implementation Decisions

### Listing Page Layout
- **Grid + list toggle** — Users can switch between grid and list view options
- **Paginated display** — 6-12 projects per page with pagination controls
- **Rich card information** — Thumbnail image, title, category, location, year, description excerpt, "View" link
- **Sorting** — Default sort by date (newest first), reverse direction option available

### Filtering UI
- **Position above grid** — Filter bar positioned above project cards, always visible
- **Pill buttons** — Horizontal row of pill-shaped category buttons for selection
- **Single select** — One category selected at a time (e.g., "Commercial" OR "Residential")
- **Query param URL state** — ?category=commercial preserves filtering on share/bookmark

### Detail Page Gallery
- **Featured + thumbnails layout** — Large hero image with thumbnail strip below (click to swap)
- **Lightbox enabled** — Click opens full-screen lightbox with zoom/pan capabilities
- **All available images** — Display all images from Phase 3 migration for each project
- **Click + arrows navigation** — Click thumbnails or use arrow buttons to navigate

### Content Organization
- **Sections structure** — Organized into: Overview, Gallery, Details, Team, Awards
- **Header bar metadata** — Client, location, year, completion date displayed near title
- **Rich text description** — Full WordPress content preserved with formatting, headings, lists
- **Related projects** — Show related projects section at bottom (similar category/tag)

### Claude's Discretion
- Exact pagination items per page (6-12 range)
- Sort direction UI (buttons vs dropdown)
- Lightbox implementation details (library choice, animations)
- Exact section order and headings on detail page
- Related projects algorithm (same category vs tags vs manual)
- Spacing and typography values

## Specific Ideas

- Homepage established patterns that can be reused: grid layouts (1/2/3 columns), card styling
- Image mapping system from Phase 3 ready for project images
- "Modernized and improved" approach from Phase 6 applies here too

## Deferred Ideas

None — discussion stayed within phase scope.

---

*Phase: 07-section-polish-projects*
*Context gathered: 2026-02-05*
