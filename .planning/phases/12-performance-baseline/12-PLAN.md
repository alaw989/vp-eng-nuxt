---
wave: 1
depends_on: []
files_modified:
  - .planning/phases/12-performance-baseline/lighthouse-baseline.json
  - .planning/phases/12-performance-baseline/bundle-analysis-stats.json
  - .planning/phases/12-performance-baseline/lcp-analysis.md
  - nuxt.config.ts
autonomous: true
must_haves:
  - Lighthouse audit run on all major pages with documented baseline scores
  - Bundle analysis visualization showing JavaScript payload sizes by chunk
  - LCP (Largest Contentful Paint) element identified for each route
---

# Phase 12: Performance Baseline

## Goal

Comprehensive performance measurement establishes current state and identifies optimization targets before making changes.

---

## Plan 12-01: Run Lighthouse Audit Across All Pages

**Wave:** 1
**Estimated time:** 30 minutes

### Overview
Run Google Lighthouse audits on all major pages to establish performance baseline scores.

### Tasks

1. **Identify pages to audit**
   - Homepage (/)
   - About (/about)
   - Services (/services)
   - Projects (/projects)
   - Contact (/contact)
   - Careers (/careers)

2. **Run Lighthouse audits**
   - Use `npx lighthouse` for each URL
   - Run in both desktop and mobile modes
   - Capture scores for: Performance, Accessibility, Best Practices, SEO

3. **Document baseline scores**
   - Create baseline report JSON file
   - Document current scores
   - Note any critical issues

### Deliverables
- `.planning/phases/12-performance-baseline/lighthouse-baseline.json` with all scores

---

## Plan 12-02: Bundle Size Analysis with rollup-plugin-visualizer

**Wave:** 1
**Estimated time:** 20 minutes

### Overview
Analyze the JavaScript bundle to identify size issues and optimization opportunities.

### Tasks

1. **Install bundle analyzer**
   ```bash
   npm install -D rollup-plugin-visualizer
   ```

2. **Configure in nuxt.config.ts**
   - Add visualizer plugin to Vite config
   - Enable stats generation

3. **Build and analyze**
   - Run production build with stats
   - Generate visualization
   - Document findings

### Deliverables
- `.planning/phases/12-performance-baseline/bundle-analysis-stats.json`
- Visual stats.html file

---

## Plan 12-03: Identify LCP Element for Each Route

**Wave:** 1
**Estimated time:** 15 minutes

### Overview
Identify the Largest Contentful Paint element for each page to prioritize optimization efforts.

### Tasks

1. **Use Chrome DevTools or Lighthouse**
   - Check each major route
   - Identify LCP element (usually hero image or large text)

2. **Document findings**
   - List LCP element per page
   - Note current load times
   - Identify optimization opportunities

### Deliverables
- `.planning/phases/12-performance-baseline/lcp-analysis.md`

---

## Verification Criteria

- [ ] Lighthouse audit completed on all pages with scores documented
- [ ] Bundle analysis generated showing chunk sizes
- [ ] LCP elements identified for all major routes
- [ ] Baseline metrics saved for comparison after optimization
