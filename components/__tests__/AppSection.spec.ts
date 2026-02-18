/**
 * Tests for AppSection component
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AppSection from '../AppSection.vue'

// Mock useScrollReveal composable
vi.mock('~/composables/useScrollReveal', () => ({
  useScrollReveal: vi.fn(() => ({
    target: ref(null),
    isVisible: ref(false),
    hasRevealed: ref(false)
  }))
}))

describe('AppSection Component', () => {
  it('renders with default props', () => {
    const wrapper = mount(AppSection, {
      slots: { default: '<div>Content</div>' }
    })
    expect(wrapper.html()).toContain('Content')
  })

  it('has section element with relative class', () => {
    const wrapper = mount(AppSection, {
      slots: { default: '<div>Content</div>' }
    })
    const section = wrapper.find('section')
    expect(section.classes()).toContain('relative')
  })

  it('applies bg-white by default', () => {
    const wrapper = mount(AppSection, {
      slots: { default: '<div>Content</div>' }
    })
    const section = wrapper.find('section')
    expect(section.classes()).toContain('bg-white')
  })

  it('applies neutral background when bgColor is "neutral"', () => {
    const wrapper = mount(AppSection, {
      props: { bgColor: 'neutral' },
      slots: { default: '<div>Content</div>' }
    })
    const section = wrapper.find('section')
    expect(section.classes()).toContain('bg-neutral-900')
  })

  it('applies primary background with white text', () => {
    const wrapper = mount(AppSection, {
      props: { bgColor: 'primary' },
      slots: { default: '<div>Content</div>' }
    })
    const section = wrapper.find('section')
    expect(section.classes()).toContain('bg-primary')
    expect(section.classes()).toContain('text-white')
  })

  it('applies primary-dark background with white text', () => {
    const wrapper = mount(AppSection, {
      props: { bgColor: 'primary-dark' },
      slots: { default: '<div>Content</div>' }
    })
    const section = wrapper.find('section')
    expect(section.classes()).toContain('bg-primary-dark')
  })

  it('applies secondary background with white text', () => {
    const wrapper = mount(AppSection, {
      props: { bgColor: 'secondary' },
      slots: { default: '<div>Content</div>' }
    })
    const section = wrapper.find('section')
    expect(section.classes()).toContain('bg-secondary')
  })

  it('applies neutral-50 background', () => {
    const wrapper = mount(AppSection, {
      props: { bgColor: 'neutral-50' },
      slots: { default: '<div>Content</div>' }
    })
    const section = wrapper.find('section')
    expect(section.classes()).toContain('bg-neutral-50')
  })

  it('applies neutral-100 background', () => {
    const wrapper = mount(AppSection, {
      props: { bgColor: 'neutral-100' },
      slots: { default: '<div>Content</div>' }
    })
    const section = wrapper.find('section')
    expect(section.classes()).toContain('bg-neutral-100')
  })

  it('applies container class by default', () => {
    const wrapper = mount(AppSection, {
      slots: { default: '<div>Content</div>' }
    })
    expect(wrapper.html()).toContain('container')
  })

  it('applies narrow container when container is "narrow"', () => {
    const wrapper = mount(AppSection, {
      props: { container: 'narrow' },
      slots: { default: '<div>Content</div>' }
    })
    expect(wrapper.html()).toContain('max-w-5xl')
  })

  it('applies wide container when container is "wide"', () => {
    const wrapper = mount(AppSection, {
      props: { container: 'wide' },
      slots: { default: '<div>Content</div>' }
    })
    expect(wrapper.html()).toContain('max-w-full')
  })

  it('applies no container when container is false', () => {
    const wrapper = mount(AppSection, {
      props: { container: false },
      slots: { default: '<div>Content</div>' }
    })
    const innerDiv = wrapper.find('.relative.z-10')
    expect(innerDiv.classes()).not.toContain('container')
  })

  it('applies lg padding by default', () => {
    const wrapper = mount(AppSection, {
      slots: { default: '<div>Content</div>' }
    })
    const section = wrapper.find('section')
    expect(section.classes()).toContain('py-16')
  })

  it('applies sm padding when padding is "sm"', () => {
    const wrapper = mount(AppSection, {
      props: { padding: 'sm' },
      slots: { default: '<div>Content</div>' }
    })
    const section = wrapper.find('section')
    expect(section.classes()).toContain('py-8')
  })

  it('applies md padding when padding is "md"', () => {
    const wrapper = mount(AppSection, {
      props: { padding: 'md' },
      slots: { default: '<div>Content</div>' }
    })
    const section = wrapper.find('section')
    expect(section.classes()).toContain('py-12')
  })

  it('applies xl padding when padding is "xl"', () => {
    const wrapper = mount(AppSection, {
      props: { padding: 'xl' },
      slots: { default: '<div>Content</div>' }
    })
    const section = wrapper.find('section')
    expect(section.classes()).toContain('py-24')
  })

  it('applies no padding when padding is "none"', () => {
    const wrapper = mount(AppSection, {
      props: { padding: 'none' },
      slots: { default: '<div>Content</div>' }
    })
    const section = wrapper.find('section')
    // Should not have py- classes
    const hasPyClass = section.classes().some(c => c.startsWith('py-'))
    expect(hasPyClass).toBe(false)
  })

  it('adds border when border prop is true', () => {
    const wrapper = mount(AppSection, {
      props: { border: true },
      slots: { default: '<div>Content</div>' }
    })
    const section = wrapper.find('section')
    expect(section.classes()).toContain('border-b')
    expect(section.classes()).toContain('border-neutral-200')
  })

  it('adds elevation shadow when elevation prop is true', () => {
    const wrapper = mount(AppSection, {
      props: { elevation: true },
      slots: { default: '<div>Content</div>' }
    })
    const section = wrapper.find('section')
    // Check for shadow class (with escaped regex for special chars)
    const hasShadow = section.classes().some(c => c.includes('shadow'))
    expect(hasShadow).toBe(true)
  })

  it('renders top fade gradient when topFade is true', () => {
    const wrapper = mount(AppSection, {
      props: { topFade: true },
      slots: { default: '<div>Content</div>' }
    })
    expect(wrapper.html()).toContain('bg-gradient-to-b')
    expect(wrapper.html()).toContain('from-white/80')
  })

  it('renders bottom fade gradient when bottomFade is true', () => {
    const wrapper = mount(AppSection, {
      props: { bottomFade: true },
      slots: { default: '<div>Content</div>' }
    })
    expect(wrapper.html()).toContain('bg-gradient-to-t')
  })

  it('renders primary corner accent when cornerAccent is "primary"', () => {
    const wrapper = mount(AppSection, {
      props: { cornerAccent: 'primary' },
      slots: { default: '<div>Content</div>' }
    })
    expect(wrapper.html()).toContain('bg-gradient-to-bl')
    expect(wrapper.html()).toContain('from-primary/5')
  })

  it('renders secondary corner accent when cornerAccent is "secondary"', () => {
    const wrapper = mount(AppSection, {
      props: { cornerAccent: 'secondary' },
      slots: { default: '<div>Content</div>' }
    })
    expect(wrapper.html()).toContain('from-secondary/10')
  })

  it('has z-10 class on inner container', () => {
    const wrapper = mount(AppSection, {
      slots: { default: '<div>Content</div>' }
    })
    const innerDiv = wrapper.find('.relative.z-10')
    expect(innerDiv.exists()).toBe(true)
  })

  it('applies neutral-50-pattern background', () => {
    const wrapper = mount(AppSection, {
      props: { bgColor: 'neutral-50-pattern' },
      slots: { default: '<div>Content</div>' }
    })
    const section = wrapper.find('section')
    expect(section.classes()).toContain('bg-neutral-50')
    // Should have inline style for pattern
    expect(section.attributes('style')).toContain('background-image')
  })

  it('applies neutral-100-pattern background', () => {
    const wrapper = mount(AppSection, {
      props: { bgColor: 'neutral-100-pattern' },
      slots: { default: '<div>Content</div>' }
    })
    const section = wrapper.find('section')
    expect(section.classes()).toContain('bg-neutral-100')
    // Should have inline style for pattern
    expect(section.attributes('style')).toContain('background-image')
  })

  it('applies secondary/5 light green tint', () => {
    const wrapper = mount(AppSection, {
      props: { bgColor: 'secondary/5' },
      slots: { default: '<div>Content</div>' }
    })
    const section = wrapper.find('section')
    expect(section.classes()).toContain('bg-secondary/5')
  })

  it('applies secondary/10 medium green tint', () => {
    const wrapper = mount(AppSection, {
      props: { bgColor: 'secondary/10' },
      slots: { default: '<div>Content</div>' }
    })
    const section = wrapper.find('section')
    expect(section.classes()).toContain('bg-secondary/10')
  })

  it('sets up scroll reveal when animateOnScroll is true', () => {
    const wrapper = mount(AppSection, {
      props: { animateOnScroll: true },
      slots: { default: '<div>Content</div>' }
    })
    // Section should have scroll-reveal class
    const section = wrapper.find('section')
    expect(section.classes()).toContain('scroll-reveal')
  })

  it('adds stagger-children class when staggerChildren is true', () => {
    const wrapper = mount(AppSection, {
      props: { staggerChildren: true },
      slots: { default: '<div>Content</div>' }
    })
    const section = wrapper.find('section')
    expect(section.classes()).toContain('stagger-children')
  })
})
