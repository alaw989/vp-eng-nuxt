/**
 * API Proxy for WordPress Projects
 * GET /api/projects
 * Fetches projects from WordPress REST API with fallback to static data
 * Includes server-side caching for performance
 */
const WP_API_URL = 'https://www.vp-associates.com/wp-json/wp/v2'

// Cache for projects (15 minutes - projects change more frequently)
const projectsStorage = useStorage('projects')
const CACHE_TTL = 15 * 60 * 1000 // 15 minutes

// Static fallback projects when API is unavailable
const staticProjects = [
  {
    title: { rendered: 'Tampa Marina Complex' },
    slug: 'tampa-marina-complex',
    excerpt: { rendered: '<p>Complete structural design for a 50-slip marina with restaurant and retail spaces</p>' },
    custom_fields: {
      project_category: 'Marine',
      project_location: 'Tampa, FL',
      project_year: '2024',
    }
  },
  {
    title: { rendered: 'Downtown Office Tower' },
    slug: 'downtown-office-tower',
    excerpt: { rendered: '<p>Structural steel design for 12-story commercial office building</p>' },
    custom_fields: {
      project_category: 'Commercial',
      project_location: 'Tampa, FL',
      project_year: '2023',
    }
  },
  {
    title: { rendered: 'Coastal Seawall System' },
    slug: 'coastal-seawall-system',
    excerpt: { rendered: '<p>Engineered seawall protection system for luxury waterfront property</p>' },
    custom_fields: {
      project_category: 'Marine',
      project_location: 'Clearwater, FL',
      project_year: '2024',
    }
  },
  {
    title: { rendered: 'Luxury Residential Estate' },
    slug: 'luxury-residential-estate',
    excerpt: { rendered: '<p>Complete structural design for 8,000 sq ft waterfront residence with pool</p>' },
    custom_fields: {
      project_category: 'Residential',
      project_location: 'St. Petersburg, FL',
      project_year: '2024',
    }
  },
  {
    title: { rendered: 'Industrial Warehouse Complex' },
    slug: 'industrial-warehouse-complex',
    excerpt: { rendered: '<p>Pre-engineered metal building structure with 40,000 sq ft warehouse</p>' },
    custom_fields: {
      project_category: 'Industrial',
      project_location: 'Brandon, FL',
      project_year: '2023',
    }
  }
]

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const {
    page = 1,
    per_page = 12,
    category = '',
    featured = '',
    _embed = true,
    _nocache
  } = query

  // Build cache key based on query parameters
  const cacheKey = `projects_${page}_${per_page}_${category}_${featured}`

  // Check cache first (unless bypass requested)
  if (!_nocache) {
    const cached = await projectsStorage.getItem<any>(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return {
        success: true,
        data: cached.data,
        _cached: true,
      }
    }
  }

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

    // If API returns empty array or 404, use static fallback
    if (!response || (Array.isArray(response) && response.length === 0)) {
      return {
        success: true,
        data: staticProjects,
        _fallback: true,
      }
    }

    // Cache the response
    await projectsStorage.setItem(cacheKey, {
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
      data: staticProjects,
      _fallback: true,
      _error: 'Failed to fetch from WordPress API, using static fallback',
    }
  }
})
