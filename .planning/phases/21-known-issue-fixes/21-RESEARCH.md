# Phase 21: Known Issue Fixes - Research

**Researched:** 2026-02-09
**Domain:** CLS prevention (hero images), Bundle optimization (Vite/Nuxt)
**Confidence:** HIGH

## Summary

This phase addresses two specific technical issues: FIX-01 (Hero image CLS) and FIX-02 (Bundle deduplication). Research identified the root causes and established clear remediation paths.

**FIX-01 (Hero Image CLS):** The current HeroStatic.vue declares `width="1920" height="1080"` (16:9 ratio) but the actual hero image (crane-building-1920w.jpg) is 1920x1441 (~4:3 ratio). This dimension mismatch combined with `object-cover` CSS is not itself a CLS problem because the hero section uses fixed height (`h-[80vh] min-h-[600px]`). However, the width/height attributes tell the browser the wrong aspect ratio, which could cause Lighthouse to flag it as "image displayed at incorrect aspect ratio." The fix is to either: (a) use CSS `aspect-ratio` on the container and remove conflicting width/height, or (b) update width/height to match the actual hero image dimensions.

**FIX-02 (Bundle Deduplication):** Build analysis shows a single 809KB chunk (246KB gzipped) containing Leaflet and other dependencies bundled together. Two map components (TampaBayMap.vue, ServiceAreaMap.vue) import Leaflet synchronously. The fix involves: (a) lazy-loading map components with `<LazyServiceAreaMap>`, and (b) configuring Vite `manualChunks` to separate vendor libraries.

**Primary recommendation:** Fix hero image by using CSS aspect-ratio with object-cover (removes width/height from NuxtImg). Lazy-load map components and configure manualChunks to split Leaflet (~40KB) into its own chunk.

## Standard Stack

The established tools already in use for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @nuxt/image | ^2.0.0 | Image optimization | Already configured, handles responsive images |
| Vite | 7.3.1 | Build bundler | Nuxt 3 default, manualChunks configuration |
| Tailwind CSS | ^6.12.1 | aspect-ratio utilities | Already configured with aspect classes |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| leaflet | ^1.9.4 | Interactive maps | Contact page service area, About page |
| nuxi analyze | built-in | Bundle analysis | Verify chunk splitting worked |

**No new dependencies required.** This phase uses existing tooling.

## Architecture Patterns

### Pattern 1: CSS aspect-ratio for Hero Images

**What:** Use CSS aspect-ratio property instead of width/height attributes when the container has a fixed/known height
**When to use:** Hero sections with `h-[80vh]`, image cards with fixed aspect ratios
**Source:** [Builder.io CLS Guide](https://www.builder.io/blog/how-to-improve-lighthouse-scores-by-avoiding-img-layout-shifts)

```vue
<!-- BEFORE: width/height may conflict with actual image ratio -->
<NuxtImg
  :src="backgroundImage"
  width="1920"
  height="1080"
  class="absolute inset-0 w-full h-full object-cover"
/>

<!-- AFTER: CSS aspect-ratio on container handles CLS, object-cover handles fit -->
<div class="absolute inset-0 w-full h-full" style="aspect-ratio: 16/9;">
  <NuxtImg
    :src="backgroundImage"
    class="w-full h-full object-cover"
    format="webp"
    loading="eager"
    fetchpriority="high"
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1920px"
  />
</div>
```

**Key insight:** When using `object-cover` with a container that has explicit dimensions (`h-[80vh]`), the width/height attributes on NuxtImg don't prevent CLS - they're ignored. The CSS container dimensions prevent CLS. Adding incorrect width/height can actually trigger Lighthouse "incorrect aspect ratio" warnings.

### Pattern 2: Lazy-Load Heavy Components

**What:** Use Nuxt's lazy-loading for components with large dependencies
**When to use:** Components that import large libraries (Leaflet ~40KB)
**Source:** [Nuxt Documentation](https://nuxt.com/docs/guide/directory-structure/components#dynamic-imports)

```vue
<!-- BEFORE: Synchronous import bundles Leaflet into main chunk -->
<ServiceAreaMap />

<!-- AFTER: Lazy-loaded, Leaflet loads only when component renders -->
<LazyServiceAreaMap />
```

### Pattern 3: Manual Chunk Splitting

**What:** Configure Vite rollupOptions.output.manualChunks for vendor library separation
**When to use:** Large dependencies (>50KB) used by specific pages only
**Source:** [Nuxt GitHub Discussion #16005](https://github.com/nuxt/nuxt/discussions/16005)

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('leaflet')) {
                return 'vendor-leaflet'
              }
              // Add more splits as needed
            }
          }
        }
      }
    }
  }
})
```

### Anti-Patterns to Avoid

- **Synchronous imports of large libraries:** Don't `import L from 'leaflet'` at top of synchronously-loaded components
- **Mismatched width/height with object-cover:** Don't set width/height when using object-cover on images with different aspect ratios
- **Suppressing chunk warnings without fixing:** Don't just increase `chunkSizeWarningLimit` - split the chunks

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CLS prevention | Custom JS aspect ratio calc | CSS `aspect-ratio` property | Browser-native, zero JS |
| Lazy component loading | Custom dynamic imports | Nuxt `<LazyComponentName>` prefix | Built-in, handles SSR |
| Bundle analysis | Manual inspection | `npx nuxi analyze` | Generates visual treemap |

**Key insight:** Nuxt and modern CSS solve these problems natively. Custom solutions add complexity without benefit.

## Common Pitfalls

### Pitfall 1: width/height on object-cover Images

**What goes wrong:** Setting width="1920" height="1080" on an image displayed with `object-cover` when the actual image has a different ratio
**Why it happens:** Developers add width/height for CLS but forget object-cover ignores intrinsic ratio
**How to avoid:** Use CSS aspect-ratio on the container OR match width/height to actual image dimensions
**Warning signs:** Lighthouse "Image displayed at incorrect aspect ratio" warning

### Pitfall 2: Leaflet Imported at Top Level

**What goes wrong:** Large chunk (800KB+) warning because Leaflet is bundled with Vue/core
**Why it happens:** `import L from 'leaflet'` in a synchronously-loaded component
**How to avoid:** Use `<LazyServiceAreaMap>` so Leaflet only loads when the map renders
**Warning signs:** Build warning "Some chunks are larger than 500 kB after minification"

### Pitfall 3: manualChunks with 'vue' Conflicts

**What goes wrong:** Error "'vue' cannot be included in manualChunks because it is resolved as an external module"
**Why it happens:** Nuxt 3.6.2+ has specific restrictions on what can be in manualChunks
**How to avoid:** Only split third-party libs that are NOT dependencies of Vue/Nuxt core
**Warning signs:** Build fails with "external module" error

### Pitfall 4: Lazy Loading Causes CLS

**What goes wrong:** Lazy-loading a visible-on-load component causes layout shift
**Why it happens:** Component loads after initial paint, pushing content down
**How to avoid:** Only lazy-load below-the-fold components (map is below form on contact page)
**Warning signs:** CLS score increase after implementing lazy loading

## Code Examples

### Hero Image CLS Fix

```vue
<!-- HeroStatic.vue - Updated approach -->
<template>
  <section class="relative h-[80vh] min-h-[600px] overflow-hidden bg-neutral-900">
    <!-- Background container with explicit aspect-ratio for CLS prevention -->
    <div class="absolute inset-0 w-full h-full overflow-hidden">
      <NuxtImg
        :src="backgroundImage"
        :alt="backgroundAlt"
        class="absolute inset-0 w-full h-full object-cover"
        format="webp"
        loading="eager"
        fetchpriority="high"
        :modifiers="{ quality: 85 }"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1920px"
      />
      <!-- NOTE: width/height removed - container handles dimensions -->
    </div>
    <!-- ... rest of hero content ... -->
  </section>
