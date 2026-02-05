# Phase 6: Homepage Polish - Research

**Researched:** 2026-02-05
**Domain:** Vue 3 / Nuxt 3 Hero Sections, CSS Grid Layouts, Motion Design
**Confidence:** HIGH

## Summary

This phase focuses on polishing the homepage to match or exceed the live site quality. The research covers three main areas: (1) Hero section with full-width background images, dark overlays, and subtle motion; (2) Grid/masonry layouts for featured projects and services; and (3) Professional testimonial card designs with quote marks. The codebase already has solid foundations including `@nuxt/image`, `@vueuse/nuxt`, and Tailwind CSS with custom animation utilities.

**Key findings:**
- Nuxt 3's built-in `Transition` component and CSS animations are sufficient for hero motion—no additional libraries needed
- VueUse's `useWindowScroll` provides performant scroll-based parallax effects
- Pure CSS Grid with `grid-template-columns` and responsive modifiers is the standard approach for card layouts
- CSS masonry (`grid-template-rows: masonry`) is still experimental—use standard CSS Grid for reliability
- `@formkit/auto-animate` is available as a Nuxt module but likely unnecessary for this phase

**Primary recommendation:** Use existing Nuxt 3 transitions, VueUse for scroll effects, and Tailwind's CSS Grid utilities. Avoid adding animation libraries unless needed.

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Nuxt 3 | 3.14 | Vue framework with SSR | Built-in Transition component for animations |
| @nuxt/image | Latest | Image optimization | Eager loading, WebP/AVIF conversion, responsive sizes |
| Tailwind CSS | 3.x | Utility-first CSS | Grid utilities, gradient overlays, backdrop-blur |
| @vueuse/nuxt | Latest | Vue composition utilities | `useWindowScroll` for parallax effects |
| @nuxt/icon | Latest | Icon system | MDI icons including quote marks |

### Supporting (Consider Adding)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @formkit/auto-animate | ~0.9.0 | Zero-config list animations | Only if complex list reordering animations are needed |
| | | | **Likely unnecessary** for this phase |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS Transitions | GSAP | GSAP is overkill for simple hero fade/zoom; CSS is more performant |
| VueUse useWindowScroll | Custom scroll listeners | VueUse handles passive events and SSR edge cases correctly |
| Standard CSS Grid | CSS masonry (experimental) | Masonry has poor browser support; Grid works everywhere |

**Installation:**
```bash
# No new packages needed—all required dependencies already installed
# If auto-animate becomes necessary:
npm install @formkit/auto-animate
```

## Architecture Patterns

### Recommended Project Structure
```
pages/
└── index.vue                  # Homepage (already exists, needs polish)

components/
├── HeroSlider.vue             # Already exists—may need motion enhancements
├── ProjectCard.vue            # Already exists—may need card grid integration
├── ServiceCard.vue            # Already exists—may need card grid integration
├── TestimonialCard.vue        # Already exists—needs quote mark styling
└── FeaturedSection.vue        # NEW: Reusable featured content grid

composables/
├── useScrollReveal.ts         # Already exists—IntersectionObserver for scroll animations
└── useParallax.ts             # NEW: Optional composable for parallax effects

assets/css/
└── main.css                   # Already has .fade-in, .slide-up utilities
```

### Pattern 1: Hero Section with Dark Overlay and Subtle Motion

**What:** Full-width background image with gradient overlay and slow zoom animation on scroll.

**When to use:** Homepage hero section, section headers with background images.

**Implementation approach:**

```vue
<!-- Hero component with parallax and zoom -->
<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'

const { y } = useWindowScroll({ behavior: 'smooth' })

// Parallax effect: background moves slower than foreground
const parallaxOffset = computed(() => {
  return Math.min(y.value * 0.3, 200) // Max 200px offset
})

// Zoom effect: subtle scale increase on scroll
const zoomScale = computed(() => {
  return 1 + Math.min(y.value * 0.0005, 0.15) // Max 1.15x scale
})
</script>

<template>
  <section class="relative h-[80vh] overflow-hidden">
    <!-- Background Image with Parallax -->
    <div
      class="absolute inset-0 transition-transform duration-75 ease-out will-change-transform"
      :style="{ transform: `scale(${zoomScale}) translateY(${parallaxOffset}px)` }"
    >
      <NuxtImg
        src="/images/hero-1.jpg"
        alt="Hero background"
        class="w-full h-full object-cover"
        format="webp"
        loading="eager"
        fetchpriority="high"
        sizes="100vw"
        width="1920"
        height="1080"
        placeholder
      />
    </div>

    <!-- Dark Overlay Gradient -->
    <div class="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/70 to-primary-dark/85" />

    <!-- Content -->
    <div class="relative z-10 h-full flex items-center">
      <div class="container text-white">
        <h1 class="text-5xl md:text-7xl font-bold fade-in">Hero Title</h1>
      </div>
    </div>
  </section>
</template>

<style scoped>
.will-change-transform {
  will-change: transform;
}
</style>
```

