<template>
  <div
    class="fixed top-0 left-0 right-0 h-1 z-[100] pointer-events-none"
    :class="{ 'opacity-0': !isLoading }"
    role="progressbar"
    :aria-hidden="!isLoading"
    :aria-valuenow="isLoading ? progress : 0"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <div
      class="h-full bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] animate-gradient"
      :style="{ width: `${progress}%` }"
    >
      <div class="h-full w-full shimmer-effect"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
const isLoading = ref(false)
const progress = ref(0)
let intervalId: ReturnType<typeof setInterval> | null = null

const startLoading = () => {
  isLoading.value = true
  progress.value = 0

  // Simulate progress
  intervalId = setInterval(() => {
    if (progress.value < 90) {
      // Random increment for natural feel
      progress.value += Math.random() * 30
    }
  }, 200)
}

const finishLoading = () => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
  progress.value = 100

  // Fade out after completion
  setTimeout(() => {
    isLoading.value = false
    progress.value = 0
  }, 300)
}

// Listen to page loading events
onMounted(() => {
  // Start loading on route change
  const router = useRouter()
  router.beforeEach(() => {
    startLoading()
  })

  router.afterEach(() => {
    finishLoading()
  })
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<style scoped>
@keyframes gradient-move {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animate-gradient {
  animation: gradient-move 2s ease infinite;
}

.shimmer-effect {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>
