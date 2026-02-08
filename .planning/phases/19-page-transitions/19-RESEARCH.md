# Phase 19: Page Transitions - Research

**Researched:** 2026-02-08
**Domain:** Nuxt 3 page transitions, accessibility-aware animations, CSS transitions
**Confidence:** HIGH

## Summary

Phase 19 requires implementing accessibility-aware page transitions using Nuxt 3's built-in transition system. The research confirms that Nuxt 3 provides robust support for page and layout transitions through Vue's `<Transition>` component, with configuration options in `nuxt.config.ts` and per-page overrides via `definePageMeta`. The project already has basic transition styles defined in `assets/css/main.css` and transition configuration in `nuxt.config.ts`, but needs refinement to meet the 150ms cross-fade requirement and proper `prefers-reduced-motion` support.

**Primary recommendation:** Use Nuxt 3's built-in `pageTransition` and `layoutTransition` configuration with CSS-based cross-fade transitions, leveraging VueUse's `usePreferredReducedMotion` composable for accessibility detection, and implementing directional transitions using route middleware for explicit route pairs.

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Transition style:** Cross-fade only (no slide effects). Main content area transitions; header/footer participation at Claude's discretion. Page-specific variations available (but consistent cross-fade preferred).
- **Timing:** 150ms duration for standard transitions (snappy, responsive feel). Easing curve at Claude's discretion. Same 150ms duration for reduced-motion users (just simpler effect).
- **Directional behavior:** Explicit route pairs define directional transitions. Which route pairs get directionality is at Claude's discretion. Routes without explicit pairs: fallback at Claude's discretion.
- **Layout handling:** Use Nuxt's built-in transition system with default.vue layout handling. Consistent cross-fade everywhere (including initial page load). Mobile vs desktop behavior at Claude's discretion.
- **Reduced motion support:** Minimal transition (not instant switch) for `prefers-reduced-motion` users. Same duration (150ms) with simpler effect.

### Claude's Discretion
- Easing curve choice (ease-in-out, ease-out, or linear based on what feels most natural)
- Header/footer participation in transitions
- Which specific route pairs get directional transitions
- Fallback behavior for routes not in explicit pairs
- Mobile vs desktop transition differences

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Nuxt 3 | 3.15.0+ | Built-in transition system | Official Vue integration, zero configuration |
| Vue | 3.5.0+ | `<Transition>` component | Native Vue transition support |
| VueUse | 12.0.1+ | `usePreferredReducedMotion` composable | Reactive prefers-reduced-motion detection |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @vueuse/nuxt | 12.0.1+ | Auto-imported VueUse composables | Already in project dependencies |
| @nuxt/a11y | 1.0.0-alpha.1 | Accessibility testing | Already configured for WCAG 2.1 AA |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS transitions | GSAP | GSAP adds bundle weight for simple cross-fades |
| VueUse `usePreferredReducedMotion` | Custom `useMediaQuery` | VueUse is more specific and already available |
| Nuxt built-in transitions | View Transitions API | Experimental feature, known issues with data fetching |

**Installation:**
No additional packages needed. All required dependencies are already installed:
- `nuxt`: ^3.15.0
- `vue`: ^3.5.0
- `@vueuse/nuxt`: ^12.0.1
- `@nuxt/a11y`: ^1.0.0-alpha.1

## Architecture Patterns

### Recommended Project Structure
```
/Users/austinlaw/Desktop/Sites/vp-eng-nuxt/
├── app.vue                 # Main app entry (needs creation for transitions)
├── nuxt.config.ts          # Global transition configuration
├── assets/css/main.css     # Transition CSS styles (already exists)
├── composables/
│   └── usePageTransition.ts # Page transition logic (new)
├── middleware/
│   └── transition-direction.global.ts # Directional transition logic (new)
├── layouts/
│   ├── default.vue         # Main layout with NuxtLayout wrapper
│   └── landing.vue         # Alternate layout
└── pages/
    ├── index.vue           # Define page-specific transitions via definePageMeta
    ├── about.vue
    ├── projects/
    │   ├── index.vue
    │   └── [slug].vue
    └── services/
        ├── index.vue
        └── [slug].vue
```

### Pattern 1: Global Transition Configuration
**What:** Configure page and layout transitions in `nuxt.config.ts` for consistent behavior across all routes.

