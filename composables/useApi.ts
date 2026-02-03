/**
 * WordPress REST API Base Configuration
 * API endpoint for VP Associates WordPress backend
 */
export const WP_API_URL = 'https://whataustinhasmade.com/vp-eng/wp-json/wp/v2'
export const SITE_URL = 'https://vp-associates.com'

/**
 * WordPress API response types
 */
export interface WPImage {
  id: number
  source_url: string
  alt_text?: string
  media_details?: {
    width: number
    height: number
  }
}

export interface WPServicesMeta {
  icon?: string
  capabilities?: string[]
  related_projects?: number[]
}

export interface WPService {
  id: number
  title: { rendered: string }
  slug: string
  excerpt: { rendered: string }
  content: { rendered: string }
  featured_media?: number
  _embedded?: {
    'wp:featuredmedia'?: WPImage[]
  }
  services_meta?: WPServicesMeta
  acf?: WPServicesMeta
}

export interface WPProjectMeta {
  location?: string
  year?: string
  square_footage?: string
  category?: string
  services_provided?: string[]
  project_stats?: {
    year?: string
    square_footage?: string
    capacity?: string
    duration?: string
  }
  featured?: boolean
}

export interface WPProject {
  id: number
  title: { rendered: string }
  slug: string
  excerpt: { rendered: string }
  content: { rendered: string }
  featured_media?: number
  _embedded?: {
    'wp:featuredmedia'?: WPImage[]
  }
  project_meta?: WPProjectMeta
  acf?: WPProjectMeta
}

export interface WPTeamMeta {
  title?: string
  bio?: string
  email?: string
  phone?: string
  linkedin?: string
}

export interface WPTeamMember {
  id: number
  title: { rendered: string }
  slug: string
  excerpt: { rendered: string }
  content: { rendered: string }
  featured_media?: number
  _embedded?: {
    'wp:featuredmedia'?: WPImage[]
  }
  team_meta?: WPTeamMeta
  acf?: WPTeamMeta
}

export interface WPTestimonialMeta {
  client_name?: string
  company?: string
  project_id?: number
  rating?: number
}

export interface WPTestimonial {
  id: number
  title: { rendered: string }
  slug: string
  excerpt: { rendered: string }
  content: { rendered: string }
  featured_media?: number
  _embedded?: {
    'wp:featuredmedia'?: WPImage[]
  }
  testimonial_meta?: WPTestimonialMeta
  acf?: WPTestimonialMeta
}

/**
 * Fetch all services from WordPress
 */
export async function useServices() {
  const { data, error, pending } = await useFetch<WPService[]>(
    `${WP_API_URL}/services?_embed&_per_page=100`,
    {
      transform: (data: any) => {
        // Transform API response to normalize data structure
        return data.map((item: any) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          excerpt: item.excerpt,
          content: item.content,
          featured_media: item.featured_media,
          _embedded: item._embedded,
          // Check for ACF or custom meta fields
          services_meta: item.services_meta || item.acf || {},
          acf: item.acf || item.services_meta || {},
        }))
      },
    }
  )

  return {
    services: data,
    servicesError: error,
    servicesPending: pending,
  }
}

/**
 * Fetch a single service by slug
 */
export async function useService(slug: string) {
  const { data, error } = await useFetch<WPService[]>(
    `${WP_API_URL}/services?slug=${slug}&_embed`,
    {
      transform: (inputData: any) => {
        if (!inputData || inputData.length === 0) return [] as WPService[]
        const item = inputData[0]
        return [{
          id: item.id,
          title: item.title,
          slug: item.slug,
          excerpt: item.excerpt,
          content: item.content,
          featured_media: item.featured_media,
          _embedded: item._embedded,
          services_meta: item.services_meta || item.acf || {},
          acf: item.acf || item.services_meta || {},
        }] as WPService[]
      },
    }
  )

  return {
    service: computed(() => {
      const arr = data.value as unknown as WPService[]
      return arr?.[0] || null
    }),
    serviceError: error,
  }
}

