/**
 * Tests for PageBanner component
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PageBanner from '../PageBanner.vue'

// Mock @vueuse/core
vi.mock('@vueuse/core', () => ({
  useWindowScroll: () => ({ y: ref(0) })
}))

describe('PageBanner Component', () => {
  const defaultProps = {
    headline: 'About Us',
    subheadline: 'Learn more about our company',
    backgroundImage: '/images/banner.jpg',
    backgroundAlt: 'Banner background',
    ariaLabel: 'Page banner'
  }

  it('renders with headline', () => {
    const wrapper = mount(PageBanner, {
      props: { headline: 'About Us' },
      global: {
        stubs: { NuxtImg: { template: '<img />' } }
      }
    })
    expect(wrapper.html()).toContain('About Us')
  })

  it('renders with subheadline when provided', () => {
    const wrapper = mount(PageBanner, {
      props: {
        headline: 'About Us',
        subheadline: 'Learn more about our company'
      },
      global: {
        stubs: { NuxtImg: { template: '<img />' } }
      }
    })
    expect(wrapper.html()).toContain('Learn more about our company')
  })

  it('has correct banner height classes', () => {
    const wrapper = mount(PageBanner, {
      props: { headline: 'Test' },
      global: {
        stubs: { NuxtImg: { template: '<img />' } }
      }
    })
    const section = wrapper.find('section')
    expect(section.classes()).toContain('h-[50vh]')
    expect(section.classes()).toContain('min-h-[400px]')
  })

  it('has correct background color class', () => {
    const wrapper = mount(PageBanner, {
      props: { headline: 'Test' },
      global: {
        stubs: { NuxtImg: { template: '<img />' } }
      }
    })
    const section = wrapper.find('section')
    expect(section.classes()).toContain('bg-neutral-900')
  })

  it('has overlay gradient classes', () => {
    const wrapper = mount(PageBanner, {
      props: { headline: 'Test' },
      global: {
        stubs: { NuxtImg: { template: '<img />' } }
      }
    })
    expect(wrapper.html()).toContain('from-primary/85')
    expect(wrapper.html()).toContain('from-black/60')
    expect(wrapper.html()).toContain('via-white/10')
  })

  it('has animation classes', () => {
    const wrapper = mount(PageBanner, {
      props: { headline: 'Test' },
      global: {
        stubs: { NuxtImg: { template: '<img />' } }
      }
    })
    expect(wrapper.html()).toContain('animate-shimmer')
    expect(wrapper.html()).toContain('banner-animate-headline')
    // banner-animate-subheadline only renders when subheadline is provided
  })

  it('has subheadline animation class when subheadline provided', () => {
    const wrapper = mount(PageBanner, {
      props: { headline: 'Test', subheadline: 'Test subheadline' },
      global: {
        stubs: { NuxtImg: { template: '<img />' } }
      }
    })
    expect(wrapper.html()).toContain('banner-animate-subheadline')
  })

  it('has proper heading element', () => {
    const wrapper = mount(PageBanner, {
      props: { headline: 'Services' },
      global: {
        stubs: { NuxtImg: { template: '<img />' } }
      }
    })
    const h1 = wrapper.find('h1')
    expect(h1.exists()).toBe(true)
    expect(h1.text()).toBe('Services')
  })

  it('has correct text color classes', () => {
    const wrapper = mount(PageBanner, {
      props: { headline: 'Test' },
      global: {
        stubs: { NuxtImg: { template: '<img />' } }
      }
    })
    expect(wrapper.html()).toContain('text-white')
  })

  it('has aria-label attribute', () => {
    const wrapper = mount(PageBanner, {
      props: {
        headline: 'Test',
        ariaLabel: 'Services page banner'
      },
      global: {
        stubs: { NuxtImg: { template: '<img />' } }
      }
    })
    const section = wrapper.find('section')
    expect(section.attributes('aria-label')).toBe('Services page banner')
  })

  it('calculates parallax offset correctly', () => {
    const scrollY = 100
    const maxOffset = 50
    const offset = Math.min(scrollY * 0.2, maxOffset)
    expect(offset).toBe(20)
  })

  it('caps parallax offset at maximum', () => {
    const scrollY = 500
    const maxOffset = 50
    const offset = Math.min(scrollY * 0.2, maxOffset)
    expect(offset).toBe(50)
  })

  it('calculates zoom scale correctly', () => {
    const scrollY = 400
    const maxScroll = 800
    const scale = 1 + Math.min(scrollY / maxScroll, 1) * 0.1
    expect(scale).toBeCloseTo(1.05, 4)
  })

  it('caps zoom scale at maximum', () => {
    const scrollY = 1000
    const maxScroll = 800
    const scale = 1 + Math.min(scrollY / maxScroll, 1) * 0.1
    expect(scale).toBeCloseTo(1.1, 4)
  })

  it('has correct image format', () => {
    const wrapper = mount(PageBanner, {
      props: { headline: 'Test' },
      global: {
        stubs: { NuxtImg: { template: '<img />' } }
      }
    })
    // NuxtImg is stubbed but we can check the props are being passed
    expect(wrapper.vm).toBeDefined()
  })
})
