# Research: Audit & Baseline Capture

**Phase:** 01 - Audit & Baseline Capture
**Date:** 2026-02-04
**Status:** Complete
**Research Focus:** WordPress page enumeration, Playwright screenshots, baseline organization

---

## Executive Summary

This research document evaluates approaches for capturing a comprehensive baseline of vp-associates.com before migration. The target site is a WordPress installation with the following characteristics:

- **Platform:** WordPress (with native sitemap support)
- **Sitemap:** Available at `https://www.vp-associates.com/wp-sitemap.xml`
- **REST API:** Available at `https://www.vp-associates.com/wp-json/`
- **Content:** ~6 pages, 3 services, 3 projects, plus team/testimonials

**Key Finding:** WordPress sitemap.xml provides the most complete and reliable page enumeration, while REST API offers richer metadata. For baseline capture, Playwright with Nuxt 3 integration provides robust multi-viewport screenshot capabilities.

---

## Research Area 1: WordPress Page Enumeration

### Methods Evaluated

#### 1. XML Sitemap (RECOMMENDED)

**Discovery:**
- Target site has WordPress native sitemap at `/wp-sitemap.xml`
- Redirects from `/sitemap.xml` to `/wp-sitemap.xml` (HTTP 301)
- Uses sitemap index format with separate XML files per content type

**Sitemap Structure:**
```xml
<sitemapindex>
  <sitemap>wp-sitemap-posts-post-1.xml</sitemap>
  <sitemap>wp-sitemap-posts-page-1.xml</sitemap>
  <sitemap>wp-sitemap-posts-gallery-1.xml</sitemap>
  <sitemap>wp-sitemap-taxonomies-category-1.xml</sitemap>
  <sitemap>wp-sitemap-users-1.xml</sitemap>
</sitemapindex>
```

**Advantages:**
- **Complete coverage:** Includes all public content types (posts, pages, custom post types)
- **Structured metadata:** Provides lastmod dates, priority, change frequency
- **Fast:** Single HTTP request to get index, then parallel fetch of sub-sitemaps
- **Reliable:** WordPress core feature (since 5.5), always available
- **SEO-standard:** Format standardized by search engines
- **No rate limiting:** Unlike REST API which may throttle

**Disadvantages:**
- **XML parsing required:** Need Cheerio or xml2js for parsing
- **Limited metadata:** Only URL and lastmod (vs full content from REST API)
- **Doesn't include:** Dynamic content, AJAX-loaded content

**Implementation:**
```typescript
// Using Cheerio for XML parsing
import * as cheerio from 'cheerio'

async function enumeratePagesFromSitemap() {
  const sitemapIndex = await fetch('https://www.vp-associates.com/wp-sitemap.xml')
  const $ = cheerio.load(await sitemapIndex.text(), { xmlMode: true })

  const sitemaps = $('sitemap loc').map((_, el) => $(el).text()).get()

  const allUrls = []
  for (const sitemapUrl of sitemaps) {
    const response = await fetch(sitemapUrl)
    const $sitemap = cheerio.load(await response.text(), { xmlMode: true })
    $sitemap('url').each((_, el) => {
      allUrls.push({
        loc: $sitemap('loc', el).text(),
        lastmod: $sitemap('lastmod', el).text(),
        changefreq: $sitemap('changefreq', el).text(),
        priority: parseFloat($sitemap('priority', el).text())
      })
    })
  }

  return allUrls
}
```

**Validation:**
- Confirmed: Site has 6 pages (home, about-3, contact, careers, portfolio, services)
- Confirmed: Separate sitemaps for posts, pages, galleries, taxonomies, users
- Note: "about-3" is slug (appears to be revision), needs URL normalization

---

#### 2. WordPress REST API

**Discovery:**
- Available at `/wp-json/`
- Standard endpoints: `/wp/v2/pages`, `/wp/v2/posts`
- Custom post types: `/wp/v2/services`, `/wp/v2/projects` (confirmed working)
- Pagination: `?per_page=100` (max 100 per request)

**Advantages:**
- **Rich metadata:** Title, content, excerpt, featured media, author, categories
- **JSON format:** Native parsing, no additional libraries
- **Filtering:** Query parameters (`_fields`, `orderby`, `status`)
- **Custom post types:** Direct access to services/projects
- **Real-time data:** Always reflects current site state

**Disadvantages:**
- **Incomplete picture:** May miss pages if custom post types not registered with API
- **Rate limiting:** Some hosts throttle API requests
- **Authentication required:** For draft/private content
- **Doesn't include:** Taxonomy archives, author archives automatically

