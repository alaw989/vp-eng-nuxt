<template>
  <div>
    <!-- Page Header -->
    <PageBanner
      eyebrow="Industrial · Commercial · Bridges"
      headline="Our Projects"
      subheadline="A portfolio of successful structural engineering projects across Tampa Bay"
      aria-label="Projects page banner"
    />

    <!-- Projects: toolbar, grid and pagination read as one section -->
    <AppSection bg-color="white" animate-on-scroll>
      <!-- Toolbar -->
      <div class="border-b border-neutral-200 pb-6 mb-8 space-y-4">
        <!-- Category tabs and view toggle -->
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex overflow-x-auto scrollbar-hide border border-neutral-300 rounded-sm bg-white w-fit max-w-full divide-x divide-neutral-300">
            <button
              v-for="category in categories"
              :key="category.id"
              @click="setCategory(category.id)"
              :class="[
                'h-11 px-5 font-semibold whitespace-nowrap transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-primary focus-visible:-outline-offset-2',
                filters.category === category.id
                  ? 'bg-primary text-white'
                  : 'bg-white text-neutral-700 hover:bg-neutral-50'
              ]"
              :aria-pressed="filters.category === category.id"
            >
              {{ category.name }}
            </button>
          </div>

          <div class="flex border border-neutral-300 rounded-sm bg-white divide-x divide-neutral-300">
            <button
              @click="setViewMode('grid')"
              :class="[
                'w-11 h-11 flex items-center justify-center transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-primary focus-visible:-outline-offset-2',
                viewMode === 'grid' ? 'bg-primary text-white' : 'text-neutral-600 hover:bg-neutral-50'
              ]"
              aria-label="Grid view"
              :aria-pressed="viewMode === 'grid'"
            >
              <Icon name="mdi:view-grid" class="w-5 h-5" />
            </button>
            <button
              @click="setViewMode('list')"
              :class="[
                'w-11 h-11 flex items-center justify-center transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-primary focus-visible:-outline-offset-2',
                viewMode === 'list' ? 'bg-primary text-white' : 'text-neutral-600 hover:bg-neutral-50'
              ]"
              aria-label="List view"
              :aria-pressed="viewMode === 'list'"
            >
              <Icon name="mdi:view-list" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Location, year and sort -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
          <div class="relative sm:w-48">
            <select
              v-model="filters.location"
              @change="setLocation"
              class="field appearance-none cursor-pointer pr-10"
              aria-label="Filter by location"
            >
              <option value="">All Locations</option>
              <option v-for="location in uniqueLocations" :key="location" :value="location">
                {{ location }}
              </option>
            </select>
            <Icon name="mdi:chevron-down" class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 pointer-events-none" />
          </div>

          <div class="relative sm:w-40">
            <select
              v-model="filters.year"
              @change="setYear"
              class="field appearance-none cursor-pointer pr-10"
              aria-label="Filter by year"
            >
              <option value="">All Years</option>
              <option v-for="year in uniqueYears" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
            <Icon name="mdi:chevron-down" class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 pointer-events-none" />
          </div>

          <div class="relative sm:w-48">
            <select
              v-model="filters.sort"
              @change="setSort"
              class="field appearance-none cursor-pointer pr-10"
              aria-label="Sort projects"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="az">Name (A-Z)</option>
              <option value="za">Name (Z-A)</option>
            </select>
            <Icon name="mdi:chevron-down" class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 pointer-events-none" />
          </div>

          <button
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="btn-outline px-4"
          >
            <Icon name="mdi:close" class="w-5 h-5" />
            Clear Filters
          </button>
        </div>

        <!-- Active filters -->
        <div v-if="hasActiveFilters" class="flex flex-wrap items-center gap-2">
          <span v-if="filters.category !== 'all'" class="pl-3 pr-1 h-8 rounded-sm border border-primary/30 bg-primary/5 text-primary text-sm font-medium flex items-center gap-1">
            Category: {{ getCategoryName(filters.category) }}
            <button @click="setCategory('all')" class="p-1 rounded-sm hover:bg-primary/10" aria-label="Remove category filter">
              <Icon name="mdi:close" class="w-4 h-4" />
            </button>
          </span>
          <span v-if="filters.location" class="pl-3 pr-1 h-8 rounded-sm border border-primary/30 bg-primary/5 text-primary text-sm font-medium flex items-center gap-1">
            Location: {{ filters.location }}
            <button @click="clearLocation" class="p-1 rounded-sm hover:bg-primary/10" aria-label="Remove location filter">
              <Icon name="mdi:close" class="w-4 h-4" />
            </button>
          </span>
          <span v-if="filters.year" class="pl-3 pr-1 h-8 rounded-sm border border-primary/30 bg-primary/5 text-primary text-sm font-medium flex items-center gap-1">
            Year: {{ filters.year }}
            <button @click="clearYear" class="p-1 rounded-sm hover:bg-primary/10" aria-label="Remove year filter">
              <Icon name="mdi:close" class="w-4 h-4" />
            </button>
          </span>
        </div>

        <!-- Result count -->
        <p class="eyebrow text-neutral-600">
          <span aria-live="polite">{{ filteredProjects.length }} project{{ filteredProjects.length !== 1 ? 's' : '' }}</span>
          <span v-if="totalPages > 1"> · Page {{ currentPage }} of {{ totalPages }}</span>
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="pending" :class="[
        'grid',
        viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'grid-cols-1 gap-6'
      ]" aria-hidden="true">
        <ProjectCardSkeleton v-for="i in 6" :key="`skeleton-${i}`" />
      </div>

      <!-- Projects Grid -->
      <div ref="projectsContainer" v-else-if="paginatedProjects.length > 0" id="projects-grid" :class="[
        'grid scroll-mt-24 transition-all duration-300',
        viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'grid-cols-1 gap-6'
      ]">
        <ProjectCard
          v-for="(project, index) in paginatedProjects"
          :key="project.slug"
          :title="project.title"
          :slug="project.slug"
          :description="project.description"
          :image="project.image"
          :category="project.category"
          :location="project.location"
          :year="project.year"
          :view-mode="viewMode"
          :priority="index === 0"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <Icon name="mdi:folder-open-outline" class="w-16 h-16 text-neutral-300 mx-auto mb-4" />
        <p class="text-xl text-neutral-500">No projects found in this category.</p>
      </div>

      <!-- Pagination -->
      <nav v-if="totalPages > 1" class="mt-12 flex flex-wrap items-center justify-center gap-2" aria-label="Projects pagination">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="btn-outline px-4 disabled:border-neutral-300 disabled:text-neutral-500 disabled:hover:bg-white disabled:hover:text-neutral-500"
          aria-label="Previous page"
        >
          <Icon name="mdi:chevron-left" class="w-5 h-5" />
          Previous
        </button>

        <template v-for="page in visiblePages" :key="page">
          <span v-if="page === '...'" class="px-2 text-neutral-500">...</span>
          <button
            v-else
            @click="goToPage(page as number)"
            :class="[currentPage === page ? 'btn-primary' : 'btn-outline', 'w-11 px-0']"
            :aria-label="`Page ${page}`"
            :aria-current="currentPage === page ? 'page' : undefined"
          >
            {{ page }}
          </button>
        </template>

        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="btn-outline px-4 disabled:border-neutral-300 disabled:text-neutral-500 disabled:hover:bg-white disabled:hover:text-neutral-500"
          aria-label="Next page"
        >
          Next
          <Icon name="mdi:chevron-right" class="w-5 h-5" />
        </button>
      </nav>
    </AppSection>

    <!-- CTA Section -->
    <CtaBlock
      headline="Start Your Project Today"
      subheadline="Let's add your project to our portfolio of successful engineering solutions"
    />
  </div>
