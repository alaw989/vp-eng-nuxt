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

// Pages to capture for services section verification
const pagesToCapture = [
  {
    name: 'services-listing',
    url: 'http://localhost:3000/services',
    path: 'current'
  },
  {
    name: 'services-filtered',
    url: 'http://localhost:3000/services?category=structural',
    path: 'current'
  },
  {
    name: 'services-detail-steel',
    url: 'http://localhost:3000/services/structural-steel-design',
    path: 'current'
  },
  {
    name: 'services-detail-concrete',
    url: 'http://localhost:3000/services/concrete-design',
    path: 'current'
  },
  {
    name: 'services-detail-inspection',
    url: 'http://localhost:3000/services/inspection-services',
    path: 'current'
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
  console.log('Starting services screenshot capture...\n');

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

        // Wait for dynamic content to load
        await browserPage.waitForTimeout(3000);

        // Ensure directory exists
        const outputDir = join(BASE_DIR, pageConfig.path);
        await ensureDir(outputDir);

        // Generate filename
        const filename = `services-${pageConfig.name}-${device}.png`;
        const outputPath = join(outputDir, filename);

        // Capture screenshot
        await browserPage.screenshot({
          path: outputPath,
          fullPage: true
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
