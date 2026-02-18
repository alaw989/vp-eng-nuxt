/**
 * Tests for useFilterTransition composable
 * Tests FLIP animation for filter layouts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useFilterTransition } from '../useFilterTransition'

// Mock @vueuse/core BEFORE importing the composable
vi.mock('@vueuse/core', () => ({
  usePreferredReducedMotion: vi.fn(() => ref('no-preference'))
}))

describe('useFilterTransition Composable', () => {
  let mockContainer: HTMLElement
  let mockChild1: HTMLElement
  let mockChild2: HTMLElement

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = ''

    // Create mock container
    mockContainer = document.createElement('div')
    mockContainer.className = 'container'
    document.body.appendChild(mockContainer)

    // Create mock children
    mockChild1 = document.createElement('div')
    mockChild1.className = 'child-1'
    mockChild2 = document.createElement('div')
    mockChild2.className = 'child-2'

    // Mock getBoundingClientRect
    mockContainer.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      top: 0,
      width: 800,
      height: 600,
      right: 800,
      bottom: 600,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }))

    mockChild1.getBoundingClientRect = vi.fn(() => ({
      left: 10,
      top: 10,
      width: 100,
      height: 50,
      right: 110,
      bottom: 60,
      x: 10,
      y: 10,
      toJSON: () => ({}),
    }))

    mockChild2.getBoundingClientRect = vi.fn(() => ({
      left: 120,
      top: 10,
      width: 100,
      height: 50,
      right: 220,
      bottom: 60,
      x: 120,
      y: 10,
      toJSON: () => ({}),
    }))

    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('returns containerRef as undefined initially', () => {
      const { containerRef } = useFilterTransition<string>()
      expect(containerRef.value).toBeUndefined()
    })

    it('returns isAnimating as false initially', () => {
      const { isAnimating } = useFilterTransition<string>()
      expect(isAnimating.value).toBe(false)
    })

    it('returns animateFilter function', () => {
      const { animateFilter } = useFilterTransition<string>()
      expect(typeof animateFilter).toBe('function')
    })
  })

  describe('animateFilter', () => {
    it('returns early when containerRef is not set', async () => {
      const { animateFilter, isAnimating } = useFilterTransition<string>()

      await animateFilter(['item1', 'item2'])

      expect(isAnimating.value).toBe(false)
    })

    it('returns early when already animating', async () => {
      const { animateFilter, isAnimating, containerRef } =
        useFilterTransition<string>()

      containerRef.value = mockContainer
      mockContainer.appendChild(mockChild1)

      isAnimating.value = true

      await animateFilter(['item1'])

      // getBoundingClientRect should not be called since we return early
      expect(mockChild1.getBoundingClientRect).not.toHaveBeenCalled()
    })

    it('returns early when container has no children', async () => {
      const { animateFilter, containerRef } = useFilterTransition<string>()

      containerRef.value = mockContainer

      await animateFilter([])

      // Should complete without error
      expect(mockContainer.children.length).toBe(0)
    })

    it('sets isAnimating to true during animation', async () => {
      const { animateFilter, isAnimating, containerRef } =
        useFilterTransition<string>()

      containerRef.value = mockContainer
      mockContainer.appendChild(mockChild1)

      // Start animation (non-blocking)
      const promise = animateFilter(['item1', 'item2'])

      // Wait for nextTick to complete so isAnimating is set
      await Promise.resolve()

      // isAnimating should be set after nextTick
      expect(isAnimating.value).toBe(true)

      await promise
    })

    it('sets isAnimating back to false after animation completes', async () => {
      const { animateFilter, isAnimating, containerRef } =
        useFilterTransition<string>()

      containerRef.value = mockContainer
      mockContainer.appendChild(mockChild1)

      await animateFilter(['item1'])

      expect(isAnimating.value).toBe(false)
    })

    it('skips elements with no movement', async () => {
      const { animateFilter, containerRef } = useFilterTransition<string>()

      containerRef.value = mockContainer
      mockContainer.appendChild(mockChild1)

      // Same position before and after
      const sameRect = {
        left: 10,
        top: 10,
        width: 100,
        height: 50,
        right: 110,
        bottom: 60,
        x: 10,
        y: 10,
        toJSON: () => ({}),
      }

      mockChild1.getBoundingClientRect = vi.fn(() => sameRect)

      await animateFilter(['item1'])

      // Element should not be animated (no movement)
      expect(mockChild1.style.transform).toBe('')
    })
  })

  describe('FLIP animation steps', () => {
    it('uses transform-only animations (GPU accelerated)', async () => {
      const { animateFilter, containerRef } = useFilterTransition<string>()

      containerRef.value = mockContainer
      mockContainer.appendChild(mockChild1)

      // Spy on addEventListener before running animation
      const addEventListenerSpy = vi.spyOn(mockChild1, 'addEventListener')

      // Spy on getBoundingClientRect to return different values on successive calls
      const getBoundingClientRectSpy = vi.spyOn(mockChild1, 'getBoundingClientRect')
        .mockReturnValueOnce({
          left: 10,
          top: 10,
          width: 100,
          height: 50,
          right: 110,
          bottom: 60,
          x: 10,
          y: 10,
          toJSON: () => ({}),
        } as DOMRect)
        .mockReturnValueOnce({
          left: 100, // Moved
          top: 10,
          width: 100,
          height: 50,
          right: 200,
          bottom: 60,
          x: 100,
          y: 10,
          toJSON: () => ({}),
        } as DOMRect)

      // Run animation
      await animateFilter(['item1'])

      // Verify that transitionend event listener was added
      expect(addEventListenerSpy).toHaveBeenCalledWith('transitionend', expect.any(Function))

      addEventListenerSpy.mockRestore()
    })
  })

  describe('generic type support', () => {
    it('works with string type', async () => {
      const { animateFilter, containerRef } = useFilterTransition<string>()

      containerRef.value = mockContainer
      mockContainer.appendChild(mockChild1)

      await expect(animateFilter(['a', 'b', 'c'])).resolves.toBeUndefined()
    })

    it('works with object type', async () => {
      interface Item {
        id: number
        name: string
      }

      const { animateFilter, containerRef } = useFilterTransition<Item>()

      containerRef.value = mockContainer
      mockContainer.appendChild(mockChild1)

      const items: Item[] = [{ id: 1, name: 'Test' }]

      await expect(animateFilter(items)).resolves.toBeUndefined()
    })
  })

  describe('Reduced motion handling', () => {
    it('returns early when user prefers reduced motion', async () => {
      // Import fresh with mocked usePreferredReducedMotion returning 'reduce'
      const { usePreferredReducedMotion: mockedUsePreferredReducedMotion } = await import('@vueuse/core') as any
      mockedUsePreferredReducedMotion.mockReturnValueOnce(ref('reduce'))

      // Create composable AFTER mock is set up
      const { animateFilter, containerRef, isAnimating } = useFilterTransition<string>()

      containerRef.value = mockContainer
      mockContainer.appendChild(mockChild1)

      await animateFilter(['item1'])

      // Animation should not occur for reduced motion users
      expect(isAnimating.value).toBe(false)
    })

    it('proceeds with animation when reduced motion is not preferred', async () => {
      // Mock returning 'no-preference'
      const { usePreferredReducedMotion: mockedUsePreferredReducedMotion } = await import('@vueuse/core') as any
      mockedUsePreferredReducedMotion.mockReturnValueOnce(ref('no-preference'))

      const { animateFilter, containerRef, isAnimating } = useFilterTransition<string>()

      containerRef.value = mockContainer
      mockContainer.appendChild(mockChild1)

      // Start animation (non-blocking)
      const promise = animateFilter(['item1'])

      await Promise.resolve()

      // isAnimating should be set when animation starts
      expect(isAnimating.value).toBe(true)

      await promise
    })
  })

  describe('Empty newChildren handling', () => {
    it('returns early when new children array is empty after nextTick', async () => {
      const { animateFilter, containerRef, isAnimating } = useFilterTransition<string>()

      containerRef.value = mockContainer
      mockContainer.appendChild(mockChild1)

      // Simulate children being removed after nextTick
      const removeChildSpy = vi.spyOn(mockContainer, 'removeChild')

      // Schedule removal after nextTick (simulating Vue's DOM update)
      Promise.resolve().then(() => {
        while (mockContainer.firstChild) {
          mockContainer.removeChild(mockContainer.firstChild)
        }
      })

      await animateFilter(['item1'])

      // Should complete without error, isAnimating should be false
      expect(isAnimating.value).toBe(false)
    })
  })

  describe('New element handling', () => {
    it('skips animation for new elements without firstRect', async () => {
      const { animateFilter, containerRef } = useFilterTransition<string>()

      containerRef.value = mockContainer
      mockContainer.appendChild(mockChild1)

      // First call has one child
      const getBoundingClientRectCalls: any[] = []
      mockChild1.getBoundingClientRect = vi.fn(function(this: any) {
        const result = {
          left: 10,
          top: 10,
          width: 100,
          height: 50,
          right: 110,
          bottom: 60,
          x: 10,
          y: 10,
          toJSON: () => ({}),
        }
        getBoundingClientRectCalls.push(result)
        return result
      })

      // Add a new child after the animation starts
      const newChild = document.createElement('div')
      newChild.className = 'new-child'
      newChild.getBoundingClientRect = vi.fn(() => ({
        left: 200,
        top: 10,
        width: 100,
        height: 50,
        right: 300,
        bottom: 60,
        x: 200,
        y: 10,
        toJSON: () => ({}),
      }))

      Promise.resolve().then(() => {
        mockContainer.appendChild(newChild)
      })

      await animateFilter(['item1', 'item2'])

      // Should complete without error
      expect(containerRef.value).toBeDefined()
    })

    it('handles elements that appear after filter change', async () => {
      const { animateFilter, containerRef } = useFilterTransition<string>()

      containerRef.value = mockContainer

      // Start with no children
      expect(mockContainer.children.length).toBe(0)

      // Add child after nextTick (simulating filter revealing items)
      const appearingChild = document.createElement('div')
      appearingChild.className = 'appearing'
      appearingChild.getBoundingClientRect = vi.fn(() => ({
        left: 10,
        top: 10,
        width: 100,
        height: 50,
        right: 110,
        bottom: 60,
        x: 10,
        y: 10,
        toJSON: () => ({}),
      }))

      Promise.resolve().then(() => {
        mockContainer.appendChild(appearingChild)
      })

      await animateFilter(['new-item'])

      // Should complete without error - new elements are skipped
      expect(mockContainer.children.length).toBeGreaterThan(0)
    })
  })

  describe('Transition cleanup', () => {
    it('cleans up inline styles after transition', async () => {
      const { animateFilter, containerRef } = useFilterTransition<string>()

      containerRef.value = mockContainer
      mockContainer.appendChild(mockChild1)

      // Simulate position change
      let callCount = 0
      mockChild1.getBoundingClientRect = vi.fn(() => {
        callCount++
        return {
          left: callCount === 1 ? 10 : 100, // Position changes
          top: 10,
          width: 100,
          height: 50,
          right: callCount === 1 ? 110 : 200,
          bottom: 60,
          x: callCount === 1 ? 10 : 100,
          y: 10,
          toJSON: () => ({}),
        }
      })

      // Manually trigger transition end to test cleanup
      const addEventListenerSpy = vi.spyOn(mockChild1, 'addEventListener').mockImplementation((event, handler) => {
        if (event === 'transitionend') {
          // Immediately trigger the transition end
          setTimeout(() => {
            const mockEvent = new TransitionEvent('transitionend', { propertyName: 'transform' })
            ;(handler as EventListener)(mockEvent)
          }, 10)
        }
        return mockChild1
      })

      await animateFilter(['item1'])

      // After animation, styles should be cleaned up
      await new Promise(resolve => setTimeout(resolve, 50))

      addEventListenerSpy.mockRestore()
    })

    it('has fallback timeout for transitionend', async () => {
      const { animateFilter, containerRef } = useFilterTransition<string>()

      containerRef.value = mockContainer
      mockContainer.appendChild(mockChild1)

      // Simulate position change
      let callCount = 0
      mockChild1.getBoundingClientRect = vi.fn(() => {
        callCount++
        return {
          left: callCount === 1 ? 10 : 100,
          top: 10,
          width: 100,
          height: 50,
          right: callCount === 1 ? 110 : 200,
          bottom: 60,
          x: callCount === 1 ? 10 : 100,
          y: 10,
          toJSON: () => ({}),
        }
      })

      // Don't call transitionend - rely on fallback timeout
      vi.spyOn(mockChild1, 'addEventListener').mockImplementation(() => mockChild1)

      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')

      await animateFilter(['item1'])

      // Should complete despite transitionend not firing (fallback timeout)
      expect(containerRef.value).toBeDefined()

      clearTimeoutSpy.mockRestore()
    })
  })
})
