/**
 * URL Inventory Generator
 *
 * Generates a comprehensive inventory of URL mappings from WordPress source to Nuxt target.
 * Creates CSV and JSON reports for SEO redirect planning.
 *
 * Usage: npx tsx .planning/scripts/generate-url-inventory.ts
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

// ============================================================================
// Interfaces
// ============================================================================

interface PageEntry {
  url: string
  slug: string
  type: string
  title?: string
  lastmod?: string
  source?: string
}

interface UrlMapping {
  sourceUrl: string
  targetUrl: string
  status: 'unchanged' | 'changed' | 'removed'
  redirectType: 'none' | '301' | '410'
  notes: string
}

interface UrlInventory {
  generated: string
  totalUrls: number
  unchanged: number
  changed: number
  removed: number
  mappings: UrlMapping[]
}

interface RedirectRule {
  from: string
  to: string
  statusCode: 301
}

// ============================================================================
// URL Mapping Configuration
// ============================================================================

/**
 * WordPress -> Nuxt URL mappings
 * Source URLs from WordPress that map to different URLs in Nuxt
 */
const URL_MAPPINGS: Record<string, string> = {
  // Page name changes
  '/about-3/': '/about',
  '/about-3': '/about',

  // Section rename: portfolio -> projects
  '/portfolio/': '/projects',
  '/portfolio': '/projects',

  // Gallery structure changes: /gallery/{slug} -> /projects/{slug}
  '/gallery/132/': '/projects/132',
  '/gallery/132': '/projects/132',
  '/gallery/bridges/': '/projects/bridges',
  '/gallery/bridges': '/projects/bridges',
  '/gallery/commercial/': '/projects/commercial',
  '/gallery/commercial': '/projects/commercial',
  '/gallery/misc/': '/projects/misc',
  '/gallery/misc': '/projects/misc',
}

/**
 * URLs that should return 410 Gone (permanently removed)
 * These are WordPress system pages that are not part of the new site
 */
const REMOVED_URLS: string[] = [
  '/hello-world/',      // Default WordPress post
  '/hello-world',       // Without trailing slash
  '/category/uncategorized/', // WordPress category page
  '/category/uncategorized',  // Without trailing slash
  '/author/root/',      // WordPress author page
  '/author/root',       // Without trailing slash
]

/**
 * Nuxt site routes (for verification)
 * URLs that exist in the new Nuxt site
 */
const NEXT_ROUTES = new Set([
  '/',
  '/about',
  '/careers',
  '/contact',
  '/offline',
  '/privacy',
  '/projects',
  '/search',
  '/services',
  '/terms',
  '/accessibility',
  // Dynamic routes (slugs will be added during processing)
])

// Add project detail routes (from gallery pages in WordPress)
const PROJECT_SLUGS = ['132', 'bridges', 'commercial', 'misc']
PROJECT_SLUGS.forEach(slug => NEXT_ROUTES.add(`/projects/${slug}`))

// Add service detail routes (from services API)
const SERVICE_SLUGS = [
  'structural-engineering-services',
  'structural-design-services',
  'structural-inspection-services',
  'structural-retrofit-services'
]
SERVICE_SLUGS.forEach(slug => NEXT_ROUTES.add(`/services/${slug}`))

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Normalize a URL to a path-only format
 * - Removes domain and protocol
 * - Standardizes trailing slashes
 * - Returns paths starting with /
 */
function normalizeUrl(url: string): string {
  // Remove protocol and domain
  let path = url.replace(/^https?:\/\/[^\/]+/, '')

  // Ensure path starts with /
  if (!path.startsWith('/')) {
    path = '/' + path
  }

  return path
}

/**
 * Determine the target URL for a source URL
 * Returns a UrlMapping with status and redirect type
 */
function determineTarget(sourceUrl: string): UrlMapping {
  const normalized = normalizeUrl(sourceUrl)

  // Check if URL is marked as removed
  if (REMOVED_URLS.includes(normalized) || REMOVED_URLS.includes(normalized + '/')) {
    return {
      sourceUrl: normalized,
      targetUrl: '',
      status: 'removed',
      redirectType: '410',
      notes: 'Permanently removed - WordPress system page not migrated'
    }
  }

  // Check if URL has a mapping
  if (URL_MAPPINGS[normalized]) {
    return {
      sourceUrl: normalized,
      targetUrl: URL_MAPPINGS[normalized],
      status: 'changed',
      redirectType: '301',
      notes: 'URL structure changed in Nuxt migration'
    }
  }

  // Check if this route exists in Nuxt
  if (NEXT_ROUTES.has(normalized)) {
    return {
      sourceUrl: normalized,
      targetUrl: normalized,
      status: 'unchanged',
      redirectType: 'none',
      notes: 'URL preserved in Nuxt migration'
    }
  }

  // Check if adding trailing slash makes it match
  const withSlash = normalized.endsWith('/') ? normalized.slice(0, -1) : normalized + '/'
  if (NEXT_ROUTES.has(withSlash)) {
    return {
      sourceUrl: normalized,
      targetUrl: withSlash,
      status: 'changed',
      redirectType: '301',
      notes: 'Trailing slash normalization'
    }
  }

  // Default: treat as unchanged (may be dynamic route)
  return {
    sourceUrl: normalized,
    targetUrl: normalized,
    status: 'unchanged',
    redirectType: 'none',
    notes: 'URL preserved (may be dynamic route)'
  }
}

/**
 * Generate complete URL inventory from page entries
 */
