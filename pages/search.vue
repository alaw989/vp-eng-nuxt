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

      <!-- Search Box with Autocomplete -->
      <div class="max-w-2xl mx-auto mb-12 relative">
        <div class="relative">
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="search"
            placeholder="Search for services, projects, or pages..."
            class="w-full px-6 py-4 pl-14 text-lg rounded-xl border-2 border-neutral-200 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all"
            @input="onSearchInput"
            @keydown.down.prevent="navigateAutocomplete('down')"
            @keydown.up.prevent="navigateAutocomplete('up')"
            @keydown.enter.prevent="selectAutocompleteItem()"
            @keydown.escape="closeAutocomplete"
            @focus="showAutocomplete && autocompleteSuggestions.length > 0"
            aria-label="Search query"
            aria-autocomplete="list"
            :aria-expanded="showAutocomplete && autocompleteSuggestions.length > 0"
            :aria-owns="showAutocomplete ? 'autocomplete-list' : undefined"
            :aria-activedescendant="focusedIndex >= 0 ? `autocomplete-item-${focusedIndex}` : undefined"
          />
          <Icon name="mdi:magnify" class="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-400" />
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors rounded-lg p-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Clear search"
          >
            <Icon name="mdi:close-circle" class="w-5 h-5" />
          </button>
        </div>

        <!-- Autocomplete Dropdown -->
        <div
          v-if="showAutocomplete && autocompleteSuggestions.length > 0"
          class="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden z-50"
          role="listbox"
          id="autocomplete-list"
        >
          <div
            v-for="(item, index) in autocompleteSuggestions.slice(0, 8)"
            :key="`${item.type}-${index}`"
            :id="`autocomplete-item-${index}`"
            role="option"
            :aria-selected="focusedIndex === index"
            @click="selectAutocompleteSuggestion(item)"
            @mouseenter="focusedIndex = index"
            :class="[
              'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors',
              focusedIndex === index ? 'bg-primary/10' : 'hover:bg-neutral-50'
            ]"
          >
            <Icon :name="getIconForType(item.type)" class="w-5 h-5 text-primary flex-shrink-0" />
            <div class="flex-1 min-w-0">
              <div class="font-medium text-neutral-900 truncate">{{ item.title }}</div>
              <div class="text-sm text-neutral-500 truncate">{{ getSubtitle(item) }}</div>
            </div>
            <span class="text-xs px-2 py-1 rounded bg-neutral-100 text-neutral-600 capitalize">{{ item.type }}</span>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div v-if="searchQuery" class="max-w-2xl mx-auto mb-8">
        <div class="flex flex-wrap items-center gap-3">
          <span class="text-sm font-semibold text-neutral-700">Filters:</span>

          <!-- Type Filter -->
          <div class="relative">
            <select
              v-model="filterType"
              @change="performSearch"
              class="appearance-none px-4 py-2 pr-10 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-700 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
              aria-label="Filter by content type"
            >
              <option value="">All Types</option>
              <option value="page">Pages</option>
              <option value="service">Services</option>
              <option value="project">Projects</option>
            </select>
            <Icon name="mdi:chevron-down" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          </div>

          <!-- Category Filter (for projects) -->
          <div v-if="availableCategories.length > 0" class="relative">
            <select
              v-model="filterCategory"
              @change="performSearch"
              class="appearance-none px-4 py-2 pr-10 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-700 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
              aria-label="Filter by project category"
            >
              <option value="">All Categories</option>
              <option v-for="cat in availableCategories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <Icon name="mdi:chevron-down" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          </div>

          <!-- Clear Filters -->
          <button
            v-if="filterType || filterCategory"
            @click="clearFilters"
            class="px-3 py-2 text-sm text-primary hover:text-primary-dark hover:bg-primary/5 rounded-lg transition-colors flex items-center gap-1"
            aria-label="Clear all filters"
          >
            <Icon name="mdi:close" class="w-4 h-4" />
            Clear filters
          </button>
        </div>

        <!-- Active Filters Display -->
        <div v-if="filterType || filterCategory" class="flex flex-wrap gap-2 mt-3">
          <span
            v-if="filterType"
            class="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
          >
            Type: {{ filterType }}
            <button @click="filterType = ''; performSearch()" class="hover:text-primary-dark" aria-label="Remove type filter">
              <Icon name="mdi:close-circle" class="w-4 h-4" />
            </button>
          </span>
          <span
            v-if="filterCategory"
            class="inline-flex items-center gap-1 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm"
          >
            Category: {{ filterCategory }}
            <button @click="filterCategory = ''; performSearch()" class="hover:text-secondary-dark" aria-label="Remove category filter">
              <Icon name="mdi:close-circle" class="w-4 h-4" />
            </button>
          </span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="py-8">
        <SearchResultSkeleton />
      </div>

      <!-- Error State -->
      <div v-else-if="searchError" class="text-center py-12">
        <Icon name="mdi:alert-circle-outline" class="w-16 h-16 text-secondary mx-auto mb-4" />
        <h2 class="text-2xl font-bold text-neutral-900 mb-2">Search Error</h2>
        <p class="text-neutral-600 mb-6">{{ searchError }}</p>
        <button
          @click="performSearch"
          class="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
        >
          Try Again
        </button>
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
          <div class="mb-6 flex items-center justify-between flex-wrap gap-4">
            <p class="text-neutral-600" role="status" aria-live="polite">
              Found <span class="font-semibold text-neutral-900">{{ totalResults }}</span> result{{ totalResults !== 1 ? 's' : '' }}
              <span v-if="searchQuery">for "<span class="font-semibold">{{ searchQuery }}</span>"</span>
            </p>
            <div class="text-sm text-neutral-500">
              {{ paginatedResults.length }} of {{ totalResults }} shown
            </div>
          </div>

          <!-- All Results (grouped by type) -->
          <div>
            <!-- Pages Results -->
            <div v-if="typeFilteredResults('page').length > 0" class="mb-10">
              <h2 class="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Icon name="mdi:page-layout-header" class="w-5 h-5 text-primary" />
                Pages ({{ typeFilteredResults('page').length }})
              </h2>
              <div class="space-y-3">
                <NuxtLink
                  v-for="item in typeFilteredResults('page')"
                  :key="`${item.type}-${item.slug}`"
                  :to="item.url"
                  class="block p-4 rounded-lg border border-neutral-200 hover:border-primary hover:bg-primary/5 transition-all group focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <div class="flex items-start gap-3">
                    <Icon :name="item.icon || 'mdi:file'" class="w-5 h-5 text-primary mt-0.5" />
                    <div class="flex-1">
                      <h3 class="font-semibold text-neutral-900 group-hover:text-primary">{{ item.title }}</h3>
                      <p class="text-sm text-neutral-600 mt-1">{{ item.description }}</p>
                    </div>
                    <Icon name="mdi:chevron-right" class="w-5 h-5 text-neutral-400 group-hover:text-primary" />
                  </div>
                </NuxtLink>
              </div>
            </div>

            <!-- Services Results -->
            <div v-if="typeFilteredResults('service').length > 0" class="mb-10">
              <h2 class="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Icon name="mdi:cogs" class="w-5 h-5 text-primary" />
                Services ({{ typeFilteredResults('service').length }})
              </h2>
              <div class="grid md:grid-cols-2 gap-3">
                <NuxtLink
                  v-for="item in typeFilteredResults('service')"
                  :key="`${item.type}-${item.slug}`"
                  :to="item.url"
                  class="p-4 rounded-lg border border-neutral-200 hover:border-primary hover:bg-primary/5 transition-all group focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <div class="flex items-start gap-3">
                    <Icon :name="item.icon || 'mdi:cog'" class="w-5 h-5 text-primary mt-0.5" />
                    <div class="flex-1">
                      <h3 class="font-semibold text-neutral-900 group-hover:text-primary">{{ item.title }}</h3>
                      <p class="text-sm text-neutral-600 mt-1 line-clamp-2">{{ item.description }}</p>
                    </div>
                    <Icon name="mdi:chevron-right" class="w-5 h-5 text-neutral-400 group-hover:text-primary" />
                  </div>
                </NuxtLink>
              </div>
            </div>

            <!-- Projects Results -->
            <div v-if="typeFilteredResults('project').length > 0" class="mb-10">
              <h2 class="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Icon name="mdi:folder-multiple" class="w-5 h-5 text-primary" />
                Projects ({{ typeFilteredResults('project').length }})
              </h2>
              <div class="grid md:grid-cols-2 gap-3">
                <NuxtLink
                  v-for="item in typeFilteredResults('project')"
                  :key="`${item.type}-${item.slug}`"
                  :to="item.url"
                  class="p-4 rounded-lg border border-neutral-200 hover:border-secondary hover:bg-secondary/5 transition-all group focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
                >
                  <div class="flex items-start gap-3">
                    <Icon name="mdi:office-building" class="w-5 h-5 text-secondary mt-0.5" />
                    <div class="flex-1">
                      <h3 class="font-semibold text-neutral-900 group-hover:text-secondary">{{ item.title }}</h3>
                      <p class="text-sm text-neutral-600 mt-1 line-clamp-2">{{ item.description }}</p>
                      <div class="flex items-center gap-3 mt-2 text-xs text-neutral-500">
                        <span v-if="item.location" class="flex items-center gap-1">
                          <Icon name="mdi:map-marker" class="w-3 h-3" />
                          {{ item.location }}
                        </span>
                        <span v-if="item.category" class="flex items-center gap-1">
                          <Icon name="mdi:tag" class="w-3 h-3" />
                          {{ item.category }}
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
              @click="searchWithTerm(term)"
              class="px-4 py-2 bg-white border border-neutral-200 rounded-lg text-neutral-700 hover:border-primary hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
