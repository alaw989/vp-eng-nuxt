# Pitfalls Research: Refinement Features for Existing Nuxt 3 Site

**Domain:** Nuxt 3 Website Refinement (v1.2)
**Researched:** 2026-02-07
**Confidence:** HIGH

## Executive Summary

This document focuses specifically on **common mistakes when adding polish and UX features (page transitions, animations, accessibility improvements) to an existing Nuxt 3 website**. These pitfalls have been identified from official Vue/Nuxt documentation, accessibility experts, and real-world case studies.

**Key insight:** The biggest risk in refinement work is **undoing v1.1 performance optimizations** with well-intentioned but poorly implemented UX enhancements. Page transitions can cause white flashes, animations can regress Lighthouse scores, and accessibility improvements can break existing functionality if not integrated carefully.

---

## Critical Pitfalls

### Pitfall 1: Page Transitions Causing White Flash/Blank Screen

**What goes wrong:**
Adding `<NuxtPage>` transitions causes a noticeable white flash or blank screen flicker during navigation. Users see a flash of white background between page loads, creating a jarring experience.

**Why it happens:**
- Nuxt's default `<Transition>` wrapper doesn't coordinate with SSR hydration
- CSS transitions conflict with Nuxt's page mounting timing
- Not using `:name` prop correctly on `<NuxtPage>`
- CSS transition timing doesn't match Vue's transition hooks

**Detection:**
- Navigate between pages and observe white flash
- Chrome DevTools Network tab shows blank state during navigation
- User complaints about "glitchy" navigation
- GitHub issue [#32053](https://github.com/nuxt/nuxt/issues/32053) - active Nuxt issue as of May 2025

**Prevention:**
- Test transitions on both mobile and desktop (worse on slower devices)
- Use `mode="out-in"` to coordinate enter/leave timing
- Keep transition duration short (200-300ms max)
- Consider using View Transitions API (Nuxt 3.4+) instead of CSS transitions
- Always test with production build, not dev mode

**Implementation guidance:**
```vue
<!-- app.vue -->
<template>
  <NuxtPage>
    <template #default="{ page, Component }">
      <Transition
        name="page"
        mode="out-in"
        @before-enter="handleBeforeEnter"
      >
        <component :is="Component" :key="page.path" />
      </Transition>
    </template>
  </NuxtPage>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
```

**Performance considerations:**
- Transitions add ~50-100ms to perceived navigation time
- Test Lighthouse Navigation Timing metrics
- Disable transitions on slow connections using `prefers-reduced-motion`

**Phase to address:**
Page Transitions Phase — implement and test on real devices before merge

---

### Pitfall 2: Animations Regressing Lighthouse Performance Scores

**What goes wrong:**
Adding smooth animations and transitions causes Lighthouse Performance score to drop from 90+ to 70-80 range. TBT (Total Blocking Time) increases, animations block the main thread.

**Why it happens:**
- Using JavaScript animation libraries (GSAP, anime.js) instead of CSS
- Animating properties that trigger layout reflows (width, height, top, left)
- Running animations during initial page hydration
- Too many concurrent animations
- Not respecting `prefers-reduced-motion`

**Detection:**
- Lighthouse Performance score drops >10 points after adding animations
- Chrome DevTools Performance panel shows long animation frames
- Frame rate drops below 50 FPS during animations
- Lighthouse flags "Reduce JavaScript execution time"

**Prevention:**
- **Use CSS animations** for simple transitions (fade, slide, scale)
- **Only animate `transform` and `opacity`** — these are GPU-accelerated
- **Test with Lighthouse after each animation** addition
- **Respect `prefers-reduced-motion`** (see Pitfall 5)
- **Keep animation duration under 300ms** for UI elements

**Good vs. Bad properties:**
```css
/* BAD — Triggers layout reflow */
.element {
  transition: width 0.3s, height 0.3s, top 0.3s, left 0.3s;
}

/* GOOD — GPU-accelerated */
.element {
  transition: transform 0.3s, opacity 0.3s;
  will-change: transform, opacity;
}
```

**Animation library choices:**
- **Best:** CSS-only transitions (zero JS overhead)
- **Good:** VueUse Motion (<20KB, SSR-friendly)
- **Avoid:** GSAP, anime.js for simple transitions (heavy, can block main thread)

**Phase to address:**
Animation Performance Phase — benchmark before/after each animation with Lighthouse

---

### Pitfall 3: Scroll Position Breaking with Page Transitions

**What goes wrong:**
After adding page transitions, navigating back to a page doesn't restore scroll position. User lands at top of page even if they scrolled down previously.

**Why it happens:**
- Page transitions reset scroll position
- `scrollBehavior` in router config conflicts with transitions
- Not using `:key` prop correctly on `<NuxtPage>`
- Transition cleanup happens before scroll restoration

**Detection:**
- Navigate to long page, scroll down, click link, click back — you're at top
- GitHub issue [#28988](https://github.com/nuxt/nuxt/issues/28988) — active Nuxt issue
- Users complain about losing their place when navigating

**Prevention:**
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  router: {
    options: {
      scrollBehaviorType: 'smooth',
      // Built-in scroll position restoration
    }
  },
  // Page transitions require explicit key handling
  app: {
    pageTransition: {
      name: 'page',
      mode: 'out-in'
    }
  }
})
```

```vue
<!-- app.vue -->
<template>
  <NuxtPage :key="route.path" />
