/**
 * usePageTransition Composable
 *
 * Provides central source of truth for page transition configuration.
 * Used for accessibility-aware transitions and reduced motion support.
 *
 * Per Phase 19 user requirements:
 * - Transition duration: always 150ms (snappy, responsive feel)
 * - Transition easing: ease-in-out for symmetric feel
 * - Reduced motion users: same 150ms with simpler effect (no transforms)
 */

import { usePreferredReducedMotion } from '@vueuse/core'
import type { ComputedRef, Ref } from 'vue'

export function usePageTransition() {
  // Detect OS-level reduced motion preference (returns ComputedRef<ReducedMotionType>)
  const prefersReducedMotion = usePreferredReducedMotion()

  // Fixed transition duration per user requirement (150ms for snappy feel)
  const transitionDuration: ComputedRef<string> = computed(() => '150ms')

  // Easing function for smooth, symmetric transitions
  const transitionEasing: ComputedRef<string> = computed(() => 'ease-in-out')

  return {
    prefersReducedMotion,
    transitionDuration,
    transitionEasing,
  }
}
