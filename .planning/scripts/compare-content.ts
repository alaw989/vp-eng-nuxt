import { ofetch } from 'ofetch'
import * as cheerio from 'cheerio'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

// Interfaces
interface PageEntry {
  url: string
  slug: string
  type: string
  title?: string
}

interface TextContent {
  headings: string[]
  paragraphs: string[]
  lists: string[]
  rawText: string
}

interface ContentComparison {
  page: string
  slug: string
  sourceUrl: string
  targetUrl: string
  sourceContent: TextContent
  targetContent: TextContent
  comparison: {
    headingMatch: number      // percentage 0-100
    paragraphCountDiff: number
    listCountDiff: number
    overallSimilarity: number  // percentage 0-100
    flagged: boolean           // true if similarity < threshold
  }
  differences: {
    missingHeadings: string[]
    extraHeadings: string[]
    missingParagraphs: number
    contentHashDiff: string    // summary of text difference
  }
}

interface ContentComparisonReport {
  generated: string
  source: string
  target: string
  threshold: number
  pagesCompared: number
  summary: {
    passed: number      // similarity >= threshold
    flagged: number     // similarity < threshold
    avgSimilarity: number
  }
  comparisons: ContentComparison[]
}

/**
 * Extract text content from HTML, excluding navigation, footer, header
 */
function extractTextContent(html: string): TextContent {
  if (!html) {
    return { headings: [], paragraphs: [], lists: [], rawText: '' }
  }

  const $ = cheerio.load(html)

  // Remove non-content elements
  $('script, style, nav, footer, header, .navigation, .footer, .header, .menu, .sidebar, aside').remove()

  // Extract headings (h1-h6)
  const headings: string[] = []
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const text = $(el).text().trim()
    if (text) headings.push(text)
  })

  // Extract paragraphs
  const paragraphs: string[] = []
  $('p').each((_, el) => {
    const text = $(el).text().trim()
    if (text) paragraphs.push(text)
  })

  // Extract list items
  const lists: string[] = []
  $('li').each((_, el) => {
    const text = $(el).text().trim()
    if (text) lists.push(text)
  })

  // Generate raw text from all content
  const rawText = $('body').text().replace(/\s+/g, ' ').trim()

  return { headings, paragraphs, lists, rawText }
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length
  const len2 = str2.length
  const matrix: number[][] = []

  // Initialize matrix
  for (let i = 0; i <= len2; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= len1; j++) {
    matrix[0][j] = j
  }

  // Fill matrix
  for (let i = 1; i <= len2; i++) {
    for (let j = 1; j <= len1; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,  // substitution
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j] + 1       // deletion
        )
      }
    }
  }

  return matrix[len2][len1]
}

/**
 * Calculate similarity percentage between two strings
 */
function calculateSimilarity(text1: string, text2: string): number {
  if (!text1 && !text2) return 100
  if (!text1 || !text2) return 0

  const maxLen = Math.max(text1.length, text2.length)
  if (maxLen === 0) return 100

  const distance = levenshteinDistance(text1, text2)
  return ((maxLen - distance) / maxLen) * 100
}

/**
 * Compare text content between source and target
 */
function compareTextContent(source: TextContent, target: TextContent, threshold: number = 90): ContentComparison['comparison'] {
  // Calculate heading match percentage
  const sourceHeadings = new Set(source.headings.map(h => h.toLowerCase()))
  const targetHeadings = new Set(target.headings.map(h => h.toLowerCase()))

  let matchingHeadings = 0
  for (const heading of sourceHeadings) {
    if (targetHeadings.has(heading)) matchingHeadings++
  }

  const headingMatch = source.headings.length > 0
    ? (matchingHeadings / source.headings.length) * 100
    : (target.headings.length === 0 ? 100 : 0)

  const paragraphCountDiff = source.paragraphs.length - target.paragraphs.length
  const listCountDiff = source.lists.length - target.lists.length

  const overallSimilarity = calculateSimilarity(source.rawText, target.rawText)
  const flagged = overallSimilarity < threshold

  return {
    headingMatch,
    paragraphCountDiff,
    listCountDiff,
    overallSimilarity,
    flagged
  }
}

