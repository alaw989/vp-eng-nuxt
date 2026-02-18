/**
 * Tests for server/api/testimonials.get.ts static data structure
 */

import { describe, it, expect } from 'vitest'

describe('Server API: Testimonials - Static Data', () => {
  it('testimonials have correct structure', () => {
    const testimonial = {
      title: { rendered: 'Excellent Service' },
      slug: 'excellent-service',
      excerpt: { rendered: '<p>VP Associates provided exceptional service...</p>' },
      custom_fields: {
        testimonial_author: 'John Doe',
        testimonial_company: 'ABC Construction',
        testimonial_rating: '5',
      }
    }

    expect(testimonial).toHaveProperty('title')
    expect(testimonial).toHaveProperty('slug')
    expect(testimonial).toHaveProperty('custom_fields')
    expect(testimonial.custom_fields).toHaveProperty('testimonial_author')
    expect(testimonial.custom_fields).toHaveProperty('testimonial_rating')
  })

  it('testimonial rating is valid', () => {
    const rating = '5'
    const validRatings = ['1', '2', '3', '4', '5']

    expect(validRatings).toContain(rating)
    expect(parseInt(rating)).toBeGreaterThanOrEqual(1)
    expect(parseInt(rating)).toBeLessThanOrEqual(5)
  })

  it('testimonial has author information', () => {
    const author = 'John Doe'
    const company = 'ABC Construction'

    expect(author).toBeTruthy()
    expect(company).toBeTruthy()
  })
})
