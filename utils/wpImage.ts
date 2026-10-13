/**
 * Picking a WordPress image size for cards.
 * WordPress keeps the original upload (often 2560px, "-scaled.jpg") as
 * source_url, which is far more than a phone-width card needs.
 */

/** The parts of a WordPress media object used to choose a size */
export interface WpMedia {
  source_url?: string
  media_details?: {
    sizes?: Record<string, { source_url?: string } | undefined>
  }
}

/** The 1024px "large" size, then the 768px "medium_large", then the original; '' when there is none. */
export function wpImageUrl(media: WpMedia | null | undefined): string {
  const sizes = media?.media_details?.sizes
  return sizes?.large?.source_url || sizes?.medium_large?.source_url || media?.source_url || ''
}
