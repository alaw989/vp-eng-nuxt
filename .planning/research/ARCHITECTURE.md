# Architecture Research

**Domain:** Performance Optimization for Existing Nuxt 3 Website
**Researched:** 2026-02-06
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
+-----------------------------------------------------------------------+
|                        Performance Optimization Layer                 |
+-----------------------------------------------------------------------+
|  Optimizations integrate at multiple architectural boundaries:        |
|                                                                       |
|  [Config Layer]        [Component Layer]       [Server Layer]        |
|  nuxt.config.ts        Components/*            server/api/*          |
|  - routeRules          - Lazy components       - Cached handlers     |
|  - image config         - Lazy hydration        - Response headers    |
|  - nitro config         - NuxtLink optimization                       |
|  - vite config          - v-memo, v-once                              |
|  - experimental                                                        |
+-----------------------------------------------------------------------+
|                        [Build Layer]                                  |
|  Vite bundling analysis, code splitting, bundle size optimization     |
+-----------------------------------------------------------------------+
|                        [Runtime Layer]                                |
|  Composables, plugins, data fetching optimization                     |
+-----------------------------------------------------------------------+
```

### Component Responsibilities

| Component | Responsibility | Integration Point | Optimization Scope |
|-----------|----------------|-------------------|-------------------|
| **nuxt.config.ts** | Central configuration for all performance features | Global - affects entire app | Route rules, image optimization, caching, build settings |
| **Nitro routeRules** | Hybrid rendering, caching headers, prerendering | Server-level - per-route | SSR/SSG/ISR strategy, cache control |
| **@nuxt/image** | Automatic image optimization | Components using NuxtImg/NuxtPicture | Image formats, sizing, lazy loading |
| **Lazy components** | Code-split non-critical components | Component level | Bundle size, TTI reduction |
| **Lazy hydration** | Delay component interactivity | Component level | TTI improvement, CPU reduction |
| **NuxtLink** | Smart prefetching, navigation optimization | Router/Aavigation | Page transition speed |
| **Cached event handlers** | Server-side response caching | server/api routes | API response time, server load |
| **Composables** | Reusable data fetching logic | Pages/components | Data fetch optimization |
| **Plugins** | Third-party script management | app initialization | Blocking time, CLS reduction |

## Recommended Project Structure

### Existing Structure (Performance Augmented)

```
nuxt.config.ts              # PRIMARY: Central performance configuration
                            # - routeRules, image, nitro, vite, experimental

server/
├── api/                    # Existing API routes (add caching)
│   ├── projects.get.ts     # ADD: defineCachedEventHandler wrapper
│   ├── services.get.ts     # ADD: defineCachedEventHandler wrapper
│   ├── contact.post.ts     # ADD: rate limiting consideration
│   └── ...
└── routes/                 # Existing dynamic routes
    ├── sitemap.xml.ts      # Already: prerender optimization
    └── rss.xml.ts          # Already: prerender optimization

components/                 # Existing components (augment with performance)
├── AppHeader.vue           # OPTIMIZE: Reduce render cost
├── HeroSlider.vue          # OPTIMIZE: Image loading, lazy hydration
├── StatCounter.vue         # OPTIMIZE: v-once for static values
├── ProjectCard.vue         # OPTIMIZE: Lazy loading images
├── ProjectGallery.vue      # OPTIMIZE: Image lazy loading below fold
├── PageLoadingBar.vue      # OPTIMIZE: Consider removing (uses intervals)
└── ...

composables/                # Existing composables (augment for performance)
├── useApi.ts               # OPTIMIZE: Add request deduplication
├── useInternalApi.ts       # OPTIMIZE: Cache static fallback data
├── usePageMeta.ts          # Already optimized
└── useAnalytics.ts         # OPTIMIZE: Lazy load analytics

plugins/                    # Existing plugins (review and optimize)
├── analytics.client.ts     # OPTIMIZE: Use Nuxt Scripts or defer loading
└── error-handler.ts        # Already minimal impact

pages/                       # Existing pages (augment with meta optimization)
├── index.vue               # OPTIMIZE: Critical CSS, LCP optimization
├── about.vue               # OPTIMIZE: Prerender strategy
├── projects/
│   ├── index.vue           # OPTIMIZE: Pagination, infinite scroll
│   └── [slug].vue          # OPTIMIZE: ISR caching
├── services/
│   ├── index.vue           # OPTIMIZE: Prerender strategy
│   └── [slug].vue          # OPTIMIZE: ISR caching
└── ...

public/                     # Static assets
└── images/                 # OPTIMIZE: Convert to next-gen formats
    ├── hero/               # Already: Optimized hero images
    └── projects/           # REVIEW: Check optimization status
```

### New Performance-Only Additions

```
# Performance-specific directory structure (optional organization):

composables/
├── usePerformance.ts       # NEW: Performance monitoring composable
└── useLazyHydration.ts     # NEW: Lazy hydration helpers

middleware/
└── prefetch.ts             # NEW: Intelligent prefetching strategy

utils/
├── performance.ts          # NEW: Performance utility functions
└── image-optimization.ts   # NEW: Image optimization helpers

scripts/
└── analyze-bundle.ts       # NEW: Bundle analysis runner
```

### Structure Rationale

- **nuxt.config.ts**: Central configuration point for all performance features - most impactful, no code changes required
- **server/api/**: Wrap existing handlers with `defineCachedEventHandler` for free server-side caching
- **components/**: Apply lazy loading and hydration strategies selectively - component-level optimization
- **composables/**: Data fetching optimization - reduce redundant requests
- **plugins/**: Convert blocking plugins to lazy-loaded composables where possible
- **pages/**: Route-specific meta tags and loading strategies

## Architectural Patterns

### Pattern 1: Config-First Optimization

**What:** Maximize performance gains through configuration changes before code modifications.

**When to use:** First phase of optimization - highest ROI, lowest risk.

**Trade-offs:**
- Pro: No code changes, framework-optimized, easy to revert
- Con: Limited to framework capabilities, may need code changes for edge cases

**Example:**
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // 1. Route rules - most impactful config change
  routeRules: {
    '/': { prerender: true, headers: { 'Cache-Control': 'public, max-age=3600' } },
    '/about': { prerender: true },
    '/projects': { isr: 3600 }, // Revalidate every hour
    '/projects/**': { isr: 3600 },
    '/services': { isr: 3600 },
    '/services/**': { isr: 3600 },
    '/contact': { prerender: true },
  },

  // 2. Image optimization - already configured, verify settings
  image: {
    quality: 80,
    format: ['webp', 'avif', 'jpg'],
    screens: { xs: 320, sm: 640, md: 768, lg: 1024, xl: 1280, xxl: 1536 },
  },

  // 3. Nitro caching headers
  nitro: {
    routeRules: {
      '/images/**': { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
      '/_nuxt/**': { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
    },
  },
})
```

### Pattern 2: Server-Side Caching Wrapper

**What:** Wrap existing Nitro event handlers with caching layer without modifying logic.

**When to use:** API endpoints that return data that doesn't change frequently.

**Trade-offs:**
- Pro: Zero logic changes, significant response time improvement
- Con: Stale data until cache expires, memory usage

**Example:**
```typescript
// server/api/projects.get.ts - BEFORE
export default defineEventHandler(async (event) => {
  // Existing logic...
  const response = await $fetch(url, { timeout: 10000 })
  return { success: true, data: response }
})

// server/api/projects.get.ts - AFTER (cached wrapper)
export default defineCachedEventHandler(async (event) => {
  // Existing logic unchanged...
  const query = getQuery(event)
  const url = `${WP_API_URL}/projects?page=${query.page}&per_page=${query.per_page}&_embed=true`
  const response = await $fetch(url, { timeout: 10000 })
  return { success: true, data: response }
}, {
  maxAge: 1000 * 60 * 15, // 15 minutes
  name: 'projects-cache',
  getKey: (event) => {
    const query = getQuery(event)
    return `projects-${query.page || 1}-${query.per_page || 12}`
  }
})
```

### Pattern 3: Lazy Component Loading

**What:** Use `Lazy` prefix for components that are not immediately visible.

**When to use:** Components below the fold, in modals, tabs, or conditional rendering.

**Trade-offs:**
- Pro: Reduced initial bundle size, faster TTI
- Con: Brief flash of content, network request on first use

**Example:**
```vue
<!-- pages/index.vue - BEFORE -->
<template>
  <div>
    <HeroSlider />
    <AppSection />            <!-- Above fold, load eagerly -->
    <ClientLogos />           <!-- Below fold, could be lazy -->
    <TestimonialCard />       <!-- Below fold, could be lazy -->
    <PwaReloadPrompt />       <!-- Only shown on update, already Lazy -->
  </div>
</template>

<!-- pages/index.vue - AFTER -->
<template>
  <div>
    <HeroSlider />
    <AppSection />
    <LazyClientLogos />       <!-- Lazy load when needed -->
    <LazyTestimonialCard />   <!-- Lazy load when needed -->
    <LazyPwaReloadPrompt />
  </div>
</template>
```

### Pattern 4: Lazy Hydration for Heavy Components

**What:** Delay hydration until component is visible or interaction is needed.

**When to use:** Components with heavy interactivity that appear below the fold.

**Trade-offs:**
- Pro: Faster TTI, reduced CPU usage on load
- Con: Component not interactive until hydrated

**Example:**
```vue
<!-- components/HeroSlider.vue - add lazy hydration -->
<template>
  <LazyHeroSlider
    v-if="showSlider"
    hydrate-on-visible
    @on-hydration="handleSliderHydration"
  />
</template>

<!-- Or use built-in directive -->
<template>
  <HeroSlider hydrate-on-visible />
</template>
```

### Pattern 5: Image Loading Strategy

**What:** Different image loading strategies based on viewport position.

**When to use:** All image-heavy components throughout the site.

**Trade-offs:**
- Pro: Significant LCP improvement, reduced bandwidth
- Con: Implementation complexity per image placement

**Example:**
```vue
<!-- Hero slider (first screen) - load immediately -->
<NuxtImg
  src="/images/hero/berlin-structure-1920w.jpg"
  format="webp"
  loading="eager"
  fetchpriority="high"
  width="1920"
  height="1080"
  :modifiers="{ quality: 85 }"
/>

<!-- Project cards (below fold) - lazy load -->
<NuxtImg
  :src="project.image"
  format="webp"
  loading="lazy"
  width="640"
  height="480"
  :modifiers="{ quality: 80 }"
/>

<!-- Background/decorative images - lowest priority -->
<NuxtImg
  src="/images/decoration.png"
  loading="lazy"
  fetchpriority="low"
/>
```

### Pattern 6: Plugin to Composable Conversion

**What:** Convert blocking plugins to lazy-loaded composables.

**When to use:** Plugins that don't need to run immediately on app initialization.

**Trade-offs:**
- Pro: Reduces hydration blocking time
- Con: Must be explicitly called when needed

**Example:**
```typescript
// plugins/analytics.client.ts - BEFORE (blocks hydration)
export default defineNuxtPlugin((nuxtApp) => {
  // Analytics initialization blocks app start
  initGA4(config.public.gaMeasurementId)
  // Track page views...
})

// composables/useAnalytics.ts - AFTER (lazy loaded)
export const useAnalytics = () => {
  const init = () => {
    if (process.client) {
      // Load analytics only when called
      initGA4(config.public.gaMeasurementId)
    }
  }
  const track = (event: string, data: any) => {
    // Analytics logic
  }
  return { init, track }
}

// In component:
<script setup>
const { init, track } = useAnalytics()
onMounted(() => {
  init() // Initialize after page loads
})
</script>
```

## Data Flow

### Performance Optimization Flow

```
[User Request]
    ↓
[Nitro Server]
    ↓
[Route Rules Check]
    ├─→ Prerendered? → [Serve Static HTML]
    ├─→ ISR Cached? → [Serve Cached + Revalidate]
    └─→ SSR? → [Render on Server]
    ↓
[Cached API Handler] (if using defineCachedEventHandler)
    ├─→ Cache Hit? → [Return Cached Response]
    └─→ Cache Miss? → [Fetch + Cache + Return]
    ↓
[HTML with Payload]
    ↓
[Client Hydration]
    ├─→ [Eager Components] → Hydrate Immediately
    ├─→ [Lazy Components] → Hydrate on Demand
    └─→ [Lazy Hydration] → Hydrate on Visible/Interaction
    ↓
[Image Loading]
    ├─→ [Above Fold] → loading="eager", fetchpriority="high"
    └─→ [Below Fold] → loading="lazy", fetchpriority="low"
```

### Caching Flow

```
[Client Request]
    ↓
[Browser Cache Check]
    ├─→ Hit? → [Serve from Browser Cache]
    └─→ Miss? → [Continue to Server]
    ↓
[CDN/Edge Cache] (if deployed)
    ├─→ Hit? → [Serve from CDN]
    └─→ Miss? → [Continue to Origin]
    ↓
[Nitro Cache] (defineCachedEventHandler)
    ├─→ Hit? → [Serve from Nitro Cache]
    └─→ Miss? → [Execute Handler + Cache Result]
    ↓
[WordPress API] (origin data source)
    ↓
[Response Back with Cache Headers]
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Current (~20 pages) | Current setup is appropriate - Nitro server, in-memory caching, static generation for most pages |
| 50-100 pages | Add ISR for dynamic content, implement CDN, consider edge functions |
| 100+ pages | Consider headless CMS migration, implement full ISR, add CDN with edge caching, bundle splitting |

### Scaling Priorities

1. **First bottleneck:** Image optimization and delivery
   - Fix: Ensure all images use @nuxt/image, implement responsive sizes, use CDN

2. **Second bottleneck:** API response time (WordPress API)
   - Fix: Server-side caching with defineCachedEventHandler, consider static data caching

3. **Third bottleneck:** JavaScript bundle size
   - Fix: Lazy loading components, bundle analysis, tree shaking

## Anti-Patterns

### Anti-Pattern 1: Universal Lazy Loading

**What people do:** Add `Lazy` prefix to every component thinking it improves performance.

**Why it's wrong:** Increases number of network requests, causes content flash, can hurt LCP. Eager loading of above-fold content is important.

**Do this instead:** Only lazy load components below the fold or in conditional/modal contexts. Keep critical path components eager.

### Anti-Pattern 2: Aggressive Caching Without Invalidation

**What people do:** Set cache headers to 1 year without cache-busting strategy.

**Why it's wrong:** Users never see updates, content changes don't propagate, deployment issues.

**Do this instead:** Use appropriate cache durations, implement cache invalidation on deploy, use content hashes for immutable assets.

### Anti-Pattern 3: Optimizing Without Measuring

**What people do:** Apply optimizations based on assumptions without baseline measurement.

**Why it's wrong:** May optimize things that don't matter, miss actual bottlenecks, can't prove improvement.

**Do this instead:** Run Lighthouse audit first, identify lowest scores, optimize those specific areas, re-measure.

### Anti-Pattern 4: Client-Side Only Optimization

**What people do:** Focus only on JavaScript bundle size and ignore server-side optimization.

**Why it's wrong:** Server-side optimizations (caching, ISR, route rules) often have bigger impact with less complexity.

**Do this instead:** Start with nuxt.config.ts optimizations (route rules, caching), then move to component-level changes.

### Anti-Pattern 5: Disabling Features for Performance

**What people do:** Disable PWA, analytics, animations to improve scores.

**Why it's wrong:** Degrades user experience, scores don't reflect real UX.

**Do this instead:** Optimize implementation of features, not remove them. Lazy load non-critical features.

## Integration Points

### External Services

| Service | Integration Pattern | Optimization Notes |
|---------|---------------------|-------------------|
| WordPress API | server/api proxy routes | Wrap with defineCachedEventHandler, consider static fallback |
| Google Fonts | nuxt.config.ts preconnect | Already configured - consider @nuxt/fonts for self-hosting |
| Google Analytics | plugins/analytics.client.ts | Convert to composable, defer loading until after interaction |
| Iconify | @nuxt/icon module | Already optimized - uses on-demand loading |
| PWA Service Worker | @vite-pwa/nuxt | Already configured - contributes to repeat-visit performance |

### Internal Boundaries

| Boundary | Communication | Optimization Approach |
|----------|---------------|----------------------|
| Pages → API | useFetch/useAsyncData | Already optimal - prevents double fetch |
| Components → Composables | Direct import | Lazy load composables for rare features |
| Server → WordPress | $fetch | Add caching layer, implement stale-while-revalidate |
| Layout → Components | Direct rendering | Lazy load non-critical components |

## Build Order Recommendations

Based on impact-to-effort ratio and architectural dependencies:

### Phase 1: Config Optimization (Highest ROI, Lowest Risk)
**Priority: Critical**

1. **Route Rules Configuration** - nuxt.config.ts
   - Prerender static pages (/, /about, /contact)
   - Add ISR for semi-static pages (/projects, /services)
   - Configure cache headers for static assets

2. **Verify Image Configuration** - nuxt.config.ts
   - Confirm @nuxt/image settings (quality, formats)
   - Review screen sizes match design breakpoints
   - Already well-configured, verify usage in components

3. **Nitro Cache Headers** - nuxt.config.ts
   - Immutable assets (/_nuxt/**, /images/**)
   - API route caching strategy

**Rationale:** Config changes affect entire site with no code modifications. Fastest path to 90+ scores.

### Phase 2: Server-Side Caching (High ROI, Low Risk)
**Priority: High**

4. **Cache API Handlers** - server/api/*.ts
   - Wrap projects.get.ts with defineCachedEventHandler
   - Wrap services.get.ts with defineCachedEventHandler
   - Wrap team.get.ts with defineCachedEventHandler
   - Wrap testimonials.get.ts with defineCachedEventHandler

5. **Add Cache Invalidation Strategy**
   - Version-based cache keys
   - Manual cache refresh endpoints (optional)

**Rationale:** Server-side caching has massive impact with minimal code changes. Reduces WordPress API dependency.

### Phase 3: Component Lazy Loading (Medium ROI, Medium Risk)
**Priority: Medium**

6. **Lazy Load Below-Fold Components** - pages/index.vue, etc.
   - LazyClientLogos
   - LazyTestimonialCard (or individual cards)
   - LazyProjectsCarousel (if below fold)

7. **Review Critical Path Components**
   - Ensure AppHeader, HeroSlider load eagerly
   - Check for unnecessary heavy dependencies in critical path

**Rationale:** Reduces initial JavaScript bundle, improves TTI. Requires testing for visual issues.

### Phase 4: Image Optimization (High ROI, Medium Complexity)
**Priority: Medium**

8. **Audit Image Usage Across Site**
   - Find all img tags (convert to NuxtImg)
   - Check for unoptimized images in public/
   - Identify missing responsive sizes

9. **Implement Image Loading Strategies**
   - Above-fold: loading="eager", fetchpriority="high"
   - Below-fold: loading="lazy"
   - Background: fetchpriority="low"

10. **Convert Images to Next-Gen Formats**
    - Convert remaining JPEG/PNG to WebP
    - Consider AVIF for critical images

**Rationale:** Images are typically #1 performance factor. Already partially optimized, complete the work.

### Phase 5: Advanced Component Optimization (Medium ROI, Higher Risk)
**Priority: Low**

11. **Lazy Hydration** - Heavy interactive components
    - Add hydrate-on-visible to below-fold interactive components
    - Test thoroughly for interaction delays

12. **Plugin Optimization** - plugins/
    - Convert analytics.client.ts to lazy composable
    - Review other plugins for blocking behavior

13. **Vue Performance Directives** - Components
    - Add v-once for static content
    - Add v-memo for expensive renders
    - Use shallowRef where appropriate

**Rationale:** These optimizations yield diminishing returns after phases 1-4. Higher complexity requires more testing.

### Phase 6: Bundle Optimization (Medium ROI, Medium Complexity)
**Priority: Low**

14. **Bundle Analysis** - Build infrastructure
    - Run npx nuxi analyze
    - Identify largest chunks
    - Tree shaking audit

15. **Code Splitting Optimization**
    - Manual chunk configuration for vendor libraries
    - Dynamic imports for large dependencies
    - Remove unused dependencies

**Rationale:** Bundle optimization is important but should come after higher-impact optimizations.

### Phase 7: Monitoring & CI (Enables Continuous Optimization)
**Priority: Low**

16. **Lighthouse CI Integration** - CI/CD
    - Automated performance regression testing
    - Score thresholds for deployment gates

17. **Real User Monitoring** - Optional
    - Core Web Vitals tracking
    - Performance budget alerts

**Rationale:** Monitoring prevents regression but doesn't improve scores directly. Add after optimizations are complete.

## Integration with Existing Architecture

### How Optimizations Layer In

The existing VP Associates architecture is well-suited for performance optimization:

```
Existing Layer             Optimization Layer               Implementation
----------------          ---------------------           -----------------
nuxt.config.ts    =====>  Add routeRules                  Direct config edit
                  =====>  Verify image config             Review only
                  =====>  Add nitro cache rules           Direct config edit

server/api/       =====>  Wrap with cache handler         Minimal code wrapper
components/       =====>  Add Lazy prefix                 Naming convention only
                  =====>  Add hydrate-on-visible          Prop addition only
composables/      =====>  Optimize data fetching          Refactor existing
plugins/          =====>  Convert to composables          Move + refactor
pages/            =====>  Add prefetch hints              Meta tag addition
```

### Leverage Existing Features

The current implementation already includes several performance-optimized features:

1. **@nuxt/image** - Already configured and used in HeroSlider
2. **@nuxtjs/sitemap** - Dynamic sitemap with prerender
3. **@vite-pwa/nuxt** - Service worker for offline capability
4. **Preconnect headers** - Already configured for fonts and Iconify
5. **Route-based caching** - Already configured in nitro.routeRules
6. **PWA runtime caching** - Already configured for WordPress API

These features provide a strong foundation. The optimization work focuses on:

- Completing image optimization across all components
- Adding server-side caching for API routes
- Implementing lazy loading for non-critical components
- Fine-tuning route rules for optimal caching strategy

## Sources

### Nuxt Performance Documentation
- [Nuxt Performance Best Practices v4](https://nuxt.com/docs/guide/best-practices/performance) - HIGH confidence
- [Hybrid Rendering in Nuxt 3](https://nuxt.com/docs/guide/concepts/rendering) - HIGH confidence
- [Nuxt Image Documentation](https://image.nuxt.com/usage) - HIGH confidence
- [Nuxt Lazy Loading Components](https://nuxt.com/docs/guide/directory-structure/components#lazy-loading-components) - HIGH confidence
- [Nuxt Lazy Hydration](https://nuxt.com/docs/guide/directory-structure/components#lazy-hydration) - HIGH confidence

### Performance Methodologies
- [Core Web Vitals](https://web.dev/vitals/) - HIGH confidence
- [Web.dev Performance Guides](https://web.dev/fast/) - HIGH confidence
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/) - HIGH confidence

### Community Best Practices
- [Performance Optimization in Nuxt 3 (MasteringNuxt)](https://masteringnuxt.com/blog/performance-optimization-in-nuxt-3) - HIGH confidence
- [Vue and Nuxt Performance Optimization Checklist](https://alokai.com/blog/vue-and-nuxt-performance-optimization-checklist) - MEDIUM confidence
- [Nuxt 4 Performance Optimization Complete Guide 2026](https://masteringnuxt.com/blog/nuxt-4-performance-optimization-complete-guide-to-faster-apps-in-2026) - MEDIUM confidence

### Real-World Case Studies
- [How We Achieve 90+ Lighthouse Performance Score (Medium)](https://medium.com/dana-engineering/how-we-achieve-90-lighthouse-performance-score-and-fully-offline-mode-for-dana-home-shopping-580b1b540c4d) - MEDIUM confidence
- [How to get 90+ score on Google Page Speed with NuxtJS](https://saha-technology.com/blog/how-to-get-90-score-on-google-page-speed-with-nuxtjs) - MEDIUM confidence

---
*Architecture research for: Performance Optimization for VP Associates Nuxt 3 Website*
*Researched: 2026-02-06*
