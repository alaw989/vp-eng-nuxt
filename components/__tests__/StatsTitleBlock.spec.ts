/**
 * Tests for StatsTitleBlock component
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatsTitleBlock from '../StatsTitleBlock.vue'

const stats = [
  { value: 30, suffix: '+', count: true, label: 'Years of combined experience', detail: 'Engineers and detailers' },
  { value: 2007, label: 'Detailing steel since', detail: 'Tampa, Florida' },
]

describe('StatsTitleBlock Component', () => {
  it('renders the final values on first render, not zero', () => {
    const wrapper = mount(StatsTitleBlock, { props: { stats } })
    const text = wrapper.text()
    expect(text).toContain('30+')
    expect(text).toContain('2007')
    expect(text).not.toMatch(/(^|\s)0\+/)
  })

  it('renders a label and detail for each stat', () => {
    const wrapper = mount(StatsTitleBlock, { props: { stats } })
    const items = wrapper.findAll('ul > li')
    expect(items).toHaveLength(2)
    expect(items[0]!.text()).toContain('Years of combined experience')
    expect(items[1]!.text()).toContain('Tampa, Florida')
  })

  it('hides the ruler from assistive technology', () => {
    const wrapper = mount(StatsTitleBlock, { props: { stats } })
    expect(wrapper.find('[aria-hidden="true"]').text()).toContain('FT')
  })
})
