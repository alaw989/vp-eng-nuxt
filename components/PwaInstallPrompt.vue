<script setup lang="ts">
const { $pwa } = useNuxtApp()

// Show install prompt when PWA can be installed
const canInstall = computed(() => {
  const showPrompt = $pwa?.showInstallPrompt
  const isInstalled = $pwa?.isPWAInstalled
  return showPrompt === true && (isInstalled === false || isInstalled === undefined)
})

// Install the PWA (triggers browser native prompt)
async function installApp() {
  await $pwa?.install()
}
</script>

<!-- Sits in the footer's bottom bar; in the header it crowded tablets.
     No aria-label: the visible "Install App" is the accessible name (WCAG 2.5.3). -->
<template>
  <ClientOnly>
    <button
      v-if="canInstall"
      type="button"
      class="text-neutral-400 hover:text-white transition-colors duration-300 flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 rounded-sm px-2 py-1"
      @click="installApp"
      title="Install this app on your device for offline access"
    >
      <Icon name="mdi:download" class="w-5 h-5" aria-hidden="true" />
      Install App
    </button>
  </ClientOnly>
</template>
