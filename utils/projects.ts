/**
 * Projects page helpers.
 * The page filters client-side, so it needs every project up front, and its
 * category chips must come from the data rather than a hardcoded list that
 * can drift from the WordPress taxonomy.
 */

export interface ProjectCategory {
  id: string
  name: string
}

/** WordPress caps per_page at 100; the API route defaults to 12. */
export const PROJECTS_PAGE_QUERY = { per_page: 100 } as const

const CATCH_ALL = 'Miscellaneous'

/**
 * Category chips for the projects that exist: "All Projects" first, then each
 * category once, largest first (ties alphabetical), with the catch-all last.
 */
export function projectCategories(projects: readonly { category: string }[]): ProjectCategory[] {
  const counts = new Map<string, number>()
  for (const { category } of projects) {
    const name = category.trim()
    if (name) counts.set(name, (counts.get(name) ?? 0) + 1)
  }

  const names = [...counts.keys()].sort((a, b) => {
    if (a === CATCH_ALL) return 1
    if (b === CATCH_ALL) return -1
    return counts.get(b)! - counts.get(a)! || a.localeCompare(b)
  })

  return [{ id: 'all', name: 'All Projects' }, ...names.map(name => ({ id: name, name }))]
}
