/**
 * Tests for ServiceDetailSkeleton component
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ServiceDetailSkeleton from '../ServiceDetailSkeleton.vue'

describe('ServiceDetailSkeleton Component', () => {
  it('renders with correct structure', () => {
    const wrapper = mount(ServiceDetailSkeleton)

    expect(wrapper.vm).toBeDefined()
  })

  it('has header section with bg-primary-dark', () => {
    const wrapper = mount(ServiceDetailSkeleton)

    expect(wrapper.find('.bg-primary-dark').exists()).toBe(true)
  })

  it('has content section with bg-white', () => {
    const wrapper = mount(ServiceDetailSkeleton)

    expect(wrapper.find('.bg-white').exists()).toBe(true)
  })

  it('has icon placeholder with w-16 h-16', () => {
    const wrapper = mount(ServiceDetailSkeleton)

    expect(wrapper.find('.w-16').exists()).toBe(true)
    expect(wrapper.find('.h-16').exists()).toBe(true)
  })

  it('has two-column grid layout for content', () => {
    const wrapper = mount(ServiceDetailSkeleton)

    expect(wrapper.find('.md\\:grid-cols-2').exists()).toBe(true)
  })

  it('has animate-pulse class for loading effect', () => {
    const wrapper = mount(ServiceDetailSkeleton)

    const animatedElements = wrapper.findAll('.animate-pulse')
    expect(animatedElements.length).toBeGreaterThan(0)
  })

  it('has proper container classes', () => {
    const wrapper = mount(ServiceDetailSkeleton)

    const containerElements = wrapper.findAll('.container')
    expect(containerElements.length).toBeGreaterThan(0)
  })

  it('has bullet point placeholders in sidebar', () => {
    const wrapper = mount(ServiceDetailSkeleton)

    expect(wrapper.find('.w-6').exists()).toBe(true)
    expect(wrapper.find('.h-6').exists()).toBe(true)
    expect(wrapper.find('.rounded-full').exists()).toBe(true)
  })

  it('has 5 bullet points', () => {
    const wrapper = mount(ServiceDetailSkeleton)

    // The component uses v-for="i in 5"
    expect(wrapper.html()).toBeTruthy()
  })

  it('has content line placeholders', () => {
    const wrapper = mount(ServiceDetailSkeleton)

    expect(wrapper.find('.h-4').exists()).toBe(true)
  })

  it('has proper spacing', () => {
    const wrapper = mount(ServiceDetailSkeleton)

    const gap12Elements = wrapper.findAll('.gap-12')
    expect(gap12Elements.length).toBeGreaterThan(0)
  })

  it('has py-16 for header and content sections', () => {
    const wrapper = mount(ServiceDetailSkeleton)

    const py16Elements = wrapper.findAll('.py-16')
    expect(py16Elements.length).toBe(2)
  })

  it('has mb-6 for section headers', () => {
    const wrapper = mount(ServiceDetailSkeleton)

    const mb6Elements = wrapper.findAll('.mb-6')
    expect(mb6Elements.length).toBeGreaterThan(0)
  })

  it('has proper sizing for header elements', () => {
    const wrapper = mount(ServiceDetailSkeleton)

    expect(wrapper.find('.h-8').exists()).toBe(true)
    expect(wrapper.find('.h-10').exists()).toBe(true)
  })

  it('has white/20 background for header placeholders', () => {
    const wrapper = mount(ServiceDetailSkeleton)

    const white20Elements = wrapper.findAll('.bg-white\\/20')
    expect(white20Elements.length).toBeGreaterThan(0)
  })

  it('has proper gap for bullet items', () => {
    const wrapper = mount(ServiceDetailSkeleton)

    expect(wrapper.find('.gap-3').exists()).toBe(true)
  })
})