</template>
```

**Key change:** Remove `width="1920" height="1080"` attributes. The parent section with `h-[80vh] min-h-[600px]` already defines the hero dimensions, preventing CLS. Adding incorrect width/height causes Lighthouse "incorrect aspect ratio" warnings.

### Lazy Map Component

```vue
<!-- pages/contact.vue - Before -->
<ServiceAreaMap />

<!-- pages/contact.vue - After -->
<LazyServiceAreaMap />
```

### manualChunks Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  vite: {
    build: {
      chunkSizeWarningLimit: 500, // Keep warning threshold
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // Split Leaflet into its own chunk
              if (id.includes('leaflet')) {
                return 'vendor-leaflet'
              }
              // VueUse can be split if needed
              if (id.includes('@vueuse') && !id.includes('vue')) {
                return 'vendor-vueuse'
              }
            }
          }
        }
      }
    }
  }
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| width/height attributes | CSS `aspect-ratio` | 2021 (Safari 15) | Browser-native ratio, no JS |
| Manual lazy imports | `<LazyComponent>` prefix | Nuxt 3.0 | Built-in code splitting |
| Default chunking | manualChunks config | Vite 2.9+ | Fine-grained bundle control |

**Current best practice:** Use CSS aspect-ratio for images, Nuxt lazy prefix for heavy components, and manualChunks for large vendor deps.

## Open Questions

1. **Performance impact of removing width/height**
   - What we know: Container dimensions prevent CLS; width/height not needed with object-cover
   - What's unclear: Might there be edge cases in some browsers?
   - Recommendation: Test on Chrome, Safari, Firefox after fix; verify CLS score

2. **Lighthouse Performance Score (43) Root Cause**
   - What we know: Score dropped from 92 to 30-43 around Feb 8th
   - What's unclear: Is this just hero CLS, or also the 809KB chunk?
   - Recommendation: Fix both issues, re-run Lighthouse, compare scores

## Sources

### Primary (HIGH confidence)
- Existing codebase analysis (HeroStatic.vue, nuxt.config.ts, build output)
- Image dimension analysis via `sips` (crane-building-1920w.jpg is 1920x1441)
- Build output showing 809KB chunk

### Secondary (MEDIUM confidence)
- [Builder.io - Avoiding Layout Shifts](https://www.builder.io/blog/how-to-improve-lighthouse-scores-by-avoiding-img-layout-shifts) - CLS prevention patterns
- [Nuxt GitHub #16005](https://github.com/nuxt/nuxt/discussions/16005) - manualChunks configuration
- [Nuxt Image #1009](https://github.com/nuxt/image/discussions/1009) - CLS with NuxtImg

### Tertiary (LOW confidence)
- WebSearch results (general patterns, not version-specific)

## Metadata

**Confidence breakdown:**
- Hero CLS fix: HIGH - Container already has explicit height, confirmed via code analysis
- Lazy loading maps: HIGH - Nuxt native feature, documented pattern
- manualChunks: MEDIUM - Nuxt version-specific, test during implementation

**Research date:** 2026-02-09
**Valid until:** 2026-03-09 (30 days - stable patterns)

## Verification Checklist

After implementing fixes, verify:

1. [ ] `npm run build` shows no chunks >500KB
2. [ ] `npx nuxi analyze` shows Leaflet in separate chunk
3. [ ] Lighthouse CLS score is 0 or near-0
4. [ ] Lighthouse Performance score improves from 43
5. [ ] Hero image loads without visible layout shift
6. [ ] Contact page map still functions correctly
7. [ ] Reduced motion preferences still respected
