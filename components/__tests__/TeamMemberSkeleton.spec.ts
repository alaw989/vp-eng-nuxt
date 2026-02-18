/**
 * Tests for TeamMemberSkeleton component
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TeamMemberSkeleton from '../TeamMemberSkeleton.vue'

describe('TeamMemberSkeleton Component', () => {
  it('renders with correct structure', () => {
    const wrapper = mount(TeamMemberSkeleton)

    expect(wrapper.find('.bg-white').exists()).toBe(true)
    expect(wrapper.find('.rounded-xl').exists()).toBe(true)
  })

  it('has aspect ratio for photo placeholder', () => {
    const wrapper = mount(TeamMemberSkeleton)

    expect(wrapper.find('.aspect-\\[4\\/5\\]').exists()).toBe(true)
  })

  it('has aria-hidden="true"', () => {
    const wrapper = mount(TeamMemberSkeleton)

    expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(true)
  })

  it('has name placeholder class', () => {
    const wrapper = mount(TeamMemberSkeleton)

    expect(wrapper.find('.h-6').exists()).toBe(true)
  })

  it('has title placeholder class', () => {
    const wrapper = mount(TeamMemberSkeleton)

    const h4Elements = wrapper.findAll('.h-4')
    expect(h4Elements.length).toBeGreaterThan(0)
  })

  it('has bio line placeholders', () => {
    const wrapper = mount(TeamMemberSkeleton)

    expect(wrapper.find('.h-3').exists()).toBe(true)
  })

  it('has contact info placeholder with border', () => {
    const wrapper = mount(TeamMemberSkeleton)

    expect(wrapper.find('.border-t').exists()).toBe(true)
    expect(wrapper.find('.border-neutral-200').exists()).toBe(true)
  })

  it('has animate-pulse class for loading effect', () => {
    const wrapper = mount(TeamMemberSkeleton)

    const animatedElements = wrapper.findAll('.animate-pulse')
    expect(animatedElements.length).toBeGreaterThan(0)
  })

  it('has proper border and rounded corners', () => {
    const wrapper = mount(TeamMemberSkeleton)

    expect(wrapper.find('.rounded-xl').exists()).toBe(true)
    expect(wrapper.find('.border').exists()).toBe(true)
  })

  it('has proper padding for content', () => {
    const wrapper = mount(TeamMemberSkeleton)

    expect(wrapper.find('.p-6').exists()).toBe(true)
  })

  it('has width-3/4 for name placeholder', () => {
    const wrapper = mount(TeamMemberSkeleton)

    expect(wrapper.find('.w-3\\/4').exists()).toBe(true)
  })

  it('has w-1/2 for title placeholder', () => {
    const wrapper = mount(TeamMemberSkeleton)

    expect(wrapper.find('.w-1\\/2').exists()).toBe(true)
  })

  it('has w-5/6 for second bio line', () => {
    const wrapper = mount(TeamMemberSkeleton)

    const w5_6Elements = wrapper.findAll('.w-5\\/6')
    expect(w5_6Elements.length).toBeGreaterThan(0)
  })

  it('has proper spacing between elements', () => {
    const wrapper = mount(TeamMemberSkeleton)

    expect(wrapper.find('.space-y-3').exists()).toBe(true)
  })

  it('has overflow-hidden', () => {
    const wrapper = mount(TeamMemberSkeleton)

    expect(wrapper.find('.overflow-hidden').exists()).toBe(true)
  })

  it('has pt-2 padding for bio section', () => {
    const wrapper = mount(TeamMemberSkeleton)

    expect(wrapper.find('.pt-2').exists()).toBe(true)
  })

  it('has pt-3 padding for contact section', () => {
    const wrapper = mount(TeamMemberSkeleton)

    const pt3Elements = wrapper.findAll('.pt-3')
    expect(pt3Elements.length).toBeGreaterThan(0)
  })
})
