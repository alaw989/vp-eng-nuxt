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
            VP Associates has been providing exceptional structural engineering services to the Tampa Bay area for over 30 years. Our team of licensed engineers brings expertise, innovation, and dedication to every project.
          </p>
          <p class="text-lg text-neutral-600 mb-8">
            From commercial developments to residential projects, we deliver comprehensive structural solutions that meet the highest standards of safety, efficiency, and code compliance.
          </p>
          <NuxtLink
            to="/about"
            class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark hover:-translate-y-0.5 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Learn More About Us
            <Icon name="mdi:arrow-right" class="w-5 h-5" />
          </NuxtLink>
        </div>
        <div class="relative">
          <picture class="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl block">
            <source srcset="/images/hero/tampa-bay-sundown-640w.webp 640w, /images/hero/tampa-bay-sundown-1280w.webp 1280w, /images/hero/tampa-bay-sundown-1920w.webp 1920w" type="image/webp" sizes="(max-width: 768px) 640px, (max-width: 1024px) 1280px, 1920px">
            <img
              src="/images/hero/tampa-bay-sundown-1920w.jpg"
              srcset="/images/hero/tampa-bay-sundown-640w.jpg 640w, /images/hero/tampa-bay-sundown-1280w.jpg 1280w, /images/hero/tampa-bay-sundown-1920w.jpg 1920w"
              sizes="(max-width: 768px) 640px, (max-width: 1024px) 1280px, 1920px"
              alt="Tampa Bay skyline at sunset - VP Associates serves the Tampa Bay area with over 30 years of structural engineering expertise"
              class="w-full h-full object-cover"
              loading="lazy"
              width="1920"
              height="1080"
            >
          </picture>
          <!-- Floating Stats Card -->
          <div class="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-6 max-w-xs">
            <div class="flex items-center gap-3 mb-2">
              <Icon name="mdi:check-circle" class="w-6 h-6 text-secondary" />
              <span class="font-semibold text-neutral-900">Licensed & Insured</span>
            </div>
            <p class="text-sm text-neutral-600">Fully licensed Florida engineers with comprehensive coverage</p>
          </div>
        </div>
      </div>
    </AppSection>

    <!-- Statistics Section -->
    <AppSection bg-color="primary" padding="md">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
        <StatCounter
          :value="500"
          label="Projects Completed"
          suffix="+"
        />
        <StatCounter
          :value="30"
          label="Years Experience"
          suffix="+"
        />
        <StatCounter
          :value="100"
          label="Client Satisfaction"
          suffix="%"
        />
        <StatCounter
          :value="10"
          label="Team Members"
          suffix="+"
        />
      </div>
    </AppSection>

    <!-- Services Section -->
    <AppSection bg-color="neutral-50-pattern" animate-on-scroll elevation corner-accent="secondary">
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-4">
          Our Services
        </h2>
        <p class="text-xl text-neutral-600 max-w-2xl mx-auto">
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

      <div class="text-center mt-12">
        <NuxtLink
          to="/services"
          class="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white hover:-translate-y-0.5 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          View All Services
          <Icon name="mdi:arrow-right" class="w-5 h-5" />
        </NuxtLink>
      </div>
    </AppSection>

    <!-- Featured Projects Grid -->
    <AppSection bg-color="neutral" animate-on-scroll elevation stagger-children>
      <div class="text-center mb-12">
        <h2 class="text-4xl md:text-5xl font-display font-bold text-white mb-4">
          Featured Projects
        </h2>
        <p class="text-xl text-neutral-300 max-w-2xl mx-auto">
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

      <div class="text-center">
        <NuxtLink
          to="/projects"
          class="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg font-semibold hover:from-primary-light hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
        >
          View All Projects
          <Icon name="mdi:arrow-right" class="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </NuxtLink>
      </div>
    </AppSection>

    <!-- Client Logos Section -->
    <LazyClientLogos
      :clients="clientLogos"
      title="Trusted by Industry Leaders"
      subtitle="Proud to serve prestigious clients across Tampa Bay and Florida"
      bg-color="neutral-50"
      padding="md"
    />

    <!-- Testimonials Section -->
    <AppSection bg-color="neutral-100-pattern" animate-on-scroll elevation corner-accent="primary">
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-4">
          What Our Clients Say
        </h2>
        <p class="text-xl text-neutral-600 max-w-2xl mx-auto">
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
    <AppSection bg-color="primary-dark" padding="xl">
      <div class="container text-center text-white">
        <h2 class="text-4xl md:text-5xl font-display font-bold mb-6">
          Ready to Start Your Project?
        </h2>
        <p class="text-xl mb-8 max-w-2xl mx-auto opacity-90">
          Contact us today to discuss your structural engineering needs
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink
            to="/contact"
            class="px-8 py-4 bg-white text-primary rounded-lg font-semibold hover:bg-neutral-100 hover:-translate-y-0.5 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Contact Us
          </NuxtLink>
          <NuxtLink
            to="tel:+18135551234"
            class="px-8 py-4 bg-secondary text-white rounded-lg font-semibold hover:bg-secondary-dark hover:-translate-y-0.5 transition-all duration-300 inline-flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Icon name="mdi:phone" class="w-5 h-5" />
            (813) 555-1234
          </NuxtLink>
        </div>
      </div>
    </AppSection>
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
  description: 'VP Associates provides structural engineering services in Tampa Bay including steel, concrete, masonry, wood, foundations, seawalls, and steel detailing. Over 30 years of experience.',
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
  telephone: '+1-813-555-1234',
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
  openingHours: 'Mo-Fr 08:00-17:00',
})

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
const { data: projectsResponse } = await useFetch('/api/projects')
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
  // First try: images array from API
  if (project.images && Array.isArray(project.images) && project.images.length > 0) {
    return project.images[0].url || project.images[0] || '/images/hero/construction-steel-beams-1920w.jpg'
  }

  // Second try: featured media from _embedded
  const featuredMedia = project._embedded?.['wp:featuredmedia']?.[0]
  if (featuredMedia) {
    return featuredMedia.source_url ||
           featuredMedia.media_details?.sizes?.large?.source_url ||
           featuredMedia.media_details?.sizes?.full?.source_url ||
           featuredMedia.media_details?.sizes?.medium?.source_url ||
           '/images/hero/construction-steel-beams-1920w.jpg'
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
    location: p.custom_fields?.project_location || 'Tampa Bay',
    year: p.custom_fields?.project_year || new Date().getFullYear().toString(),
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
      location: p.custom_fields?.project_location || 'Tampa Bay',
      year: p.custom_fields?.project_year || new Date().getFullYear().toString(),
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

// Client logos for trust indicators
const clientLogos = [
  { name: 'Tampa General', icon: 'mdi:hospital' },
  { name: 'Raymond James', icon: 'mdi:office-building' },
  { name: 'Port Tampa Bay', icon: 'mdi:ship' },
  { name: 'Hillsborough County', icon: 'mdi:bank' },
  { name: 'City of Tampa', icon: 'mdi:city' },
  { name: 'USF', icon: 'mdi:school' },
  { name: 'Moffitt Cancer Center', icon: 'mdi:medical-bag' },
  { name: 'TECO', icon: 'mdi:lightning-bolt' },
]

// Fetch testimonials from API
const { data: testimonialsResponse } = await useFetch('/api/testimonials')
const testimonialsData = computed(() => (testimonialsResponse.value as any)?.data || [])

// Transform testimonials data for display
const testimonials = computed(() => {
  if (!testimonialsData.value || !Array.isArray(testimonialsData.value)) return []
  return testimonialsData.value.slice(0, 6).map((t: any) => ({
    quote: decodeHtmlEntities(t.custom_fields?.quote || t.content?.rendered?.replace(/<[^>]*>/g, '')) || 'Great service!',
    author: decodeHtmlEntities(t.custom_fields?.testimonial_client_name || t.title?.rendered) || 'Client',
    company: decodeHtmlEntities(t.custom_fields?.testimonial_company) || '',
    role: decodeHtmlEntities(t.custom_fields?.testimonial_role) || '',
  }))
})
</script>
