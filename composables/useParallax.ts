/**
 * Optimized parallax effect for decorative elements
 *
 * Performance features:
 * - Single global event listener shared across all instances
 * - requestAnimationFrame throttling (60fps max)
 * - IntersectionObserver to only animate visible sections
 * - Automatic cleanup when sections unmount
 */

const parallaxState = {
  x: 0,
  y: 0,
  listeners: new Set<() => void>(),
  rafId: null as number | null,
  lastX: 0,
  lastY: 0,
  isInitialized: false,
  prefersReducedMotion: false,
}

let observer: IntersectionObserver | null = null
const visibleSections = new WeakMap<HTMLElement, boolean>()

/**
 * Parallax composable for smooth mouse-tracking animations
 *
 * @param sectionRef - Reference to the section element
 * @param options - Configuration options
 * @returns Parallax values and cleanup function
 */
export function useParallax(
  sectionRef: Ref<HTMLElement | undefined>,
  options: {
    intensity?: number // Movement multiplier (default: 1)
    disabled?: boolean // Disable parallax for this instance
  } = {}
) {
  const { intensity = 1, disabled = false } = options

  // Local parallax values for this section
  const parallaxX = ref(0)
  const parallaxY = ref(0)

  // Update callback for this section
  const update = () => {
    if (disabled) return
    parallaxX.value = parallaxState.x * intensity
    parallaxY.value = parallaxState.y * intensity
  }

  // Add this section's update callback to the global set
  parallaxState.listeners.add(update)

  // Initialize global listener only once (client-side only)
  if (!parallaxState.isInitialized && import.meta.client) {
    parallaxState.isInitialized = true
    parallaxState.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!parallaxState.prefersReducedMotion) {
      // Throttled mousemove handler using requestAnimationFrame
      const handleMouseMove = (e: MouseEvent) => {
        // Only schedule update if values actually changed
        const centerX = window.innerWidth / 2
        const centerY = window.innerHeight / 2
        const targetX = ((e.clientX - centerX) / centerX) * 20
        const targetY = ((e.clientY - centerY) / centerY) * 20

        if (Math.abs(targetX - parallaxState.lastX) < 0.1 &&
            Math.abs(targetY - parallaxState.lastY) < 0.1) {
          return // Skip if movement is too small
        }

        parallaxState.lastX = targetX
        parallaxState.lastY = targetY

        // Cancel pending RAF
        if (parallaxState.rafId !== null) {
          cancelAnimationFrame(parallaxState.rafId)
        }

        // Schedule update on next frame
        parallaxState.rafId = requestAnimationFrame(() => {
          parallaxState.x = targetX
          parallaxState.y = targetY

          // Notify all listeners
          parallaxState.listeners.forEach(listener => listener())

          parallaxState.rafId = null
        })
      }

      window.addEventListener('mousemove', handleMouseMove, { passive: true })
    }
  }

  // Set up IntersectionObserver for this section
  const cleanupObserver = () => {
    if (observer && sectionRef.value) {
      observer.unobserve(sectionRef.value)
    }
  }

  onMounted(() => {
    if (!sectionRef.value) return

    // Create IntersectionObserver if it doesn't exist
    if (!observer && !parallaxState.prefersReducedMotion) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            visibleSections.set(entry.target as HTMLElement, entry.isIntersecting)
          })
        },
        { rootMargin: '10%' } // Slightly提前 start observing
      )
    }

    // Observe this section
    if (observer) {
      observer.observe(sectionRef.value)
    }
  })

  // Check if section is visible (for conditional animation)
  const isVisible = computed(() => {
    if (!sectionRef.value) return true // Default to visible if ref not available
    return visibleSections.get(sectionRef.value) ?? true
  })

  // Cleanup on unmount
  onUnmounted(() => {
    cleanupObserver()
    parallaxState.listeners.delete(update)

    // Clean up global observer if no more listeners
    if (parallaxState.listeners.size === 0 && observer) {
      observer.disconnect()
      observer = null
    }
  })

  return {
    parallaxX: computed(() => isVisible.value ? parallaxX.value : 0),
    parallaxY: computed(() => isVisible.value ? parallaxY.value : 0),
    isVisible,
    prefersReducedMotion: computed(() => parallaxState.prefersReducedMotion),
  }
}
