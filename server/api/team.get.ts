/**
 * API Proxy for WordPress Team Members
 * GET /api/team
 * Fetches team members from WordPress REST API with fallback to static data
 * Includes server-side caching for performance
 */
const WP_API_URL = 'https://www.vp-associates.com/wp-json/wp/v2'

// Cache for team members (1 hour - team changes infrequently)
const teamStorage = useStorage('team')
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

// Static fallback team members when API is unavailable
// Photos point to optimized variants in /images/team/ directory (Phase 9: 09-02)
const staticTeam = [
  {
    title: { rendered: 'Vincent P. Rodriguez, P.E.' },
    custom_fields: {
      title: 'President & Principal Engineer',
      bio: 'Founder and principal engineer with 35+ years of structural engineering experience. Licensed in Florida and multiple states. Specializes in complex commercial and marine structures.',
      email: 'vincent@vp-associates.com',
      phone: '+18135551201',
      photo: '/images/team/team-1-800w.webp',
    }
  },
  {
    title: { rendered: 'Jennifer Martinez, P.E.' },
    custom_fields: {
      title: 'Vice President',
      bio: '20+ years of experience in structural design and project management. Expert in concrete and masonry design. Leads our commercial development projects.',
      email: 'jennifer@vp-associates.com',
      phone: '+18135551202',
      photo: '/images/team/team-2-800w.webp',
    }
  },
  {
    title: { rendered: 'David Kim, P.E.' },
    custom_fields: {
      title: 'Senior Project Engineer',
      bio: '15+ years specializing in steel connection design and detailing. SDS2 expert and BIM specialist. Manages our industrial and marine projects.',
      email: 'david@vp-associates.com',
      phone: '+18135551203',
      photo: '/images/team/team-3-800w.webp',
    }
  },
  {
    title: { rendered: 'Sarah Thompson, P.E.' },
    custom_fields: {
      title: 'Project Manager',
      bio: '12+ years in structural engineering with focus on residential and light commercial projects. Expert in foundation design and seawall structures.',
      email: 'sarah@vp-associates.com',
      phone: '+18135551204',
      photo: '/images/team/team-4-800w.webp',
    }
  }
]

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { per_page = 100, _embed = true, _nocache } = query

  // Check cache first (unless bypass requested)
  if (!_nocache) {
    const cached = await teamStorage.getItem<any>('team_data')
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return {
        success: true,
        data: cached.data,
        _cached: true,
      }
    }
  }

  try {
    const response = await $fetch(`${WP_API_URL}/team?per_page=${per_page}&_embed=${_embed}`, {
      timeout: 10000,
    })

    // If API returns empty array or 404, use static fallback
    if (!response || (Array.isArray(response) && response.length === 0)) {
      return {
        success: true,
        data: staticTeam,
        _fallback: true,
      }
    }

    // Cache the response
    await teamStorage.setItem('team_data', {
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
      data: staticTeam,
      _fallback: true,
      _error: 'Failed to fetch from WordPress API, using static fallback',
    }
  }
})