</template>
```

**Testing:**
- Test on multiple pages with varying content heights
- Verify both forward and back navigation preserve scroll
- Test on mobile (scroll behavior differs)

**Phase to address:**
Page Transitions Phase — test scroll restoration explicitly

---

### Pitfall 4: Accessibility Improvements Breaking Existing Features

**What goes wrong:**
Adding ARIA attributes, skip links, or keyboard navigation fixes accidentally breaks existing functionality. Dropdowns stop working, modals won't close, or form validation breaks.

**Why it happens:**
- Incorrect ARIA attribute values
- `tabindex` changes focus order unexpectedly
- Skip links interfere with client-side routing
- Keyboard event handlers conflict with existing interactions
- Not testing with actual screen readers or keyboard

**Detection:**
- Features that worked before stop working after accessibility changes
- Screen reader announces incorrect information
- Keyboard navigation gets "stuck" in certain elements
- axe DevTools or Lighthouse shows new ARIA errors

**Prevention:**
- **Test with keyboard only** (unplug mouse) before and after changes
- **Test with actual screen reader** (NVDA on Windows, VoiceOver on Mac)
- **Use Vue's official accessibility patterns** from documentation
- **Don't add ARIA if semantic HTML works**
- **Run `@nuxt/a11y` module** during development for real-time feedback

```bash
npm install -D @nuxt/a11y
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/a11y'],
  a11y: {
    // Highlights accessibility issues in DevTools
  }
})
```

**Common mistakes to avoid:**
- Don't use `role="button"` on `<button>` (redundant)
- Don't add `aria-label` if visible label exists (unless clarifying)
- Don't set `tabindex="-1"` on interactive elements
- Don't forget `aria-expanded` on dropdowns/toggles
- Don't use `placeholder` as label (see Pitfall 7)

**Phase to address:**
Accessibility Phase — test with keyboard and screen reader before committing

---

### Pitfall 5: Ignoring `prefers-reduced-motion` (Accessibility + Performance)

**What goes wrong:**
Users with motion sensitivity (vestibular disorders) experience nausea, dizziness, or distraction when animations cannot be disabled. Accessibility score suffers, and some users abandon the site.

**Why it happens:**
- Developers forget to respect OS-level motion preferences
- Animations hardcoded without media query check
- JavaScript animation libraries don't auto-detect preference
- Not tested with "Reduce motion" OS setting enabled

**Detection:**
- Enable "Reduce motion" in OS settings and see if animations still play
- Lighthouse accessibility check warns about motion
- User complaints about motion sickness
- axe DevTools flags animating elements without reduced motion support

**Prevention:**
```css
/* Global reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Or disable specific animations */
@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active {
    transition: none;
  }
}
```

```javascript
// For JavaScript animations (VueUse Motion, GSAP, etc.)
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (!prefersReducedMotion) {
  // Only run animations if user hasn't requested reduced motion
  animateElement()
}
```

**Testing:**
- **macOS:** System Preferences → Accessibility → Display → Reduce motion
- **Windows:** Settings → Ease of Access → Display → Show animations
- **iOS:** Settings → Accessibility → Motion → Reduce Motion
- **Android:** Settings → Accessibility → Remove animations

**Why this matters for performance:**
- Users on slow devices often enable reduced motion
- Respecting preference improves perceived performance
- Reduces CPU/GPU usage for users who don't want animations

**Sources:**
- [web.dev - prefers-reduced-motion](https://web.dev/articles/prefers-reduced-motion) — HIGH confidence, official
- [MDN - prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) — HIGH confidence

**Phase to address:**
Animation Implementation Phase — add reduced motion support with every animation

---

### Pitfall 6: Focus Management Breaking with Route Changes

**What goes wrong:**
After navigating to a new page, keyboard focus isn't managed properly. Screen reader users land in the middle of content, or focus stays on a link from the previous page.

**Why it happens:**
- Not implementing skip links (see Vue.js accessibility guide)
- Focus not reset to top of page after route change
- Not announcing route changes to screen readers
- Modal/dialog focus trap interferes with navigation

**Detection:**
- Navigate with keyboard — focus doesn't move to new page content
- Screen reader doesn't announce page title after navigation
- "Skip to main content" link missing or non-functional
- Lighthouse accessibility check flags focus management

**Prevention:**
```vue
<!-- app.vue -->
<template>
  <div>
    <!-- Skip link (hidden until focused) -->
    <a href="#main" class="skip-link">Skip to main content</a>

    <span ref="backToTop" tabindex="-1" />

    <main id="main">
      <NuxtPage :key="route.path" />
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const backToTop = ref()

