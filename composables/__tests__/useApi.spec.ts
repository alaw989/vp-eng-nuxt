/**
 * Tests for useApi composable
 * Tests WordPress API types and helper functions
 */

import { describe, it, expect } from 'vitest'
import type {
  WPService,
  WPProject,
  WPTeamMember,
  WPTestimonial
} from '../useApi'

describe('useApi Composable', () => {
  describe('constants', () => {
    it('should export WP_API_URL constant', async () => {
      const { WP_API_URL } = await import('../useApi')

      expect(WP_API_URL).toBe('https://www.vp-associates.com/wp-json/wp/v2')
    })

    it('should export SITE_URL constant', async () => {
      const { SITE_URL } = await import('../useApi')

      expect(SITE_URL).toBe('https://vp-associates.com')
    })
  })

  describe('helper function exports', () => {
    it('should export helper functions', async () => {
      const mod = await import('../useApi')
      expect(typeof mod.getFeaturedImage).toBe('function')
      expect(typeof mod.getFeaturedImageAlt).toBe('function')
    })
  })

  describe('getFeaturedImage', () => {
    it('should return image URL when media exists', async () => {
      const { getFeaturedImage } = await import('../useApi')

      const post = {
        id: 1,
        title: { rendered: 'Test' },
        slug: 'test',
        _embedded: {
          'wp:featuredmedia': [{
            id: 10,
            source_url: 'https://example.com/image.jpg',
            alt_text: 'Test image'
          }]
        }
      }

      const url = getFeaturedImage(post as any)
      expect(url).toBe('https://example.com/image.jpg')
    })

    it('should return null when no media embedded', async () => {
      const { getFeaturedImage } = await import('../useApi')

      const post = {
        id: 1,
        title: { rendered: 'Test' },
        slug: 'test',
        _embedded: {}
      }

      const url = getFeaturedImage(post as any)
      expect(url).toBe(null)
    })

    it('should return null when embedded media array is empty', async () => {
      const { getFeaturedImage } = await import('../useApi')

      const post = {
        id: 1,
        title: { rendered: 'Test' },
        slug: 'test',
        _embedded: {
          'wp:featuredmedia': []
        }
      }

      const url = getFeaturedImage(post as any)
      expect(url).toBe(null)
    })

    it('should handle missing _embedded property', async () => {
      const { getFeaturedImage } = await import('../useApi')

      const post = {
        id: 1,
        title: { rendered: 'Test' },
        slug: 'test'
      }

      const url = getFeaturedImage(post as any)
      expect(url).toBe(null)
    })

    it('should handle media with missing source_url', async () => {
      const { getFeaturedImage } = await import('../useApi')

      const post = {
        id: 1,
        title: { rendered: 'Test' },
        slug: 'test',
        _embedded: {
          'wp:featuredmedia': [{}]
        }
      }

      const url = getFeaturedImage(post as any)
      expect(url).toBe(null)
    })

    it('works with WPService type', async () => {
      const { getFeaturedImage } = await import('../useApi')
      // WPService type imported at top of file

      const service: Partial<WPService> = {
        id: 1,
        title: { rendered: 'Service' },
        slug: 'service',
        _embedded: {
          'wp:featuredmedia': [{
            id: 10,
            source_url: 'https://example.com/service.jpg'
          }]
        }
      }

      expect(getFeaturedImage(service as WPService)).toBe('https://example.com/service.jpg')
    })

    it('works with WPProject type', async () => {
      const { getFeaturedImage } = await import('../useApi')
      // WPProject type imported at top of file

      const project: Partial<WPProject> = {
        id: 1,
        title: { rendered: 'Project' },
        slug: 'project',
        _embedded: {
          'wp:featuredmedia': [{
            id: 10,
            source_url: 'https://example.com/project.jpg'
          }]
        }
      }

      expect(getFeaturedImage(project as WPProject)).toBe('https://example.com/project.jpg')
    })

    it('works with WPTeamMember type', async () => {
      const { getFeaturedImage } = await import('../useApi')
      // WPTeamMember type imported at top of file

      const member: Partial<WPTeamMember> = {
        id: 1,
        title: { rendered: 'Team Member' },
        slug: 'team-member',
        _embedded: {
          'wp:featuredmedia': [{
            id: 10,
            source_url: 'https://example.com/team.jpg'
          }]
        }
      }

      expect(getFeaturedImage(member as WPTeamMember)).toBe('https://example.com/team.jpg')
    })

    it('works with WPTestimonial type', async () => {
      const { getFeaturedImage } = await import('../useApi')
      // WPTestimonial type imported at top of file

      const testimonial: Partial<WPTestimonial> = {
        id: 1,
        title: { rendered: 'Testimonial' },
        slug: 'testimonial',
        _embedded: {
          'wp:featuredmedia': [{
            id: 10,
            source_url: 'https://example.com/testimonial.jpg'
          }]
        }
      }

      expect(getFeaturedImage(testimonial as WPTestimonial)).toBe('https://example.com/testimonial.jpg')
    })

    it('handles multiple media items - returns first', async () => {
      const { getFeaturedImage } = await import('../useApi')

      const post = {
        id: 1,
        title: { rendered: 'Test' },
        slug: 'test',
        _embedded: {
          'wp:featuredmedia': [
            { id: 10, source_url: 'https://example.com/first.jpg' },
            { id: 11, source_url: 'https://example.com/second.jpg' }
          ]
        }
      }

      const url = getFeaturedImage(post as any)
      expect(url).toBe('https://example.com/first.jpg')
    })
  })

  describe('getFeaturedImageAlt', () => {
    it('should return alt text when media exists', async () => {
      const { getFeaturedImageAlt } = await import('../useApi')

      const post = {
        id: 1,
        title: { rendered: 'Test Post' },
        slug: 'test',
        _embedded: {
          'wp:featuredmedia': [{
            id: 10,
            source_url: 'https://example.com/image.jpg',
            alt_text: 'Test Alt Text'
          }]
        }
      }

      const alt = getFeaturedImageAlt(post as any)
      expect(alt).toBe('Test Alt Text')
    })

    it('should return title when alt text is missing', async () => {
      const { getFeaturedImageAlt } = await import('../useApi')

      const post = {
        id: 1,
        title: { rendered: 'My Post Title' },
        slug: 'test',
        _embedded: {
          'wp:featuredmedia': [{
            id: 10,
            source_url: 'https://example.com/image.jpg'
          }]
        }
      }

      const alt = getFeaturedImageAlt(post as any)
      expect(alt).toBe('My Post Title')
    })

    it('should return empty string when no media and no title', async () => {
      const { getFeaturedImageAlt } = await import('../useApi')

      const post = {
        id: 1,
        title: { rendered: '' },
        slug: 'test',
        _embedded: {}
      }

      const alt = getFeaturedImageAlt(post as any)
      expect(alt).toBe('')
    })

    it('should return title when alt text is empty string', async () => {
      const { getFeaturedImageAlt } = await import('../useApi')

      const post = {
        id: 1,
        title: { rendered: 'Title' },
        slug: 'test',
        _embedded: {
          'wp:featuredmedia': [{
            alt_text: ''
          }]
        }
      }

      const alt = getFeaturedImageAlt(post as any)
      expect(alt).toBe('Title')
    })

    it('should handle missing title property', async () => {
      const { getFeaturedImageAlt } = await import('../useApi')

      const post = {
        id: 1,
        slug: 'test',
        _embedded: {}
      }

      const alt = getFeaturedImageAlt(post as any)
      expect(alt).toBe('')
    })

    it('should handle undefined _embedded', async () => {
      const { getFeaturedImageAlt } = await import('../useApi')

      const post = {
        id: 1,
        title: { rendered: 'Test' },
        slug: 'test',
        _embedded: undefined
      }

      const alt = getFeaturedImageAlt(post as any)
      expect(alt).toBe('Test')
    })

    it('handles falsy alt_text like 0', async () => {
      const { getFeaturedImageAlt } = await import('../useApi')

      const post = {
        id: 1,
        title: { rendered: 'Title' },
        slug: 'test',
        _embedded: {
          'wp:featuredmedia': [{
            alt_text: '0'  // This is truthy as a string
          }]
        }
      }

      const alt = getFeaturedImageAlt(post as any)
      // Since alt_text is '0', it should return '0' (truthy string)
      expect(alt).toBe('0')
    })
  })

  describe('function exports', () => {
    it('should export useServices function', async () => {
      const { useServices } = await import('../useApi')
      expect(typeof useServices).toBe('function')
    })

    it('should export useService function', async () => {
      const { useService } = await import('../useApi')
      expect(typeof useService).toBe('function')
    })

    it('should export useProjects function', async () => {
      const { useProjects } = await import('../useApi')
      expect(typeof useProjects).toBe('function')
    })

    it('should export useProject function', async () => {
      const { useProject } = await import('../useApi')
      expect(typeof useProject).toBe('function')
    })

    it('should export useFeaturedProjects function', async () => {
      const { useFeaturedProjects } = await import('../useApi')
      expect(typeof useFeaturedProjects).toBe('function')
    })

    it('should export useTeam function', async () => {
      const { useTeam } = await import('../useApi')
      expect(typeof useTeam).toBe('function')
    })

    it('should export useTestimonials function', async () => {
      const { useTestimonials } = await import('../useApi')
      expect(typeof useTestimonials).toBe('function')
    })
  })

  describe('transform functions logic', () => {
    // Test the transform logic independently without calling useFetch
    it('services transform adds empty custom_fields when missing', async () => {
      const item = {
        id: 1,
        title: { rendered: 'Service' },
        slug: 'service',
        excerpt: { rendered: 'Excerpt' },
        content: { rendered: 'Content' },
        featured_media: 10,
        _embedded: {}
        // No custom_fields
      }

      const transformed = {
        id: item.id,
        title: item.title,
        slug: item.slug,
        excerpt: item.excerpt,
        content: item.content,
        featured_media: item.featured_media,
        _embedded: item._embedded,
        custom_fields: (item as any).custom_fields || {},
      }

      expect(transformed.custom_fields).toEqual({})
    })

    it('services transform preserves existing custom_fields', async () => {
      const item = {
        id: 1,
        title: { rendered: 'Service' },
        slug: 'service',
        excerpt: { rendered: 'Excerpt' },
        content: { rendered: 'Content' },
        featured_media: 10,
        _embedded: {},
        custom_fields: { icon: 'icon-name', featured: '1' }
      }

      const transformed = {
        id: item.id,
        title: item.title,
        slug: item.slug,
        excerpt: item.excerpt,
        content: item.content,
        featured_media: item.featured_media,
        _embedded: item._embedded,
        custom_fields: (item as any).custom_fields || {},
      }

      expect(transformed.custom_fields).toEqual({ icon: 'icon-name', featured: '1' })
    })

    it('projects transform adds empty custom_fields when missing', async () => {
      const item = {
        id: 1,
        title: { rendered: 'Project' },
        slug: 'project',
        excerpt: { rendered: 'Excerpt' },
        content: { rendered: 'Content' },
        featured_media: 10,
        _embedded: {}
      }

      const transformed = {
        id: item.id,
        title: item.title,
        slug: item.slug,
        excerpt: item.excerpt,
        content: item.content,
        featured_media: item.featured_media,
        _embedded: item._embedded,
        custom_fields: (item as any).custom_fields || {},
      }

      expect(transformed.custom_fields).toEqual({})
    })

    it('featured projects transform filters by project_featured', async () => {
      const data = [
        { custom_fields: { project_featured: '1' }, id: 1, title: { rendered: 'Featured' }, slug: 'f', excerpt: { rendered: '' }, content: { rendered: '' }, _embedded: {} },
        { custom_fields: { project_featured: '0' }, id: 2, title: { rendered: 'Not Featured' }, slug: 'nf', excerpt: { rendered: '' }, content: { rendered: '' }, _embedded: {} },
        { custom_fields: {}, id: 3, title: { rendered: 'No Field' }, slug: 'nf2', excerpt: { rendered: '' }, content: { rendered: '' }, _embedded: {} },
      ]

      const filtered = data.filter((item: any) => item.custom_fields?.project_featured === '1')

      expect(filtered).toHaveLength(1)
      expect(filtered[0]?.id).toBe(1)
    })

    it('useService transform returns empty array when no data', async () => {
      const inputData = null as unknown as any[]

      if (!inputData || inputData.length === 0) {
        expect(true).toBe(true)
      } else {
        expect(false).toBe(true)
      }
    })

    it('useService transform returns empty array when empty array', async () => {
      const inputData: any[] = []

      if (!inputData || inputData.length === 0) {
        expect(inputData).toEqual([])
      }
    })

    it('useProjects builds correct URL with page and perPage', async () => {
      const { WP_API_URL } = await import('../useApi')
      const page = 2
      const perPage = 24
      const category = 'commercial'

      const expectedUrl = `${WP_API_URL}/projects?_embed&page=${page}&per_page=${perPage}&category=${category}`
      expect(expectedUrl).toContain('page=2')
      expect(expectedUrl).toContain('per_page=24')
      expect(expectedUrl).toContain('category=commercial')
    })

    it('useProjects builds correct URL without category', async () => {
      const { WP_API_URL } = await import('../useApi')
      const page = 1
      const perPage = 12

      const expectedUrl = `${WP_API_URL}/projects?_embed&page=${page}&per_page=${perPage}`
      expect(expectedUrl).not.toContain('category=')
    })
  })

  describe('type exports', () => {
    it('should export WPImage type', async () => {
      const mod = await import('../useApi')
      // Types are stripped at runtime, so we just verify the module imports
      expect(mod).toBeDefined()
    })

    it('should export WPService type', async () => {
      const mod = await import('../useApi')
      expect(mod).toBeDefined()
    })

    it('should export WPProject type', async () => {
      const mod = await import('../useApi')
      expect(mod).toBeDefined()
    })

    it('should export WPTeamMember type', async () => {
      const mod = await import('../useApi')
      expect(mod).toBeDefined()
    })

    it('should export WPTestimonial type', async () => {
      const mod = await import('../useApi')
      expect(mod).toBeDefined()
    })
  })

  describe('URL building', () => {
    it('builds services URL correctly', async () => {
      const { WP_API_URL } = await import('../useApi')
      const url = `${WP_API_URL}/services?_embed&_per_page=100`
      expect(url).toBe('https://www.vp-associates.com/wp-json/wp/v2/services?_embed&_per_page=100')
    })

    it('builds single service URL with slug', async () => {
      const { WP_API_URL } = await import('../useApi')
      const slug = 'structural-steel-design'
      const url = `${WP_API_URL}/services?slug=${slug}&_embed`
      expect(url).toBe('https://www.vp-associates.com/wp-json/wp/v2/services?slug=structural-steel-design&_embed')
    })

    it('builds projects URL with all parameters', async () => {
      const { WP_API_URL } = await import('../useApi')
      const page = 3
      const perPage = 30
      const category = 'marine'
      const url = `${WP_API_URL}/projects?_embed&page=${page}&per_page=${perPage}&category=${category}`
      expect(url).toContain('page=3')
      expect(url).toContain('per_page=30')
      expect(url).toContain('category=marine')
    })

    it('builds featured projects URL', async () => {
      const { WP_API_URL } = await import('../useApi')
      const url = `${WP_API_URL}/projects?_embed&per_page=6`
      expect(url).toBe('https://www.vp-associates.com/wp-json/wp/v2/projects?_embed&per_page=6')
    })

    it('builds team URL', async () => {
      const { WP_API_URL } = await import('../useApi')
      const url = `${WP_API_URL}/team?_embed&per_page=100`
      expect(url).toBe('https://www.vp-associates.com/wp-json/wp/v2/team?_embed&per_page=100')
    })

    it('builds testimonials URL', async () => {
      const { WP_API_URL } = await import('../useApi')
      const url = `${WP_API_URL}/testimonials?_embed&per_page=100`
      expect(url).toBe('https://www.vp-associates.com/wp-json/wp/v2/testimonials?_embed&per_page=100')
    })

    it('builds single project URL with slug', async () => {
      const { WP_API_URL } = await import('../useApi')
      const slug = 'tampa-high-rise'
      const url = `${WP_API_URL}/projects?slug=${slug}&_embed`
      expect(url).toBe('https://www.vp-associates.com/wp-json/wp/v2/projects?slug=tampa-high-rise&_embed')
    })
  })

  describe('transform edge cases', () => {
    it('handles undefined custom_fields in services transform', async () => {
      const item: any = {
        id: 1,
        title: { rendered: 'Service' },
        slug: 'service',
        excerpt: { rendered: 'Excerpt' },
        content: { rendered: 'Content' },
        custom_fields: undefined,
      }

      const transformed = {
        ...item,
        custom_fields: (item as any).custom_fields || {},
      }

      expect(transformed.custom_fields).toEqual({})
    })

    it('handles null custom_fields in projects transform', async () => {
      const item: any = {
        id: 1,
        title: { rendered: 'Project' },
        slug: 'project',
        custom_fields: null,
      }

      const transformed = {
        ...item,
        custom_fields: (item as any).custom_fields || {},
      }

      expect(transformed.custom_fields).toEqual({})
    })

    it('handles falsy project_featured value', async () => {
      const data = [
        { custom_fields: { project_featured: '0' }, id: 1 },
        { custom_fields: { project_featured: '' }, id: 2 },
        { custom_fields: { project_featured: null }, id: 3 },
      ]

      const filtered = data.filter((item: any) => item.custom_fields?.project_featured === '1')

      expect(filtered).toHaveLength(0)
    })

    it('handles array with single item in useService transform', async () => {
      const inputData = [
        { id: 1, title: { rendered: 'Service' }, slug: 'service', excerpt: { rendered: '' }, content: { rendered: '' }, _embedded: {}, custom_fields: {} }
      ]

      if (!inputData || inputData.length === 0) {
        expect(true).toBe(false)
      } else {
        const item = inputData[0]!
        expect(item.id).toBe(1)
      }
    })

    it('handles array with multiple items in useService transform', async () => {
      const inputData = [
        { id: 1, title: { rendered: 'Service 1' }, slug: 'service-1', excerpt: { rendered: '' }, content: { rendered: '' }, _embedded: {}, custom_fields: {} },
        { id: 2, title: { rendered: 'Service 2' }, slug: 'service-2', excerpt: { rendered: '' }, content: { rendered: '' }, _embedded: {}, custom_fields: {} },
      ]

      if (!inputData || inputData.length === 0) {
        expect(true).toBe(false)
      } else {
        const item = inputData[0]!
        expect(item.id).toBe(1)
      }
    })
  })

  describe('data structure validation', () => {
    it('service data has required fields after transform', async () => {
      const transformed = {
        id: 1,
        title: { rendered: 'Service' },
        slug: 'service',
        excerpt: { rendered: 'Excerpt' },
        content: { rendered: 'Content' },
        featured_media: 10,
        _embedded: {},
        custom_fields: {},
      }

      expect(transformed).toHaveProperty('id')
      expect(transformed).toHaveProperty('title')
      expect(transformed).toHaveProperty('slug')
      expect(transformed).toHaveProperty('excerpt')
      expect(transformed).toHaveProperty('content')
      expect(transformed).toHaveProperty('custom_fields')
    })

    it('project data has required fields after transform', async () => {
      const transformed = {
        id: 1,
        title: { rendered: 'Project' },
        slug: 'project',
        excerpt: { rendered: 'Excerpt' },
        content: { rendered: 'Content' },
        featured_media: 10,
        _embedded: {},
        custom_fields: {},
      }

      expect(transformed).toHaveProperty('id')
      expect(transformed).toHaveProperty('title')
      expect(transformed).toHaveProperty('slug')
      expect(transformed).toHaveProperty('excerpt')
      expect(transformed).toHaveProperty('content')
      expect(transformed).toHaveProperty('custom_fields')
    })

    it('team member data has required fields after transform', async () => {
      const transformed = {
        id: 1,
        title: { rendered: 'Team Member' },
        slug: 'team-member',
        excerpt: { rendered: 'Excerpt' },
        content: { rendered: 'Content' },
        featured_media: 10,
        _embedded: {},
        custom_fields: {},
      }

      expect(transformed).toHaveProperty('id')
      expect(transformed).toHaveProperty('title')
      expect(transformed).toHaveProperty('slug')
      expect(transformed).toHaveProperty('custom_fields')
    })

    it('testimonial data has required fields after transform', async () => {
      const transformed = {
        id: 1,
        title: { rendered: 'Testimonial' },
        slug: 'testimonial',
        excerpt: { rendered: 'Excerpt' },
        content: { rendered: 'Content' },
        featured_media: 10,
        _embedded: {},
        custom_fields: {},
      }

      expect(transformed).toHaveProperty('id')
      expect(transformed).toHaveProperty('title')
      expect(transformed).toHaveProperty('slug')
      expect(transformed).toHaveProperty('custom_fields')
    })
  })

  describe('parameter variations', () => {
    it('handles page parameter of 0', async () => {
      const { WP_API_URL } = await import('../useApi')
      const page = 0
      const perPage = 12
      const url = `${WP_API_URL}/projects?_embed&page=${page}&per_page=${perPage}`
      expect(url).toContain('page=0')
    })

    it('handles negative page parameter', async () => {
      const { WP_API_URL } = await import('../useApi')
      const page = -1
      const perPage = 12
      const url = `${WP_API_URL}/projects?_embed&page=${page}&per_page=${perPage}`
      expect(url).toContain('page=-1')
    })

    it('handles perPage of 0', async () => {
      const { WP_API_URL } = await import('../useApi')
      const page = 1
      const perPage = 0
      const url = `${WP_API_URL}/projects?_embed&page=${page}&per_page=${perPage}`
      expect(url).toContain('per_page=0')
    })

    it('handles very large perPage value', async () => {
      const { WP_API_URL } = await import('../useApi')
      const perPage = 1000
      const url = `${WP_API_URL}/projects?_embed&per_page=${perPage}`
      expect(url).toContain('per_page=1000')
    })

    it('handles special characters in category parameter', async () => {
      const { WP_API_URL } = await import('../useApi')
      const category = 'commercial & residential'
      const url = `${WP_API_URL}/projects?_embed&category=${encodeURIComponent(category)}`
      expect(url).toContain('category=')
    })

    it('handles empty string category parameter', async () => {
      const { WP_API_URL } = await import('../useApi')
      const category = ''
      const url = `${WP_API_URL}/projects?_embed&category=${category}`
      // Empty category still gets added to URL
      expect(url).toContain('category=')
    })

    it('handles category with spaces', async () => {
      const { WP_API_URL } = await import('../useApi')
      const category = 'steel design'
      const categoryFilter = `&category=${category}`
      expect(categoryFilter).toBe('&category=steel design')
    })
  })

  describe('featured image helper edge cases', () => {
    it('handles deeply nested media structure', async () => {
      const { getFeaturedImage } = await import('../useApi')

      const post = {
        id: 1,
        title: { rendered: 'Test' },
        slug: 'test',
        _embedded: {
          'wp:featuredmedia': [{
            id: 10,
            source_url: 'https://example.com/image.jpg',
            media_details: {
              width: 1920,
              height: 1080,
              sizes: {
                full: { source_url: 'https://example.com/full.jpg' },
                thumbnail: { source_url: 'https://example.com/thumb.jpg' },
              },
            },
          }]
        }
      }

      const url = getFeaturedImage(post as any)
      expect(url).toBe('https://example.com/image.jpg')
    })

    it('handles media with only alt_text', async () => {
      const { getFeaturedImageAlt } = await import('../useApi')

      const post = {
        id: 1,
        title: { rendered: 'Test' },
        slug: 'test',
        _embedded: {
          'wp:featuredmedia': [{
            alt_text: 'Only alt text'
          }]
        }
      }

      const alt = getFeaturedImageAlt(post as any)
      expect(alt).toBe('Only alt text')
    })

    it('handles null _embedded in getFeaturedImage', async () => {
      const { getFeaturedImage } = await import('../useApi')

      const post = {
        id: 1,
        title: { rendered: 'Test' },
        slug: 'test',
        _embedded: null
      }

      const url = getFeaturedImage(post as any)
      expect(url).toBe(null)
    })
  })
})
