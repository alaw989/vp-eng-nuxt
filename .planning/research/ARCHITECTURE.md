# Architecture Patterns: Refinement Features Integration

**Domain:** Nuxt 3 Refinement - Page Transitions, Micro-interactions, Accessibility
**Project:** VP Associates Website v1.2
**Researched:** 2026-02-07
**Overall Confidence:** HIGH

---

## Executive Summary

The existing Nuxt 3 architecture is **well-positioned for refinement features** with minimal restructuring. The codebase already demonstrates solid patterns:

- **Page transitions** are configured globally in `nuxt.config.ts` with CSS classes in `main.css`
- **Micro-interactions** exist in components (hover states, transitions) using Tailwind utilities
- **Accessibility foundations** are strong: semantic HTML, ARIA labels, keyboard handlers, skip links
- **Composables pattern** is established (useScrollReveal) for shared logic

**Key insight:** Refinement features should be implemented as **layered enhancements**, not architectural changes. Focus on:
1. Enhanced page transitions using Vue 3's built-in `<Transition>` component
2. Composable-based micro-interactions for reusability
3. Accessibility as a **composable pattern** (`useA11y`) for consistent implementation
4. Design tokens in Tailwind config for visual consistency

---

## Current Architecture Analysis

### Existing Transition Infrastructure

**Global Configuration (nuxt.config.ts):**
```typescript
app: {
  pageTransition: { name: 'page', mode: 'out-in' },
  layoutTransition: { name: 'layout', mode: 'out-in' }
}
```

**CSS Implementation (main.css):**
- `.page-enter-active`, `.page-leave-active` with cubic-bezier easing
- Transform + opacity transitions (subtle, not overwhelming)
- Layout transitions for smooth navigation

**Status:** ✅ **Already implemented but basic**

### Existing Component Interactions

**AppHeader.vue:**
- Scroll-based shadow effect (window scroll listener)
- Mobile menu with `<Transition>` component
- `focus-visible:ring` utilities for keyboard navigation
- ARIA attributes: `aria-current`, `aria-label`, `aria-expanded`, `aria-controls`

**ProjectCard.vue:**
- Group hover effect: `group-hover:scale-110` on images
- `transition-all duration-300` for card hover
- `focus-visible:ring-2` for accessibility
- Proper `alt` text construction with all metadata

**Status:** ✅ **Solid foundation, can be enhanced**

### Existing Accessibility Patterns

**Layouts/default.vue:**
- Skip to main content link (screen reader only, visible on focus)
- Semantic HTML5 landmarks: `<header role="banner">`, `<main role="main">`, `<footer role="contentinfo">`
- `tabindex="-1"` on main for skip link target

**Components:**
- ARIA current page indicators in navigation
- Proper button labels with `aria-label`
- Icon-only links have descriptive aria-labels (e.g., Search icon)
- Focus management in mobile menu

**Status:** ✅ **Good foundation, needs consistency layer**

### Existing Composables

**useScrollReveal.ts:**
- Uses VueUse's `useIntersectionObserver`
- Returns `target` ref and `isVisible` reactive
- Simple, reusable pattern

**Status:** ✅ **Pattern established, can extend**

---

## Recommended Architecture for Refinement

### 1. Page Transitions Enhancement

#### Current Architecture
```
┌─────────────────────────────────────────┐
│  nuxt.config.ts (global config)        │
│  ├─ pageTransition: { name: 'page' }   │
│  └─ layoutTransition: { name: 'layout' }│
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  main.css (transition classes)          │
│  ├─ .page-enter-active                 │
│  ├─ .page-leave-active                 │
│  └─ .page-enter-from, .page-leave-to   │
└─────────────────────────────────────────┘
```

#### Recommended Enhancement

**Option A: Per-Page Transitions (Recommended)**
```typescript
// In specific page files
definePageMeta({
  pageTransition: {
    name: 'slide-fade',
    mode: 'out-in'
  }
})
```

