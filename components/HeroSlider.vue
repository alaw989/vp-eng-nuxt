<template>
  <section
    ref="sliderRef"
    class="relative h-[80vh] min-h-[600px] overflow-hidden bg-neutral-900"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    tabindex="0"
    aria-label="Hero slider"
  >
    <!-- Slides Container -->
    <div
      ref="sliderRef"
      class="relative h-full"
    >
      <Transition
        :name="transitionName"
        mode="out-in"
      >
        <div
          v-if="slides.length > 0"
          :key="currentSlideData.id"
          class="absolute inset-0"
        >
          <!-- Background Image -->
          <NuxtImg
            :src="currentSlideData.image"
            :alt="currentSlideData.alt"
            class="absolute inset-0 w-full h-full object-cover"
            format="webp"
            loading="eager"
            fetchpriority="high"
          />
          <!-- Overlay -->
          <div class="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-primary-dark/90" />
        </div>
      </Transition>

      <!-- Slide Content -->
      <div class="relative z-10 h-full flex items-center justify-center">
        <Transition
          name="slide-content"
          mode="out-in"
        >
          <div
            :key="currentSlideData.id"
            class="container text-center text-white"
          >
            <h1 class="text-5xl md:text-7xl font-display font-bold mb-6 text-shadow-lg slide-content-item whitespace-pre-line">
              {{ currentSlideData.title }}
            </h1>
            <p class="text-xl md:text-2xl mb-8 text-shadow max-w-3xl mx-auto slide-content-item">
              {{ currentSlideData.description }}
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center slide-content-item">
              <NuxtLink
                v-if="currentSlideData.primaryLink"
                :to="currentSlideData.primaryLink"
                class="px-8 py-4 bg-white text-primary rounded-lg font-semibold hover:bg-neutral-100 transition-colors"
              >
                {{ currentSlideData.primaryText || 'Learn More' }}
              </NuxtLink>
              <NuxtLink
                v-if="currentSlideData.secondaryLink"
                :to="currentSlideData.secondaryLink"
                class="px-8 py-4 bg-secondary text-white rounded-lg font-semibold hover:bg-secondary-dark transition-colors"
              >
                {{ currentSlideData.secondaryText || 'Contact Us' }}
              </NuxtLink>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Navigation Arrows -->
    <button
      class="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all text-white"
      aria-label="Previous slide"
      @click="previousSlide"
    >
      <Icon name="mdi:chevron-left" class="w-8 h-8" />
    </button>
    <button
      class="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all text-white"
      aria-label="Next slide"
      @click="nextSlide"
    >
      <Icon name="mdi:chevron-right" class="w-8 h-8" />
    </button>

    <!-- Dot Indicators -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
      <button
        v-for="(_, index) in slides"
        :key="index"
        :aria-label="`Go to slide ${index + 1}`"
        :class="[
          'w-3 h-3 rounded-full transition-all duration-300',
          currentSlide === index
            ? 'bg-white w-8'
            : 'bg-white/50 hover:bg-white/70'
        ]"
        @click="goToSlide(index)"
      />
    </div>

    <!-- Progress Bar -->
    <div class="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
      <div
        class="h-full bg-white transition-all duration-100 ease-linear"
        :style="{ width: `${progress}%` }"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
interface HeroSlide {
  id: string | number
  title: string
  description: string
  image: string
  alt: string
  primaryLink?: string
  primaryText?: string
  secondaryLink?: string
  secondaryText?: string
}

const props = withDefaults(
  defineProps<{
    slides?: HeroSlide[]
    autoplayInterval?: number
  }>(),
  {
    slides: () => [
      {
        id: 1,
        title: 'Structural Engineering\nExcellence',
        description: 'Serving Tampa Bay with comprehensive structural design, inspection, and detailing services',
        image: '/images/hero-1.svg',
        alt: 'Structural engineering project',
        primaryLink: '/services',
        primaryText: 'Our Services',
        secondaryLink: '/contact',
        secondaryText: 'Get In Touch'
      },
      {
        id: 2,
        title: 'Innovative Design\nSolutions',
        description: 'From concept to completion, we deliver engineering excellence for projects of all sizes',
        image: '/images/hero-2.svg',
        alt: 'Engineering design blueprints',
        primaryLink: '/projects',
        primaryText: 'View Projects',
        secondaryLink: '/contact',
        secondaryText: 'Start Your Project'
      },
      {
        id: 3,
        title: 'Trusted by Tampa\nBay Since 1990',
        description: 'Over 30 years of experience delivering quality structural engineering services',
        image: '/images/hero-3.svg',
        alt: 'Construction site',
        primaryLink: '/about',
        primaryText: 'Learn More',
        secondaryLink: '/contact',
        secondaryText: 'Contact Us'
      }
    ],
    autoplayInterval: 9000
  }
)

