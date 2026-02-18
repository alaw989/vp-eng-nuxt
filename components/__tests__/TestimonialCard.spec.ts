/**
 * Tests for TestimonialCard component
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TestimonialCard from '../TestimonialCard.vue'

describe('TestimonialCard Component', () => {
  const defaultProps = {
    quote: 'This is an amazing service that exceeded all expectations.',
    author: 'John Doe',
    company: 'Acme Corp',
    role: 'CEO',
    avatar: '/avatar.jpg'
  }

  const globalStubs = {
    NuxtImg: { template: '<img />' },
    Icon: { template: '<span />' }
  }

  it('renders with all props', () => {
    const wrapper = mount(TestimonialCard, {
      props: defaultProps,
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('This is an amazing service')
    expect(wrapper.html()).toContain('John Doe')
    expect(wrapper.html()).toContain('Acme Corp')
    expect(wrapper.html()).toContain('CEO')
  })

  it('renders with only required props', () => {
    const minimalProps = {
      quote: 'Great service!',
      author: 'Jane Smith'
    }

    const wrapper = mount(TestimonialCard, {
      props: minimalProps,
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('Great service!')
    expect(wrapper.html()).toContain('Jane Smith')
  })

  it('displays quote with quotation marks', () => {
    const wrapper = mount(TestimonialCard, {
      props: { quote: 'This is a testimonial', author: 'Author' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('"This is a testimonial"')
  })

  it('renders quote in blockquote', () => {
    const wrapper = mount(TestimonialCard, {
      props: { quote: 'Test quote', author: 'Author' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.find('blockquote').exists()).toBe(true)
  })

  it('renders author name', () => {
    const wrapper = mount(TestimonialCard, {
      props: { quote: 'Test', author: 'John Doe' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('John Doe')
  })

  it('renders role when provided', () => {
    const wrapper = mount(TestimonialCard, {
      props: { quote: 'Test', author: 'Author', role: 'Manager' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('Manager')
  })

  it('renders company when provided', () => {
    const wrapper = mount(TestimonialCard, {
      props: { quote: 'Test', author: 'Author', company: 'ABC Inc' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('ABC Inc')
  })

  it('has correct alt text for avatar with company', () => {
    const wrapper = mount(TestimonialCard, {
      props: { quote: 'Test', author: 'John Doe', company: 'Acme Corp', avatar: '/avatar.jpg' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('John Doe from Acme Corp - client testimonial author photo')
  })

  it('has correct alt text for avatar without company', () => {
    const wrapper = mount(TestimonialCard, {
      props: { quote: 'Test', author: 'Jane Smith', avatar: '/avatar.jpg' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('Jane Smith - client testimonial author photo')
  })

  it('renders avatar when provided', () => {
    const wrapper = mount(TestimonialCard, {
      props: { quote: 'Test', author: 'Author', avatar: '/avatar.jpg' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('/avatar.jpg')
  })

  it('renders placeholder icon when no avatar provided', () => {
    const wrapper = mount(TestimonialCard, {
      props: { quote: 'Test', author: 'Author' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('mdi:account')
  })

  it('has quote mark icon', () => {
    const wrapper = mount(TestimonialCard, {
      props: { quote: 'Test', author: 'Author' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('mdi:format-quote-open')
  })

  it('has proper border styling', () => {
    const wrapper = mount(TestimonialCard, {
      props: { quote: 'Test', author: 'Author' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('border-t-primary')
    expect(wrapper.html()).toContain('border-t-4')
  })

  it('has proper card styling', () => {
    const wrapper = mount(TestimonialCard, {
      props: { quote: 'Test', author: 'Author' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('bg-white rounded-xl')
    expect(wrapper.html()).toContain('border border-neutral-200')
  })

  it('has shadow classes', () => {
    const wrapper = mount(TestimonialCard, {
      props: { quote: 'Test', author: 'Author' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('shadow-lg hover:shadow-xl')
  })

  it('has transition classes', () => {
    const wrapper = mount(TestimonialCard, {
      props: { quote: 'Test', author: 'Author' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('transition-shadow duration-300')
  })

  it('quote mark icon has aria-hidden="true"', () => {
    const wrapper = mount(TestimonialCard, {
      props: { quote: 'Test', author: 'Author' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('aria-hidden="true"')
  })

  it('has proper padding', () => {
    const wrapper = mount(TestimonialCard, {
      props: { quote: 'Test', author: 'Author' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('p-8')
  })
})
