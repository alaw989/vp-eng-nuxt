<template>
  <div>
    <!-- Loading state -->
    <ProjectDetailSkeleton v-if="pending" />

    <!-- Error state -->
    <div v-else-if="error || !project" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <Icon name="mdi:alert-circle" class="w-16 h-16 text-secondary mx-auto mb-4" />
        <h1 class="text-2xl font-bold text-neutral-900 mb-2">Project Not Found</h1>
        <p class="text-neutral-600 mb-6">The project you're looking for doesn't exist or has been removed.</p>
        <NuxtLink
          to="/projects"
          class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
        >
          <Icon name="mdi:arrow-left" class="w-5 h-5" />
          Back to Projects
        </NuxtLink>
      </div>
    </div>

    <!-- Project content -->
    <template v-else>
      <!-- Breadcrumbs -->
      <div class="bg-white border-b border-neutral-200">
        <div class="container py-4">
          <AppBreadcrumbs :breadcrumbs="projectBreadcrumbs" />
        </div>
      </div>

      <!-- Page Header -->
      <AppSection bg-color="primary-dark" padding="lg">
        <div class="container text-white">
          <NuxtLink
            to="/projects"
            class="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <Icon name="mdi:arrow-left" class="w-5 h-5" />
            Back to Projects
          </NuxtLink>
          <div class="flex flex-wrap items-center gap-3 mb-4">
            <span class="px-4 py-1.5 bg-secondary rounded-full font-semibold text-sm">
              {{ projectCategory }}
            </span>
            <span class="flex items-center gap-1 text-white/80">
              <Icon name="mdi:map-marker" class="w-4 h-4" />
              {{ projectLocation }}
            </span>
            <span class="flex items-center gap-1 text-white/80">
              <Icon name="mdi:calendar" class="w-4 h-4" />
              {{ projectYear }}
            </span>
          </div>
          <h1 class="text-4xl md:text-5xl font-display font-bold mb-6">
            {{ project.title.rendered }}
          </h1>
          <p class="text-xl opacity-90 max-w-3xl">
            {{ projectDescription }}
          </p>
        </div>
      </AppSection>

      <!-- Project Image Gallery -->
      <AppSection bg-color="neutral-100" padding="md">
        <div class="container">
          <LazyProjectGallery
            :images="projectImages"
            :project-name="project.title.rendered || 'Project'"
          />
        </div>
      </AppSection>

      <!-- Project Details -->
      <AppSection bg-color="white" padding="lg" animate-on-scroll>
        <div class="grid lg:grid-cols-3 gap-12">
          <!-- Main content -->
          <div class="lg:col-span-2 space-y-12">
            <!-- Project Overview Section -->
            <section>
              <h2 class="text-3xl font-display font-bold text-neutral-900 mb-6 flex items-center gap-3">
                <span class="w-1 h-8 bg-primary rounded-full"></span>
                Project Overview
              </h2>
              <div class="prose prose-lg prose-headings:font-display prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-p:text-neutral-600 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-ul:list-disc prose-ol:list-decimal max-w-none" v-html="project.content.rendered"></div>
            </section>

            <!-- Social Share Section -->
            <div class="pt-6 border-t border-neutral-200">
              <LazySocialShare
                :title="project.title.rendered"
                :description="projectDescription"
              />
            </div>

            <!-- Services Provided Section -->
            <section v-if="servicesProvided.length > 0">
              <h3 class="text-2xl font-display font-bold text-neutral-900 mb-6 flex items-center gap-3">
                <span class="w-1 h-6 bg-secondary rounded-full"></span>
                Services Provided
              </h3>
              <div class="flex flex-wrap gap-3">
                <span
                  v-for="service in servicesProvided"
                  :key="service"
                  class="px-5 py-2.5 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-colors"
                >
                  {{ service }}
                </span>
              </div>
            </section>
          </div>

          <!-- Sidebar -->
          <div class="space-y-8">
            <!-- Quick Stats -->
            <aside class="bg-neutral-50 rounded-xl p-6 shadow-sm">
              <h3 class="font-bold text-neutral-900 mb-6 flex items-center gap-2 text-lg">
                <Icon name="mdi:information" class="w-5 h-5 text-primary" />
                Project Details
              </h3>
              <div class="space-y-4">
                <div v-if="projectStats.year" class="flex justify-between items-center pb-3 border-b border-neutral-200">
                  <span class="text-neutral-600 text-sm">Year Completed</span>
                  <span class="font-semibold text-neutral-900">{{ projectStats.year }}</span>
                </div>
                <div v-if="projectStats.squareFootage" class="flex justify-between items-center pb-3 border-b border-neutral-200">
                  <span class="text-neutral-600 text-sm">Square Footage</span>
                  <span class="font-semibold text-neutral-900">{{ projectStats.squareFootage }}</span>
                </div>
                <div v-if="projectStats.capacity" class="flex justify-between items-center pb-3 border-b border-neutral-200">
                  <span class="text-neutral-600 text-sm">Capacity</span>
                  <span class="font-semibold text-neutral-900">{{ projectStats.capacity }}</span>
                </div>
                <div class="flex justify-between items-center pb-3 border-b border-neutral-200">
                  <span class="text-neutral-600 text-sm">Location</span>
                  <span class="font-semibold text-neutral-900">{{ projectLocation }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-neutral-600 text-sm">Category</span>
                  <span class="font-semibold text-neutral-900">{{ projectCategory }}</span>
                </div>
              </div>
            </aside>

            <!-- CTA -->
            <aside class="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
              <h4 class="font-bold text-neutral-900 mb-2 text-lg">Start Your Project</h4>
              <p class="text-neutral-600 mb-5 text-sm">Need similar structural engineering services? Let's discuss your requirements.</p>
              <NuxtLink
                to="/contact"
                class="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors shadow-md hover:shadow-lg"
              >
                Contact Us
                <Icon name="mdi:arrow-right" class="w-5 h-5" />
              </NuxtLink>
            </aside>
          </div>
        </div>
      </AppSection>

      <!-- Related Projects -->
      <AppSection v-if="hasRelatedProjects" bg-color="neutral-50" animate-on-scroll>
        <div class="text-center mb-12">
          <h2 class="text-4xl font-display font-bold text-neutral-900 mb-4">
            Related Projects
          </h2>
          <p class="text-xl text-neutral-600 max-w-3xl mx-auto">
            Explore similar projects we've completed
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <ProjectCard
            v-for="relatedProject in relatedProjects"
            :key="relatedProject.slug"
            :title="relatedProject.title"
            :slug="relatedProject.slug"
            :description="relatedProject.description"
            :category="relatedProject.category"
            :location="relatedProject.location"
            :year="relatedProject.year"
            :image="relatedProject.image"
          />
        </div>

        <div class="text-center mt-12">
          <NuxtLink
            to="/projects"
            class="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors"
          >
            View All Projects
            <Icon name="mdi:arrow-right" class="w-5 h-5" />
          </NuxtLink>
        </div>
      </AppSection>

      <!-- Services CTA -->
      <AppSection bg-color="primary" padding="xl">
        <div class="container text-center text-white">
          <h2 class="text-4xl font-display font-bold mb-6">
            Engineering Excellence for Every Project
          </h2>
          <p class="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            From concept to completion, VP Associates delivers superior structural engineering services
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink
              to="/services"
              class="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-lg font-semibold hover:bg-neutral-100 transition-colors"
            >
              Our Services
              <Icon name="mdi:arrow-right" class="w-5 h-5" />
            </NuxtLink>
            <NuxtLink
              to="/contact"
              class="inline-flex items-center gap-2 px-8 py-4 bg-secondary text-white rounded-lg font-semibold hover:bg-secondary-dark transition-colors"
            >
              Get a Quote
              <Icon name="mdi:arrow-right" class="w-5 h-5" />
            </NuxtLink>
          </div>
        </div>
      </AppSection>
    </template>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = String((route.params as any).slug || '')

// Fetch project data - API returns { success: true, data: {...} } with static fallback built-in
const { data: apiResponse, pending, error } = await useFetch(`/api/projects/${slug}`)

// Computed project data from API response
const apiProject = computed(() => (apiResponse.value as any)?.data)

// Static fallback data for when API is not available (redundant but kept as emergency fallback)
const staticProjects: Record<string, any> = {
  'tampa-marina-complex': {
    title: { rendered: 'Tampa Marina Complex' },
    excerpt: { rendered: '<p>Complete structural design for a 50-slip marina with restaurant and retail spaces</p>' },
    content: { rendered: '<p>VP Associates provided complete structural engineering services for this premier marina development on the Tampa waterfront. The project features 50 boat slips, a two-story restaurant building, and retail spaces.</p><p>Our design addressed the unique challenges of marine construction, including wave loads, vessel impact, and corrosion protection. The structure utilizes concrete pile foundations, precast deck panels, and a steel-framed restaurant building.</p><p>The project also included design of seawall protection systems, dock infrastructure, and waterfront hardscape. Construction was completed in 2024 and has become a landmark destination on the Tampa waterfront.</p>' },
    acf: {
      category: 'Marine',
      location: 'Tampa, FL',
      year: '2024',
      squareFootage: '45,000 sq ft',
      services_provided: ['Structural Steel Design', 'Foundation Design', 'Seawall Design', 'Inspection Services']
    },
    images: ['/images/projects/steel-connect-1920w.webp', '/images/projects/shallowdeepfoundationdesign10-1920w.webp']
  },
  'downtown-office-tower': {
    title: { rendered: 'Downtown Office Tower' },
    excerpt: { rendered: '<p>Structural steel design for 12-story commercial office building</p>' },
    content: { rendered: '<p>This 12-story office tower in downtown Tampa features a sophisticated structural steel frame designed by VP Associates. The building provides Class A office space with floor plates optimized for flexibility and natural light.</p><p>Our structural design utilizes a moment frame system with composite steel beams and concrete-filled metal deck floors. The lateral system incorporates buckling-restrained braced frames (BRBF) to optimize the structural efficiency and maximize usable space.</p><p>The foundation system utilizes drilled shafts socketed into bedrock, designed to support the high column loads while minimizing settlement. The project was completed in 2023 and has achieved LEED Silver certification.</p>' },
    acf: {
      category: 'Commercial',
      location: 'Tampa, FL',
      year: '2023',
      squareFootage: '180,000 sq ft',
      services_provided: ['Structural Steel Design', 'Steel Connection Design', 'Foundation Design', 'CAD & 3D Modeling']
    },
    images: ['/images/projects/lowrise-1920w.webp', '/images/projects/steel-connect-1920w.webp']
  },
  'coastal-seawall-system': {
    title: { rendered: 'Coastal Seawall System' },
    excerpt: { rendered: '<p>Engineered seawall protection system for luxury waterfront property</p>' },
    content: { rendered: '<p>VP Associates designed a comprehensive seawall protection system for this luxury residential property in Clearwater. The project involved replacing an existing deteriorated seawall with a modern, engineered solution.</p><p>The new seawall design incorporates concrete sheet piles with a reinforced concrete cap and tie-back anchor system. The design addressed wave loads, hydrostatic pressures, and vessel impact requirements while maintaining aesthetic appeal.</p><p>Our design included integrated drainage features, a decorative wave wall on top, and corrosion protection for the marine environment. The project was completed in 2024 and provides decades of reliable protection for the property.</p>' },
    acf: {
      category: 'Marine',
      location: 'Clearwater, FL',
      year: '2024',
      services_provided: ['Seawall Design', 'Foundation Design', 'Inspection Services']
    },
    images: ['/images/projects/shallowdeepfoundationdesign10-1920w.webp', '/images/projects/inspection-services-1920w.webp']
  },
  'luxury-residential-estate': {
    title: { rendered: 'Luxury Residential Estate' },
    excerpt: { rendered: '<p>Complete structural design for 8,000 sq ft waterfront residence</p>' },
    content: { rendered: '<p>This 8,000 square foot luxury waterfront residence features a complete structural design by VP Associates. The home includes expansive water views, multiple outdoor living spaces, and a pool structure.</p><p>The structural system utilizes concrete pile foundations to address the coastal soil conditions, with a combination of concrete and steel framing to support the architectural vision. The design incorporated long-span elements to create open, column-free spaces.</p><p>Special features included a cantilevered balcony system, a rooftop terrace, and integration with the pool structure. The project was completed in 2024 and showcases our residential design capabilities.</p>' },
    acf: {
      category: 'Residential',
      location: 'St. Petersburg, FL',
      year: '2024',
      squareFootage: '8,000 sq ft',
      services_provided: ['Wood Design', 'Concrete Design', 'Foundation Design']
    },
    images: ['/images/projects/lowrise-1920w.webp', '/images/projects/cad-drawing-1920w.webp']
  },
  'industrial-warehouse-complex': {
    title: { rendered: 'Industrial Warehouse Complex' },
    excerpt: { rendered: '<p>Pre-engineered metal building structure with 40,000 sq ft warehouse</p>' },
    content: { rendered: '<p>VP Associates provided structural design for this 40,000 square foot industrial warehouse in Brandon. The facility features a pre-engineered metal building system optimized for storage and distribution operations.</p><p>Our design included the primary metal building structure as well as design of concrete foundations, tilt-wall office enclosures, and loading dock structures. The structural system accommodates heavy roof loads for HVAC equipment and solar panel installation.</p><p>The foundation design addressed the poor soil conditions with a ground improvement program and spread footings. The project was completed in 2023 and serves as a key distribution facility.</p>' },
    acf: {
      category: 'Industrial',
      location: 'Brandon, FL',
      year: '2023',
      squareFootage: '40,000 sq ft',
      services_provided: ['Structural Steel Design', 'Foundation Design', 'Steel Connection Design']
    },
    images: ['/images/projects/steel-connect-1920w.webp', '/images/projects/crane-lift-1920w.webp', '/images/projects/shopdrawing-1920w.webp']
  },
  'school-classroom-wing': {
    title: { rendered: 'School Classroom Wing' },
    excerpt: { rendered: '<p>Masonry and steel design for new 2-story classroom addition</p>' },
    content: { rendered: '<p>This new two-story classroom wing addition provides modern learning spaces for an existing school campus in Lakeland. VP Associates designed the complete structural system for the 15,000 square foot addition.</p><p>The structure utilizes concrete masonry bearing walls with a steel bar joist roof system. The design accommodates large window openings for natural light while meeting all educational facility code requirements including hurricane design criteria.</p><p>The foundation system uses shallow spread footings founded on competent soil. Our design included coordination with the existing building structure to ensure a seamless integration. The project was completed in 2023.</p>' },
    acf: {
      category: 'Institutional',
      location: 'Lakeland, FL',
      year: '2023',
      squareFootage: '15,000 sq ft',
      services_provided: ['Masonry Design', 'Structural Steel Design', 'Foundation Design']
    },
    images: ['/images/projects/cad-drawing-1920w.webp', '/images/projects/lowrise-1920w.webp']
  }
}

// Computed project data (API or static fallback)
const project = computed(() => {
  return apiProject.value || staticProjects[slug]
})

// Project metadata
const projectCategory = computed(() => project.value?.custom_fields?.category?.[0] || 'Project')
const projectLocation = computed(() => project.value?.custom_fields?.location?.[0] || 'Tampa Bay')
const projectYear = computed(() => project.value?.custom_fields?.year?.[0] || '2024')
const projectDescription = computed(() => {
  const excerpt = project.value?.excerpt?.rendered || ''
  return excerpt.replace(/<[^>]*>/g, '').trim() ||
    `${project.value?.title?.rendered || 'Project'} by VP Associates`
})
const projectStats = computed(() => project.value?.custom_fields || {})
const servicesProvided = computed(() => project.value?.custom_fields?.services_provided || [
  'Structural Engineering',
  'Design Services',
  'Code Compliance'
])
// Project image mapping from Phase 3 migration
// Maps project slugs to their available images in /images/projects/
const projectImageMap: Record<string, string[]> = {
  'tampa-marina-complex': [
    '/images/projects/steel-connect-1920w.webp',
    '/images/projects/shallowdeepfoundationdesign10-1920w.webp',
  ],
  'downtown-office-tower': [
    '/images/projects/lowrise-1920w.webp',
    '/images/projects/steel-connect-1920w.webp',
  ],
  'coastal-seawall-system': [
    '/images/projects/shallowdeepfoundationdesign10-1920w.webp',
    '/images/projects/inspection-services-1920w.webp',
  ],
  'luxury-residential-estate': [
    '/images/projects/lowrise-1920w.webp',
    '/images/projects/cad-drawing-1920w.webp',
  ],
  'industrial-warehouse-complex': [
    '/images/projects/steel-connect-1920w.webp',
    '/images/projects/crane-lift-1920w.webp',
    '/images/projects/shopdrawing-1920w.webp',
  ],
  'school-classroom-wing': [
    '/images/projects/cad-drawing-1920w.webp',
    '/images/projects/lowrise-1920w.webp',
  ],
}

const projectImages = computed(() => {
  // First check if API provides images
  const apiImages = project.value?.images
  if (apiImages && Array.isArray(apiImages) && apiImages.length > 0) {
    return apiImages
  }

  // Fallback to mapped images from Phase 3 migration
  const mappedImages = projectImageMap[slug]
  if (mappedImages && mappedImages.length > 0) {
    return mappedImages
  }

  // Log warning for missing mapping and return empty array (gallery will show placeholder)
  if (process.dev) {
    console.warn(`No project images found for slug: ${slug}`)
  }
  return []
})
// All available projects for related projects (from static data - would come from API in production)
const allProjectsData = [
  {
    title: 'Tampa Marina Complex',
    slug: 'tampa-marina-complex',
    description: 'Complete structural design for a 50-slip marina',
    category: 'Marine',
    location: 'Tampa, FL',
    year: 2024,
    image: '/images/projects/steel-connect-1920w.webp'
  },
  {
    title: 'Downtown Office Tower',
    slug: 'downtown-office-tower',
    description: 'Structural steel design for 12-story office building',
    category: 'Commercial',
    location: 'Tampa, FL',
    year: 2023,
    image: '/images/projects/lowrise-1920w.webp'
  },
  {
    title: 'Coastal Seawall System',
    slug: 'coastal-seawall-system',
    description: 'Engineered seawall protection system',
    category: 'Marine',
    location: 'Clearwater, FL',
    year: 2024,
    image: '/images/projects/shallowdeepfoundationdesign10-1920w.webp'
  },
  {
    title: 'Luxury Residential Estate',
    slug: 'luxury-residential-estate',
    description: 'Complete structural design for 8,000 sq ft waterfront residence',
    category: 'Residential',
    location: 'St. Petersburg, FL',
    year: 2024,
    image: '/images/projects/lowrise-1920w.webp'
  },
  {
    title: 'Industrial Warehouse Complex',
    slug: 'industrial-warehouse-complex',
    description: 'Pre-engineered metal building structure with 40,000 sq ft warehouse',
    category: 'Industrial',
    location: 'Brandon, FL',
    year: 2023,
    image: '/images/projects/steel-connect-1920w.webp'
  },
  {
    title: 'School Classroom Wing',
    slug: 'school-classroom-wing',
    description: 'Masonry and steel design for new 2-story classroom addition',
    category: 'Institutional',
    location: 'Lakeland, FL',
    year: 2023,
    image: '/images/projects/cad-drawing-1920w.webp'
  }
]

// Related projects: filtered by same category, excluding current, limited to 3
const relatedProjects = computed(() => {
  if (!project.value) return []

  const currentCategory = project.value?.custom_fields?.category?.[0]
  if (!currentCategory) return []

  // Filter by same category, exclude current project, limit to 3
  return allProjectsData
    .filter(p => p.category === currentCategory && p.slug !== slug)
    .slice(0, 3)
})

const hasRelatedProjects = computed(() => relatedProjects.value.length > 0)

// Breadcrumbs for SEO and navigation
const projectBreadcrumbs = computed(() => [
  { title: 'Projects', to: '/projects' },
  { title: project.value?.title?.rendered || 'Project' }
])

// SEO Meta Tags
watchEffect(() => {
  if (project.value?.title?.rendered) {
    const title = project.value.title.rendered
    const description = projectDescription.value
    const canonicalUrl = `https://vp-associates.com/projects/${slug}`

    usePageMeta({
      title,
      description,
      ogImage: 'https://vp-associates.com/images/og-projects.jpg',
      ogType: 'article',
      canonicalUrl,
    })
  }
})

// Project Schema
useJsonld({
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: computed(() => project.value?.title?.rendered || 'Project'),
  description: projectDescription,
  creator: {
    '@type': 'LocalBusiness',
    name: 'VP Associates',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Tampa',
      addressRegion: 'FL',
      addressCountry: 'US',
    },
  },
  locationCreated: projectLocation,
  dateCreated: projectYear,
})
</script>
