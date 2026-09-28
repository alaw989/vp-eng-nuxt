<template>
  <div>
    <!-- Hero Static -->
    <HeroStatic />

    <!-- About Intro Section -->
    <AppSection bg-color="white" animate-on-scroll>
      <div class="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 class="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-6">
            Trusted Structural Engineers in Tampa Bay
          </h2>
          <p class="text-lg text-neutral-600 mb-6">
            VP &amp; Associates is a Tampa structural engineering and steel detailing firm. Our engineers and detailers bring over 30 years of combined experience to steel, concrete, masonry and wood structures.
          </p>
          <p class="text-lg text-neutral-600 mb-8">
            We work for industrial contractors, commercial architects and steel fabricators, from foundation and seawall design to SDS2 steel detailing and inspections.
          </p>
          <NuxtLink
            to="/about"
            class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-sm font-semibold hover:bg-primary-dark transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            About the firm
            <Icon name="mdi:arrow-right" class="w-5 h-5" />
          </NuxtLink>
        </div>
        <div class="relative">
          <picture class="aspect-[4/3] rounded-sm overflow-hidden block">
            <source srcset="/images/hero/tampa-bay-sundown-640w.webp 640w, /images/hero/tampa-bay-sundown-1280w.webp 1280w, /images/hero/tampa-bay-sundown-1920w.webp 1920w" type="image/webp" sizes="(max-width: 768px) 640px, (max-width: 1024px) 1280px, 1920px">
            <img
              src="/images/hero/tampa-bay-sundown-1920w.jpg"
              srcset="/images/hero/tampa-bay-sundown-640w.jpg 640w, /images/hero/tampa-bay-sundown-1280w.jpg 1280w, /images/hero/tampa-bay-sundown-1920w.jpg 1920w"
              sizes="(max-width: 768px) 640px, (max-width: 1024px) 1280px, 1920px"
              alt="Tampa Bay skyline at sunset - VP Associates serves the Tampa Bay area with over 30 years of combined structural engineering experience"
              class="w-full h-full object-cover"
              loading="lazy"
              width="1920"
              height="1080"
            >
          </picture>
          <!-- Registration stamp -->
          <div class="absolute -bottom-6 left-4 md:-left-6 bg-white border-2 border-primary px-5 py-3 max-w-xs">
            <div class="text-xs uppercase tracking-[0.2em] text-neutral-600">Licensed</div>
            <div class="font-display text-xl font-bold text-primary">Florida PE</div>
            <p class="mt-1 text-sm text-neutral-600">Signed and sealed drawings and calculations</p>
          </div>
        </div>
      </div>
    </AppSection>

    <!-- Statistics Section -->
    <AppSection bg-color="primary" padding="md">
      <StatsTitleBlock :stats="firmStats" />
    </AppSection>

    <!-- Services Section -->
    <AppSection bg-color="neutral-50-pattern" animate-on-scroll elevation>
      <div class="mb-16 max-w-3xl">
        <h2 class="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-4">
          Our Services
        </h2>
        <p class="text-xl text-neutral-600">
          Comprehensive structural engineering solutions for projects of all sizes
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ServiceCard
          v-for="service in services"
          :key="service.slug"
          :title="service.title"
          :slug="service.slug"
          :description="service.description"
          :icon="service.icon"
        />
      </div>

      <div class="mt-12">
        <NuxtLink
          to="/services"
          class="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary rounded-sm font-semibold hover:bg-primary hover:text-white transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          View All Services
          <Icon name="mdi:arrow-right" class="w-5 h-5" />
        </NuxtLink>
      </div>
    </AppSection>

    <!-- Featured Projects Grid -->
    <AppSection bg-color="neutral" animate-on-scroll elevation stagger-children>
      <div class="mb-12 max-w-3xl">
        <h2 class="text-4xl md:text-5xl font-display font-bold text-white mb-4">
          Featured Projects
        </h2>
        <p class="text-xl text-neutral-300">
          Explore our portfolio of successful engineering projects across Tampa Bay
        </p>
      </div>

      <!-- Projects Grid with staggered animation -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 stagger-children">
        <ProjectCard
          v-for="(project, index) in featuredProjects"
          :key="project.slug"
          :title="project.title"
          :slug="project.slug"
          :description="project.description"
          :category="project.category"
          :location="project.location"
          :year="project.year"
          :image="project.image"
          :dark-mode="true"
          class="stagger-item"
          :style="{ animationDelay: `${index * 100}ms` }"
        />
      </div>

      <div>
        <NuxtLink
          to="/projects"
          class="group inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-sm font-semibold hover:bg-neutral-100 transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
        >
          View All Projects
          <Icon name="mdi:arrow-right" class="w-5 h-5 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" />
        </NuxtLink>
      </div>
    </AppSection>

    <!-- Testimonials Section -->
    <AppSection bg-color="neutral-100-pattern" animate-on-scroll elevation>
      <div class="mb-16 max-w-3xl">
        <h2 class="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-4">
          What Our Clients Say
        </h2>
        <p class="text-xl text-neutral-600">
          Trusted by architects, contractors, and developers throughout Florida
        </p>
      </div>

      <!-- Testimonials Slider - ClientOnly to prevent SSR/client responsive mismatch -->
      <div class="max-w-6xl mx-auto px-4">
        <ClientOnly>
          <LazyTestimonialsSlider
            v-if="testimonials.length > 0"
            :testimonials="testimonials"
            :items-per-slide="3"
          />
          <!-- Fallback if no testimonials -->
          <div v-else class="text-center py-12">
            <Icon name="mdi:comment-quote-outline" class="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <p class="text-neutral-500">Testimonials coming soon.</p>
          </div>
          <template #fallback>
            <!-- SSR placeholder matching mobile layout to minimize CLS -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div v-for="i in 3" :key="i" class="bg-white rounded-xl p-8 border border-neutral-200 shadow-lg animate-pulse">
                <div class="h-4 bg-neutral-200 rounded w-3/4 mb-4"></div>
                <div class="h-4 bg-neutral-200 rounded w-full mb-4"></div>
                <div class="h-4 bg-neutral-200 rounded w-1/2"></div>
              </div>
            </div>
          </template>
        </ClientOnly>
      </div>
    </AppSection>

    <!-- CTA Section -->
    <CtaBlock
      headline="Ready to Start Your Project?"
      subheadline="Contact us today to discuss your structural engineering needs"
    />
  </div>
