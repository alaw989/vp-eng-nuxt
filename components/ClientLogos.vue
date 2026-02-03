<template>
  <AppSection
    :bg-color="bgColor"
    :padding="padding"
    animate-on-scroll
  >
    <div class="container">
      <div
        v-if="showTitle"
        class="text-center mb-12"
      >
        <h2 class="text-2xl md:text-3xl font-display font-bold text-neutral-900 mb-3">
          {{ title }}
        </h2>
        <p class="text-lg text-neutral-600">
          {{ subtitle }}
        </p>
      </div>

      <!-- Scrolling logos container -->
      <div class="relative overflow-hidden">
        <!-- Gradient fade masks -->
        <div class="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
        <div class="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />

        <!-- Scrolling track -->
        <div class="flex items-center">
          <div
            class="flex gap-12 animate-scroll"
            :class="{ 'hover:pause': pauseOnHover }"
          >
            <!-- Duplicate logos for seamless loop -->
            <div
              v-for="(_, setIndex) in 2"
              :key="setIndex"
              class="flex gap-12"
            >
              <div
                v-for="client in clients"
                :key="`${client.name}-${setIndex}`"
                class="flex-shrink-0 client-logo-item opacity-60 hover:opacity-100 transition-opacity duration-300"
              >
                <!-- Icon-based logo placeholder -->
                <div
                  class="flex items-center gap-3 px-6 py-4 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-primary hover:shadow-md transition-all"
                >
                  <Icon
                    :name="client.icon || 'mdi:domain'"
                    class="w-10 h-10 text-primary flex-shrink-0"
                  />
                  <span class="font-semibold text-neutral-700 whitespace-nowrap">
                    {{ client.name }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Static grid for non-animated version (mobile fallback or alternative layout) -->
      <div
        v-if="showStaticGrid"
        class="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
      >
        <div
          v-for="client in clients.slice(0, 6)"
          :key="`static-${client.name}`"
          class="flex items-center justify-center gap-2 px-4 py-3 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-primary transition-all"
        >
          <Icon
            :name="client.icon || 'mdi:domain'"
            class="w-8 h-8 text-primary flex-shrink-0"
          />
          <span class="text-sm font-medium text-neutral-700 text-center">
            {{ client.name }}
          </span>
        </div>
      </div>
    </div>
  </AppSection>
</template>

<script setup lang="ts">
interface Client {
  name: string
  icon?: string
}

interface Props {
  clients?: Client[]
  title?: string
  subtitle?: string
  bgColor?: 'white' | 'neutral' | 'primary' | 'primary-dark' | 'secondary' | 'neutral-50' | 'neutral-100'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  showTitle?: boolean
  pauseOnHover?: boolean
  showStaticGrid?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  clients: () => [
    { name: 'Tampa General', icon: 'mdi:hospital' },
    { name: 'Raymond James', icon: 'mdi:office-building' },
    { name: 'Port Tampa Bay', icon: 'mdi:ship' },
    { name: 'Hillsborough County', icon: 'mdi:bank' },
    { name: 'City of Tampa', icon: 'mdi:city' },
    { name: 'USF', icon: 'mdi:school' },
    { name: 'Moffitt Cancer Center', icon: 'mdi:medical-bag' },
    { name: 'TECO', icon: 'mdi:lightning-bolt' },
  ],
  title: 'Trusted by Industry Leaders',
  subtitle: 'Proud to serve prestigious clients across Tampa Bay and Florida',
  bgColor: 'white',
  padding: 'md',
  showTitle: true,
  pauseOnHover: true,
  showStaticGrid: true
})
</script>

<style scoped>
@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.animate-scroll {
  animation: scroll 30s linear infinite;
}

.hover\:pause:hover {
  animation-play-state: paused;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .animate-scroll {
    animation: scroll 20s linear infinite;
  }
}

/* Fade transition for logo hover */
.client-logo-item {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.client-logo-item:hover {
  transform: scale(1.05);
}
</style>
