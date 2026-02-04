# Architecture Research

**Domain:** Systematic Website Improvement Workflows
**Researched:** 2025-02-04
**Confidence:** MEDIUM

## Standard Architecture

### System Overview

```
┌───────────────────────────────────────────────────────────────────────────┐
│                           Audit & Discovery Layer                         │
├───────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Content Audit│  │  SEO Audit   │  │Performance   │  │Visual Reg.   │ │
│  │   Scanner    │  │   Analyzer   │  │  Profiler    │  │  Comparison  │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
└─────────┼─────────────────┼─────────────────┼─────────────────┼──────────┘
          │                 │                 │                 │
          ▼                 ▼                 ▼                 ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                           Analysis & Planning Layer                       │
├───────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                    Issue Aggregation Service                       │  │
│  │            (categorizes, prioritizes, assigns tickets)             │  │
│  └────────────────────────────┬───────────────────────────────────────┘  │
└───────────────────────────────┼───────────────────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                            Execution Layer                                │
├───────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Section    │  │    Image     │  │   Content    │  │   Component  │ │
│  │    Fix       │  │  Migration   │  │   Updates    │  │  Refactoring │ │
│  │   Pipeline   │  │   Pipeline   │  │   Pipeline   │  │    Pipeline   │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
└─────────┼─────────────────┼─────────────────┼─────────────────┼──────────┘
          │                 │                 │                 │
          ▼                 ▼                 ▼                 ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                          QA & Validation Layer                            │
├───────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Visual     │  │    E2E       │  │  Performance │  │   Content    │ │
│  │  Regression  │  │   Tests      │  │   Tests      │  │   Validation │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
└───────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Content Audit Scanner | Crawls pages, extracts content, identifies missing/broken content | Nuxt server route with Cheerio/Puppeteer |
| SEO Audit Analyzer | Analyzes meta tags, headings, structure, sitemap, robots.txt | Nuxt server route with Lighthouse/Site auditing |
| Performance Profiler | Measures Core Web Vitals, bundle sizes, load times | Lighthouse CI, WebPageTest integration |
| Visual Regression Comparison | Captures screenshots, compares pixel/visual differences | Playwright, BackstopJS, or Applitools |
| Issue Aggregation Service | Combines audit results, prioritizes by severity, exports tickets | Nitro route with database or CSV/JSON export |
| Section Fix Pipeline | Orchestrates component updates, applies fixes per section | Composables with Nuxt server actions |
| Image Migration Pipeline | Downloads, optimizes, uploads images, updates references | Sharp for optimization, Cloudinary/ImageKit |
| Content Updates Pipeline | Batch updates content, validates links, updates routing | Nitro routes with WordPress API bridge |
| Component Refactoring Pipeline | Applies code transformations, tests, validates changes | AST-based codemods with testing |
| Visual Regression Tests | Automated visual comparison on every change | Playwright/Cypress with visual plugin |
| E2E Tests | User flow validation, interaction testing | @nuxt/test-utils with Vitest |
| Performance Tests | Continuous performance monitoring, regression detection | Lighthouse CI, Core Web Vitals |
| Content Validation | Link checking, content completeness, accessibility | Pa11y, custom validators |

## Recommended Project Structure

```
server/
├── audit/                    # Audit workflow endpoints
│   ├── content.scan.ts       # Content crawler & scanner
│   ├── seo.analyze.ts        # SEO analysis endpoint
│   ├── performance.profile.ts # Performance profiling
│   └── results.aggregate.ts  # Aggregate & export results
├── comparison/               # Visual comparison tools
│   ├── capture.ts            # Screenshot capture service
│   ├── compare.ts            # Diff generation
│   └── report.ts             # Visual comparison reports
├── migration/                # Data & asset migration
│   ├── images.pipeline.ts    # Image migration orchestration
│   ├── content.pipeline.ts   # Content migration from WP
│   └── validate.ts           # Migration validation
├── fix/                      # Section-by-section fixes
│   ├── sections.ts           # Section identification & routing
│   ├── apply.ts              # Fix application service
│   └── rollback.ts           # Rollback capability
└── routes/                   # Additional utility routes
    └── sitemap.xml.ts

