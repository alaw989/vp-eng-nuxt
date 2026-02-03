/**
 * API Proxy for WordPress Services
 * GET /api/services
 * Fetches services from WordPress REST API
 */
const WP_API_URL = 'https://whataustinhasmade.com/vp-eng/wp-json/wp/v2'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { per_page = 100, _embed = true } = query

  try {
    const response = await $fetch(`${WP_API_URL}/services?per_page=${per_page}&_embed=${_embed}`, {
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
      error: 'Failed to fetch services from WordPress API',
      message: error.message,
    }
  }
})