**Implementation:**
```typescript
interface WpPage {
  id: number
  link: string
  slug: string
  title: { rendered: string }
  date: string
  modified: string
  status: string
}

async function enumeratePagesFromRestApi() {
  const pages: WpPage[] = await fetch(
    'https://www.vp-associates.com/wp-json/wp/v2/pages?per_page=100&_fields=link,slug,title,date,modified,status'
  ).then(r => r.json())

  const services: WpPage[] = await fetch(
    'https://www.vp-associates.com/wp-json/wp/v2/services?per_page=100&_fields=link,slug,title,date,modified,status'
  ).then(r => r.json())

  const projects: WpPage[] = await fetch(
    'https://www.vp-associates.com/wp-json/wp/v2/projects?per_page=100&_fields=link,slug,title,date,modified,status'
  ).then(r => r.json())

  return [...pages, ...services, ...projects]
}
```

**Validation:**
- Confirmed: 6 pages via `/wp/v2/pages`
- Confirmed: 3 services via `/wp/v2/services`
- Confirmed: 3 projects via `/wp/v2/projects`
- Issue: Returns "about-3" slug (WordPress revision artifact)

---

#### 3. Web Crawling (NOT RECOMMENDED)

**Discovery:**
- Would require crawling from homepage, following links
- Depth-first or breadth-first traversal
- JavaScript rendering required for dynamic content

**Advantages:**
- **Most complete:** Discovers all accessible content
- **No dependencies:** Works even if sitemap/API disabled
- **Content validation:** Can capture actual rendered content

**Disadvantages:**
- **Slow:** Sequential page loads with delays
- **Resource intensive:** Full browser context for each page
- **Complexity:** Handle infinite scroll, pagination, dynamic content
- **Rate limiting risk:** May trigger security measures
- **Maintenance:** Breaks if site structure changes

**Not recommended** for initial audit because:
1. Sitemap.xml provides complete coverage
2. Significantly slower (minutes vs seconds)
3. Overkill for static content site
4. Can be implemented later if needed for dynamic content

**Use case:** Only if sitemap.xml is incomplete or disabled

---

### Recommended Approach: Hybrid Strategy

**Primary Method:** Sitemap XML (REQ-AUD-001)

**Reasoning:**
- WordPress native feature, always available
- SEO-standard format
- Fast, reliable, complete
- Includes all content types automatically

**Supplement with:** REST API for metadata

**Reasoning:**
- Enrich page enumeration with titles, content
- Validate sitemap completeness
- Get featured images, categories for later migration

**Implementation:**
```typescript
// scripts/audit-enumerate-pages.ts
interface PageEntry {
  url: string
  slug: string
  title: string
  type: 'page' | 'service' | 'project' | 'post' | 'taxonomy' | 'archive'
  lastmod: string
  source: 'sitemap' | 'api'
  metadata?: {
    content?: string
    featuredImage?: string
    categories?: string[]
  }
}

async function enumerateAllPages() {
  // 1. Fetch from sitemap (complete URL list)
  const sitemapPages = await enumeratePagesFromSitemap()

  // 2. Enrich with REST API metadata
  const apiPages = await enumeratePagesFromRestApi()

  // 3. Merge and normalize
  const normalized = normalizeAndMerge(sitemapPages, apiPages)

  // 4. Save to pages.json
  await saveToFile('.planning/audit/pages.json', normalized)
}
```

---

## Research Area 2: Playwright Screenshot Automation

### Nuxt 3 Integration Options

#### Option 1: Nuxt Module (RECOMMENDED)

**Discovery:**
- `@nuxt/test-utils` module provides Playwright integration
- Native Nuxt 3 support via `@nuxtjs/playwright` (coming) or custom setup
- Can run as Nitro server route or standalone script

**Advantages:**
- **Native integration:** Works with Nuxt dev server
- **Context awareness:** Access to Nuxt config, routes, env vars
- **Hot reload friendly:** Re-run on file changes
- **CI/CD ready:** Easy to integrate with GitHub Actions
- **Type safety:** TypeScript support

