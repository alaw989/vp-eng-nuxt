<template>
  <div>
    <!-- Breadcrumbs -->
    <div class="bg-white border-b border-neutral-200">
      <div class="container py-4">
        <AppBreadcrumbs :breadcrumbs="aboutBreadcrumbs" />
      </div>
    </div>

    <!-- Page Header -->
    <AppSection bg-color="primary-dark" padding="lg">
      <div class="container text-center text-white">
        <h1 class="text-5xl md:text-6xl font-display font-bold mb-6">
          About VP Associates
        </h1>
        <p class="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
          Tampa Bay's trusted structural engineering firm for over 30 years
        </p>
      </div>
    </AppSection>

    <!-- Company History -->
    <AppSection bg-color="white" animate-on-scroll>
      <div class="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 class="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-6">
            Our History
          </h2>
          <p class="text-lg text-neutral-600 mb-4">
            Founded in 1991, VP Associates has grown from a small consulting firm to one of Tampa Bay's most respected structural engineering practices. Our founder, a licensed Florida engineer with decades of experience, established the company on the principles of integrity, technical excellence, and client service.
          </p>
          <p class="text-lg text-neutral-600 mb-4">
            Throughout our 30+ year history, we've contributed to shaping the Tampa Bay skyline through innovative structural solutions for commercial developments, residential communities, marine facilities, and critical infrastructure projects.
          </p>
          <p class="text-lg text-neutral-600 mb-6">
            We combine deep technical expertise with practical construction knowledge to deliver designs that are not only code-compliant and safe, but also buildable and cost-effective.
          </p>
          <div class="flex items-center gap-4">
            <div class="text-center">
              <div class="text-4xl font-bold text-primary">30+</div>
              <div class="text-sm text-neutral-600">Years in Business</div>
            </div>
            <div class="w-px h-12 bg-neutral-300"></div>
            <div class="text-center">
              <div class="text-4xl font-bold text-primary">500+</div>
              <div class="text-sm text-neutral-600">Projects Completed</div>
            </div>
            <div class="w-px h-12 bg-neutral-300"></div>
            <div class="text-center">
              <div class="text-4xl font-bold text-primary">100%</div>
              <div class="text-sm text-neutral-600">Code Compliance</div>
            </div>
          </div>
        </div>
        <div class="relative">
          <div class="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/20 to-primary-dark/20 flex items-center justify-center">
            <Icon name="mdi:office-building-marker" class="w-40 h-40 text-primary/30" />
          </div>
        </div>
      </div>
    </AppSection>

    <!-- Mission & Values -->
    <AppSection bg-color="neutral-50" animate-on-scroll>
      <div class="text-center mb-16">
        <h2 class="text-4xl font-display font-bold text-neutral-900 mb-4">
          Our Mission & Values
        </h2>
        <p class="text-xl text-neutral-600 max-w-3xl mx-auto">
          The principles that guide every project we undertake
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-8">
        <div class="bg-white rounded-xl p-8 shadow-lg border border-neutral-200">
          <div class="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
            <Icon name="mdi:shield-check" class="w-8 h-8 text-primary" />
          </div>
          <h3 class="text-xl font-bold text-neutral-900 mb-3">Safety First</h3>
          <p class="text-neutral-600">
            Every design we create prioritizes structural integrity and public safety. We never compromise on engineering standards or code requirements.
          </p>
        </div>

        <div class="bg-white rounded-xl p-8 shadow-lg border border-neutral-200">
          <div class="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
            <Icon name="mdi:lightbulb" class="w-8 h-8 text-primary" />
          </div>
          <h3 class="text-xl font-bold text-neutral-900 mb-3">Innovation</h3>
          <p class="text-neutral-600">
            We embrace new technologies and methods, from BIM modeling to advanced analysis software, to deliver efficient and economical solutions.
          </p>
        </div>

        <div class="bg-white rounded-xl p-8 shadow-lg border border-neutral-200">
          <div class="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
            <Icon name="mdi:handshake" class="w-8 h-8 text-primary" />
          </div>
          <h3 class="text-xl font-bold text-neutral-900 mb-3">Client Service</h3>
          <p class="text-neutral-600">
            We build lasting relationships through responsive communication, technical expertise, and a commitment to our clients' success.
          </p>
        </div>
      </div>
    </AppSection>

    <!-- Leadership Team -->
    <AppSection bg-color="white" animate-on-scroll>
      <div class="text-center mb-16">
        <h2 class="text-4xl font-display font-bold text-neutral-900 mb-4">
          Our Leadership Team
        </h2>
        <p class="text-xl text-neutral-600 max-w-3xl mx-auto">
          Experienced engineers dedicated to your project's success
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <TeamMember
          v-for="member in leadership"
          :key="member.name"
          :name="member.name"
          :title="member.title"
          :bio="member.bio"
          :photo="member.photo"
          :email="member.email"
          :phone="member.phone"
        />
      </div>
    </AppSection>

    <!-- Certifications & Affiliations -->
    <AppSection bg-color="neutral-100" animate-on-scroll>
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-4">
          Certifications & Affiliations
        </h2>
        <p class="text-xl text-neutral-600">
          Professional credentials and industry memberships
        </p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div v-for="cert in certifications" :key="cert" class="bg-white rounded-lg p-6 flex items-center justify-center shadow-md">
          <div class="text-center">
            <Icon name="mdi:certificate" class="w-12 h-12 text-primary mx-auto mb-2" />
            <div class="font-semibold text-neutral-900 text-sm">{{ cert }}</div>
          </div>
        </div>
      </div>
    </AppSection>

    <!-- Service Area -->
    <AppSection bg-color="white" animate-on-scroll>
      <div class="grid md:grid-cols-2 gap-12 items-center">
        <div class="order-2 md:order-1">
          <div class="aspect-square rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <Icon name="mdi:map-marker-radius" class="w-40 h-40 text-primary/30" />
          </div>
        </div>
        <div class="order-1 md:order-2">
          <h2 class="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-6">
            Serving Tampa Bay
          </h2>
          <p class="text-lg text-neutral-600 mb-6">
            VP Associates is proud to serve the entire Tampa Bay area and surrounding communities. Our local expertise includes understanding Florida's unique building challenges, from hurricane wind loads to coastal soil conditions.
          </p>

          <div class="grid grid-cols-2 gap-4">
            <div v-for="area in serviceAreas" :key="area" class="flex items-center gap-2">
              <Icon name="mdi:check-circle" class="w-5 h-5 text-secondary flex-shrink-0" />
              <span class="text-neutral-700">{{ area }}</span>
            </div>
          </div>
        </div>
      </div>
    </AppSection>

    <!-- CTA Section -->
    <AppSection bg-color="primary" padding="xl">
      <div class="container text-center text-white">
        <h2 class="text-4xl font-display font-bold mb-6">
          Ready to Work Together?
        </h2>
        <p class="text-xl mb-8 max-w-2xl mx-auto opacity-90">
          Let's discuss how VP Associates can bring expertise to your next project
        </p>
        <NuxtLink
          to="/contact"
          class="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-lg font-semibold hover:bg-neutral-100 transition-colors"
        >
          Contact Us Today
          <Icon name="mdi:arrow-right" class="w-5 h-5" />
        </NuxtLink>
      </div>
    </AppSection>
  </div>
