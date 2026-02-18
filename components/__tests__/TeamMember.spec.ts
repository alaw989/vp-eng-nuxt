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
    photo: '/jane.jpg',
    email: 'jane@example.com',
    phone: '555-1234',
    linkedin: 'https://linkedin.com/in/jane',
    priority: true
  }

  const globalStubs = {
    NuxtImg: { template: '<img />' },
    Icon: { template: '<span />' },
    NuxtLink: { template: '<a><slot /></a>' }
  }

  it('renders with all props', () => {
    const wrapper = mount(TeamMember, {
      props: defaultProps,
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('Jane Smith')
    expect(wrapper.html()).toContain('Senior Engineer')
    expect(wrapper.html()).toContain('Experienced structural engineer')
  })

  it('renders with minimal required props', () => {
    const minimalProps = {
      name: 'John Doe',
      title: 'Engineer'
    }

    const wrapper = mount(TeamMember, {
      props: minimalProps,
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('John Doe')
    expect(wrapper.html()).toContain('Engineer')
  })

  it('renders name in heading', () => {
    const wrapper = mount(TeamMember, {
      props: { name: 'Jane Smith', title: 'Engineer' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('Jane Smith')
  })

  it('renders title with primary color class', () => {
    const wrapper = mount(TeamMember, {
      props: { name: 'Jane', title: 'Senior Engineer' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('Senior Engineer')
  })

  it('renders bio when provided', () => {
    const wrapper = mount(TeamMember, {
      props: { name: 'Jane', title: 'Engineer', bio: 'This is a bio' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('This is a bio')
  })

  it('does not render bio when not provided', () => {
    const wrapper = mount(TeamMember, {
      props: { name: 'Jane', title: 'Engineer' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).not.toContain('line-clamp-3')
  })

  it('renders email link when provided', () => {
    const wrapper = mount(TeamMember, {
      props: { name: 'Jane', title: 'Engineer', email: 'jane@example.com' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('mailto:jane@example.com')
  })

  it('renders phone link when provided', () => {
    const wrapper = mount(TeamMember, {
      props: { name: 'Jane', title: 'Engineer', phone: '555-1234' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('tel:555-1234')
  })

  it('renders LinkedIn link when provided', () => {
    const wrapper = mount(TeamMember, {
      props: { name: 'Jane', title: 'Engineer', linkedin: 'https://linkedin.com/in/jane' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('https://linkedin.com/in/jane')
    expect(wrapper.html()).toContain('target="_blank"')
    expect(wrapper.html()).toContain('rel="noopener noreferrer"')
  })

  it('does not render contact section when no contact info provided', () => {
    const wrapper = mount(TeamMember, {
      props: { name: 'Jane', title: 'Engineer' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).not.toContain('border-t border-neutral-200')
  })

  it('has correct email aria-label', () => {
    const wrapper = mount(TeamMember, {
      props: { name: 'Jane Smith', title: 'Engineer', email: 'jane@example.com' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('aria-label="Email Jane Smith"')
  })

  it('has correct phone aria-label', () => {
    const wrapper = mount(TeamMember, {
      props: { name: 'Jane Smith', title: 'Engineer', phone: '555-1234' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('aria-label="Call Jane Smith"')
  })

  it('has correct LinkedIn aria-label', () => {
    const wrapper = mount(TeamMember, {
      props: { name: 'Jane Smith', title: 'Engineer', linkedin: 'https://linkedin.com/in/jane' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain(`aria-label="Jane Smith's LinkedIn"`)
  })

  it('has email icon', () => {
    const wrapper = mount(TeamMember, {
      props: { name: 'Jane', title: 'Engineer', email: 'jane@example.com' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('mdi:email')
  })

  it('has phone icon', () => {
    const wrapper = mount(TeamMember, {
      props: { name: 'Jane', title: 'Engineer', phone: '555-1234' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('mdi:phone')
  })

  it('has LinkedIn icon', () => {
    const wrapper = mount(TeamMember, {
      props: { name: 'Jane', title: 'Engineer', linkedin: 'https://linkedin.com/in/jane' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('mdi:linkedin')
  })

  it('has correct aspect ratio for photo container', () => {
    const wrapper = mount(TeamMember, {
      props: { name: 'Jane', title: 'Engineer' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('aspect-[4/5]')
  })

  it('renders placeholder icon when no photo provided', () => {
    const wrapper = mount(TeamMember, {
      props: { name: 'Jane', title: 'Engineer' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('mdi:account-tie')
  })

  it('has group classes for hover effects', () => {
    const wrapper = mount(TeamMember, {
      props: { name: 'Jane', title: 'Engineer' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('group')
    expect(wrapper.html()).toContain('hover:border-primary')
    expect(wrapper.html()).toContain('hover:shadow-xl')
  })

  it('has rounded-xl class', () => {
    const wrapper = mount(TeamMember, {
      props: { name: 'Jane', title: 'Engineer' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('rounded-xl')
  })

  it('has border classes', () => {
    const wrapper = mount(TeamMember, {
      props: { name: 'Jane', title: 'Engineer' },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('border border-neutral-200')
  })
})
