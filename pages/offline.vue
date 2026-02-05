<script setup lang="ts">
usePageMeta({
  title: 'Offline - VP Associates',
  description: 'You are currently offline. Please check your internet connection.',
  robots: 'noindex, nofollow',
})

// Reload page function
function reloadPage() {
  if (typeof window !== 'undefined') {
    window.location.reload()
  }
}
</script>

<template>
  <div class="min-h-[60vh] flex items-center justify-center px-4">
    <div class="max-w-2xl mx-auto text-center">
      <!-- Offline Icon -->
      <div class="mb-8 flex justify-center">
        <div class="relative">
          <Icon
            name="mdi:wifi-off"
            class="text-8xl text-gray-300 dark:text-gray-600"
          />
          <div
            class="absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
          >
            <Icon
              name="mdi:close-circle"
              class="text-4xl text-red-500"
            />
          </div>
        </div>
      </div>

      <!-- Heading -->
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
        You're Offline
      </h1>

      <!-- Message -->
      <p class="text-xl text-gray-600 dark:text-gray-400 mb-8">
        It looks like you've lost your internet connection. Some features may not be available.
      </p>

      <!-- Tips -->
      <div class="bg-blue-50 dark:bg-gray-800 rounded-lg p-6 mb-8 text-left">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          What you can do:
        </h2>
        <ul class="space-y-2 text-gray-700 dark:text-gray-300">
          <li class="flex items-start">
            <Icon
              name="mdi:check-circle"
              class="text-green-500 mr-2 mt-0.5 flex-shrink-0"
            />
            <span>Check your internet connection</span>
          </li>
          <li class="flex items-start">
            <Icon
              name="mdi:check-circle"
              class="text-green-500 mr-2 mt-0.5 flex-shrink-0"
            />
            <span>Browse previously cached pages</span>
          </li>
          <li class="flex items-start">
            <Icon
              name="mdi:check-circle"
              class="text-green-500 mr-2 mt-0.5 flex-shrink-0"
            />
            <span>View our contact information for later reference</span>
          </li>
        </ul>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          @click="reloadPage()"
          class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
        >
          <Icon name="mdi:refresh" class="mr-2" />
          Try Again
        </button>
        <NuxtLink
          to="/"
          class="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
        >
          <Icon name="mdi:home" class="mr-2" />
          Go to Home
        </NuxtLink>
      </div>

      <!-- Contact Info -->
      <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Contact Information
        </h2>
        <div class="grid md:grid-cols-2 gap-6 text-left">
          <div>
            <h3 class="font-medium text-gray-900 dark:text-white mb-2">
              <Icon name="mdi:phone" class="inline mr-1" />
              Phone
            </h3>
            <a
              href="tel:+18132889880"
              class="text-primary hover:text-primary/80 transition-colors"
            >
              (813) 288-9880
            </a>
          </div>
          <div>
            <h3 class="font-medium text-gray-900 dark:text-white mb-2">
              <Icon name="mdi:email" class="inline mr-1" />
              Email
            </h3>
            <a
              href="mailto:info@vp-associates.com"
              class="text-primary hover:text-primary/80 transition-colors"
            >
              info@vp-associates.com
            </a>
          </div>
          <div class="md:col-span-2">
            <h3 class="font-medium text-gray-900 dark:text-white mb-2">
              <Icon name="mdi:map-marker" class="inline mr-1" />
              Address
            </h3>
            <address class="not-italic text-gray-600 dark:text-gray-400">
              4012 Henderson Blvd<br>
              Tampa, FL 33629
            </address>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
