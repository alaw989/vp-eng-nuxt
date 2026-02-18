/**
 * Tests for ServiceCardSkeleton component
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ServiceCardSkeleton from '../ServiceCardSkeleton.vue'

describe('ServiceCardSkeleton Component', () => {
  it('renders with correct structure', () => {
    const wrapper = mount(ServiceCardSkeleton)

    expect(wrapper.find('.bg-white').exists()).toBe(true)
    expect(wrapper.find('.rounded-xl').exists()).toBe(true)
  })

  it('has bg-white background', () => {
    const wrapper = mount(ServiceCardSkeleton)

    expect(wrapper.find('.bg-white').exists()).toBe(true)
  })

  it('has icon placeholder with w-16 h-16', () => {
    const wrapper = mount(ServiceCardSkeleton)

    expect(wrapper.find('.w-16').exists()).toBe(true)
    expect(wrapper.find('.h-16').exists()).toBe(true)
  })

  it('has icon placeholder with primary color background', () => {
    const wrapper = mount(ServiceCardSkeleton)

    expect(wrapper.find('.bg-primary\\/10').exists()).toBe(true)
  })

  it('has rounded-xl for icon placeholder', () => {
    const wrapper = mount(ServiceCardSkeleton)

    const roundedElements = wrapper.findAll('.rounded-xl')
    expect(roundedElements.length).toBeGreaterThan(0)
  })

  it('has title placeholder with h-7', () => {
    const wrapper = mount(ServiceCardSkeleton)

    expect(wrapper.find('.h-7').exists()).toBe(true)
  })

  it('has description line placeholders with h-4', () => {
    const wrapper = mount(ServiceCardSkeleton)

    const h4Elements = wrapper.findAll('.h-4')
    expect(h4Elements.length).toBe(3)
  })

  it('has learn more link placeholder with h-5', () => {
    const wrapper = mount(ServiceCardSkeleton)

    expect(wrapper.find('.h-5').exists()).toBe(true)
  })

  it('has w-28 width for link placeholder', () => {
    const wrapper = mount(ServiceCardSkeleton)

    expect(wrapper.find('.w-28').exists()).toBe(true)
  })

  it('has animate-pulse class for loading effect', () => {
    const wrapper = mount(ServiceCardSkeleton)

    const animatedElements = wrapper.findAll('.animate-pulse')
    expect(animatedElements.length).toBeGreaterThan(0)
  })

  it('has border with border-neutral-200', () => {
    const wrapper = mount(ServiceCardSkeleton)

    expect(wrapper.find('.border-neutral-200').exists()).toBe(true)
  })

  it('has p-8 padding', () => {
    const wrapper = mount(ServiceCardSkeleton)

    expect(wrapper.find('.p-8').exists()).toBe(true)
  })

  it('has proper spacing between elements', () => {
    const wrapper = mount(ServiceCardSkeleton)

    expect(wrapper.find('.space-y-2').exists()).toBe(true)
  })

  it('has mb-6 margin for icon placeholder', () => {
    const wrapper = mount(ServiceCardSkeleton)

    expect(wrapper.find('.mb-6').exists()).toBe(true)
  })

  it('has mb-3 margin for title placeholder', () => {
    const wrapper = mount(ServiceCardSkeleton)

    const mb3Elements = wrapper.findAll('.mb-3')
    expect(mb3Elements.length).toBeGreaterThan(0)
  })

  it('has mt-6 margin for link placeholder', () => {
    const wrapper = mount(ServiceCardSkeleton)

    const mt6Elements = wrapper.findAll('.mt-6')
    expect(mt6Elements.length).toBeGreaterThan(0)
  })
})
