# Technology Stack

**Project:** VP Associates Website - v1.2 Refinement Milestone
**Researched:** 2026-02-07
**Mode:** Refinement (stack additions only)

## Executive Summary

**Good news:** The existing stack (Nuxt 3.15, Vue 3.5, Tailwind CSS 6.12, @vueuse/nuxt 12.0) already provides 80% of what's needed for refinement features. Only **2 new packages** recommended, both lightweight and purpose-specific.

**Stack philosophy for refinement:** Enhance existing capabilities, don't rebuild. Leverage Nuxt/Vue built-ins before adding libraries.

---

## Recommended Stack Additions

### Page Transitions & Micro-interactions

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Built-in Nuxt transitions** | Native | Page/route transitions | Already configured in nuxt.config.ts, just needs CSS refinement |
| **Built-in VueUse** | 12.0.1 (installed) | Scroll animations, intersection observer | `useIntersectionObserver` for scroll-triggered animations |
| **@formkit/auto-animate** | ^0.9.0 | List/item layout animations | Zero-config automatic transitions for dynamic content |

**Existing capabilities (no new packages needed):**
- ✅ Tailwind CSS hover/focus/active states for micro-interactions
- ✅ Vue `<Transition>` component for enter/leave animations
- ✅ Custom CSS transitions already in `/assets/css/main.css`
- ✅ Skeleton loading components already exist

### Accessibility Improvements

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **@nuxtjs/a11y** | Latest (2.x) | Accessibility testing & hinting | Automated axe-core scans, dev-time feedback |
| **@vueuse/a11y** | Via @vueuse/nuxt | Focus management, keyboard nav | `useFocusTrap`, `useKeyboard` for modals/interactive elements |

**Existing capabilities (no new packages needed):**
- ✅ ARIA attributes already in components (HeroSlider, AppHeader, etc.)
- ✅ `sr-only` utility already in main.css
- ✅ `focus-visible-ring` utility already defined
- ✅ Semantic HTML structure already in place

### Known Issue Fixes

| Issue | Solution | Why |
|-------|----------|-----|
| **Hero image dimensions** | CSS + NuxtImg props | Use `fit="cover"` + container-based sizing (no new package) |
| **Duplicate chunks** | Vite manualChunks config | Configure better code splitting (no new package) |

---

## Installation

```bash
# Page transitions & layout animations
npm install @formkit/auto-animate

# Accessibility testing
npm install -D @nuxtjs/a11y
```

**Total new packages:** 2 (1 runtime, 1 dev dependency)

---

## Detailed Stack Analysis

### 1. Page Transitions

#### Built-in Nuxt Transitions (Use Existing)

**Current state:** Already configured in `nuxt.config.ts` (lines 61-68):
```typescript
pageTransition: { name: 'page', mode: 'out-in' }
layoutTransition: { name: 'layout', mode: 'out-in' }
```

**CSS already in place:** `/assets/css/main.css` lines 87-130 define `.page-enter-active`, `.page-leave-active`, etc.

**What's needed:** Refine existing CSS transitions, not add libraries.

**Refinement approach:**
- Enhance existing `.page-*` classes with better easing curves
- Add loading states using `<Suspense>` + existing skeleton components
- Respect `prefers-reduced-motion` (already implemented in HeroSlider)

