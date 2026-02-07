import { useMagicKeys } from '@vueuse/core'
import type { Ref } from 'vue'
import { watch } from 'vue'

/**
 * Escape key handler for closing overlays/menus
 * @param isOpen - Ref<boolean> tracking open state
 * @param callback - Optional additional cleanup function
 */
export function useEscapeKey(isOpen: Ref<boolean>, callback?: () => void) {
  const { escape } = useMagicKeys()

  // Use watch directly to handle key press
  watch(
    () => escape?.value,
    (isPressed) => {
      if (isPressed && isOpen.value) {
        isOpen.value = false
        callback?.()
      }
    }
  )

  return { escape }
}

/**
 * Arrow key handler for sliders/carousels
 * @param currentIndex - Ref<number> tracking current index
 * @param itemCount - Total number of items
 * @param isEnabled - Optional ref to only handle when enabled
 */
export function useArrowKeys(
  currentIndex: Ref<number>,
  itemCount: number | Ref<number>,
  isEnabled?: Ref<boolean>
) {
  const { arrowLeft, arrowRight, arrowUp, arrowDown, home, end } = useMagicKeys()

  const count = typeof itemCount === 'number' ? ref(itemCount) : itemCount
  const enabled = isEnabled ?? ref(true)

  const goPrevious = () => {
    if (enabled.value) {
      currentIndex.value = currentIndex.value > 0
        ? currentIndex.value - 1
        : count.value - 1
    }
  }

  const goNext = () => {
    if (enabled.value) {
      currentIndex.value = (currentIndex.value + 1) % count.value
    }
  }

  const goFirst = () => {
    if (enabled.value) currentIndex.value = 0
  }

  const goLast = () => {
    if (enabled.value) currentIndex.value = count.value - 1
  }

  // Use watch to handle key presses
  watch(
    () => arrowLeft?.value,
    (isPressed) => { if (isPressed) goPrevious() }
  )
  watch(
    () => arrowRight?.value,
    (isPressed) => { if (isPressed) goNext() }
  )
  watch(
    () => arrowUp?.value,
    (isPressed) => { if (isPressed) goPrevious() }
  )
  watch(
    () => arrowDown?.value,
    (isPressed) => { if (isPressed) goNext() }
  )
  watch(
    () => home?.value,
    (isPressed) => { if (isPressed) goFirst() }
  )
  watch(
    () => end?.value,
    (isPressed) => { if (isPressed) goLast() }
  )

  return {
    goPrevious,
    goNext,
    goFirst,
    goLast,
    arrowKeys: { arrowLeft, arrowRight, arrowUp, arrowDown, home, end }
  }
}

/**
 * Tab trap helper for keeping focus within a component
 * @param containerRef - Ref to the container element
 */
export function useTabTrap(containerRef: Ref<HTMLElement | undefined>) {
  const handleTab = (e: KeyboardEvent) => {
    if (!containerRef.value || e.key !== 'Tab') return

    const focusable = containerRef.value.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last?.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first?.focus()
    }
  }

  return { handleTab }
}

/**
 * Focus management for modals and overlays
 * Saves and restores focus when opening/closing
 */
export function useFocusManagement() {
  const previouslyFocused = ref<HTMLElement | null>(null)

  const saveFocus = () => {
    previouslyFocused.value = document.activeElement as HTMLElement
  }

  const restoreFocus = () => {
    nextTick(() => {
      previouslyFocused.value?.focus()
    })
  }

  return {
    saveFocus,
    restoreFocus,
    previouslyFocused
  }
}