**When to use:** As the default transition behavior for the entire application.

**Example:**
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },
})
```

**Source:** [Nuxt 3 Transitions Documentation](https://nuxt.com/docs/3.x/getting-started/transitions)

### Pattern 2: Per-Page Transition Override
**What:** Override global transitions for specific pages using `definePageMeta`.

**When to use:** When certain pages need different transition behavior (e.g., detail pages with directional transitions).

**Example:**
```vue
<!-- pages/projects/[slug].vue -->
<script setup lang="ts">
definePageMeta({
  pageTransition: {
    name: 'slide-right',
    mode: 'out-in',
  },
})
</script>
```

**Source:** [Nuxt 3 Transitions Documentation](https://nuxt.com/docs/3.x/getting-started/transitions)

### Pattern 3: Dynamic Transition Names with Middleware
**What:** Use inline middleware to dynamically assign transition names based on route navigation.

**When to use:** For implementing directional transitions based on route depth or explicit route pairs.

**Example:**
```typescript
// middleware/transition-direction.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  // Define explicit route pairs that get directional transitions
  const directionalPairs = [
    { from: '/projects', to: '/projects/[slug]', direction: 'forward' },
    { from: '/projects/[slug]', to: '/projects', direction: 'back' },
    { from: '/services', to: '/services/[slug]', direction: 'forward' },
    { from: '/services/[slug]', to: '/services', direction: 'back' },
  ]

  // Check if current navigation matches a directional pair
  for (const pair of directionalPairs) {
    const fromPattern = pair.from.replace('[slug]', '*')
    const toPattern = pair.to.replace('[slug]', '*')

    if (matchRoute(from, fromPattern) && matchRoute(to, toPattern)) {
      if (to.meta.pageTransition && typeof to.meta.pageTransition !== 'boolean') {
        to.meta.pageTransition.name = pair.direction === 'forward' ? 'slide-left' : 'slide-right'
      }
      return
    }
  }

  // Default to cross-fade for non-matching routes
  if (to.meta.pageTransition && typeof to.meta.pageTransition !== 'boolean') {
    to.meta.pageTransition.name = 'page'
  }
})
```

**Source:** [Nuxt 3 Dynamic Transitions](https://nuxt.com/docs/3.x/getting-started/transitions#dynamic-transitions)

### Pattern 4: Reduced Motion Detection with VueUse
**What:** Use `usePreferredReducedMotion` composable to detect OS-level reduced motion preference.

**When to use:** To respect accessibility preferences and provide simpler transitions.

**Example:**
```typescript
// composables/usePageTransition.ts
import { usePreferredReducedMotion } from '@vueuse/core'

export function usePageTransition() {
  const prefersReducedMotion = usePreferredReducedMotion()

  const transitionDuration = computed(() => {
    // Always 150ms per user decision, but CSS can adjust complexity
    return '150ms'
  })

  const transitionEasing = computed(() => {
    // Easing at Claude's discretion - ease-in-out is recommended for natural feel
    return 'ease-in-out'
  })

  return {
    prefersReducedMotion,
    transitionDuration,
    transitionEasing,
  }
}
```

**Source:** [VueUse usePreferredReducedMotion](https://vueuse.org/core/usepreferredreducedmotion/)

### Pattern 5: CSS-Based Cross-Fade with Reduced Motion Support
**What:** Define transition CSS classes with `@media (prefers-reduced-motion)` override.

**When to use:** For the standard cross-fade transition that respects accessibility preferences.

**Example:**
```css
/* assets/css/main.css */

