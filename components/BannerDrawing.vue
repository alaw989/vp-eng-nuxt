<template>
  <div
    ref="root"
    class="banner-drawing"
    :class="{ 'is-paused': !play }"
    :style="{ aspectRatio }"
    aria-hidden="true"
    v-html="markup"
  />
</template>

<script lang="ts">
// The SVG is inlined rather than shown as an <img>: an SVG image's own animation
// plays once per browser cache entry, so it wouldn't replay on refresh or navigation.

// Shared across banners for the whole visit, so going page to page never refetches
const cache = new Map<string, Promise<string>>()

function load(url: string) {
  if (!cache.has(url)) {
    cache.set(url, fetch(url).then(r => (r.ok ? r.text() : '')).catch(() => ''))
  }
  return cache.get(url)!
}
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  /** Full drawing: tablet and up, animated */
  src: string
  /** Lighter drawing for phones, shown static */
  liteSrc?: string
  /** viewBox width / height, reserved before the SVG arrives */
  aspectRatio?: string
  /** Fetch only once scrolled near, for drawings below the fold */
  lazy?: boolean
  /** Hold the draw-in until this turns true (e.g. when scrolled into view) */
  play?: boolean
}>(), {
  liteSrc: '',
  aspectRatio: '1600 / 1154',
  lazy: false,
  play: true
})

const markup = ref('')
const root = ref<HTMLElement>()
let observer: IntersectionObserver | undefined

onMounted(() => {
  const phone = !window.matchMedia('(min-width: 768px)').matches
  const url = phone && props.liteSrc ? props.liteSrc : props.src

  // Wait for idle so the drawing never competes with the page's own first paint
  const start = () => load(url).then((svg) => {
    // Only our own static assets reach here; require an <svg> root anyway
    if (svg.trimStart().startsWith('<svg')) markup.value = svg
  })
  const whenIdle = () => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(start, { timeout: 1200 })
    } else {
      setTimeout(start, 200)
    }
  }

  if (!props.lazy || !('IntersectionObserver' in window) || !root.value) {
    whenIdle()
    return
  }
  // A hidden (display: none) host never intersects, so it never downloads
  observer = new IntersectionObserver((entries) => {
    if (entries.some(e => e.isIntersecting)) {
      observer?.disconnect()
      whenIdle()
    }
  }, { rootMargin: '600px 0px' })
  observer.observe(root.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<style scoped>
/* Fade the SVG, not the root, so the host can set the root's opacity */
.banner-drawing :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
  animation: banner-appear 400ms ease-out;
}

@keyframes banner-appear {
  from { opacity: 0; }
}

/* Draw from the ground up, only where it's worth the paint: tablet and up,
   motion allowed. Phones and reduced motion get the finished drawing. */
@media (min-width: 768px) and (prefers-reduced-motion: no-preference) {
  .banner-drawing :deep(path) {
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    animation: banner-draw 1.7s cubic-bezier(0.45, 0, 0.2, 1) forwards;
    animation-delay: calc(var(--i, 0) * 120ms);
  }

  .banner-drawing :deep(.hatch) {
    stroke-dasharray: none;
    stroke-dashoffset: 0;
    opacity: 0;
    animation: banner-fill 0.9s ease-out 2.6s forwards;
  }

  /* Waiting to play: lines stay undrawn at the start of their animation */
  .banner-drawing.is-paused :deep(path) {
    animation-play-state: paused;
  }
}

@keyframes banner-draw {
  to { stroke-dashoffset: 0; }
}

@keyframes banner-fill {
  to { opacity: 0.4; }
}

@media (prefers-reduced-motion: reduce) {
  .banner-drawing :deep(svg) {
    animation: none;
  }
}
</style>
