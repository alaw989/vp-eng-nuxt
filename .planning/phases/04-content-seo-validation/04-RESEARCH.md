# Phase 04: Content & SEO Validation - Research

**Researched:** 2026-02-04
**Domain:** Web scraping, content comparison, SEO validation, link checking
**Confidence:** HIGH

## Summary

This phase focuses on validating that content and SEO elements from the source WordPress site (vp-associates.com) are properly preserved in the Nuxt 3 migration. The research identified established patterns and libraries for HTML parsing, link extraction, content comparison, and sitemap validation in the Node.js/Nuxt ecosystem.

Key findings:
1. **Cheerio** is the standard for HTML parsing and link extraction in Node.js (HIGH confidence)
2. **Native URL constructor** handles relative-to-absolute URL resolution without external dependencies (HIGH confidence)
3. **ofetch** (already in Nuxt) provides raw response access for HTTP status checking (HIGH confidence)
4. **@nuxtjs/sitemap** is already configured and working for dynamic routes (HIGH confidence)
5. **Simple Levenshtein distance** or character-level diff is sufficient for content comparison (MEDIUM confidence)
6. **Nuxt routeRules** provides 301 redirect configuration without custom server routes (HIGH confidence)

**Primary recommendation:** Use Cheerio for parsing/extraction, native Web APIs for URL handling, ofetch for HTTP requests, and Nuxt's built-in sitemap/routeRules for SEO infrastructure.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `cheerio` | ^1.0.0 | HTML parsing and element extraction | jQuery-like syntax, fastest and most lightweight HTML parser for Node.js |
| `ofetch` | ^1.4.0 (built into Nuxt) | HTTP requests with status checking | Built into Nuxt 3, provides `.raw()` method for status code access |
| `@nuxtjs/sitemap` | ^6.0.0 | Dynamic sitemap generation | Already configured, official Nuxt module for SEO |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `diff` (npm: diff) | ^7.0.0 | Text comparison/diff generation | When visual diff reports are needed |
| `natural` (optional) | ^8.0.0 | Advanced text similarity (Jaro-Winkler, Dice coefficient) | If semantic similarity scoring is needed beyond simple diff |
| Native `URL` | Built-in | Relative-to-absolute URL resolution | Standard Web API, no dependencies needed |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Cheerio | htmlparser2 | Cheerio has better API ($ selector), htmlparser2 is more verbose |
| Native URL | legacy `url.resolve()` | Native URL is modern standard, legacy is deprecated |
| Simple character diff | Natural language processing | Simple diff is faster and sufficient for migration validation |

**Installation:**
```bash
# Only cheerio is needed (ofetch and sitemap are already in Nuxt)
npm install cheerio
# Optional: for advanced similarity scoring
npm install diff
```

## Architecture Patterns

### Recommended Project Structure

```
.planning/
├── audit/                          # Audit output directory
│   ├── broken-links.json           # REQ-LNK-001 output
│   ├── content-comparison.json     # REQ-LNK-002 output
│   ├── seo-comparison.json         # REQ-SEO-001 output
│   └── url-inventory.csv           # REQ-SEO-002 output
├── scripts/                        # Validation scripts
│   ├── validate-links.ts           # Internal link validation
│   ├── compare-content.ts          # Content integrity comparison
│   ├── extract-meta.ts             # Meta tag extraction
│   └── generate-redirects.ts       # URL mapping and redirects
server/
├── api/
│   └── audit/                      # Optional: live audit endpoints
│       └── links.get.ts            # On-demand link checking
└── routes/
    └── sitemap.xml.ts              # Already exists - verify dynamic routes
```

### Pattern 1: HTML Link Extraction with Cheerio

**What:** Parse HTML and extract all internal anchor links with their href attributes.

**When to use:** REQ-LNK-001 - Internal Link Validation

**Example:**
```typescript
// Source: Context7 - /cheeriojs/cheerio
import * as cheerio from 'cheerio'

interface LinkInfo {
  href: string
  text: string
  sourceUrl: string
}

export function extractInternalLinks(html: string, sourceUrl: string): LinkInfo[] {
  const $ = cheerio.load(html)
  const baseUrl = new URL(sourceUrl)
  const links: LinkInfo[] = []

  $('a[href]').each((_, element) => {
    const href = $(element).attr('href')
    const text = $(element).text().trim()

    if (!href) return

    // Resolve relative URLs to absolute
    const absoluteUrl = new URL(href, baseUrl).href

    // Check if internal link (same domain)
    if (absoluteUrl.startsWith(baseUrl.origin)) {
      links.push({
        href: absoluteUrl,
        text,
        sourceUrl,
      })
    }
  })

  return links
}
```

