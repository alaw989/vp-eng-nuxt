#!/usr/bin/env node

/**
 * Post-build HTML optimization script
 *
 * This script runs after the Nuxt build to optimize the prerendered HTML:
 * 1. Removes non-critical modulepreload links
 * 2. Adds fetchpriority hints
 * 3. Removes inline icon styles
 * 4. Adds preload hints for critical CSS
 * 5. Defers non-critical CSS loading
 * 6. Minifies HTML whitespace
 * 7. Removes duplicate resource hints
 * 8. Adds async image decoding
 */

const fs = require('fs');
const path = require('path');

// Get the project root directory (where package.json is)
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, '.output', 'public');

// List of files to process (prerendered pages only)
const filesToOptimize = [
  'index.html',
  'privacy/index.html',
  'terms/index.html',
  'accessibility/index.html',
  'offline/index.html',
  'sitemap/index.html',
];

function optimizeHTML(html) {
  let optimized = html;

  // Remove any remaining Google Fonts references
  optimized = optimized.replace(
    /<link[^>]*fonts\.googleapis\.com[^>]*>/gi,
    ''
  );
  optimized = optimized.replace(
    /<link[^>]*fonts\.gstatic\.com[^>]*>/gi,
    ''
  );
  // Remove dns-prefetch/preconnect for Google Fonts
  optimized = optimized.replace(
    /<link[^>]*rel="dns-prefetch"[^>]*fonts\.google[^>]*>/gi,
    ''
  );
  optimized = optimized.replace(
    /<link[^>]*rel="preconnect"[^>]*fonts\.google[^>]*>/gi,
    ''
  );

  // Remove non-critical modulepreload links - Keep ONLY the main entry point
  // Also remove crossorigin from modulepreload to save bytes (not needed for same-origin)
  const modulepreloads = optimized.match(/<link rel="modulepreload"[^>]*href="\/_nuxt\/([^"]+)"[^>]*>/g) || [];
  const firstModulepreload = modulepreloads[0];

  optimized = optimized.replace(
    /<link rel="modulepreload"[^>]*href="\/_nuxt\/([^"]+)"[^>]*>/g,
    (match, href) => {
      if (match === firstModulepreload) {
        // Remove crossorigin (simple pattern - match crossorigin followed by space or >)
        return match.replace(/\s*crossorigin(\s|>)/gi, '$1').replace('>', ' fetchpriority="high">');
      }
      return '';
    }
  );

  // Remove the inline icon styles - let iconify load them on demand
  optimized = optimized.replace(
    /<style>:where\(.i-mdi[^<]*<\/style>/g,
    ''
  );

  // Add fetchpriority="high" to the LCP image (hero image)
  optimized = optimized.replace(
    /(<img[^>]*\/images\/hero\/crane-building-1920w\.jpg[^>]*>)/,
    (match) => {
      if (!match.includes('fetchpriority')) {
        return match.replace('<img', '<img fetchpriority="high"');
      }
      return match;
    }
  );

  // REMOVED: Prefetch hints for routes - these can hurt performance on mobile/low-bandwidth
  // by consuming bandwidth for resources that may never be used
  // The browser will discover these naturally through navigation

  // REMOVED: Iconify preconnect/dns-prefetch - already in nuxt.config.ts app.head
  // No need to duplicate here

  // Defer ALL CSS files including entry.css using media="print" hack
  // This prevents CSS from blocking rendering
  // Critical styles will be inlined below
  // Also remove crossorigin attribute to save space (not needed for CSS)
  optimized = optimized.replace(
    /<link rel="stylesheet" href="\/_nuxt\/(AppFooter|ClientLogos|TestimonialsSlider|TampaBayMap|ServiceAreaMap|PageLoadingBar|ProjectCard|PdfViewer|about|contact|AppSection|index|PageBanner|AppBreadcrumbs|entry)\.([^"]+)\.css"([^>]*)>/g,
    (match, name, hash, rest) => {
      // Remove crossorigin from rest and defer CSS (handle both already-deferred and not-deferred)
      let cleanRest = rest.replace(/\s*crossorigin\s*=?\s*'(anonymous|use-credentials)'?\s*/gi, '').replace(/\s*crossorigin\s*=?\s*(anonymous|use-credentials)\s*/gi, '').replace(/\s*crossorigin\s*>/g, '>');
      // If not already deferred, add the defer
      if (!cleanRest.includes('media="print"')) {
        cleanRest = ` media="print" onload="this.media='all'"${cleanRest}`;
      }
      // Trim any leading space from cleanRest
      cleanRest = cleanRest.trimLeft();
      return `<link rel="stylesheet" href="/_nuxt/${name}.${hash}.css"${cleanRest}>`;
    }
  );

  // FINAL PASS: Remove any remaining crossorigin from deferred CSS links
  // This catches cases where the regex above didn't match
  optimized = optimized.replace(
    /<link rel="stylesheet"([^>]*?)media="print"([^>]*?)crossorigin([^>]*?)>/gi,
    '<link rel="stylesheet"$1media="print"$2>'
  );
  optimized = optimized.replace(
    /<link rel="stylesheet"([^>]*?)crossorigin([^>]*?)media="print"([^>]*?)>/gi,
    '<link rel="stylesheet"$1media="print"$3>'
  );
  // Clean up any trailing spaces before >
  optimized = optimized.replace(/\s+>/g, '>');

  // Remove payload.json preload - it's only 69 bytes and doesn't need preload
  // The browser will discover it naturally via the script tag
  optimized = optimized.replace(
    /<link rel="preload" as="fetch" crossorigin="anonymous" href="\/_payload\.json[^>]*>/gi,
    ''
  );

  // Remove duplicate resource hints (multiple dns-prefetch/preconnect for same domain)
  const seenDomains = new Set();
  optimized = optimized.replace(
    /<link rel="(?:dns-prefetch|preconnect)" href="([^"]+)"[^>]*>/gi,
    (match, domain) => {
      if (seenDomains.has(domain)) {
        return '';
      }
      seenDomains.add(domain);
      return match;
    }
  );

  // Add decoding="async" to all images for non-blocking decode
  optimized = optimized.replace(
    /<img([^>]*?)>/g,
    (match, attrs) => {
      if (!attrs.includes('decoding')) {
        return `<img${attrs} decoding="async">`;
      }
      return match;
    }
  );

  // NEW: Remove inline style="font-size:24px;" from iconify spans
  // This adds significant bloat to HTML - can be handled by CSS
  optimized = optimized.replace(
    /<span class="iconify[^>]*" style="font-size:24px;"([^>]*)>/g,
    (match, rest) => {
      return match.replace(' style="font-size:24px;"', '');
    }
  );

  // Inline critical CSS for above-fold content
  // Optimized to ~600 bytes to reduce HTML size - CSS loads fast anyway due to media="print" trick
  const criticalCSS = `<style>*{box-sizing:border-box;margin:0;padding:0}html{line-height:1.5;font-family:system-ui,-apple-system,sans-serif}body{min-height:100vh;display:flex;flex-direction:column}#main-content{flex:1 1 0%}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0}.container{width:100%;max-width:1280px;margin:0 auto;padding:0 1rem}.flex{display:flex}.items-center{align-items:center}.justify-center{justify-content:center}.text-center{text-align:center}.h-20{height:5rem}.sticky{position:sticky}.top-0{top:0}.z-50{z-index:50}.hidden{display:none}.bg-white{background-color:#fff}.text-white{color:#fff}.font-bold{font-weight:700}.font-semibold{font-weight:600}.rounded-lg{border-radius:.5rem}.transition-colors{transition:color .3s,background-color .3s}.relative{position:relative}.absolute{position:absolute}.inset-0{inset:0}.w-full{width:100%}.h-full{height:100%}.flex-col{flex-direction:column}.overflow-hidden{overflow:hidden}</style>`;

  // Find the entry CSS filename (may have hash changes between builds)
  const entryCssMatch = optimized.match(/href="\/_nuxt\/entry\.([a-zA-Z0-9_-]+)\.css"/);
  const entryCssFile = entryCssMatch ? `entry.${entryCssMatch[1]}.css` : 'entry.8JSS-Bpx.css';

  // Check if critical CSS is already present (added by nitro-hooks.ts during SSR)
  // If not, add it here as a fallback
  const socialPreconnects = '<link rel="dns-prefetch" href="https://linkedin.com"><link rel="dns-prefetch" href="https://facebook.com">';
  // Use WebP preload for modern browsers (smaller file size = faster LCP)
  const lcpPreload = '<link rel="preload" as="image" href="/images/hero/home-header-1920w.webp" type="image/webp" fetchpriority="high">';

  if (!optimized.includes('.sr-only{position:absolute')) {
    // Critical CSS not present, add it
    if (!optimized.includes('rel="preload" as="image"')) {
      optimized = optimized.replace('<head>', `<head>${lcpPreload}${criticalCSS}${socialPreconnects}`);
    } else {
      optimized = optimized.replace('<head>', `<head>${criticalCSS}${socialPreconnects}`);
    }
  } else if (!optimized.includes('linkedin.com')) {
    // Just add social preconnects if missing
    optimized = optimized.replace('<head>', `<head>${socialPreconnects}`);
  } else if (!optimized.includes('home-header-1920w.webp')) {
    // Replace any JPG preload with WebP preload if present
    optimized = optimized.replace(
      /<link rel="preload" as="image" href="\/images\/hero\/[^"]+\.jpg"[^>]*>/,
      lcpPreload
    );
  }

  // NOTE: The build generates modulepreload and script tags with filenames that may not exist.
  // This is a Nuxt/Vite quirk where the hash changes between HTML generation and file writing.
  // For static builds, we need to find the actual entry file and update the references.
  //
  // Find the actual main entry JS file by looking in the _nuxt directory
  const fs = require('fs');
  const path = require('path');
  const nuxtDir = path.join(projectRoot, '.output', 'public', '_nuxt');

  // Find the largest JS file (likely the main entry point with Vue/Nuxt core)
  let mainEntryFile = null;
  let maxSize = 0;

  try {
    const files = fs.readdirSync(nuxtDir).filter(f => f.endsWith('.js'));
    files.forEach(file => {
      const filePath = path.join(nuxtDir, file);
      const stat = fs.statSync(filePath);
      if (stat.size > maxSize) {
        maxSize = stat.size;
        mainEntryFile = file;
      }
    });
  } catch (e) {
    // If we can't find the entry file, skip this optimization
    console.warn('Warning: Could not find entry JS file');
  }

  // Remove modulepreload links (they reference potentially wrong hashes)
  optimized = optimized.replace(
    /<link rel="modulepreload"[^>]*href="\/_nuxt\/([a-zA-Z0-9_-]+)\.js"[^>]*>/g,
    ''
  );

  // Fix the script tag to point to the correct entry file
  // Note: Module scripts are deferred by default in modern browsers
  // Don't add the defer attribute as it's not needed for module scripts
  if (mainEntryFile) {
    const entryFileName = mainEntryFile.replace('.js', '');
    // Replace the script src with the correct entry file, remove crossorigin
    optimized = optimized.replace(
      /<script type="module" src="\/_nuxt\/[^"]+\.js"( crossorigin)?[^>]*>/,
      `<script type="module" src="/_nuxt/${entryFileName}.js">`
    );

    // Add preload hint for the main entry JS to start loading early
    // This helps the browser discover and load the critical JS faster
    // Also add preload hint for entry CSS to prevent render delay
    // Check if preload doesn't already exist for this file
    const entryJsPreload = `<link rel="preload" href="/_nuxt/${entryFileName}.js" as="script" fetchpriority="high">`;
    // Add entry CSS preload too - helps prevent FOUC even with media="print" trick
    const entryCssPreload = entryCssMatch ? `<link rel="preload" href="/_nuxt/${entryCssFile}" as="style">` : '';

    if (!optimized.includes(`rel="preload" href="/_nuxt/${entryFileName}.js"`)) {
      // Add preload right after the existing preloads or in head
      const headEnd = optimized.indexOf('</head>');
      if (headEnd > 0) {
        const preloadHints = entryJsPreload + entryCssPreload;
        optimized = optimized.substring(0, headEnd) + preloadHints + optimized.substring(headEnd);
      }
    }
  }

  // NEW: Minify the HTML by removing unnecessary whitespace between tags
  // This reduces HTML size without affecting rendering
  optimized = optimized.replace(/>\s+</g, '><');

  return optimized;
}

// Process each file
filesToOptimize.forEach((file) => {
  const filePath = path.join(publicDir, file);

  if (fs.existsSync(filePath)) {
    let html = fs.readFileSync(filePath, 'utf8');
    const originalSize = html.length;

    html = optimizeHTML(html);

    const newSize = html.length;
    const saved = originalSize - newSize;
    const savedPercent = ((saved / originalSize) * 100).toFixed(2);

    fs.writeFileSync(filePath, html);
    console.log(`✓ Optimized ${file} - Saved ${saved} bytes (${savedPercent}%)`);

    // Remove stale compressed files - Nitro will recreate them with correct content
    const brFile = filePath + '.br';
    const gzFile = filePath + '.gz';

    if (fs.existsSync(brFile)) {
      fs.unlinkSync(brFile);
    }
    if (fs.existsSync(gzFile)) {
      fs.unlinkSync(gzFile);
    }
  } else {
    console.log(`- Skipped ${file} (not found)`);
  }
});

console.log('\n✅ HTML optimization complete!');
