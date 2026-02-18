<template>
  <div class="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
    <div class="max-w-2xl w-full text-center">
      <!-- Error Icon -->
      <div class="mb-8">
        <div class="inline-flex items-center justify-center w-32 h-32 bg-alert/10 rounded-full">
          <Icon name="mdi:alert-octagon-outline" class="w-16 h-16 text-alert" />
        </div>
      </div>

      <!-- Error Code -->
      <h1 class="text-6xl md:text-7xl font-display font-bold text-alert mb-4">
        {{ error?.statusCode || 'Error' }}
      </h1>

      <!-- Error Message -->
      <h2 class="text-2xl md:text-3xl font-display font-bold text-neutral-900 mb-4">
        {{ errorTitle }}
      </h2>

      <p class="text-lg text-neutral-600 mb-8 max-w-lg mx-auto">
        {{ errorDescription }}
      </p>

      <!-- Development Details -->
      <p
        v-if="isDev && error?.message"
        class="text-sm text-red-600 mb-8 p-4 bg-red-50 rounded-lg font-mono text-left overflow-auto max-h-40"
      >
        {{ error.message }}
      </p>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <NuxtLink
          to="/"
          class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <Icon name="mdi:home" class="w-5 h-5" />
          Go to Homepage
        </NuxtLink>
        <button
          v-if="error?.statusCode === 500"
          @click="refreshPage"
          class="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-neutral-300 text-neutral-700 rounded-lg font-semibold hover:border-primary hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <Icon name="mdi:refresh" class="w-5 h-5" />
          Try Again
        </button>
      </div>

      <!-- Helpful Links -->
      <div class="mt-16 pt-8 border-t border-neutral-200">
        <p class="text-sm font-semibold text-neutral-700 mb-4">You might be looking for:</p>
        <div class="flex flex-wrap gap-3 justify-center">
          <NuxtLink
            to="/about"
            class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg text-neutral-700 hover:border-primary hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Icon name="mdi:information" class="w-4 h-4" />
            About Us
          </NuxtLink>
          <NuxtLink
            to="/services"
            class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg text-neutral-700 hover:border-primary hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Icon name="mdi:cog" class="w-4 h-4" />
            Services
          </NuxtLink>
          <NuxtLink
            to="/projects"
            class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg text-neutral-700 hover:border-primary hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Icon name="mdi:briefcase" class="w-4 h-4" />
            Projects
          </NuxtLink>
          <NuxtLink
            to="/contact"
            class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg text-neutral-700 hover:border-primary hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Icon name="mdi:email" class="w-4 h-4" />
            Contact
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ErrorProps {
  error?: {
    statusCode?: number
    message?: string
    statusMessage?: string
  }
}

const props = defineProps<ErrorProps>()

const isDev = import.meta.dev

const errorTitle = computed(() => {
  const statusCode = props.error?.statusCode
  if (statusCode === 500) return 'Server Error'
  if (statusCode === 403) return 'Access Denied'
  if (statusCode === 408) return 'Request Timeout'
  if (statusCode === 503) return 'Service Unavailable'
  return 'Something Went Wrong'
})

const errorDescription = computed(() => {
  const statusCode = props.error?.statusCode
  const statusMessage = props.error?.statusMessage

  if (statusCode === 500) {
    return 'We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.'
  }
  if (statusCode === 403) {
    return "You don't have permission to access this resource."
  }
  if (statusCode === 408) {
    return 'The request timed out. Please check your connection and try again.'
  }
  if (statusCode === 503) {
    return 'Our service is temporarily unavailable. Please try again later.'
  }
  return statusMessage || 'An unexpected error occurred. Please try again or contact us for assistance.'
})

const refreshPage = () => {
  if (typeof window !== 'undefined') {
    window.location.reload()
  }
}

// Set page meta
useHead({
  title: `Error ${props.error?.statusCode || ''} | VP Associates`,
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})
</script>
