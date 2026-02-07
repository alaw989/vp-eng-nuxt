<template>
  <header
    class="sticky top-0 z-50 transition-shadow duration-300"
    :class="isScrolled ? 'bg-white shadow-md' : 'bg-white'"
  >
    <div class="container">
      <div class="flex items-center justify-between h-20">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center" aria-label="VP Associates Home">
          <img
            src="/images/logo.png"
            alt="VP & Associates, Inc. Logo"
            class="h-12 w-auto"
            width="180"
            height="50"
          />
        </NuxtLink>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-8" role="navigation" aria-label="Main navigation">
          <NuxtLink
            to="/"
            :aria-current="route.path === '/' ? 'page' : undefined"
            class="text-neutral-700 hover:text-primary transition-colors font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg px-2 py-1"
          >
            Home
          </NuxtLink>
          <NuxtLink
            to="/about"
            :aria-current="route.path === '/about' ? 'page' : undefined"
            class="text-neutral-700 hover:text-primary transition-colors font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg px-2 py-1"
          >
            About
          </NuxtLink>
          <NuxtLink
            to="/services"
            :aria-current="route.path.startsWith('/services') ? 'page' : undefined"
            class="text-neutral-700 hover:text-primary transition-colors font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg px-2 py-1"
          >
            Services
          </NuxtLink>
          <NuxtLink
            to="/projects"
            :aria-current="route.path.startsWith('/projects') ? 'page' : undefined"
            class="text-neutral-700 hover:text-primary transition-colors font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg px-2 py-1"
          >
            Projects
          </NuxtLink>
          <NuxtLink
            to="/careers"
            :aria-current="route.path === '/careers' ? 'page' : undefined"
            class="text-neutral-700 hover:text-primary transition-colors font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg px-2 py-1"
          >
            Careers
          </NuxtLink>
          <NuxtLink
            to="/search"
            :aria-current="route.path === '/search' ? 'page' : undefined"
            class="text-neutral-700 hover:text-primary transition-colors font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg px-2 py-1"
            aria-label="Search"
          >
            <Icon name="mdi:magnify" class="w-5 h-5" />
          </NuxtLink>
          <LazyPwaInstallPrompt />
          <NuxtLink
            to="/contact"
            :aria-current="route.path === '/contact' ? 'page' : undefined"
            class="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Contact
          </NuxtLink>
        </nav>

        <!-- Mobile Menu Button -->
        <button
          @click="isOpen = !isOpen"
          class="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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

    <!-- Mobile Navigation -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-show="isOpen" id="mobile-menu" class="md:hidden bg-white border-t border-neutral-200">
        <nav class="container py-4 space-y-2" role="navigation" aria-label="Mobile navigation">
          <NuxtLink
            to="/"
            @click="isOpen = false"
            :aria-current="route.path === '/' ? 'page' : undefined"
            class="block px-4 py-3 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-700 font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Home
          </NuxtLink>
          <NuxtLink
            to="/about"
            @click="isOpen = false"
            :aria-current="route.path === '/about' ? 'page' : undefined"
            class="block px-4 py-3 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-700 font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            About
          </NuxtLink>
          <NuxtLink
            to="/services"
            @click="isOpen = false"
            :aria-current="route.path.startsWith('/services') ? 'page' : undefined"
            class="block px-4 py-3 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-700 font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Services
          </NuxtLink>
          <NuxtLink
            to="/projects"
            @click="isOpen = false"
            :aria-current="route.path.startsWith('/projects') ? 'page' : undefined"
            class="block px-4 py-3 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-700 font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Projects
          </NuxtLink>
          <NuxtLink
            to="/careers"
            @click="isOpen = false"
            :aria-current="route.path === '/careers' ? 'page' : undefined"
            class="block px-4 py-3 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-700 font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Careers
          </NuxtLink>
          <NuxtLink
            to="/search"
            @click="isOpen = false"
            :aria-current="route.path === '/search' ? 'page' : undefined"
            class="block px-4 py-3 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-700 font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 flex items-center gap-2"
          >
            <Icon name="mdi:magnify" class="w-5 h-5" />
            Search
          </NuxtLink>
          <NuxtLink
            to="/contact"
            @click="isOpen = false"
            :aria-current="route.path === '/contact' ? 'page' : undefined"
            class="block px-4 py-3 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors font-medium text-center focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Contact
          </NuxtLink>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { useEscapeKey } from '~/composables/useKeyboardNavigation'

const isOpen = ref(false)
const isScrolled = ref(false)

// Close menu on Escape key
useEscapeKey(isOpen)

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
</script>