/* Standard cross-fade transition - 150ms per user requirement */
.page-enter-active,
.page-leave-active {
  transition: opacity 150ms ease-in-out;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

/* Layout transition - same 150ms for consistency */
.layout-enter-active,
.layout-leave-active {
  transition: opacity 150ms ease-in-out;
}

.layout-enter-from,
.layout-leave-to {
  opacity: 0;
}

/* Reduced motion support - simpler effect, same duration */
@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active,
  .layout-enter-active,
  .layout-leave-active {
    /* Keep 150ms duration but use simpler easing */
    transition: opacity 150ms linear;
  }

  /* Ensure no transforms are applied */
  .page-enter-from,
  .page-leave-to,
  .layout-enter-from,
  .layout-leave-to {
    opacity: 0;
    transform: none !important;
  }
}
```

**Source:** [MDN - prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)

### Anti-Patterns to Avoid
- **View Transitions API (experimental):** Currently has known issues with data fetching and is marked as experimental in Nuxt 3. The project's `nuxt.config.ts` already has this disabled (`viewTransition: false`).
- **Transform-heavy transitions:** User specified cross-fade only. Avoid slide/scale transforms for the default transition.
- **Instant transitions for reduced motion:** User specified "minimal transition (not instant switch)" for reduced motion users.
- **Separate app.vue when not needed:** The project uses layouts effectively. Only create `app.vue` if needed for global transition wrapper.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| `prefers-reduced-motion` detection | Custom `window.matchMedia` hook | VueUse `usePreferredReducedMotion` | Already handles edge cases, reactive, auto-imported |
| Transition CSS classes | Manual class management | Nuxt's built-in transition system | Automatic class application, lifecycle hooks |
| Route-based transition names | Manual route comparison | Nuxt middleware + `definePageMeta` | Official pattern, well-documented |
| Screen reader announcements | Custom ARIA implementation | Existing `useA11yRouteAnnouncer` | Already implemented in Phase 17, working correctly |

**Key insight:** Nuxt 3's transition system is mature and well-tested. Building custom solutions for transitions introduces complexity and potential bugs. The project already has working accessibility announcements from Phase 17.

## Common Pitfalls

### Pitfall 1: Transition Not Applying with Layout Changes
**What goes wrong:** Page transitions don't run when changing between pages with different layouts.

**Why it happens:** Nuxt uses layout transitions instead of page transitions when layouts differ. The project has both `default.vue` and `landing.vue` layouts.

**How to avoid:** Ensure both `pageTransition` and `layoutTransition` are configured in `nuxt.config.ts` with matching CSS classes.

**Warning signs:** Transitions work on some routes but not others, especially when navigating between pages that use different layouts.

**Source:** [Nuxt 3 Transitions Documentation](https://nuxt.com/docs/3.x/getting-started/transitions#layout-transitions)

### Pitfall 2: Reduced Motion Too Aggressive
**What goes wrong:** All animations are disabled (`0.01ms` duration) for reduced motion users, making the interface feel broken.

**Why it happens:** Current implementation in `main.css` sets `transition-duration: 0.01ms !important` for `prefers-reduced-motion`.

**How to avoid:** Per user decision, use 150ms duration with simpler effect (no transforms, linear easing) rather than disabling transitions entirely.

**Warning signs:** Interface feels "jumpy" or inconsistent when reduced motion is enabled.

**Current code location:** `/Users/austinlaw/Desktop/Sites/vp-eng-nuxt/assets/css/main.css` lines 157-185

### Pitfall 3: Transition Duration Mismatch
**What goes wrong:** Page feels sluggish or transitions feel "off" compared to other animations.

**Why it happens:** Current CSS uses 300-400ms for page transitions, but Phase 18 standardized micro-interactions to 300ms. User wants 150ms for page transitions.

**How to avoid:** Update all transition classes to use consistent 150ms timing for page transitions.

**Warning signs:** Page transitions feel slower than button interactions or other micro-interactions.

### Pitfall 4: Missing app.vue
**What goes wrong:** Cannot globally wrap `<NuxtPage>` with transition props.

**Why it happens:** Project uses layouts but doesn't have an `app.vue` file. Nuxt provides a default one.

**How to avoid:** Create `app.vue` with `<NuxtLayout>` and `<NuxtPage>` structure if global transition control is needed beyond `nuxt.config.ts`.

**Warning signs:** Cannot override transitions globally via `<NuxtPage :transition="...">` prop.

**Source:** [Nuxt 3 app.vue Documentation](https://nuxt.com/docs/3.x/directory-structure/app)

### Pitfall 5: Dynamic Transitions Not Working
**What goes wrong:** Dynamic transition names set in middleware don't apply.

**Why it happens:** `definePageMeta` transition configuration is evaluated at compile time, not runtime. Middleware modifications to `to.meta.pageTransition` may not take effect.

**How to avoid:** Use the pattern shown in Nuxt docs with inline middleware in `definePageMeta`, or create global middleware that modifies the transition name before the page renders.

**Warning signs:** All pages use the same transition despite middleware logic.

**Source:** [Nuxt 3 Dynamic Transitions](https://nuxt.com/docs/3.x/getting-started/transitions#dynamic-transitions)

### Pitfall 6: Focus Management During Transitions
**What goes wrong:** Focus is lost or moves unexpectedly during page transitions.

**Why it happens:** Transitions can temporarily remove elements from DOM, affecting focus.

**How to avoid:** The project already implements proper focus management in `layouts/default.vue` with `useRouteFocus()` from `composables/useFocusManager.ts`. Ensure this continues to work with new transitions.

**Warning signs:** Screen reader users report losing focus or position during navigation.

## Code Examples

Verified patterns from official sources:

### Example 1: Basic Cross-Fade Transition (150ms)
```css
/* assets/css/main.css */

