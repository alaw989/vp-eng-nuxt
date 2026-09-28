<template>
  <section ref="target" class="relative overflow-hidden bg-primary text-white">
    <div class="absolute inset-0 bg-blueprint bg-grid" aria-hidden="true" />

    <div class="container relative z-10 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
      <div>
        <p class="eyebrow mb-4 text-white/80">
          Next step
        </p>
        <h2 class="text-4xl md:text-6xl font-display font-bold mb-6">
          {{ headline }}
        </h2>
        <p v-if="subheadline" class="text-lg md:text-xl text-white/90 mb-10 max-w-xl">
          {{ subheadline }}
        </p>

        <div class="flex flex-col sm:flex-row gap-4">
          <NuxtLink
            :to="primaryTo"
            class="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary rounded-sm font-semibold hover:bg-neutral-100 transition-colors focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
          >
            {{ primaryLabel }}
            <Icon name="mdi:arrow-right" class="w-5 h-5 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" />
          </NuxtLink>
          <NuxtLink
            v-if="secondaryLabel && secondaryTo"
            :to="secondaryTo"
            class="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/70 text-white rounded-sm font-semibold hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
          >
            {{ secondaryLabel }}
          </NuxtLink>
          <a
            v-else
            :href="`tel:${phoneHref}`"
            class="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/70 text-white rounded-sm font-semibold hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
          >
            <Icon name="mdi:phone" class="w-5 h-5" aria-hidden="true" />
            {{ phone }}
          </a>
        </div>

        <p class="mt-6 text-white/80">
          Or email
          <a :href="`mailto:${email}`" class="text-white underline underline-offset-4 decoration-white/50 hover:decoration-white">{{ email }}</a>
        </p>
      </div>

      <!-- Braced steel frame, drawn in on scroll -->
      <figure class="hidden md:block" aria-hidden="true">
        <svg viewBox="0 0 400 300" class="w-full h-auto" fill="none" stroke="currentColor" stroke-linecap="square">
          <g class="text-white" stroke-width="2">
            <path
              v-for="(d, i) in framePaths"
              :key="i"
              :d="d"
              pathLength="1"
              class="[stroke-dasharray:1] transition-[stroke-dashoffset] duration-[1400ms] ease-out motion-reduce:transition-none motion-reduce:[stroke-dashoffset:0]"
              :class="isVisible ? '[stroke-dashoffset:0]' : '[stroke-dashoffset:1]'"
              :style="{ transitionDelay: `${i * 120}ms` }"
            />
          </g>
        </svg>
      </figure>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useScrollReveal } from '~/composables/useScrollReveal'

withDefaults(defineProps<{
  headline: string
  subheadline?: string
  primaryLabel?: string
  primaryTo?: string
  secondaryLabel?: string
  secondaryTo?: string
}>(), {
  subheadline: '',
  primaryLabel: 'Contact Us',
  primaryTo: '/contact',
  secondaryLabel: '',
  secondaryTo: ''
})

const phone = '(813) 486-2079'
const phoneHref = '+18134862079'
const email = 'info@vp-associates.com'

// Columns, beam, knee braces, base plates and grade line, in drawing order
const framePaths = [
  'M74 246V70M86 246V82',
  'M314 82V246M326 70V246',
  'M74 70H326M86 82H314',
  'M86 126L130 82M314 126L270 82',
  'M62 246H98M302 246H338',
  'M40 252H360'
]

const { target, isVisible } = useScrollReveal({ threshold: 0.25 })
</script>
