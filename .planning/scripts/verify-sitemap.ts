#!/usr/bin/env tsx
/**
 * Sitemap Verification Script
 *
 * Verifies the XML sitemap at /sitemap.xml includes all expected pages.
 * Generates a verification report with coverage statistics and missing URLs.
 *
 * Usage:
 *   npx tsx .planning/scripts/verify-sitemap.ts
 *
 * Environment variables:
 *   NUXT_PUBLIC_SITE_URL - Base URL for the site (default: http://localhost:3000)
 */

import { ofetch } from 'ofetch'
import * as cheerio from 'cheerio'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq?: string
  priority?: number
}

interface PageEntry {
  url: string
  slug: string
  type: string
  lastmod?: string
  source: string
  title?: string
}

interface SitemapVerification {
  generated: string
  sitemapUrl: string
  status: number
  statusText: string
  urlCount: number
  staticUrls: string[]
  dynamicUrls: {
    projects: string[]
    services: string[]
    careers: string[]
  }
  expectedUrls: string[]
  missingUrls: string[]
  lastmodPresent: number
  lastmodMissing: number
  summary: {
    totalExpected: number
    totalFound: number
    coverage: number
  }
}

/**
 * Fetch the sitemap XML from the server
 */
async function fetchSitemap(baseUrl: string): Promise<string> {
  const sitemapUrl = `${baseUrl}/sitemap.xml`
  console.log(`Fetching sitemap from: ${sitemapUrl}`)

  try {
    const response = await ofetch.raw(sitemapUrl, {
      timeout: 10000,
      headers: {
        'Accept': 'application/xml, text/xml, */*',
      },
    })

    if (response._data) {
      return response._data as string
    }

    throw new Error('No data received')
  } catch (error) {
    throw new Error(`Failed to fetch sitemap: ${error instanceof Error ? error.message : error}`)
  }
}

/**
 * Parse XML sitemap and extract all URLs
 */
function parseSitemap(xml: string): SitemapUrl[] {
  const $ = cheerio.load(xml, { xmlMode: true })
  const urls: SitemapUrl[] = []

  $('url').each((_, element) => {
    const $url = $(element)
    const loc = $url.find('loc').text().trim()
    const lastmod = $url.find('lastmod').text().trim() || undefined
    const changefreq = $url.find('changefreq').text().trim() || undefined
    const priority = $url.find('priority').text().trim()
      ? parseFloat($url.find('priority').text().trim())
      : undefined

    urls.push({ loc, lastmod, changefreq, priority })
  })

  return urls
}

/**
 * Categorize URLs by path pattern
 */
function categorizeUrls(urls: SitemapUrl[]): SitemapVerification['dynamicUrls'] {
  const result: SitemapVerification['dynamicUrls'] = {
    projects: [],
    services: [],
    careers: [],
  }

  for (const url of urls) {
    const path = new URL(url.loc).pathname

    if (path.startsWith('/projects/') && path !== '/projects') {
      result.projects.push(url.loc)
    } else if (path.startsWith('/services/') && path !== '/services') {
      result.services.push(url.loc)
    } else if (path.startsWith('/careers/') && path !== '/careers') {
      result.careers.push(url.loc)
    }
  }

  return result
}

/**
 * Extract static URLs from sitemap
 */
function extractStaticUrls(urls: SitemapUrl[]): string[] {
  const staticPaths = new Set<string>()
  const dynamicPrefixes = ['/projects/', '/services/', '/careers/']

  for (const url of urls) {
    const path = new URL(url.loc).pathname

    // Check if this is a static page (no dynamic segments)
    const isDynamic = dynamicPrefixes.some(prefix => path.startsWith(prefix))
    if (!isDynamic) {
      staticPaths.add(path)
    }
  }

  return Array.from(staticPaths).sort()
}

/**
 * Build expected URL list from pages.json
 */
function buildExpectedUrls(pages: PageEntry[], baseUrl: string): string[] {
  const expected = new Set<string>()

  for (const page of pages) {
    const url = new URL(page.url)
    const path = url.pathname

    // Map WordPress URLs to Nuxt URLs
    // Skip WordPress system pages that shouldn't be in sitemap
    if (path.includes('/category/') || path.includes('/author/') || path.includes('/hello-world')) {
      continue
    }

    // Map old URLs to new structure
    let nuxtPath = path

    // Remove trailing slash
    if (nuxtPath.endsWith('/')) {
      nuxtPath = nuxtPath.slice(0, -1)
    }

    // Map portfolio to projects
    if (nuxtPath === '/portfolio') {
      nuxtPath = '/projects'
    }

    // Map gallery paths to projects
    if (nuxtPath.startsWith('/gallery/')) {
      nuxtPath = nuxtPath.replace('/gallery/', '/projects/')
    }

    // Map about-3 to about
    if (nuxtPath === '/about-3') {
      nuxtPath = '/about'
    }

    expected.add(`${baseUrl}${nuxtPath}`)
  }

  // Add expected Nuxt-specific pages that may not be in WordPress
  expected.add(`${baseUrl}/search`)

  return Array.from(expected).sort()
}

/**
 * Verify coverage and generate report
 */
function verifyCoverage(
  urls: SitemapUrl[],
  expectedPages: PageEntry[],
  baseUrl: string
): SitemapVerification {
  const sitemapUrls = new Set(urls.map(u => u.loc))
  const staticUrls = extractStaticUrls(urls)
  const dynamicUrls = categorizeUrls(urls)
  const expectedUrls = buildExpectedUrls(expectedPages, baseUrl)

  // Find missing URLs
  const missingUrls = expectedUrls.filter(url => !sitemapUrls.has(url))

  // Count lastmod presence
  const lastmodPresent = urls.filter(u => u.lastmod).length
  const lastmodMissing = urls.length - lastmodPresent

  return {
    generated: new Date().toISOString(),
    sitemapUrl: `${baseUrl}/sitemap.xml`,
    status: 200,
    statusText: 'OK',
    urlCount: urls.length,
    staticUrls,
    dynamicUrls,
    expectedUrls,
    missingUrls,
    lastmodPresent,
    lastmodMissing,
    summary: {
      totalExpected: expectedUrls.length,
      totalFound: urls.length,
      coverage: expectedUrls.length > 0 ? (urls.length / expectedUrls.length) * 100 : 0,
    },
  }
}

