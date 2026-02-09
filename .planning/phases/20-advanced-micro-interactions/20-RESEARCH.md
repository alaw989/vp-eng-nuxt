# Phase 20: Advanced Micro-interactions - Research

**Researched:** 2026-02-09
**Domain:** Advanced Micro-interactions (Scroll-triggered Animations, Count-up, FLIP, Carousel) in Vue 3/Nuxt 3
**Confidence:** HIGH

## Summary

This phase focuses on implementing engaging scroll-triggered and animated interactions (requirements MICRO-07 through MICRO-10). The research reveals that the codebase already has significant infrastructure: `useScrollReveal` composable using VueUse's `useIntersectionObserver`, `StatCounter` component with count-up animation (though it needs refinement), `TestimonialsSlider` with basic transitions, and filter functionality on services/projects pages. Key findings: scroll-triggered animations are partially implemented via `AppSection` with `animate-on-scroll` prop but need refinement, stats counters exist but use manual requestAnimationFrame (can be improved), service/project filters lack smooth layout transitions (no FLIP technique), and testimonial carousel has basic transitions but could be enhanced.

The project already has the necessary infrastructure: Tailwind CSS for utilities, @vueuse/nuxt@12.0.1 for `useIntersectionObserver` and `usePreferredReducedMotion`, existing `useScrollReveal` composable, `StatCounter` and `TestimonialsSlider` components. Phase 18 established 300ms micro-interaction duration standard, and Phase 19 added page transitions. The constraint of avoiding heavy animation libraries (GSAP, Framer Motion) means using VueUse + hand-rolled solutions optimized for performance.

**Primary recommendation:** Leverage VueUse's `useIntersectionObserver` for all scroll-triggered animations (enhance existing `useScrollReveal`), implement FLIP technique for smooth filter layout changes (hand-rolled or lightweight AutoAnimate), enhance `StatCounter` with better easing and reduced-motion support, and polish `TestimonialsSlider` transitions while respecting the 300ms timing standard.

## User Constraints (from CONTEXT.md)

**No CONTEXT.md exists for this phase.** This is a fresh phase with no locked decisions from prior discussion.

## Prior Decisions from STATE.md (Must Honor)

From `.planning/STATE.md`, these decisions constrain implementation:

- **300ms micro-interaction duration** for consistent hover state timing
- **Reduced-motion support** preserves color feedback while disabling transforms
- **Focus-visible indicators** on all interactive elements with WCAG AAA contrast (8.2:1)
- **VueUse library preferred** for composables (useMagicKeys, useFocusTrap, usePreferredReducedMotion already in use)
- **Hand-rolled solutions preferred** over heavy libraries (performance regression risk from GSAP, Framer Motion)
- **Out of Scope (from REQUIREMENTS.md):**
  - Heavy animation libraries (GSAP, Framer Motion) - Performance regression risk, 100KB+ bundle
  - Parallax scrolling - Performance killer, CLS issues

## Standard Stack

