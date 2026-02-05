/**
 * API Proxy for WordPress Projects
 * GET /api/projects
 * Fetches projects from WordPress REST API with fallback to static data
 */
const WP_API_URL = 'https://www.vp-associates.com/wp-json/wp/v2'

// Static fallback projects when API is unavailable
const staticProjects = [
  {
    title: { rendered: 'Tampa Marina Complex' },
    slug: 'tampa-marina-complex',
    excerpt: { rendered: '<p>Complete structural design for a 50-slip marina with restaurant and retail spaces</p>' },
    acf: {
      category: 'Marine',
      location: 'Tampa, FL',
      year: '2024',
    }
  },
  {
    title: { rendered: 'Downtown Office Tower' },
    slug: 'downtown-office-tower',
    excerpt: { rendered: '<p>Structural steel design for 12-story commercial office building</p>' },
    acf: {
      category: 'Commercial',
      location: 'Tampa, FL',
      year: '2023',
    }
  },
  {
    title: { rendered: 'Coastal Seawall System' },
    slug: 'coastal-seawall-system',
    excerpt: { rendered: '<p>Engineered seawall protection system for luxury waterfront property</p>' },
    acf: {
      category: 'Marine',
      location: 'Clearwater, FL',
      year: '2024',
    }
  },
  {
    title: { rendered: 'Luxury Residential Estate' },
    slug: 'luxury-residential-estate',
    excerpt: { rendered: '<p>Complete structural design for 8,000 sq ft waterfront residence with pool</p>' },
    acf: {
      category: 'Residential',
      location: 'St. Petersburg, FL',
      year: '2024',
    }
  },
  {
    title: { rendered: 'Industrial Warehouse Complex' },
    slug: 'industrial-warehouse-complex',
    excerpt: { rendered: '<p>Pre-engineered metal building structure with 40,000 sq ft warehouse</p>' },
    acf: {
      category: 'Industrial',
      location: 'Brandon, FL',
      year: '2023',
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

    // If API returns empty array or 404, use static fallback
    if (!response || (Array.isArray(response) && response.length === 0)) {
      return {
        success: true,
        data: staticProjects,
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
      data: staticProjects,
      _fallback: true,
      _error: 'Failed to fetch from WordPress API, using static fallback',
    }
  }
})
