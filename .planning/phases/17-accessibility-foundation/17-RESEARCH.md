# Phase 17: Accessibility Foundation - Research

**Researched:** 2026-02-07
**Domain:** WCAG 2.1 AA Accessibility in Nuxt 3/Vue 3
**Confidence:** HIGH

## Summary

This phase focuses on achieving WCAG 2.1 AA compliance for the VP Associates Nuxt 3 website. The research covered accessibility patterns specific to Vue 3 and Nuxt 3, including skip links, ARIA labels and landmarks, keyboard navigation, focus management, screen reader support (live regions), color contrast verification, and testing tools.

The standard accessibility stack for Nuxt 3/Vue 3 in 2026 includes:
- **@nuxt/a11y** - Official Nuxt module for development-time accessibility hinting with axe-core integration
- **@vueuse/core** - Provides `useFocusTrap` and `useMagicKeys` composables for focus and keyboard handling
- **axe-core** - Industry-standard accessibility testing engine (via @nuxt/a11y or standalone)
- **Playwright** (already in project) - Has built-in accessibility testing via `aria_snapshot` and role-based locators

The project already has some accessibility foundations in place (skip link in default layout, semantic HTML roles). Key implementation areas will be enhancing ARIA labels, implementing focus traps for modals, adding live regions for dynamic content, and ensuring proper keyboard navigation throughout.

**Primary recommendation:** Use @nuxt/a11y for development feedback, @vueuse's useFocusTrap for modal focus management, and leverage existing Playwright tests for accessibility assertions.

## Standard Stack

The established libraries/tools for Vue 3/Nuxt 3 accessibility:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @nuxt/a11y | latest | Development accessibility hinting and axe-core integration | Official Nuxt module, integrates with DevTools, configurable axe-core rules |
| @vueuse/core | 12.0.1 (installed) | useFocusTrap, useMagicKeys composables | Vue ecosystem standard, SSR-friendly, reactive wrappers |
| axe-core | via @nuxt/a11y | Automated accessibility testing engine | Industry standard, WCAG 2.1 AA ruleset |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| jest-axe | - | Jest matcher for automated accessibility testing | If adding unit tests for components |
| @vue-a11y/focus-trap | - | Alternative focus trap component | If not using VueUse |
| vue-axe-next | - | Vue-specific axe integration | Alternative to @nuxt/a11y |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| VueUse useFocusTrap | focus-trap-vue | VueUse is already installed and provides more composables |
| @nuxt/a11y | Manual axe-core setup | @nuxt/a11y provides DevTools integration and Nuxt-specific configuration |
| Playwright a11y testing | Deque Axe (browser extension) | Playwright integrates into CI/CD, extension is manual only |

**Installation:**
```bash
npm install -D @nuxt/a11y
# @vueuse/nuxt is already installed
```

## Architecture Patterns

### Recommended Project Structure

The accessibility enhancements should be organized as:

```
composables/
├── useA11y.ts           # Custom accessibility composable (live regions, announcements)
├── useFocusManager.ts   # Focus restoration for modals, route changes

components/
├── AccessibleModal.vue  # Base modal component with focus trap
├── AccessibleDialog.vue # Base dialog component

tests-e2e/
├── accessibility.spec.ts # Dedicated accessibility test suite
```

### Pattern 1: Skip Links Implementation

**What:** "Skip to main content" link at the top of the page for keyboard users

**When to use:** All pages - should be in the root layout component

**Note:** The project already has a skip link in `layouts/default.vue` (lines 9-14). It uses Tailwind's `sr-only` utility to hide visually but show on focus.

**Current implementation:**
```vue
<a
  href="#main-content"
  class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:font-semibold"
>
  Skip to main content
</a>

<main id="main-content" tabindex="-1" role="main">
  <slot />
</main>
```

**Source:** Project file `/layouts/default.vue` - already implements skip link correctly

### Pattern 2: Focus Trap with VueUse useFocusTrap

**What:** Trap keyboard focus within a modal/dialog when open

**When to use:** Modals, dialogs, dropdowns, or any overlay that should confine focus

