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
      <!-- NOTE: width/height intentionally omitted - parent container (h-[80vh] min-h-[600px]) prevents CLS.
           Adding width/height would cause Lighthouse "incorrect aspect ratio" warning since
           actual image (1920x1441) differs from any declared dimensions. -->
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
      />
    </div>

    <!-- Flat navy overlay, plus a bottom scrim so the title block stays legible -->
    <div class="absolute inset-0 bg-primary-dark/80" />
    <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent" />

    <!-- Hero Content -->
    <div class="relative z-10 h-full flex flex-col">
      <div class="container flex-1 flex items-center text-white">
        <div class="max-w-3xl">
          <h1 class="hero-animate-headline text-5xl md:text-7xl font-display font-bold mb-6 text-white">
            {{ headline }}
          </h1>
          <p
            v-if="subheadline"
            class="hero-animate-subheadline text-xl md:text-2xl mb-8 text-white/90"
          >
            {{ subheadline }}
          </p>
          <div
            v-if="showCta && ctaText"
            class="hero-animate-cta flex flex-col sm:flex-row gap-4"
          >
            <NuxtLink
              :to="ctaLink"
              class="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-white rounded-sm font-semibold hover:bg-secondary-dark transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
            >
              {{ ctaText }}
              <Icon name="mdi:arrow-right" class="w-5 h-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Title block, as on a drawing sheet -->
      <div class="container pb-6">
        <dl class="hero-animate-cta grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] border-t border-white/40 text-xs uppercase tracking-[0.2em] text-white/80">
          <div class="hidden sm:block py-3 pr-6 border-r border-white/40">
            <dt class="sr-only">Sheet</dt>
            <dd class="font-display font-bold text-white">S-001</dd>
          </div>
          <div class="py-3 sm:px-6">
            <dt class="sr-only">Services</dt>
            <dd>Design · Steel Detailing · Inspection</dd>
          </div>
          <div class="py-3 sm:pl-6 sm:border-l border-t sm:border-t-0 border-white/40">
            <dt class="sr-only">Location</dt>
            <dd>Tampa, FL</dd>
          </div>
        </dl>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'
import { useRoute } from 'vue-router'

interface HeroProps {
  variant?: 'authority' | 'outcome' | 'local' | 'capability'
  headline?: string  // Override variant headline
  subheadline?: string  // Override variant subheadline
  ctaText?: string
  ctaLink?: string
  backgroundImage?: string
  backgroundAlt?: string
  showCta?: boolean
}

const defaultCopy = {
  authority: {
    headline: "Structural Engineering & Steel Detailing",
    subheadline: "Tampa engineers and detailers with over 30 years of combined experience"
  },
  outcome: {
    headline: "Structures That Stand the Test of Time",
    subheadline: "Precision structural engineering for Tampa Bay and beyond"
  },
  local: {
    headline: "Tampa Bay's Structural Engineers",
    subheadline: "Comprehensive structural design, inspection, and detailing"
  },
  capability: {
    headline: "Precision Structural Engineering",
    subheadline: "Licensed Florida engineers, signed and sealed calculations"
  }
}

const props = withDefaults(defineProps<HeroProps>(), {
  variant: 'authority',
  headline: '',
  subheadline: '',
  ctaText: "Let's Talk",
  ctaLink: '/contact',
  backgroundImage: '/images/hero/crane-building-1920w.jpg',
  backgroundAlt: 'Construction crane against modern building facade showcasing structural engineering expertise',
  showCta: true
})

// Query param override for testing variants without code changes
const route = useRoute()
const queryVariant = route.query.heroVariant as string

// Determine which variant to use (query param > prop variant > default)
const activeVariant = computed(() => {
  if (queryVariant && ['authority', 'outcome', 'local', 'capability'].includes(queryVariant)) {
    return queryVariant as 'authority' | 'outcome' | 'local' | 'capability'
  }
  return props.variant
})

// Use override headline/subheadline if provided, otherwise use variant defaults
const headline = computed(() => props.headline || defaultCopy[activeVariant.value].headline)
const subheadline = computed(() => props.subheadline || defaultCopy[activeVariant.value].subheadline)

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

/* Respect prefers-reduced-motion for CTA hover effects */
@media (prefers-reduced-motion: reduce) {
  a[class*="group"] {
    transition: background-color 300ms ease, box-shadow 300ms ease;
  }

  a[class*="group"]:hover {
    transform: none !important;
  }

  a[class*="group"] .icon,
  a[class*="group"] svg {
    transition: none !important;
  }
}
</style>
