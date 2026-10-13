import { describe, it, expect } from 'vitest'
import { wpImageUrl } from '../wpImage'

const upload = 'https://cms.vp-associates.com/wp-content/uploads/2026/02/I-95-D1-pdf'

describe('wpImageUrl', () => {
  it('prefers the 1024px large size over the 2560px original', () => {
    expect(wpImageUrl({
      source_url: `${upload}-scaled.jpg`,
      media_details: { sizes: {
        medium_large: { source_url: `${upload}-768x512.jpg` },
        large: { source_url: `${upload}-1024x683.jpg` },
      } },
    })).toBe(`${upload}-1024x683.jpg`)
  })

  it('falls back to medium_large, then the original', () => {
    expect(wpImageUrl({
      source_url: `${upload}.jpg`,
      media_details: { sizes: { medium_large: { source_url: `${upload}-768x512.jpg` } } },
    })).toBe(`${upload}-768x512.jpg`)

    // Uploads smaller than 1024px have no large size
    expect(wpImageUrl({ source_url: `${upload}.jpg`, media_details: { sizes: {} } })).toBe(`${upload}.jpg`)
  })

  it('returns an empty string when there is no media', () => {
    expect(wpImageUrl(undefined)).toBe('')
    expect(wpImageUrl({})).toBe('')
  })
})
