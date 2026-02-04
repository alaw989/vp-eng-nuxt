# Feature Research

**Domain:** Website Modernization & Migration Tools
**Researched:** 2026-02-04
**Confidence:** MEDIUM

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

#### Site Comparison Tools

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Visual Diff (Side-by-Side) | Before/after comparison is fundamental to migration QA | MEDIUM | Show old vs new site simultaneously |
| Screenshot Capture | Need to capture state of pages for comparison | LOW | Can use Playwright/Puppeteer |
| Cross-Viewport Testing | Responsive design issues are common in migrations | MEDIUM | Mobile, tablet, desktop breakpoints |
| HTML Source Comparison | DOM structure validation is table stakes for rebuild projects | MEDIUM | Compare rendered HTML structure |
| Link Validation (Internal) | Broken internal links are migration failure indicator | LOW | Check all links return 200 OK |
| Link Validation (External) | External links must remain functional | LOW | Optional due to rate limiting concerns |
| Page List Enumeration | Need to know all pages to test | LOW | Sitemap.xml or crawl |

#### Image Migration Tools

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Bulk Image Download | Manual download of hundreds of images is not viable | LOW | wget, HTTrack, or custom crawler |
| URL Extraction | Finding all image URLs in source site | LOW | Parse HTML, CSS, JSON responses |
| Organized File Placement | Images need structured directory for new project | MEDIUM | Mirror source structure or reorganize |
| Format Detection | Knowing source formats (jpg, png, svg) | LOW | Content-Type header or extension |
| Basic Integrity Check | Verify downloads completed successfully | LOW | File size comparison, checksum |

#### QA Automation

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Screenshot Comparison | Pixel-level diff is core visual regression feature | MEDIUM | Baseline vs current comparison |
| Diff Highlighting | Show where differences are located | MEDIUM | Visual overlay of changes |
| CI/CD Integration | Testing needs to run in pipeline | MEDIUM | GitHub Actions, GitLab CI |
| Test Report Generation | Need to review results | LOW | HTML or JSON output |
| Pass/Fail Status | Clear indication of what needs attention | LOW | Threshold-based |

---

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

#### Site Comparison Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **AI-Powered Visual Analysis** | Distinguish "looks wrong" from "pixel different" | HIGH | LLM evaluation of screenshots |
| **Section-by-Section Comparison** | Compare hero, content, footer independently | MEDIUM | DOM-based segmentation |
| **Interactive Diff Viewer** | Hover to reveal old/new, slider comparison | MEDIUM | Better UX than static side-by-side |
| **Change Aggregation** | Show all changes in single view | MEDIUM | Reduce review noise |
| **Smart Ignore Rules** | Ignore dynamic content (dates, counters) | MEDIUM | Configurable selectors |
| **Accessibility Diff** | Compare ARIA labels, semantic HTML | HIGH | Ensure accessibility not regressed |
| **Performance Comparison** | Lighthouse scores before/after | MEDIUM | Optional but valuable |

#### Image Migration Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Automatic Format Conversion** | Convert to WebP/AVIF during migration | MEDIUM | @nuxt/image can handle this |
| **Optimization During Import** | Reduce file sizes during migration | MEDIUM | Sharp, imagemin integration |
| **Smart Naming** | Preserve meaningful names or generate SEO-friendly names | MEDIUM | Slugify, preserve context |
| **Missing Asset Detection** | Identify images referenced but not found | LOW | 404 detection on download |
| **Usage Mapping** | Track which images used where | HIGH | Build asset dependency graph |
| **CDN Migration Detection** | Handle images already on CDN | MEDIUM | Skip or re-host decision |

#### QA Automation Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Self-Healing Tests** | Auto-update baselines for accepted changes | HIGH | ML-based change classification |
| **Component-Level Diff** | Isolate changes to specific components | HIGH | Requires component identification |
| **Multi-Browser Parallel Testing** | Test Chrome, Firefox, Safari simultaneously | MEDIUM | BrowserStack, Selenium Grid |
| **Historical Trend Analysis** | Track visual changes over time | MEDIUM | Git history integration |
| **SEO Comparison** | Compare meta tags, structured data, headings | MEDIUM | Critical for migration success |
| **Analytics Integration** | Compare page views, bounce rates for validation | MEDIUM | Post-launch verification |

