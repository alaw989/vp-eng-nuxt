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
        class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all text-neutral-700 hover:text-primary border border-neutral-200 hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label="Previous testimonials"
        :disabled="currentIndex === 0"
        @click="previousSlide"
      >
        <Icon name="mdi:chevron-left" class="w-6 h-6" />
      </button>
      <button
        class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all text-neutral-700 hover:text-primary border border-neutral-200 hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
import { usePreferredReducedMotion } from '@vueuse/core'

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

// Determine items per slide based on breakpoint
const getItemsPerSlide = () => {
  if (typeof window === 'undefined') return props.itemsPerSlide

  const width = window.innerWidth
  if (width < 768) return 1 // mobile
  if (width < 1024) return 2 // tablet
  return props.itemsPerSlide // desktop
}

// Chunk testimonials into slides
const slides = computed(() => {
  const itemsPerSlide = getItemsPerSlide()
  const chunks: Testimonial[][] = []

  for (let i = 0; i < props.testimonials.length; i += itemsPerSlide) {
    chunks.push(props.testimonials.slice(i, i + itemsPerSlide))
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

// Handle window resize to recalculate slides
const handleResize = () => {
  const newIndex = Math.min(currentIndex.value, slides.value.length - 1)
  currentIndex.value = newIndex
}

onMounted(() => {
  if (sliderRef.value) {
    sliderRef.value.addEventListener('keydown', handleKeydown)
  }
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (sliderRef.value) {
    sliderRef.value.removeEventListener('keydown', handleKeydown)
  }
  window.removeEventListener('resize', handleResize)
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
