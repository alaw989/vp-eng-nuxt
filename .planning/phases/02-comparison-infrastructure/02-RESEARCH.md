# Phase 2: Comparison Infrastructure - Research

**Researched:** 2026-02-04
**Domain:** Visual regression testing and HTML content comparison tools
**Confidence:** HIGH

## Summary

This phase builds developer tools for visual regression testing and HTML content verification. The comparison infrastructure enables: (1) visual verification that the new design looks good, (2) catching unintended regressions during development, and (3) providing a reference for what the old site looked like.

Based on research of current libraries and best practices for 2026, the standard approach combines:
- **ODiff** for ultra-fast pixel-level image comparison with native SIMD performance
- **Pixelmatch** as the well-established fallback (used internally by Playwright)
- **Express** for a simple local web server to serve comparison results
- **Cheerio** for HTML content verification via CSS selectors

**Primary recommendation:** Use `odiff-bin` for pixel diff generation with its Node.js API, build a simple Express-based web viewer for side-by-side image comparison, and use Cheerio selectors for content verification.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **odiff-bin** | Latest | Ultra-fast pixel-level image comparison | Native SIMD implementation, 6x faster than pixelmatch/ImageMagick, supports ignore regions, configurable threshold, diff color customization |
| **pixelmatch** | ^7.1.0 | Pixel-level image comparison (fallback/verification) | Used by Playwright internally, widely adopted, pure JS, no dependencies |
| **express** | ^4.19.0 | Local web server for comparison viewer | De facto standard for Node.js HTTP servers, built-in `express.static` for serving files |
| **cheerio** | ^1.0.0 (already installed) | HTML parsing and content verification | jQuery-like syntax, fast, already in project dependencies |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **pngjs** | ^7.0.0 | PNG encoding/decoding for pixelmatch | Required when using pixelmatch directly (not needed for odiff) |
| **open** | ^8.4.0 | Cross-platform browser opening | Launch browser from Node script automatically |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| odiff-bin | pixelmatch + pngjs | Odiff is 6x faster; pixelmatch is pure JS but slower |
| odiff-bin | ImageMagick | Odiff is 6-8x faster with simpler Node API |
| Express custom viewer | Playwright native toHaveScreenshot | Playwright's built-in is test-focused, not an interactive viewer |
| Custom Express | playwright-odiff plugin | Plugin couples to Playwright test framework; we need standalone tools |

**Installation:**
```bash
npm install odiff-bin express open pngjs
```

## Architecture Patterns

### Recommended Project Structure

```
.planning/
├── scripts/
│   ├── capture-baselines.ts      # (existing - from Phase 1)
│   ├── generate-comparison.ts    # NEW: capture new screenshots + generate diffs
│   └── compare-html.ts           # NEW: HTML content verification
├── comparison-viewer/
│   ├── index.html                # Main viewer UI
│   ├── viewer.css                # Viewer styling
│   └── viewer.js                 # Client-side comparison logic
├── comparisons/                  # Generated comparison results
│   └── YYYY-MM-DD_HH-mm-ss/      # Timestamped run directories
│       ├── comparison.json       # Metadata about this comparison
│       ├── home/
│       │   ├── mobile/
│       │   │   ├── baseline.png  # Old site (from Phase 1)
│       │   │   ├── current.png   # New site (fresh capture)
│       │   │   └── diff.png      # Generated diff overlay
│       │   ├── tablet/...
│       │   └── desktop/...
│       └── [other pages]/
└── audit/
    └── baselines/               # Old site baselines (from Phase 1)
```

### Pattern 1: ODiff Comparison API

**What:** Use odiff-bin's Node.js API for fast image comparison with configurable thresholds and ignore regions.

**When to use:** Generating pixel diff overlays between baseline and current screenshots.

**Example:**

