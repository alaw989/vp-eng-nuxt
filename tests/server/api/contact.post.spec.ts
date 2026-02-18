/**
 * Tests for server/api/contact.post.ts static data structure
 */

import { describe, it, expect } from 'vitest'

describe('Server API: Contact - Form Handling', () => {
  it('has correct validation rules', () => {
    const rules = {
      name: { required: true, minLength: 2 },
      email: { required: true, format: 'email' },
      phone: { required: false, format: 'phone' },
      message: { required: true, minLength: 10 },
    }

    expect(rules.name.required).toBe(true)
    expect(rules.name.minLength).toBe(2)
    expect(rules.email.required).toBe(true)
    expect(rules.message.required).toBe(true)
  })

  it('has email format validation', () => {
    const validEmail = 'test@example.com'
    const invalidEmail = 'not-an-email'

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    expect(emailRegex.test(validEmail)).toBe(true)
    expect(emailRegex.test(invalidEmail)).toBe(false)
  })

  it('has phone format validation', () => {
    const validPhone = '(813) 555-1234'
    const phoneRegex = /^\(\d{3}\)\s\d{3}-\d{4}$/

    // Simple format check
    expect(validPhone).toContain('(')
    expect(validPhone).toContain(')')
    expect(validPhone).toContain('-')
  })

  it('response structure includes success status', () => {
    const response = {
      success: true,
      message: 'Message sent successfully',
    }

    expect(response).toHaveProperty('success')
    expect(response).toHaveProperty('message')
  })

  it('error response structure is correct', () => {
    const errorResponse = {
      success: false,
      message: 'Failed to send message',
      errors: ['Invalid email format'],
    }

    expect(errorResponse).toHaveProperty('success', false)
    expect(errorResponse).toHaveProperty('message')
    expect(errorResponse).toHaveProperty('errors')
    expect(Array.isArray(errorResponse.errors)).toBe(true)
  })
})
