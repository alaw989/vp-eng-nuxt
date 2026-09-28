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
          class="card group overflow-hidden hover:border-primary"
        >
          <!-- PDF Preview/Thumbnail Area -->
          <div class="aspect-[4/3] bg-neutral-100 relative overflow-hidden">
            <!-- Thumbnail or placeholder -->
            <div
              v-if="pdf.thumbnail || pdf.preview"
              class="w-full h-full"
            >
              <NuxtImg
                :src="pdf.thumbnail || pdf.preview"
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
                class="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 bg-white text-neutral-900 px-6 py-3 rounded-sm font-semibold shadow-lg hover:bg-primary hover:text-white flex items-center gap-2"
                @click="openPdf(pdf, index)"
                :aria-label="`View ${pdf.title || 'PDF'}`"
              >
                <Icon name="mdi:magnify" class="w-5 h-5" />
                View PDF
              </button>
            </div>

            <!-- PDF type badge -->
            <div v-if="pdf.type" class="absolute top-3 left-3">
              <span class="px-3 py-1 bg-white/95 backdrop-blur-sm rounded-sm text-xs font-semibold text-neutral-700">
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
                class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-sm font-medium text-sm hover:bg-primary-dark transition-colors"
                @click="openPdf(pdf, index)"
              >
                <Icon name="mdi:magnify" class="w-4 h-4" />
                View
              </button>
              <a
                :href="pdf.url"
                :download="pdf.filename || `document-${index + 1}.pdf`"
                class="flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-100 text-neutral-700 rounded-sm font-medium text-sm hover:bg-neutral-200 transition-colors"
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
    <div v-else class="text-center py-12 bg-neutral-50 rounded-sm">
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
          class="fixed inset-0 z-[60] bg-black/95 flex flex-col"
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
              <!-- Open in new tab (the browser's own viewer, full screen) -->
              <a
                v-if="currentPdf"
                :href="currentPdf.url"
                target="_blank"
                rel="noopener noreferrer"
                class="hidden md:flex items-center gap-2 px-4 py-2 text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-sm font-medium text-sm transition-colors"
              >
                <Icon name="mdi:open-in-new" class="w-4 h-4" />
                <span>Open in new tab</span>
              </a>

              <!-- Download button -->
              <a
                v-if="currentPdf"
                :href="currentPdf.url"
                :download="currentPdf.filename || 'document.pdf'"
                class="hidden md:flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-sm font-medium text-sm hover:bg-primary-dark transition-colors"
                aria-label="Download PDF"
              >
                <Icon name="mdi:download" class="w-4 h-4" />
                <span>Download</span>
              </a>

              <!-- Close button -->
              <button
                ref="closeButtonRef"
                class="p-2 text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-sm transition-colors"
                @click="closeViewer"
                aria-label="Close PDF viewer"
              >
                <Icon name="mdi:close" class="w-6 h-6" />
              </button>
            </div>
          </div>

          <!-- PDF Content Area: the iframe fills it and the browser's viewer fits the sheet -->
          <div class="flex-1 min-h-0 p-2 md:p-4">
            <iframe
              v-if="currentPdf"
              :src="viewerSrc(currentPdf.url)"
              class="block w-full h-full bg-white rounded-sm shadow-2xl"
              :title="`PDF: ${currentPdf.title || 'Document'}`"
            />
          </div>

          <!-- Mobile action bar (shown at bottom on small screens) -->
          <div class="md:hidden flex items-center justify-around px-4 py-3 bg-neutral-900 border-t border-neutral-700">
            <a
              v-if="currentPdf"
              :href="currentPdf.url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex flex-col items-center gap-1 text-neutral-300 hover:text-white transition-colors"
            >
              <Icon name="mdi:open-in-new" class="w-6 h-6" />
              <span class="text-xs">Open</span>
            </a>
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
  preview?: string  // WordPress API returns 'preview' for PDF thumbnails
}

interface Props {
  pdfs: PdfDocument[]
}

const props = defineProps<Props>()

const viewerOpen = ref(false)
const currentPdf = ref<PdfDocument | null>(null)
const currentIndex = ref(0)
const loading = ref(false)
const viewerRef = ref<HTMLElement | null>(null)
const closeButtonRef = ref<HTMLElement | null>(null)
const previouslyFocused = ref<HTMLElement | null>(null)

// Fit the whole sheet (view=Fit for Chrome/Edge/Acrobat, zoom=page-fit for Firefox's pdf.js)
// and hide the thumbnail sidebar; drawings are usually a single sheet
const viewerSrc = (url: string) => `${url}#view=Fit&zoom=page-fit&navpanes=0`

const openPdf = (pdf: PdfDocument, index: number) => {
  currentPdf.value = pdf
  currentIndex.value = index
  viewerOpen.value = true
  loading.value = true

  // Save currently focused element
  previouslyFocused.value = document.activeElement as HTMLElement

  document.body.style.overflow = 'hidden'

  // Reset loading after a delay
  setTimeout(() => {
    loading.value = false
  }, 500)

  // Focus close button after opening
  nextTick(() => {
    closeButtonRef.value?.focus()
  })
}

const closeViewer = () => {
  viewerOpen.value = false
  currentPdf.value = null
  document.body.style.overflow = ''

  // Return focus to the element that opened the viewer
  nextTick(() => {
    previouslyFocused.value?.focus()
  })
}

// Keyboard navigation
onKeyStroke('Escape', (e) => {
  if (viewerOpen.value) {
    e.preventDefault()
    closeViewer()
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (viewerOpen.value) {
    document.body.style.overflow = ''
  }
})

// Expose for testing
defineExpose({
  openPdf,
  closeViewer,
  viewerOpen,
  currentPdf,
  currentIndex,
  loading,
  previouslyFocused,
  closeButtonRef
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