```typescript
// Source: https://github.com/dmtrKovalenko/odiff
import { compare } from 'odiff-bin';

const result = await compare(
  'path/to/baseline.png',
  'path/to/current.png',
  'path/to/diff.png',
  {
    // Color used to highlight different pixels (hex format)
    diffColor: '#cd2cc9',  // magenta/pink
    threshold: 0.1,        // Color difference threshold (0-1)
    antialiasing: true,    // Don't count anti-aliased pixels as diffs
    ignoreRegions: [
      // Exclude dynamic content areas
      { x1: 100, y1: 50, x2: 300, y2: 80 }  // e.g., timestamp area
    ]
  }
);

// Result type: { match: boolean, reason?: string, diffCount?: number, diffPercentage?: number }
if (!result.match && result.reason === 'pixel-diff') {
  console.log(`Found ${result.diffCount} different pixels (${result.diffPercentage}%)`);
}
```

### Pattern 2: ODiff Server for Batch Processing

**What:** Use ODiffServer for multiple comparisons to avoid process spawn overhead.

**When to use:** Comparing many images (36 screenshots = 12 pages x 3 viewports) in a single run.

**Example:**

```typescript
// Source: https://github.com/dmtrKovalenko/odiff
import { ODiffServer } from 'odiff-bin';

const odiffServer = new ODiffServer();

// Process all comparisons
for (const page of pages) {
  for (const viewport of ['mobile', 'tablet', 'desktop']) {
    const { match, diffCount } = await odiffServer.compare(
      baselinePath,
      currentPath,
      diffPath,
      { threshold: 0.1 }
    );
  }
}

// Server auto-cleans on exit, or call explicitly
// odiffServer.stop();
```

### Pattern 3: Express Static Server for Viewer

**What:** Use Express with `express.static` to serve comparison images and viewer HTML.

**When to use:** Running the local web-based comparison viewer.

**Example:**

```typescript
// Source: https://expressjs.com/en/starter/static-files.html
import express from 'express';
import path from 'path';

const app = express();
const PORT = 4321;

// Serve comparison images
app.use('/comparisons', express.static(
  path.join(process.cwd(), '.planning', 'comparisons')
));

// Serve viewer HTML/JS/CSS
app.use('/', express.static(
  path.join(process.cwd(), '.planning', 'comparison-viewer')
));

// API endpoint to list available comparisons
app.get('/api/comparisons', (req, res) => {
  // Return list of comparison runs and their metadata
  const comparisons = fs.readdirSync(comparisonsDir);
  res.json(comparisons);
});

app.listen(PORT, () => {
  console.log(`Comparison viewer: http://localhost:${PORT}`);
});
```

### Pattern 4: HTML Content Verification with Cheerio

**What:** Use Cheerio's CSS selectors to verify semantic content exists.

**When to use:** Checking that important content (headings, navigation, etc.) is present.

**Example:**

```typescript
// Source: https://cheerio.js.org/docs/basics/selecting/
import * as cheerio from 'cheerio';
import fs from 'fs';

const html = fs.readFileSync('output.html', 'utf-8');
const $ = cheerio.load(html);

// Findings array for textual report
const findings: string[] = [];

// Check for semantic elements
const hasH1 = $('h1').length > 0;
if (!hasH1) findings.push('Missing: h1 heading');

const hasNav = $('nav').length > 0;
if (!hasNav) findings.push('Missing: nav element');

const hasMain = $('main').length > 0;
if (!hasMain) findings.push('Missing: main element');

const hasFooter = $('footer').length > 0;
if (!hasFooter) findings.push('Missing: footer element');

// Check for specific text content using :contains()
const hasSpecificText = $('body:contains("VP Associates")').length > 0;

// Count important elements
const headingCount = $('h1, h2, h3, h4, h5, h6').length;
findings.push(`Found ${headingCount} headings`);

// Output textual report
console.log('HTML Content Verification Report:');
console.log(findings.join('\n'));
```

### Pattern 5: Opening Browser from Node Script

**What:** Use the `open` package to automatically launch the default browser.

**When to use:** After generating comparison results, automatically open viewer.

**Example:**

```typescript
// Cross-platform browser opening
import open from 'open';

