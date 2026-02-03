<template>
  <div class="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
    <div class="max-w-2xl w-full text-center">
      <!-- Error Icon -->
      <div class="mb-8">
        <div class="inline-flex items-center justify-center w-32 h-32 bg-primary/10 rounded-full">
          <Icon name="mdi:alert-circle-outline" class="w-16 h-16 text-primary" />
        </div>
      </div>

      <!-- Error Code -->
      <h1 class="text-9xl font-display font-bold text-primary mb-4">
        404
      </h1>

      <!-- Error Message -->
      <h2 class="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-4">
        Page Not Found
      </h2>

      <p class="text-xl text-neutral-600 mb-8 max-w-lg mx-auto">
        Sorry, we couldn't find the page you're looking for. The page may have been moved or deleted.
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
          @click="goBack"
          class="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-neutral-300 text-neutral-700 rounded-lg font-semibold hover:border-primary hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <Icon name="mdi:arrow-left" class="w-5 h-5" />
          Go Back
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
useHead({
  title: '404 - Page Not Found | VP Associates',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const goBack = () => {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    window.history.back()
  } else {
    navigateTo('/')
  }
}
</script>
