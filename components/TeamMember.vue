<template>
  <div class="card group overflow-hidden hover:border-primary">
    <!-- Photo -->
    <div class="aspect-[4/5] overflow-hidden bg-neutral-100">
      <NuxtImg
        v-if="photo"
        :src="photo"
        :alt="`${name}, ${title}${bio ? ' - VP Associates team member' : ''}`"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        format="webp"
        quality="85"
        :loading="priority ? 'eager' : 'lazy'"
        :fetchpriority="priority ? 'high' : 'auto'"
        :width="400"
        :height="500"
        :placeholder="!priority"
      />
      <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary-dark/20" aria-hidden="true">
        <Icon name="mdi:account-tie" class="w-20 h-20 text-primary/40" aria-hidden="true" />
      </div>
    </div>

    <!-- Member Info -->
    <div class="p-6">
      <h3 class="text-xl font-bold text-neutral-900 mb-1">
        {{ name }}
      </h3>
      <div class="text-primary font-semibold mb-3">
        {{ title }}
      </div>
      <p v-if="bio" class="text-neutral-600 text-sm mb-4 line-clamp-3">
        {{ bio }}
      </p>

      <!-- Contact Links -->
      <div v-if="email || telHref || linkedin" class="flex items-center gap-3 pt-3 border-t border-neutral-200">
        <a
          v-if="email"
          :href="`mailto:${email}`"
          class="text-neutral-500 hover:text-primary transition-colors rounded-sm p-1 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          :aria-label="`Email ${name}`"
        >
          <Icon name="mdi:email" class="w-5 h-5" />
        </a>
        <a
          v-if="telHref"
          :href="telHref"
          class="text-neutral-500 hover:text-primary transition-colors rounded-sm p-1 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          :aria-label="`Call ${name}`"
        >
          <Icon name="mdi:phone" class="w-5 h-5" />
        </a>
        <a
          v-if="linkedin"
          :href="linkedin"
          target="_blank"
          rel="noopener noreferrer"
          class="text-neutral-500 hover:text-primary transition-colors rounded-sm p-1 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          :aria-label="`${name}'s LinkedIn`"
        >
          <Icon name="mdi:linkedin" class="w-5 h-5" />
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  name: string
  title: string
  bio?: string
  photo?: string
  email?: string
  phone?: string
  linkedin?: string
  priority?: boolean
}

const props = defineProps<Props>()

// Only link a real 10-digit US number; CMS placeholders would make a dead call button
const telHref = computed(() => {
  const digits = (props.phone || '').replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '')
  return digits.length === 10 ? `tel:+1${digits}` : ''
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