</template>

<script setup lang="ts">
import { useFilterTransition } from '~/composables/useFilterTransition'
import { PROJECTS_PAGE_QUERY, projectCategories } from '~/utils/projects'

// Route meta for screen reader announcements
definePageMeta({
  title: 'Projects'
})

// FLIP animation for filter transitions
const { containerRef: projectsContainer, animateFilter } = useFilterTransition()

// SEO Meta Tags
usePageMeta({
  title: 'Projects',
  description: 'Browse VP Associates\' portfolio of structural engineering projects across Tampa Bay including commercial, industrial and bridge projects.',
  keywords: 'structural engineering portfolio, engineering projects, Tampa Bay projects, commercial engineering, industrial structures, bridge engineering',
  ogImage: 'https://vp-associates.com/images/og-projects.jpg',
})

const route = useRoute()

// Fetch projects from WordPress API
const { data: projectsResponse, pending } = await useFetch('/api/projects', {
  query: {
    ...PROJECTS_PAGE_QUERY,
    _nocache: route.query.nocache ? '1' : undefined
  }
})

const projectsData = computed(() => {
  const response = projectsResponse.value as any
  return response?.data || []
})

interface Category {
  id: string
  name: string
}

interface Project {
  title: string
  slug: string
  description: string
  category: string
  location: string
  year: number
  image?: string
}

