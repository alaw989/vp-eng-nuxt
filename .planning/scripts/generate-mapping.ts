#!/usr/bin/env tsx
/**
 * Image Mapping Generator
 *
 * Generates a comprehensive mapping file documenting the relationship between
 * source URLs on vp-associates.com and local optimized image paths.
 *
 * Outputs:
 * - public/images/image-mapping.json (developer reference)
 * - .planning/audit/image-mapping.json (audit record)
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '../..');

// Path configuration
const OPTIMIZED_IMAGES_PATH = join(PROJECT_ROOT, '.planning/audit/optimized-images.json');
const PUBLIC_MAPPING_PATH = join(PROJECT_ROOT, 'public/images/image-mapping.json');
const AUDIT_MAPPING_PATH = join(PROJECT_ROOT, '.planning/audit/image-mapping.json');

// Size definitions for responsive variants
const SIZES = [640, 1280, 1920] as const;
const SIZE_LABELS = ['small', 'medium', 'large'] as const;

/**
 * Optimized image entry from the optimization catalog
 */
interface OptimizedImageEntry {
  sourceUrl: string;
  hash: string;
  category: string;
  filename: string;
  variants: {
    webp: string[];
    jpg: string[];
  };
  sizes: {
    '640w'?: number;
    '1280w'?: number;
    '1920w'?: number;
  };
  metadata: {
    originalWidth: number;
    originalHeight: number;
    format: string;
  };
}

/**
 * Optimized images catalog structure
 */