**Why:**
- Granular control without global changes
- Different transitions for different contexts (e.g., projects → project detail)
- No risk of breaking existing pages
- Leverages Nuxt 3's built-in `definePageMeta`

**Option B: Enhanced Global Transitions**
Enhance existing `.page-*` classes with:
- Reduced motion support (`@media (prefers-reduced-motion: reduce)`)
- Directional transitions (slide left vs right based on route depth)
- Scroll position hooks for smooth restoration

**Integration Points:**
- Modify `main.css` → No component changes
- Add directional logic in `app.vue` or plugin
- Respect `prefers-reduced-motion` for accessibility

---

### 2. Micro-Interactions Architecture

#### Proposed Pattern: Composable-Based Utilities

**New Composable: `useMicroInteractions.ts`**
```typescript
export function useMicroInteractions() {
  const isHovered = ref(false)
  const isPressed = ref(false)
  const isFocused = ref(false)

  // Hover with debouncing
  const onHover = (callback: Function, delay = 150) => {
    let timeout: NodeJS.Timeout
    return () => {
      clearTimeout(timeout)
      timeout = setTimeout(callback, delay)
    }
  }

  // Press animation
  const onPress = () => { isPressed.value = true }
  const onRelease = () => { isPressed.value = false }

  // Focus ring (respecting prefers-reduced-motion)
  const shouldAnimate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return {
    isHovered, isPressed, isFocused,
    onHover, onPress, onRelease,
    shouldAnimate
  }
}
```

**Usage Pattern:**
```vue
<template>
  <button
    @mouseenter="handleHover"
    @mouseleave="cancelHover"
    @mousedown="onPress"
    @mouseup="onRelease"
    :class="{ 'scale-95': isPressed && shouldAnimate }"
  >
    Button
  </button>
</template>

<script setup lang="ts">
const { isPressed, onPress, onRelease, shouldAnimate } = useMicroInteractions()
</script>
```

#### Tailwind Utilities Enhancement

**Add to main.css `@layer utilities`:**
```css
/* Micro-interaction utilities */
.hover-lift {
  @apply transition-transform duration-200 hover:-translate-y-1;
}

.press-scale {
  @apply active:scale-95 transition-transform duration-100;
}

.focus-ring-subtle {
  @apply focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2;
}

/* Respects reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .hover-lift,
  .press-scale {
    transition: none !important;
    transform: none !important;
  }
}
```

**Integration Points:**
- Update existing components (ProjectCard, ServiceCard, buttons)
- No new components needed - utility classes approach
- Composable for complex interactions (modals, dropdowns)

---

### 3. Accessibility Layer Architecture

#### Proposed Pattern: Accessibility Composable

**New Composable: `useA11y.ts`**
```typescript
export function useA11y() {
  // Announce to screen readers
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('role', 'status')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)
    setTimeout(() => document.body.removeChild(announcement), 1000)
  }

  // Trap focus in modal
  const trapFocus = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }

    container.addEventListener('keydown', handleTab)
    firstElement?.focus()

    return () => container.removeEventListener('keydown', handleTab)
  }

  // Manage focus return
  const manageFocusReturn = () => {
    const previousActiveElement = document.activeElement as HTMLElement

    onUnmounted(() => {
      previousActiveElement?.focus()
    })

    return previousActiveElement
  }

  // Keyboard navigation patterns
  const useRovingTabIndex = (items: Ref<HTMLElement[]>) => {
    const currentIndex = ref(0)

    const handleKeydown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          currentIndex.value = (currentIndex.value + 1) % items.value.length
          items.value[currentIndex.value].focus()
          break
        case 'ArrowUp':
          e.preventDefault()
          currentIndex.value = currentIndex.value === 0
            ? items.value.length - 1
            : currentIndex.value - 1
          items.value[currentIndex.value].focus()
          break
        case 'Home':
          e.preventDefault()
          currentIndex.value = 0
          items.value[0].focus()
          break
        case 'End':
          e.preventDefault()
          currentIndex.value = items.value.length - 1
          items.value[currentIndex.value].focus()
          break
      }
    }

    return { currentIndex, handleKeydown }
  }

  // Check reduced motion preference
  const prefersReducedMotion = computed(() => {
    if (import.meta.client) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
    return false
  })

  return {
    announce,
    trapFocus,
    manageFocusReturn,
    useRovingTabIndex,
    prefersReducedMotion
  }
}
```