</template>

<script setup lang="ts">
// Breadcrumbs for SEO and navigation
const aboutBreadcrumbs = [
  { title: 'About' }
]

// SEO Meta Tags
useHead({
  title: 'About VP Associates | Structural Engineers Tampa Bay',
  meta: [
    { name: 'description', content: 'Learn about VP Associates, Tampa Bay\'s trusted structural engineering firm for over 30 years. Meet our team and discover our commitment to excellence.' },
    { property: 'og:title', content: 'About VP Associates | Structural Engineers Tampa Bay' },
    { property: 'og:description', content: 'VP Associates has been providing exceptional structural engineering services to the Tampa Bay area for over 30 years.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://vp-associates.com/about' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
})

// Organization Schema
useJsonld({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'VP Associates',
  url: 'https://vp-associates.com',
  logo: 'https://vp-associates.com/logo.png',
  description: 'Structural engineering firm serving Tampa Bay for over 30 years',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Tampa',
    addressRegion: 'FL',
    addressCountry: 'US',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-813-555-1234',
    contactType: 'sales',
  },
  sameAs: [
    'https://www.linkedin.com/company/vp-associates',
  ],
})

const leadership = [
  {
    name: 'Vincent P. Rodriguez, P.E.',
    title: 'President & Principal Engineer',
    bio: 'Founder and principal engineer with 35+ years of structural engineering experience. Licensed in Florida and multiple states. Specializes in complex commercial and marine structures.',
    email: 'vincent@vp-associates.com',
    phone: '+18135551201',
    photo: '/images/team-1.svg'
  },
  {
    name: 'Jennifer Martinez, P.E.',
    title: 'Vice President',
    bio: '20+ years of experience in structural design and project management. Expert in concrete and masonry design. Leads our commercial development projects.',
    email: 'jennifer@vp-associates.com',
    phone: '+18135551202',
    photo: '/images/team-2.svg'
  },
  {
    name: 'David Kim, P.E.',
    title: 'Senior Project Engineer',
    bio: '15+ years specializing in steel connection design and detailing. SDS2 expert and BIM specialist. Manages our industrial and marine projects.',
    email: 'david@vp-associates.com',
    phone: '+18135551203',
    photo: '/images/team-3.svg'
  },
  {
    name: 'Sarah Thompson, P.E.',
    title: 'Project Manager',
    bio: '12+ years in structural engineering with focus on residential and light commercial projects. Expert in foundation design and seawall structures.',
    email: 'sarah@vp-associates.com',
    phone: '+18135551204',
    photo: '/images/team-4.svg'
  }
]

const certifications = [
  'AISC Certification',
  'ACI Membership',
  'FL PE Licensed',
  'NCSEA Member',
  'ASCE Member',
  'FES Member',
  'OSHA Certified',
  'ISO 9001:2015'
]

const serviceAreas = [
  'Tampa',
  'St. Petersburg',
  'Clearwater',
  'Brandon',
  'Lakeland',
  'Sarasota',
  'Bradenton',
  'Pasco County',
  'Hillsborough County',
  'Pinellas County'
]
</script>