interface OptimizedImagesCatalog {
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

/**
 * Single mapping entry with all variant paths and srcset strings
 */
interface MappingEntry {
  sourceUrl: string;
  category: string;
  basePath: string;
  filename: string;
  isDuplicate: boolean;
  sharedWith?: string[];
  variants: {
    webp: {
      small: string;
      medium: string;
      large: string;
    };
    jpg: {
      small: string;
      medium: string;
      large: string;
    };
  };
  srcset: {
    webp: string;
    jpg: string;
  };
  metadata: {
    originalFormat: string;
    originalSize: number;
    originalWidth: number;
    originalHeight: number;
    optimizedSize: number;
    compressionRatio: number;
  };
}

/**
 * Complete mapping file structure
 */
interface ImageMapping {
  generated: string;
  version: string;
  images: MappingEntry[];
  summary: {
    totalImages: number;
    totalVariants: number;
    byCategory: Record<string, number>;
    duplicateCount: number;
    duplicates: Array<{
      hash: string;
      sourceUrls: string[];
      localPath: string;
    }>;
  };
  usageGuide: {
    description: string;
    srcsetExample: string;
    nuxtImageExample: string;
    pictureElementExample: string;
  };
}

/**
 * Generate a srcset string for a given image
 */
function generateSrcset(
  basePath: string,
  filename: string,
  sizes: readonly number[],
  format: 'webp' | 'jpg'
): string {
  const entries = sizes.map((size) => {
    const variantFile = `${filename}-${size}w.${format}`;
    return `/images/${basePath}/${variantFile} ${size}w`;
  });
  return entries.join(', ');
}

/**
 * Calculate total optimized size from the sizes object
 */
function calculateOptimizedSize(sizes: OptimizedImageEntry['sizes']): number {
  return (sizes['640w'] || 0) + (sizes['1280w'] || 0) + (sizes['1920w'] || 0);
}

/**
 * Build a mapping entry from an optimized image entry
 */
function buildMappingEntry(
  optimizedEntry: OptimizedImageEntry,
  isDuplicate: boolean,
  sharedWith: string[] = []
): MappingEntry {
  const { sourceUrl, category, filename, variants, sizes, metadata } = optimizedEntry;

  // Build variant paths for each size
  const webpVariants: Record<string, string> = {};
  const jpgVariants: Record<string, string> = {};

  SIZES.forEach((size, index) => {
    const label = SIZE_LABELS[index];
    const variantFile = `${filename}-${size}w`;

    webpVariants[label] = `/images/${category}/${variantFile}.webp`;
    jpgVariants[label] = `/images/${category}/${variantFile}.jpg`;
  });

  // Build srcset strings
  const webpSrcset = generateSrcset(category, filename, SIZES, 'webp');
  const jpgSrcset = generateSrcset(category, filename, SIZES, 'jpg');

  // Calculate compression stats
  const optimizedSize = calculateOptimizedSize(sizes);
  const originalEstimate = metadata.originalWidth * metadata.originalHeight * 3; // Rough RGB estimate
  const compressionRatio = originalEstimate > 0 ? (1 - optimizedSize / originalEstimate) * 100 : 0;

  return {
    sourceUrl,
    category,
    basePath: `/images/${category}`,
    filename,
    isDuplicate,
    sharedWith: isDuplicate ? sharedWith : undefined,
    variants: {
      webp: webpVariants as MappingEntry['variants']['webp'],
      jpg: jpgVariants as MappingEntry['variants']['jpg'],
    },
    srcset: {
      webp: webpSrcset,
      jpg: jpgSrcset,
    },
    metadata: {
      originalFormat: metadata.format,
      originalSize: originalEstimate,
      originalWidth: metadata.originalWidth,
      originalHeight: metadata.originalHeight,
      optimizedSize,
      compressionRatio: Math.round(compressionRatio * 100) / 100,
    },
  };
}

/**
 * Build duplicate detection map
 */
function buildDuplicateMap(images: OptimizedImageEntry[]): Map<string, string[]> {
  const hashMap = new Map<string, string[]>();

  for (const image of images) {
    if (!hashMap.has(image.hash)) {
      hashMap.set(image.hash, []);
    }
    hashMap.get(image.hash)!.push(image.sourceUrl);
  }

  return hashMap;
}

/**
 * Generate the complete image mapping
 */
async function generateMapping(): Promise<ImageMapping> {
  console.log('Loading optimized images catalog...');

  const catalogContent = await readFile(OPTIMIZED_IMAGES_PATH, 'utf-8');
  const catalog: OptimizedImagesCatalog = JSON.parse(catalogContent);

  console.log(`Found ${catalog.images.length} optimized images`);

  // Build duplicate detection
  const duplicateMap = buildDuplicateMap(catalog.images);
  const duplicates: Array<{ hash: string; sourceUrls: string[]; localPath: string }> = [];

  for (const [hash, sourceUrls] of duplicateMap.entries()) {
    if (sourceUrls.length > 1) {
      const entry = catalog.images.find((img) => img.hash === hash);
      if (entry) {
        duplicates.push({
          hash,
          sourceUrls,
          localPath: `/images/${entry.category}/${entry.filename}.webp`,
        });
      }
    }
  }

  console.log(`Found ${duplicates.length} duplicate image groups`);

  // Build mapping entries
  const images: MappingEntry[] = [];
  const categoryCounts: Record<string, number> = {};

  for (const optimizedEntry of catalog.images) {
    const { hash, sourceUrl, category } = optimizedEntry;
    const sourceUrls = duplicateMap.get(hash) || [];
    const isDuplicate = sourceUrls.length > 1;
    const sharedWith = isDuplicate ? sourceUrls.filter((url) => url !== sourceUrl) : [];

    const mappingEntry = buildMappingEntry(optimizedEntry, isDuplicate, sharedWith);
    images.push(mappingEntry);

    // Count by category
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  }

  // Count total variants
  const totalVariants = images.reduce((sum, img) => {
    return sum + SIZES.length * 2; // 2 formats per size
  }, 0);

  return {
    generated: new Date().toISOString(),
    version: '1.0.0',
    images,
    summary: {
      totalImages: images.length,
      totalVariants,
      byCategory: categoryCounts,
      duplicateCount: duplicates.length,
      duplicates,
    },
    usageGuide: {
      description:
        'Use the srcset strings directly in img srcset attributes, or copy local paths into NuxtImage components. All paths are relative to the public/ directory.',
      srcsetExample: `<img srcset="/images/hero/home-header-640w.webp 640w, /images/hero/home-header-1280w.webp 1280w, /images/hero/home-header-1920w.webp 1920w" src="/images/hero/home-header-640w.webp" alt="Hero image">`,
      nuxtImageExample: `<NuxtImg src="/images/hero/home-header.webp" width="1920" height="930" format="webp" loading="lazy" />`,
      pictureElementExample: `<picture>
  <source srcset="/images/hero/home-header-640w.webp 640w, /images/hero/home-header-1280w.webp 1280w, /images/hero/home-header-1920w.webp 1920w" type="image/webp">
  <img srcset="/images/hero/home-header-640w.jpg 640w, /images/hero/home-header-1280w.jpg 1280w, /images/hero/home-header-1920w.jpg 1920w" src="/images/hero/home-header-640w.jpg" alt="Description">
</picture>`,
    },
  };
}

/**
 * Write mapping file to disk
 */
async function writeMapping(mapping: ImageMapping, outputPath: string): Promise<void> {
  const dir = dirname(outputPath);
  await mkdir(dir, { recursive: true });
  await writeFile(outputPath, JSON.stringify(mapping, null, 2), 'utf-8');
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  try {
    console.log('='.repeat(60));
    console.log('Image Mapping Generator');
    console.log('='.repeat(60));

    const mapping = await generateMapping();

    // Write public-facing mapping
    console.log(`\nWriting public mapping to ${PUBLIC_MAPPING_PATH}...`);
    await writeMapping(mapping, PUBLIC_MAPPING_PATH);

    // Write audit record
    console.log(`Writing audit record to ${AUDIT_MAPPING_PATH}...`);
    await writeMapping(mapping, AUDIT_MAPPING_PATH);

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('Mapping Generation Complete');
    console.log('='.repeat(60));
    console.log(`Total images: ${mapping.summary.totalImages}`);
    console.log(`Total variants: ${mapping.summary.totalVariants}`);
    console.log(`Duplicate groups: ${mapping.summary.duplicateCount}`);
    console.log('\nBy category:');
    for (const [category, count] of Object.entries(mapping.summary.byCategory)) {
      console.log(`  ${category}: ${count}`);
    }

    if (mapping.summary.duplicateCount > 0) {
      console.log('\nDuplicates:');
      for (const dup of mapping.summary.duplicates) {
        console.log(`  Hash: ${dup.hash.slice(0, 16)}...`);
        for (const url of dup.sourceUrls) {
          console.log(`    - ${url}`);
        }
      }
    }

    console.log('\nFiles created:');
    console.log(`  - ${PUBLIC_MAPPING_PATH}`);
    console.log(`  - ${AUDIT_MAPPING_PATH}`);
  } catch (error) {
    console.error('Error generating mapping:', error);
    process.exit(1);
  }
}

main();
