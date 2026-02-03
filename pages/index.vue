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
          :key="service.title"
          :title="service.title"
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

    <!-- Featured Projects Section -->
    <AppSection bg-color="white" animate-on-scroll>
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-4">
          Featured Projects
        </h2>
        <p class="text-xl text-neutral-600 max-w-2xl mx-auto">
          Explore our portfolio of successful engineering projects across Tampa Bay
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ProjectCard
          v-for="project in featuredProjects"
          :key="project.slug"
          :title="project.title"
          :slug="project.slug"
          :description="project.description"
          :category="project.category"
          :location="project.location"
          :year="project.year"
        />
      </div>

      <div class="text-center mt-12">
        <NuxtLink
          to="/projects"
          class="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-lg font-semibold hover:bg-secondary-dark transition-colors"
        >
          View All Projects
          <Icon name="mdi:arrow-right" class="w-5 h-5" />
        </NuxtLink>
      </div>
    </AppSection>

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
useHead({
  title: 'VP Associates - Structural Engineering Services Tampa Bay',
  meta: [
    { name: 'description', content: 'VP Associates provides structural engineering services in Tampa Bay including steel, concrete, masonry, wood, foundations, seawalls, and steel detailing. Over 30 years of experience.' },
    { name: 'keywords', content: 'structural engineering, Tampa Bay, steel design, concrete design, foundation design, seawall design, Florida engineer, VP Associates' },
    { property: 'og:title', content: 'VP Associates - Structural Engineering Services Tampa Bay' },
    { property: 'og:description', content: 'Trusted structural engineers serving Tampa Bay for over 30 years. Steel, concrete, masonry, foundations, seawalls, and more.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://vp-associates.com' },
    { property: 'og:image', content: 'https://vp-associates.com/images/og-home.jpg' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'VP Associates - Structural Engineering Services Tampa Bay' },
    { name: 'twitter:description', content: 'Trusted structural engineers serving Tampa Bay for over 30 years.' },
  ],
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

const services = [
  {
    title: 'Structural Steel Design',
    description: 'AISC certified steel design for commercial and industrial projects',
    icon: 'mdi:beam'
  },
  {
    title: 'Concrete Design',
    description: 'ACI certified concrete design for foundations and structures',
    icon: 'mdi:cube-outline'
  },
  {
    title: 'Masonry Design',
    description: 'ACI 530 compliant masonry design and detailing',
    icon: 'mdi:wall'
  },
  {
    title: 'Foundation Design',
    description: 'Deep and shallow foundation engineering solutions',
    icon: 'mdi:home-foundation'
  },
  {
    title: 'Seawall Design',
    description: 'Coastal protection and seawall structural design',
    icon: 'mdi:waves'
  },
  {
    title: 'Steel Detailing',
    description: 'SDS2 and BIM steel connection design and detailing',
    icon: 'mdi:pencil-ruler'
  }
]

const featuredProjects = [
  {
    title: 'Tampa Marina Complex',
    slug: 'tampa-marina-complex',
    description: 'Complete structural design for a 50-slip marina with restaurant and retail spaces',
    category: 'Marine',
    location: 'Tampa, FL',
    year: 2024
  },
  {
    title: 'Downtown Office Tower',
    slug: 'downtown-office-tower',
    description: 'Structural steel design for 12-story commercial office building',
    category: 'Commercial',
    location: 'Tampa, FL',
    year: 2023
  },
  {
    title: 'Coastal Seawall System',
    slug: 'coastal-seawall-system',
    description: 'Engineered seawall protection system for luxury waterfront property',
    category: 'Marine',
    location: 'Clearwater, FL',
    year: 2024
  }
]

const testimonials = [
  {
    quote: 'VP Associates delivered exceptional structural engineering services for our commercial development. Their attention to detail and code expertise made all the difference.',
    author: 'Michael Chen',
    company: 'Chen Development Group'
  },
  {
    quote: 'Working with VP Associates was seamless from start to finish. They met every deadline and provided innovative solutions for our complex project.',
    author: 'Sarah Rodriguez',
    company: 'Rodriguez Architecture'
  },
  {
    quote: 'The team at VP Associates brings decades of expertise to every project. Their seawall designs have stood up to Florida weather for years.',
    author: 'James Morrison',
    company: 'Gulf Coast Contractors'
  }
]
</script>
