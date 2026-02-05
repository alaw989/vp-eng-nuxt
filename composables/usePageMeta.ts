// Composable for consistent page meta tags across the site
// Provides Open Graph, Twitter Cards, and other SEO meta tags

interface PageMetaOptions {
  title: string
  description: string
  ogImage?: string
  ogType?: 'website' | 'article'
  noindex?: boolean
  keywords?: string
  titleSuffix?: boolean
  robots?: string
  canonicalUrl?: string
}

export function usePageMeta(options: PageMetaOptions) {
  const config = useRuntimeConfig()
  const route = useRoute()
  const siteUrl = config.public.siteUrl || 'https://vp-associates.com'

  const {
    title,
    description,
    ogImage = `${siteUrl}/images/og-default.jpg`,
    ogType = 'website',
    noindex = false,
    keywords,
    titleSuffix = true,
    robots,
    canonicalUrl,
  } = options

  const fullTitle = titleSuffix ? `${title} | VP Associates` : title
  const currentPath = canonicalUrl || siteUrl + route.path

  const metaTags: Array<{ name?: string; property?: string; content: string }> = [
    // Basic SEO
    { name: 'description', content: description },

    // Open Graph / Facebook
    { property: 'og:type', content: ogType },
    { property: 'og:site_name', content: 'VP Associates' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: currentPath },
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
  ]

  // Add custom keywords if provided, otherwise use auto-generated
  if (keywords) {
    metaTags.push({ name: 'keywords', content: keywords })
  } else {
    metaTags.push({ name: 'keywords', content: 'structural engineering, Tampa Bay, VP Associates, ' + title.toLowerCase() })
  }

  // Handle robots meta tag
  if (noindex) {
    metaTags.push({ name: 'robots', content: 'noindex, nofollow' })
  } else if (robots) {
    metaTags.push({ name: 'robots', content: robots })
  }

  const linkTags: Array<{ rel: string; href: string }> = []

  // Add canonical URL
  if (!noindex) {
    linkTags.push({
      rel: 'canonical',
      href: currentPath,
    })
  }

  useHead({
    title: fullTitle,
    meta: metaTags,
    link: linkTags.length > 0 ? linkTags : undefined,
  })

  return {
    fullTitle,
    siteUrl,
    canonicalUrl: currentPath,
  }
}
