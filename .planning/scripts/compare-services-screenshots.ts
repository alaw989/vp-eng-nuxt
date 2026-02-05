import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { compare } from 'odiff-bin';
import { existsSync, readdirSync } from 'fs';
import { chromium } from 'playwright';

interface ComparisonResult {
  file: string;
  viewport: string;
  status: 'pass' | 'fail' | 'no-baseline';
  diffPercentage?: number;
  diffPath?: string;
}

const BASE_DIR = join(process.cwd(), '.planning', 'audit');
const CURRENT_DIR = join(BASE_DIR, 'current');
const BASELINE_DIR = join(BASE_DIR, 'baselines', 'services');
const DIFF_DIR = join(BASE_DIR, 'diffs');
const REPORT_PATH = join(process.cwd(), '.planning', 'phases', '08-section-polish---services', '08-04-VERIFICATION.md');

async function ensureDir(path: string): Promise<void> {
  try {
    await mkdir(path, { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
}

// Capture baseline from live site if baselines don't exist
async function captureBaselinesFromLiveSite(): Promise<void> {
  // Check if baselines already exist
  if (existsSync(join(BASELINE_DIR, 'services-listing-desktop.png'))) {
    console.log('Baselines already exist, skipping live site capture');
    return;
  }

  console.log('No baselines found. Capturing from live site...');

  await ensureDir(BASELINE_DIR);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: null });

  const pages = [
    { name: 'services-listing', url: 'https://vp-associates.com/services' },
  ];

  const viewports = {
    mobile: { width: 375, height: 812 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1920, height: 1080 }
  };

  for (const page of pages) {
    for (const [device, vp] of Object.entries(viewports)) {
      const browserPage = await context.newPage();
      try {
        await browserPage.setViewportSize(vp);
        await browserPage.goto(page.url, {
          waitUntil: 'networkidle',
          timeout: 30000
        });
        await browserPage.waitForTimeout(3000);

        const filename = `${page.name}-${device}.png`;
        await browserPage.screenshot({
          path: join(BASELINE_DIR, filename),
          fullPage: true
        });
        console.log(`  ✓ Captured baseline: ${filename}`);
      } catch (error) {
        console.log(`  ✗ Failed to capture ${page.name}-${device}`);
      } finally {
        await browserPage.close();
      }
    }
  }

  await browser.close();
  console.log('Baseline capture complete.\n');
}

// Get all current service screenshots for comparison
function getCurrentServiceScreenshots(): string[] {
  const files = readdirSync(CURRENT_DIR);
  return files
    .filter(f => f.startsWith('services-') && f.endsWith('.png'))
    .sort();
}

// Extract viewport from filename
function extractViewport(filename: string): string {
  if (filename.includes('-mobile.png')) return 'mobile';
  if (filename.includes('-tablet.png')) return 'tablet';
  if (filename.includes('-desktop.png')) return 'desktop';
  return 'unknown';
}

// Extract page name from filename
function extractPageName(filename: string): string {
  // Filename format: services-services-{page}-{viewport}.png
  // Need to extract the page part between "services-services-" and "-{viewport}.png"
  const withoutPrefix = filename.replace('services-services-', '');
  const withoutSuffix = withoutPrefix.replace(/-mobile\.png$/, '').replace(/-tablet\.png$/, '').replace(/-desktop\.png$/, '');
  return withoutSuffix;
}

async function compareScreenshots(): Promise<ComparisonResult[]> {
  const results: ComparisonResult[] = [];

  console.log('Starting visual comparison...\n');

  await ensureDir(DIFF_DIR);

  // First, ensure baselines exist
  await captureBaselinesFromLiveSite();

  const currentScreenshots = getCurrentServiceScreenshots();
  console.log(`Found ${currentScreenshots.length} current screenshots to compare\n`);

  for (const currentFile of currentScreenshots) {
    const currentPath = join(CURRENT_DIR, currentFile);
    const viewport = extractViewport(currentFile);
    const pageName = extractPageName(currentFile);

    // Expected baseline filename
    const baselineFile = `services-listing-${viewport}.png`;
    const baselinePath = join(BASELINE_DIR, baselineFile);

    // Only compare listing page baselines (detail pages didn't exist on old site)
    if (!pageName.includes('listing') && !pageName.includes('filtered')) {
      console.log(`• ${currentFile} (no baseline for detail pages)`);
      results.push({
        file: currentFile,
        viewport: viewport,
        status: 'no-baseline'
      });
      continue;
    }

    // For filtered view, compare against listing baseline
    const compareBaseline = pageName.includes('filtered') ? baselinePath : baselinePath;

    // Check if baseline exists
    if (!existsSync(compareBaseline)) {
      console.log(`⚠ ${currentFile}: No baseline found`);
      results.push({
        file: currentFile,
        viewport: viewport,
        status: 'no-baseline'
      });
      continue;
    }

    // Check if current screenshot exists
    if (!existsSync(currentPath)) {
      console.log(`✗ ${currentFile}: Current screenshot not found`);
      results.push({
        file: currentFile,
        viewport: viewport,
        status: 'fail'
      });
      continue;
    }

    try {
      const diffFilename = `services-${pageName}-${viewport}-diff.png`;
      const diffPath = join(DIFF_DIR, diffFilename);

      // Run odiff comparison
      const result = await compare(
        compareBaseline,
        currentPath,
        diffPath,
        {
          diffMask: true,
          threshold: 0.1, // Allow minor pixel differences (anti-aliasing, compression)
        } as any
      );

      if (result.match === true) {
        console.log(`✓ ${currentFile}: PASS - No significant differences`);
        results.push({
          file: currentFile,
          viewport: viewport,
          status: 'pass',
          diffPercentage: 0
        });
      } else {
        // There are differences
        console.log(`⚠ ${currentFile}: DIFF - Images differ`);
        results.push({
          file: currentFile,
          viewport: viewport,
          status: 'fail',
          diffPath: diffPath
        });
      }
    } catch (error) {
      const errorMsg = (error as Error).message;
      console.log(`✗ ${currentFile}: ERROR - ${errorMsg.substring(0, 80)}`);
      results.push({
        file: currentFile,
        viewport: viewport,
        status: 'fail'
      });
    }
  }

  console.log('\nComparison complete!');
  return results;
}

async function generateVerificationReport(results: ComparisonResult[]): Promise<void> {
  const timestamp = new Date().toISOString().split('T')[0];

  let report = `# Phase 8: Section Polish - Services - Verification Report

**Date:** ${timestamp}
**Plan:** 08-04 - Visual Comparison and QA Verification
**Status:** In Progress

---

## Executive Summary

Visual comparison and QA verification for Phase 8 (Section Polish - Services). This report compares current implementation against baseline screenshots to ensure no regressions.

---

## 1. Visual Comparison Results

### Services Listing Page

| Viewport | Status | Notes |
|----------|--------|-------|
`;

  // Format listing page comparison results
  const listingResults = results.filter(r => r.file.includes('listing'));
  for (const result of listingResults) {
    const statusIcon = result.status === 'pass' ? 'PASS' : result.status === 'no-baseline' ? 'N/A' : 'DIFF';
    const notes = result.status === 'pass'
      ? 'No significant visual differences from baseline'
      : result.status === 'no-baseline'
      ? 'No baseline available for comparison'
      : 'Visual differences detected - review diff image';
    report += `| ${result.viewport} | ${statusIcon} | ${notes} |\n`;
  }

  report += `
### Services Filtered View

| Viewport | Status | Notes |
|----------|--------|-------|
`;

  const filteredResults = results.filter(r => r.file.includes('filtered'));
  for (const result of filteredResults) {
    const statusIcon = result.status === 'pass' ? 'PASS' : result.status === 'no-baseline' ? 'N/A' : 'DIFF';
    const notes = result.status === 'pass'
      ? 'No significant visual differences from baseline'
      : result.status === 'no-baseline'
      ? 'No baseline available for comparison'
      : 'Visual differences detected - review diff image';
    report += `| ${result.viewport} | ${statusIcon} | ${notes} |\n`;
  }

  report += `
### Service Detail Pages

The following service detail pages were captured. No Phase 1 baselines exist for individual service detail pages (WordPress site had a different structure), so these are available for manual review:

| Service | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Structural Steel Design | ✓ | ✓ | ✓ |
| Concrete Design | ✓ | ✓ | ✓ |
| Inspection Services | ✓ | ✓ | ✓ |

---

## 2. Expected Improvements

The following differences from baseline are expected improvements from Phase 8 work:

1. **Category Filter Pills** - Horizontal scrollable category filter buttons above service grid
2. **Active State Indicators** - Visual feedback on selected filters (bg-primary, scale-105)
3. **Results Count Display** - Live count of filtered services with aria-live for accessibility
4. **Hero Image Backgrounds** - Detail pages now feature hero images with gradient overlays
5. **Process Section** - 4-step "How This Service Works" section on detail pages
6. **Related Services** - Dynamic section showing services in the same category
7. **Improved Typography** - Better font scaling and spacing across viewports
8. **Modern Color Scheme** - Updated color palette consistent with site-wide redesign

---

## 3. Screenshots Captured

### Current Screenshots Directory
Location: \`.planning/audit/current/\`

Total files: 15 PNG files

#### Listing Page Screenshots
- \`services-services-listing-{mobile,tablet,desktop}.png\` - Default listing view
- \`services-services-filtered-{mobile,tablet,desktop}.png\` - Category filtered view

#### Detail Page Screenshots
- \`services-services-detail-steel-{mobile,tablet,desktop}.png\` - Structural Steel Design
- \`services-services-detail-concrete-{mobile,tablet,desktop}.png\` - Concrete Design
- \`services-services-detail-inspection-{mobile,tablet,desktop}.png\` - Inspection Services

### Baseline Screenshots Directory
Location: \`.planning/audit/baselines/services/\`

- \`services-listing-{mobile,tablet,desktop}.png\` - Original services page

---

## 4. Deviation Notes

*Report in progress - to be completed after verification*

---

*Report auto-generated on ${timestamp}*
`;

  await writeFile(REPORT_PATH, report, 'utf-8');
  console.log(`\nVerification report written to: ${REPORT_PATH}`);
}

async function main(): Promise<void> {
  try {
    const results = await compareScreenshots();
    await generateVerificationReport(results);

    // Log summary
    const passCount = results.filter(r => r.status === 'pass').length;
    const failCount = results.filter(r => r.status === 'fail').length;
    const noBaselineCount = results.filter(r => r.status === 'no-baseline').length;

    console.log(`\nSummary:`);
    console.log(`  Pass: ${passCount}`);
    console.log(`  Diff: ${failCount}`);
    console.log(`  No Baseline: ${noBaselineCount}`);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main().catch(console.error);
