/**
 * Tests for useFormValidation composable
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useFormValidation } from '../useFormValidation'

// Mock process.client
const originalProcess = process
vi.stubGlobal('process', { ...originalProcess, client: true })

// Mock document.getElementById for ARIA announcements
document.body.innerHTML = '<div id="sr-announcements"></div>'

describe('useFormValidation Composable', () => {
  interface TestForm {
    name: string
    email: string
    phone: string
  }

  const validationSchema = {
    name: (value: string) => (value.length < 2 ? 'Name must be at least 2 characters' : null),
    email: (value: string) => (!value.includes('@') ? 'Invalid email' : null),
    phone: (value: string) => (value.length < 10 ? 'Phone must be 10 digits' : null),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset ARIA announcements
    const announcement = document.getElementById('sr-announcements')
    if (announcement) {
      announcement.textContent = ''
    }
  })

  describe('initial state', () => {
    it('returns empty errors object', () => {
      const { errors } = useFormValidation<TestForm>(validationSchema)
      expect(Object.keys(errors.value)).toHaveLength(0)
    })

    it('returns empty touched object', () => {
      const { touched } = useFormValidation<TestForm>(validationSchema)
      expect(Object.keys(touched.value)).toHaveLength(0)
    })

    it('returns validateField function', () => {
      const { validateField } = useFormValidation<TestForm>(validationSchema)
      expect(typeof validateField).toBe('function')
    })

    it('returns validateForm function', () => {
      const { validateForm } = useFormValidation<TestForm>(validationSchema)
      expect(typeof validateForm).toBe('function')
    })

    it('returns clearErrors function', () => {
      const { clearErrors } = useFormValidation<TestForm>(validationSchema)
      expect(typeof clearErrors).toBe('function')
    })
  })

  describe('validateField', () => {
    it('marks field as touched', () => {
      const { validateField, touched } = useFormValidation<TestForm>(validationSchema)

      validateField('name', 'John')

      expect(touched.value.name).toBe(true)
    })

    it('returns true for valid field', () => {
      const { validateField } = useFormValidation<TestForm>(validationSchema)

      const result = validateField('name', 'John')

      expect(result).toBe(true)
    })

    it('returns false for invalid field', () => {
      const { validateField } = useFormValidation<TestForm>(validationSchema)

      const result = validateField('name', 'J')

      expect(result).toBe(false)
    })

    it('adds error for invalid field', () => {
      const { validateField, errors } = useFormValidation<TestForm>(validationSchema)

      validateField('name', 'J')

      expect(errors.value.name).toBe('Name must be at least 2 characters')
    })

    it('removes error for valid field', () => {
      const { validateField, errors } = useFormValidation<TestForm>(validationSchema)

      // First, create an error
      validateField('name', 'J')
      expect(errors.value.name).toBeDefined()

      // Then, fix it
      validateField('name', 'John')
      expect(errors.value.name).toBeUndefined()
    })

    it('validates email field', () => {
      const { validateField, errors } = useFormValidation<TestForm>(validationSchema)

      validateField('email', 'invalid')

      expect(errors.value.email).toBe('Invalid email')
    })

    it('validates phone field', () => {
      const { validateField, errors } = useFormValidation<TestForm>(validationSchema)

      validateField('phone', '123')

      expect(errors.value.phone).toBe('Phone must be 10 digits')
    })

    it('returns true for field without validator', () => {
      const schema: any = {}
      const { validateField } = useFormValidation<any>(schema)

      const result = validateField('unknown', 'value')

      expect(result).toBe(true)
    })

    it('announces error to screen readers', () => {
      const { validateField } = useFormValidation<TestForm>(validationSchema)

      validateField('name', 'J')

      const announcement = document.getElementById('sr-announcements')
      expect(announcement?.textContent).toContain('Validation error')
      expect(announcement?.textContent).toContain('name')
    })
  })

  describe('validateForm', () => {
    it('returns true when all fields are valid', () => {
      const { validateForm } = useFormValidation<TestForm>(validationSchema)

      const data: TestForm = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '8135551234',
      }

      const result = validateForm(data)

      expect(result).toBe(true)
    })

    it('returns false when any field is invalid', () => {
      const { validateForm } = useFormValidation<TestForm>(validationSchema)

      const data: TestForm = {
        name: 'J', // Invalid
        email: 'john@example.com',
        phone: '8135551234',
      }

      const result = validateForm(data)

      expect(result).toBe(false)
    })

    it('marks all fields as touched', () => {
      const { validateForm, touched } = useFormValidation<TestForm>(validationSchema)

      const data: TestForm = {
        name: 'John',
        email: 'john@example.com',
        phone: '8135551234',
      }

      validateForm(data)

      expect(touched.value.name).toBe(true)
      expect(touched.value.email).toBe(true)
      expect(touched.value.phone).toBe(true)
    })

    it('populates errors for all invalid fields', () => {
      const { validateForm, errors } = useFormValidation<TestForm>(validationSchema)

      const data: TestForm = {
        name: 'J',
        email: 'invalid',
        phone: '123',
      }

      validateForm(data)

      expect(errors.value.name).toBe('Name must be at least 2 characters')
      expect(errors.value.email).toBe('Invalid email')
      expect(errors.value.phone).toBe('Phone must be 10 digits')
    })
  })

  describe('clearErrors', () => {
    it('clears all errors', () => {
      const { validateForm, errors, clearErrors } = useFormValidation<TestForm>(validationSchema)

      const data: TestForm = {
        name: 'J',
        email: 'invalid',
        phone: '123',
      }

      validateForm(data)
      expect(Object.keys(errors.value).length).toBeGreaterThan(0)

      clearErrors()

      expect(Object.keys(errors.value)).toHaveLength(0)
    })

    it('clears all touched state', () => {
      const { validateForm, touched, clearErrors } = useFormValidation<TestForm>(validationSchema)

      const data: TestForm = {
        name: 'John',
        email: 'john@example.com',
        phone: '8135551234',
      }

      validateForm(data)
      expect(Object.keys(touched.value).length).toBeGreaterThan(0)

      clearErrors()

      expect(Object.keys(touched.value)).toHaveLength(0)
    })
  })

  describe('generic type support', () => {
    it('works with string keys', () => {
      const { errors } = useFormValidation<Record<string, string>>({
        name: (v) => (v ? null : 'Required'),
      })

      expect(errors.value).toBeDefined()
    })

    it('works with interface types', () => {
      interface UserForm {
        username: string
        age: number
      }

      const { validateField } = useFormValidation<UserForm>({
        username: (v) => (v.length >= 3 ? null : 'Too short'),
        age: (v) => (v >= 18 ? null : 'Too young'),
      })

      expect(validateField('username', 'ab')).toBe(false)
      expect(validateField('age', 15)).toBe(false)
    })
  })
})
