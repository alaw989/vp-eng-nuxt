<template>
  <div class="tampa-bay-map-wrapper">
    <div ref="mapContainer" class="map-container" role="application" aria-label="Interactive map of Tampa Bay service areas" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
// Leaflet is imported dynamically in onMounted to avoid SSR issues

interface Props {
  serviceAreas?: string[]
}

const props = defineProps<Props>()

const mapContainer = ref<HTMLElement>()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let map: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let markers: any[] = []

const locationCoordinates: Record<string, { lat: number; lng: number }> = {
  'Tampa': { lat: 27.9506, lng: -82.4572 },
  'St. Petersburg': { lat: 27.7676, lng: -82.6403 },
  'Clearwater': { lat: 27.9659, lng: -82.8001 },
  'Brandon': { lat: 27.9378, lng: -82.2859 },
  'Lakeland': { lat: 28.0395, lng: -81.9499 },
  'Sarasota': { lat: 27.3364, lng: -82.5307 },
  'Bradenton': { lat: 27.4989, lng: -82.5748 },
  'Pasco County': { lat: 28.2358, lng: -82.3215 },
  'Hillsborough County': { lat: 27.9943, lng: -82.3351 },
  'Pinellas County': { lat: 27.8438, lng: -82.7007 }
}

onMounted(async () => {
  if (!mapContainer.value || typeof window === 'undefined') return

  // Dynamically import Leaflet only on client-side
  const L = await import('leaflet')
  await import('leaflet/dist/leaflet.css')

  // Custom icon using site colors
  const createCustomIcon = () => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div class="marker-pin" aria-hidden="true"></div>`,
      iconSize: [30, 42] as [number, number],
      iconAnchor: [15, 42] as [number, number],
      popupAnchor: [0, -42] as [number, number]
    })
  }

  // Initialize map centered on Tampa Bay
  map = L.map(mapContainer.value, {
    center: [27.9506, -82.4572],
    zoom: 9,
    scrollWheelZoom: false, // Better UX
    doubleClickZoom: true,
    touchZoom: true,
    keyboard: true
  })

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
    minZoom: 8
  }).addTo(map)

  // Add markers for each service area
  const areas = props.serviceAreas || Object.keys(locationCoordinates)
  areas.forEach(area => {
    const coords = locationCoordinates[area]
    if (coords && map) {
      const marker = L.marker([coords.lat, coords.lng], {
        icon: createCustomIcon(),
        title: area,
        alt: area
      }).addTo(map)

      // Add popup with accessibility
      const popupContent = document.createElement('div')
      popupContent.className = 'map-popup-content'
      popupContent.innerHTML = `<strong class="popup-title">${area}</strong><p class="popup-text">Service Area</p>`

      marker.bindPopup(popupContent, {
        className: 'custom-popup',
        maxWidth: 200
      })

      // Make marker keyboard accessible
      const markerElement = marker.getElement()
      if (markerElement) {
        markerElement.setAttribute('tabindex', '0')
        markerElement.setAttribute('role', 'button')
        markerElement.setAttribute('aria-label', `View details for ${area}`)
      }

      markers.push(marker)
    }
  })

  // Fit bounds to show all markers
  if (markers.length > 0 && map) {
    const group = L.featureGroup(markers)
    map.fitBounds(group.getBounds().pad(0.1))
  }
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
.tampa-bay-map-wrapper {
  width: 100%;
  height: 100%;
  aspect-ratio: 1 / 1;
}

.map-container {
  width: 100%;
  height: 100%;
  border-radius: 1rem;
  min-height: 300px;
}

/* Custom marker pin */
:deep(.custom-marker) {
  background: transparent;
  border: none;
}

:deep(.marker-pin) {
  background-color: #f97316;
  width: 30px;
  height: 30px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  border: 3px solid white;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
  position: relative;
}

:deep(.marker-pin::after) {
  content: '';
  width: 10px;
  height: 10px;
  background: white;
  position: absolute;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* Popup styling */
:deep(.custom-popup) {
  font-family: system-ui, -apple-system, sans-serif;
}

:deep(.custom-popup .leaflet-popup-content-wrapper) {
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.custom-popup .leaflet-popup-tip) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.map-popup-content) {
  padding: 0.25rem;
}

:deep(.popup-title) {
  color: #1e3a8a;
  display: block;
  font-size: 1rem;
}

:deep(.popup-text) {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0.25rem 0 0 0;
}

/* Attribution styling */
:deep(.leaflet-control-attribution) {
  font-size: 11px;
  background: rgba(255, 255, 255, 0.85);
  padding: 3px 6px;
  border-radius: 4px;
}

:deep(.leaflet-control-attribution a) {
  color: #1e3a8a;
}

/* Focus styles for keyboard navigation */
:deep(.leaflet-marker-icon) {
  outline: none;
}

:deep(.leaflet-marker-icon:focus),
:deep(.leaflet-marker-icon:focus-visible) {
  outline: 3px solid #f97316;
  outline-offset: 3px;
  border-radius: 50%;
}

/* Zoom control styling */
:deep(.leaflet-control-zoom) {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

:deep(.leaflet-control-zoom a) {
  background-color: white;
  color: #1e3a8a;
  border: none;
  line-height: 28px;
}

:deep(.leaflet-control-zoom a:hover) {
  background-color: #f3f4f6;
}

:deep(.leaflet-control-zoom a:focus) {
  outline: 2px solid #f97316;
  outline-offset: 1px;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .map-container {
    min-height: 250px;
  }
}
</style>
