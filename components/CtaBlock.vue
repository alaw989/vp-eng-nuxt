<template>
  <section ref="target" class="relative overflow-hidden bg-primary text-white">
    <div class="absolute inset-0 bg-blueprint bg-grid" aria-hidden="true" />

    <!-- One of VP's own shop drawings (two stair towers), drawn in on scroll.
         Anchored to the band itself so the towers stand on its bottom edge
         and use its full height, not just the grid column's. -->
    <figure class="hidden lg:block absolute inset-y-0 right-0 w-1/2 pointer-events-none" aria-hidden="true">
      <BannerDrawing
        src="/images/drawings/stair-towers.svg"
        aspect-ratio="1000 / 1250"
        lazy
        :play="isVisible"
        class="absolute bottom-6 right-[4%] h-[94%] opacity-90"
      />
    </figure>

    <div class="container relative z-10 py-20 md:py-28 lg:py-40 grid lg:grid-cols-2 gap-12 items-center">
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


const { target, isVisible } = useScrollReveal({ threshold: 0.25 })
</script>
