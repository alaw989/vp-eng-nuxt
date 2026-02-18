/**
 * Tests for AppBreadcrumbs component
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppBreadcrumbs from '../AppBreadcrumbs.vue'

describe('AppBreadcrumbs Component', () => {
  it('renders with breadcrumbs prop', () => {
    const breadcrumbs = [
      { title: 'Projects', to: '/projects' },
      { title: 'Residential Project', to: '/projects/residential' },
      { title: 'Current Page' }
    ]

    const wrapper = mount(AppBreadcrumbs, {
      props: { breadcrumbs }
    })

    expect(wrapper.html()).toContain('Projects')
    expect(wrapper.html()).toContain('Residential Project')
    expect(wrapper.html()).toContain('Current Page')
  })

  it('has nav with aria-label="Breadcrumb"', () => {
    const breadcrumbs = [{ title: 'About', to: '/about' }]
    const wrapper = mount(AppBreadcrumbs, {
      props: { breadcrumbs }
    })

    const nav = wrapper.find('nav')
    expect(nav.attributes('aria-label')).toBe('Breadcrumb')
  })

  it('renders home link with home icon', () => {
    const breadcrumbs = [{ title: 'Services', to: '/services' }]
    const wrapper = mount(AppBreadcrumbs, {
      props: { breadcrumbs }
    })

    expect(wrapper.html()).toContain('mdi:home')
  })

  it('renders NuxtLink for breadcrumb with to prop', () => {
    const breadcrumbs = [
      { title: 'Projects', to: '/projects' }
    ]
    const wrapper = mount(AppBreadcrumbs, {
      props: { breadcrumbs }
    })

    expect(wrapper.html()).toContain('Projects')
  })

  it('renders span for breadcrumb without to prop (current page)', () => {
    const breadcrumbs = [
      { title: 'Projects', to: '/projects' },
      { title: 'Current Page' }
    ]
    const wrapper = mount(AppBreadcrumbs, {
      props: { breadcrumbs }
    })

    // Last breadcrumb should be a span with aria-current
    expect(wrapper.html()).toContain('aria-current="page"')
    expect(wrapper.html()).toContain('Current Page')
  })

  it('has schema.org microdata attributes', () => {
    const breadcrumbs = [{ title: 'About', to: '/about' }]
    const wrapper = mount(AppBreadcrumbs, {
      props: { breadcrumbs }
    })

    const ol = wrapper.find('ol')
    expect(ol.attributes('itemtype')).toBe('https://schema.org/BreadcrumbList')
    expect(ol.attributes('itemscope')).toBeDefined()
  })

  it('has chevron separator icon between breadcrumbs', () => {
    const breadcrumbs = [
      { title: 'Projects', to: '/projects' },
      { title: 'Current Page' }
    ]
    const wrapper = mount(AppBreadcrumbs, {
      props: { breadcrumbs }
    })

    expect(wrapper.html()).toContain('mdi:chevron-right')
  })

  it('handles empty breadcrumbs array', () => {
    const wrapper = mount(AppBreadcrumbs, {
      props: { breadcrumbs: [] }
    })

    // Should still render home link
    expect(wrapper.html()).toContain('mdi:home')
  })

  it('handles single breadcrumb without to prop', () => {
    const breadcrumbs = [{ title: 'Single Item' }]
    const wrapper = mount(AppBreadcrumbs, {
      props: { breadcrumbs }
    })

    expect(wrapper.html()).toContain('Single Item')
    expect(wrapper.html()).toContain('aria-current="page"')
  })

  it('generates correct position meta for breadcrumbs', () => {
    const breadcrumbs = [
      { title: 'Projects', to: '/projects' },
      { title: 'Project', to: '/projects/1' },
      { title: 'Details' }
    ]
    const wrapper = mount(AppBreadcrumbs, {
      props: { breadcrumbs }
    })

    // Home is position 1, first crumb is position 2, etc.
    expect(wrapper.html()).toContain('content="1"')
    expect(wrapper.html()).toContain('content="2"')
    expect(wrapper.html()).toContain('content="3"')
    expect(wrapper.html()).toContain('content="4"')
  })

  it('has correct link classes for navigation links', () => {
    const breadcrumbs = [{ title: 'Services', to: '/services' }]
    const wrapper = mount(AppBreadcrumbs, {
      props: { breadcrumbs }
    })

    expect(wrapper.html()).toContain('text-neutral-600')
    expect(wrapper.html()).toContain('hover:text-primary')
  })

  it('has correct classes for current page', () => {
    const breadcrumbs = [{ title: 'Current Page' }]
    const wrapper = mount(AppBreadcrumbs, {
      props: { breadcrumbs }
    })

    expect(wrapper.html()).toContain('text-neutral-900')
    expect(wrapper.html()).toContain('font-medium')
  })

  it('renders home link with correct URL', () => {
    const breadcrumbs = [{ title: 'About', to: '/about' }]
    const wrapper = mount(AppBreadcrumbs, {
      props: { breadcrumbs }
    })

    // Should have link to https://vp-associates.com/
    expect(wrapper.html()).toContain('https://vp-associates.com/')
  })

  it('generates correct full URLs for breadcrumbs', () => {
    const breadcrumbs = [
      { title: 'Projects', to: '/projects/residential' }
    ]
    const wrapper = mount(AppBreadcrumbs, {
      props: { breadcrumbs }
    })

    expect(wrapper.html()).toContain('https://vp-associates.com/projects/residential')
  })
})