**Implementation:**
```typescript
// scripts/capture-baselines.ts
import { chromium } from 'playwright'
import { readFile } from 'fs/promises'

const viewports = {
  mobile: { width: 375, height: 812 },   // iPhone X
  tablet: { width: 768, height: 1024 },  // iPad
  desktop: { width: 1920, height: 1080 } // Full HD
}

async function captureScreenshots() {
  const pages = JSON.parse(
    await readFile('.planning/audit/pages.json', 'utf-8')
  )

  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: null // Will set per page
  })

  for (const page of pages) {
    for (const [device, vp] of Object.entries(viewports)) {
      const pageObj = await context.newPage()
      await pageObj.setViewportSize(vp)

      try {
        await pageObj.goto(page.url, {
          waitUntil: 'networkidle',
          timeout: 30000
        })

        // Wait for dynamic content
        await pageObj.waitForTimeout(2000)

        // Capture full page
        await pageObj.screenshot({
          path: `.planning/audit/baselines/${page.slug}/${device}.png`,
          fullPage: true
        })
      } catch (error) {
        console.error(`Failed to capture ${page.url} (${device}):`, error)
      } finally {
        await pageObj.close()
      }
    }
  }

  await browser.close()
}
```

**Configuration:**
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // For local testing against production
  nitro: {
    experimental: {
      websocket: true
    }
  }
})
```

---

#### Option 2: Standalone Playwright Script

**Discovery:**
- Run as Node.js script outside Nuxt context
- Direct HTTP requests to live site
- Simpler setup, no Nuxt dependencies

**Advantages:**
- **Simple:** No Nuxt configuration needed
- **Fast:** Direct HTTP, no server startup
- **Flexible:** Can run anywhere with Node.js
- **Production capture:** Screenshots actual production site

**Implementation:**
```typescript
// scripts/capture-production-baselines.ts
import { chromium } from 'playwright'

async function captureProductionBaselines() {
  const browser = await chromium.launch({
    headless: true
  })

  const context = await browser.newContext({
    // Emulate mobile device
    ...playwright.devices['iPhone X']
  })

  const page = await context.newPage()
  await page.goto('https://www.vp-associates.com/')
  await page.waitForLoadState('networkidle')

  await page.screenshot({
    path: 'baselines/home-mobile.png',
    fullPage: true
  })

  await browser.close()
}
```

**Use case:** Capture production baselines before development starts

---

### Screenshot Patterns & Best Practices

#### Viewport Selection

**Mobile:**
- **Width:** 375px (standard iPhone)
- **Height:** 812px (iPhone X) or 667px (iPhone 8)
- **Rationale:** Most common mobile viewport, ensures responsive design

**Tablet:**
- **Width:** 768px (standard iPad)
- **Height:** 1024px (iPad portrait)
- **Rationale:** Breakpoint between mobile and desktop layouts

**Desktop:**
- **Width:** 1920px (Full HD)
- **Height:** 1080px (standard desktop)
- **Rationale:** Most common desktop resolution

**Alternative:** 1440px (laptop) or 2560px (4K) if targeting specific audiences

---

#### Full Page vs Viewport

**Full Page (RECOMMENDED):**
```typescript
await page.screenshot({
  path: 'baselines/home-full.png',
  fullPage: true  // Capture entire scrollable page
})
```

**Advantages:**
- Complete visual baseline
- Captures footer, below-fold content
- Better for regression testing

**Disadvantages:**
- Larger file sizes
- May be very tall for long pages
- Harder to spot small changes

---

**Viewport Only (NOT RECOMMENDED):**
```typescript
await page.screenshot({
  path: 'baselines/home-viewport.png',
  fullPage: false  // Only visible area
})
```

**Advantages:**
- Smaller files
- Focus on above-fold content

**Disadvantages:**
- Misses below-fold changes
- Incomplete baseline

**Recommendation:** Use full page capture for complete baselines

---

#### Dynamic Content Handling

**Wait Strategies:**

1. **Network Idle (RECOMMENDED):**
```typescript
await page.goto(url, {
  waitUntil: 'networkidle'  // No network connections for 500ms
})
```

2. **Fixed Delay (SIMPLE):**
```typescript
await page.waitForTimeout(2000)  // Wait 2 seconds
```

3. **Selector-based (PRECISE):**
```typescript
await page.waitForSelector('.hero-slider', { state: 'visible' })
await page.waitForSelector('.loading', { state: 'hidden' })
```

4. **Combined (ROBUST):**
```typescript
await page.goto(url, { waitUntil: 'domcontentloaded' })
await page.waitForLoadState('networkidle')
await page.waitForTimeout(1000)  // Additional buffer for animations
```

**Recommendation:** Combined approach for maximum reliability

---

#### Device Emulation

**User Agent:**
```typescript
const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)...',
  viewport: { width: 375, height: 812 }
})
```

**Touch Emulation:**
```typescript
const context = await browser.newContext({
  hasTouch: true,
  viewport: { width: 375, height: 812 }
})
```

**Preset Devices:**
```typescript
const context = await browser.newContext({
  ...playwright.devices['iPhone 13 Pro']
})
```

---

### File Organization

**Recommended Structure:**
```
.planning/audit/baselines/
├── home/
│   ├── mobile.png      # 375x812
│   ├── tablet.png      # 768x1024
│   └── desktop.png     # 1920x1080
├── about/
│   ├── mobile.png
│   ├── tablet.png
│   └── desktop.png
├── services/
│   ├── mobile.png
│   ├── tablet.png
│   └── desktop.png
└── projects/
    ├── project-alpha/
    │   ├── mobile.png
    │   ├── tablet.png
    │   └── desktop.png
    └── project-beta/
        ├── mobile.png
        ├── tablet.png
        └── desktop.png
