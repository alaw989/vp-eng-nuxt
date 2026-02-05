<template>
  <div class="project-gallery">
    <!-- Main featured image -->
    <div
      class="aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl relative cursor-pointer group"
      @click="openLightbox(0)"
      @keydown.enter="openLightbox(0)"
      role="button"
      tabindex="0"
      :aria-label="`Open gallery for ${projectName}`"
    >
      <NuxtImg
        v-if="images.length > 0"
        :src="images[0]"
        :alt="`${projectName} - Project Image 1`"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        format="webp"
        sizes="100vw"
        width="1920"
        height="1080"
        loading="eager"
        fetchpriority="high"
        placeholder
      />
      <div
        v-if="images.length > 0"
        class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center"
      >
        <Icon
          name="mdi:magnify-plus-outline"
          class="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg"
        />
      </div>
      <!-- Fallback placeholder if no images -->
      <div
        v-else
        class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary-dark/20"
      >
        <Icon name="mdi:image-multiple" class="w-24 h-24 text-primary/30" />
      </div>
    </div>

    <!-- Thumbnail gallery (if multiple images) -->
    <div
      v-if="images.length > 1"
      class="grid grid-cols-4 md:grid-cols-5 gap-4 mt-6"
    >
      <div
        v-for="(image, index) in images.slice(0, showAllThumbnails ? undefined : 5)"
        :key="index"
        class="aspect-[16/9] rounded-lg overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
        :class="{ 'ring-2 ring-primary': index === 0 && !showAllThumbnails }"
        @click="openLightbox(index)"
        role="button"
        tabindex="0"
        @keydown.enter="openLightbox(index)"
      >
        <NuxtImg
          :src="image"
          :alt="`${projectName} - Project Image ${index + 1}`"
          class="w-full h-full object-cover"
          format="webp"
          loading="lazy"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
          width="400"
          height="225"
          placeholder
        />
      </div>

      <!-- Show more button if there are more than 5 images -->
      <button
        v-if="!showAllThumbnails && images.length > 5"
        class="aspect-[16/9] rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors flex flex-col items-center justify-center cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        @click="showAllThumbnails = true"
      >
        <Icon name="mdi:dots-horizontal" class="w-8 h-8 text-neutral-600" />
        <span class="text-sm text-neutral-600 mt-1">+{{ images.length - 5 }} more</span>
      </button>
    </div>

    <!-- Lightbox Modal -->
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
          v-if="lightboxOpen"
          ref="lightboxRef"
          class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          :aria-label="`Project Gallery - ${projectName}`"
          @click.self="closeLightbox"
          @keydown.esc="closeLightbox"
        >
          <!-- Close button -->
          <button
            ref="closeButtonRef"
            class="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10 p-2 rounded-lg focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            @click="closeLightbox"
            aria-label="Close gallery"
          >
            <Icon name="mdi:close" class="w-8 h-8" />
          </button>

          <!-- Navigation arrows -->
          <button
            v-if="canGoPrevious"
            class="absolute left-4 text-white/80 hover:text-white transition-colors z-10 p-2 rounded-lg focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            @click.stop="goToPrevious"
            aria-label="Previous image"
          >
            <Icon name="mdi:chevron-left" class="w-12 h-12" />
          </button>
          <button
            v-if="canGoNext"
            class="absolute right-4 text-white/80 hover:text-white transition-colors z-10 p-2 rounded-lg focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            @click.stop="goToNext"
            aria-label="Next image"
          >
            <Icon name="mdi:chevron-right" class="w-12 h-12" />
          </button>

          <!-- Main image -->
          <div class="relative max-w-7xl max-h-[90vh] px-4">
            <Transition
              enter-active-class="transition-opacity duration-300"
              enter-from-class="opacity-0"
              enter-to-class="opacity-100"
              leave-active-class="transition-opacity duration-300"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
              mode="out-in"
            >
              <NuxtImg
                :key="currentImageIndex"
                :src="images[currentImageIndex]"
                :alt="`${projectName} - Project Image ${currentImageIndex + 1}`"
                class="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                format="webp"
                sizes="100vw"
                width="1920"
                height="1080"
                placeholder
              />
            </Transition>

            <!-- Image counter -->
            <div class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
              {{ currentImageIndex + 1 }} / {{ images.length }}
            </div>
          </div>

          <!-- Thumbnail strip -->
          <div
            v-if="images.length > 1"
            class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4"
            role="tablist"
            aria-label="Gallery thumbnails"
          >
            <button
              v-for="(image, index) in images"
              :key="index"
              class="w-12 h-12 rounded-lg overflow-hidden border-2 transition-all focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              :class="index === currentImageIndex ? 'border-white scale-110' : 'border-white/30 opacity-60 hover:opacity-100'"
              :aria-label="`View image ${index + 1} of ${images.length}`"
              :aria-selected="index === currentImageIndex"
              role="tab"
              @click.stop="currentImageIndex = index"
            >
              <NuxtImg
                :src="image"
                :alt="`Thumbnail ${index + 1}`"
                class="w-full h-full object-cover"
                format="webp"
                width="48"
                height="48"
                loading="lazy"
              />
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
interface Props {
  images: string[]
  projectName: string
}