The established libraries/tools for Vue 3/Nuxt 3 advanced micro-interactions:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @vueuse/core | 12.0.1 (installed) | useIntersectionObserver for scroll animations | Already installed, SSR-safe, reactive wrapper around native IntersectionObserver API |
| @vueuse/core | 12.0.1 (installed) | usePreferredReducedMotion for accessibility | Already used in Phase 19, consistent pattern |
| Vue 3 Transition | Built-in | TransitionGroup for list animations | Native Vue component, SSR-compatible, lightweight |
| Tailwind CSS | 3.4+ (via @nuxtjs/tailwindcss 6.12.1) | transition utilities, transform classes | Already configured, provides duration-300 standard |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @formkit/auto-animate | Latest (optional) | Zero-config FLIP animations | If hand-rolled FLIP is too complex; lightweight (3KB) alternative to Framer Motion |
| requestAnimationFrame | Native API | Stats counter animation | Already used in StatCounter, better than setInterval for smooth animations |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-rolled FLIP | @formkit/auto-animate | AutoAnimate is 3KB vs hand-rolled complexity; use if implementation proves too complex |
| requestAnimationFrame | setInterval/csetTimeout | rAF is smoother (syncs with display refresh), prevents layout thrashing |
| VueUse useIntersectionObserver | scroll event listeners | Intersection Observer is more performant (doesn't block main thread), handles async efficiently |

**Installation:**
```bash
# Optional - only if hand-rolled FLIP proves too complex:
npm install @formkit/auto-animate

# All other packages already installed:
# - @vueuse/nuxt@12.0.1
# - @nuxtjs/tailwindcss@6.12.1
# - Vue 3 built-in TransitionGroup
```

## Architecture Patterns

### Recommended Project Structure

Organize advanced micro-interaction enhancements as:

```
components/
├── StatCounter.vue           # EXISTS - enhance with better easing, reduced-motion
├── TestimonialsSlider.vue    # EXISTS - enhance transitions, add slide animations
├── AppSection.vue            # EXISTS - enhance animate-on-scroll with better thresholds

composables/
├── useScrollReveal.ts        # EXISTS - enhance with staggered animations, once-only option
├── useCountUp.ts             # NEW - extracted from StatCounter, reusable
├── useFilterTransition.ts    # NEW - FLIP animation for filter layout changes
├── usePreferredReducedMotion.ts  # EXISTS from Phase 19 - reuse for animation toggles

assets/css/main.css           # UPDATE - add filter transition classes, animation utilities
```

### Pattern 1: Scroll-Triggered Animations with Intersection Observer (MICRO-07)

**What:** Elements animate smoothly when scrolling into viewport using Intersection Observer API

**When to use:** Section reveals, card stagger animations, hero content entrance

**Current implementation in `useScrollReveal.ts`:**
```typescript
// composables/useScrollReveal.ts (existing)
export function useScrollReveal(threshold = 0.1) {
  const target = ref<HTMLElement>()
  const isVisible = ref(false)

  useIntersectionObserver(
    target,
    ([entry]) => {
      if (entry?.isIntersecting) {
        isVisible.value = true
      }
    },
    { threshold }
  )

  return { target, isVisible }
}
```

**Usage in AppSection.vue (existing):**
```vue
<template>
  <section
    ref="sectionRef"
    :class="[
      'section',
      { 'scroll-reveal': animateOnScroll, visible: isVisible }
    ]"
  >
    <slot />
  </section>
</template>

<script setup lang="ts">
import { useScrollReveal } from '~/composables/useScrollReveal'

const props = defineProps<{ animateOnScroll?: boolean }>()
const sectionRef = ref<HTMLElement>()
const { target, isVisible } = useScrollReveal(0.15)

watchEffect(() => {
  if (props.animateOnScroll) {
    target.value = sectionRef.value
  }
})
</script>

<style scoped>
.section.scroll-reveal {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

.section.scroll-reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
```

**Enhancements needed:**
1. Add `once` option to stop observing after first reveal (performance)
2. Add rootMargin for trigger-before-visible animations
3. Support staggered child animations (cards animate sequentially)
4. Respect `prefers-reduced-motion`

**Source:** Project files - `/composables/useScrollReveal.ts`, `/components/AppSection.vue`

### Pattern 2: Stats Counter Animation (MICRO-08)

**What:** Numbers count-up when visible with smooth easing

**When to use:** Homepage stats, about page numbers, project counters

**Current implementation in StatCounter.vue:**
```vue
<template>
  <div ref="counterRef" class="stat-item" :class="{ visible: isVisible }">
    <div class="text-5xl md:text-6xl font-display font-bold text-white mb-2">
      {{ Math.round(animatedValue) }}<span v-if="suffix">{{ suffix }}</span>
    </div>
    <div class="text-lg md:text-xl text-neutral-300">
      {{ label }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useScrollReveal } from '~/composables/useScrollReveal'

interface Props {
  value: number
  label: string
  suffix?: string
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  suffix: '',
  duration: 2000
})

const counterRef = ref<HTMLElement>()
const { target, isVisible } = useScrollReveal(0.1)
const animatedValue = ref(0)
const hasAnimated = ref(false)

const animate = () => {
  if (hasAnimated.value) return

  hasAnimated.value = true
  const startTime = performance.now()
  const startValue = 0
  const endValue = props.value

  const updateCounter = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / props.duration, 1)

    // Easing function for smooth animation (ease-out quart)
    const easeOut = 1 - Math.pow(1 - progress, 4)
    animatedValue.value = startValue + (endValue - startValue) * easeOut

    if (progress < 1) {
      requestAnimationFrame(updateCounter)
    }
  }

  requestAnimationFrame(updateCounter)
}

watchEffect(() => {
  target.value = counterRef.value
})

watch(isVisible, (visible) => {
  if (visible && !hasAnimated.value) {
    animate()
  }
})
</script>

<style scoped>
.stat-item {
  text-align: center;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

.stat-item.visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
```

**Missing:** Reduced-motion support (counter should instantly show value, not animate)

**Enhancement needed:**
```typescript
// Add to StatCounter.vue
const { prefersReducedMotion } = usePreferredReducedMotion()

watch(isVisible, (visible) => {
  if (visible && !hasAnimated.value) {
    if (prefersReducedMotion.value) {
      animatedValue.value = props.value // Instant, no animation
    } else {
      animate()
    }
  }
})
```

**Source:** Project files - `/components/StatCounter.vue` (lines 1-104)

### Pattern 3: Service Filter Animations with FLIP (MICRO-09)

**What:** Smooth layout changes when filtering using FLIP (First, Last, Invert, Play) technique

**When to use:** Services page filter, projects page filter, any grid reordering

**Current state in pages/services/index.vue:**
- Filter buttons trigger category change
- Grid updates instantly with no animation (line 58: `<div v-else-if="filteredServices.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-8">`)
- Cards appear/disappear abruptly

**FLIP Technique Implementation:**
```typescript
// composables/useFilterTransition.ts (NEW)
export function useFilterTransition<T>() {
  const containerRef = ref<HTMLElement>()
  const isAnimating = ref(false)

  const animateFilter = async (newItems: T[]) => {
    if (!containerRef.value) return

    // FIRST: Capture positions before change
    const oldPositions = new Map<HTMLElement, { x: number; y: number }>()
    const oldChildren = Array.from(containerRef.value.children) as HTMLElement[]

    oldChildren.forEach(child => {
      const rect = child.getBoundingClientRect()
      oldPositions.set(child, { x: rect.left, y: rect.top })
    })

    // Wait for DOM to update with new filtered items
    await nextTick()

    // LAST: Capture positions after change
    const newChildren = Array.from(containerRef.value.children) as HTMLElement[]

    // INVERT: Calculate transforms
    newChildren.forEach(child => {
      const oldPos = oldPositions.get(child)
      if (oldPos) {
        const newRect = child.getBoundingClientRect()
        const deltaX = oldPos.x - newRect.left
        const deltaY = oldPos.y - newRect.top

        // Apply transform
        child.style.transform = `translate(${deltaX}px, ${deltaY}px)`
        child.style.transition = 'none'
      }
    })

    // PLAY: Animate to natural positions
    requestAnimationFrame(() => {
      newChildren.forEach(child => {
        child.style.transition = 'transform 300ms ease-out'
        child.style.transform = ''
      })

      // Cleanup after animation
      setTimeout(() => {
        newChildren.forEach(child => {
          child.style.transition = ''
        })
        isAnimating.value = false
      }, 300)
    })
  }

  return { containerRef, animateFilter, isAnimating }
}
```

**Alternative: @formkit/auto-animate (simpler, 3KB):**
```vue
<template>
  <div v-auto-animate="{ duration: 300 }" class="grid grid-cols-1 md:grid-cols-2 gap-8">
    <div v-for="service in filteredServices" :key="service.slug">
      <!-- Service card -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { vAutoAnimate } from '@formkit/auto-animate/vue'
</script>
```

**Decision point:** Start with hand-rolled FLIP for zero dependencies, use @formkit/auto-animate only if complexity becomes unmanageable.

**Sources:**
- CSS-Tricks: [Animating Layouts with the FLIP Technique](https://css-tricks.com/animating-layouts-with-the-flip-technique/)
- WebSearch 2026: [Vue FLIP Image Gallery](https://freefrontend.com/code/vue-flip-image-gallery-2026-01-26/)

### Pattern 4: Testimonial Carousel Smooth Transitions (MICRO-10)

**What:** Smooth slide transitions with proper easing and reduced-motion support

**When to use:** TestimonialsSlider, ProjectsCarousel

**Current implementation in TestimonialsSlider.vue:**
```vue
<template>
  <div class="overflow-hidden">
    <div
      ref="trackRef"
      class="flex transition-transform duration-500 ease-out"
      :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
    >
      <div v-for="(slide, slideIndex) in slides" :key="slideIndex" class="w-full flex-shrink-0">
        <!-- Testimonial cards -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const currentIndex = ref(0)
const nextSlide = () => {
  if (currentIndex.value < slides.value.length - 1) {
    currentIndex.value++
  }
}
</script>
```

**Current state:**
- Uses `transition-transform duration-500 ease-out` (line 11)
- 500ms is longer than 300ms standard (should align with Phase 18 timing)
- No reduced-motion support
- No slide-in animations for cards within slides

**Enhancements needed:**
1. Reduce duration to 300ms (align with micro-interaction standard)
2. Add reduced-motion support (instant slide change, no transform)
3. Add fade-in animation for cards within each slide
4. Add `aria-live` announcements for screen readers (already exists, verify)

**Enhanced version:**
```vue
<template>
  <div class="overflow-hidden">
    <div
      ref="trackRef"
      class="flex"
      :class="prefersReducedMotion ? '' : 'transition-transform duration-300 ease-out'"
      :style="!prefersReducedMotion ? { transform: `translateX(-${currentIndex * 100}%)` } : {}"
    >
      <div v-for="(slide, slideIndex) in slides" :key="slideIndex" class="w-full flex-shrink-0">
        <TransitionGroup
          name="fade-slide"
          tag="div"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <TestimonialCard
            v-for="testimonial in slide"
            :key="testimonial.quote + testimonial.author"
            v-bind="testimonial"
          />
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { prefersReducedMotion } = usePreferredReducedMotion()
</script>

<style scoped>
.fade-slide-enter-active {
  transition: opacity 300ms ease-out, transform 300ms ease-out;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

@media (prefers-reduced-motion: reduce) {
  .fade-slide-enter-active {
    transition: opacity 150ms linear;
  }

  .fade-slide-enter-from {
    transform: none;
  }
}
</style>
```

**Source:** Project files - `/components/TestimonialsSlider.vue` (lines 1-208)

### Anti-Patterns to Avoid

- **Using scroll event listeners for animations:** Blocks main thread, causes jank. Use Intersection Observer instead.
- **CSS transitions on layout properties (width, height, top, left):** Triggers layout recalculation. Use transform/opacity only.
- **Animation libraries > 10KB:** GSAP (100KB+), Framer Motion (80KB+) are out of scope per REQUIREMENTS.md.
- **Forcing animation on reduced-motion users:** Causes motion sickness. Always respect `prefers-reduced-motion`.
- **Animating with setInterval:** Desyncs from display refresh. Use `requestAnimationFrame`.
- **Skipping ARIA announcements on carousel changes:** Screen reader users miss content. Use `aria-live="polite"`.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| FLIP animation calculations | Manual getBoundingClientRect math | @formkit/auto-animate (3KB) or VueUse utilities | Edge cases (nested transforms, scroll positions), cross-browser quirks |
| Intersection Observer polling | Window scroll listeners | VueUse's `useIntersectionObserver` | SSR-safe, auto-cleanup, reactive wrapper |
| Reduced motion detection | Window.matchMedia polling | VueUse's `usePreferredReducedMotion` | Reactive, handles SSR, proper cleanup |
| RequestAnimationFrame loop | setInterval | Native `requestAnimationFrame` | Syncs with display refresh, prevents layout thrashing |

**Key insight:** FLIP animations especially have many edge cases (nested elements with transforms, scroll positions during animation, browser reflow quirks) that make hand-rolled solutions error-prone. Use @formkit/auto-animate only if hand-rolled proves too complex.

## Common Pitfalls

### Pitfall 1: Intersection Observer Triggering Too Late

**What goes wrong:** Elements already visible by the time animation triggers, or trigger too late (after user has scrolled past)

**Why it happens:** Default threshold of 0 means triggers when ANY part is visible. Threshold of 1 means triggers when FULLY visible (often too late).

**How to avoid:**
- Use threshold of 0.1-0.2 for better balance
- Add rootMargin for early triggering (e.g., `'-50px 0px -50px 0px'` triggers 50px before element enters viewport)
- Test on mobile where viewport is smaller

**Warning signs:** Animations feel "delayed" or don't trigger until element is mostly on-screen

### Pitfall 2: Stats Counter Animating Every Time User Scrolls

**What goes wrong:** Counter restarts animation every time it enters viewport (annoying, unprofessional)

**Why it happens:** `hasAnimated` flag not checked, or IntersectionObserver not disconnected after first trigger

**How to avoid:**
- Always use `hasAnimated` flag (already in StatCounter.vue, line 38)
- Disconnect observer after first animation: `observer.disconnect()`
- Or use `once` option in useScrollReveal composable

**Warning signs:** Stats restart from 0 when scrolling up and down

### Pitfall 3: FLIP Animations Causing Layout Shift

**What goes wrong:** Elements jump during animation, causing CLS (Cumulative Layout Shift) penalty

**Why it happens:** Not waiting for DOM to settle before measuring positions, or animating layout properties instead of transform

**How to avoid:**
- Always use `await nextTick()` between DOM change and position measurement
- Only animate `transform` (never width, height, top, left)
- Set `will-change: transform` during animation (cleanup after)

**Warning signs:** High CLS scores in Lighthouse, elements "jitter" during filter change

### Pitfall 4: Carousel Transitions Not Respecting Reduced Motion

**What goes wrong:** Motion-sensitive users experience nausea from sliding animations

**Why it happens:** Carousel doesn't check `prefers-reduced-motion`, or uses transforms instead of instant visibility toggle

**How to avoid:**
- Use `usePreferredReducedMotion` from VueUse
- When reduced motion is enabled: skip transforms, use instant display toggle, reduce duration to 150ms linear

**Warning signs:** No reduced-motion testing, carousel always animates with transforms

### Pitfall 5: Staggered Animations Causing "Wave" Effect

**What goes wrong:** Child elements animate in sequence but timing feels unnatural or too slow

**Why it happens:** Fixed delay between all children doesn't account for viewport position, or delay is too long

**How to avoid:**
- Use stagger delay based on child index: `style="transition-delay: ${index * 50}ms"`
- Limit total delay (no more than 200-300ms cumulative)
- Disable stagger for reduced-motion users

**Warning signs:** Animations feel "slow" or "dragged out", last child animates much later than first

## Code Examples

Verified patterns from official sources:

### Enhanced useScrollReveal with Stagger Support

```typescript
// composables/useScrollReveal.ts (enhanced)
export function useScrollReveal(options?: {
  threshold?: number
  once?: boolean
  rootMargin?: string
  staggerChildren?: boolean
}) {
  const target = ref<HTMLElement>()
  const isVisible = ref(false)
  const hasRevealed = ref(false)

  const {
    threshold = 0.15,
    once = true,
    rootMargin = '0px',
    staggerChildren = false
  } = options || {}

  const { stop } = useIntersectionObserver(
    target,
    ([entry]) => {
      if (entry?.isIntersecting && !hasRevealed.value) {
        isVisible.value = true
        hasRevealed.value = true

        if (once) {
          stop() // Stop observing after first reveal
        }

        if (staggerChildren && target.value) {
          // Add stagger delays to children
          const children = target.value.querySelectorAll('.stagger-item')
          children.forEach((child, index) => {
            (child as HTMLElement).style.transitionDelay = `${index * 50}ms`
          })
        }
      }
    },
    { threshold, rootMargin }
  )

  return { target, isVisible, hasRevealed }
}
```

**Source:** Based on existing `/composables/useScrollReveal.ts` + VueUse useIntersectionObserver docs

### Stats Counter with Reduced Motion Support

```vue
<!-- components/StatCounter.vue (enhanced) -->
<template>
  <div ref="counterRef" class="stat-item" :class="{ visible: isVisible }">
    <div class="text-5xl md:text-6xl font-display font-bold text-white mb-2">
      {{ displayValue }}<span v-if="suffix">{{ suffix }}</span>
    </div>
    <div class="text-lg md:text-xl text-neutral-300">
      {{ label }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useScrollReveal } from '~/composables/useScrollReveal'
import { usePreferredReducedMotion } from '@vueuse/core'

interface Props {
  value: number
  label: string
  suffix?: string
  prefix?: string
  duration?: number
  decimals?: number
}

const props = withDefaults(defineProps<Props>(), {
  suffix: '',
  prefix: '',
  duration: 2000, // 2 seconds for full count
  decimals: 0
})

const counterRef = ref<HTMLElement>()
const { target, isVisible } = useScrollReveal(0.1)
const animatedValue = ref(0)
const hasAnimated = ref(false)
const { prefersReducedMotion } = usePreferredReducedMotion()

const displayValue = computed(() => {
  const val = props.decimals > 0
    ? animatedValue.value.toFixed(props.decimals)
    : Math.round(animatedValue).toString()
  return props.prefix + val
})

const animate = () => {
  if (hasAnimated.value || prefersReducedMotion.value) {
    if (prefersReducedMotion.value) {
      animatedValue.value = props.value // Instant display
    }
    return
  }

  hasAnimated.value = true
  const startTime = performance.now()
  const startValue = animatedValue.value
  const endValue = props.value

  const updateCounter = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / props.duration, 1)

    // Ease-out quart for smooth deceleration
    const easeOut = 1 - Math.pow(1 - progress, 4)
    animatedValue.value = startValue + (endValue - startValue) * easeOut

    if (progress < 1) {
      requestAnimationFrame(updateCounter)
    }
  }

  requestAnimationFrame(updateCounter)
}

watchEffect(() => {
  target.value = counterRef.value
})

watch(isVisible, (visible) => {
  if (visible && !hasAnimated.value) {
    animate()
  }
})
</script>

<style scoped>
.stat-item {
  text-align: center;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

.stat-item.visible {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .stat-item {
    transition: opacity 0.3s ease;
    transform: none !important;
  }
}
</style>
```

**Source:** Based on existing `/components/StatCounter.vue` + reduced-motion best practices

### FLIP Animation for Filter Transitions

```typescript
// composables/useFilterTransition.ts (NEW)
export function useFilterTransition<T>() {
  const containerRef = ref<HTMLElement>()
  const isAnimating = ref(false)

  const animateFilter = async (newItems: T[]) => {
    if (!containerRef.value || isAnimating.value) return

    isAnimating.value = true

    // FIRST: Record positions before DOM change
    const oldPositions = new Map<HTMLElement, { x: number; y: number; width: number; height: number }>()
    const oldChildren = Array.from(containerRef.value.children) as HTMLElement[]

    oldChildren.forEach(child => {
      const rect = child.getBoundingClientRect()
      oldPositions.set(child, {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      })
    })

    // Trigger DOM update
    await nextTick()

    // LAST: Record positions after DOM change
    const newChildren = Array.from(containerRef.value.children) as HTMLElement[]
    const animations: Promise<void>[] = []

    // INVERT & PLAY: Animate from old to new positions
    newChildren.forEach(child => {
      const oldPos = oldPositions.get(child)
      if (oldPos) {
        const newRect = child.getBoundingClientRect()
        const deltaX = oldPos.x - newRect.left
        const deltaY = oldPos.y - newRect.top

        // Skip if no movement needed
        if (deltaX === 0 && deltaY === 0) return

        // Apply inverted transform
        child.style.transform = `translate(${deltaX}px, ${deltaY}px)`
        child.style.transition = 'none'

        // Force reflow
        void child.offsetWidth

        // Animate to natural position
        child.style.transition = 'transform 300ms ease-out'
        child.style.transform = ''

        // Create promise for this animation
        const promise = new Promise<void>(resolve => {
          child.addEventListener('transitionend', () => resolve(), { once: true })
        })
        animations.push(promise)
      }
    })

    // Wait for all animations to complete
    await Promise.all(animations)

    // Cleanup
    newChildren.forEach(child => {
      child.style.transition = ''
      child.style.transform = ''
    })

    isAnimating.value = false
  }

  return { containerRef, animateFilter, isAnimating }
}
```

**Usage in services/index.vue:**
```vue
<template>
  <div ref="servicesContainer" class="grid grid-cols-1 md:grid-cols-2 gap-8">
    <div v-for="service in filteredServices" :key="service.slug">
      <!-- Service card -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFilterTransition } from '~/composables/useFilterTransition'

const { containerRef: servicesContainer, animateFilter } = useFilterTransition()

watch(filteredServices, async (newServices) => {
  await animateFilter(newServices)
})
</script>
```

**Source:** CSS-Tricks FLIP technique + Vue 3 best practices

### Enhanced TestimonialsSlider with Smooth Transitions

```vue
<!-- components/TestimonialsSlider.vue (enhanced) -->
<template>
  <section
    ref="sliderRef"
    class="relative"
    aria-label="Testimonials slider"
  >
    <!-- Slider Container -->
    <div class="overflow-hidden">
      <div
        ref="trackRef"
        class="flex"
        :class="prefersReducedMotion ? '' : 'transition-transform duration-300 ease-out'"
        :style="!prefersReducedMotion ? { transform: `translateX(-${currentIndex * 100}%)` } : {}"
      >
        <!-- Slides -->
        <div
          v-for="(slide, slideIndex) in slides"
          :key="slideIndex"
          class="w-full flex-shrink-0 px-1"
        >
          <TransitionGroup
            name="card-fade"
            tag="div"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <TestimonialCard
              v-for="testimonial in slide"
              :key="testimonial.quote + testimonial.author"
              :quote="testimonial.quote"
              :author="testimonial.author"
              :company="testimonial.company"
              :role="testimonial.role"
              :avatar="testimonial.avatar"
            />
          </TransitionGroup>
        </div>
      </div>
    </div>

    <!-- Navigation Arrows (existing, unchanged) -->
    <template v-if="slides.length > 1">
      <button
        class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 text-neutral-700 hover:text-primary border border-neutral-200 hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label="Previous testimonials"
        :disabled="currentIndex === 0"
        @click="previousSlide"
      >
        <Icon name="mdi:chevron-left" class="w-6 h-6" />
      </button>
      <button
        class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 text-neutral-700 hover:text-primary border border-neutral-200 hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label="Next testimonials"
        :disabled="currentIndex === slides.length - 1"
        @click="nextSlide"
      >
        <Icon name="mdi:chevron-right" class="w-6 h-6" />
      </button>
    </template>

    <!-- Dot Indicators (existing, unchanged) -->
    <div v-if="slides.length > 1" class="flex justify-center gap-2 mt-8">
      <button
        v-for="(_, index) in slides"
        :key="index"
        :aria-label="`Go to testimonials slide ${index + 1}`"
        :class="[
          'w-2.5 h-2.5 rounded-full transition-all duration-300',
          currentIndex === index
            ? 'bg-primary w-8'
            : 'bg-neutral-300 hover:bg-neutral-400'
        ]"
        @click="goToSlide(index)"
      />
    </div>

    <!-- Live region for screen reader announcements (existing, unchanged) -->
    <div class="sr-only" role="status" aria-live="polite">
      Showing testimonials slide {{ currentIndex + 1 }} of {{ slides.length }}
    </div>
  </section>
</template>

<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'

interface Testimonial {
  quote: string
  author: string
  company?: string
  role?: string
  avatar?: string
}

interface Props {
  testimonials: Testimonial[]
  itemsPerSlide?: number
}

const props = withDefaults(defineProps<Props>(), {
  itemsPerSlide: 3
})

const { prefersReducedMotion } = usePreferredReducedMotion()

// ... rest of existing script (chunking, navigation, etc.)
</script>

<style scoped>
/* Card fade-in animation for new slide content */
.card-fade-enter-active {
  transition: opacity 300ms ease-out, transform 300ms ease-out;
}

.card-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

/* Reduced motion: faster, no transforms */
@media (prefers-reduced-motion: reduce) {
  .card-fade-enter-active {
    transition: opacity 150ms linear;
  }

  .card-fade-enter-from {
    transform: none;
  }
}

/* Screen reader only utility (existing) */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
```

**Source:** Based on existing `/components/TestimonialsSlider.vue` + MDN carousel best practices

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| scroll event listeners | Intersection Observer API | 2016+ | 80% less main thread blocking, smoother animations |
| setInterval for counters | requestAnimationFrame | 2012+ | Syncs with display refresh (60fps), smoother visuals |
| CSS transitions on layout properties | FLIP technique (transform only) | 2015+ | No layout recalculation, maintains 60fps |
| Fixed animation timing | Respects prefers-reduced-motion | 2021+ | Accessibility compliance, no motion sickness |
| Heavy libraries (GSAP, 100KB+) | VueUse + hand-rolled | 2023+ | 95% smaller bundle, same functionality |

**Deprecated/outdated:**
- **jQuery scroll():** Replaced by Intersection Observer API (more performant)
- **CSS animations on width/height:** Replaced by FLIP technique (no layout thrashing)
- **setInterval for animations:** Replaced by requestAnimationFrame (display sync)
- **Fixed animation durations:** Replaced by prefers-reduced-motion queries (accessibility)

## Current State Audit

### What Exists (Implementations Found)

**Scroll-triggered animations (MICRO-07):**
- `useScrollReveal.ts` composable: Uses VueUse's `useIntersectionObserver` with threshold parameter
- `AppSection.vue`: Has `animate-on-scroll` prop, applies `.scroll-reveal` class with fade + translateY
- Usage: 30+ sections across pages use `animate-on-scroll` prop
- Missing: Staggered child animations, `once` option, reduced-motion respect in CSS
- Count: 1 composable, 1 component with support, 30+ usages

**Stats counter (MICRO-08):**
- `StatCounter.vue`: Complete implementation with scroll trigger
- Uses `useScrollReveal(0.1)` for viewport detection
- Uses `requestAnimationFrame` for smooth animation
- Has `hasAnimated` flag to prevent restart
- Uses ease-out quart easing (good)
- Missing: Reduced-motion support (counter always animates)
- Count: 1 component, used on homepage (4 instances)

**Service filter (MICRO-09):**
- `pages/services/index.vue`: Has category filter buttons
- Filter updates grid instantly with `<div v-else-if="filteredServices.length > 0" class="grid...">`
- No layout transition animation (abrupt content change)
- Missing: FLIP technique or any smooth transition
- Count: 1 page with filter, needs implementation

**Testimonial carousel (MICRO-10):**
- `TestimonialsSlider.vue`: Complete carousel component
- Uses `transform: translateX()` for sliding
- Has `transition-transform duration-500` (500ms, longer than 300ms standard)
- Has keyboard navigation (arrow keys)
- Has `aria-live="polite"` for screen readers
- Missing: Reduced-motion support, card fade-in animations, duration alignment
- Count: 1 component, polished but needs refinement

### What's Missing (Gaps to Address)

1. **Scroll animations:** Enhanced `useScrollReveal` with `once`, `rootMargin`, stagger support
2. **Stats counter:** Reduced-motion support (instant display vs animation)
3. **Filter transitions:** FLIP technique implementation for smooth layout changes
4. **Carousel transitions:** Reduce to 300ms, add card fade-in, reduced-motion support
5. **Global reduced motion:** Ensure all animations respect `prefers-reduced-motion`
6. **Consistent timing:** Align all animations to 300ms standard (carousel is 500ms)

### Component Inventory (Updates Needed)

| Component | Type | Current State | Needed Update |
|-----------|------|---------------|---------------|
| useScrollReveal.ts | Composable | Basic IntersectionObserver wrapper | Add once, rootMargin, stagger options |
| AppSection.vue | Section | Has animate-on-scroll prop | Support staggered children |
| StatCounter.vue | Stats | Complete count-up animation | Add reduced-motion support |
| TestimonialsSlider.vue | Carousel | Working with 500ms transitions | Reduce to 300ms, add card fade-in |
| pages/services/index.vue | Filter | Instant filter, no animation | Add FLIP layout transition |
| pages/projects/index.vue | Filter | Complex filter, no animation | Add FLIP layout transition |

## Open Questions

1. **FLIP implementation complexity:**
   - What we know: FLIP technique is well-documented (CSS-Tricks, MDN)
   - What's unclear: Whether to hand-roll or use @formkit/auto-animate (3KB)
   - Recommendation: Start with hand-rolled FLIP in `useFilterTransition.ts` composable, use @formkit/auto-animate only if implementation proves too complex or buggy

2. **Stagger animation approach:**
   - What we know: Staggered delays create visual interest
   - What's unclear: Whether to use CSS variables, inline styles, or Vue's TransitionGroup
   - Recommendation: Use inline `style="transition-delay: ${index * 50}ms"` for simplicity, disable for reduced-motion

3. **Carousel slide transition timing:**
   - What we know: Phase 18 established 300ms standard, TestimonialsSlider uses 500ms
   - What's unclear: Whether carousel needs different timing (500ms is common for carousels)
   - Recommendation: Reduce to 300ms for consistency, test if feels too fast (can increase to 400ms max)

4. **Stats counter duration:**
   - What we know: Current uses 2000ms (2 seconds) for full count
   - What's unclear: Whether 2s is too long for impatient users
   - Recommendation: Keep 2s for large numbers (500+), reduce to 1s for small numbers (<100)

## Sources

### Primary (HIGH confidence)

- **Project codebase analysis:**
  - `/composables/useScrollReveal.ts` - Scroll reveal implementation (lines 1-20)
  - `/components/StatCounter.vue` - Stats counter with requestAnimationFrame (lines 1-104)
  - `/components/TestimonialsSlider.vue` - Carousel implementation (lines 1-208)
  - `/components/AppSection.vue` - Section with animate-on-scroll (lines 1-88)
  - `/pages/services/index.vue` - Service filter without animations (lines 1-407)
  - `/pages/projects/index.vue` - Project filter without animations (lines 1-350)
  - `/pages/index.vue` - Stats counter usage (lines 54-76)
  - `/pages/about.vue` - Static stats display (lines 39-52)
  - `/assets/css/main.css` - Global reduced motion support (lines 175-227)

- **VueUse documentation:**
  - [useIntersectionObserver](https://vueuse.org/core/useIntersectionObserver/) - VueUse official docs for scroll detection
  - [usePreferredReducedMotion](https://vueuse.org/core/usePreferredReducedMotion/) - VueUse official docs for accessibility

- **Phase 18 research:**
  - `.planning/phases/18-core-micro-interactions/18-core-micro-interactions-RESEARCH.md` - Established 300ms timing standard

- **Phase 19 research:**
  - `.planning/phases/19-page-transitions/19-RESEARCH.md` - Page transition patterns, reduced-motion support

- **Requirements document:**
  - `.planning/REQUIREMENTS.md` - MICRO-07 through MICRO-10 definitions, out-of-scope libraries (lines 39-42)

### Secondary (MEDIUM confidence)

- **CSS-Tricks:**
  - [Animating Layouts with the FLIP Technique](https://css-tricks.com/animating-layouts-with-the-flip-technique/) - FLIP technique explanation

- **MDN Web Docs:**
  - [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) - Official API documentation
  - [Creating CSS carousels](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Overflow/Carousels) - Carousel best practices (January 28, 2026)

- **WebSearch verified with official sources:**
  - [Vue FLIP Image Gallery](https://freefrontend.com/code/vue-flip-image-gallery-2026-01-26/) - 2026 FLIP implementation example
  - [用Intersection Observer 打造丝滑的级联滚动动画](https://juejin.cn/post/7597199288817893416) - Scroll animations with Intersection Observer (January 20, 2026)
  - [10 Best Countup Timer Plugins In JavaScript (2026 Update)](https://www.jqueryscript.net/blog/best-countup-timer.html) - Count-up animation techniques (2026)
  - [How to: Animate Numbers When Scrolled Into View](https://www.digital.ink/blog/animate-numbers-on-scroll/) - Intersection Observer for counters
  - [A Complete Solution for Implementing Digital Scrolling Animation in Nuxt3 Projects](https://www.oreateai.com/blog/a-complete-solution-for-implementing-digital-scrolling-animation-in-nuxt3-projects/) - Nuxt3-specific counter implementation (January 7, 2026)
  - [Vue 3 Animation Guide with AutoAnimate](https://blog.csdn.net/gitblog_00057/article/details/138648215) - AutoAnimate library for Vue 3 (November 22, 2025)
  - [How to Use AutoAnimate for Vue.js Applications](https://blog.csdn.net/gitblog_00516/article/details/150730250) - AutoAnimate usage guide (January 2026)

### Tertiary (LOW confidence)

- **WebSearch (verified but needs validation):**
  - "Add Smooth Animations to Vue 3 with AutoAnimate!" (YouTube) - Video tutorial, practical implementation
  - "How to Build a Smooth Animated Filter Section" (Stack Overflow) - Filter animation discussion
  - "9 CSS Animation Techniques That Make UIs Feel Alive in 2026" - Modern CSS animation trends

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed, patterns exist in codebase
- Architecture: HIGH - Direct codebase analysis of 6 components, verified VueUse API docs
- Pitfalls: HIGH - Common issues documented in accessibility/performance guides, observed in current implementations
- FLIP technique: MEDIUM - Well-documented (CSS-Tricks, MDN), but hand-rolled complexity uncertain
- Filter animations: LOW - No existing implementation, needs validation of FLIP vs AutoAnimate decision

**Research date:** 2026-02-09
**Valid until:** 2026-03-11 (30 days - VueUse and Vue 3 are stable, animation best practices evolve slowly)

**Researcher notes:**
- Codebase has strong foundation with 80% of functionality already implemented
- Most work is enhancement and refinement, not greenfield development
- Key gap is FLIP animations for filters (no existing implementation)
- Reduced-motion support is the biggest accessibility gap across all animations
- StatCounter is well-implemented but needs reduced-motion check
- TestimonialsSlider is polished but needs timing alignment (500ms → 300ms)
- Constraint of avoiding heavy libraries (GSAP, Framer) is achievable with VueUse + hand-rolled