interface Filters {
  category: string
  location: string
  year: string
  sort: 'newest' | 'oldest' | 'az' | 'za'
}


// Transform WordPress API data to Project interface
const projects = computed<Project[]>(() => {
  if (!projectsData.value || !Array.isArray(projectsData.value)) {
    console.warn('[Projects Page] No projects data found, projectsData:', projectsData.value)
    return []
  }

  return projectsData.value.map((p: any) => {
    // Get title from rendered or raw, decode HTML entities
    const title = decodeHtmlEntities(p.title?.rendered || p.title) || 'Project'
    // Get excerpt, strip HTML, and decode HTML entities
    const description = decodeHtmlEntities(p.excerpt?.rendered?.replace(/<[^>]*>/g, '')) || ''
    // Get custom fields
    const customFields = p.custom_fields || {}
    const category = decodeHtmlEntities(customFields.project_category) || ''

    // Get featured image from WordPress media
    const featuredMedia = p._embedded?.['wp:featuredmedia']?.[0]
    const featuredUrl = featuredMedia?.source_url ||
                        featuredMedia?.media_details?.sizes?.large?.source_url ||
                        featuredMedia?.media_details?.sizes?.medium?.source_url ||
                        featuredMedia?.media_details?.sizes?.full?.source_url ||
                        ''
    const featuredIsImage = featuredUrl && !featuredUrl.toLowerCase().endsWith('.pdf')

    // PDF preview thumbnails come from project_pdfs_resolved (featured media is the PDF itself and _embed of it is forbidden)
    const pdfPreview = p.project_pdfs_resolved?.[0]?.thumbnail
    let imageUrl = pdfPreview || (featuredIsImage ? featuredUrl : '')

    // If no featured image, use category-based fallback image
    if (!imageUrl) {
      const categoryLower = category.toLowerCase()
      const titleLower = title.toLowerCase()

      if (categoryLower.includes('marine') || titleLower.includes('marine')) {
        imageUrl = '/images/hero/crane-building-1920w.jpg'
      } else if (categoryLower.includes('commercial') || titleLower.includes('commercial')) {
        imageUrl = '/images/hero/construction-steel-beams-1920w.jpg'
      } else if (categoryLower.includes('residential') || titleLower.includes('residential')) {
        imageUrl = '/images/hero/construction-building-frame-1920w.jpg'
      } else if (categoryLower.includes('industrial') || titleLower.includes('industrial')) {
        imageUrl = '/images/hero/construction-steel-beams-1920w.jpg'
      } else if (categoryLower.includes('institutional')) {
        imageUrl = '/images/hero/construction-concrete-1920w.jpg'
      } else {
        imageUrl = '/images/hero/construction-structural-1920w.jpg'
      }
    }

    return {
      title,
      slug: p.slug || '',
      description,
      category,
      location: decodeHtmlEntities(customFields.project_location) || '',
      year: parseInt(customFields.project_year || '0'),
      image: imageUrl,
    }
  })
})

