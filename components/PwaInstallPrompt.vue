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

<template>
  <ClientOnly>
    <button
      v-if="canInstall"
      type="button"
      class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
      @click="installApp"
      title="Install app on your device"
    >
      <Icon name="mdi:download" class="inline mr-1" />
      Install App
    </button>
  </ClientOnly>
</template>
