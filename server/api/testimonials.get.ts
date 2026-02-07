/**
 * API Proxy for WordPress Testimonials
 * GET /api/testimonials
 * Fetches testimonials from WordPress REST API with fallback to static data
 * Includes server-side caching for performance
 */
const WP_API_URL = 'https://www.vp-associates.com/wp-json/wp/v2'

// Cache for testimonials (1 hour - testimonials change infrequently)
const testimonialsStorage = useStorage('testimonials')
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

// Static fallback testimonials when API is unavailable
const staticTestimonials = [
  {
    title: { rendered: 'Michael Chen' },
    custom_fields: {
      quote: 'VP Associates delivered exceptional structural engineering services for our commercial development. Their attention to detail and code expertise made all the difference.',
      testimonial_company: 'Chen Development Group',
      testimonial_role: 'Project Manager',
    }
  },
  {
    title: { rendered: 'Sarah Rodriguez' },
    custom_fields: {
      quote: 'Working with VP Associates was seamless from start to finish. They met every deadline and provided innovative solutions for our complex project.',
      testimonial_company: 'Rodriguez Architecture',
      testimonial_role: 'Principal Architect',
    }
  },
  {
    title: { rendered: 'James Morrison' },
    custom_fields: {
      quote: 'The team at VP Associates brings decades of expertise to every project. Their seawall designs have stood up to Florida weather for years.',
      testimonial_company: 'Gulf Coast Contractors',
      testimonial_role: 'Construction Director',
    }
  },
  {
    title: { rendered: 'Jennifer Walsh' },
    custom_fields: {
      quote: 'We have trusted VP Associates with multiple hospital projects. Their knowledge of Florida building codes and healthcare requirements is unparalleled.',
      testimonial_company: 'Bay Area Health Systems',
      testimonial_role: 'Facilities Director',
    }
  },
  {
    title: { rendered: 'Robert Kim' },
    custom_fields: {
      quote: 'Professional, responsive, and technically excellent. VP Associates consistently delivers high-quality structural calculations and drawings.',
      testimonial_company: 'Sunset Developers',
      testimonial_role: 'CEO',
    }
  },
  {
    title: { rendered: 'Amanda Foster' },
    custom_fields: {
      quote: 'Their marine structural expertise helped us design a seawall that has withstood multiple hurricane seasons. Highly recommend for any coastal project.',
      testimonial_company: 'Coastal Properties LLC',
      testimonial_role: 'Property Manager',
    }
  }
]

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
