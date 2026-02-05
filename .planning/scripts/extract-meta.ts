// Meta tag extraction and comparison script
// Compares SEO meta tags between WordPress source and Nuxt target
// Validates: title, description, keywords, canonical, Open Graph, Twitter Cards

import { ofetch } from 'ofetch'
import * as cheerio from 'cheerio'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

// ============================================================================
// Interfaces
// ============================================================================

interface PageEntry {
  url: string
  slug: string
  type: string
  title?: string
}

interface MetaTags {
  title?: string
  description?: string
  keywords?: string
  canonical?: string
  robots?: string
  og: Record<string, string>
  twitter: Record<string, string>
  other: Record<string, string>
}

interface MetaComparison {
  page: string
  slug: string
  sourceUrl: string
  targetUrl: string
  sourceMeta: MetaTags
  targetMeta: MetaTags
  comparison: {
    matches: string[]      // Tags that match
    missing: string[]      // Tags in source but not target
    different: string[]    // Tags with different values
    extra: string[]        // Tags in target but not source
  }
  score: {
    matchRate: number      // Percentage of matching tags
    criticalMatch: boolean // All critical tags present
  }
}

interface SeoComparisonReport {
  generated: string
  source: string
  target: string
  pagesCompared: number
  summary: {
    perfectMatches: number
    withMissing: number
    withDifferences: number
    withExtra: number
    avgMatchRate: number
    criticalPagesPassing: number
    criticalPagesFailing: number
  }
  comparisons: MetaComparison[]
}

// Critical tags for social sharing and SEO
const CRITICAL_TAGS = [
  'title',
  'description',
  'og:title',
  'og:description',
  'og:image',
  'og:url',
  'twitter:card',
  'twitter:title',
]

// ============================================================================
// Meta Tag Extraction
// ============================================================================

/**
 * Extract all SEO-related meta tags from HTML
 */
function extractMetaTags(html: string): MetaTags {
  const $ = cheerio.load(html)

  const meta: MetaTags = {
    og: {},
    twitter: {},
    other: {},
  }

  // Extract page title
  const titleEl = $('title').first()
  if (titleEl.length) {
    meta.title = titleEl.text().trim()
  }

  // Extract meta tags by name and property
  $('meta').each((_, el) => {
    const name = $(el).attr('name')
    const property = $(el).attr('property')
    const content = $(el).attr('content')

    if (!content) return

    if (name === 'description') {
      meta.description = content
    } else if (name === 'keywords') {
      meta.keywords = content
    } else if (name === 'robots') {
      meta.robots = content
    } else if (name?.startsWith('twitter:')) {
      meta.twitter[name.substring(8)] = content // Remove 'twitter:' prefix
    } else if (name === 'author' || name === 'viewport') {
      meta.other[name] = content
    }

    if (property?.startsWith('og:')) {
      meta.og[property.substring(3)] = content // Remove 'og:' prefix
    }
  })

  // Extract canonical URL
  $('link[rel="canonical"]').each((_, el) => {
    const href = $(el).attr('href')
    if (href) {
      meta.canonical = href
    }
  })

  return meta
}

// ============================================================================
// Meta Tag Comparison
// ============================================================================

/**
 * Compare meta tags between source and target
 */
function compareMetaTags(source: MetaTags, target: MetaTags): MetaComparison['comparison'] {
  const comparison: MetaComparison['comparison'] = {
    matches: [],
    missing: [],
    different: [],
    extra: [],
  }

  // Helper to normalize tag values for comparison
  const normalize = (value: string | undefined): string => {
    if (!value) return ''
    return value.trim().replace(/\s+/g, ' ').toLowerCase()
  }

  // Compare basic meta tags
  const basicTags: Array<keyof MetaTags> = ['title', 'description', 'keywords', 'canonical', 'robots']

  for (const tag of basicTags) {
    const sourceValue = source[tag]
    const targetValue = target[tag]
    const tagName = String(tag)

    if (sourceValue === undefined) {
      // Not in source, skip
      continue
    }

    if (targetValue === undefined) {
      comparison.missing.push(tagName)
    } else if (normalize(sourceValue) === normalize(targetValue)) {
      comparison.matches.push(tagName)
    } else {
      comparison.different.push(tagName)
    }
  }

  // Compare Open Graph tags
  for (const [key, value] of Object.entries(source.og)) {
    const targetValue = target.og[key]
    const tagName = `og:${key}`

    if (targetValue === undefined) {
      comparison.missing.push(tagName)
    } else if (normalize(value) === normalize(targetValue)) {
      comparison.matches.push(tagName)
    } else {
      comparison.different.push(tagName)
    }
  }

  // Compare Twitter Card tags
  for (const [key, value] of Object.entries(source.twitter)) {
    const targetValue = target.twitter[key]
    const tagName = `twitter:${key}`

    if (targetValue === undefined) {
      comparison.missing.push(tagName)
    } else if (normalize(value) === normalize(targetValue)) {
      comparison.matches.push(tagName)
    } else {
      comparison.different.push(tagName)
    }
  }

  // Find extra tags in target (not in source)
  for (const key of Object.keys(target.og)) {
    if (!source.og[key]) {
      comparison.extra.push(`og:${key}`)
    }
  }

  for (const key of Object.keys(target.twitter)) {
    if (!source.twitter[key]) {
      comparison.extra.push(`twitter:${key}`)
    }
  }

  return comparison
}

