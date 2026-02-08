<template>
  <section
    ref="heroRef"
    class="relative h-[80vh] min-h-[600px] overflow-hidden bg-neutral-900"
    aria-label="Hero section"
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
        width="1920"
        height="1080"
        :modifiers="{ quality: 85 }"
      />
      <!-- Subtle gradient overlay on image for warmth -->
      <div class="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 mix-blend-multiply" />
    </div>

    <!-- Overlay with enhanced gradient -->
    <div class="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary-dark/70 to-black/80" />
    <!-- Additional gradient for depth -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
    <!-- Animated gradient shimmer -->
    <div class="absolute inset-0 opacity-30 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />

    <!-- Hero Content -->
    <div class="relative z-10 h-full flex items-center justify-center">
      <div class="container text-center text-white">
        <h1 class="hero-animate-headline text-5xl md:text-7xl font-display font-bold mb-6 bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
          {{ headline }}
        </h1>
        <p
          v-if="subheadline"
          class="hero-animate-subheadline text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-white/90 drop-shadow-lg"
        >
          {{ subheadline }}
        </p>
        <div
          v-if="showCta && ctaText"
          class="hero-animate-cta flex flex-col sm:flex-row gap-4 justify-center"
        >
          <NuxtLink
            :to="ctaLink"
            class="px-8 py-4 bg-gradient-to-r from-secondary to-secondary-dark text-white rounded-lg font-semibold hover:from-secondary-dark hover:to-secondary transition-all shadow-lg hover:shadow-xl focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-white/50"
          >
            {{ ctaText }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'

interface HeroProps {
  headline?: string
  subheadline?: string
  ctaText?: string
  ctaLink?: string
  backgroundImage?: string
  backgroundAlt?: string
  showCta?: boolean
}

const props = withDefaults(defineProps<HeroProps>(), {
  headline: 'Trusted by Tampa Bay Since 1990',
  subheadline: 'Comprehensive structural engineering services standing the test of time',
  ctaText: "Let's Talk",
  ctaLink: '/contact',
  backgroundImage: '/images/hero/crane-building-1920w.jpg',
  backgroundAlt: 'Construction crane against modern building facade showcasing structural engineering expertise',
  showCta: true
})

// Parallax motion using VueUse (respect prefers-reduced-motion)
const { y: scrollY } = useWindowScroll()

// Parallax offset - background moves slower than foreground
const parallaxOffset = computed(() => {
  // Only apply parallax when near top of page (first 100vh)
  const maxOffset = 100 // Maximum pixels to translate
  const offset = Math.min(scrollY.value * 0.3, maxOffset)
  return offset
})

// Subtle zoom effect based on scroll position
const zoomScale = computed(() => {
  // Zoom from 1 to 1.15 based on scroll (first 800px)
  const maxScroll = 800
  const scale = 1 + Math.min(scrollY.value / maxScroll, 1) * 0.15
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

/* Focus visible styles for keyboard navigation */
a:focus-visible {
  outline: 2px solid white;
  outline-offset: 2px;
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

/* Entrance animations for hero content */
.hero-animate-headline {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.7s ease-out 0.2s forwards;
}

.hero-animate-subheadline {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.7s ease-out 0.4s forwards;
}

.hero-animate-cta {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.7s ease-out 0.6s forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Respect prefers-reduced-motion for entrance animations */
@media (prefers-reduced-motion: reduce) {
  .hero-animate-headline,
  .hero-animate-subheadline,
  .hero-animate-cta {
    opacity: 1;
    transform: translateY(0);
    animation: none;
  }
}
</style>
