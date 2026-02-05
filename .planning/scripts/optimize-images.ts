#!/usr/bin/env tsx
/**
 * Image Optimization Script for VP Associates Nuxt Site
 *
 * Converts raw images to WebP format with JPG fallback.
 * Generates three responsive variants (640w, 1280w, 1920w).
 * Organizes images by type (hero/, projects/, team/, services/, shared/).
 * Enforces file size caps for optimal web performance.
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

// =============================================================================
// TYPES
// =============================================================================

interface RawImageEntry {
  sourceUrl: string;
  hash: string;
  localPath: string;
  method: string;
  metadata: {
    width: number;
    height: number;
    format: string;
    sizeBytes: number;
  };
}

interface RawImagesCatalog {
  generated: string;
  sourceUrl: string;
  images: RawImageEntry[];
  summary: {
    totalImages: number;
    duplicatesFound: number;
    totalBytes: number;
    byMethod: {
      mediaApi: number;
      htmlCrawl: number;
    };
  };
}

interface OptimizedImageEntry {
  sourceUrl: string;
  hash: string;
  category: string;
  filename: string;
  variants: {
    webp: string[];  // ['image-640w.webp', 'image-1280w.webp', 'image-1920w.webp']
    jpg: string[];   // ['image-640w.jpg', 'image-1280w.jpg', 'image-1920w.jpg']
  };
  sizes: {
    '640w': number;
    '1280w': number;
    '1920w': number;
  };
  metadata: {
    originalWidth: number;
    originalHeight: number;
    format: string;
  };
}

interface OptimizationCatalog {
  generated: string;
  images: OptimizedImageEntry[];
  summary: {
    totalImages: number;
    totalVariants: number;
    totalSizeBytes: number;
    byCategory: Record<string, number>;
    oversizedImages: string[];
    diskSavings: {
      rawSizeBytes: number;
      optimizedSizeBytes: number;
      savingsPercent: number;
    };
  };
}

// =============================================================================
// CONFIGURATION
// =============================================================================

const RAW_IMAGES_CATALOG_PATH = '.planning/audit/raw-images.json';
const RAW_IMAGES_DIR = '.planning/audit/images/raw';
const OUTPUT_DIR = 'public/images';
const OPTIMIZED_CATALOG_PATH = '.planning/audit/optimized-images.json';

// Quality settings
const WEBP_QUALITY = 80;
const JPG_QUALITY = 80;

// Responsive size breakpoints (width in pixels)
const SIZES = [640, 1280, 1920] as const;

// File size targets (in bytes)
const SIZE_TARGETS = {
  hero: 200 * 1024,      // 200KB
  projects: 100 * 1024,  // 100KB
  team: 50 * 1024,       // 50KB
  services: 100 * 1024,  // 100KB
  general: 100 * 1024,   // 100KB
  shared: 100 * 1024,    // 100KB
} as const;

// Categories
const CATEGORIES = ['hero', 'projects', 'team', 'services', 'shared', 'general'] as const;
type Category = typeof CATEGORIES[number];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Convert kebab-case or snake_case to readable name
 */