// Open the comparison viewer
await open('http://localhost:4321');
```

### Anti-Patterns to Avoid

- **Hand-rolling pixel diff algorithms:** Use odiff-bin or pixelmatch instead. Building image processing from scratch is error-prone and slow.
- **Using Playwright's built-in toHaveScreenshot for this use case:** Playwright's visual testing is designed for CI/CD test assertions, not interactive developer tools. It produces binary pass/fail results, not viewable diff overlays.
- **Complex web frameworks for viewer:** Keep viewer simple with vanilla HTML/JS/CSS. No need for Vue/React for a single-page developer tool.
- **Coupling comparison tools to test framework:** Build standalone scripts that can run independently, not tied to Playwright Test or similar.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Pixel-level image comparison | Manual pixel array iteration with threshold logic | `odiff-bin` or `pixelmatch` | Edge cases: anti-aliasing detection, YIQ color space for perceptual differences, different image formats, ignore regions |
| PNG encoding/decoding | Custom PNG parser/writer | `pngjs` (for pixelmatch) | PNG format complexity: compression, filtering, color types |
| HTTP file server | Custom http/server or other low-level approach | `express.static` | MIME types, ETags, range requests, proper headers handled automatically |
| Cross-platform browser opening | Platform-specific commands (`open`, `start`, `xdg-open`) | `open` npm package | Handles Windows, macOS, Linux differences automatically |

**Key insight:** Image comparison seems straightforward (just compare pixels!), but production-quality diff tools need anti-aliasing detection, perceptual color spaces (YIQ), format handling, and region exclusion. Building this correctly is hundreds of lines of code. ODiff achieves this through native SIMD-optimized code.

## Common Pitfalls

### Pitfall 1: Image Dimension Mismatch

**What goes wrong:** Comparison fails with "images have different dimensions" error.

**Why it happens:** New site screenshots may be slightly different dimensions due to layout changes, scroll height variations, or viewport rendering differences.

**How to avoid:**
- ODiff handles different layouts automatically with `failOnLayoutDiff: false` option
- For pixelmatch, ensure images are the same size before comparison (resize if needed)
- Capture screenshots with consistent viewport sizes

**Warning signs:** All comparisons fail with layout errors immediately after first run.

### Pitfall 2: Anti-Aliasing False Positives

**What goes wrong:** Massive diff counts from anti-aliased edges (text, borders) that render slightly differently.

**Why it happens:** Browser sub-pixel rendering varies between runs, especially on different hardware.

**How to avoid:**
- Enable anti-aliasing detection: `antialiasing: true` in ODiff
- Use `includeAA: false` in pixelmatch (default)
- Consider slightly higher threshold (0.1-0.2) for more lenient comparison

**Warning signs:** Diff shows scattered pixels around text and borders, not actual content changes.

### Pitfall 3: Dynamic Content Causing Constant Diffs

**What goes wrong:** Dates, timestamps, random IDs, or animated content cause every comparison to show differences.

**Why it happens:** Content changes on every page load or screenshot capture.

**How to avoid:**
- Use `ignoreRegions` to exclude dynamic areas from comparison
- For dates/times, consider mocking them during screenshot capture
- Pause/hide animations before capturing

**Warning signs:** Same area shows differences on every run regardless of actual changes.

### Pitfall 4: Full Page Screenshot Height Differences

**What goes wrong:** Full page screenshots (`fullPage: true`) have different heights due to content rendering variations.

**Why it happens:** Font loading, image rendering, or dynamic content height changes between captures.

**How to avoid:**
- Set `failOnLayoutDiff: false` in ODiff to allow dimension differences
- Consider viewport-only screenshots instead of full page for more consistent comparisons
- Add wait conditions for font/image loading before capture

**Warning signs:** Layout-diff errors or one image is visibly taller than the other.

### Pitfall 5: Cheerio Not Finding Content

**What goes wrong:** Content verification reports "missing" elements that actually exist.

**Why it happens:**
- Cheerio parses static HTML; client-side rendered content won't be present
- Selector syntax errors or misunderstanding of Cheerio vs jQuery differences

**How to avoid:**
- Remember Cheerio is for static HTML parsing only (not browser execution)
- Use Playwright for content verification if client-side rendering is involved
- Test selectors manually before using in verification script

**Warning signs:** All content checks fail despite visible content in browser.

## Code Examples

Verified patterns from official sources:

### ODiff Comparison with Threshold

```typescript
// Source: https://github.com/dmtrKovalenko/odiff
import { compare } from 'odiff-bin';