```

**Metadata JSON:**
```json
// .planning/audit/baselines/metadata.json
{
  "captureDate": "2026-02-04T00:00:00Z",
  "captureTool": "playwright@1.40.0",
  "source": "https://www.vp-associates.com",
  "viewports": {
    "mobile": { "width": 375, "height": 812 },
    "tablet": { "width": 768, "height": 1024 },
    "desktop": { "width": 1920, "height": 1080 }
  },
  "pages": [
    {
      "slug": "home",
      "url": "https://www.vp-associates.com/",
      "screenshots": {
        "mobile": "home/mobile.png",
        "tablet": "home/tablet.png",
        "desktop": "home/desktop.png"
      },
      "capturedAt": "2026-02-04T00:05:00Z"
    }
  ]
}
```

---

## Research Area 3: Baseline Organization for Comparison

### Storage Strategies

#### Strategy 1: Time-Based Snapshots

**Structure:**
```
.planning/audit/
├── baselines/
│   ├── 2026-02-04-pre-migration/
│   │   ├── home/
│   │   └── about/
│   ├── 2026-02-15-post-redesign/
│   │   ├── home/
│   │   └── about/
│   └── 2026-03-01-final/
│       ├── home/
│       └── about/
└── diffs/
    ├── 2026-02-04-to-2026-02-15/
    └── 2026-02-15-to-2026-03-01/
```

**Advantages:**
- Complete history of all iterations
- Can compare any two points in time
- Clear progression tracking

**Disadvantages:**
- High storage requirements
- Many duplicate files
- Complex to manage

---

#### Strategy 2: Baseline + Current (RECOMMENDED)

**Structure:**
```
.planning/audit/
├── baselines/
│   └── original/          # Immutable production baseline
│       ├── home/
│       └── about/
├── current/               # Latest screenshots
│   ├── home/
│   └── about/
└── diffs/                 # Generated on demand
    ├── home-mobile-diff.png
    └── about-tablet-diff.png
```

**Advantages:**
- Simple, minimal storage
- Clear what to compare against
- Easy to regenerate diffs

**Disadvantages:**
- Only compares to original
- Loses intermediate states

**Recommendation:** Use this strategy for MVP, migrate to Strategy 1 if needed

---

#### Strategy 3: Git Tracked Baselines

**Structure:**
```
.planning/audit/
├── baselines/
│   ├── .gitkeep
│   └── 0001-original-prod/     # Commit 1
│       ├── home/
│       └── about/
└── .gitattributes
```

**Advantages:**
- Version controlled baselines
- Git history shows progression
- Can revert to any baseline
- Diff tools available

**Disadvantages:**
- Large Git repository
- Images not great in Git (binary)
- Clone performance issues

**Recommendation:** Use Git LFS if going this route, otherwise Strategy 2

---

### Comparison Tools

#### Tool 1: Pixelmatch (RECOMMENDED)

**Library:** `pixelmatch` - Node.js pixel diff library

**Features:**
- Fast pixel-by-pixel comparison
- Configurable diff threshold
- Visual diff output
- Compatible with Playwright/Puppeteer

**Implementation:**
```typescript
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

function compareScreenshots(
  baseline: string,
  current: string,
  diff: string,
  width: number,
  height: number
) {
  const img1 = PNG.sync.read(fs.readFileSync(baseline))
  const img2 = PNG.sync.read(fs.readFileSync(current))
  const diffImg = new PNG({ width, height })

  const numDiffPixels = pixelmatch(
    img1.data,
    img2.data,
    diffImg.data,
    width,
    height,
    { threshold: 0.1 }
  )

  fs.writeFileSync(diff, PNG.sync.write(diffImg))

  return {
    different: numDiffPixels > 0,
    diffPixels: numDiffPixels,
    diffPercentage: (numDiffPixels / (width * height)) * 100
  }
}
```

**Integration with Playwright:**
```typescript
// Generate diff after screenshot
await page.screenshot({ path: 'current/home-desktop.png' })

