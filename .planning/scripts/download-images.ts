#!/usr/bin/env tsx
/**
 * Image Download Script
 *
 * Downloads all images from vp-associates.com using:
 * 1. WordPress Media API (wp-json/wp/v2/media)
 * 2. HTML page crawling (extracting img tags)
 *
 * Features:
 * - Exponential backoff retry (1s, 2s, 4s)
 * - SHA-256 hash-based deduplication
 * - Metadata extraction using Sharp
 */

import sharp from 'sharp';
import * as cheerio from 'cheerio';
import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

// ============================================================================
// Interfaces
// ============================================================================

interface RawImageEntry {
  sourceUrl: string;
  hash: string;
  localPath: string;
  method: 'media-api' | 'html-crawl';
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

interface PageEntry {
  url: string;
  slug: string;
  type: string;
  lastmod?: string;
  source?: string;
  title?: string;
}

// ============================================================================
// Constants
// ============================================================================

const SOURCE_URL = 'https://www.vp-associates.com';
const PAGES_JSON_PATH = path.join(process.cwd(), '.planning/audit/pages.json');
const RAW_IMAGES_DIR = path.join(process.cwd(), '.planning/audit/images/raw');
const CATALOG_OUTPUT_PATH = path.join(process.cwd(), '.planning/audit/raw-images.json');
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff in ms

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate SHA-256 hash of a buffer
 */
function calculateHash(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

/**
 * Get file extension from URL or content-type
 */
function getExtensionFromUrl(url: string): string {
  const urlPath = new URL(url).pathname;
  const extMatch = urlPath.match(/\.([a-z0-9]+)(?:\?|$)/i);
  if (extMatch) {
    const ext = extMatch[1].toLowerCase();
    // Map common extensions
    const extMap: Record<string, string> = {
      'jpg': 'jpg',
      'jpeg': 'jpg',
      'png': 'png',
      'gif': 'gif',
      'webp': 'webp',
      'svg': 'svg',
      'ico': 'ico',
      'bmp': 'bmp',
      'tiff': 'tiff',
      'tif': 'tiff',
      'avif': 'avif',
      'heic': 'heic',
      'heif': 'heif',
    };
    return extMap[ext] || ext;
  }
  return 'jpg'; // Default fallback
}

/**
 * Ensure directory exists
 */
async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Download image with exponential backoff retry
 */
async function downloadImageWithRetry(url: string, maxRetries = MAX_RETRIES): Promise<Buffer> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      return buffer;
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        const delay = RETRY_DELAYS[Math.min(attempt, RETRY_DELAYS.length - 1)];
        console.warn(`  [Retry ${attempt + 1}/${maxRetries}] ${url} - retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  throw new Error(`Failed to download after ${maxRetries} retries: ${url} - ${lastError?.message}`);
}

/**
 * Extract image metadata using Sharp
 */
async function extractMetadata(buffer: Buffer, format: string): Promise<{
  width: number;
  height: number;
  format: string;
  sizeBytes: number;
}> {
  try {
    // Sharp doesn't handle SVG, use fallback
    if (format === 'svg') {
      return {
        width: 0,
        height: 0,
        format: 'svg',
        sizeBytes: buffer.length,
      };
    }

    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || format,
      sizeBytes: buffer.length,
    };
  } catch (error) {
    // If Sharp fails, return basic info
    return {
      width: 0,
      height: 0,
      format,
      sizeBytes: buffer.length,
    };
  }
}

/**
 * Fetch all images from WordPress Media API
 */
async function fetchWordPressMedia(baseUrl: string): Promise<string[]> {
  console.log('\n=== Fetching from WordPress Media API ===');

  const imageUrls: string[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const apiUrl = `${baseUrl}/wp-json/wp/v2/media?per_page=100&page=${page}`;
      const response = await fetch(apiUrl);

      if (response.status === 400) {
        // Page out of range
        hasMore = false;
        break;
      }

      if (!response.ok) {
        console.warn(`  Warning: API returned ${response.status} for page ${page}`);
        hasMore = false;
        break;
      }

      const mediaItems = await response.json();

      if (!Array.isArray(mediaItems) || mediaItems.length === 0) {
        hasMore = false;
        break;
      }

      for (const item of mediaItems) {
        // Extract source_url from media item
        const sourceUrl = item.source_url || item.guid?.rendered || item.url;
        if (sourceUrl && typeof sourceUrl === 'string') {
          // Only include image files
          const ext = getExtensionFromUrl(sourceUrl);
          const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico', 'bmp', 'tiff', 'avif', 'heic'];
          if (imageExts.includes(ext)) {
            imageUrls.push(sourceUrl);
          }
        }
      }

      console.log(`  Page ${page}: ${mediaItems.length} items, ${imageUrls.length} total images`);
      page++;

      // Small delay to be nice to the server
      if (hasMore) {
        await sleep(100);
      }
    } catch (error) {
      console.error(`  Error fetching page ${page}:`, (error as Error).message);
      hasMore = false;
    }
  }

  console.log(`  Total images from Media API: ${imageUrls.length}`);
  return imageUrls;
}

/**
 * Crawl pages for images using Cheerio
 */
async function crawlPagesForImages(): Promise<string[]> {
  console.log('\n=== Crawling pages for images ===');

  // Load pages list
  const pagesContent = await fs.readFile(PAGES_JSON_PATH, 'utf-8');
  const pages: PageEntry[] = JSON.parse(pagesContent);

  const imageUrls = new Set<string>();

  for (const page of pages) {
    try {
      const response = await fetch(page.url);
      if (!response.ok) {
        console.warn(`  Skipping ${page.url}: HTTP ${response.status}`);
        continue;
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Find all img tags with src
      $('img[src]').each((_, el) => {
        const src = $(el).attr('src');
        if (src) {
          // Resolve relative URLs
          const absoluteUrl = src.startsWith('http') ? src : new URL(src, page.url).href;
          imageUrls.add(absoluteUrl);
        }
      });

      // Find img tags with data-src (lazy loading)
      $('img[data-src]').each((_, el) => {
        const dataSrc = $(el).attr('data-src');
        if (dataSrc) {
          const absoluteUrl = dataSrc.startsWith('http') ? dataSrc : new URL(dataSrc, page.url).href;
          imageUrls.add(absoluteUrl);
        }
      });

      // Find img tags with srcset
      $('img[srcset]').each((_, el) => {
        const srcset = $(el).attr('srcset');
        if (srcset) {
          // Parse srcset (format: "url1 1x, url2 2x")
          const sources = srcset.split(',').map(s => s.trim().split(/\s+/)[0]);
          for (const src of sources) {
            if (src) {
              const absoluteUrl = src.startsWith('http') ? src : new URL(src, page.url).href;
              imageUrls.add(absoluteUrl);
            }
          }
        }
      });

      // Find picture source elements with srcset
      $('picture source[srcset]').each((_, el) => {
        const srcset = $(el).attr('srcset');
        if (srcset) {
          const sources = srcset.split(',').map(s => s.trim().split(/\s+/)[0]);
          for (const src of sources) {
            if (src) {
              const absoluteUrl = src.startsWith('http') ? src : new URL(src, page.url).href;
              imageUrls.add(absoluteUrl);
            }
          }
        }
      });

      console.log(`  Crawled ${page.url}: ${imageUrls.size} unique images so far`);

      // Small delay to be nice to the server
      await sleep(100);
    } catch (error) {
      console.error(`  Error crawling ${page.url}:`, (error as Error).message);
    }
  }

  // Filter to only image URLs
  const imageArray = Array.from(imageUrls).filter(url => {
    const ext = getExtensionFromUrl(url);
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico', 'bmp', 'tiff', 'avif', 'heic'];
    return imageExts.includes(ext);
  });

  console.log(`  Total images from HTML crawling: ${imageArray.length}`);
  return imageArray;
}

/**
 * Download all images with deduplication
 */
async function downloadAllImages(): Promise<RawImagesCatalog> {
  console.log('\n========================================');
  console.log('  Image Download Script');
  console.log('========================================');

  // Ensure output directory exists
  await ensureDir(RAW_IMAGES_DIR);

  // Get images from both sources
  const mediaApiUrls = await fetchWordPressMedia(SOURCE_URL);
  const htmlCrawlUrls = await crawlPagesForImages();

  // Combine all URLs
  const allUrls = new Set<string>();
  mediaApiUrls.forEach(url => allUrls.add(url));
  htmlCrawlUrls.forEach(url => allUrls.add(url));

  console.log(`\n=== Starting download of ${allUrls.size} unique images ===`);

  const images: RawImageEntry[] = [];
  const seenHashes = new Map<string, string>(); // hash -> sourceUrl
  let duplicatesFound = 0;
  let totalBytes = 0;
  let mediaApiCount = 0;
  let htmlCrawlCount = 0;
  let errorCount = 0;

  // Process each URL
  let processed = 0;
  for (const url of allUrls) {
    processed++;

    try {
      // Download image
      const buffer = await downloadImageWithRetry(url);

      // Calculate hash
      const hash = calculateHash(buffer);

      // Check for duplicates
      if (seenHashes.has(hash)) {
        duplicatesFound++;
        const originalUrl = seenHashes.get(hash)!;
        console.log(`  [${processed}/${allUrls.size}] Duplicate: ${hash.slice(0, 8)}... (same as ${originalUrl})`);
        continue;
      }
      seenHashes.set(hash, url);

      // Determine file extension
      const ext = getExtensionFromUrl(url);

      // Extract metadata
      const metadata = await extractMetadata(buffer, ext);

      // Save file
      const filename = `${hash}.${ext}`;
      const localPath = path.join(RAW_IMAGES_DIR, filename);
      await fs.writeFile(localPath, buffer);
      totalBytes += buffer.length;

      // Determine discovery method
      const method: 'media-api' | 'html-crawl' = mediaApiUrls.includes(url) ? 'media-api' : 'html-crawl';
      if (method === 'media-api') mediaApiCount++;
      else htmlCrawlCount++;

      // Add to catalog
      images.push({
        sourceUrl: url,
        hash,
        localPath: `.planning/audit/images/raw/${filename}`,
        method,
        metadata,
      });

      // Log progress every 10 images
      if (processed % 10 === 0) {
        console.log(`  [${processed}/${allUrls.size}] Downloaded: ${hash.slice(0, 8)}... (${metadata.width}x${metadata.height} ${metadata.format})`);
      } else {
        console.log(`  [${processed}/${allUrls.size}] ${hash.slice(0, 8)}... (${metadata.width}x${metadata.height} ${metadata.format})`);
      }
    } catch (error) {
      errorCount++;
      console.error(`  [${processed}/${allUrls.size}] ERROR: ${url} - ${(error as Error).message}`);
    }
  }

  // Create catalog
  const catalog: RawImagesCatalog = {
    generated: new Date().toISOString(),
    sourceUrl: SOURCE_URL,
    images,
    summary: {
      totalImages: images.length,
      duplicatesFound,
      totalBytes,
      byMethod: {
        mediaApi: mediaApiCount,
        htmlCrawl: htmlCrawlCount,
      },
    },
  };

  console.log('\n========================================');
  console.log('  Download Complete');
  console.log('========================================');
  console.log(`  Total images downloaded: ${images.length}`);
  console.log(`  Duplicates skipped: ${duplicatesFound}`);
  console.log(`  Errors: ${errorCount}`);
  console.log(`  Total size: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  From Media API: ${mediaApiCount}`);
  console.log(`  From HTML crawl: ${htmlCrawlCount}`);
  console.log(`  Saved to: ${RAW_IMAGES_DIR}`);

  return catalog;
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const catalog = await downloadAllImages();

  // Write catalog
  await fs.writeFile(CATALOG_OUTPUT_PATH, JSON.stringify(catalog, null, 2));
  console.log(`\nCatalog written to: ${CATALOG_OUTPUT_PATH}`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
