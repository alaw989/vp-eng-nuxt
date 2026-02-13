<template>
  <section
    ref="sliderRef"
    class="relative"
    aria-label="Testimonials slider"
  >
    <!-- Slider Container -->
    <div class="overflow-hidden">
      <div
        ref="trackRef"
        class="flex"
        :class="prefersReducedMotion === 'reduce' ? '' : 'transition-transform duration-300 ease-out'"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
      >
        <!-- Slides -->
        <div
          v-for="(slide, slideIndex) in slides"
          :key="slideIndex"
          class="w-full flex-shrink-0 px-1"
        >
          <TransitionGroup name="card-fade" tag="div" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              v-for="testimonial in slide"
              :key="testimonial.quote + testimonial.author"
              :quote="testimonial.quote"
              :author="testimonial.author"
              :company="testimonial.company"
              :role="testimonial.role"
              :avatar="testimonial.avatar"
            />
          </TransitionGroup>
        </div>
      </div>
    </div>

    <!-- Navigation Arrows -->
    <template v-if="slides.length > 1">
      <button
        class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-lg hover:shadow-xl transition-all text-neutral-700 hover:text-primary border border-neutral-200 hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label="Previous testimonials"
        :disabled="currentIndex === 0"
        @click="previousSlide"
      >
        <Icon name="mdi:chevron-left" class="w-6 h-6" />
      </button>
      <button
        class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-lg hover:shadow-xl transition-all text-neutral-700 hover:text-primary border border-neutral-200 hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label="Next testimonials"
        :disabled="currentIndex === slides.length - 1"
        @click="nextSlide"
      >
        <Icon name="mdi:chevron-right" class="w-6 h-6" />
      </button>
    </template>

    <!-- Dot Indicators -->
    <div v-if="slides.length > 1" class="flex justify-center gap-2 mt-8">
      <button
        v-for="(_, index) in slides"
        :key="index"
        :aria-label="`Go to testimonials slide ${index + 1}`"
        :class="[
          'w-2.5 h-2.5 rounded-full transition-all duration-300',
          currentIndex === index
            ? 'bg-primary w-8'
            : 'bg-neutral-300 hover:bg-neutral-400'
        ]"
        @click="goToSlide(index)"
      />
    </div>

    <!-- Live region for screen reader announcements -->
    <div
      class="sr-only"
      role="status"
      aria-live="polite"
    >
      Showing testimonials slide {{ currentIndex + 1 }} of {{ slides.length }}
    </div>
  </section>
</template>

<script setup lang="ts">
import { usePreferredReducedMotion, useWindowSize } from '@vueuse/core'

interface Testimonial {
  quote: string
  author: string
  company?: string
  role?: string
  avatar?: string
}

interface Props {
  testimonials: Testimonial[]
  itemsPerSlide?: number
}

const props = withDefaults(defineProps<Props>(), {
  itemsPerSlide: 3
})

// Reduced motion detection
const prefersReducedMotion = usePreferredReducedMotion()

// Use reactive window size for SSR-safe responsive behavior
// useWindowSize returns Infinity during SSR, which matches desktop breakpoint
const { width: windowWidth } = useWindowSize()

// Computed items per slide - SSR-safe and reactive
const itemsPerSlide = computed(() => {
  // During SSR or initial hydration, windowWidth is Infinity
  // This ensures SSR and client render the same initial state (desktop layout)
  if (windowWidth.value === Infinity || windowWidth.value >= 1024) {
    return props.itemsPerSlide // desktop: 3
  }
  if (windowWidth.value >= 768) {
    return 2 // tablet
  }
  return 1 // mobile
})

// Chunk testimonials into slides - now reactive to itemsPerSlide changes
const slides = computed(() => {
  const perSlide = itemsPerSlide.value
  const chunks: Testimonial[][] = []

  for (let i = 0; i < props.testimonials.length; i += perSlide) {
    chunks.push(props.testimonials.slice(i, i + perSlide))
  }

  return chunks.length > 0 ? chunks : [[]]
})

const currentIndex = ref(0)
const sliderRef = ref<HTMLElement | null>(null)

const nextSlide = () => {
  if (currentIndex.value < slides.value.length - 1) {
    currentIndex.value++
  }
}

const previousSlide = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const goToSlide = (index: number) => {
  currentIndex.value = index
}

// Keyboard navigation
const handleKeydown = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'ArrowLeft':
      e.preventDefault()
      previousSlide()
      break
    case 'ArrowRight':
      e.preventDefault()
      nextSlide()
      break
    case 'Home':
      e.preventDefault()
      goToSlide(0)
      break
    case 'End':
      e.preventDefault()
      goToSlide(slides.value.length - 1)
      break
  }
}

// Watch for slide count changes and adjust current index if needed
// This handles viewport changes reactively via useWindowSize
watch(slides, (newSlides) => {
  if (currentIndex.value >= newSlides.length) {
    currentIndex.value = Math.max(0, newSlides.length - 1)
  }
})

onMounted(() => {
  if (sliderRef.value) {
    sliderRef.value.addEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  if (sliderRef.value) {
    sliderRef.value.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<style scoped>
/* Screen reader only utility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Ensure slider is focusable for keyboard navigation */
section:focus {
  outline: none;
}

section:focus-visible {
  outline: 2px solid rgb(30 64 175);
  outline-offset: 2px;
}

/* Card fade-in animation */
.card-fade-enter-active {
  transition: opacity 300ms ease-out, transform 300ms ease-out;
}

.card-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .card-fade-enter-active {
    transition: opacity 150ms linear;
  }
  .card-fade-enter-from {
    transform: none;
  }
}
</style>
