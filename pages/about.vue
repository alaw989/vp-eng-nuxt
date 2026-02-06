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
            <div class="text-center group cursor-default">
              <div class="text-4xl font-bold text-primary transition-all duration-300 group-hover:scale-105">30+</div>
              <div class="text-sm text-neutral-600">Years in Business</div>
            </div>
            <div class="w-px h-12 bg-neutral-300"></div>
            <div class="text-center group cursor-default">
              <div class="text-4xl font-bold text-primary transition-all duration-300 group-hover:scale-105">500+</div>
              <div class="text-sm text-neutral-600">Projects Completed</div>
            </div>
            <div class="w-px h-12 bg-neutral-300"></div>
            <div class="text-center group cursor-default">
              <div class="text-4xl font-bold text-primary transition-all duration-300 group-hover:scale-105">100%</div>
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
        <div class="bg-white rounded-xl p-8 shadow-lg border border-neutral-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div class="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
            <Icon name="mdi:shield-check" class="w-8 h-8 text-primary transition-transform duration-300 group-hover:scale-110" />
          </div>
          <h3 class="text-xl font-bold text-neutral-900 mb-3">Safety First</h3>
          <p class="text-neutral-600">
            Every design we create prioritizes structural integrity and public safety. We never compromise on engineering standards or code requirements.
          </p>
        </div>

        <div class="bg-white rounded-xl p-8 shadow-lg border border-neutral-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div class="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
            <Icon name="mdi:lightbulb" class="w-8 h-8 text-primary transition-transform duration-300 group-hover:scale-110" />
          </div>
          <h3 class="text-xl font-bold text-neutral-900 mb-3">Innovation</h3>
          <p class="text-neutral-600">
            We embrace new technologies and methods, from BIM modeling to advanced analysis software, to deliver efficient and economical solutions.
          </p>
        </div>

        <div class="bg-white rounded-xl p-8 shadow-lg border border-neutral-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div class="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
            <Icon name="mdi:handshake" class="w-8 h-8 text-primary transition-transform duration-300 group-hover:scale-110" />
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
        <!-- Loading skeleton -->
        <template v-if="teamPending">
          <TeamMemberSkeleton v-for="i in 4" :key="`skeleton-${i}`" />
        </template>

        <!-- Error state -->
        <div v-else-if="teamError" class="col-span-full text-center py-8">
          <Icon name="mdi:alert-circle-outline" class="w-12 h-12 text-secondary mx-auto mb-4" />
          <p class="text-neutral-600 mb-4">Unable to load team information. Please try again later.</p>
          <button
            @click="refreshTeam"
            class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Retry
          </button>
        </div>

        <!-- Team members -->
        <template v-else>
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
        </template>
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
        <div v-for="cert in certifications" :key="cert" class="bg-white rounded-lg p-6 flex items-center justify-center shadow-md hover:shadow-lg hover:border-primary border border-transparent transition-all duration-300">
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
usePageMeta({
  title: 'About VP Associates',
  description: 'Learn about VP Associates, Tampa Bay\'s trusted structural engineering firm for over 30 years. Meet our team and discover our commitment to excellence.',
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

// Fetch team members from API
const { data: teamResponse, pending: teamPending, error: teamError } = await useFetch('/api/team')
const teamData = computed(() => (teamResponse.value as any)?.data || [])

// Transform team data for display
const leadership = computed(() => {
  if (!teamData.value || !Array.isArray(teamData.value)) return []
  return teamData.value.slice(0, 4).map((member: any) => ({
    name: member.title?.rendered || 'Team Member',
    title: member.acf?.title || 'Team',
    bio: member.acf?.bio || 'Professional structural engineer',
    email: member.acf?.email || 'info@vp-associates.com',
    phone: member.acf?.phone || '+18135551234',
    photo: member.acf?.photo || '/images/team-1.jpg',
  }))
})

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

// Refresh team data
async function refreshTeam() {
  await navigateTo({ path: '/about', query: { refresh: Date.now().toString() } })
}
</script>
