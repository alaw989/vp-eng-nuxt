<script setup lang="ts">
const { $pwa } = useNuxtApp()

// Show install prompt when PWA can be installed
const showInstallPrompt = computed(() => {
  // showInstallPrompt and isPWAInstalled are Ref<boolean>
  const showPrompt = $pwa?.showInstallPrompt
  const isInstalled = $pwa?.isPWAInstalled
  return showPrompt === true && (isInstalled === false || isInstalled === undefined)
})

// Install the PWA
async function installApp() {
  await $pwa?.install()
}

// Cancel the install prompt
function cancelInstall() {
  $pwa?.cancelInstall()
}
</script>

<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="transform translate-y-full opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform translate-y-full opacity-0"
  >
    <div
      v-if="showInstallPrompt"
      class="fixed bottom-0 left-0 right-0 z-50 sm:bottom-4 sm:left-auto sm:right-4 sm:max-w-md"
      role="alertdialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-description"
    >
      <div class="bg-white dark:bg-gray-800 rounded-t-lg sm:rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 mx-0 sm:mx-0">
        <div class="p-4">
          <div class="flex items-start">
            <!-- Icon -->
            <div class="flex-shrink-0">
              <div class="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
                <Icon
                  name="mdi:download"
                  class="h-6 w-6 text-white"
                  aria-hidden="true"
                />
              </div>
            </div>

            <!-- Content -->
            <div class="ml-4 flex-1">
              <h3
                id="pwa-install-title"
                class="text-base font-medium text-gray-900 dark:text-white"
              >
                Install App
              </h3>
              <p
                id="pwa-install-description"
                class="mt-1 text-sm text-gray-500 dark:text-gray-400"
              >
                Install VP Associates on your device for quick access and offline support.
              </p>
            </div>

            <!-- Close button -->
            <button
              type="button"
              class="ml-4 flex-shrink-0 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition-colors"
              @click="cancelInstall"
              aria-label="Close"
            >
              <Icon name="mdi:close" class="h-5 w-5" />
            </button>
          </div>

          <!-- Actions -->
          <div class="mt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <button
              type="button"
              class="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              @click="cancelInstall"
            >
              Not now
            </button>
            <button
              type="button"
              class="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              @click="installApp"
            >
              <Icon name="mdi:download" class="mr-2 -ml-1 h-4 w-4" />
              Install
            </button>
          </div>

          <!-- Install info -->
          <p class="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
            You can remove the app anytime from your device settings
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>