scripts/                      # Standalone automation scripts
├── audit/
│   ├── run-full-audit.ts     # Complete audit runner
│   └── generate-report.ts    # Report generation
├── migration/
│   ├── migrate-images.ts     # Standalone image migration
│   └── migrate-content.ts    # Standalone content migration
└── testing/
    ├── visual-baseline.ts    # Capture visual baseline
    └── run-regression.ts     # Run visual regression tests

components/
├── audit/                    # Audit-related UI components
│   ├── AuditDashboard.vue    # Main audit dashboard
│   ├── AuditResults.vue      # Results display
│   └── IssueCard.vue         # Individual issue display
├── comparison/               # Comparison tool UI
│   ├── DiffViewer.vue        # Side-by-side diff viewer
│   ├── ScreenshotGallery.vue # Comparison gallery
│   └── ComparisonReport.vue  # Visual comparison report
└── tools/                    # Developer tools
    ├── SectionSelector.vue   # Section selection for fixes
    ├── FixPreview.vue        # Preview changes before apply
    └── MigrationProgress.vue # Migration progress indicator

composables/                  # Business logic composables
├── useAudit.ts               # Audit workflow composable
├── useComparison.ts          # Visual comparison composable
├── useMigration.ts           # Migration pipeline composable
├── useSectionFix.ts          # Section fix orchestration
└── useQa.ts                  # QA test runner composable

tests/                        # Test suites
├── visual/                   # Visual regression tests
│   ├── baseline/             # Baseline screenshots
│   ├── scenarios/            # Test scenarios
│   └── reports/              # Generated reports
├── e2e/                      # End-to-end tests
│   ├── user-flows/           # User journey tests
│   └── cross-page/           # Multi-page tests
└── performance/              # Performance tests
    ├── lighthouse/           # Lighthouse configs
    └── benchmarks/           # Custom benchmarks

planning/                     # Planning & tracking
├── audit-results/            # Stored audit results
├── comparison-baselines/     # Visual baselines
├── section-fixes/            # Fix tracking per section
└── qa-reports/               # QA test reports
```

### Structure Rationale

- **server/audit/**: Nitro server routes for scalable, serverless-compatible audit workflows
- **server/comparison/**: Isolated visual comparison services that can run independently
- **server/migration/**: Dedicated migration pipelines with rollback capability
- **server/fix/**: Section-by-section fix orchestration with atomic operations
- **scripts/**: Standalone scripts for CI/CD integration and manual execution
- **components/audit/**: Reusable audit UI components for admin dashboard
- **components/comparison/**: Visual comparison tools with diff viewing
- **composables/**: Shared business logic that works on client and server
- **tests/visual/**: Separate visual regression test organization
- **planning/**: Persistent storage for audit results, baselines, and reports

## Architectural Patterns

### Pattern 1: Audit-First Discovery

**What:** Always run comprehensive audits before making changes to establish baseline and identify all issues.

**When to use:** Starting any website improvement project, major refactoring, or before/after comparisons.

**Trade-offs:**
- Pro: Comprehensive understanding, data-driven prioritization, measurable results
- Con: Initial time investment, may reveal overwhelming scope

**Example:**
```typescript
// composables/useAudit.ts
export const useAudit = () => {
  const runFullAudit = async (options: AuditOptions) => {
    // Run audits in parallel for speed
    const [content, seo, performance, accessibility] = await Promise.allSettled([
      $fetch('/api/audit/content'),
      $fetch('/api/audit/seo'),
      $fetch('/api/audit/performance'),
      $fetch('/api/audit/accessibility')
    ])

    // Aggregate and prioritize issues
    return aggregateIssues({
      content: content.status === 'fulfilled' ? content.value : null,
      seo: seo.status === 'fulfilled' ? seo.value : null,
      performance: performance.status === 'fulfilled' ? performance.value : null,
      accessibility: accessibility.status === 'fulfilled' ? accessibility.value : null
    })
  }

  return { runFullAudit }
}
```

### Pattern 2: Atomic Section Fixes

**What:** Treat each website section (header, hero, content blocks, footer) as independent units that can be fixed, tested, and rolled back independently.

**When to use:** Large refactoring projects, gradual migrations, phased improvements.

**Trade-offs:**
- Pro: Lower risk, easier testing, progressive deployment
- Con: More orchestration complexity, potential interdependency issues

**Example:**
```typescript
// server/fix/sections.ts
export default defineEventHandler(async (event) => {
  const { section, fixId, dryRun = false } = await readBody(event)

  // Define section boundaries
  const sections = {
    header: { pages: ['/*'], components: ['AppHeader', 'Navigation'] },
    hero: { pages: ['/'], components: ['HeroSlider'] },
    content: { pages: ['/services/*', '/projects/*'], components: ['ContentBlock'] },
    footer: { pages: ['/*'], components: ['AppFooter', 'SocialLinks'] }
  }

  const targetSection = sections[section]
  if (!targetSection) {
    throw createError({ statusCode: 400, message: 'Unknown section' })
  }

  // Apply fix atomically with rollback capability
  if (dryRun) {
    return previewFix(section, fixId)
  }

  return applyFix(section, fixId, targetSection)
})
```

### Pattern 3: Baseline-Driven Visual Regression

**What:** Capture comprehensive visual baselines, then compare all changes against baseline using automated screenshot comparison.

**When to use:** Any UI changes, refactoring, design updates, responsive testing.

**Trade-offs:**
- Pro: Catches visual bugs, ensures design consistency, multi-device validation
- Con: Baseline maintenance, false positives from dynamic content

**Example:**
```typescript
// server/comparison/capture.ts
export default defineEventHandler(async (event) => {
  const { routes, devices, baseUrl } = await readBody(event)

  const screenshots = await Promise.all(routes.flatMap(route =>
    devices.map(device => captureScreenshot(route, device, baseUrl))
  ))

  // Store with metadata for comparison
  await storeBaselineScreenshots({
    screenshots,
    timestamp: Date.now(),
    environment: 'baseline'
  })

  return { captured: screenshots.length, baseline: 'created' }
})

