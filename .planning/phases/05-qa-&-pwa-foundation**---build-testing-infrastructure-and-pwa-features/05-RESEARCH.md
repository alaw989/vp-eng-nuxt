# Phase 5: QA & PWA Foundation - Research

**Researched:** 2026-02-05
**Domain:** Progressive Web App (PWA) configuration, service worker caching strategies, pre-commit hooks, and Lighthouse performance testing
**Confidence:** HIGH

## Summary

This phase focuses on establishing quality assurance infrastructure and Progressive Web App capabilities for the VP Associates Nuxt 3 website. Key areas include implementing cache-first app shell strategies for offline support, setting up pre-commit testing hooks, and integrating Lighthouse CI for performance benchmarking.

The project already has `@vite-pwa/nuxt` installed (v1.1.0) and configured in `nuxt.config.ts`, with existing PWA components (`PwaInstallPrompt.vue`, `PwaReloadPrompt.vue`) and an offline page (`offline.vue`). The existing configuration uses Workbox's runtime caching with NetworkFirst for APIs, CacheFirst for images, and StaleWhileRevalidate for static assets.

**Primary recommendation:** Use the existing `@vite-pwa/nuxt` installation with refined cache-first app shell configuration, implement Husky for pre-commit hooks running the full build+preview+Lighthouse pipeline, and use Lighthouse programmatically for local testing with JSON report generation to `.planning/audit/lighthouse.json`.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **@vite-pwa/nuxt** | ^1.1.0 (already installed) | PWA features for Nuxt 3 | Official Nuxt module wrapping vite-plugin-pwa with zero-config PWA setup |
| **lighthouse** | latest | Core performance auditing library | Google's official performance auditing tool |
| **chrome-launcher** | latest | Headless Chrome for Lighthouse | Required for programmatic Lighthouse runs |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **@lhci/cli** | ^0.10.x | Lighthouse CI CLI | For automated CI runs (useful reference, local script preferred) |
| **husky** | ^9.x | Git hooks management | Industry standard for pre-commit hooks in Nuxt projects |
| **lint-staged** | latest | Run commands on staged files | Optional: speeds up pre-commit if only checking changed files |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| **Husky** | simple-git-hooks | simple-git-hooks has zero dependencies but Husky has better Nuxt 3 ecosystem support and more documentation |
| **Lighthouse programmatic** | Lighthouse CI CLI | Programmatic approach gives more control for local pre-commit hooks; CI CLI is better for GitHub Actions |

**Installation:**
```bash
# Husky for pre-commit hooks
npm install -D husky

# Lighthouse and Chrome launcher for programmatic auditing
npm install -D lighthouse chrome-launcher

# Initialize Husky (creates .husky/ directory)
npx husky init
```

## Architecture Patterns

### Recommended Project Structure
```
public/
├── images/
│   ├── icon.svg              # PWA icon (already exists)
│   └── og-default.jpg        # Fallback icon (already exists)
scripts/
├── lighthouse-audit.js       # Lighthouse audit script
└── pre-commit.js             # Pre-commit validation script
.husky/
└── pre-commit                # Git hook (created by husky)
.planning/
└── audit/
    └── lighthouse.json       # JSON report for trend tracking
```

### Pattern 1: Cache-First App Shell Configuration

The app shell strategy caches core application resources (layouts, CSS, JS, fonts, icons) using CacheFirst strategy, enabling instant page loads even on slow networks.

**What:** Pre-cache the application shell (core HTML, CSS, JS) so the app structure loads immediately from cache, then fetch dynamic content.

**When to use:** For any Nuxt 3 PWA where you want fast initial loads and offline capability.

