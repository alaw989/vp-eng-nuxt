/**
 * HTML Entity Utilities
 * Shared utilities for decoding HTML entities from WordPress API responses.
 */

/**
 * Strip HTML tags from a string.
 */
export function stripHtml(text: string | undefined | null): string {
  if (!text) return ''
  return text.replace(/<[^>]*>/g, '').trim()
}

/**
 * Decode HTML entities to prevent hydration mismatches.
 * WordPress API returns encoded entities like &#038; which must be
 * decoded to match client-side rendering.
 */
export function decodeHtmlEntities(text: string | undefined | null): string {
  if (!text) return ''

  const entities: Record<string, string> = {
    '&#038;': '&',
    '&amp;': '&',
    '&#8217;': "'",
    '&#8216;': "'",
    '&#8220;': '"',
    '&#8221;': '"',
    '&#8211;': '-',
    '&#8212;': '--',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
    '&nbsp;': ' ',
    '&#160;': ' ',
    '&copy;': '(c)',
    '&reg;': '(r)',
    '&trade;': '(tm)',
    '&cent;': 'cent',
    '&pound;': 'GBP',
    '&euro;': 'EUR',
    '&mdash;': '--',
    '&ndash;': '-',
    '&hellip;': '...',
    '&ldquo;': '"',
    '&rdquo;': '"',
    '&lsquo;': "'",
    '&rsquo;': "'",
  }

  return text.replace(/&#?[a-z0-9]+;/gi, (entity) => entities[entity] || entity)
}
