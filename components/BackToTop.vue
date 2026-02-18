<template>
  <!-- Only show progress indicator when visible -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 scale-75"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-75"
  >
    <div
      v-if="isVisible && scrollProgress > 0"
      class="fixed bottom-8 right-8 z-40 pointer-events-none"
      :aria-label="`Page scroll progress: ${Math.round(scrollProgress * 100)}%`"
    >
      <svg
        class="w-12 h-12 -rotate-90"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <!-- Background track circle -->
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="#033379"
          stroke-width="2.5"
          stroke-opacity="0.2"
        />
        <!-- Progress circle -->
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="#4ADE80"
          stroke-width="2.5"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
          class="transition-all duration-150"
        />
      </svg>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const isVisible = ref(false)
const scrollProgress = ref(0)
const circumference = 2 * Math.PI * 10 // radius of 10

const dashOffset = computed(() => {
  return circumference * (1 - scrollProgress.value)
})

onMounted(() => {
  const handleScroll = () => {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    scrollProgress.value = scrollTop > 0 ? Math.min(scrollTop / docHeight, 1) : 0
    isVisible.value = scrollTop > 100 && scrollProgress.value > 0
  }

  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll() // Initial check

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })
})

// Expose for testing
defineExpose({
  isVisible,
  scrollProgress,
  circumference,
  dashOffset
})
</script>
