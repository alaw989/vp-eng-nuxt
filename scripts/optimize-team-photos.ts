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
import { existsSync, mkdirSync, statSync } from 'fs'
import { join } from 'path'

const inputDir = './public/images'
const outputDir = './public/images/team'
const teamPhotos = ['team-1.jpg', 'team-2.jpg', 'team-3.jpg', 'team-4.jpg']

// Target dimensions for 4:5 aspect ratio (0.8)
const TARGET_WIDTH = 800
const TARGET_HEIGHT = 1000 // 4:5 aspect ratio
const MOBILE_WIDTH = 640
const MOBILE_HEIGHT = 800 // 4:5 aspect ratio

// Quality settings - adaptive based on source image size
const DEFAULT_WEBP_QUALITY = 85
const DEFAULT_JPG_QUALITY = 85
const AGGRESSIVE_WEBP_QUALITY = 55
const AGGRESSIVE_JPG_QUALITY = 55

// Large photo threshold (use aggressive quality)
const LARGE_PHOTO_THRESHOLD = 300 * 1024 // 300KB

// Very large photo threshold (use ultra aggressive quality and smaller dimensions)
const VERY_LARGE_PHOTO_THRESHOLD = 200 * 1024 // 200KB

// Ultra aggressive dimension multiplier for very large photos
const ULTRA_DIMENSION_MULTIPLIER = 0.65 // 35% reduction (520x650)

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

    // Get metadata and file size
    const metadata = await sharp(inputPath).metadata()
    const originalSize = statSync(inputPath).size

    console.log(`  Original: ${metadata.width}x${metadata.height}, ${(originalSize / 1024).toFixed(1)}KB`)

    // Determine quality settings based on original file size
    const useAggressiveQuality = originalSize > VERY_LARGE_PHOTO_THRESHOLD
    const webpQuality = useAggressiveQuality ? AGGRESSIVE_WEBP_QUALITY : DEFAULT_WEBP_QUALITY
    const jpgQuality = useAggressiveQuality ? AGGRESSIVE_JPG_QUALITY : DEFAULT_JPG_QUALITY

    // For very large photos, also reduce target dimensions
    let dimensionMultiplier = 1.0
    if (useAggressiveQuality) {
      console.log(`  Using aggressive quality (${webpQuality}/${jpgQuality}) for large source photo`)
      dimensionMultiplier = ULTRA_DIMENSION_MULTIPLIER // Reduce dimensions by 35%
    }

    // Calculate actual target dimensions based on source size
    // Don't upscale small images - use max of source or target, maintaining 4:5
    let targetWidth = TARGET_WIDTH
    let targetHeight = TARGET_HEIGHT
    let mobileWidth = MOBILE_WIDTH
    let mobileHeight = MOBILE_HEIGHT

    // If source is smaller than target, use source dimensions (no upscaling)
    if (metadata.width && metadata.width < TARGET_WIDTH && !useAggressiveQuality) {
      targetWidth = metadata.width
      targetHeight = Math.round(targetWidth / 0.8) // Maintain 4:5
      console.log(`  Source smaller than target - using ${targetWidth}x${targetHeight} (no upscaling)`)
    } else if (useAggressiveQuality) {
      // For large photos, reduce target dimensions even more for 800w variant
      // Use 0.5 multiplier (400x500) for 800w to meet 50KB target
      targetWidth = Math.round(TARGET_WIDTH * 0.5) // 400px
      targetHeight = Math.round(TARGET_HEIGHT * 0.5) // 500px
      console.log(`  Using ultra-reduced dimensions ${targetWidth}x${targetHeight} for large source (800w variant)`)
    }

    if (metadata.width && metadata.width < MOBILE_WIDTH && !useAggressiveQuality) {
      mobileWidth = metadata.width
      mobileHeight = Math.round(mobileWidth / 0.8) // Maintain 4:5
    } else if (useAggressiveQuality) {
      // For mobile, use the dimensionMultiplier (0.65 = 416x520)
      mobileWidth = Math.round(MOBILE_WIDTH * dimensionMultiplier)
      mobileHeight = Math.round(MOBILE_HEIGHT * dimensionMultiplier)
      console.log(`  Using reduced dimensions ${mobileWidth}x${mobileHeight} for large source (640w variant)`)
    }

    // Generate 800w variants (desktop)
    const image800 = sharp(inputPath).resize(targetWidth, targetHeight, {
      fit: 'cover',
      position: 'center'
    })

    const webp800Path = join(outputDir, `${outputName}-800w.webp`)
    const jpg800Path = join(outputDir, `${outputName}-800w.jpg`)

    await image800.clone().webp({ quality: webpQuality, smartSubsample: true }).toFile(webp800Path)
    await image800.clone().jpeg({ quality: jpgQuality, progressive: true }).toFile(jpg800Path)

    // Generate 640w variants (mobile)
    const image640 = sharp(inputPath).resize(mobileWidth, mobileHeight, {
      fit: 'cover',
      position: 'center'
    })

    const webp640Path = join(outputDir, `${outputName}-640w.webp`)
    const jpg640Path = join(outputDir, `${outputName}-640w.jpg`)

    await image640.clone().webp({ quality: webpQuality, smartSubsample: true }).toFile(webp640Path)
    await image640.clone().jpeg({ quality: jpgQuality, progressive: true }).toFile(jpg640Path)

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
