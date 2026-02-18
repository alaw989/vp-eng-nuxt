<template>
  <div
    ref="counterRef"
    class="stat-item"
    :class="{ visible: isVisible }"
  >
    <div class="text-5xl md:text-6xl font-display font-bold text-white mb-2">
      {{ displayNumber }}<span v-if="suffix">{{ suffix }}</span>
    </div>
    <div class="text-lg md:text-xl text-neutral-300">
      {{ label }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'

interface Props {
  value: number
  label: string
  suffix?: string
  prefix?: string
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  suffix: '',
  prefix: '',
  duration: 2000
})

const counterRef = ref<HTMLElement>()
const isVisible = ref(false)
const animatedValue = ref(0)
const hasAnimated = ref(false)

// Use IntersectionObserver directly from VueUse
const { stop } = useIntersectionObserver(
  counterRef,
  ([entry]) => {
    if (entry?.isIntersecting && !hasAnimated.value) {
      isVisible.value = true
      startAnimation()
      stop() // Only animate once
    }
  },
  { threshold: 0.1 }
)

// Display number with commas for thousands
const displayNumber = computed(() => {
  return Math.round(animatedValue.value).toLocaleString()
})

const startAnimation = () => {
  if (hasAnimated.value) return

  hasAnimated.value = true
  const startValue = 0
  const endValue = props.value
  const startTime = performance.now()

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / props.duration, 1)

    // Ease out quart
    const easeOut = 1 - Math.pow(1 - progress, 4)
    animatedValue.value = startValue + (endValue - startValue) * easeOut

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      animatedValue.value = endValue // Ensure final value
    }
  }

  requestAnimationFrame(animate)
}

// Fallback for elements already in view on mount
onMounted(() => {
  // Check if element is already visible after a short delay
  setTimeout(() => {
    if (!hasAnimated.value && counterRef.value) {
      const rect = counterRef.value.getBoundingClientRect()
      const isInView = rect.top < window.innerHeight && rect.bottom > 0

      if (isInView) {
        isVisible.value = true
        startAnimation()
      }
    }
  }, 300)
})
</script>

<style scoped>
.stat-item {
  text-align: center;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

.stat-item.visible {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .stat-item {
    transition: opacity 0.3s ease;
    transform: none !important;
  }
}
</style>