</template>

<script setup lang="ts">
import { decodeHtmlEntities } from '~/utils/html'

// Route meta for screen reader announcements
definePageMeta({
  title: 'Home'
})

// SEO Meta Tags
usePageMeta({
  title: 'VP Associates - Structural Engineering Services Tampa Bay',
  titleSuffix: false,
  description: 'VP Associates provides structural engineering services in Tampa Bay including steel, concrete, masonry, wood, foundations, seawalls, and steel detailing. Over 30 years of combined experience.',
  keywords: 'structural engineering, Tampa Bay, steel design, concrete design, foundation design, seawall design, Florida engineer, VP Associates',
  ogImage: 'https://vp-associates.com/images/og-home.jpg',
})

// LocalBusiness Schema
useJsonld({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'VP Associates',
  description: 'Structural Engineering Services in Tampa Bay',
  url: 'https://vp-associates.com',
  telephone: '+1-813-486-2079',
  email: 'info@vp-associates.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Tampa',
    addressRegion: 'FL',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '27.9506',
    longitude: '-82.4572',
  },
  areaServed: 'Tampa Bay Area',
  priceRange: '$$',
})

// Every figure here traces to EVIDENCE.md
const firmStats = [
  { value: 30, suffix: '+', count: true, label: 'Years of combined experience', detail: 'Engineers and detailers' },
  { value: 2007, label: 'Detailing steel since', detail: 'Tampa, Florida' },
  { value: 7, count: true, label: 'States with PE registration', detail: 'FL · KY · MD · MI · PA · TN · VA' },
  { value: 4, count: true, label: 'Materials designed in', detail: 'Steel · Concrete · Masonry · Wood' },
]