// Initialize filters from URL query params
const filters = reactive<Filters>({
  category: (route.query.category as string) || 'all',
  location: (route.query.location as string) || '',
  year: (route.query.year as string) || '',
  sort: (route.query.sort as Filters['sort']) || 'newest',
})

// View mode state (grid or list)
type ViewMode = 'grid' | 'list'
const viewMode = ref<ViewMode>((route.query.view as ViewMode) === 'list' ? 'list' : 'grid')

// Pagination state
const itemsPerPage = 9
const currentPage = ref(Number(route.query.page) || 1)

// Category chips come from the projects themselves, so they always match the
// WordPress taxonomy and never offer a category with nothing in it.
const categories = computed<Category[]>(() => projectCategories(projects.value))

// Get unique locations for filter dropdown
const uniqueLocations = computed(() => {
  const locations = new Set<string>(projects.value.map(p => p.location))
  return Array.from(locations).sort()
})

// Get unique years for filter dropdown (descending)
const uniqueYears = computed(() => {
  const years = new Set<string>(projects.value.map(p => p.year.toString()))
  return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a))
})

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return filters.category !== 'all' || filters.location !== '' || filters.year !== ''
})

// Get category name by ID
function getCategoryName(id: string): string {
  const category = categories.value.find(c => c.id === id)
  return category?.name || id
}

// Set category and update URL
function setCategory(categoryId: string) {
  filters.category = categoryId
  currentPage.value = 1 // Reset to page 1 when category changes
  updateFilters()
}

// Set location and update URL (resets page)
function setLocation() {
  currentPage.value = 1
  updateFilters()
}

// Clear location filter
function clearLocation() {
  filters.location = ''
  currentPage.value = 1
  updateFilters()
}

// Set year and update URL (resets page)
function setYear() {
  currentPage.value = 1
  updateFilters()
}

// Clear year filter
function clearYear() {
  filters.year = ''
  currentPage.value = 1
  updateFilters()
}

// Set sort and update URL (resets page)
function setSort() {
  currentPage.value = 1
  updateFilters()
}

// Set view mode and update URL
function setViewMode(mode: ViewMode) {
  if (viewMode.value === mode) return // Skip if already set
  viewMode.value = mode

  const query: Record<string, string | undefined> = {}
  if (filters.category !== 'all') query.category = filters.category
  if (filters.location) query.location = filters.location
  if (filters.year) query.year = filters.year
  if (filters.sort !== 'newest') query.sort = filters.sort
  if (mode === 'list') query.view = 'list'
  if (currentPage.value > 1) query.page = currentPage.value.toString()

  // Only navigate if query would actually change
  const hasQueryChanged = JSON.stringify(route.query) !== JSON.stringify(query)
  if (hasQueryChanged) {
    navigateTo({ query }, { replace: true })
  }
}

// Update URL with current filter state
function updateFilters() {
  const query: Record<string, string | undefined> = {}

  if (filters.category !== 'all') query.category = filters.category
  if (filters.location) query.location = filters.location
  if (filters.year) query.year = filters.year
  if (filters.sort !== 'newest') query.sort = filters.sort
  if (currentPage.value > 1) query.page = currentPage.value.toString()

  // Only navigate if query would actually change
  const hasQueryChanged = JSON.stringify(route.query) !== JSON.stringify(query)
  if (hasQueryChanged) {
    navigateTo({ query }, { replace: true })
  }
}