async function generateDiff(
  baseline: string,
  current: string,
  output: string
): Promise<{ match: boolean; diffCount?: number; diffPercentage?: number }> {
  const result = await compare(baseline, current, output, {
    threshold: 0.1,           // 10% color difference threshold
    diffColor: '#cd2cc9',     // magenta for diffs
    antialiasing: true,       // Ignore anti-aliased pixel differences
    outputDiffMask: false,    // Overlay on original image, not transparent mask
    diffOverlay: true,        // White shaded overlay for easier reading
    failOnLayoutDiff: false   // Allow different image dimensions
  });

  return result;
}
```

### Pixelmatch Fallback Pattern

```typescript
// Source: https://github.com/mapbox/pixelmatch
import fs from 'fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

function generateDiffWithPixelmatch(
  baselinePath: string,
  currentPath: string,
  diffPath: string
): number {
  const img1 = PNG.sync.read(fs.readFileSync(baselinePath));
  const img2 = PNG.sync.read(fs.readFileSync(currentPath));
  const { width, height } = img1;
  const diff = new PNG({ width, height });

  const numDiffPixels = pixelmatch(
    img1.data,
    img2.data,
    diff.data,
    width,
    height,
    {
      threshold: 0.1,           // Matching threshold (0-1)
      includeAA: false,         // Detect and ignore anti-aliased pixels
      alpha: 0.1,               // Blending factor for unchanged pixels
      diffColor: [255, 0, 0],   // Red for differing pixels (RGB)
      aaColor: [255, 255, 0],   // Yellow for anti-aliased pixels
      diffMask: false           // Draw diff over original image
    }
  );

  fs.writeFileSync(diffPath, PNG.sync.write(diff));
  return numDiffPixels;
}
```

### Cheerio Content Verification Pattern

```typescript
// Source: https://cheerio.js.org/docs/basics/selecting/
import * as cheerio from 'cheerio';

interface ContentCheck {
  selector: string;
  description: string;
  exists: boolean;
  text?: string;
}

function verifyContent(html: string, checks: ContentCheck[]): string[] {
  const $ = cheerio.load(html);
  const findings: string[] = [];

  for (const check of checks) {
    const $element = $(check.selector);
    check.exists = $element.length > 0;

    if (!check.exists) {
      findings.push(`MISSING: ${check.description} (${check.selector})`);
    } else if (check.text) {
      const elementText = $element.text();
      const hasText = elementText.includes(check.text);
      if (!hasText) {
        findings.push(`CONTENT: ${check.description} missing text "${check.text}"`);
      } else {
        findings.push(`OK: ${check.description} found`);
      }
    } else {
      findings.push(`OK: ${check.description} found`);
    }
  }

  return findings;
}

// Usage
const findings = verifyContent(html, [
  { selector: 'h1', description: 'Main heading' },
  { selector: 'nav', description: 'Navigation' },
  { selector: 'main', description: 'Main content area' },
  { selector: 'footer', description: 'Footer' },
  { selector: 'h1:contains("VP Associates")', description: 'Title with company name' }
]);
```

### Express Server with Auto-Browser Launch

```typescript
// Source: https://expressjs.com/en/starter/static-files.html
import express from 'express';
import path from 'path';
import open from 'open';

