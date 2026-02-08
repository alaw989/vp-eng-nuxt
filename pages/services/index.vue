<template>
  <div>
    <!-- Page Header -->
    <AppSection bg-color="primary-dark" padding="lg">
      <div class="container text-center text-white">
        <h1 class="text-5xl md:text-6xl font-display font-bold mb-6">
          Our Services
        </h1>
        <p class="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
          Comprehensive structural engineering solutions for projects of all sizes
        </p>
      </div>
    </AppSection>

    <!-- Category Filter Section -->
    <AppSection bg-color="neutral-50" padding="md">
      <div class="container">
        <div class="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
          <button
            v-for="category in serviceCategories"
            :key="category.id"
            @click="setCategory(category.id)"
            :class="[
              'px-6 py-2.5 rounded-full font-semibold transition-all duration-300 whitespace-nowrap snap-start',
              activeCategory === category.id
                ? 'bg-primary text-white shadow-lg scale-105'
                : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
            ]"
            :aria-pressed="activeCategory === category.id"
            :aria-label="`Filter by ${category.name}`"
          >
            {{ category.name }}
          </button>
        </div>
        <div class="text-center text-neutral-600 mt-4">
          <span aria-live="polite">{{ filteredServices.length }} service{{ filteredServices.length !== 1 ? 's' : '' }}</span>
        </div>
      </div>
    </AppSection>

    <!-- Services Overview -->
    <AppSection bg-color="white" animate-on-scroll>
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-6">
          Complete Structural Engineering Services
        </h2>
        <p class="text-xl text-neutral-600 max-w-3xl mx-auto">
          From initial design to construction support, we provide end-to-end structural engineering expertise. Our services encompass all major construction materials and project types.
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 gap-8" aria-hidden="true">
        <ServiceCardSkeleton v-for="i in 6" :key="`skeleton-${i}`" />
      </div>

      <!-- Services Grid -->
      <div v-else-if="filteredServices.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
          v-for="service in filteredServices"
          :key="service.slug"
          class="bg-white rounded-xl p-8 border-2 border-neutral-200 hover:border-primary hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-start gap-4 mb-4">
            <div class="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon :name="service.icon" class="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 class="text-2xl font-bold text-neutral-900 mb-2">
                {{ service.title }}
              </h3>
              <div v-if="service.standard" class="text-sm font-semibold text-primary mb-2">
                {{ service.standard }}
              </div>
            </div>
          </div>
          <p class="text-neutral-600 mb-4">
            {{ service.description }}
          </p>
          <ul v-if="service.capabilities" class="space-y-2 mb-4">
            <li v-for="cap in service.capabilities" :key="cap" class="flex items-start gap-2 text-neutral-700">
              <Icon name="mdi:check-circle" class="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
              <span class="text-sm">{{ cap }}</span>
            </li>
          </ul>
          <NuxtLink
            v-if="service.slug"
            :to="`/services/${service.slug}`"
            class="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-dark transition-colors"
          >
            Learn More
            <Icon name="mdi:arrow-right" class="w-4 h-4" />
          </NuxtLink>
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
      <div class="text-center mb-16">
        <h2 class="text-4xl font-display font-bold text-neutral-900 mb-4">
          Why Choose VP Associates?
        </h2>
        <p class="text-xl text-neutral-600 max-w-3xl mx-auto">
          The VP Associates advantage for your structural engineering needs
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-8">
        <div class="text-center">
          <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="mdi:clock-fast" class="w-10 h-10 text-primary" />
          </div>
          <h3 class="text-xl font-bold text-neutral-900 mb-3">Fast Turnaround</h3>
          <p class="text-neutral-600">
            We understand project timelines. Our team delivers quality engineering designs on schedule, every time.
          </p>
        </div>

        <div class="text-center">
          <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="mdi:file-document-check" class="w-10 h-10 text-primary" />
          </div>
          <h3 class="text-xl font-bold text-neutral-900 mb-3">Code Compliance</h3>
          <p class="text-neutral-600">
            Every design meets or exceeds Florida Building Code requirements. No red flags, no delays.
          </p>
        </div>

        <div class="text-center">
          <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="mdi:account-group" class="w-10 h-10 text-primary" />
          </div>
          <h3 class="text-xl font-bold text-neutral-900 mb-3">Experienced Team</h3>
          <p class="text-neutral-600">
            Licensed engineers with decades of combined experience across all project types and materials.
          </p>
        </div>

        <div class="text-center">
          <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="mdi:tools" class="w-10 h-10 text-primary" />
          </div>
          <h3 class="text-xl font-bold text-neutral-900 mb-3">Buildable Designs</h3>
          <p class="text-neutral-600">
            Practical, constructible solutions that work in the field. We design with contractors in mind.
          </p>
        </div>

        <div class="text-center">
          <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="mdi:calculator" class="w-10 h-10 text-primary" />
          </div>
          <h3 class="text-xl font-bold text-neutral-900 mb-3">Cost Effective</h3>
          <p class="text-neutral-600">
            Optimized designs that minimize material while maintaining safety. Value engineering built in.
          </p>
        </div>

        <div class="text-center">
          <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="mdi:phone-in-talk" class="w-10 h-10 text-primary" />
          </div>
          <h3 class="text-xl font-bold text-neutral-900 mb-3">Responsive Service</h3>
          <p class="text-neutral-600">
            Real people answer the phone. We're available when you need us, from RFIs to site visits.
          </p>
        </div>
      </div>
    </AppSection>

    <!-- Process Section -->
    <AppSection bg-color="white" animate-on-scroll>
      <div class="text-center mb-16">
        <h2 class="text-4xl font-display font-bold text-neutral-900 mb-4">
          Our Process
        </h2>
        <p class="text-xl text-neutral-600 max-w-3xl mx-auto">
          How we work with you from concept to completion
        </p>
      </div>

      <div class="grid md:grid-cols-4 gap-8">
        <div class="relative">
          <div class="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-4">1</div>
          <h3 class="text-xl font-bold text-neutral-900 mb-2">Consultation</h3>
          <p class="text-neutral-600 text-sm">Initial project review and scope discussion</p>
          <div class="hidden md:block absolute top-6 left-full w-full h-0.5 bg-primary/20 -translate-x-6"></div>
        </div>

        <div class="relative">
          <div class="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-4">2</div>
          <h3 class="text-xl font-bold text-neutral-900 mb-2">Design</h3>
          <p class="text-neutral-600 text-sm">Structural analysis and calculation preparation</p>
          <div class="hidden md:block absolute top-6 left-full w-full h-0.5 bg-primary/20 -translate-x-6"></div>
        </div>

        <div class="relative">
          <div class="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-4">3</div>
          <h3 class="text-xl font-bold text-neutral-900 mb-2">Review</h3>
          <p class="text-neutral-600 text-sm">Plan preparation and permitting support</p>
          <div class="hidden md:block absolute top-6 left-full w-full h-0.5 bg-primary/20 -translate-x-6"></div>
        </div>

        <div>
          <div class="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-4">4</div>
          <h3 class="text-xl font-bold text-neutral-900 mb-2">Support</h3>
          <p class="text-neutral-600 text-sm">Construction administration and field services</p>
        </div>
      </div>
    </AppSection>

    <!-- CTA Section -->
    <AppSection bg-color="primary" padding="xl">
      <div class="container text-center text-white">
        <h2 class="text-4xl font-display font-bold mb-6">
          Ready to Start Your Project?
        </h2>
        <p class="text-xl mb-8 max-w-2xl mx-auto opacity-90">
          Contact us to discuss your structural engineering needs
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink
            to="/contact"
            class="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-lg font-semibold hover:bg-neutral-100 hover:-translate-y-0.5 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Get a Quote
            <Icon name="mdi:arrow-right" class="w-5 h-5" />
          </NuxtLink>
          <a
            href="tel:+18135551234"
            class="inline-flex items-center gap-2 px-8 py-4 bg-secondary text-white rounded-lg font-semibold hover:bg-secondary-dark hover:-translate-y-0.5 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Icon name="mdi:phone" class="w-5 h-5" />
            (813) 555-1234
          </a>
        </div>
      </div>
    </AppSection>
  </div>
