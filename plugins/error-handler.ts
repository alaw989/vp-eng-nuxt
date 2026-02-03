export default defineNuxtPlugin((nuxtApp) => {
  // Vue error handler for component-level errors
  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    // Log error details in development
    if (import.meta.dev) {
      console.error('Vue Error:', error)
      console.error('Component:', instance?.$options?.name || 'Unknown')
      console.error('Info:', info)
    } else {
      // In production, log to error tracking service
      console.error('Application Error:', {
        message: error instanceof Error ? error.message : String(error),
        info,
        timestamp: new Date().toISOString(),
      })
    }
  }

  // Handle global unhandled errors (client-side only)
  if (import.meta.client) {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled Promise Rejection:', event.reason)
      // Prevent default browser error logging
      event.preventDefault()
    })

    window.addEventListener('error', (event) => {
      console.error('Global Error:', event.error || event.message)
    })
  }
})