// Reset focus to top on route change
watch(
  () => route.path,
  () => {
    backToTop.value?.focus()
  }
)
</script>

<style>
.skip-link {
  /* Hidden visually but available to screen readers */
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
</style>
```

**Sources:**
- [Vue.js Accessibility Guide - Skip Links](https://vuejs.org/guide/best-practices/accessibility#skip-link) — HIGH confidence, official

**Phase to address:**
Accessibility Phase — implement skip links and focus management

---

### Pitfall 7: Form Accessibility Mistakes (Contact/Inquiry Forms)

**What goes wrong:**
Adding form validation or UI enhancements breaks accessibility. Forms unusable with screen readers or keyboard. Placeholder text used as labels (classic mistake).

**Why it happens:**
- Using `placeholder` instead of `<label>` elements
- Not associating labels with inputs via `for` and `id`
- Missing error announcement for screen readers
- Visual-only error indicators (red borders) without `aria-invalid`
- Required fields not marked programmatically

**Detection:**
- Screen reader can't determine what to enter in a field
- Tabbing through form skips required field indicators
- Error messages only visible (not announced)
- Lighthouse accessibility check flags form issues
- axe DevTools shows "Labels must be associated with form controls"

**Prevention:**
```vue
<!-- BAD - Placeholder as label -->
<template>
  <input
    type="text"
    placeholder="Enter your name"
    v-model="form.name"
  />
</template>

<!-- GOOD - Explicit label -->
<template>
  <label for="name">Full Name *</label>
  <input
    id="name"
    type="text"
    v-model="form.name"
    required
    aria-required="true"
    :aria-invalid="errors.name ? 'true' : 'false'"
    :aria-describedby="errors.name ? 'name-error' : undefined"
  />
  <span
    v-if="errors.name"
    id="name-error"
    role="alert"
    aria-live="assertive"
  >
    {{ errors.name }}
  </span>
</template>
```

**Key principles:**
- **Always use `<label>` elements**, never placeholders as labels
- **Match `for` and `id`** attributes
- **Use `aria-required="true"`** for required fields
- **Use `aria-invalid`** with `aria-describedby` for errors
- **Use `role="alert"`** and `aria-live="assertive"`** for error announcements
- **Group related fields** with `<fieldset>` and `<legend>`

**Sources:**
- [Vue.js Accessibility - Semantic Forms](https://vuejs.org/guide/best-practices/accessibility#semantic-forms) — HIGH confidence, official

**Phase to address:**
Contact Form Phase — audit form accessibility with keyboard and screen reader

---

### Pitfall 8: Color Contrast Issues with New Design Elements

**What goes wrong:**
Adding new UI elements (buttons, badges, alerts) with colors that don't meet WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text).

**Why it happens:**
- Design-focused decisions without accessibility testing
- Using brand colors that aren't accessible for text
- Gray text on light backgrounds (common mistake)
- Not testing contrast ratios before implementation

**Detection:**
- Lighthouse accessibility check flags low contrast
- axe DevTools highlights contrast failures
- WebAIM Contrast Checker shows ratios below 4.5:1
- Users struggle to read text on certain backgrounds

**Prevention:**
- **Test all color combinations** with [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- **Use axe DevTools** during development
- **Document color palette** with contrast ratios
- **Test with color blindness simulators**

**Common VP Associates site issues to avoid:**
- Gray placeholder text on white backgrounds
- Light blue links on light gray backgrounds
- White text on brand blue (may not meet 4.5:1)
- Form error messages in low-contrast red

**Quick fix for existing low contrast:**
```css
/* Instead of reducing opacity for disabled text */
.button:disabled {
  opacity: 0.5; /* BAD - reduces contrast */
}

/* Use darker color that meets contrast ratio */
.button:disabled {
  color: #666; /* GOOD - maintains contrast */
  cursor: not-allowed;
}
```

**Phase to address:**
Design Polish Phase — run axe DevTools contrast audit on all new UI elements

---

### Pitfall 9: Breaking Existing Interactive Components with Transitions

**What goes wrong:**
Adding page or layout transitions breaks existing interactive components. Carousels stop auto-playing, modals won't open, or dropdowns get stuck.

**Why it happens:**
- Transitions conflict with component mounting/unmounting
- `v-if` + `<Transition>` timing issues
- Component lifecycle hooks fire during transition
- Event listeners not cleaned up before transition

**Detection:**
- Features work without transitions, break with transitions
- Console errors during navigation
- Components in "stuck" states (open but unusable, or vice versa)
- GSAP or animation timing conflicts with Vue transitions

**Prevention:**
- **Test all interactive components** with transitions enabled
- **Use `@after-leave` hook** to cleanup before unmount
- **Don't nest transitions** (page + component transitions conflict)
- **Keep transitions simple** (fade is safest)

```vue
<!-- Good - simple fade transition -->
<Transition name="fade" mode="out-in">
  <component :is="current" :key="route.path" />
</Transition>

<!-- Risky - complex transform transitions -->
<Transition name="slide-left">
  <component :is="current" />
</Transition>
```

**Testing checklist:**
- [ ] HeroSlider still auto-plays after navigation
- [ ] ProjectGallery modal opens/closes correctly
- [ ] ProjectsCarousel touch handlers still work
- [ ] Contact form validation works after navigation
- [ ] Mobile menu opens/closes without issues

**Phase to address:**
Integration Testing Phase — test all existing features with transitions enabled

---

### Pitfall 10: Bundle Size Increase from Animation Libraries

**What goes wrong:**
Adding animation libraries (GSAP, anime.js, Motion One) increases JavaScript bundle by 100-300KB, undoing v1.1 performance optimizations.

**Why it happens:**
- Importing full library instead of tree-shakeable modules
- Using heavy libraries for simple transitions
- Not measuring bundle impact before adding
- Multiple animation libraries for different purposes

**Detection:**
- `npx nuxi analyze` shows new large chunk
- Lighthouse "Reduce unused JavaScript" score drops
- Initial JS download increases by >100KB
- Bundle visualizer shows animation library as large block

**Prevention:**
```typescript
// BAD - Full GSAP (300KB+)
import { gsap } from 'gsap'

// GOOD - CSS-only (0KB)
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

// GOOD - VueUse Motion (<20KB, tree-shakeable)
import { useMotion } from '@vueuse/motion'
```

**Bundle size comparison:**
- **CSS transitions:** 0KB
- **VueUse Motion:** ~20KB (tree-shakeable)
- **Motion One:** ~10KB (tree-shakeable)
- **GSAP:** ~300KB (not tree-shakeable)
- **anime.js:** ~50KB

**Recommendation:**
Start with CSS transitions. Only use JavaScript libraries if you need complex sequencing, physics, or scroll-triggered animations. Always verify bundle impact with `npx nuxi analyze`.

**Phase to address:**
Performance Verification Phase — run bundle analysis after adding animations

---

## Moderate Pitfalls

### Pitfall 11: Focus Traps Not Implemented for Modals

**What goes wrong:**
Adding modal dialogs without focus traps means keyboard users can tab out of the modal, making it impossible to interact with.

**How to avoid:**
- Use `@nuxt/a11y` module which provides focus trap utilities
- Implement `FocusTrap` component or use library like `vue-focus-lock`
- Return focus to trigger element when modal closes

**Phase to address:** Modal/Dialog Phase

---

### Pitfall 12: Missing Keyboard Navigation for Carousels

**What goes wrong:**
Carousels (HeroSlider, ProjectsCarousel) only work with mouse/touch, leaving keyboard users unable to navigate.

**How to avoid:**
```vue
<button
  aria-label="Previous slide"
  @click="previousSlide"
  @keydown.left="previousSlide"
>
  Previous
</button>
```

**Phase to address:** Carousel Accessibility Phase

---

### Pitfall 13: Not Announcing Dynamic Content Changes

**What goes wrong:**
Content updates (form validation, search results, carousel changes) aren't announced to screen readers.

**How to avoid:**
```vue
<template>
  <div
    role="status"
    aria-live="polite"
    aria-atomic="true"
  >
    {{ statusMessage }}
  </div>
</template>
```

**Phase to address:** Dynamic Content Phase

---

### Pitfall 14: Over-Engineering Simple Animations

**What goes wrong:**
Using complex JavaScript animation libraries for simple hover effects or state transitions. Over-engineering leads to maintenance burden and bundle bloat.

**How to avoid:**
- Use CSS transitions for simple state changes (hover, focus, active)
- Reserve JS animations for complex sequences or scroll-triggered effects
- Follow the "rule of least power": use the simplest technology that works

**Phase to address:** Animation Review Phase

---

### Pitfall 15: Lighthouse CI Not Catching Performance Regressions

**What goes wrong:**
After adding animations/transitions, Lighthouse scores drop but CI doesn't catch it. Regression reaches production.

**How to avoid:**
- Configure Lighthouse CI with budget assertions
- Set minimum score thresholds (e.g., Performance > 85)
- Block PRs that fail budget checks
- Use `unlighthouse` for site-wide monitoring

```typescript
// nuxt.config.ts
unlighthouse: {
  budget: {
    scores: {
      performance: 85, // Fail if drops below 85
      accessibility: 90
    }
  }
}
```

**Phase to address:** CI/CD Setup Phase

---

## Performance Regression Prevention Matrix

| Feature Added | Potential Regression | Detection Method | Prevention |
|--------------|---------------------|------------------|------------|
| Page transitions | LCP +300ms, white flash | Lighthouse, manual navigation testing | Keep transitions <300ms, test on mobile |
| CSS animations | TBT +200ms if poorly implemented | Lighthouse TBT score | Only animate transform/opacity |
| JS animation libraries | Bundle +100KB | `nuxi analyze` bundle size | Prefer CSS, measure before adding |
| Skip links | None (positive) | Manual keyboard testing | Test with Tab key |
| Form labels | None (positive) | axe DevTools, Lighthouse | Use `<label>` + `for`/`id` |
| Focus management | None if correct | Keyboard navigation | Test with screen reader |
| `prefers-reduced-motion` | None (positive) | OS setting + manual test | Add media query to all animations |
| ARIA attributes | Can break features if wrong | Manual testing, screen reader | Verify with actual AT, not just lint |

---

## "Accessibility Theater" Checklist

Accessibility improvements that **look good but don't actually help**:

- [ ] **Adding `role="button"` to `<button>`** — Redundant, semantic HTML already handles this
- [ ] **Adding `aria-label` to everything** — Can confuse screen readers if visible label exists
- [ ] **Color-only error indicators** — Red borders aren't announced, use `aria-invalid`
- [ ] **`tabindex` on everything** — Breaks natural tab order, only use if necessary
- [ ] **`aria-hidden="true"` on focusable elements** — Makes content inaccessible to keyboard
- [ ] **Placeholder as label** — Disappears when typing, use proper `<label>`
- [ ] **"Click here" link text** — Not descriptive, use context like "Download report"

**Real accessibility improvements:**
- Semantic HTML (`<nav>`, `<main>`, `<article>`, `<section>`)
- Proper heading hierarchy (don't skip levels)
- Explicit labels for form inputs
- Skip links for keyboard users
- Focus management after route changes
- `prefers-reduced-motion` support
- Color contrast meeting WCAG AA
- Error messages announced with `role="alert"`

---

## Phase-to-Pitfall Mapping

| Phase | Pitfalls Addressed | Success Criteria |
|-------|-------------------|------------------|
| Page Transitions | 1, 3, 9 | No white flash, scroll preserved, carousels work |
| Animations | 2, 5, 10, 14 | Lighthouse Performance >85, reduced motion respected |
| Accessibility Audit | 4, 6, 7, 8, 11, 12, 13 | Lighthouse A11y >90, keyboard navigation works |
| Form Enhancements | 7, 8 | All forms have proper labels, error announcements |
| Performance Verification | 2, 10, 15 | Bundle size unchanged, Lighthouse scores maintained |
| Integration Testing | 1, 3, 9 | All existing features work with new polish |

---

## Testing Checklist for Refinement Features

### Before Merge (Run for each PR)

**Performance:**
- [ ] Lighthouse Performance score ≥ 85 (mobile, 4G throttled)
- [ ] Lighthouse TBT < 200ms
- [ ] Bundle size not increased >50KB (check with `npx nuxi analyze`)
- [ ] No long tasks (>50ms) during animations (Chrome DevTools Performance)

**Accessibility:**
- [ ] Lighthouse Accessibility score ≥ 90
- [ ] axe DevTools: No violations (or only minor)
- [ ] Full keyboard navigation test (unplug mouse, complete a user journey)
- [ ] Screen reader test (NVDA/VoiceOver): Navigate to page, use component, leave page)
- [ ] Color contrast: All text ≥ 4.5:1, large text ≥ 3:1

**Functional:**
- [ ] All carousels auto-play and respond to touch/keyboard
- [ ] Page transitions don't break existing features
- [ ] Scroll position preserved on back navigation
- [ ] Modals/dropdowns work with keyboard (Escape to close, focus trap)
- [ ] Forms show errors that screen readers announce

**Cross-browser:**
- [ ] Test on Chrome, Firefox, Safari (desktop)
- [ ] Test on Chrome Mobile, Safari Mobile
- [ ] Test with "Reduce motion" OS setting enabled

---

## Quick Wins (High Impact, Low Risk)

These refinement features provide significant UX improvements with minimal risk:

### 1. Add Skip Link (+10 accessibility, 0 risk)
```vue
<!-- app.vue -->
<a href="#main" class="skip-link">Skip to main content</a>
```

### 2. Add `prefers-reduced-motion` (+5 performance for affected users, 0 risk)
```css
@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; }
}
```

### 3. Improve Form Labels (+15 accessibility, 0 risk)
```vue
<label for="email">Email *</label>
<input id="email" type="email" required aria-required="true" />
```

### 4. Add Focus Management (+10 accessibility, low risk)
```typescript
watch(() => route.path, () => {
  backToTop.value?.focus()
})
```

### 5. Fix Color Contrast (+5-15 accessibility, low risk)
- Run axe DevTools, fix any contrast issues found

---

## Sources

### Official Documentation (HIGH confidence)
- [Vue.js Accessibility Guide](https://vuejs.org/guide/best-practices/accessibility) — Semantic HTML, skip links, focus management, forms
- [Nuxt Performance Best Practices](https://nuxt.com/docs/3.x/guide/best-practices/performance) — Performance features, lazy loading, profiling
- [Nuxt Transitions Documentation](https://nuxt.com/docs/3.x/api/components/nuxt-page) — Official transition patterns

### Web.dev / MDN (HIGH confidence)
- [web.dev - prefers-reduced-motion](https://web.dev/articles/prefers-reduced-motion) — Motion accessibility implementation
- [MDN - prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) — Media query reference
- [MDN - CSS vs JS Animation Performance](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/CSS_JavaScript_animation_performance) — Performance comparison

### Nuxt Issues (MEDIUM confidence - real-world problems)
- [Page Transition White Flash #32053](https://github.com/nuxt/nuxt/issues/32053) — Active issue as of May 2025
- [Layout Transition Scroll Position #28988](https://github.com/nuxt/nuxt/issues/28988) — Scroll restoration problems
- [Nuxt Content Performance #2100](https://github.com/nuxt/content/issues/2100) — Transition performance issues

### Community Articles (MEDIUM confidence)
- [Best Practices for Accessibility in Vue/Nuxt](https://dev.to/jacobandrewsky/best-practices-for-accessibility-in-vue-nuxt-1cga) — Vue/Nuxt a11y patterns
- [How We Achieve 90+ Lighthouse Performance](https://dev.to/jacobandrewsky/performance-checklist-for-vue-and-nuxt-cog) — Performance checklist
- [VueUse Motion Guide](https://github.com/vueuse/motion) — Animation library docs

### Accessibility Resources (HIGH confidence)
- [WebAIM WCAG Compliance](https://webaim.org/projects/million/) — 2025 accessibility stats
- [WAVE Browser Extension](https://wave.webaim.org/) — Accessibility testing tool
- [axe DevTools](https://www.deque.com/axe/devtools/) — Browser accessibility testing

### Animation Performance (MEDIUM confidence)
- [Web.dev Animations Guide](https://web.dev/articles/animations-guide) — High-performance animation patterns
- [Motion Design and Accessibility](https://blog.pixelfreestudio.com/motion-design-and-accessibility-how-to-balance-both/) — Balancing UX and a11y

---

## Open Questions (Requiring Phase-Specific Research)

- **Page transition library:** Should we use Nuxt's built-in transitions, or a library like `nuxt-page-transitions`? (Research needed in Page Transitions Phase)
- **Animation system:** CSS-only vs. VueUse Motion vs. custom? (Research needed in Animation Phase)
- **Screen reader testing:** Which screen readers to prioritize? (NVDA Windows, VoiceOver Mac, TalkBack Android — all three or subset?)
- **Performance budget:** What's the acceptable bundle size increase for animations? (Establish baseline first)

---

*Pitfalls research for: VP Associates Website v1.2 Refinement*
*Researched: 2026-02-07*
*Focus: Adding polish/UX features without undoing v1.1 performance work*
