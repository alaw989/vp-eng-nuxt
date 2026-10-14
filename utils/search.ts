/**
 * Site search.
 * Production is static nginx, so there is no search endpoint to call. The
 * index is built from WordPress when the site is generated
 * (server/api/search-index.get.ts, prerendered into the /search payload) and
 * searched here, in the browser.
 */

export type SearchType = 'page' | 'service' | 'project'

export interface SearchItem {
  type: SearchType
  title: string
  slug: string
  description: string
  url: string
  icon?: string
  category?: string
  location?: string
  /** Text that should match but is not shown, such as a service's full description */
  keywords?: string
}

/** Lowercased words of a query, ignoring punctuation-only ones like "&" */
export function searchTerms(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map(term => term.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ''))
    .filter(Boolean)
}

/**
 * Items containing every word of the query (anywhere in the title, category,
 * location, description or keywords), best match first: title matches outrank
 * category and location, which outrank the rest. Partial words match, so
 * "struct" finds "Structural".
 */
export function searchItems(items: readonly SearchItem[], query: string): SearchItem[] {
  const terms = searchTerms(query)
  if (terms.length === 0) return []
  const phrase = terms.join(' ')

  const scored: Array<{ item: SearchItem, score: number }> = []
  for (const item of items) {
    const title = item.title.toLowerCase()
    const facets = `${item.category ?? ''} ${item.location ?? ''}`.toLowerCase()
    const body = `${item.description} ${item.keywords ?? ''}`.toLowerCase()

    if (!terms.every(term => title.includes(term) || facets.includes(term) || body.includes(term))) continue

    let score = 0
    if (title === phrase) score += 100
    else if (title.startsWith(phrase)) score += 50
    else if (title.includes(phrase)) score += 25
    for (const term of terms) {
      if (title.includes(term)) score += 10
      else if (facets.includes(term)) score += 5
      else score += 1
    }
    scored.push({ item, score })
  }

  return scored
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .map(({ item }) => item)
}
