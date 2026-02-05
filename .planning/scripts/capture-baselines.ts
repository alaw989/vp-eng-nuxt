import { chromium } from 'playwright';
import { readFile, mkdir } from 'fs/promises';
import { join } from 'path';

interface PageEntry {
  url: string;
  slug: string;
  title?: string;
  type: string;
  lastmod?: string;
  source: string;
}

interface ViewportConfig {
  width: number;
  height: number;
}

const viewports: Record<string, ViewportConfig> = {
  mobile: { width: 375, height: 812 },    // iPhone X
  tablet: { width: 768, height: 1024 },   // iPad
  desktop: { width: 1920, height: 1080 }  // Full HD
};

const BASE_DIR = join(process.cwd(), '.planning', 'audit', 'baselines');
const PAGES_JSON = join(process.cwd(), '.planning', 'audit', 'pages.json');

async function ensureDir(path: string): Promise<void> {
  try {
    await mkdir(path, { recursive: true });
  } catch (error) {
    // Directory already exists or error - continue
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
}

async function captureScreenshots(): Promise<void> {
  console.log('Loading pages from:', PAGES_JSON);

  const pagesData = await readFile(PAGES_JSON, 'utf-8');
  const pages: PageEntry[] = JSON.parse(pagesData);

  console.log(`Found ${pages.length} pages to capture\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: null });

  const failures: string[] = [];

  for (const page of pages) {
    console.log(`Capturing: ${page.slug}`);

    for (const [device, vp] of Object.entries(viewports)) {
      const browserPage = await context.newPage();
      try {
        await browserPage.setViewportSize(vp);

        await browserPage.goto(page.url, {
          waitUntil: 'networkidle',
          timeout: 30000
        });

        // Wait for dynamic content
        await browserPage.waitForTimeout(2000);

        // Ensure directory exists
        const outputDir = join(BASE_DIR, page.slug);
        await ensureDir(outputDir);

        // Capture screenshot
        const outputPath = join(outputDir, `${device}.png`);
        await browserPage.screenshot({
          path: outputPath,
          fullPage: true
        });

        console.log(`  ✓ ${device}`);
      } catch (error) {
        const errorMsg = (error as Error).message;
        console.log(`  ✗ ${device}: ${errorMsg}`);
        failures.push(`${page.slug}/${device}`);
      } finally {
        await browserPage.close();
      }
    }
  }

  await browser.close();

  console.log('\nCapture complete!');

  if (failures.length > 0) {
    console.log(`\nFailed captures (${failures.length}):`);
    failures.forEach(f => console.log(`  - ${f}`));
  }
}

async function main(): Promise<void> {
  try {
    await captureScreenshots();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main().catch(console.error);