#### AI-Powered Features (2026 Trend)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Automated Fix Suggestions** | Suggest CSS/HTML to match visual appearance | HIGH | Requires LLM vision + code gen |
| **Content Migration Validation** | Verify text content matches between sites | MEDIUM | NLP similarity comparison |
| **Layout Shift Detection** | Identify CLS issues before production | MEDIUM | Web Vitals integration |
| **Accessibility Auto-Fix** | Suggest ARIA improvements | HIGH | Difficult to get right |

---

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Anti-Feature | Why Requested | Why Problematic | Alternative |
|--------------|---------------|-----------------|-------------|
| **Full-Auto Migration** | Desire for zero-touch rebuild | Cannot judge intent, brand, quality | Semi-automated with human review at each section |
| **Real-Time Browser Sync** | See changes instantly in browser | High complexity, flaky, adds noise | Screenshot-based comparison is more reliable |
| **Pixel-Perfect Matching** | Want exact visual replica | Old site may have flaws; better to improve | Visual similarity threshold, focus on elements |
| **Complete Content Scraping** | "Get all content from old site" | May violate ToS, get dynamic content mess | Manual content review, API when available |
| **Automatic Redirect Generation** | "Handle all 301s automatically" | Cannot determine semantic equivalence | Manual redirect mapping with validation |
| **Full Site Mirroring with wget** | Quick copy of everything | Gets broken HTML, wrong paths, assets in wrong places | Targeted asset extraction only |
| **Live Site Side-by-Side Proxy** | See old and new simultaneously | CORS, mixed content, authentication issues | Independent screenshot capture and display |
| **CSS Extraction/Conversion** | "Convert old CSS to Tailwind" | Loses semantics, creates unmaintainable code | Rewrite CSS from design tokens |
| **Automated Accessibility Fixes** | "Fix all a11y issues automatically" | Fixes may break functionality or be wrong | Suggest fixes, require human review |

---

## Feature Dependencies

```
[Baseline Screenshots]
    └──requires──> [Page List Enumeration]
    └──requires──> [Screenshot Capture]

[Visual Diff]
    └──requires──> [Baseline Screenshots]
    └──requires──> [Screenshot Capture]

[Section-by-Section Comparison]
    └──requires──> [Visual Diff]
    └──requires──> [DOM Analysis]

[AI Visual Analysis]
    └──requires──> [Visual Diff]
    └──enhances──> [Section-by-Section Comparison]

[Image Migration]
    └──requires──> [Page List Enumeration]
    └──requires──> [URL Extraction]

[Link Validation]
    └──requires──> [Page List Enumeration]

[SEO Comparison]
    └──requires──> [HTML Source Comparison]

[Automated Fix Suggestions]
    └──requires──> [AI Visual Analysis]
    └──requires──> [DOM Analysis]
```

### Dependency Notes

- **Baseline Screenshots requires Page List Enumeration**: Must know what pages exist before capturing
- **Visual Diff requires Baseline Screenshots**: Cannot compare without reference images
- **Section-by-Section Comparison requires DOM Analysis**: Need to identify sections to segment
- **AI Visual Analysis enhances Section-by-Section**: Adds intelligence to basic comparison
- **Image Migration requires URL Extraction**: Cannot download without knowing source URLs
- **Link Validation requires Page List Enumeration**: Need pages to check links from
- **SEO Comparison requires HTML Source Comparison**: Meta tags live in HTML
- **Automated Fix Suggestions requires AI Visual Analysis**: Needs to understand what changed

---

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] **Page List Enumeration** — Essential for knowing scope of migration
  - Crawl sitemap.xml or traverse site navigation
  - Output: List of URLs to test

- [ ] **Screenshot Capture** — Capture current state of pages
  - Use Playwright for multi-viewport capture
  - Output: Organized screenshots by page and breakpoint

- [ ] **Visual Diff (Side-by-Side)** — Basic before/after comparison
  - Show old and new site images
  - Manual review required

- [ ] **Bulk Image Download** — Get all images from source
  - Extract img src from HTML
  - Download to organized directory

- [ ] **Link Validation (Internal)** — Check internal links work
  - Simple HTTP status check
  - Report broken links

- [ ] **HTML Source Comparison** — Basic DOM structure comparison
  - Compare semantic elements (h1-h6, nav, main, footer)
  - Report structural differences

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] **Section-by-Section Comparison** — Granular component comparison
  - Trigger: Basic visual diff proves useful but too noisy
  - DOM-based segmentation of hero, content, sidebar, footer

