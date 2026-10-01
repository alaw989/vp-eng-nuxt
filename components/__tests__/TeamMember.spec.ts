/**
 * Tests for TeamMember component
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TeamMember from '../TeamMember.vue'

describe('TeamMember Component', () => {
  const defaultProps = {
    name: 'Jane Smith',
    title: 'Senior Engineer',
    bio: 'Experienced structural engineer with 15+ years in the industry.',
    email: 'jane@example.com',
    phone: '(813) 555-0123',
    linkedin: 'https://linkedin.com/in/jane'
  }

  it('renders with all props', () => {
    const wrapper = mount(TeamMember, { props: defaultProps })

    expect(wrapper.html()).toContain('Jane Smith')
    expect(wrapper.html()).toContain('Senior Engineer')
    expect(wrapper.html()).toContain('Experienced structural engineer')
  })

  it('renders with minimal required props', () => {
    const wrapper = mount(TeamMember, { props: { name: 'John Doe', title: 'Engineer' } })

    expect(wrapper.html()).toContain('John Doe')
    expect(wrapper.html()).toContain('Engineer')
  })

  it('renders the name as a heading', () => {
    const wrapper = mount(TeamMember, { props: { name: 'Jane Smith', title: 'Engineer' } })

    expect(wrapper.find('h3').text()).toBe('Jane Smith')
  })

  it('renders the title as the label above the name', () => {
    const wrapper = mount(TeamMember, { props: { name: 'Jane', title: 'Senior Engineer' } })

    expect(wrapper.find('.eyebrow').text()).toBe('Senior Engineer')
  })

  it('renders bio when provided', () => {
    const wrapper = mount(TeamMember, {
      props: { name: 'Jane', title: 'Engineer', bio: 'This is a bio' }
    })

    expect(wrapper.html()).toContain('This is a bio')
  })

  it('does not render bio when not provided', () => {
    const wrapper = mount(TeamMember, { props: { name: 'Jane', title: 'Engineer' } })

    expect(wrapper.find('h3 + p').exists()).toBe(false)
  })

  it('has no photo or placeholder image', () => {
    const wrapper = mount(TeamMember, { props: defaultProps })

    expect(wrapper.find('img, picture, svg').exists()).toBe(false)
    expect(wrapper.find('[class*="aspect-"]').exists()).toBe(false)
  })

  it('names the firm in the title block', () => {
    const wrapper = mount(TeamMember, { props: { name: 'Jane', title: 'Engineer' } })

    expect(wrapper.find('dl').text()).toContain('VP & Associates, Inc.')
    expect(wrapper.find('dl').text()).toContain('Tampa, FL')
  })

  it('renders email link when provided', () => {
    const wrapper = mount(TeamMember, {
      props: { name: 'Jane', title: 'Engineer', email: 'jane@example.com' }
    })

    const link = wrapper.find('a[href="mailto:jane@example.com"]')
    expect(link.exists()).toBe(true)
    expect(link.text()).toBe('jane@example.com')
  })

  it('renders phone link when provided', () => {
    const wrapper = mount(TeamMember, {
      props: { name: 'Jane', title: 'Engineer', phone: '(813) 555-0123' }
    })

    const link = wrapper.find('a[href="tel:+18135550123"]')
    expect(link.exists()).toBe(true)
    expect(link.text()).toBe('(813) 555-0123')
  })

  it('renders LinkedIn link when provided', () => {
    const wrapper = mount(TeamMember, {
      props: { name: 'Jane', title: 'Engineer', linkedin: 'https://linkedin.com/in/jane' }
    })

    const link = wrapper.find('a[href="https://linkedin.com/in/jane"]')
    expect(link.exists()).toBe(true)
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toBe('noopener noreferrer')
  })

  it('renders no contact links when no contact info provided', () => {
    const wrapper = mount(TeamMember, { props: { name: 'Jane', title: 'Engineer' } })

    expect(wrapper.find('a').exists()).toBe(false)
  })

  it('omits the call link when the phone number is not a full US number', () => {
    const wrapper = mount(TeamMember, {
      props: { name: 'Jane', title: 'Engineer', phone: '234234233' }
    })

    expect(wrapper.find('a[href^="tel:"]').exists()).toBe(false)
    expect(wrapper.html()).not.toContain('234234233')
  })

  it('has correct email aria-label', () => {
    const wrapper = mount(TeamMember, {
      props: { name: 'Jane Smith', title: 'Engineer', email: 'jane@example.com' }
    })

    expect(wrapper.html()).toContain('aria-label="Email Jane Smith"')
  })

  it('has correct phone aria-label', () => {
    const wrapper = mount(TeamMember, {
      props: { name: 'Jane Smith', title: 'Engineer', phone: '(813) 555-0123' }
    })

    expect(wrapper.html()).toContain('aria-label="Call Jane Smith"')
  })

  it('has correct LinkedIn aria-label', () => {
    const wrapper = mount(TeamMember, {
      props: { name: 'Jane Smith', title: 'Engineer', linkedin: 'https://linkedin.com/in/jane' }
    })

    expect(wrapper.html()).toContain(`aria-label="Jane Smith's LinkedIn"`)
  })

  it('uses the ruled title-block frame rather than the shared card', () => {
    const wrapper = mount(TeamMember, { props: { name: 'Jane', title: 'Engineer' } })

    expect(wrapper.element.tagName).toBe('ARTICLE')
    expect(wrapper.classes()).toContain('border')
    expect(wrapper.classes()).not.toContain('card')
  })
})
