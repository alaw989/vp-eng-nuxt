/**
 * Tests for AppFooter component
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppFooter from '../AppFooter.vue'

describe('AppFooter Component', () => {
  it('renders with role="contentinfo"', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.find('[role="contentinfo"]').exists()).toBe(true)
  })

  it('renders company name "VP Associates"', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.html()).toContain('VP Associates')
  })

  it('renders company description mentioning Tampa Bay', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.html()).toContain('structural engineering')
    expect(wrapper.html()).toContain('Tampa Bay')
  })

  it('renders license number format', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.html()).toContain('FL License #')
  })

  it('renders quick links section', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.html()).toContain('Quick Links')
  })

  it('renders About quick link', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.html()).toContain('/about')
    expect(wrapper.html()).toContain('About Us')
  })

  it('renders Services quick link', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.html()).toContain('/services')
  })

  it('renders Projects quick link', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.html()).toContain('/projects')
    expect(wrapper.html()).toContain('Projects Portfolio')
  })

  it('renders Contact quick link', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.html()).toContain('/contact')
    expect(wrapper.html()).toContain('Contact Us')
  })

  it('renders services section', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.html()).toContain('Our Services')
  })

  it('renders structural steel design service link', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.html()).toContain('/services/structural-steel-design')
    expect(wrapper.html()).toContain('Structural Steel Design')
  })

  it('renders concrete design service link', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.html()).toContain('/services/concrete-design')
    expect(wrapper.html()).toContain('Concrete Design')
  })

  it('renders foundation design service link', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.html()).toContain('/services/foundation-design')
  })

  it('renders seawall design service link', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.html()).toContain('/services/seawall-design')
  })

  it('renders steel detailing service link', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.html()).toContain('/services/steel-detailing')
  })

  it('renders contact section', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.html()).toContain('Contact Info')
  })

  it('renders Tampa Bay Area location', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.html()).toContain('Tampa Bay Area')
    expect(wrapper.html()).toContain('Florida')
  })

  it('renders phone link with tel: protocol', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.html()).toContain('tel:')
    expect(wrapper.html()).toContain('813')
  })

  it('renders email link with mailto: protocol', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.html()).toContain('mailto:')
    expect(wrapper.html()).toContain('info@vp-associates.com')
  })

  it('renders business hours', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.html()).toContain('Mon-Fri')
    expect(wrapper.html()).toContain('8:00 AM')
    expect(wrapper.html()).toContain('5:00 PM')
  })

  it('renders current year in copyright', () => {
    const wrapper = mount(AppFooter)
    const currentYear = new Date().getFullYear()
    expect(wrapper.html()).toContain(currentYear.toString())
    expect(wrapper.html()).toContain('All rights reserved')
  })

  it('renders social media links', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.html()).toContain('linkedin')
    expect(wrapper.html()).toContain('facebook')
  })

  it('renders site map link', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.html()).toContain('/sitemap')
    expect(wrapper.html()).toContain('Site Map')
  })

  it('has neutral-900 background class', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.classes()).toContain('bg-neutral-900')
  })

  it('has address element with not-italic class', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.html()).toContain('not-italic')
  })
})
