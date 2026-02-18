/**
 * Tests for useAnalytics composable
 * Tests Google Analytics event tracking
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAnalytics } from '../useAnalytics'

describe('useAnalytics Composable', () => {
  let mockGtag: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // Reset environment
    process.env.NODE_ENV = 'development'

    // Mock window.gtag
    mockGtag = vi.fn()
    if (typeof window !== 'undefined') {
      ;(window as any).gtag = mockGtag
    }

    vi.clearAllMocks()
  })

  describe('isAnalyticsEnabled', () => {
    it('returns true when GA measurement ID and gtag are available', () => {
      const { isAnalyticsEnabled } = useAnalytics()
      expect(isAnalyticsEnabled.value).toBe(true)
    })

    it('returns false when gtag is not available', () => {
      ;(window as any).gtag = undefined

      const { isAnalyticsEnabled } = useAnalytics()
      expect(isAnalyticsEnabled.value).toBe(false)
    })
  })

  describe('trackEvent', () => {
    it('calls gtag when analytics is enabled', () => {
      const { trackEvent } = useAnalytics()

      trackEvent('test_event', { param1: 'value1' })

      expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', { param1: 'value1' })
    })

    it('tracks events without params', () => {
      const { trackEvent } = useAnalytics()

      trackEvent('test_event')

      expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', undefined)
    })

    it('logs event in development mode', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const { trackEvent } = useAnalytics()

      trackEvent('test_event', { param1: 'value1' })

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[Analytics] Event tracked:',
        'test_event',
        { param1: 'value1' }
      )

      consoleLogSpy.mockRestore()
    })

    it('logs event when analytics is disabled in development', () => {
      ;(window as any).gtag = undefined
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const { trackEvent } = useAnalytics()

      trackEvent('test_event', { param1: 'value1' })

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[Analytics] Event tracked (analytics disabled):',
        'test_event',
        { param1: 'value1' }
      )

      consoleLogSpy.mockRestore()
      // Restore gtag for other tests
      ;(window as any).gtag = mockGtag
    })

    it('handles gtag errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockGtag.mockImplementation(() => {
        throw new Error('gtag failed')
      })

      const { trackEvent } = useAnalytics()

      // Should not throw
      expect(() => trackEvent('test_event')).not.toThrow()

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Analytics] Error tracking event:',
        expect.any(Error)
      )

      consoleErrorSpy.mockRestore()
      mockGtag.mockImplementation(() => {})
    })
  })

  describe('trackPageView', () => {
    it('tracks page views with path and title', () => {
      const { trackPageView } = useAnalytics()

      trackPageView('/about', 'About Us')

      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {
        page_path: '/about',
        page_title: 'About Us',
      })
    })

    it('returns early when analytics is disabled', () => {
      // Remove gtag to disable analytics
      ;(window as any).gtag = undefined

      const { trackPageView } = useAnalytics()

      trackPageView('/about', 'About Us')

      expect(mockGtag).not.toHaveBeenCalled()

      // Restore gtag for other tests
      ;(window as any).gtag = mockGtag
    })

    it('handles gtag errors gracefully in trackPageView', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockGtag.mockImplementation(() => {
        throw new Error('gtag failed')
      })

      const { trackPageView } = useAnalytics()

      // Should not throw
      expect(() => trackPageView('/about', 'About Us')).not.toThrow()

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Analytics] Error tracking page view:',
        expect.any(Error)
      )

      consoleErrorSpy.mockRestore()
      mockGtag.mockImplementation(() => {})
    })
  })

  describe('trackFormSubmit', () => {
    it('tracks form submission with type and ID', () => {
      const { trackFormSubmit } = useAnalytics()

      trackFormSubmit('contact', 'contact-form')

      expect(mockGtag).toHaveBeenCalledWith('event', 'form_submit', {
        form_type: 'contact',
        form_id: 'contact-form',
      })
    })

    it('tracks form submission without ID', () => {
      const { trackFormSubmit } = useAnalytics()

      trackFormSubmit('quote_request')

      expect(mockGtag).toHaveBeenCalledWith('event', 'form_submit', {
        form_type: 'quote_request',
        form_id: undefined,
      })
    })
  })

  describe('trackOutboundLink', () => {
    it('tracks outbound link clicks', () => {
      const { trackOutboundLink } = useAnalytics()

      trackOutboundLink('https://example.com', 'external')

      expect(mockGtag).toHaveBeenCalledWith('event', 'outbound_link', {
        url: 'https://example.com',
        link_type: 'external',
      })
    })
  })

  describe('trackPhoneClick', () => {
    it('tracks phone number clicks', () => {
      const { trackPhoneClick } = useAnalytics()

      trackPhoneClick('(813) 555-1234')

      expect(mockGtag).toHaveBeenCalledWith('event', 'phone_click', {
        phone_number: '(813) 555-1234',
      })
    })
  })

  describe('trackEmailClick', () => {
    it('tracks email clicks', () => {
      const { trackEmailClick } = useAnalytics()

      trackEmailClick('info@example.com')

      expect(mockGtag).toHaveBeenCalledWith('event', 'email_click', {
        email_address: 'info@example.com',
      })
    })
  })

  describe('trackDownload', () => {
    it('tracks file downloads', () => {
      const { trackDownload } = useAnalytics()

      trackDownload('document.pdf', 'pdf')

      expect(mockGtag).toHaveBeenCalledWith('event', 'file_download', {
        file_name: 'document.pdf',
        file_type: 'pdf',
      })
    })
  })

  describe('trackSearch', () => {
    it('tracks search queries', () => {
      const { trackSearch } = useAnalytics()

      trackSearch('structural engineering', 15)

      expect(mockGtag).toHaveBeenCalledWith('event', 'search', {
        search_term: 'structural engineering',
        results_count: 15,
      })
    })
  })

  describe('exported methods', () => {
    it('exports all expected methods and computed properties', () => {
      const analytics = useAnalytics()

      expect(analytics).toHaveProperty('isAnalyticsEnabled')
      expect(analytics).toHaveProperty('trackEvent')
      expect(analytics).toHaveProperty('trackPageView')
      expect(analytics).toHaveProperty('trackFormSubmit')
      expect(analytics).toHaveProperty('trackOutboundLink')
      expect(analytics).toHaveProperty('trackPhoneClick')
      expect(analytics).toHaveProperty('trackEmailClick')
      expect(analytics).toHaveProperty('trackDownload')
      expect(analytics).toHaveProperty('trackSearch')
    })
  })
})
