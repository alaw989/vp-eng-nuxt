/**
 * Link Validation Script
 *
 * Crawls all pages from the source WordPress site, extracts internal links,
 * checks their HTTP status codes, and generates a categorized broken link report.
 *
 * Usage: npx tsx .planning/scripts/validate-links.ts
 */

import { ofetch } from 'ofetch'
import * as cheerio from 'cheerio'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

// =============================================================================
// Interfaces
// =============================================================================

interface PageEntry {
  url: string
  slug: string
  type: string
  title?: string
  lastmod?: string
  source?: string
}

interface LinkCheckResult {
  url: string
  status: number
  statusText: string
  ok: boolean
  sourcePage: string
  linkText?: string
  severity: 'critical' | 'warning' | 'info' | 'success'
  error?: string
}

interface BrokenLinkReport {
  generated: string
  source: string
  pagesChecked: number
  linksChecked: number
  summary: {
    critical: number      // 404s, 500s
    warning: number       // 301, 302 redirects
    info: number          // external links, other
    success: number       // 200 OK
  }
  links: LinkCheckResult[]
}

// =============================================================================
// Constants
// =============================================================================

const SOURCE_DOMAIN = 'www.vp-associates.com'
const REQUEST_TIMEOUT = 10000 // 10 seconds
const CONCURRENT_LIMIT = 5 // Max concurrent requests

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Check if a URL is internal to the source domain
 */
function isInternalLink(urlStr: string, baseUrl: URL): boolean {
  try {
    // Skip non-http links (mailto:, tel:, javascript:, etc.)
    if (!urlStr.startsWith('http')) {
      return false
    }

    const url = new URL(urlStr)
    return url.hostname === baseUrl.hostname
  } catch {
    return false
  }
}

/**
 * Extract all links from HTML content
 */
function extractLinks(html: string, sourceUrl: string): Array<{href: string, text: string}> {
  const links: Array<{href: string, text: string}> = []

  try {
    const $ = cheerio.load(html)

    $('a[href]').each((_, element) => {
      const $el = $(element)
      const href = $el.attr('href')
      const text = $el.text().trim().slice(0, 100) // Limit text length

      if (href) {
        links.push({ href, text })
      }
    })
  } catch (error) {
    console.error(`Error parsing HTML from ${sourceUrl}:`, error)
  }

  return links
}

/**
 * Categorize HTTP status code into severity levels
 */
function categorizeStatus(status: number): LinkCheckResult['severity'] {
  if (status === 200) {
    return 'success'
  }
  if (status === 301 || status === 302 || status === 307 || status === 308) {
    return 'warning' // Redirects should be reviewed
  }
  if (status === 404 || status === 410 || status === 500 || status === 502 || status === 503 || status === 504) {
    return 'critical' // Broken links
  }
  return 'info' // Other status codes
}

/**
 * Resolve a potentially relative URL against a base URL
 */
function resolveUrl(href: string, baseUrl: URL): string {
  try {
    // If already absolute, return as-is
    if (href.startsWith('http://') || href.startsWith('https://')) {
      return href
    }

    // Handle protocol-relative URLs
    if (href.startsWith('//')) {
      return baseUrl.protocol + href
    }

    // Resolve relative URLs
    return new URL(href, baseUrl).href
  } catch {
    return href
  }
}

/**
 * Normalize URL by removing fragments and trailing slashes (for comparison)
 */
function normalizeUrl(url: string): string {
  try {
    const u = new URL(url)
    u.hash = '' // Remove fragment
    return u.toString()
  } catch {
    return url
  }
}

// =============================================================================
// Link Checking
// =============================================================================

/**
 * Check the HTTP status of a single link
 */
async function checkLinkStatus(url: string, sourceUrl: string, linkText?: string): Promise<LinkCheckResult> {
  const result: LinkCheckResult = {
    url,
    status: 0,
    statusText: 'Unknown',
    ok: false,
    sourcePage: sourceUrl,
    linkText,
    severity: 'info'
  }

  try {
    const response = await ofetch.raw(url, {
      method: 'HEAD',
      timeout: REQUEST_TIMEOUT,
      ignoreResponseError: true, // Don't throw on 404s
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VP-Associates-Link-Checker/1.0)'
      }
    })

    result.status = response.status
    result.statusText = response.statusText || 'OK'
    result.ok = response.status >= 200 && response.status < 400
    result.severity = categorizeStatus(response.status)

  } catch (error: any) {
    // Handle network errors, timeouts, etc.
    result.status = 0
    result.statusText = 'Network Error'
    result.severity = 'critical'
    result.error = error?.message || 'Unknown network error'
  }

  return result
}

/**
 * Validate a single page and extract/check its internal links
 */
