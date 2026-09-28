<template>
  <div ref="target">
    <ul class="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/30 border border-white/30">
      <li
        v-for="(stat, i) in stats"
        :key="stat.label"
        class="bg-primary p-6 md:p-8"
      >
        <span class="block text-5xl md:text-6xl font-display font-bold text-white mb-2 tabular-nums">
          {{ stat.count ? displayed[i] : stat.value }}{{ stat.suffix }}
        </span>
        <span class="block text-base md:text-lg font-semibold text-white">{{ stat.label }}</span>
        <!-- Keep each separator with the word before it so a line never starts with one -->
        <span class="block mt-2 eyebrow text-white/70">
          <template v-for="(part, j) in stat.detail.split(' · ')" :key="part">
            <span class="whitespace-nowrap">{{ part }}{{ j < stat.detail.split(' · ').length - 1 ? ' ·' : '' }}</span>{{ ' ' }}
          </template>
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useScrollReveal } from '~/composables/useScrollReveal'

interface Stat {
  value: number
  label: string
  detail: string
  suffix?: string
  /** Count up from 0 on first view. Off for years. */
  count?: boolean
}

const props = defineProps<{ stats: Stat[] }>()

const { target, isVisible } = useScrollReveal({ threshold: 0.3 })

// Server and first paint show the real numbers. Only when the band starts
// off-screen do they reset to 0 and count up as it scrolls into view.
const displayed = ref(props.stats.map(s => s.value))

onMounted(() => {
  const el = target.value
  if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (el.getBoundingClientRect().top < window.innerHeight) return

  displayed.value = props.stats.map(s => (s.count ? 0 : s.value))
  const stopWatch = watch(isVisible, (visible) => {
    if (!visible) return
    stopWatch()
    const start = performance.now()
    const duration = 1500
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      displayed.value = props.stats.map(s => (s.count ? Math.round(s.value * eased) : s.value))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
})
</script>