/**
 * Calculate match score
 */
function calculateScore(source: MetaTags, comparison: MetaComparison['comparison']): MetaComparison['score'] {
  // Count total source tags (basic + og + twitter)
  let totalSourceTags = 0
  if (source.title) totalSourceTags++
  if (source.description) totalSourceTags++
  if (source.keywords) totalSourceTags++
  if (source.canonical) totalSourceTags++
  if (source.robots) totalSourceTags++
  totalSourceTags += Object.keys(source.og).length
  totalSourceTags += Object.keys(source.twitter).length

  const matchingTags = comparison.matches.length
  const matchRate = totalSourceTags > 0 ? (matchingTags / totalSourceTags) * 100 : 100

  // Check if all critical tags are present (not missing)
  const criticalMatch = !comparison.missing.some(tag => CRITICAL_TAGS.includes(tag))

  return {
    matchRate: Math.round(matchRate * 10) / 10, // Round to 1 decimal
    criticalMatch,
  }
}

// ============================================================================
// URL Mapping
// ============================================================================

/**
 * Map WordPress URLs to Nuxt URLs
 * Reuses URL mapping from content comparison script
 */
function mapSourceToTarget(sourceUrl: string, sourceSlug: string): string {
  // Remove trailing slash from source URL
  const cleanUrl = sourceUrl.replace(/\/$/, '')

  // Mapping based on the site structure
  const mappings: Record<string, string> = {
    'https://www.vp-associates.com/': '/',
    'https://www.vp-associates.com/hello-world/': '/hello-world',
    'https://www.vp-associates.com/home': '/',
    'https://www.vp-associates.com/services/': '/services',
    'https://www.vp-associates.com/portfolio/': '/projects',
    'https://www.vp-associates.com/projects/': '/projects',
    'https://www.vp-associates.com/careers/': '/careers',
    'https://www.vp-associates.com/contact/': '/contact',
    'https://www.vp-associates.com/about-3/': '/about',
    'https://www.vp-associates.com/about/': '/about',
    'https://www.vp-associates.com/gallery/132/': '/projects/132',
    'https://www.vp-associates.com/gallery/bridges/': '/projects/bridges',
    'https://www.vp-associates.com/gallery/commercial/': '/projects/commercial',
    'https://www.vp-associates.com/gallery/misc/': '/projects/misc',
  }

  // Check exact match first
  if (mappings[cleanUrl]) {
    return mappings[cleanUrl]
  }

  // Try slug-based mapping
  const slugMappings: Record<string, string> = {
    'hello-world': '/hello-world',
    'home': '/',
    'services': '/services',
    'portfolio': '/projects',
    'careers': '/careers',
    'contact': '/contact',
    'about-3': '/about',
    'about': '/about',
    '132': '/projects/132',
    'bridges': '/projects/bridges',
    'commercial': '/projects/commercial',
    'misc': '/projects/misc',
    'uncategorized': '/', // Uncategorized maps to home
    'root': '/', // Author page maps to home
  }

  if (slugMappings[sourceSlug]) {
    return slugMappings[sourceSlug]
  }

  // Default: return URL path only
  try {
    const url = new URL(cleanUrl)
    return url.pathname
  } catch {
    return '/'
  }
}

// ============================================================================
// Page Fetching
// ============================================================================

/**
 * Fetch page HTML with error handling
 */
async function fetchPageHtml(url: string): Promise<{ html: string; error?: string }> {
  try {
    const html = await ofetch(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEO-Auditor/1.0)',
      },
    })
    return { html }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return { html: '', error: errorMessage }
  }
}

// ============================================================================
// Comparison Execution
// ============================================================================

/**
 * Compare meta tags for all pages
 */