const props = defineProps<Props>()

const lightboxOpen = ref(false)
const currentImageIndex = ref(0)
const showAllThumbnails = ref(false)
const lightboxRef = ref<HTMLElement | null>(null)
const closeButtonRef = ref<HTMLElement | null>(null)
const previouslyFocused = ref<HTMLElement | null>(null)

const canGoPrevious = computed(() => currentImageIndex.value > 0)
const canGoNext = computed(() => currentImageIndex.value < props.images.length - 1)

// Focus trap for lightbox
const trapFocus = (e: KeyboardEvent) => {
  if (!lightboxRef.value) return

  const focusableElements = lightboxRef.value.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

  if (e.key === 'Tab') {
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault()
      lastElement?.focus()
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault()
      firstElement?.focus()
    }
  }
}

const openLightbox = (index: number) => {
  currentImageIndex.value = index
  lightboxOpen.value = true
  document.body.style.overflow = 'hidden'

  // Save currently focused element
  previouslyFocused.value = document.activeElement as HTMLElement

  // Focus close button after opening
  nextTick(() => {
    closeButtonRef.value?.focus()
  })
}

const closeLightbox = () => {
  lightboxOpen.value = false
  document.body.style.overflow = ''

  // Return focus to the element that opened the lightbox
  nextTick(() => {
    previouslyFocused.value?.focus()
  })
}

const goToPrevious = () => {
  if (canGoPrevious.value) {
    currentImageIndex.value--
  }
}

const goToNext = () => {
  if (canGoNext.value) {
    currentImageIndex.value++
  }
}

// Keyboard navigation
onKeyStroke('ArrowLeft', (e) => {
  if (lightboxOpen.value) {
    e.preventDefault()
    goToPrevious()
  }
})

onKeyStroke('ArrowRight', (e) => {
  if (lightboxOpen.value) {
    e.preventDefault()
    goToNext()
  }
})

onKeyStroke('Home', (e) => {
  if (lightboxOpen.value) {
    e.preventDefault()
    currentImageIndex.value = 0
  }
})

onKeyStroke('End', (e) => {
  if (lightboxOpen.value) {
    e.preventDefault()
    currentImageIndex.value = props.images.length - 1
  }
})

// Watch for lightbox open state to add/remove focus trap
watch(lightboxOpen, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      lightboxRef.value?.addEventListener('keydown', trapFocus)
    })
  } else {
    lightboxRef.value?.removeEventListener('keydown', trapFocus)
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (lightboxOpen.value) {
    document.body.style.overflow = ''
  }
  lightboxRef.value?.removeEventListener('keydown', trapFocus)
})
</script>
