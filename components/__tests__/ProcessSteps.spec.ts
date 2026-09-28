/**
 * Tests for ProcessSteps component
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProcessSteps from '../ProcessSteps.vue'
import { processSteps } from '../../utils/process'

describe('ProcessSteps Component', () => {
  it('renders every step as an ordered list item', () => {
    const wrapper = mount(ProcessSteps, { props: { steps: processSteps } })
    const items = wrapper.findAll('ol > li')
    expect(items).toHaveLength(processSteps.length)
    expect(items[0]!.text()).toContain('Consultation')
    expect(items[3]!.text()).toContain('Support')
  })

  it('draws one connector between each pair of steps', () => {
    const wrapper = mount(ProcessSteps, { props: { steps: processSteps } })
    expect(wrapper.findAll('[data-testid="process-connector"]')).toHaveLength(processSteps.length - 1)
  })

  it('marks only the last step as complete', () => {
    const wrapper = mount(ProcessSteps, { props: { steps: processSteps } })
    const complete = wrapper.findAll('[data-complete="true"]')
    expect(complete).toHaveLength(1)
    expect(complete[0]!.text()).toBe('04')
  })

  it('announces step numbers to screen readers', () => {
    const wrapper = mount(ProcessSteps, { props: { steps: processSteps } })
    expect(wrapper.find('h3').text()).toContain('Step 1:')
  })
})
