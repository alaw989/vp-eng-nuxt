interface RSSItem {
  title: string
  link: string
  description: string
  pubDate: string
  guid: string
  category?: string
}

export default defineEventHandler(async (event) => {
  const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://vp-associates.com'

  // Fetch projects to include in RSS feed
  const projectsResponse = await $fetch<{ id: number; slug: string; title: { rendered: string }; excerpt: { rendered: string }; date: string; content: { rendered: string } }[]>(
    `${process.env.WP_API_URL || 'https://whataustinhasmade.com/vp-eng/wp-json/wp/v2'}/projects?per_page=20&_fields=id,slug,title,excerpt,date,content`
  ).catch(() => null)

  // Fetch services to include in RSS feed
  const servicesResponse = await $fetch<{ id: number; slug: string; title: { rendered: string }; excerpt: { rendered: string }; content: { rendered: string } }[]>(
    `${process.env.WP_API_URL || 'https://whataustinhasmade.com/vp-eng/wp-json/wp/v2'}/services?per_page=20&_fields=id,slug,title,excerpt,content`
  ).catch(() => null)

  const rssItems: RSSItem[] = []

  // Add projects to RSS feed
  if (projectsResponse && Array.isArray(projectsResponse)) {
    for (const project of projectsResponse) {
      rssItems.push({
        title: project.title.rendered,
        link: `${siteUrl}/projects/${project.slug}`,
        description: stripHtml(project.excerpt.rendered) || stripHtml(project.content.rendered).substring(0, 200) + '...',
        pubDate: new Date(project.date).toUTCString(),
        guid: `${siteUrl}/projects/${project.slug}`,
        category: 'Projects',
      })
    }
  }

  // Add services to RSS feed
  if (servicesResponse && Array.isArray(servicesResponse)) {
    for (const service of servicesResponse) {
      rssItems.push({
        title: service.title.rendered,
        link: `${siteUrl}/services/${service.slug}`,
        description: stripHtml(service.excerpt.rendered) || stripHtml(service.content.rendered).substring(0, 200) + '...',
        pubDate: new Date().toUTCString(),
        guid: `${siteUrl}/services/${service.slug}`,
        category: 'Services',
      })
    }
  }

  // Sort by date (newest first)
  rssItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())

  // Generate RSS XML
  const rssXml = generateRSS({
    title: 'VP Associates - Structural Engineering Services',
    description: 'Latest projects and services from VP Associates, providing structural engineering services in Tampa Bay.',
    link: siteUrl,
    language: 'en-us',
    lastBuildDate: new Date().toUTCString(),
    items: rssItems,
  })

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return rssXml
})

function generateRSS(config: {
  title: string
  description: string
  link: string
  language: string
  lastBuildDate: string
  items: RSSItem[]
}): string {
  const { title, description, link, language, lastBuildDate, items } = config

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <description>${escapeXml(description)}</description>
    <link>${link}</link>
    <atom:link href="${link}/api/rss.xml" rel="self" type="application/rss+xml" />
    <language>${language}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <generator>VP Associates Nuxt Site</generator>
${items.map(item => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.link}</link>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${item.pubDate}</pubDate>
      <guid>${item.guid}</guid>
      ${item.category ? `<category>${escapeXml(item.category)}</category>` : ''}
    </item>`).join('\n')}
  </channel>
</rss>`
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}
