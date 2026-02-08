<template>
  <div>
    <!-- Page Header -->
    <AppSection bg-color="primary-dark" padding="lg">
      <div class="container text-center text-white">
        <h1 class="text-5xl md:text-6xl font-display font-bold mb-6">
          Our Projects
        </h1>
        <p class="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
          A portfolio of successful structural engineering projects across Tampa Bay
        </p>
      </div>
    </AppSection>

    <!-- Filter Section -->
    <AppSection bg-color="neutral-50" padding="md">
      <div class="container">
        <!-- Category Filters -->
        <div class="flex flex-wrap items-center justify-center gap-3 mb-6">
          <button
            v-for="category in categories"
            :key="category.id"
            @click="setCategory(category.id)"
            :class="[
              'px-6 py-2.5 rounded-full font-semibold transition-all duration-300',
              filters.category === category.id
                ? 'bg-primary text-white shadow-lg scale-105'
                : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
            ]"
            :aria-pressed="filters.category === category.id"
          >
            {{ category.name }}
          </button>
        </div>

        <!-- Additional Filters and Sort -->
        <div class="flex flex-col md:flex-row items-center justify-center gap-4 mb-4">
          <!-- Location Filter -->
          <div class="relative w-full md:w-auto">
            <select
              v-model="filters.location"
              @change="setLocation"
              class="w-full md:w-48 px-4 py-2.5 rounded-lg border border-neutral-200 bg-white text-neutral-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
              aria-label="Filter by location"
            >
              <option value="">All Locations</option>
              <option v-for="location in uniqueLocations" :key="location" :value="location">
                {{ location }}
              </option>
            </select>
            <Icon name="mdi:chevron-down" class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
          </div>

          <!-- Year Filter -->
          <div class="relative w-full md:w-auto">
            <select
              v-model="filters.year"
              @change="setYear"
              class="w-full md:w-40 px-4 py-2.5 rounded-lg border border-neutral-200 bg-white text-neutral-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
              aria-label="Filter by year"
            >
              <option value="">All Years</option>
              <option v-for="year in uniqueYears" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
            <Icon name="mdi:chevron-down" class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
          </div>

          <!-- Sort -->
          <div class="relative w-full md:w-auto">
            <select
              v-model="filters.sort"
              @change="setSort"
              class="w-full md:w-48 px-4 py-2.5 rounded-lg border border-neutral-200 bg-white text-neutral-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
              aria-label="Sort projects"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="az">Name (A-Z)</option>
              <option value="za">Name (Z-A)</option>
            </select>
            <Icon name="mdi:chevron-down" class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
          </div>

          <!-- Clear Filters -->
          <button
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="w-full md:w-auto px-4 py-2.5 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <Icon name="mdi:close-circle" class="w-5 h-5" />
            Clear Filters
          </button>
        </div>

        <!-- Active Filters Display -->
        <div v-if="hasActiveFilters" class="flex flex-wrap items-center justify-center gap-2 mb-4">
          <span v-if="filters.category !== 'all'" class="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center gap-1">
            Category: {{ getCategoryName(filters.category) }}
            <button @click="setCategory('all')" class="hover:text-primary-dark" aria-label="Remove category filter">
              <Icon name="mdi:close" class="w-4 h-4" />
            </button>
          </span>
          <span v-if="filters.location" class="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center gap-1">
            Location: {{ filters.location }}
            <button @click="clearLocation" class="hover:text-primary-dark" aria-label="Remove location filter">
              <Icon name="mdi:close" class="w-4 h-4" />
            </button>
          </span>
          <span v-if="filters.year" class="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center gap-1">
            Year: {{ filters.year }}
            <button @click="clearYear" class="hover:text-primary-dark" aria-label="Remove year filter">
              <Icon name="mdi:close" class="w-4 h-4" />
            </button>
          </span>
        </div>

        <!-- Results Count and View Toggle -->
        <div class="flex items-center justify-center gap-4 mb-4">
          <div class="text-neutral-600">
            <span aria-live="polite">{{ filteredProjects.length }} project{{ filteredProjects.length !== 1 ? 's' : '' }}</span>
            <span v-if="totalPages > 1" class="text-neutral-500 ml-2">
              (Page {{ currentPage }} of {{ totalPages }})
            </span>
          </div>
          <!-- View Toggle -->
          <div class="flex items-center gap-1 border border-neutral-200 rounded-lg p-1 bg-white">
            <button
              @click="setViewMode('grid')"
              :class="[
                'p-2 rounded-md transition-all duration-300',
                viewMode === 'grid' ? 'bg-primary text-white' : 'text-neutral-500 hover:bg-neutral-100'
              ]"
              aria-label="Grid view"
              :aria-pressed="viewMode === 'grid'"
            >
              <Icon name="mdi:view-grid" class="w-5 h-5" />
            </button>
            <button
              @click="setViewMode('list')"
              :class="[
                'p-2 rounded-md transition-all duration-300',
                viewMode === 'list' ? 'bg-primary text-white' : 'text-neutral-500 hover:bg-neutral-100'
              ]"
              aria-label="List view"
              :aria-pressed="viewMode === 'list'"
            >
              <Icon name="mdi:view-list" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Pagination Controls -->
        <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mb-6">
          <!-- Previous Button -->
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            :class="[
              'px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-1',
              currentPage === 1
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                : 'bg-white text-neutral-700 border border-neutral-200 hover:border-primary hover:text-primary'
            ]"
            aria-label="Previous page"
          >
            <Icon name="mdi:chevron-left" class="w-5 h-5" />
            Previous
          </button>

          <!-- Page Numbers -->
          <div class="flex items-center gap-1">
            <template v-for="page in visiblePages" :key="page">
              <span v-if="page === '...'" class="px-2 text-neutral-400">...</span>
              <button
                v-else
                @click="goToPage(page as number)"
                :class="[
                  'w-10 h-10 rounded-lg font-semibold transition-all duration-300',
                  currentPage === page
                    ? 'bg-primary text-white'
                    : 'bg-white text-neutral-700 border border-neutral-200 hover:border-primary hover:text-primary'
                ]"
                :aria-label="`Page ${page}`"
                :aria-current="currentPage === page ? 'page' : undefined"
              >
                {{ page }}
              </button>
            </template>
          </div>

          <!-- Next Button -->
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            :class="[
              'px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-1',
              currentPage === totalPages
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                : 'bg-white text-neutral-700 border border-neutral-200 hover:border-primary hover:text-primary'
            ]"
            aria-label="Next page"
          >
            Next
            <Icon name="mdi:chevron-right" class="w-5 h-5" />
          </button>
        </div>
      </div>
    </AppSection>

    <!-- Projects Grid -->
    <AppSection bg-color="white" animate-on-scroll>
      <!-- Loading State -->
      <div v-if="pending" :class="[
        'grid gap-6',
        viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'grid-cols-1 gap-6'
      ]" aria-hidden="true">
        <ProjectCardSkeleton v-for="i in 6" :key="`skeleton-${i}`" />
      </div>

      <!-- Projects Grid -->
      <div v-else-if="paginatedProjects.length > 0" :id="'projects-grid'" :class="[
        'grid gap-6 transition-all duration-300',
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
    </AppSection>

    <!-- Stats Section -->
    <AppSection bg-color="primary" padding="lg">
      <div class="container">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-white text-center">
          <div>
            <div class="text-4xl md:text-5xl font-bold mb-2">500+</div>
            <div class="text-sm opacity-80">Projects Completed</div>
          </div>
          <div>
            <div class="text-4xl md:text-5xl font-bold mb-2">30+</div>
            <div class="text-sm opacity-80">Years Experience</div>
          </div>
          <div>
            <div class="text-4xl md:text-5xl font-bold mb-2">100%</div>
            <div class="text-sm opacity-80">Code Compliant</div>
          </div>
          <div>
            <div class="text-4xl md:text-5xl font-bold mb-2">10</div>
            <div class="text-sm opacity-80">Florida Counties</div>
          </div>
        </div>
      </div>
    </AppSection>

    <!-- Featured Projects Highlights -->
    <AppSection bg-color="white" animate-on-scroll>
      <div class="text-center mb-16">
        <h2 class="text-4xl font-display font-bold text-neutral-900 mb-4">
          Featured Projects
        </h2>
        <p class="text-xl text-neutral-600 max-w-3xl mx-auto">
          Some of our most notable and challenging engineering achievements
        </p>
      </div>

      <div class="grid md:grid-cols-2 gap-8 mb-12">
        <div class="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-gradient-to-br from-primary/20 to-primary-dark/20">
          <div class="absolute inset-0 flex items-center justify-center">
            <Icon name="mdi:office-building" class="w-24 h-24 text-primary/40" />
          </div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-8">
            <div class="text-white">
              <div class="text-secondary font-semibold mb-2">Commercial</div>
              <h3 class="text-2xl font-bold mb-2">Tampa Marina Complex</h3>
              <p class="text-white/80 text-sm mb-4">Complete structural design for a 50-slip marina with restaurant and retail spaces</p>
              <div class="flex items-center gap-4 text-sm text-white/70">
                <span class="flex items-center gap-1">
                  <Icon name="mdi:map-marker" class="w-4 h-4" />
                  Tampa, FL
                </span>
                <span class="flex items-center gap-1">
                  <Icon name="mdi:calendar" class="w-4 h-4" />
                  2024
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-gradient-to-br from-secondary/20 to-secondary-dark/20">
          <div class="absolute inset-0 flex items-center justify-center">
            <Icon name="mdi:waves" class="w-24 h-24 text-secondary/40" />
          </div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-8">
            <div class="text-white">
              <div class="text-secondary font-semibold mb-2">Marine</div>
              <h3 class="text-2xl font-bold mb-2">Coastal Seawall System</h3>
              <p class="text-white/80 text-sm mb-4">Engineered seawall protection system for luxury waterfront property</p>
              <div class="flex items-center gap-4 text-sm text-white/70">
                <span class="flex items-center gap-1">
                  <Icon name="mdi:map-marker" class="w-4 h-4" />
                  Clearwater, FL
                </span>
                <span class="flex items-center gap-1">
                  <Icon name="mdi:calendar" class="w-4 h-4" />
                  2024
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppSection>

    <!-- CTA Section -->
    <AppSection bg-color="primary-dark" padding="xl">
      <div class="container text-center text-white">
        <h2 class="text-4xl font-display font-bold mb-6">
          Start Your Project Today
        </h2>
        <p class="text-xl mb-8 max-w-2xl mx-auto opacity-90">
          Let's add your project to our portfolio of successful engineering solutions
        </p>
        <NuxtLink
          to="/contact"
          class="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-lg font-semibold hover:bg-neutral-100 hover:-translate-y-0.5 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Contact Us
          <Icon name="mdi:arrow-right" class="w-5 h-5" />
        </NuxtLink>
      </div>
    </AppSection>
  </div>
