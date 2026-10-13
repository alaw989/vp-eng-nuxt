/**
 * Tests for StatsTitleBlock component
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatsTitleBlock from '../StatsTitleBlock.vue'

const stats = [
  { value: 30, suffix: '+', count: true, label: 'Years of combined experience', detail: 'Engineers and detailers' },
  { value: 2007, label: 'Detailing steel since', detail: 'Tampa, Florida' },
  { value: 7, label: 'States with PE registration', detail: 'FL · KY · MD' },
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
    expect(items).toHaveLength(3)
    expect(items[0]!.text()).toContain('Years of combined experience')
    expect(items[1]!.text()).toContain('Tampa, Florida')
  })

  it('lets a detail without separators wrap so it stays inside a narrow cell', () => {
    const wrapper = mount(StatsTitleBlock, { props: { stats } })
    const [single, , multi] = wrapper.findAll('ul > li').map(li => li.findAll('.eyebrow > span'))
    expect(single!.map(s => s.classes())).toEqual([[]])
    expect(multi!.map(s => s.text())).toEqual(['FL ·', 'KY ·', 'MD'])
    expect(multi!.every(s => s.classes().includes('whitespace-nowrap'))).toBe(true)
  })
})
