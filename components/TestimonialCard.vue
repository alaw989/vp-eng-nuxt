<template>
  <div class="bg-white rounded-xl p-8 border border-neutral-200 shadow-lg">
    <!-- Quote Icon -->
    <div class="text-primary/20 mb-4">
      <Icon name="mdi:format-quote-open" class="w-12 h-12" />
    </div>

    <!-- Testimonial Text -->
    <blockquote class="text-lg text-neutral-700 mb-6 italic">
      "{{ quote }}"
    </blockquote>

    <!-- Author Info -->
    <div class="flex items-center gap-4">
      <div v-if="avatar" class="w-12 h-12 rounded-full overflow-hidden bg-neutral-100 flex-shrink-0">
        <NuxtImg
          :src="avatar"
          :alt="author"
          class="w-full h-full object-cover"
          format="webp"
          loading="lazy"
        />
      </div>
      <div v-else class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon name="mdi:account" class="w-6 h-6 text-primary" />
      </div>

      <div>
        <div class="font-semibold text-neutral-900">
          {{ author }}
        </div>
        <div v-if="company" class="text-sm text-neutral-600">
          {{ company }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  quote: string
  author: string
  company?: string
  avatar?: string
}

defineProps<Props>()
</script>
