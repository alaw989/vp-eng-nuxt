import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join } from 'path';

interface ViewportConfig {
  width: number;
  height: number;
}

const viewports: Record<string, ViewportConfig> = {
  mobile: { width: 375, height: 812 },    // iPhone X
  tablet: { width: 768, height: 1024 },   // iPad
  desktop: { width: 1920, height: 1080 }  // Full HD
};

// About page sections to capture for verification
const pagesToCapture = [
  {
    name: 'about-full',
    url: 'http://localhost:3000/about',
    path: 'current',
    description: 'Full About page'
  },
  {
    name: 'about-company-history',
    url: 'http://localhost:3000/about',
    path: 'current',
    description: 'Company History section',
    selector: '#company-history'
  },
  {
    name: 'about-mission-values',
    url: 'http://localhost:3000/about',
    path: 'current',
    description: 'Mission & Values section',
    selector: '#mission-values'
  },
  {
    name: 'about-leadership',
    url: 'http://localhost:3000/about',
    path: 'current',
    description: 'Leadership Team section',
    selector: '#leadership'
  }
];

const BASE_DIR = join(process.cwd(), '.planning', 'audit');

async function ensureDir(path: string): Promise<void> {
  try {
    await mkdir(path, { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
}

async function captureScreenshots(): Promise<void> {
  console.log('Starting About page screenshot capture...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: null });

  const failures: string[] = [];

  for (const pageConfig of pagesToCapture) {
    console.log(`Capturing: ${pageConfig.name}`);

    for (const [device, vp] of Object.entries(viewports)) {
      const browserPage = await context.newPage();
      try {
        await browserPage.setViewportSize(vp);

        await browserPage.goto(pageConfig.url, {
          waitUntil: 'networkidle',
          timeout: 30000
        });

        // Wait for dynamic content to load (team photos, etc.)
        await browserPage.waitForTimeout(3000);

        // If a selector is specified, scroll to it and capture just that section
        if (pageConfig.selector) {
          try {
            const element = await browserPage.$(pageConfig.selector);
            if (element) {
              // Scroll element into view
              await element.scrollIntoViewIfNeeded();
              await browserPage.waitForTimeout(500);
            }
          } catch (e) {
            // Selector not found, capture full page
            console.log(`  ⚠ ${device}: Selector ${pageConfig.selector} not found, capturing full page`);
          }
        }

        // Ensure directory exists
        const outputDir = join(BASE_DIR, pageConfig.path);
        await ensureDir(outputDir);

        // Generate filename
        const filename = `about-${pageConfig.name}-${device}.png`;
        const outputPath = join(outputDir, filename);

        // Capture screenshot
        await browserPage.screenshot({
          path: outputPath,
          fullPage: !pageConfig.selector // Only capture full page if no specific selector
        });

        console.log(`  ✓ ${device} -> ${filename}`);
      } catch (error) {
        const errorMsg = (error as Error).message;
        console.log(`  ✗ ${device}: ${errorMsg.substring(0, 100)}`);
        failures.push(`${pageConfig.name}/${device}`);
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
    process.exit(1);
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
