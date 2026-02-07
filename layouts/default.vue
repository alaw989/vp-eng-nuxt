<template>
  <div class="min-h-screen flex flex-col">
    <!-- PWA Manifest -->
    <NuxtPwaAssets />
    <!-- Page loading progress bar -->
    <PageLoadingBar />

    <!-- Skip to main content link for accessibility -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:font-semibold"
    >
      Skip to main content
    </a>

    <AppHeader role="banner" />
    <main ref="mainContentRef" id="main-content" class="flex-1" role="main">
      <slot />
    </main>
    <AppFooter role="contentinfo" />
    <LazyBackToTop />

    <!-- PWA Components -->
    <LazyPwaReloadPrompt />

    <!-- Live region for screen reader announcements -->
    <div
      aria-live="polite"
      aria-atomic="true"
      class="sr-only"
    >
      {{ a11yAnnouncement }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useA11yRouteAnnouncer, useAnnouncer } from '~/composables/useA11y'

const mainContentRef = ref<HTMLElement | null>(null)
const route = useRoute()

// Focus main content on route change for screen reader accessibility
watch(() => route.path, async () => {
  await nextTick()
  if (mainContentRef.value) {
    mainContentRef.value.tabIndex = -1
    mainContentRef.value.focus()
  }
})

// This will automatically announce route changes
useA11yRouteAnnouncer()

// Expose message for template
const { message: a11yAnnouncement } = useAnnouncer()
</script>