### Pattern 2: HTTP Status Checking with ofetch

**What:** Fetch URLs and check HTTP status codes, handling non-2xx responses gracefully.

**When to use:** REQ-LNK-001 - Broken link detection

**Example:**
```typescript
// Source: Context7 - /unjs/ofetch
import { ofetch, FetchError } from 'ofetch'

interface LinkCheckResult {
  url: string
  status: number
  statusText: string
  ok: boolean
  error?: string
}

export async function checkLinkStatus(url: string): Promise<LinkCheckResult> {
  try {
    const response = await ofetch.raw(url, {
      timeout: 10000,
      // Don't throw on 404/500 - we need to report them
      ignoreResponseError: true,
    })

    return {
      url,
      status: response.status,
      statusText: response.statusText,
      ok: response.status >= 200 && response.status < 400,
    }
  } catch (error: any) {
    return {
      url,
      status: 0,
      statusText: 'Network Error',
      ok: false,
      error: error.message,
    }
  }
}
```

### Pattern 3: Text Content Extraction and Comparison

**What:** Extract readable text content from HTML and compare between source and target.

**When to use:** REQ-LNK-002 - Content Integrity Validation

**Example:**
```typescript
import * as cheerio from 'cheerio'

interface TextContent {
  headings: string[]
  paragraphs: string[]
  lists: string[]
  rawText: string
}

export function extractTextContent(html: string): TextContent {
  const $ = cheerio.load(html)

  // Remove script, style, and nav elements (not content)
  $('script, style, nav, footer, header').remove()

  const headings: string[] = []
  const paragraphs: string[] = []
  const lists: string[] = []

  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    headings.push($(el).text().trim())
  })

  $('p').each((_, el) => {
    paragraphs.push($(el).text().trim())
  })

  $('li').each((_, el) => {
    lists.push($(el).text().trim())
  })

  // Full text for comparison
  const rawText = $('body').text().replace(/\s+/g, ' ').trim()

  return { headings, paragraphs, lists, rawText }
}

// Simple similarity calculation (character-level)
export function calculateSimilarity(text1: string, text2: string): number {
  const len1 = text1.length
  const len2 = text2.length

  if (len1 === 0 && len2 === 0) return 100
  if (len1 === 0 || len2 === 0) return 0

  // Levenshtein distance for percentage difference
  const matrix: number[][] = []
  for (let i = 0; i <= len2; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= len1; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= len2; i++) {
    for (let j = 1; j <= len1; j++) {
      if (text2.charAt(i - 1) === text1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  const distance = matrix[len2][len1]
  const maxLen = Math.max(len1, len2)
  return ((maxLen - distance) / maxLen) * 100
}
```

### Pattern 4: Meta Tag Extraction

**What:** Extract all SEO-relevant meta tags from HTML (title, description, OG, Twitter Cards).

**When to use:** REQ-SEO-001 - Meta Tag Migration Verification

