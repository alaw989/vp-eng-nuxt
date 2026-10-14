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

  it('offers WordPress card sizes as a srcset when they exist', () => {
    const srcset = 'https://cms.example/a-480x320.jpg 480w, https://cms.example/a-768x512.jpg 768w, https://cms.example/a-1024x683.jpg 1024w'
    const wrapper = mount(ProjectCard, {
      props: { ...defaultProps, image: 'https://cms.example/a-1024x683.jpg', imageSrcset: srcset },
    })

    const img = wrapper.find('img')
    expect(img.attributes('srcset')).toBe(srcset)
    // Defaults to the /projects grid's card width
    expect(img.attributes('sizes')).toBe('(min-width: 1280px) 384px, (min-width: 1024px) calc(33.3vw - 43px), (min-width: 640px) calc(50vw - 40px), calc(100vw - 32px)')
    expect(img.attributes('alt')).toBe('')
  })

  it('sizes a list-view srcset image for its third-width column', () => {
    const wrapper = mount(ProjectCard, {
      props: { ...defaultProps, viewMode: 'list' as const, imageSrcset: '/a-480.jpg 480w' },
    })

    expect(wrapper.find('img').attributes('sizes')).toBe('(min-width: 768px) 33vw, 100vw')
  })

  it('renders correct link path', () => {
    const wrapper = mount(ProjectCard, {
      props: defaultProps,
    })

    const link = wrapper.find('a')
    expect(link.attributes('href')).toBe('/projects/test-project')
  })

  it('names the link by its visible text so the label matches what is shown (WCAG 2.5.3)', () => {
    const wrapper = mount(ProjectCard, {
      props: defaultProps,
    })

    const link = wrapper.find('a')
    expect(link.attributes('aria-label')).toBeUndefined()
    expect(link.text()).toContain('Test Project')
    expect(link.text()).toContain('Commercial')
    expect(link.text()).toContain('Tampa, FL')
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

  it('marks the project image decorative so the link name is not read twice', () => {
    const wrapper = mount(ProjectCard, {
      props: defaultProps,
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('alt')).toBe('')
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