usePageMeta({
  title: 'Search',
  titleSuffix: false,
  description: 'Search VP Associates website for services, projects, and information.',
  robots: 'noindex, follow',
})

interface SearchResult {
  type: 'page' | 'service' | 'project'
  title: string
  slug: string
  description: string
  url: string
  icon?: string
  category?: string
  location?: string
}

interface SearchResponse {
  results: SearchResult[]
  total: number
  query: string
  error?: string
}

// State
const searchQuery = ref('')
const loading = ref(false)
const searchError = ref('')
const searchResults = ref<SearchResult[]>([])
const showAutocomplete = ref(false)
const autocompleteSuggestions = ref<SearchResult[]>([])
const focusedIndex = ref(-1)
const filterType = ref('')
const filterCategory = ref('')
const availableCategories = ref<string[]>([])

// Refs
const searchInput = ref<HTMLInputElement | null>(null)

// Debounce timer
let searchDebounce: ReturnType<typeof setTimeout> | null = null
let autocompleteDebounce: ReturnType<typeof setTimeout> | null = null

// Popular search terms
const popularSearches = [
  'structural steel',
  'concrete design',
  'foundation',
  'seawall',
  'marine',
  'commercial',
]

// Computed total results
const totalResults = computed(() => {
  return searchResults.value.length
})

