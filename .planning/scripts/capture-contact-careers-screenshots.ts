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

// Pages to capture for contact and careers section verification
const pagesToCapture = [
  // Contact page
  {
    name: 'contact-full',
    url: 'http://localhost:3001/contact',
    path: 'current'
  },
  {
    name: 'contact-form',
    url: 'http://localhost:3001/contact',
    path: 'current',
    selector: '.contact-form-section, form' // Will capture full page if selector not found
  },
  {
    name: 'contact-info',
    url: 'http://localhost:3001/contact',
    path: 'current',
    selector: '.contact-info-section, .contact-information' // Will capture full page if selector not found
  },
  // Careers listing page
  {
    name: 'careers-full',
    url: 'http://localhost:3001/careers',
    path: 'current'
  },
  {
    name: 'careers-positions',
    url: 'http://localhost:3001/careers',
    path: 'current',
    selector: '.open-positions-section, .positions-grid' // Will capture full page if selector not found
  },
  {
    name: 'careers-culture',
    url: 'http://localhost:3001/careers',
    path: 'current',
    selector: '.culture-section, .why-section, .benefits-section' // Will capture full page if selector not found
  },
  // Careers detail page (structural-engineer as example)
  {
    name: 'careers-detail-full',
    url: 'http://localhost:3001/careers/structural-engineer',
    path: 'current'
  },
  {
    name: 'careers-detail-header',
    url: 'http://localhost:3001/careers/structural-engineer',
    path: 'current',
    selector: '.job-header, .detail-header' // Will capture full page if selector not found
  },
  {
    name: 'careers-detail-content',
    url: 'http://localhost:3001/careers/structural-engineer',
    path: 'current',
    selector: '.job-content, .job-description, .detail-content' // Will capture full page if selector not found
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
  console.log('Starting screenshot capture for contact and careers pages...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: null });

  const failures: string[] = [];
  const captured: string[] = [];

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
        const filename = `contact-${pageConfig.name}-${device}.png`.replace('contact-careers-', 'careers-');
        const outputPath = join(outputDir, filename);

        // Capture screenshot
        if (pageConfig.selector) {
          try {
            const element = await browserPage.$(pageConfig.selector);
            if (element) {
              await element.screenshot({ path: outputPath });
            } else {
              // Selector not found, capture full page
              await browserPage.screenshot({ path: outputPath, fullPage: true });
            }
          } catch {
            // Selector failed, capture full page
            await browserPage.screenshot({ path: outputPath, fullPage: true });
          }
        } else {
          await browserPage.screenshot({ path: outputPath, fullPage: true });
        }

        captured.push(filename);
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
  console.log(`Total screenshots captured: ${captured.length}`);

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
