/**
 * Analytics Composable
 * Provides a simple interface for tracking analytics events
 * Designed to work with Google Analytics 4, but can be extended to other platforms
 *
 * Usage:
 * 1. Set NUXT_PUBLIC_GA_MEASUREMENT_ID in .env to enable GA4 tracking
 * 2. Import and use trackEvent() in components
 *
 * Example:
 * const { trackEvent } = useAnalytics()
 * trackEvent('form_submit', { form_type: 'contact' })
 */

export const useAnalytics = () => {
  const config = useRuntimeConfig()
  const gaMeasurementId = config.public.gaMeasurementId

  /**
   * Check if analytics is enabled
   */
  const isAnalyticsEnabled = computed(() => {
    return Boolean(gaMeasurementId && typeof window !== 'undefined' && window.gtag)
  })

  /**
   * Track a custom event
   * @param eventName - Name of the event (e.g., 'form_submit', 'phone_click')
   * @param params - Additional parameters for the event
   */
  const trackEvent = (eventName: string, params?: Record<string, any>) => {
    if (!isAnalyticsEnabled.value) {
      // Log in development for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics] Event tracked (analytics disabled):', eventName, params)
      }
      return
    }

    try {
      window.gtag('event', eventName, params)
      if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics] Event tracked:', eventName, params)
      }
    } catch (error) {
      console.error('[Analytics] Error tracking event:', error)
    }
  }

  /**
   * Track page view
   * Automatically called by Nuxt page transitions, but can be manually triggered
   * @param pagePath - Path of the page
   * @param pageTitle - Title of the page
   */
  const trackPageView = (pagePath: string, pageTitle: string) => {
    if (!isAnalyticsEnabled.value) return

    try {
      window.gtag('event', 'page_view', {
        page_path: pagePath,
        page_title: pageTitle,
      })
    } catch (error) {
      console.error('[Analytics] Error tracking page view:', error)
    }
  }

  /**
   * Track form submission
   * @param formType - Type of form (e.g., 'contact', 'quote_request')
   * @param formId - Optional ID of the form
   */
  const trackFormSubmit = (formType: string, formId?: string) => {
    trackEvent('form_submit', {
      form_type: formType,
      form_id: formId,
    })
  }

  /**
   * Track outbound link click
   * @param url - The URL being linked to
   * @param linkType - Type of link (e.g., 'social_media', 'external')
   */
  const trackOutboundLink = (url: string, linkType: string) => {
    trackEvent('outbound_link', {
      url,
      link_type: linkType,
    })
  }

  /**
   * Track phone number click
   * @param phoneNumber - The phone number clicked
   */
  const trackPhoneClick = (phoneNumber: string) => {
    trackEvent('phone_click', {
      phone_number: phoneNumber,
    })
  }

  /**
   * Track email click
   * @param email - The email address clicked
   */
  const trackEmailClick = (email: string) => {
    trackEvent('email_click', {
      email_address: email,
    })
  }

  /**
   * Track file download
   * @param fileName - Name of the file downloaded
   * @param fileType - Type of file (e.g., 'pdf', 'jpg')
   */
  const trackDownload = (fileName: string, fileType: string) => {
    trackEvent('file_download', {
      file_name: fileName,
      file_type: fileType,
    })
  }

  /**
   * Track search query
   * @param searchTerm - The search term entered
   * @param resultCount - Number of results returned
   */
  const trackSearch = (searchTerm: string, resultCount: number) => {
    trackEvent('search', {
      search_term: searchTerm,
      results_count: resultCount,
    })
  }

  return {
    isAnalyticsEnabled,
    trackEvent,
    trackPageView,
    trackFormSubmit,
    trackOutboundLink,
    trackPhoneClick,
    trackEmailClick,
    trackDownload,
    trackSearch,
  }
}
