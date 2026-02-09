/**
 * Composable for smooth filter layout transitions using FLIP technique
 * (First, Last, Invert, Play) - GPU-accelerated, transform-only animations
 */

import { usePreferredReducedMotion } from '@vueuse/core'

export function useFilterTransition<T>() {
  const containerRef = ref<HTMLElement | undefined>()
  const isAnimating = ref(false)
  const prefersReducedMotion = usePreferredReducedMotion()

  /**
   * Animate filter layout changes using FLIP technique
   * @param _items - New filtered items array (used to trigger reactivity)
   */
  async function animateFilter(_items: T[]): Promise<void> {
    // Skip FLIP animation for reduced-motion users
    if (prefersReducedMotion.value === 'reduce') {
      return
    }

    if (!containerRef.value || isAnimating.value) {
      return
    }

    const container = containerRef.value
    const children = Array.from(container.children) as HTMLElement[]

    if (children.length === 0) {
      return
    }

    // FIRST: Capture old positions before DOM update
    const firstPositions = new Map<HTMLElement, DOMRect>()
    children.forEach((child) => {
      firstPositions.set(child, child.getBoundingClientRect())
    })

    // Wait for Vue to update the DOM with new filtered items
    await nextTick()

    // Get new children after DOM update
    const newChildren = Array.from(container.children) as HTMLElement[]

    if (newChildren.length === 0) {
      return
    }

    isAnimating.value = true

    // LAST: Capture new positions after DOM update
    const animationPromises: Promise<void>[] = []

    newChildren.forEach((child) => {
      const lastRect = child.getBoundingClientRect()
      const firstRect = firstPositions.get(child)

      if (!firstRect) {
        // New element - could add fade-in animation here
        return
      }

      // Calculate deltas
      const deltaX = firstRect.left - lastRect.left
      const deltaY = firstRect.top - lastRect.top

      // Skip elements with no movement
      if (deltaX === 0 && deltaY === 0) {
        return
      }

      // INVERT: Apply inverted transform to appear at old position
      child.style.transform = `translate(${deltaX}px, ${deltaY}px)`
      child.style.transition = 'none'

      // Force reflow to ensure transform is applied before animation
      void child.offsetWidth

      // PLAY: Animate to natural position
      child.style.transition = 'transform 300ms ease-out'
      child.style.transform = 'translate(0, 0)'

      // Create promise that resolves when animation completes
      const animationPromise = new Promise<void>((resolve) => {
        const onTransitionEnd = (event: TransitionEvent) => {
          if (event.propertyName === 'transform') {
            child.removeEventListener('transitionend', onTransitionEnd)
            // Cleanup: Remove inline styles
            child.style.transform = ''
            child.style.transition = ''
            resolve()
          }
        }

        child.addEventListener('transitionend', onTransitionEnd)

        // Fallback timeout in case transitionend doesn't fire
        setTimeout(() => {
          child.removeEventListener('transitionend', onTransitionEnd)
          child.style.transform = ''
          child.style.transition = ''
          resolve()
        }, 350) // Slightly longer than animation duration
      })

      animationPromises.push(animationPromise)
    })

    // Wait for all animations to complete
    await Promise.all(animationPromises)

    isAnimating.value = false
  }

  return {
    containerRef,
    animateFilter,
    isAnimating
  }
}