**Example:**
```vue
<script setup lang="ts">
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap'
import { useTemplateRef } from 'vue'

const modalRef = useTemplateRef<HTMLDivElement>('modal')
const isOpen = ref(false)

const { hasFocus, activate, deactivate } = useFocusTrap(modalRef, {
  immediate: false
})

watch(isOpen, (open) => {
  if (open) {
    nextTick(() => activate())
  } else {
    deactivate()
  }
})
</script>

<template>
  <div v-if="isOpen" ref="modal" class="modal">
    <!-- Modal content -->
  </div>
</template>
```

**Source:** Context7 - VueUse useFocusTrap documentation

### Pattern 3: Live Regions for Screen Reader Announcements

**What:** Announce dynamic content changes to screen readers

**When to use:** Form validation errors, search results loading, route changes, async status updates

**Example:**
```vue
<script setup lang="ts">
const announcement = ref('')
const previousAnnouncement = ref('')

function announce(message: string) {
  // Clear and reset to ensure re-announcement
  announcement.value = ''
  nextTick(() => {
    announcement.value = message
  })
}

// Usage for route changes
watch(() => route.path, (to, from) => {
  announce(`Navigated to ${route.meta.title || 'page'}`)
})
</script>

<template>
  <div
    aria-live="polite"
    aria-atomic="true"
    class="sr-only"
  >
    {{ announcement }}
  </div>
</template>
```

**Source:** Web search (LOW confidence) - ARIA live region patterns for Vue 3

### Pattern 4: Keyboard Navigation with useMagicKeys

**What:** Handle keyboard shortcuts and navigation

**When to use:** Custom keyboard handlers, Escape to close modals, arrow key navigation

**Example:**
```vue
<script setup lang="ts">
import { useMagicKeys, whenever } from '@vueuse/core'

const isOpen = ref(false)

const { escape } = useMagicKeys()

whenever(escape, () => {
  if (isOpen.value) {
    isOpen.value = false
  }
})
</script>
```

**Source:** Context7 - VueUse useMagicKeys documentation

### Pattern 5: Semantic HTML Structure with Landmarks

**What:** Use proper HTML5 elements and ARIA landmarks

**When to use:** All page layouts

**Example:**
```vue
<main role="main" aria-labelledby="main-title">
  <h1 id="main-title">Main title</h1>
  <section aria-labelledby="section-title-1">
    <h2 id="section-title-1">Section Title</h2>
  </section>
</main>
```

**Source:** Context7 - Vue.js accessibility documentation

### Anti-Patterns to Avoid

- **ARIA overuse:** Don't use ARIA when native HTML semantics work. "No ARIA is better than bad ARIA."
- **aria-hidden on focusable elements:** Never use `aria-hidden="true"` on elements that can receive focus
- **Empty ARIA labels:** Icon buttons must have `aria-label` or `aria-labelledby`
- **Color-only indicators:** Don't use color alone to convey state (accessibility requirement from REQUIREMENTS.md)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Focus trap for modals | Custom focus management | VueUse `useFocusTrap` | Edge cases with Tab, Shift+Tab, focusable element detection |
| Skip link CSS | Custom visibility utilities | Tailwind `sr-only` / `focus:not-sr-only` | Handles all screen reader + focus edge cases |
| Accessibility testing in CI | Custom axe-core integration | @nuxt/a11y module | DevTools integration, configurable rules, official support |
| Keyboard event handling | Manual event listeners | VueUse `useMagicKeys` | Cross-platform, reactive, handles key combinations |
| Color contrast checking | Manual calculation | axe-core / WebAIM checker | WCAG 2.1 AA formulas (4.5:1 text, 3:1 large) |

**Key insight:** Accessibility has many edge cases that manual implementations miss (e.g., focusable elements in Shadow DOM, screen reader quirks). Established libraries handle these.

## Common Pitfalls

### Pitfall 1: Focus Not Restored After Modal Close

**What goes wrong:** After closing a modal, focus doesn't return to the triggering element, leaving keyboard users lost

**Why it happens:** Modal doesn't track which element opened it and doesn't restore focus on close

**How to avoid:**
```vue
<script setup lang="ts">
const triggerRef = ref<HTMLElement>()
const { activate, deactivate } = useFocusTrap(modalRef)

function openModal() {
  triggerRef.value = document.activeElement as HTMLElement
  isOpen.value = true
  nextTick(() => activate())
}

function closeModal() {
  isOpen.value = false
  deactivate()
  nextTick(() => triggerRef.value?.focus())
}
</script>
```

