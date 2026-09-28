<template>
  <div ref="target">
    <!-- Scale ruler: minor ticks every 12px, major every 120px -->
    <div
      class="relative h-7 mb-6 overflow-hidden origin-left transition-transform duration-1000 ease-out motion-reduce:transition-none motion-reduce:!scale-x-100"
      :class="isVisible ? 'scale-x-100' : 'scale-x-0'"
      aria-hidden="true"
    >
      <div class="absolute inset-x-0 bottom-0 h-px bg-white/50" />
      <div class="absolute inset-x-0 bottom-0 h-2 bg-[repeating-linear-gradient(to_right,rgb(255_255_255/0.4)_0_1px,transparent_1px_12px)]" />
      <div class="absolute inset-x-0 bottom-0 h-4 bg-[repeating-linear-gradient(to_right,rgb(255_255_255/0.7)_0_1px,transparent_1px_120px)]" />
      <span
        v-for="(mark, i) in rulerMarks"
        :key="mark"
        class="absolute top-0 text-[0.625rem] uppercase tracking-[0.2em] text-white/70"
        :class="i === 0 ? '' : '-translate-x-1/2'"
        :style="{ left: `${i * 120}px` }"
      >{{ mark }}</span>
    </div>

    <ul class="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/30 border border-white/30">
      <li
        v-for="(stat, i) in stats"
        :key="stat.label"
        class="bg-primary p-6 md:p-8"
      >
        <span class="block text-[0.625rem] uppercase tracking-[0.2em] text-white/60 mb-4" aria-hidden="true">A{{ i + 1 }}</span>
        <span class="block text-5xl md:text-6xl font-display font-bold text-white mb-2 tabular-nums">
          {{ stat.count ? displayed[i] : stat.value }}{{ stat.suffix }}
        </span>
        <span class="block text-base md:text-lg font-semibold text-white">{{ stat.label }}</span>
        <!-- Keep each separator with the word before it so a line never starts with one -->
        <span class="block mt-2 text-xs uppercase tracking-[0.15em] text-white/70">
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

const rulerMarks = ['0', '10', '20', '30', '40', '50', '60', '70', '80', '90 FT']

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