async function startViewer(comparisonsPath: string): Promise<void> {
  const app = express();
  const PORT = 4321;

  // Serve comparison images
  app.use('/comparisons', express.static(comparisonsPath));

  // Serve viewer UI
  const viewerPath = path.join(process.cwd(), '.planning', 'comparison-viewer');
  app.use(express.static(viewerPath));

  const server = app.listen(PORT, () => {
    console.log(`Comparison viewer running at http://localhost:${PORT}`);
  });

  // Auto-open browser
  await open(`http://localhost:${PORT}`);

  // Keep server running - user closes when done
  // In practice, might add a shutdown endpoint or key press handler
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom pixel iteration | SIMD-optimized native comparison (odiff) | 2023-2025 | 6-8x performance improvement for large images |
| ImageMagick CLI | Native Node bindings with TypeScript types | 2024+ | Better API ergonomics, no spawn overhead |
| Text-based HTML diffing | Semantic content verification with Cheerio | 2024+ | Focus on content presence rather than structure matching |

**Deprecated/outdated:**
- **playwright-screenshot-comparer**: Older package, less actively maintained than odiff-bin
- **resemblejs**: Superseded by faster alternatives like pixelmatch and odiff
- **Manual ImageMagick CLI calls**: Slower than native Node bindings, more complex error handling

## Open Questions

1. **Default pixel threshold value**
   - What we know: Common values are 0.1 (10%) for pixelmatch, configurable for odiff
   - What's unclear: Optimal threshold for this specific use case
   - Recommendation: Start with 0.1, adjust based on false positive rate

2. **Ignore regions configuration approach**
   - What we know: ODiff supports `ignoreRegions` with x1/y1/x2/y2 coordinates
   - What's unclear: How to specify these in a maintainable way (per-page? global?)
   - Recommendation: Start with manual coordinates, consider JSON config file for page-specific regions

3. **Exact styling of the web viewer**
   - What we know: Claude's discretion per CONTEXT.md
   - What's unclear: User preference for dark/light mode, layout preferences
   - Recommendation: Simple, functional design using Tailwind CSS (already in project)

## Sources

### Primary (HIGH confidence)

- **ODiff GitHub** - https://github.com/dmtrKovalenko/odiff
  - API reference, Node.js usage, ODiffServer pattern, ignore regions configuration
- **Pixelmatch GitHub** - https://github.com/mapbox/pixelmatch
  - API documentation, threshold options, anti-aliasing detection
- **Playwright Visual Comparisons** - https://playwright.dev/docs/test-snapshots
  - Built-in pixelmatch usage, threshold configuration, maxDiffPixels option
- **Express Static Files** - https://expressjs.com/en/starter/static-files.html
  - express.static middleware usage, multiple static directories
- **Cheerio Selecting Elements** - https://cheerio.js.org/docs/basics/selecting/
  - CSS selector syntax, :contains() pseudo-selector for text matching

### Secondary (MEDIUM confidence)

- **Stack Overflow - Cheerio :contains()** - https://stackoverflow.com/questions/60342962/node-cheerio-find-element-that-contains-specific-text
  - Verified: Cheerio supports :contains() for text-based element selection
- **TestMu Playwright Visual Regression Guide** - https://www.testmu.ai/learning-hub/playwright-visual-regression-testing/
  - Verified: Playwright uses pixelmatch internally, supports masking/ignore regions
- **Scrapfly Cheerio Tutorial** - https://scrapfly.io/blog/answers/how-to-find-html-elements-by-text-with-cheerio
  - Verified: :contains() works for partial text matching

### Tertiary (LOW confidence)

- **jQueryScript Best Image Comparison 2026** - https://www.jqueryscript.net/blog/best-image-comparison.html
  - Image comparison viewer libraries (marked for validation - UI library choice is at planner's discretion)
- **W3Schools Image Comparison** - https://www.w3schools.com/howto/howto_js_image_comparison.asp
  - Basic slider implementation pattern (marked for validation - simple vanilla JS approach)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via official GitHub documentation
- Architecture: HIGH - Patterns sourced from official docs and well-established practices
- Pitfalls: HIGH - Common issues documented in library docs and StackOverflow discussions

**Research date:** 2026-02-04
**Valid until:** 2026-03-06 (30 days - stable domain with mature libraries)
