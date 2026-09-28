<template>
  <div>
    <!-- Page Banner -->
    <PageBanner
      eyebrow="Design · Detailing · Inspection"
      headline="Our Services"
      subheadline="Comprehensive structural engineering solutions for projects of all sizes"
      background-image="/images/hero/construction-steel-beams-1920w.jpg"
      background-alt="Steel beams construction showcasing structural engineering capabilities"
      aria-label="Services page banner"
    />

    <!-- Services Overview -->
    <AppSection bg-color="white" animate-on-scroll>
      <SectionHeading
        title="Complete Structural Engineering Services"
        lede="From initial design to construction support, we provide end-to-end structural engineering expertise. Our services encompass all major construction materials and project types."
      />

      <!-- Toolbar -->
      <div class="border-b border-neutral-200 pb-6 mb-8">
        <div class="flex items-stretch overflow-x-auto scrollbar-hide snap-x snap-mandatory border border-neutral-300 rounded-sm bg-white w-fit max-w-full divide-x divide-neutral-300">
          <button
            v-for="category in serviceCategories"
            :key="category.id"
            @click="setCategory(category.id)"
            :class="[
              'h-11 px-5 font-semibold transition-colors duration-200 whitespace-nowrap snap-start focus-visible:outline-2 focus-visible:outline-primary focus-visible:-outline-offset-2',
              activeCategory === category.id
                ? 'bg-primary text-white'
                : 'bg-white text-neutral-700 hover:bg-neutral-50'
            ]"
            :aria-pressed="activeCategory === category.id"
            :aria-label="`Filter by ${category.name}`"
          >
            {{ category.name }}
          </button>
        </div>
        <p class="eyebrow text-neutral-600 mt-4">
          <span aria-live="polite">{{ filteredServices.length }} service{{ filteredServices.length !== 1 ? 's' : '' }}</span>
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 gap-8" aria-hidden="true">
        <ServiceCardSkeleton v-for="i in 6" :key="`skeleton-${i}`" />
      </div>

      <!-- Services Grid -->
      <div ref="servicesContainer" v-else-if="filteredServices.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
          v-for="service in filteredServices"
          :key="service.slug"
          class="card group relative p-8 hover:border-primary"
        >
          <div>
            <div class="flex items-start gap-4 mb-4">
              <div class="w-14 h-14 bg-primary/10 rounded-sm flex items-center justify-center flex-shrink-0">
                <Icon :name="service.icon" class="w-8 h-8 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h3 class="text-2xl font-bold text-neutral-900 mb-2 group-hover:text-primary transition-colors">
                  {{ service.title }}
                </h3>
                <div v-if="service.standard" class="inline-block px-2 py-0.5 eyebrow font-semibold text-primary border border-primary/40 rounded-sm">
                  {{ service.standard }}
                </div>
              </div>
            </div>
            <p class="text-neutral-600 mb-4">
              {{ service.description }}
            </p>
            <ul v-if="service.capabilities" class="space-y-2 mb-4">
              <li v-for="cap in service.capabilities" :key="cap" class="flex items-start gap-2 text-neutral-700">
                <Icon name="mdi:check" class="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span class="text-sm">{{ cap }}</span>
              </li>
            </ul>
            <NuxtLink
              v-if="service.slug"
              :to="`/services/${service.slug}`"
              class="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-dark transition-colors group-hover:gap-3"
            >
              {{ service.title }} details
              <Icon name="mdi:arrow-right" class="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <Icon name="mdi:folder-open-outline" class="w-16 h-16 text-neutral-300 mx-auto mb-4" />
        <p class="text-xl text-neutral-500">No services found in this category.</p>
      </div>
    </AppSection>

    <!-- Why Choose Us -->
    <AppSection bg-color="neutral-50" animate-on-scroll>
      <div class="grid lg:grid-cols-3 gap-12">
        <div>
          <h2 class="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-4">
            Why Choose VP Associates?
          </h2>
          <p class="text-lg text-neutral-600">
            The VP Associates advantage for your structural engineering needs
          </p>
        </div>

        <ul class="lg:col-span-2 grid sm:grid-cols-2 gap-px bg-neutral-300 border border-neutral-300">
          <li v-for="reason in reasons" :key="reason.title" class="bg-white p-6 md:p-8">
            <h3 class="text-lg font-bold text-neutral-900 mb-2">{{ reason.title }}</h3>
            <p class="text-neutral-600">{{ reason.text }}</p>
          </li>
        </ul>
      </div>
    </AppSection>

    <!-- Process Section -->
    <AppSection bg-color="white" animate-on-scroll>
      <SectionHeading
        title="Our Process"
        lede="How we work with you from concept to completion"
      />

      <ProcessSteps :steps="processSteps" />
    </AppSection>

    <!-- CTA Section -->
    <CtaBlock
      headline="Ready to Start Your Project?"
      subheadline="Contact us to discuss your structural engineering needs"
      primary-label="Get a Quote"
    />
  </div>
</template>

<script setup lang="ts">
import { useFilterTransition } from '~/composables/useFilterTransition'
import { decodeHtmlEntities } from '~/utils/html'
import { processSteps } from '~/utils/process'

