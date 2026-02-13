<template>
  <div class="service-area-map">
    <div
      ref="mapContainer"
      class="map-container"
      role="application"
      aria-label="Interactive map showing Tampa Bay service area"
      tabindex="0"
    ></div>
    <div class="map-legend">
      <h3 class="legend-title">Service Area Legend</h3>
      <div class="legend-items">
        <div class="legend-item">
          <span class="legend-marker main-office"></span>
          <span>Main Office (Tampa)</span>
        </div>
        <div class="legend-item">
          <span class="legend-marker service-area"></span>
          <span>Service Area Cities</span>
        </div>
      </div>
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
  isMainOffice?: boolean
}

const serviceLocations: ServiceLocation[] = [
  {
    name: 'Tampa (Main Office)',
    position: [27.9506, -82.4572],
    description: 'VP Associates Headquarters - 123 Main Street, Suite 100',
    isMainOffice: true
  },
  {
    name: 'St. Petersburg',
    position: [27.7676, -82.6403],
    description: 'Serving the St. Petersburg area'
  },
  {
    name: 'Clearwater',
    position: [27.9659, -82.8001],
    description: 'Serving the Clearwater area'
  },
  {
    name: 'Brandon',
    position: [27.9378, -82.2859],
    description: 'Serving the Brandon area'
  },
  {
    name: 'Lakeland',
    position: [28.0395, -81.9498],
    description: 'Serving the Lakeland area'
  },
  {
    name: 'Sarasota',
    position: [27.3364, -82.5307],
    description: 'Serving the Sarasota area'
  },
  {
    name: 'Bradenton',
    position: [27.4989, -82.5748],
    description: 'Serving the Bradenton area'
  },
  {
    name: 'New Port Richey',
    position: [28.2426, -82.7187],
    description: 'Serving Pasco County'
  }
]

const mapContainer = ref<HTMLDivElement>()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let map: any = null

onMounted(async () => {
  if (!mapContainer.value) return

  // Dynamically import Leaflet only on client-side
  const L = await import('leaflet')

  // Fix for default marker icons in Leaflet with webpack/vite
  const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png'
  const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png'
  const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'

  const defaultIcon = L.icon({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
    iconSize: [25, 41] as [number, number],
    iconAnchor: [12, 41] as [number, number],
    popupAnchor: [1, -34] as [number, number],
    shadowSize: [41, 41] as [number, number]
  })

  L.Marker.prototype.options.icon = defaultIcon

  // Initialize the map centered on Tampa Bay
  map = L.map(mapContainer.value, {
    center: [27.85, -82.6] as [number, number],
    zoom: 9,
    scrollWheelZoom: false,
    keyboard: true
  })

  // Set aria-label for accessibility
  if (mapContainer.value) {
    mapContainer.value.setAttribute('aria-label', 'Tampa Bay Service Area Map')
  }

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
    minZoom: 8
  }).addTo(map)

  // Custom icons for main office vs service areas
  const mainOfficeIcon = L.divIcon({
    className: 'custom-marker main-office-marker',
    html: `<div class="marker-pin main-office-pin" aria-label="Main Office in Tampa"></div>`,
    iconSize: [30, 42] as [number, number],
    iconAnchor: [15, 42] as [number, number]
  })

  const serviceAreaIcon = L.divIcon({
    className: 'custom-marker service-area-marker',
    html: `<div class="marker-pin service-area-pin" aria-label="Service area location"></div>`,
    iconSize: [24, 34] as [number, number],
    iconAnchor: [12, 34] as [number, number]
  })

  // Collect markers for fitBounds
  const markers: any[] = []

  // Add markers for each location
  serviceLocations.forEach((location) => {
    const marker = L.marker(location.position as [number, number], {
      icon: location.isMainOffice ? mainOfficeIcon : serviceAreaIcon
    })

    if (map) {
      marker.addTo(map)
    }

    // Add popup with location info
    const popupContent = `
      <div class="map-popup">
        <strong>${location.name}</strong>
        <p>${location.description}</p>
      </div>
    `
    marker.bindPopup(popupContent)

    markers.push(marker)

    // Make keyboard accessible
    const markerElement = marker.getElement()
    if (markerElement) {
      markerElement.setAttribute('tabindex', '0')
      markerElement.setAttribute('role', 'button')
      markerElement.setAttribute('aria-label', `View details for ${location.name}`)
    }
  })

  // Add a circle showing approximate service area coverage
  if (map) {
    L.circle([27.85, -82.6] as [number, number], {
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.1,
      radius: 60000, // ~60km radius
      weight: 2,
      interactive: false
    }).addTo(map)

    // Fit bounds to show all markers
    if (markers.length > 0) {
      const group = L.featureGroup(markers)
      map.fitBounds(group.getBounds().pad(0.1))
    }
  }
})

onBeforeUnmount(async () => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
.service-area-map {
  @apply rounded-xl overflow-hidden border border-neutral-200;
}

.map-container {
  @apply w-full aspect-[16/10] md:aspect-[2/1] min-h-[400px];
}

.map-legend {
  @apply bg-white p-4 border-t border-neutral-200;
}

.legend-title {
  @apply text-sm font-bold text-neutral-900 mb-3;
}

.legend-items {
  @apply flex flex-wrap gap-4;
}

.legend-item {
  @apply flex items-center gap-2 text-sm text-neutral-700;
}

.legend-marker {
  @apply w-4 h-4 rounded-full border-2 flex-shrink-0;
}

.legend-marker.main-office {
  @apply bg-blue-600 border-blue-800;
}

.legend-marker.service-area {
  @apply bg-blue-400 border-blue-600;
}

/* Deep selector for Leaflet popup styling */
:deep(.map-popup) {
  @apply font-sans;
}

:deep(.map-popup strong) {
  @apply text-neutral-900;
}

:deep(.map-popup p) {
  @apply text-neutral-600 text-sm mt-1;
}

/* Custom marker pins */
:deep(.custom-marker) {
  @apply flex items-end justify-center;
}

:deep(.marker-pin) {
  @apply relative cursor-pointer;
  width: 30px;
  height: 42px;
}

:deep(.main-office-pin) {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%231e40af'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
}

:deep(.service-area-pin) {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%233b82f6'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
  width: 24px;
  height: 34px;
}

/* Leaflet container focus styles for keyboard navigation */
:deep(.leaflet-container) {
  @apply focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2;
}

/* Focus visible on interactive map elements */
:deep(.leaflet-interactive:focus-visible) {
  @apply outline-none ring-2 ring-primary ring-offset-2;
}
</style>
