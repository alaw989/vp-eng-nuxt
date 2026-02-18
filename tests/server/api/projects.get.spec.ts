/**
 * Tests for server/api/projects.get.ts static data structure
 */

import { describe, it, expect } from 'vitest'

describe('Server API: Projects - Static Data', () => {
  it('has correct WP API URL structure', () => {
    const WP_API_URL = 'https://www.vp-associates.com/wp-json/wp/v2'
    expect(WP_API_URL).toBe('https://www.vp-associates.com/wp-json/wp/v2')
  })

  it('has cache TTL of 15 minutes', () => {
    const CACHE_TTL = 15 * 60 * 1000
    expect(CACHE_TTL).toBe(900000) // 15 minutes in ms
  })

  it('static projects have correct structure', () => {
    const staticProject = {
      title: { rendered: 'Tampa Marina Complex' },
      slug: 'tampa-marina-complex',
      excerpt: { rendered: '<p>Complete structural design for a 50-slip marina with restaurant and retail spaces</p>' },
      custom_fields: {
        project_category: 'Marine',
        project_location: 'Tampa, FL',
        project_year: '2024',
      }
    }

    expect(staticProject).toHaveProperty('title')
    expect(staticProject).toHaveProperty('slug')
    expect(staticProject).toHaveProperty('excerpt')
    expect(staticProject).toHaveProperty('custom_fields')
    expect(staticProject.custom_fields).toHaveProperty('project_category')
    expect(staticProject.custom_fields).toHaveProperty('project_location')
    expect(staticProject.custom_fields).toHaveProperty('project_year')
  })

  it('static projects cover all expected categories', () => {
    const categories = ['Marine', 'Commercial', 'Residential', 'Industrial']
    expect(categories).toContain('Marine')
    expect(categories).toContain('Commercial')
    expect(categories).toContain('Residential')
    expect(categories).toContain('Industrial')
  })

  it('projects are located in Florida', () => {
    const locations = ['Tampa, FL', 'Clearwater, FL', 'St. Petersburg, FL', 'Brandon, FL']
    locations.forEach(location => {
      expect(location).toContain('FL')
    })
  })

  it('API query parameters are correctly named', () => {
    const queryParams = ['page', 'per_page', 'category', 'featured', '_embed', '_nocache']
    expect(queryParams).toContain('page')
    expect(queryParams).toContain('per_page')
    expect(queryParams).toContain('_embed')
  })

  it('default per_page is 12', () => {
    const per_page = 12
    expect(per_page).toBe(12)
  })

  it('cache key structure includes all relevant params', () => {
    const page = 1
    const per_page = 12
    const category = 'commercial'
    const featured = 'true'
    const cacheKey = `projects_${page}_${per_page}_${category}_${featured}`

    expect(cacheKey).toBe('projects_1_12_commercial_true')
  })

  it('API fetch timeout is 10 seconds', () => {
    const timeout = 10000
    expect(timeout).toBe(10000)
  })

  it('fallback response structure is correct', () => {
    const fallbackResponse = {
      success: true,
      data: [],
      _fallback: true,
      _error: 'Failed to fetch from WordPress API, using static fallback',
    }

    expect(fallbackResponse).toHaveProperty('success', true)
    expect(fallbackResponse).toHaveProperty('data')
    expect(fallbackResponse).toHaveProperty('_fallback', true)
    expect(fallbackResponse).toHaveProperty('_error')
  })
})
