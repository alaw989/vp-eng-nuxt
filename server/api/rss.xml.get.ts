// RSS Feed endpoint for future blog/news functionality
// Currently returns a placeholder feed structure that can be populated when blog is added

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl || 'https://vp-associates.com'

  // Future: Fetch blog posts from WordPress or other CMS
  // const posts = await $fetch('/api/blog-posts')

  // Placeholder posts - replace with actual blog posts when implemented
  const posts = [
    {
      title: 'Welcome to VP Associates - Structural Engineering Excellence',
      description: 'VP Associates has been serving Tampa Bay with exceptional structural engineering services for over 30 years. Learn more about our commitment to excellence.',
      link: `${siteUrl}/`,
      pubDate: new Date().toUTCString(),
      category: 'Company News'
    },
    {
      title: 'Our Structural Engineering Services',
      description: 'From structural steel and concrete design to seawalls and foundations, we provide comprehensive engineering solutions for projects of all sizes.',
      link: `${siteUrl}/services`,
      pubDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toUTCString(),
      category: 'Services'
    },
    {
      title: 'Featured Projects from Our Portfolio',
      description: 'Explore our portfolio of successful engineering projects across Tampa Bay including commercial, marine, residential, and industrial structures.',
      link: `${siteUrl}/projects`,
      pubDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toUTCString(),
      category: 'Projects'
    }
  ]

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>VP Associates - Structural Engineering</title>
    <description>Tampa Bay's trusted structural engineering firm for over 30 years. Providing comprehensive structural engineering services including steel, concrete, masonry, foundations, and seawalls.</description>
    <link>${siteUrl}/</link>
    <atom:link href="${siteUrl}/api/rss.xml" rel="self" type="application/rss+xml" />
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${posts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.description}]]></description>
      <link>${post.link}</link>
      <guid>${post.link}</guid>
      <pubDate>${post.pubDate}</pubDate>
      <category><![CDATA[${post.category}]]></category>
    </item>`).join('')}
  </channel>
</rss>`

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=3600')

  return rss
})
