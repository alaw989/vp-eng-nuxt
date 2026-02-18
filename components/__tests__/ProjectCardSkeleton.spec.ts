/**
 * Tests for ProjectCardSkeleton component
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProjectCardSkeleton from '../ProjectCardSkeleton.vue'

describe('ProjectCardSkeleton Component', () => {
  it('renders with correct structure', () => {
    const wrapper = mount(ProjectCardSkeleton)

    expect(wrapper.find('.bg-white').exists()).toBe(true)
    expect(wrapper.find('.rounded-xl').exists()).toBe(true)
  })

  it('has correct image placeholder aspect ratio', () => {
    const wrapper = mount(ProjectCardSkeleton)

    expect(wrapper.find('.aspect-\\[4\\/3\\]').exists()).toBe(true)
  })

  it('has correct image placeholder styling', () => {
    const wrapper = mount(ProjectCardSkeleton)

    const imagePlaceholder = wrapper.findAll('.bg-neutral-200')[0]
    expect(imagePlaceholder?.exists()).toBe(true)
    expect(imagePlaceholder?.classes()).toContain('animate-pulse')
  })

  it('has correct content padding', () => {
    const wrapper = mount(ProjectCardSkeleton)

    expect(wrapper.find('.p-6').exists()).toBe(true)
  })

  it('has correct spacing between elements', () => {
    const wrapper = mount(ProjectCardSkeleton)

    expect(wrapper.find('.space-y-4').exists()).toBe(true)
  })

  it('has correct category badge sizing', () => {
    const wrapper = mount(ProjectCardSkeleton)

    expect(wrapper.find('.h-6').exists()).toBe(true)
    expect(wrapper.find('.w-20').exists()).toBe(true)
    expect(wrapper.find('.rounded-full').exists()).toBe(true)
  })

  it('has correct title placeholder sizing', () => {
    const wrapper = mount(ProjectCardSkeleton)

    const titleElements = wrapper.findAll('.h-7')
    expect(titleElements.length).toBeGreaterThan(0)
  })

  it('has correct description line spacing', () => {
    const wrapper = mount(ProjectCardSkeleton)

    expect(wrapper.find('.space-y-2').exists()).toBe(true)
  })

  it('has correct description line sizing', () => {
    const wrapper = mount(ProjectCardSkeleton)

    expect(wrapper.find('.h-4').exists()).toBe(true)
  })

  it('has correct second line width', () => {
    const wrapper = mount(ProjectCardSkeleton)

    expect(wrapper.find('.w-3\\/4').exists()).toBe(true)
  })

  it('has correct metadata section styling', () => {
    const wrapper = mount(ProjectCardSkeleton)

    expect(wrapper.find('.flex').exists()).toBe(true)
    expect(wrapper.find('.gap-4').exists()).toBe(true)
    expect(wrapper.find('.pt-4').exists()).toBe(true)
    expect(wrapper.find('.border-t').exists()).toBe(true)
  })

  it('has correct metadata item sizing', () => {
    const wrapper = mount(ProjectCardSkeleton)

    expect(wrapper.find('.h-4').exists()).toBe(true)
  })

  it('has correct metadata item widths', () => {
    const wrapper = mount(ProjectCardSkeleton)

    expect(wrapper.find('.w-24').exists()).toBe(true)
    expect(wrapper.find('.w-16').exists()).toBe(true)
  })

  it('has animate-pulse class for loading effect', () => {
    const wrapper = mount(ProjectCardSkeleton)

    const animatedElements = wrapper.findAll('.animate-pulse')
    expect(animatedElements.length).toBeGreaterThan(0)
  })

  it('has border styling', () => {
    const wrapper = mount(ProjectCardSkeleton)

    expect(wrapper.find('.border').exists()).toBe(true)
    expect(wrapper.find('.border-neutral-200').exists()).toBe(true)
  })

  it('has overflow-hidden', () => {
    const wrapper = mount(ProjectCardSkeleton)

    expect(wrapper.find('.overflow-hidden').exists()).toBe(true)
  })
})
