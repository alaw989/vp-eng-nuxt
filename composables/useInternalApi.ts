/**
 * Internal API Composables
 * Uses internal server routes to proxy WordPress API requests
 * Falls back to static data when WordPress API is unavailable
 */

export interface APIService {
  id: number
  title: { rendered: string }
  slug: string
  excerpt: { rendered: string }
  content: { rendered: string }
  featured_media?: number
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string
      alt_text?: string
    }>
  }
  services_meta?: {
    icon?: string
    capabilities?: string[]
    related_projects?: number[]
  }
  acf?: any
}

export interface APIProject {
  id: number
  title: { rendered: string }
  slug: string
  excerpt: { rendered: string }
  content: { rendered: string }
  featured_media?: number
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string
      alt_text?: string
    }>
  }
  project_meta?: {
    location?: string
    year?: string
    square_footage?: string
    category?: string
    services_provided?: string[]
    featured?: boolean
  }
  acf?: any
}

/**
 * Fetch all services with fallback to static data
 */
export async function useInternalServices() {
  try {
    const { data, error } = await useFetch('/api/services')

    if (error.value || !data.value) {
      throw new Error('API request failed')
    }

    const response = data.value as any
    if (!response.success) {
      throw new Error(response.error || 'API returned error')
    }

    return {
      services: response.data,
      error: null,
      useStatic: false,
    }
  } catch (e: any) {
    console.warn('Failed to fetch services from API, using static data:', e.message)
    // Return static fallback data
    const staticServices = getStaticServices()
    return {
      services: staticServices,
      error: e,
      useStatic: true,
    }
  }
}

/**
 * Fetch single service by slug with fallback
 */
export async function useInternalService(slug: string) {
  try {
    const { data, error } = await useFetch(`/api/services/${slug}`)

    if (error.value || !data.value) {
      throw new Error('API request failed')
    }

    const response = data.value as any
    if (!response.success) {
      throw new Error(response.error || 'API returned error')
    }

    return {
      service: response.data,
      error: null,
      useStatic: false,
    }
  } catch (e: any) {
    console.warn(`Failed to fetch service "${slug}" from API, using static data:`, e.message)
    const staticServices = getStaticServices()
    const service = staticServices.find((s: any) => s.slug === slug) || null
    return {
      service,
      error: e,
      useStatic: true,
    }
  }
}

/**
 * Fetch all projects with fallback to static data
 */
export async function useInternalProjects(page = 1, perPage = 12, category?: string) {
  try {
    const queryParams = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
      _embed: 'true',
    })
    if (category) {
      queryParams.append('category', category)
    }

    const { data, error } = await useFetch(`/api/projects?${queryParams.toString()}`)

    if (error.value || !data.value) {
      throw new Error('API request failed')
    }

    const response = data.value as any
    if (!response.success) {
      throw new Error(response.error || 'API returned error')
    }

    return {
      projects: response.data,
      error: null,
      useStatic: false,
    }
  } catch (e: any) {
    console.warn('Failed to fetch projects from API, using static data:', e.message)
    const staticProjects = getStaticProjects()
    return {
      projects: staticProjects,
      error: e,
      useStatic: true,
    }
  }
}

/**
 * Fetch single project by slug with fallback
 */
export async function useInternalProject(slug: string) {
  try {
    const { data, error } = await useFetch(`/api/projects/${slug}`)

    if (error.value || !data.value) {
      throw new Error('API request failed')
    }

    const response = data.value as any
    if (!response.success) {
      throw new Error(response.error || 'API returned error')
    }

    return {
      project: response.data,
      error: null,
      useStatic: false,
    }
  } catch (e: any) {
    console.warn(`Failed to fetch project "${slug}" from API, using static data:`, e.message)
    const staticProjects = getStaticProjects()
    const project = staticProjects.find((p: any) => p.slug === slug) || null
    return {
      project,
      error: e,
      useStatic: true,
    }
  }
}

/**
 * Fetch featured projects with fallback
 */
export async function useInternalFeaturedProjects() {
  try {
    const { data, error } = await useFetch('/api/projects?featured=true&per_page=6')

    if (error.value || !data.value) {
      throw new Error('API request failed')
    }

    const response = data.value as any
    if (!response.success) {
      throw new Error(response.error || 'API returned error')
    }

    return {
      featuredProjects: response.data,
      error: null,
      useStatic: false,
    }
  } catch (e: any) {
    console.warn('Failed to fetch featured projects from API, using static data:', e.message)
    const staticProjects = getStaticProjects().filter((p: any) => p.featured)
    return {
      featuredProjects: staticProjects,
      error: e,
      useStatic: true,
    }
  }
}