// Fetch services from API
const { data: servicesResponse } = await useFetch('/api/services')
const servicesData = computed(() => (servicesResponse.value as any)?.data || [])

// Transform services data for display
const services = computed(() => {
  if (!servicesData.value || !Array.isArray(servicesData.value)) return []
  return servicesData.value.slice(0, 3).map((s: any) => ({
    title: decodeHtmlEntities(s.title?.rendered) || 'Service',
    slug: s.slug || 'service',
    description: decodeHtmlEntities(s.excerpt?.rendered?.replace(/<[^>]*>/g, '')) || 'Professional structural engineering services',
    icon: s.custom_fields?.service_icon || 'mdi:cog',
  }))
})

// Fetch projects from API
const { data: projectsResponse } = await useFetch('/api/projects', {
  query: { per_page: 100 },
})
const projectsData = computed(() => (projectsResponse.value as any)?.data || [])

// Icon mapping for project categories
const projectIcons: Record<string, string> = {
  'Marine': 'mdi:anchor',
  'Commercial': 'mdi:office-building',
  'Residential': 'mdi:home',
  'Industrial': 'mdi:warehouse',
  'Institutional': 'mdi:school',
}

// Project image mapping - using hero images as fallbacks
const projectImageMap: Record<string, string> = {
  'steel-connect': '/images/hero/construction-steel-beams-1920w.jpg',
  'crane-lift': '/images/hero/crane-building-1920w.jpg',
  'cad-drawing': '/images/hero/construction-structural-1920w.jpg',
  'shallowdeepfoundationdesign10': '/images/hero/construction-concrete-1920w.jpg',
  'lowrise': '/images/hero/construction-building-frame-1920w.jpg',
  'inspection-services': '/images/hero/construction-site-1920w.jpg',
  'shopdrawing': '/images/hero/construction-steel-structure-1920w.jpg',
}

// Helper function to find matching image by title/category (fallback only)
const findProjectImage = (title: string, category: string): string => {
  const titleLower = title.toLowerCase()
  const categoryLower = category.toLowerCase()

  // Try category-based matching
  if (categoryLower.includes('marine') || titleLower.includes('marine')) {
    return projectImageMap['crane-lift'] || '/images/hero/crane-building-1920w.jpg'
  }
  if (categoryLower.includes('commercial') || titleLower.includes('commercial')) {
    return projectImageMap['steel-connect'] || '/images/hero/construction-steel-beams-1920w.jpg'
  }
  if (categoryLower.includes('residential') || titleLower.includes('residential')) {
    return projectImageMap['lowrise'] || '/images/hero/construction-building-frame-1920w.jpg'
  }
  if (categoryLower.includes('structural') || titleLower.includes('steel') || titleLower.includes('steel connection')) {
    return projectImageMap['steel-connect'] || '/images/hero/construction-steel-beams-1920w.jpg'
  }
  if (categoryLower.includes('foundation') || titleLower.includes('foundation')) {
    return projectImageMap['shallowdeepfoundationdesign10'] || '/images/hero/construction-concrete-1920w.jpg'
  }
  if (categoryLower.includes('inspection') || titleLower.includes('inspection')) {
    return projectImageMap['inspection-services'] || '/images/hero/construction-site-1920w.jpg'
  }
  if (categoryLower.includes('detailing') || titleLower.includes('shop') || titleLower.includes('drawing')) {
    return projectImageMap['cad-drawing'] || '/images/hero/construction-structural-1920w.jpg'
  }

  // Fallback to first available image
  return projectImageMap['steel-connect'] || '/images/hero/construction-steel-beams-1920w.jpg'
}

