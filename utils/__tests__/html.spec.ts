import { describe, it, expect } from 'vitest'
import { decodeHtmlEntities } from '../html'

describe('decodeHtmlEntities', () => {
  it('returns empty string for undefined input', () => {
    expect(decodeHtmlEntities(undefined)).toBe('')
  })

  it('returns empty string for null input', () => {
    expect(decodeHtmlEntities(null)).toBe('')
  })

  it('returns empty string for empty string', () => {
    expect(decodeHtmlEntities('')).toBe('')
  })

  it('decodes ampersand entities', () => {
    expect(decodeHtmlEntities('&amp;')).toBe('&')
    expect(decodeHtmlEntities('&#038;')).toBe('&')
    expect(decodeHtmlEntities('Tom &amp; Jerry')).toBe('Tom & Jerry')
    expect(decodeHtmlEntities('A &#038; B')).toBe('A & B')
  })

  it('decodes quote entities', () => {
    expect(decodeHtmlEntities('&#8217;')).toBe("'")
    expect(decodeHtmlEntities('&#8216;')).toBe("'")
    expect(decodeHtmlEntities('&#8220;')).toBe('"')
    expect(decodeHtmlEntities('&#8221;')).toBe('"')
    expect(decodeHtmlEntities('&quot;')).toBe('"')
    expect(decodeHtmlEntities('&#039;')).toBe("'")
  })

  it('decodes dash entities', () => {
    expect(decodeHtmlEntities('&#8211;')).toBe('-')
    expect(decodeHtmlEntities('&#8212;')).toBe('--')
    expect(decodeHtmlEntities('&mdash;')).toBe('--')
    expect(decodeHtmlEntities('&ndash;')).toBe('-')
  })

  it('decodes comparison entities', () => {
    expect(decodeHtmlEntities('&lt;')).toBe('<')
    expect(decodeHtmlEntities('&gt;')).toBe('>')
  })

  it('decodes space entities', () => {
    expect(decodeHtmlEntities('&nbsp;')).toBe(' ')
    expect(decodeHtmlEntities('&#160;')).toBe(' ')
  })

  it('decodes special character entities', () => {
    expect(decodeHtmlEntities('&hellip;')).toBe('...')
    expect(decodeHtmlEntities('&ldquo;')).toBe('"')
    expect(decodeHtmlEntities('&rdquo;')).toBe('"')
    expect(decodeHtmlEntities('&lsquo;')).toBe("'")
    expect(decodeHtmlEntities('&rsquo;')).toBe("'")
  })

  it('decodes trademark and copyright entities', () => {
    expect(decodeHtmlEntities('&copy;')).toBe('(c)')
    expect(decodeHtmlEntities('&reg;')).toBe('(r)')
    expect(decodeHtmlEntities('&trade;')).toBe('(tm)')
  })

  it('decodes currency entities', () => {
    expect(decodeHtmlEntities('&cent;')).toBe('cent')
    expect(decodeHtmlEntities('&pound;')).toBe('GBP')
    expect(decodeHtmlEntities('&euro;')).toBe('EUR')
  })

  it('handles multiple entities in one string', () => {
    expect(decodeHtmlEntities('Tom &amp; Jerry&#8217;s Adventure'))
      .toBe("Tom & Jerry's Adventure")
  })

  it('handles complex WordPress content', () => {
    const input = 'Structural Engineering &amp; Design &#8211; Projects &#8220;A&#8221; through &#8220;Z&#8221;'
    const expected = 'Structural Engineering & Design - Projects "A" through "Z"'
    expect(decodeHtmlEntities(input)).toBe(expected)
  })

  it('leaves unknown entities unchanged', () => {
    expect(decodeHtmlEntities('&unknown;')).toBe('&unknown;')
    expect(decodeHtmlEntities('&#9999;')).toBe('&#9999;')
  })

  it('handles mixed content with entities and plain text', () => {
    expect(decodeHtmlEntities('Hello &amp; welcome to &lt;VP Associates&gt;'))
      .toBe('Hello & welcome to <VP Associates>')
  })

  it('preserves numbers and other characters', () => {
    expect(decodeHtmlEntities('123 Main St')).toBe('123 Main St')
    expect(decodeHtmlEntities('Call: 555-1234')).toBe('Call: 555-1234')
  })

  it('handles string with only spaces', () => {
    expect(decodeHtmlEntities('   ')).toBe('   ')
  })
})
