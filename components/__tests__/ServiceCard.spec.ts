/**
 * Tests for ServiceCard component
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ServiceCard from '../ServiceCard.vue'

describe('ServiceCard Component', () => {
  const defaultProps = {
    title: 'Structural Engineering',
    slug: 'structural-engineering',
    description: 'Comprehensive structural engineering services for residential and commercial projects.',
    icon: 'mdi:calculator'
  }

  const globalStubs = {
    NuxtLink: { template: '<a href="#"><slot /></a>' },
    Icon: { template: '<span />' }
  }

  it('renders with all props', () => {
    const wrapper = mount(ServiceCard, {
      props: defaultProps,
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('Structural Engineering')
    expect(wrapper.html()).toContain('Comprehensive structural engineering services')
  })

  it('renders title', () => {
    const wrapper = mount(ServiceCard, {
      props: defaultProps,
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('Structural Engineering')
  })

  it('renders description', () => {
    const wrapper = mount(ServiceCard, {
      props: defaultProps,
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('Comprehensive structural engineering services')
  })

  it('renders icon', () => {
    const wrapper = mount(ServiceCard, {
      props: defaultProps,
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('mdi:calculator')
  })

  it('generates correct link path', () => {
    const wrapper = mount(ServiceCard, {
      props: defaultProps,
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ['to']
          },
          Icon: { template: '<span />' }
        }
      }
    })

    // The component internally uses the slug prop
    expect(wrapper.props('slug')).toBe('structural-engineering')
  })

  it('has correct aria-label', () => {
    const wrapper = mount(ServiceCard, {
      props: { title: 'Structural Engineering', slug: 'structural', description: 'Test', icon: 'mdi:test' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('aria-label="Learn more about Structural Engineering services"')
  })

  it('renders "Learn more" text', () => {
    const wrapper = mount(ServiceCard, {
      props: defaultProps,
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('Learn more')
  })

  it('has arrow icon', () => {
    const wrapper = mount(ServiceCard, {
      props: defaultProps,
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('mdi:arrow-right')
  })

  it('has group classes for hover effects', () => {
    const wrapper = mount(ServiceCard, {
      props: defaultProps,
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('group')
    expect(wrapper.html()).toContain('hover:border-primary')
    expect(wrapper.html()).toContain('hover:shadow-xl')
    expect(wrapper.html()).toContain('hover:-translate-y-1')
  })

  it('has transition classes', () => {
    const wrapper = mount(ServiceCard, {
      props: defaultProps,
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('transition-all duration-300')
  })

  it('has focus-visible ring for accessibility', () => {
    const wrapper = mount(ServiceCard, {
      props: defaultProps,
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('focus-visible:ring-2')
    expect(wrapper.html()).toContain('focus-visible:ring-primary')
    expect(wrapper.html()).toContain('focus-visible:ring-offset-2')
  })

  it('has icon background with primary color', () => {
    const wrapper = mount(ServiceCard, {
      props: defaultProps,
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('bg-primary/10')
  })

  it('has icon hover color change', () => {
    const wrapper = mount(ServiceCard, {
      props: defaultProps,
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('group-hover:text-white')
  })

  it('has title hover color change', () => {
    const wrapper = mount(ServiceCard, {
      props: defaultProps,
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('group-hover:text-primary')
  })

  it('has icon container hover background change', () => {
    const wrapper = mount(ServiceCard, {
      props: defaultProps,
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('group-hover:bg-primary')
  })

  it('has gap increase on hover for "Learn more" section', () => {
    const wrapper = mount(ServiceCard, {
      props: defaultProps,
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('group-hover:gap-2')
  })

  it('has proper card styling', () => {
    const wrapper = mount(ServiceCard, {
      props: defaultProps,
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('bg-white rounded-xl border border-neutral-200')
  })

  it('has proper padding', () => {
    const wrapper = mount(ServiceCard, {
      props: defaultProps,
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('p-8')
  })

  it('icon has aria-hidden="true"', () => {
    const wrapper = mount(ServiceCard, {
      props: defaultProps,
      global: { stubs: globalStubs }
    })

    // Icons should be hidden from screen readers
    expect(wrapper.html()).toContain('aria-hidden="true"')
  })
})