#### Component-Level Accessibility Pattern

**Base Pattern for Interactive Components:**
```vue
<template>
  <button
    ref="buttonRef"
    :aria-label="ariaLabel"
    :aria-pressed="isPressed"
    :aria-expanded="isExpanded"
    @click="toggle"
    @keydown="handleKeydown"
    class="base-styles focus-ring"
  >
    <slot />
    <span class="sr-only">{{ screenReaderText }}</span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  ariaLabel: string
  screenReaderText?: string
}

const props = defineProps<Props>()
const { announce, prefersReducedMotion } = useA11y()

const isPressed = ref(false)
const isExpanded = ref(false)

const toggle = () => {
  isPressed.value = !isPressed.value
  isExpanded.value = !isExpanded.value
  announce(`${props.ariaLabel} ${isExpanded.value ? 'expanded' : 'collapsed'}`)
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    toggle()
  }
}
</script>
```

**Integration Points:**
- Create `useA11y.ts` in `composables/`
- Update interactive components (buttons, dropdowns, modals)
- No changes to static components (Hero, About sections)
- Add keyboard handler patterns where missing

---

### 4. Visual Consistency: Design Tokens

#### Current Tailwind Config

**Existing Colors:**
```javascript
colors: {
  primary: {
    DEFAULT: '#033379',    // Brand blue
    light: '#0a4da8',
    dark: '#02244f'
  },
  secondary: {
    DEFAULT: '#BE0000',    // Brand red
    light: '#e60000',
    dark: '#8a0000'
  }
}
```

**Recommended Extensions:**

**Spacing Scale (already using Tailwind defaults):**
- Current: `py-16 md:py-24 lg:py-32` for sections
- Recommendation: Create semantic spacing tokens

**Animation Durations:**
```javascript
// Add to tailwind.config.js
theme: {
  extend: {
    transitionDuration: {
      'fast': '150ms',
      'base': '200ms',
      'slow': '300ms',
      'slower': '500ms'
    },
    transitionTimingFunction: {
      'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      'ease-in-out-quad': 'cubic-bezier(0.45, 0, 0.55, 1)'
    }
  }
}
```

**Semantic Spacing Tokens:**
```javascript
spacing: {
  'section': '4rem',      // 64px - mobile section padding
  'section-md': '6rem',   // 96px - tablet section padding
  'section-lg': '8rem',   // 128px - desktop section padding
  'element': '1.5rem',    // 24px - default element spacing
  'element-sm': '1rem',   // 16px - compact element spacing
  'element-lg': '2rem',   // 32px - generous element spacing
}
```

**Border Radius Consistency:**
```javascript
borderRadius: {
  'card': '0.75rem',      // 12px - ProjectCard, ServiceCard
  'button': '0.5rem',     // 8px - buttons
  'input': '0.375rem'     // 6px - form inputs
}
```

**Integration Points:**
- Update `tailwind.config.js` with tokens
- No component changes - tokens used via utility classes
- Consistent design system enforced at config level

---

## Integration Points with Existing Components

### Components Requiring Enhancement

| Component | Current State | Enhancement Needed | Complexity |
|-----------|---------------|-------------------|------------|
| **AppHeader** | Good a11y, basic transitions | Add micro-interaction to logo hover, enhance menu transition | Low |
| **ProjectCard** | Hover effects, good a11y | Add `press-scale` utility, refine animation timing | Low |
| **ServiceCard** | Similar to ProjectCard | Same as ProjectCard | Low |
| **TeamMember** | Unknown (need to check) | Add hover lift, focus ring | Low |
| **TestimonialCard** | Unknown | Add subtle fade-in on scroll | Low |
| **HeroSlider** | Unknown | Add touch-friendly transitions, a11y announcements | Medium |
| **AppBreadcrumbs** | Unknown | Ensure keyboard nav, a11y labels | Low |
| **PwaInstallPrompt** | Unknown | Add animation on show, a11y | Medium |
| **LoadingSkeleton** | Unknown | Add shimmer animation, reduced motion support | Low |

