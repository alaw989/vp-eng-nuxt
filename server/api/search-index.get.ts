/**
 * Search index for the /search page
 * GET /api/search-index
 *
 * Production has no server, so this runs once, when /search is prerendered:
 * its useFetch result is saved in the page payload and the browser searches
 * it with utils/search.ts. A WordPress failure throws rather than shipping an
 * index with no services or projects in it.
 */
import { decodeHtmlEntities, stripHtml } from '~/utils/html'
import type { SearchItem } from '~/utils/search'

const staticPages: SearchItem[] = [
  { type: 'page', title: 'Home', slug: '', url: '/', icon: 'mdi:home', description: 'Structural engineering and steel detailing in Tampa Bay', keywords: 'steel concrete masonry wood foundations seawalls steel detailing' },
  { type: 'page', title: 'About Us', slug: 'about', url: '/about', icon: 'mdi:information', description: 'Our company, history and team', keywords: 'team engineers history experience licensed registered states company' },
  { type: 'page', title: 'Services', slug: 'services', url: '/services', icon: 'mdi:cogs', description: 'Every structural engineering service we offer' },
  { type: 'page', title: 'Projects', slug: 'projects', url: '/projects', icon: 'mdi:folder-multiple', description: 'Our portfolio of completed projects', keywords: 'portfolio work drawings' },
  { type: 'page', title: 'Careers', slug: 'careers', url: '/careers', icon: 'mdi:briefcase', description: 'Working at VP Associates', keywords: 'jobs employment hiring positions resume' },
  { type: 'page', title: 'Contact Us', slug: 'contact', url: '/contact', icon: 'mdi:email', description: 'Call (813) 486-2079 or send us a message', keywords: 'quote phone email address message' },
  { type: 'page', title: 'Site Map', slug: 'sitemap', url: '/sitemap', icon: 'mdi:sitemap', description: 'Every page on the site' },
  { type: 'page', title: 'Privacy Policy', slug: 'privacy', url: '/privacy', icon: 'mdi:shield-account', description: 'How we collect, use and protect your information' },
  { type: 'page', title: 'Terms of Service', slug: 'terms', url: '/terms', icon: 'mdi:file-document', description: 'Terms for using this website' },
  { type: 'page', title: 'Accessibility Statement', slug: 'accessibility', url: '/accessibility', icon: 'mdi:human', description: 'Our commitment to WCAG 2.1 AA accessibility' },
]

const text = (html: string | undefined) => decodeHtmlEntities(stripHtml(html)).replace(/\s+/g, ' ')

/** Every item of a WordPress collection, following its page count */
async function wordpressItems(type: string, fields: string): Promise<any[]> {
  const { wpApiUrl } = useRuntimeConfig()
  const items: any[] = []
  let totalPages = 1
  for (let page = 1; page <= totalPages; page++) {
    const response = await $fetch.raw<any[]>(`${wpApiUrl}/${type}`, {
      query: { per_page: 100, page, _fields: fields },
      timeout: 15000,
    })
    items.push(...(response._data || []))
    totalPages = Number(response.headers.get('X-WP-TotalPages')) || 1
  }
  return items
}

export default defineEventHandler(async (): Promise<SearchItem[]> => {
  const [services, projects] = await Promise.all([
    wordpressItems('services', 'slug,title,excerpt,content,custom_fields'),
    wordpressItems('projects', 'slug,title,excerpt,custom_fields'),
  ])

  return [
    ...staticPages,
    ...services.map((service): SearchItem => ({
      type: 'service',
      title: text(service.title?.rendered),
      slug: service.slug,
      url: `/services/${service.slug}`,
      icon: service.custom_fields?.service_icon || 'mdi:cog',
      description: text(service.excerpt?.rendered),
      keywords: `${service.custom_fields?.service_standard || ''} ${text(service.content?.rendered)}`.trim(),
    })),
    ...projects.map((project): SearchItem => ({
      type: 'project',
      title: text(project.title?.rendered),
      slug: project.slug,
      url: `/projects/${project.slug}`,
      icon: 'mdi:office-building',
      description: text(project.excerpt?.rendered),
      category: decodeHtmlEntities(project.custom_fields?.project_category) || undefined,
      location: decodeHtmlEntities(project.custom_fields?.project_location) || undefined,
      // Drawing titles, so a sheet name finds its project
      keywords: (project.custom_fields?.project_pdfs || []).map((pdf: { title?: string }) => pdf.title || '').join(' ') || undefined,
    })),
  ]
})