- [ ] **Interactive Diff Viewer** — Better UX for reviewing changes
  - Trigger: Manual review becomes bottleneck
  - Slider comparison, hover-to-reveal

- [ ] **Smart Ignore Rules** — Reduce false positives
  - Trigger: Dynamic content causes constant diff noise
  - Ignore dates, timestamps, random IDs

- [ ] **SEO Comparison** — Verify migration preserves SEO
  - Trigger: Concern about search rankings
  - Compare title, meta description, headings

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **AI-Powered Visual Analysis** — Distinguish meaningful from trivial changes
  - Defer: Requires expensive vision API, LLM integration
  - Consider: GPT-4V or Claude Opus for image analysis

- [ ] **Automated Fix Suggestions** — Generate code to fix visual diffs
  - Defer: High complexity, risk of bad suggestions
  - Consider: When AI accuracy exceeds human baseline

- [ ] **Self-Healing Tests** — Auto-accept known-good changes
  - Defer: Machine learning classification required
  - Consider: After collecting training data from manual reviews

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Page List Enumeration | HIGH | LOW | P1 |
| Screenshot Capture | HIGH | LOW | P1 |
| Visual Diff (Side-by-Side) | HIGH | MEDIUM | P1 |
| Bulk Image Download | HIGH | LOW | P1 |
| Link Validation (Internal) | HIGH | LOW | P1 |
| HTML Source Comparison | MEDIUM | MEDIUM | P1 |
| Section-by-Section Comparison | HIGH | MEDIUM | P2 |
| Interactive Diff Viewer | MEDIUM | MEDIUM | P2 |
| Smart Ignore Rules | MEDIUM | MEDIUM | P2 |
| SEO Comparison | HIGH | MEDIUM | P2 |
| AI-Powered Visual Analysis | HIGH | HIGH | P3 |
| Automated Fix Suggestions | MEDIUM | HIGH | P3 |
| Self-Healing Tests | LOW | HIGH | P3 |
| Multi-Browser Parallel Testing | MEDIUM | HIGH | P3 |
| Component-Level Diff | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Must have for launch (table stakes)
- P2: Should have, add when possible (differentiators with reasonable cost)
- P3: Nice to have, future consideration (complex differentiators)

---

## Tool Landscape (2026)

### Existing Tools for Reference

#### Visual Regression Testing

| Tool | Type | Key Features | Notes |
|------|------|--------------|-------|
| **Playwright** | Open Source | Built-in visual comparison, multi-browser | Best for integrated testing |
| **BackstopJS** | Open Source | Dedicated visual regression, CI/CD ready | Mature, component-focused |
| **Percy** | SaaS | AI-powered diff, smart ignore | Expensive, excellent UX |
| **Chromatic** | SaaS | Storybook integration, CI integration | Best for component libraries |
| **Applitools** | SaaS | Visual AI, ultra-precise detection | Enterprise pricing |

#### Link Checking

| Tool | Type | Key Features | Notes |
|------|------|--------------|-------|
| **Broken Link Check** | Free Online | Quick site scan | Rate limited |
| **Screaming Frog** | Desktop App | Comprehensive SEO audit | Paid for full features |
| **W3C Link Checker** | Open Source | Command-line tool | Basic but reliable |

#### Site Download/Scraping

| Tool | Type | Key Features | Notes |
|------|------|--------------|-------|
| **wget** | CLI | Recursive download, mature | Gets messy with relative paths |
| **HTTrack** | GUI/CLI | Full site mirroring | Overkill for asset extraction |
| **Playwright** | Library | Programmatic page access | Best for targeted extraction |

#### AI Code Assistance (2026)

| Tool | Type | Key Features | Notes |
|------|------|--------------|-------|
| **Cursor** | IDE | AI code completion, multiline edit predictions | Popular in 2026 |
| **CodeGPT** | Service | Context-aware debugging, automated fixes | Specialized in bug fixing |
| **Aikido** | Tool | AI code review, security scanning | Focus on code quality |

### Build vs Buy Recommendations