/**
 * Fetch team members with fallback
 */
export async function useInternalTeam() {
  try {
    const { data, error } = await useFetch('/api/team')

    if (error.value || !data.value) {
      throw new Error('API request failed')
    }

    const response = data.value as any
    if (!response.success) {
      throw new Error(response.error || 'API returned error')
    }

    return {
      team: response.data,
      error: null,
      useStatic: false,
    }
  } catch (e: any) {
    console.warn('Failed to fetch team from API, using static data:', e.message)
    return {
      team: [],
      error: e,
      useStatic: true,
    }
  }
}

/**
 * Fetch testimonials with fallback
 */
export async function useInternalTestimonials() {
  try {
    const { data, error } = await useFetch('/api/testimonials')

    if (error.value || !data.value) {
      throw new Error('API request failed')
    }

    const response = data.value as any
    if (!response.success) {
      throw new Error(response.error || 'API returned error')
    }

    return {
      testimonials: response.data,
      error: null,
      useStatic: false,
    }
  } catch (e: any) {
    console.warn('Failed to fetch testimonials from API, using static data:', e.message)
    return {
      testimonials: [],
      error: e,
      useStatic: true,
    }
  }
}

/**
 * Helper: Get featured image URL
 */
export function getInternalFeaturedImage(post: any): string | null {
  const media = post._embedded?.['wp:featuredmedia']?.[0]
  return media?.source_url || null
}

/**
 * Helper: Get featured image alt text
 */
export function getInternalFeaturedImageAlt(post: any): string {
  const media = post._embedded?.['wp:featuredmedia']?.[0]
  return media?.alt_text || post.title?.rendered || ''
}

// Static fallback data
function getStaticServices() {
  return [
    {
      id: 1,
      title: { rendered: 'Structural Steel Design' },
      slug: 'structural-steel-design',
      excerpt: { rendered: 'Comprehensive steel design services per AISC standards.' },
      content: { rendered: '<p>Full structural steel design services including...</p>' },
      services_meta: { icon: 'mdi:beam' },
      featured_media: 0,
      _embedded: {},
    },
    {
      id: 2,
      title: { rendered: 'Concrete Design' },
      slug: 'concrete-design',
      excerpt: { rendered: 'Expert concrete design following ACI guidelines.' },
      content: { rendered: '<p>Concrete structural design services including...</p>' },
      services_meta: { icon: 'mdi:cube-outline' },
      featured_media: 0,
      _embedded: {},
    },
    {
      id: 3,
      title: { rendered: 'Masonry Design' },
      slug: 'masonry-design',
      excerpt: { rendered: 'Masonry structure design per ACI 530.' },
      content: { rendered: '<p>Masonry design services including...</p>' },
      services_meta: { icon: 'mdi:wall' },
      featured_media: 0,
      _embedded: {},
    },
    {
      id: 4,
      title: { rendered: 'Wood Design' },
      slug: 'wood-design',
      excerpt: { rendered: 'Wood frame design following NDS standards.' },
      content: { rendered: '<p>Wood structural design services including...</p>' },
      services_meta: { icon: 'mdi:tree' },
      featured_media: 0,
      _embedded: {},
    },
    {
      id: 5,
      title: { rendered: 'Foundation Design' },
      slug: 'foundation-design',
      excerpt: { rendered: 'Deep and shallow foundation design expertise.' },
      content: { rendered: '<p>Foundation design services including...</p>' },
      services_meta: { icon: 'mdi:home-floor-0' },
      featured_media: 0,
      _embedded: {},
    },
    {
      id: 6,
      title: { rendered: 'Seawall Design' },
      slug: 'seawall-design',
      excerpt: { rendered: 'Coastal protection and seawall structural design.' },
      content: { rendered: '<p>Seawall design services including...</p>' },
      services_meta: { icon: 'mdi:waves' },
      featured_media: 0,
      _embedded: {},
    },
    {
      id: 7,
      title: { rendered: 'Steel Connection Design' },
      slug: 'steel-connection-design',
      excerpt: { rendered: 'Detailed steel connection design and calculations.' },
      content: { rendered: '<p>Steel connection design services including...</p>' },
      services_meta: { icon: 'mdi:connection' },
      featured_media: 0,
      _embedded: {},
    },
    {
      id: 8,
      title: { rendered: 'CAD & 3D Modeling' },
      slug: 'cad-3d-modeling',
      excerpt: { rendered: 'Advanced CAD and 3D structural modeling services.' },
      content: { rendered: '<p>CAD and 3D modeling services including...</p>' },
      services_meta: { icon: 'mdi:cube-scan' },
      featured_media: 0,
      _embedded: {},
    },
    {
      id: 9,
      title: { rendered: 'Inspection Services' },
      slug: 'inspection-services',
      excerpt: { rendered: 'Structural inspection and assessment services.' },
      content: { rendered: '<p>Inspection services including...</p>' },
      services_meta: { icon: 'mdi:magnify' },
      featured_media: 0,
      _embedded: {},
    },
    {
      id: 10,
      title: { rendered: 'Steel Detailing' },
      slug: 'steel-detailing',
      excerpt: { rendered: 'Professional steel detailing using SDS2 and BIM.' },
      content: { rendered: '<p>Steel detailing services including...</p>' },
      services_meta: { icon: 'mdi:blueprint' },
      featured_media: 0,
      _embedded: {},
    },
  ]
}

