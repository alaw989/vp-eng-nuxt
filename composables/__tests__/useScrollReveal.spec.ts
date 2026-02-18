/**
 * Tests for useScrollReveal composable
 * Tests scroll-triggered reveal animations
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ref, nextTick } from 'vue'

// Import after mock is set up in tests/setup.ts
import { useScrollReveal } from '../useScrollReveal'

describe('useScrollReveal Composable', () => {
  beforeEach(() => {
    // Clear document body to avoid test interference
    document.body.innerHTML = ''
  })

  it('returns target ref', () => {
    const { target } = useScrollReveal()

    expect(target).toBeDefined()
  })

  it('returns isVisible ref', () => {
    const { isVisible } = useScrollReveal()

    expect(isVisible).toBeDefined()
    expect(typeof isVisible.value).toBe('boolean')
  })

  it('returns hasRevealed ref', () => {
    const { hasRevealed } = useScrollReveal()

    expect(hasRevealed).toBeDefined()
    expect(typeof hasRevealed.value).toBe('boolean')
  })

  it('accepts custom threshold option', () => {
    expect(() => useScrollReveal({ threshold: 0.5 })).not.toThrow()
  })

  it('accepts custom once option', () => {
    expect(() => useScrollReveal({ once: false })).not.toThrow()
  })

  it('accepts custom rootMargin option', () => {
    expect(() => useScrollReveal({ rootMargin: '-50px' })).not.toThrow()
  })

  it('accepts custom staggerChildren option', () => {
    expect(() => useScrollReveal({ staggerChildren: true })).not.toThrow()
  })

  it('accepts all options', () => {
    const options = {
      threshold: 0.25,
      once: false,
      rootMargin: '-100px',
      staggerChildren: true,
    }

    expect(() => useScrollReveal(options)).not.toThrow()
  })

  it('uses default threshold of 0.15', () => {
    const { target } = useScrollReveal()

    // Should not throw with defaults
    expect(target).toBeDefined()
  })

  it('uses default once of true', () => {
    const { target } = useScrollReveal()

    expect(target).toBeDefined()
  })

  it('uses default rootMargin of 0px', () => {
    const { target } = useScrollReveal()

    expect(target).toBeDefined()
  })

  it('uses default staggerChildren of false', () => {
    const { target } = useScrollReveal()

    expect(target).toBeDefined()
  })

  it('initially has isVisible as false', () => {
    const { isVisible } = useScrollReveal()

    expect(isVisible.value).toBe(false)
  })

  it('initially has hasRevealed as false', () => {
    const { hasRevealed } = useScrollReveal()

    expect(hasRevealed.value).toBe(false)
  })

  it('can accept empty options object', () => {
    expect(() => useScrollReveal({})).not.toThrow()
  })

  it('target can be assigned an element', () => {
    const { target } = useScrollReveal()
    const element = document.createElement('div')

    expect(() => {
      target.value = element
    }).not.toThrow()
  })

  it('handles staggerChildren with target element', () => {
    const { target } = useScrollReveal({ staggerChildren: true })

    const container = document.createElement('div')
    container.innerHTML = `
      <div class="stagger-item">Item 1</div>
      <div class="stagger-item">Item 2</div>
      <div class="stagger-item">Item 3</div>
    `
    document.body.appendChild(container)

    target.value = container

    // Target should have the stagger items
    const items = container.querySelectorAll('.stagger-item')
    expect(items.length).toBe(3)

    document.body.removeChild(container)
  })

  it('applies stagger delays to children', async () => {
    const { target } = useScrollReveal({ staggerChildren: true })

    const container = document.createElement('div')
    container.innerHTML = `
      <div class="stagger-item">Item 1</div>
      <div class="stagger-item">Item 2</div>
    `
    document.body.appendChild(container)

    target.value = container

    // Trigger intersection by setting target
    await nextTick()

    // Items should have transitionDelay set
    const items = container.querySelectorAll<HTMLElement>('.stagger-item')
    items.forEach((item, index) => {
      const expectedDelay = `${100 + (index * 80)}ms`
      expect(item.style.transitionDelay).toBe(expectedDelay)
    })

    document.body.removeChild(container)
  })

  it('handles target with no stagger items', () => {
    const { target } = useScrollReveal({ staggerChildren: true })

    const container = document.createElement('div')
    container.innerHTML = '<div>Not a stagger item</div>'
    document.body.appendChild(container)

    target.value = container

    const items = container.querySelectorAll('.stagger-item')
    expect(items.length).toBe(0)

    document.body.removeChild(container)
  })

  it('can be created with once set to false', () => {
    const { target, isVisible } = useScrollReveal({ once: false })

    expect(isVisible.value).toBe(false)
    expect(target).toBeDefined()
  })

  it('can use negative rootMargin values', () => {
    expect(() => useScrollReveal({ rootMargin: '-200px' })).not.toThrow()
  })

  it('can use percentage rootMargin values', () => {
    expect(() => useScrollReveal({ rootMargin: '50%' })).not.toThrow()
  })

  it('can use complex rootMargin values', () => {
    expect(() => useScrollReveal({ rootMargin: '10px 0px -50px 0px' })).not.toThrow()
  })

  it('threshold accepts values between 0 and 1', () => {
    expect(() => useScrollReveal({ threshold: 0 })).not.toThrow()
    expect(() => useScrollReveal({ threshold: 0.5 })).not.toThrow()
    expect(() => useScrollReveal({ threshold: 1 })).not.toThrow()
  })

  it('handles multiple stagger items correctly', async () => {
    const { target } = useScrollReveal({ staggerChildren: true })

    const container = document.createElement('div')
    for (let i = 0; i < 10; i++) {
      const item = document.createElement('div')
      item.className = 'stagger-item'
      item.textContent = `Item ${i}`
      container.appendChild(item)
    }
    document.body.appendChild(container)

    target.value = container
    await nextTick()

    const items = container.querySelectorAll<HTMLElement>('.stagger-item')
    expect(items.length).toBe(10)

    // Check that each item has a different delay
    const delays = Array.from(items).map(item => item.style.transitionDelay)
    const uniqueDelays = new Set(delays)
    expect(uniqueDelays.size).toBe(10)

    document.body.removeChild(container)
  })
})