async function validatePage(page: PageEntry, seenLinks: Set<string>): Promise<LinkCheckResult[]> {
  const results: LinkCheckResult[] = []

  try {
    // Fetch the page HTML
    const html = await ofetch(page.url, {
      timeout: REQUEST_TIMEOUT,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VP-Associates-Link-Checker/1.0)'
      }
    })

    // Extract all links
    const links = extractLinks(html, page.url)

    // Get base URL for resolving relative links
    const baseUrl = new URL(page.url)

    // Track unique normalized URLs to avoid duplicate checks
    const pageUrls = new Map<string, {href: string, text: string}>()

    for (const link of links) {
      const absoluteUrl = resolveUrl(link.href, baseUrl)
      const normalizedUrl = normalizeUrl(absoluteUrl)

      if (!pageUrls.has(normalizedUrl)) {
        pageUrls.set(normalizedUrl, { href: absoluteUrl, text: link.text })
      }
    }

    // Check each unique link
    for (const [normalized, {href, text}] of pageUrls) {
      // Skip if we've already checked this URL globally
      if (seenLinks.has(normalized)) {
        continue
      }

      seenLinks.add(normalized)

      const isInternal = isInternalLink(href, baseUrl)

      // Only check internal links, but document external separately
      if (isInternal) {
        const result = await checkLinkStatus(href, page.url, text)
        results.push(result)
      } else {
        // Document external links as info
        results.push({
          url: href,
          status: 0,
          statusText: 'External',
          ok: true,
          sourcePage: page.url,
          linkText: text,
          severity: 'info'
        })
      }
    }

  } catch (error: any) {
    // Couldn't fetch the page at all
    console.error(`Failed to fetch page ${page.url}:`, error?.message || error)
    results.push({
      url: page.url,
      status: 0,
      statusText: 'Page Fetch Failed',
      ok: false,
      sourcePage: 'N/A',
      severity: 'critical',
      error: error?.message || 'Unknown error'
    })
  }

  return results
}

/**
 * Process pages in batches to limit concurrency
 */
async function processInBatches<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number
): Promise<R[]> {
  const results: R[] = []

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(processor))
    results.push(...batchResults)

    // Log progress
    const processed = Math.min(i + batchSize, items.length)
    console.log(`  Progress: ${processed}/${items.length} pages processed...`)
  }

  return results
}

// =============================================================================
// Main Validation Function
// =============================================================================

/**
 * Main validation function - processes all pages and generates report
 */
async function validatePages(pages: PageEntry[]): Promise<BrokenLinkReport> {
  console.log(`Starting link validation for ${pages.length} pages...`)
  console.log(`Source domain: ${SOURCE_DOMAIN}\n`)

  const allResults: LinkCheckResult[] = []
  const seenLinks = new Set<string>()
  let pagesChecked = 0

  // Process pages with concurrency limit
  for (const page of pages) {
    console.log(`Checking: ${page.url}`)
    const results = await validatePage(page, seenLinks)
    allResults.push(...results)
    pagesChecked++
  }

  // Calculate summary statistics
  const summary = {
    critical: 0,
    warning: 0,
    info: 0,
    success: 0
  }

  for (const result of allResults) {
    summary[result.severity]++
  }

  return {
    generated: new Date().toISOString(),
    source: SOURCE_DOMAIN,
    pagesChecked,
    linksChecked: allResults.length,
    summary,
    links: allResults
  }
}

// =============================================================================
// Main Execution
// =============================================================================

async function main() {
  const startTime = Date.now()

  // Ensure audit directory exists
  const auditDir = join(process.cwd(), '.planning', 'audit')
  try {
    mkdirSync(auditDir, { recursive: true })
  } catch {
    // Directory might already exist
  }

  // Load pages from audit
  const pagesPath = join(auditDir, 'pages.json')
  let pages: PageEntry[] = []

  try {
    const content = readFileSync(pagesPath, 'utf-8')
    pages = JSON.parse(content)
  } catch (error) {
    console.error(`Failed to load pages from ${pagesPath}:`, error)
    process.exit(1)
  }

  console.log(`Loaded ${pages.length} pages from audit\n`)

  // Run validation
  const report = await validatePages(pages)

  // Write report
  const reportPath = join(auditDir, 'broken-links.json')
  writeFileSync(reportPath, JSON.stringify(report, null, 2))

  const duration = ((Date.now() - startTime) / 1000).toFixed(2)

  // Log summary
  console.log('\n=== Link Validation Summary ===')
  console.log(`Source: ${report.source}`)
  console.log(`Pages checked: ${report.pagesChecked}`)
  console.log(`Links checked: ${report.linksChecked}`)
  console.log(`Duration: ${duration}s`)
  console.log(`\nResults:`)
  console.log(`  Success (200): ${report.summary.success}`)
  console.log(`  Warnings (3xx): ${report.summary.warning}`)
  console.log(`  Critical (4xx/5xx): ${report.summary.critical}`)
  console.log(`  External: ${report.summary.info}`)

  if (report.summary.critical > 0) {
    console.log(`\n⚠️  Found ${report.summary.critical} broken links!`)
    console.log('\nCritical links:')
    const criticalLinks = report.links.filter(l => l.severity === 'critical')
    for (const link of criticalLinks.slice(0, 10)) {
      console.log(`  - ${link.url} (${link.status} ${link.statusText})`)
      console.log(`    from: ${link.sourcePage}`)
    }
    if (criticalLinks.length > 10) {
      console.log(`  ... and ${criticalLinks.length - 10} more`)
    }
  }

  if (report.summary.warning > 0) {
    console.log(`\n⚠️  Found ${report.summary.warning} redirect(s) that may need review`)
  }

  console.log(`\nReport saved to: ${reportPath}`)
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`.replace(/\\/g, '/')) {
  main().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

export { validatePages, checkLinkStatus, isInternalLink, extractLinks, categorizeStatus }
