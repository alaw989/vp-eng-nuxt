/**
 * API Proxy for WordPress Testimonials
 * GET /api/testimonials
 * Fetches testimonials from WordPress REST API
 */
const WP_API_URL = 'https://whataustinhasmade.com/vp-eng/wp-json/wp/v2'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { per_page = 100, _embed = true } = query

  try {
    const response = await $fetch(`${WP_API_URL}/testimonials?per_page=${per_page}&_embed=${_embed}`, {
      timeout: 10000,
    })

    return {
      success: true,
      data: response,
    }
  } catch (error: any) {
    setResponseStatus(event, 503)
    return {
      success: false,
      error: 'Failed to fetch testimonials from WordPress API',
      message: error.message,
    }
  }
})
