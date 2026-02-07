import { ref, nextTick, watch } from 'vue'

/**
 * Live region composable for screen reader announcements
 * Uses clear/reset pattern to ensure re-announcement of same content
 *
 * Live regions are essential for announcing dynamic content changes to screen readers.
 * This composable follows WCAG 2.1 guidelines for aria-live regions.
 *
 * @see https://www.w3.org/WAI/ARIA/apg/practices/live-region/
 */
export function useAnnouncer(options: { priority?: 'polite' | 'assertive' } = {}) {
  const { priority = 'polite' } = options

  const message = ref('')
  const previousMessage = ref('')

  /**
   * Announce a message to screen readers
   * Clears the live region first to ensure re-announcement
   *
   * The clear/reset pattern is necessary because screen readers only announce
   * changes to aria-live content. If the same message is set twice, it won't
   * be re-announced without clearing first.
   *
   * @param text - Message to announce
   * @param force - Force announcement even if same as previous
   */
  const announce = async (text: string, force = false) => {
    // Don't re-announce same message unless forced
    if (!force && text === previousMessage.value) {
      return
    }

    // Clear current message
    message.value = ''

    // Wait for DOM update
    await nextTick()

    // Set new message
    message.value = text
    previousMessage.value = text

    // Auto-clear after announcement (polite regions read once)
    setTimeout(() => {
      if (message.value === text) {
        message.value = ''
      }
    }, 1000)
  }

  /**
   * Clear the current announcement
   */
  const clear = () => {
    message.value = ''
    previousMessage.value = ''
  }

  return {
    message,
    announce,
    clear,
    priority
  }
}

/**
 * Live region for route change announcements
 * Announces page navigation to screen readers
 *
 * This composable automatically watches route changes and announces
 * the new page title to screen readers, satisfying TRANS-04 and A11Y-09.
 *
 * Note: Named useA11yRouteAnnouncer to avoid conflict with Nuxt's built-in
 * useRouteAnnouncer which has different behavior.
 */
export function useA11yRouteAnnouncer() {
  const { announce } = useAnnouncer({ priority: 'polite' })
  const route = useRoute()

  // Get page title from route meta or generate from path
  const getPageTitle = (): string => {
    if (route.meta.title) {
      return route.meta.title as string
    }

    // Generate title from path
    const path = route.path
    if (path === '/') return 'Home'
    const segments = path.split('/').filter(Boolean)
    return segments[segments.length - 1]?.replace(/-/g, ' ') || 'Page'
  }

  // Announce route changes
  watch(() => route.path, async (to, from) => {
    if (to !== from) {
      const title = getPageTitle()
      await announce(`Navigated to ${title}`)
    }
  })

  return {
    announce,
    getPageTitle
  }
}

/**
 * Status announcer for dynamic content
 * Use for search results, filters, loading states
 *
 * This provides utilities for announcing common async state changes
 * like search results updating, filters changing, or loading states.
 */
export function useStatusAnnouncer() {
  const { announce } = useAnnouncer({ priority: 'polite' })

  /**
   * Announce list/item count changes
   * @param count - Number of items
   * @param label - Item label (e.g., "result", "project")
   */
  const announceCount = async (count: number, label: string) => {
    await announce(`Showing ${count} ${label}${count !== 1 ? 's' : ''}`)
  }

  /**
   * Announce loading state
   * @param loading - Whether content is loading
   */
  const announceLoading = async (loading: boolean) => {
    if (loading) {
      await announce('Loading content', true)
    }
  }

  /**
   * Announce error state (uses assertive priority for immediate attention)
   * @param error - Error message to announce
   */
  const announceError = async (error: string) => {
    // Use assertive for errors (interrupts current speech)
    const { announce: assert } = useAnnouncer({ priority: 'assertive' })
    await assert(`Error: ${error}`)
  }

  return {
    announce,
    announceCount,
    announceLoading,
    announceError
  }
}

/**
 * Form validation announcer
 * Announces form errors to screen readers
 *
 * @example
 * const { announceErrors } = useFormAnnouncer()
 * const errors = validateForm(data)
 * announceErrors(errors)
 */
export function useFormAnnouncer() {
  const { announce: assert } = useAnnouncer({ priority: 'assertive' })

  /**
   * Announce form validation errors
   * @param errors - Array of error messages or object with field names as keys
   */
  const announceErrors = async (errors: string[] | Record<string, string>) => {
    if (Array.isArray(errors)) {
      if (errors.length === 0) return
      const count = errors.length
      await assert(`Form has ${count} error${count !== 1 ? 's' : ''}. ${errors.join('. ')}`)
    } else {
      const entries = Object.entries(errors)
      if (entries.length === 0) return
      const messages = entries.map(([field, error]) => `${field}: ${error}`)
      await assert(`Form has ${entries.length} error${entries.length !== 1 ? 's' : ''}. ${messages.join('. ')}`)
    }
  }

  /**
   * Announce success message
   * @param message - Success message
   */
  const announceSuccess = async (message: string) => {
    const { announce } = useAnnouncer({ priority: 'polite' })
    await announce(message)
  }

  return {
    announceErrors,
    announceSuccess
  }
}

/**
 * Dialog/modal announcer
 * Announces dialog open/close states
 */
export function useDialogAnnouncer() {
  const { announce } = useAnnouncer({ priority: 'polite' })

  /**
   * Announce dialog opened
   * @param title - Dialog title
   */
  const announceOpen = async (title = 'Dialog') => {
    await announce(`${title} opened. Press Escape to close.`)
  }

  /**
   * Announce dialog closed
   */
  const announceClosed = async () => {
    await announce('Dialog closed')
  }

  return {
    announceOpen,
    announceClosed
  }
}
