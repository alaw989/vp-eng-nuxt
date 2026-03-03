import { WP_API_URL } from '~/composables/useApi'

interface WPPositionResponse {
  id: number
  title: { rendered: string }
  slug: string
  custom_fields?: {
    position_location?: string
    position_type?: string
    position_department?: string
    position_experience?: string
    position_icon?: string
    position_status?: string
  }
}

export default defineEventHandler(async (event) => {
  try {
    // Fetch positions from WordPress
    const response = await fetch(`${WP_API_URL}/positions?per_page=100`)

    if (!response.ok) {
      throw createError({
        statusCode: 502,
        statusMessage: 'Failed to fetch from WordPress',
      })
    }

    const data: WPPositionResponse[] = await response.json()

    // Filter out closed positions and transform
    const positions = data
      .filter(item => item.custom_fields?.position_status !== 'closed')
      .map(item => ({
        id: item.id,
        title: item.title.rendered,
        slug: item.slug,
        location: item.custom_fields?.position_location || 'Tampa, FL',
        type: item.custom_fields?.position_type || 'Full-time',
        department: item.custom_fields?.position_department,
        experience: item.custom_fields?.position_experience,
        icon: item.custom_fields?.position_icon || 'mdi:briefcase',
      }))

    return positions
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