// server/comparison/compare.ts
export default defineEventHandler(async (event) => {
  const { currentBaseline } = await readBody(event)

  const comparison = await compareScreenshots({
    baseline: currentBaseline,
    current: await captureCurrentScreenshots(),
    threshold: 0.1 // 10% difference threshold
  })

  return generateDiffReport(comparison)
})
```

### Pattern 4: Pipeline-Based Image Migration

**What:** Process images through a multi-stage pipeline: discover → download → optimize → upload → update references → validate.

**When to use:** Migrating from legacy CMS, CDN changes, image format modernization.

**Trade-offs:**
- Pro: Consistent processing, rollback capability, validation at each stage
- Con: Pipeline complexity, storage costs during migration

**Example:**
```typescript
// server/migration/images.pipeline.ts
export const imageMigrationPipeline = async (options: MigrationOptions) => {
  const stages = {
    discover: async () => {
      // Find all image references in content
      return discoverImages({ source: 'wordpress', apiUrl: options.wpApiUrl })
    },
    download: async (images: ImageInfo[]) => {
      // Download with retry and progress tracking
      return downloadImages(images, { concurrency: 5, retry: 3 })
    },
    optimize: async (downloaded: DownloadedImage[]) => {
      // Optimize using Sharp
      return optimizeImages(downloaded, {
        formats: ['webp', 'avif'],
        quality: 80,
        resize: [320, 640, 1024, 1920]
      })
    },
    upload: async (optimized: OptimizedImage[]) => {
      // Upload to CDN with metadata
      return uploadImages(optimized, { cdn: options.targetCdn })
    },
    updateReferences: async (uploaded: UploadedImage[]) => {
      // Update content references atomically
      return updateContentReferences(uploaded, {
        source: 'wordpress',
        apiUrl: options.wpApiUrl
      })
    },
    validate: async (updated: UpdateResult[]) => {
      // Validate all images are accessible
      return validateImageMigration(updated)
    }
  }

  // Execute pipeline with rollback on failure
  return executePipeline(stages, { rollbackOnError: true })
}
```

## Data Flow

### Audit Workflow Flow

```
[User/Admin Dashboard]
    ↓ (initiate audit)
