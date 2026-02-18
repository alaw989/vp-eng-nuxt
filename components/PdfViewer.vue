<template>
  <div class="pdf-viewer">
    <!-- PDF List/Grid View -->
    <div v-if="pdfs.length > 0" class="space-y-6">
      <!-- Section Header -->
      <div class="flex items-center justify-between flex-wrap gap-4">
        <h2 class="text-2xl font-display font-bold text-neutral-900 flex items-center gap-3">
          <span class="w-1 h-8 bg-secondary rounded-full"></span>
          Project Documents
        </h2>
        <div class="flex items-center gap-2 text-sm text-neutral-600">
          <Icon name="mdi:file-pdf-box" class="w-5 h-5 text-alert" />
          <span>{{ pdfs.length }} PDF{{ pdfs.length > 1 ? 's' : '' }} available</span>
        </div>
      </div>

      <!-- PDF Grid -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(pdf, index) in pdfs"
          :key="index"
          class="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-neutral-200 hover:border-primary/50"
        >
          <!-- PDF Preview/Thumbnail Area -->
          <div class="aspect-[4/3] bg-neutral-100 relative overflow-hidden">
            <!-- Thumbnail or placeholder -->
            <div
              v-if="pdf.thumbnail"
              class="w-full h-full"
            >
              <NuxtImg
                :src="pdf.thumbnail"
                :alt="pdf.title || `Document ${index + 1}`"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                :width="400"
                :height="300"
              />
            </div>
            <div
              v-else
              class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200"
            >
              <Icon
                name="mdi:file-pdf-box"
                class="w-16 h-16 text-alert/70 group-hover:scale-110 transition-transform duration-300"
              />
              <span class="mt-2 text-sm text-neutral-500">PDF Document</span>
            </div>

            <!-- Overlay with view button -->
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
              <button
                class="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 bg-white text-neutral-900 px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-primary hover:text-white flex items-center gap-2"
                @click="openPdf(pdf, index)"
                :aria-label="`View ${pdf.title || 'PDF'}`"
              >
                <Icon name="mdi:magnify" class="w-5 h-5" />
                View PDF
              </button>
            </div>

            <!-- PDF type badge -->
            <div v-if="pdf.type" class="absolute top-3 left-3">
              <span class="px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold text-neutral-700 shadow-sm">
                {{ pdf.type }}
              </span>
            </div>
          </div>

          <!-- PDF Info -->
          <div class="p-4">
            <h3 class="font-semibold text-neutral-900 mb-1 line-clamp-2" :title="pdf.title">
              {{ pdf.title || `Document ${index + 1}` }}
            </h3>
            <p v-if="pdf.description" class="text-sm text-neutral-600 mb-3 line-clamp-2">
              {{ pdf.description }}
            </p>

            <!-- File metadata -->
            <div v-if="pdf.size || pdf.pages" class="flex items-center gap-4 text-xs text-neutral-500 mb-4">
              <span v-if="pdf.size" class="flex items-center gap-1">
                <Icon name="mdi:file-outline" class="w-3 h-3" />
                {{ pdf.size }}
              </span>
              <span v-if="pdf.pages" class="flex items-center gap-1">
                <Icon name="mdi:text-box-outline" class="w-3 h-3" />
                {{ pdf.pages }} pages
              </span>
            </div>

            <!-- Action buttons -->
            <div class="flex gap-2">
              <button
                class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-dark transition-colors"
                @click="openPdf(pdf, index)"
              >
                <Icon name="mdi:magnify" class="w-4 h-4" />
                View
              </button>
              <a
                :href="pdf.url"
                :download="pdf.filename || `document-${index + 1}.pdf`"
                class="flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-100 text-neutral-700 rounded-lg font-medium text-sm hover:bg-neutral-200 transition-colors"
                :aria-label="`Download ${pdf.title || 'PDF'}`"
              >
                <Icon name="mdi:download" class="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 bg-neutral-50 rounded-xl">
      <Icon name="mdi:file-pdf-box-outline" class="w-16 h-16 text-neutral-300 mx-auto mb-4" />
      <p class="text-neutral-500">No documents available for this project</p>
    </div>

    <!-- PDF Viewer Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-300"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="viewerOpen"
          ref="viewerRef"
          class="fixed inset-0 z-50 bg-black/95 flex flex-col"
          role="dialog"
          aria-modal="true"
          :aria-label="`PDF Viewer - ${currentPdf?.title || 'Document'}`"
          @keydown.esc="closeViewer"
        >
          <!-- Toolbar -->
          <div class="flex items-center justify-between px-4 py-3 bg-neutral-900 border-b border-neutral-700">
            <div class="flex items-center gap-4 flex-1 min-w-0">
              <!-- PDF Title -->
              <h3 class="text-white font-medium truncate text-sm md:text-base">
                {{ currentPdf?.title || 'Document' }}
              </h3>
            </div>

            <div class="flex items-center gap-2">
              <!-- Zoom controls -->
              <div class="hidden md:flex items-center gap-1 bg-neutral-800 rounded-lg p-1">
                <button
                  class="p-2 text-neutral-300 hover:text-white hover:bg-neutral-700 rounded transition-colors"
                  @click="zoomOut"
                  :disabled="scale <= 0.5"
                  :aria-label="`Zoom out (current: ${Math.round(scale * 100)}%)`"
                >
                  <Icon name="mdi:magnify-minus" class="w-5 h-5" />
                </button>
                <span class="px-3 text-neutral-300 text-sm min-w-[60px] text-center">
                  {{ Math.round(scale * 100) }}%
                </span>
                <button
                  class="p-2 text-neutral-300 hover:text-white hover:bg-neutral-700 rounded transition-colors"
                  @click="zoomIn"
                  :disabled="scale >= 3"
                  :aria-label="`Zoom in (current: ${Math.round(scale * 100)}%)`"
                >
                  <Icon name="mdi:magnify-plus" class="w-5 h-5" />
                </button>
              </div>

              <!-- Download button -->
              <a
                v-if="currentPdf"
                :href="currentPdf.url"
                :download="currentPdf.filename || 'document.pdf'"
                class="hidden md:flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-dark transition-colors"
                aria-label="Download PDF"
              >
                <Icon name="mdi:download" class="w-4 h-4" />
                <span>Download</span>
              </a>

              <!-- Close button -->
              <button
                ref="closeButtonRef"
                class="p-2 text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors"
                @click="closeViewer"
                aria-label="Close PDF viewer"
              >
                <Icon name="mdi:close" class="w-6 h-6" />
              </button>
            </div>
          </div>

          <!-- PDF Content Area -->
          <div class="flex-1 overflow-auto flex items-center justify-center p-4" ref="containerRef">
            <div
              v-if="currentPdf"
              class="relative transition-transform duration-200 ease-out"
              :style="{ transform: `scale(${scale})` }"
            >
              <!-- Native PDF embed (works in most modern browsers) -->
              <iframe
                :src="`${currentPdf.url}#toolbar=0&navpanes=0&scrollbar=1`"
                class="bg-white rounded-lg shadow-2xl"
                :width="iframeWidth"
                :height="iframeHeight"
                :style="{ pointerEvents: scale === 1 ? 'auto' : 'none' }"
                :aria-label="`PDF content for ${currentPdf.title}`"
              />
            </div>
          </div>

          <!-- Mobile action bar (shown at bottom on small screens) -->
          <div class="md:hidden flex items-center justify-around px-4 py-3 bg-neutral-900 border-t border-neutral-700">
            <button
              class="flex flex-col items-center gap-1 text-neutral-300 hover:text-white transition-colors"
              @click="zoomOut"
            >
              <Icon name="mdi:magnify-minus" class="w-6 h-6" />
              <span class="text-xs">Zoom Out</span>
            </button>
            <span class="text-neutral-300 text-sm">{{ Math.round(scale * 100) }}%</span>
            <button
              class="flex flex-col items-center gap-1 text-neutral-300 hover:text-white transition-colors"
              @click="zoomIn"
            >
              <Icon name="mdi:magnify-plus" class="w-6 h-6" />
              <span class="text-xs">Zoom In</span>
            </button>
            <a
              v-if="currentPdf"
              :href="currentPdf.url"
              :download="currentPdf.filename || 'document.pdf'"
              class="flex flex-col items-center gap-1 text-neutral-300 hover:text-white transition-colors"
            >
              <Icon name="mdi:download" class="w-6 h-6" />
              <span class="text-xs">Download</span>
            </a>
          </div>

          <!-- Loading indicator -->
          <div
            v-if="loading"
            class="absolute inset-0 flex items-center justify-center bg-black/50"
          >
            <div class="flex flex-col items-center gap-3 text-white">
              <Icon name="mdi:loading" class="w-12 h-12 animate-spin" />
              <span class="text-lg">Loading PDF...</span>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