**Example:**
```typescript
import * as cheerio from 'cheerio'

interface MetaTags {
  title?: string
  description?: string
  keywords?: string
  canonical?: string
  og: Record<string, string>
  twitter: Record<string, string>
}

export function extractMetaTags(html: string): MetaTags {
  const $ = cheerio.load(html)

  const meta: MetaTags = {
    title: $('title').text() || undefined,
    og: {},
    twitter: {},
  }

  // Standard meta tags
  $('meta[name]').each((_, el) => {
    const name = $(el).attr('name')
    const content = $(el).attr('content')

    if (!name || !content) return

    switch (name) {
      case 'description':
        meta.description = content
        break
      case 'keywords':
        meta.keywords = content
        break
    }
  })

  // Canonical link
  const canonical = $('link[rel="canonical"]').attr('href')
  if (canonical) meta.canonical = canonical

  // Open Graph tags
  $('meta[property^="og:"]').each((_, el) => {
    const property = $(el).attr('property')
    const content = $(el).attr('content')
    if (property && content) {
      meta.og[property.replace('og:', '')] = content
    }
  })

  // Twitter Card tags
  $('meta[name^="twitter:"]').each((_, el) => {
    const name = $(el).attr('name')
    const content = $(el).attr('content')
    if (name && content) {
      meta.twitter[name.replace('twitter:', '')] = content
    }
  })

  return meta
}

export function compareMetaTags(source: MetaTags, target: MetaTags): {
  matches: string[]
  missing: string[]
  different: string[]
} {
  const allKeys = [
    'title',
    'description',
    'keywords',
    'canonical',
    ...Object.keys(source.og).map(k => `og:${k}`),
    ...Object.keys(source.twitter).map(k => `twitter:${k}`),
  ]

  const matches: string[] = []
  const missing: string[] = []
  const different: string[] = []

  for (const key of allKeys) {
    const sourceValue = key.startsWith('og:')
      ? source.og[key.replace('og:', '')]
      : key.startsWith('twitter:')
        ? source.twitter[key.replace('twitter:', '')]
        : (source as any)[key]

    const targetValue = key.startsWith('og:')
      ? target.og[key.replace('og:', '')]
      : key.startsWith('twitter:')
        ? target.twitter[key.replace('twitter:', '')]
        : (target as any)[key]

    if (!sourceValue) continue

    if (targetValue === undefined) {
      missing.push(key)
    } else if (sourceValue !== targetValue) {
      different.push(key)
    } else {
      matches.push(key)
    }
  }

  return { matches, missing, different }
}
```

### Pattern 5: 301 Redirect Configuration with Nuxt Route Rules

**What:** Configure 301 redirects in Nuxt using routeRules for SEO-preserving URL changes.

**When to use:** REQ-SEO-002 - URL Structure Preservation

**Example:**
```typescript
// In nuxt.config.ts
// Source: Context7 - /websites/nuxt
export default defineNuxtConfig({
  routeRules: {
    // Source URLs that changed to target URLs
    '/about-3': { redirect: { to: '/about', statusCode: 301 } },
    '/portfolio': { redirect: { to: '/projects', statusCode: 301 } },
    '/gallery/132': { redirect: { to: '/projects/132', statusCode: 301 } },
    '/gallery/bridges': { redirect: { to: '/projects/bridges', statusCode: 301 } },
    '/gallery/commercial': { redirect: { to: '/projects/commercial', statusCode: 301 } },
    '/gallery/misc': { redirect: { to: '/projects/misc', statusCode: 301 } },
    // Add any other URL changes discovered during audit
  },
})
```

### Anti-Patterns to Avoid

- **Manual HTML parsing with regex:** Always use Cheerio for HTML parsing. Regex is fragile for HTML.
- **Synchronous HTTP requests:** Always use async/await with Promise.all for concurrent link checking.
- **Assuming all links are absolute:** Use native URL constructor to resolve relative links.
- **Hardcoded URL mappings:** Generate redirect mappings from audit data, not manual entry.
- **Checking every link on every run:** Cache results and only check modified pages.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTML parsing | Custom regex/selectors | Cheerio | Handles malformed HTML, encoding issues, edge cases |
| URL resolution | Custom path joining | Native `new URL(relative, base)` | Handles all URL spec edge cases, query params, fragments |
| Text similarity | Custom character-by-character | `diff` package or simple algorithm | Well-tested, handles Unicode, edge cases |
| HTTP status checking | Custom fetch wrappers | `ofetch.raw()` | Built into Nuxt, handles errors, timeouts properly |
| Sitemap generation | Manual XML construction | `@nuxtjs/sitemap` | Already configured, handles lastmod, changefreq, priority |

**Key insight:** The web scraping and HTML parsing domain has many edge cases (malformed HTML, encoding, redirects). Custom implementations often break on real-world content.

## Common Pitfalls

### Pitfall 1: Relative URL Resolution Issues

**What goes wrong:** Links like `/about` and `about` and `../about` are handled differently.

**Why it happens:** Developers manually concatenate paths instead of using proper URL resolution.

**How to avoid:** Always use `new URL(relativeUrl, baseUrl)` for resolution.

