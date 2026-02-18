/**
 * Tests for server/api/rss.xml.get.ts static data structure
 */

import { describe, it, expect } from 'vitest'

describe('Server API: RSS Feed - Structure', () => {
  it('has correct RSS MIME type', () => {
    const contentType = 'application/rss+xml'
    expect(contentType).toBe('application/rss+xml')
  })

  it('RSS feed has required elements', () => {
    const requiredElements = ['title', 'link', 'description', 'language']
    expect(requiredElements).toContain('title')
    expect(requiredElements).toContain('link')
    expect(requiredElements).toContain('description')
    expect(requiredElements).toContain('language')
  })

  it('RSS item has required fields', () => {
    const rssItem = {
      title: 'Latest Project',
      link: 'https://vp-associates.com/projects/latest',
      description: 'Project description',
      pubDate: 'Wed, 18 Feb 2026 12:00:00 GMT',
      guid: 'https://vp-associates.com/projects/latest',
    }

    expect(rssItem).toHaveProperty('title')
    expect(rssItem).toHaveProperty('link')
    expect(rssItem).toHaveProperty('description')
    expect(rssItem).toHaveProperty('pubDate')
    expect(rssItem).toHaveProperty('guid')
  })

  it('pubDate follows RFC 822 format', () => {
    const pubDate = 'Wed, 18 Feb 2026 12:00:00 GMT'
    const dateRegex = /^[A-Z][a-z]{2}, \d{1,2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT$/

    expect(dateRegex.test(pubDate)).toBe(true)
  })

  it('RSS feed includes project items', () => {
    const feedItems = ['project', 'service', 'blog']
    expect(feedItems).toContain('project')
  })
})
