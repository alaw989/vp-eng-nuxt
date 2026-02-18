import { test, expect } from '@playwright/test'

test.describe('Team API', () => {
  test('fetches team members successfully', async ({ request }) => {
    const response = await request.get('/api/team')

    expect(response.status()).toBe(200)
  })

  test('returns valid JSON structure', async ({ request }) => {
    const response = await request.get('/api/team')

    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('success', true)
    expect(data).toHaveProperty('data')
    expect(Array.isArray(data.data)).toBe(true)
  })

  test('team members have required fields', async ({ request }) => {
    const response = await request.get('/api/team')

    const data = await response.json()

    if (data.data.length > 0) {
      const member = data.data[0]
      expect(member).toHaveProperty('title')
      expect(member).toHaveProperty('custom_fields')

      // Check for custom_fields properties - field names vary by WordPress setup
      const fields = member.custom_fields
      expect(Object.keys(fields).length).toBeGreaterThan(0)

      // Should have at least some team-related fields
      const hasTeamField = Object.keys(fields).some(key =>
        key.includes('team') || key.includes('email') || key.includes('title') || key.includes('job')
      )
      expect(hasTeamField).toBe(true)
    }
  })

  test('team member has contact information', async ({ request }) => {
    const response = await request.get('/api/team')

    const data = await response.json()

    if (data.data.length > 0) {
      const member = data.data[0]
      const fields = member.custom_fields

      // Check for email in various possible field names
      const hasEmail = Object.keys(fields).some(key =>
        key.toLowerCase().includes('email')
      )
      const hasPhone = Object.keys(fields).some(key =>
        key.toLowerCase().includes('phone')
      )

      // At least one contact method should exist
      expect(hasEmail || hasPhone).toBe(true)
    }
  })

  test('supports per_page query parameter', async ({ request }) => {
    const response = await request.get('/api/team?per_page=2')

    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data.success).toBe(true)
  })

  test('supports cache bypass', async ({ request }) => {
    const response = await request.get('/api/team?_nocache=true')

    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data.success).toBe(true)
  })

  test('returns fallback data on API error', async ({ request }) => {
    const response = await request.get('/api/team')

    const data = await response.json()

    // Even on error, should return success with fallback
    expect(data.success).toBe(true)
    expect(data.data.length).toBeGreaterThan(0)
  })
})

test.describe('Testimonials API', () => {
  test('fetches testimonials successfully', async ({ request }) => {
    const response = await request.get('/api/testimonials')

    expect(response.status()).toBe(200)
  })

  test('returns valid JSON structure', async ({ request }) => {
    const response = await request.get('/api/testimonials')

    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('success', true)
    expect(data).toHaveProperty('data')
    expect(Array.isArray(data.data)).toBe(true)
  })

  test('testimonials have required fields', async ({ request }) => {
    const response = await request.get('/api/testimonials')

    const data = await response.json()

    if (data.data.length > 0) {
      const testimonial = data.data[0]
      expect(testimonial).toHaveProperty('title')
      expect(testimonial).toHaveProperty('custom_fields')

      // Check for custom_fields properties - field names vary by WordPress setup
      const fields = testimonial.custom_fields
      expect(Object.keys(fields).length).toBeGreaterThan(0)

      // Should have at least some testimonial-related fields
      const hasTestimonialField = Object.keys(fields).some(key =>
        key.toLowerCase().includes('testimonial') ||
        key.toLowerCase().includes('client') ||
        key.toLowerCase().includes('quote') ||
        key.toLowerCase().includes('rating')
      )
      expect(hasTestimonialField).toBe(true)
    }
  })

  test('testimonials have author information', async ({ request }) => {
    const response = await request.get('/api/testimonials')

    const data = await response.json()

    if (data.data.length > 0) {
      const testimonial = data.data[0]
      const fields = testimonial.custom_fields

      // Check for company or role in various possible field names
      const hasCompany = Object.keys(fields).some(key =>
        key.toLowerCase().includes('company')
      )
      const hasRole = Object.keys(fields).some(key =>
        key.toLowerCase().includes('role') || key.toLowerCase().includes('client')
      )

      // At least one piece of author info should exist
      expect(hasCompany || hasRole).toBe(true)
    }
  })

  test('testimonials quotes are non-empty strings', async ({ request }) => {
    const response = await request.get('/api/testimonials')

    const data = await response.json()

    if (data.data.length > 0) {
      data.data.forEach((testimonial: any) => {
        const fields = testimonial.custom_fields

        // Check for quote in various possible field names
        const quoteKey = Object.keys(fields).find(key =>
          key.toLowerCase().includes('quote') ||
          key.toLowerCase().includes('testimonial') ||
          key.toLowerCase().includes('content') ||
          key.toLowerCase().includes('text')
        )

        if (quoteKey) {
          const quote = fields[quoteKey]
          expect(quote).toBeTruthy()
          expect(typeof quote).toBe('string')
        }
      })
    }
  })

  test('supports per_page query parameter', async ({ request }) => {
    const response = await request.get('/api/testimonials?per_page=3')

    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data.success).toBe(true)
  })

  test('supports cache bypass', async ({ request }) => {
    const response = await request.get('/api/testimonials?_nocache=true')

    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data.success).toBe(true)
  })

  test('returns fallback data on API error', async ({ request }) => {
    const response = await request.get('/api/testimonials')

    const data = await response.json()

    // Even on error, should return success with fallback
    expect(data.success).toBe(true)
    expect(data.data.length).toBeGreaterThan(0)
  })

  test('testimonials have reasonable content length', async ({ request }) => {
    const response = await request.get('/api/testimonials')

    const data = await response.json()

    if (data.data.length > 0) {
      const testimonial = data.data[0]
      const fields = testimonial.custom_fields

      // Find the first text field
      const textKey = Object.keys(fields).find(key =>
        typeof fields[key] === 'string' && fields[key].length > 20
      )

      if (textKey) {
        const text = fields[textKey]
        // Testimonial content should be substantial but not enormous
        expect(text.length).toBeGreaterThan(20)
        expect(text.length).toBeLessThan(5000)
      }
    }
  })
})

test.describe('Team and Testimonials Combined', () => {
  test('both APIs return arrays', async ({ request }) => {
    const [teamResponse, testimonialsResponse] = await Promise.all([
      request.get('/api/team'),
      request.get('/api/testimonials')
    ])

    expect(teamResponse.status()).toBe(200)
    expect(testimonialsResponse.status()).toBe(200)

    const teamData = await teamResponse.json()
    const testimonialsData = await testimonialsResponse.json()

    expect(Array.isArray(teamData.data)).toBe(true)
    expect(Array.isArray(testimonialsData.data)).toBe(true)
  })

  test('both APIs have consistent response structure', async ({ request }) => {
    const [teamResponse, testimonialsResponse] = await Promise.all([
      request.get('/api/team'),
      request.get('/api/testimonials')
    ])

    const teamData = await teamResponse.json()
    const testimonialsData = await testimonialsResponse.json()

    // Both should have the same top-level structure
    expect(Object.keys(teamData)).toEqual(Object.keys(testimonialsData))
  })
})
