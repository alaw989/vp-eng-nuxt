import { useFocusTrap } from '@vueuse/integrations/useFocusTrap'
import { nextTick, ref, watch } from 'vue'
import type { Ref } from 'vue'

/**
 * VueUse wrapper for modal focus traps
 * Automatically activates when isOpen becomes true
 * @param trapRef - Ref to the modal container element
 * @param isOpen - Ref tracking modal open state
 * @param options - VueUse focus trap options
 */
export function useModalFocusTrap(
  trapRef: Ref<HTMLElement | undefined>,
  isOpen: Ref<boolean>,
  options: {
    escapeDeactivates?: boolean
    clickOutsideDeactivates?: boolean
    initialFocus?: string | (() => HTMLElement)
  } = {}
) {
  const { hasFocus, activate, deactivate } = useFocusTrap(trapRef, {
    immediate: false,
    ...options
  })

  // Activate trap when modal opens
  const open = async () => {
    isOpen.value = true
    await nextTick()
    activate()
  }

  // Deactivate trap when modal closes
  const close = async () => {
    isOpen.value = false
    deactivate()
  }

  return {
    hasFocus,
    activate,
    deactivate,
    open,
    close
  }
}

/**
 * Focus restoration for modals/overlays
 * Tracks the element that opened a modal and restores focus on close
 */
export function useFocusRestoration() {
  const triggerRef = ref<HTMLElement | null>(null)

  /**
   * Call before opening modal to save current focus
   */
  const saveFocus = () => {
    triggerRef.value = document.activeElement as HTMLElement
  }

  /**
   * Call after closing modal to restore focus
   */
  const restoreFocus = async () => {
    await nextTick()
    triggerRef.value?.focus()
  }

  /**
   * Get the saved trigger element
   */
  const getTrigger = () => triggerRef.value

  return {
    saveFocus,
    restoreFocus,
    getTrigger,
    triggerRef
  }
}

/**
 * Route change focus management
 * Moves focus to skip link target or main content on route change
 */
export function useRouteFocus() {
  const route = useRoute()

  const focusMainContent = async () => {
    await nextTick()
    const mainContent = document.getElementById('main-content')
    if (mainContent) {
      mainContent.tabIndex = -1
      mainContent.focus()
    }
  }

  // Focus main content on route change
  watch(() => route.path, () => {
    focusMainContent()
  })

  return {
    focusMainContent
  }
}
