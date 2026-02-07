# Technology Stack: Performance Optimization

**Project:** VP Associates Website v1.1
**Dimension:** Stack additions/changes for 90+ Lighthouse scores
**Researched:** 2026-02-06
**Overall Confidence:** HIGH

---

## Executive Summary

The existing Nuxt 3 stack is well-positioned for 90+ Lighthouse scores. **No major framework changes needed.** The path to 90+ focuses on:

1. **Bundle analysis and optimization** (rollup-plugin-visualizer)
2. **Critical CSS inlining** (@nuxtjs/critters - replaces need for separate purgeCSS)
3. **Performance testing automation** (unlighthouse)
4. **Configuration refinements** (NuxtLink prefetch, image loading strategies)
5. **Optional: Font self-hosting** for 200-300ms improvement (LOW priority given effort)

---

## Current Stack (No Changes Needed)

| Technology | Version | Status for 90+ Lighthouse |
|------------|---------|---------------------------|
| Nuxt | 3.15.0 | Already optimal - SSR/SSG hybrid, Nitro engine |
| @nuxt/image | 2.0.0 | Already optimal - WebP/AVIF, responsive |
| @vite-pwa/nuxt | 1.1.0 | Already optimal - Workbox caching configured |
| Tailwind CSS | 3.x (via @nuxtjs/tailwindcss) | Already optimal - JIT, minimal CSS |
| TypeScript | 5.7.3 | No performance impact, keep for safety |
| Pinia | 0.5.5 | Minimal state, no issues |

---

## Recommended Additions

### 1. Bundle Analysis: `rollup-plugin-visualizer`

**Purpose:** Visualize bundle composition, identify oversized chunks, measure optimization impact.

**Version:** 6.0.5 (latest as of July 2025)