/**
 * Identify specific differences between source and target content
 */
function identifyDifferences(source: TextContent, target: TextContent): ContentComparison['differences'] {
  const sourceHeadings = source.headings.map(h => h.toLowerCase())
  const targetHeadings = target.headings.map(h => h.toLowerCase())

  const missingHeadings = source.headings.filter(h => !targetHeadings.includes(h.toLowerCase()))
  const extraHeadings = target.headings.filter(h => !sourceHeadings.includes(h.toLowerCase()))

  const missingParagraphs = Math.max(0, source.paragraphs.length - target.paragraphs.length)

  // Generate a simple hash/description of content difference
  const contentLengthDiff = source.rawText.length - target.rawText.length
  const contentHashDiff = contentLengthDiff > 0
    ? `Source has ${contentLengthDiff} more characters`
    : contentLengthDiff < 0
      ? `Target has ${Math.abs(contentLengthDiff)} more characters`
      : 'Same content length'

  return {
    missingHeadings,
    extraHeadings,
    missingParagraphs,
    contentHashDiff
  }
}

/**
 * Fetch page HTML content
 */
async function fetchPageContent(url: string): Promise<string> {
  try {
    const html = await ofetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VPEngContentAudit/1.0)'
      },
      timeout: 10000,
      ignoreResponseError: true
    })
    return html
  } catch (error) {
    console.warn(`  Failed to fetch ${url}:`, error instanceof Error ? error.message : String(error))
    return ''
  }
}

/**
 * Map source WordPress URL to target Nuxt URL
 */
function mapSourceToTarget(sourceUrl: string, sourceSlug: string): string {
  // Known URL mappings
  const mappings: Record<string, string> = {
    'https://www.vp-associates.com/about-3/': '/about',
    'https://www.vp-associates.com/portfolio/': '/projects',
    'https://www.vp-associates.com/gallery/132/': '/projects/132',
    'https://www.vp-associates.com/gallery/bridges/': '/projects/bridges',
    'https://www.vp-associates.com/gallery/commercial/': '/projects/commercial',
    'https://www.vp-associates.com/gallery/misc/': '/projects/misc',
    'https://www.vp-associates.com/hello-world/': '/hello-world',
    'https://www.vp-associates.com/': '/'
  }

  if (mappings[sourceUrl]) {
    return mappings[sourceUrl]
  }

  // Default mapping based on slug
  if (sourceSlug === 'home') return '/'
  if (sourceSlug === 'about-3') return '/about'
  if (sourceSlug === 'portfolio') return '/projects'
  if (sourceSlug === 'services') return '/services'
  if (sourceSlug === 'careers') return '/careers'
  if (sourceSlug === 'contact') return '/contact'

  // For gallery items
  if (sourceUrl.includes('/gallery/')) {
    return `/projects/${sourceSlug}/`
  }

  // Default fallback
  return `/${sourceSlug}/`
}

/**
 * Compare content across multiple pages
 */
