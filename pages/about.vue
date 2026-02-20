<template>
  <div>
    <!-- Page Banner -->
    <PageBanner
      headline="About VP Associates"
      subheadline="Tampa Bay's trusted structural engineering firm for over 30 years"
      background-image="/images/hero/construction-steel-structure-1920w.jpg"
      background-alt="Steel structure construction showcasing engineering excellence"
      aria-label="About page banner"
    />

    <!-- Company Overview -->
    <AppSection bg-color="white" animate-on-scroll border elevation>
      <div class="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 class="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-6">
            What We Do
          </h2>
          <p class="text-lg text-neutral-600 mb-4">
            <strong>VP & Associates, Inc.</strong> provides a full range of structural engineering, steel detailing services and inspection services. With over 30 years of experience, our engineers and steel detailers have knowledge and demonstrated mastery in all facets of structural engineering and steel detailing including, but not limited to, developing plans and specifications for construction of new and existing buildings/tanks, as well as providing inspection services.
          </p>
          <p class="text-lg text-neutral-600 mb-6">
            We provide services to corporate industrial contractors, commercial architects, and steel fabricators utilizing the most current 3-D computer analysis systems available, ACAD drafting, SDS2 steel detailing, and coordinating available research materials. Our engineers and detailers have initiated, engineered, and completed countless multi-faceted design and construction projects which have met goals to reduce construction cost and time.
          </p>
          <div class="flex items-center gap-4">
            <div class="text-center group cursor-default">
              <div class="text-4xl font-bold text-primary transition-all duration-300 group-hover:scale-105">
                <span ref="yearsCounter">0</span>+
              </div>
              <div class="text-sm text-neutral-600">Years Experience</div>
            </div>
            <div class="w-px h-12 bg-neutral-300"></div>
            <div class="text-center group cursor-default">
              <div class="text-4xl font-bold text-primary transition-all duration-300 group-hover:scale-105">3-D</div>
              <div class="text-sm text-neutral-600">Computer Analysis</div>
            </div>
            <div class="w-px h-12 bg-neutral-300"></div>
            <div class="text-center group cursor-default">
              <div class="text-4xl font-bold text-primary transition-all duration-300 group-hover:scale-105">SDS2</div>
              <div class="text-sm text-neutral-600">Steel Detailing</div>
            </div>
          </div>
        </div>
        <div class="relative">
          <div class="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl relative">
            <img
              src="/images/hero/construction-steel-beams-1920w.jpg"
              alt="Steel construction project showcasing VP Associates engineering work"
              class="w-full h-full object-cover"
              loading="eager"
            />
            <div class="absolute inset-0 bg-gradient-to-tr from-primary/30 to-secondary/20 mix-blend-multiply" />
          </div>
          <!-- Floating badge -->
          <div class="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-4 flex items-center gap-3 animate-bounce-slow">
            <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="mdi:award" class="w-6 h-6 text-primary" />
            </div>
            <div>
              <div class="font-bold text-neutral-900">Licensed</div>
              <div class="text-sm text-neutral-600">Florida PE</div>
            </div>
          </div>
        </div>
      </div>
    </AppSection>

    <!-- Mission & Values -->
    <AppSection bg-color="secondary/5" animate-on-scroll elevation>
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
    <AppSection bg-color="neutral-100" animate-on-scroll elevation>
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
          <Icon name="mdi:alert-circle-outline" class="w-12 h-12 text-alert mx-auto mb-4" />
          <p class="text-neutral-600 mb-4">Unable to load team information. Please try again later.</p>
          <button
            @click="refreshTeam"
            class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark hover:-translate-y-0.5 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Retry
          </button>
        </div>

        <!-- Team members -->
        <template v-else>
          <TeamMember
            v-for="(member, index) in leadership"
            :key="member.name"
            :name="member.name"
            :title="member.title"
            :bio="member.bio"
            :photo="member.photo"
            :email="member.email"
            :phone="member.phone"
            :priority="index === 0"
          />
        </template>
      </div>
    </AppSection>

    <!-- Certifications & Affiliations -->
    <AppSection bg-color="neutral-50" animate-on-scroll border>
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
    <AppSection bg-color="secondary/10" animate-on-scroll elevation>
      <div class="grid md:grid-cols-2 gap-12 items-center">
        <!-- Interactive Map -->
        <div class="order-2 md:order-1">
          <ClientOnly>
            <LazyTampaBayMap :service-areas="serviceAreas" />
            <template #fallback>
              <div class="aspect-square rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <div class="text-center">
                  <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p class="text-neutral-600">Loading map...</p>
                </div>
              </div>
            </template>
          </ClientOnly>
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
          class="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-lg font-semibold hover:bg-neutral-100 hover:-translate-y-0.5 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Contact Us Today
          <Icon name="mdi:arrow-right" class="w-5 h-5" />
        </NuxtLink>
      </div>
    </AppSection>
  </div>
</template>

<script setup lang="ts">
import { decodeHtmlEntities } from '~/utils/html'

// Route meta for screen reader announcements
definePageMeta({
  title: 'About'
})

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
  logo: 'https://vp-associates.com/wp-content/uploads/2018/06/vplogowhite.png',
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
    name: decodeHtmlEntities(member.title?.rendered) || 'Team Member',
    title: decodeHtmlEntities(member.custom_fields?.title || ['Team']?.[0]) || 'Team',
    bio: decodeHtmlEntities(member.custom_fields?.bio?.[0]) || 'Professional structural engineer',
    email: member.custom_fields?.email?.[0] || 'info@vp-associates.com',
    phone: member.custom_fields?.phone?.[0] || '+18135551234',
    photo: member.custom_fields?.photo?.[0] || '/images/team/team-1-800w.webp',
    linkedin: member.custom_fields?.linkedin?.[0] || '',
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

// Counter animation for "30+ Years"
const yearsCounter = ref<HTMLElement | null>(null)

onMounted(() => {
  // Animate the years counter from 0 to 30
  if (yearsCounter.value) {
    const duration = 2000 // 2 seconds
    const target = 30
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const current = Math.floor(easeOut * target)

      if (yearsCounter.value) {
        yearsCounter.value.textContent = current.toString()
      }

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        if (yearsCounter.value) {
          yearsCounter.value.textContent = target.toString()
        }
      }
    }

    // Start animation when section is visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate()
            observer.disconnect()
          }
        })
      },
      { threshold: 0.5 }
    )

    observer.observe(yearsCounter.value)
  }
})

// Refresh team data
async function refreshTeam() {
  await navigateTo({ path: '/about', query: { refresh: Date.now().toString() } })
}
</script>

<style scoped>
@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-bounce-slow {
  animation: bounce-slow 3s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .animate-bounce-slow {
    animation: none;
  }
}
</style>
