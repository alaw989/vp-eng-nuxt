/**
 * Composable for adding JSON-LD structured data to pages
 * Helps search engines understand page content for rich results
 */
export function useJsonld(jsonld: any) {
  // Use computed to create reactive head object
  const head = computed(() => {
    const value = typeof jsonld === 'function' ? jsonld() : toValue(jsonld)

    // Convert computed refs to their values and remove circular references
    const processed = JSON.parse(JSON.stringify(value, (key, val) => {
      // Unwrap computed refs
      if (val && typeof val === 'object' && '__v_isRef' in val) {
        return toValue(val)
      }
      return val
    }))

    return {
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify(processed),
        },
      ],
    }
  })

  useHead(head)
}