/**
 * Main execution function
 */
async function main() {
  const BASE_URL = process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  console.log('\n=== Sitemap Verification ===')
  console.log(`Base URL: ${BASE_URL}`)
  console.log(`Started at: ${new Date().toISOString()}`)

  try {
    // Fetch and parse sitemap
    const xml = await fetchSitemap(BASE_URL)
    const urls = parseSitemap(xml)

    console.log(`Fetched ${urls.length} URLs from sitemap`)

    // Load expected pages
    const pagesPath = join(process.cwd(), '.planning', 'audit', 'pages.json')

    if (!existsSync(pagesPath)) {
      console.warn(`Warning: pages.json not found at ${pagesPath}`)
      console.warn('Proceeding with basic sitemap validation only...')

      // Generate basic report without pages.json
      const basicReport: SitemapVerification = {
        generated: new Date().toISOString(),
        sitemapUrl: `${BASE_URL}/sitemap.xml`,
        status: 200,
        statusText: 'OK',
        urlCount: urls.length,
        staticUrls: extractStaticUrls(urls),
        dynamicUrls: categorizeUrls(urls),
        expectedUrls: [],
        missingUrls: [],
        lastmodPresent: urls.filter(u => u.lastmod).length,
        lastmodMissing: urls.filter(u => !u.lastmod).length,
        summary: {
          totalExpected: urls.length,
          totalFound: urls.length,
          coverage: 100,
        },
      }

      // Write report
      const reportPath = join(process.cwd(), '.planning', 'audit', 'sitemap-verification.json')
      writeFileSync(reportPath, JSON.stringify(basicReport, null, 2))

      // Log summary
      console.log(`\n--- Sitemap Statistics ---`)
      console.log(`Status: ${basicReport.statusText}`)
      console.log(`URLs in sitemap: ${basicReport.urlCount}`)
      console.log(`Static pages: ${basicReport.staticUrls.length}`)
      console.log(`Dynamic projects: ${basicReport.dynamicUrls.projects.length}`)
      console.log(`Dynamic services: ${basicReport.dynamicUrls.services.length}`)
      console.log(`Dynamic careers: ${basicReport.dynamicUrls.careers.length}`)
      console.log(`URLs with lastmod: ${basicReport.lastmodPresent}`)
      console.log(`URLs without lastmod: ${basicReport.lastmodMissing}`)
      console.log(`\nStatic pages:`)
      basicReport.staticUrls.forEach(url => console.log(`  - ${url}`))
      console.log(`\nReport saved to: ${reportPath}`)

      return
    }

    const expectedPages = JSON.parse(readFileSync(pagesPath, 'utf-8')) as PageEntry[]

    // Verify coverage
    const verification = verifyCoverage(urls, expectedPages, BASE_URL)

    // Write report
    const reportPath = join(process.cwd(), '.planning', 'audit', 'sitemap-verification.json')
    writeFileSync(reportPath, JSON.stringify(verification, null, 2))

    // Log summary
    console.log(`\n--- Sitemap Statistics ---`)
    console.log(`Status: ${verification.statusText}`)
    console.log(`URLs in sitemap: ${verification.urlCount}`)
    console.log(`Static pages: ${verification.staticUrls.length}`)
    console.log(`Dynamic projects: ${verification.dynamicUrls.projects.length}`)
    console.log(`Dynamic services: ${verification.dynamicUrls.services.length}`)
    console.log(`Dynamic careers: ${verification.dynamicUrls.careers.length}`)
    console.log(`URLs with lastmod: ${verification.lastmodPresent}`)
    console.log(`URLs without lastmod: ${verification.lastmodMissing}`)

    console.log(`\n--- Coverage Report ---`)
    console.log(`Expected URLs: ${verification.summary.totalExpected}`)
    console.log(`Found in sitemap: ${verification.summary.totalFound}`)
    console.log(`Coverage: ${verification.summary.coverage.toFixed(1)}%`)

    if (verification.missingUrls.length > 0) {
      console.log(`\n⚠️  Missing URLs (${verification.missingUrls.length}):`)
      verification.missingUrls.forEach(url => console.log(`  - ${url}`))
    } else {
      console.log(`\n✓ All expected URLs are in the sitemap`)
    }

    console.log(`\nStatic pages:`)
    verification.staticUrls.forEach(url => console.log(`  - ${url}`))

    console.log(`\nDynamic service pages:`)
    verification.dynamicUrls.services.forEach(url => console.log(`  - ${url}`))

    console.log(`\nDynamic project pages:`)
    verification.dynamicUrls.projects.forEach(url => console.log(`  - ${url}`))

    if (verification.dynamicUrls.careers.length > 0) {
      console.log(`\nDynamic career pages:`)
      verification.dynamicUrls.careers.forEach(url => console.log(`  - ${url}`))
    }

    console.log(`\nReport saved to: ${reportPath}`)

    // Exit with error code if coverage is below 80%
    if (verification.summary.coverage < 80) {
      console.error(`\n❌ Coverage below 80% threshold`)
      process.exit(1)
    }

    console.log(`\n✓ Sitemap verification passed`)
  } catch (error) {
    console.error('\n❌ Sitemap verification failed:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()
