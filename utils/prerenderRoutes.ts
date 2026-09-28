/**
 * Discover the WordPress-backed detail pages to prerender at build time.
 *
 * Production is static files on nginx, so any detail page that is not
 * prerendered simply does not exist there. Errors are thrown rather than
 * swallowed: a failed build keeps the previous site live, while a silent
 * failure would ship a site with no project or service pages.
 */

type FetchLike = (url: string) => Promise<Response>

async function slugs(wpApiUrl: string, type: string, fetchImpl: FetchLike): Promise<string[]> {
  const found: string[] = []
  let totalPages = 1

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const response = await fetchImpl(`${wpApiUrl}/${type}?per_page=100&page=${pageNum}&_fields=slug`)
    if (!response.ok) {
      throw new Error(`Fetching ${type} slugs failed: HTTP ${response.status}`)
    }

    let items: unknown
    try {
      items = await response.json()
    } catch {
      throw new Error(`Fetching ${type} slugs failed: response was not JSON`)
    }
    if (!Array.isArray(items)) {
      throw new Error(`Fetching ${type} slugs failed: expected a list`)
    }

    for (const item of items as Array<{ slug?: unknown }>) {
      if (typeof item.slug === 'string' && item.slug) found.push(item.slug)
    }
    totalPages = Number(response.headers.get('X-WP-TotalPages')) || 1
  }

  return found
}

export async function wordpressRoutes(wpApiUrl: string, fetchImpl: FetchLike = fetch): Promise<string[]> {
  const [projects, services] = await Promise.all([
    slugs(wpApiUrl, 'projects', fetchImpl),
    slugs(wpApiUrl, 'services', fetchImpl),
  ])
  return [
    ...projects.map(slug => `/projects/${encodeURIComponent(slug)}`),
    ...services.map(slug => `/services/${encodeURIComponent(slug)}`),
  ]
}
