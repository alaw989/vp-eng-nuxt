<template>
  <div class="flex items-center gap-3">
    <span class="text-sm font-medium text-neutral-600">Share:</span>
    <div class="flex gap-2">
      <!-- Twitter/X -->
      <a
        :href="twitterUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-neutral-100 hover:bg-[#1DA1F2] hover:text-white text-neutral-600 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        :aria-label="`Share ${title} on X (Twitter)`"
        title="Share on X"
      >
        <Icon name="mdi:twitter" class="w-5 h-5" />
      </a>

      <!-- LinkedIn -->
      <a
        :href="linkedinUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-neutral-100 hover:bg-[#0077B5] hover:text-white text-neutral-600 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        :aria-label="`Share ${title} on LinkedIn`"
        title="Share on LinkedIn"
      >
        <Icon name="mdi:linkedin" class="w-5 h-5" />
      </a>

      <!-- Facebook -->
      <a
        :href="facebookUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-neutral-100 hover:bg-[#4267B2] hover:text-white text-neutral-600 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        :aria-label="`Share ${title} on Facebook`"
        title="Share on Facebook"
      >
        <Icon name="mdi:facebook" class="w-5 h-5" />
      </a>

      <!-- Email -->
      <a
        :href="emailUrl"
        class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-neutral-100 hover:bg-primary hover:text-white text-neutral-600 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        :aria-label="`Share ${title} via email`"
        title="Share via email"
      >
        <Icon name="mdi:email" class="w-5 h-5" />
      </a>

      <!-- Copy Link -->
      <button
        @click="copyLink"
        class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-neutral-100 hover:bg-neutral-800 hover:text-white text-neutral-600 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        :aria-label="copied ? 'Link copied!' : `Copy link to ${title}`"
        :title="copied ? 'Copied!' : 'Copy link'"
      >
        <Icon :name="copied ? 'mdi:check' : 'mdi:link-variant'" class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  description?: string
}>()

const route = useRoute()
const config = useRuntimeConfig()

const siteUrl = config.public.siteUrl || 'https://vp-associates.com'
const fullUrl = computed(() => `${siteUrl}${route.fullPath}`)
const shareDescription = computed(() => props.description || 'VP Associates - Structural Engineering Services')

// Twitter/X share URL
const twitterUrl = computed(() => {
  const text = encodeURIComponent(`${props.title} - ${shareDescription.value}`)
  const url = encodeURIComponent(fullUrl.value)
  return `https://twitter.com/intent/tweet?text=${text}&url=${url}`
})

// LinkedIn share URL
const linkedinUrl = computed(() => {
  const url = encodeURIComponent(fullUrl.value)
  return `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
})

// Facebook share URL
const facebookUrl = computed(() => {
  const url = encodeURIComponent(fullUrl.value)
  return `https://www.facebook.com/sharer/sharer.php?u=${url}`
})

// Email share URL
const emailUrl = computed(() => {
  const subject = encodeURIComponent(props.title)
  const body = encodeURIComponent(`${shareDescription.value}\n\n${fullUrl.value}`)
  return `mailto:?subject=${subject}&body=${body}`
})

// Copy link to clipboard
const copied = ref(false)

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(fullUrl.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy link:', err)
  }
}
</script>
