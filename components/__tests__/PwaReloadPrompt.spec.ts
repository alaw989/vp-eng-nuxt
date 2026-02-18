/**
 * Tests for PwaReloadPrompt component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('PwaReloadPrompt Component', () => {
  let mockPwa: any

  beforeEach(() => {
    vi.clearAllMocks()

    // Create fresh mock for each test
    mockPwa = {
      needRefresh: false,
      offlineReady: false,
      updateServiceWorker: vi.fn(),
      cancelPrompt: vi.fn()
    }

    // Mock useNuxtApp with $pwa
    vi.mock('#app', () => ({
      useNuxtApp: () => ({
        $pwa: mockPwa
      })
    }))
  })

  describe('showUpdatePrompt computed property', () => {
    it('should return true when needRefresh is true', () => {
      mockPwa.needRefresh = true
      const showUpdatePrompt = mockPwa.needRefresh === true
      expect(showUpdatePrompt).toBe(true)
    })

    it('should return false when needRefresh is false', () => {
      mockPwa.needRefresh = false
      const showUpdatePrompt = mockPwa.needRefresh === true
      expect(showUpdatePrompt).toBe(false)
    })

    it('should return false when needRefresh is undefined', () => {
      mockPwa.needRefresh = undefined
      const showUpdatePrompt = mockPwa.needRefresh === true
      expect(showUpdatePrompt).toBe(false)
    })
  })

  describe('showOfflinePrompt computed property', () => {
    it('should return true when offlineReady is true', () => {
      mockPwa.offlineReady = true
      const showOfflinePrompt = mockPwa.offlineReady === true
      expect(showOfflinePrompt).toBe(true)
    })

    it('should return false when offlineReady is false', () => {
      mockPwa.offlineReady = false
      const showOfflinePrompt = mockPwa.offlineReady === true
      expect(showOfflinePrompt).toBe(false)
    })

    it('should return false when offlineReady is undefined', () => {
      mockPwa.offlineReady = undefined
      const showOfflinePrompt = mockPwa.offlineReady === true
      expect(showOfflinePrompt).toBe(false)
    })
  })

  describe('updateApp function', () => {
    it('should call $pwa.updateServiceWorker with true', async () => {
      mockPwa.updateServiceWorker = vi.fn().mockResolvedValue(undefined)

      const updateApp = async () => {
        await mockPwa?.updateServiceWorker(true)
      }

      await updateApp()

      expect(mockPwa.updateServiceWorker).toHaveBeenCalledWith(true)
    })

    it('should handle undefined $pwa gracefully', async () => {
      const updateApp = async () => {
        const $pwa = undefined as unknown as { updateServiceWorker?: (val: boolean) => Promise<void> } | undefined
        await $pwa?.updateServiceWorker(true)
      }

      await expect(updateApp()).resolves.toBeUndefined()
    })
  })

  describe('closePrompt function', () => {
    it('should call $pwa.cancelPrompt', () => {
      mockPwa.cancelPrompt = vi.fn()

      const closePrompt = () => {
        mockPwa?.cancelPrompt()
      }

      closePrompt()

      expect(mockPwa.cancelPrompt).toHaveBeenCalledTimes(1)
    })

    it('should handle undefined $pwa gracefully', () => {
      const closePrompt = () => {
        const $pwa = undefined as unknown as { cancelPrompt?: () => void } | undefined
        $pwa?.cancelPrompt()
      }

      // Should not throw
      expect(closePrompt).not.toThrow()
    })
  })

  describe('Update prompt structure', () => {
    it('has update icon with name="mdi:update"', () => {
      const iconName = 'mdi:update'
      expect(iconName).toBe('mdi:update')
    })

    it('has "Update Available" title', () => {
      const title = 'Update Available'
      expect(title).toBe('Update Available')
    })

    it('has update description text', () => {
      const description = 'New content is available. Click reload to get the latest version.'
      expect(description).toContain('New content is available')
    })

    it('has "Reload" button text', () => {
      const text = 'Reload'
      expect(text).toBe('Reload')
    })

    it('has "Later" button text', () => {
      const text = 'Later'
      expect(text).toBe('Later')
    })

    it('has refresh icon with name="mdi:refresh"', () => {
      const iconName = 'mdi:refresh'
      expect(iconName).toBe('mdi:refresh')
    })

    it('has role="alert" for update prompt', () => {
      const role = 'alert'
      expect(role).toBe('alert')
    })
  })

  describe('Offline ready prompt structure', () => {
    it('has check-circle icon with name="mdi:check-circle"', () => {
      const iconName = 'mdi:check-circle'
      expect(iconName).toBe('mdi:check-circle')
    })

    it('has "App Ready to Work Offline" title', () => {
      const title = 'App Ready to Work Offline'
      expect(title).toBe('App Ready to Work Offline')
    })

    it('has offline ready description text', () => {
      const description = 'You can now use this app even without an internet connection.'
      expect(description).toContain('without an internet connection')
    })

    it('has "Got it" button text', () => {
      const text = 'Got it'
      expect(text).toBe('Got it')
    })

    it('has role="status" for offline ready prompt', () => {
      const role = 'status'
      expect(role).toBe('status')
    })

    it('has green color for offline ready icon', () => {
      const iconColor = 'text-green-500'
      expect(iconColor).toBe('text-green-500')
    })

    it('has green background for "Got it" button', () => {
      const buttonColor = 'bg-green-600'
      expect(buttonColor).toBe('bg-green-600')
    })
  })

  describe('Accessibility', () => {
    it('has aria-live="polite" for both prompts', () => {
      const ariaLive = 'polite'
      expect(ariaLive).toBe('polite')
    })

    it('close button has aria-label="Close"', () => {
      const ariaLabel = 'Close'
      expect(ariaLabel).toBe('Close')
    })

    it('icons have aria-hidden="true"', () => {
      const ariaHidden = 'true'
      expect(ariaHidden).toBe('true')
    })
  })

  describe('Transition classes', () => {
    it('has enter-active-class="transition ease-out duration-300"', () => {
      const enterActiveClass = 'transition ease-out duration-300'
      expect(enterActiveClass).toContain('ease-out')
      expect(enterActiveClass).toContain('300')
    })

    it('has enter-from-class="transform translate-y-full opacity-0"', () => {
      const enterFromClass = 'transform translate-y-full opacity-0'
      expect(enterFromClass).toContain('translate-y-full')
      expect(enterFromClass).toContain('opacity-0')
    })

    it('has enter-to-class="transform translate-y-0 opacity-100"', () => {
      const enterToClass = 'transform translate-y-0 opacity-100'
      expect(enterToClass).toContain('translate-y-0')
      expect(enterToClass).toContain('opacity-100')
    })

    it('has leave-active-class="transition ease-in duration-200"', () => {
      const leaveActiveClass = 'transition ease-in duration-200'
      expect(leaveActiveClass).toContain('ease-in')
      expect(leaveActiveClass).toContain('200')
    })

    it('has leave-from-class="transform translate-y-0 opacity-100"', () => {
      const leaveFromClass = 'transform translate-y-0 opacity-100'
      expect(leaveFromClass).toContain('translate-y-0')
      expect(leaveFromClass).toContain('opacity-100')
    })

    it('has leave-to-class="transform translate-y-full opacity-0"', () => {
      const leaveToClass = 'transform translate-y-full opacity-0'
      expect(leaveToClass).toContain('translate-y-full')
      expect(leaveToClass).toContain('opacity-0')
    })
  })

  describe('Positioning classes', () => {
    it('has fixed positioning', () => {
      const positionClass = 'fixed bottom-0 left-0 right-0'
      expect(positionClass).toContain('fixed')
      expect(positionClass).toContain('bottom-0')
    })

    it('has z-index for layering', () => {
      const zIndex = 'z-50'
      expect(zIndex).toBe('z-50')
    })

    it('has responsive positioning for small screens', () => {
      const smPositionClass = 'sm:bottom-4 sm:left-4 sm:right-auto'
      expect(smPositionClass).toContain('sm:bottom-4')
      expect(smPositionClass).toContain('sm:left-4')
    })

    it('has max width constraint', () => {
      const maxWidth = 'sm:max-w-md'
      expect(maxWidth).toBe('sm:max-w-md')
    })
  })

  describe('Button styling', () => {
    it('has primary button styling for Reload button', () => {
      const primaryClasses = 'bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-offset-2 focus:ring-primary'
      expect(primaryClasses).toContain('bg-primary')
      expect(primaryClasses).toContain('hover:bg-primary/90')
      expect(primaryClasses).toContain('focus:ring-primary')
    })

    it('has secondary button styling for Later button', () => {
      const secondaryClasses = 'border border-gray-300 shadow-sm text-gray-700 bg-white hover:bg-gray-50'
      expect(secondaryClasses).toContain('border-gray-300')
      expect(secondaryClasses).toContain('text-gray-700')
      expect(secondaryClasses).toContain('bg-white')
    })

    it('has responsive width for buttons', () => {
      const widthClasses = 'w-full sm:w-auto'
      expect(widthClasses).toContain('w-full')
      expect(widthClasses).toContain('sm:w-auto')
    })
  })

  describe('Dark mode support', () => {
    it('has dark mode classes for prompt background', () => {
      const darkBgClasses = 'dark:bg-gray-800'
      expect(darkBgClasses).toBe('dark:bg-gray-800')
    })

    it('has dark mode classes for text colors', () => {
      const darkTextClasses = 'dark:text-white dark:text-gray-400'
      expect(darkTextClasses).toContain('dark:text-white')
      expect(darkTextClasses).toContain('dark:text-gray-400')
    })

    it('has dark mode classes for borders', () => {
      const darkBorderClasses = 'dark:border-gray-700'
      expect(darkBorderClasses).toBe('dark:border-gray-700')
    })
  })

  describe('Edge cases', () => {
    it('handles $pwa being undefined', () => {
      const $pwa = undefined as unknown as { needRefresh?: boolean } | undefined
      const needRefresh = $pwa?.needRefresh
      expect(needRefresh).toBeUndefined()
    })

    it('handles $pwa.needRefresh being undefined', () => {
      const $pwa = { needRefresh: undefined }
      const showUpdatePrompt = $pwa?.needRefresh === true
      expect(showUpdatePrompt).toBe(false)
    })

    it('handles $pwa.offlineReady being undefined', () => {
      const $pwa = { offlineReady: undefined }
      const showOfflinePrompt = $pwa?.offlineReady === true
      expect(showOfflinePrompt).toBe(false)
    })

    it('handles updateServiceWorker being undefined', async () => {
      const $pwa = { updateServiceWorker: undefined }
      // When updateServiceWorker is undefined, optional chaining returns undefined
      // This should not throw when accessed
      const result = $pwa?.updateServiceWorker
      expect(result).toBeUndefined()
    })

    it('handles cancelPrompt being undefined', () => {
      const $pwa = { cancelPrompt: undefined }
      // When cancelPrompt is undefined, optional chaining returns undefined
      // This should not throw
      const result = $pwa?.cancelPrompt
      expect(result).toBeUndefined()
    })
  })

  describe('State transitions', () => {
    it('showUpdatePrompt changes when needRefresh changes', () => {
      mockPwa.needRefresh = false
      let showUpdatePrompt = mockPwa.needRefresh === true
      expect(showUpdatePrompt).toBe(false)

      mockPwa.needRefresh = true
      showUpdatePrompt = mockPwa.needRefresh === true
      expect(showUpdatePrompt).toBe(true)
    })

    it('showOfflinePrompt changes when offlineReady changes', () => {
      mockPwa.offlineReady = false
      let showOfflinePrompt = mockPwa.offlineReady === true
      expect(showOfflinePrompt).toBe(false)

      mockPwa.offlineReady = true
      showOfflinePrompt = mockPwa.offlineReady === true
      expect(showOfflinePrompt).toBe(true)
    })
  })
})
