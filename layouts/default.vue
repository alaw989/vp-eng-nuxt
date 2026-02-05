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
    <main id="main-content" class="flex-1" tabindex="-1" role="main">
      <slot />
    </main>
    <AppFooter role="contentinfo" />
    <LazyBackToTop />

    <!-- PWA Components -->
    <LazyPwaReloadPrompt />
    <LazyPwaInstallPrompt />
  </div>
</template>
