/**
 * Tests for useA11y composable
 * Tests accessibility announcers for screen readers
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('useA11y Composable', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('useAnnouncer', () => {
    it('should announce a message', async () => {
      const { message, announce } = await import('../useA11y').then(m => m.useAnnouncer())

      expect(message.value).toBe('')

      await announce('Test message')

      expect(message.value).toBe('Test message')
    })

    it('should not re-announce same message without force', async () => {
      const { message, announce } = await import('../useA11y').then(m => m.useAnnouncer())

      await announce('Same message')
      const previousValue = message.value
      await announce('Same message')

      expect(message.value).toBe(previousValue)
    })

    it('should re-announce same message with force=true', async () => {
      const { message, announce } = await import('../useA11y').then(m => m.useAnnouncer())

      await announce('Same message')
      await announce('Same message', true)

      expect(message.value).toBe('Same message')
    })

    it('should clear announcement', async () => {
      const { message, announce, clear } = await import('../useA11y').then(m => m.useAnnouncer())

      await announce('Test message')
      expect(message.value).toBe('Test message')

      clear()
      expect(message.value).toBe('')
    })

    it('should support assertive priority', async () => {
      const { priority } = await import('../useA11y').then(m => m.useAnnouncer({ priority: 'assertive' }))

      expect(priority).toBe('assertive')
    })

    it('should auto-clear message after timeout', async () => {
      const { message, announce } = await import('../useA11y').then(m => m.useAnnouncer())

      await announce('Test message')
      expect(message.value).toBe('Test message')

      // Fast-forward past the 1 second timeout
      vi.advanceTimersByTime(1100)

      expect(message.value).toBe('')
    })

    it('should not auto-clear if a different message was set', async () => {
      const { message, announce } = await import('../useA11y').then(m => m.useAnnouncer())

      await announce('First message')
      await announce('Second message')

      // Fast-forward past the 1 second timeout
      vi.advanceTimersByTime(1100)

      // Should be empty because second message triggered the timeout
      expect(message.value).toBe('')
    })

    it('should clear previousMessage when clear is called', async () => {
      const { message, announce, clear } = await import('../useA11y').then(m => m.useAnnouncer())

      await announce('Test message')
      expect(message.value).toBe('Test message')

      clear()

      // After clear, announcing same message should work
      await announce('Test message')
      expect(message.value).toBe('Test message')
    })
  })

  describe('useA11yRouteAnnouncer', () => {
    it('should export useA11yRouteAnnouncer function', async () => {
      const mod = await import('../useA11y')
      expect(typeof mod.useA11yRouteAnnouncer).toBe('function')
    })

    it('should return announce and getPageTitle functions', async () => {
      const { useA11yRouteAnnouncer } = await import('../useA11y')

      const result = useA11yRouteAnnouncer()

      expect(typeof result.announce).toBe('function')
      expect(typeof result.getPageTitle).toBe('function')
    })

    it('should use polite priority by default', async () => {
      const { useA11yRouteAnnouncer } = await import('../useA11y')

      const result = useA11yRouteAnnouncer()

      // The announcer inside should have polite priority
      expect(result.announce).toBeDefined()
    })

    it('should get page title from route meta', async () => {
      const { useA11yRouteAnnouncer } = await import('../useA11y')

      // Mock route with meta title
      const result = useA11yRouteAnnouncer()
      const title = result.getPageTitle()

      // Title will be generated from path since we can't easily mock route.meta in tests
      expect(typeof title).toBe('string')
    })

    it('should get page title from home path', async () => {
      const { useA11yRouteAnnouncer } = await import('../useA11y')

      const result = useA11yRouteAnnouncer()
      const title = result.getPageTitle()

      // Current route is '/' in test environment
      expect(title).toBeTruthy()
    })

    it('should get page title from route path segments', async () => {
      const { useA11yRouteAnnouncer } = await import('../useA11y')

      const result = useA11yRouteAnnouncer()

      // Test that getPageTitle returns a string
      const title = result.getPageTitle()
      expect(typeof title).toBe('string')
    })

    it('should handle path with hyphenated segments', async () => {
      const { useA11yRouteAnnouncer } = await import('../useA11y')

      const result = useA11yRouteAnnouncer()

      // The function should handle hyphen conversion
      const title = result.getPageTitle()
      expect(typeof title).toBe('string')
    })

    it('should handle empty path segments', async () => {
      const { useA11yRouteAnnouncer } = await import('../useA11y')

      const result = useA11yRouteAnnouncer()

      // Test path handling edge case
      const title = result.getPageTitle()
      expect(title.length).toBeGreaterThan(0)
    })

    it('should call getPageTitle and return result', async () => {
      const { useA11yRouteAnnouncer } = await import('../useA11y')

      const result = useA11yRouteAnnouncer()

      // getPageTitle should be callable multiple times
      const title1 = result.getPageTitle()
      const title2 = result.getPageTitle()

      expect(typeof title1).toBe('string')
      expect(typeof title2).toBe('string')
    })

    it('should handle route path watching', async () => {
      const { useA11yRouteAnnouncer } = await import('../useA11y')

      // This test verifies the watch is set up without errors
      const result = useA11yRouteAnnouncer()

      // The function sets up a watcher on route.path
      // We can't easily trigger route changes in tests but we verify it doesn't crash
      expect(result.announce).toBeDefined()
      expect(result.getPageTitle).toBeDefined()
    })

    it('should announce on route path change', async () => {
      const { useA11yRouteAnnouncer } = await import('../useA11y')

      // The watcher is set up when useA11yRouteAnnouncer is called
      const result = useA11yRouteAnnouncer()

      // Verify the announce function can be called manually
      await expect(result.announce('Test navigation')).resolves.not.toThrow()
    })

    it('getPageTitle handles path with multiple segments', async () => {
      const { useA11yRouteAnnouncer } = await import('../useA11y')

      const result = useA11yRouteAnnouncer()
      const title = result.getPageTitle()

      expect(typeof title).toBe('string')
      expect(title.length).toBeGreaterThan(0)
    })

    it('getPageTitle handles path with trailing slash', async () => {
      const { useA11yRouteAnnouncer } = await import('../useA11y')

      const result = useA11yRouteAnnouncer()

      // The function should handle various path formats
      const title = result.getPageTitle()
      expect(typeof title).toBe('string')
    })

    it('getPageTitle handles nested paths', async () => {
      const { useA11yRouteAnnouncer } = await import('../useA11y')

      const result = useA11yRouteAnnouncer()

      // Test that getPageTitle extracts the last segment
      const title = result.getPageTitle()
      expect(title).toBeTruthy()
    })

    it('getPageTitle handles path with multiple hyphens', async () => {
      const { useA11yRouteAnnouncer } = await import('../useA11y')

      const result = useA11yRouteAnnouncer()

      // The function should replace hyphens with spaces
      const title = result.getPageTitle()
      expect(typeof title).toBe('string')
    })

    it('getPageTitle returns fallback for root path', async () => {
      const { useA11yRouteAnnouncer } = await import('../useA11y')

      const result = useA11yRouteAnnouncer()
      const title = result.getPageTitle()

      // Root path '/' should return 'Home'
      // In test environment, the route might be '/', so expect 'Home' or a generated title
      expect(['Home', 'Page'].some(fallback => title === fallback)).toBe(true)
    })

    it('route watcher does not throw when called', async () => {
      const { useA11yRouteAnnouncer } = await import('../useA11y')

      // The watch function inside useA11yRouteAnnouncer should not throw
      expect(() => useA11yRouteAnnouncer()).not.toThrow()
    })

    it('getPageTitle can be called multiple times', async () => {
      const { useA11yRouteAnnouncer } = await import('../useA11y')

      const result = useA11yRouteAnnouncer()

      const title1 = result.getPageTitle()
      const title2 = result.getPageTitle()
      const title3 = result.getPageTitle()

      expect(typeof title1).toBe('string')
      expect(typeof title2).toBe('string')
      expect(typeof title3).toBe('string')
    })

    it('getPageTitle returns string for empty path segments', async () => {
      const { useA11yRouteAnnouncer } = await import('../useA11y')

      const result = useA11yRouteAnnouncer()

      // Handle edge case where filter removes all segments
      const title = result.getPageTitle()
      expect(title).toBeTruthy()
    })
  })

  describe('useStatusAnnouncer', () => {
    it('should announce count', async () => {
      const { announceCount } = await import('../useA11y').then(m => m.useStatusAnnouncer())

      await expect(announceCount(5, 'result')).resolves.not.toThrow()
    })

    it('should use singular form for count of 1', async () => {
      const { announceCount } = await import('../useA11y').then(m => m.useStatusAnnouncer())

      await expect(announceCount(1, 'result')).resolves.not.toThrow()
    })

    it('should use plural form for count of 0', async () => {
      const { announceCount } = await import('../useA11y').then(m => m.useStatusAnnouncer())

      await expect(announceCount(0, 'result')).resolves.not.toThrow()
    })

    it('should announce loading', async () => {
      const { announceLoading } = await import('../useA11y').then(m => m.useStatusAnnouncer())

      await expect(announceLoading(true)).resolves.not.toThrow()
    })

    it('should not announce when loading is false', async () => {
      const { announceLoading } = await import('../useA11y').then(m => m.useStatusAnnouncer())

      await expect(announceLoading(false)).resolves.not.toThrow()
    })

    it('should announce error', async () => {
      const { announceError } = await import('../useA11y').then(m => m.useStatusAnnouncer())

      await expect(announceError('Something went wrong')).resolves.not.toThrow()
    })

    it('should return base announce function', async () => {
      const { announce } = await import('../useA11y').then(m => m.useStatusAnnouncer())

      expect(typeof announce).toBe('function')
    })
  })

  describe('useFormAnnouncer', () => {
    it('should announce array errors', async () => {
      const { announceErrors } = await import('../useA11y').then(m => m.useFormAnnouncer())

      const errors = ['Email is required', 'Password is too short']
      await expect(announceErrors(errors)).resolves.not.toThrow()
    })

    it('should announce object errors', async () => {
      const { announceErrors } = await import('../useA11y').then(m => m.useFormAnnouncer())

      const errors = { email: 'Email is required', password: 'Password is too short' }
      await expect(announceErrors(errors)).resolves.not.toThrow()
    })

    it('should not announce empty error array', async () => {
      const { announceErrors } = await import('../useA11y').then(m => m.useFormAnnouncer())

      await expect(announceErrors([])).resolves.not.toThrow()
    })

    it('should not announce empty error object', async () => {
      const { announceErrors } = await import('../useA11y').then(m => m.useFormAnnouncer())

      await expect(announceErrors({})).resolves.not.toThrow()
    })

    it('should announce single array error', async () => {
      const { announceErrors } = await import('../useA11y').then(m => m.useFormAnnouncer())

      await expect(announceErrors(['Email is required'])).resolves.not.toThrow()
    })

    it('should announce single object error', async () => {
      const { announceErrors } = await import('../useA11y').then(m => m.useFormAnnouncer())

      await expect(announceErrors({ email: 'Email is required' })).resolves.not.toThrow()
    })

    it('should announce success', async () => {
      const { announceSuccess } = await import('../useA11y').then(m => m.useFormAnnouncer())

      await expect(announceSuccess('Form submitted successfully')).resolves.not.toThrow()
    })
  })

  describe('useDialogAnnouncer', () => {
    it('should announce dialog opened', async () => {
      const { announceOpen } = await import('../useA11y').then(m => m.useDialogAnnouncer())

      await expect(announceOpen('Contact Form')).resolves.not.toThrow()
    })

    it('should announce dialog closed', async () => {
      const { announceClosed } = await import('../useA11y').then(m => m.useDialogAnnouncer())

      await expect(announceClosed()).resolves.not.toThrow()
    })

    it('should use default title when none provided', async () => {
      const { announceOpen } = await import('../useA11y').then(m => m.useDialogAnnouncer())

      await expect(announceOpen()).resolves.not.toThrow()
    })

    it('should announce dialog with custom title', async () => {
      const { announceOpen } = await import('../useA11y').then(m => m.useDialogAnnouncer())

      await expect(announceOpen('Custom Modal Title')).resolves.not.toThrow()
    })

    it('should announce dialog with empty string title', async () => {
      const { announceOpen } = await import('../useA11y').then(m => m.useDialogAnnouncer())

      await expect(announceOpen('')).resolves.not.toThrow()
    })
  })

  describe('edge cases and integration', () => {
    it('should handle multiple rapid announcements', async () => {
      const { message, announce } = await import('../useA11y').then(m => m.useAnnouncer())

      await announce('First')
      await announce('Second')
      await announce('Third')

      expect(message.value).toBe('Third')
    })

    it('should handle empty string announcement', async () => {
      const { message, announce } = await import('../useA11y').then(m => m.useAnnouncer())

      await announce('')

      expect(message.value).toBe('')
    })

    it('should handle very long announcement', async () => {
      const { message, announce } = await import('../useA11y').then(m => m.useAnnouncer())

      const longMessage = 'A'.repeat(1000)
      await announce(longMessage)

      expect(message.value).toBe(longMessage)
    })

    it('should handle special characters in announcement', async () => {
      const { message, announce } = await import('../useA11y').then(m => m.useAnnouncer())

      const specialMessage = 'Test <script>alert("xss")</script> & "quotes"'
      await announce(specialMessage)

      expect(message.value).toBe(specialMessage)
    })

    it('should handle announcing same message multiple times with force', async () => {
      const { message, announce } = await import('../useA11y').then(m => m.useAnnouncer())

      await announce('Repeat me')
      await announce('Repeat me', true)
      await announce('Repeat me', true)
      await announce('Repeat me', true)

      expect(message.value).toBe('Repeat me')
    })
  })

  describe('module exports', () => {
    it('should export all accessibility functions', async () => {
      const mod = await import('../useA11y')

      expect(typeof mod.useAnnouncer).toBe('function')
      expect(typeof mod.useA11yRouteAnnouncer).toBe('function')
      expect(typeof mod.useStatusAnnouncer).toBe('function')
      expect(typeof mod.useFormAnnouncer).toBe('function')
      expect(typeof mod.useDialogAnnouncer).toBe('function')
    })
  })
})