const result = compareScreenshots(
  'baselines/original/home/desktop.png',
  'current/home-desktop.png',
  'diffs/home-desktop-diff.png',
  1920,
  1080
)

console.log(`Diff: ${result.diffPercentage.toFixed(2)}% pixels changed`)
```

---

#### Tool 2: Playwright Native Diff

**Feature:** Built-in screenshot comparison (experimental)

**Implementation:**
```typescript
test('screenshot comparison', async ({ page }) => {
  await page.goto('https://www.vp-associates.com/')
  await expect(page).toHaveScreenshot('baseline.png', {
    maxDiffPixels: 100,
    threshold: 0.2
  })
})
```

**Advantages:**
- Native integration
- No external dependencies
- Test runner integration

**Disadvantages:**
- Experimental API
- Less flexible
- Requires test framework

---

#### Tool 3: ImageMagick

**CLI Tool:** `compare` command

**Implementation:**
```bash
compare baseline.png current.png -compose src diff.png
```

**Advantages:**
- Powerful CLI tool
- Many options
- Widely available

**Disadvantages:**
- External dependency
- No JavaScript API
- Harder to integrate

---

### Comparison Workflow

**Automated Diff Generation:**
```typescript
// scripts/generate-diffs.ts
interface DiffResult {
  page: string
  viewport: string
  different: boolean
  diffPercentage: number
  baselinePath: string
  currentPath: string
  diffPath: string
}