function getStaticProjects() {
  return [
    {
      id: 1,
      title: { rendered: 'Tampa High-Rise Tower' },
      slug: 'tampa-high-rise-tower',
      excerpt: { rendered: '20-story mixed-use development in downtown Tampa.' },
      content: { rendered: '<p>Project details...</p>' },
      project_meta: {
        location: 'Tampa, FL',
        year: '2023',
        square_footage: '250,000 sq ft',
        category: 'Commercial',
        featured: true,
      },
      featured_media: 0,
      _embedded: {},
    },
    {
      id: 2,
      title: { rendered: 'St. Petersburg Marina' },
      slug: 'st-petersburg-marina',
      excerpt: { rendered: 'Marine facility with structural seawall protection.' },
      content: { rendered: '<p>Project details...</p>' },
      project_meta: {
        location: 'St. Petersburg, FL',
        year: '2022',
        square_footage: '50,000 sq ft',
        category: 'Marine',
        featured: true,
      },
      featured_media: 0,
      _embedded: {},
    },
    {
      id: 3,
      title: { rendered: 'Clearwater Office Complex' },
      slug: 'clearwater-office-complex',
      excerpt: { rendered: 'Multi-building office campus with steel construction.' },
      content: { rendered: '<p>Project details...</p>' },
      project_meta: {
        location: 'Clearwater, FL',
        year: '2023',
        square_footage: '180,000 sq ft',
        category: 'Commercial',
        featured: true,
      },
      featured_media: 0,
      _embedded: {},
    },
    {
      id: 4,
      title: { rendered: 'Residential Condominiums' },
      slug: 'residential-condominiums',
      excerpt: { rendered: 'Luxury waterfront condominium development.' },
      content: { rendered: '<p>Project details...</p>' },
      project_meta: {
        location: 'Tampa Bay, FL',
        year: '2022',
        square_footage: '120,000 sq ft',
        category: 'Residential',
        featured: false,
      },
      featured_media: 0,
      _embedded: {},
    },
    {
      id: 5,
      title: { rendered: 'Retail Shopping Center' },
      slug: 'retail-shopping-center',
      excerpt: { rendered: 'Big-box retail center with masonry construction.' },
      content: { rendered: '<p>Project details...</p>' },
      project_meta: {
        location: 'Tampa, FL',
        year: '2021',
        square_footage: '85,000 sq ft',
        category: 'Retail',
        featured: false,
      },
      featured_media: 0,
      _embedded: {},
    },
    {
      id: 6,
      title: { rendered: 'Educational Facility' },
      slug: 'educational-facility',
      excerpt: { rendered: 'K-12 school with multi-story classroom buildings.' },
      content: { rendered: '<p>Project details...</p>' },
      project_meta: {
        location: 'Hillsborough County, FL',
        year: '2023',
        square_footage: '95,000 sq ft',
        category: 'Educational',
        featured: true,
      },
      featured_media: 0,
      _embedded: {},
    },
  ]
}
