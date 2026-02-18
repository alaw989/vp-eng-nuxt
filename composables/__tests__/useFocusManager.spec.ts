/**
 * Tests for useFocusManager composable
 * Tests focus management for modals and accessibility
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, nextTick } from 'vue'
import {
  useModalFocusTrap,
  useFocusRestoration,
  useRouteFocus,
} from '../useFocusManager'

describe('useFocusManager Composable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  describe('useModalFocusTrap', () => {
    it('returns hasFocus ref', () => {
      const trapRef = ref<HTMLElement>()
      const isOpen = ref(false)

      const { hasFocus } = useModalFocusTrap(trapRef, isOpen)

      expect(typeof hasFocus.value).toBe('boolean')
    })

    it('returns activate function', () => {
      const trapRef = ref<HTMLElement>()
      const isOpen = ref(false)

      const { activate } = useModalFocusTrap(trapRef, isOpen)

      expect(typeof activate).toBe('function')
    })

    it('returns deactivate function', () => {
      const trapRef = ref<HTMLElement>()
      const isOpen = ref(false)

      const { deactivate } = useModalFocusTrap(trapRef, isOpen)

      expect(typeof deactivate).toBe('function')
    })

    it('returns open function', () => {
      const trapRef = ref<HTMLElement>()
      const isOpen = ref(false)

      const { open } = useModalFocusTrap(trapRef, isOpen)

      expect(typeof open).toBe('function')
    })

    it('returns close function', () => {
      const trapRef = ref<HTMLElement>()
      const isOpen = ref(false)

      const { close } = useModalFocusTrap(trapRef, isOpen)

      expect(typeof close).toBe('function')
    })

    it('open sets isOpen to true', async () => {
      const trapRef = ref<HTMLElement>()
      const isOpen = ref(false)

      const { open } = useModalFocusTrap(trapRef, isOpen)

      await open()

      expect(isOpen.value).toBe(true)
    })

    it('close sets isOpen to false', async () => {
      const trapRef = ref<HTMLElement>()
      const isOpen = ref(true)

      const { close } = useModalFocusTrap(trapRef, isOpen)

      await close()

      expect(isOpen.value).toBe(false)
    })

    it('accepts custom options', () => {
      const trapRef = ref<HTMLElement>()
      const isOpen = ref(false)

      const options = {
        escapeDeactivates: true,
        clickOutsideDeactivates: true,
        initialFocus: '#first-focusable',
      }

      expect(() =>
        useModalFocusTrap(trapRef, isOpen, options)
      ).not.toThrow()
    })
  })

  describe('useFocusRestoration', () => {
    it('returns saveFocus function', () => {
      const { saveFocus } = useFocusRestoration()

      expect(typeof saveFocus).toBe('function')
    })

    it('returns restoreFocus function', () => {
      const { restoreFocus } = useFocusRestoration()

      expect(typeof restoreFocus).toBe('function')
    })

    it('returns getTrigger function', () => {
      const { getTrigger } = useFocusRestoration()

      expect(typeof getTrigger).toBe('function')
    })

    it('returns triggerRef', () => {
      const { triggerRef } = useFocusRestoration()

      expect(triggerRef).toBeDefined()
    })

    it('saveFocus stores active element', () => {
      // Create a focusable element
      const button = document.createElement('button')
      document.body.appendChild(button)
      button.focus()

      const { saveFocus, getTrigger } = useFocusRestoration()

      saveFocus()

      const trigger = getTrigger()
      expect(trigger).toBe(button)
    })

    it('restoreFocus calls focus on saved element', async () => {
      const button = document.createElement('button')
      document.body.appendChild(button)

      const { saveFocus, restoreFocus } = useFocusRestoration()

      // First, actually focus the button so activeElement captures it
      button.focus()

      // Then save the focus
      saveFocus()

      // Spy after focus is saved to capture the restore call
      const focusSpy = vi.spyOn(button, 'focus')

      await restoreFocus()

      expect(focusSpy).toHaveBeenCalled()
    })

    it('getTrigger returns null before saveFocus is called', () => {
      const { getTrigger } = useFocusRestoration()

      const trigger = getTrigger()
      expect(trigger).toBeNull()
    })
  })

  describe('useRouteFocus', () => {
    it('returns focusMainContent function', () => {
      const { focusMainContent } = useRouteFocus()

      expect(typeof focusMainContent).toBe('function')
    })

    it('focusMainContent sets tabIndex on main-content element', async () => {
      const main = document.createElement('main')
      main.id = 'main-content'
      document.body.appendChild(main)

      const { focusMainContent } = useRouteFocus()

      await focusMainContent()

      expect(main.tabIndex).toBe(-1)
    })

    it('focusMainContent calls focus on main-content element', async () => {
      const main = document.createElement('main')
      main.id = 'main-content'
      document.body.appendChild(main)
      const focusSpy = vi.spyOn(main, 'focus')

      const { focusMainContent } = useRouteFocus()

      await focusMainContent()

      expect(focusSpy).toHaveBeenCalled()
    })

    it('handles missing main-content element gracefully', async () => {
      // Don't add main-content element

      const { focusMainContent } = useRouteFocus()

      // Should not throw
      await expect(focusMainContent()).resolves.toBeUndefined()
    })
  })
})
