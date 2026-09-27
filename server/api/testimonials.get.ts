/**
 * API Proxy for WordPress Testimonials
 * GET /api/testimonials
 * Fetches testimonials from WordPress REST API. Returns an empty list when the
 * API is unavailable; the pages render their own empty state rather than quotes
 * nobody gave.
 * Includes server-side caching for performance
 */
const config = useRuntimeConfig()
const WP_API_URL = config.wpApiUrl

// Cache for testimonials (1 hour - testimonials change infrequently)
const testimonialsStorage = useStorage('testimonials')
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

// No invented fallback: only real, sourced reviews are shown
const staticTestimonials: unknown[] = []

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { per_page = 100, _embed = true, _nocache } = query

  // Check cache first (unless bypass requested)
  if (!_nocache) {
    const cached = await testimonialsStorage.getItem<any>('testimonials_data')
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return {
        success: true,
        data: cached.data,
        _cached: true,
      }
    }
  }

  try {
    const response = await $fetch(`${WP_API_URL}/testimonials?per_page=${per_page}&_embed=${_embed}`, {
      timeout: 10000,
    })

    // If API returns empty array or 404, use static fallback
    if (!response || (Array.isArray(response) && response.length === 0)) {
      return {
        success: true,
        data: staticTestimonials,
        _fallback: true,
      }
    }

    // Cache the response
    await testimonialsStorage.setItem('testimonials_data', {
      data: response,
      timestamp: Date.now(),
    })

    return {
      success: true,
      data: response,
    }
  } catch (error: any) {
    // Return static fallback on any error
    return {
      success: true,
      data: staticTestimonials,
      _fallback: true,
      _error: 'Failed to fetch from WordPress API, using static fallback',
    }
  }
})
