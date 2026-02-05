// Dynamic sitemap generation for services and projects from WordPress API
// Includes all static pages and dynamic routes with proper lastmod timestamps
// Falls back to static data when WordPress API is unavailable
export default defineEventHandler(async (event) => {
  const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://vp-associates.com'
  const wpApiUrl = process.env.NUXT_PUBLIC_WP_API_URL || 'https://www.vp-associates.com/wp-json/wp/v2'

  const urls: Array<{
    loc: string
    lastmod?: string
    changefreq?: string
    priority?: number
  }> = [
    // Static pages with appropriate priorities and change frequencies
    { loc: '/', changefreq: 'daily', priority: 1.0 },
    { loc: '/about', changefreq: 'monthly', priority: 0.9 },
    { loc: '/services', changefreq: 'weekly', priority: 0.9 },
    { loc: '/projects', changefreq: 'weekly', priority: 0.9 },
    { loc: '/contact', changefreq: 'monthly', priority: 0.8 },
    { loc: '/careers', changefreq: 'monthly', priority: 0.7 },
    { loc: '/search', changefreq: 'weekly', priority: 0.6 },
  ]

  // Static fallback services (mirrors server/api/services.get.ts)
  const staticServices = [
    { slug: 'structural-steel-design' },
    { slug: 'concrete-design' },
    { slug: 'masonry-design' },
    { slug: 'foundation-design' },
    { slug: 'seawall-design' },
    { slug: 'steel-detailing' },
  ]

  // Static fallback projects (mirrors server/api/projects.get.ts)
  const staticProjects = [
    { slug: 'tampa-marina-complex' },
    { slug: 'downtown-office-tower' },
    { slug: 'coastal-seawall-system' },
    { slug: 'luxury-residential-estate' },
    { slug: 'industrial-warehouse-complex' },
  ]

  // Fetch services from WordPress API with error handling
  let servicesFetched = false
  try {
    const servicesResponse = await fetch(`${wpApiUrl}/services?per_page=100&_fields=slug,date`, {
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })
    if (servicesResponse.ok) {
      const services = await servicesResponse.json()
      if (Array.isArray(services) && services.length > 0) {
        for (const service of services) {
          urls.push({
            loc: `/services/${service.slug}`,
            lastmod: service.date ? new Date(service.date).toISOString() : undefined,
            changefreq: 'monthly',
            priority: 0.8,
          })
        }
        servicesFetched = true
      }
    }
  } catch (error) {
    // Silently fall back to static services
  }

  // Use static fallback if no services were fetched
  if (!servicesFetched) {
    for (const service of staticServices) {
      urls.push({
        loc: `/services/${service.slug}`,
        changefreq: 'monthly',
        priority: 0.8,
      })
    }
  }

  // Fetch projects from WordPress API with error handling
  let projectsFetched = false
  try {
    const projectsResponse = await fetch(`${wpApiUrl}/projects?per_page=100&_fields=slug,date`, {
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })
    if (projectsResponse.ok) {
      const projects = await projectsResponse.json()
      if (Array.isArray(projects) && projects.length > 0) {
        for (const project of projects) {
          urls.push({
            loc: `/projects/${project.slug}`,
            lastmod: project.date ? new Date(project.date).toISOString() : undefined,
            changefreq: 'monthly',
            priority: 0.7,
          })
        }
        projectsFetched = true
      }
    }
  } catch (error) {
    // Silently fall back to static projects
  }

  // Use static fallback if no projects were fetched
  if (!projectsFetched) {
    for (const project of staticProjects) {
      urls.push({
        loc: `/projects/${project.slug}`,
        changefreq: 'monthly',
        priority: 0.7,
      })
    }
  }

  // Generate XML sitemap with proper formatting
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => {
  const lastmodLine = url.lastmod ? `    <lastmod>${url.lastmod}</lastmod>\n` : ''
  return `  <url>
    <loc>${siteUrl}${url.loc}</loc>
${lastmodLine}    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
}).join('\n')}
</urlset>`

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return xml
})