async function generateAllDiffs() {
  const pages = JSON.parse(
    await readFile('.planning/audit/pages.json', 'utf-8')
  )

  const results: DiffResult[] = []

  for (const page of pages) {
    for (const viewport of ['mobile', 'tablet', 'desktop']) {
      const baseline = `.planning/audit/baselines/original/${page.slug}/${viewport}.png`
      const current = `.planning/audit/current/${page.slug}/${viewport}.png`
      const diff = `.planning/audit/diffs/${page.slug}-${viewport}-diff.png`

      if (!fs.existsSync(current)) continue

      const result = compareScreenshots(
        baseline,
        current,
        diff,
        viewportWidths[viewport],
        viewportHeights[viewport]
      )

      results.push({
        page: page.slug,
        viewport,
        ...result
      })
    }
  }

  // Save diff report
  await saveToFile('.planning/audit/diff-report.json', results)
}
```

---

### Viewing Diffs

**Option 1: Static HTML Report**
```html
<!-- .planning/audit/diff-report.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Visual Diff Report</title>
  <style>
    .diff-row { display: flex; margin: 20px 0; }
    .diff-image { border: 2px solid #ccc; margin: 0 10px; }
    .diff-label { font-weight: bold; text-align: center; }
  </style>
</head>
<body>
  <h1>Visual Regression Report</h1>
  <div id="diffs"></div>
  <script src="diff-data.js"></script>
</body>
</html>
```

**Option 2: Nuxt 3 Comparison Page (RECOMMENDED)**
```vue
<!-- pages/visual-diff.vue -->
<template>
  <div>
    <h1>Visual Baseline Comparison</h1>

    <div class="controls">
      <select v-model="selectedPage">
        <option v-for="page in pages" :key="page.slug" :value="page.slug">
          {{ page.title }}
        </option>
      </select>

      <select v-model="selectedViewport">
        <option value="mobile">Mobile (375px)</option>
        <option value="tablet">Tablet (768px)</option>
        <option value="desktop">Desktop (1920px)</option>
      </select>
    </div>

    <div class="comparison">
      <div class="side-by-side">
        <img :src="baselinePath" alt="Baseline" />
        <img :src="currentPath" alt="Current" />
        <img :src="diffPath" alt="Diff" />
      </div>
    </div>

    <div class="stats">
      <p>Diff Pixels: {{ diffStats.diffPixels }}</p>
      <p>Diff Percentage: {{ diffStats.diffPercentage }}%</p>
    </div>
  </div>
</template>
```

---

## Recommended Implementation Plan

### Phase 1: Page Enumeration (REQ-AUD-001)

**Week 1:**
1. Set up project structure
2. Implement sitemap.xml parser
3. Implement REST API enrichment
4. Create normalization logic
5. Output to `pages.json`

**Deliverable:** Complete page inventory with metadata

---

### Phase 2: Baseline Capture (REQ-AUD-002)

**Week 2:**
1. Install Playwright and dependencies
2. Configure viewports (mobile/tablet/desktop)
3. Implement screenshot script
4. Handle dynamic content (wait strategies)
5. Capture all pages at all viewports
6. Generate metadata file

**Deliverable:** Complete visual baseline set

---

### Phase 3: Comparison Infrastructure (REQ-CMP-001)

**Week 3:**
1. Integrate Pixelmatch
2. Implement diff generation script
3. Create comparison UI (Nuxt page)
4. Add synced scrolling
5. Test with sample screenshots

**Deliverable:** Working comparison tool

---

## Technical Stack

### Required Dependencies

```json
{
  "dependencies": {
    "playwright": "^1.40.0",
    "cheerio": "^1.0.0-rc.12",
    "pixelmatch": "^5.3.0",
    "pngjs": "^7.0.0"
  },
  "devDependencies": {
    "@types/pixelmatch": "^5.2.6",
    "@types/pngjs": "^6.0.4"
  }
}
```

### NPM Scripts

```json
{
  "scripts": {
    "audit:enumerate": "node .planning/scripts/enumerate-pages.ts",
    "audit:capture": "node .planning/scripts/capture-baselines.ts",
    "audit:diff": "node .planning/scripts/generate-diffs.ts",
    "audit:full": "npm run audit:enumerate && npm run audit:capture && npm run audit:diff"
  }
}
```

---

## Key Decisions & Rationale

### Decision 1: Use Sitemap.xml for Enumeration

**Rationale:**
- WordPress native feature, guaranteed availability
- Complete coverage of all public content
- SEO-standard format
- Faster than crawling, more complete than REST API alone

**Trade-off:** Limited metadata vs REST API
**Mitigation:** Hybrid approach - sitemap for URLs, REST API for metadata

---

### Decision 2: Full Page Screenshots

**Rationale:**
- Complete visual baseline
- Captures all content (footer, below-fold)
- Better for regression testing

**Trade-off:** Larger file sizes
**Mitigation:** Optimize with PNG compression if needed

---

### Decision 3: Three Viewports (Mobile/Tablet/Desktop)

**Rationale:**
- Covers all major breakpoints
- Industry standard
- Manageable storage (3 screenshots per page)

**Trade-off:** Doesn't cover all resolutions
**Mitigation:** Add more viewports later if needed

---

### Decision 4: Baseline + Current Storage Strategy

**Rationale:**
- Simple, minimal storage
- Clear comparison target
- Easy to regenerate diffs

**Trade-off:** Loses intermediate states
**Mitigation:** Git track baselines if history needed

---

## Risks & Mitigations

### Risk 1: Dynamic Content Not Captured

**Symptom:** Screenshots missing content that loads asynchronously
**Impact:** Incomplete baseline
**Mitigation:** Use networkidle + fixed delay wait strategy
**Priority:** High

---

### Risk 2: Screenshots Inconsistent Between Runs

**Symptom:** Diff shows changes when none exist
**Impact:** False positives, wasted time
**Mitigation:**
- Use consistent wait times
- Wait for network idle
- Disable animations
- Use fixed viewports

**Priority:** High

---

### Risk 3: Large File Storage

**Symptom:** Baselines consume significant disk space
**Impact:** Git repository bloat, slow clones
**Mitigation:**
- Use Git LFS
- Compress PNGs
- Store outside Git (separate backup)
- Consider JPEG for diffs

**Priority:** Medium

---

### Risk 4: WordPress REST API Rate Limiting

**Symptom:** API requests return 429 errors
**Impact:** Incomplete page enumeration
**Mitigation:**
- Use sitemap.xml as primary method
- Add delays between requests
- Cache results

**Priority:** Low (sitemap is primary)

---

## Open Questions

1. **Should we capture screenshots at additional breakpoints?**
   - Current: 375, 768, 1920
   - Consider: 1440 (laptop), 2560 (4K)
   - Decision: Start with 3, add later if needed

2. **Should we use PNG or JPEG format?**
   - PNG: Lossless, larger files
   - JPEG: Lossy, smaller files, compression artifacts
   - Decision: PNG for baselines, JPEG option for diffs

3. **Should baselines be tracked in Git?**
   - Pro: Version control, easy access
   - Con: Large repo, slow clones
   - Decision: Use Git LFS or store separately

4. **Should we implement automated diff testing in CI/CD?**
   - Pro: Catch regressions early
   - Con: Flaky tests, slow pipeline
   - Decision: Manual review for MVP, automate later

---

## References

### WordPress Enumeration

- [WordPress REST API - Get Full Sitemap](https://stackoverflow.com/questions/47663723/wordpress-rest-api-get-full-sitemap)
- [WordPress User Enumeration via Author Sitemap](https://medium.com/@regan_temudo/wordpress-user-enumeration-via-author-sitemap-xml-on-payapps-com-5ffad0ca1cc2)
- [6 Ways to Enumerate WordPress Users](https://gosecure.ai/blog/2021/03/16/6-ways-to-enumerate-wordpress-users/)
- [How to Secure WordPress from User Enumeration](https://getshieldsecurity.com/blog/wordpress-user-enumeration/)

### Playwright Screenshot Automation

- [Visual Testing with Playwright](https://medium.com/@divyakandpal93/visual-testing-with-playwright-screenshots-snapshots-and-more-e002476bdd9c)
- [Why Visual Regression Testing for Small & Medium Screens](https://sergeipetrukhin.vercel.app/playwright-visual-small-screens)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Screenshot Comparison](https://www.testmuai.com/blog/playwright-screenshot-comparison/)

### Baseline Testing Best Practices

- [Baseline Testing - Types & Best Practices](https://www.virtuosoqa.com/post/baseline-testing)
- [A Guide to Performance Baseline Testing](https://goreplay.org/blog/performance-baseline-testing-20250808133113/)
- [Benchmark vs Baseline Testing Strategy](https://hackmd.io/Cqcl7ATmTEyQGz4tBQOKWQ)
- [Visual Testing Best Practices](https://parvathyp.medium.com/visual-testing-best-practices-and-tools-90cbv6fdef58)
- [Automated Visual Testing Best Practices](https://applitools.com/automated-visual-testing-best-practices-guide/)
- [Best Practices for Measuring Web Vitals](https://web.dev/articles/vitals-field-measurement-best-practices)

### AI Testing Trends (2026)

- [Top 12 Software Testing Trends for 2026](https://aqua-cloud.io/top-12-software-testing-trends/)
- [The 2026 State of Testing Report](https://www.practitest.com/state-of-testing/)
- [Top 5 AI Testing Trends for 2026](https://www.parasoft.com/blog/annual-software-testing-trends/)

---

## Next Steps

1. **Implement page enumeration script** (REQ-AUD-001)
   - Create `.planning/scripts/enumerate-pages.ts`
   - Test against vp-associates.com
   - Validate output completeness

2. **Set up Playwright** (REQ-AUD-002)
   - Install dependencies
   - Configure viewports
   - Test screenshot capture

3. **Capture initial baselines** (REQ-AUD-002)
   - Run against all pages
   - Verify file organization
   - Generate metadata

4. **Build comparison tool** (REQ-CMP-001)
   - Integrate Pixelmatch
   - Create Nuxt comparison page
   - Test with sample diffs

---

## Appendix: Code Samples

### A. Complete Enumeration Script

```typescript
// .planning/scripts/enumerate-pages.ts
import * as cheerio from 'cheerio'
import { writeFile } from 'fs/promises'

interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq?: string
  priority?: number
}

