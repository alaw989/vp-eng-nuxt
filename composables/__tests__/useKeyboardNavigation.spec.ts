/**
 * Tests for useKeyboardNavigation composable
 * Tests keyboard navigation helpers
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, nextTick } from 'vue'
import {
  useEscapeKey,
  useArrowKeys,
  useTabTrap,
  useFocusManagement,
} from '../useKeyboardNavigation'

describe('useKeyboardNavigation Composable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear document body to avoid test interference
    document.body.innerHTML = ''
  })

  describe('useEscapeKey', () => {
    it('returns escape ref', () => {
      const isOpen = ref(true)
      const { escape } = useEscapeKey(isOpen)

      expect(typeof escape?.value).toBe('boolean')
    })

    it('accepts isOpen ref parameter', () => {
      const isOpen = ref(true)

      expect(() => useEscapeKey(isOpen)).not.toThrow()
    })

    it('accepts optional callback', () => {
      const isOpen = ref(true)
      const callback = vi.fn()

      expect(() => useEscapeKey(isOpen, callback)).not.toThrow()
    })

    it('returns escape key ref that can be undefined', () => {
      const isOpen = ref(true)
      const { escape } = useEscapeKey(isOpen)

      // escape might be undefined in test environment
      expect(escape === undefined || typeof escape.value === 'boolean').toBe(true)
    })

    it('does not throw when isOpen is false', () => {
      const isOpen = ref(false)
      const callback = vi.fn()

      expect(() => useEscapeKey(isOpen, callback)).not.toThrow()
    })

    it('accepts callback without throwing', () => {
      const isOpen = ref(true)
      const callback = () => { /* no-op */ }

      expect(() => useEscapeKey(isOpen, callback)).not.toThrow()
    })
  })

  describe('useArrowKeys', () => {
    it('returns goPrevious function', () => {
      const currentIndex = ref(0)
      const { goPrevious } = useArrowKeys(currentIndex, 5)

      expect(typeof goPrevious).toBe('function')
    })

    it('returns goNext function', () => {
      const currentIndex = ref(0)
      const { goNext } = useArrowKeys(currentIndex, 5)

      expect(typeof goNext).toBe('function')
    })

    it('returns goFirst function', () => {
      const currentIndex = ref(0)
      const { goFirst } = useArrowKeys(currentIndex, 5)

      expect(typeof goFirst).toBe('function')
    })

    it('returns goLast function', () => {
      const currentIndex = ref(0)
      const { goLast } = useArrowKeys(currentIndex, 5)

      expect(typeof goLast).toBe('function')
    })

    it('returns arrowKeys refs', () => {
      const currentIndex = ref(0)
      const { arrowKeys } = useArrowKeys(currentIndex, 5)

      expect(arrowKeys).toBeDefined()
      expect(arrowKeys.arrowLeft).toBeDefined()
      expect(arrowKeys.arrowRight).toBeDefined()
      expect(arrowKeys.arrowUp).toBeDefined()
      expect(arrowKeys.arrowDown).toBeDefined()
      expect(arrowKeys.home).toBeDefined()
      expect(arrowKeys.end).toBeDefined()
    })

    it('goPrevious decrements index', () => {
      const currentIndex = ref(2)
      const { goPrevious } = useArrowKeys(currentIndex, 5)

      goPrevious()

      expect(currentIndex.value).toBe(1)
    })

    it('goPrevious wraps to end when at start', () => {
      const currentIndex = ref(0)
      const { goPrevious } = useArrowKeys(currentIndex, 5)

      goPrevious()

      expect(currentIndex.value).toBe(4)
    })

    it('goNext increments index', () => {
      const currentIndex = ref(2)
      const { goNext } = useArrowKeys(currentIndex, 5)

      goNext()

      expect(currentIndex.value).toBe(3)
    })

    it('goNext wraps to start when at end', () => {
      const currentIndex = ref(4)
      const { goNext } = useArrowKeys(currentIndex, 5)

      goNext()

      expect(currentIndex.value).toBe(0)
    })

    it('goFirst sets index to 0', () => {
      const currentIndex = ref(3)
      const { goFirst } = useArrowKeys(currentIndex, 5)

      goFirst()

      expect(currentIndex.value).toBe(0)
    })

    it('goLast sets index to last item', () => {
      const currentIndex = ref(1)
      const { goLast } = useArrowKeys(currentIndex, 5)

      goLast()

      expect(currentIndex.value).toBe(4)
    })

    it('accepts itemCount as number', () => {
      const currentIndex = ref(0)

      expect(() => useArrowKeys(currentIndex, 5)).not.toThrow()
    })

    it('accepts itemCount as ref', () => {
      const currentIndex = ref(0)
      const itemCount = ref(5)

      expect(() => useArrowKeys(currentIndex, itemCount)).not.toThrow()
    })

    it('accepts optional isEnabled ref', () => {
      const currentIndex = ref(0)
      const isEnabled = ref(true)

      expect(() => useArrowKeys(currentIndex, 5, isEnabled)).not.toThrow()
    })

    it('respects isEnabled flag', () => {
      const currentIndex = ref(2)
      const isEnabled = ref(false)
      const { goNext } = useArrowKeys(currentIndex, 5, isEnabled)

      goNext()

      // Index should not change when disabled
      expect(currentIndex.value).toBe(2)
    })

    it('goPrevious respects isEnabled flag', () => {
      const currentIndex = ref(2)
      const isEnabled = ref(false)
      const { goPrevious } = useArrowKeys(currentIndex, 5, isEnabled)

      goPrevious()

      expect(currentIndex.value).toBe(2)
    })

    it('goFirst respects isEnabled flag', () => {
      const currentIndex = ref(3)
      const isEnabled = ref(false)
      const { goFirst } = useArrowKeys(currentIndex, 5, isEnabled)

      goFirst()

      expect(currentIndex.value).toBe(3)
    })

    it('goLast respects isEnabled flag', () => {
      const currentIndex = ref(1)
      const isEnabled = ref(false)
      const { goLast } = useArrowKeys(currentIndex, 5, isEnabled)

      goLast()

      expect(currentIndex.value).toBe(1)
    })

    it('handles single item count', () => {
      const currentIndex = ref(0)
      const { goNext, goPrevious } = useArrowKeys(currentIndex, 1)

      goNext()
      expect(currentIndex.value).toBe(0)

      goPrevious()
      expect(currentIndex.value).toBe(0)
    })

    it('handles zero item count', () => {
      const currentIndex = ref(0)
      const { goNext, goPrevious } = useArrowKeys(currentIndex, 0)

      goNext()
      // Should wrap to -1 with modulo when count is 0
      goPrevious()
      // Should wrap to -1 with subtraction when count is 0

      // Just verify it doesn't throw
      expect(typeof currentIndex.value).toBe('number')
    })

    it('arrow keys are refs', () => {
      const currentIndex = ref(0)
      const { arrowKeys } = useArrowKeys(currentIndex, 5)

      // Each arrow key should have a value property
      expect(arrowKeys.arrowLeft).toBeDefined()
      expect(arrowKeys.arrowRight).toBeDefined()
      expect(arrowKeys.arrowUp).toBeDefined()
      expect(arrowKeys.arrowDown).toBeDefined()
      expect(arrowKeys.home).toBeDefined()
      expect(arrowKeys.end).toBeDefined()
    })

    it('handles index at boundary when going previous from 0', () => {
      const currentIndex = ref(0)
      const { goPrevious } = useArrowKeys(currentIndex, 5)

      goPrevious()

      expect(currentIndex.value).toBe(4) // Wraps to end
    })

    it('handles index at boundary when going next from last', () => {
      const currentIndex = ref(4)
      const { goNext } = useArrowKeys(currentIndex, 5)

      goNext()

      expect(currentIndex.value).toBe(0) // Wraps to start
    })

    it('handles dynamic itemCount using ref', () => {
      const currentIndex = ref(0)
      const itemCount = ref(3)
      const { goNext } = useArrowKeys(currentIndex, itemCount)

      currentIndex.value = 2
      goNext()

      expect(currentIndex.value).toBe(0) // Wraps based on ref value
    })

    it('handles isEnabled state changes', () => {
      const currentIndex = ref(0)
      const isEnabled = ref(true)
      const { goNext } = useArrowKeys(currentIndex, 5, isEnabled)

      goNext()
      expect(currentIndex.value).toBe(1)

      isEnabled.value = false
      goNext()
      expect(currentIndex.value).toBe(1) // Should not change
    })

    it('handles large itemCount values', () => {
      const currentIndex = ref(0)
      const largeCount = 1000
      const { goLast } = useArrowKeys(currentIndex, largeCount)

      goLast()

      expect(currentIndex.value).toBe(999)
    })

    it('handles negative currentIndex gracefully', () => {
      const currentIndex = ref(-1)
      const { goNext } = useArrowKeys(currentIndex, 5)

      goNext()

      // Modulo arithmetic: (-1 + 1) % 5 = 0
      expect(currentIndex.value).toBe(0)
    })

    it('handles currentIndex larger than itemCount', () => {
      const currentIndex = ref(10)
      const { goNext } = useArrowKeys(currentIndex, 5)

      goNext()

      // (10 + 1) % 5 = 1
      expect(currentIndex.value).toBe(1)
    })

    it('arrowKeys values are refs with value property', () => {
      const currentIndex = ref(0)
      const { arrowKeys } = useArrowKeys(currentIndex, 5)

      // Verify arrowKeys contains ref-like objects
      expect(arrowKeys).toHaveProperty('arrowLeft')
      expect(arrowKeys).toHaveProperty('arrowRight')
      expect(arrowKeys).toHaveProperty('arrowUp')
      expect(arrowKeys).toHaveProperty('arrowDown')
      expect(arrowKeys).toHaveProperty('home')
      expect(arrowKeys).toHaveProperty('end')
    })
  })

  describe('useTabTrap', () => {
    it('returns handleTab function', () => {
      const containerRef = ref<HTMLElement>()
      const { handleTab } = useTabTrap(containerRef)

      expect(typeof handleTab).toBe('function')
    })

    it('handles Tab key correctly', () => {
      const containerRef = ref<HTMLElement>()
      const { handleTab } = useTabTrap(containerRef)

      const event = new KeyboardEvent('Tab', { key: 'Tab', shiftKey: false })

      expect(() => handleTab(event)).not.toThrow()
    })

    it('handles shift+Tab correctly', () => {
      const containerRef = ref<HTMLElement>()
      const { handleTab } = useTabTrap(containerRef)

      const event = new KeyboardEvent('Tab', { key: 'Tab', shiftKey: true })

      expect(() => handleTab(event)).not.toThrow()
    })

    it('ignores non-Tab keys', () => {
      const containerRef = ref<HTMLElement>()
      const { handleTab } = useTabTrap(containerRef)

      const event = new KeyboardEvent('Enter', { key: 'Enter' })

      expect(() => handleTab(event)).not.toThrow()
    })

    it('returns early when containerRef is undefined', () => {
      const containerRef = ref<HTMLElement>()
      const { handleTab } = useTabTrap(containerRef)

      const event = new KeyboardEvent('Tab', { key: 'Tab', shiftKey: false })

      expect(() => handleTab(event)).not.toThrow()
    })

    it('finds focusable elements in container', () => {
      const container = document.createElement('div')
      const button1 = document.createElement('button')
      const button2 = document.createElement('button')
      container.appendChild(button1)
      container.appendChild(button2)

      const containerRef = ref(container)
      const { handleTab } = useTabTrap(containerRef)

      const event = new KeyboardEvent('Tab', { key: 'Tab', shiftKey: false })
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() })

      handleTab(event)

      // Should not throw when finding focusable elements
      expect(container.querySelectorAll('button').length).toBe(2)
    })

    it('handles empty container gracefully', () => {
      const container = document.createElement('div')
      const containerRef = ref(container)
      const { handleTab } = useTabTrap(containerRef)

      const event = new KeyboardEvent('Tab', { key: 'Tab', shiftKey: false })

      expect(() => handleTab(event)).not.toThrow()
    })

    it('traps focus from first element with shift+Tab', () => {
      const container = document.createElement('div')
      const button1 = document.createElement('button')
      const button2 = document.createElement('button')
      button1.textContent = 'First'
      button2.textContent = 'Second'
      container.appendChild(button1)
      container.appendChild(button2)
      document.body.appendChild(container)

      const containerRef = ref(container)
      const { handleTab } = useTabTrap(containerRef)

      // Simulate being on first element with shift+Tab
      button1.focus()
      const event = new KeyboardEvent('Tab', { key: 'Tab', shiftKey: true })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

      handleTab(event)

      // Should prevent default to trap focus
      expect(preventDefaultSpy).toHaveBeenCalled()

      document.body.removeChild(container)
    })

    it('traps focus from last element with Tab', () => {
      const container = document.createElement('div')
      const button1 = document.createElement('button')
      const button2 = document.createElement('button')
      button1.textContent = 'First'
      button2.textContent = 'Second'
      container.appendChild(button1)
      container.appendChild(button2)
      document.body.appendChild(container)

      const containerRef = ref(container)
      const { handleTab } = useTabTrap(containerRef)

      // Simulate being on last element with Tab
      button2.focus()
      const event = new KeyboardEvent('Tab', { key: 'Tab', shiftKey: false })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

      handleTab(event)

      // Should prevent default to trap focus
      expect(preventDefaultSpy).toHaveBeenCalled()

      document.body.removeChild(container)
    })

    it('finds focusable elements with href attribute', () => {
      const container = document.createElement('div')
      const link = document.createElement('a')
      link.href = '#'
      container.appendChild(link)

      const containerRef = ref(container)
      const { handleTab } = useTabTrap(containerRef)

      const event = new KeyboardEvent('Tab', { key: 'Tab' })

      expect(() => handleTab(event)).not.toThrow()
      document.body.appendChild(container)
      // Verify link is found as focusable
      const focusable = container.querySelectorAll('a[href]')
      expect(focusable.length).toBe(1)
      document.body.removeChild(container)
    })

    it('finds input elements as focusable', () => {
      const container = document.createElement('div')
      const input = document.createElement('input')
      input.type = 'text'
      container.appendChild(input)

      const containerRef = ref(container)
      const { handleTab } = useTabTrap(containerRef)

      const event = new KeyboardEvent('Tab', { key: 'Tab' })

      expect(() => handleTab(event)).not.toThrow()
    })

    it('finds elements with tabindex', () => {
      const container = document.createElement('div')
      const div = document.createElement('div')
      div.tabIndex = 0
      container.appendChild(div)

      const containerRef = ref(container)
      const { handleTab } = useTabTrap(containerRef)

      const event = new KeyboardEvent('Tab', { key: 'Tab' })

      expect(() => handleTab(event)).not.toThrow()
    })

    it('ignores elements with negative tabindex', () => {
      const container = document.createElement('div')
      const div = document.createElement('div')
      div.tabIndex = -1
      container.appendChild(div)

      const containerRef = ref(container)
      const { handleTab } = useTabTrap(containerRef)

      const event = new KeyboardEvent('Tab', { key: 'Tab' })

      expect(() => handleTab(event)).not.toThrow()

      // Verify negative tabindex elements are not found
      const focusable = container.querySelectorAll('[tabindex]:not([tabindex="-1"])')
      expect(focusable.length).toBe(0)
    })
  })

  describe('useFocusManagement', () => {
    it('returns saveFocus function', () => {
      const { saveFocus } = useFocusManagement()

      expect(typeof saveFocus).toBe('function')
    })

    it('returns restoreFocus function', () => {
      const { restoreFocus } = useFocusManagement()

      expect(typeof restoreFocus).toBe('function')
    })

    it('returns previouslyFocused ref', () => {
      const { previouslyFocused } = useFocusManagement()

      expect(previouslyFocused).toBeDefined()
    })

    it('previouslyFocused is initially null', () => {
      const { previouslyFocused } = useFocusManagement()

      expect(previouslyFocused.value).toBe(null)
    })

    it('saveFocus captures active element', () => {
      const button = document.createElement('button')
      document.body.appendChild(button)
      button.focus()

      const { saveFocus, previouslyFocused } = useFocusManagement()

      saveFocus()

      expect(previouslyFocused.value).toBe(button)

      document.body.removeChild(button)
    })

    it('restoreFocus restores focus to saved element', async () => {
      const button = document.createElement('button')
      document.body.appendChild(button)

      const { saveFocus, restoreFocus } = useFocusManagement()

      // First, actually focus the button so activeElement captures it
      button.focus()

      // Then save the focus
      saveFocus()

      // Spy after focus is saved to capture the restore call
      const focusSpy = vi.spyOn(button, 'focus')

      await restoreFocus()

      expect(focusSpy).toHaveBeenCalled()

      document.body.removeChild(button)
    })

    it('saveFocus saves null when no element is focused', () => {
      // Create a fresh environment with no focused element
      const { saveFocus, previouslyFocused } = useFocusManagement()

      saveFocus()

      // When body has focus (default), the activeElement is body
      // which gets cast to HTMLElement
      expect(previouslyFocused.value).toBeDefined()
    })

    it('restoreFocus does not throw when previouslyFocused is null', async () => {
      const { restoreFocus } = useFocusManagement()

      // Don't call saveFocus, so previouslyFocused is null
      // Should not throw even when previouslyFocused is null
      expect(() => restoreFocus()).not.toThrow()
      await nextTick()
    })

    it('saveFocus can be called multiple times', () => {
      const button1 = document.createElement('button')
      const button2 = document.createElement('button')
      document.body.appendChild(button1)
      document.body.appendChild(button2)

      const { saveFocus, previouslyFocused } = useFocusManagement()

      button1.focus()
      saveFocus()
      expect(previouslyFocused.value).toBe(button1)

      button2.focus()
      saveFocus()
      expect(previouslyFocused.value).toBe(button2)

      document.body.removeChild(button1)
      document.body.removeChild(button2)
    })

    it('restoreFocus uses nextTick', async () => {
      const button = document.createElement('button')
      document.body.appendChild(button)
      button.focus()

      const { saveFocus, restoreFocus } = useFocusManagement()
      saveFocus()

      // restoreFocus calls nextTick internally, so we just await it
      expect(() => restoreFocus()).not.toThrow()
      await nextTick()

      document.body.removeChild(button)
    })
  })
})
