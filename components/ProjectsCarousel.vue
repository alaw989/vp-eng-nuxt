<template>
  <section
    ref="carouselRef"
    class="relative"
    :class="containerClass"
  >
    <!-- Carousel Container -->
    <div
      class="overflow-hidden"
      role="region"
      :aria-label="ariaLabel"
    >
      <Transition
        :name="transitionName"
        mode="out-in"
      >
        <div
          v-if="slides.length > 0"
          :key="slides[currentSlide]?.id ?? currentSlide"
          class="w-full"
        >
          <slot
            name="slide"
            :slide="slides[currentSlide]"
            :index="currentSlide"
          >
            {{ slides[currentSlide] }}
          </slot>
        </div>
      </Transition>
    </div>

    <!-- Navigation Arrows -->
    <template v-if="showArrows && slides.length > 1">
      <button
        class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all text-neutral-700 hover:text-primary border border-neutral-200 hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed"
        :aria-label="previousLabel"
        :disabled="currentSlide === 0 && !loop"
        @click="previousSlide"
      >
        <Icon :name="previousIcon" class="w-6 h-6" />
      </button>
      <button
        class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all text-neutral-700 hover:text-primary border border-neutral-200 hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed"
        :aria-label="nextLabel"
        :disabled="currentSlide === slides.length - 1 && !loop"
        @click="nextSlide"
      >
        <Icon :name="nextIcon" class="w-6 h-6" />
      </button>
    </template>

    <!-- Dot Indicators -->
    <div
      v-if="showIndicators && slides.length > 1"
      class="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2"
    >
      <button
        v-for="(_, index) in slides"
        :key="index"
        :aria-label="`${indicatorLabel} ${index + 1}`"
        :aria-current="currentSlide === index ? 'true' : undefined"
        :class="[
          'w-2.5 h-2.5 rounded-full transition-all duration-300',
          currentSlide === index
            ? 'bg-primary w-8'
            : 'bg-neutral-300 hover:bg-neutral-400'
        ]"
        @click="goToSlide(index)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
interface CarouselSlide {
  id?: string | number
  [key: string]: any
}

interface Props {
  slides?: CarouselSlide[]
  autoplay?: boolean
  autoplayInterval?: number
  showArrows?: boolean
  showIndicators?: boolean
  loop?: boolean
  containerClass?: string
  ariaLabel?: string
  previousLabel?: string
  nextLabel?: string
  indicatorLabel?: string
  previousIcon?: string
  nextIcon?: string
}

const props = withDefaults(defineProps<Props>(), {
  slides: () => [],
  autoplay: true,
  autoplayInterval: 5000,
  showArrows: true,
  showIndicators: true,
  loop: true,
  containerClass: '',
  ariaLabel: 'Projects carousel',
  previousLabel: 'Previous slide',
  nextLabel: 'Next slide',
  indicatorLabel: 'Go to slide',
  previousIcon: 'mdi:chevron-left',
  nextIcon: 'mdi:chevron-right'
})

const currentSlide = ref(0)
const intervalId = ref<ReturnType<typeof setInterval> | null>(null)
const isTransitioning = ref(false)
const transitionName = ref('slide-left')

const carouselRef = ref<HTMLElement | null>(null)

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

const nextSlide = () => {
  if (isTransitioning.value) return
  if (!props.loop && currentSlide.value === props.slides.length - 1) return

  transitionName.value = 'slide-left'
  currentSlide.value = (currentSlide.value + 1) % props.slides.length
  resetAutoplay()
}

const previousSlide = () => {
  if (isTransitioning.value) return
  if (!props.loop && currentSlide.value === 0) return

  transitionName.value = 'slide-right'
  currentSlide.value = currentSlide.value === 0
    ? props.slides.length - 1
    : currentSlide.value - 1
  resetAutoplay()
}

const goToSlide = (index: number) => {
  if (isTransitioning.value || index === currentSlide.value) return
  if (!props.loop && (index < 0 || index >= props.slides.length)) return

  transitionName.value = index > currentSlide.value ? 'slide-left' : 'slide-right'
  currentSlide.value = index
  resetAutoplay()
}

const startAutoplay = () => {
  if (!props.autoplay || props.slides.length <= 1) return
  stopAutoplay()
  intervalId.value = setInterval(() => {
    nextSlide()
  }, props.autoplayInterval)
}

const stopAutoplay = () => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
    intervalId.value = null
  }
}

const resetAutoplay = () => {
  if (props.autoplay) {
    startAutoplay()
  }
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
      goToSlide(props.slides.length - 1)
      break
  }
}

onMounted(() => {
  if (carouselRef.value) {
    carouselRef.value.addEventListener('mouseenter', stopAutoplay)
    carouselRef.value.addEventListener('mouseleave', startAutoplay)
    carouselRef.value.addEventListener('keydown', handleKeydown)
    carouselRef.value.addEventListener('touchstart', handleTouchStart, { passive: true })
    carouselRef.value.addEventListener('touchend', handleTouchEnd, { passive: true })
  }
  startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
  carouselRef.value?.removeEventListener('mouseenter', stopAutoplay)
  carouselRef.value?.removeEventListener('mouseleave', startAutoplay)
  carouselRef.value?.removeEventListener('keydown', handleKeydown)
  carouselRef.value?.removeEventListener('touchstart', handleTouchStart)
  carouselRef.value?.removeEventListener('touchend', handleTouchEnd)
})

// Expose methods for parent component access
defineExpose({
  nextSlide,
  previousSlide,
  goToSlide,
  currentSlide: readonly(currentSlide)
})
</script>

<style scoped>
/* Slide transitions */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.5s ease-in-out;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(10%);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-10%);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-10%);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(10%);
}
</style>