### New Components Needed

| Component | Purpose | Complexity |
|-----------|---------|------------|
| **TransitionWrapper.vue** | Reusable page transition with directional logic | Low |
| **FocusTrap.vue** | Modal/dialog focus management utility | Medium |
| **KeyboardNav.vue** | Roving tabindex pattern for lists/grid | Medium |
| **LiveRegion.vue** | Screen reader announcement component | Low |

### Components Not Requiring Changes

| Component | Reason |
|-----------|--------|
| **AppFooter** | Static content, adequate spacing |
| **ClientLogos** | Non-interactive, sufficient |
| **StatCounter** | Already has animation (likely) |
| **Skeletons** | Loading states, no interaction needed |
| **AppError** | Error state, minimal interaction |

---

## Data Flow Changes

### Current Data Flow
```
User Interaction
    ↓
Component Event Handler
    ↓
State Update (ref/reactive)
    ↓
Re-render
```

### Enhanced Data Flow (Minimal Changes)
```
User Interaction
    ↓
Component Event Handler
    ↓
┌─────────────────────────────┐
│  useA11y (if needed)        │ ← NEW: Composable layer
│  ├─ announce()              │
│  ├─ trapFocus()             │
│  └─ manageFocusReturn()     │
└─────────────────────────────┘
    ↓
State Update (ref/reactive)
    ↓
┌─────────────────────────────┐
│  useMicroInteractions       │ ← NEW: Animation control
│  ├─ check reduced motion    │
│  └─ apply transition        │
└─────────────────────────────┘
    ↓
Re-render with Transition
```

**Key Point:** Data flow doesn't change fundamentally. Composables intercept at the event handling stage to add a11y/animation logic before state updates.

---

## Build Order for Maximum Impact

### Phase 1: Accessibility Foundation (High Impact, Low Risk)

**Why first:** Accessibility improvements are invisible to most users but critical for some. No performance cost, establishes patterns for other features.

1. **Create `useA11y.ts` composable** (2-3 hours)
   - Core functions: `announce`, `trapFocus`, `prefersReducedMotion`
   - Test with screen reader (NVDA/VoiceOver)

2. **Update existing components with a11y patterns** (4-6 hours)
   - AppHeader: Ensure keyboard navigation works
   - ProjectCard/ServiceCard: Verify focus rings
   - Add missing ARIA labels

3. **Add keyboard handlers** (2-3 hours)
   - Enter/Space for button-like elements
   - Escape for closing modals/dropdowns
   - Arrow keys for list navigation

**Impact:** 10-15% user base (assistive tech users)
**Risk:** Low (no visual changes, easy to test)
**Dependencies:** None

---

### Phase 2: Micro-Interactions (High Impact, Low Risk)

**Why second:** Builds on accessibility foundation (respects `prefers-reduced-motion`), immediate visual polish.

1. **Create `useMicroInteractions.ts` composable** (1-2 hours)
   - Hover, press, focus patterns
   - Reduced motion detection

2. **Add Tailwind utilities** (1 hour)
   - `.hover-lift`, `.press-scale`, `.focus-ring-subtle`
   - Reduced motion media query

3. **Enhance existing components** (4-6 hours)
   - ProjectCard: Add press-scale, refine hover
   - ServiceCard: Same
   - Buttons: Add press-scale globally
   - TeamMember: Add hover-lift

**Impact:** 100% of users (visual polish)
**Risk:** Low (CSS-only, can be easily reverted)
**Dependencies:** Phase 1 (for reduced motion support)

