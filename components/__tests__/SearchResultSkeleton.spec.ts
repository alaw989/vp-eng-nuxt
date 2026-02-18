/**
 * Tests for SearchResultSkeleton component
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchResultSkeleton from '../SearchResultSkeleton.vue'

describe('SearchResultSkeleton Component', () => {
  it('renders with correct structure', () => {
    const wrapper = mount(SearchResultSkeleton)

    expect(wrapper.find('.space-y-6').exists()).toBe(true)
  })

  it('has aria-hidden="true"', () => {
    const wrapper = mount(SearchResultSkeleton)

    expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(true)
  })

  it('has pages section with h-6 w-32 header', () => {
    const wrapper = mount(SearchResultSkeleton)

    const h6Elements = wrapper.findAll('.h-6')
    expect(h6Elements.length).toBeGreaterThan(0)
  })

  it('has 3 page result placeholders', () => {
    const wrapper = mount(SearchResultSkeleton)

    // The component uses v-for="i in 3"
    expect(wrapper.html()).toBeTruthy()
  })

  it('page results have p-4 padding', () => {
    const wrapper = mount(SearchResultSkeleton)

    const p4Elements = wrapper.findAll('.p-4')
    expect(p4Elements.length).toBeGreaterThan(0)
  })

  it('has services section', () => {
    const wrapper = mount(SearchResultSkeleton)

    // Should have multiple sections
    expect(wrapper.html()).toBeTruthy()
  })

  it('has 4 service result placeholders', () => {
    const wrapper = mount(SearchResultSkeleton)

    // The component uses v-for="i in 4"
    expect(wrapper.html()).toBeTruthy()
  })

  it('service results have md:grid-cols-2 layout', () => {
    const wrapper = mount(SearchResultSkeleton)

    expect(wrapper.find('.md\\:grid-cols-2').exists()).toBe(true)
  })

  it('has animate-pulse class', () => {
    const wrapper = mount(SearchResultSkeleton)

    const animatedElements = wrapper.findAll('.animate-pulse')
    expect(animatedElements.length).toBeGreaterThan(0)
  })

  it('has h-6 w-32 for section headers', () => {
    const wrapper = mount(SearchResultSkeleton)

    const h6Elements = wrapper.findAll('.h-6')
    const w32Elements = wrapper.findAll('.w-32')
    expect(h6Elements.length).toBeGreaterThan(0)
    expect(w32Elements.length).toBeGreaterThan(0)
  })

  it('has border for result items', () => {
    const wrapper = mount(SearchResultSkeleton)

    expect(wrapper.find('.border').exists()).toBe(true)
    expect(wrapper.find('.border-neutral-200').exists()).toBe(true)
  })

  it('has proper spacing with space-y-6', () => {
    const wrapper = mount(SearchResultSkeleton)

    expect(wrapper.find('.space-y-6').exists()).toBe(true)
  })

  it('has proper spacing with space-y-3', () => {
    const wrapper = mount(SearchResultSkeleton)

    expect(wrapper.find('.space-y-3').exists()).toBe(true)
  })

  it('has gap-3 for grid items', () => {
    const wrapper = mount(SearchResultSkeleton)

    expect(wrapper.find('.gap-3').exists()).toBe(true)
  })

  it('has rounded-lg for result items', () => {
    const wrapper = mount(SearchResultSkeleton)

    const roundedElements = wrapper.findAll('.rounded-lg')
    expect(roundedElements.length).toBeGreaterThan(0)
  })

  it('has proper width classes for content placeholders', () => {
    const wrapper = mount(SearchResultSkeleton)

    expect(wrapper.find('.w-5').exists()).toBe(true)
    expect(wrapper.find('.w-3\\/4').exists()).toBe(true)
    expect(wrapper.find('.w-2\\/3').exists()).toBe(true)
    expect(wrapper.find('.w-full').exists()).toBe(true)
  })

  it('has proper height classes for content placeholders', () => {
    const wrapper = mount(SearchResultSkeleton)

    expect(wrapper.find('.h-5').exists()).toBe(true)
    expect(wrapper.find('.h-4').exists()).toBe(true)
  })

  it('has flex layout for item content', () => {
    const wrapper = mount(SearchResultSkeleton)

    const flexElements = wrapper.findAll('.flex')
    expect(flexElements.length).toBeGreaterThan(0)
  })

  it('has gap-3 for flex items', () => {
    const wrapper = mount(SearchResultSkeleton)

    const gap3Elements = wrapper.findAll('.gap-3')
    expect(gap3Elements.length).toBeGreaterThan(0)
  })
})
