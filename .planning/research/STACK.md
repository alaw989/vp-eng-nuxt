# Stack Research

**Domain:** Website Modernization & Migration Tools
**Researched:** 2026-02-04
**Confidence:** HIGH

## Current Stack (Existing Nuxt 3 Application)

### Frontend Framework

| Component | Version | Purpose | Rationale |
|-----------|---------|---------|-----------|
| **Nuxt 3** | 3.14+ | Full-stack Vue framework | SSR/SSG hybrid, file-based routing, auto-imports |
| **Vue 3** | Latest (via Nuxt) | UI framework | Composition API, reactivity system |
| **TypeScript** | 5.x | Type safety | Catch errors at build time, better DX |
| **Vite** | Bundled (via Nuxt) | Build tool | Fast HMR, optimized production builds |

#### Why This Stack:
- **Nuxt 3**: Modern Vue framework with excellent SEO, SSR capabilities, and zero-config TypeScript
- **Stable**: Nuxt 3 reached stable release, production-ready
- **Performance**: Built on Vite for fast development and optimized production builds

### Styling & UI

| Component | Version | Purpose | Rationale |
|-----------|---------|---------|-----------|
| **Tailwind CSS** | 3.x | Utility-first CSS | Rapid styling, consistent design system, responsive utilities |
| **@nuxtjs/tailwindcss** | Latest | Nuxt Tailwind module | Auto-imports, optimized for Nuxt, purging in production |
| **PostCSS** | 8.x | CSS processing | Tailwind dependency, autoprefixing, minification |

#### Why This Stack:
- **Tailwind CSS**: Industry standard for utility-first CSS, excellent documentation, small production bundle after purging
- **Integrated**: @nuxtjs/tailwindcss module provides seamless Nuxt integration with auto-imports

### Image Optimization

| Component | Version | Purpose | Rationale |
|-----------|---------|---------|-----------|
| **@nuxt/image** | Latest | Image optimization | Runtime optimization, format conversion, responsive images |
| **Format Support** | webp, avif, jpg | Modern formats | WebP/AVIF for smaller sizes, JPG fallback |

#### Why This Stack:
- **@nuxt/image**: Native Nuxt integration, uses IPX for runtime optimization, supports external CDNs
- **Format Support**: WebP/AVIF provide 20-30% size reduction over JPG with same quality
- **Configured**: Already set up in nuxt.config.ts with format array

### PWA & Offline Support

| Component | Version | Purpose | Rationale |
|-----------|---------|---------|-----------|
| **@vite-pwa/nuxt** | Latest | PWA functionality | Service worker, manifest, offline support, install prompts |
| **Workbox** | Via PWA module | Caching strategy | Precaching, runtime caching, offline fallbacks |

#### Why This Stack:
- **@vite-pwa/nuxt**: Official PWA module for Vite/Nuxt, mature and actively maintained
- **Feature-complete**: Service worker generation, manifest auto-generation, update prompts

### Content Management

| Component | Version | Purpose | Rationale |
|-----------|---------|---------|-----------|
| **WordPress REST API** | wp/v2 | Headless CMS | Content management, non-technical editors, existing content |
| **@nuxtjs/strapi** | NOT USED | Alternative CMS | WordPress already chosen |

#### Why This Stack:
- **WordPress**: Industry-standard CMS, user-friendly for content editors, mature REST API
- **Headless**: Decouples content from presentation, enables modern frontend, improves security
- **API Endpoint**: https://www.vp-associates.com/wp-json/wp/v2

### SEO & Meta Tags

| Component | Version | Purpose | Rationale |
|-----------|---------|---------|-----------|
| **@nuxtjs/seo** | NOT USED | Meta tags | Custom implementation via usePageMeta composable |
| **@nuxtjs/sitemap** | Latest | Sitemap generation | Dynamic sitemap, automatic route discovery |
| **Schema.org** | Custom | Structured data | JSON-LD for rich snippets |

#### Why This Stack:
- **Custom usePageMeta**: More control than SEO module, centralized meta tag management
- **@nuxtjs/sitemap**: Automatic sitemap generation from Nuxt pages, lastmod timestamps

### Analytics

| Component | Version | Purpose | Rationale |
|-----------|---------|---------|-----------|
| **Google Analytics 4** | Optional | User analytics | Industry standard, free tier sufficient |
| **Custom Composable** | useAnalytics.ts | Event tracking | Consistent event tracking interface |

#### Why This Stack:
- **GA4**: Latest Google Analytics, event-based model, better privacy controls
- **Optional**: Analytics gated behind NUXT_PUBLIC_GA_MEASUREMENT_ID environment variable

### Development Tools

