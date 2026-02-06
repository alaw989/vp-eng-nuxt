/**
 * Team Photo Optimization Script
 *
 * Optimizes team member photos for web performance:
 * - Resizes to 800x1000 (4:5 aspect ratio) for consistent card heights
 * - Creates responsive variants (640w and 800w)
 * - Generates WebP primary format with JPG fallback
 * - Target file size: under 50KB each
 */

import sharp from 'sharp'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const inputDir = './public/images'
const outputDir = './public/images/team'
const teamPhotos = ['team-1.jpg', 'team-2.jpg', 'team-3.jpg', 'team-4.jpg']

// Target dimensions for 4:5 aspect ratio (0.8)
const TARGET_WIDTH = 800
const TARGET_HEIGHT = 1000 // 4:5 aspect ratio
const MOBILE_WIDTH = 640
const MOBILE_HEIGHT = 800 // 4:5 aspect ratio

// Quality settings (from Phase 3 context)
const WEBP_QUALITY = 85
const JPG_QUALITY = 85

interface PhotoResult {
  photo: string
  original: { width: number | undefined; height: number | undefined; size: number }
  webp800: string
  jpg800: string
  webp640: string
  jpg640: string
}

async function optimizeTeamPhotos(): Promise<void> {
  console.log('Team Photo Optimization Script')
  console.log('================================\n')

  // Create output directory if not exists
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
    console.log(`Created output directory: ${outputDir}\n`)
  }

  const results: PhotoResult[] = []

  for (const photo of teamPhotos) {
    const inputPath = join(inputDir, photo)
    const outputName = photo.replace('.jpg', '')

    console.log(`Processing ${photo}...`)

    // Get metadata
    const metadata = await sharp(inputPath).metadata()
    const originalSize = (await sharp(inputPath).metadata()).size || 0

    console.log(`  Original: ${metadata.width}x${metadata.height}, ${(originalSize / 1024).toFixed(1)}KB`)

    // Generate 800w variants (desktop)
    const image800 = sharp(inputPath).resize(TARGET_WIDTH, TARGET_HEIGHT, {
      fit: 'cover',
      position: 'center',
      withoutEnlargement: true // From Phase 3 context
    })

    const webp800Path = join(outputDir, `${outputName}-800w.webp`)
    const jpg800Path = join(outputDir, `${outputName}-800w.jpg`)

    await image800.clone().webp({ quality: WEBP_QUALITY }).toFile(webp800Path)
    await image800.clone().jpeg({ quality: JPG_QUALITY }).toFile(jpg800Path)

    // Generate 640w variants (mobile)
    const image640 = sharp(inputPath).resize(MOBILE_WIDTH, MOBILE_HEIGHT, {
      fit: 'cover',
      position: 'center',
      withoutEnlargement: true
    })

    const webp640Path = join(outputDir, `${outputName}-640w.webp`)
    const jpg640Path = join(outputDir, `${outputName}-640w.jpg`)

    await image640.clone().webp({ quality: WEBP_QUALITY }).toFile(webp640Path)
    await image640.clone().jpeg({ quality: JPG_QUALITY }).toFile(jpg640Path)

    // Get output file sizes
    const webp800Size = (await sharp(webp800Path).metadata()).size || 0
    const jpg800Size = (await sharp(jpg800Path).metadata()).size || 0
    const webp640Size = (await sharp(webp640Path).metadata()).size || 0
    const jpg640Size = (await sharp(jpg640Path).metadata()).size || 0

    console.log(`  WebP (800w): ${(webp800Size / 1024).toFixed(1)}KB`)
    console.log(`  JPG (800w):  ${(jpg800Size / 1024).toFixed(1)}KB`)
    console.log(`  WebP (640w): ${(webp640Size / 1024).toFixed(1)}KB`)
    console.log(`  JPG (640w):  ${(jpg640Size / 1024).toFixed(1)}KB`)

    // Check if files exceed 50KB target
    const maxFileKb = Math.max(
      webp800Size / 1024,
      jpg800Size / 1024,
      webp640Size / 1024,
      jpg640Size / 1024
    )

    if (maxFileKb > 50) {
      console.warn(`  ⚠️  WARNING: Max file size ${maxFileKb.toFixed(1)}KB exceeds 50KB target`)
    } else {
      console.log(`  ✓ All files under 50KB target`)
    }

    console.log('')

    results.push({
      photo,
      original: { width: metadata.width, height: metadata.height, size: originalSize },
      webp800: webp800Path,
      jpg800: jpg800Path,
      webp640: webp640Path,
      jpg640: jpg640Path
    })
  }

  // Summary
  console.log('Summary')
  console.log('-------')
  console.log(`Processed ${results.length} team photos`)
  console.log(`Output directory: ${outputDir}`)
  console.log('')

  // Total original vs optimized sizes
  const totalOriginal = results.reduce((sum, r) => sum + r.original.size, 0)
  const totalOptimized800 = results.reduce(async (sumPromise, r) => {
    const sum = await sumPromise
    const webp = (await sharp(r.webp800).metadata()).size || 0
    const jpg = (await sharp(r.jpg800).metadata()).size || 0
    return Promise.resolve(sum + webp + jpg)
  }, Promise.resolve(0))

  console.log(`Total original size: ${(totalOriginal / 1024).toFixed(1)}KB`)
  console.log(`Total optimized size (800w WebP+JPG): ${(await totalOptimized800 / 1024).toFixed(1)}KB`)
  console.log(`Size reduction: ${((1 - (await totalOptimized800) / totalOriginal) * 100).toFixed(1)}%`)
  console.log('')

  // Generate HTML srcset examples
  console.log('HTML srcset examples:')
  console.log('----------------------')
  for (const result of results) {
    const name = result.photo.replace('.jpg', '')
    console.log(`${name}:`)
    console.log(`  <picture>`)
    console.log(`    <source srcset="/images/team/${name}-640w.webp 640w, /images/team/${name}-800w.webp 800w" type="image/webp">`)
    console.log(`    <img src="/images/team/${name}-800w.jpg" srcset="/images/team/${name}-640w.jpg 640w, /images/team/${name}-800w.jpg 800w" alt="[Team member name]" loading="lazy" width="800" height="1000">`)
    console.log(`  </picture>`)
    console.log('')
  }
}

// Run the optimization
optimizeTeamPhotos().catch((error) => {
  console.error('Error during optimization:', error)
  process.exit(1)
})
