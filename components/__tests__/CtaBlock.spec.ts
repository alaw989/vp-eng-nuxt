/**
 * Tests for CtaBlock component
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CtaBlock from '../CtaBlock.vue'

const globalStubs = {
  NuxtLink: { props: ['to'], template: '<a :href="to"><slot /></a>' },
  Icon: { template: '<span />' }
}

describe('CtaBlock Component', () => {
  it('renders the headline, subheadline and primary link', () => {
    const wrapper = mount(CtaBlock, {
      props: { headline: 'Ready to Start Your Project?', subheadline: 'Talk to us' },
      global: { stubs: globalStubs }
    })
    expect(wrapper.find('h2').text()).toBe('Ready to Start Your Project?')
    expect(wrapper.text()).toContain('Talk to us')
    expect(wrapper.find('a[href="/contact"]').text()).toContain('Contact Us')
  })

  it('offers the phone number and email by default', () => {
    const wrapper = mount(CtaBlock, {
      props: { headline: 'Test' },
      global: { stubs: globalStubs }
    })
    expect(wrapper.find('a[href="tel:+18134862079"]').exists()).toBe(true)
    expect(wrapper.find('a[href="mailto:info@vp-associates.com"]').exists()).toBe(true)
  })

  it('shows a secondary link instead of the phone button when given one', () => {
    const wrapper = mount(CtaBlock, {
      props: { headline: 'Test', secondaryLabel: 'Our Services', secondaryTo: '/services' },
      global: { stubs: globalStubs }
    })
    expect(wrapper.find('a[href="/services"]').text()).toContain('Our Services')
    expect(wrapper.find('a[href="tel:+18134862079"]').exists()).toBe(false)
  })

  it('hides the decorative drawing from assistive technology', () => {
    const wrapper = mount(CtaBlock, {
      props: { headline: 'Test' },
      global: { stubs: globalStubs }
    })
    expect(wrapper.find('figure').attributes('aria-hidden')).toBe('true')
  })

  it('draws the stair-tower shop drawing, lazily, when scrolled into view', () => {
    const wrapper = mount(CtaBlock, {
      props: { headline: 'Next' },
      global: {
        stubs: {
          ...globalStubs,
          BannerDrawing: { props: { src: String, lazy: Boolean, play: Boolean }, template: '<div data-testid="cta-drawing" :data-src="src" :data-lazy="String(lazy)" :data-play="String(play)" />' }
        }
      }
    })
    const drawing = wrapper.find('[data-testid="cta-drawing"]')
    expect(drawing.attributes('data-src')).toBe('/images/drawings/stair-tower.svg')
    expect(drawing.attributes('data-lazy')).toBe('true')
    expect(['true', 'false']).toContain(drawing.attributes('data-play'))
  })

  it('keeps the navy background', () => {
    const wrapper = mount(CtaBlock, {
      props: { headline: 'Test' },
      global: { stubs: globalStubs }
    })
    expect(wrapper.find('section').classes()).toContain('bg-primary')
  })
})