| Component | Version | Purpose | Rationale |
|-----------|---------|---------|-----------|
| **ESLint** | NOT CONFIGURED | Linting | Not currently set up |
| **Prettier** | Via Nuxt auto-format | Code formatting | Consistent formatting, zero-config |
| **TypeScript** | Strict mode | Type checking | Catch errors early, better IDE support |

#### Gaps:
- **No testing framework**: No Vitest, Jest, or Playwright configured
- **No linter**: No ESLint for code quality
- **No pre-commit hooks**: No husky or lint-staged for git hooks

## Tools for Website Modernization (New Recommendations)

### Visual Regression Testing

| Tool | Version | Use Case | Confidence | Notes |
|------|---------|----------|------------|-------|
| **Playwright** | Latest (1.40+) | Screenshot comparison, E2E | HIGH | Built-in visual assertions, cross-browser |
| **@playwright/test** | Latest | Test runner | HIGH | Official Playwright test runner |
| **pixelmatch** | Latest | Pixel diffing | HIGH | Lightweight image comparison library |
| **resemblejs** | Latest | Image comparison | MEDIUM | Alternative to pixelmatch |

#### Why Playwright:
- **Native Visual Testing**: Built-in `expect(page).toHaveScreenshot()` for visual regression
- **Cross-Browser**: Test on Chrome, Firefox, WebKit simultaneously
- **Active Development**: Microsoft-backed, frequent updates, excellent docs
- **Nuxt Integration**: Works with Nuxt 3 via `@nuxt/test-utils` or standalone

#### Alternatives Considered:
- **BackstopJS**: Mature but less active development, more complex setup
- **Percy/Chromatic**: Excellent tools but expensive SaaS pricing
- **Jest-Image-Snapshot**: Good for Jest projects, but Playwright more flexible

### Site Comparison & Scraping

| Tool | Version | Use Case | Confidence | Notes |
|------|---------|----------|------------|-------|
| **Cheerio** | Latest | HTML parsing, static scraping | HIGH | Fast, jQuery-like API, great for static sites |
| **Axios** | Latest (1.7+) | HTTP requests, image download | HIGH | Promise-based, interceptors, good error handling |
| **Playwright** | Latest | Dynamic content, screenshots | HIGH | Browser automation, handles JavaScript rendering |
| **Puppeteer** | Latest | Alternative to Playwright | MEDIUM | Good but Playwright has better multi-browser support |
| **fs-extra** | Latest | File system operations | HIGH | Convenient file operations, promises API |

#### Why Cheerio + Axios for Scraping:
- **Cheerio**: Fast HTML parsing, jQuery syntax (familiar to many developers), lightweight
- **Axios**: Reliable HTTP client, supports streams for large files, good timeout handling
- **Combination**: Proven pattern for static sites, sufficient for vp-associates.com
- **Alternative**: Playwright if site uses heavy JavaScript rendering

#### Image Download Strategy:
```javascript
// Recommended approach
1. Axios + Cheerio for static image discovery (parse <img> src attributes)
2. Axios download streams for bulk image saving
3. Preserve directory structure or flatten as needed
4. Add rate limiting to respect server (1-2 second delays)
```

### HTML Diff & Comparison

| Tool | Version | Use Case | Confidence | Notes |
|------|---------|----------|------------|-------|
| **diffhtml** (npm) | Latest | HTML structure comparison | MEDIUM | Semantic HTML diffing |
| **@playwright/test** | Latest | Side-by-side screenshots | HIGH | Visual comparison, not HTML |
| **Custom implementation** | - | DOM structure comparison | HIGH | Parse HTML, compare semantic elements (h1-h6, nav, main, footer) |

#### Why Custom Implementation:
- **Limited good options**: Most HTML diff tools are unmaintained (html-diff last update 2019)
- **Simple requirement**: Compare semantic HTML structure, not character-level diff
- **Playwright alternative**: Visual comparison more important than HTML diffing

### Link Checking

| Tool | Version | Use Case | Confidence | Notes |
|------|---------|----------|------------|-------|
| **Custom fetch-based** | - | Internal link validation | HIGH | Simple HTTP HEAD requests, check status codes |
| **axios** | Latest | HTTP client for link checking | HIGH | Already dependency, supports promises |

#### Why Custom Implementation:
- **Overkill to use full tools**: Simple fetch/axios sufficient for internal links
- **Rate limiting**: Manual control over request rate
- **External links**: Optional due to rate limiting concerns

## Tools NOT to Use

| Tool | Why Not to Use | Alternative |
|------|----------------|-------------|
| **html-diff** (npm package) | Last updated 2019, unmaintained | Custom DOM comparison or visual diff |
| **Wget** | Gets messy with relative paths, downloads wrong assets | Targeted Playwright/Cheerio extraction |
| **HTTrack** | Overkill for asset extraction, too many files | Focus on images only, not full mirroring |
| **Screaming Frog** | Paid for full features, overkill | Simple custom link checker |
| **CSS extraction tools** | Lose semantics, create unmaintainable code | Rewrite from design tokens |