async function comparePages(
  pages: PageEntry[],
  sourceBaseUrl: string,
  targetBaseUrl: string,
  threshold: number
): Promise<ContentComparisonReport> {
  const comparisons: ContentComparison[] = []
  let passed = 0
  let flagged = 0
  let totalSimilarity = 0

  for (const page of pages) {
    console.log(`\nComparing: ${page.slug}`)

    // Fetch source content
    console.log(`  Fetching source: ${page.url}`)
    const sourceHtml = await fetchPageContent(page.url)

    // Fetch target content
    const targetPath = mapSourceToTarget(page.url, page.slug)
    const targetUrl = targetBaseUrl + targetPath.replace(/^\//, '')
    console.log(`  Fetching target: ${targetUrl}`)
    const targetHtml = await fetchPageContent(targetUrl)

    // Extract content
    const sourceContent = extractTextContent(sourceHtml)
    const targetContent = extractTextContent(targetHtml)

    // Check if both pages have content
    if (!sourceHtml) {
      console.warn(`  Warning: Source page returned empty content`)
    }
    if (!targetHtml) {
      console.warn(`  Warning: Target page returned empty content - may not exist`)
    }

    // Compare
    const comparison = compareTextContent(sourceContent, targetContent, threshold)
    const differences = identifyDifferences(sourceContent, targetContent)

    // Track stats
    if (comparison.flagged) {
      flagged++
    } else {
      passed++
    }
    totalSimilarity += comparison.overallSimilarity

    console.log(`  Similarity: ${comparison.overallSimilarity.toFixed(1)}% ${comparison.flagged ? '(FLAGGED)' : '(OK)'}`)

    comparisons.push({
      page: page.title || page.slug,
      slug: page.slug,
      sourceUrl: page.url,
      targetUrl,
      sourceContent,
      targetContent,
      comparison,
      differences
    })
  }

  const avgSimilarity = comparisons.length > 0 ? totalSimilarity / comparisons.length : 0

  return {
    generated: new Date().toISOString(),
    source: sourceBaseUrl,
    target: targetBaseUrl,
    threshold,
    pagesCompared: comparisons.length,
    summary: {
      passed,
      flagged,
      avgSimilarity
    },
    comparisons
  }
}

/**
 * Main execution
 */
async function main() {
  const SOURCE_URL = 'https://www.vp-associates.com'
  const TARGET_URL = process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const THRESHOLD = 90  // Flag if similarity < 90%

  // Load pages from audit
  const pagesPath = join(process.cwd(), '.planning', 'audit', 'pages.json')
  const pages: PageEntry[] = JSON.parse(readFileSync(pagesPath, 'utf-8'))

  // Filter to only content pages (skip author/category archives)
  const contentPages = pages.filter(p => !['uncategorized', 'root'].includes(p.slug))

  console.log('=== Content Comparison Tool ===')
  console.log(`Comparing content for ${contentPages.length} pages...`)
  console.log(`Source: ${SOURCE_URL}`)
  console.log(`Target: ${TARGET_URL}`)
  console.log(`Threshold: ${THRESHOLD}%\n`)

  // Ensure audit directory exists
  const auditDir = join(process.cwd(), '.planning', 'audit')
  try {
    mkdirSync(auditDir, { recursive: true })
  } catch {
    // Directory already exists
  }

  // Run comparison
  const report = await comparePages(contentPages, SOURCE_URL, TARGET_URL, THRESHOLD)

  // Write report
  const reportPath = join(process.cwd(), '.planning', 'audit', 'content-comparison.json')
  writeFileSync(reportPath, JSON.stringify(report, null, 2))

  // Log summary
  console.log('\n=== Content Comparison Summary ===')
  console.log(`Pages compared: ${report.pagesCompared}`)
  console.log(`Passed (>=${THRESHOLD}%): ${report.summary.passed}`)
  console.log(`Flagged (<${THRESHOLD}%): ${report.summary.flagged}`)
  console.log(`Average similarity: ${report.summary.avgSimilarity.toFixed(1)}%`)

  if (report.summary.flagged > 0) {
    console.log(`\n! ${report.summary.flagged} pages flagged for content differences!`)
    console.log('\nFlagged pages:')
    report.comparisons
      .filter(c => c.comparison.flagged)
      .forEach(c => {
        console.log(`  - ${c.page}: ${c.comparison.overallSimilarity.toFixed(1)}% similarity`)
        if (c.differences.missingHeadings.length > 0) {
          console.log(`    Missing headings: ${c.differences.missingHeadings.join(', ')}`)
        }
      })
  }

  console.log(`\nReport saved to: ${reportPath}`)
}

main().catch(console.error)
