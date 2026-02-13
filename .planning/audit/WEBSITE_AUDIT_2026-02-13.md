# Website Audit Report - February 13, 2026

> **Purpose:** This document captures all issues discovered during a comprehensive website audit. Use this as a reference for fixing issues across multiple sessions.

## Quick Reference

| ID | Issue | Severity | Status | File |
|----|-------|----------|--------|------|
| AUD-001 | Hydration Mismatch in TestimonialsSlider | Critical | ✅ Fixed | `components/TestimonialsSlider.vue` |
| AUD-002 | HTML Entity Display Bug | Critical | ✅ Fixed | `pages/index.vue` (API data) |
| AUD-003 | NuxtImg srcset Warnings | Moderate | ✅ Fixed | `nuxt.config.ts` |
| AUD-004 | Testimonial Button Shape | Moderate | ✅ Fixed | `components/TestimonialsSlider.vue` |
| AUD-005 | Duplicate CSS Classes | Minor | ✅ Fixed | `pages/index.vue` |
| AUD-006 | StatCounter Reliability | Moderate | ✅ Fixed | `components/StatCounter.vue` |

> **All issues resolved on 2026-02-13** - See SHARED_TASK_NOTES.md for details.

---

## AUD-001: Hydration Mismatch in TestimonialsSlider

### Severity: CRITICAL

### Problem
The `getItemsPerSlide()` function in TestimonialsSlider causes SSR hydration mismatches because it returns different values on server vs client.

### Root Cause
```javascript
// Location: components/TestimonialsSlider.vue:107-114
const getItemsPerSlide = () => {
  if (typeof window === 'undefined') return props.itemsPerSlide  // Server: always returns 3
  const width = window.innerWidth
  if (width < 768) return 1 // Client mobile: returns 1
  if (width < 1024) return 2 // Client tablet: returns 2
  return props.itemsPerSlide // Client desktop: returns 3
}
```

**Server renders:** 2 slides (6 testimonials / 3 per slide)
**Client (mobile) expects:** 6 slides (6 testimonials / 1 per slide)

This mismatch causes Vue to log errors and can corrupt component state, including breaking the StatCounter animation.

### Console Errors Observed
```
[Vue warn]: Hydration completed but contains mismatches
[Vue warn]: Hydration text content mismatch
[Vue warn]: Hydration children mismatch
[Vue warn]: Hydration node mismatch
```

### Impact
- Counter animation fails on initial page load (shows "0" instead of animating)
- Layout shifts on mobile devices
- Potential state corruption in other components

### Recommended Fix

**Option A: Use ClientOnly wrapper (simplest)**
```vue
<!-- In pages/index.vue around line 171 -->
<ClientOnly>
  <LazyTestimonialsSlider
    v-if="testimonials.length > 0"
    :testimonials="testimonials"
    :items-per-slide="3"
  />
  <template #fallback>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <!-- Static placeholder cards -->
    </div>
  </template>
</ClientOnly>
```

**Option B: SSR-safe responsive logic (better UX)**
```javascript
// Replace getItemsPerSlide with SSR-safe version
import { useWindowSize } from '@vueuse/core'

const { width } = useWindowSize()

const itemsPerSlide = computed(() => {
  // Use a default that works for SSR, then update on client
  if (width.value === 0) return props.itemsPerSlide // SSR fallback
  if (width.value < 768) return 1
  if (width.value < 1024) return 2
  return props.itemsPerSlide
})

// Update slides to use computed instead of function
const slides = computed(() => {
  const perSlide = itemsPerSlide.value
  // ... rest of chunking logic
})
```

**Option C: Force consistent SSR/client rendering**
```javascript
// Always render desktop layout, use CSS to show/hide
// This avoids hydration issues but may load extra DOM elements
```

### Files to Modify
1. `components/TestimonialsSlider.vue` - Fix the responsive logic
2. `pages/index.vue` - Optionally wrap in ClientOnly

### Testing Steps
1. Run `npm run dev`
2. Open browser at http://localhost:3000
3. Open DevTools Console
4. Refresh page - should see NO hydration warnings
5. Test on mobile viewport (390x844) - counters should animate
6. Test scroll behavior - counters should animate when scrolled into view

