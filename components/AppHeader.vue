<template>
  <header class="bg-white shadow-sm sticky top-0 z-50">
    <div class="container">
      <div class="flex items-center justify-between h-20">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center space-x-3">
          <div class="text-2xl font-display font-bold text-primary">
            VP Associates
          </div>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-8" aria-label="Main navigation">
          <NuxtLink
            to="/"
            class="text-neutral-700 hover:text-primary transition-colors font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg px-2 py-1"
          >
            Home
          </NuxtLink>
          <NuxtLink
            to="/about"
            class="text-neutral-700 hover:text-primary transition-colors font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg px-2 py-1"
          >
            About
          </NuxtLink>
          <NuxtLink
            to="/services"
            class="text-neutral-700 hover:text-primary transition-colors font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg px-2 py-1"
          >
            Services
          </NuxtLink>
          <NuxtLink
            to="/projects"
            class="text-neutral-700 hover:text-primary transition-colors font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg px-2 py-1"
          >
            Projects
          </NuxtLink>
          <NuxtLink
            to="/contact"
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
        <nav class="container py-4 space-y-2" aria-label="Mobile navigation">
          <NuxtLink
            to="/"
            @click="isOpen = false"
            class="block px-4 py-3 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-700 font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Home
          </NuxtLink>
          <NuxtLink
            to="/about"
            @click="isOpen = false"
            class="block px-4 py-3 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-700 font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            About
          </NuxtLink>
          <NuxtLink
            to="/services"
            @click="isOpen = false"
            class="block px-4 py-3 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-700 font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Services
          </NuxtLink>
          <NuxtLink
            to="/projects"
            @click="isOpen = false"
            class="block px-4 py-3 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-700 font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Projects
          </NuxtLink>
          <NuxtLink
            to="/contact"
            @click="isOpen = false"
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
const isOpen = ref(false)

// Close menu when route changes
const route = useRoute()
watch(() => route.path, () => {
  isOpen.value = false
})
</script>
