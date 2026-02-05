#!/usr/bin/env tsx
/**
 * Visual Comparison Script
 *
 * Captures screenshots of the current Nuxt implementation and generates
 * pixel-level diffs against the baseline screenshots from Phase 1.
 *
 * Usage: npx tsx .planning/scripts/generate-comparison.ts
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright'
import { spawn } from 'child_process'
import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, rmSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, '../..')
const AUDIT_DIR = join(PROJECT_ROOT, '.planning/audit')
const BASELINES_DIR = join(AUDIT_DIR, 'baselines')
const PAGES_FILE = join(AUDIT_DIR, 'pages.json')
const COMPARISONS_DIR = join(PROJECT_ROOT, '.planning/comparisons')

// Viewport configuration - MUST match Phase 1 baselines exactly
const VIEWPORTS = {
  mobile: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 }
} as const

type ViewportKey = keyof typeof VIEWPORTS
type PageEntry = {
  url: string
  slug: string
  type: string
  lastmod?: string
  source?: string
  title?: string
}

type ComparisonResult = {
  page: string
  slug: string
  viewport: ViewportKey
  match: boolean
  diffCount?: number
  diffPercentage?: number
  error?: string
}

type ComparisonMetadata = {
  timestamp: string
  captureDate: string
  totalPages: number
  pagesCompared: number
  viewports: Record<string, { width: number; height: number }>
  results: ComparisonResult[]
  summary: {
    totalComparisons: number
    matches: number
    mismatches: number
    errors: number
    averageDiffPercentage: number
  }
}

/**
 * Read the pages inventory from Phase 1
 */
function loadPages(): PageEntry[] {
  if (!existsSync(PAGES_FILE)) {
    console.error(`Pages file not found: ${PAGES_FILE}`)
    console.error('Run Phase 1 Plan 01-01 to generate pages.json first.')
    process.exit(1)
  }

  const content = readFileSync(PAGES_FILE, 'utf-8')
  return JSON.parse(content)
}

/**
 * Check if baseline screenshot exists for a page
 */
function hasBaseline(slug: string, viewport: ViewportKey): boolean {
  return existsSync(join(BASELINES_DIR, slug, `${viewport}.png`))
}

/**
 * Check if local dev server is running on port 3000
 */
async function isServerRunning(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:3000')
    return response.ok
  } catch {
    return false
  }
}

/**
 * Start the Nuxt dev server in background
 */
async function startServer(): Promise<() => Promise<void>> {
  console.log('Checking for local dev server...')

  if (await isServerRunning()) {
    console.log('Server already running on port 3000')
    return async () => {}
  }

  console.log('Starting Nuxt dev server...')
  const serverProcess = spawn('npm', ['run', 'dev'], {
    cwd: PROJECT_ROOT,
    stdio: 'pipe',
    detached: true
  })

  // Wait for server to be ready
  const maxWait = 60000 // 60 seconds
  const startTime = Date.now()

  while (Date.now() - startTime < maxWait) {
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (await isServerRunning()) {
      console.log('Server started successfully')
      return async () => {
        console.log('Shutting down server...')
        // Kill the entire process group
        try {
          process.kill(-serverProcess.pid!, 'SIGTERM')
        } catch {
          // Already terminated
        }
      }
    }
  }

  throw new Error('Server failed to start within 60 seconds')
}

/**
 * Convert WordPress URL to local Nuxt route
 */
function getLocalRoute(url: string, slug: string): string {
  // Home page
  if (url.endsWith('/') && slug === 'home') {
    return '/'
  }

  // Portfolio -> projects
  if (slug === 'portfolio') {
    return '/projects'
  }

  // Gallery items -> projects/[slug]
  if (url.includes('/gallery/')) {
    return `/projects/${slug}`
  }

  // Services index
  if (slug === 'services') {
    return '/services'
  }

  // Careers index
  if (slug === 'careers') {
    return '/careers'
  }

  // Contact
  if (slug === 'contact') {
    return '/contact'
  }

  // Individual services -> services/[slug]
  // (Need to check if this is a service or other page type)

  // Default: treat as page
  return `/${slug}`
}