**Source:** Nuxt 3 docs on transitions, VueUse `useWindowScroll` for reactive scroll position.

### Pattern 2: Grid Layout for Featured Content

**What:** Responsive card grid using Tailwind CSS Grid utilities.

**When to use:** Featured projects, featured services, any card-based content sections.

**Implementation approach:**

```vue
<template>
  <section class="py-16 md:py-24">
    <div class="container">
      <h2 class="text-4xl font-bold mb-12">Featured Projects</h2>

      <!-- Grid: 1 column mobile, 2 tablet, 3 desktop -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ProjectCard
          v-for="project in featuredProjects.slice(0, 3)"
          :key="project.id"
          v-bind="project"
        />
      </div>

      <!-- For services: similar grid -->
      <h2 class="text-4xl font-bold mb-12 mt-20">Featured Services</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ServiceCard
          v-for="service in featuredServices.slice(0, 3)"
          :key="service.id"
          v-bind="service"
        />
      </div>
    </div>
  </section>
</template>
```

**Responsive breakpoints:**
- Mobile (< 768px): 1 column
- Tablet (768px - 1024px): 2 columns (`md:grid-cols-2`)
- Desktop (> 1024px): 3 columns (`lg:grid-cols-3`)

**Source:** Tailwind CSS v3 docs on grid-template-columns and responsive modifiers.

### Pattern 3: Testimonial Card with Decorative Quote Marks

**What:** Professional testimonial card with large decorative quote icon using MDI icons.

**When to use:** Testimonials section, client quotes.

**Implementation approach:**

```vue
<template>
  <div class="bg-white rounded-xl p-8 border border-neutral-200 shadow-lg relative">
    <!-- Large decorative quote mark (top left) -->
    <div class="absolute top-6 left-6 text-primary/10 pointer-events-none">
      <Icon name="mdi:format-quote-open" class="w-16 h-16" />
    </div>

    <!-- Quote text with padding to clear the quote mark -->
    <blockquote class="text-lg text-neutral-700 mb-6 relative pl-8">
      "{{ quote }}"
    </blockquote>

    <!-- Attribution -->
    <div class="flex items-center gap-4 border-t border-neutral-100 pt-6">
      <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon name="mdi:account" class="w-6 h-6 text-primary" />
      </div>
      <div>
        <div class="font-semibold text-neutral-900">{{ author }}</div>
        <div v-if="company" class="text-sm text-neutral-600">{{ company }}</div>
        <div v-if="role" class="text-xs text-neutral-500">{{ role }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  quote: string
  author: string
  company?: string
  role?: string
  avatar?: string
}

defineProps<Props>()
</script>
```

**Alternative styling approach with CSS pseudo-elements:**

```css
.testimonial-card::before {
  content: '"';
  position: absolute;
  top: 1rem;
  left: 1rem;
  font-size: 4rem;
  line-height: 1;
  color: rgb(3 51 121 / 0.1); /* primary/10 */
  font-family: serif;
}
```

