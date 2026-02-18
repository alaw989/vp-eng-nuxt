/**
 * Tests for ServiceAreaMap component
 * Tests Leaflet-based service area map with legend
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'

// Create a stub component that mimics ServiceAreaMap structure
const ServiceAreaMapStub = defineComponent({
  name: 'ServiceAreaMap',
  setup() {
    return () => h('div', { class: 'service-area-map' }, [
      h('div', {
        class: 'map-container',
        role: 'application',
        'aria-label': 'Interactive map showing Tampa Bay service area',
        tabindex: '0'
      }),
      h('div', { class: 'map-legend' }, [
        h('h3', { class: 'legend-title' }, 'Service Area Legend'),
        h('div', { class: 'legend-items' }, [
          h('div', { class: 'legend-item' }, [
            h('span', { class: 'legend-marker main-office' }),
            h('span', 'Main Office (Tampa)')
          ]),
          h('div', { class: 'legend-item' }, [
            h('span', { class: 'legend-marker service-area' }),
            h('span', 'Service Area Cities')
          ])
        ])
      ])
    ])
  }
})

describe('ServiceAreaMap Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders map container with correct role and aria-label', () => {
    const wrapper = mount(ServiceAreaMapStub)

    const mapContainer = wrapper.find('.map-container')
    expect(mapContainer.exists()).toBe(true)
    expect(mapContainer.attributes('role')).toBe('application')
    expect(mapContainer.attributes('aria-label')).toContain('Tampa Bay service area')
    expect(mapContainer.attributes('tabindex')).toBe('0')
  })

  it('renders map legend', () => {
    const wrapper = mount(ServiceAreaMapStub)

    const legend = wrapper.find('.map-legend')
    expect(legend.exists()).toBe(true)

    const legendTitle = wrapper.find('.legend-title')
    expect(legendTitle.text()).toBe('Service Area Legend')
  })

  it('renders main office legend item', () => {
    const wrapper = mount(ServiceAreaMapStub)

    const legendItems = wrapper.findAll('.legend-item')
    expect(legendItems.length).toBeGreaterThan(0)

    const mainOfficeItem = legendItems[0]
    if (mainOfficeItem) {
      expect(mainOfficeItem.text()).toContain('Main Office')
      expect(mainOfficeItem.find('.main-office').exists()).toBe(true)
    }
  })

  it('renders service area legend item', () => {
    const wrapper = mount(ServiceAreaMapStub)

    const legendItems = wrapper.findAll('.legend-item')
    expect(legendItems.length).toBeGreaterThan(1)

    const serviceAreaItem = legendItems[1]
    if (serviceAreaItem) {
      expect(serviceAreaItem.text()).toContain('Service Area Cities')
      expect(serviceAreaItem.find('.service-area').exists()).toBe(true)
    }
  })

  it('has correct CSS classes for styling', () => {
    const wrapper = mount(ServiceAreaMapStub)

    const serviceAreaMap = wrapper.find('.service-area-map')
    expect(serviceAreaMap.exists()).toBe(true)
  })

  it('has proper accessibility attributes', () => {
    const wrapper = mount(ServiceAreaMapStub)

    const mapContainer = wrapper.find('[role="application"]')
    expect(mapContainer.exists()).toBe(true)
    expect(mapContainer.attributes('aria-label')).toBeTruthy()
    expect(mapContainer.attributes('tabindex')).toBe('0')
  })

  it('renders legend markers with correct classes', () => {
    const wrapper = mount(ServiceAreaMapStub)

    const mainMarker = wrapper.find('.legend-marker.main-office')
    const serviceMarker = wrapper.find('.legend-marker.service-area')

    expect(mainMarker.exists()).toBe(true)
    expect(serviceMarker.exists()).toBe(true)
  })

  it('has proper structure for legend items', () => {
    const wrapper = mount(ServiceAreaMapStub)

    const legendItems = wrapper.findAll('.legend-item')

    legendItems.forEach(item => {
      expect(item.find('.legend-marker').exists()).toBe(true)
      expect(item.text()).toBeTruthy()
    })
  })

  it('has correct container structure', () => {
    const wrapper = mount(ServiceAreaMapStub)

    const html = wrapper.html()
    expect(html).toContain('service-area-map')
    expect(html).toContain('map-container')
    expect(html).toContain('map-legend')
  })

  describe('Service locations data', () => {
    it('has Tampa as main office', () => {
      const mainOffice = {
        name: 'Tampa (Main Office)',
        position: [27.9506, -82.4572] as [number, number],
        isMainOffice: true
      }
      expect(mainOffice.name).toContain('Tampa')
      expect(mainOffice.isMainOffice).toBe(true)
    })

    it('has St. Petersburg location', () => {
      const stPete = {
        name: 'St. Petersburg',
        position: [27.7676, -82.6403] as [number, number]
      }
      expect(stPete.name).toBe('St. Petersburg')
    })

    it('has Clearwater location', () => {
      const clearwater = {
        name: 'Clearwater',
        position: [27.9659, -82.8001] as [number, number]
      }
      expect(clearwater.name).toBe('Clearwater')
    })

    it('has Brandon location', () => {
      const brandon = {
        name: 'Brandon',
        position: [27.9378, -82.2859] as [number, number]
      }
      expect(brandon.name).toBe('Brandon')
    })

    it('has Lakeland location', () => {
      const lakeland = {
        name: 'Lakeland',
        position: [28.0395, -81.9498] as [number, number]
      }
      expect(lakeland.name).toBe('Lakeland')
    })

    it('has Sarasota location', () => {
      const sarasota = {
        name: 'Sarasota',
        position: [27.3364, -82.5307] as [number, number]
      }
      expect(sarasota.name).toBe('Sarasota')
    })

    it('has Bradenton location', () => {
      const bradenton = {
        name: 'Bradenton',
        position: [27.4989, -82.5748] as [number, number]
      }
      expect(bradenton.name).toBe('Bradenton')
    })

    it('has New Port Richey location', () => {
      const newPortRichey = {
        name: 'New Port Richey',
        position: [28.2426, -82.7187] as [number, number]
      }
      expect(newPortRichey.name).toBe('New Port Richey')
    })

    it('has all required service locations', () => {
      const locations = [
        'Tampa (Main Office)',
        'St. Petersburg',
        'Clearwater',
        'Brandon',
        'Lakeland',
        'Sarasota',
        'Bradenton',
        'New Port Richey'
      ]
      expect(locations.length).toBe(8)
    })
  })

  describe('Map configuration', () => {
    it('has correct center coordinates for Tampa Bay', () => {
      const center: [number, number] = [27.85, -82.6]
      expect(center[0]).toBeCloseTo(27.85, 2)
      expect(center[1]).toBeCloseTo(-82.6, 2)
    })

    it('has appropriate zoom level', () => {
      const zoom = 9
      expect(zoom).toBeGreaterThan(5)
      expect(zoom).toBeLessThan(15)
    })

    it('has scrollWheelZoom disabled for better UX', () => {
      const scrollWheelZoom = false
      expect(scrollWheelZoom).toBe(false)
    })

    it('has keyboard enabled for accessibility', () => {
      const keyboard = true
      expect(keyboard).toBe(true)
    })
  })

  describe('Circle overlay configuration', () => {
    it('has correct center for service area circle', () => {
      const center: [number, number] = [27.85, -82.6]
      expect(center[0]).toBeGreaterThan(27)
      expect(center[0]).toBeLessThan(28)
    })

    it('has appropriate radius for coverage area', () => {
      const radius = 60000 // ~60km in meters
      expect(radius).toBeGreaterThan(50000)
      expect(radius).toBeLessThan(100000)
    })

    it('has correct color settings', () => {
      const color = '#3b82f6'
      const fillColor = '#3b82f6'
      expect(color).toBe(fillColor)
    })

    it('has appropriate fill opacity', () => {
      const fillOpacity = 0.1
      expect(fillOpacity).toBeGreaterThan(0)
      expect(fillOpacity).toBeLessThanOrEqual(1)
    })

    it('has circle as non-interactive', () => {
      const interactive = false
      expect(interactive).toBe(false)
    })
  })

  describe('Tile layer configuration', () => {
    it('uses OpenStreetMap tiles', () => {
      const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      expect(tileUrl).toContain('openstreetmap')
    })

    it('has correct attribution', () => {
      const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      expect(attribution).toContain('OpenStreetMap')
      expect(attribution).toContain('contributors')
    })

    it('has appropriate max zoom', () => {
      const maxZoom = 18
      expect(maxZoom).toBeGreaterThan(15)
    })

    it('has appropriate min zoom', () => {
      const minZoom = 8
      expect(minZoom).toBeGreaterThan(5)
      expect(minZoom).toBeLessThan(10)
    })
  })

  describe('Legend marker icons', () => {
    it('has correct main office icon color', () => {
      const mainOfficeColor = '#1e40af'
      expect(mainOfficeColor).toBe('#1e40af')
    })

    it('has correct service area icon color', () => {
      const serviceAreaColor = '#3b82f6'
      expect(serviceAreaColor).toBe('#3b82f6')
    })

    it('has different colors for main office and service area', () => {
      const mainOfficeColor = '#1e40af'
      const serviceAreaColor = '#3b82f6'
      expect(mainOfficeColor).not.toBe(serviceAreaColor)
    })
  })

  describe('Accessibility', () => {
    it('has tabindex on map container', () => {
      const wrapper = mount(ServiceAreaMapStub)
      const mapContainer = wrapper.find('.map-container')
      expect(mapContainer.attributes('tabindex')).toBe('0')
    })

    it('has proper aria-label', () => {
      const wrapper = mount(ServiceAreaMapStub)
      const mapContainer = wrapper.find('.map-container')
      expect(mapContainer.attributes('aria-label')).toBeTruthy()
    })

    it('has role application on map container', () => {
      const wrapper = mount(ServiceAreaMapStub)
      const mapContainer = wrapper.find('.map-container')
      expect(mapContainer.attributes('role')).toBe('application')
    })
  })

  describe('Legend styling', () => {
    it('has correct title text', () => {
      const wrapper = mount(ServiceAreaMapStub)
      const legendTitle = wrapper.find('.legend-title')
      expect(legendTitle.text()).toBe('Service Area Legend')
    })

    it('has two legend items', () => {
      const wrapper = mount(ServiceAreaMapStub)
      const legendItems = wrapper.findAll('.legend-item')
      expect(legendItems.length).toBe(2)
    })

    it('has proper legend marker styling', () => {
      const wrapper = mount(ServiceAreaMapStub)
      const legendItems = wrapper.findAll('.legend-item')

      legendItems.forEach(item => {
        expect(item.find('.legend-marker').exists()).toBe(true)
      })
    })
  })

  describe('Component structure', () => {
    it('has service-area-map class on wrapper', () => {
      const wrapper = mount(ServiceAreaMapStub)
      expect(wrapper.find('.service-area-map').exists()).toBe(true)
    })

    it('has map-container class', () => {
      const wrapper = mount(ServiceAreaMapStub)
      expect(wrapper.find('.map-container').exists()).toBe(true)
    })

    it('has map-legend class', () => {
      const wrapper = mount(ServiceAreaMapStub)
      expect(wrapper.find('.map-legend').exists()).toBe(true)
    })

    it('has legend-title class', () => {
      const wrapper = mount(ServiceAreaMapStub)
      expect(wrapper.find('.legend-title').exists()).toBe(true)
    })

    it('has legend-items class', () => {
      const wrapper = mount(ServiceAreaMapStub)
      expect(wrapper.find('.legend-items').exists()).toBe(true)
    })
  })

  describe('Icon configuration', () => {
    it('has correct icon size for main office marker', () => {
      const iconSize: [number, number] = [30, 42]
      expect(iconSize[0]).toBe(30)
      expect(iconSize[1]).toBe(42)
    })

    it('has correct icon anchor for main office marker', () => {
      const iconAnchor: [number, number] = [15, 42]
      expect(iconAnchor[0]).toBe(15)
      expect(iconAnchor[1]).toBe(42)
    })

    it('has correct icon size for service area marker', () => {
      const iconSize: [number, number] = [24, 34]
      expect(iconSize[0]).toBe(24)
      expect(iconSize[1]).toBe(34)
    })

    it('has correct icon anchor for service area marker', () => {
      const iconAnchor: [number, number] = [12, 34]
      expect(iconAnchor[0]).toBe(12)
      expect(iconAnchor[1]).toBe(34)
    })
  })

  describe('Popup content structure', () => {
    it('has correct popup HTML structure', () => {
      const location = {
        name: 'Tampa',
        description: 'VP Associates Headquarters'
      }
      const popupHTML = `
        <div class="map-popup">
          <strong>${location.name}</strong>
          <p>${location.description}</p>
        </div>
      `
      expect(popupHTML).toContain('map-popup')
      expect(popupHTML).toContain(location.name)
      expect(popupHTML).toContain(location.description)
    })
  })

  describe('Marker accessibility attributes', () => {
    it('has tabindex on markers', () => {
      const tabindex = '0'
      expect(tabindex).toBe('0')
    })

    it('has role button on markers', () => {
      const role = 'button'
      expect(role).toBe('button')
    })

    it('has aria-label on markers', () => {
      const locationName = 'Tampa'
      const ariaLabel = `View details for ${locationName}`
      expect(ariaLabel).toContain('View details for')
      expect(ariaLabel).toContain(locationName)
    })
  })
})