const currentSlide = ref(0)
const progress = ref(0)
const intervalId = ref<ReturnType<typeof setInterval> | null>(null)
const progressIntervalId = ref<ReturnType<typeof setInterval> | null>(null)
const isTransitioning = ref(false)
const transitionName = ref('slide-left')

// Touch swipe support
const touchStartX = ref(0)
const touchEndX = ref(0)
const minSwipeDistance = 50

const handleTouchStart = (e: TouchEvent) => {
  const touch = e.changedTouches[0]
  if (touch) {
    touchStartX.value = touch.screenX
  }
}

const handleTouchEnd = (e: TouchEvent) => {
  const touch = e.changedTouches[0]
  if (touch) {
    touchEndX.value = touch.screenX
    handleSwipe()
  }
}

const handleSwipe = () => {
  const distance = touchStartX.value - touchEndX.value
  if (Math.abs(distance) > minSwipeDistance) {
    if (distance > 0) {
      nextSlide() // Swiped left
    } else {
      previousSlide() // Swiped right
    }
  }
}

// Safely get current slide - slides always has at least one item from defaults
const currentSlideData = computed(() => {
  return props.slides[currentSlide.value] ?? props.slides[0]!
})

const nextSlide = () => {
  if (isTransitioning.value) return
  transitionName.value = 'slide-left'
  currentSlide.value = (currentSlide.value + 1) % props.slides.length
  resetAutoplay()
}

const previousSlide = () => {
  if (isTransitioning.value) return
  transitionName.value = 'slide-right'
  currentSlide.value = currentSlide.value === 0 ? props.slides.length - 1 : currentSlide.value - 1
  resetAutoplay()
}

const goToSlide = (index: number) => {
  if (isTransitioning.value || index === currentSlide.value) return
  transitionName.value = index > currentSlide.value ? 'slide-left' : 'slide-right'
  currentSlide.value = index
  resetAutoplay()
}

const startAutoplay = () => {
  stopAutoplay()

  // Progress bar animation
  progressIntervalId.value = setInterval(() => {
    progress.value += 100 / (props.autoplayInterval / 100)
    if (progress.value >= 100) {
      progress.value = 0
    }
  }, 100)

  // Slide change
  intervalId.value = setInterval(() => {
    nextSlide()
  }, props.autoplayInterval)
}

const stopAutoplay = () => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
    intervalId.value = null
  }
  if (progressIntervalId.value) {
    clearInterval(progressIntervalId.value)
    progressIntervalId.value = null
  }
}

const resetAutoplay = () => {
  progress.value = 0
  startAutoplay()
}

// Pause on hover
const sliderRef = ref<HTMLElement | null>(null)

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
      goToSlide(props.slides.length - 1)
      break
  }
}

onMounted(() => {
  if (sliderRef.value) {
    sliderRef.value.addEventListener('mouseenter', stopAutoplay)
    sliderRef.value.addEventListener('mouseleave', startAutoplay)
    sliderRef.value.addEventListener('keydown', handleKeydown)
  }
  startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
  sliderRef.value?.removeEventListener('mouseenter', stopAutoplay)
  sliderRef.value?.removeEventListener('mouseleave', startAutoplay)
  sliderRef.value?.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* Slide transitions */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.7s ease-in-out;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-100%);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Content transitions with stagger */
.slide-content-enter-active .slide-content-item {
  transition: all 0.6s ease-out;
}

.slide-content-leave-active .slide-content-item {
  transition: all 0.4s ease-in;
}

.slide-content-enter-from .slide-content-item {
  opacity: 0;
  transform: translateY(30px);
}

.slide-content-leave-to .slide-content-item {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-content-enter-active .slide-content-item:nth-child(1) {
  transition-delay: 0ms;
}

.slide-content-enter-active .slide-content-item:nth-child(2) {
  transition-delay: 100ms;
}

.slide-content-enter-active .slide-content-item:nth-child(3) {
  transition-delay: 200ms;
}
</style>