function generateInventory(pages: PageEntry[]): UrlInventory {
  const mappings: UrlMapping[] = []
  const processedUrls = new Set<string>()

  for (const page of pages) {
    const normalized = normalizeUrl(page.url)

    // Skip duplicates
    if (processedUrls.has(normalized)) {
      continue
    }
    processedUrls.add(normalized)

    const mapping = determineTarget(page.url)
    mappings.push(mapping)
  }

  // Calculate summary statistics
  const unchanged = mappings.filter(m => m.status === 'unchanged').length
  const changed = mappings.filter(m => m.status === 'changed').length
  const removed = mappings.filter(m => m.status === 'removed').length

  return {
    generated: new Date().toISOString(),
    totalUrls: mappings.length,
    unchanged,
    changed,
    removed,
    mappings
  }
}

/**
 * Generate redirect rules from URL inventory
 * Only includes changed URLs (301 redirects)
 */
function generateRedirectRules(inventory: UrlInventory): RedirectRule[] {
  return inventory.mappings
    .filter(m => m.status === 'changed' && m.redirectType === '301')
    .map(m => ({
      from: m.sourceUrl,
      to: m.targetUrl,
      statusCode: 301
    }))
    .sort((a, b) => a.from.localeCompare(b.from))
}

/**
 * Write inventory as CSV file
 * Format: source_url,target_url,status,redirect_type,notes
 */
function writeCsv(inventory: UrlInventory, path: string): void {
  const headers = ['source_url', 'target_url', 'status', 'redirect_type', 'notes']
  const rows = inventory.mappings.map(m => {
    const notes = m.notes.replace(/"/g, '""') // Escape quotes for CSV
    return `"${m.sourceUrl}","${m.targetUrl}","${m.status}","${m.redirectType}","${notes}"`
  })

  const csv = [headers.join(','), ...rows].join('\n')
  writeFileSync(path, csv, 'utf-8')
}

/**
 * Format statistics for console output
 */
function formatStats(inventory: UrlInventory): string {
  const total = inventory.totalUrls
  const unchanged = inventory.unchanged
  const changed = inventory.changed
  const removed = inventory.removed

  const barLength = 40
  const unchangedLen = Math.round((unchanged / total) * barLength)
  const changedLen = Math.round((changed / total) * barLength)
  const removedLen = Math.round((removed / total) * barLength)

  const bar = '█'.repeat(unchangedLen) + '▓'.repeat(changedLen) + '░'.repeat(removedLen)

  return `
┌─────────────────────────────────────────────────────────────┐
│                     URL INVENTORY SUMMARY                     │
├─────────────────────────────────────────────────────────────┤
│  Total URLs analyzed:    ${total.toString().padStart(18)} │
│  Unchanged URLs:         ${unchanged.toString().padStart(18)} │
│  Changed URLs (301):     ${changed.toString().padStart(18)} │
│  Removed URLs (410):     ${removed.toString().padStart(18)} │
├─────────────────────────────────────────────────────────────┤
│  Distribution:                                                   │
│  ${bar}    │
│  █ Unchanged  ▓ Changed  ░ Removed                               │
└─────────────────────────────────────────────────────────────┘
`
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log('\n🔍 URL Inventory Generator')
  console.log('═══════════════════════════\n')

  // Load pages from audit
  const pagesPath = join(process.cwd(), '.planning', 'audit', 'pages.json')

  if (!existsSync(pagesPath)) {
    console.error(`❌ Error: pages.json not found at ${pagesPath}`)
    console.error('   Run the page enumeration script first.')
    process.exit(1)
  }

  const pages: PageEntry[] = JSON.parse(readFileSync(pagesPath, 'utf-8'))
  console.log(`📄 Loaded ${pages.length} pages from pages.json\n`)

  // Generate inventory
  const inventory = generateInventory(pages)

  // Write JSON inventory
  const jsonPath = join(process.cwd(), '.planning', 'audit', 'url-inventory.json')
  writeFileSync(jsonPath, JSON.stringify(inventory, null, 2))
  console.log(`✓ JSON inventory: ${jsonPath}`)

  // Write CSV inventory
  const csvPath = join(process.cwd(), '.planning', 'audit', 'url-inventory.csv')
  writeCsv(inventory, csvPath)
  console.log(`✓ CSV inventory:  ${csvPath}`)

  // Generate and write redirect rules
  const redirectRules = generateRedirectRules(inventory)
  const rulesPath = join(process.cwd(), '.planning', 'audit', 'redirect-rules.json')
  writeFileSync(rulesPath, JSON.stringify(redirectRules, null, 2))
  console.log(`✓ Redirect rules:  ${rulesPath}`)

  // Print summary
  console.log(formatStats(inventory))

  // List changed URLs
  if (inventory.changed > 0) {
    console.log('📋 Changed URLs requiring 301 redirects:')
    console.log('─────────────────────────────────────────\n')
    const changedMappings = inventory.mappings.filter(m => m.status === 'changed')
    changedMappings.forEach(m => {
      console.log(`   ${m.sourceUrl} → ${m.targetUrl}`)
    })
    console.log('')
  }

  // List removed URLs
  if (inventory.removed > 0) {
    console.log('🗑️  Removed URLs (410 Gone):')
    console.log('─────────────────────────────────\n')
    const removedMappings = inventory.mappings.filter(m => m.status === 'removed')
    removedMappings.forEach(m => {
      console.log(`   ${m.sourceUrl} → ${m.redirectType}`)
    })
    console.log('')
  }

  // Warnings
  if (inventory.changed > 0) {
    console.log(`⚠️  ${inventory.changed} URLs require 301 redirects to preserve SEO value!`)
  }

  console.log('═══════════════════════════\n')
}

main().catch(console.error)
