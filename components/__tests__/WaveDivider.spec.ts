/**
 * Tests for WaveDivider component
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import WaveDivider from '../WaveDivider.vue'

describe('WaveDivider Component', () => {
  const globalStubs = {
    NuxtLink: { template: '<a><slot /></a>' }
  }

  it('renders with default props', () => {
    const wrapper = mount(WaveDivider, {
      global: { stubs: globalStubs }
    })

    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.find('svg').attributes('viewBox')).toBe('0 0 1200 120')
    expect(wrapper.find('svg').attributes('preserveAspectRatio')).toBe('none')
  })

  it('renders wave variant by default', () => {
    const wrapper = mount(WaveDivider, {
      global: { stubs: globalStubs }
    })

    const path = wrapper.find('path')
    expect(path.exists()).toBe(true)
    expect(path.attributes('fill')).toBe('#ffffff')
  })

  it('renders slant variant', () => {
    const wrapper = mount(WaveDivider, {
      props: { variant: 'slant' },
      global: { stubs: globalStubs }
    })

    const path = wrapper.find('path')
    expect(path.exists()).toBe(true)
  })

  it('renders curve variant', () => {
    const wrapper = mount(WaveDivider, {
      props: { variant: 'curve' },
      global: { stubs: globalStubs }
    })

    const path = wrapper.find('path')
    expect(path.exists()).toBe(true)
  })

  it('applies custom fill color', () => {
    const wrapper = mount(WaveDivider, {
      props: { fill: '#000000' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.find('path').attributes('fill')).toBe('#000000')
  })

  it('applies custom height', () => {
    const wrapper = mount(WaveDivider, {
      props: { height: '100px' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.find('.w-full').attributes('style')).toContain('height: 100px')
  })

  it('applies custom width', () => {
    const wrapper = mount(WaveDivider, {
      props: { width: '50%' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.find('svg').attributes('width')).toBe('50%')
  })

  it('applies bottom orientation (default)', () => {
    const wrapper = mount(WaveDivider, {
      props: { orientation: 'bottom' },
      global: { stubs: globalStubs }
    })

    const container = wrapper.find('.w-full')
    expect(container.classes()).toContain('-mt-1')
  })

  it('applies top orientation', () => {
    const wrapper = mount(WaveDivider, {
      props: { orientation: 'top' },
      global: { stubs: globalStubs }
    })

    const container = wrapper.find('.w-full')
    expect(container.classes()).toContain('-mb-1')
  })

  it('has correct container classes', () => {
    const wrapper = mount(WaveDivider, {
      global: { stubs: globalStubs }
    })

    const container = wrapper.find('.w-full')
    expect(container.classes()).toContain('overflow-hidden')
    expect(container.classes()).toContain('leading-none')
  })

  it('SVG has correct namespace', () => {
    const wrapper = mount(WaveDivider, {
      global: { stubs: globalStubs }
    })

    expect(wrapper.find('svg').attributes('xmlns')).toBe('http://www.w3.org/2000/svg')
  })

  it('has correct wave path data', () => {
    const wrapper = mount(WaveDivider, {
      props: { variant: 'wave' },
      global: { stubs: globalStubs }
    })

    const path = wrapper.find('path')
    expect(path.attributes('d')).toContain('M0,0V46.29')
    expect(path.attributes('d')).toContain('1200,52.47V0Z')
  })

  it('has correct slant path data', () => {
    const wrapper = mount(WaveDivider, {
      props: { variant: 'slant' },
      global: { stubs: globalStubs }
    })

    const path = wrapper.find('path')
    expect(path.attributes('d')).toBe('M0,0H1200L1200,120L0,120Z')
  })

  it('has correct curve path data', () => {
    const wrapper = mount(WaveDivider, {
      props: { variant: 'curve' },
      global: { stubs: globalStubs }
    })

    const path = wrapper.find('path')
    expect(path.attributes('d')).toContain('M0,64L80,58.7')
    expect(path.attributes('d')).toContain('V120H0V64Z')
  })
})
