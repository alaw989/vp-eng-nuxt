# Phase 3: Image Migration - Research

**Researched:** 2026-02-05
**Domain:** Node.js image processing, WordPress Media API, web scraping, deduplication
**Confidence:** HIGH

## Summary

Phase 3 involves downloading all images from the source WordPress site (vp-associates.com), optimizing them for web performance, and organizing them for use in the new Nuxt application. Research confirms the standard stack is Sharp for image processing (high performance, Node-API based), Cheerio for HTML parsing, and the built-in Node.js crypto module for SHA-256 hashing.

The WordPress REST API provides comprehensive media enumeration with pagination support (`per_page` up to 100, `page` parameter for iteration). Images should be discovered via both the Media API and HTML crawling to maximize coverage.

For deduplication, SHA-256 hashing provides exact duplicate detection. Context decisions require storing duplicates in a shared folder with context prefixes. WebP should be the primary output format with JPG fallback for older browser compatibility. AVIF support exists in Sharp but should be considered optional given the context decision specifies "WebP + JPG fallback."

**Primary recommendation:** Use Sharp for all image processing (download, resize, convert to WebP/JPG), implement SHA-256 hashing for deduplication, and use both WordPress Media API and HTML page crawling with Cheerio for comprehensive image discovery.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `sharp` | ^0.33.x | High-performance Node.js image processing | Node-API based, 4-5x faster than ImageMagick, industry standard |
| `cheerio` | ^1.2.0 | HTML parsing for image URL extraction | jQuery-like syntax, fast, zero dependencies, already in project |
| `crypto` | (built-in) | SHA-256 hashing for deduplication | Native Node.js module, no dependencies required |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@nuxt/image` | ^2.0.0 | Runtime image optimization in Nuxt | Already installed, use for runtime delivery of pre-processed images |
| `tsx` | ^4.21.0 | TypeScript execution for scripts | Already in project, consistent with existing scripts |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Sharp | Jimp, ImageMagick | Much slower performance, higher memory usage |
| SHA-256 | Perceptual hashing (pHash/dHash) | Perceptual detects near-duplicates but adds complexity; SHA-256 exact match is simpler for this use case |
| Pre-processing | Nuxt Image runtime-only | Runtime processing adds server load; pre-processing ensures consistent optimization |

**Installation:**
```bash
npm install sharp  # Already has cheerio, @nuxt/image, tsx
```

**Note:** Sharp may require native dependencies (libvips). Use `npm install sharp` and it will download prebuilt binaries for Linux x64.

## Architecture Patterns

### Recommended Project Structure

```
public/images/
├── hero/              # Hero/background images
│   ├── hero-home-640w.webp
│   ├── hero-home-640w.jpg
│   ├── hero-home-1280w.webp
│   ├── hero-home-1280w.jpg
│   ├── hero-home-1920w.webp
│   └── hero-home-1920w.jpg
├── projects/          # Project/portfolio images
│   ├── project-bridge-640w.webp
│   ├── project-bridge-640w.jpg
│   └── ...
├── team/              # Team member headshots
│   ├── team-john-doe-640w.webp
│   └── ...
├── services/          # Service-related images
├── shared/            # Deduplicated shared images
│   ├── shared-hero-home-640w.webp
│   ├── shared-logo-640w.webp
│   └── ...
└── image-mapping.json # Source URL to local path mapping
```

### Pattern 1: Image Download with Retry

**What:** Download images with exponential backoff retry logic for network resilience.

**When to use:** All image download operations to handle transient network failures.

**Example:**
```typescript
// Source: Research based on WordPress REST API documentation
async function downloadImage(url: string, maxRetries = 3): Promise<Buffer> {
  let attempt = 0;
  let delay = 1000; // Start with 1 second

  while (attempt < maxRetries) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        throw error;
      }
      // Exponential backoff: 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
  throw new Error('Max retries exceeded');
}
```

### Pattern 2: Sharp Pipeline for Multiple Output Variants

**What:** Use Sharp's `clone()` method to generate multiple sizes and formats from a single input.

**When to use:** Generating responsive srcset variants and format fallbacks.

**Example:**
```typescript
// Source: Context7 - /lovell/sharp
import sharp from 'sharp';

