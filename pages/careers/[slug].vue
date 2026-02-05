<template>
  <div>
    <!-- Breadcrumbs -->
    <AppBreadcrumbs :breadcrumbs="[{ title: 'Careers', to: '/careers' }, { title: position?.title || 'Position' }]" />

    <!-- Loading State -->
    <div v-if="pending" class="py-24">
      <div class="container">
        <div class="animate-pulse space-y-6">
          <div class="h-8 bg-neutral-200 rounded w-3/4"></div>
          <div class="h-4 bg-neutral-200 rounded w-1/2"></div>
          <div class="h-4 bg-neutral-200 rounded w-full"></div>
          <div class="h-4 bg-neutral-200 rounded w-full"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="py-24">
      <div class="container text-center">
        <Icon name="mdi:alert-circle" class="w-16 h-16 text-neutral-300 mx-auto mb-4" />
        <h2 class="text-2xl font-bold text-neutral-900 mb-2">Position Not Found</h2>
        <p class="text-neutral-600 mb-6">The position you're looking for doesn't exist or has been filled.</p>
        <NuxtLink
          to="/careers"
          class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
        >
          View All Positions
          <Icon name="mdi:arrow-right" class="w-5 h-5" />
        </NuxtLink>
      </div>
    </div>

    <!-- Position Details -->
    <template v-else-if="position">
      <!-- Page Header -->
      <AppSection bg-color="primary-dark" padding="lg">
        <div class="container text-white">
          <div class="max-w-4xl">
            <div class="flex flex-wrap items-center gap-3 mb-4">
              <span v-if="position.department" class="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                {{ position.department }}
              </span>
              <span class="px-3 py-1 bg-secondary rounded-full text-sm font-semibold">
                {{ position.type }}
              </span>
            </div>
            <h1 class="text-4xl md:text-5xl font-display font-bold mb-4">
              {{ position.title }}
            </h1>
            <div class="flex flex-wrap items-center gap-4 text-white/80">
              <span class="flex items-center gap-2">
                <Icon name="mdi:map-marker" class="w-5 h-5" />
                {{ position.location }}
              </span>
              <span v-if="position.salary" class="flex items-center gap-2">
                <Icon name="mdi:cash" class="w-5 h-5" />
                {{ position.salary }}
              </span>
              <span v-if="position.experience" class="flex items-center gap-2">
                <Icon name="mdi:school" class="w-5 h-5" />
                {{ position.experience }}
              </span>
            </div>
          </div>
        </div>
      </AppSection>

      <!-- Main Content -->
      <AppSection bg-color="white" animate-on-scroll>
        <div class="grid lg:grid-cols-3 gap-12">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-8">
            <!-- About the Role -->
            <section>
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">About the Role</h2>
              <p class="text-neutral-600 leading-relaxed">
                {{ position.description }}
              </p>
            </section>

            <!-- Responsibilities -->
            <section v-if="position.responsibilities?.length">
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">Responsibilities</h2>
              <ul class="space-y-3">
                <li v-for="responsibility in position.responsibilities" :key="responsibility" class="flex items-start gap-3 text-neutral-600">
                  <Icon name="mdi:check-circle" class="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span>{{ responsibility }}</span>
                </li>
              </ul>
            </section>

            <!-- Qualifications -->
            <section v-if="position.qualifications?.length">
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">Qualifications</h2>
              <ul class="space-y-3">
                <li v-for="qualification in position.qualifications" :key="qualification" class="flex items-start gap-3 text-neutral-600">
                  <Icon name="mdi:star-circle" class="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{{ qualification }}</span>
                </li>
              </ul>
            </section>

            <!-- Preferred Skills -->
            <section v-if="position.preferredSkills?.length">
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">Preferred Skills</h2>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="skill in position.preferredSkills"
                  :key="skill"
                  class="px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-lg text-sm"
                >
                  {{ skill }}
                </span>
              </div>
            </section>

            <!-- Benefits -->
            <section v-if="position.benefits?.length">
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">Benefits & Perks</h2>
              <ul class="space-y-3">
                <li v-for="benefit in position.benefits" :key="benefit" class="flex items-start gap-3 text-neutral-600">
                  <Icon name="mdi:gift" class="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span>{{ benefit }}</span>
                </li>
              </ul>
            </section>
          </div>

          <!-- Sidebar -->
          <div class="lg:col-span-1">
            <div class="sticky top-24 space-y-6">
              <!-- Quick Info Card -->
              <div class="bg-neutral-50 rounded-xl p-6">
                <h3 class="font-bold text-neutral-900 mb-4">Position Details</h3>
                <dl class="space-y-3">
                  <div v-if="position.department">
                    <dt class="text-sm text-neutral-500">Department</dt>
                    <dd class="font-semibold text-neutral-900">{{ position.department }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm text-neutral-500">Employment Type</dt>
                    <dd class="font-semibold text-neutral-900">{{ position.type }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm text-neutral-500">Location</dt>
                    <dd class="font-semibold text-neutral-900">{{ position.location }}</dd>
                  </div>
                  <div v-if="position.experience">
                    <dt class="text-sm text-neutral-500">Experience Required</dt>
                    <dd class="font-semibold text-neutral-900">{{ position.experience }}</dd>
                  </div>
                  <div v-if="position.salary">
                    <dt class="text-sm text-neutral-500">Salary Range</dt>
                    <dd class="font-semibold text-neutral-900">{{ position.salary }}</dd>
                  </div>
                </dl>
              </div>

              <!-- Apply Button -->
              <div class="bg-primary rounded-xl p-6 text-white text-center">
                <h3 class="font-bold mb-3">Ready to Apply?</h3>
                <p class="text-sm opacity-90 mb-4">
                  Join our team and help shape Tampa Bay's skyline
                </p>
                <NuxtLink
                  to="/contact"
                  class="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-neutral-100 transition-colors"
                >
                  Apply Now
                  <Icon name="mdi:arrow-right" class="w-5 h-5" />
                </NuxtLink>
              </div>

              <!-- Share -->
              <div class="bg-neutral-50 rounded-xl p-6">
                <h3 class="font-bold text-neutral-900 mb-3">Share This Position</h3>
                <div class="flex gap-2">
                  <a
                    :href="`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`"
                    target="_blank"
                    rel="noopener"
                    class="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#0077b5] text-white rounded-lg hover:bg-[#005885] transition-colors"
                    aria-label="Share on LinkedIn"
                  >
                    <Icon name="mdi:linkedin" class="w-5 h-5" />
                  </a>
                  <a
                    :href="`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this opportunity at VP Associates: ${position.title}`)}&url=${encodeURIComponent(fullUrl)}`"
                    target="_blank"
                    rel="noopener"
                    class="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors"
                    aria-label="Share on Twitter"
                  >
                    <Icon name="mdi:twitter" class="w-5 h-5" />
                  </a>
                  <a
                    :href="`mailto:?subject=Check out this position at VP Associates&body=${encodeURIComponent(`I thought you might be interested in this position: ${position.title}\n\n${fullUrl}`)}`"
                    class="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 transition-colors"
                    aria-label="Share via email"
                  >
                    <Icon name="mdi:email" class="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppSection>

      <!-- Related Positions -->
      <AppSection v-if="relatedPositions.length > 0" bg-color="neutral-50" animate-on-scroll>
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-4">
            Other Open Positions
          </h2>
          <p class="text-xl text-neutral-600">
            Explore other opportunities on our team
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="relatedPosition in relatedPositions"
            :key="relatedPosition.slug"
            class="bg-white rounded-xl p-6 border border-neutral-200 hover:border-primary hover:shadow-md transition-all"
          >
            <div class="flex items-start gap-3 mb-4">
              <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon :name="relatedPosition.icon" class="w-6 h-6 text-primary" />
              </div>
              <div class="flex-1">
                <h3 class="font-bold text-neutral-900 mb-1">{{ relatedPosition.title }}</h3>
                <div class="flex flex-wrap items-center gap-2 text-sm text-neutral-600">
                  <span class="flex items-center gap-1">
                    <Icon name="mdi:map-marker" class="w-3 h-3" />
                    {{ relatedPosition.location }}
                  </span>
                  <span>•</span>
                  <span>{{ relatedPosition.type }}</span>
                </div>
              </div>
            </div>
            <NuxtLink
              :to="`/careers/${relatedPosition.slug}`"
              class="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
            >
              View Details
              <Icon name="mdi:arrow-right" class="w-4 h-4" />
            </NuxtLink>
          </div>
        </div>
      </AppSection>
    </template>
  </div>
</template>

<script setup lang="ts">
// Type definitions
interface Position {
  id: number
  title: string
  slug: string
  location: string
  type: string
  department?: string
  experience?: string
  salary?: string
  icon: string
  description: string
  responsibilities?: string[]
  qualifications?: string[]
  preferredSkills?: string[]
  benefits?: string[]
}

interface RelatedPosition {
  id: number
  title: string
  slug: string
  location: string
  type: string
  department?: string
  icon: string
}

// Get the route slug
const route = useRoute()
const slug = String((route.params as any).slug || '')

// Build full URL for sharing
const fullUrl = computed(() => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.siteUrl || 'https://vp-associates.com'
  return `${baseUrl}/careers/${slug}`
})

// Fetch position data with type assertion
const { data: position, pending, error } = await useFetch<Position>(`/api/careers/${slug}`)

// SEO Meta Tags - set after data is loaded
watchEffect(() => {
  if (position.value) {
    usePageMeta({
      title: `${position.value.title} | Careers at VP Associates`,
      titleSuffix: false,
      description: position.value.description || `Join VP Associates as a ${position.value.title}. View job requirements, responsibilities, and apply online.`,
      ogImage: 'https://vp-associates.com/images/og-default.jpg',
    })

    // JobPosting Schema
    useJsonld({
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: position.value.title,
      description: position.value.description,
      identifier: {
        '@type': 'PropertyValue',
        name: 'VP Associates',
        value: position.value.id?.toString(),
      },
      datePosted: new Date().toISOString(),
      validThrough: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      employmentType: position.value.type === 'Full-time' ? 'FULL_TIME' : 'PART_TIME',
      hiringOrganization: {
        '@type': 'Organization',
        name: 'VP Associates',
        url: 'https://vp-associates.com',
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Tampa',
          addressRegion: 'FL',
          addressCountry: 'US',
        },
      },
      baseSalary: position.value.salary ? {
        '@type': 'MonetaryAmount',
        currency: 'USD',
        value: {
          '@type': 'QuantitativeValue',
          value: position.value.salary,
        },
      } : undefined,
    })
  }
})

// Related positions (static data for now)
const allPositions: RelatedPosition[] = [
  {
    id: 1,
    title: 'Structural Engineer',
    slug: 'structural-engineer',
    location: 'Tampa, FL',
    type: 'Full-time',
    department: 'Engineering',
    icon: 'mdi:calculator'
  },
  {
    id: 2,
    title: 'Senior Structural Engineer',
    slug: 'senior-structural-engineer',
    location: 'Tampa, FL',
    type: 'Full-time',
    department: 'Engineering',
    icon: 'mdi:calculator-variant'
  },
  {
    id: 3,
    title: 'CAD/BIM Technician',
    slug: 'cad-bim-technician',
    location: 'Tampa, FL',
    type: 'Full-time',
    department: 'Design',
    icon: 'mdi:monitor'
  },
  {
    id: 4,
    title: 'Project Manager',
    slug: 'project-manager',
    location: 'Tampa, FL',
    type: 'Full-time',
    department: 'Management',
    icon: 'mdi:clipboard-check'
  }
]

const relatedPositions = computed(() => {
  return allPositions.filter(p => p.slug !== slug).slice(0, 3)
})
</script>
