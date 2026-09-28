/**
 * Tests for ServiceAreaMap: the service-area list and the Leaflet map act as one control
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ServiceAreaMap from '../ServiceAreaMap.vue'

const mapApi = {
  flyTo: vi.fn(),
  flyToBounds: vi.fn(),
  closePopup: vi.fn(),
  fitBounds: vi.fn(),
  remove: vi.fn()
}
const markerApis: Record<string, { openPopup: ReturnType<typeof vi.fn>, handlers: Record<string, () => void> }> = {}

vi.mock('leaflet', () => {
  const chain = () => ({ addTo: () => chain() })
  return {
    map: vi.fn(() => mapApi),
    tileLayer: vi.fn(() => chain()),
    divIcon: vi.fn(opts => opts),
    featureGroup: vi.fn(() => ({ getBounds: () => ({ pad: () => 'bounds' }) })),
    marker: vi.fn((_pos: [number, number], opts: { title: string }) => {
      const api = { openPopup: vi.fn(), handlers: {} as Record<string, () => void> }
      markerApis[opts.title] = api
      const marker = {
        addTo: () => marker,
        bindPopup: () => marker,
        on: (event: string, fn: () => void) => { api.handlers[event] = fn; return marker },
        openPopup: api.openPopup
      }
      return marker
    })
  }
})

const globalStubs = { Icon: { template: '<span />' } }

async function mountMap() {
  const wrapper = mount(ServiceAreaMap, { global: { stubs: globalStubs }, attachTo: document.body })
  // The component imports Leaflet dynamically in onMounted
  await vi.dynamicImportSettled()
  await flushPromises()
  return wrapper
}

describe('ServiceAreaMap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia
    Element.prototype.scrollIntoView = vi.fn()
  })

  it('lists every service area as a button', async () => {
    const wrapper = await mountMap()
    const buttons = wrapper.findAll('ul button')
    expect(buttons.map(b => b.find('.font-semibold').text())).toEqual([
      'Tampa', 'St. Petersburg', 'Clearwater', 'Brandon', 'Pasco County', 'Lakeland', 'Bradenton', 'Sarasota'
    ])
  })

  it('marks Tampa as the home base', async () => {
    const wrapper = await mountMap()
    const tampa = wrapper.findAll('ul button')[0]!
    expect(tampa.text()).toContain('Home base')
    expect(wrapper.findAll('ul button').filter(b => b.text().includes('Home base'))).toHaveLength(1)
  })

  it('adds one marker per service area and fits the map to them', async () => {
    await mountMap()
    expect(Object.keys(markerApis)).toHaveLength(8)
    expect(mapApi.fitBounds).toHaveBeenCalledWith('bounds')
  })

  it('flies to the area and opens its popup when picked from the list', async () => {
    const wrapper = await mountMap()
    const sarasota = wrapper.findAll('ul button').find(b => b.text().includes('Sarasota'))!
    await sarasota.trigger('click')

    expect(sarasota.attributes('aria-pressed')).toBe('true')
    expect(mapApi.flyTo).toHaveBeenCalledWith([27.3364, -82.5307], 11, expect.objectContaining({ animate: true }))
    expect(markerApis.Sarasota!.openPopup).toHaveBeenCalled()
  })

  it('scrolls the map back into view on small screens, where the list sits below it', async () => {
    const wrapper = await mountMap()
    await wrapper.findAll('ul button')[7]!.trigger('click')
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
  })

  it('does not animate the fly-to when reduced motion is preferred', async () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia
    const wrapper = await mountMap()
    await wrapper.findAll('ul button')[1]!.trigger('click')
    expect(mapApi.flyTo).toHaveBeenCalledWith(expect.anything(), 11, expect.objectContaining({ animate: false }))
  })

  it('highlights the list row when its marker is clicked', async () => {
    const wrapper = await mountMap()
    markerApis.Lakeland!.handlers.click!()
    await wrapper.vm.$nextTick()
    const lakeland = wrapper.findAll('ul button').find(b => b.text().includes('Lakeland'))!
    expect(lakeland.attributes('aria-pressed')).toBe('true')
    expect(wrapper.findAll('[aria-pressed="true"]')).toHaveLength(1)
  })

  it('offers a way back to the overview once an area is picked', async () => {
    const wrapper = await mountMap()
    expect(wrapper.text()).not.toContain('Show all areas')

    await wrapper.findAll('ul button')[2]!.trigger('click')
    const reset = wrapper.findAll('button').find(b => b.text().includes('Show all areas'))!
    await reset.trigger('click')

    expect(mapApi.flyToBounds).toHaveBeenCalledWith('bounds', expect.anything())
    expect(wrapper.findAll('[aria-pressed="true"]')).toHaveLength(0)
    expect(wrapper.text()).not.toContain('Show all areas')
  })

  it('gives the map an accessible name and keyboard focus', async () => {
    const wrapper = await mountMap()
    const map = wrapper.find('[role="application"]')
    expect(map.attributes('aria-label')).toContain('Tampa Bay')
    expect(map.attributes('tabindex')).toBe('0')
  })

  it('removes the map on unmount', async () => {
    const wrapper = await mountMap()
    wrapper.unmount()
    expect(mapApi.remove).toHaveBeenCalled()
  })
})
