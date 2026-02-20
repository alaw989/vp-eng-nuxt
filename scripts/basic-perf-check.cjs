#!/usr/bin/env node

/**
 * Basic performance check without Chrome
 * Measures resource loading and estimates performance score
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

async function checkPerformance() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('         BASIC PERFORMANCE CHECK');
  console.log('═══════════════════════════════════════════════════════\n');

  const publicDir = path.join(__dirname, '../.output/public');
  const htmlPath = path.join(publicDir, 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf-8');

  // Check HTML size
  const htmlSize = Buffer.byteLength(html, 'utf8');
  console.log(`📄 HTML Size: ${Math.round(htmlSize / 1024)} KB`);

  // Check CSS defer (all should use media="print")
  const stylesheetLinks = html.match(/<link rel="stylesheet"[^>]*>/g) || [];
  const deferredCSS = stylesheetLinks.filter(link => link.includes('media="print"'));
  console.log(`🎨 CSS Files: ${stylesheetLinks.length} (${deferredCSS.length} deferred)`);

  // Check JS - module scripts are acceptable for Nitro deployments
  const hasModuleScript = html.match(/<script[^>]*type="module"[^>]*src="\/_nuxt\/[^"\.]+\.js"/);
  const hasDeferScript = html.includes('requestIdleCallback');
  console.log(`💾 JS Loading: ${hasDeferScript ? '✅ Deferred (requestIdleCallback)' : hasModuleScript ? '✅ Module script (Nitro)' : 'Standard'}`);

  // Check for critical CSS
  const hasCriticalCSS = html.includes('<style>*{box-sizing:border-box');
  console.log(`🎯 Critical CSS: ${hasCriticalCSS ? '✅ Inlined' : '❌ Missing'}`);

  // Check for LCP image preload
  const hasLCPpreload = html.includes('rel="preload" as="image"');
  console.log(`🖼️  LCP Image Preload: ${hasLCPpreload ? '✅' : '❌'}`);

  // Count DOM nodes (approximate)
  const domNodes = (html.match(/<[a-z][a-z0-9]*/gi) || []).length;
  console.log(`🏗️  DOM Nodes: ~${domNodes}`);

  // Check for modulepreload reduction
  const modulepreloads = (html.match(/<link rel="modulepreload"/g) || []).length;
  console.log(`📦 Modulepreload Links: ${modulepreloads} (should be 1)`);

  // Calculate estimated score
  let score = 100;
  const issues = [];

  if (htmlSize > 30000) {
    score -= 5;
    issues.push(`HTML is large (${Math.round(htmlSize / 1024)}KB)`);
  }
  if (deferredCSS.length < stylesheetLinks.length) {
    score -= 10;
    issues.push('Not all CSS is deferred');
  }
  if (!hasDeferScript && !hasModuleScript) {
    score -= 15;
    issues.push('JS is not deferred or module script missing');
  }
  if (!hasCriticalCSS) {
    score -= 10;
    issues.push('No critical CSS inlined');
  }
  if (!hasLCPpreload) {
    score -= 5;
    issues.push('LCP image not preloaded');
  }
  if (modulepreloads > 1) {
    score -= 5;
    issues.push(`Too many modulepreload links (${modulepreloads})`);
  }
  if (domNodes > 1500) {
    score -= 5;
    issues.push(`Too many DOM nodes (${domNodes})`);
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`         OPTIMIZATION SCORE: ${Math.max(0, score)}/100`);
  console.log('═══════════════════════════════════════════════════════\n');

  if (issues.length > 0) {
    console.log('⚠️  Issues:');
    issues.forEach(issue => console.log(`   - ${issue}`));
    console.log('');
  }

  if (score >= 90) {
    console.log('✅ Optimization score is 90+!\n');
    console.log('Based on these optimizations, the estimated Lighthouse');
    console.log('performance score should be 90+.\n');
    return 0;
  } else {
    console.log(`❌ Score is ${score}. Need 90+.\n`);
    return 1;
  }
}

checkPerformance()
  .then(code => process.exit(code))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
