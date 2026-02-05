# Phase 3: Image Migration - Context

**Gathered:** 2026-02-05
**Status:** Ready for planning

## Phase Boundary

Download and optimize all images from the source WordPress site (vp-associates.com) for use in the new Nuxt application. Images are organized by type, deduplicated, converted to modern formats, and documented in a mapping file for easy reference.

## Implementation Decisions

### Optimization targets
- **Quality + size caps approach** — Target 80% quality for visual fidelity, but enforce size caps (hero <200KB, project <100KB, team <50KB)
- **WebP + JPG fallback** — Primary output in WebP format, JPG as fallback for older browser compatibility
- **Responsive variants: 3 sizes** — Generate small (640w), medium (1280w), large (1920w) for srcset usage
- **Resize huge images** — Scale down dimensions while preserving aspect ratio (max 1920px width)

### File organization
- **Organize by type** — `public/images/hero/`, `public/images/projects/`, `public/images/team/`, etc.
- **Descriptive names** — Use meaningful names like `hero-home.webp`, `project-bridge.webp`, `team-john-doe.webp`
- **Same base name for WebP/JPG** — `hero-home.webp` and `hero-home.jpg` (not `hero-home-fallback.jpg`)
- **Include size suffix for variants** — `hero-home-640w.webp`, `hero-home-1280w.webp`, `hero-home-1920w.webp`

### Duplicate handling
- **Deduplicate by hash** — Calculate SHA-256 hash, download once per unique image
- **Shared location** — Store duplicates in `public/images/shared/` folder
- **Add context prefix** — Shared images get prefix based on primary use: `shared-hero-home.webp`, `shared-logo.webp`
- **Full mapping file** — Generate `image-mapping.json` documenting all source URLs → local paths

### Image discovery
- **Both approaches** — Combine WordPress Media API (`/wp/v2/media`) with HTML page crawling for maximum coverage
- **All images** — Download everything found: hero images, photos, logos, icons, backgrounds (no type filtering)
- **Auto-retry (3 attempts)** — Exponential backoff (1s, 2s, 4s delays) on download failures
- **Public HTTP requests** — Download directly from vp-associates.com (no authentication needed)

### Claude's Discretion
- Exact quality threshold (start around 80, adjust as needed)
- Maximum dimension for resize (1920px or higher based on content)
- Minimum file size threshold (whether to skip tiny icons)
- Exact folder structure for image types

## Specific Ideas

- Phase 1 baselines showed the site has hero images, project photos, team headshots
- Some SVG placeholders were already replaced with JPG images in the codebase
- Need to preserve the visual reference while upgrading formats and optimization

## Deferred Ideas

None — discussion stayed within phase scope.

---

*Phase: 03-image-migration*
*Context gathered: 2026-02-05*
