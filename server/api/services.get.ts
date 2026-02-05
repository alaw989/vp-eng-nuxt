/**
 * API Proxy for WordPress Services
 * GET /api/services
 * Fetches services from WordPress REST API with fallback to static data
 */
const WP_API_URL = 'https://www.vp-associates.com/wp-json/wp/v2'

// Static fallback services when API is unavailable
const staticServices = [
  {
    title: { rendered: 'Structural Steel Design' },
    excerpt: { rendered: '<p>AISC certified steel design for commercial and industrial projects</p>' },
    slug: 'structural-steel-design',
    acf: {
      icon: 'mdi:beam',
      standard: 'AISC Certified',
    }
  },
  {
    title: { rendered: 'Concrete Design' },
    excerpt: { rendered: '<p>ACI certified concrete design for foundations and structures</p>' },
    slug: 'concrete-design',
    acf: {
      icon: 'mdi:cube-outline',
      standard: 'ACI Certified',
    }
  },
  {
    title: { rendered: 'Masonry Design' },
    excerpt: { rendered: '<p>ACI 530 compliant masonry design and detailing</p>' },
    slug: 'masonry-design',
    acf: {
      icon: 'mdi:wall',
      standard: 'ACI 530 Compliant',
    }
  },
  {
    title: { rendered: 'Foundation Design' },
    excerpt: { rendered: '<p>Deep and shallow foundation engineering solutions</p>' },
    slug: 'foundation-design',
    acf: {
      icon: 'mdi:home-floor-0',
    }
  },
  {
    title: { rendered: 'Seawall Design' },
    excerpt: { rendered: '<p>Coastal protection and seawall structural design</p>' },
    slug: 'seawall-design',
    acf: {
      icon: 'mdi:waves',
    }
  },
  {
    title: { rendered: 'Steel Detailing' },
    excerpt: { rendered: '<p>SDS2 and BIM steel connection design and detailing</p>' },
    slug: 'steel-detailing',
    acf: {
      icon: 'mdi:pencil-ruler',
    }
  }
]

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { per_page = 100, _embed = true } = query

  try {
    const response = await $fetch(`${WP_API_URL}/services?per_page=${per_page}&_embed=${_embed}`, {
      timeout: 10000,
    })

    // If API returns empty array or 404, use static fallback
    if (!response || (Array.isArray(response) && response.length === 0)) {
      return {
        success: true,
        data: staticServices,
        _fallback: true,
      }
    }

    return {
      success: true,
      data: response,
    }
  } catch (error: any) {
    // Return static fallback on any error
    return {
      success: true,
      data: staticServices,
      _fallback: true,
      _error: 'Failed to fetch from WordPress API, using static fallback',
    }
  }
})