// Helper function to get project image from API data or fallback
const getProjectImage = (project: any): string => {
  // First try: PDF preview thumbnail (featured media is the PDF itself and _embed of it is forbidden)
  const pdfPreview = project.project_pdfs_resolved?.[0]?.thumbnail
  if (pdfPreview) {
    return pdfPreview
  }

  // Second try: images array from API
  if (project.images && Array.isArray(project.images) && project.images.length > 0) {
    return project.images[0].url || project.images[0] || '/images/hero/construction-steel-beams-1920w.jpg'
  }

  // Third try: featured media from _embedded (only when it's a real image)
  const featuredMedia = project._embedded?.['wp:featuredmedia']?.[0]
  const featuredUrl = featuredMedia?.source_url ||
         featuredMedia?.media_details?.sizes?.large?.source_url ||
         featuredMedia?.media_details?.sizes?.full?.source_url ||
         featuredMedia?.media_details?.sizes?.medium?.source_url ||
         ''
  if (featuredUrl && !featuredUrl.toLowerCase().endsWith('.pdf')) {
    return featuredUrl
  }

  // Fallback to category-based image matching
  return findProjectImage(project.title?.rendered || '', project.custom_fields?.project_category || '')
}

// Transform projects data for carousel display
const carouselSlides = computed(() => {
  if (!projectsData.value || !Array.isArray(projectsData.value)) return []
  return projectsData.value.slice(0, 5).map((p: any, index: number) => ({
    id: index + 1,
    title: decodeHtmlEntities(p.title?.rendered) || 'Project',
    slug: p.slug || 'project',
    description: decodeHtmlEntities(p.excerpt?.rendered?.replace(/<[^>]*>/g, '')) || 'Structural engineering project',
    category: p.custom_fields?.project_category || 'Project',
    location: p.custom_fields?.project_location || '',
    year: p.custom_fields?.project_year || '',
    icon: projectIcons[p.custom_fields?.project_category as string] || 'mdi:office-building',
    image: getProjectImage(p), // Use actual project image from API
  }))
})

// Featured projects - prioritizes WP marked featured, then falls back to first 3
const featuredProjects = computed(() => {
  if (!projectsData.value || !Array.isArray(projectsData.value)) return []

  // First, try to get projects marked as featured in WordPress
  const wpFeatured = projectsData.value
    .filter((p: any) => p.custom_fields?.project_featured === '1' || p.custom_fields?.project_featured === true)
    .slice(0, 3)

  // If we have WP featured projects, use those
  if (wpFeatured.length > 0) {
    return wpFeatured.map((p: any) => ({
      title: decodeHtmlEntities(p.title?.rendered) || 'Project',
      slug: p.slug || 'project',
      description: decodeHtmlEntities(p.excerpt?.rendered?.replace(/<[^>]*>/g, '')) || 'Structural engineering project',
      category: p.custom_fields?.project_category || 'Project',
      location: p.custom_fields?.project_location || '',
      year: p.custom_fields?.project_year || '',
      image: getProjectImage(p),
    }))
  }

  // Otherwise, use carousel slides (first 3 projects) with fallback images
  return carouselSlides.value.slice(0, 3).map((slide: any) => ({
    title: slide.title,
    slug: slide.slug,
    description: slide.description,
    category: slide.category,
    location: slide.location,
    year: slide.year,
    image: slide.image || findProjectImage(slide.title, slide.category),
  }))
})

// Fetch testimonials from API
const { data: testimonialsResponse } = await useFetch('/api/testimonials')
const testimonialsData = computed(() => (testimonialsResponse.value as any)?.data || [])

// Transform testimonials data for display
const testimonials = computed(() => {
  if (!testimonialsData.value || !Array.isArray(testimonialsData.value)) return []
  return testimonialsData.value
    .map((t: any) => ({
      quote: decodeHtmlEntities(t.custom_fields?.quote || t.content?.rendered?.replace(/<[^>]*>/g, '')),
      author: decodeHtmlEntities(t.custom_fields?.testimonial_client_name || t.title?.rendered) || 'Client',
      company: decodeHtmlEntities(t.custom_fields?.testimonial_company) || '',
      role: decodeHtmlEntities(t.custom_fields?.testimonial_role) || '',
      source: t.custom_fields?.testimonial_source || '',
    }))
    .filter((t: any) => t.quote)
    .slice(0, 6)
})
</script>
