<template>
  <NuxtLink
    :to="`/projects/${slug}`"
    :class="[
      'group overflow-hidden rounded-xl transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
      darkMode
        ? 'bg-neutral-800/80 border border-neutral-700 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1 backdrop-blur-sm'
        : 'bg-white border border-neutral-200 hover:border-primary hover:shadow-2xl hover:-translate-y-1',
      viewMode === 'list' ? 'flex flex-col md:flex-row' : 'block'
    ]"
    :aria-label="`View project: ${title}${category ? ` - ${category}` : ''}${location ? ` in ${location}` : ''}`"
  >
    <!-- Project Image -->
    <div :class="[
      'overflow-hidden bg-neutral-100',
      viewMode === 'list' ? 'md:w-1/3 md:flex-shrink-0 aspect-video md:aspect-auto' : 'aspect-[4/3]'
    ]">
      <NuxtImg
        v-if="image"
        :src="image"
        :alt="`${title}${category ? ` - ${category} project` : ' project'}${location ? ` in ${location}` : ''}`"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        format="webp"
        :loading="priority ? 'eager' : 'lazy'"
        :fetchpriority="priority ? 'high' : 'auto'"
        :width="800"
        :height="600"
        :placeholder="!priority"
      />
      <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary-dark/20" aria-hidden="true">
        <Icon name="mdi:building" class="w-16 h-16 text-primary/40" aria-hidden="true" />
      </div>
    </div>

    <!-- Project Content -->
    <div :class="[
      'flex flex-col',
      viewMode === 'list' ? 'p-6 md:w-2/3' : 'p-6'
    ]">
      <div v-if="category" :class="[
        'inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3 self-start',
        darkMode
          ? 'text-primary-light bg-primary/20'
          : 'text-primary bg-primary/10'
      ]">
        {{ category }}
      </div>
      <h3 :class="[
        'text-xl font-bold mb-2 group-hover:text-primary transition-colors',
        darkMode ? 'text-white' : 'text-neutral-900'
      ]">
        {{ title }}
      </h3>
      <p v-if="description" :class="[
        'text-sm mb-4 line-clamp-2',
        darkMode ? 'text-neutral-400' : 'text-neutral-600'
      ]">
        {{ description }}
      </p>

      <!-- Project Meta -->
      <div v-if="location || year" :class="[
        'flex items-center gap-4 text-sm mt-auto',
        darkMode ? 'text-neutral-500' : 'text-neutral-500'
      ]">
        <span v-if="location" class="flex items-center gap-1">
          <Icon name="mdi:map-marker" class="w-4 h-4" aria-hidden="true" />
          {{ location }}
        </span>
        <span v-if="year" class="flex items-center gap-1">
          <Icon name="mdi:calendar" class="w-4 h-4" aria-hidden="true" />
          {{ year }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
type ViewMode = 'grid' | 'list'

interface Props {
  title: string
  slug: string
  description?: string
  image?: string
  category?: string
  location?: string
  year?: number | string
  viewMode?: ViewMode
  priority?: boolean
  darkMode?: boolean
}

withDefaults(defineProps<Props>(), {
  viewMode: 'grid',
  priority: false,
  darkMode: false
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