## Recommended Additions for This Project

### For Visual Regression & Comparison

```bash
npm install -D @playwright/test
npm install -D pixelmatch
```

**Configuration needed:**
- Playwright config for Nuxt 3 integration
- Screenshot baseline storage
- Diff threshold configuration

### For Image Migration

```bash
npm install cheerio axios
npm install -D fs-extra
```

**Usage:**
- Create utility script in `/scripts/migrate-images.ts`
- Extract image URLs from vp-associates.com
- Download to `public/images/` organized by section
- Generate mapping file for reference

### For Link Checking

```bash
# No additional dependencies needed
# Use existing `ofetch` or add axios if preferred
```

**Implementation:**
- Server API route or standalone script
- Crawl sitemap.xml for page list
- Check internal links return 200 OK
- Generate broken link report

### For Testing (Future Addition)

```bash
npm install -D vitest @nuxt/test-utils
npm install -D @playwright/test
```

**Priority:** P2 - Add when ready to implement test coverage

## Dependency Versions (From package.json)

**Current Dependencies:**
```json
{
  "dependencies": {
    "@nuxt/image": "^3.0.0",
    "@nuxtjs/strapi": "^1.11.0",
    "@nuxtjs/tailwindcss": "^6.12.1",
    "@nuxtjs/sitemap": "^7.0.0",
    "@vite-pwa/nuxt": "^0.10.5",
    "nuxt": "^3.15.2"
  }
}
```

**All versions are current as of 2026-02-04.**

## Stack Quality Metrics

| Metric | Score | Notes |
|--------|-------|-------|
| **Current Stack Maturity** | 9/10 | Nuxt 3 is production-ready, all modules stable |
| **Community Support** | 10/10 | Large communities for Nuxt, Vue, Tailwind, WordPress |
| **Documentation Quality** | 10/10 | Excellent docs for all major components |
| **Long-term Viability** | 9/10 | Strong corporate backing (Nuxt Labs, Vue core team) |
| **Talent Availability** | 9/10 | Vue/Nuxt developers widely available |
| **Learning Curve** | 7/10 | Moderate - Nuxt conventions, composable patterns |

## Migration-Specific Tools

For systematic website modernization, this project needs tools beyond standard web development:

| Category | Tool Choice | Rationale |
|----------|------------|-----------|
| **Screenshot Capture** | Playwright | Programmatic control, multi-viewport, integrated testing |
| **Image Download** | Axios + Cheerio | Lightweight, sufficient for static content, easy to script |
| **Visual Diff** | Playwright built-in or pixelmatch | Native visual assertions, or proven library |
| **Link Validation** | Custom fetch/axios | Simple HTTP status checks, no complex tooling needed |
| **HTML Structure Comparison** | Custom DOM parsing | Semantic comparison (h1-h6, nav, main), not character diff |

## Sources

- [Playwright Visual Testing Documentation](https://playwright.dev/docs/test-snapshots) - Official docs (HIGH confidence)
- [Web Scraping with Axios and Cheerio in 2025](https://roundproxies.com/blog/web-scraping-with-axios-and-cheerio/) - Round Proxies (MEDIUM confidence)
- [Cheerio Web Scraping With Node.js - 2025 Guide](https://marsproxies.com/blog/cheerio-web-scraping/) - MarsProxies (MEDIUM confidence)
- [Top 7 Visual Regression Testing Tools in 2025](https://katalon.com/resources-center/blog/visual-regression-testing-tools/) - Katalon (LOW-MEDIUM confidence)
- [Top 12 Best Regression Testing Tools in 2025](https://testomat.io/blog/the-best-regression-testing-tools-in-2025/) - Testomat (LOW-MEDIUM confidence)
- [Reg-suit Visual Regression Tool](https://github.com/reg-viz/reg-suit) - GitHub (MEDIUM confidence)
- [Nuxt 3 Documentation](https://nuxt.com/docs) - Official docs (HIGH confidence)
- [@nuxt/image Documentation](https://image.nuxt.com) - Official docs (HIGH confidence)
- [Nuxt SEO Documentation](https://nuxt.com/docs/getting-started/seo) - Official docs (HIGH confidence)
- [Website Migration Mistakes - Oncrawl](https://www.oncrawl.com/technical-seo/common-website-migration-mistakes-drag-down-seo-performance/) (HIGH confidence)

---
*Stack research for: VP Associates Website Modernization*
*Researched: 2026-02-04*
