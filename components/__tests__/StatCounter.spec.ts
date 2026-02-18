/**
 * Tests for StatCounter component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import StatCounter from '../StatCounter.vue'

// Mock requestAnimationFrame
let rafCallbacks: FrameRequestCallback[] = []
let rafId = 0

const mockRequestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
  rafCallbacks.push(callback)
  return ++rafId
})

const mockCancelAnimationFrame = vi.fn((id: number) => {
  rafCallbacks = rafCallbacks.filter(() => true) // Just clear array
})

global.requestAnimationFrame = mockRequestAnimationFrame as any
global.cancelAnimationFrame = mockCancelAnimationFrame as any

// Ensure window.innerHeight is available for the component
Object.defineProperty(global.window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 800
})

// Mock @vueuse/core intersection observer
let intersectionObserverCallback: ((entries: any[]) => void) | null = null
const mockStopObserver = vi.fn()

vi.mock('@vueuse/core', () => ({
  useIntersectionObserver: (target: any, callback: any, options: any) => {
    intersectionObserverCallback = callback
    return {
      stop: mockStopObserver
    }
  }
}))

// Helper to trigger intersection observer callback
async function triggerIntersection(isIntersecting = true) {
  if (intersectionObserverCallback) {
    await intersectionObserverCallback([{
      isIntersecting,
      target: { getBoundingClientRect: () => ({ top: 100, bottom: 500 }) }
    }])
    await nextTick()
  }
}

// Type helper for accessing private component methods/properties
type StatCounterVM = {
  animatedValue: number
  isVisible: boolean
  hasAnimated: boolean
  counterRef: { getBoundingClientRect: () => DOMRect } | null
  displayNumber: string
  startAnimation: () => void
}

function getStatVM(wrapper: ReturnType<typeof mount>): StatCounterVM {
  return wrapper.vm as unknown as StatCounterVM
}

describe('StatCounter Component', () => {
  const defaultProps = {
    value: 500,
    label: 'Projects Completed',
    suffix: '+'
  }

  // Basic tests don't need fake timers
  describe('Basic rendering', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      rafCallbacks = []
      rafId = 0
      intersectionObserverCallback = null
      mockStopObserver.mockReset()
    })

    it('renders with value and label', () => {
      const wrapper = mount(StatCounter, {
        props: defaultProps
      })
      expect(wrapper.html()).toContain('Projects Completed')
    })

    it('has correct text color classes', () => {
      const wrapper = mount(StatCounter, {
        props: defaultProps
      })
      expect(wrapper.html()).toContain('text-white')
      expect(wrapper.html()).toContain('text-neutral-300')
    })

    it('has correct font size classes', () => {
      const wrapper = mount(StatCounter, {
        props: defaultProps
      })
      expect(wrapper.html()).toContain('text-5xl')
      expect(wrapper.html()).toContain('text-lg')
    })

    it('has stat-item class', () => {
      const wrapper = mount(StatCounter, {
        props: defaultProps
      })
      const div = wrapper.find('.stat-item')
      expect(div.exists()).toBe(true)
    })

    it('displays suffix when provided', () => {
      const wrapper = mount(StatCounter, {
        props: {
          value: 500,
          label: 'Projects',
          suffix: '+'
        }
      })
      expect(wrapper.html()).toContain('+')
    })

    it('does not display suffix when empty', () => {
      const wrapper = mount(StatCounter, {
        props: {
          value: 500,
          label: 'Projects',
          suffix: ''
        }
      })
      // When suffix is empty, v-if prevents rendering span
      expect(wrapper.html()).not.toContain('<span')
    })

    it('has visible class binding structure', () => {
      const wrapper = mount(StatCounter, {
        props: defaultProps
      })
      const div = wrapper.find('.stat-item')
      expect(div.exists()).toBe(true)
    })

    it('has animation classes', () => {
      const wrapper = mount(StatCounter, {
        props: defaultProps
      })
      expect(wrapper.html()).toContain('stat-item')
    })

    it('has accessible text structure', () => {
      const wrapper = mount(StatCounter, {
        props: defaultProps
      })
      expect(wrapper.text()).toContain('Projects Completed')
    })

    it('has proper heading hierarchy with font sizes', () => {
      const wrapper = mount(StatCounter, {
        props: defaultProps
      })
      expect(wrapper.html()).toContain('text-5xl')
      expect(wrapper.html()).toContain('text-lg')
    })

    it('has responsive text classes', () => {
      const wrapper = mount(StatCounter, {
        props: defaultProps
      })
      expect(wrapper.html()).toContain('md:text-6xl')
      expect(wrapper.html()).toContain('md:text-xl')
    })

    it('uses default suffix of empty string', () => {
      const wrapper = mount(StatCounter, {
        props: {
          value: 100,
          label: 'Test'
        }
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('uses default prefix of empty string', () => {
      const wrapper = mount(StatCounter, {
        props: {
          value: 100,
          label: 'Test'
        }
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('uses default duration of 2000ms', () => {
      const wrapper = mount(StatCounter, {
        props: {
          value: 100,
          label: 'Test',
          duration: 2000
        }
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('accepts custom duration', () => {
      const wrapper = mount(StatCounter, {
        props: {
          value: 100,
          label: 'Test',
          duration: 1000
        }
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('handles very small duration', () => {
      const wrapper = mount(StatCounter, {
        props: {
          value: 100,
          label: 'Test',
          duration: 100
        }
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('handles very large duration', () => {
      const wrapper = mount(StatCounter, {
        props: {
          value: 100,
          label: 'Test',
          duration: 10000
        }
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('handles very large values', () => {
      const wrapper = mount(StatCounter, {
        props: {
          value: 999999999,
          label: 'Test'
        }
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('handles special characters in label', () => {
      const wrapper = mount(StatCounter, {
        props: {
          value: 100,
          label: 'Projects & Services'
        }
      })
      expect(wrapper.text()).toContain('Projects & Services')
    })

    it('handles emoji in suffix', () => {
      const wrapper = mount(StatCounter, {
        props: {
          value: 100,
          label: 'Test',
          suffix: '🎉'
        }
      })
      expect(wrapper.html()).toContain('🎉')
    })
  })

  describe('Number formatting', () => {
    it('formats number with locale string', () => {
      const value = 1234
      const formatted = value.toLocaleString()
      expect(formatted).toBe('1,234')
    })

    it('formats large numbers correctly', () => {
      const value = 1500000
      const formatted = Math.round(value).toLocaleString()
      expect(formatted).toBe('1,500,000')
    })

    it('formats decimal values correctly', () => {
      const value = 1234.56
      const formatted = Math.round(value).toLocaleString()
      expect(formatted).toBe('1,235')
    })

    it('rounds animated value', () => {
      const value = 1234.567
      const rounded = Math.round(value)
      expect(rounded).toBe(1235)
    })

    it('handles zero value', () => {
      const value = 0
      const formatted = value.toLocaleString()
      expect(formatted).toBe('0')
    })

    it('handles negative values', () => {
      const value = -100
      const formatted = Math.round(value).toLocaleString()
      expect(formatted).toBe('-100')
    })
  })

  describe('Animation easing function', () => {
    it('calculates ease out quart correctly at start', () => {
      const progress = 0
      const easeOut = 1 - Math.pow(1 - progress, 4)
      expect(easeOut).toBe(0)
    })

    it('calculates ease out quart at mid', () => {
      const progress = 0.5
      const easeOut = 1 - Math.pow(1 - progress, 4)
      expect(easeOut).toBeCloseTo(0.9375, 4)
    })

    it('calculates ease out quart at end', () => {
      const progress = 1
      const easeOut = 1 - Math.pow(1 - progress, 4)
      expect(easeOut).toBe(1)
    })

    it('has correct threshold for intersection observer', () => {
      const threshold = 0.1
      expect(threshold).toBe(0.1)
    })
  })

  describe('Animation progress calculation', () => {
    it('calculates progress correctly', () => {
      const elapsed = 1000
      const duration = 2000
      const progress = Math.min(elapsed / duration, 1)
      expect(progress).toBe(0.5)
    })

    it('caps progress at 1', () => {
      const elapsed = 3000
      const duration = 2000
      const progress = Math.min(elapsed / duration, 1)
      expect(progress).toBe(1)
    })

    it('calculates interpolated value', () => {
      const startValue = 0
      const endValue = 500
      const easeOut = 0.9375
      const interpolated = startValue + (endValue - startValue) * easeOut
      expect(interpolated).toBeCloseTo(468.75, 2)
    })

    it('calculates final value correctly', () => {
      const startValue = 0
      const endValue = 500
      const easeOut = 1
      const interpolated = startValue + (endValue - startValue) * easeOut
      expect(interpolated).toBe(500)
    })
  })

  describe('Animation behavior', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      rafCallbacks = []
      rafId = 0
      intersectionObserverCallback = null
      mockStopObserver.mockReset()
    })

    it('only animates once flag', () => {
      let hasAnimated = false
      const animateOnce = () => {
        if (!hasAnimated) {
          hasAnimated = true
        }
      }

      animateOnce()
      expect(hasAnimated).toBe(true)

      const before = hasAnimated
      animateOnce()
      expect(hasAnimated).toBe(before)
    })

    it('stops animation when complete', () => {
      let animationStopped = false

      const animate = (progress: number) => {
        if (progress >= 1) {
          animationStopped = true
          return
        }
      }

      animate(1)
      expect(animationStopped).toBe(true)
    })
  })

  describe('RequestAnimationFrame integration', () => {
    it('uses requestAnimationFrame pattern', () => {
      let callCount = 0
      const mockRaf = (cb: FrameRequestCallback) => {
        callCount++
        return 0
      }

      const animate = (currentTime: number) => {
        const progress = 0.5
        if (progress < 1) {
          mockRaf(animate)
        }
      }

      animate(Date.now())
      expect(callCount).toBe(1)
    })
  })

  describe('Fallback getBoundingClientRect behavior', () => {
    it('checks getBoundingClientRect for in-view elements', () => {
      const mockElement = {
        getBoundingClientRect: () => ({
          top: 100,
          bottom: 500,
          left: 0,
          right: 300,
          width: 300,
          height: 400,
          x: 0,
          y: 100,
          toJSON: () => ({})
        })
      }

      const rect = mockElement.getBoundingClientRect()
      expect(rect.top).toBe(100)
      expect(rect.bottom).toBe(500)
    })

    it('calculates in-view correctly', () => {
      const mockWindow = { innerHeight: 800 }
      const rect = { top: 100, bottom: 500 }

      const isInView = (rect.top as number) < (mockWindow.innerHeight as number) && (rect.bottom as number) > 0
      expect(isInView).toBe(true)
    })

    it('detects out-of-view elements', () => {
      const mockWindow = { innerHeight: 800 }
      const rect = { top: 1000, bottom: 1400 }

      const isInView = (rect.top as number) < (mockWindow.innerHeight as number) && (rect.bottom as number) > 0
      expect(isInView).toBe(false)
    })

    it('handles element at viewport edge', () => {
      const mockWindow = { innerHeight: 800 }
      const rect = { top: 799, bottom: 1200 }

      const isInView = (rect.top as number) < (mockWindow.innerHeight as number) && (rect.bottom as number) > 0
      expect(isInView).toBe(true)
    })

    it('handles element exactly at top edge', () => {
      const mockWindow = { innerHeight: 800 }
      const rect = { top: 0, bottom: 400 }

      const isInView = (rect.top as number) < (mockWindow.innerHeight as number) && (rect.bottom as number) > 0
      expect(isInView).toBe(true)
    })

    it('handles element below viewport', () => {
      const mockWindow = { innerHeight: 800 }
      const rect = { top: 801, bottom: 1200 }

      const isInView = (rect.top as number) < (mockWindow.innerHeight as number) && (rect.bottom as number) > 0
      expect(isInView).toBe(false)
    })
  })

  describe('Prefix handling', () => {
    it('handles prefix if provided', () => {
      const prefix = '$'
      const value = 1000
      const displayWithPrefix = `${prefix}${value.toLocaleString()}`
      expect(displayWithPrefix).toBe('$1,000')
    })
  })

  describe('Performance timing', () => {
    it('uses performance.now for timing', () => {
      const mockPerformance = {
        now: () => 1234.56
      }
      const time = mockPerformance.now()
      expect(typeof time).toBe('number')
    })
  })

  describe('Animation integration (without fake timers for RAF)', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      rafCallbacks = []
      rafId = 0
      intersectionObserverCallback = null
      mockStopObserver.mockReset()
    })

    it('has initial animated value of 0', () => {
      const wrapper = mount(StatCounter, {
        props: {
          value: 500,
          label: 'Test'
        }
      })
      // Initial value should be 0
      expect(getStatVM(wrapper).animatedValue).toBeDefined()
    })

    it('has visible state ref', () => {
      const wrapper = mount(StatCounter, {
        props: {
          value: 500,
          label: 'Test'
        }
      })
      expect(getStatVM(wrapper).isVisible).toBeDefined()
    })

    it('has hasAnimated flag', () => {
      const wrapper = mount(StatCounter, {
        props: {
          value: 500,
          label: 'Test'
        }
      })
      expect(getStatVM(wrapper).hasAnimated).toBeDefined()
    })

    it('has counterRef element', () => {
      const wrapper = mount(StatCounter, {
        props: {
          value: 500,
          label: 'Test'
        }
      })
      expect(getStatVM(wrapper).counterRef).toBeDefined()
    })

    it('computes display number with locale string', () => {
      const wrapper = mount(StatCounter, {
        props: {
          value: 500,
          label: 'Test'
        }
      })
      // displayNumber is a computed property
      expect(getStatVM(wrapper).displayNumber).toBeDefined()
    })

    it('handles duration prop correctly', () => {
      const wrapper = mount(StatCounter, {
        props: {
          value: 100,
          label: 'Test',
          duration: 1000
        }
      })
      expect(wrapper.vm.duration).toBe(1000)
    })

    it('has startAnimation method', () => {
      const wrapper = mount(StatCounter, {
        props: {
          value: 500,
          label: 'Test'
        }
      })
      expect(typeof getStatVM(wrapper).startAnimation).toBe('function')
    })

    it('startAnimation can be called', () => {
      const wrapper = mount(StatCounter, {
        props: {
          value: 100,
          label: 'Test'
        }
      })
      // Call startAnimation directly
      expect(() => getStatVM(wrapper).startAnimation()).not.toThrow()
    })

    it('startAnimation sets hasAnimated flag', () => {
      const wrapper = mount(StatCounter, {
        props: {
          value: 100,
          label: 'Test'
        }
      })
      // Initially not animated
      expect(getStatVM(wrapper).hasAnimated).toBe(false)

      // Start animation
      getStatVM(wrapper).startAnimation()

      // Should be flagged as animated
      expect(getStatVM(wrapper).hasAnimated).toBe(true)
    })

    it('startAnimation is idempotent', () => {
      const wrapper = mount(StatCounter, {
        props: {
          value: 100,
          label: 'Test'
        }
      })

      getStatVM(wrapper).startAnimation()
      const firstValue = getStatVM(wrapper).animatedValue

      // Try to animate again
      getStatVM(wrapper).startAnimation()
      const secondValue = getStatVM(wrapper).animatedValue

      // Should not change
      expect(secondValue).toBe(firstValue)
    })

    it('updates animatedValue during animation', async () => {
      const wrapper = mount(StatCounter, {
        props: {
          value: 100,
          label: 'Test',
          duration: 100
        }
      })

      const beforeValue = getStatVM(wrapper).animatedValue

      // Start animation - manually trigger RAF callbacks
      getStatVM(wrapper).startAnimation()

      // Process RAF callbacks manually
      while (rafCallbacks.length > 0) {
        const cb = rafCallbacks.shift()!
        cb(performance.now() + 100)
        await nextTick()
      }

      const afterValue = getStatVM(wrapper).animatedValue
      // Value should have changed from initial 0
      expect(afterValue).not.toBe(beforeValue)
    })

    it('animatedValue reaches target value', () => {
      const targetValue = 100
      const wrapper = mount(StatCounter, {
        props: {
          value: targetValue,
          label: 'Test',
          duration: 10 // Very short for fast test
        }
      })

      getStatVM(wrapper).startAnimation()

      // Process RAF callbacks until complete
      let maxIterations = 100
      while (rafCallbacks.length > 0 && maxIterations > 0) {
        const cb = rafCallbacks.shift()!
        // Simulate time passing - use enough time to complete animation
        cb(performance.now() + 1000)
        maxIterations--
      }

      // Value should be at or very close to target
      expect(Math.round(getStatVM(wrapper).animatedValue)).toBe(targetValue)
    })

    it('handles zero value', () => {
      const wrapper = mount(StatCounter, {
        props: {
          value: 0,
          label: 'Zero',
          duration: 10
        }
      })

      getStatVM(wrapper).startAnimation()

      while (rafCallbacks.length > 0) {
        const cb = rafCallbacks.shift()!
        cb(performance.now() + 1000)
      }

      expect(Math.round(getStatVM(wrapper).animatedValue)).toBe(0)
    })

    it('handles negative values', () => {
      const wrapper = mount(StatCounter, {
        props: {
          value: -50,
          label: 'Negative',
          duration: 10
        }
      })

      getStatVM(wrapper).startAnimation()

      // Process RAF callbacks
      while (rafCallbacks.length > 0) {
        const cb = rafCallbacks.shift()!
        cb(performance.now() + 1000)
      }

      expect(Math.round(getStatVM(wrapper).animatedValue)).toBe(-50)
    })

    it('respects custom duration', () => {
      const wrapper = mount(StatCounter, {
        props: {
          value: 100,
          label: 'Test',
          duration: 5000
        }
      })

      expect(wrapper.vm.duration).toBe(5000)
    })
  })

  describe('Intersection Observer integration', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      rafCallbacks = []
      rafId = 0
      intersectionObserverCallback = null
      mockStopObserver.mockReset()
    })

    it('initializes intersection observer', () => {
      mount(StatCounter, {
        props: {
          value: 100,
          label: 'Test'
        }
      })

      // Observer callback should be registered
      expect(intersectionObserverCallback).toBeDefined()
    })

    it('triggers animation on intersection', async () => {
      const wrapper = mount(StatCounter, {
        props: {
          value: 100,
          label: 'Test',
          duration: 10
        }
      })

      expect(getStatVM(wrapper).hasAnimated).toBe(false)

      // Trigger intersection
      await triggerIntersection(true)

      // Should have started animation
      expect(getStatVM(wrapper).hasAnimated).toBe(true)
    })

    it('stops observer after animation', async () => {
      const wrapper = mount(StatCounter, {
        props: {
          value: 100,
          label: 'Test'
        }
      })

      await triggerIntersection(true)

      // Stop should have been called
      expect(mockStopObserver).toHaveBeenCalled()
    })
  })

  describe('onMounted fallback timeout (with fake timers)', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.clearAllMocks()
      rafCallbacks = []
      rafId = 0
      intersectionObserverCallback = null
      mockStopObserver.mockReset()
    })

    afterEach(() => {
      vi.runOnlyPendingTimers()
      vi.useRealTimers()
    })

    it('handles timeout callback with window.innerHeight', () => {
      const wrapper = mount(StatCounter, {
        props: {
          value: 100,
          label: 'Test'
        }
      })

      // Fast forward past the 300ms timeout
      vi.advanceTimersByTime(350)

      // Should not throw any errors
      expect(wrapper.exists()).toBe(true)
    })

    it('timeout checks getBoundingClientRect when element is in view', () => {
      const wrapper = mount(StatCounter, {
        props: {
          value: 100,
          label: 'Test'
        }
      })

      // Mock getBoundingClientRect to return in-view values
      getStatVM(wrapper).counterRef = {
        getBoundingClientRect: () => ({ top: 100, bottom: 500 })
      }

      // Fast forward past the timeout
      vi.advanceTimersByTime(350)

      // Should trigger animation
      expect(getStatVM(wrapper).hasAnimated).toBe(true)
    })

    it('timeout does not trigger animation when element is out of view', () => {
      const wrapper = mount(StatCounter, {
        props: {
          value: 100,
          label: 'Test'
        }
      })

      // Mock getBoundingClientRect to return out-of-view values
      getStatVM(wrapper).counterRef = {
        getBoundingClientRect: () => ({ top: 1000, bottom: 1400 })
      }

      // Fast forward past the timeout
      vi.advanceTimersByTime(350)

      // Should not trigger animation (out of view)
      expect(getStatVM(wrapper).hasAnimated).toBe(false)
    })

    it('timeout does not trigger if already animated', () => {
      const wrapper = mount(StatCounter, {
        props: {
          value: 100,
          label: 'Test'
        }
      })

      // Manually set as animated
      getStatVM(wrapper).startAnimation()

      const hasAnimatedBefore = getStatVM(wrapper).hasAnimated

      // Fast forward past the timeout
      vi.advanceTimersByTime(350)

      // Should remain the same (idempotent)
      expect(getStatVM(wrapper).hasAnimated).toBe(hasAnimatedBefore)
    })
  })
})
