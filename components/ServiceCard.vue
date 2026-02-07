<template>
  <NuxtLink
    :to="`/services/${slug}`"
    class="group block p-8 bg-white rounded-xl border border-neutral-200 hover:border-primary hover:shadow-xl transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    :aria-label="`Learn more about ${title} services`"
  >
    <div class="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
      <Icon :name="icon" class="w-8 h-8 text-primary group-hover:text-white transition-colors" aria-hidden="true" />
    </div>
    <h3 class="text-xl font-bold text-neutral-900 mb-3 group-hover:text-primary transition-colors">
      {{ title }}
    </h3>
    <p class="text-neutral-600 mb-4">
      {{ description }}
    </p>
    <span class="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
      Learn more
      <Icon name="mdi:arrow-right" class="w-4 h-4" aria-hidden="true" />
    </span>
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
