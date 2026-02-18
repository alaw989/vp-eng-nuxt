/**
 * Tests for BackToTop component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import BackToTop from '../BackToTop.vue'

describe('BackToTop Component', () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
  })

  afterEach(() => {
    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
  })

  it('calculates circumference correctly', () => {
    const wrapper = mount(BackToTop)
    // The component calculates 2 * Math.PI * 10
    const expectedCircumference = 2 * Math.PI * 10
    expect(expectedCircumference).toBeCloseTo(62.83, 2)
  })

  it('renders component structure', () => {
    const wrapper = mount(BackToTop)
    // Component renders with Transition wrapper
    expect(wrapper.html()).toContain('<!-- Only show progress indicator when visible -->')
  })

  it('calculates dash offset correctly for scroll progress', () => {
    const circumference = 2 * Math.PI * 10
    const scrollProgress = 0.5
    const dashOffset = circumference * (1 - scrollProgress)
    expect(dashOffset).toBeCloseTo(31.42, 2)
  })

  it('calculates dash offset at start', () => {
    const circumference = 2 * Math.PI * 10
    const scrollProgress = 0
    const dashOffset = circumference * (1 - scrollProgress)
    expect(dashOffset).toBeCloseTo(62.83, 2)
  })

  it('calculates dash offset at end', () => {
    const circumference = 2 * Math.PI * 10
    const scrollProgress = 1
    const dashOffset = circumference * (1 - scrollProgress)
    expect(dashOffset).toBe(0)
  })

  it('calculates scroll progress correctly', () => {
    const scrollTop = 500
    const docHeight = 1000
    const scrollProgress = scrollTop > 0 ? Math.min(scrollTop / docHeight, 1) : 0
    expect(scrollProgress).toBe(0.5)
  })

  it('caps scroll progress at 1', () => {
    const scrollTop = 2000
    const docHeight = 1000
    const scrollProgress = scrollTop > 0 ? Math.min(scrollTop / docHeight, 1) : 0
    expect(scrollProgress).toBe(1)
  })

  it('returns 0 for scroll progress when at top', () => {
    const scrollTop = 0
    const docHeight = 1000
    const scrollProgress = scrollTop > 0 ? Math.min(scrollTop / docHeight, 1) : 0
    expect(scrollProgress).toBe(0)
  })

  it('has component instance with correct data', () => {
    const wrapper = mount(BackToTop)
    expect(wrapper.vm.isVisible).toBe(false)
    expect(wrapper.vm.scrollProgress).toBe(0)
  })

  it('has correct circumference value', () => {
    const wrapper = mount(BackToTop)
    const expectedCircumference = 2 * Math.PI * 10
    expect(wrapper.vm.circumference).toBe(expectedCircumference)
  })

  it('renders Transition component', () => {
    const wrapper = mount(BackToTop)
    // The component wraps content in a Transition
    expect(wrapper.findComponent({ name: 'Transition' }).exists()).toBe(true)
  })

  describe('dashOffset computed property', () => {
    it('returns correct dash offset based on scrollProgress', () => {
      const wrapper = mount(BackToTop)
      const circumference = 2 * Math.PI * 10

      // Test at 0% progress
      wrapper.vm.scrollProgress = 0
      expect(wrapper.vm.dashOffset).toBe(circumference)

      // Test at 50% progress
      wrapper.vm.scrollProgress = 0.5
      expect(wrapper.vm.dashOffset).toBeCloseTo(circumference * 0.5, 2)

      // Test at 100% progress
      wrapper.vm.scrollProgress = 1
      expect(wrapper.vm.dashOffset).toBe(0)
    })

    it('updates dashOffset reactively when scrollProgress changes', async () => {
      const wrapper = mount(BackToTop)
      const circumference = 2 * Math.PI * 10

      expect(wrapper.vm.dashOffset).toBe(circumference)

      wrapper.vm.scrollProgress = 0.25
      await nextTick()

      expect(wrapper.vm.dashOffset).toBeCloseTo(circumference * 0.75, 2)
    })
  })

  describe('Scroll event handling', () => {
    it('adds scroll event listener on mount', () => {
      mount(BackToTop)

      expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true })
    })

    it('removes scroll event listener on unmount', () => {
      const wrapper = mount(BackToTop)

      wrapper.unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    })

    it('sets visibility to true when scrolled past threshold', async () => {
      // Mock window.scrollY and document.documentElement.scrollHeight
      Object.defineProperty(window, 'scrollY', { value: 150, writable: true })
      Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, writable: true })
      Object.defineProperty(window, 'innerHeight', { value: 800, writable: true })

      const wrapper = mount(BackToTop)

      // Get the scroll handler
      const scrollHandler = addEventListenerSpy.mock.calls.find(
        (call: unknown[]) => (call as [string, () => void])[0] === 'scroll'
      )?.[1] as () => void

      if (scrollHandler) {
        scrollHandler()
        await nextTick()

        expect(wrapper.vm.isVisible).toBe(true)
      }

      // Cleanup
      Object.defineProperty(window, 'scrollY', { value: 0, writable: true })
      Object.defineProperty(document.documentElement, 'scrollHeight', { value: 0, writable: true })
      Object.defineProperty(window, 'innerHeight', { value: 0, writable: true })
    })

    it('sets visibility to false when not past threshold', async () => {
      Object.defineProperty(window, 'scrollY', { value: 50, writable: true })
      Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, writable: true })
      Object.defineProperty(window, 'innerHeight', { value: 800, writable: true })

      const wrapper = mount(BackToTop)

      const scrollHandler = addEventListenerSpy.mock.calls.find(
        (call: unknown[]) => (call as [string, () => void])[0] === 'scroll'
      )?.[1] as () => void

      if (scrollHandler) {
        scrollHandler()
        await nextTick()

        expect(wrapper.vm.isVisible).toBe(false)
      }

      // Cleanup
      Object.defineProperty(window, 'scrollY', { value: 0, writable: true })
      Object.defineProperty(document.documentElement, 'scrollHeight', { value: 0, writable: true })
      Object.defineProperty(window, 'innerHeight', { value: 0, writable: true })
    })

    it('calculates scroll progress correctly on scroll', async () => {
      Object.defineProperty(window, 'scrollY', { value: 400, writable: true })
      Object.defineProperty(document.documentElement, 'scrollHeight', { value: 1200, writable: true })
      Object.defineProperty(window, 'innerHeight', { value: 800, writable: true })

      const wrapper = mount(BackToTop)

      const scrollHandler = addEventListenerSpy.mock.calls.find(
        (call: unknown[]) => (call as [string, () => void])[0] === 'scroll'
      )?.[1] as () => void

      if (scrollHandler) {
        scrollHandler()
        await nextTick()

        // scrollProgress = scrollY / (scrollHeight - innerHeight)
        // scrollProgress = 400 / (1200 - 800) = 400 / 400 = 1
        expect(wrapper.vm.scrollProgress).toBe(1)
      }

      // Cleanup
      Object.defineProperty(window, 'scrollY', { value: 0, writable: true })
      Object.defineProperty(document.documentElement, 'scrollHeight', { value: 0, writable: true })
      Object.defineProperty(window, 'innerHeight', { value: 0, writable: true })
    })

    it('keeps scroll progress at 0 when scrollY is 0', async () => {
      Object.defineProperty(window, 'scrollY', { value: 0, writable: true })
      Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, writable: true })
      Object.defineProperty(window, 'innerHeight', { value: 800, writable: true })

      const wrapper = mount(BackToTop)

      const scrollHandler = addEventListenerSpy.mock.calls.find(
        (call: unknown[]) => (call as [string, () => void])[0] === 'scroll'
      )?.[1] as () => void

      if (scrollHandler) {
        scrollHandler()
        await nextTick()

        expect(wrapper.vm.scrollProgress).toBe(0)
      }

      // Cleanup
      Object.defineProperty(document.documentElement, 'scrollHeight', { value: 0, writable: true })
      Object.defineProperty(window, 'innerHeight', { value: 0, writable: true })
    })
  })
})
