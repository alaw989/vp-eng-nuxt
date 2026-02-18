<template>
  <section
    ref="bannerRef"
    class="relative h-[50vh] min-h-[400px] overflow-hidden bg-neutral-900"
    :aria-label="ariaLabel"
  >
    <!-- Background Image with parallax wrapper -->
    <div
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
      <!-- Subtle gradient overlay on image -->
      <div class="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 mix-blend-multiply" />
    </div>

    <!-- Overlay with enhanced gradient -->
    <div class="absolute inset-0 bg-gradient-to-br from-primary/85 via-primary-dark/75 to-black/85" />
    <!-- Additional gradient for depth -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
    <!-- Animated gradient shimmer -->
    <div class="absolute inset-0 opacity-30 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />

    <!-- Banner Content -->
    <div class="relative z-10 h-full flex items-center justify-center">
      <div class="container text-center text-white">
        <h1 class="banner-animate-headline text-4xl md:text-6xl font-display font-bold mb-4">
          {{ headline }}
        </h1>
        <p
          v-if="subheadline"
          class="banner-animate-subheadline text-lg md:text-xl max-w-3xl mx-auto text-white/90 drop-shadow-lg"
        >
          {{ subheadline }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'

interface PageBannerProps {
  headline: string
  subheadline?: string
  backgroundImage?: string
  backgroundAlt?: string
  ariaLabel?: string
}

const props = withDefaults(defineProps<PageBannerProps>(), {
  backgroundImage: '/images/hero/crane-building-1920w.jpg',
  backgroundAlt: 'Professional structural engineering background',
  ariaLabel: 'Page banner'
})

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

/* Shimmer animation for gradient overlay */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 8s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .animate-shimmer {
    animation: none;
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
