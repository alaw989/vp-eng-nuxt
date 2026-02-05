// Dynamic sitemap generation for services and projects from WordPress API
// Includes all static pages and dynamic routes with proper lastmod timestamps
export default defineEventHandler(async (event) => {
  const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://vp-associates.com'
  const wpApiUrl = process.env.NUXT_PUBLIC_WP_API_URL || 'https://vp-associates.com/wp-json/wp/v2'

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

  // Fetch services from WordPress API with error handling
  try {
    const servicesResponse = await fetch(`${wpApiUrl}/services?per_page=100&_fields=slug,date`, {
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })
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
    } else {
      console.warn(`Services endpoint returned status: ${servicesResponse.status}`)
    }
  } catch (error) {
    console.warn('Failed to fetch services for sitemap:', error instanceof Error ? error.message : error)
  }

  // Fetch projects from WordPress API with error handling
  try {
    const projectsResponse = await fetch(`${wpApiUrl}/projects?per_page=100&_fields=slug,date`, {
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })
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
    } else {
      console.warn(`Projects endpoint returned status: ${projectsResponse.status}`)
    }
  } catch (error) {
    console.warn('Failed to fetch projects for sitemap:', error instanceof Error ? error.message : error)
  }

  // Fetch careers from WordPress API with error handling
  // Note: This endpoint may not exist (returns 404) - handle gracefully
  try {
    const careersResponse = await fetch(`${wpApiUrl}/careers?per_page=100&_fields=slug,date`, {
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })
    if (careersResponse.ok) {
      const careers = await careersResponse.json()
      for (const career of careers) {
        urls.push({
          loc: `/careers/${career.slug}`,
          lastmod: career.date ? new Date(career.date).toISOString() : undefined,
          changefreq: 'monthly',
          priority: 0.6,
        })
      }
    }
    // 404 is expected if careers endpoint doesn't exist - no warning needed
  } catch (error) {
    // Silently skip careers if endpoint doesn't exist
    if ((error instanceof Error) && !error.message.includes('404') && !error.message.includes('no route')) {
      console.warn('Failed to fetch careers for sitemap:', error.message)
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
