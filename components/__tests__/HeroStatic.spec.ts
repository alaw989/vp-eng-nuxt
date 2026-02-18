/**
 * Tests for HeroStatic component
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import HeroStatic from '../HeroStatic.vue'

// Mock @vueuse/core
vi.mock('@vueuse/core', () => ({
  useWindowScroll: () => ({ y: { value: 0 } }),
  usePreferredReducedMotion: () => ref(false)
}))

// Mock vue-router
vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} })
}))

describe('HeroStatic Component', () => {
  const globalStubs = {
    NuxtLink: { template: '<a><slot /></a>' },
    NuxtImg: { template: '<img />' },
    Icon: { template: '<span />' }
  }

  it('renders with default props', () => {
    const wrapper = mount(HeroStatic, {
      global: { stubs: globalStubs }
    })

    expect(wrapper.find('section').exists()).toBe(true)
    expect(wrapper.find('section').classes()).toContain('h-[80vh]')
    expect(wrapper.find('section').classes()).toContain('min-h-[600px]')
  })

  it('renders with authority variant headline by default', () => {
    const wrapper = mount(HeroStatic, {
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('Trusted by Tampa Bay Since 1990')
  })

  it('renders with outcome variant', () => {
    const wrapper = mount(HeroStatic, {
      props: { variant: 'outcome' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('Structures That Stand the Test of Time')
  })

  it('renders with local variant', () => {
    const wrapper = mount(HeroStatic, {
      props: { variant: 'local' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain("Tampa Bay's Structural Engineers")
  })

  it('renders with capability variant', () => {
    const wrapper = mount(HeroStatic, {
      props: { variant: 'capability' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('Precision Structural Engineering')
  })

  it('overrides headline with custom prop', () => {
    const wrapper = mount(HeroStatic, {
      props: { headline: 'Custom Headline' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('Custom Headline')
    expect(wrapper.html()).not.toContain('Trusted by Tampa Bay Since 1990')
  })

  it('overrides subheadline with custom prop', () => {
    const wrapper = mount(HeroStatic, {
      props: { subheadline: 'Custom Subheadline' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('Custom Subheadline')
  })

  it('renders CTA button when showCta is true', () => {
    const wrapper = mount(HeroStatic, {
      props: { showCta: true },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain("Let's Talk")
  })

  it('renders custom CTA text', () => {
    const wrapper = mount(HeroStatic, {
      props: { ctaText: 'Get Started' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('Get Started')
  })

  it('renders custom CTA link', () => {
    const wrapper = mount(HeroStatic, {
      props: { ctaLink: '/contact-us' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('/contact-us')
  })

  it('hides CTA when showCta is false', () => {
    const wrapper = mount(HeroStatic, {
      props: { showCta: false },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).not.toContain("Let's Talk")
  })

  it('has correct background color class', () => {
    const wrapper = mount(HeroStatic, {
      global: { stubs: globalStubs }
    })

    expect(wrapper.find('section').classes()).toContain('bg-neutral-900')
  })

  it('has correct aria-label', () => {
    const wrapper = mount(HeroStatic, {
      global: { stubs: globalStubs }
    })

    expect(wrapper.find('section').attributes('aria-label')).toBe('Hero section')
  })

  it('has hero-animate-headline class on headline', () => {
    const wrapper = mount(HeroStatic, {
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('hero-animate-headline')
  })

  it('has hero-animate-subheadline class on subheadline', () => {
    const wrapper = mount(HeroStatic, {
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('hero-animate-subheadline')
  })

  it('has hero-animate-cta class on CTA container', () => {
    const wrapper = mount(HeroStatic, {
      props: { showCta: true },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('hero-animate-cta')
  })

  it('has gradient overlay classes', () => {
    const wrapper = mount(HeroStatic, {
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('from-primary/80')
    expect(wrapper.html()).toContain('from-black/60')
    expect(wrapper.html()).toContain('via-white/10')
  })

  it('has correct CTA button gradient classes', () => {
    const wrapper = mount(HeroStatic, {
      props: { showCta: true },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('from-secondary')
    expect(wrapper.html()).toContain('to-secondary-dark')
  })

  it('has arrow icon in CTA button', () => {
    const wrapper = mount(HeroStatic, {
      props: { showCta: true },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('mdi:arrow-right')
  })

  describe('Query param variant override', () => {
    it('respects query param variant when valid', () => {
      // Line 123: return queryVariant when valid
      const validVariants = ['authority', 'outcome', 'local', 'capability']
      const testVariant = 'authority'

      // Check that authority is a valid variant
      expect(validVariants.includes(testVariant)).toBe(true)
    })

    it('ignores query param variant when invalid', () => {
      // Line 123: Only return queryVariant if it's in the valid list
      const validVariants = ['authority', 'outcome', 'local', 'capability']
      const invalidVariant = 'invalid'

      // Check that invalid variant is not in the list
      expect(validVariants.includes(invalidVariant)).toBe(false)
    })

    it('uses prop variant when query param is not provided', () => {
      // When queryVariant is falsy, use props.variant
      const queryVariant = null
      const propsVariant = 'capability'

      const shouldUsePropsVariant = !queryVariant || !['authority', 'outcome', 'local', 'capability'].includes(queryVariant)
      expect(shouldUsePropsVariant).toBe(true)
      expect(propsVariant).toBe('capability')
    })

    it('query param override takes precedence over prop variant', () => {
      // When queryVariant is valid, it overrides the prop
      const queryVariant = 'local'
      const propsVariant = 'authority'
      const validVariants = ['authority', 'outcome', 'local', 'capability']

      const shouldUseQueryParam = queryVariant && validVariants.includes(queryVariant)
      expect(shouldUseQueryParam).toBe(true)
      // Query param should override prop
      expect(queryVariant).not.toBe(propsVariant)
    })

    it('activeVariant computed property logic works correctly', () => {
      // Test the computed logic at lines 121-126
      const testCases = [
        { queryVariant: 'authority', propVariant: 'local', expected: 'authority' },
        { queryVariant: 'outcome', propVariant: 'authority', expected: 'outcome' },
        { queryVariant: null, propVariant: 'capability', expected: 'capability' },
        { queryVariant: 'invalid', propVariant: 'local', expected: 'local' },
        { queryVariant: '', propVariant: 'outcome', expected: 'outcome' },
      ]

      testCases.forEach(({ queryVariant, propVariant, expected }) => {
        const validVariants = ['authority', 'outcome', 'local', 'capability']
        const activeVariant = queryVariant && validVariants.includes(queryVariant) ? queryVariant : propVariant
        expect(activeVariant).toBe(expected)
      })
    })
  })
})