// Clear all filters
function clearFilters() {
  filters.category = 'all'
  filters.location = ''
  filters.year = ''
  filters.sort = 'newest'
  currentPage.value = 1 // Reset to page 1 when clearing filters
  updateFilters()
}

// Sort function
function sortProjects(projectsList: Project[]): Project[] {
  const sorted = [...projectsList]

  switch (filters.sort) {
    case 'newest':
      return sorted.sort((a, b) => b.year - a.year)
    case 'oldest':
      return sorted.sort((a, b) => a.year - b.year)
    case 'az':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    case 'za':
      return sorted.sort((a, b) => b.title.localeCompare(a.title))
    default:
      return sorted
  }
}

// Filter and sort projects
const filteredProjects = computed(() => {
  let results = projects.value || []

  // Filter by category
  if (filters.category !== 'all') {
    results = results.filter((p: Project) => p.category === filters.category)
  }

  // Filter by location
  if (filters.location) {
    results = results.filter((p: Project) => p.location === filters.location)
  }

  // Filter by year
  if (filters.year) {
    results = results.filter((p: Project) => p.year.toString() === filters.year)
  }

  // Sort the results
  return sortProjects(results)
})

// Paginated projects
const paginatedProjects = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredProjects.value.slice(start, end)
})

// Trigger FLIP animation when paginated projects change
watch(paginatedProjects, async (newProjects) => {
  await animateFilter(newProjects)
})

// Total pages
const totalPages = computed(() => Math.ceil(filteredProjects.value.length / itemsPerPage))

// Visible page numbers (with ellipsis for large page counts)
const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const maxVisible = 5

  if (totalPages.value <= maxVisible) {
    // Show all pages if 5 or fewer
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)

    if (currentPage.value <= 3) {
      // Near start: 1, 2, 3, 4, ..., last
      for (let i = 2; i <= 4; i++) pages.push(i)
      pages.push('...')
      pages.push(totalPages.value)
    } else if (currentPage.value >= totalPages.value - 2) {
      // Near end: 1, ..., last-3, last-2, last-1, last
      pages.push('...')
      for (let i = totalPages.value - 3; i <= totalPages.value; i++) pages.push(i)
    } else {
      // Middle: 1, ..., current-1, current, current+1, ..., last
      pages.push('...')
      pages.push(currentPage.value - 1)
      pages.push(currentPage.value)
      pages.push(currentPage.value + 1)
      pages.push('...')
      pages.push(totalPages.value)
    }
  }

  return pages
})

// Navigate to specific page
function goToPage(page: number) {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return
  currentPage.value = page

  // Update URL with new page
  const query: Record<string, string | undefined> = {}
  if (filters.category !== 'all') query.category = filters.category
  if (filters.location) query.location = filters.location
  if (filters.year) query.year = filters.year
  if (filters.sort !== 'newest') query.sort = filters.sort
  if (viewMode.value === 'list') query.view = 'list'
  if (page > 1) query.page = page.toString()

  // Only navigate if query would actually change
  const hasQueryChanged = JSON.stringify(route.query) !== JSON.stringify(query)
  if (hasQueryChanged) {
    navigateTo({ query }, { replace: true })
  }

  // Scroll to top of projects grid
  nextTick(() => {
    const element = document.getElementById('projects-grid')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}

// Watch for route query changes to sync currentPage
watch(() => route.query.page, (newPage) => {
  const page = Number(newPage) || 1
  if (page !== currentPage.value) {
    currentPage.value = page
  }
})

// ItemList Schema for projects listing (must be after projects is defined)
useJsonld({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'VP Associates Structural Engineering Projects',
  description: 'Portfolio of successful engineering projects',
  itemListElement: filteredProjects.value.map((project, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: project.title,
    description: project.description,
    url: `https://vp-associates.com/projects/${project.slug}`,
  })),
})
</script>