| Category | Recommendation | Rationale |
|----------|----------------|-----------|
| Screenshot Capture | Build with Playwright | Simple API, already ecosystem standard |
| Visual Diff | Build with pixelmatch or resemblejs | Open-source libraries are sufficient |
| Link Checking | Build with simple HTTP client | Overkill to use full SEO tools |
| Image Download | Build custom | Targeted extraction better than full mirroring |
| AI Analysis | Buy/Integrate API | Building vision models is not core competency |

---

## Competitor Feature Analysis

| Feature | Percy | Chromatic | Custom Build |
|---------|-------|-----------|--------------|
| Screenshot comparison | Yes | Yes | Yes (via Playwright) |
| CI/CD integration | Excellent | Excellent | DIY (GitHub Actions) |
| Smart ignore | Yes | Yes | DIY (config) |
| AI-powered diff | Yes | No | DIY (via API) |
| Pricing | $$$$ | $$$ | Free (self-hosted) |
| Section-by-section | No | Component-level | DIY (DOM-based) |
| Image migration | No | No | DIY (wget/crawler) |
| Link checking | No | No | DIY (fetch) |
| SEO comparison | No | No | DIY (HTML parsing) |

**Insight:** Existing tools focus on visual regression, not migration workflow. Our differentiator is the migration-specific workflow (image download, link validation, before/after comparison).

---

## Sources

- [14 Best Regression Testing Tools Compared (2026)](https://www.virtuosoqa.com/post/best-regression-testing-tools) - Virtuoso QA
- [Top 7 Visual Testing Tools for 2026](https://testrigor.com/blog/visual-testing-tools/) - TestRigor
- [Best Regression Testing Tools in 2026]((https://bugbug.io/blog/software-testing/best-regression-testing-tools/) - BugBug
- [Percy vs Chromatic: Which visual regression testing tool to use?](https://medium.com/@crissyjoshua/percy-vs-chromatic-which-visual-regression-testing-tool-to-use-6cdce77238dc) - Medium (2025)
- [Visual Testing Tools Comparison 2025](https://vizzly.dev/visual-testing-tools-comparison/) - Vizzly.dev
- [10 Best Broken Link Checker Tools for Founders [2026]](https://founderpal.ai/best-marketing-tools/broken-link-checker-tools) - FounderPal
- [Guide to Bulk Image Downloading](https://onescales.com/blogs/main/guide-to-bulk-image-downloading) - OneScales (2025)
- [Playwright Visual Regression Testing Guide](https://testquality.com/visual-regression-testing-playwright-jest/) - TestQuality
- [Top 23 Alternatives to BackstopJS](https://testdriver.ai/articles/top-23-alternatives-to-backstopjs-for-node-js-testing) - TestDriver.ai
- [Best AI for Coding in 2026: Autocomplete Is Dead](https://medium.com/@krtarunsingh/best-ai-for-coding-in-2026-autocomplete-is-dead-agent-mode-is-here-7b18b70ef990) - Medium (2026)
- [Top 6 AI Coding Agents 2026]((https://cloudelligent.com/blog/top-6-ai-coding-agents-2026/) - Cloudelligent
- [AI Bug Fixing | Context-Aware Debugging & Fixes](https://codegpt.co/ai-bug-fixing) - CodeGPT
- [Website QA Testing: Complete Guide to Quality Assurance in 2026](https://bugherd.com/blog/website-qa-testing-complete-guide-to-quality-assurance-in-2025) - BugHerd (2025)
- [Ultimate Website Migration Checklist for 2026 & Beyond](https://www.eclicksoftwares.com/public/blog/ultimate-website-migration-checklist-for-2026-beyond) - eClickSoftwares (2025)
- [A Complete Data Migration Checklist For 2026](https://rivery.io/data-learning-center/complete-data-migration-checklist/) - Rivery (2025)
- [How can I download an entire website?](https://superuser.com/questions/14403/how-can-i-download-an-entire-website) - SuperUser (HTTrack recommendation)
- [HTTrack Users Guide](https://www.httrack.com/html/fcguide.html) - Official HTTrack documentation
- [Are there any tools out there to compare the structure of 2 web pages?](https://stackoverflow.com/questions/48669/are-there-any-tools-out-there-to-compare-the-structure-of-2-web-pages) - StackOverflow (DOM diff discussion)
- [evolvingweb/sitediff](https://github.com/evolvingweb/sitediff) - Drupal site comparison tool

---
*Feature research for: Website Modernization & Migration Tools*
*Researched: 2026-02-04*
