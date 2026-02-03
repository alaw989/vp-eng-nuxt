<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-4"
  >
    <button
      v-if="isVisible"
      @click="scrollToTop"
      class="fixed bottom-8 right-8 z-40 p-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      :aria-label="`Scroll to top${scrollProgress > 0 ? ` (${Math.round(scrollProgress * 100)}% scrolled)` : ''}`"
    >
      <Icon name="mdi:arrow-up" class="w-6 h-6" />
      <!-- Circular progress indicator -->
      <svg
        class="absolute inset-0 w-full h-full -rotate-90"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="text-primary/20"
        />
        <circle
          v-if="scrollProgress > 0"
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="white"
          stroke-width="2"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
          class="transition-all duration-150"
        />
      </svg>
    </button>
  </Transition>
</template>

<script setup lang="ts">
const isVisible = ref(false)
const scrollProgress = ref(0)
const circumference = 2 * Math.PI * 10 // radius of 10

const dashOffset = computed(() => {
  return circumference * (1 - scrollProgress.value)
})

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  const handleScroll = () => {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    scrollProgress.value = scrollTop > 0 ? Math.min(scrollTop / docHeight, 1) : 0
    isVisible.value = scrollTop > 400
  }

  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll() // Initial check

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })
})
</script>