async function generateVariants(
  inputBuffer: Buffer,
  outputPath: string,
  sizes: number[] = [640, 1280, 1920]
): Promise<void> {
  const pipeline = sharp(inputBuffer);

  const promises = sizes.map(size =>
    Promise.all([
      // WebP output
      pipeline.clone()
        .resize(size, null, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(`${outputPath}-${size}w.webp`),

      // JPG fallback
      pipeline.clone()
        .resize(size, null, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(`${outputPath}-${size}w.jpg`)
    ])
  );

  await Promise.all(promises);
}
```

### Pattern 3: SHA-256 Hashing for Deduplication

**What:** Calculate SHA-256 hash of image buffer to identify exact duplicates.

**When to use:** Before processing each image to check if it was already downloaded.

**Example:**
```typescript
import { createHash } from 'crypto';

function getImageHash(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

// Deduplication map
const processedImages = new Map<string, string>(); // hash -> local path

async function processImage(url: string, buffer: Buffer): Promise<string> {
  const hash = getImageHash(buffer);

  if (processedImages.has(hash)) {
    console.log(`Duplicate found: ${url}`);
    return processedImages.get(hash)!; // Return existing path
  }

  // Process and save new image
  const localPath = await saveImage(buffer);
  processedImages.set(hash, localPath);
  return localPath;
}
```

### Pattern 4: WordPress Media API Enumeration

**What:** Paginate through WordPress Media API to discover all uploaded images.

**When to use:** Initial discovery phase to get media library contents.

**Example:**
```typescript
// Source: WordPress REST API documentation
interface WpMediaItem {
  id: number;
  source_url: string;
  media_type: 'image' | 'file';
  mime_type: string;
  alt_text?: string;
  caption?: { rendered: string };
}

async function fetchAllMedia(baseUrl: string): Promise<WpMediaItem[]> {
  const allMedia: WpMediaItem[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const url = `${baseUrl}/wp-json/wp/v2/media?per_page=${perPage}&page=${page}`;
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 400) {
        // Page out of range - no more results
        break;
      }
      throw new Error(`Failed to fetch media: ${response.status}`);
    }

    const items: WpMediaItem[] = await response.json();
    if (items.length === 0) break;

    allMedia.push(...items);
    page++;
  }

  return allMedia;
}
```

### Pattern 5: HTML Image Extraction with Lazy Loading

**What:** Extract image URLs from HTML including `data-src` lazy-loaded attributes.

**When to use:** Crawling pages to find images not in Media API.

**Example:**
```typescript
import * as cheerio from 'cheerio';

function extractImageUrls(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const urls = new Set<string>();

  // Standard src attribute
  $('img[src]').each((_, el) => {
    urls.add($(el).attr('src')!);
  });

  // Lazy loading with data-src
  $('img[data-src]').each((_, el) => {
    urls.add($(el).attr('data-src')!);
  });

  // srcset for responsive images
  $('img[srcset]').each((_, el) => {
    const srcset = $(el).attr('srcset')!;
    srcset.split(',').forEach(part => {
      const url = part.trim().split(' ')[0];
      urls.add(url);
    });
  });

  // picture element sources
  $('picture source[srcset]').each((_, el) => {
    const srcset = $(el).attr('srcset')!;
    srcset.split(',').forEach(part => {
      const url = part.trim().split(' ')[0];
      urls.add(url);
    });
  });

  return Array.from(urls)
    .filter(url => url.startsWith('http'))
    .map(url => new URL(url, baseUrl).href);
}
```

### Anti-Patterns to Avoid

- **Processing images sequentially:** Use `Promise.all()` or `Promise.allSettled()` for parallel processing
- **Downloading without size limits:** Check image dimensions before download to avoid massive files
- **Ignoring network failures:** Implement proper retry logic with exponential backoff
- **Storing duplicates:** Always hash and deduplicate before saving
- **Generating all sizes for tiny images:** Use `withoutEnlargement: true` in Sharp resize

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image format conversion | Custom buffer processing | `sharp.webp()`, `sharp.jpeg()` | Handles encoding, quality, chroma subsampling automatically |
| Image resizing | Manual pixel manipulation | `sharp.resize()` | Proper aspect ratio, filtering kernels, memory efficient |
| Responsive variants | Loop with different sizes | `sharp.clone().resize()` | Single-pass processing, memory efficient |
| Hash calculation | Custom hash function | Node.js `crypto` module | Battle-tested, FIPS compliant, fast |
| HTML parsing | Regex for img tags | Cheerio | Handles malformed HTML, CSS selectors, already installed |
| Retry logic | Custom exponential backoff | Simple async pattern | Standard pattern, easier to debug |

**Key insight:** Image processing has many edge cases (color profiles, EXIF orientation, ICC profiles, progressive encoding). Sharp handles these correctly based on libvips, which processes billions of images in production.

## Common Pitfalls

### Pitfall 1: Downloading All Pages Without Rate Limiting

**What goes wrong:** WordPress sites may throttle or block rapid requests, causing failures mid-process.

**Why it happens:** Making hundreds of requests without delays triggers rate limiting.

**How to avoid:** Add a small delay between page requests or use concurrency limiting.

**Warning signs:** Intermittent 403/429 errors, timeouts starting after many successful requests.

```typescript
// Add delay between requests
async function fetchWithDelay(url: string): Promise<Response> {
  await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
  return fetch(url);
}
```

### Pitfall 2: Not Handling Lazy-Loaded Images

**What goes wrong:** Images loaded via JavaScript (data-src, Intersection Observer) are missed during HTML crawling.

**Why it happens:** Static HTML parsing only sees the initial DOM, not post-JavaScript state.

**How to avoid:** Check for `data-src`, `data-lazy-src`, and similar attributes.

**Warning signs:** Fewer images found than expected, missing obvious hero images.

### Pitfall 3: Ignoring Image Orientation (EXIF)

**What goes wrong:** Images with EXIF orientation metadata display incorrectly (rotated/sideways).

**Why it happens:** Resize operations don't auto-rotate by default.

**How to avoid:** Sharp's `rotate()` with no parameters auto-orients based on EXIF.

**Warning signs:** Portrait photos appearing landscape, rotated thumbnails.

```typescript
// Auto-orient based on EXIF
sharp(input).rotate().resize(width).toFile(output);
```

### Pitfall 4: File Size Over Quality Focus

**What goes wrong:** Over-compression creates visible artifacts, defeating the purpose of image migration.

**Why it happens:** Focusing only on file size targets without visual verification.

**How to avoid:** Start with 80% quality (Sharp's default for WebP), verify visually, then adjust.

**Warning signs:** Visible compression artifacts on gradients, text, or edges.

### Pitfall 5: Duplicates Stored Multiple Times

**What goes wrong:** Same image saved in multiple folders, wasting storage and CDN bandwidth.

**Why it happens:** Hashing happens after saving instead of before.

**How to avoid:** Always hash first, check deduplication map, then process.

**Warning signs:** Unusually high total file size, identical files in different folders.

## Code Examples

Verified patterns from official sources:

### Download and Process Single Image

```typescript
// Source: Context7 - /lovell/sharp + custom download logic
import sharp from 'sharp';
import { createHash } from 'crypto';
import * as fs from 'fs/promises';

interface ProcessedImage {
  hash: string;
  localPath: string;
  variants: string[];
  sourceUrl: string;
}

async function downloadAndProcessImage(
  sourceUrl: string,
  outputDir: string,
  filename: string
): Promise<ProcessedImage> {
  // Download with retry
  const buffer = await downloadImage(sourceUrl);

  // Calculate hash for deduplication
  const hash = createHash('sha256').update(buffer).digest('hex');

  // Get metadata for classification
  const metadata = await sharp(buffer).metadata();
  const isHero = metadata.width! >= 1920;
  const isTeam = filename.toLowerCase().includes('team');

  // Determine output path
  const category = isHero ? 'hero' : isTeam ? 'team' : 'projects';
  const basePath = `${outputDir}/${category}/${filename}`;

  // Generate variants
  const sizes = [640, 1280, 1920];
  const variants: string[] = [];

  for (const size of sizes) {
    const webpPath = `${basePath}-${size}w.webp`;
    const jpgPath = `${basePath}-${size}w.jpg`;

    await sharp(buffer)
      .resize(size, null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toFile(webpPath);

    await sharp(buffer)
      .resize(size, null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 })
      .toFile(jpgPath);

    variants.push(webpPath, jpgPath);
  }

  return {
    hash,
    localPath: basePath,
    variants,
    sourceUrl,
  };
}
```

### Batch Processing with Concurrency Control

```typescript
// Source: Best practices for parallel processing
async function processBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  concurrency: number = 5
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(
      batch.map(processor)
    );

    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error('Processing failed:', result.reason);
      }
    }
  }

  return results;
}

