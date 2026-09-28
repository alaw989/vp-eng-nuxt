<template>
  <div class="service-area-map grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-6 lg:gap-8">
    <!-- The list doubles as the map legend: each row's pin matches its marker -->
    <ul class="card divide-y divide-neutral-200 self-start order-2 lg:order-1" aria-label="Service areas">
      <li v-for="location in serviceLocations" :key="location.name">
        <button
          type="button"
          class="w-full flex items-center gap-3 px-4 py-3 text-left border-l-2 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-primary focus-visible:-outline-offset-2"
          :class="active === location.name
            ? 'border-l-primary bg-primary/5'
            : 'border-l-transparent hover:bg-neutral-50'"
          :aria-pressed="active === location.name"
          @click="focusLocation(location.name)"
        >
          <Icon
            name="mdi:map-marker"
            class="w-5 h-5 flex-shrink-0"
            :class="location.isHomeBase ? 'text-primary' : 'text-secondary'"
            aria-hidden="true"
          />
          <span class="flex-1 min-w-0">
            <span class="block font-semibold text-neutral-900">{{ location.name }}</span>
            <span class="block text-sm text-neutral-600">{{ location.description }}</span>
          </span>
          <span v-if="location.isHomeBase" class="eyebrow text-primary">Home base</span>
        </button>
      </li>
    </ul>

    <div class="relative order-1 lg:order-2 rounded-sm overflow-hidden border border-neutral-200">
      <div
        ref="mapContainer"
        class="map-container"
        role="application"
        aria-label="Map of VP Associates service areas around Tampa Bay"
        tabindex="0"
      />
      <button
        v-if="active"
        type="button"
        class="btn-outline absolute top-3 right-3 z-[1000] h-9 px-3 text-sm"
        @click="showAll"
      >
        <Icon name="mdi:arrow-expand-all" class="w-4 h-4" aria-hidden="true" />
        Show all areas
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Leaflet is imported dynamically in onMounted to avoid SSR issues
// (Leaflet requires window which doesn't exist on the server)

interface ServiceLocation {
  name: string
  position: [number, number]
  description: string
  isHomeBase?: boolean
}

const serviceLocations: ServiceLocation[] = [
  { name: 'Tampa', position: [27.9506, -82.4572], description: 'Hillsborough County', isHomeBase: true },
  { name: 'St. Petersburg', position: [27.7676, -82.6403], description: 'Pinellas County' },
  { name: 'Clearwater', position: [27.9659, -82.8001], description: 'Pinellas County' },
  { name: 'Brandon', position: [27.9378, -82.2859], description: 'Hillsborough County' },
  { name: 'Pasco County', position: [28.2426, -82.7187], description: 'New Port Richey and north' },
  { name: 'Lakeland', position: [28.0395, -81.9498], description: 'Polk County' },
  { name: 'Bradenton', position: [27.4989, -82.5748], description: 'Manatee County' },
  { name: 'Sarasota', position: [27.3364, -82.5307], description: 'Sarasota County' }
]

// Brand colours, matching the list pins
const NAVY = '#033379'
const TEAL = '#2A6F5F'

const mapContainer = ref<HTMLDivElement>()
const active = ref<string | null>(null)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let map: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const markers = new Map<string, any>()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let bounds: any = null

function focusLocation(name: string) {
  active.value = name
  const location = serviceLocations.find(l => l.name === name)
  const marker = markers.get(name)
  if (!map || !location || !marker) return
  map.flyTo(location.position, 11, { animate: !prefersReducedMotion(), duration: 0.8 })

  // Below lg the list sits under the map, so bring the map back into view
  if (!window.matchMedia('(min-width: 1024px)').matches) {
    mapContainer.value?.scrollIntoView({ block: 'center', behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }
  marker.openPopup()
}

function showAll() {
  active.value = null
  if (!map || !bounds) return
  map.closePopup()
  map.flyToBounds(bounds, { animate: !prefersReducedMotion(), duration: 0.8 })
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function pinSvg(color: string) {
  return `<svg viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1.5" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`
}

onMounted(async () => {
  if (!mapContainer.value) return

  const L = await import('leaflet')

  map = L.map(mapContainer.value, {
    center: [27.85, -82.6] as [number, number],
    zoom: 9,
    scrollWheelZoom: false,
    keyboard: true
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
    minZoom: 8
  }).addTo(map)

  const icon = (homeBase: boolean) => L.divIcon({
    className: 'service-area-marker',
    html: pinSvg(homeBase ? NAVY : TEAL),
    iconSize: (homeBase ? [34, 34] : [28, 28]) as [number, number],
    iconAnchor: (homeBase ? [17, 34] : [14, 28]) as [number, number],
    popupAnchor: [0, homeBase ? -30 : -24] as [number, number]
  })

  serviceLocations.forEach((location) => {
    const marker = L.marker(location.position, {
      icon: icon(!!location.isHomeBase),
      title: location.name,
      keyboard: true
    }).addTo(map)

    marker.bindPopup(`<strong>${location.name}</strong><br>${location.isHomeBase ? 'Home base' : location.description}`)
    marker.on('click', () => { active.value = location.name })
    markers.set(location.name, marker)
  })

  bounds = L.featureGroup([...markers.values()]).getBounds().pad(0.1)
  map.fitBounds(bounds)
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
  markers.clear()
})
</script>

<style scoped>
.map-container {
  @apply w-full aspect-[4/3] lg:aspect-auto lg:h-full min-h-[320px] lg:min-h-[520px];
}

:deep(.service-area-marker) {
  background: transparent;
  border: none;
}

:deep(.service-area-marker svg) {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 1px 1px rgb(0 0 0 / 0.3));
}

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 0.125rem;
}

:deep(.leaflet-popup-content) {
  @apply font-sans text-sm text-neutral-700;
}

:deep(.leaflet-popup-content strong) {
  @apply text-neutral-900;
}
</style>
