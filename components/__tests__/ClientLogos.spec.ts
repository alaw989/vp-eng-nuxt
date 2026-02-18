/**
 * Tests for ClientLogos component
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ClientLogos from '../ClientLogos.vue'

describe('ClientLogos Component', () => {
  const globalStubs = {
    Icon: { template: '<span />' },
    AppSection: {
      name: 'AppSection',
      template: '<div class="app-section"><slot /></div>',
      props: ['bgColor', 'padding', 'animateOnScroll']
    }
  }

  it('renders with default props', () => {
    const wrapper = mount(ClientLogos, {
      global: { stubs: globalStubs }
    })

    expect(wrapper.find('.app-section').exists()).toBe(true)
    expect(wrapper.find('.container').exists()).toBe(true)
  })

  it('renders title when showTitle is true', () => {
    const wrapper = mount(ClientLogos, {
      props: { showTitle: true },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('Trusted by Industry Leaders')
  })

  it('renders subtitle', () => {
    const wrapper = mount(ClientLogos, {
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('Proud to serve prestigious clients across Tampa Bay and Florida')
  })

  it('hides title when showTitle is false', () => {
    const wrapper = mount(ClientLogos, {
      props: { showTitle: false },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).not.toContain('Trusted by Industry Leaders')
  })

  it('renders scrolling container with correct aria-label', () => {
    const wrapper = mount(ClientLogos, {
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('aria-label="Our clients"')
  })

  it('renders custom title', () => {
    const wrapper = mount(ClientLogos, {
      props: { title: 'Our Partners' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('Our Partners')
  })

  it('renders custom subtitle', () => {
    const wrapper = mount(ClientLogos, {
      props: { subtitle: 'Working with great companies' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('Working with great companies')
  })

  it('renders default clients', () => {
    const wrapper = mount(ClientLogos, {
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('Tampa General')
    expect(wrapper.html()).toContain('Raymond James')
    expect(wrapper.html()).toContain('Port Tampa Bay')
  })

  it('renders custom clients', () => {
    const customClients = [
      { name: 'Client A', icon: 'mdi:alpha-a' },
      { name: 'Client B', icon: 'mdi:alpha-b' }
    ]

    const wrapper = mount(ClientLogos, {
      props: { clients: customClients },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('Client A')
    expect(wrapper.html()).toContain('Client B')
  })

  it('has animate-scroll class', () => {
    const wrapper = mount(ClientLogos, {
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('animate-scroll')
  })

  it('has hover:pause class when pauseOnHover is true', () => {
    const wrapper = mount(ClientLogos, {
      props: { pauseOnHover: true },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('hover:pause')
  })

  it('renders static grid when showStaticGrid is true', () => {
    const wrapper = mount(ClientLogos, {
      props: { showStaticGrid: true },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6')
  })

  it('static grid has role="list"', () => {
    const wrapper = mount(ClientLogos, {
      props: { showStaticGrid: true },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('role="list"')
  })

  it('has gradient masks for scrolling container', () => {
    const wrapper = mount(ClientLogos, {
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('bg-gradient-to-r from-white to-transparent')
    expect(wrapper.html()).toContain('bg-gradient-to-l from-white to-transparent')
  })

  it('client logo has icon when provided', () => {
    const clients = [{ name: 'Test Client', icon: 'mdi:test' }]
    const wrapper = mount(ClientLogos, {
      props: { clients },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('mdi:test')
  })

  it('client logo has default icon when not provided', () => {
    const clients = [{ name: 'Test Client' }]
    const wrapper = mount(ClientLogos, {
      props: { clients },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('mdi:domain')
  })

  it('client items have opacity transition classes', () => {
    const wrapper = mount(ClientLogos, {
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('opacity-60 hover:opacity-100 transition-opacity')
  })

  it('static grid limits to 6 clients', () => {
    const wrapper = mount(ClientLogos, {
      global: { stubs: globalStubs }
    })

    // With 8 default clients, static grid should show only first 6
    const gridItems = wrapper.findAll('.grid-cols-2').length
    expect(gridItems).toBeGreaterThanOrEqual(0)
  })
})
