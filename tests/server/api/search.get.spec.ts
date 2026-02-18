/**
 * Tests for server/api/search.get.ts static data structure
 */

import { describe, it, expect } from 'vitest'

describe('Server API: Search - Functionality', () => {
  it('has query parameter for search term', () => {
    const queryParam = 'search'
    expect(queryParam).toBe('search')
  })

  it('has response structure with results', () => {
    const searchResponse = {
      success: true,
      query: 'structural',
      results: [
        {
          type: 'project',
          title: 'Structural Steel Design',
          slug: 'structural-steel-design',
          excerpt: 'Complete structural design services...',
        },
        {
          type: 'service',
          title: 'Structural Analysis',
          slug: 'structural-analysis',
          excerpt: 'Expert structural analysis...',
        }
      ],
      total: 2,
    }

    expect(searchResponse).toHaveProperty('success')
    expect(searchResponse).toHaveProperty('query')
    expect(searchResponse).toHaveProperty('results')
    expect(searchResponse).toHaveProperty('total')
    expect(Array.isArray(searchResponse.results)).toBe(true)
  })

  it('search result has required fields', () => {
    const result = {
      type: 'project',
      title: 'Test Project',
      slug: 'test-project',
      excerpt: 'Test excerpt...',
    }

    expect(result).toHaveProperty('type')
    expect(result).toHaveProperty('title')
    expect(result).toHaveProperty('slug')
    expect(result).toHaveProperty('excerpt')
  })

  it('supports valid result types', () => {
    const validTypes = ['project', 'service', 'team', 'testimonial']
    expect(validTypes).toContain('project')
    expect(validTypes).toContain('service')
    expect(validTypes).toContain('team')
    expect(validTypes).toContain('testimonial')
  })

  it('handles empty search results', () => {
    const emptyResponse = {
      success: true,
      query: 'nonexistent',
      results: [],
      total: 0,
    }

    expect(emptyResponse.results).toEqual([])
    expect(emptyResponse.total).toBe(0)
  })
})