</template>

<script setup lang="ts">
// SEO Meta Tags
// usePageMeta disabled temporarily to debug redirect issue
// usePageMeta({
//   title: 'Services',
//   description: 'VP Associates provides comprehensive structural engineering services including steel, concrete, masonry, wood, foundations, seawalls, and steel detailing in Tampa Bay.',
//   keywords: 'structural steel design, concrete design, masonry design, wood design, foundation design, seawall design, steel detailing, Tampa Bay engineering',
//   ogImage: 'https://vp-associates.com/images/og-services.jpg',
// })

const route = useRoute()

// Simulate initial loading state for skeleton display
const pending = ref(true)
onMounted(() => {
  // Simulate data fetching delay to show skeleton
  setTimeout(() => {
    pending.value = false
  }, 800)
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

const allServices: Service[] = [
  {
    title: 'Structural Steel Design',
    slug: 'structural-steel-design',
    standard: 'AISC Certified',
    description: 'Complete structural steel design for commercial, industrial, and marine projects. From moment frames to braced frames, we deliver efficient steel solutions.',
    icon: 'mdi:beam',
    capabilities: [
      'Moment frame design',
      'Braced frame systems',
      'Steel connection design',
      'Metal building systems',
      'Industrial platforms and mezzanines',
      'Seismic load analysis'
    ]
  },
  {
    title: 'Concrete Design',
    slug: 'concrete-design',
    standard: 'ACI Certified',
    description: 'Reinforced concrete design for foundations, slabs, beams, columns, and shear walls. Expertise in both cast-in-place and precast concrete systems.',
    icon: 'mdi:cube-outline',
    capabilities: [
      'Foundation systems',
      'Flat plate and flat slab design',
      'Beam and column design',
      'Shear wall systems',
      'Precast concrete systems',
      'Post-tensioned concrete'
    ]
  },
  {
    title: 'Masonry Design',
    slug: 'masonry-design',
    standard: 'ACI 530 Compliant',
    description: 'Structural masonry design for load-bearing walls, partitions, and veneers. Both concrete masonry and clay masonry systems.',
    icon: 'mdi:wall',
    capabilities: [
      'Load-bearing masonry walls',
      'Masonry shear walls',
      'Reinforced masonry design',
      'Masonry veneer systems',
      'Fire wall design',
      'Masonry restoration'
    ]
  },
  {
    title: 'Wood Design',
    slug: 'wood-design',
    standard: 'NDS Standards',
    description: 'Light wood frame design for residential and light commercial projects. Engineered lumber systems and traditional sawn lumber.',
    icon: 'mdi:tree',
    capabilities: [
      'Light frame construction',
      'Floor and roof truss design',
      'Glulam and PSL beams',
      'Cross-laminated timber',
      'Wood shear walls',
      'Deck and balcony design'
    ]
  },
  {
    title: 'Foundation Design',
    slug: 'foundation-design',
    description: 'Comprehensive foundation engineering for all structure types. Deep foundations including piles and drilled shafts, shallow foundations, and mat foundations.',
    icon: 'mdi:home-floor-0',
    capabilities: [
      'Shallow foundations',
      'Deep foundation systems',
      'Pile foundation design',
      'Drilled shafts',
      'Mat foundations',
      'Foundation retrofit and repair'
    ]
  },
  {
    title: 'Seawall Design',
    slug: 'seawall-design',
    description: 'Coastal protection structures including seawalls, bulkheads, and retaining walls. Expertise in Florida coastal construction requirements.',
    icon: 'mdi:waves',
    capabilities: [
      'Concrete seawalls',
      'Steel sheet pile walls',
      'Vinyl sheet pile bulkheads',
      'Revetment design',
      'Coastal erosion control',
      'Seawall repair and retrofit'
    ]
  },
  {
    title: 'Steel Connection Design',
    slug: 'steel-connection-design',
    description: 'Detailed steel connection design and shop drawing preparation. Standard and custom connections for all steel projects.',
    icon: 'mdi:vector-arrange-above',
    capabilities: [
      'Moment connections',
      'Shear connections',
      'Bracing connections',
      'Base plate design',
      'Custom fabrications',
      'Shop drawing preparation'
    ]
  },
  {
    title: 'CAD & 3D Modeling',
    slug: 'cad-3d-modeling',
    description: 'Advanced CAD and BIM modeling services for coordination and fabrication. Building information modeling for clash detection and integration.',
    icon: 'mdi:cube-scan',
    capabilities: [
      'AutoCAD drafting',
      'Revit BIM modeling',
      '3D structural models',
      'Clash detection coordination',
      'Shop drawing production',
      'As-built documentation'
    ]
  },
  {
    title: 'Inspection Services',
    slug: 'inspection-services',
    description: 'Professional structural inspection services for new construction, existing buildings, and forensic investigations.',
    icon: 'mdi:magnify-scan',
    capabilities: [
      'Foundation inspections',
      'Framing inspections',
      'Steel erection observation',
      'Concrete inspection',
      'Structural assessments',
      'Forensic investigations'
    ]
  },
  {
    title: 'Steel Detailing',
    slug: 'steel-detailing',
    description: 'Professional steel detailing using SDS2 and BIM software. Complete fabrication and erection drawings for steel fabricators.',
    icon: 'mdi:pencil-ruler',
    capabilities: [
      'SDS2 detailing',
      'BIM steel modeling',
      'Erection drawings',
      'Fabrication drawings',
      'Connection calculations',
      'Material takeoffs and bills'
    ]
  }
]

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
  if (activeCategory.value === 'all') return allServices
  return allServices.filter(service =>
    getServiceCategory(service.slug) === activeCategory.value
  )
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