// Paginated results (show first 20)
const paginatedResults = computed(() => {
  return searchResults.value.slice(0, 20)
})

// Get icon for type
function getIconForType(type: string): string {
  const icons: Record<string, string> = {
    page: 'mdi:page-layout-header',
    service: 'mdi:cogs',
    project: 'mdi:office-building',
  }
  return icons[type] || 'mdi:file'
}

// Get subtitle for autocomplete item
function getSubtitle(item: SearchResult): string {
  if (item.location) return item.location
  if (item.category) return item.category
  return item.description?.substring(0, 50) || ''
}

// Strip HTML from text
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

// Search with term
function searchWithTerm(term: string) {
  searchQuery.value = term
  performSearch()
}

// Handle search input with autocomplete
function onSearchInput() {
  // Clear previous debounce
  if (autocompleteDebounce) {
    clearTimeout(autocompleteDebounce)
  }

  const query = searchQuery.value.trim()

  if (!query) {
    closeAutocomplete()
    searchResults.value = []
    return
  }

  // Debounce autocomplete (300ms)
  autocompleteDebounce = setTimeout(() => {
    fetchAutocompleteSuggestions(query)
  }, 300)

  // Perform search with debounce (500ms)
  if (searchDebounce) {
    clearTimeout(searchDebounce)
  }
  searchDebounce = setTimeout(() => {
    performSearch()
  }, 500)
}