</template>

<script setup lang="ts">
// SEO Meta Tags
usePageMeta({
  title: 'Projects',
  description: 'Browse VP Associates\' portfolio of structural engineering projects across Tampa Bay including commercial, marine, residential, and industrial projects.',
  keywords: 'structural engineering portfolio, engineering projects, Tampa Bay projects, commercial engineering, marine structures',
  ogImage: 'https://vp-associates.com/images/og-projects.jpg',
})

const route = useRoute()

// Simulate initial loading state for skeleton display
const pending = ref(true)
onMounted(() => {
  // Simulate data fetching delay to show skeleton
  setTimeout(() => {
    pending.value = false
  }, 800)
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

const categories: Category[] = [
  { id: 'all', name: 'All Projects' },
  { id: 'Commercial', name: 'Commercial' },
  { id: 'Marine', name: 'Marine' },
  { id: 'Residential', name: 'Residential' },
  { id: 'Industrial', name: 'Industrial' },
  { id: 'Institutional', name: 'Institutional' }
]

const projects: Project[] = [
  {
    title: 'Tampa Marina Complex',
    slug: 'tampa-marina-complex',
    description: 'Complete structural design for a 50-slip marina with restaurant and retail spaces',
    category: 'Marine',
    location: 'Tampa, FL',
    year: 2024,
    image: '/images/project-1.jpg'
  },
  {
    title: 'Downtown Office Tower',
    slug: 'downtown-office-tower',
    description: 'Structural steel design for 12-story commercial office building',
    category: 'Commercial',
    location: 'Tampa, FL',
    year: 2023,
    image: '/images/project-2.jpg'
  },
  {
    title: 'Coastal Seawall System',
    slug: 'coastal-seawall-system',
    description: 'Engineered seawall protection system for luxury waterfront property',
    category: 'Marine',
    location: 'Clearwater, FL',
    year: 2024,
    image: '/images/project-3.jpg'
  },
  {
    title: 'Luxury Residential Estate',
    slug: 'luxury-residential-estate',
    description: 'Complete structural design for 8,000 sq ft waterfront residence with pool',
    category: 'Residential',
    location: 'St. Petersburg, FL',
    year: 2024,
    image: '/images/project-4.jpg'
  },
  {
    title: 'Industrial Warehouse Complex',
    slug: 'industrial-warehouse-complex',
    description: 'Pre-engineered metal building structure with 40,000 sq ft warehouse',
    category: 'Industrial',
    location: 'Brandon, FL',
    year: 2023,
    image: '/images/project-5.jpg'
  },
  {
    title: 'School Classroom Wing',
    slug: 'school-classroom-wing',
    description: 'Masonry and steel design for new 2-story classroom addition',
    category: 'Institutional',
    location: 'Lakeland, FL',
    year: 2023
  },
  {
    title: 'Waterfront Restaurant',
    slug: 'waterfront-restaurant',
    description: 'Structural design for elevated restaurant with deck over water',
    category: 'Commercial',
    location: 'Tampa, FL',
    year: 2024
  },
  {
    title: 'Boat Storage Facility',
    slug: 'boat-storage-facility',
    description: 'Pre-engineered metal building for dry stack boat storage',
    category: 'Marine',
    location: 'Clearwater, FL',
    year: 2023
  },
  {
    title: 'Multi-Family Housing',
    slug: 'multi-family-housing',
    description: 'Structural design for 4-story wood frame apartment complex',
    category: 'Residential',
    location: 'Tampa, FL',
    year: 2023
  },
  {
    title: 'Manufacturing Plant Addition',
    slug: 'manufacturing-plant-addition',
    description: 'Steel frame expansion for heavy manufacturing facility',
    category: 'Industrial',
    location: 'Sarasota, FL',
    year: 2024
  },
  {
    title: 'Community Center',
    slug: 'community-center',
    description: 'Masonry and steel design for 15,000 sq ft community facility',
    category: 'Institutional',
    location: 'Bradenton, FL',
    year: 2023
  },
  {
    title: 'Retail Shopping Center',
    slug: 'retail-shopping-center',
    description: 'Structural design for strip mall with 6 retail spaces',
    category: 'Commercial',
    location: 'Brandon, FL',
    year: 2024
  }
]

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

// Get unique locations for filter dropdown
const uniqueLocations = computed(() => {
  const locations = new Set(projects.map(p => p.location))
  return Array.from(locations).sort()
})

// Get unique years for filter dropdown (descending)
const uniqueYears = computed(() => {
  const years = new Set(projects.map(p => p.year.toString()))
  return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a))
})

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return filters.category !== 'all' || filters.location !== '' || filters.year !== ''
})

// Get category name by ID
function getCategoryName(id: string): string {
  const category = categories.find(c => c.id === id)
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
  let results = projects

  // Filter by category
  if (filters.category !== 'all') {
    results = results.filter(p => p.category === filters.category)
  }

  // Filter by location
  if (filters.location) {
    results = results.filter(p => p.location === filters.location)
  }

  // Filter by year
  if (filters.year) {
    results = results.filter(p => p.year.toString() === filters.year)
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
