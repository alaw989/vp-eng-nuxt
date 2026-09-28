/**
 * Tests for BannerDrawing: fetches a shop-drawing SVG once idle and inlines it
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

const SVG = '<svg viewBox="0 0 10 10"><path pathLength="1" style="--i:0" d="M0 0h10"/></svg>'

function setViewport(wide: boolean) {
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: q.includes('min-width: 768px') ? wide : false
  })) as unknown as typeof window.matchMedia
}

// Fresh module per test so the visit-wide fetch cache starts empty
async function mountDrawing(props: Record<string, string> = {}) {
  vi.resetModules()
  const { default: BannerDrawing } = await import('../BannerDrawing.vue')
  const wrapper = mount(BannerDrawing, {
    props: { src: '/full.svg', liteSrc: '/lite.svg', ...props }
  })
  await vi.runAllTimersAsync()
  await flushPromises()
  return wrapper
}

describe('BannerDrawing', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // jsdom has no requestIdleCallback, so the component falls back to setTimeout
    delete (window as unknown as Record<string, unknown>).requestIdleCallback
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve(SVG) }) as unknown as typeof fetch
    setViewport(true)
  })

  it('renders nothing until the page is idle', async () => {
    vi.resetModules()
    const { default: BannerDrawing } = await import('../BannerDrawing.vue')
    const wrapper = mount(BannerDrawing, { props: { src: '/full.svg' } })
    expect(fetch).not.toHaveBeenCalled()
    expect(wrapper.find('svg').exists()).toBe(false)
  })

  it('inlines the full drawing on tablet and up', async () => {
    const wrapper = await mountDrawing()
    expect(fetch).toHaveBeenCalledWith('/full.svg')
    expect(wrapper.find('svg path').attributes('pathLength')).toBe('1')
  })

  it('inlines the lite drawing on phones', async () => {
    setViewport(false)
    await mountDrawing()
    expect(fetch).toHaveBeenCalledWith('/lite.svg')
  })

  it('falls back to the full drawing on phones when there is no lite one', async () => {
    setViewport(false)
    await mountDrawing({ liteSrc: '' })
    expect(fetch).toHaveBeenCalledWith('/full.svg')
  })

  it('fetches each drawing once per visit, however many banners mount', async () => {
    vi.resetModules()
    const { default: BannerDrawing } = await import('../BannerDrawing.vue')
    mount(BannerDrawing, { props: { src: '/full.svg' } })
    mount(BannerDrawing, { props: { src: '/full.svg' } })
    await vi.runAllTimersAsync()
    await flushPromises()
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('ignores anything that is not an SVG', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve('<html>404</html>') }) as unknown as typeof fetch
    const wrapper = await mountDrawing()
    expect(wrapper.html()).not.toContain('<html>')
    expect(wrapper.find('svg').exists()).toBe(false)
  })

  it('stays empty when the request fails', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('offline')) as unknown as typeof fetch
    const wrapper = await mountDrawing()
    expect(wrapper.find('svg').exists()).toBe(false)
  })

  it('waits to download a lazy drawing until it is scrolled near', async () => {
    let fire: IntersectionObserverCallback = () => {}
    const observe = vi.fn()
    window.IntersectionObserver = class {
      constructor(cb: IntersectionObserverCallback) { fire = cb }
      observe = observe
      disconnect = vi.fn()
    } as unknown as typeof IntersectionObserver

    const wrapper = await mountDrawing({ lazy: true } as unknown as Record<string, string>)
    expect(observe).toHaveBeenCalled()
    expect(fetch).not.toHaveBeenCalled()

    fire([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
    await vi.runAllTimersAsync()
    await flushPromises()
    expect(fetch).toHaveBeenCalledWith('/full.svg')
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('holds the draw-in until play turns on', async () => {
    const wrapper = await mountDrawing({ play: false } as unknown as Record<string, string>)
    expect(wrapper.classes()).toContain('is-paused')
    await wrapper.setProps({ play: true })
    expect(wrapper.classes()).not.toContain('is-paused')
  })

  it('is hidden from assistive technology and reserves its shape', async () => {
    const wrapper = await mountDrawing()
    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.attributes('style')).toContain('aspect-ratio')
  })
})