interface PdfDocument {
  url: string
  title?: string
  description?: string
  filename?: string
  type?: string
  size?: string
  pages?: number
  thumbnail?: string
}

interface Props {
  pdfs: PdfDocument[]
}

const props = defineProps<Props>()

const viewerOpen = ref(false)
const currentPdf = ref<PdfDocument | null>(null)
const currentIndex = ref(0)
const scale = ref(1)
const loading = ref(false)
const viewerRef = ref<HTMLElement | null>(null)
const closeButtonRef = ref<HTMLElement | null>(null)
const previouslyFocused = ref<HTMLElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)

// Standard PDF dimensions (will be adjusted by scale)
const iframeWidth = ref(800)
const iframeHeight = ref(1000)

// Adjust iframe size based on viewport
const updateIframeSize = () => {
  if (containerRef.value) {
    const containerWidth = containerRef.value.clientWidth - 32 // padding
    const containerHeight = containerRef.value.clientHeight - 32

    // Standard letter aspect ratio (8.5 x 11)
    const aspectRatio = 8.5 / 11

    iframeWidth.value = Math.min(containerWidth, 1000)
    iframeHeight.value = iframeWidth.value / aspectRatio
  }
}

const openPdf = (pdf: PdfDocument, index: number) => {
  currentPdf.value = pdf
  currentIndex.value = index
  viewerOpen.value = true
  scale.value = 1
  loading.value = true

  // Save currently focused element
  previouslyFocused.value = document.activeElement as HTMLElement

  document.body.style.overflow = 'hidden'

  // Reset loading after a delay
  setTimeout(() => {
    loading.value = false
    nextTick(() => {
      updateIframeSize()
    })
  }, 500)

  // Focus close button after opening
  nextTick(() => {
    closeButtonRef.value?.focus()
  })
}

