/**
 * API Proxy for WordPress Projects
 * GET /api/projects
 * Fetches projects from WordPress REST API
 */
const WP_API_URL = 'https://whataustinhasmade.com/vp-eng/wp-json/wp/v2'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const {
    page = 1,
    per_page = 12,
    category = '',
    featured = '',
    _embed = true
  } = query

  try {
    let url = `${WP_API_URL}/projects?page=${page}&per_page=${per_page}&_embed=${_embed}`

    if (category) {
      url += `&category=${category}`
    }

    if (featured === 'true') {
      url += '&acf_featured=true'
    }

    const response = await $fetch(url, {
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
      error: 'Failed to fetch projects from WordPress API',
      message: error.message,
    }
  }
})
