// Dynamic sitemap generation for services and projects from WordPress API
export default defineEventHandler(async (event) => {
  const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://vp-associates.com'
  const wpApiUrl = process.env.NUXT_PUBLIC_WP_API_URL || 'https://vp-associates.com/wp-json/wp/v2'

  const urls: Array<{
    loc: string
    lastmod?: string
    changefreq?: string
    priority?: number
  }> = [
    // Static pages
    { loc: '/', changefreq: 'daily', priority: 1.0 },
    { loc: '/about', changefreq: 'monthly', priority: 0.9 },
    { loc: '/services', changefreq: 'weekly', priority: 0.9 },
    { loc: '/projects', changefreq: 'weekly', priority: 0.9 },
    { loc: '/contact', changefreq: 'monthly', priority: 0.8 },
    { loc: '/careers', changefreq: 'monthly', priority: 0.7 },
  ]

  try {
    // Fetch services from WordPress API
    const servicesResponse = await fetch(`${wpApiUrl}/services?per_page=100&_fields=slug,date`)
    if (servicesResponse.ok) {
      const services = await servicesResponse.json()
      for (const service of services) {
        urls.push({
          loc: `/services/${service.slug}`,
          lastmod: service.date ? new Date(service.date).toISOString() : undefined,
          changefreq: 'monthly',
          priority: 0.8,
        })
      }
    }

    // Fetch projects from WordPress API
    const projectsResponse = await fetch(`${wpApiUrl}/projects?per_page=100&_fields=slug,date`)
    if (projectsResponse.ok) {
      const projects = await projectsResponse.json()
      for (const project of projects) {
        urls.push({
          loc: `/projects/${project.slug}`,
          lastmod: project.date ? new Date(project.date).toISOString() : undefined,
          changefreq: 'monthly',
          priority: 0.7,
        })
      }
    }
  } catch (error) {
    // Log error but continue with static URLs
    console.error('Error fetching dynamic routes for sitemap:', error)
  }

  // Generate XML sitemap
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${siteUrl}${url.loc}</loc>
${url.lastmod ? `    <lastmod>${url.lastmod}</lastmod>\n` : ''}    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  setHeader(event, 'content-type', 'application/xml')
  return xml
})
