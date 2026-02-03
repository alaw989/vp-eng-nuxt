<template>
  <NuxtLink
    :to="`/projects/${slug}`"
    class="group block overflow-hidden rounded-xl bg-white border border-neutral-200 hover:border-primary hover:shadow-2xl transition-all duration-300"
  >
    <!-- Project Image -->
    <div class="aspect-[4/3] overflow-hidden bg-neutral-100">
      <NuxtImg
        v-if="image"
        :src="image"
        :alt="title"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        format="webp"
        loading="lazy"
      />
      <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary-dark/20">
        <Icon name="mdi:building" class="w-16 h-16 text-primary/40" />
      </div>
    </div>

    <!-- Project Content -->
    <div class="p-6">
      <div v-if="category" class="inline-block px-3 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-full mb-3">
        {{ category }}
      </div>
      <h3 class="text-xl font-bold text-neutral-900 mb-2 group-hover:text-primary transition-colors">
        {{ title }}
      </h3>
      <p v-if="description" class="text-neutral-600 text-sm mb-4 line-clamp-2">
        {{ description }}
      </p>

      <!-- Project Meta -->
      <div v-if="location || year" class="flex items-center gap-4 text-sm text-neutral-500">
        <span v-if="location" class="flex items-center gap-1">
          <Icon name="mdi:map-marker" class="w-4 h-4" />
          {{ location }}
        </span>
        <span v-if="year" class="flex items-center gap-1">
          <Icon name="mdi:calendar" class="w-4 h-4" />
          {{ year }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
interface Props {
  title: string
  slug: string
  description?: string
  image?: string
  category?: string
  location?: string
  year?: number | string
}

defineProps<Props>()
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