/* Page transition - 150ms cross-fade */
.page-enter-active,
.page-leave-active {
  transition: opacity 150ms ease-in-out;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

/* Layout transition - 150ms cross-fade */
.layout-enter-active,
.layout-leave-active {
  transition: opacity 150ms ease-in-out;
}

.layout-enter-from,
.layout-leave-to {
  opacity: 0;
}
```

**Source:** Nuxt 3 Transitions Documentation + user requirement (150ms)

### Example 2: Per-Page Directional Transition
```vue
<!-- pages/projects/[slug].vue -->
<script setup lang="ts">
definePageMeta({
  pageTransition: {
    name: 'slide-right',
    mode: 'out-in',
  },
})
</script>

<style>
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 150ms ease-in-out;
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
```

**Source:** [Nuxt 3 Transitions Documentation](https://nuxt.com/docs/3.x/getting-started/transitions)

### Example 3: Global Transition Configuration
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    pageTransition: {
      name: 'page',
      mode: 'out-in', // Ensures leave completes before enter
    },
    layoutTransition: {
      name: 'layout',
      mode: 'out-in',
    },
  },
})
```

**Source:** [Nuxt 3 Transitions Documentation](https://nuxt.com/docs/3.x/getting-started/transitions)

### Example 4: VueUse Reduced Motion Detection
```typescript
// composables/usePageTransition.ts
import { usePreferredReducedMotion } from '@vueuse/core'

export function usePageTransition() {
  const prefersReducedMotion = usePreferredReducedMotion()

  return {
    prefersReducedMotion,
  }
}
```

**Source:** [VueUse usePreferredReducedMotion](https://vueuse.org/core/usepreferredreducedmotion/)

### Example 5: Existing Route Announcer (Already Implemented)
```typescript
// composables/useA11y.ts - Already exists in project
export function useA11yRouteAnnouncer() {
  const { announce } = useAnnouncer({ priority: 'polite' })
  const route = useRoute()

  watch(() => route.path, async (to, from) => {
    if (to !== from) {
      const title = getPageTitle()
      await announce(`Navigated to ${title}`)
    }
  })

  return { announce, getPageTitle }
}
```

**Source:** Project file `/Users/austinlaw/Desktop/Sites/vp-eng-nuxt/composables/useA11y.ts`

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 300-400ms transitions | 150ms transitions | Per user decision (2026) | Snappier, more responsive feel |
| Disabling transitions for reduced motion | Simplified transitions (150ms, no transforms) | This phase | Maintains continuity while respecting preferences |
| Separate transition systems | Unified Nuxt transition system | Nuxt 3+ | Simpler configuration, better performance |

**Deprecated/outdated:**
- **Nuxt 2 transition syntax:** `<nuxt/>` component replaced by `<NuxtPage>` in Nuxt 3
- **View Transitions API (for now):** Experimental, has issues with data fetching
- **0.01ms transition duration:** Current implementation too aggressive, should be 150ms with simpler effect

## Open Questions

1. **Easing curve choice**
   - What we know: User left this to Claude's discretion
   - What's unclear: Whether ease-in-out, ease-out, or linear feels most natural for 150ms cross-fade
   - Recommendation: Use `ease-in-out` for symmetric feel, or `ease-out` for more natural exit-focused timing

2. **Header/footer participation in transitions**
   - What we know: User left this to Claude's discretion, main content area definitely transitions
   - What's unclear: Whether header/footer should fade separately or stay static
   - Recommendation: Keep header/footer static for better performance and reduced visual complexity

3. **Which route pairs get directional transitions**
   - What we know: User left this to Claude's discretion, explicit pairs should define directional behavior
   - What's unclear: Specific routes beyond projects/[slug] and services/[slug]
   - Recommendation: Implement for detail page navigation (list → detail, detail → list) where directionality is most valuable

4. **Mobile vs desktop differences**
   - What we know: User left this to Claude's discretion
   - What's unclear: Whether transitions should differ by device
   - Recommendation: Keep consistent across devices for simplicity, unless testing shows mobile performance issues

## Sources

### Primary (HIGH confidence)
- [Nuxt 3 Transitions Documentation](https://nuxt.com/docs/3.x/getting-started/transitions) - Complete guide on page and layout transitions
- [Nuxt 3 app.vue Documentation](https://nuxt.com/docs/3.x/directory-structure/app) - Main app component structure
- [VueUse usePreferredReducedMotion](https://vueuse.org/core/usepreferredreducedmotion/) - Reactive reduced motion detection
- [MDN - prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) - CSS media query specification
- [Project files examined:](file:///Users/austinlaw/Desktop/Sites/vp-eng-nuxt/)
  - `/Users/austinlaw/Desktop/Sites/vp-eng-nuxt/nuxt.config.ts` - Current transition configuration
  - `/Users/austinlaw/Desktop/Sites/vp-eng-nuxt/assets/css/main.css` - Current transition styles
  - `/Users/austinlaw/Desktop/Sites/vp-eng-nuxt/layouts/default.vue` - Layout with focus management
  - `/Users/austinlaw/Desktop/Sites/vp-eng-nuxt/composables/useA11y.ts` - Existing route announcer
  - `/Users/austinlaw/Desktop/Sites/vp-eng-nuxt/composables/useFocusManager.ts` - Focus management utilities

### Secondary (MEDIUM confidence)
- [Best practices for Accessibility in Vue / Nuxt](https://dev.to/jacobandrewsky/best-practices-for-accessibility-in-vue-nuxt-1cga) - Vue/Nuxt accessibility patterns (August 2025)
- [Web Animation Best Practices & Guidelines](https://gist.github.com/uxderrick/07b81ca63932865ef1a7dc94fbe07838) - Animation timing and easing (November 2025)
- [Understanding SC 2.3.3: Animation from Interactions (WCAG 2.2)](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) - WCAG animation requirements
- [transition-timing-function - CSS - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transition-timing-function) - Easing function reference (December 2025)
- [【Nuxt3系列八】切换Transitions](https://juejin.cn/post/7406144322856190003) - Nuxt 3 transitions guide in Chinese (August 2024)

### Tertiary (LOW confidence)
- Various blog posts and community discussions on Nuxt 3 transitions - Used for supplementary context only

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All official Nuxt 3 documentation, verified with project's actual dependencies
- Architecture: HIGH - Patterns from official Nuxt documentation, verified against project structure
- Pitfalls: HIGH - Based on known Nuxt 3 behaviors and examination of current project code
- Easing curves: MEDIUM - User left to discretion, general principles from animation best practices

**Research date:** 2026-02-08
**Valid until:** 2026-03-10 (30 days - Nuxt 3 and Vue 3 are stable, but ecosystem moves quickly)

**Key files to modify:**
- `/Users/austinlaw/Desktop/Sites/vp-eng-nuxt/nuxt.config.ts` - Update transition configuration
- `/Users/austinlaw/Desktop/Sites/vp-eng-nuxt/assets/css/main.css` - Update transition CSS (150ms, reduced motion)
- `/Users/austinlaw/Desktop/Sites/vp-eng-nuxt/middleware/transition-direction.global.ts` - Create for directional transitions
- `/Users/austinlaw/Desktop/Sites/vp-eng-nuxt/composables/usePageTransition.ts` - Create for transition utilities

**Key files to reference:**
- `/Users/austinlaw/Desktop/Sites/vp-eng-nuxt/layouts/default.vue` - Existing focus management
- `/Users/austinlaw/Desktop/Sites/vp-eng-nuxt/composables/useA11y.ts` - Existing route announcer (TRANS-04 already satisfied)