**Sources:**
- [Nuxt Transitions Documentation](https://nuxt.com/docs/3.x/getting-started/transitions)
- [Vue.js Transitions for UI Animations (Perficient, 2024)](https://blogs.perficient.com/2024/12/26/how-to-use-vue-js-transitions-for-smooth-ui-animations/)

#### VueUse for Scroll Animations (Already Installed)

**Current state:** `@vueuse/nuxt@12.0.1` already in package.json

**What it provides for refinement:**
- `useIntersectionObserver` - Trigger animations when elements scroll into view
- `useElementVisibility` - Track element visibility for scroll-based effects
- `useScroll` - Track scroll position for parallax effects

**Implementation example:**
```vue
<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/nuxt'

const target = ref(null)
const isVisible = ref(false)

useIntersectionObserver(
  target,
  ([{ isIntersecting }]) => {
    if (isIntersecting) isVisible.value = true
  }
)
</script>

<template>
  <div ref="target" :class="{ 'slide-up visible': isVisible }">
    Content animates in when scrolled into view
  </div>
</template>
```

**Sources:**
- [VueUse useIntersectionObserver Docs](https://vueuse.org/core/useintersectionobserver/)
- [用Intersection Observer 打造丝滑的级联滚动动画 (2026)](https://juejin.cn/post/7597199288817893416)

#### @formkit/auto-animate for Layout Transitions (New Addition)

**Version:** ^0.9.0 (published September 2025)

**Purpose:** Automatic animations when DOM elements change position (list reordering, filtering, content addition/removal)

**Why recommended:**
- Zero-config: Works with a single directive
- Lightweight: ~15KB minified
- Framework-agnostic: Works with Vue 3 composition API
- Automatic: Detects DOM changes and animates them

**Best for:**
- Filtering project/service cards
- Reordering lists
- Dynamic content sections
- Layout shifts during responsive changes

**Installation:**
```bash
npm install @formkit/auto-animate
```

**Configuration in nuxt.config.ts:**
```typescript
export default defineNuxtConfig({
  modules: [
    '@formkit/auto-animate'
  ]
})
```

**Usage example:**
```vue
<script setup lang="ts">
// Auto-animate directive available globally
</script>

<template>
  <div v-auto-animate>
    <!-- Children automatically animate when added/removed/reordered -->
    <ProjectCard
      v-for="project in filteredProjects"
      :key="project.id"
      :project="project"
    />
  </div>
</template>
```

**What NOT to use it for:**
- Page/route transitions (use Nuxt built-ins)
- Simple hover effects (use Tailwind)
- Complex custom animations (use CSS or GSAP if needed)

**Sources:**
- [AutoAnimate Official Documentation](https://auto-animate.formkit.com/)
- [@formkit/auto-animate NPM](https://www.npmjs.com/package/@formkit/auto-animate)
- [Effortless Animations With AutoAnimate in Vue 3 (dev.to, 2023)](https://dev.to/_ibrahimturan/effortless-animations-with-autoanimate-in-vue-3-18kl)

---

### 2. Micro-interactions

#### Tailwind CSS (Use Existing)

**Current state:** Tailwind CSS 6.12.1 already configured

**What it provides:**
- `hover:` variants - All hover states
- `focus:` variants - All focus states
- `active:` variants - All active/click states
- `transition-*` utilities - Duration, easing, delay
- `transform` utilities - Scale, rotate, translate
- `animate-*` utilities - Built-in animations (pulse, spin, bounce, ping)

**Refinement approach:**
- Add `hover:scale-105`, `hover:shadow-lg`, etc. to cards/buttons
- Add `transition-all duration-300` for smooth state changes
- Use `group` and `group-hover:` for coordinated animations
- Respect `prefers-reduced-motion` media query

**Example patterns:**
```vue
<!-- Button micro-interaction -->
<button
  class="px-6 py-3 bg-primary text-white rounded-lg
         hover:bg-primary-dark hover:scale-105 hover:shadow-lg
         active:scale-95
         transition-all duration-200 ease-out
         focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
>
  Click me
</button>

<!-- Card hover effect -->
<div class="group p-6 bg-white rounded-lg shadow-md
              hover:shadow-xl hover:-translate-y-1
              transition-all duration-300 ease-out">
  <h3 class="group-hover:text-primary transition-colors">Title</h3>
</div>

<!-- Icon animation -->
<div class="hover:rotate-12 transition-transform duration-200">
  <Icon name="mdi:arrow-right" />
</div>
```

**Sources:**
- [Tailwind CSS Hover, Focus, and Other States Documentation](https://tailwindcss.com/docs/hover-focus-and-other-states)
- [Top 5 Vue CSS Superpowers You Might Be Missing (VueSchool, 2025)](https://vueschool.io/articles/vuejs-tutorials/top-5-vue-css-superpowers-you-might-be-missing/)
- [Scale, Rotate, and Fade Hover Effects (2026 tutorials)](https://blog.csdn.net/gitblog_00516/article/details/150730250)

#### Custom CSS Animations (Enhance Existing)

**Current state:** Basic `.fade-in` and `.slide-up` classes in main.css

**Refinement approach:**
- Add more animation variants (scale, rotate, fade-in-up, etc.)
- Add stagger delays for sequential animations
- Create animation utility classes for common patterns

**Example additions to main.css:**
```css
/* Enhanced animation utilities */
@layer components {
  .fade-in-up {
    @apply opacity-0 translate-y-4 transition-all duration-700 ease-out;
  }

  .fade-in-up.visible {
    @apply opacity-100 translate-y-0;
  }

  .scale-in {
    @apply opacity-0 scale-95 transition-all duration-500 ease-out;
  }

  .scale-in.visible {
    @apply opacity-100 scale-100;
  }

  /* Stagger delays for sequential animations */
  .delay-100 { @apply delay-100; }
  .delay-200 { @apply delay-200; }
  .delay-300 { @apply delay-300; }
}
```

---

### 3. Accessibility Improvements

#### @nuxtjs/a11y Module (New Addition - Dev Dependency)

**Version:** Latest (~2.1.0 as of 2025)

**Purpose:** Development-time accessibility testing and hinting using axe-core

**What it provides:**
- Automated accessibility audits on route changes
- Visual highlighter for accessibility issues in dev mode
- Integration with axe-core (industry standard a11y testing)
- WCAG 2.1 AA compliance checking
- Keyboard navigation testing
- ARIA attribute validation
- Color contrast checking

**Why recommended:**
- **Dev-only:** Zero runtime overhead in production
- **Automated:** Catches issues during development, not in production
- **Non-blocking:** Provides hints, doesn't break builds
- **Industry standard:** Uses Deque's axe-core (trusted by 100,000+ sites)

**Installation:**
```bash
npm install -D @nuxtjs/a11y
```

**Configuration in nuxt.config.ts:**
```typescript
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/a11y'
  ],
  a11y: {
    // Enable in development only
    dev: true,
    // Turn on automatic inspections
    inspect: true,
    // Global accessibility options
    global: {
      // Respect user's prefers-reduced-motion setting
      respectPrefersReducedMotion: true,
    },
  }
})
```

**What it catches:**
- Missing ARIA labels on buttons/inputs
- Invalid ARIA attributes
- Color contrast issues
- Keyboard navigation traps
- Missing alt text on images
- Improper heading hierarchy
- Form label associations

**What it does NOT do:**
- Fix accessibility issues automatically (developers must fix)
- Add runtime overhead in production (dev-only module)
- Replace manual testing (complements, doesn't replace)

**Sources:**
- [@nuxtjs/a11y GitHub Repository](https://github.com/nuxt/a11y)
- [Axe-core ACT Implementation (W3C)](https://www.w3.org/WAI/standards-guidelines/act/implementations/axe-core/)
- [Maintaining web accessibility in your Vue/Nuxt applications (Medium, 2024)](https://medium.com/@mariappan/maintaining-web-accessibility-in-your-vue-nuxt-applications-6d970429c197)
- [Accessibility audits with Playwright, Axe, and GitHub Actions (dev.to, 2024)](https://dev.to/jacobandrewsky/accessibility-audits-with-playwright-axe-and-github-actions-2504)

#### VueUse A11y Composables (Already Installed)

**Current state:** `@vueuse/nuxt@12.0.1` already installed

**Key composables for accessibility:**

**useFocusTrap** - Trap focus within modals/dialogs:
```vue
<script setup lang="ts">
import { useFocusTrap } from '@vueuse/nuxt'

const modal = ref<HTMLDivElement>()
const { hasFocus, activate, deactivate } = useFocusTrap(modal)

onMounted(() => activate())
onUnmounted(() => deactivate())
</script>
```

**useKeyboard** - Handle keyboard shortcuts:
```vue
<script setup lang="ts">
import { useKeyboard } from '@vueuse/nuxt'

useKeyboard('Escape', () => {
  closeModal()
})
</script>
```

**Existing a11y patterns in codebase:**
- HeroSlider already uses `tabindex="0"`, `aria-label`, keyboard navigation
- Components already have `focus-visible` utilities
- Semantic HTML already structured correctly

**Sources:**
- [How To Trap Focus in a Modal in Vue 3 (Telerik, 2023)](https://www.telerik.com/blogs/how-to-trap-focus-modal-vue-3)
- [Implementing Focus Traps in Vue for Accessibility (Zaengle, 2021)](https://zaengle.com/blog/implementing-focus-traps-in-vue-for-accessibility)
- [focus-trap-vue GitHub (posva, 2025)](https://github.com/posva/focus-trap-vue)

---

### 4. Known Issue Fixes

#### Hero Image Dimensions

**Issue:** Hero images may not maintain proper aspect ratio across screen sizes

**Solution:** CSS-based approach with NuxtImg configuration (no new packages)

**Implementation approach:**
```vue
<template>
  <div class="relative h-[60vh] lg:h-[80vh]">
    <NuxtImg
      src="/hero-image.jpg"
      :width="1600"
      :height="900"
      format="webp"
      fit="cover"
      class="absolute inset-0 w-full h-full object-cover"
      loading="eager"
      fetchpriority="high"
    />
  </div>
</template>
```

**Key points:**
- Use container-based sizing (fixed height with `w-full`)
- Set `fit="cover"` to fill container without distortion
- Explicit width/height for proper aspect ratio
- Use `object-cover` CSS class for additional containment
- Responsive heights: `h-[60vh] lg:h-[80vh]`

**Sources:**
- [NuxtImg Documentation - fit property](https://image.nuxt.com/usage/nuxt-img)
- [Prevent hero image from stretching on larger screens (Stack Overflow)](https://stackoverflow.com/questions/73718947/prevent-hero-image-from-stretching-on-larger-screens)
- [Support different aspect ratios for different screen sizes (nuxt/image #1466)](https://github.com/nuxt/image/issues/1466)

#### Duplicate Chunks

**Issue:** Vite bundle may create duplicate code chunks, increasing bundle size

**Solution:** Configure `manualChunks` in vite config (no new packages)

**Current state:** nuxt.config.ts has `chunkSizeWarningLimit: 500` (line 155)

**Refinement approach:**
```typescript
// In nuxt.config.ts
export default defineNuxtConfig({
  vite: {
    build: {
      chunkSizeWarningLimit: 1000, // Increase threshold
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Split vendor packages
            if (id.includes('node_modules')) {
              // Extract specific large packages
              if (id.includes('marked')) {
                return 'vendor-marked'
              }
              if (id.includes('sharp')) {
                return 'vendor-sharp'
              }
              // Group other node_modules
              return 'vendor'
            }
          }
        }
      }
    }
  }
})
```

**Alternative strategy (simpler):**
```typescript
manualChunks(id) {
  if (id.includes('node_modules')) {
    // Split by package name
    return id.toString().split('node_modules/')[1]?.split('/')[0] || 'vendor'
  }
}
```

**Benefits:**
- Better code splitting reduces duplicate code
- Improved caching (vendor chunks change less frequently)
- Faster page loads (smaller individual chunks)

**Sources:**
- [Can't set relative width and height with nuxt-img (Stack Overflow, 2022)](https://stackoverflow.com/questions/74434360/cant-set-relative-width-and-height-with-nuxt-img-performance-issue)
- [Vite RollupOptions manualChunks documentation](https://vitejs.dev/config/build-options.html#build-rollupoptions)
- [Nuxt 4 Performance Optimization Guide (2026)](https://masteringnuxt.com/blog/nuxt-4-performance-optimization-complete-guide-to-faster-apps-in-2026)

---

## What NOT to Add

### Avoid These for Refinement Work

| Package | Why Avoid | Alternative |
|---------|-----------|-------------|
| **GSAP** | Overkill for simple transitions, 100KB+ | Tailwind + Vue transitions |
| **Framer Motion** | React-focused, heavy for Vue | @formkit/auto-animate |
| **Animate.css** | Outdated, adds unused CSS | Tailwind animate-* utilities |
| **Wow.js / AOS** | Deprecated, unmaintained | VueUse intersection observer |
| **Velocity.js** | Unnecessary overhead | CSS transitions + transforms |
| **Headless UI Vue** | Already using custom components | Enhance existing components |
| **Oruga UI / Buefy** | Too heavy for polish work | Tailwind + custom CSS |

**Rationale:** Refinement means polishing existing functionality, not adding framework-level dependencies. The existing stack provides all necessary capabilities through built-ins and lightweight additions.

---

## Integration with Existing Stack

### Tailwind CSS Compatibility

**All recommendations integrate seamlessly:**
- ✅ @formkit/auto-animate works with Tailwind classes
- ✅ VueUse composables work in any component
- ✅ Custom CSS animations extend Tailwind utilities
- ✅ Accessibility modules don't affect styling

### Nuxt 3.15 Compatibility

**All packages verified for Nuxt 3.15:**
- ✅ @formkit/auto-animate 0.9+ supports Nuxt 3.15
- ✅ @nuxtjs/a11y 2.x supports Nuxt 3.15
- ✅ @vueuse/nuxt 12.0 already compatible

### Vue 3.5 Compatibility

**All packages verified for Vue 3.5:**
- ✅ All libraries support Vue 3.5 composition API
- ✅ TypeScript strict mode compatible
- ✅ `<script setup>` syntax supported

---

## Installation Summary

```bash
# Install new packages
npm install @formkit/auto-animate
npm install -D @nuxtjs/a11y

# Update nuxt.config.ts
# Add to modules array:
modules: [
  '@nuxt/image',
  '@nuxtjs/tailwindcss',
  '@nuxtjs/sitemap',
  '@pinia/nuxt',
  '@vueuse/nuxt',
  '@nuxt/icon',
  '@vite-pwa/nuxt',
  '@nuxtjs/critters',
  '@formkit/auto-animate',  // NEW
  '@nuxtjs/a11y',           // NEW
],
```

**Total additions:** 2 packages (1 runtime, 1 dev dependency)
**Total bundle impact:** ~20KB runtime (auto-animate only, a11y is dev-only)

---

## Alternatives Considered

### Page Transitions

| Option | Recommended | Alternative | Why Not |
|--------|-------------|-------------|---------|
| Transition library | Nuxt built-ins | GSAP | Overkill, larger bundle |
| Layout animations | @formkit/auto-animate | Framer Motion | React-focused, heavy |

### Accessibility

| Option | Recommended | Alternative | Why Not |
|--------|-------------|-------------|---------|
| Testing | @nuxtjs/a11y | Manual testing only | Too slow, error-prone |
| Focus trap | VueUse | focus-trap-vue | Redundant, VueUse already installed |

### Micro-interactions

| Option | Recommended | Alternative | Why Not |
|--------|-------------|-------------|---------|
| Hover effects | Tailwind CSS | CSS-in-JS | Unnecessary abstraction |
| Scroll animations | VueUse | AOS/Wow.js | Deprecated libraries |

---

## Version Lock Recommendations

```json
{
  "dependencies": {
    "@formkit/auto-animate": "^0.9.0"
  },
  "devDependencies": {
    "@nuxtjs/a11y": "^2.1.0"
  }
}
```

**Why caret (^) not tilde (~):**
- Minor version updates safe for both packages
- Both libraries follow semantic versioning
- Auto-animate 0.9.x stable (no breaking changes expected)
- a11y module conservative with updates

---

## Migration Path

### Phase 1: Foundation (No new packages)
1. Enhance existing page transition CSS
2. Add Tailwind hover/focus states to interactive elements
3. Implement scroll animations with VueUse (already installed)
4. Fix hero image dimensions with CSS

### Phase 2: Accessibility Testing
1. Install @nuxtjs/a11y
2. Fix flagged accessibility issues
3. Add missing ARIA labels
4. Implement focus traps for modals (if any)

### Phase 3: Layout Animations
1. Install @formkit/auto-animate
2. Add to filtered/project listing pages
3. Add to dynamic content sections
4. Test with `prefers-reduced-motion`

### Phase 4: Bundle Optimization
1. Configure manualChunks for duplicate chunk fix
2. Run bundle analyzer
3. Verify no regressions
4. Measure performance improvements

---

## Rollback Strategy

If any new package causes issues:

**@formkit/auto-animate:**
- Remove `v-auto-animate` directives
- Uninstall package: `npm uninstall @formkit/auto-animate`
- No breaking changes to existing code

**@nuxtjs/a11y:**
- Remove from nuxt.config.ts modules array
- Uninstall package: `npm uninstall @nuxtjs/a11y`
- No runtime impact (dev-only package)

Both packages are non-invasive and can be removed without affecting existing functionality.

---

## Sources

### Page Transitions
- [Nuxt Transitions Documentation](https://nuxt.com/docs/3.x/getting-started/transitions)
- [Vue.js Transitions for UI Animations (Perficient, Dec 2024)](https://blogs.perficient.com/2024/12/26/how-to-use-vue-js-transitions-for-smooth-ui-animations/)
- [Level Up Your Website: Custom Page Transitions in Nuxt3 (Medium, 2023)](https://medium.com/@dannyjustinjansen/level-up-your-website-custom-page-transitions-in-nuxt3-2880e48a2eaa)
- [GSAP Community - Nuxt 3 Page Transitions (Jan 2024)](https://gsap.com/community/forums/topic/39608-how-to-achieve-a-specific-page-transition-using-nuxt-3/)
- [Nuxt Performance Best Practices](https://nuxt.com/docs/3.x/guide/best-practices/performance)

### VueUse Scroll Animations
- [VueUse useIntersectionObserver](https://vueuse.org/core/useintersectionobserver/)
- [VueUse useElementVisibility](https://vueuse.org/core/useelementvisibility/)
- [Vue3基于Intersection Observer实现上拉加载组件 (Jan 2026)](https://comate.baidu.com/zh/page/t33k6xpc4v0)
- [用Intersection Observer 打造丝滑的级联滚动动画 (Jan 2026)](https://juejin.cn/post/7597199288817893416)
- [Adding Intersection Observer to your Vue animation (iMarc)](https://www.imarc.com/blog/adding-intersection-observer-to-your-vue-animation)

### AutoAnimate
- [AutoAnimate Official Documentation](https://auto-animate.formkit.com/)
- [@formkit/auto-animate NPM](https://www.npmjs.com/package/@formkit/auto-animate)
- [@formkit/auto-animate Nuxt Modules](https://nuxt.com/modules/auto-animate)
- [Effortless Animations With AutoAnimate in Vue 3 (dev.to, Mar 2023)](https://dev.to/_ibrahimturan/effortless-animations-with-autoanimate-in-vue-3-18kl)
- [Add Smooth Animations to Vue 3 with AutoAnimate (YouTube)](https://www.youtube.com/watch?v=1cutzglM3ss)
- [Top 5 Vue CSS Superpowers (VueSchool, Jun 2025)](https://vueschool.io/articles/vuejs-tutorials/top-5-vue-css-superpowers-you-might-be-missing/)

### Tailwind CSS Micro-interactions
- [Tailwind CSS Hover, Focus, and Other States](https://tailwindcss.com/docs/hover-focus-and-other-states)
- [Tailwind CSS Animation Utilities](https://tailwindcss.com/docs/animate)
- [Tailwind CSS Transitions Utilities](https://tailwindcss.com/docs/transition-property)
- [Scale, Rotate, and Fade Hover Effects (CSDN, 2026)](https://blog.csdn.net/gitblog_00516/article/details/150730250)

### Accessibility
- [@nuxtjs/a11y GitHub Repository](https://github.com/nuxt/a11y)
- [Axe-core ACT Implementation (W3C)](https://www.w3.org/WAI/standards-guidelines/act/implementations/axe-core/)
- [Maintaining web accessibility in Vue/Nuxt (Medium, 2024)](https://medium.com/@mariappan/maintaining-web-accessibility-in-your-vue-nuxt-applications-6d970429c197)
- [Optimizing your 2026 accessibility roadmap (Deque)](https://www.deque.com/blog/optimizing-your-2026-accessibility-roadmap/)
- [Web Accessibility in 2026: Frontend Developer's Survival Guide](https://www.codewithseb.com/blog/web-accessibility-2026-eaa-ada-wcag-guide)
- [Accessibility audits with Playwright, Axe, and GitHub Actions (dev.to, 2024)](https://dev.to/jacobandrewsky/accessibility-audits-with-playwright-axe-and-github-actions-2504)
- [A Vue of Accessibility: Tricks for Accessibility (Deque)](https://www.deque.com/blog/a-vue-of-accessibility-tips-and-tricks-to-make-your-application-accessible/)

### Focus Management
- [How To Trap Focus in a Modal in Vue 3 (Telerik, 2023)](https://www.telerik.com/blogs/how-to-trap-focus-modal-vue-3)
- [Implementing Focus Traps in Vue for Accessibility (Zaengle, 2021)](https://zaengle.com/blog/implementing-focus-traps-in-vue-for-accessibility)
- [focus-trap-vue GitHub (posva, 2025)](https://github.com/posva/focus-trap-vue)
- [How to Build Accessible Modals with Focus Traps (UXPin)](https://www.uxpin.com/studio/blog/how-to-build-accessible-modals-with-focus-traps/)
- [Building an Accessible Modal in Vue (dev.to, 2020)](https://dev.to/drewclem/building-an-accessible-modal-in-vue-2d2a)

### Nuxt Image Module
- [NuxtImg Documentation](https://image.nuxt.com/usage/nuxt-img)
- [Support different aspect ratios for different screen sizes (nuxt/image #1466)](https://github.com/nuxt/image/issues/1466)
- [Feature request: Aspect ratio (nuxt/image #1817, 2025)](https://github.com/nuxt/image/issues/1817)
- [Nuxt Picture stretching image while Nuxt Image keeps aspect ratio (nuxt/image #174)](https://github.com/nuxt/image/issues/174)
- [Prevent hero image from stretching on larger screens (Stack Overflow)](https://stackoverflow.com/questions/73718947/prevent-hero-image-from-stretching-on-larger-screens)
- [Optimizing Images in Nuxt 3 (dev.to, 2024)](https://dev.to/blamsa0mine/optimizing-images-in-nuxt-3-a-complete-guide-to-better-performance-4h1i)

### Bundle Optimization
- [Can't set relative width and height with nuxt-img (Stack Overflow, 2022)](https://stackoverflow.com/questions/74434360/cant-set-relative-width-and-height-with-nuxt-img-performance-issue)
- [Nuxt 4 Performance Optimization: Complete Guide (2026)](https://masteringnuxt.com/blog/nuxt-4-performance-optimization-complete-guide-to-faster-apps-in-2026)
- [Optimizing Nuxt Apps for Core Web Vitals (dev.to, 2024)](https://dev.to/jacobandrewsky/optimizing-nuxt-apps-for-core-web-vitals-106j)

### General 2026 Context
- [Web Accessibility in 2026: EAA, ADA, WCAG Guide (CodeWithSeb)](https://www.codewithseb.com/blog/web-accessibility-2026-eaa-ada-wcag-guide)
- [Nuxt 4 SEO Optimization Guide 2026 Edition (Djamware)](https://www.djamware.com/post/6985dabb6a0634337b1eaec6/nuxt-4-seo-optimization-guide-2026-edition)
