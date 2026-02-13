/**
 * API Proxy for WordPress Services
 * GET /api/services
 * Fetches services from WordPress REST API with fallback to static data
 * Includes server-side caching for performance
 */
const WP_API_URL = 'https://www.vp-associates.com/wp-json/wp/v2'

/**
 * Decode HTML entities to prevent hydration mismatches.
 * WordPress API returns encoded entities like &#038; which must be
 * decoded on the server to match client-side rendering.
 */
function decodeHtmlEntities(text: string | undefined | null): string {
  if (!text) return ''
  const entities: Record<string, string> = {
    '&#038;': '&',
    '&amp;': '&',
    '&#8217;': "'",
    '&#8216;': "'",
    '&#8220;': '"',
    '&#8221;': '"',
    '&#8211;': '–',
    '&#8212;': '—',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
    '&nbsp;': ' ',
    '&#160;': ' ',
  }
  let decoded = text
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, 'g'), char)
  }
  return decoded
}

/**
 * Recursively decode HTML entities in WordPress response objects.
 */
function decodeServiceData(service: any): any {
  return {
    ...service,
    title: service.title ? { ...service.title, rendered: decodeHtmlEntities(service.title.rendered) } : service.title,
    excerpt: service.excerpt ? { ...service.excerpt, rendered: decodeHtmlEntities(service.excerpt.rendered) } : service.excerpt,
    content: service.content ? { ...service.content, rendered: decodeHtmlEntities(service.content.rendered) } : service.content,
  }
}

// Cache for services (30 minutes)
const servicesStorage = useStorage('services')
const CACHE_KEY = 'services_data'
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

// Static fallback services when API is unavailable
const staticServices = [
  {
    title: { rendered: 'Structural Steel Design' },
    excerpt: { rendered: '<p>AISC certified steel design for commercial and industrial projects</p>' },
    slug: 'structural-steel-design',
    custom_fields: {
      service_icon: 'mdi:beam',
      service_standard: 'AISC Certified',
    }
  },
  {
    title: { rendered: 'Concrete Design' },
    excerpt: { rendered: '<p>ACI certified concrete design for foundations and structures</p>' },
    slug: 'concrete-design',
    custom_fields: {
      service_icon: 'mdi:cube-outline',
      service_standard: 'ACI Certified',
    }
  },
  {
    title: { rendered: 'Masonry Design' },
    excerpt: { rendered: '<p>ACI 530 compliant masonry design and detailing</p>' },
    slug: 'masonry-design',
    custom_fields: {
      service_icon: 'mdi:wall',
      service_standard: 'ACI 530 Compliant',
    }
  },
  {
    title: { rendered: 'Foundation Design' },
    excerpt: { rendered: '<p>Deep and shallow foundation engineering solutions</p>' },
    slug: 'foundation-design',
    custom_fields: {
      service_icon: 'mdi:home-floor-0',
    }
  },
  {
    title: { rendered: 'Seawall Design' },
    excerpt: { rendered: '<p>Coastal protection and seawall structural design</p>' },
    slug: 'seawall-design',
    custom_fields: {
      service_icon: 'mdi:waves',
    }
  },
  {
    title: { rendered: 'Steel Detailing' },
    excerpt: { rendered: '<p>SDS2 and BIM steel connection design and detailing</p>' },
    slug: 'steel-detailing',
    custom_fields: {
      service_icon: 'mdi:pencil-ruler',
    }
  }
]

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { per_page = 100, _embed = true, _nocache } = query

  // Check cache first (unless bypass requested)
  if (!_nocache) {
    const cached = await servicesStorage.getItem<any>(CACHE_KEY)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return {
        success: true,
        data: cached.data,
        _cached: true,
      }
    }
  }

  try {
    const response = await $fetch(`${WP_API_URL}/services?per_page=${per_page}&_embed=${_embed}`, {
      timeout: 10000,
    })

    // Debug: log response structure
    console.log('[API /services] WordPress response type:', Array.isArray(response) ? 'array' : typeof response)
    console.log('[API /services] Response length:', Array.isArray(response) ? response.length : 'N/A')
    if (Array.isArray(response) && response.length > 0) {
      console.log('[API /services] First item keys:', Object.keys(response[0]))
      console.log('[API /services] First item has custom_fields:', 'custom_fields' in response[0])
      console.log('[API /services] First item custom_fields:', (response[0] as any).custom_fields)
    }

    // If API returns empty array or 404, use static fallback
    if (!response || (Array.isArray(response) && response.length === 0)) {
      console.log('[API /services] Using fallback - empty or invalid response')
      return {
        success: true,
        data: staticServices,
        _fallback: true,
      }
    }

    // Decode HTML entities to prevent hydration mismatches
    const decodedResponse = Array.isArray(response)
      ? response.map(decodeServiceData)
      : response

    // Cache the decoded response
    await servicesStorage.setItem(CACHE_KEY, {
      data: decodedResponse,
      timestamp: Date.now(),
    })

    return {
      success: true,
      data: decodedResponse,
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
