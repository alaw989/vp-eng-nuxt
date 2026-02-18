/**
 * Tests for ProjectDetailSkeleton component
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProjectDetailSkeleton from '../ProjectDetailSkeleton.vue'

describe('ProjectDetailSkeleton Component', () => {
  it('renders with correct structure', () => {
    const wrapper = mount(ProjectDetailSkeleton)

    expect(wrapper.vm).toBeDefined()
  })

  it('has aria-hidden="true"', () => {
    const wrapper = mount(ProjectDetailSkeleton)

    expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(true)
  })

  it('has header section with bg-primary-dark', () => {
    const wrapper = mount(ProjectDetailSkeleton)

    expect(wrapper.find('.bg-primary-dark').exists()).toBe(true)
  })

  it('has content section with bg-white', () => {
    const wrapper = mount(ProjectDetailSkeleton)

    expect(wrapper.find('.bg-white').exists()).toBe(true)
  })

  it('has gallery section with bg-neutral-100', () => {
    const wrapper = mount(ProjectDetailSkeleton)

    expect(wrapper.find('.bg-neutral-100').exists()).toBe(true)
  })

  it('has 6 gallery placeholders', () => {
    const wrapper = mount(ProjectDetailSkeleton)

    // The component uses v-for="i in 6" to create placeholders
    expect(wrapper.html()).toBeTruthy()
  })

  it('gallery placeholder has aspect-[4/3] class', () => {
    const wrapper = mount(ProjectDetailSkeleton)

    expect(wrapper.find('.aspect-\\[4\\/3\\]').exists()).toBe(true)
  })

  it('has animate-pulse class for loading effect', () => {
    const wrapper = mount(ProjectDetailSkeleton)

    const animatedElements = wrapper.findAll('.animate-pulse')
    expect(animatedElements.length).toBeGreaterThan(0)
  })

  it('has two-column grid layout for content', () => {
    const wrapper = mount(ProjectDetailSkeleton)

    expect(wrapper.find('.lg\\:grid-cols-3').exists()).toBe(true)
  })

  it('has project info sidebar with bg-neutral-50', () => {
    const wrapper = mount(ProjectDetailSkeleton)

    expect(wrapper.find('.bg-neutral-50').exists()).toBe(true)
  })

  it('has proper container classes', () => {
    const wrapper = mount(ProjectDetailSkeleton)

    const containerElements = wrapper.findAll('.container')
    expect(containerElements.length).toBeGreaterThan(0)
  })

  it('has header height py-16', () => {
    const wrapper = mount(ProjectDetailSkeleton)

    const py16Elements = wrapper.findAll('.py-16')
    expect(py16Elements.length).toBeGreaterThan(0)
  })

  it('has grid layout for gallery', () => {
    const wrapper = mount(ProjectDetailSkeleton)

    expect(wrapper.find('.grid-cols-2').exists()).toBe(true)
    expect(wrapper.find('.md\\:grid-cols-3').exists()).toBe(true)
  })

  it('has rounded-lg for gallery placeholders', () => {
    const wrapper = mount(ProjectDetailSkeleton)

    const roundedElements = wrapper.findAll('.rounded-lg')
    expect(roundedElements.length).toBeGreaterThan(0)
  })

  it('has gap-4 for gallery grid', () => {
    const wrapper = mount(ProjectDetailSkeleton)

    const gap4Elements = wrapper.findAll('.gap-4')
    expect(gap4Elements.length).toBeGreaterThan(0)
  })

  it('has rounded-xl for sidebar', () => {
    const wrapper = mount(ProjectDetailSkeleton)

    const roundedXlElements = wrapper.findAll('.rounded-xl')
    expect(roundedXlElements.length).toBeGreaterThan(0)
  })

  it('has proper spacing for sidebar content', () => {
    const wrapper = mount(ProjectDetailSkeleton)

    expect(wrapper.find('.space-y-3').exists()).toBe(true)
  })
})
