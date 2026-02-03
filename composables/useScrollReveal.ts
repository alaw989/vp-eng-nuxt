/**
 * Composable for scroll-triggered reveal animations
 * Uses IntersectionObserver to detect when elements enter viewport
 */
export function useScrollReveal(threshold = 0.1) {
  const target = ref<HTMLElement>()
  const isVisible = ref(false)

  useIntersectionObserver(
    target,
    ([entry]) => {
      if (entry?.isIntersecting) {
        isVisible.value = true
      }
    },
    { threshold }
  )

  return { target, isVisible }
}