// Usage: Process 5 images concurrently
const results = await processBatch(
  imageUrls,
  (url) => downloadAndProcessImage(url, outputDir, getFilename(url)),
  5
);
```

### Image Mapping File Structure

```typescript
// Source: Based on context requirements
interface ImageMapping {
  generated: string;
  sourceUrl: string;
  images: ImageEntry[];
  summary: {
    totalImages: number;
    duplicatesSkipped: number;
    totalSize: number;
    byCategory: Record<string, number>;
  };
}

interface ImageEntry {
  sourceUrl: string;
  hash: string;
  localPath: string;
  variants: {
    webp: string[];
    jpg: string[];
  };
  categories: string[];
  metadata: {
    width: number;
    height: number;
    format: string;
    sizeBytes: number;
  };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ImageMagick CLI | Sharp (Node-API) | ~2016-2020 | 4-5x faster, lower memory |
| Single-size images | Responsive srcset | ~2018 | Better mobile UX, bandwidth savings |
| JPEG-only | WebP primary, JPG fallback | ~2021 | 25-35% size reduction |
| Runtime-only optimization | Pre-processing with runtime delivery | ~2023 | Zero server overhead at runtime |
| AVIF experimental | AVIF broadly supported | ~2024 | Optional: 50% smaller than WebP |

**Deprecated/outdated:**
- **ImageMagick CLI for Node.js:** Replaced by Sharp for performance
- **GM (GraphicsMagick):** No longer maintained, replaced by Sharp
- **pure-JS image libraries:** Too slow for production use
- **base64 data URIs for images:** Avoid except for tiny icons (<2KB)

## Open Questions

1. **AVIF Support Level**
   - What we know: Sharp supports AVIF, browser support is ~95% in 2026, but context decision specifies "WebP + JPG fallback"
   - What's unclear: Should we generate AVIF as an optional third format?
   - Recommendation: **Skip AVIF for this phase** - context decision explicitly specifies WebP+JPG. Can add AVIF later as enhancement.

2. **Maximum Dimension for Resize**
   - What we know: Context suggests 1920px, common breakpoint for desktop
   - What's unclear: Are any source images larger than 1920px that need preserving?
   - Recommendation: **Use 1920px max with `fit: 'inside'`** - this preserves aspect ratio and doesn't enlarge smaller images.

3. **Minimum File Size Threshold**
   - What we know: Tiny icons (<5KB) may not benefit from WebP conversion
   - What's unclear: Should we skip processing very small files?
   - Recommendation: **Process all images regardless of size** - consistency is more valuable than optimization for tiny files.

## Sources

### Primary (HIGH confidence)

- **/lovell/sharp** - WebP output options, AVIF output options, resize operations, metadata access, clone pipeline for batch processing
- **WordPress REST API Documentation** - Media endpoint schema, pagination parameters (`page`, `per_page`), header fields (`X-WP-Total`, `X-WP-TotalPages`)
- **Node.js crypto module** - Built-in SHA-256 hashing

### Secondary (MEDIUM confidence)

- [Can I Use AVIF](https://caniuse.com/avif) - AVIF browser compatibility (95%+ support as of 2026)
- [AVIF Format Adoption Guide 2026](https://orquitool.com/en/blog/avif-format-adoption-browser-compatibility-2026) - Current AVIF adoption status
- [MDN Image Types Guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types) - Browser support for image formats
- [How to Use Needle for HTTP Requests in 2026](https://roundproxies.com/blog/needle/) - HTTP retry patterns

### Tertiary (LOW confidence)

- Various blog posts on image lazy loading and data-src attributes (verified against official MDN documentation)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via Context7 or official documentation
- Architecture: HIGH - Patterns derived from official library documentation and existing project patterns
- Pitfalls: MEDIUM - Some based on common web development knowledge, verified where possible

**Research date:** 2026-02-05
**Valid until:** 2026-05-05 (3 months - Sharp is stable, WordPress API is mature)