**Warning signs:** Tab after closing modal starts from top of page

### Pitfall 2: Live Regions Not Announcing

**What goes wrong:** Dynamic content changes aren't announced to screen readers

**Why it happens:** Live region needs to be cleared/reset to trigger re-announcement

**How to avoid:** Always clear live region content, wait a tick, then set new content

**Warning signs:** Screen reader silent after async updates

### Pitfall 3: ARIA on Wrong Elements

**What goes wrong:** ARIA attributes used incorrectly or redundantly

**Why it happens:** Misunderstanding ARIA's role vs. native HTML semantics

**How to avoid:**
- Use native `<button>` not `<div>` with `role="button"`
- Use `aria-label` for icon-only buttons
- Use `aria-labelledby` to reference visible text
- Don't add `role="navigation"` to `<nav>` (implicit)

**Warning signs:** axe-core warnings about redundant or incorrect ARIA

### Pitfall 4: Missing Focus Indicators

**What goes wrong:** Keyboard users can't see where focus is

**Why it happens:** CSS focus outline removed or too subtle

**How to avoid:** Ensure all interactive elements have visible focus indicators (2px minimum, high contrast). Tailwind's `focus:` utilities help.

**Warning signs:** Can't navigate site with Tab key effectively

### Pitfall 5: Color Contrast Issues

**What goes wrong:** Text doesn't meet WCAG AA 4.5:1 contrast ratio

**Why it happens:** Design choices prioritized over accessibility

**How to avoid:** Use contrast checker tools during development. @nuxt/a11y will warn about this.

**Warning signs:** Text is hard to read in low light or by users with visual impairments

## Code Examples

Verified patterns from official sources:

### Focus Management for Route Changes

**Source:** Context7 - Vue.js accessibility documentation

```vue
<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const backToTop = ref<HTMLElement>()

watch(
  () => route.path,
  () => {
    nextTick(() => {
      backToTop.value?.focus()
    })
  }
)
</script>

<template>
  <span ref="backToTop" tabindex="-1" />
  <main id="main-content">
    <!-- content -->
  </main>
</template>
```

### ARIA Labels for Icon Buttons

**Source:** Context7 - Vue.js accessibility documentation

```vue
<button aria-label="Close dialog" @click="close">
  <XIcon />
</button>
```

### Form with Accessible Labels

**Source:** Context7 - Vue.js accessibility documentation

```vue
<form action="/dataCollectionLocation" method="post" autocomplete="on">
  <h1 id="billing">Billing</h1>
  <div class="form-item">
    <label for="name">Name:</label>
    <input
      type="text"
      name="name"
      id="name"
      v-model="name"
      aria-labelledby="billing name"
    />
  </div>
  <button type="submit">Submit</button>
</form>
```

### Modal with Focus Trap

**Source:** VueUse useFocusTrap documentation

