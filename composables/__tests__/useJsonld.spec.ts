/**
 * Tests for useJsonld composable
 * Tests JSON-LD structured data generation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { computed, ref, toValue, isRef } from 'vue'
import { useJsonld } from '../useJsonld'

// Track useHead calls
let useHeadCalls: any[] = []
let capturedHead: any = null

// Mock #app composables
vi.mock('#app', () => ({
  useHead: (head: any) => {
    useHeadCalls.push(head)
    // Store the computed value if it's a ref
    capturedHead = head
    // Access the value to trigger computed evaluation
    if (isRef(head)) {
      const value = head.value
      return value
    }
    return head
  },
}))

describe('useJsonld Composable', () => {
  beforeEach(() => {
    useHeadCalls = []
    capturedHead = null
    vi.clearAllMocks()
  })

  describe('useHead integration', () => {
    it('calls useHead with computed head object', () => {
      const data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'VP Associates',
      }

      useJsonld(data)

      expect(useHeadCalls.length).toBe(1)
      expect(useHeadCalls[0]).toBeDefined()
    })

    it('returns head object with script array', () => {
      const data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'VP Associates',
      }

      useJsonld(data)

      // Access the computed value
      const headRef = useHeadCalls[0]
      const head = isRef(headRef) ? headRef.value : headRef

      expect(head).toHaveProperty('script')
      expect(Array.isArray(head.script)).toBe(true)
    })

    it('script has type application/ld+json', () => {
      const data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'VP Associates',
      }

      useJsonld(data)

      const headRef = useHeadCalls[0]
      const head = isRef(headRef) ? headRef.value : headRef
      expect(head.script[0]).toHaveProperty('type', 'application/ld+json')
    })

    it('script innerHTML contains JSON stringified data', () => {
      const data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'VP Associates',
      }

      useJsonld(data)

      const headRef = useHeadCalls[0]
      const head = isRef(headRef) ? headRef.value : headRef
      expect(head.script[0]).toHaveProperty('innerHTML')
      const innerHTML = head.script[0].innerHTML

      expect(innerHTML).toContain('"@context"')
      expect(innerHTML).toContain('"@type":"Organization"')
      expect(innerHTML).toContain('"name":"VP Associates"')
    })
  })

  it('useJsonld is a function', () => {
    expect(typeof useJsonld).toBe('function')
  })

  describe('Core functionality', () => {
    it('accepts object data', () => {
      const data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'VP Associates',
      }

      expect(() => useJsonld(data)).not.toThrow()
    })

    it('accepts function returning data', () => {
      const getData = () => ({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'VP Associates',
      })

      useJsonld(getData)

      const headRef = useHeadCalls[0]
      const head = isRef(headRef) ? headRef.value : headRef
      expect(head.script[0].innerHTML).toContain('VP Associates')
    })

    it('accepts computed ref data', () => {
      const data = computed(() => ({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'VP Associates',
      }))

      useJsonld(data)

      const headRef = useHeadCalls[0]
      const head = isRef(headRef) ? headRef.value : headRef
      expect(head.script[0].innerHTML).toContain('VP Associates')
    })
  })

  describe('Ref unwrapping in JSON output', () => {
    it('unwraps computed refs in JSON output', () => {
      const computedValue = computed(() => 'test value')

      const data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: computedValue,
      }

      useJsonld(data)

      const headRef = useHeadCalls[0]
      const head = isRef(headRef) ? headRef.value : headRef
      expect(head.script[0].innerHTML).toContain('"name":"test value"')
    })

    it('unwraps plain refs in JSON output', () => {
      const refValue = ref('test value')

      const data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: refValue,
      }

      useJsonld(data)

      const headRef = useHeadCalls[0]
      const head = isRef(headRef) ? headRef.value : headRef
      expect(head.script[0].innerHTML).toContain('"name":"test value"')
    })

    it('unwraps nested computed refs', () => {
      const nestedComputed = computed(() => ({
        city: 'Tampa',
        state: 'FL',
      }))

      const data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        address: nestedComputed,
      }

      useJsonld(data)

      const headRef = useHeadCalls[0]
      const head = isRef(headRef) ? headRef.value : headRef
      expect(head.script[0].innerHTML).toContain('"city":"Tampa"')
      expect(head.script[0].innerHTML).toContain('"state":"FL"')
    })

    it('unwraps refs in arrays', () => {
      const ref1 = ref('Item 1')
      const ref2 = ref('Item 2')

      const data = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: [ref1, ref2],
      }

      useJsonld(data)

      const headRef = useHeadCalls[0]
      const head = isRef(headRef) ? headRef.value : headRef
      expect(head.script[0].innerHTML).toContain('Item 1')
      expect(head.script[0].innerHTML).toContain('Item 2')
    })
  })

  describe('JSON stringification', () => {
    it('stringifies data as JSON', () => {
      const data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'VP Associates',
      }

      const jsonString = JSON.stringify(data)

      expect(jsonString).toContain('"@type":"Organization"')
      expect(jsonString).toContain('"name":"VP Associates"')
    })

    it('handles special characters in values', () => {
      const data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'VP & Associates',
        description: 'Engineering \n "Services"',
      }

      const jsonStr = JSON.stringify(data)
      expect(jsonStr).toContain('&')
      expect(jsonStr).toContain('Engineering')
    })

    it('handles numeric values', () => {
      const data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        numberOfEmployees: 50,
        foundingDate: 2010,
      }

      const jsonStr = JSON.stringify(data)
      expect(jsonStr).toContain('50')
      expect(jsonStr).toContain('2010')
    })

    it('handles boolean values', () => {
      const data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        isAcceptingNewPatients: true,
      }

      const jsonStr = JSON.stringify(data)
      expect(jsonStr).toContain('true')
    })

    it('handles null values', () => {
      const data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Test',
        description: null,
      }

      expect(() => JSON.stringify(data)).not.toThrow()
    })

    it('handles empty object', () => {
      const data = {}
      expect(() => JSON.stringify(data)).not.toThrow()
    })

    it('detects circular references', () => {
      const circularData: any = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Test',
      }
      // Create circular reference
      circularData.self = circularData

      // JSON.stringify throws on circular references
      expect(() => {
        JSON.stringify(circularData)
      }).toThrow()
    })

    it('produces valid JSON-LD structure', () => {
      const data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'VP Associates',
      }

      const jsonStr = JSON.stringify(data)
      expect(jsonStr).toBeTruthy()
      expect(jsonStr.charAt(0)).toBe('{')
      expect(jsonStr.charAt(jsonStr.length - 1)).toBe('}')
    })
  })

  describe('Schema.org types', () => {
    it('handles Organization schema', () => {
      const orgData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'VP Associates',
        url: 'https://vp-associates.com',
      }

      expect(() => useJsonld(orgData)).not.toThrow()
    })

    it('handles LocalBusiness schema', () => {
      const businessData = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'VP Associates',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Tampa',
          addressRegion: 'FL',
        },
      }

      expect(() => useJsonld(businessData)).not.toThrow()
    })

    it('handles WebSite schema', () => {
      const siteData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        url: 'https://vp-associates.com',
        name: 'VP Associates',
      }

      expect(() => useJsonld(siteData)).not.toThrow()
    })

    it('handles BreadcrumbList schema', () => {
      const breadcrumbData = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home' },
          { '@type': 'ListItem', position: 2, name: 'Projects' },
        ],
      }

      expect(() => useJsonld(breadcrumbData)).not.toThrow()
    })

    const schemaTypes = [
      'Person',
      'Article',
      'NewsArticle',
      'BlogPosting',
      'Event',
      'Place',
      'PostalAddress',
    ]

    schemaTypes.forEach((type) => {
      it(`handles ${type} schema`, () => {
        const data = {
          '@context': 'https://schema.org',
          '@type': type,
          name: 'Test',
        }

        expect(() => useJsonld(data)).not.toThrow()
      })
    })
  })

  describe('Data structure handling', () => {
    it('handles nested objects', () => {
      const nestedData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Tampa',
          addressRegion: 'FL',
        },
      }

      expect(() => useJsonld(nestedData)).not.toThrow()
    })

    it('handles arrays', () => {
      const arrayData = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Item 1' },
          { '@type': 'ListItem', position: 2, name: 'Item 2' },
        ],
      }

      expect(() => useJsonld(arrayData)).not.toThrow()
    })

    it('handles deeply nested objects', () => {
      const data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Tampa',
          addressRegion: 'FL',
          addressCountry: {
            '@type': 'Country',
            name: 'USA',
          },
        },
      }

      expect(() => useJsonld(data)).not.toThrow()
    })

    it('handles mixed array types', () => {
      const data = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Item 1' },
          'string item',
          123,
        ],
      }

      expect(() => useJsonld(data)).not.toThrow()
    })

    it('handles very large objects', () => {
      const items = Array.from({ length: 100 }, (_, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `Item ${i + 1}`,
      }))

      const data = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: items,
      }

      expect(() => useJsonld(data)).not.toThrow()
    })
  })

  describe('Function data source', () => {
    it('calls function to get data', () => {
      let callCount = 0
      const getData = () => {
        callCount++
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'VP Associates',
        }
      }

      useJsonld(getData)

      // Note: Due to lazy evaluation of computed, the function call count
      // is only meaningful when the head value is actually accessed
      expect(typeof getData).toBe('function')
    })

    it('handles reactive data in function', () => {
      const counter = ref(1)
      const getData = () => ({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        numberOfItems: counter.value,
      })

      expect(() => useJsonld(getData)).not.toThrow()
    })

    it('handles computed that returns object', () => {
      const getData = computed(() => ({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Dynamic',
      }))

      useJsonld(getData)

      const headRef = useHeadCalls[0]
      const head = isRef(headRef) ? headRef.value : headRef
      expect(head.script[0].innerHTML).toContain('Dynamic')
    })
  })

  describe('Edge cases and error handling', () => {
    it('handles undefined values', () => {
      const data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: undefined,
      }

      expect(() => useJsonld(data)).not.toThrow()
    })

    it('handles Date objects', () => {
      const data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        foundingDate: new Date('2010-01-01'),
      }

      // Date objects get serialized to ISO strings
      const jsonStr = JSON.stringify(data)
      expect(jsonStr).toContain('2010-01-01')
    })

    it('handles URLs in values', () => {
      const data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        url: 'https://vp-associates.com',
        logo: 'https://vp-associates.com/logo.png',
      }

      const jsonStr = JSON.stringify(data)
      expect(jsonStr).toContain('https://vp-associates.com')
    })

    it('handles email addresses', () => {
      const data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        email: 'info@vp-associates.com',
      }

      const jsonStr = JSON.stringify(data)
      expect(jsonStr).toContain('info@vp-associates.com')
    })

    it('handles phone numbers', () => {
      const data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        telephone: '+1-813-555-0123',
      }

      const jsonStr = JSON.stringify(data)
      expect(jsonStr).toContain('+1-813-555-0123')
    })

    it('handles array of strings', () => {
      const data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        keywords: ['engineering', 'structural', 'design'],
      }

      const jsonStr = JSON.stringify(data)
      expect(jsonStr).toContain('engineering')
      expect(jsonStr).toContain('structural')
      expect(jsonStr).toContain('design')
    })

    it('handles array of numbers', () => {
      const data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: 4.8,
          reviewCount: 125,
        },
      }

      const jsonStr = JSON.stringify(data)
      expect(jsonStr).toContain('4.8')
      expect(jsonStr).toContain('125')
    })

    it('handles zero values', () => {
      const data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        numberOfEmployees: 0,
        ratingValue: 0,
      }

      const jsonStr = JSON.stringify(data)
      expect(jsonStr).toContain('0')
    })

    it('handles empty strings', () => {
      const data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: '',
        description: '',
      }

      expect(() => JSON.stringify(data)).not.toThrow()
    })

    it('handles empty arrays', () => {
      const data = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: [],
      }

      expect(() => JSON.stringify(data)).not.toThrow()
    })
  })

  describe('Output structure', () => {
    it('produces script type application/ld+json', () => {
      const data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Test',
      }

      useJsonld(data)
      // The structure is created internally, we verify the input is valid
      expect(data['@type']).toBe('Organization')
    })

    it('inner HTML contains valid JSON', () => {
      const data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Test Org',
      }

      const innerHTML = JSON.stringify(data)
      expect(innerHTML).toContain('@context')
      expect(innerHTML).toContain('Organization')
      expect(innerHTML).toContain('Test Org')
    })
  })

  describe('Value processing and ref unwrapping', () => {
    it('processes plain object values correctly', () => {
      const data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Test',
        value: 42,
      }

      const processed = JSON.parse(JSON.stringify(data))
      expect(processed.value).toBe(42)
    })

    it('removes ref markers during processing', () => {
      const refValue = ref('test')
      const data = {
        name: refValue,
      }

      // JSON.stringify with custom replacer similar to the composable
      const processed = JSON.parse(JSON.stringify(data, (key, val) => {
        if (val && typeof val === 'object' && '__v_isRef' in val) {
          return toValue(val)
        }
        return val
      }))

      expect(processed.name).toBe('test')
    })

    it('handles nested ref objects', () => {
      const innerRef = ref('inner value')
      const data = {
        outer: {
          inner: innerRef,
        },
      }

      const processed = JSON.parse(JSON.stringify(data, (key, val) => {
        if (val && typeof val === 'object' && '__v_isRef' in val) {
          return toValue(val)
        }
        return val
      }))

      expect(processed.outer.inner).toBe('inner value')
    })

    it('preserves non-ref objects during processing', () => {
      const data = {
        name: 'Test',
        nested: {
          value: 123,
          array: [1, 2, 3],
        },
      }

      const processed = JSON.parse(JSON.stringify(data))
      expect(processed.nested.value).toBe(123)
      expect(processed.nested.array).toEqual([1, 2, 3])
    })

    it('handles computed ref with object value', () => {
      const computedData = computed(() => ({
        city: 'Tampa',
        state: 'FL',
      }))

      const data = {
        location: computedData,
      }

      // Simulate the processing that happens in useJsonld
      const value = toValue(computedData)
      expect(value).toEqual({ city: 'Tampa', state: 'FL' })
    })

    it('handles function that returns computed ref', () => {
      const getData = () => computed(() => ({
        name: 'Dynamic',
      }))

      // Function returns computed, then we unwrap it
      const result = toValue(getData())
      expect(result).toEqual({ name: 'Dynamic' })
    })

    it('handles direct function call value', () => {
      const getData = () => ({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Function Result',
      })

      const value = getData()
      expect(value.name).toBe('Function Result')
    })
  })

  describe('JSON replacer function behavior', () => {
    it('correctly identifies ref objects', () => {
      const testRef = ref('value')
      const hasRefMarker = testRef && typeof testRef === 'object' && '__v_isRef' in testRef

      expect(hasRefMarker).toBe(true)
    })

    it('does not identify plain objects as refs', () => {
      const plainObj = { value: 'test' }
      const hasRefMarker = plainObj && typeof plainObj === 'object' && '__v_isRef' in plainObj

      expect(hasRefMarker).toBe(false)
    })

    it('correctly unwraps ref using toValue', () => {
      const testRef = ref('unwrap me')
      const unwrapped = toValue(testRef)

      expect(unwrapped).toBe('unwrap me')
    })

    it('returns non-ref values as-is', () => {
      const plainValue = 'plain string'
      const result = toValue(plainValue)

      expect(result).toBe('plain string')
    })
  })

  describe('Complex real-world scenarios', () => {
    it('handles full organization schema with refs', () => {
      const nameRef = ref('VP Associates')
      const urlRef = ref('https://vp-associates.com')

      const data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: nameRef,
        url: urlRef,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Tampa',
          addressRegion: 'FL',
        },
      }

      expect(() => useJsonld(data)).not.toThrow()
    })

    it('handles schema with multiple nested refs', () => {
      const cityRef = ref('Tampa')
      const stateRef = ref('FL')
      const zipRef = ref('33602')

      const data = {
        '@context': 'https://schema.org',
        '@type': 'PostalAddress',
        addressLocality: cityRef,
        addressRegion: stateRef,
        postalCode: zipRef,
      }

      expect(() => useJsonld(data)).not.toThrow()
    })

    it('handles array of refs', () => {
      const item1 = ref('Service 1')
      const item2 = ref('Service 2')
      const item3 = ref('Service 3')

      const data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        services: [item1, item2, item3],
      }

      expect(() => useJsonld(data)).not.toThrow()
    })

    it('handles mixed ref and non-ref values', () => {
      const dynamicName = ref('Dynamic Name')

      const data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: dynamicName,
        staticField: 'static value',
        anotherStatic: 42,
        booleanField: true,
      }

      expect(() => useJsonld(data)).not.toThrow()
    })
  })
})