---

### Phase 3: Page Transitions (Medium Impact, Medium Risk)

**Why third:** Requires careful testing, more complex than micro-interactions. Builds on patterns from Phases 1-2.

1. **Create `TransitionWrapper.vue`** (2-3 hours)
   - Directional transitions based on route depth
   - Reduced motion support
   - Configurable duration/easing

2. **Add per-page transitions** (3-4 hours)
   - Home → Pages: Slide-fade
   - Projects → Project detail: Scale-fade
   - Generic: Fade

3. **Enhance global transition CSS** (1-2 hours)
   - Better easing functions
   - Scroll position hooks
   - Reduce motion support

**Impact:** 100% of users (navigation feel)
**Risk:** Medium (can cause jank if not optimized)
**Dependencies:** Phase 1 (a11y), Phase 2 (animation patterns)

---

### Phase 4: Visual Consistency (Low Impact, Low Risk)

**Why fourth:** Polish phase, ties everything together visually.

1. **Add design tokens to Tailwind config** (1-2 hours)
   - Spacing, duration, easing tokens
   - Semantic color tokens (if needed)

2. **Audit components for consistency** (3-4 hours)
   - Ensure all cards use `rounded-card`
   - Ensure all buttons use `rounded-button`
   - Check spacing scales

3. **Create component documentation** (2-3 hours)
   - Document design tokens
   - Create usage examples
   - Establish patterns for future development

**Impact:** Developer experience (DX), long-term maintainability
**Risk:** Low (systematic, reversible)
**Dependencies:** None (can run in parallel)

---

## Minimal Disruption Strategy

### Incremental Rollout

**Feature Flags Approach:**
```typescript
// nuxt.config.ts
runtimeConfig: {
  public: {
    features: {
      enhancedTransitions: true,   // Enable/disable page transitions
      microInteractions: true,     // Enable/disable micro-interactions
      a11yComposable: true         // Enable/disable new a11y patterns
    }
  }
}
```

**Progressive Enhancement:**
1. **Baseline:** Current site continues working
2. **Layer 1:** Add composables (no components use them yet)
3. **Layer 2:** Update 1-2 components as proof of concept
4. **Layer 3:** Roll out to remaining components incrementally
5. **Layer 4:** Remove old patterns if unused

### Testing Strategy

**Per-Phase Testing:**
- Phase 1 (A11y): Keyboard-only navigation, screen reader testing
- Phase 2 (Micro-Interactions): Reduced motion testing, hover/press states
- Phase 3 (Transitions): Route navigation testing, scroll position verification
- Phase 4 (Consistency): Visual audit, responsive testing

**Automated Testing:**
```typescript
// Playwright a11y tests
test('keyboard navigation', async ({ page }) => {
  await page.keyboard.press('Tab')
  await expect(page.locator('button')).toBeFocused()
})

test('reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  // Verify no animations occur
})
```

---

## Architecture Patterns to Follow

### Pattern 1: Composable-First Logic

**What:** Shared logic lives in composables, not components

**Why:**
- Reusable across components
- Testable in isolation
- Clear separation of concerns

**Example:**
```typescript
// composables/useInteraction.ts
export function useInteraction() {
  const isHovered = ref(false)
  const isPressed = ref(false)
  // ... logic
  return { isHovered, isPressed }
}
```

### Pattern 2: Utility-First Styling

**What:** Use Tailwind utilities, avoid component `<style>` blocks when possible

**Why:**
- Consistent design system
- Easier to maintain
- Better tree-shaking

**Example:**
```vue
<!-- GOOD -->
<button class="press-scale hover-lift focus-ring">
  Click me
</button>

<!-- AVOID -->
<button class="custom-button">
  Click me
</button>
<style scoped>
.custom-button { /* custom styles */ }
</style>
```

### Pattern 3: Progressive Enhancement

**What:** Base functionality works without JS, enhance with JS

**Why:**
- Graceful degradation
- Better performance
- Respects user preferences