**Warning signs:** Manual string concatenation of URLs, `.split('/').join('/')` patterns.

### Pitfall 2: Extracting Script/Nav Content as "Content"

**What goes wrong:** Content comparison fails because it includes navigation text, scripts, or footer content.

**Why it happens:** Not filtering out non-content elements before text extraction.

**How to avoid:** Remove `script`, `style`, `nav`, `footer`, `header` elements before extracting text content.

**Warning signs:** Similarity scores are artificially high (90%+) because both pages have the same nav.

### Pitfall 3: Missing Dynamic Routes in Sitemap

**What goes wrong:** Sitemap only includes static pages, missing dynamic project/service detail pages.

**Why it happens:** Sitemap is manually configured instead of fetching from API.

**How to avoid:** Use `defineSitemapEventHandler` or the existing `server/routes/sitemap.xml.ts` pattern to fetch dynamic routes.

**Warning signs:** Sitemap has fewer URLs than expected, detail pages missing.

### Pitfall 4: 404s on Redirected URLs

**What goes wrong:** Old URLs return 404 instead of 301 redirect, losing SEO value.

**Why it happens:** Redirects not configured or configured as 302 instead of 301.

**How to avoid:** Use Nuxt `routeRules` with `statusCode: 301` for permanent redirects.

**Warning signs:** Google Search Console shows 404 errors for previously valid URLs.

### Pitfall 5: Meta Tags Rendered Client-Side Only

**What goes wrong:** Meta tags not visible in HTML source (only added by JavaScript), missing from SEO crawlers.

**Why it happens:** Using `useHead` in components that only render on client, or SSR disabled.

**How to avoid:** Verify meta tags in "View Source" (not DevTools), ensure SSR is enabled for pages.

**Warning signs:** Open Graph debugger, Twitter Card validator can't find meta tags.

## Code Examples

Verified patterns from official sources:

### Fetch and Parse Source Page

```typescript
import { ofetch } from 'ofetch'
import * as cheerio from 'cheerio'

interface ParsedPage {
  url: string
  status: number
  html: string
  $?: cheerio.CheerioAPI
}

export async function fetchPage(url: string): Promise<ParsedPage> {
  const response = await ofetch.raw(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; VP-Audit/1.0)',
    },
  })

  return {
    url,
    status: response.status,
    html: await response.text(),
  }
}

export function parsePage(html: string) {
  const $ = cheerio.load(html)
  return { $, html }
}
```

### Generate Broken Link Report

```typescript
interface BrokenLinkReport {
  critical: Array<{ url: string; status: number; source: string }>
  warning: Array<{ url: string; status: number; source: string }>
  info: Array<{ url: string; external: boolean }>
}

export async function validateLinks(
  pages: string[]
): Promise<BrokenLinkReport> {
  const report: BrokenLinkReport = {
    critical: [],
    warning: [],
    info: [],
  }

  for (const pageUrl of pages) {
    const page = await fetchPage(pageUrl)
    const { $ } = parsePage(page.html)

    const links = $('a[href]').map((_, el) => ({
      href: $(el).attr('href')!,
      source: pageUrl,
    })).get()

    for (const link of links) {
      try {
        const absoluteUrl = new URL(link.href, pageUrl).href

        // Skip external links for info level
        if (!absoluteUrl.startsWith('https://www.vp-associates.com')) {
          report.info.push({ url: absoluteUrl, external: true })
          continue
        }

        const result = await checkLinkStatus(absoluteUrl)

        if (result.status === 404) {
          report.critical.push({ url: absoluteUrl, status: 404, source: link.source })
        } else if (result.status >= 300 && result.status < 400) {
          report.warning.push({ url: absoluteUrl, status: result.status, source: link.source })
        } else if (!result.ok) {
          report.critical.push({ url: absoluteUrl, status: result.status, source: link.source })
        }
      } catch (error) {
        report.critical.push({ url: link.href, status: 0, source: link.source })
      }
    }
  }

  return report
}
```

### Verify Sitemap Contains Dynamic Routes

