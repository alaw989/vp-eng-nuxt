import { describe, it, expect } from 'vitest'
import { PROJECTS_PAGE_QUERY, projectCategories } from '../projects'

const p = (category: string) => ({ category })

describe('PROJECTS_PAGE_QUERY', () => {
  it('requests every project in one call, not the API default of 12', () => {
    // WordPress caps per_page at 100. Filtering runs client-side, so a smaller
    // page silently hides whole categories.
    expect(PROJECTS_PAGE_QUERY.per_page).toBe(100)
  })
})

describe('projectCategories', () => {
  it('always leads with All Projects', () => {
    expect(projectCategories([])).toEqual([{ id: 'all', name: 'All Projects' }])
  })

  it('offers only categories that have projects', () => {
    const ids = projectCategories([p('Industrial'), p('Bridges')]).map(c => c.id)
    expect(ids).toEqual(['all', 'Bridges', 'Industrial'])
    expect(ids).not.toContain('Marine')
  })

  it('lists each category once, largest first', () => {
    const ids = projectCategories([
      p('Bridges'),
      p('Commercial'), p('Commercial'),
      p('Industrial'), p('Industrial'), p('Industrial'),
      p('Bridges'),
    ]).map(c => c.id)
    expect(ids).toEqual(['all', 'Industrial', 'Bridges', 'Commercial'])
  })

  it('breaks ties alphabetically so the order is stable', () => {
    const ids = projectCategories([p('Marine'), p('Commercial')]).map(c => c.id)
    expect(ids).toEqual(['all', 'Commercial', 'Marine'])
  })

  it('puts the catch-all Miscellaneous last whatever its size', () => {
    const ids = projectCategories([
      p('Miscellaneous'), p('Miscellaneous'), p('Miscellaneous'),
      p('Bridges'),
    ]).map(c => c.id)
    expect(ids).toEqual(['all', 'Bridges', 'Miscellaneous'])
  })

  it('ignores projects with no category', () => {
    const ids = projectCategories([p(''), p('  '), p('Commercial')]).map(c => c.id)
    expect(ids).toEqual(['all', 'Commercial'])
  })
})
