#!/usr/bin/env tsx
/**
 * Comparison Viewer Server
 *
 * Starts an Express server that serves the visual comparison viewer.
 * Automatically opens the browser to the viewer URL.
 *
 * Usage: npx tsx .planning/scripts/start-viewer.ts
 */

import express from 'express'
import open from 'open'
import { existsSync, readdirSync, readFileSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, '../..')
const COMPARISONS_DIR = join(PROJECT_ROOT, '.planning/comparisons')
const VIEWER_DIR = join(PROJECT_ROOT, '.planning/comparison-viewer')

const PORT = 4321
const VIEWER_URL = `http://localhost:${PORT}`

// Type definitions
interface ComparisonInfo {
  timestamp: string
  path: string
  pageCount?: number
}

/**
 * Check if a directory exists
 */
function dirExists(path: string): boolean {
  try {
    return statSync(path).isDirectory()
  } catch {
    return false
  }
}

/**
 * Get all comparison directories (timestamped)
 */
function getComparisonDirectories(): string[] {
  if (!existsSync(COMPARISONS_DIR)) {
    return []
  }

  const entries = readdirSync(COMPARISONS_DIR, { withFileTypes: true })
  return entries
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(name => /^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$/.test(name))
    .sort()
    .reverse() // Most recent first
}

/**
 * Get page count for a comparison directory
 */
function getPageCount(comparisonPath: string): number {
  try {
    const entries = readdirSync(comparisonPath, { withFileTypes: true })
    return entries.filter(dirent =>
      dirent.isDirectory() &&
      existsSync(join(comparisonPath, dirent.name, 'baseline-mobile.png'))
    ).length
  } catch {
    return 0
  }
}

/**
 * Create Express app and setup routes
 */
function createApp(): express.Express {
  const app = express()

  // Serve comparison images
  app.use('/comparisons', express.static(COMPARISONS_DIR))

  // Serve viewer files
  app.use(express.static(VIEWER_DIR))

  // API: List all comparisons
  app.get('/api/comparisons', (req, res) => {
    try {
      const dirs = getComparisonDirectories()
      const comparisons: ComparisonInfo[] = dirs.map(timestamp => {
        const compPath = join(COMPARISONS_DIR, timestamp)
        return {
          timestamp,
          path: compPath,
          pageCount: getPageCount(compPath)
        }
      })

      res.json({ comparisons })
    } catch (error) {
      console.error('Error listing comparisons:', error)
      res.status(500).json({ error: 'Failed to list comparisons' })
    }
  })

  // API: Get specific comparison metadata
  app.get('/api/comparisons/:timestamp', (req, res) => {
    try {
      const { timestamp } = req.params
      const comparisonPath = join(COMPARISONS_DIR, timestamp)
      const metadataPath = join(comparisonPath, 'comparison.json')

      if (!existsSync(metadataPath)) {
        res.status(404).json({ error: 'Comparison not found' })
        return
      }

      const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'))
      res.json(metadata)
    } catch (error) {
      console.error('Error loading comparison:', error)
      res.status(500).json({ error: 'Failed to load comparison' })
    }
  })

  // API: Get latest comparison
  app.get('/api/comparisons/latest/meta', (req, res) => {
    try {
      const dirs = getComparisonDirectories()
      if (dirs.length === 0) {
        res.status(404).json({ error: 'No comparisons available' })
        return
      }

      const latest = dirs[0]
      const comparisonPath = join(COMPARISONS_DIR, latest)
      const metadataPath = join(comparisonPath, 'comparison.json')

      if (!existsSync(metadataPath)) {
        res.status(404).json({ error: 'Comparison metadata not found' })
        return
      }

      const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'))
      res.json({
        timestamp: latest,
        ...metadata
      })
    } catch (error) {
      console.error('Error loading latest comparison:', error)
      res.status(500).json({ error: 'Failed to load latest comparison' })
    }
  })

  // Redirect root to viewer
  app.get('/', (req, res) => {
    res.redirect('/index.html')
  })

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' })
  })

  return app
}

/**
 * Start the server
 */
async function startServer() {
  console.log('='.repeat(60))
  console.log('Comparison Viewer Server')
  console.log('='.repeat(60))

  // Verify directories exist
  if (!existsSync(VIEWER_DIR)) {
    console.error(`\nError: Viewer directory not found: ${VIEWER_DIR}`)
    console.error('Run Phase 2 Plan 02-02 to create the viewer UI.')
    process.exit(1)
  }

  if (!existsSync(COMPARISONS_DIR)) {
    console.error(`\nError: Comparisons directory not found: ${COMPARISONS_DIR}`)
    console.error('Run Phase 2 Plan 02-01 to generate comparisons.')
    process.exit(1)
  }

  const comparisons = getComparisonDirectories()
  console.log(`\nFound ${comparisons.length} comparison(s)`)

  if (comparisons.length === 0) {
    console.warn('\nWarning: No comparisons available.')
    console.warn('Run: npx tsx .planning/scripts/generate-comparison.ts')
  } else {
    console.log(`Latest: ${comparisons[0]}`)
  }

  // Create and start server
  const app = createApp()

  const server = app.listen(PORT, () => {
    console.log(`\nServer running at ${VIEWER_URL}`)
    console.log('Press Ctrl+C to stop\n')
  })

  // Handle EADDRINUSE gracefully
  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`\nError: Port ${PORT} is already in use.`)
      console.error('Another instance may be running. Stop it and try again.')
      process.exit(1)
    } else {
      console.error('\nServer error:', error)
      process.exit(1)
    }
  })

  // Open browser after a short delay
  setTimeout(async () => {
    try {
      await open(VIEWER_URL)
      console.log('Browser opened to comparison viewer')
    } catch (error) {
      console.warn('Could not open browser automatically.')
      console.warn(`Manually visit: ${VIEWER_URL}`)
    }
  }, 500)

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\nShutting down server...')
    server.close(() => {
      console.log('Server stopped.')
      process.exit(0)
    })
  })

  process.on('SIGTERM', () => {
    server.close(() => {
      process.exit(0)
    })
  })
}

// Run
startServer().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