const closeViewer = () => {
  viewerOpen.value = false
  currentPdf.value = null
  scale.value = 1
  document.body.style.overflow = ''

  // Return focus to the element that opened the viewer
  nextTick(() => {
    previouslyFocused.value?.focus()
  })
}

const zoomIn = () => {
  if (scale.value < 3) {
    scale.value = Math.min(3, scale.value + 0.25)
  }
}

const zoomOut = () => {
  if (scale.value > 0.5) {
    scale.value = Math.max(0.5, scale.value - 0.25)
  }
}

// Keyboard navigation
onKeyStroke('Escape', (e) => {
  if (viewerOpen.value) {
    e.preventDefault()
    closeViewer()
  }
})

onKeyStroke('+', (e) => {
  if (viewerOpen.value) {
    e.preventDefault()
    zoomIn()
  }
})

onKeyStroke('-', (e) => {
  if (viewerOpen.value) {
    e.preventDefault()
    zoomOut()
  }
})

onKeyStroke('=', (e) => {
  if (viewerOpen.value) {
    e.preventDefault()
    zoomIn()
  }
})

onKeyStroke('_', (e) => {
  if (viewerOpen.value) {
    e.preventDefault()
    zoomOut()
  }
})

// Reset zoom on viewer open
watch(viewerOpen, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      updateIframeSize()
      window.addEventListener('resize', updateIframeSize)
    })
  } else {
    window.removeEventListener('resize', updateIframeSize)
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (viewerOpen.value) {
    document.body.style.overflow = ''
  }
  window.removeEventListener('resize', updateIframeSize)
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