**Source:** [CSS Blockquotes Examples](https://www.sliderrevolution.com/resources/css-blockquotes/), [Speckyboy Testimonial UIs](https://speckyboy.com/spread-the-word-beautiful-testimonial-ui-examples/) (Jan 2026).

### Pattern 4: Scroll-Triggered Reveal Animations

**What:** Use existing `useScrollReveal` composable for fade-in on scroll.

**When to use:** Section content that should animate when entering viewport.

**Implementation:**

```vue
<script setup lang="ts">
const { target, isVisible } = useScrollReveal(0.1)
</script>

<template>
  <section ref="target">
    <div :class="['slide-up', { visible: isVisible }]">
      <!-- Content fades up when visible -->
    </div>
  </section>
</template>
```

**Existing CSS utilities in main.css:**
- `.fade-in` - Opacity transition
- `.slide-up` - Opacity + translate Y transition
- Both add `.visible` class for animation trigger

### Anti-Patterns to Avoid

- **JavaScript-heavy scroll listeners:** Use VueUse's `useWindowScroll` with passive events instead
- **CSS masonry for production:** Browser support is still experimental in 2026; use standard Grid
- **Complex animation libraries:** GSAP, Framer Motion are overkill for simple hero motion
- **Autoplaying carousels without pause:** Always pause on hover/user interaction
- **Ignoring prefers-reduced-motion:** Always respect user's motion preferences

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image optimization | Custom responsive images | `<NuxtImg>` from `@nuxt/image` | Handles WebP/AVIF, sizes, lazy loading automatically |
| Scroll position tracking | Custom event listeners | `useWindowScroll` from VueUse | Handles SSR, passive events, edge cases |
| Card grid layouts | Manual CSS grid calculation | Tailwind `grid-cols-*` utilities | Responsive, tested, maintainable |
| Parallax math | Manual scroll calculations | VueUse reactive scroll values | Computed values update automatically |
| Transition animations | Custom keyframe animations | Vue `<Transition>` component | Built-in hooks, mode control, lifecycle aware |

**Key insight:** The Nuxt 3 + VueUse + Tailwind stack already provides everything needed for professional homepage animations and layouts. Adding custom solutions introduces maintenance burden and potential bugs.

## Common Pitfalls

### Pitfall 1: Parallax Performance Issues

**What goes wrong:** Janky scroll performance, main thread blocking, layout shifts.

**Why it happens:** Direct scroll event listeners without `{ passive: true }`, synchronous layout reads, using `will-change` indiscriminately.

**How to avoid:**
- Use VueUse's `useWindowScroll` (handles passive events correctly)
- Use `transform` and `opacity` only (GPU-accelerated properties)
- Use `will-change: transform` sparingly, only on animating elements
- Avoid reading layout properties like `offsetTop` in scroll handlers

**Warning signs:** Frame drops in DevTools Performance tab, janky scrolling on mobile, high main thread activity during scroll.

### Pitfall 2: Hero Image Loading Issues

**What goes wrong:** Flash of unstyled content, delayed hero rendering, layout shift.

**Why it happens:** Not using `loading="eager"` for above-the-fold images, missing `fetchpriority="high"`, not providing dimensions.

**How to avoid:**
```vue
<NuxtImg
  src="/images/hero-1.jpg"
  format="webp"
  loading="eager"      <!-- Critical for LCP -->
  fetchpriority="high" <!-- Signals importance to browser -->
  sizes="100vw"
  width="1920"
  height="1080"
  placeholder          <!-- Low-quality placeholder while loading -->
/>
```

**Warning signs:** Low Lighthouse LCP scores, visible image loading delay, cumulative layout shift (CLS).

### Pitfall 3: Breakpoint Mismatch Between Desktop and Mobile

**What goes wrong:** Grid looks good on desktop but breaks on mobile (or vice versa).

**Why it happens:** Only testing at one viewport size, using fixed widths, not using Tailwind's responsive modifiers.

**How to avoid:**
- Always use responsive modifiers: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Test at mobile (375px), tablet (768px), desktop (1280px+)
- Use container utilities (`container`, `mx-auto`) for max-width control
- Use relative units (%, fr) instead of fixed pixels

**Warning signs:** Horizontal scroll on mobile, excessive whitespace on desktop, overlapping cards.

### Pitfall 4: Over-Animation

**What goes wrong:** Too many moving elements, motion sickness trigger, slow perceived performance.

**Why it happens:** Applying animations to everything, long durations, no `prefers-reduced-motion` check.

**How to avoid:**
- Keep animations subtle (0.3-0.6s duration, ease-out timing)
- Only animate key elements, not every card
- Always respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Warning signs:** User complaints, low accessibility scores, distractingly busy interface.

### Pitfall 5: Hydration Mismatches with SSR

**What goes wrong:** Vue hydration errors, content flicker on page load.

**Why it happens:** Using `window` or `document` before component mount, server/client rendering differences.

**How to avoid:**
- Use `onMounted` for any DOM/window access
- Use VueUse composables (handle SSR automatically)
- Use `ClientOnly` component for strictly client-side features:

```vue
<ClientOnly>
  <ParallaxHero />
</ClientOnly>
```

**Warning signs:** "Hydration mismatch" console errors, content appearing twice briefly, SSR HTML different from client HTML.

## Code Examples

Verified patterns from official sources:

### Hero Section with Nuxt Image Optimization

```vue
<!-- Source: Nuxt 3 docs on @nuxt/image -->
<template>
  <section class="relative h-[80vh] min-h-[600px]">
    <!-- Background Image -->
    <NuxtImg
      src="/images/hero-1.jpg"
      alt="Structural engineering project"
      class="absolute inset-0 w-full h-full object-cover"
      format="webp"
      loading="eager"
      fetchpriority="high"
      sizes="100vw"
      width="1920"
      height="1080"
      placeholder
    />

    <!-- Gradient Overlay -->
    <div class="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary-dark/90" />

    <!-- Content -->
    <div class="relative z-10 container h-full flex items-center text-white">
      <h1 class="text-5xl md:text-7xl font-bold">Hero Title</h1>
    </div>
  </section>
</template>
```

### Responsive Grid with Tailwind

```html
<!-- Source: Tailwind CSS v3 docs -->
<!-- Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
</div>

<!-- With independent row/column gaps -->
<div class="grid gap-x-8 gap-y-4 grid-cols-1 md:grid-cols-3">
  <!-- ... -->
</div>
```

### Vue 3 Transition for Hero Content

```vue
<!-- Source: Nuxt 3 docs on transitions -->
<template>
  <Transition name="hero-content" mode="out-in">
    <div :key="currentSlide" class="hero-content">
      <h1>{{ title }}</h1>
      <p>{{ description }}</p>
    </div>
  </Transition>
</template>

<style scoped>
.hero-content-enter-active,
.hero-content-leave-active {
  transition: all 0.6s ease-out;
}

.hero-content-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.hero-content-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
```

### Scroll Parallax with VueUse

```vue
<!-- Source: VueUse docs on useWindowScroll -->
<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'

const { y } = useWindowScroll()

const parallaxStyle = computed(() => ({
  transform: `translateY(${y.value * 0.3}px)`
}))
</script>

<template>
  <div :style="parallaxStyle" class="parallax-bg">
    <!-- Background content -->
  </div>
</template>
```

### Testimonial Card with Quote Icon

```vue
<!-- Source: MDI icons + Tailwind utilities -->
<template>
  <div class="bg-white rounded-xl p-8 shadow-lg border border-neutral-200">
    <!-- Quote icon (MDI via @nuxt/icon) -->
    <div class="text-primary/20 mb-4">
      <Icon name="mdi:format-quote-open" class="w-12 h-12" />
    </div>

    <blockquote class="text-lg text-neutral-700 mb-6">
      "{{ quote }}"
    </blockquote>

    <div class="flex items-center gap-4">
      <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon name="mdi:account" class="w-6 h-6 text-primary" />
      </div>
      <div>
        <div class="font-semibold">{{ author }}</div>
        <div class="text-sm text-neutral-600">{{ company }}</div>
      </div>
    </div>
  </div>
</template>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `window.addEventListener('scroll')` | `useWindowScroll()` from VueUse | Vue 3 era (2021+) | Better SSR, passive events, reactive values |
| Custom scroll listeners | VueUse composables | 2021+ | Automatic cleanup, edge case handling |
| GSAP for simple animations | Vue `<Transition>` + CSS | Vue 3 (2020+) | Smaller bundle, native browser APIs |
| Manual image optimization | `@nuxt/image` module | Nuxt 3 (2022+) | Auto WebP/AVIF, responsive sizing |
| CSS masonry (js-based) | CSS Grid with responsive columns | 2023+ | Native browser support, no JS needed |
| Fixed breakpoint widths | Mobile-first responsive utilities | Tailwind 3.x era | Better device coverage |

**Deprecated/outdated:**
- **Custom scroll throttling:** VueUse handles this internally
- **jQuery parallax plugins:** Native CSS + VueUse is lighter
- **Separate mobile sites:** Responsive design is standard
- **CSS masonry with JavaScript:** Pure CSS Grid is sufficient and more performant

**Note on CSS Masonry:** As of late 2025/early 2026, CSS Grid masonry (`grid-template-rows: masonry`) is still experimental. The CSS Working Group has settled on `display: grid-lanes` as the future standard, but browser support is not production-ready. Use standard CSS Grid for this project.

## Open Questions

1. **Parallax Implementation Details**
   - What we know: VueUse `useWindowScroll` provides reactive scroll position
   - What's unclear: Exact parallax speed values that look professional
   - Recommendation: Start with `scrollY * 0.3` offset, adjust based on visual testing

2. **Hero Zoom Animation Speed**
   - What we know: CSS `transform: scale()` is GPU-accelerated
   - What's unclear: Optimal zoom scale range and duration
   - Recommendation: Use 1.0 to 1.15 scale over full scroll duration, test for smoothness

3. **Grid Gaps for Card Layouts**
   - What we know: Tailwind `gap-*` utilities control spacing
   - What's unclear: Exact gap values (gap-6, gap-8) for best visual balance
   - Recommendation: Use `gap-8` (32px) as starting point, adjust based on card content

4. **Quote Mark Styling**
   - What we know: MDI `mdi:format-quote-open` icon available
   - What's unclear: Exact size (w-12 h-12, w-16 h-16) and placement
   - Recommendation: Test both icon-based and CSS pseudo-element approaches

5. **Motion for Mobile Devices**
   - What we know: Should respect `prefers-reduced-motion`
   - What's unclear: Whether to disable parallax entirely on mobile
   - Recommendation: Keep parallax on mobile but reduce intensity (0.15 instead of 0.3)

## Sources

### Primary (HIGH confidence)

- [/websites/nuxt_3_x](https://nuxt.com/docs/3.x) - Nuxt 3 official documentation
  - Transitions API
  - Nuxt Image component (`<NuxtImg>`)
  - Best practices for performance

- [/websites/vueuse](https://vueuse.org) - VueUse official documentation
  - `useWindowScroll` composable
  - `useScroll` for element-based scroll tracking

- [/websites/v3_tailwindcss](https://v3.tailwindcss.com) - Tailwind CSS v3 documentation
  - Grid utilities (`grid-cols-*`, `gap-*`)
  - Gradient overlays (`bg-gradient-to-*`)
  - Backdrop blur effects
  - Aspect ratio utilities

### Secondary (MEDIUM confidence)

- [Parallax Scrolling: Still Cool in 2026?](https://www.webbb.ai/blog/parallax-scrolling-still-cool-in-2026/) - Modern perspective on parallax implementation (January 2026)

- [10 CSS Hero Section Animations (latest)](https://devnahian.com/10-css-hero-section-animations-latest/) - CSS keyframe animations for hero sections (November 2025)

- [CSS Grid Lanes for Masonry Layouts](https://css-tricks.com/masonry-layout-is-now-grid-lanes/) - CSS Grid Lanes standard announcement (December 2025)

- [CSS Blockquotes: Beautiful Examples](https://www.sliderrevolution.com/resources/css-blockquotes/) - Testimonial design inspiration (December 2025)

- [8 CSS & JavaScript Snippets for Testimonial UIs](https://speckyboy.com/spread-the-word-beautiful-testimonial-ui-examples/) - Modern testimonial patterns (January 2026)

### Tertiary (LOW confidence)

- [37 CSS Hero Sections](https://freefrontend.com/css-hero-sections/) - Hero section examples (January 2026)

- [18 CSS Masonry Layouts](https://freefrontend.com/css-masonry-layouts/) - Masonry layout examples (updated 2026)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries are official, well-documented, and already installed
- Architecture: HIGH - Patterns are from official Nuxt/VueUse/Tailwind documentation
- Pitfalls: HIGH - Based on common web performance issues and documented best practices

**Research date:** 2026-02-05
**Valid until:** 2026-03-05 (30 days - Nuxt 3 and Tailwind CSS are stable; VueUse is actively maintained but API is stable)

**Key decisions locked by CONTEXT.md:**
- Full-width hero with dark overlay ✓
- Single prominent CTA button ✓
- Subtle motion (slow zoom, parallax, or fade-in) ✓
- Grid/masonry layout for featured content (3 items per category) ✓
- Rich card information with images, titles, excerpts, category labels ✓
- Testimonial card grid with full attribution ✓
- Large decorative quote marks ✓
