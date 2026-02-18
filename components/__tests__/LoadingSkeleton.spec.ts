/**
 * Tests for LoadingSkeleton component
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingSkeleton from '../LoadingSkeleton.vue'

describe('LoadingSkeleton Component', () => {
  const globalStubs = {}

  it('renders with default height', () => {
    const wrapper = mount(LoadingSkeleton, {
      global: { stubs: globalStubs }
    })

    expect(wrapper.find('.animate-pulse').exists()).toBe(true)
    expect(wrapper.find('.bg-neutral-200').exists()).toBe(true)
    expect(wrapper.find('.h-48').exists()).toBe(true)
  })

  it('renders with custom height', () => {
    const wrapper = mount(LoadingSkeleton, {
      props: { height: 'h-64' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.find('.h-64').exists()).toBe(true)
  })

  it('has animate-pulse class', () => {
    const wrapper = mount(LoadingSkeleton, {
      global: { stubs: globalStubs }
    })

    expect(wrapper.find('.animate-pulse').exists()).toBe(true)
  })

  it('has bg-neutral-200 background color', () => {
    const wrapper = mount(LoadingSkeleton, {
      global: { stubs: globalStubs }
    })

    expect(wrapper.find('.bg-neutral-200').exists()).toBe(true)
  })

  it('has rounded-lg class', () => {
    const wrapper = mount(LoadingSkeleton, {
      global: { stubs: globalStubs }
    })

    expect(wrapper.find('.rounded-lg').exists()).toBe(true)
  })

  it('has aria-hidden="true" attribute', () => {
    const wrapper = mount(LoadingSkeleton, {
      global: { stubs: globalStubs }
    })

    expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(true)
  })

  it('computes height class from prop', () => {
    const wrapper = mount(LoadingSkeleton, {
      props: { height: 'h-96' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.find('.h-96').exists()).toBe(true)
  })

  it('supports various custom height values', () => {
    const heights = ['h-32', 'h-48', 'h-64', 'h-96', 'h-screen']

    heights.forEach(height => {
      const wrapper = mount(LoadingSkeleton, {
        props: { height },
        global: { stubs: globalStubs }
      })
      expect(wrapper.find(`.${height}`).exists()).toBe(true)
    })
  })

  it('has proper structure for screen readers', () => {
    const wrapper = mount(LoadingSkeleton, {
      global: { stubs: globalStubs }
    })

    // Skeleton should be hidden from screen readers
    expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(true)
  })
})
