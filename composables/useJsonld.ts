/**
 * Composable for adding JSON-LD structured data to pages
 * Helps search engines understand page content for rich results
 */
export function useJsonld(jsonld: any) {
  // Convert computed refs to their values and remove circular references
  const processed = JSON.parse(JSON.stringify(jsonld, (key, value) => {
    // Unwrap computed refs
    if (value && typeof value === 'object' && '__v_isRef' in value) {
      return toValue(value)
    }
    return value
  }))

  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(processed),
      },
    ],
  })
}
