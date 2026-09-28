<template>
  <section
    ref="bannerRef"
    class="relative h-[50vh] min-h-[400px] overflow-hidden bg-primary-dark"
    :aria-label="ariaLabel"
  >
    <!-- Background Image with parallax wrapper -->
    <div
      v-if="backgroundImage"
      class="absolute inset-0 w-full h-full overflow-hidden"
      :style="!prefersReducedMotion ? {
        transform: `translateY(${parallaxOffset}px)`
      } : {}"
    >
      <NuxtImg
        :src="backgroundImage"
        :alt="backgroundAlt"
        class="absolute inset-0 w-full h-full object-cover"
        :style="!prefersReducedMotion ? {
          transform: `scale(${zoomScale})`,
          willChange: 'transform'
        } : {}"
        format="webp"
        loading="eager"
        fetchpriority="high"
        :modifiers="{ quality: 85 }"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1920px"
        :width="1920"
        :height="800"
      />
      <!-- Flat navy overlay -->
      <div class="absolute inset-0 bg-primary-dark/80" />
    </div>

    <!-- No photo: a drawing sheet, with a fine grid and gridline bubbles -->
    <div
      v-else
      data-testid="banner-grid"
      class="absolute inset-0 bg-blueprint bg-grid"
      aria-hidden="true"
    >
      <svg class="absolute inset-0 w-full h-full text-white/30" fill="none" stroke="currentColor" stroke-width="1">
        <line x1="25%" y1="0" x2="25%" y2="100%" stroke-dasharray="12 4 2 4" />
        <line x1="60%" y1="0" x2="60%" y2="100%" stroke-dasharray="12 4 2 4" />
        <line x1="90%" y1="0" x2="90%" y2="100%" stroke-dasharray="12 4 2 4" />
        <line x1="0" y1="72%" x2="100%" y2="72%" stroke-dasharray="12 4 2 4" />
      </svg>
      <span
        v-for="(bubble, i) in gridBubbles"
        :key="bubble.label"
        class="absolute top-4 -translate-x-1/2 w-9 h-9 rounded-full border border-white/40 bg-primary-dark flex items-center justify-center font-display text-sm text-white/70"
        :class="i === 0 ? 'left-[25%]' : i === 1 ? 'left-[60%]' : 'left-[90%]'"
      >
        {{ bubble.label }}
      </span>
    </div>

    <!-- Bottom scrim for legibility -->
    <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent" />

    <!-- Banner Content -->
    <div class="relative z-10 h-full flex items-end pb-12 md:pb-16">
      <div class="container text-white">
        <div class="max-w-3xl border-l-2 border-secondary-light pl-6">
          <p
            v-if="eyebrow"
            class="banner-animate-headline mb-3 text-xs uppercase tracking-[0.2em] text-white/80"
          >
            {{ eyebrow }}
          </p>
          <h1 class="banner-animate-headline text-4xl md:text-6xl font-display font-bold mb-4">
            {{ headline }}
          </h1>
          <p
            v-if="subheadline"
            class="banner-animate-subheadline text-lg md:text-xl text-white/90"
          >
            {{ subheadline }}
          </p>
          <slot />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'

interface PageBannerProps {
  headline: string
  subheadline?: string
  eyebrow?: string
  backgroundImage?: string
  backgroundAlt?: string
  ariaLabel?: string
}

const props = withDefaults(defineProps<PageBannerProps>(), {
  backgroundImage: '',
  backgroundAlt: 'Professional structural engineering background',
  ariaLabel: 'Page banner'
})

const gridBubbles = [{ label: 'A' }, { label: 'B' }, { label: 'C' }]

// Parallax motion using VueUse (respect prefers-reduced-motion)
const { y: scrollY } = useWindowScroll()

// Parallax offset - background moves slower than foreground
const parallaxOffset = computed(() => {
  // Only apply parallax when near top of page (first 100vh)
  const maxOffset = 50 // Maximum pixels to translate (smaller for page banners)
  const offset = Math.min(scrollY.value * 0.2, maxOffset)
  return offset
})

// Subtle zoom effect based on scroll position
const zoomScale = computed(() => {
  // Zoom from 1 to 1.1 based on scroll (first 800px)
  const maxScroll = 800
  const scale = 1 + Math.min(scrollY.value / maxScroll, 1) * 0.1
  return scale
})

// Check for reduced motion preference
const prefersReducedMotion = ref(false)

onMounted(() => {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
})
</script>

<style scoped>
/* Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  * {
    will-change: auto !important;
  }
}

/* Entrance animations for banner content */
.banner-animate-headline {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.7s ease-out 0.2s forwards;
}

.banner-animate-subheadline {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.7s ease-out 0.4s forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Respect prefers-reduced-motion for entrance animations */
@media (prefers-reduced-motion: reduce) {
  .banner-animate-headline,
  .banner-animate-subheadline {
    opacity: 1;
    transform: translateY(0);
    animation: none;
  }
}
</style>
