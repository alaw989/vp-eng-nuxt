/**
 * Tests for TeamMemberSkeleton component
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TeamMemberSkeleton from '../TeamMemberSkeleton.vue'

describe('TeamMemberSkeleton Component', () => {
  it('is hidden from assistive tech', () => {
    const wrapper = mount(TeamMemberSkeleton)

    expect(wrapper.attributes('aria-hidden')).toBe('true')
  })

  it('uses the ruled title-block frame, not a photo card', () => {
    const wrapper = mount(TeamMemberSkeleton)

    expect(wrapper.classes()).toContain('border')
    expect(wrapper.find('[class*="aspect-"]').exists()).toBe(false)
  })

  it('pulses placeholders for the name and the title-block cells', () => {
    const wrapper = mount(TeamMemberSkeleton)

    // name label + name + two cells with a label and a value each
    expect(wrapper.findAll('.animate-pulse').length).toBe(6)
  })

  it('separates the name from the cells with a rule', () => {
    const wrapper = mount(TeamMemberSkeleton)

    expect(wrapper.find('.border-t').exists()).toBe(true)
  })
})
