<script setup lang="ts">
const { $pwa } = useNuxtApp()

// Show update prompt when new content is available
const showUpdatePrompt = computed(() => {
  const needRefresh = $pwa?.needRefresh
  return needRefresh === true
})

// Show offline ready prompt when app is ready to work offline
const showOfflinePrompt = computed(() => {
  const offlineReady = $pwa?.offlineReady
  return offlineReady === true
})

// Update service worker and reload page
async function updateApp() {
  await $pwa?.updateServiceWorker(true)
}

// Close the prompt
function closePrompt() {
  $pwa?.cancelPrompt()
}
</script>

<template>
  <!-- Update Available Prompt -->
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="transform translate-y-full opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform translate-y-full opacity-0"
  >
    <div
      v-if="showUpdatePrompt"
      class="fixed bottom-0 left-0 right-0 z-50 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-md"
      role="alert"
      aria-live="polite"
    >
      <div class="bg-white dark:bg-gray-800 rounded-t-lg sm:rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 mx-0 sm:mx-0">
        <div class="p-4">
          <div class="flex items-start">
            <!-- Icon -->
            <div class="flex-shrink-0">
              <Icon
                name="mdi:update"
                class="h-6 w-6 text-primary"
                aria-hidden="true"
              />
            </div>

            <!-- Content -->
            <div class="ml-3 flex-1">
              <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                Update Available
              </h3>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                New content is available. Click reload to get the latest version.
              </p>
            </div>

            <!-- Close button -->
            <button
              type="button"
              class="ml-4 flex-shrink-0 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition-colors"
              @click="closePrompt"
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
              @click="closePrompt"
            >
              Later
            </button>
            <button
              type="button"
              class="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              @click="updateApp"
            >
              <Icon name="mdi:refresh" class="mr-2 -ml-1 h-4 w-4" />
              Reload
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Offline Ready Prompt -->
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="transform translate-y-full opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform translate-y-full opacity-0"
  >
    <div
      v-if="showOfflinePrompt"
      class="fixed bottom-0 left-0 right-0 z-50 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-md"
      role="status"
      aria-live="polite"
    >
      <div class="bg-white dark:bg-gray-800 rounded-t-lg sm:rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 mx-0 sm:mx-0">
        <div class="p-4">
          <div class="flex items-start">
            <!-- Icon -->
            <div class="flex-shrink-0">
              <Icon
                name="mdi:check-circle"
                class="h-6 w-6 text-green-500"
                aria-hidden="true"
              />
            </div>

            <!-- Content -->
            <div class="ml-3 flex-1">
              <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                App Ready to Work Offline
              </h3>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                You can now use this app even without an internet connection.
              </p>
            </div>

            <!-- Close button -->
            <button
              type="button"
              class="ml-4 flex-shrink-0 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition-colors"
              @click="closePrompt"
              aria-label="Close"
            >
              <Icon name="mdi:close" class="h-5 w-5" />
            </button>
          </div>

          <!-- Actions -->
          <div class="mt-4">
            <button
              type="button"
              class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              @click="closePrompt"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