**Example:**
```css
/* Base: No animation */
.button { transition: none; }

/* Enhanced: With animation (if user prefers) */
@media (prefers-reduced-motion: no-preference) {
  .button { transition: transform 0.2s; }
}
```

### Pattern 4: Semantic HTML as Foundation

**What:** Use semantic HTML5 elements, add ARIA as enhancement

**Why:**
- Built-in accessibility
- Better SEO
- Less code to maintain

**Example:**
```vue
<!-- GOOD -->
<button aria-label="Close dialog">
  <Icon name="mdi:close" />
</button>

<!-- AVOID -->
<div @click="close" role="button" tabindex="0">
  <Icon name="mdi:close" />
</div>
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: JavaScript-Heavy Animations

**What:** Using GSAP/Framer Motion for simple transitions

**Why bad:**
- Unnecessary JavaScript payload
- Harder to respect reduced motion
- More complex to maintain

**Instead:**
```vue
<!-- Use CSS transitions -->
<div class="transition-all duration-200 hover:scale-105">
```

### Anti-Pattern 2: Accessibility as Afterthought

**What:** Adding ARIA after component is built

**Why bad:**
- Easy to miss edge cases
- Harder to retrofit
- Often incomplete

**Instead:**
```vue
<!-- Design with a11y from start -->
<button
  :aria-label="label"
  :aria-pressed="isActive"
  @keydown="handleKeydown"
