// composables/useFormValidation.ts
import type { Ref } from 'vue'

export type ValidationSchema<T> = {
  [K in keyof T]?: (value: T[K]) => string | null
}

export function useFormValidation<T extends Record<string, any>>(
  schema: ValidationSchema<T>
) {
  const errors = ref<Partial<Record<keyof T, string>>>({} as Partial<Record<keyof T, string>>)
  const touched = ref<Partial<Record<keyof T, boolean>>>({} as Partial<Record<keyof T, boolean>>)

  // Validate a single field
  const validateField = (field: keyof T, value: any): boolean => {
    touched.value[field] = true

    const validator = schema[field]
    if (!validator) return true

    const error = validator(value)
    if (error) {
      errors.value[field] = error
      announceError(field, error)
      return false
    }

    delete errors.value[field]
    return true
  }

  // Validate all fields
  const validateForm = (data: T): boolean => {
    let isValid = true
    for (const field in schema) {
      if (!validateField(field, data[field])) {
        isValid = false
      }
    }
    return isValid
  }

  // Clear all errors
  const clearErrors = () => {
    errors.value = {}
    touched.value = {}
  }

  // ARIA live region announcement for screen readers
  const announceError = (field: keyof T, message: string) => {
    if (process.client) {
      const announcement = document.getElementById('sr-announcements')
      if (announcement) {
        announcement.textContent = `Validation error for ${String(field)}: ${message}`
      }
    }
  }

  return {
    errors,
    touched,
    validateField,
    validateForm,
    clearErrors
  }
}