/**
 * Capture screenshot of current implementation
 */
async function captureScreenshot(
  page: Page,
  slug: string,
  viewport: ViewportKey,
  outputDir: string
): Promise<string | null> {
  const route = getLocalRoute(slug, slug)
  const outputPath = join(outputDir, `${viewport}.png`)

  try {
    const vp = VIEWPORTS[viewport]
    await page.setViewportSize(vp)

    const url = `http://localhost:3000${route}`
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })

    // Wait a bit for any dynamic content
    await page.waitForTimeout(1000)

    await page.screenshot({
      path: outputPath,
      fullPage: false
    })

    return outputPath
  } catch (error) {
    console.error(`  Error capturing ${slug}/${viewport}:`, (error as Error).message)
    return null
  }
}

/**
 * Generate pixel diff using odiff-bin
 */
async function generateDiff(
  baselinePath: string,
  currentPath: string,
  diffPath: string
): Promise<{ match: boolean; diffCount?: number; diffPercentage?: number }> {
  try {
    const { spawn } = await import('child_process')

    return new Promise((resolve, reject) => {
      const odiff = spawn('npx', ['odiff-bin', baselinePath, currentPath, diffPath, '--antialiasing', '--diffColor', '#cd2cc9'], {
        stdio: 'pipe'
      })

      let output = ''
      let errorOutput = ''

      odiff.stdout.on('data', (data: Buffer) => {
        output += data.toString()
      })

      odiff.stderr.on('data', (data: Buffer) => {
        errorOutput += data.toString()
      })

      odiff.on('close', (code: number) => {
        if (code === 0) {
          // Match - images are identical or within threshold
          resolve({ match: true })
        } else if (code === 1) {
          // Mismatch - diff image generated
          // Parse output for diff percentage if available
          const match = output.match(/(\d+\.?\d*)%?/)
          const diffPercentage = match ? parseFloat(match[1]) : undefined
          resolve({ match: false, diffPercentage })
        } else {
          // Error
          reject(new Error(`odiff failed with code ${code}: ${errorOutput || output}`))
        }
      })

      odiff.on('error', reject)
    })
  } catch (error) {
    console.error('  odiff error:', (error as Error).message)
    return { match: false, error: (error as Error).message }
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('='.repeat(60))
  console.log('Visual Comparison Generator')
  console.log('='.repeat(60))

  // Load pages
  const pages = loadPages()
  console.log(`\nLoaded ${pages.length} pages from ${PAGES_FILE}`)

  // Filter to pages that have baselines
  const pagesWithBaselines = pages.filter(p => {
    const hasMobile = hasBaseline(p.slug, 'mobile')
    const hasTablet = hasBaseline(p.slug, 'tablet')
    const hasDesktop = hasBaseline(p.slug, 'desktop')
    return hasMobile || hasTablet || hasDesktop
  })

  console.log(`Pages with baseline screenshots: ${pagesWithBaselines.length}`)

  // Create timestamped output directory
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' +
    new Date().toTimeString().split(' ')[0].replace(/:/g, '-')
  const comparisonDir = join(COMPARISONS_DIR, timestamp)
  mkdirSync(comparisonDir, { recursive: true })

  console.log(`Output directory: ${comparisonDir}\n`)

  // Start server if needed
  const stopServer = await startServer()

  try {
    // Launch browser
    console.log('Launching browser...')
    const browser = await chromium.launch({
      headless: true
    })

    const context = await browser.newContext({
      viewport: null // We'll set per-page
    })

    const page = await context.newPage()

    const results: ComparisonResult[] = []
    let pagesCompared = 0
    let totalComparisons = 0
    let matches = 0
    let mismatches = 0
    let errors = 0
    let totalDiffPercentage = 0
    let diffCount = 0

    // Process each page
    for (const pageEntry of pagesWithBaselines) {
      const { slug, type } = pageEntry
      console.log(`\n[${pagesCompared + 1}/${pagesWithBaselines.length}] Processing: ${slug}`)

      const pageDir = join(comparisonDir, slug)
      mkdirSync(pageDir, { recursive: true })

      let pageHasAnyBaseline = false

      // Process each viewport
      for (const [viewportKey, viewport] of Object.entries(VIEWPORTS)) {
        const vp = viewportKey as ViewportKey

        // Check if baseline exists
        const baselinePath = join(BASELINES_DIR, slug, `${vp}.png`)
        if (!existsSync(baselinePath)) {
          console.log(`  ${vp}: No baseline - skipping`)
          continue
        }

        pageHasAnyBaseline = true
        totalComparisons++

        // Copy baseline to comparison directory
        const baselineCopyPath = join(pageDir, `baseline-${vp}.png`)
        copyFileSync(baselinePath, baselineCopyPath)

        // Capture current screenshot
        const screenshotPath = await captureScreenshot(page, slug, vp, pageDir)

        if (!screenshotPath) {
          results.push({
            page: pageEntry.title || slug,
            slug,
            viewport: vp,
            match: false,
            error: 'Failed to capture screenshot'
          })
          errors++
          continue
        }

        // Rename to current-{viewport}.png
        const currentPath = join(pageDir, `current-${vp}.png`)
        if (existsSync(currentPath)) {
          rmSync(currentPath)
        }

        // Generate diff
        const diffPath = join(pageDir, `diff-${vp}.png`)
        console.log(`  ${vp}: Generating diff...`)

        const diffResult = await generateDiff(baselineCopyPath, screenshotPath, diffPath)

        if (diffResult.match) {
          console.log(`  ${vp}: MATCH`)
          matches++
        } else if (diffResult.error) {
          console.log(`  ${vp}: ERROR - ${diffResult.error}`)
          errors++
        } else {
          const diffPercent = diffResult.diffPercentage || 0
          console.log(`  ${vp}: DIFF - ${diffPercent.toFixed(2)}% different`)
          mismatches++
          totalDiffPercentage += diffPercent
          diffCount++
        }

        results.push({
          page: pageEntry.title || slug,
          slug,
          viewport: vp,
          match: diffResult.match,
          diffCount: diffResult.diffCount,
          diffPercentage: diffResult.diffPercentage,
          error: diffResult.error
        })
      }

      if (pageHasAnyBaseline) {
        pagesCompared++
      }
    }

    // Close browser
    await browser.close()

    // Calculate summary
    const averageDiffPercentage = diffCount > 0 ? totalDiffPercentage / diffCount : 0

    const metadata: ComparisonMetadata = {
      timestamp,
      captureDate: new Date().toISOString(),
      totalPages: pages.length,
      pagesCompared,
      viewports: VIEWPORTS,
      results,
      summary: {
        totalComparisons,
        matches,
        mismatches,
        errors,
        averageDiffPercentage
      }
    }

    // Write metadata
    const metadataPath = join(comparisonDir, 'comparison.json')
    writeFileSync(metadataPath, JSON.stringify(metadata, null, 2))

    // Print summary
    console.log('\n' + '='.repeat(60))
    console.log('COMPARISON COMPLETE')
    console.log('='.repeat(60))
    console.log(`\nResults: ${comparisonDir}`)
    console.log(`\nPages compared: ${pagesCompared}`)
    console.log(`Total comparisons: ${totalComparisons}`)
    console.log(`Matches: ${matches}`)
    console.log(`Mismatches: ${mismatches}`)
    console.log(`Errors: ${errors}`)
    if (diffCount > 0) {
      console.log(`Average diff: ${averageDiffPercentage.toFixed(2)}%`)
    }
    console.log(`\nMetadata: ${metadataPath}`)
    console.log('\n' + '='.repeat(60))

  } finally {
    // Stop server if we started it
    await stopServer()
  }
}

// Run
main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
