<template>
  <header
    ref="headerRef"
    class="sticky top-0 z-50 transition-shadow duration-300"
    :class="isScrolled ? 'bg-white shadow-md' : 'bg-white'"
  >
    <div class="container">
      <div class="flex items-center justify-between h-20">
        <!-- Logo: never shrinks, so a crowded row can't squash it -->
        <NuxtLink to="/" class="flex items-center shrink-0" aria-label="VP Associates Home">
          <img
            src="/images/vp-logo.png"
            alt="VP & Associates, Inc. Logo"
            class="h-12 w-auto logo-black"
            width="180"
            height="50"
          />
        </NuxtLink>

        <!-- Desktop Navigation: from 1024px only; below that the row doesn't fit
             (portrait iPads lost the logo and scrolled sideways), so tablets get the menu -->
        <nav class="hidden lg:flex items-center space-x-4 xl:space-x-8 whitespace-nowrap" role="navigation" aria-label="Main navigation">
          <NuxtLink
            to="/"
            :aria-current="route.path === '/' ? 'page' : undefined"
            class="text-neutral-700 hover:text-primary transition-colors duration-300 font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm px-2 py-1"
          >
            Home
          </NuxtLink>
          <NuxtLink
            to="/about"
            :aria-current="route.path === '/about' ? 'page' : undefined"
            class="text-neutral-700 hover:text-primary transition-colors duration-300 font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm px-2 py-1"
          >
            About
          </NuxtLink>
          <NuxtLink
            to="/services"
            :aria-current="route.path.startsWith('/services') ? 'page' : undefined"
            class="text-neutral-700 hover:text-primary transition-colors duration-300 font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm px-2 py-1"
          >
            Services
          </NuxtLink>
          <NuxtLink
            to="/projects"
            :aria-current="route.path.startsWith('/projects') ? 'page' : undefined"
            class="text-neutral-700 hover:text-primary transition-colors duration-300 font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm px-2 py-1"
          >
            Projects
          </NuxtLink>
          <NuxtLink
            to="/careers"
            :aria-current="route.path === '/careers' ? 'page' : undefined"
            class="text-neutral-700 hover:text-primary transition-colors duration-300 font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm px-2 py-1"
          >
            Careers
          </NuxtLink>
          <a
            href="https://whiteboard.vp-associates.com"
            target="_blank"
            rel="noopener noreferrer"
            class="text-neutral-700 hover:text-primary transition-colors duration-300 font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm px-2 py-1 flex items-center gap-1"
          >
            Client Portal
            <Icon name="mdi:open-in-new" class="w-4 h-4" />
          </a>
          <NuxtLink
            to="/search"
            :aria-current="route.path === '/search' ? 'page' : undefined"
            class="text-neutral-700 hover:text-primary transition-colors duration-300 font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm px-2 py-1 flex items-center justify-center"
            aria-label="Search"
          >
            <Icon name="mdi:magnify" class="w-5 h-5" />
          </NuxtLink>
          <NuxtLink
            to="/contact"
            :aria-current="route.path === '/contact' ? 'page' : undefined"
            class="btn-primary h-10 px-5"
          >
            Contact
          </NuxtLink>
        </nav>

        <!-- Mobile Menu Button -->
        <button
          @click="isOpen = !isOpen"
          class="lg:hidden p-2 rounded-sm hover:bg-neutral-100 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          :aria-label="isOpen ? 'Close menu' : 'Open menu'"
          :aria-expanded="isOpen"
          aria-controls="mobile-menu"
        >
          <Icon
            :name="isOpen ? 'mdi:close' : 'mdi:menu'"
            class="w-6 h-6 text-neutral-800"
          />
        </button>
      </div>
    </div>

    <!-- Mobile and tablet navigation: capped at the screen below the 5rem bar so every link stays reachable on a landscape phone -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-show="isOpen" id="mobile-menu" class="lg:hidden bg-white border-t border-neutral-200 max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain">
        <!-- Screen reader announcement for menu state -->
        <div class="sr-only" aria-live="polite">
          {{ isOpen ? 'Menu opened' : 'Menu closed' }}
        </div>
        <nav class="container py-4 space-y-2" role="navigation" aria-label="Mobile navigation">
          <NuxtLink
            to="/"
            @click="isOpen = false"
            :aria-current="route.path === '/' ? 'page' : undefined"
            class="block px-4 py-3 rounded-sm hover:bg-neutral-100 transition-colors text-neutral-700 font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Home
          </NuxtLink>
          <NuxtLink
            to="/about"
            @click="isOpen = false"
            :aria-current="route.path === '/about' ? 'page' : undefined"
            class="block px-4 py-3 rounded-sm hover:bg-neutral-100 transition-colors text-neutral-700 font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            About
          </NuxtLink>
          <NuxtLink
            to="/services"
            @click="isOpen = false"
            :aria-current="route.path.startsWith('/services') ? 'page' : undefined"
            class="block px-4 py-3 rounded-sm hover:bg-neutral-100 transition-colors text-neutral-700 font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Services
          </NuxtLink>
          <NuxtLink
            to="/projects"
            @click="isOpen = false"
            :aria-current="route.path.startsWith('/projects') ? 'page' : undefined"
            class="block px-4 py-3 rounded-sm hover:bg-neutral-100 transition-colors text-neutral-700 font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Projects
          </NuxtLink>
          <NuxtLink
            to="/careers"
            @click="isOpen = false"
            :aria-current="route.path === '/careers' ? 'page' : undefined"
            class="block px-4 py-3 rounded-sm hover:bg-neutral-100 transition-colors text-neutral-700 font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Careers
          </NuxtLink>
          <a
            href="https://whiteboard.vp-associates.com"
            target="_blank"
            rel="noopener noreferrer"
            @click="isOpen = false"
            class="block px-4 py-3 rounded-sm hover:bg-neutral-100 transition-colors text-neutral-700 font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 flex items-center gap-2"
          >
            Client Portal
            <Icon name="mdi:open-in-new" class="w-4 h-4" />
          </a>
          <NuxtLink
            to="/search"
            @click="isOpen = false"
            :aria-current="route.path === '/search' ? 'page' : undefined"
            class="block px-4 py-3 rounded-sm hover:bg-neutral-100 transition-colors text-neutral-700 font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 flex items-center gap-2"
          >
            <Icon name="mdi:magnify" class="w-5 h-5" />
            Search
          </NuxtLink>
          <NuxtLink
            to="/contact"
            @click="isOpen = false"
            :aria-current="route.path === '/contact' ? 'page' : undefined"
            class="block px-4 py-3 rounded-sm bg-primary text-white hover:bg-primary-dark transition-colors duration-300 font-medium text-center focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Contact
          </NuxtLink>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { useEscapeKey } from '~/composables/useKeyboardNavigation'

const isOpen = ref(false)
const isScrolled = ref(false)
const headerRef = ref<HTMLElement>()

// Close menu on Escape key
useEscapeKey(isOpen)

// Close menu on a tap anywhere below the header
onClickOutside(headerRef, () => {
  isOpen.value = false
})

// Track scroll position for shadow effect
onMounted(() => {
  const handleScroll = () => {
    isScrolled.value = window.scrollY > 10
  }
  window.addEventListener('scroll', handleScroll)
  handleScroll() // Initial check

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })
})

// Close menu when route changes
const route = useRoute()
watch(() => route.path, () => {
  isOpen.value = false
})

// Expose for testing
defineExpose({
  isOpen,
  isScrolled
})
</script>

<style scoped>
.logo-black {
  filter: brightness(0) saturate(100%);
}
</style>
