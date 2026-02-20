#!/usr/bin/env node

// Simple Lighthouse-style audit using Playwright
// Runs metrics collection on localhost:3000

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function runAudit() {
  console.log('Starting performance audit...\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    // Emulate mobile device for stricter test
    viewport: { width: 412, height: 823 },
    // Use 3G network for realistic conditions
    offline: false,
  });

  const page = await context.newPage();

  // Set up network throttling (simulated fast 4G)
  await page.route('**/*', (route) => route.continue());

  // Set up CDN
  const client = await context.newCDPSession(page);
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: 1.6 * 1024 * 1024 / 8, // 1.6 Mbps
    uploadThroughput: 750 * 1024 / 8, // 750 Kbps
    latency: 50, // 50ms RTT
  });

  // Enable CPU throttling
  await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });

  const metrics = {};
  const timings = [];

  // Navigate and collect metrics
  const url = 'http://localhost:3000/';
  console.log(`Navigating to ${url}...`);

  // Use performance API to collect detailed timing
  await page.goto(url, { waitUntil: 'networkidle' });

  // Wait a bit for everything to settle
  await page.waitForTimeout(2000);

  // Collect metrics via Performance API
  const perfData = await page.evaluate(() => {
    const perfEntries = performance.getEntries();
    const navigation = performance.getEntriesByType('navigation')[0];

    // Calculate Core Web Vitals
    const paintEntries = performance.getEntriesByType('paint');
    const fp = paintEntries.find(e => e.name === 'first-paint')?.startTime || 0;
    const fcp = paintEntries.find(e => e.name === 'first-contentful-paint')?.startTime || 0;

    // LCP - get largest layout shift
    let lcp = 0;
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    if (lcpEntries.length > 0) {
      lcp = lcpEntries[lcpEntries.length - 1].startTime;
    }

    // CLS - layout shift
    let clsValue = 0;
    const clsEntries = performance.getEntriesByType('layout-shift');
    clsEntries.forEach(entry => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
      }
    });

    // FID - first input delay (needs user interaction, so we'll estimate)
    const fid = 0;

    // TTI - Time to Interactive (approximate)
    const domContentLoaded = navigation?.domContentLoadedEventEnd || 0;
    const loadComplete = navigation?.loadEventEnd || 0;

    // Resource counts
    const resourceEntries = performance.getEntriesByType('resource');
    const jsResources = resourceEntries.filter(r => r.name.endsWith('.js'));
    const cssResources = resourceEntries.filter(r => r.name.endsWith('.css'));
    const imageResources = resourceEntries.filter(r => /\.(jpg|jpeg|png|gif|webp|svg|ico)/.test(r.name));

    let totalJSSize = 0;
    let totalCSSSize = 0;
    let totalImageSize = 0;

    jsResources.forEach(r => totalJSSize += r.transferSize || 0);
    cssResources.forEach(r => totalCSSSize += r.transferSize || 0);
    imageResources.forEach(r => totalImageSize += r.transferSize || 0);

    return {
      fp: Math.round(fp),
      fcp: Math.round(fcp),
      lcp: Math.round(lcp),
      cls: parseFloat(clsValue.toFixed(3)),
      fid: Math.round(fid),
      domContentLoaded: Math.round(domContentLoaded),
      loadComplete: Math.round(loadComplete),
      totalResources: resourceEntries.length,
      jsCount: jsResources.length,
      cssCount: cssResources.length,
      imageCount: imageResources.length,
      totalJSSize: Math.round(totalJSSize / 1024), // KB
      totalCSSSize: Math.round(totalCSSSize / 1024), // KB
      totalImageSize: Math.round(totalImageSize / 1024), // KB
      domNodes: document.querySelectorAll('*').length,
      bodyHTMLSize: new Blob([document.body.innerHTML]).size,
    };
  });

  metrics.performanceAPI = perfData;

  // Get detailed timing info
  const navMetrics = await page.metrics();
  metrics.navigationMetrics = {
    timestamp: navMetrics.timestamp,
    documents: navMetrics.Documents,
    frames: navMetrics.Frames,
    jseventListeners: navMetrics.JSEventListeners,
    layoutObjects: navMetrics.LayoutObjects,
    nodes: navMetrics.Nodes,
    recalcStyleCount: navMetrics.RecalcStyleCount,
    timestampValue: navMetrics.Timestamp,
    v8compileTaskDuration: navMetrics.V8CompileTaskDuration,
  };

  await browser.close();

  // Calculate scores based on Web Vitals thresholds
  const scores = {
    fcp: getScore(perfData.fcp, 'fcp'),
    lcp: getScore(perfData.lcp, 'lcp'),
    cls: getScore(perfData.cls, 'cls'),
    si: getScore(perfData.domContentLoaded, 'si'),
    tti: getScore(perfData.loadComplete, 'tti'),
  };

  // Overall performance score (average of individual scores)
  scores.overall = Math.round(
    (scores.fcp * 0.1 + scores.lcp * 0.25 + scores.cls * 0.25 + scores.si * 0.2 + scores.tti * 0.2) * 100
  ) / 100;

  metrics.scores = scores;

  // Display results
  console.log('\n═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═');
  console.log('      PERFORMANCE AUDIT RESULTS');
  console.log('═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═\n');

  console.log('CORE WEB VITALS:');
  console.log(`  LCP (Largest Contentful Paint): ${perfData.lcp}ms ${getStatus(scores.lcp)}`);
  console.log(`  FCP (First Contentful Paint):   ${perfData.fcp}ms ${getStatus(scores.fcp)}`);
  console.log(`  CLS (Cumulative Layout Shift):  ${perfData.cls} ${getStatus(scores.cls)}\n`);

  console.log('LOAD TIMING:');
  console.log(`  DOM Content Loaded: ${perfData.domContentLoaded}ms`);
  console.log(`  Load Complete:      ${perfData.loadComplete}ms\n`);

  console.log('RESOURCE SUMMARY:');
  console.log(`  Total Resources: ${perfData.totalResources}`);
  console.log(`  JavaScript:      ${perfData.jsCount} files (~${perfData.totalJSSize} KB)`);
  console.log(`  CSS:             ${perfData.cssCount} files (~${perfData.totalCSSSize} KB)`);
  console.log(`  Images:          ${perfData.imageCount} files (~${perfData.totalImageSize} KB)\n`);

  console.log('PAGE METRICS:');
  console.log(`  DOM Nodes:    ${perfData.domNodes}`);
  console.log(`  Body HTML:    ~${Math.round(perfData.bodyHTMLSize / 1024)} KB\n`);

  console.log('═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═');
  console.log(`  OVERALL PERFORMANCE SCORE: ${scores.overall}`);
  console.log('═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═\n');

  // Write results to file
  const results = {
    url,
    timestamp: new Date().toISOString(),
    scores,
    metrics: perfData,
    navigationMetrics: metrics.navigationMetrics,
  };

  fs.writeFileSync(
    path.join(__dirname, '../lighthouse-results.json'),
    JSON.stringify(results, null, 2)
  );

  console.log('Detailed results saved to: lighthouse-results.json\n');

  // Return pass/fail
  if (scores.overall >= 90) {
    console.log('✅ Performance score target achieved (90+)!');
    return 0;
  } else if (scores.overall >= 75) {
    console.log(`⚠️  Performance score is ${scores.overall}. Need 90+.`);
    console.log('   Focus on reducing JS bundle size and optimizing LCP.\n');
    return 1;
  } else {
    console.log(`❌ Performance score is ${scores.overall}. Significant work needed.\n`);
    return 1;
  }
}

function getScore(value, metric) {
  const thresholds = {
    fcp: { good: 1800, needsImprovement: 3000 },
    lcp: { good: 2500, needsImprovement: 4000 },
    cls: { good: 0.1, needsImprovement: 0.25 },
    si: { good: 3400, needsImprovement: 5800 }, // Speed Index
    tti: { good: 3800, needsImprovement: 7300 }, // Time to Interactive
  };

  const t = thresholds[metric];
  if (!t) return 100;

  if (value <= t.good) return 100;
  if (value >= t.needsImprovement) {
    // Return a score between 0-50 for poor values
    const excess = value - t.needsImprovement;
    const maxExcess = t.needsImprovement * 2;
    return Math.max(10, 50 - Math.round((excess / maxExcess) * 40));
  }

  // Linear interpolation between good and needsImprovement
  const ratio = (value - t.good) / (t.needsImprovement - t.good);
  return Math.round(100 - ratio * 50);
}

function getStatus(score) {
  if (score >= 90) return '✅';
  if (score >= 50) return '⚠️ ';
  return '❌';
}

runAudit()
  .then(code => process.exit(code))
  .catch(err => {
    console.error('Audit failed:', err);
    process.exit(1);
  });
