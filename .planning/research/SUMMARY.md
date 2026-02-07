# v1.2 Refinement Research Summary

**Date:** 2026-02-07
**Confidence:** HIGH
**Milestone:** v1.2 Refinement - UX Polish, Page Transitions, Micro-interactions, Accessibility

---

## Executive Summary

The v1.2 Refinement Milestone focuses on **polishing an existing high-performing Nuxt 3 website** with page transitions, micro-interactions, and accessibility improvements. Key finding: The existing codebase is **well-architected for refinement** with minimal restructuring needed. Only **2 new packages** are recommended (1 runtime, 1 dev dependency), keeping the total bundle impact under 20KB.

**Critical insight:** The biggest risk in refinement work is **undoing v1.1 performance optimizations** with well-intentioned but poorly implemented UX enhancements. The research emphasizes a **"CSS-first, progressive enhancement" approach**: use built-in Nuxt/Vue capabilities before adding libraries, respect `prefers-reduced-motion`, and maintain 90+ Lighthouse Performance scores.

**Professional services UX context:** This is a structural engineering firm website, not a consumer app. UX should emphasize **trust and competence over flashiness**. Animations must be subtle (150-300ms), accessibility is non-negotiable (WCAG 2.1 AA), and performance cannot be compromised.

---

## Stack Additions

### Recommended Packages (2 total)

| Package | Version | Type | Purpose | Bundle Impact |
|---------|---------|------|---------|---------------|
| **@formkit/auto-animate** | ^0.9.0 | Runtime | Layout animations (list filtering, reordering) | ~15KB |
| **@nuxtjs/a11y** | ^2.1.0 | Dev dependency | Automated accessibility testing (axe-core) | 0KB (dev-only) |

### Leveraging Existing Stack

**No new packages needed for:**
- **Page transitions** — Nuxt 3 built-in transitions already configured in `nuxt.config.ts`
- **Micro-interactions** — Tailwind CSS 6.12 hover/focus/active states already available
- **Scroll animations** — `@vueuse/nuxt@12.0.1` already installed with `useIntersectionObserver`
- **Focus management** — VueUse provides `useFocusTrap`, `useKeyboard` (already installed)
- **Image optimization** — `@nuxt/image` already handles hero dimensions with `fit="cover"`

### Installation

```bash
# Page transitions & layout animations
npm install @formkit/auto-animate

# Accessibility testing (dev-only)
npm install -D @nuxtjs/a11y
```

