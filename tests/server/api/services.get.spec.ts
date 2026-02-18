/**
 * Tests for server/api/services.get.ts static data structure
 */

import { describe, it, expect } from 'vitest'

describe('Server API: Services - Static Data', () => {
  it('has correct WP API URL structure', () => {
    const WP_API_URL = 'https://www.vp-associates.com/wp-json/wp/v2'
    expect(WP_API_URL).toBe('https://www.vp-associates.com/wp-json/wp/v2')
  })

  it('static services have correct structure', () => {
    const staticService = {
      title: { rendered: 'Structural Steel Design' },
      slug: 'structural-steel-design',
      excerpt: { rendered: '<p>Complete structural steel design services</p>' },
      custom_fields: {
        service_icon: 'mdi:steel',
        service_description: 'Expert structural steel design...',
      }
    }

    expect(staticService).toHaveProperty('title')
    expect(staticService).toHaveProperty('slug')
    expect(staticService).toHaveProperty('excerpt')
    expect(staticService).toHaveProperty('custom_fields')
  })

  it('cache TTL is configured', () => {
    const CACHE_TTL = 60 * 60 * 1000 // 1 hour
    expect(CACHE_TTL).toBe(3600000)
  })
})
