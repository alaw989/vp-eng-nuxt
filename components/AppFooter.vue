<template>
  <footer class="bg-neutral-900 text-white">
    <div class="container">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-16">
        <!-- Company Info -->
        <div>
          <h3 class="text-xl font-display font-bold mb-4">VP Associates</h3>
          <p class="text-neutral-400 mb-4">
            Providing structural engineering services to Tampa Bay and surrounding areas.
          </p>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-lg font-semibold mb-4">Quick Links</h4>
          <ul class="space-y-2">
            <li>
              <NuxtLink to="/about" class="text-neutral-400 hover:text-white transition-colors">
                About Us
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/services" class="text-neutral-400 hover:text-white transition-colors">
                Services
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/projects" class="text-neutral-400 hover:text-white transition-colors">
                Projects
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/contact" class="text-neutral-400 hover:text-white transition-colors">
                Contact
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Services -->
        <div>
          <h4 class="text-lg font-semibold mb-4">Services</h4>
          <ul class="space-y-2 text-neutral-400">
            <li>Structural Steel Design</li>
            <li>Concrete Design</li>
            <li>Masonry Design</li>
            <li>Foundation Design</li>
            <li>Seawall Design</li>
            <li>Steel Detailing</li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div>
          <h4 class="text-lg font-semibold mb-4">Contact</h4>
          <address class="not-italic space-y-3 text-neutral-400">
            <p class="flex items-start gap-3">
              <Icon name="mdi:map-marker" class="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>Tampa Bay, Florida</span>
            </p>
            <p class="flex items-center gap-3">
              <Icon name="mdi:phone" class="w-5 h-5 flex-shrink-0" />
              <a href="tel:+18135551234" class="hover:text-white transition-colors">
                (813) 555-1234
              </a>
            </p>
            <p class="flex items-center gap-3">
              <Icon name="mdi:email" class="w-5 h-5 flex-shrink-0" />
              <a href="mailto:info@vp-associates.com" class="hover:text-white transition-colors">
                info@vp-associates.com
              </a>
            </p>
          </address>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-neutral-800 py-6">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <p class="text-neutral-500 text-sm">
            &copy; {{ currentYear }} VP Associates. All rights reserved.
          </p>
          <div class="flex items-center gap-6">
            <a href="#" class="text-neutral-400 hover:text-white transition-colors" aria-label="LinkedIn">
              <Icon name="mdi:linkedin" class="w-5 h-5" />
            </a>
            <a href="#" class="text-neutral-400 hover:text-white transition-colors" aria-label="Facebook">
              <Icon name="mdi:facebook" class="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>