### Configuration Changes

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    // ... existing modules
    '@formkit/auto-animate',
    '@nuxtjs/a11y',
  ],
  a11y: {
    dev: true,
    inspect: true,
    global: {
      respectPrefersReducedMotion: true,
    },
  },
})
```

---

## Key Features

### Table Stakes (Must-Have for v1.2)

**Page Transitions:**
- Smooth page transitions using Nuxt built-ins (150-300ms cross-fade)
- `prefers-reduced-motion` support (disable animations when OS setting enabled)
- Layout transitions for smooth navigation
- Route change announcements for screen readers

**Micro-interactions:**
- Button hover states (color + subtle transform, 150-200ms)
- Link hover states (underline or color shift)
- Card hover effects (subtle lift on ProjectCard/ServiceCard)
- Form validation feedback (real-time visual + ARIA)
- Loading states (skeleton screens for async content)
- Focus indicators (high contrast focus rings, 2px minimum)

**Accessibility (WCAG 2.1 AA):**
- Skip links ("Skip to main content")
- ARIA labels on all interactive elements
- Full keyboard navigation (Tab, Enter, Escape, Arrow keys)
- Color contrast audit (4.5:1 for text, 3:1 for large text)
- Alt text audit (meaningful descriptions)
- Focus management (logical tab order, focus returns after modal closes)
- Semantic HTML (proper headings, landmarks)

**Visual Consistency:**
- Spacing design tokens (consistent spacing scale)
- Typography system (heading hierarchy)
- Button variants (primary, secondary, ghost)
- Form styling (consistent inputs, labels, errors)
- Card component (unified styling)

**Known Issue Fixes:**
- Hero image dimensions (aspect ratio, prevent CLS)
- Duplicate chunks (bundle analysis, deduplication)

### Differentiators (Should-Have for Enhanced Experience)

- Scroll-triggered animations (Intersection Observer, GPU-accelerated)
- Stats counter animation (count-up when in viewport)
- Service filter animations (FLIP technique for smooth layout changes)
- Testimonial carousel interactions (smooth transitions, pause on hover)
- Project gallery micro-interactions (hover previews, subtle zoom)
- Back-to-top button with progress (shows scroll percentage)
- Breadcrumbs with micro-interactions (collapse on mobile, hover previews)

### Anti-Features (Explicitly NOT Build)

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **GSAP/heavy animation libraries** | 100KB+ bundle, performance regression | CSS transitions, Vue built-ins |
| **Full page overhaul transitions** | Disorienting, blocks interaction | Subtle cross-fade (300ms max) |
| **Parallax scrolling** | Performance killer, CLS issues | Static backgrounds with subtle depth |
| **Auto-playing carousels** | WCAG violation, motion sensitivity | Manual controls with pause |
| **Popups/modals on entry** | Annoying, blocks content, SEO penalty | Inline call-to-actions |
| **Infinite scroll** | Performance issues, no footer access | Pagination with "Load More" button |
| **Motion without reduced-motion check** | Vestibular disorders, motion sickness | Always check media query |
| **Color-only state indicators** | Color blindness accessibility issue | Icons + color + text labels |
| **Placeholder-only form labels** | Accessibility failure, poor UX | Explicit visible labels |
| **Splash screens** | Blocks content, delays engagement | Fast loading, skeleton states |

---

## Architecture Approach

### Minimal Disruption Strategy

The existing Nuxt 3 architecture requires **no structural changes** for refinement features. Enhancements should be implemented as **layered additions**:

1. **Enhance existing CSS transitions** in `main.css` (no component changes)
2. **Add composables** (`useA11y.ts`, `useMicroInteractions.ts`) for shared logic
3. **Update components incrementally** with new utility classes
4. **Add Tailwind utilities** for consistent patterns

### Recommended Architecture Patterns

**Pattern 1: Composable-First Logic**

```typescript
// composables/useA11y.ts (NEW)
export function useA11y() {
  const announce = (message: string, priority = 'polite') => {
    // Screen reader announcement
  }

  const trapFocus = (container: HTMLElement) => {
    // Modal focus management
  }

  const prefersReducedMotion = computed(() => {
    if (import.meta.client) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
    return false
  }

  return { announce, trapFocus, prefersReducedMotion }
}
```

**Pattern 2: Utility-First Styling**

```vue
<!-- Use Tailwind utilities, avoid scoped <style> -->
<button class="press-scale hover-lift focus-ring">
  Click me
</button>
```

**Pattern 3: Progressive Enhancement**

```css
/* Base: No animation */
.button { transition: none; }

/* Enhanced: With animation (if user prefers) */
@media (prefers-reduced-motion: no-preference) {
  .button { transition: transform 0.2s; }
}
```

### Integration Points

**Existing components requiring enhancement:**
- **AppHeader** — Add micro-interaction to logo hover, enhance menu transition
- **ProjectCard** — Add `press-scale` utility, refine animation timing
- **ServiceCard** — Same as ProjectCard
- **TeamMember** — Add hover lift, focus ring
- **Forms** — Proper labels, error announcements, keyboard navigation

**New components needed:**
- **TransitionWrapper.vue** — Reusable page transition with directional logic (optional)
- **FocusTrap.vue** — Modal/dialog focus management utility
- **KeyboardNav.vue** — Roving tabindex pattern for lists/grids

**Components NOT requiring changes:**
- **AppFooter** — Static content, adequate spacing
- **ClientLogos** — Non-interactive, sufficient
- **StatCounter** — Already has animation (likely)

---

## Pitfalls to Avoid

### Top 5 Critical Pitfalls

**1. Page Transitions Causing White Flash/Blank Screen**

*What goes wrong:* Adding `<NuxtPage>` transitions causes noticeable white flash during navigation.

*Prevention:*
- Use `mode="out-in"` to coordinate enter/leave timing
- Keep transition duration short (200-300ms max)
- Test on mobile (worse on slower devices)
- Always test with production build, not dev mode

**2. Animations Regressing Lighthouse Performance Scores**

*What goes wrong:* Adding animations causes Lighthouse Performance to drop from 90+ to 70-80.

*Prevention:*
- **Only animate `transform` and `opacity`** (GPU-accelerated)
- Avoid animating layout-triggering properties (width, height, top, left)
- Test with Lighthouse after each animation addition
- Keep animation duration under 300ms

**3. Scroll Position Breaking with Page Transitions**

*What goes wrong:* Navigating back to a page doesn't restore scroll position (user at top instead of where they scrolled).

*Prevention:*
```typescript
// nuxt.config.ts
router: {
  options: {
    scrollBehaviorType: 'smooth',
  }
}
```

**4. Accessibility Improvements Breaking Existing Features**

*What goes wrong:* Adding ARIA attributes or keyboard navigation accidentally breaks dropdowns/modals/forms.

*Prevention:*
- Test with keyboard only (unplug mouse) before and after changes
- Test with actual screen reader (NVDA on Windows, VoiceOver on Mac)
- Don't add ARIA if semantic HTML works
- Use `@nuxt/a11y` module for real-time feedback

**5. Ignoring `prefers-reduced-motion`**

*What goes wrong:* Users with motion sensitivity experience nausea/dizziness from animations.

*Prevention:*
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Performance Regression Prevention

| Feature Added | Potential Regression | Detection Method |
|--------------|---------------------|------------------|
| Page transitions | LCP +300ms, white flash | Lighthouse, manual navigation testing |
| CSS animations | TBT +200ms if poorly implemented | Lighthouse TBT score |
| JS animation libraries | Bundle +100KB | `nuxi analyze` bundle size |
| ARIA attributes | Can break features if wrong | Manual testing, screen reader |

---

## Recommended Phase Structure

### Phase 1: Accessibility Foundation (8-10 hours)

**Why first:** Accessibility improvements are critical for some users but invisible to most. No performance cost, establishes patterns for other features.

**Deliverables:**
- Create `useA11y.ts` composable (2-3h)
  - `announce()`, `trapFocus()`, `prefersReducedMotion` functions
- Update existing components with a11y patterns (4-6h)
  - AppHeader: Ensure keyboard navigation works
  - ProjectCard/ServiceCard: Verify focus rings
  - Add missing ARIA labels
- Add keyboard handlers (2-3h)
  - Enter/Space for button-like elements
  - Escape for closing modals/dropdowns
  - Arrow keys for list navigation

**Success criteria:**
- [ ] Keyboard-only navigation works (unplug mouse, complete user journey)
- [ ] Screen reader testing passed (NVDA/VoiceOver)
- [ ] Lighthouse Accessibility ≥ 90
- [ ] All interactive elements labeled
- [ ] No features broken by a11y changes

**Risk:** Low (no visual changes, easy to test)

---

### Phase 2: Micro-Interactions (6-8 hours)

**Why second:** Builds on accessibility foundation (respects `prefers-reduced-motion`), immediate visual polish.

**Deliverables:**
- Create `useMicroInteractions.ts` composable (1-2h)
  - Hover, press, focus patterns
  - Reduced motion detection
- Add Tailwind utilities (1h)
  - `.hover-lift`, `.press-scale`, `.focus-ring-subtle`
  - Reduced motion media query
- Enhance existing components (4-6h)
  - ProjectCard: Add press-scale, refine hover
  - ServiceCard: Same
  - Buttons: Add press-scale globally
  - TeamMember: Add hover-lift

**Success criteria:**
- [ ] All hover states implemented
- [ ] Press animations work (scale-95)
- [ ] Focus indicators visible on all focusable elements
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Lighthouse Performance ≥ 90 (no regression)

**Risk:** Low (CSS-only, can be easily reverted)

---

### Phase 3: Page Transitions (6-8 hours)

**Why third:** Requires careful testing, more complex than micro-interactions. Builds on patterns from Phases 1-2.

**Deliverables:**
- Enhance global transition CSS (1-2h)
  - Better easing functions
  - Scroll position hooks
  - Reduced motion support
- Add per-page transitions (3-4h)
  - Home → Pages: Slide-fade
  - Projects → Project detail: Scale-fade
  - Generic: Fade
- Test scroll restoration (1-2h)
  - Verify scroll position preserved on back navigation

**Success criteria:**
- [ ] Page transitions smooth (<400ms)
- [ ] No white flash during navigation
- [ ] Scroll position preserved on back navigation
- [ ] Transitions respect `prefers-reduced-motion`
- [ ] All existing features work with transitions

**Risk:** Medium (can cause jank if not optimized)

---

### Phase 4: Visual Consistency & Known Issues (4-6 hours)

**Why fourth:** Polish phase, ties everything together visually. Fixes known issues from v1.1.

**Deliverables:**
- Add design tokens to Tailwind config (1-2h)
  - Spacing, duration, easing tokens
  - Semantic naming
- Audit components for consistency (2-3h)
  - Ensure all cards use `rounded-card`
  - Ensure all buttons use `rounded-button`
  - Check spacing scales
- Fix hero image dimensions (1h)
  - Add explicit width/height or aspect-ratio
  - Use `fit="cover"` on NuxtImg
- Fix duplicate chunks (1h)
  - Configure `manualChunks` in vite config
  - Run bundle analysis

**Success criteria:**
- [ ] Spacing follows design tokens
- [ ] Typography hierarchy consistent
- [ ] Component styling unified
- [ ] Hero images don't cause CLS
- [ ] Duplicate chunks eliminated
- [ ] No visual bugs or inconsistencies

**Risk:** Low (systematic, reversible)

---

## Research Flags

### Phases Requiring Deeper Research

**Phase 3 (Page Transitions):**
- Should we use Nuxt's built-in transitions or a library like `nuxt-page-transitions`?
- Directional transitions based on route depth — worth the complexity?

**Phase 4 (Bundle Optimization):**
- Analyze current bundle with `npx nuxi analyze` before making changes
- Determine optimal `manualChunks` strategy for vendor code

### Phases with Well-Documented Patterns (Skip Research)

**Phase 1 (Accessibility):**
- WCAG 2.1 AA requirements are well-documented
- Vue.js official accessibility guide provides clear patterns
- No research needed — implement known best practices

**Phase 2 (Micro-Interactions):**
- Tailwind CSS utilities fully documented
- CSS transition patterns are standard
- No research needed — use existing stack

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| **Stack** | HIGH | Based on official Nuxt/Vue documentation, existing codebase analysis |
| **Features** | HIGH | Professional services UX patterns well-documented, WCAG 2.1 AA clear |
| **Architecture** | HIGH | Existing codebase analyzed, composable pattern established |
| **Pitfalls** | HIGH | Based on official docs, real-world Nuxt issues, accessibility experts |

**Overall Confidence:** HIGH

**Gaps to Address:**
- Screen reader testing: Which screen readers to prioritize? (NVDA Windows, VoiceOver Mac, TalkBack Android)
- Performance budget: What's acceptable bundle size increase? (Current baseline: 90+ Lighthouse)

---

## Implementation Complexity

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
| **Total** | ~490 | **13-16h** | **12-14h** | **Low-Medium** |

**Total Estimated Time:** 25-30 hours

---

## Sources

### Stack Research
- [Nuxt Transitions Documentation](https://nuxt.com/docs/3.x/getting-started/transitions) — HIGH confidence, official
- [AutoAnimate Official Documentation](https://auto-animate.formkit.com/) — HIGH confidence, official
- [@nuxtjs/a11y GitHub Repository](https://github.com/nuxt/a11y) — HIGH confidence, official
- [VueUse useIntersectionObserver](https://vueuse.org/core/useintersectionobserver/) — HIGH confidence, official

### Feature Research
- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/) — HIGH confidence, W3C standard
- [Vue.js Accessibility Guide](https://vuejs.org/guide/best-practices/accessibility) — HIGH confidence, official
- [Micro-Interactions That Actually Improve UX](https://altersquare.io/micro-interactions-that-actually-improve-user-experience-with-examples/) — HIGH confidence, comprehensive 2025 guide
- [Tailwind CSS Hover, Focus, and Other States](https://tailwindcss.com/docs/hover-focus-and-other-states) — HIGH confidence, official

### Architecture Research
- [Nuxt 3 Page Transitions](https://nuxt.com/docs/3.x/api/composables/use-page-transition) — HIGH confidence, official
- [Vue 3 Transition Component](https://vuejs.org/guide/built-ins/transition.html) — HIGH confidence, official
- [ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/) — HIGH confidence, W3C
- [Tailwind CSS Design Tokens Pattern](https://tailwindcss.com/blog/custom-configuration-reference) — HIGH confidence, official

### Pitfalls Research
- [Page Transition White Flash #32053](https://github.com/nuxt/nuxt/issues/32053) — MEDIUM confidence, active Nuxt issue
- [web.dev - prefers-reduced-motion](https://web.dev/articles/prefers-reduced-motion) — HIGH confidence, official
- [Layout Transition Scroll Position #28988](https://github.com/nuxt/nuxt/issues/28988) — MEDIUM confidence, active Nuxt issue
- [MDN - CSS vs JS Animation Performance](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/CSS_JavaScript_animation_performance) — HIGH confidence

### Codebase Analysis (High Confidence)
- `/home/deck/Sites/vp-eng-nuxt/nuxt.config.ts` — Verified existing configuration
- `/home/deck/Sites/vp-eng-nuxt/assets/css/main.css` — Verified existing transition classes
- `/home/deck/Sites/vp-eng-nuxt/components/AppHeader.vue` — Verified existing a11y patterns
- `/home/deck/Sites/vp-eng-nuxt/components/ProjectCard.vue` — Verified existing interaction patterns
- `/home/deck/Sites/vp-eng-nuxt/composables/useScrollReveal.ts` — Verified existing composable pattern
- `/home/deck/Sites/vp-eng-nuxt/layouts/default.vue` — Verified semantic HTML structure
- `/home/deck/Sites/vp-eng-nuxt/tailwind.config.js` — Verified existing design tokens

---

*Research synthesized: 2026-02-07*
*Next step: Requirements definition → Roadmap creation*