interface PageEntry {
  url: string
  slug: string
  title?: string
  type: string
  lastmod?: string
  source: 'sitemap' | 'api'
}

async function fetchSitemapUrls(sitemapUrl: string): Promise<SitemapUrl[]> {
  const response = await fetch(sitemapUrl)
  const $ = cheerio.load(await response.text(), { xmlMode: true })

  const urls: SitemapUrl[] = []

  // Check if sitemap index
  if ($('sitemap').length > 0) {
    const sitemaps = $('sitemap loc').map((_, el) => $(el).text()).get()
    for (const sm of sitemaps) {
      urls.push(...await fetchSitemapUrls(sm))
    }
  } else {
    // Regular sitemap
    $('url').each((_, el) => {
      urls.push({
        loc: $('loc', el).text(),
        lastmod: $('lastmod', el).text() || undefined,
        changefreq: $('changefreq', el).text() || undefined,
        priority: parseFloat($('priority', el).text() || '0')
      })
    })
  }

  return urls
}

function normalizeUrl(url: string): { slug: string; type: string } {
  const parsed = new URL(url)
  const path = parsed.pathname.replace(/\/$/, '') || '/'

  if (path === '/') return { slug: 'home', type: 'page' }

  const parts = path.split('/').filter(Boolean)

  if (parts.length === 1) {
    return { slug: parts[0], type: 'page' }
  }

  if (parts.length === 2) {
    return { slug: parts[1], type: parts[0].slice(0, -1) } // services -> service
  }

  return { slug: parts.join('-'), type: 'unknown' }
}

