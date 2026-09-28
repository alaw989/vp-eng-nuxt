<template>
  <div ref="target">
    <!-- Dimension string: the whole row reads concept to completion -->
    <div class="hidden md:flex items-center gap-3 mb-6 text-xs uppercase tracking-[0.2em] text-neutral-600" aria-hidden="true">
      <span class="h-3 border-l border-neutral-400" />
      <span>Concept</span>
      <span class="flex-1 h-px bg-neutral-400" />
      <span>Completion</span>
      <span class="h-3 border-l border-neutral-400" />
    </div>

    <ol class="grid grid-cols-1 md:grid-cols-4 gap-8">
      <li
        v-for="(step, index) in steps"
        :key="step.title"
        class="relative pl-20 md:pl-0"
      >
        <!-- Station tag -->
        <span
          class="absolute left-0 top-0 md:static w-14 h-14 flex items-center justify-center border-2 font-display text-xl font-bold md:mb-5"
          :class="index === steps.length - 1
            ? 'bg-secondary border-secondary text-white'
            : 'bg-white border-primary text-primary'"
          :data-complete="index === steps.length - 1 ? 'true' : undefined"
          aria-hidden="true"
        >
          {{ String(index + 1).padStart(2, '0') }}
        </span>

        <!-- Connector to the next station: tag edge to tag edge, ending in an arrowhead -->
        <span
          v-if="index < steps.length - 1"
          data-testid="process-connector"
          class="absolute pointer-events-none left-7 top-14 -bottom-8 w-px origin-top md:left-14 md:-right-8 md:top-7 md:bottom-auto md:w-auto md:h-px md:origin-left bg-primary/50 transition-transform duration-700 ease-out motion-reduce:transition-none motion-reduce:!scale-100"
          :class="isVisible ? 'scale-100' : 'scale-y-0 md:scale-y-100 md:scale-x-0'"
          :style="{ transitionDelay: `${index * 200}ms` }"
          aria-hidden="true"
        >
          <svg class="absolute -bottom-1 -left-[3.5px] rotate-90 md:rotate-0 md:bottom-auto md:left-auto md:-right-px md:-top-[3.5px] w-2 h-2 text-primary/70" viewBox="0 0 8 8" fill="currentColor">
            <path d="M0 0 8 4 0 8z" />
          </svg>
        </span>

        <h3 class="text-xl font-bold text-neutral-900 mb-2">
          <span class="sr-only">Step {{ index + 1 }}: </span>{{ step.title }}
        </h3>
        <p class="text-neutral-600 text-sm max-w-[16rem]">{{ step.text }}</p>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { useScrollReveal } from '~/composables/useScrollReveal'

defineProps<{
  steps: { title: string; text: string }[]
}>()

const { target, isVisible } = useScrollReveal({ threshold: 0.3 })
</script>