---

## AUD-002: HTML Entity Display Bug

### Severity: CRITICAL

### Problem
Service card titles show raw HTML entities like `CAD &#038; 3D Modeling` instead of `CAD & 3D Modeling`.

### Root Cause
The WordPress API returns HTML-encoded content. The title is extracted but not decoded:

```javascript
// Location: pages/index.vue:261
title: s.title?.rendered || 'Service',
```

WordPress encodes `&` as `&#038;` or `&amp;` in rendered content.

### Recommended Fix

**Option A: Create a utility function**
```javascript
// Create: utils/decodeHtml.ts
export function decodeHtmlEntities(text: string): string {
  if (!text) return ''
  if (typeof window === 'undefined') {
    // SSR-safe decoding
    return text
      .replace(/&#038;/g, '&')
      .replace(/&amp;/g, '&')
      .replace(/&#8217;/g, "'")
      .replace(/&#8220;/g, '"')
      .replace(/&#8221;/g, '"')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
  }
  const textarea = document.createElement('textarea')
  textarea.innerHTML = text
  return textarea.value
}
```

**Option B: Use a library**
```bash
npm install he
```
```javascript
import { decode } from 'he'
title: decode(s.title?.rendered || 'Service'),
```

### Files to Modify
1. Create `utils/decodeHtml.ts`
2. Update `pages/index.vue` - import and use on lines 261, 263, 288, etc.
3. Check other pages that fetch from WordPress API

### Affected Data Sources
- Services API: `/api/services`
- Projects API: `/api/projects`
- Testimonials API: `/api/testimonials`

---

## AUD-003: NuxtImg srcset Warnings

### Severity: MODERATE

### Problem
Console shows repeated warnings about invalid srcset values:
```
Failed parsing 'srcset' attribute value
Dropped srcset candidate "/_ipx/f_webp&q..."
```

### Likely Causes
1. Image paths contain special characters that aren't properly encoded
2. IPX (Nuxt Image provider) configuration issue
3. Missing or malformed image files

### Components Using NuxtImg
- `components/HeroStatic.vue:17-30`
- `components/TestimonialCard.vue:16-25`
- `components/ProjectCard.vue:15-27`
- `components/TeamMember.vue`
- `components/ProjectGallery.vue`

### Investigation Steps
1. Check `nuxt.config.ts` for image configuration
2. Verify image paths in `/public/images/` exist
3. Test individual NuxtImg components in isolation
4. Check if IPX server is running correctly

### Potential Fixes
```javascript
// In nuxt.config.ts, ensure proper image config:
export default defineNuxtConfig({
  image: {
    quality: 80,
    format: ['webp', 'jpg'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },
})
```

---

## AUD-004: Testimonial Navigation Button Shape

### Severity: MODERATE

### Problem
User reported that next/previous buttons on testimonial slider are "not exactly circles."

### Current Implementation
```html
<!-- Location: components/TestimonialsSlider.vue:38-53 -->
<button
  class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all text-neutral-700 hover:text-primary border border-neutral-200 hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
  ...
>
  <Icon name="mdi:chevron-left" class="w-6 h-6" />
</button>
```

### Analysis
- `p-3` = 12px padding on all sides
- `w-6 h-6` icon = 24px
- Total button size = 24 + 24 = 48px (should be square/circular)

The issue may be:
1. Icon not perfectly centered
2. Visual perception due to shadow/border
3. Inconsistent icon sizing

### Recommended Fix
Make dimensions explicit to guarantee circularity:
```html
<button
  class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-lg hover:shadow-xl transition-all text-neutral-700 hover:text-primary border border-neutral-200 hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
  ...
>
  <Icon name="mdi:chevron-left" class="w-6 h-6" />
</button>
```

Changes:
- Remove `p-3`
- Add `w-12 h-12` (48px explicit)
- Add `flex items-center justify-center`

---

## AUD-005: Duplicate CSS Classes

### Severity: MINOR

