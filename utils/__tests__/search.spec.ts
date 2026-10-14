import { describe, it, expect } from 'vitest'
import { searchItems, searchTerms, type SearchItem } from '../search'

const items: SearchItem[] = [
  { type: 'page', title: 'Home', slug: '', url: '/', description: 'Structural engineering in Tampa Bay', keywords: 'steel concrete seawalls' },
  { type: 'service', title: 'Structural Steel Design', slug: 'structural-steel-design-2', url: '/services/structural-steel-design-2', description: 'Steel design to AISC 360' },
  { type: 'service', title: 'Steel Detailing', slug: 'steel-detailing', url: '/services/steel-detailing', description: 'SDS2 and BIM steel connection design and detailing' },
  { type: 'service', title: 'CAD & 3D Modeling', slug: 'cad-3d-modeling', url: '/services/cad-3d-modeling', description: 'CAD and BIM modeling' },
  { type: 'project', title: 'Parker Bridge E1', slug: 'parker-bridge', url: '/projects/parker-bridge', description: '', category: 'Bridges', keywords: 'Parker Bridge E1-1' },
  { type: 'project', title: 'Metso ISO', slug: 'metso-iso-306', url: '/projects/metso-iso-306', description: '', category: 'Miscellaneous' },
]

const titles = (query: string) => searchItems(items, query).map(item => item.title)

describe('searchTerms', () => {
  it('lowercases words and drops punctuation-only ones', () => {
    expect(searchTerms('  CAD & 3D, Modeling ')).toEqual(['cad', '3d', 'modeling'])
  })

  it('is empty for a blank query', () => {
    expect(searchTerms('   ')).toEqual([])
  })
})

describe('searchItems', () => {
  it('finds nothing for a blank query', () => {
    expect(searchItems(items, '')).toEqual([])
  })

  it('requires every word, so extra words narrow the results', () => {
    expect(titles('steel')).toEqual(['Steel Detailing', 'Structural Steel Design', 'Home'])
    expect(titles('structural steel')).toEqual(['Structural Steel Design', 'Home'])
  })

  it('matches partial words', () => {
    expect(titles('struct')).toContain('Structural Steel Design')
  })

  it('ranks title matches above category matches above description matches', () => {
    expect(titles('bridge')).toEqual(['Parker Bridge E1'])
    expect(titles('bridges')[0]).toBe('Parker Bridge E1')
    expect(titles('bim')).toEqual(['CAD & 3D Modeling', 'Steel Detailing'])
  })

  it('puts an exact title match first', () => {
    expect(titles('steel detailing')[0]).toBe('Steel Detailing')
  })

  it('ignores case and stray punctuation', () => {
    expect(titles('cad & 3d')).toEqual(['CAD & 3D Modeling'])
    expect(titles('METSO,')).toEqual(['Metso ISO'])
  })

  it('finds a project by a category it is in', () => {
    expect(titles('miscellaneous')).toEqual(['Metso ISO'])
  })
})
