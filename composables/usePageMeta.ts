// Composable for consistent page meta tags across the site
// Provides Open Graph, Twitter Cards, and other SEO meta tags

interface PageMetaOptions {
  title: string
  description: string
  ogImage?: string
  ogType?: 'website' | 'article'
  noindex?: boolean
}

export function usePageMeta(options: PageMetaOptions) {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl || 'https://vp-associates.com'

  const {
    title,
    description,
    ogImage = `${siteUrl}/images/og-default.jpg`,
    ogType = 'website',
    noindex = false
  } = options

  const fullTitle = `${title} | VP Associates`

  const metaTags = [
    // Basic SEO
    { name: 'description', content: description },

    // Open Graph / Facebook
    { property: 'og:type', content: ogType },
    { property: 'og:site_name', content: 'VP Associates' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: siteUrl + useRoute().path },
    { property: 'og:image', content: ogImage },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: title },

    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:site', content: '@vpassociates' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: ogImage },
    { name: 'twitter:image:alt', content: title },

    // Additional SEO
    { name: 'author', content: 'VP Associates' },
    { name: 'keywords', content: 'structural engineering, Tampa Bay, VP Associates, ' + title.toLowerCase() },
  ]

  // Add noindex if specified
  if (noindex) {
    metaTags.push({ name: 'robots', content: 'noindex, nofollow' })
  }

  useHead({
    title: fullTitle,
    meta: metaTags,
  })

  return {
    fullTitle,
    siteUrl,
  }
}
