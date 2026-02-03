<template>
  <div class="min-h-screen flex flex-col">
    <!-- Skip to main content link for accessibility -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:font-semibold"
    >
      Skip to main content
    </a>

    <AppHeader />
    <main id="main-content" class="flex-1" tabindex="-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