```typescript
export async function verifySitemap(siteUrl: string): Promise<{
  urlCount: number
  staticUrls: string[]
  dynamicUrls: string[]
  missingUrls: string[]
}> {
  const sitemapUrl = `${siteUrl}/sitemap.xml`
  const response = await ofetch(sitemapUrl)

  const $ = cheerio.load(response, { xmlMode: true })
  const urls = $('url loc').map((_, el) => $(el).text()).get()

  const expectedStatic = ['/', '/about', '/services', '/projects', '/contact', '/careers']
  const dynamicPatterns = [/\/services\/.+/, /\/projects\/.+/]

  const staticUrls = urls.filter(u => expectedStatic.some(e => u.endsWith(e)))
  const dynamicUrls = urls.filter(u => dynamicPatterns.some(p => p.test(u)))
  const missingUrls = expectedStatic.filter(e => !urls.some(u => u.endsWith(e)))

  return { urlCount: urls.length, staticUrls, dynamicUrls, missingUrls }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `request` module | Native `fetch` / `ofetch` | Node.js 18+ | Built-in fetch, better performance |
| `url.resolve()` | `new URL(relative, base)` | ES6 | Standard Web API, better spec compliance |
| Custom sitemap XML | `@nuxtjs/sitemap` module | Nuxt 3 | Auto-generated, dynamic route support |
| cheerio@0.x | cheerio@1.x | 2021 | TypeScript support, ESM |

**Deprecated/outdated:**
- `request` npm package: Use native fetch or ofetch
- `cheerio` jQuery-like `$(selector)` without loading HTML first: Always use `cheerio.load(html)` first
- Manual sitemap.xml generation: Use @nuxtjs/sitemap with defineSitemapEventHandler

## Open Questions

1. **Dynamic route slug availability**
   - What we know: Current Nuxt app fetches projects/services from WP API
   - What's unclear: Whether all WordPress slugs are available in the current API
   - Recommendation: Query the WP API first to get the canonical list of expected slugs

2. **Content similarity threshold**
   - What we know: Requirements specify >10% difference should be flagged
   - What's unclear: Whether structural differences (HTML vs Vue components) should count as content differences
   - Recommendation: Compare rendered text content only, ignore HTML structure differences

3. **Careers page URLs**
   - What we know: There's a `/careers/[slug].vue` page but no dedicated careers listing endpoint
   - What's unclear: What careers detail pages exist on the source site
   - Recommendation: Crawl /careers/ on source site to discover all career posting URLs

## Sources

### Primary (HIGH confidence)
- /cheeriojs/cheerio - HTML parsing, link extraction with selector syntax
- /unjs/ofetch - HTTP requests with raw response access for status codes
- /nuxt-modules/sitemap - Dynamic sitemap generation with defineSitemapEventHandler
- /websites/nuxt - Route rules for 301 redirect configuration

### Secondary (MEDIUM confidence)
- [MDN Web APIs - URL Constructor](https://developer.mozilla.org/en-US/docs/Web/API/URL/URL) - URL normalization and resolution
- [Node.js URL Module Documentation](https://nodejs.org/api/url.html) - Native URL handling
- [How to Redirect in Nuxt (Every Single Way)](https://masteringnuxt.com/blog/how-to-redirect-in-nuxt-every-single-way) - Comprehensive redirect patterns
- [Web Scraping with Cheerio and Node.js 2026](https://www.capsolver.com/blog/The%20other%20captcha/web-scraping-with-cheerio) - Current Cheerio usage patterns
- [Best Web Scraping Tools in 2026](https://scrapfly.io/blog/posts/best-web-scraping-tools) - Cheerio as top tool for 2026

### Tertiary (LOW confidence)
- [text-similarity-node](https://github.com/piotrmaciejbednarski/text-similarity-node) - C++ implementation for large documents
- [node-htmldiff](https://www.jsdelivr.com/package/npm/node-htmldiff) - HTML-specific diff generation
- [Algorithm to find text similarity percentage](https://stackoverflow.com/questions/2570350/algorithm-to-find-the-percentage-of-how-much-two-texts-are-identical) - StackOverflow discussion on similarity algorithms

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via Context7 or official docs
- Architecture: HIGH - Patterns sourced from Context7 and official Nuxt documentation
- Pitfalls: MEDIUM - Some based on WebSearch 2026 sources, verified with official docs

**Research date:** 2026-02-04
**Valid until:** 2026-03-06 (30 days - stable domain)
