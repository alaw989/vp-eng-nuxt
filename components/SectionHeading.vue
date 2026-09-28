<template>
  <div class="mb-12 max-w-3xl">
    <p v-if="eyebrow" class="eyebrow mb-3" :class="dark ? 'text-white/80' : 'text-secondary'">
      {{ eyebrow }}
    </p>
    <component
      :is="as"
      class="text-4xl md:text-5xl font-display font-bold"
      :class="[dark ? 'text-white' : 'text-neutral-900', lede ? 'mb-4' : '']"
    >
      {{ title }}
    </component>
    <p v-if="lede" class="text-lg md:text-xl" :class="dark ? 'text-neutral-300' : 'text-neutral-600'">
      {{ lede }}
    </p>
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  eyebrow?: string
  lede?: string
  /** Light text for navy and dark bands */
  dark?: boolean
  as?: 'h1' | 'h2' | 'h3'
}>(), {
  eyebrow: '',
  lede: '',
  dark: false,
  as: 'h2'
})
</script>
