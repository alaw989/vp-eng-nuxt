<template>
  <!-- Wave Divider Component -->
  <div
    :class="[
      'w-full overflow-hidden leading-none',
      orientation === 'bottom' ? '-mt-1' : '-mb-1'
    ]"
    :style="{ height: height }"
  >
    <svg
      class="relative block w-full"
      :width="width"
      :height="height"
      preserveAspectRatio="none"
      viewBox="0 0 1200 120"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        v-if="variant === 'wave'"
        :d="wavePath"
        :fill="fill"
      />
      <path
        v-if="variant === 'slant'"
        :d="slantPath"
        :fill="fill"
      />
      <path
        v-if="variant === 'curve'"
        :d="curvePath"
        :fill="fill"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'wave' | 'slant' | 'curve'
  fill?: string
  height?: string
  width?: string
  orientation?: 'top' | 'bottom'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'wave',
  fill: '#ffffff',
  height: '80px',
  width: '100%',
  orientation: 'bottom'
})

const wavePath = 'M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z'

const slantPath = 'M0,0H1200L1200,120L0,120Z'

const curvePath = 'M0,64L80,58.7C160,53.3,320,42.7,480,42.7C640,42.7,800,53.3,960,58.7C1120,64,1200,64,1200,64V120H0V64Z'
</script>
