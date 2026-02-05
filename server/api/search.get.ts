import type { H3Event } from 'h3'

interface SearchResult {
  type: 'page' | 'service' | 'project'
  title: string
  slug: string
  description: string
  url: string
  icon?: string
  category?: string
  location?: string
}

interface SearchResponse {
  results: SearchResult[]
  total: number
  query: string
}

// Static pages data
const staticPages = [
  { title: 'Home', slug: '', icon: 'mdi:home', description: 'Welcome to VP Associates structural engineering', type: 'page' as const },
  { title: 'About Us', slug: 'about', icon: 'mdi:information', description: 'Learn about our company, history, and team', type: 'page' as const },
  { title: 'Services', slug: 'services', icon: 'mdi:cogs', description: 'Our comprehensive structural engineering services', type: 'page' as const },
  { title: 'Projects', slug: 'projects', icon: 'mdi:folder-multiple', description: 'Browse our portfolio of completed projects', type: 'page' as const },
  { title: 'Contact', slug: 'contact', icon: 'mdi:email', description: 'Get in touch with our team', type: 'page' as const },
  { title: 'Site Map', slug: 'sitemap', icon: 'mdi:sitemap', description: 'Complete site map and navigation', type: 'page' as const },
  { title: 'Search', slug: 'search', icon: 'mdi:magnify', description: 'Search our site', type: 'page' as const },
]

// Fuzzy match function
function fuzzyMatch(text: string, query: string): boolean {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  const lowerText = text.toLowerCase()
  return terms.some(term => lowerText.includes(term))
}

// Score function for ranking results
function scoreResult(item: any, query: string): number {
  const lowerQuery = query.toLowerCase()
  let score = 0

  // Exact title match gets highest score
  if (item.title?.toLowerCase() === lowerQuery) score += 100
  // Title starts with query
  else if (item.title?.toLowerCase().startsWith(lowerQuery)) score += 50
  // Title contains query
  else if (item.title?.toLowerCase().includes(lowerQuery)) score += 25

  // Description match
  if (item.description && fuzzyMatch(item.description, query)) score += 10

  // Category/location match for projects
  if (item.category && fuzzyMatch(item.category, query)) score += 15
  if (item.location && fuzzyMatch(item.location, query)) score += 15

  return score
}

export default defineEventHandler(async (event: H3Event) => {
  const query = getQuery(event)
  const searchTerm = (query.q as string || '').trim()

  // Return empty results if no search term
  if (!searchTerm) {
    return {
      results: [],
      total: 0,
      query: '',
    } as SearchResponse
  }

  try {
    const results: SearchResult[] = []

    // Search in static pages
    for (const page of staticPages) {
      if (
        fuzzyMatch(page.title, searchTerm) ||
        fuzzyMatch(page.description, searchTerm)
      ) {
        results.push({
          type: page.type,
          title: page.title,
          slug: page.slug,
          description: page.description,
          url: page.slug ? `/${page.slug}` : '/',
          icon: page.icon,
        })
      }
    }

    // Fetch services from WordPress API
    const servicesApiUrl = 'https://www.vp-associates.com/wp-json/wp/v2/services?per_page=100&_fields=id,slug,title,excerpt,services_meta'
    let services: any[] = []

    try {
      services = await $fetch<any[]>(servicesApiUrl)
    } catch (error) {
      console.error('Failed to fetch services:', error)
    }

    // Search in services
    for (const service of services || []) {
      const title = service.title?.rendered || ''
      const excerpt = service.excerpt?.rendered?.replace(/<[^>]*>/g, '').trim() || ''
      const icon = service.services_meta?.icon || 'mdi:cog'

      if (
        fuzzyMatch(title, searchTerm) ||
        fuzzyMatch(excerpt, searchTerm)
      ) {
        results.push({
          type: 'service',
          title,
          slug: service.slug,
          description: excerpt,
          url: `/services/${service.slug}`,
          icon,
        })
      }
    }

    // Fetch projects from WordPress API
    const projectsApiUrl = 'https://www.vp-associates.com/wp-json/wp/v2/projects?per_page=100&_fields=id,slug,title,excerpt,project_meta'
    let projects: any[] = []

    try {
      projects = await $fetch<any[]>(projectsApiUrl)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    }

    // Search in projects
    for (const project of projects || []) {
      const title = project.title?.rendered || ''
      const excerpt = project.excerpt?.rendered?.replace(/<[^>]*>/g, '').trim() || ''
      const category = project.project_meta?.category || ''
      const location = project.project_meta?.location || ''

      if (
        fuzzyMatch(title, searchTerm) ||
        fuzzyMatch(excerpt, searchTerm) ||
        fuzzyMatch(location, searchTerm) ||
        fuzzyMatch(category, searchTerm)
      ) {
        results.push({
          type: 'project',
          title,
          slug: project.slug,
          description: excerpt,
          url: `/projects/${project.slug}`,
          icon: 'mdi:office-building',
          category,
          location,
        })
      }
    }

    // Sort results by relevance score
    results.sort((a, b) => scoreResult(b, searchTerm) - scoreResult(a, searchTerm))

    return {
      results,
      total: results.length,
      query: searchTerm,
    } as SearchResponse
  } catch (error) {
    console.error('Search error:', error)

    // Return graceful fallback on error
    return {
      results: [],
      total: 0,
      query: searchTerm,
      error: 'Search temporarily unavailable',
    } as SearchResponse
  }
})