>
```

### Anti-Pattern 3: Over-Engineering Transitions

**What:** Complex page transitions that block navigation

**Why bad:**
- Hurts perceived performance
- Can cause motion sickness
- Difficult to maintain

**Instead:**
```css
/* Keep transitions simple: opacity + transform */
.page-enter-active {
  transition: opacity 0.3s, transform 0.3s;
}
```

### Anti-Pattern 4: Inconsistent Spacing/Colors

**What:** Hardcoded values instead of design tokens

**Why bad:**
- Inconsistent design
- Hard to update globally
- Violates DRY principle

**Instead:**
```vue
<!-- Use Tailwind utilities/division -->
<div class="p-element-lg rounded-card">
```

---

## Scalability Considerations

| Concern | Current Site (50 pages) | Future (100+ pages) | Strategy |
|---------|------------------------|---------------------|----------|
| **Transition consistency** | Manual per-page config | Use default transitions | `definePageMeta` with inheritance |
| **A11y patterns** | Component-level | Composable + utility classes | `useA11y` composable scales |
| **Design tokens** | Hardcoded values | Token-driven | Tailwind config as single source |
| **Component variations** | Duplicated code | Props-driven variation | Unified components with props |
| **Testing** | Manual | Automated | Playwright a11y tests |

---

## Recommendations Summary

### High Priority (Implement First)

1. **Create `useA11y.ts` composable**
   - `announce()`, `trapFocus()`, `prefersReducedMotion`
   - Foundation for all other enhancements

2. **Add reduced motion support to all animations**
   - Media query in CSS
   - Check in composables
   - Respects user preferences

3. **Enhance keyboard navigation**
   - Enter/Space handlers
   - Focus management
   - ARIA announcements

### Medium Priority (Implement Second)

4. **Add micro-interaction utilities to Tailwind**
   - `.hover-lift`, `.press-scale`, `.focus-ring-subtle`
   - Update existing components gradually

5. **Enhance page transitions**
   - Per-page transitions via `definePageMeta`
   - Directional transitions
   - Scroll position hooks

6. **Create design tokens in Tailwind config**
   - Spacing, duration, easing
   - Semantic naming

### Low Priority (Polish)

7. **Create reusable TransitionWrapper component**
   - If complex transitions needed
   - Otherwise, use Vue's built-in `<Transition>`

8. **Add focus trap utility**
   - For modals/dialogs
   - Use existing pattern if present

9. **Component documentation**
   - Storybook or similar
   - Usage examples

---

## Implementation Complexity Assessment

| Feature | Lines of Code | Dev Time | Testing Time | Risk |
|---------|--------------|-----------|--------------|------|
| `useA11y.ts` composable | ~150 | 2-3h | 2-3h | Low |
| `useMicroInteractions.ts` | ~80 | 1-2h | 1h | Low |
| Tailwind utilities | ~40 | 1h | 1h | Low |
| Update ProjectCard | ~20 | 1h | 1h | Low |
| Update ServiceCard | ~20 | 1h | 1h | Low |
| Update AppHeader | ~30 | 2h | 2h | Low |
| Per-page transitions | ~100 | 3-4h | 3h | Medium |
| Design tokens | ~50 | 2h | 1h | Low |
| **Total** | ~490 | **15-18h** | **13-15h** | **Low-Medium** |

---

## Integration with Existing Features

### PWA Features
- **No conflicts:** Transitions work with PWA
- **Enhancement:** Add transition to PWA install prompt
- **A11y:** Announce PWA updates to screen readers

### Performance Optimizations (v1.1)
- **Compatibility:** Transitions don't affect LCP/INP if CSS-based
- **Bundle size:** No new dependencies (use Vue built-ins)
- **Critical CSS:** Transitions should be non-critical, load deferred

### WordPress API Integration
- **No impact:** Data fetching unchanged
- **Enhancement:** Add skeleton transitions, loading states

---

## Sources

### Official Documentation
- [Nuxt 3 Page Transitions](https://nuxt.com/docs/3.x/api/composables/use-page-transition) - HIGH confidence, official
- [Vue 3 Transition Component](https://vuejs.org/guide/built-ins/transition.html) - HIGH confidence, official
- [Vue 3 Accessibility Guide](https://vuejs.org/guide/best-practices/accessibility.html) - HIGH confidence, official
- [Tailwind CSS Animation Utilities](https://tailwindcss.com/docs/animation) - HIGH confidence, official
- [VueUse useIntersectionObserver](https://vueuse.org/core/useIntersectionObserver/) - HIGH confidence, official

### Best Practices (2025-2026)
- [Nuxt 4 Performance Optimization: Complete Guide to Faster Apps in 2026](https://masteringnuxt.com/blog/nuxt-4-performance-optimization-complete-guide-to-faster-apps-in-2026) - MEDIUM confidence
- [Micro-interactions Trends 2025](https://www.smashingmagazine.com/2025/01/micro-interactions-design-guide/) - MEDIUM confidence (search result)
- [ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/) - HIGH confidence, W3C

### Community Resources
- [Vue 3 Accessibility Patterns](https://www.smashingmagazine.com/2025/01/accessible-vue-3-components/) - MEDIUM confidence (search result)
- [Tailwind CSS Design Tokens Pattern](https://tailwindcss.com/blog/custom-configuration-reference) - HIGH confidence, official
- [Reduced Motion in CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) - HIGH confidence, MDN

### Codebase Analysis (High Confidence)
- `/home/deck/Sites/vp-eng-nuxt/nuxt.config.ts` - Verified existing configuration
- `/home/deck/Sites/vp-eng-nuxt/assets/css/main.css` - Verified existing transition classes
- `/home/deck/Sites/vp-eng-nuxt/components/AppHeader.vue` - Verified existing a11y patterns
- `/home/deck/Sites/vp-eng-nuxt/components/ProjectCard.vue` - Verified existing interaction patterns
- `/home/deck/Sites/vp-eng-nuxt/composables/useScrollReveal.ts` - Verified existing composable pattern
- `/home/deck/Sites/vp-eng-nuxt/layouts/default.vue` - Verified semantic HTML structure
- `/home/deck/Sites/vp-eng-nuxt/tailwind.config.js` - Verified existing design tokens
- `/home/deck/Sites/vp-eng-nuxt/package.json` - Verified dependencies (Vue 3.5.0, Nuxt 3.15.0)

---

*Architecture research for: VP Associates Website v1.2 Refinement*
*Researched: 2026-02-07*