[Nitro Audit Routes] → [Parallel Audit Execution]
    ├─→ Content Scanner → [Parse HTML] → [Extract Content] → [Identify Issues]
    ├─→ SEO Analyzer → [Check Meta] → [Validate Structure] → [Score SEO]
    ├─→ Performance Profiler → [Lighthouse] → [Core Web Vitals] → [Bundle Analysis]
    └─→ Visual Capture → [Screenshot All Routes] → [Store Baseline]
    ↓
[Issue Aggregation Service]
    ↓ (categorize, prioritize, export)
[Planning Database] → [Generate Tickets/Tasks]
```

### Comparison Flow

```
[Developer Trigger] or [CI/CD Pipeline]
    ↓
[Screenshot Capture Service]
    ├─→ [Playwright/Browser] → [Capture Each Route] → [Multiple Viewports]
    └─→ [Store with Metadata]
    ↓
[Diff Generation Service]
    ├─→ [Pixel Comparison] → [ImageMagick/ResembleJS]
    ├─→ [Layout Comparison] → [DOM Structure Analysis]
    └─→ [Content Comparison] → [Text/Link Validation]
    ↓
[Report Generation] → [Visual Diff Viewer] → [Approval/Rejection]
```

### Image Migration Pipeline Flow

```
[Migration Trigger]
    ↓
[Discovery Stage]
    ├─→ [Scan Content API] → [Find Image URLs]
    └─→ [Build Manifest] → [Store Migration State]
    ↓
[Download Stage]
    ├─→ [Download with Retry] → [Temporary Storage]
    └─→ [Progress Tracking]
    ↓
[Optimization Stage]
    ├─→ [Sharp Processing] → [Format Conversion]
    ├─→ [Resize for Responsive] → [Quality Optimization]
    └─→ [Generate Variants]
    ↓
[Upload Stage]
    ├─→ [CDN Upload] → [Get New URLs]
    └─→ [Store Mapping]
    ↓
[Update Stage]
    ├─→ [Update Content API] → [Replace URLs]
    └─→ [Atomic Updates] → [Rollback on Error]
    ↓
[Validation Stage]
    ├─→ [Verify Accessibility] → [Check Headers]
    └─→ [Visual Regression] → [Confirm Display]
    ↓
[Migration Complete] → [Cleanup Temporary Files]
```

### Section Fix Flow

```
[Select Section] → [Define Scope]
    ↓
[Preview Fix] → [Show Expected Changes]
    ↓ (approve)
[Create Backup] → [Store Current State]
    ↓
[Apply Fix] → [Update Components/Pages]
    ↓
[Run Tests] → [Visual + E2E + Performance]
    ↓ (pass)
[Commit Changes] → [Update Audit Results]
    ↓ (fail)
[Rollback] → [Restore from Backup]
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k pages | Single-node Nitro server, in-memory audit state, local screenshot storage |
| 1k-10k pages | Queue-based audit processing, distributed screenshot capture, CDN storage for baselines, database for audit results |
| 10k+ pages | Worker pool for audits, sharded processing, object storage for all assets, incremental audit support |

### Scaling Priorities

1. **First bottleneck:** Screenshot capture and visual comparison
   - Fix: Parallelize capture across workers, use CDN for baseline storage, implement incremental comparison

2. **Second bottleneck:** Audit processing time
   - Fix: Queue-based processing, incremental audits (only changed content), cached results

## Anti-Patterns

### Anti-Pattern 1: Monolithic Fix Deployment

**What people do:** Deploy all website fixes simultaneously as a single change.

**Why it's wrong:** Makes debugging nearly impossible, high risk of breaking production, difficult to isolate issues, rollback affects everything.

**Do this instead:** Use atomic section fixes. Deploy one section at a time, validate, then proceed. Each section should be independently testable and rollback-able.

### Anti-Pattern 2: No Visual Baseline

**What people do:** Start refactoring without capturing visual baseline, or only capture baseline for "important" pages.

