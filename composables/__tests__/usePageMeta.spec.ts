/**
 * Tests for usePageMeta composable
 * Tests page meta tags generation
 */

import { describe, it, expect, vi } from 'vitest'
import { usePageMeta } from '../usePageMeta'

// Mock #app composables
vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: {
      siteUrl: 'https://vp-associates.com',
    },
  }),
  useRoute: () => ({ path: '/test-page' }),
  useHead: vi.fn(),
}))

describe('usePageMeta Composable', () => {
  it('usePageMeta is a function', () => {
    expect(typeof usePageMeta).toBe('function')
  })

  it('accepts required options', () => {
    const options = {
      title: 'Test Page',
      description: 'Test description',
    }

    expect(() => usePageMeta(options)).not.toThrow()
  })

  it('accepts all options', () => {
    const options = {
      title: 'Test Page',
      description: 'Test description',
      ogImage: '/test.jpg',
      ogType: 'article' as const,
      noindex: false,
      keywords: 'test, keywords',
      titleSuffix: true,
      robots: 'index, follow',
      canonicalUrl: 'https://example.com',
    }

    expect(() => usePageMeta(options)).not.toThrow()
  })

  it('returns fullTitle with suffix', () => {
    const options = {
      title: 'Test Page',
      description: 'Test description',
      titleSuffix: true,
    }

    const result = usePageMeta(options)

    expect(result.fullTitle).toBe('Test Page | VP Associates')
  })

  it('returns fullTitle without suffix', () => {
    const options = {
      title: 'Test Page',
      description: 'Test description',
      titleSuffix: false,
    }

    const result = usePageMeta(options)

    expect(result.fullTitle).toBe('Test Page')
  })

  it('returns siteUrl', () => {
    const options = {
      title: 'Test Page',
      description: 'Test description',
    }

    const result = usePageMeta(options)

    expect(result.siteUrl).toBe('https://vp-associates.com')
  })

  it('returns canonicalUrl from route', () => {
    const options = {
      title: 'Test Page',
      description: 'Test description',
    }

    const result = usePageMeta(options)

    expect(result.canonicalUrl).toContain('/test-page')
  })

  it('returns custom canonicalUrl when provided', () => {
    const options = {
      title: 'Test Page',
      description: 'Test description',
      canonicalUrl: 'https://custom.com/page',
    }

    const result = usePageMeta(options)

    expect(result.canonicalUrl).toBe('https://custom.com/page')
  })

  it('handles website ogType', () => {
    const options = {
      title: 'Test Page',
      description: 'Test description',
      ogType: 'website' as const,
    }

    expect(() => usePageMeta(options)).not.toThrow()
  })

  it('handles article ogType', () => {
    const options = {
      title: 'Test Page',
      description: 'Test description',
      ogType: 'article' as const,
    }

    expect(() => usePageMeta(options)).not.toThrow()
  })

  it('generates default ogImage', () => {
    const options = {
      title: 'Test Page',
      description: 'Test description',
    }

    expect(() => usePageMeta(options)).not.toThrow()
  })

  it('handles custom ogImage', () => {
    const options = {
      title: 'Test Page',
      description: 'Test description',
      ogImage: 'https://example.com/custom.jpg',
    }

    expect(() => usePageMeta(options)).not.toThrow()
  })

  it('handles noindex flag', () => {
    const options = {
      title: 'Test Page',
      description: 'Test description',
      noindex: true,
    }

    expect(() => usePageMeta(options)).not.toThrow()
  })

  it('handles custom robots meta', () => {
    const options = {
      title: 'Test Page',
      description: 'Test description',
      robots: 'noindex, follow',
    }

    expect(() => usePageMeta(options)).not.toThrow()
  })

  it('handles custom keywords', () => {
    const options = {
      title: 'Test Page',
      description: 'Test description',
      keywords: 'structural, engineering, tampa',
    }

    expect(() => usePageMeta(options)).not.toThrow()
  })
})