async function comparePagesMeta(
  pages: PageEntry[],
  sourceUrl: string,
  targetUrl: string
): Promise<SeoComparisonReport> {
  const comparisons: MetaComparison[] = []
  let errorCount = 0

  console.log(`\nComparing ${pages.length} pages...\n`)

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]
    const targetPath = mapSourceToTarget(page.url, page.slug)
    const fullTargetUrl = targetUrl + targetPath

    process.stdout.write(`\r[${i + 1}/${pages.length}] ${page.slug}...`)

    // Fetch source page
    const { html: sourceHtml, error: sourceError } = await fetchPageHtml(page.url)
    if (sourceError) {
      console.log(`\n  [ERROR] Source fetch failed: ${sourceError}`)
      errorCount++
      continue
    }

    // Fetch target page
    const { html: targetHtml, error: targetError } = await fetchPageHtml(fullTargetUrl)
    if (targetError) {
      console.log(`\n  [ERROR] Target fetch failed: ${targetError}`)
      errorCount++
      continue
    }

    // Extract meta tags
    const sourceMeta = extractMetaTags(sourceHtml)
    const targetMeta = extractMetaTags(targetHtml)

    // Compare tags
    const comparison = compareMetaTags(sourceMeta, targetMeta)
    const score = calculateScore(sourceMeta, comparison)

    comparisons.push({
      page: page.title || page.slug,
      slug: page.slug,
      sourceUrl: page.url,
      targetUrl: fullTargetUrl,
      sourceMeta,
      targetMeta,
      comparison,
      score,
    })
  }

  console.log(`\r${pages.length}/${pages.length} pages compared.`)

  // Calculate summary statistics
  const perfectMatches = comparisons.filter(c => c.comparison.missing.length === 0 && c.comparison.different.length === 0).length
  const withMissing = comparisons.filter(c => c.comparison.missing.length > 0).length
  const withDifferences = comparisons.filter(c => c.comparison.different.length > 0).length
  const withExtra = comparisons.filter(c => c.comparison.extra.length > 0).length
  const avgMatchRate = comparisons.reduce((sum, c) => sum + c.score.matchRate, 0) / comparisons.length
  const criticalPagesPassing = comparisons.filter(c => c.score.criticalMatch).length
  const criticalPagesFailing = comparisons.filter(c => !c.score.criticalMatch).length

  return {
    generated: new Date().toISOString(),
    source: sourceUrl,
    target: targetUrl,
    pagesCompared: comparisons.length,
    summary: {
      perfectMatches,
      withMissing,
      withDifferences,
      withExtra,
      avgMatchRate: Math.round(avgMatchRate * 10) / 10,
      criticalPagesPassing,
      criticalPagesFailing,
    },
    comparisons,
  }
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  const SOURCE_URL = 'https://www.vp-associates.com'
  const TARGET_URL = 'http://localhost:3000'

  // Ensure audit directory exists
  const auditDir = join(process.cwd(), '.planning', 'audit')
  if (!existsSync(auditDir)) {
    mkdirSync(auditDir, { recursive: true })
  }

  // Load pages from audit
  const pagesPath = join(process.cwd(), '.planning', 'audit', 'pages.json')
  const pages: PageEntry[] = JSON.parse(readFileSync(pagesPath, 'utf-8'))

  console.log('=== SEO Meta Tag Comparison ===')
  console.log(`Source: ${SOURCE_URL}`)
  console.log(`Target: ${TARGET_URL}`)
  console.log(`Pages to compare: ${pages.length}`)

  // Run comparison
  const report = await comparePagesMeta(pages, SOURCE_URL, TARGET_URL)

  // Write report
  const reportPath = join(process.cwd(), '.planning', 'audit', 'seo-comparison.json')
  writeFileSync(reportPath, JSON.stringify(report, null, 2))

  // Log summary
  console.log('\n=== SEO Meta Tag Comparison Summary ===')
  console.log(`Pages compared: ${report.pagesCompared}`)
  console.log(`\nResults:`)
  console.log(`  Perfect matches: ${report.summary.perfectMatches}`)
  console.log(`  With missing tags: ${report.summary.withMissing}`)
  console.log(`  With different tags: ${report.summary.withDifferences}`)
  console.log(`  With extra tags: ${report.summary.withExtra}`)
  console.log(`  Average match rate: ${report.summary.avgMatchRate.toFixed(1)}%`)
  console.log(`  Critical tags passing: ${report.summary.criticalPagesPassing}/${report.pagesCompared}`)

  if (report.summary.withMissing > 0) {
    console.log(`\n⚠️  ${report.summary.withMissing} pages have missing meta tags!`)
    console.log('\nPages with missing tags:')
    report.comparisons
      .filter(c => c.comparison.missing.length > 0)
      .forEach(c => {
        console.log(`  - ${c.page}: ${c.comparison.missing.join(', ')}`)
      })
  }

  if (report.summary.criticalPagesFailing > 0) {
    console.log(`\n⚠️  ${report.summary.criticalPagesFailing} pages are missing critical tags!`)
    console.log('\nPages missing critical tags:')
    report.comparisons
      .filter(c => !c.score.criticalMatch)
      .forEach(c => {
        const criticalMissing = c.comparison.missing.filter(t => CRITICAL_TAGS.includes(t))
        console.log(`  - ${c.page}: ${criticalMissing.join(', ')}`)
      })
  }

  console.log(`\nReport saved to: ${reportPath}`)
}

main().catch(console.error)