**Source:** [vite-pwa-org.netlify.app](https://vite-pwa-org.netlify.app/workbox/generate-sw)

```typescript
// nuxt.config.ts - PWA configuration
pwa: {
  registerWebManifestInRouteRules: true,
  client: {
    installPrompt: true,
    registerPlugin: true,
    periodicSyncForUpdates: 3600,
  },
  workbox: {
    navigateFallback: '/offline',
    // Cache app shell with CacheFirst
    globPatterns: [
      '**/*.{js,css,html,svg,png,jpg,jpeg,woff2}'
    ],
    runtimeCaching: [
      // App shell: layouts, CSS, JS - CacheFirst
      {
        urlPattern: /^https:\/\/.*\.(?:js|css)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'app-shell-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
          }
        }
      },
      // Google Fonts - CacheFirst
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      },
      // WordPress API - NetworkFirst
      {
        urlPattern: /^https:\/\/www\.vp-associates\.com\/wp-json\/wp\/v2\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'wp-api-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 // 24 hours
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      }
    ]
  }
}
```

### Pattern 2: Programmatic Lighthouse Audit

Run Lighthouse from a Node.js script for pre-commit hooks, saving JSON results for trend tracking.

**What:** Use Lighthouse's programmatic API with chrome-launcher to audit URLs and save results.

**When to use:** For local pre-commit validation and performance trend tracking.

**Source:** [github.com/googlechrome/lighthouse](https://github.com/googlechrome/lighthouse/blob/main/docs/readme.md)

```javascript
// scripts/lighthouse-audit.js
import fs from 'fs';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Performance budgets from context: 85+ for all categories
const BUDGETS = {
  performance: 85,
  accessibility: 85,
  seo: 85,
  'best-practices': 85
};

async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu']
  });

  try {
    const options = {
      logLevel: 'silent',
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: chrome.port
    };

    const runnerResult = await lighthouse(url, options);
    const lhr = runnerResult.lhr;

    // Save JSON report for trend tracking
    const reportPath = join(__dirname, '../.planning/audit/lighthouse.json');
    fs.writeFileSync(reportPath, JSON.stringify(lhr, null, 2));

    return lhr;
  } finally {
    await chrome.kill();
  }
}

function checkBudgets(lhr) {
  const failures = [];

  for (const [category, budget] of Object.entries(BUDGETS)) {
    const score = lhr.categories[category]?.score * 100 || 0;

    if (score < budget) {
      failures.push({
        category,
        score: Math.round(score),
        budget,
        diff: budget - score
      });
    }
  }

  return failures;
}

// Run audit if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const url = process.argv[2] || 'http://localhost:3000';

  runLighthouse(url)
    .then(lhr => {
      console.log('Lighthouse scores:');
      for (const [key, category] of Object.entries(lhr.categories)) {
        const score = Math.round(category.score * 100);
        console.log(`  ${key}: ${score}`);
      }

      const failures = checkBudgets(lhr);

      if (failures.length > 0) {
        console.error('\nBudget failures:');
        failures.forEach(f => {
          console.error(`  ${f.category}: ${f.score} (below ${f.budget} by ${f.diff})`);
        });
        process.exit(1);
      }

      console.log('\nAll budgets met!');
      process.exit(0);
    })
    .catch(err => {
      console.error('Lighthouse failed:', err);
      process.exit(1);
    });
}

export { runLighthouse, checkBudgets };
```

### Pattern 3: Pre-Commit Hook Script

Run the full CI pipeline (build + preview + Lighthouse) before allowing commits.

**What:** Husky pre-commit hook that validates the build with preview server and Lighthouse audit.

**When to use:** To enforce quality standards before code is committed.

```javascript
// scripts/pre-commit.js
import { execSync } from 'child_process';
import { runLighthouse, checkBudgets } from './lighthouse-audit.js';

console.log('Running pre-commit validation...\n');

try {
  // Step 1: Build
  console.log('Building...');
  execSync('npm run build', { stdio: 'inherit' });

  // Step 2: Start preview server in background
  console.log('Starting preview server...');
  const preview = execSync('npm run preview', {
    stdio: 'pipe',
    detached: true
  });
  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Step 3: Run Lighthouse audit
  console.log('Running Lighthouse audit...');
  const lhr = await runLighthouse('http://localhost:3000');

  // Step 4: Check budgets
  const failures = checkBudgets(lhr);

  // Kill preview server
  if (preview.pid) {
    process.kill(-preview.pid);
  }

  if (failures.length > 0) {
    console.error('\nLighthouse budget failures:');
    failures.forEach(f => {
      console.error(`  ${f.category}: ${f.score} (below ${f.budget} by ${f.diff})`);
    });
    console.error('\nCommit blocked. Improve scores or adjust budgets.');
    process.exit(1);
  }

  console.log('\nPre-commit checks passed!');
} catch (err) {
  console.error('\nPre-commit validation failed:', err.message);
  process.exit(1);
}
```

### Anti-Patterns to Avoid

- **Disabling PWA in development:** The project currently has `devOptions.enabled: false`. This prevents testing PWA features during development. Recommendation: enable selectively for testing with environment flag.

- **Caching dynamic content with CacheFirst:** API responses and dynamic content should use NetworkFirst, not CacheFirst, to ensure users get fresh data.

- **Using generic PWA icons:** Use the site logo (already have `icon.svg`). For proper PWA icons, use a tool like `pwa-asset-generator` to generate all required sizes.

- **Ignoring hydration warnings:** Hydration mismatches can cause silent bugs. Nuxt 3 documentation explicitly warns not to ignore these warnings.

- **Running Lighthouse only once:** Scores vary between runs. For accurate measurements, run 3 times and use median (Lighthouse provides `computeMedianRun` utility).

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| **Git hooks management** | Custom shell scripts in .git/hooks | **Husky** | Husky persists hooks in repository (unlike .git/hooks which isn't committed), works across teams, auto-initializes on install |
| **Service worker caching** | Custom cache API code | **Workbox (via vite-pwa)** | Workbox handles cache versioning, expiration, cleanup, and complex routing patterns. Hand-rolled SWs inevitably miss edge cases |
| **Lighthouse automation** | Custom Puppeteer scripts | **Lighthouse programmatic API** | Lighthouse's own API handles Chrome launching, throttling, and result parsing correctly. Puppeteer scripts require reimplementing all this |
| **PWA icon generation** | Manual ImageMagick scripts | **pwa-asset-generator** | Generates 15+ icon sizes, splash screens, favicons, and updates manifest.html according to Web App Manifest and Apple HIG specs |
| **Performance budget assertion** | Custom score checking logic | **Lighthouse CI assertions** | Built-in assertion system with minScore, maxNumericValue, and maxLength options for budgets |

**Key insight:** Custom PWA solutions fail at cache invalidation, service worker updates, and cross-browser compatibility. Existing tools have solved these problems through years of real-world testing.

## Common Pitfalls

### Pitfall 1: Service Worker Not Activating in Preview Mode

**What goes wrong:** After `npm run build && npm run preview`, the service worker doesn't cache resources or offline page doesn't load.

**Why it happens:** The `@vite-pwa/nuxt` module's `devOptions.enabled: false` disables PWA in development. Preview mode is often treated similarly to dev mode.

**How to avoid:**
1. Set `devOptions.enabled: true` during testing (use environment variable)
2. For production preview, the service worker should be in `.output/public/sw.js`
3. Verify with Chrome DevTools > Application > Service Workers that the SW is active

**Warning signs:** Offline page shows browser "No Internet" page instead of custom `/offline` page.

### Pitfall 2: Cache-First Strategy for Dynamic Content

**What goes wrong:** Users see stale content because API responses are cached indefinitely with CacheFirst strategy.

**Why it happens:** CacheFirst serves from cache without network check, perfect for static assets but wrong for dynamic data.

**How to avoid:**
- Use **CacheFirst** for: JS, CSS, fonts, icons, images
- Use **NetworkFirst** for: API calls, dynamic content
- Use **StaleWhileRevalidate** for: HTML pages, static resources that update occasionally

**Warning signs:** Changes in WordPress CMS don't appear on PWA without hard refresh.

### Pitfall 3: Pre-Commit Hook Too Slow

**What goes wrong:** Developers disable pre-commit hooks because they take 30+ seconds to run.

**Why it happens:** Running full build + Lighthouse on every commit is inherently slow.

**How to avoid:**
1. Use `lint-staged` to only run checks on relevant changed files
2. Consider running Lighthouse on push instead of pre-commit (use `pre-push` hook)
3. Allow bypass with `git commit --no-verify` for emergency commits
4. Make the hook configurable via environment variable

**Warning signs:** Team members frequently using `--no-verify` or removing hooks manually.

### Pitfall 4: Lighthouse Score Variance

**What goes wrong:** Scores fluctuate between runs (e.g., 89 then 92 then 87), causing inconsistent CI results.

**Why it happens:** Lighthouse scores vary due to network conditions, CPU throttling simulation, and browser state.

**How to avoid:**
1. Run Lighthouse 3 times and use the median result
2. Use Lighthouse's `computeMedianRun` utility
3. Set budget thresholds with buffer (e.g., target 90 but fail at 85)

**Source:** [github.com/googlechrome/lighthouse](https://github.com/googlechrome/lighthouse/blob/main/docs/variability.md)

```javascript
import { computeMedianRun } from 'lighthouse/core/lib/median-run.js';

const results = [];
for (let i = 0; i < 3; i++) {
  const result = await lighthouse(url, options);
  results.push(result.lhr);
}

const median = computeMedianRun(results);
console.log('Median performance:', median.categories.performance.score * 100);
```

**Warning signs:** CI passes inconsistently with same code.

### Pitfall 5: Hydration Mismatches from PWA Registration

**What goes wrong:** Adding PWA causes hydration mismatch errors in console.

**Why it happens:** The PWA plugin or service worker registration modifies the DOM differently on server vs client.

**How to avoid:**
1. Use `ClientOnly` component around PWA-related UI
2. Check `nuxtApp.isHydrating` before executing PWA code
3. Enable `experimental.vueBuildOptimizer` in nuxt.config.ts

**Source:** [nuxt.com/docs](https://nuxt.com/docs/3.x/guide/best-practices/hydration)

```vue
<template>
  <ClientOnly>
    <PwaInstallPrompt />
  </ClientOnly>
</template>
```

**Warning signs:** Console shows "Hydration mismatch" warnings after adding PWA components.

## Code Examples

### Verified Pre-Commit Hook Setup (Husky)

```bash
# Initialize Husky
npx husky init

# Create pre-commit hook
cat > .husky/pre-commit << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "Running pre-commit checks..."
node scripts/pre-commit.js
EOF

chmod +x .husky/pre-commit
```

### PWA Icon Generation with pwa-asset-generator

```bash
# Install the tool globally
npm install -g @elegantapp/pwa-asset-generator

# Generate all PWA icons from a single source
# Source: https://github.com/elegantapp/pwa-asset-generator
pwa-asset-generator --path public/images/icon.svg public/images/

# This generates:
# - Multiple icon sizes (72, 96, 128, 144, 152, 192, 384, 512)
# - Apple touch icons
# - Favicon in multiple sizes
# - Splash screens for iOS
# - Windows tile images
```

### Lighthouse Configuration File (.lighthouserc.js)

```javascript
// .lighthouserc.js - Based on alvarosabu/nuxt-lighthouse-ci example
// Source: https://github.com/alvarosabu/nuxt-lighthouse-ci
export default {
  ci: {
    assert: {
      assertions: {
        // Relaxed 85+ targets from context
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.85 }],
        'categories:seo': ['error', { minScore: 0.85 }],
        'categories:best-practices': ['warn', { minScore: 0.85 }],
      }
    },
    collect: {
      staticDistDir: './.output/public',
      url: [
        'http://localhost:3000',
        'http://localhost:3000/about',
        'http://localhost:3000/services',
        'http://localhost:3000/projects',
      ]
    },
    upload: {
      target: 'temporary-public-storage' // For local testing
    }
  }
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| **Generate SW strategy** | **InjectManifest strategy** | vite-pwa v0.15+ | InjectManifest allows full control over service worker; GenerateSW is simpler but less flexible |
| **Husky v4 (automatic)** | **Husky v9 (manual init)** | 2021 | Husky v9 requires `npx husky init` and explicit hook creation, but is faster and more reliable |
| **Manual icon sizing** | **pwa-asset-generator** | 2020+ | Automates generation of 15+ icon sizes and manifest updates |
| **@nuxt/pwa module** | **@vite-pwa/nuxt** | 2022 | @nuxt/pwa is deprecated; @vite-pwa/nuxt is actively maintained and works with Nuxt 3 |

**Deprecated/outdated:**
- **@nuxt/pwa:** Replaced by `@vite-pwa/nuxt` - the old module is unmaintained and incompatible with Nuxt 3
- **workbox-build standalone:** No need to use directly; vite-pwa wraps Workbox completely
- **Lighthouse CI CLI (lhci):** Still works but programmatic API is more flexible for local hooks

## Open Questions

1. **Pre-commit failure handling mechanism**
   - **What we know:** Full CI pipeline in pre-commit is slow (30+ seconds). Fast feedback is desired.
   - **What's unclear:** Whether to use pre-commit (fast but annoying) or pre-push (slower but less disruptive) or a hybrid (lint on commit, full test on push).
   - **Recommendation:** Start with pre-commit but allow bypass with `--no-verify`. Consider `lint-staged` for faster incremental checks. If too disruptive, move to pre-push hook.

2. **Lighthouse pages to audit**
   - **What we know:** The site has ~7 main pages (index, about, services, projects, careers, contact, search).
   - **What's unclear:** Whether to audit all pages on every run (slow) or just homepage with spot checks (might miss regressions).
   - **Recommendation:** Audit homepage on every pre-commit run. For full CI, audit all pages. Store per-page scores in JSON for trend tracking.

3. **Offline page design details**
   - **What we know:** An `offline.vue` page already exists with good content (offline icon, helpful message, contact info).
   - **What's unclear:** Whether the existing design matches the final branding or needs refinement.
   - **Recommendation:** The existing offline page is comprehensive. Test it thoroughly in the build to ensure it loads correctly when offline.

## Sources

### Primary (HIGH confidence)
- [/vite-pwa/vite-plugin-pwa](https://context7.com/vite-pwa/vite-plugin-pwa/llms.txt) - Cache-first configuration, Workbox runtime caching, inject manifest strategy
- [/websites/vite-pwa-org_netlify_app](https://vite-pwa-org.netlify.app/frameworks/nuxt) - Nuxt 3 PWA configuration, $pwa composables, offline support
- [/websites/nuxt](https://nuxt.com/docs) - Nuxt 3 testing (build, preview commands), hydration best practices, isHydrating composable
- [/googlechrome/lighthouse](https://github.com/googlechrome/lighthouse) - Programmatic Lighthouse API, median run calculation, performance auditing
- [/googlechrome/lighthouse-ci](https://github.com/googlechrome/lighthouse-ci) - Lighthouse CI configuration, assertions, budgetPath settings
- [github.com/alvarosabu/nuxt-lighthouse-ci](https://github.com/alvarosabu/nuxt-lighthouse-ci) - Working example of Lighthouse CI with Nuxt 3 (lighthouserc.js, GitHub Actions workflow)

### Secondary (MEDIUM confidence)
- [github.com/elegantapp/pwa-asset-generator](https://github.com/elegantapp/pwa-asset-generator) - Automated PWA icon and splash screen generation tool (2.9k stars, actively maintained)
- [vite-pwa-org.netlify.app/guide/static-assets](https://vite-pwa-org.netlify.app/guide/static-assets) - Static assets handling guide for Vite PWA
- [marcusn.dev/articles/2024-12/nuxt-3-pwa](https://marcusn.dev/articles/2024-12/nuxt-3-pwa) - December 2024 Nuxt 3 PWA tutorial
- [nuxt.com/docs/3.x/guide/best-practices/hydration](https://nuxt.com/docs/3.x/guide/best-practices/hydration) - Nuxt hydration best practices, ClientOnly usage
- [medium.com/@Christopher_Tseng](https://medium.com/@Christopher_Tseng/build-a-blazing-fast-offline-first-pwa-with-vue-3-and-vite-in-2025-the-definitive-guide-5b4969bc7f96) - Vue 3 + Vite PWA guide (2025)

### Tertiary (LOW confidence)
- [Husky vs simple-git-hooks comparison](https://github.com/toplenboren/simple-git-hooks/issues/101) - GitHub issue discussing migration from Husky to simple-git-hooks
- [Nuxt 3 tutorials for ESLint/Prettier/Husky](https://blog.csdn.net/qq_36117388/article/details/137431627) - Chinese article showing Husky setup with Nuxt 3 (2024)

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** - All libraries are well-established, officially documented, and actively maintained. @vite-pwa/nuxt is already installed in the project.
- Architecture: **HIGH** - Patterns are from official documentation for vite-pwa, Nuxt 3, and Lighthouse. Working examples exist in the wild.
- Pitfalls: **HIGH** - Pitfalls are documented in official docs and real-world GitHub issues.

**Research date:** 2026-02-05
**Valid until:** 2026-03-05 (30 days - PWA and testing infrastructure moves fast but patterns are stable)