```vue
<script setup lang="ts">
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap'
import { useTemplateRef, nextTick, watch } from 'vue'

const modalRef = useTemplateRef<HTMLDivElement>('modal')
const isOpen = ref(false)

const { hasFocus, activate, deactivate } = useFocusTrap(modalRef, {
  immediate: false
})

watch(isOpen, (open) => {
  if (open) {
    nextTick(() => activate())
  } else {
    deactivate()
  }
})
</script>

<template>
  <div v-if="isOpen" ref="modal" class="modal" role="dialog" aria-modal="true">
    <span>Has Focus: {{ hasFocus }}</span>
    <input type="text" />
    <button @click="isOpen = false">Close</button>
  </div>
</template>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom skip link CSS | Tailwind sr-only utility | Tailwind 3.x | Simpler implementation, better screen reader support |
| Manual focus trap | VueUse useFocusTrap | Vue 3 era | Fewer bugs, SSR-safe, reactive |
| axe-devtools browser extension only | @nuxt/a11y module | 2024-2025 | CI integration, configurable rules, DevTools UI |
| color contrast manual checking | axe-core automated checks | axe-core 4.x | Catches issues during development |

**Deprecated/outdated:**
- **vue-a11y announcements package**: Deprecated - use native ARIA live regions
- **Manual keyboard event listeners**: Use VueUse useMagicKeys instead
- **Custom skip link implementations**: Use Tailwind sr-only + focus utilities

## Open Questions

Things that couldn't be fully resolved:

1. **@nuxt/a11y Module Documentation**
   - What we know: Module exists, integrates axe-core, provides DevTools interface
   - What's unclear: Exact configuration options and API documentation not fully available in researched sources
   - Recommendation: Review module's README on GitHub during implementation, start with defaults

2. **Live Region Best Practices in Vue 3**
   - What we know: ARIA live regions work with aria-live="polite" or "assertive"
   - What's unclear: Vue-specific patterns for re-announcing same content (common issue)
   - Recommendation: Test with actual screen reader (NVDA/VoiceOver) during implementation

3. **Nuxt 4 Compatibility**
   - What we know: @nuxt/a11y exists for Nuxt 3
   - What's unclear: Nuxt 4 compatibility status (project uses Nuxt 3.15 with future compatibilityVersion: 4)
   - Recommendation: Verify module compatibility before adding to production

## Sources

### Primary (HIGH confidence)

- Context7 - `/vuejs/docs` - Accessibility guide including skip links, semantic HTML, ARIA labels, landmarks
- Context7 - `/websites/vueuse` - useFocusTrap, useMagicKeys, onClickOutside composables
- Project files - `/layouts/default.vue` - Existing skip link implementation
- Project files - `/package.json` - Existing dependencies (@vueuse/nuxt, Playwright)
- Project files - `/nuxt.config.ts` - Module configuration

### Secondary (MEDIUM confidence)

- [Vue.js Official Accessibility Guide](https://vuejs.org/guide/best-practices/accessibility) - Skip links, focus restoration, semantic HTML
- [VueUse Documentation](https://vueuse.org/) - useFocusTrap API and examples
- [@nuxt/a11y Module](https://nuxt.com/modules/a11y) - Official Nuxt accessibility module
- [Nuxt a11y GitHub Repository](https://github.com/nuxt/a11y) - Module source and documentation
- [Best practices for Accessibility in Vue / Nuxt](https://dev.to/jacobandrewsky/best-practices-for-accessibility-in-vue-nuxt-1cga) - Vue/Nuxt specific a11y patterns (Aug 2025)
- [Vue Accessibility Blueprint: 8 Steps](https://alexop.dev/posts/vue-accessibility-blueprint-8-steps/) - Comprehensive Vue a11y guide
- [How To Trap Focus in a Modal in Vue 3](https://www.telerik.com/blogs/how-to-trap-focus-modal-vue-3) - Focus trap tutorial

### Tertiary (LOW confidence)

- [ARIA live regions - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions) - Live region fundamentals
- [Fixing aria-live in Angular, React, and Vue](https://k9n.dev/blog/2025-11-aria-live) - Cross-framework live region patterns
- [Chapter 5: Convey changes of state to screen-readers](https://accessible-vue.com/chapter/5/) - Vue-specific live region examples
- [Announcing information to a screen reader in vue.js using aria-live](https://stackoverflow.com/questions/50807011) - Stack Overflow discussion
- [10 Best Color Contrast Checker Tools in 2026](https://accesstive.com/blog/best-color-contrast-checker-tools/) - Contrast tool comparison
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - Manual contrast verification
- [WCAG Color Contrast Checker](https://accessibleweb.com/color-contrast-checker/) - Automated contrast checking
- [Custom Jest matcher for aXe](https://github.com/NickColley/jest-axe) - jest-axe for unit testing
- [How to Improve Accessibility with Testing Library and jest-axe for Vue](https://alexop.dev/posts/how-to-improve-accessibility-with-testing-library-and-jest-axe-for-your-vue-application/) - Vue-specific jest-axe guide

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - VueUse and @nuxt/a11y are well-documented and established
- Architecture: HIGH - Vue 3 patterns from official docs, verified against project structure
- Pitfalls: MEDIUM - Some derived from WebSearch and general a11y knowledge

**Research date:** 2026-02-07
**Valid until:** 2026-03-09 (30 days - accessibility patterns are stable but tooling evolves)