**Why:**
- Essential for data-driven optimization decisions
- Integrates directly with Vite (Nuxt's build tool)
- Generates treemap visualizations showing dependency sizes
- Cannot optimize what you cannot measure

**Installation:**
```bash
npm install -D rollup-plugin-visualizer
```

**Configuration (nuxt.config.ts):**
```typescript
vite: {
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: '.output/stats.html'
    })
  ]
}
```

**When to use:** Run once before optimization, after each major change, and for final validation.

---

### 2. Critical CSS Inlining: `@nuxtjs/critters`

**Purpose:** Extract and inline critical above-the-fold CSS, defer non-critical CSS, remove unused CSS.

**Version:** Latest (see npm for current)

**Why:**
- Eliminates render-blocking CSS (major Lighthouse Performance factor)
- Built-in PurgeCSS integration removes unused styles
- Zero-configuration - works automatically with Nitro prerendering
- Specific to Nuxt 3's architecture

**Installation:**
```bash
npm install -D @nuxtjs/critters
```

**Configuration (nuxt.config.ts):**
```typescript
modules: ['@nuxtjs/critters'],
critters: {
  purgeCSS: true,  // Remove unused CSS
  preload: 'swap'  // Don't block rendering
}
```

**Expected Impact:** 10-20 point improvement in Performance score by eliminating render-blocking resources.

---

### 3. Performance Testing: `unlighthouse`

**Purpose:** Automated Lighthouse auditing across all pages with CI integration.

**Version:** Latest (actively maintained)

**Why:**
- CI/CD integration ensures regressions are caught
- Site-wide crawling catches page-specific issues
- Budget assertions enforce performance standards
- Official Nuxt integration available

**Installation:**
```bash
npm install -D unlighthouse
```

**Configuration (nuxt.config.ts):**
```typescript
modules: ['unlighthouse'],
unlighthouse: {
  domFlow: true,  // Analyze DOM for critical path
  budget: {
    scores: {
      performance: 90,
      accessibility: 90,
      bestPractices: 90,
      seo: 90
    }
  }
}
```

**Usage:**
```bash
npx unlighthouse --site https://vp-associates.com
```

**Sources:**
- [Unlighthouse Official](https://unlighthouse.dev/)
- [Nuxt Integration Guide](https://unlighthouse.dev/integrations/nuxt)

---

## Configuration Optimizations (No New Dependencies)

### 1. NuxtLink Prefetch Control

**Current Behavior:** All NuxtLink components prefetch via Intersection Observer by default.

**Issue:** Aggressive prefetching can spike bandwidth and affect Lighthouse "unused JavaScript" metrics.

**Recommendation:** Selective prefetching based on user likelihood.

**Implementation:**
```vue
<!-- Keep prefetching for high-likelihood navigation (default) -->
<NuxtLink to="/services">Services</NuxtLink>

<!-- Disable for footer links, less common routes -->
<NuxtLink to="/privacy" no-prefetch>Privacy</NuxtLink>
```

**Global Control (if needed):**
```typescript
// nuxt.config.ts
router: {
  options: {
    prefetch: false  // Disable globally, use :prefetch="{ intention: 'hover' }" per-link
  }
}
```

**Sources:**
- [NuxtLink Documentation](https://nuxt.com/docs/3.x/api/components/nuxt-link)
- [Prefetch Optimization Guide](https://whoisarjen.com/blog/nuxt-disable-prefetch-save-costs)

---

### 2. Image Loading Strategy Refinement

**Current State:** @nuxt/image with quality: 80, WebP/AVIF formats.

**Missing:** Above-the-fold images should use `loading="eager"` to prevent LCP penalties.

**Implementation:**
```vue
<!-- Hero images (above fold) -->
<NuxtImg
  src="/hero/berlin-structure.jpg"
  loading="eager"
  priority
  width="1920"
  height="1080"
  format="webp"
/>

<!-- Below-fold content -->
<NuxtImg
  src="/projects/image.jpg"
  loading="lazy"
  placeholder="blur"  // Improves perceived performance
/>
```

**Why:** Lighthouse penalizes lazy-loading above-the-fold content. This is a quick win for LCP scores.

---

### 3. Script Loading Optimization

**Current State:** Scripts load via standard Nuxt behavior.

**Opportunity:** Defer non-critical third-party scripts using `useHead`.

**Implementation:**
```typescript
// In page or component setup
useHead({
  script: [
    {
      src: 'https://analytics.example.com/script.js',
      defer: true,
      tagPosition: 'bodyClose'  // Load after main content
    }
  ]
})
```

**Alternative for complex third-party management:** `@nuxtjs/script` (not needed unless using many external scripts)

---

## Optional Additions (Lower Priority)

### 4. Font Self-Hosting (200-300ms Improvement)

**Current State:** Google Fonts via CDN with preconnect.

**Issue:** External request adds ~200-300ms vs self-hosted WOFF2.

**Recommendation:** LOWER PRIORITY - Only implement if needed to reach 90+ after other optimizations.

**Why Lower Priority:**
- Requires font subset generation
- Ongoing maintenance burden
- CDN provides automatic updates
- Current preconnect configuration already optimized

**If implementing:**
1. Download WOFF2 variants of Inter and Roboto Condensed
2. Add to `public/fonts/`
3. Update CSS to use local fonts
4. Remove Google Fonts links from nuxt.config.ts

**Sources:**
- [Self-Hosted vs Google Fonts 2025](https://www.frontendtools.tech/blog/modern-image-optimization-techniques-2025)

---

## What NOT to Add

| Technology | Why Avoid |
|------------|-----------|
| Separate PurgeCSS module | @nuxtjs/critters includes it |
| nuxt-compress/nuxt-precompress | Use server-level compression (nginx/vercel) for dynamic content |
| Separate lazy-loading library | @nuxt/image already handles this |
| Additional analytics libraries | Third-party scripts hurt performance |
| vue-lazy-hydration | Adds complexity; hydration issues should be fixed at source |

---

## Installation Summary

```bash
# Core optimization tools
npm install -D rollup-plugin-visualizer
npm install -D @nuxtjs/critters
npm install -D unlighthouse

# No other dependencies needed
```

---

## Updated nuxt.config.ts Structure

```typescript
export default defineNuxtConfig({
  modules: [
    '@nuxt/image',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/sitemap',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/icon',
    '@vite-pwa/nuxt',
    '@nuxtjs/critters',  // NEW
    'unlighthouse'        // NEW
  ],

  vite: {
    plugins: [
      // Bundle visualization (dev only)
      visualizer({
        open: false,
        gzipSize: true,
        brotliSize: true,
        filename: '.output/stats.html'
      })
    ]
  },

  critters: {
    purgeCSS: true,
    preload: 'swap'
  },

  unlighthouse: {
    domFlow: true,
    budget: {
      scores: {
        performance: 90,
        accessibility: 90,
        bestPractices: 90,
        seo: 90
      }
    }
  }
})
```

---

## Phase Implementation Order

1. **Phase 1: Measurement** - Add rollup-plugin-visualizer, establish baseline
2. **Phase 2: Critical Path** - Add @nuxtjs/critters, fix image loading="eager"
3. **Phase 3: Validation** - Add unlighthouse, configure budget assertions
4. **Phase 4: Polish** - Refine prefetching, script loading (if needed)

---

## Sources

- [Nuxt Performance Best Practices](https://nuxt.com/docs/3.x/guide/best-practices/performance) - HIGH confidence, official
- [Unlighthouse Nuxt Integration](https://unlighthouse.dev/integrations/nuxt) - HIGH confidence, official
- [Nitro Cache Documentation](https://nitro.build/guide/cache) - HIGH confidence, official
- [@nuxtjs/critters GitHub](https://github.com/nuxt-modules/critters) - HIGH confidence, official
- [rollup-plugin-visualizer npm](https://www.npmjs.com/package/rollup-plugin-visualizer) - HIGH confidence, official
- [Self-Hosted vs Google Fonts Performance](https://www.frontendtools.tech/blog/modern-image-optimization-techniques-2025) - MEDIUM confidence, 2025 source
- [Nuxt Link Prefetch Deep Dive](https://medium.com/@pepcorns/deep-dive-into-the-nuxt-link-component-b9e189866991) - MEDIUM confidence
- [Critical CSS Inlining Guide](https://softwarehouse.au/blog/implementing-critical-css-inlining-for-above-the-fold-content/) - MEDIUM confidence
- [Vite-PWA Nuxt Guide](https://marcusn.dev/articles/2024-12/nuxt-3-pwa) - HIGH confidence, official
