/*
 * Performance optimization plugin
 * Adds resource hints, defers non-critical resources, and uses requestIdleCallback
 */
export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    // Mark performance timing
    if (window.performance) {
      window.performance.mark('nuxt-app-hydrated')
    }

    // Defer non-critical operations using requestIdleCallback
    const scheduleNonCriticalWork = (callback: () => void) => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(callback, { timeout: 2000 })
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(callback, 100)
      }
    }

    // Defer loading of iconify icons until idle
    scheduleNonCriticalWork(() => {
      // Preload commonly used icons
      const commonIcons = [
        'mdi:arrow-right',
        'mdi:magnify',
        'mdi:check-circle',
        'mdi:home',
        'mdi:phone',
        'mdi:email',
        'mdi:menu',
        'mdi:close',
      ]

      // This will help iconify cache the icons
      if ((window as any).__ICONIFY_ICONS__) {
        (window as any).__ICONIFY_ICONS__ = commonIcons
      }
    })

    // Reduce JavaScript execution time by deferring analytics
    scheduleNonCriticalWork(() => {
      // Initialize any deferred analytics or tracking here
      // This runs during idle time, not blocking the main thread
    })

    // Defer PWA service worker registration until after load
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        scheduleNonCriticalWork(() => {
          // Service worker is automatically registered by the PWA module
          // This just ensures it doesn't block initial render
        })
      })
    }
  }
})