async function main() {
  console.log('Enumerating pages from sitemap...')
  const sitemapUrls = await fetchSitemapUrls(
    'https://www.vp-associates.com/wp-sitemap.xml'
  )

  console.log(`Found ${sitemapUrls.length} URLs in sitemap`)

  const pages: PageEntry[] = sitemapUrls.map(url => {
    const { slug, type } = normalizeUrl(url.loc)

    return {
      url: url.loc,
      slug,
      type,
      lastmod: url.lastmod,
      source: 'sitemap'
    }
  })

  await writeFile(
    '.planning/audit/pages.json',
    JSON.stringify(pages, null, 2)
  )

  console.log(`Saved ${pages.length} pages to .planning/audit/pages.json`)
}

main().catch(console.error)
```

### B. Complete Screenshot Script

```typescript
// .planning/scripts/capture-baselines.ts
import { chromium } from 'playwright'
import { readFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'

const viewports = {
  mobile: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 }
}

interface PageEntry {
  url: string
  slug: string
  type: string
}

async function ensureDir(path: string) {
  if (!existsSync(path)) {
    await mkdir(path, { recursive: true })
  }
}

async function captureScreenshots() {
  const pages = JSON.parse(
    await readFile('.planning/audit/pages.json', 'utf-8')
  ) as PageEntry[]

  const browser = await chromium.launch({
    headless: true
  })

  const context = await browser.newContext({
    viewport: null
  })

  for (const page of pages) {
    console.log(`Capturing: ${page.slug}`)

    for (const [device, vp] of Object.entries(viewports)) {
      const pageObj = await context.newPage()
      await pageObj.setViewportSize(vp)

      try {
        await pageObj.goto(page.url, {
          waitUntil: 'networkidle',
          timeout: 30000
        })

        // Wait for dynamic content
        await pageObj.waitForTimeout(2000)

        // Ensure directory exists
        const dir = `.planning/audit/baselines/${page.slug}`
        await ensureDir(dir)

        // Capture full page
        await pageObj.screenshot({
          path: `${dir}/${device}.png`,
          fullPage: true
        })

        console.log(`  ✓ ${device}`)
      } catch (error) {
        console.error(`  ✗ ${device}:`, error)
      } finally {
        await pageObj.close()
      }
    }
  }

  await browser.close()
  console.log('Capture complete!')
}

captureScreenshots().catch(console.error)
```

### C. Complete Diff Script

```typescript
// .planning/scripts/generate-diffs.ts
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'
import { readFile, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { glob } from 'glob'

const viewports = ['mobile', 'tablet', 'desktop']

interface DiffResult {
  page: string
  viewport: string
  different: boolean
  diffPixels: number
  diffPercentage: number
  baselinePath: string
  currentPath: string
  diffPath: string
}

async function compareScreenshots(
  baseline: string,
  current: string,
  diff: string
): Promise<Omit<DiffResult, 'page' | 'viewport'>> {
  const img1 = PNG.sync.read(await readFile(baseline))
  const img2 = PNG.sync.read(await readFile(current))

  const { width, height } = img1
  const diffImg = new PNG({ width, height })

  const diffPixels = pixelmatch(
    img1.data,
    img2.data,
    diffImg.data,
    width,
    height,
    { threshold: 0.1 }
  )

  await writeFile(diff, PNG.sync.write(diffImg))

  return {
    different: diffPixels > 0,
    diffPixels,
    diffPercentage: (diffPixels / (width * height)) * 100,
    baselinePath: baseline,
    currentPath: current,
    diffPath: diff
  }
}

async function generateDiffs() {
  const pages = JSON.parse(
    await readFile('.planning/audit/pages.json', 'utf-8')
  )

  const results: DiffResult[] = []

  for (const page of pages) {
    for (const viewport of viewports) {
      const baseline = `.planning/audit/baselines/${page.slug}/${viewport}.png`
      const current = `.planning/audit/current/${page.slug}/${viewport}.png`
      const diff = `.planning/audit/diffs/${page.slug}-${viewport}.png`

      if (!existsSync(current)) {
        console.log(`Skipping ${page.slug}/${viewport} - no current screenshot`)
        continue
      }

      const result = await compareScreenshots(baseline, current, diff)

      results.push({
        page: page.slug,
        viewport,
        ...result
      })

      console.log(
        `${page.slug}/${viewport}: ${result.diffPercentage.toFixed(2)}% diff`
      )
    }
  }

  await writeFile(
    '.planning/audit/diff-report.json',
    JSON.stringify(results, null, 2)
  )

  console.log(`\nGenerated ${results.length} diffs`)
}

generateDiffs().catch(console.error)
```

---

**Document Version:** 1.0
**Last Updated:** 2026-02-04
**Status:** Research Complete, Ready for Implementation
