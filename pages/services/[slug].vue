<template>
  <div>
    <!-- Loading state -->
    <ServiceDetailSkeleton v-if="pending" />

    <!-- Error state -->
    <div v-else-if="error || !service" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <Icon name="mdi:alert-circle" class="w-16 h-16 text-alert mx-auto mb-4" />
        <h1 class="text-2xl font-bold text-neutral-900 mb-2">Service Not Found</h1>
        <p class="text-neutral-600 mb-6">The service you're looking for doesn't exist or has been removed.</p>
        <NuxtLink
          to="/services"
          class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
        >
          <Icon name="mdi:arrow-left" class="w-5 h-5" />
          Back to Services
        </NuxtLink>
      </div>
    </div>

    <!-- Service content -->
    <template v-else>
      <!-- Page Header Banner -->
      <PageBanner
        :headline="service?.title?.rendered || 'Service'"
        :subheadline="serviceDescription"
        :background-image="serviceHeroImage"
        :background-alt="`${service?.title?.rendered || 'Service'} hero image`"
        aria-label="Service page banner"
      />

      <!-- Breadcrumbs with Service Info -->
      <div class="bg-white border-b border-neutral-200">
        <div class="container py-3">
          <div class="flex items-center justify-between">
            <AppBreadcrumbs :breadcrumbs="serviceBreadcrumbs" />
            <div v-if="serviceIcon" class="flex items-center gap-2 text-sm text-neutral-500">
              <Icon :name="serviceIcon" class="w-5 h-5 text-primary" />
              <span v-if="serviceStandard">{{ serviceStandard }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Service Overview -->
      <AppSection bg-color="white" animate-on-scroll>
        <div class="grid md:grid-cols-2 gap-12">
          <div>
            <div class="flex items-start justify-between mb-6">
              <h2 class="text-3xl font-display font-bold text-neutral-900">
                About This Service
              </h2>
            </div>
            <div class="prose prose-lg prose-headings:font-display prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-p:text-neutral-600 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-ul:list-disc prose-ol:list-decimal max-w-none" v-html="service.content.rendered"></div>
            <div class="mt-6 pt-6 border-t border-neutral-200 social-share">
              <LazySocialShare
                :title="service.title.rendered"
                :description="serviceDescription"
              />
            </div>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-neutral-900 mb-6">
              Why Choose VP Associates?
            </h3>
            <ul class="space-y-4">
              <li v-for="benefit in serviceBenefits" :key="benefit" class="flex items-start gap-3">
                <Icon name="mdi:check-circle" class="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
                <span class="text-neutral-700">{{ benefit }}</span>
              </li>
            </ul>

            <div class="mt-8 bg-primary/10 rounded-xl p-6">
              <h4 class="font-bold text-neutral-900 mb-2">Need This Service?</h4>
              <p class="text-neutral-600 mb-4">Contact us to discuss your project requirements.</p>
              <NuxtLink
                to="/contact"
                class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
              >
                Get a Quote
                <Icon name="mdi:arrow-right" class="w-5 h-5" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </AppSection>

      <!-- Capabilities -->
      <AppSection v-if="hasCapabilities" bg-color="neutral-50" animate-on-scroll>
        <div class="text-center mb-12">
          <h2 class="text-4xl font-display font-bold text-neutral-900 mb-4">
            Our Capabilities
          </h2>
          <p class="text-xl text-neutral-600 max-w-3xl mx-auto">
            Comprehensive solutions for all your {{ service.title.rendered.toLowerCase() }} needs
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="capability in serviceCapabilities"
            :key="capability"
            class="bg-white rounded-xl p-6 border border-neutral-200 hover:border-primary hover:shadow-lg transition-all"
          >
            <Icon name="mdi:check-decagram" class="w-8 h-8 text-primary mb-3" />
            <span class="text-neutral-800 font-medium">{{ capability }}</span>
          </div>
        </div>
      </AppSection>

      <!-- How This Service Works -->
      <AppSection bg-color="neutral-50" animate-on-scroll>
        <div class="text-center mb-12">
          <h2 class="text-4xl font-display font-bold text-neutral-900 mb-4">
            How This Service Works
          </h2>
          <p class="text-xl text-neutral-600 max-w-3xl mx-auto">
            Our proven process from consultation to support
          </p>
        </div>

        <div class="grid md:grid-cols-4 gap-8">
          <div class="relative text-center">
            <div class="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">1</div>
            <h3 class="text-xl font-bold text-neutral-900 mb-2">Consultation</h3>
            <p class="text-neutral-600 text-sm">Initial project review and scope discussion</p>
            <div class="hidden md:block absolute top-6 left-full w-full h-0.5 bg-primary/20 -translate-x-6"></div>
          </div>

          <div class="relative text-center">
            <div class="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">2</div>
            <h3 class="text-xl font-bold text-neutral-900 mb-2">Design</h3>
            <p class="text-neutral-600 text-sm">Structural analysis and calculation preparation</p>
            <div class="hidden md:block absolute top-6 left-full w-full h-0.5 bg-primary/20 -translate-x-6"></div>
          </div>

          <div class="relative text-center">
            <div class="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">3</div>
            <h3 class="text-xl font-bold text-neutral-900 mb-2">Review</h3>
            <p class="text-neutral-600 text-sm">Plan preparation and permitting support</p>
            <div class="hidden md:block absolute top-6 left-full w-full h-0.5 bg-primary/20 -translate-x-6"></div>
          </div>

          <div class="text-center">
            <div class="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">4</div>
            <h3 class="text-xl font-bold text-neutral-900 mb-2">Support</h3>
            <p class="text-neutral-600 text-sm">Construction administration and field services</p>
          </div>
        </div>
      </AppSection>

      <!-- Related Projects -->
      <AppSection v-if="hasRelatedProjects" bg-color="white" animate-on-scroll>
        <div class="text-center mb-12">
          <h2 class="text-4xl font-display font-bold text-neutral-900 mb-4">
            Related Projects
          </h2>
          <p class="text-xl text-neutral-600 max-w-3xl mx-auto">
            See how we've applied this service on real projects
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <ProjectCard
            v-for="project in relatedProjects"
            :key="project.slug"
            :title="project.title"
            :slug="project.slug"
            :description="project.description"
            :category="project.category"
            :location="project.location"
            :year="project.year"
          />
        </div>
      </AppSection>

      <!-- Related Services -->
      <AppSection v-if="relatedServices.length > 0" bg-color="neutral-100" animate-on-scroll>
        <div class="text-center mb-12">
          <h2 class="text-4xl font-display font-bold text-neutral-900 mb-4">
            Related Services
          </h2>
          <p class="text-xl text-neutral-600 max-w-3xl mx-auto">
            Explore other services that may fit your project needs
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-6">
          <ServiceCard
            v-for="relatedService in relatedServices"
            :key="relatedService.slug"
            :title="relatedService.title"
            :slug="relatedService.slug"
            :description="relatedService.description"
            :icon="relatedService.icon"
          />
        </div>

        <div class="text-center mt-12">
          <NuxtLink
            to="/services"
            class="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors"
          >
            View All Services
            <Icon name="mdi:arrow-right" class="w-5 h-5" />
          </NuxtLink>
        </div>
      </AppSection>

      <!-- CTA -->
      <AppSection bg-color="primary" padding="xl">
        <div class="container text-center text-white">
          <h2 class="text-4xl font-display font-bold mb-6">
            Ready to Discuss Your Project?
          </h2>
          <p class="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Our team is ready to provide expert {{ service.title.rendered.toLowerCase() }} services
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink
              to="/contact"
              class="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-lg font-semibold hover:bg-neutral-100 transition-colors"
            >
              Contact Us
              <Icon name="mdi:arrow-right" class="w-5 h-5" />
            </NuxtLink>
            <a
              href="tel:+18135551234"
              class="inline-flex items-center gap-2 px-8 py-4 bg-secondary text-white rounded-lg font-semibold hover:bg-secondary-dark transition-colors"
            >
              <Icon name="mdi:phone" class="w-5 h-5" />
              (813) 555-1234
            </a>
          </div>
        </div>
      </AppSection>
    </template>
  </div>
</template>

<script setup lang="ts">
import { decodeHtmlEntities } from '~/utils/html'

const route = useRoute()
const slug = String((route.params as any).slug || '')

// Fetch service data - API returns { success: true, data: {...} } with static fallback built-in
const { data: apiResponse, pending, error } = await useFetch(`/api/services/${slug}`)

// Computed service data from API response
const apiService = computed(() => (apiResponse.value as any)?.data)

// Static fallback data for when API is not available (redundant but kept as emergency fallback)
const staticServices: Record<string, any> = {
  'structural-steel-design': {
    title: { rendered: 'Structural Steel Design' },
    excerpt: { rendered: '<p>AISC certified steel design for commercial and industrial projects</p>' },
    content: { rendered: '<p>Our structural steel design services cover a comprehensive range of steel construction needs. From moment frames to braced frames, we deliver efficient, code-compliant steel solutions that optimize material usage while ensuring structural integrity.</p><p>We specialize in steel connection design, metal building systems, industrial platforms, and seismic load analysis. Our team is AISC certified and stays current with the latest steel construction standards and technologies.</p>' },
    acf: {
      icon: 'mdi:beam',
      standard: 'AISC Certified',
      capabilities: [
        'Moment frame design',
        'Braced frame systems',
        'Steel connection design',
        'Metal building systems',
        'Industrial platforms and mezzanines',
        'Seismic load analysis'
      ]
    }
  },
  'concrete-design': {
    title: { rendered: 'Concrete Design' },
    excerpt: { rendered: '<p>ACI certified concrete design for foundations and structures</p>' },
    content: { rendered: '<p>Our concrete design expertise encompasses all aspects of reinforced concrete construction. We provide comprehensive design services for foundations, slabs, beams, columns, and shear walls for projects of all sizes.</p><p>Our team is well-versed in both cast-in-place and precast concrete systems, including post-tensioned concrete applications. We follow ACI standards and deliver efficient, buildable concrete designs.</p>' },
    acf: {
      icon: 'mdi:cube-outline',
      standard: 'ACI Certified',
      capabilities: [
        'Foundation systems',
        'Flat plate and flat slab design',
        'Beam and column design',
        'Shear wall systems',
        'Precast concrete systems',
        'Post-tensioned concrete'
      ]
    }
  },
  'masonry-design': {
    title: { rendered: 'Masonry Design' },
    excerpt: { rendered: '<p>ACI 530 compliant masonry design and detailing</p>' },
    content: { rendered: '<p>We provide complete structural masonry design services for load-bearing walls, partitions, and veneers. Our expertise covers both concrete masonry and clay masonry systems.</p><p>Our designs are ACI 530 compliant and include masonry shear walls, reinforced masonry, veneer systems, fire wall design, and masonry restoration work.</p>' },
    acf: {
      icon: 'mdi:wall',
      standard: 'ACI 530 Compliant',
      capabilities: [
        'Load-bearing masonry walls',
        'Masonry shear walls',
        'Reinforced masonry design',
        'Masonry veneer systems',
        'Fire wall design',
        'Masonry restoration'
      ]
    }
  },
  'wood-design': {
    title: { rendered: 'Wood Design' },
    excerpt: { rendered: '<p>NDS standards for light wood frame construction</p>' },
    content: { rendered: '<p>Our wood design services focus on light wood frame construction for residential and light commercial projects. We work with both traditional sawn lumber and modern engineered lumber systems.</p><p>Following NDS standards, we design floor and roof trusses, glulam and PSL beams, cross-laminated timber systems, wood shear walls, and deck/balcony structures.</p>' },
    acf: {
      icon: 'mdi:tree',
      standard: 'NDS Standards',
      capabilities: [
        'Light frame construction',
        'Floor and roof truss design',
        'Glulam and PSL beams',
        'Cross-laminated timber',
        'Wood shear walls',
        'Deck and balcony design'
      ]
    }
  },
  'foundation-design': {
    title: { rendered: 'Foundation Design' },
    excerpt: { rendered: '<p>Deep and shallow foundation engineering solutions</p>' },
    content: { rendered: '<p>Our foundation design services address the unique challenges of Florida\'s soil conditions and water table. We provide comprehensive foundation engineering for all structure types.</p><p>We specialize in shallow foundations, deep foundation systems including piles and drilled shafts, mat foundations, and foundation retrofit/repair solutions.</p>' },
    acf: {
      icon: 'mdi:home-floor-0',
      capabilities: [
        'Shallow foundations',
        'Deep foundation systems',
        'Pile foundation design',
        'Drilled shafts',
        'Mat foundations',
        'Foundation retrofit and repair'
      ]
    }
  },
  'seawall-design': {
    title: { rendered: 'Seawall Design' },
    excerpt: { rendered: '<p>Coastal protection and seawall structural design</p>' },
    content: { rendered: '<p>Our seawall design services focus on coastal protection structures throughout Florida. We understand the unique requirements of coastal construction and the challenges of marine environments.</p><p>We design concrete seawalls, steel sheet pile walls, vinyl sheet pile bulkheads, revetment systems, and coastal erosion control structures. We also provide seawall repair and retrofit services.</p>' },
    acf: {
      icon: 'mdi:waves',
      capabilities: [
        'Concrete seawalls',
        'Steel sheet pile walls',
        'Vinyl sheet pile bulkheads',
        'Revetment design',
        'Coastal erosion control',
        'Seawall repair and retrofit'
      ]
    }
  },
  'steel-connection-design': {
    title: { rendered: 'Steel Connection Design' },
    excerpt: { rendered: '<p>Detailed steel connection design and shop drawing preparation</p>' },
    content: { rendered: '<p>We provide detailed steel connection design and shop drawing preparation services for all steel projects. Our team designs standard and custom connections that are both structurally sound and fabricator-friendly.</p><p>Our expertise includes moment connections, shear connections, bracing connections, base plate design, custom fabrications, and complete shop drawing preparation.</p>' },
    acf: {
      icon: 'mdi:vector-arrange-above',
      capabilities: [
        'Moment connections',
        'Shear connections',
        'Bracing connections',
        'Base plate design',
        'Custom fabrications',
        'Shop drawing preparation'
      ]
    }
  },
  'cad-3d-modeling': {
    title: { rendered: 'CAD & 3D Modeling' },
    excerpt: { rendered: '<p>Advanced CAD and BIM modeling services</p>' },
    content: { rendered: '<p>Our CAD and 3D modeling services provide advanced coordination and fabrication support. We use the latest software including AutoCAD and Revit for building information modeling.</p><p>Services include AutoCAD drafting, Revit BIM modeling, 3D structural models for coordination, clash detection, shop drawing production, and as-built documentation.</p>' },
    acf: {
      icon: 'mdi:cube-scan',
      capabilities: [
        'AutoCAD drafting',
        'Revit BIM modeling',
        '3D structural models',
        'Clash detection coordination',
        'Shop drawing production',
        'As-built documentation'
      ]
    }
  },
  'inspection-services': {
    title: { rendered: 'Inspection Services' },
    excerpt: { rendered: '<p>Professional structural inspection services</p>' },
    content: { rendered: '<p>Our professional inspection services cover new construction, existing buildings, and forensic investigations. We provide thorough, code-compliant inspections with detailed reports.</p><p>We offer foundation inspections, framing inspections, steel erection observation, concrete inspection, structural assessments, and forensic investigations for structural issues.</p>' },
    acf: {
      icon: 'mdi:magnify-scan',
      capabilities: [
        'Foundation inspections',
        'Framing inspections',
        'Steel erection observation',
        'Concrete inspection',
        'Structural assessments',
        'Forensic investigations'
      ]
    }
  },
  'steel-detailing': {
    title: { rendered: 'Steel Detailing' },
    excerpt: { rendered: '<p>Professional steel detailing using SDS2 and BIM</p>' },
    content: { rendered: '<p>Our steel detailing team uses SDS2 and BIM software to produce complete fabrication and erection drawings for steel fabricators. We deliver accurate, timely detailing services.</p><p>We provide SDS2 detailing, BIM steel modeling, erection drawings, fabrication drawings, connection calculations, and material takeoffs/bills of material.</p>' },
    acf: {
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
  }
}

// Hero image mapping for service detail pages
const serviceHeroImages: Record<string, string> = {
  'structural-steel-design': '/images/projects/steel-connect-1920w.webp',
  'concrete-design': '/images/projects/lowrise-1920w.webp',
  'masonry-design': '/images/projects/lowrise-1920w.webp',
  'wood-design': '/images/projects/lowrise-1920w.webp',
  'foundation-design': '/images/projects/shallowdeepfoundationdesign10-1920w.webp',
  'seawall-design': '/images/projects/shallowdeepfoundationdesign10-1920w.webp',
  'steel-connection-design': '/images/projects/steel-connect-1920w.webp',
  'cad-3d-modeling': '/images/projects/cad-drawing-1920w.webp',
  'inspection-services': '/images/projects/inspection-services-1920w.webp',
  'steel-detailing': '/images/projects/shopdrawing-1920w.webp'
}

const heroFallback = '/images/hero/home-header-1920w.webp'

// Featured image from WordPress API or fallback to hardcoded mapping
const serviceHeroImage = computed(() => {
  // Try to get featured image from WordPress API _embedded data
  const featuredMedia = service.value?._embedded?.['wp:featuredmedia']?.[0]
  if (featuredMedia) {
    // Try to get a large size, fallback to full or source URL
    return featuredMedia.media_details?.sizes?.large?.source_url ||
           featuredMedia.media_details?.sizes?.full?.source_url ||
           featuredMedia.source_url
  }
  // Fallback to hardcoded mapping
  return serviceHeroImages[slug] || heroFallback
})

// Computed service data (API or static fallback)
const service = computed(() => {
  return apiService.value || staticServices[slug]
})

// Service metadata
const serviceIcon = computed(() => service.value?.custom_fields?.icon?.[0] || 'mdi:cog')
const serviceStandard = computed(() => service.value?.custom_fields?.standard?.[0] || '')
const serviceDescription = computed(() => {
  const excerpt = service.value?.excerpt?.rendered || ''
  return excerpt.replace(/<[^>]*>/g, '').trim() ||
    `${service.value?.title?.rendered || 'Service'} by VP Associates`
})
const serviceCapabilities = computed(() => service.value?.custom_fields?.capabilities || [])
const serviceBenefits = computed(() => [
  'Licensed Florida engineers',
  'Code-compliant designs',
  'Fast turnaround times',
  'Buildable solutions',
  'Cost-effective optimization'
])

const hasCapabilities = computed(() => serviceCapabilities.value.length > 0)
const hasRelatedProjects = computed(() => relatedProjects.value.length > 0)

// Breadcrumbs for SEO and navigation
const serviceBreadcrumbs = computed(() => [
  { title: 'Services', to: '/services' },
  { title: service.value?.title?.rendered || 'Service' }
])

// Fetch projects from WordPress API for related projects section
const { data: projectsResponse } = await useFetch('/api/projects')

// Transform projects data for related projects lookup
const allProjects = computed(() => {
  const response = projectsResponse.value as any
  if (!response?.data || !Array.isArray(response.data)) return []

  return response.data.map((p: any) => ({
    title: decodeHtmlEntities(p.title?.rendered) || 'Project',
    slug: p.slug || 'project',
    description: decodeHtmlEntities(p.excerpt?.rendered?.replace(/<[^>]*>/g, '')) || 'Structural engineering project',
    category: decodeHtmlEntities(p.custom_fields?.project_category) || 'Project',
    location: decodeHtmlEntities(p.custom_fields?.project_location) || 'Tampa Bay',
    year: p.custom_fields?.project_year || new Date().getFullYear().toString(),
    // Get image from API
    image: (() => {
      // Try images array first
      if (p.images && Array.isArray(p.images) && p.images.length > 0) {
        return p.images[0].url || p.images[0]
      }
      // Try featured media from _embedded
      const featuredMedia = p._embedded?.['wp:featuredmedia']?.[0]
      if (featuredMedia) {
        return featuredMedia.source_url ||
               featuredMedia.media_details?.sizes?.large?.source_url ||
               featuredMedia.media_details?.sizes?.full?.source_url ||
               '/images/hero/construction-steel-beams-1920w.jpg'
      }
      return '/images/hero/construction-steel-beams-1920w.jpg'
    })()
  }))
})

// Service-to-category mapping function
function getServiceCategory(serviceSlug: string): string | null {
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
  return categoryMap[serviceSlug] || null
}

// Related projects computed - fetches from API and filters by matching category
const relatedProjects = computed(() => {
  const currentCategory = getServiceCategory(slug)
  if (!currentCategory || !allProjects.value.length) return []

  // Map service category to project category keywords
  const categoryKeywords: Record<string, string[]> = {
    'structural': ['structural', 'steel', 'concrete', 'masonry', 'wood', 'foundation'],
    'design': ['design', 'detailing', 'cad', 'modeling', 'connection', 'steel'],
    'inspection': ['inspection'],
    'marine': ['marine', 'seawall', 'coastal', 'waterfront']
  }

  const keywords = categoryKeywords[currentCategory] || []

  // Filter projects by category keyword match
  const matchingProjects = allProjects.value.filter((project: any) => {
    const categoryLower = project.category.toLowerCase()
    const titleLower = project.title.toLowerCase()
    return keywords.some(keyword =>
      categoryLower.includes(keyword) || titleLower.includes(keyword)
    )
  })

  // Return up to 3 related projects
  return matchingProjects.slice(0, 3).map((p: any) => ({
    title: p.title,
    slug: p.slug,
    description: p.description,
    category: p.category,
    location: p.location,
    year: p.year
  }))
})

// All services list for related services lookup
const allServicesList = [
  { title: 'Structural Steel Design', slug: 'structural-steel-design', icon: 'mdi:beam', description: 'AISC certified steel design' },
  { title: 'Concrete Design', slug: 'concrete-design', icon: 'mdi:cube-outline', description: 'ACI certified concrete design' },
  { title: 'Masonry Design', slug: 'masonry-design', icon: 'mdi:wall', description: 'ACI 530 compliant masonry design' },
  { title: 'Wood Design', slug: 'wood-design', icon: 'mdi:tree', description: 'NDS standards for wood construction' },
  { title: 'Foundation Design', slug: 'foundation-design', icon: 'mdi:home-floor-0', description: 'Deep and shallow foundations' },
  { title: 'Seawall Design', slug: 'seawall-design', icon: 'mdi:waves', description: 'Coastal protection structures' },
  { title: 'Steel Connection Design', slug: 'steel-connection-design', icon: 'mdi:vector-arrange-above', description: 'Detailed steel connection design' },
  { title: 'CAD & 3D Modeling', slug: 'cad-3d-modeling', icon: 'mdi:cube-scan', description: 'Advanced CAD and BIM modeling' },
  { title: 'Inspection Services', slug: 'inspection-services', icon: 'mdi:magnify-scan', description: 'Professional structural inspection' },
  { title: 'Steel Detailing', slug: 'steel-detailing', icon: 'mdi:pencil-ruler', description: 'Professional steel detailing' }
]

// Related services computed - filters by same category, excludes current
const relatedServices = computed(() => {
  const currentCategory = getServiceCategory(slug)
  if (!currentCategory) return []

  // Get services in same category, excluding current
  const sameCategory = allServicesList.filter(s =>
    getServiceCategory(s.slug) === currentCategory && s.slug !== slug
  )

  // Return up to 3
  return sameCategory.slice(0, 3)
})

// SEO Meta Tags
watchEffect(() => {
  if (service.value?.title?.rendered) {
    const title = service.value.title.rendered
    const description = serviceDescription.value
    const canonicalUrl = `https://vp-associates.com/services/${slug}`

    usePageMeta({
      title,
      description,
      ogImage: 'https://vp-associates.com/images/og-services.jpg',
      ogType: 'article',
      canonicalUrl,
    })
  }
})

// Service Schema
useJsonld({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: computed(() => service.value?.title?.rendered || 'Service'),
  description: serviceDescription,
  provider: {
    '@type': 'LocalBusiness',
    name: 'VP Associates',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Tampa',
      addressRegion: 'FL',
      addressCountry: 'US',
    },
  },
  areaServed: 'Tampa Bay Area',
})
</script>