/**
 * Fetch all projects from WordPress
 */
export async function useProjects(page = 1, perPage = 12, category?: string) {
  const categoryFilter = category ? `&category=${category}` : ''
  const { data, error, pending } = await useFetch<WPProject[]>(
    `${WP_API_URL}/projects?_embed&page=${page}&per_page=${perPage}${categoryFilter}`,
    {
      transform: (data: any) => {
        return data.map((item: any) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          excerpt: item.excerpt,
          content: item.content,
          featured_media: item.featured_media,
          _embedded: item._embedded,
          project_meta: item.project_meta || item.acf || {},
          acf: item.acf || item.project_meta || {},
        }))
      },
    }
  )

  return {
    projects: data,
    projectsError: error,
    projectsPending: pending,
  }
}

/**
 * Fetch a single project by slug
 */
export async function useProject(slug: string) {
  const { data, error } = await useFetch<WPProject[]>(
    `${WP_API_URL}/projects?slug=${slug}&_embed`,
    {
      transform: (inputData: any) => {
        if (!inputData || inputData.length === 0) return [] as WPProject[]
        const item = inputData[0]
        return [{
          id: item.id,
          title: item.title,
          slug: item.slug,
          excerpt: item.excerpt,
          content: item.content,
          featured_media: item.featured_media,
          _embedded: item._embedded,
          project_meta: item.project_meta || item.acf || {},
          acf: item.acf || item.project_meta || {},
        }] as WPProject[]
      },
    }
  )

  return {
    project: computed(() => {
      const arr = data.value as unknown as WPProject[]
      return arr?.[0] || null
    }),
    projectError: error,
  }
}

/**
 * Fetch featured projects
 */
export async function useFeaturedProjects() {
  const { data, error } = await useFetch<WPProject[]>(
    `${WP_API_URL}/projects?_embed&acf_featured=true&per_page=6`,
    {
      transform: (data: any) => {
        return data.map((item: any) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          excerpt: item.excerpt,
          content: item.content,
          featured_media: item.featured_media,
          _embedded: item._embedded,
          project_meta: item.project_meta || item.acf || {},
          acf: item.acf || item.project_meta || {},
        }))
      },
    }
  )

  return {
    featuredProjects: data,
    featuredProjectsError: error,
  }
}

/**
 * Fetch all team members
 */
export async function useTeam() {
  const { data, error } = await useFetch<WPTeamMember[]>(
    `${WP_API_URL}/team?_embed&per_page=100`,
    {
      transform: (data: any) => {
        return data.map((item: any) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          excerpt: item.excerpt,
          content: item.content,
          featured_media: item.featured_media,
          _embedded: item._embedded,
          team_meta: item.team_meta || item.acf || {},
          acf: item.acf || item.team_meta || {},
        }))
      },
    }
  )

  return {
    team: data,
    teamError: error,
  }
}

/**
 * Fetch all testimonials
 */
export async function useTestimonials() {
  const { data, error } = await useFetch<WPTestimonial[]>(
    `${WP_API_URL}/testimonials?_embed&per_page=100`,
    {
      transform: (data: any) => {
        return data.map((item: any) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          excerpt: item.excerpt,
          content: item.content,
          featured_media: item.featured_media,
          _embedded: item._embedded,
          testimonial_meta: item.testimonial_meta || item.acf || {},
          acf: item.acf || item.testimonial_meta || {},
        }))
      },
    }
  )

  return {
    testimonials: data,
    testimonialsError: error,
  }
}

/**
 * Helper function to get featured image URL
 */
export function getFeaturedImage(post: WPService | WPProject | WPTeamMember | WPTestimonial): string | null {
  const media = post._embedded?.['wp:featuredmedia']?.[0]
  return media?.source_url || null
}

/**
 * Helper function to get featured image alt text
 */
export function getFeaturedImageAlt(post: WPService | WPProject | WPTeamMember | WPTestimonial): string {
  const media = post._embedded?.['wp:featuredmedia']?.[0]
  return media?.alt_text || post.title.rendered || ''
}