### Problem
Some elements have duplicate Tailwind classes.

### Locations
```html
<!-- pages/index.vue:21 -->
<NuxtLink class="... rounded-lg ... rounded-lg">

<!-- pages/index.vue:104 -->
<NuxtLink class="... rounded-lg ... rounded-lg">
```

### Fix
Remove the duplicate `rounded-lg` from each line.

---

## AUD-006: StatCounter Reliability

### Severity: MODERATE

### Problem
Counter animation sometimes fails to trigger on scroll.

### Root Cause
The counter depends on:
1. `useScrollReveal` composable (uses IntersectionObserver)
2. Proper hydration (affected by AUD-001)

### Current Implementation
```javascript
// Location: components/StatCounter.vue:36-38
const counterRef = ref<HTMLElement>()
const { target, isVisible } = useScrollReveal({ threshold: 0.1 })
const animatedValue = ref(0)

// Lines 86-88: Sync target with counterRef
watchEffect(() => {
  target.value = counterRef.value
})

// Lines 91-95: Start animation when visible
watch(isVisible, (visible) => {
  if (visible && !hasAnimated.value) {
    animate()
  }
})
```

### Potential Issues
1. If hydration fails, `counterRef` may not properly bind
2. `watchEffect` may not fire if component state is corrupted
3. `once: true` in useScrollReveal means it only triggers once

### Recommended Improvements
```javascript
// Add mounted check to ensure ref is bound
onMounted(() => {
  if (counterRef.value) {
    target.value = counterRef.value
  }
})

// Add fallback: if visible after 2 seconds but not animated, force it
onMounted(() => {
  setTimeout(() => {
    if (!hasAnimated.value && counterRef.value) {
      const rect = counterRef.value.getBoundingClientRect()
      if (rect.top < window.innerHeight) {
        animate()
      }
    }
  }, 2000)
})
```

---

## Testing Checklist

After fixing issues, verify:

- [ ] No hydration warnings in console on fresh page load
- [ ] Counters animate when scrolled into view (desktop)
- [ ] Counters animate when scrolled into view (mobile 390x844)
- [ ] Service card shows "CAD & 3D Modeling" (not encoded)
- [ ] No srcset warnings in console
- [ ] Testimonial buttons are perfect circles
- [ ] Testimonial slider works on all breakpoints
- [ ] All pages load without errors

## Browser Testing Matrix

| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chrome | Test | Test (DevTools) |
| Safari | Test | Test (iOS) |
| Firefox | Test | Test |
| Edge | Test | - |

---

## Priority Order for Fixes

1. **AUD-001** - Hydration Mismatch (fixes counter issues)
2. **AUD-002** - HTML Entity Bug (user-facing text issue)
3. **AUD-004** - Button Shape (visual polish)
4. **AUD-003** - srcset Warnings (performance)
5. **AUD-005** - Duplicate Classes (code quality)
6. **AUD-006** - StatCounter Reliability (may be fixed by AUD-001)

---

## Related Files Quick Reference

```
components/
├── StatCounter.vue          # Counter animation
├── TestimonialsSlider.vue   # Hydration issue, button shape
├── TestimonialCard.vue      # Uses NuxtImg
├── ServiceCard.vue          # Displays service titles
├── ProjectCard.vue          # Uses NuxtImg
├── HeroStatic.vue           # Uses NuxtImg
└── ClientLogos.vue          # No issues found

composables/
└── useScrollReveal.ts       # Scroll detection for counters

pages/
└── index.vue                # Main page, API data transformation

utils/
└── (create) decodeHtml.ts   # HTML entity decoder
```

---

## Session Handoff Notes

When resuming work on these issues:

1. Start the dev server: `npm run dev`
2. Open http://localhost:3000 in browser
3. Open DevTools Console to monitor for errors
4. Use Playwright MCP or browser DevTools for testing
5. Test mobile viewport: 390x844 (iPhone 14 Pro)
6. Check this document for fix details and testing steps

**Last Updated:** 2026-02-13
**Audited By:** Claude (Playwright MCP + Code Analysis)
