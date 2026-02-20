#!/usr/bin/env node

/**
 * Deployment Verification Script
 *
 * This script checks if the Nuxt build is deployed to production
 * and provides instructions for running Lighthouse audit.
 */

const https = require('https');

const PRODUCTION_URL = 'https://vp-associates.com';
const NUXT_MARKERS = [
  '__NUXT__',
  '_nuxt/',
  'GB-h7zir.js', // Current entry point filename
];

const WORDPRESS_MARKERS = [
  'wp-json',
  'wp-content',
  'wp-includes',
  'wordpress',
];

async function checkDeployment() {
  console.log('Checking deployment status...\n');

  return new Promise((resolve) => {
    https.get(PRODUCTION_URL, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const hasNuxt = NUXT_MARKERS.some(marker => data.includes(marker));
        const hasWordPress = WORDPRESS_MARKERS.some(marker => data.toLowerCase().includes(marker.toLowerCase()));

        console.log('=== DEPLOYMENT STATUS ===\n');

        if (hasNuxt && !hasWordPress) {
          console.log('✅ Nuxt build is deployed to production!');
          console.log('\nThe optimized build is live. Run Lighthouse to verify:');
          console.log(`1. Go to https://pagespeed.web.dev/`);
          console.log(`2. Enter: ${PRODUCTION_URL}`);
          console.log(`3. Check Performance score is 90+\n`);
          console.log('Expected metrics:');
          console.log('- LCP: < 2.5s (hero image is preloaded)');
          console.log('- FID: < 100ms (minimal JS on main thread)');
          console.log('- CLS: < 0.1 (stable layout with skeleton screens)');
          console.log('- Performance Score: 90-100');
        } else if (hasWordPress) {
          console.log('❌ WordPress is still running on production');
          console.log('\nThe optimized Nuxt build has NOT been deployed.');
          console.log('\nTo deploy:');
          console.log('1. Upload .output/public/ contents to web server');
          console.log('2. Verify the deployment with this script again');
          console.log('3. Run Lighthouse audit\n');
        } else {
          console.log('⚠️  Unable to determine platform');
          console.log('Please manually check the site.\n');
        }

        resolve({ hasNuxt, hasWordPress });
      });
    }).on('error', (err) => {
      console.error('Error checking deployment:', err.message);
      resolve({ hasNuxt: false, hasWordPress: false, error: err.message });
    });
  });
}

checkDeployment().then(result => {
  process.exit(result.hasNuxt && !result.hasWordPress ? 0 : 1);
});
