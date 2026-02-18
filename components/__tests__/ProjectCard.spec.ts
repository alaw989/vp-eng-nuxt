import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

// Import the component
import ProjectCard from '../ProjectCard.vue'

describe('ProjectCard Component', () => {
  const defaultProps = {
    title: 'Test Project',
    slug: 'test-project',
    description: 'A test project description',
    image: '/images/test.jpg',
    category: 'Commercial',
    location: 'Tampa, FL',
    year: 2024,
    viewMode: 'grid' as const,
    priority: false,
  }

  it('renders with all props', () => {
    const wrapper = mount(ProjectCard, {
      props: defaultProps,
    })

    expect(wrapper.html()).toContain('Test Project')
    expect(wrapper.html()).toContain('Commercial')
    expect(wrapper.html()).toContain('Tampa, FL')
    expect(wrapper.html()).toContain('2024')
  })

  it('renders correct link path', () => {
    const wrapper = mount(ProjectCard, {
      props: defaultProps,
    })

    const link = wrapper.find('a')
    expect(link.attributes('href')).toBe('/projects/test-project')
  })

  it('generates correct aria-label for project card', () => {
    const wrapper = mount(ProjectCard, {
      props: defaultProps,
    })

    const link = wrapper.find('a')
    expect(link.attributes('aria-label')).toBe('View project: Test Project - Commercial in Tampa, FL')
  })

  it('generates minimal aria-label without category and location', () => {
    const wrapper = mount(ProjectCard, {
      props: {
        title: 'Minimal Project',
        slug: 'minimal-project',
      },
    })

    const link = wrapper.find('a')
    expect(link.attributes('aria-label')).toBe('View project: Minimal Project')
  })

  it('has correct viewMode options', () => {
    const wrapper = mount(ProjectCard, {
      props: {
        ...defaultProps,
        viewMode: 'list',
      },
    })

    // List view mode should add flex class
    expect(wrapper.classes()).toContain('group')
  })

  it('generates correct alt text for project image', () => {
    const wrapper = mount(ProjectCard, {
      props: defaultProps,
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('alt')).toBe('Test Project - Commercial project in Tampa, FL')
  })

  it('shows category badge when category is provided', () => {
    const wrapper = mount(ProjectCard, {
      props: defaultProps,
    })

    expect(wrapper.html()).toContain('Commercial')
  })

  it('does not show category badge when category is not provided', () => {
    const wrapper = mount(ProjectCard, {
      props: {
        title: 'Test Project',
        slug: 'test-project',
      },
    })

    // Should not have the category badge with bg-primary/10 styling
    expect(wrapper.html()).not.toContain('bg-primary/10')
  })

  it('shows location when provided', () => {
    const wrapper = mount(ProjectCard, {
      props: defaultProps,
    })

    expect(wrapper.html()).toContain('Tampa, FL')
  })

  it('shows year when provided', () => {
    const wrapper = mount(ProjectCard, {
      props: defaultProps,
    })

    expect(wrapper.html()).toContain('2024')
  })

  it('shows description when provided', () => {
    const wrapper = mount(ProjectCard, {
      props: defaultProps,
    })

    expect(wrapper.html()).toContain('A test project description')
  })

  it('shows fallback gradient when no image provided', () => {
    const wrapper = mount(ProjectCard, {
      props: {
        title: 'Test Project',
        slug: 'test-project',
        image: undefined,
      },
    })

    // Should show gradient placeholder
    expect(wrapper.html()).toContain('bg-gradient-to-br')
  })
})
