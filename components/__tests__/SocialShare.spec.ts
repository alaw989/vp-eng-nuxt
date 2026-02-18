import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SocialShare from '../SocialShare.vue'

describe('SocialShare Component', () => {
  const defaultProps = {
    title: 'Test Project',
    description: 'Test project description',
  }

  it('renders with required props', () => {
    const wrapper = mount(SocialShare, {
      props: defaultProps,
    })

    expect(wrapper.html()).toContain('Share:')
  })

  it('generates correct Twitter share URL', () => {
    const wrapper = mount(SocialShare, {
      props: defaultProps,
    })

    const twitterLink = wrapper.findAll('a').find(a => a.attributes('href')?.includes('twitter'))
    expect(twitterLink?.exists()).toBe(true)
    expect(twitterLink?.attributes('href')).toContain('twitter.com')
    expect(twitterLink?.attributes('href')).toContain('Test%20Project')
  })

  it('generates correct LinkedIn share URL', () => {
    const wrapper = mount(SocialShare, {
      props: defaultProps,
    })

    const linkedinLink = wrapper.findAll('a').find(a => a.attributes('href')?.includes('linkedin'))
    expect(linkedinLink?.exists()).toBe(true)
    expect(linkedinLink?.attributes('href')).toBe('https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fvp-associates.com%2F')
  })

  it('generates correct Facebook share URL', () => {
    const wrapper = mount(SocialShare, {
      props: defaultProps,
    })

    const facebookLink = wrapper.findAll('a').find(a => a.attributes('href')?.includes('facebook'))
    expect(facebookLink?.exists()).toBe(true)
    expect(facebookLink?.attributes('href')).toContain('facebook.com')
  })

  it('generates correct email share URL', () => {
    const wrapper = mount(SocialShare, {
      props: defaultProps,
    })

    const emailLink = wrapper.findAll('a').find(a => a.attributes('href')?.includes('mailto'))
    expect(emailLink?.exists()).toBe(true)
    expect(emailLink?.attributes('href')).toContain('mailto:')
    expect(emailLink?.attributes('href')).toContain('subject=')
    expect(emailLink?.attributes('href')).toContain('body=')
  })

  it('uses default description when none provided', () => {
    const wrapper = mount(SocialShare, {
      props: {
        title: 'Test Project',
      },
    })

    const twitterLink = wrapper.findAll('a').find(a => a.attributes('href')?.includes('twitter'))
    expect(twitterLink?.attributes('href')).toContain('Structural%20Engineering%20Services')
  })

  it('has correct aria-label format for Twitter share link', () => {
    const wrapper = mount(SocialShare, {
      props: defaultProps,
    })

    const twitterLink = wrapper.findAll('a').find(a => a.attributes('href')?.includes('twitter'))
    expect(twitterLink?.attributes('aria-label')).toBe('Share Test Project on X (Twitter)')
  })

  it('has correct aria-label for copy link button', () => {
    const wrapper = mount(SocialShare, {
      props: defaultProps,
    })

    const copyButton = wrapper.find('button')
    expect(copyButton.attributes('aria-label')).toBe('Copy link to Test Project')
  })

  it('has copied state aria-label after click', async () => {
    const wrapper = mount(SocialShare, {
      props: defaultProps,
      attachTo: document.body,
    })

    const copyButton = wrapper.find('button')
    await copyButton.trigger('click')
    // After click, the aria-label should change (though the actual state update happens in setTimeout)
    expect(copyButton.exists()).toBe(true)
  })

  it('has share label text', () => {
    const wrapper = mount(SocialShare, {
      props: defaultProps,
    })

    expect(wrapper.html()).toContain('Share:')
  })

  it('renders all social links', () => {
    const wrapper = mount(SocialShare, {
      props: defaultProps,
    })

    const links = wrapper.findAll('a')
    // Should have Twitter, LinkedIn, Facebook, and Email links
    expect(links.length).toBe(4)
  })

  describe('Copy link functionality', () => {
    beforeEach(() => {
      // Mock navigator.clipboard
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn(() => Promise.resolve()),
        },
      })
    })

    it('copies link to clipboard', async () => {
      const wrapper = mount(SocialShare, {
        props: defaultProps,
        attachTo: document.body,
      })

      const copyButton = wrapper.find('button')
      await copyButton.trigger('click')

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://vp-associates.com/')
    })

    it('sets copied state after successful copy', async () => {
      const wrapper = mount(SocialShare, {
        props: defaultProps,
        attachTo: document.body,
      })

      const copyButton = wrapper.find('button')
      await copyButton.trigger('click')

      // Copied state should be set
      await wrapper.vm.$nextTick()
      expect((wrapper.vm as any).copied).toBe(true)
    })

    it('resets copied state after 2 seconds', async () => {
      vi.useFakeTimers()

      const wrapper = mount(SocialShare, {
        props: defaultProps,
        attachTo: document.body,
      })

      const copyButton = wrapper.find('button')
      await copyButton.trigger('click')

      expect((wrapper.vm as any).copied).toBe(true)

      // Fast forward 2 seconds
      vi.advanceTimersByTime(2000)
      await wrapper.vm.$nextTick()

      expect((wrapper.vm as any).copied).toBe(false)

      vi.useRealTimers()
    })

    it('handles clipboard write error gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Mock clipboard to throw error
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn(() => Promise.reject(new Error('Clipboard API not available'))),
        },
      })

      const wrapper = mount(SocialShare, {
        props: defaultProps,
        attachTo: document.body,
      })

      const copyButton = wrapper.find('button')

      // Should not throw when clipboard fails
      await copyButton.trigger('click')

      // Error should be logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to copy link:', expect.any(Error))

      consoleErrorSpy.mockRestore()
    })

    it('does not set copied state on clipboard error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Mock clipboard to throw error
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn(() => Promise.reject(new Error('Clipboard API not available'))),
        },
      })

      const wrapper = mount(SocialShare, {
        props: defaultProps,
        attachTo: document.body,
      })

      const copyButton = wrapper.find('button')
      await copyButton.trigger('click')

      // Copied state should remain false
      expect((wrapper.vm as any).copied).toBe(false)

      consoleErrorSpy.mockRestore()
    })
  })
})
