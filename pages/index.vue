<template>
  <div>
    <!-- Hero Slider -->
    <HeroSlider />

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
            class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
          >
            Learn More About Us
            <Icon name="mdi:arrow-right" class="w-5 h-5" />
          </NuxtLink>
        </div>
        <div class="relative">
          <div class="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/20 to-primary-dark/20 flex items-center justify-center">
            <Icon name="mdi:office-building" class="w-32 h-32 text-primary/30" />
          </div>
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
    <AppSection bg-color="neutral-50" animate-on-scroll>
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
          class="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors"
        >
          View All Services
          <Icon name="mdi:arrow-right" class="w-5 h-5" />
        </NuxtLink>
      </div>
    </AppSection>

    <!-- Featured Projects Grid -->
    <AppSection bg-color="white" animate-on-scroll>
      <div class="text-center mb-12">
        <h2 class="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-4">
          Featured Projects
        </h2>
        <p class="text-xl text-neutral-600 max-w-2xl mx-auto">
          Explore our portfolio of successful engineering projects across Tampa Bay
        </p>
      </div>

      <!-- Projects Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <ProjectCard
          v-for="project in featuredProjects"
          :key="project.slug"
          :title="project.title"
          :slug="project.slug"
          :description="project.description"
          :category="project.category"
          :location="project.location"
          :year="project.year"
          :image="project.image"
        />
      </div>

      <div class="text-center">
        <NuxtLink
          to="/projects"
          class="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-lg font-semibold hover:bg-secondary-dark transition-colors"
        >
          View All Projects
          <Icon name="mdi:arrow-right" class="w-5 h-5" />
        </NuxtLink>
      </div>
    </AppSection>

    <!-- Client Logos Section -->
    <ClientLogos
      :clients="clientLogos"
      title="Trusted by Industry Leaders"
      subtitle="Proud to serve prestigious clients across Tampa Bay and Florida"
      bg-color="neutral-50"
      padding="md"
    />

    <!-- Testimonials Section -->
    <AppSection bg-color="neutral-100" animate-on-scroll>
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-4">
          What Our Clients Say
        </h2>
        <p class="text-xl text-neutral-600 max-w-2xl mx-auto">
          Trusted by architects, contractors, and developers throughout Florida
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <TestimonialCard
          v-for="testimonial in testimonials"
          :key="testimonial.author"
          :quote="testimonial.quote"
          :author="testimonial.author"
          :company="testimonial.company"
        />
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
            class="px-8 py-4 bg-white text-primary rounded-lg font-semibold hover:bg-neutral-100 transition-colors"
          >
            Contact Us
          </NuxtLink>
          <NuxtLink
            to="tel:+18135551234"
            class="px-8 py-4 bg-secondary text-white rounded-lg font-semibold hover:bg-secondary-dark transition-colors inline-flex items-center justify-center gap-2"
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
    title: s.title?.rendered || 'Service',
    slug: s.slug || 'service',
    description: s.excerpt?.rendered?.replace(/<[^>]*>/g, '') || 'Professional structural engineering services',
    icon: s.acf?.icon || 'mdi:cog',
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

// Transform projects data for carousel display
const carouselSlides = computed(() => {
  if (!projectsData.value || !Array.isArray(projectsData.value)) return []
  return projectsData.value.slice(0, 5).map((p: any, index: number) => ({
    id: index + 1,
    title: p.title?.rendered || 'Project',
    slug: p.slug || 'project',
    description: p.excerpt?.rendered?.replace(/<[^>]*>/g, '') || 'Structural engineering project',
    category: p.acf?.category || 'Project',
    location: p.acf?.location || 'Tampa Bay',
    year: p.acf?.year || new Date().getFullYear().toString(),
    icon: projectIcons[p.acf?.category as string] || 'mdi:office-building',
  }))
})

// Project image mapping from image-mapping.json
const projectImageMap: Record<string, string> = {
  'steel-connect': '/images/projects/steel-connect-1280w.webp',
  'crane-lift': '/images/projects/crane-lift-1280w.webp',
  'cad-drawing': '/images/projects/cad-drawing-1280w.webp',
  'shallowdeepfoundationdesign10': '/images/projects/shallowdeepfoundationdesign10-1280w.webp',
  'lowrise': '/images/projects/lowrise-1280w.webp',
  'inspection-services': '/images/projects/inspection-services-1280w.webp',
  'shopdrawing': '/images/projects/shopdrawing-1280w.webp',
}

// Helper function to find matching image by title/category
const findProjectImage = (title: string, category: string): string | undefined => {
  const titleLower = title.toLowerCase()
  const categoryLower = category.toLowerCase()

  // Try exact filename match first
  for (const [key, path] of Object.entries(projectImageMap)) {
    if (titleLower.includes(key) || titleLower === key) {
      return path
    }
  }

  // Try category-based matching
  if (categoryLower.includes('marine') || titleLower.includes('marine')) {
    return projectImageMap['crane-lift']
  }
  if (categoryLower.includes('commercial') || titleLower.includes('commercial')) {
    return projectImageMap['steel-connect']
  }
  if (categoryLower.includes('residential') || titleLower.includes('residential')) {
    return projectImageMap['lowrise']
  }
  if (categoryLower.includes('structural') || titleLower.includes('steel') || titleLower.includes('steel connection')) {
    return projectImageMap['steel-connect']
  }
  if (categoryLower.includes('foundation') || titleLower.includes('foundation')) {
    return projectImageMap['shallowdeepfoundationdesign10']
  }
  if (categoryLower.includes('inspection') || titleLower.includes('inspection')) {
    return projectImageMap['inspection-services']
  }
  if (categoryLower.includes('detailing') || titleLower.includes('shop') || titleLower.includes('drawing')) {
    return projectImageMap['cad-drawing']
  }

  // Fallback to first available image
  return projectImageMap['steel-connect']
}

// Featured projects (first 3 for grid display)
const featuredProjects = computed(() => {
  return carouselSlides.value.slice(0, 3).map((slide: any) => ({
    title: slide.title,
    slug: slide.slug,
    description: slide.description,
    category: slide.category,
    location: slide.location,
    year: slide.year,
    image: findProjectImage(slide.title, slide.category),
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
  return testimonialsData.value.slice(0, 3).map((t: any) => ({
    quote: t.acf?.quote || t.content?.rendered?.replace(/<[^>]*>/g, '') || 'Great service!',
    author: t.title?.rendered || 'Client',
    company: t.acf?.company || '',
  }))
})
</script>
