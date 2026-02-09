/**
 * Composable for scroll-triggered reveal animations
 * Uses IntersectionObserver to detect when elements enter viewport
 */

export interface ScrollRevealOptions {
  /** Threshold (0-1) for intersection detection - default 0.15 */
  threshold?: number
  /** Stop observing after first reveal - default true (performance) */
  once?: boolean
  /** Root margin offset for trigger point (e.g., '-50px' triggers before element enters) - default '0px' */
  rootMargin?: string
  /** Apply stagger delays to children with .stagger-item class - default false */
  staggerChildren?: boolean
}

export function useScrollReveal(options: ScrollRevealOptions = {}) {
  const {
    threshold = 0.15,
    once = true,
    rootMargin = '0px',
    staggerChildren = false
  } = options

  const target = ref<HTMLElement>()
  const isVisible = ref(false)
  const hasRevealed = ref(false)

  const { stop } = useIntersectionObserver(
    target,
    ([entry]) => {
      if (entry?.isIntersecting) {
        isVisible.value = true
        hasRevealed.value = true

        // Apply stagger delays to children if enabled
        if (staggerChildren && target.value) {
          const staggerItems = target.value.querySelectorAll<HTMLElement>('.stagger-item')
          staggerItems.forEach((item, index) => {
            // Stagger delay: 100ms base + 80ms per item index
            const delay = 100 + (index * 80)
            item.style.transitionDelay = `${delay}ms`
          })
        }

        // Stop observing after first reveal if once is true (performance)
        if (once) {
          stop()
        }
      }
    },
    { threshold, rootMargin }
  )

  return { target, isVisible, hasRevealed }
}