**Why it's wrong:** Cannot detect visual regressions, manual testing is insufficient, responsive issues go undetected until production.

**Do this instead:** Capture comprehensive visual baseline for all routes and viewports before any changes. Store baselines in version control alongside code.

### Anti-Pattern 3: Sequential Migration

**What people do:** Process images one at a time, waiting for each to complete before starting the next.

**Why it's wrong:** Extremely slow for large sites, single failure can block entire migration, poor resource utilization.

**Do this instead:** Pipeline-based migration with parallel processing, batch operations, and checkpoint/rollback capability.

### Anti-Pattern 4: Testing After Completion

**What people do:** Complete all work, then run QA to find issues.

**Why it's wrong:** Issues found late are more expensive to fix, context switching between fix and test phases, confidence is low.

**Do this instead:** Shift-left testing. Run visual regression, E2E, and performance tests continuously. Fix → Test → Fix → Test cycle.

### Anti-Pattern 5: Manual Comparison

**What people do:** Visually compare old vs new website by opening two browser tabs.

**Why it's wrong:** Misses subtle differences, not reproducible, doesn't scale, subjective.

**Do this instead:** Automated visual regression with pixel/layout comparison, diff reports, and approval workflow.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| WordPress API | Nitro server routes with caching | Bridge for content migration and updates |
| Image CDN (Cloudinary/ImageKit) | Upload SDK + URL mapping | Use for image optimization and delivery |
| Lighthouse CI | CI/CD integration with JSON report upload | Performance regression detection |
| Screenshot Service (BrowserStack/Percy) | API client with result polling | Cross-browser visual validation |
| Analytics (GA4/Plausible) | Event tracking composable | Measure impact of improvements |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Audit Layer → Planning Layer | Database / JSON export | Audit results feed planning tickets |
| Planning Layer → Fix Layer | API calls / Queue | Planned fixes trigger execution |
| Fix Layer → QA Layer | Automatic test trigger | Every fix triggers validation tests |
| Comparison Layer → All Layers | Event-based comparison | Any change triggers visual comparison |

## Build Order Recommendations

Based on component dependencies and risk management, the recommended build order is:

### Phase 1: Foundation (Audit & Baseline)
**Priority: Critical**

1. Content Audit Scanner - Understand what content exists
2. SEO Audit Analyzer - Know starting point for SEO
3. Performance Profiler - Establish performance baseline
4. Visual Baseline Capture - Store current state for comparison

**Rationale:** Cannot measure improvement without baseline. Audit identifies all issues for planning.

### Phase 2: Comparison Tools
**Priority: High**

5. Screenshot Capture Service - Automated capture infrastructure
6. Diff Generation Service - Comparison algorithms
7. Visual Diff Viewer - UI for reviewing differences

**Rationale:** Comparison tools enable safe iteration. Without them, every change is risky.

### Phase 3: QA Integration
**Priority: High**

8. Visual Regression Tests - Automated visual validation
9. E2E Test Integration - User flow validation
10. Performance Test Integration - Continuous performance monitoring

**Rationale:** QA must be in place before applying fixes. Tests catch regressions early.

### Phase 4: Migration Pipelines
**Priority: Medium**

11. Image Migration Pipeline - Asset modernization
12. Content Migration Pipeline - Content updates from WordPress
13. Validation Services - Verify migration success

**Rationale:** Migration requires solid foundation and QA. Doing it earlier risks data loss.

### Phase 5: Fix Execution
**Priority: Medium**

14. Section Fix Orchestration - Apply fixes by section
15. Rollback Services - Safety net for failed fixes
16. Issue Tracking Integration - Connect fixes to audit results

**Rationale:** Fix execution is safest when audit, comparison, and QA are all in place.

### Phase 6: Automation & CI/CD
**Priority: Low**

17. Automated Audit Scheduling - Regular health checks
18. CI/CD Pipeline Integration - Continuous validation
19. Dashboard & Reporting - Visibility into progress

**Rationale:** Automation accelerates but manual processes work first. Add automation last.

## Integration with Existing Nuxt 3 Structure

The new architecture integrates with the existing VP Associates Nuxt 3 application:

### Existing Structure Integration
```
pages/                    # Existing: index.vue, about.vue, etc.
    ↓ (augmented with)
└── admin/                # NEW: Admin dashboard for audit/comparison tools
    ├── audit.vue
    ├── comparison.vue
    └── migration.vue

server/api/               # Existing: projects.get.ts, services.get.ts, etc.
    ↓ (augmented with)
├── audit/                # NEW: Audit endpoints
├── comparison/           # NEW: Comparison endpoints
└── migration/            # NEW: Migration endpoints

components/               # Existing: AppHeader.vue, HeroSlider.vue, etc.
    ↓ (augmented with)
├── audit/                # NEW: Audit UI components
└── comparison/           # NEW: Comparison UI components

composables/              # Existing: usePageMeta.ts, useAnalytics.ts
    ↓ (augmented with)
├── useAudit.ts           # NEW: Audit workflow
├── useComparison.ts      # NEW: Visual comparison
└── useMigration.ts       # NEW: Migration pipelines
```

### Leveraging Existing Modules

- **@nuxt/image**: Used by image migration pipeline for optimization
- **@nuxtjs/sitemap**: Audit tool validates sitemap completeness
- **@pinia/nuxt**: Store audit results and comparison state
- **@vueuse/nuxt**: Shared utilities across all new tools
- **@vite-pwa/nuxt**: Offline-capable audit tools

## Sources

### Website Audit & Improvement Methodologies
- [A Systematic Review of Improvement Methodologies (Six Sigma: Define, Measure, Analyze, Implement, Control)](https://www.scielo.org.co/scielo.php?pid=S0123-30332024000300018&script=sci_arttext) - HIGH confidence
- [A Systematic Review of Metrics, Methods, and Research for Website Performance (2010-2024)](https://www.mdpi.com/2073-431X/14/10/446) - HIGH confidence
- [Global Internal Audit Standards 2024](https://www.theiia.org/globalassets/site/standards/globalinternalauditstandards_2024january9.pdf) - HIGH confidence

### Visual Regression Testing Tools
- [15 Best Visual Testing Tools: Complete Overview (Functionize)](https://www.functionize.com/automated-testing/visual-testing-tools) - MEDIUM confidence
- [Top 9 Automated Visual Testing Tools (Lost Pixel)](https://www.lost-pixel.com/blog/automated-visual-testing-tools) - MEDIUM confidence
- [Top 10 Visual Regression Testing Tools for 2024 (TestGrid)](https://testgrid.io/blog/visual-regression-testing-tools/) - MEDIUM confidence
- [Top 10 Visual AI Testing Tools (Applitools)](https://applitools.com/blog/top-10-visual-testing-tools/) - MEDIUM confidence

### Nuxt 3 Architecture
- [Nuxt 3 Directory Structure Documentation](https://nuxt.com/docs/guide/directory-structure) - HIGH confidence
- [Nuxt 3 Migration Guide](https://nuxt.com/docs/3.x/migration) - HIGH confidence
- [Nuxt Image v2 Documentation](https://nuxt.com/blog/nuxt-image-v2) - HIGH confidence
- [Nuxt 3 Testing Documentation](https://nuxt.com/docs/getting-started/testing) - HIGH confidence
- [Building a Nuxt 3 App with Pinia and Testing It with Cypress](https://dev.to/blamsa0mine/building-a-nuxt-3-app-with-pinia-and-testing-it-with-cypress-13ah) - MEDIUM confidence

### Refactoring Methodologies
- [Refactoring and Design Patterns (Refactoring.guru)](https://refactoring.guru/) - HIGH confidence
- [Architectural Refactoring: A Task-Centric View on Software](https://scispace.com/pdf/architectural-refactoring-a-task-centric-view-on-software-58hp7o2snp.pdf) - MEDIUM confidence
- [Modernizing Legacy Code: Refactor, Rearchitect, or Rewrite?](https://vfunction.com/blog/modernizing-legacy-code-refactor-rearchitect-or-rewrite/) - MEDIUM confidence

---
*Architecture research for: Systematic Website Improvement Workflows*
*Researched: 2025-02-04*
