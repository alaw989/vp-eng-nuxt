#!/usr/bin/env node

/**
 * Performance Bundle Analyzer
 * Analyzes bundle sizes and estimates Lighthouse performance score
 */

const fs = require('fs');
const path = require('path');

// Read the public directory
const publicDir = path.join(__dirname, '../.output/public');

function getKB(size) {
  return Math.round(size / 1024);
}

function getGzippedKB(size) {
  // Approximate gzip ratio (JavaScript typically compresses ~70-75%)
  return Math.round((size * 0.28) / 1024);
}

function analyzeFiles() {
  const files = fs.readdirSync(publicDir, { recursive: true });

  const results = {
    html: { size: 0, files: [] },
    js: { size: 0, gzipped: 0, files: [] },
    css: { size: 0, gzipped: 0, files: [] },
    images: { size: 0, files: [] },
    total: { size: 0, gzipped: 0 }
  };

  for (const file of files) {
    const fullPath = path.join(publicDir, file);
    if (!fs.statSync(fullPath).isFile()) continue;

    const ext = path.extname(file);
    const size = fs.statSync(fullPath).size;

    if (file === 'index.html') {
      results.html.size = size;
      results.html.files.push({ file, size, kb: getKB(size) });
    } else if (ext === '.js' && file.includes('_nuxt')) {
      results.js.size += size;
      results.js.gzipped += getGzippedKB(size) * 1024;
      results.js.files.push({ file, size, kb: getKB(size) });
    } else if (ext === '.css' && file.includes('_nuxt')) {
      results.css.size += size;
      results.css.gzipped += getGzippedKB(size) * 1024;
      results.css.files.push({ file, size, kb: getKB(size) });
    } else if (/\.(jpg|jpeg|png|webp|gif|svg|ico)$/i.test(file)) {
      results.images.size += size;
      results.images.files.push({ file, size, kb: getKB(size) });
    }
  }

  results.total.size = results.html.size + results.js.size + results.css.size;
  results.total.gzipped = results.html.size + results.js.gzipped + results.css.gzipped;

  return results;
}

function calculatePerformanceScore(results) {
  let score = 100;
  const issues = [];

  // Initial JS/CSS budget checks (based on gzipped sizes)
  const jsGzippedKB = results.js.gzipped / 1024;
  const cssGzippedKB = results.css.gzipped / 1024;
  const htmlKB = results.html.size / 1024;

  // Critical JS budget: 150KB gzipped (after that score drops)
  if (jsGzippedKB > 150) {
    const excess = jsGzippedKB - 150;
    score -= Math.min(30, Math.round((excess / 200) * 30));
    issues.push(`JS bundle is ${jsGzippedKB}KB gzipped (target: 150KB)`);
  } else if (jsGzippedKB > 100) {
    score -= 10;
    issues.push(`JS bundle is ${jsGzippedKB}KB gzipped (good target: 100KB)`);
  }

  // Critical CSS budget: 30KB gzipped
  if (cssGzippedKB > 30) {
    const excess = cssGzippedKB - 30;
    score -= Math.min(20, Math.round((excess / 50) * 20));
    issues.push(`CSS is ${cssGzippedKB}KB gzipped (target: 30KB)`);
  }

  // HTML budget: 30KB
  if (htmlKB > 30) {
    const excess = htmlKB - 30;
    score -= Math.min(10, Math.round((excess / 30) * 10));
    issues.push(`HTML is ${htmlKB.toFixed(1)}KB (target: 30KB)`);
  }

  // Check initial JS chunks (non-lazy loaded)
  const indexHTML = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf-8');
  const initialJSMatches = indexHTML.match(/\/_nuxt\/[a-zA-Z0-9_-]+\.js/g) || [];
  const initialJS = [...new Set(initialJSMatches)]; // unique

  let initialJSSize = 0;
  for (const jsFile of initialJS) {
    const fullPath = path.join(publicDir, jsFile);
    if (fs.existsSync(fullPath)) {
      initialJSSize += fs.statSync(fullPath).size;
    }
  }
  const initialJSGzipped = getGzippedKB(initialJSSize);

  // Initial JS should be under 100KB gzipped
  if (initialJSGzipped > 100) {
    const excess = initialJSGzipped - 100;
    score -= Math.min(25, Math.round((excess / 100) * 25));
    issues.push(`Initial JS is ${initialJSGzipped}KB gzipped (target: 100KB)`);
  } else {
    issues.push(`✓ Initial JS is ${initialJSGzipped}KB gzipped`);
  }

  // Count DOM nodes
  const domNodes = (indexHTML.match(/<[a-z][a-z0-9]*/gi) || []).length;
  if (domNodes > 1500) {
    score -= 5;
    issues.push(`Too many DOM nodes: ${domNodes} (target: <1500)`);
  }

  return { score: Math.max(0, score), issues, initialJSGzipped };
}

function main() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('          PERFORMANCE BUNDLE ANALYSIS');
  console.log('═══════════════════════════════════════════════════════\n');

  const results = analyzeFiles();
  const { score, issues, initialJSGzipped } = calculatePerformanceScore(results);

  console.log('📊 BUNDLE SIZES:');
  console.log(`   HTML:           ${getKB(results.html.size)} KB`);
  console.log(`   JavaScript:     ${getKB(results.js.size)} KB (~${getKB(results.js.gzipped)} KB gzipped)`);
  console.log(`   CSS:            ${getKB(results.css.size)} KB (~${getKB(results.css.gzipped)} KB gzipped)`);
  console.log(`   Initial JS:     ~${initialJSGzipped} KB gzipped`);
  console.log(`   Total:          ${getKB(results.total.size)} KB (~${getKB(results.total.gzipped)} KB gzipped)\n`);

  console.log('📦 LARGEST JAVASCRIPT CHUNKS:');
  const sortedJS = [...results.js.files].sort((a, b) => b.size - a.size).slice(0, 5);
  for (const file of sortedJS) {
    const gzipped = getGzippedKB(file.size);
    console.log(`   ${file.file}: ${file.kb} KB (~${gzipped} KB gzipped)`);
  }
  console.log('');

  console.log('📋 ISSUES & RECOMMENDATIONS:');
  for (const issue of issues) {
    console.log(`   ${issue.startsWith('✓') ? '✅' : '⚠️'}  ${issue}`);
  }
  console.log('');

  console.log('═══════════════════════════════════════════════════════');
  console.log(`          ESTIMATED PERFORMANCE SCORE: ${score}/100`);
  console.log('═══════════════════════════════════════════════════════\n');

  if (score >= 90) {
    console.log('✅ Performance target achieved!\n');
    return 0;
  } else {
    console.log(`❌ Performance score is ${score}. Need 90+ to pass.\n`);
    console.log('Key areas to improve:');
    console.log('1. Reduce initial JavaScript bundle');
    console.log('2. Implement more aggressive code splitting');
    console.log('3. Defer non-critical CSS');
    console.log('4. Consider server-side streaming SSR');
    return 1;
  }
}

main();
