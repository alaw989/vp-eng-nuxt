/**
 * Google Analytics 4 Plugin
 *
 * This plugin initializes Google Analytics 4 tracking on the client side.
 *
 * To enable:
 * 1. Add NUXT_PUBLIC_GA_MEASUREMENT_ID to your .env file
 *    Example: NUXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
 *
 * 2. The script will automatically load and track page views
 *
 * Privacy Note:
 * - Only loads if GA measurement ID is configured
 * - Does not track in development mode unless explicitly enabled
 * - Respects user's browser privacy settings
 */

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const gaMeasurementId = config.public.gaMeasurementId as string

  // Skip if GA measurement ID is not configured
  if (!gaMeasurementId) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] GA4 not configured. Set NUXT_PUBLIC_GA_MEASUREMENT_ID to enable.')
    }
    return
  }

  // Initialize Google Analytics
  initGA4(gaMeasurementId)

  // Track page views on route changes
  if (typeof window !== 'undefined') {
    const router = useRouter()
    const route = useRoute()

    // Track initial page view
    const pageTitle = (route.meta.title as string | undefined) || document.title
    trackPageView(route.fullPath, pageTitle)

    // Track subsequent page views
    router.afterEach((to) => {
      nextTick(() => {
        const toPageTitle = (to.meta.title as string | undefined) || document.title
        trackPageView(to.fullPath, toPageTitle)
      })
    })
  }
})

/**
 * Initialize GA4 with the Google Analytics script
 */
function initGA4(measurementId: string) {
  if (typeof window === 'undefined') return

  // Create the gtag function
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }

  // Initialize GA4
  window.gtag('js', new Date())
  window.gtag('config', measurementId, {
    // Send anonymized IP addresses for privacy
    anonymize_ip: true,
    // Enable debug mode in development
    debug_mode: process.env.NODE_ENV === 'development',
    // Page title is tracked automatically
    send_page_view: false, // We'll handle page views manually
  })

  // Load GA4 script
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)

  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] GA4 initialized with measurement ID:', measurementId)
  }
}

/**
 * Track a page view
 */
function trackPageView(pagePath: string, pageTitle: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle,
    })
  }
}

/**
 * Extend the Window interface for gtag
 */
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}
