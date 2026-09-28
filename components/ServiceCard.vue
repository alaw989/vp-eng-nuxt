<template>
  <NuxtLink
    :to="`/services/${slug}`"
    class="group relative block p-8 bg-white rounded-xl border border-neutral-200 hover:border-primary hover:shadow-xl hover:-translate-y-1 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    :aria-label="`${title} services`"
  >
    <Icon name="mdi:arrow-top-right" class="absolute top-8 right-8 w-5 h-5 text-neutral-400 group-hover:text-primary transition-colors" aria-hidden="true" />
    <div class="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
      <Icon :name="icon" class="w-8 h-8 text-primary group-hover:text-white transition-colors" aria-hidden="true" />
    </div>
    <h3 class="text-xl font-bold text-neutral-900 mb-3 group-hover:text-primary transition-colors">
      {{ title }}
    </h3>
    <p class="text-neutral-600">
      {{ description }}
    </p>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  slug: string
  description: string
  icon: string
}>()
</script>
