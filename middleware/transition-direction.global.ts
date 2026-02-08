/*
 * Directional transitions for list/detail navigation:
 *
 * Test by navigating:
 * 1. Projects list -> Project detail: Should slide LEFT (forward)
 * 2. Project detail -> Projects list: Should slide RIGHT (back)
 * 3. Services list -> Service detail: Should slide LEFT (forward)
 * 4. Service detail -> Services list: Should slide RIGHT (back)
 * 5. Other routes (Home -> About): Should cross-fade (no slide)
 *
 * Reduced motion users always get cross-fade (no slide) regardless of route.
 */

export default defineNuxtRouteMiddleware((to, from) => {
  // Explicit route pairs that get directional transitions
  const directionalPairs = [
    // Projects: list -> detail (forward)
    { from: '/projects', to: /^\/projects\/[^/]+$/, direction: 'forward' },
    // Projects: detail -> list (back)
    { from: /^\/projects\/[^/]+$/, to: '/projects', direction: 'back' },
    // Services: list -> detail (forward)
    { from: '/services', to: /^\/services\/[^/]+$/, direction: 'forward' },
    // Services: detail -> list (back)
    { from: /^\/services\/[^/]+$/, to: '/services', direction: 'back' },
  ]

  // Check if current navigation matches a directional pair
  for (const pair of directionalPairs) {
    const fromMatch = typeof pair.from === 'string'
      ? from.path === pair.from
      : pair.from.test(from.path)
    const toMatch = typeof pair.to === 'string'
      ? to.path === pair.to
      : pair.to.test(to.path)

    if (fromMatch && toMatch) {
      // Set dynamic transition name
      if (to.meta.pageTransition && typeof to.meta.pageTransition !== 'boolean') {
        to.meta.pageTransition.name = pair.direction === 'forward' ? 'slide-left' : 'slide-right'
      }
      return
    }
  }

  // Default to cross-fade for non-matching routes
  if (to.meta.pageTransition && typeof to.meta.pageTransition !== 'boolean') {
    to.meta.pageTransition.name = 'page'
  }
})