// Fetch autocomplete suggestions
async function fetchAutocompleteSuggestions(query: string) {
  try {
    const response = await $fetch<SearchResponse>(`/api/search?q=${encodeURIComponent(query)}`)
    autocompleteSuggestions.value = response.results || []
    showAutocomplete.value = autocompleteSuggestions.value.length > 0
    focusedIndex.value = -1
  } catch (error) {
    console.error('Autocomplete error:', error)
    autocompleteSuggestions.value = []
  }
}

// Navigate autocomplete with keyboard
function navigateAutocomplete(direction: 'up' | 'down') {
  if (!showAutocomplete.value || autocompleteSuggestions.value.length === 0) return

  if (direction === 'down') {
    focusedIndex.value = focusedIndex.value < autocompleteSuggestions.value.length - 1
      ? focusedIndex.value + 1
      : 0
  } else {
    focusedIndex.value = focusedIndex.value > 0
      ? focusedIndex.value - 1
      : autocompleteSuggestions.value.length - 1
  }
}

// Select autocomplete item
function selectAutocompleteItem() {
  const item = autocompleteSuggestions.value[focusedIndex.value]
  if (focusedIndex.value >= 0 && item) {
    selectAutocompleteSuggestion(item)
  }
}

// Select autocomplete suggestion
function selectAutocompleteSuggestion(item: SearchResult) {
  searchQuery.value = item.title
  closeAutocomplete()
  goToResult(item.url)
}

// Close autocomplete
function closeAutocomplete() {
  showAutocomplete.value = false
  autocompleteSuggestions.value = []
  focusedIndex.value = -1
}

// Perform search
async function performSearch() {
  const query = searchQuery.value.trim()

  if (!query) {
    searchResults.value = []
    return
  }

  loading.value = true
  searchError.value = ''
  closeAutocomplete()

  try {
    const response = await $fetch<SearchResponse>(`/api/search?q=${encodeURIComponent(query)}`)

    if (response.error) {
      searchError.value = response.error
      searchResults.value = []
    } else {
      searchResults.value = response.results || []

      // Extract unique categories from project results
      const categories = new Set<string>()
      searchResults.value.forEach(item => {
        if (item.category) categories.add(item.category)
      })
      availableCategories.value = Array.from(categories).sort()
    }
  } catch (error: any) {
    console.error('Search error:', error)
    searchError.value = 'Search temporarily unavailable. Please try again.'
    searchResults.value = []
  } finally {
    loading.value = false
  }
}

// Get filtered results by type
function typeFilteredResults(type: string): SearchResult[] {
  let results = searchResults.value

  // Apply type filter
  if (filterType.value) {
    results = results.filter(item => item.type === filterType.value)
  } else {
    results = results.filter(item => item.type === type)
  }

  // Apply category filter (only affects projects)
  if (filterCategory.value) {
    results = results.filter(item => item.category === filterCategory.value)
  }

  return results
}

// Clear filters
function clearFilters() {
  filterType.value = ''
  filterCategory.value = ''
}

// Clear search
function clearSearch() {
  searchQuery.value = ''
  searchResults.value = []
  searchError.value = ''
  closeAutocomplete()
  clearFilters()
}

// Navigate to URL
function goToResult(url: string) {
  navigateTo(url)
}

// Close autocomplete on click outside
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (searchInput.value && !searchInput.value.contains(e.target as Node)) {
      closeAutocomplete()
    }
  })
})

onUnmounted(() => {
  if (searchDebounce) clearTimeout(searchDebounce)
  if (autocompleteDebounce) clearTimeout(autocompleteDebounce)
})
</script>