function toReadableFilename(filename: string): string {
  return filename
    .replace(/\.(jpg|jpeg|png|webp|svg)$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Sanitize filename for safe file system usage
 */
function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Generate descriptive filename from URL
 */
function generateFilenameFromUrl(url: string, hash: string): string {
  // Extract filename from URL
  const urlPath = new URL(url).pathname;
  let filename = path.basename(urlPath);

  // If filename is generic or numeric, use a descriptive name
  if (/^image\d+\.(jpg|png|jpeg)$/i.test(filename) ||
      /^image376\.(jpg|png|jpeg)$/i.test(filename)) {
    // Use path segments to create a more descriptive name
    const segments = urlPath.split('/').filter(Boolean);
    const relevantSegments = segments.slice(1, -1); // Exclude domain and filename
    if (relevantSegments.length > 0) {
      filename = relevantSegments.join('-') + path.extname(filename);
    }
  }

  // Remove dimensions suffix like -400x300
  filename = filename.replace(/-\d+x\d+\.(\w+)$/, '.$1');

  // Sanitize and return
  const nameWithoutExt = sanitizeFilename(path.basename(filename, path.extname(filename)));
  const ext = path.extname(filename);

  // If the name is too generic, use hash prefix
  if (nameWithoutExt.length < 3) {
    return `img-${hash.substring(0, 8)}${ext}`;
  }

  return `${nameWithoutExt}${ext}`;
}

/**
 * Get file size in bytes
 */
async function getFileSize(filePath: string): Promise<number> {
  const stats = await fs.stat(filePath);
  return stats.size;
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// =============================================================================
// CATEGORIZATION
// =============================================================================

/**
 * Determine image category based on URL, filename, and dimensions
 */
function categorizeImage(
  entry: RawImageEntry,
  filename: string,
  seenHashes: Set<string>
): Category {
  const { sourceUrl, metadata } = entry;
  const urlLower = sourceUrl.toLowerCase();
  const filenameLower = filename.toLowerCase();
  const { width, height } = metadata;
  const maxDimension = Math.max(width, height);

  // Check for duplicate (shared image)
  if (seenHashes.has(entry.hash)) {
    return 'shared';
  }

  // Hero/background images: large dimensions or filename hints
  if (
    maxDimension >= 1920 ||
    filenameLower.includes('hero') ||
    filenameLower.includes('home') ||
    filenameLower.includes('header') ||
    filenameLower.includes('background')
  ) {
    return 'hero';
  }

  // Team/avatar images
  if (
    filenameLower.includes('team') ||
    filenameLower.includes('avatar') ||
    filenameLower.includes('handshake') // careers-handshake is team-related
  ) {
    return 'team';
  }

  // Project/portfolio images
  if (
    filenameLower.includes('project') ||
    filenameLower.includes('portfolio') ||
    filenameLower.includes('shopdrawing') || // engineering drawings
    filenameLower.includes('cad') ||
    filenameLower.includes('shallowdeepfoundationdesign') ||
    filenameLower.includes('steel-connect') ||
    filenameLower.includes('crane-lift') ||
    filenameLower.includes('lowrise') ||
    filenameLower.includes('inspection-services') ||
    filenameLower.includes('image376') || // project image
    urlLower.includes('/2018/05/') && filenameLower.match(/^image[12]\.jpg$/) // large images
  ) {
    return 'projects';
  }

  // Service images
  if (
    filenameLower.includes('service')
  ) {
    return 'services';
  }

  // Default to general
  return 'general';
}

// =============================================================================
// VARIANT GENERATION
// =============================================================================

/**
 * Generate WebP and JPG variants at multiple sizes
 */
async function generateVariants(
  inputPath: string,
  outputBasename: string,
  outputDir: string,
  sizes: readonly number[]
): Promise<{ webp: string[]; jpg: string[]; sizes: Record<string, number> }> {
  const results: { webp: string[]; jpg: string[]; sizes: Record<string, number> } = {
    webp: [],
    jpg: [],
    sizes: {},
  };

  // Load image once for metadata
  const image = sharp(inputPath);
  const metadata = await image.metadata();

  // Create output directory if it doesn't exist
  await fs.mkdir(outputDir, { recursive: true });

  // Generate all variants in parallel
  const variantPromises: Promise<void>[] = [];

  for (const size of sizes) {
    const sizeKey = `${size}w`;

    // Skip if source image is smaller than target size (withoutEnlargement will handle this)
    // But we still want to generate the variant at the original size

    // WebP variant
    const webpPath = path.join(outputDir, `${outputBasename}-${sizeKey}.webp`);
    variantPromises.push(
      (async () => {
        const pipeline = sharp(inputPath)
          .rotate() // Auto-orient based on EXIF
          .resize(size, null, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: WEBP_QUALITY });
        await pipeline.toFile(webpPath);
        const fileSize = await getFileSize(webpPath);
        results.sizes[sizeKey] = (results.sizes[sizeKey] || 0) + fileSize;
        results.webp.push(`${outputBasename}-${sizeKey}.webp`);
      })()
    );

    // JPG variant
    const jpgPath = path.join(outputDir, `${outputBasename}-${sizeKey}.jpg`);
    variantPromises.push(
      (async () => {
        const pipeline = sharp(inputPath)
          .rotate() // Auto-orient based on EXIF
          .resize(size, null, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality: JPG_QUALITY });
        await pipeline.toFile(jpgPath);
        const fileSize = await getFileSize(jpgPath);
        results.sizes[sizeKey] = (results.sizes[sizeKey] || 0) + fileSize;
        results.jpg.push(`${outputBasename}-${sizeKey}.jpg`);
      })()
    );
  }

  await Promise.all(variantPromises);

  return results;
}

// =============================================================================
// MAIN OPTIMIZATION FUNCTION
// =============================================================================

/**
 * Main function to optimize all images
 */
async function optimizeImages(): Promise<OptimizationCatalog> {
  console.log('Starting image optimization...\n');

  // Load raw images catalog
  const rawCatalogPath = path.resolve(RAW_IMAGES_CATALOG_PATH);
  const rawCatalogContent = await fs.readFile(rawCatalogPath, 'utf-8');
  const rawCatalog: RawImagesCatalog = JSON.parse(rawCatalogContent);

  console.log(`Found ${rawCatalog.summary.totalImages} raw images`);

  // Track processed hashes for deduplication
  const processedHashes = new Map<string, { category: string; filename: string }>();
  const seenHashes = new Set<string>();

  // Output catalog
  const catalog: OptimizationCatalog = {
    generated: new Date().toISOString(),
    images: [],
    summary: {
      totalImages: 0,
      totalVariants: 0,
      totalSizeBytes: 0,
      byCategory: {},
      oversizedImages: [],
      diskSavings: {
        rawSizeBytes: rawCatalog.summary.totalBytes,
        optimizedSizeBytes: 0,
        savingsPercent: 0,
      },
    },
  };

  // Create output directories
  for (const category of CATEGORIES) {
    const categoryDir = path.join(OUTPUT_DIR, category);
    await fs.mkdir(categoryDir, { recursive: true });
    catalog.summary.byCategory[category] = 0;
  }

  // Track oversized images
  const oversizedImages: Array<{ filename: string; category: string; size: number; target: number }> = [];

  // Process each image
  let processedCount = 0;

  for (const rawEntry of rawCatalog.images) {
    // Skip SVG images (they're already optimized)
    if (rawEntry.metadata.format === 'svg') {
      console.log(`Skipping SVG: ${rawEntry.hash.substring(0, 8)}...`);
      continue;
    }

    processedCount++;

    // Resolve full path to raw image
    const rawImagePath = path.resolve(RAW_IMAGES_DIR, path.basename(rawEntry.localPath));

    // Check if file exists
    try {
      await fs.access(rawImagePath);
    } catch {
      console.log(`File not found, skipping: ${rawImagePath}`);
      continue;
    }

    // Generate filename from URL
    const generatedFilename = generateFilenameFromUrl(rawEntry.sourceUrl, rawEntry.hash);
    const basename = path.basename(generatedFilename, path.extname(generatedFilename));

    // Determine category (before marking hash as seen)
    let category = categorizeImage(rawEntry, generatedFilename, seenHashes);

    // Check if this is a duplicate (hash already seen)
    if (processedHashes.has(rawEntry.hash)) {
      const previous = processedHashes.get(rawEntry.hash)!;
      category = 'shared';
      // Add context prefix for shared images
      console.log(`Duplicate detected: ${basename} -> shared-${previous.category}-${basename}`);
    }

    // Mark hash as seen
    seenHashes.add(rawEntry.hash);
    processedHashes.set(rawEntry.hash, { category, filename: basename });

    // For shared images, use context prefix
    let outputBasename = basename;
    let outputDir = path.join(OUTPUT_DIR, category);

    if (category === 'shared') {
      const previous = processedHashes.get(rawEntry.hash)!;
      outputBasename = `shared-${previous.category}-${basename}`;
      outputDir = path.join(OUTPUT_DIR, 'shared');
    }

    console.log(`[${processedCount}/${rawCatalog.images.length}] Processing: ${basename} -> ${category}/`);

    // Generate variants
    const variants = await generateVariants(
      rawImagePath,
      outputBasename,
      outputDir,
      SIZES
    );

    // Calculate total size for this image
    const totalSize = Object.values(variants.sizes).reduce((sum, size) => sum + size, 0);

    // Check for oversized images
    const sizeTarget = SIZE_TARGETS[category];
    const largestVariant = Math.max(...Object.values(variants.sizes));
    if (largestVariant > sizeTarget) {
      oversizedImages.push({
        filename: outputBasename,
        category,
        size: largestVariant,
        target: sizeTarget,
      });
    }

    // Add to catalog
    catalog.images.push({
      sourceUrl: rawEntry.sourceUrl,
      hash: rawEntry.hash,
      category,
      filename: outputBasename,
      variants: {
        webp: variants.webp.sort(),
        jpg: variants.jpg.sort(),
      },
      sizes: variants.sizes,
      metadata: {
        originalWidth: rawEntry.metadata.width,
        originalHeight: rawEntry.metadata.height,
        format: rawEntry.metadata.format,
      },
    });

    catalog.summary.byCategory[category]++;
    catalog.summary.totalSizeBytes += totalSize;

    // Progress logging every 5 images
    if (processedCount % 5 === 0) {
      console.log(`  Processed ${processedCount} images...`);
    }
  }

  // Calculate summary stats
  catalog.summary.totalImages = catalog.images.length;
  catalog.summary.totalVariants = catalog.images.length * 6; // 3 sizes x 2 formats
  catalog.summary.diskSavings.optimizedSizeBytes = catalog.summary.totalSizeBytes;
  catalog.summary.diskSavings.savingsPercent =
    ((catalog.summary.diskSavings.rawSizeBytes - catalog.summary.totalSizeBytes) /
      catalog.summary.diskSavings.rawSizeBytes) * 100;

  // Add oversized images to summary
  catalog.summary.oversizedImages = oversizedImages.map(
    img => `${img.category}/${img.filename} (${formatBytes(img.size)} > ${formatBytes(img.target)})`
  );

  return catalog;
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function main() {
  try {
    const startTime = Date.now();

    const catalog = await optimizeImages();

    // Write catalog
    const catalogPath = path.resolve(OPTIMIZED_CATALOG_PATH);
    await fs.mkdir(path.dirname(catalogPath), { recursive: true });
    await fs.writeFile(catalogPath, JSON.stringify(catalog, null, 2));

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // Print summary
    console.log('\n=== Optimization Complete ===\n');
    console.log(`Total images processed: ${catalog.summary.totalImages}`);
    console.log(`Total variants generated: ${catalog.summary.totalVariants}`);
    console.log(`Total size: ${formatBytes(catalog.summary.totalSizeBytes)}`);
    console.log(`Raw size: ${formatBytes(catalog.summary.diskSavings.rawSizeBytes)}`);
    console.log(`Space savings: ${catalog.summary.diskSavings.savingsPercent.toFixed(1)}%`);
    console.log(`\nBy category:`);
    for (const [category, count] of Object.entries(catalog.summary.byCategory)) {
      if (count > 0) {
        console.log(`  ${category}: ${count} images`);
      }
    }

    if (catalog.summary.oversizedImages.length > 0) {
      console.log(`\n⚠️  Oversized images (${catalog.summary.oversizedImages.length}):`);
      for (const oversized of catalog.summary.oversizedImages) {
        console.log(`  - ${oversized}`);
      }
    } else {
      console.log('\n✅ All images within size targets!');
    }

    console.log(`\nCatalog written to: ${OPTIMIZED_CATALOG_PATH}`);
    console.log(`Duration: ${duration}s`);

  } catch (error) {
    console.error('Error during optimization:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { optimizeImages, type OptimizationCatalog, type OptimizedImageEntry };