const reasons = [
  { title: 'Fast Turnaround', text: 'We understand project timelines and deliver engineering designs on the schedule we agree at the start.' },
  { title: 'Code Compliance', text: 'Every design meets or exceeds Florida Building Code requirements. No red flags, no delays.' },
  { title: 'Experienced Team', text: 'Engineers and detailers with over 30 years of combined experience across steel, concrete, masonry and wood.' },
  { title: 'Buildable Designs', text: 'Practical, constructible solutions that work in the field. We design with contractors in mind.' },
  { title: 'Cost Effective', text: 'Optimized designs that minimize material while maintaining safety. Value engineering built in.' },
  { title: 'Responsive Service', text: "Real people answer the phone. We're available when you need us, from RFIs to site visits." },
]

// Route meta for screen reader announcements
definePageMeta({
  title: 'Services'
})

// FLIP animation for filter transitions
const { containerRef: servicesContainer, animateFilter } = useFilterTransition()

// SEO Meta Tags
usePageMeta({
  title: 'Services',
  description: 'VP Associates provides comprehensive structural engineering services including steel, concrete, masonry, wood, foundations, seawalls, and steel detailing in Tampa Bay.',
  keywords: 'structural steel design, concrete design, masonry design, wood design, foundation design, seawall design, steel detailing, Tampa Bay engineering',
  ogImage: 'https://vp-associates.com/images/og-services.jpg',
})

const route = useRoute()

// Fetch services from WordPress API
const { data: servicesResponse, pending } = await useFetch('/api/services', {
  query: { _nocache: route.query.nocache ? '1' : undefined }
})

const servicesData = computed(() => {
  const response = servicesResponse.value as any
  console.log('[Services Page] API response:', response)
  console.log('[Services Page] response?.data:', response?.data)
  console.log('[Services Page] Is array?:', Array.isArray(response?.data))
  return response?.data || []
})

interface ServiceCategory {
  id: string
  name: string
}

interface Service {
  title: string
  slug: string
  standard?: string
  description: string
  icon: string
  capabilities?: string[]
}

// Service categories for filtering
const serviceCategories: ServiceCategory[] = [
  { id: 'all', name: 'All Services' },
  { id: 'structural', name: 'Structural Design' },
  { id: 'design', name: 'Design & Detailing' },
  { id: 'inspection', name: 'Inspection' },
  { id: 'marine', name: 'Marine & Coastal' }
]

// Service-to-category mapping helper
function getServiceCategory(slug: string): string | null {
  const categoryMap: Record<string, string> = {
    'structural-steel-design': 'structural',
    'concrete-design': 'structural',
    'masonry-design': 'structural',
    'wood-design': 'structural',
    'foundation-design': 'structural',
    'steel-connection-design': 'design',
    'cad-3d-modeling': 'design',
    'steel-detailing': 'design',
    'inspection-services': 'inspection',
    'seawall-design': 'marine'
  }
  return categoryMap[slug] || null
}

// Transform WordPress API data to Service interface
const allServices = computed<Service[]>(() => {
  if (!servicesData.value || !Array.isArray(servicesData.value)) {
    console.warn('[Services Page] No services data found, servicesData:', servicesData.value)
    return []
  }

  return servicesData.value.map((s: any) => {
    // Get title from rendered or raw, decode HTML entities
    const title = decodeHtmlEntities(s.title?.rendered || s.title) || 'Service'
    // Get excerpt, strip HTML, and decode HTML entities
    const excerpt = decodeHtmlEntities(s.excerpt?.rendered?.replace(/<[^>]*>/g, '')) || ''
    // Get custom fields
    const customFields = s.custom_fields || {}

    // Parse content to extract capabilities (list items), decode HTML entities
    const content = s.content?.rendered || ''
    const capabilitiesMatch = content.match(/<li[^>]*>(.*?)<\/li>/g)
    const capabilities = capabilitiesMatch?.map((li: string) => decodeHtmlEntities(li.replace(/<[^>]*>/g, '').trim())) || []

    return {
      title,
      slug: s.slug || '',
      standard: decodeHtmlEntities(customFields.service_standard) || '',
      description: excerpt || '',
      icon: customFields.service_icon || 'mdi:cog',
      capabilities: capabilities.length > 0 ? capabilities : undefined,
    }
  })
})

// Filter state with URL initialization
const activeCategory = ref((route.query.category as string) || 'all')

// Set category and update URL (only if different)
function setCategory(categoryId: string) {
  if (activeCategory.value === categoryId) return // Skip if already set

  activeCategory.value = categoryId

  // Build new query object
  const newQuery: Record<string, string | undefined> = {}
  if (categoryId !== 'all') {
    newQuery.category = categoryId
  }

  // Only navigate if query would actually change
  const currentCategory = route.query.category as string | undefined
  const targetCategory = categoryId !== 'all' ? categoryId : undefined

  if (currentCategory !== targetCategory) {
    navigateTo({ query: newQuery }, { replace: true })
  }
}

// Filtered services computed property
const filteredServices = computed(() => {
  const services = allServices.value || []
  if (activeCategory.value === 'all') return services
  return services.filter(service =>
    getServiceCategory(service.slug) === activeCategory.value
  )
})

// Trigger FLIP animation when filtered services change
watch(filteredServices, async (newServices) => {
  await animateFilter(newServices)
})

// ItemList Schema for services listing (must be after allServices is defined)
useJsonld(() => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'VP Associates Structural Engineering Services',
  description: 'Comprehensive structural engineering services',
  itemListElement: filteredServices.value.map((service, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: service.title,
    description: service.description,
    url: `https://vp-associates.com/services/${service.slug}`,
  })),
}))
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
