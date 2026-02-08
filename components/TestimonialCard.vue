<template>
  <div class="relative bg-white rounded-xl p-8 border border-neutral-200 shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-t-primary">
    <!-- Decorative Quote Mark -->
    <div class="absolute top-4 left-4 text-primary/10 pointer-events-none" aria-hidden="true">
      <Icon name="mdi:format-quote-open" class="w-16 h-16" aria-hidden="true" />
    </div>

    <!-- Testimonial Text -->
    <blockquote class="text-lg text-neutral-700 mb-6 italic relative z-10">
      "{{ quote }}"
    </blockquote>

    <!-- Author Info -->
    <div class="flex items-center gap-4 relative z-10">
      <div v-if="avatar" class="w-12 h-12 rounded-full overflow-hidden bg-neutral-100 flex-shrink-0">
        <NuxtImg
          :src="avatar"
          :alt="`${author}${company ? ` from ${company}` : ''} - client testimonial author photo`"
          class="w-full h-full object-cover"
          format="webp"
          loading="lazy"
          width="48"
          height="48"
          placeholder
        />
      </div>
      <div v-else class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0" aria-hidden="true">
        <Icon name="mdi:account" class="w-6 h-6 text-primary" aria-hidden="true" />
      </div>

      <div>
        <div class="font-semibold text-neutral-900">
          {{ author }}
        </div>
        <div v-if="role" class="text-xs text-neutral-500">
          {{ role }}
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
  role?: string
  avatar?: string
}

defineProps<Props>()
</script>
