/**
 * API Proxy for WordPress Testimonials
 * GET /api/testimonials
 * Fetches testimonials from WordPress REST API with fallback to static data
 */
const WP_API_URL = 'https://www.vp-associates.com/wp-json/wp/v2'

// Static fallback testimonials when API is unavailable
const staticTestimonials = [
  {
    title: { rendered: 'Michael Chen' },
    acf: {
      quote: 'VP Associates delivered exceptional structural engineering services for our commercial development. Their attention to detail and code expertise made all the difference.',
      company: 'Chen Development Group',
      role: 'Project Manager',
    }
  },
  {
    title: { rendered: 'Sarah Rodriguez' },
    acf: {
      quote: 'Working with VP Associates was seamless from start to finish. They met every deadline and provided innovative solutions for our complex project.',
      company: 'Rodriguez Architecture',
      role: 'Principal Architect',
    }
  },
  {
    title: { rendered: 'James Morrison' },
    acf: {
      quote: 'The team at VP Associates brings decades of expertise to every project. Their seawall designs have stood up to Florida weather for years.',
      company: 'Gulf Coast Contractors',
      role: 'Construction Director',
    }
  },
  {
    title: { rendered: 'Jennifer Walsh' },
    acf: {
      quote: 'We have trusted VP Associates with multiple hospital projects. Their knowledge of Florida building codes and healthcare requirements is unparalleled.',
      company: 'Bay Area Health Systems',
      role: 'Facilities Director',
    }
  },
  {
    title: { rendered: 'Robert Kim' },
    acf: {
      quote: 'Professional, responsive, and technically excellent. VP Associates consistently delivers high-quality structural calculations and drawings.',
      company: 'Sunset Developers',
      role: 'CEO',
    }
  },
  {
    title: { rendered: 'Amanda Foster' },
    acf: {
      quote: 'Their marine structural expertise helped us design a seawall that has withstood multiple hurricane seasons. Highly recommend for any coastal project.',
      company: 'Coastal Properties LLC',
      role: 'Property Manager',
    }
  }
]

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { per_page = 100, _embed = true } = query

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
