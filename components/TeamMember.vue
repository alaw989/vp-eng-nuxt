<template>
  <article class="border border-neutral-300 bg-white">
    <!-- Name -->
    <div class="px-6 py-8 md:px-10 md:py-10">
      <p class="eyebrow text-neutral-500 mb-3">{{ title }}</p>
      <h3 class="font-display text-4xl md:text-6xl font-bold text-primary leading-tight">
        {{ name }}
      </h3>
      <p v-if="bio" class="mt-4 text-lg text-neutral-600 max-w-prose">
        {{ bio }}
      </p>
    </div>

    <!-- Title-block cells -->
    <dl class="grid sm:grid-cols-2 border-t border-neutral-300">
      <div class="px-6 py-4 md:px-10 sm:border-r border-neutral-300">
        <dt class="eyebrow text-neutral-500 mb-1">Firm</dt>
        <dd class="font-semibold text-neutral-900">VP &amp; Associates, Inc. · Tampa, FL</dd>
      </div>
      <div class="px-6 py-4 md:px-10 border-t sm:border-t-0 border-neutral-300">
        <dt class="eyebrow text-neutral-500 mb-1">Contact</dt>
        <dd class="flex flex-wrap items-center gap-x-5 gap-y-1 font-semibold">
          <a
            v-if="email"
            :href="`mailto:${email}`"
            class="text-primary hover:underline rounded-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            :aria-label="`Email ${name}`"
          >{{ email }}</a>
          <a
            v-if="telHref"
            :href="telHref"
            class="text-primary hover:underline rounded-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            :aria-label="`Call ${name}`"
          >{{ phone }}</a>
          <a
            v-if="linkedin"
            :href="linkedin"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary hover:underline rounded-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            :aria-label="`${name}'s LinkedIn`"
          >LinkedIn</a>
        </dd>
      </div>
    </dl>
  </article>
</template>

<script setup lang="ts">
interface Props {
  name: string
  title: string
  bio?: string
  email?: string
  phone?: string
  linkedin?: string
}

const props = defineProps<Props>()

// Only link a real 10-digit US number; CMS placeholders would make a dead call button
const telHref = computed(() => {
  const digits = (props.phone || '').replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '')
  return digits.length === 10 ? `tel:+1${digits}` : ''
})
</script>
