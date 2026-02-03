<template>
  <div class="group p-8 bg-white rounded-xl border border-neutral-200 hover:border-primary hover:shadow-xl transition-all duration-300">
    <div class="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
      <Icon :name="icon" class="w-8 h-8 text-primary group-hover:text-white transition-colors" />
    </div>
    <h3 class="text-xl font-bold text-neutral-900 mb-3">
      {{ title }}
    </h3>
    <p class="text-neutral-600">
      {{ description }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
  icon: string
}>()
</script>
