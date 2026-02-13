<template>
  <div
    ref="counterRef"
    class="stat-item"
    :class="{ visible: isVisible }"
  >
    <div class="text-5xl md:text-6xl font-display font-bold text-white mb-2">
      {{ Math.round(animatedValue) }}<span v-if="suffix">{{ suffix }}</span>
    </div>
    <div class="text-lg md:text-xl text-neutral-300">
      {{ label }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useScrollReveal } from '~/composables/useScrollReveal'
import { usePreferredReducedMotion } from '@vueuse/core'

interface Props {
  value: number
  label: string
  suffix?: string
  prefix?: string
  duration?: number
  decimals?: number
}

const props = withDefaults(defineProps<Props>(), {
  suffix: '',
  prefix: '',
  duration: 2000,
  decimals: 0
})

const counterRef = ref<HTMLElement>()
const { target, isVisible } = useScrollReveal({ threshold: 0.1 })
const animatedValue = ref(0)
const hasAnimated = ref(false)
const prefersReducedMotion = usePreferredReducedMotion()

const displayValue = computed(() => {
  return props.prefix + animatedValue.value.toFixed(props.decimals)
})

// Format large numbers with commas
const formattedValue = computed(() => {
  if (animatedValue.value >= 1000000) {
    return (animatedValue.value / 1000000).toFixed(1) + 'M'
  } else if (animatedValue.value >= 1000) {
    return (animatedValue.value / 1000).toFixed(1) + 'K'
  }
  return animatedValue.value.toFixed(props.decimals)
})

const animate = () => {
  if (hasAnimated.value || prefersReducedMotion.value) {
    if (prefersReducedMotion.value) {
      animatedValue.value = props.value // Instant display for reduced-motion users
    }
    return
  }

  hasAnimated.value = true
  const startTime = performance.now()
  const startValue = animatedValue.value
  const endValue = props.value

  const updateCounter = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / props.duration, 1)

    // Easing function for smooth animation (ease-out quart)
    const easeOut = 1 - Math.pow(1 - progress, 4)
    animatedValue.value = startValue + (endValue - startValue) * easeOut

    if (progress < 1) {
      requestAnimationFrame(updateCounter)
    }
  }

  requestAnimationFrame(updateCounter)
}

// Ensure ref is properly bound on mount
onMounted(() => {
  if (counterRef.value) {
    target.value = counterRef.value
  }

  // Fallback: if element is already in view but animation hasn't started,
  // trigger it after a short delay. This handles edge cases where
  // IntersectionObserver may not fire due to hydration timing.
  setTimeout(() => {
    if (!hasAnimated.value && counterRef.value) {
      const rect = counterRef.value.getBoundingClientRect()
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        animate()
      }
    }
  }, 500)
})

// Sync target with counterRef for reactive updates
watchEffect(() => {
  target.value = counterRef.value
})

// Start animation when visible
watch(isVisible, (visible) => {
  if (visible && !hasAnimated.value) {
    animate()
  }
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
