<template>
  <div class="min-h-screen bg-neutral-50 py-16">
    <div class="container max-w-5xl mx-auto px-4">
      <!-- Breadcrumb -->
      <AppBreadcrumbs
        :breadcrumbs="[{ title: 'Search', to: '/search' }]"
      />

      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-4">
          Search Our Site
        </h1>
        <p class="text-lg text-neutral-600 max-w-2xl mx-auto">
          Find services, projects, and information across our website
        </p>
      </div>

      <!-- Search Box -->
      <div class="max-w-2xl mx-auto mb-12">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search for services, projects, or pages..."
            class="w-full px-6 py-4 pl-14 text-lg rounded-xl border-2 border-neutral-200 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all"
            @input="performSearch"
            aria-label="Search query"
          />
          <Icon name="mdi:magnify" class="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-400" />
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
            aria-label="Clear search"
          >
            <Icon name="mdi:close-circle" class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <Icon name="mdi:loading" class="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
        <p class="text-neutral-600">Searching...</p>
      </div>

      <!-- Results -->
      <div v-else-if="searchQuery">
        <!-- No Results -->
        <div v-if="totalResults === 0" class="text-center py-12">
          <Icon name="mdi:file-search-outline" class="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h2 class="text-2xl font-bold text-neutral-900 mb-2">No results found</h2>
          <p class="text-neutral-600 mb-6">
            Try searching for different keywords or browse our sections below
          </p>
          <div class="flex flex-wrap justify-center gap-3">
            <NuxtLink to="/services" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
              Browse Services
            </NuxtLink>
            <NuxtLink to="/projects" class="px-4 py-2 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors">
              Browse Projects
            </NuxtLink>
          </div>
        </div>

        <!-- Results Found -->
        <div v-else>
          <div class="mb-6">
            <p class="text-neutral-600">
              Found <span class="font-semibold text-neutral-900">{{ totalResults }}</span> result{{ totalResults !== 1 ? 's' : '' }}
              for "<span class="font-semibold">{{ searchQuery }}</span>"
            </p>
          </div>

          <!-- Pages Results -->
          <div v-if="pageResults.length > 0" class="mb-10">
            <h2 class="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <Icon name="mdi:page-layout-header" class="w-5 h-5 text-primary" />
              Pages ({{ pageResults.length }})
            </h2>
            <div class="space-y-3">
              <NuxtLink
                v-for="page in pageResults"
                :key="page.href"
                :to="page.href"
                class="block p-4 rounded-lg border border-neutral-200 hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div class="flex items-start gap-3">
                  <Icon :name="page.icon" class="w-5 h-5 text-primary mt-0.5" />
                  <div class="flex-1">
                    <h3 class="font-semibold text-neutral-900 group-hover:text-primary">{{ page.title }}</h3>
                    <p class="text-sm text-neutral-600 mt-1">{{ page.description }}</p>
                  </div>
                  <Icon name="mdi:chevron-right" class="w-5 h-5 text-neutral-400 group-hover:text-primary" />
                </div>
              </NuxtLink>
            </div>
          </div>

          <!-- Services Results -->
          <div v-if="serviceResults.length > 0" class="mb-10">
            <h2 class="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <Icon name="mdi:cogs" class="w-5 h-5 text-primary" />
              Services ({{ serviceResults.length }})
            </h2>
            <div class="grid md:grid-cols-2 gap-3">
              <NuxtLink
                v-for="service in serviceResults"
                :key="service.slug"
                :to="`/services/${service.slug}`"
                class="p-4 rounded-lg border border-neutral-200 hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div class="flex items-start gap-3">
                  <Icon
                    :name="service.services_meta?.icon || 'mdi:cog'"
                    class="w-5 h-5 text-primary mt-0.5"
                  />
                  <div class="flex-1">
                    <h3 class="font-semibold text-neutral-900 group-hover:text-primary">
                      {{ service.title?.rendered }}
                    </h3>
                    <p class="text-sm text-neutral-600 mt-1 line-clamp-2">
                      {{ stripHtml(service.excerpt?.rendered) }}
                    </p>
                  </div>
                  <Icon name="mdi:chevron-right" class="w-5 h-5 text-neutral-400 group-hover:text-primary" />
                </div>
              </NuxtLink>
            </div>
          </div>

          <!-- Projects Results -->
          <div v-if="projectResults.length > 0" class="mb-10">
            <h2 class="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <Icon name="mdi:folder-multiple" class="w-5 h-5 text-primary" />
              Projects ({{ projectResults.length }})
            </h2>
            <div class="grid md:grid-cols-2 gap-3">
              <NuxtLink
                v-for="project in projectResults"
                :key="project.slug"
                :to="`/projects/${project.slug}`"
                class="p-4 rounded-lg border border-neutral-200 hover:border-secondary hover:bg-secondary/5 transition-all group"
              >
                <div class="flex items-start gap-3">
                  <Icon name="mdi:office-building" class="w-5 h-5 text-secondary mt-0.5" />
                  <div class="flex-1">
                    <h3 class="font-semibold text-neutral-900 group-hover:text-secondary">
                      {{ project.title?.rendered }}
                    </h3>
                    <p class="text-sm text-neutral-600 mt-1 line-clamp-2">
                      {{ stripHtml(project.excerpt?.rendered) }}
                    </p>
                    <div class="flex items-center gap-3 mt-2 text-xs text-neutral-500">
                      <span v-if="project.project_meta?.location" class="flex items-center gap-1">
                        <Icon name="mdi:map-marker" class="w-3 h-3" />
                        {{ project.project_meta.location }}
                      </span>
                      <span v-if="project.project_meta?.category" class="flex items-center gap-1">
                        <Icon name="mdi:tag" class="w-3 h-3" />
                        {{ project.project_meta.category }}
                      </span>
                    </div>
                  </div>
                  <Icon name="mdi:chevron-right" class="w-5 h-5 text-neutral-400 group-hover:text-secondary" />
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- No Search Yet -->
      <div v-else class="text-center py-12">
        <Icon name="mdi:magnify" class="w-16 h-16 text-neutral-300 mx-auto mb-4" />
        <h2 class="text-2xl font-bold text-neutral-900 mb-2">What are you looking for?</h2>
        <p class="text-neutral-600 mb-8">
          Enter a search term to find services, projects, and pages
        </p>

        <!-- Popular Searches -->
        <div class="max-w-2xl mx-auto">
          <h3 class="text-lg font-semibold text-neutral-900 mb-4">Popular Searches</h3>
          <div class="flex flex-wrap justify-center gap-2">
            <button
              v-for="term in popularSearches"
              :key="term"
              @click="searchQuery = term; performSearch()"
              class="px-4 py-2 bg-white border border-neutral-200 rounded-lg text-neutral-700 hover:border-primary hover:text-primary transition-colors"
            >
              {{ term }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// SEO Meta Tags
useHead({
  title: 'Search - VP Associates',
  meta: [
    { name: 'description', content: 'Search VP Associates website for services, projects, and information.' },
    { name: 'robots', content: 'noindex, follow' },
  ],
})

// State
const searchQuery = ref('')
const loading = ref(false)
const pageResults = ref<any[]>([])
const serviceResults = ref<any[]>([])
const projectResults = ref<any[]>([])

// Static pages data
const staticPages = [
  { title: 'Home', href: '/', icon: 'mdi:home', description: 'Welcome to VP Associates structural engineering' },
  { title: 'About Us', href: '/about', icon: 'mdi:information', description: 'Learn about our company, history, and team' },
  { title: 'Services', href: '/services', icon: 'mdi:cogs', description: 'Our comprehensive structural engineering services' },
  { title: 'Projects', href: '/projects', icon: 'mdi:folder-multiple', description: 'Browse our portfolio of completed projects' },
  { title: 'Contact', href: '/contact', icon: 'mdi:email', description: 'Get in touch with our team' },
  { title: 'Site Map', href: '/sitemap', icon: 'mdi:sitemap', description: 'Complete site map and navigation' },
]

// Popular search terms
const popularSearches = [
  'structural steel',
  'concrete design',
  'foundation',
  'seawall',
  'marine',
  'commercial',
]

// Fetch services and projects
const { services } = await useInternalServices()
const { projects } = await useInternalProjects()

// Computed total results
const totalResults = computed(() =>
  pageResults.value.length + serviceResults.value.length + projectResults.value.length
)

// Strip HTML from text
function stripHtml(html: string | undefined): string {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').trim()
}

// Fuzzy search function
function fuzzyMatch(text: string, query: string): boolean {
  const terms = query.toLowerCase().split(/\s+/)
  const lowerText = text.toLowerCase()
  return terms.some(term => lowerText.includes(term))
}

// Perform search
function performSearch() {
  const query = searchQuery.value.trim()

  if (!query) {
    pageResults.value = []
    serviceResults.value = []
    projectResults.value = []
    return
  }

  loading.value = true

  // Search in pages
  pageResults.value = staticPages.filter(page =>
    fuzzyMatch(page.title, query) || fuzzyMatch(page.description, query)
  )

  // Search in services
  serviceResults.value = services.filter((service: any) =>
    fuzzyMatch(service.title?.rendered || '', query) ||
    fuzzyMatch(stripHtml(service.excerpt?.rendered) || '', query)
  )

  // Search in projects
  projectResults.value = projects.filter((project: any) =>
    fuzzyMatch(project.title?.rendered || '', query) ||
    fuzzyMatch(stripHtml(project.excerpt?.rendered) || '', query) ||
    fuzzyMatch(project.project_meta?.location || '', query) ||
    fuzzyMatch(project.project_meta?.category || '', query)
  )

  loading.value = false
}

// Clear search
function clearSearch() {
  searchQuery.value = ''
  pageResults.value = []
  serviceResults.value = []
  projectResults.value = []
}
</script>
