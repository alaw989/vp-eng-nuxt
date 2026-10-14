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

      <!-- Search box: results appear below as you type, and Enter searches at once -->
      <form role="search" class="max-w-2xl mx-auto mb-12" @submit.prevent="submitSearch">
        <div class="relative">
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="search"
            enterkeyhint="search"
            placeholder="Search for services, projects, or pages..."
            class="w-full px-6 py-4 pl-14 text-lg rounded-sm border-2 border-neutral-200 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all"
            @input="onSearchInput"
            aria-label="Search query"
          />
          <Icon name="mdi:magnify" class="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-400" aria-hidden="true" />
          <button
            v-if="searchQuery"
            type="button"
            @click="clearSearch"
            class="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors rounded-sm p-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Clear search"
          >
            <Icon name="mdi:close-circle" class="w-5 h-5" />
          </button>
        </div>
      </form>

      <!-- Filters -->
      <div v-if="submittedQuery && !searchError" class="max-w-2xl mx-auto mb-8">
        <div class="flex flex-wrap items-center gap-3">
          <span class="text-sm font-semibold text-neutral-700">Filters:</span>

          <!-- Type Filter -->
          <div class="relative">
            <select
              v-model="filterType"
              class="appearance-none px-4 py-2 pr-10 bg-white border border-neutral-200 rounded-sm text-sm text-neutral-700 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
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
              class="appearance-none px-4 py-2 pr-10 bg-white border border-neutral-200 rounded-sm text-sm text-neutral-700 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
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
            class="px-3 py-2 text-sm text-primary hover:text-primary-dark hover:bg-primary/5 rounded-sm transition-colors flex items-center gap-1"
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
            <button @click="filterType = ''" class="hover:text-primary-dark" aria-label="Remove type filter">
              <Icon name="mdi:close-circle" class="w-4 h-4" />
            </button>
          </span>
          <span
            v-if="filterCategory"
            class="inline-flex items-center gap-1 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm"
          >
            Category: {{ filterCategory }}
            <button @click="filterCategory = ''" class="hover:text-secondary-dark" aria-label="Remove category filter">
              <Icon name="mdi:close-circle" class="w-4 h-4" />
            </button>
          </span>
        </div>
      </div>

      <!-- Error State: the index failed to load -->
      <div v-if="submittedQuery && searchError" class="text-center py-12">
        <Icon name="mdi:alert-circle-outline" class="w-16 h-16 text-alert mx-auto mb-4" />
        <h2 class="text-2xl font-bold text-neutral-900 mb-2">Search Error</h2>
        <p class="text-neutral-600 mb-6">{{ searchError }}</p>
        <div class="flex flex-wrap justify-center gap-3">
          <NuxtLink to="/services" class="px-4 py-2 bg-primary text-white rounded-sm hover:bg-primary-dark transition-colors">
            Browse Services
          </NuxtLink>
          <NuxtLink to="/projects" class="px-4 py-2 border-2 border-primary text-primary rounded-sm hover:bg-primary hover:text-white transition-colors">
            Browse Projects
          </NuxtLink>
        </div>
      </div>

      <!-- Results -->
      <div v-else-if="submittedQuery">
        <!-- No Results -->
        <div v-if="totalResults === 0" class="text-center py-12">
          <Icon name="mdi:file-search-outline" class="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h2 class="text-2xl font-bold text-neutral-900 mb-2">No results found</h2>
          <p class="text-neutral-600 mb-6">
            Try searching for different keywords or browse our sections below
          </p>
          <div class="flex flex-wrap justify-center gap-3">
            <NuxtLink to="/services" class="px-4 py-2 bg-primary text-white rounded-sm hover:bg-primary-dark transition-colors">
              Browse Services
            </NuxtLink>
            <NuxtLink to="/projects" class="px-4 py-2 border-2 border-primary text-primary rounded-sm hover:bg-primary hover:text-white transition-colors">
              Browse Projects
            </NuxtLink>
          </div>
        </div>

        <!-- Results Found -->
        <div v-else>
          <div class="mb-6">
            <p class="text-neutral-600" role="status" aria-live="polite">
              Found <span class="font-semibold text-neutral-900">{{ totalResults }}</span> result{{ totalResults !== 1 ? 's' : '' }}
              for "<span class="font-semibold">{{ submittedQuery }}</span>"
            </p>
          </div>

          <!-- All Results (grouped by type) -->
          <div>
            <!-- Pages Results -->
            <div v-if="resultsOfType('page').length > 0" class="mb-10">
              <h2 class="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Icon name="mdi:page-layout-header" class="w-5 h-5 text-primary" />
                Pages ({{ resultsOfType('page').length }})
              </h2>
              <div class="space-y-3">
                <NuxtLink
                  v-for="item in resultsOfType('page')"
                  :key="`${item.type}-${item.slug}`"
                  :to="item.url"
                  class="block p-4 rounded-sm border border-neutral-200 hover:border-primary hover:bg-primary/5 transition-all group focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
            <div v-if="resultsOfType('service').length > 0" class="mb-10">
              <h2 class="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Icon name="mdi:cogs" class="w-5 h-5 text-primary" />
                Services ({{ resultsOfType('service').length }})
              </h2>
              <div class="grid md:grid-cols-2 gap-3">
                <NuxtLink
                  v-for="item in resultsOfType('service')"
                  :key="`${item.type}-${item.slug}`"
                  :to="item.url"
                  class="p-4 rounded-sm border border-neutral-200 hover:border-primary hover:bg-primary/5 transition-all group focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
            <div v-if="resultsOfType('project').length > 0" class="mb-10">
              <h2 class="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Icon name="mdi:folder-multiple" class="w-5 h-5 text-primary" />
                Projects ({{ resultsOfType('project').length }})
              </h2>
              <div class="grid md:grid-cols-2 gap-3">
                <NuxtLink
                  v-for="item in resultsOfType('project')"
                  :key="`${item.type}-${item.slug}`"
                  :to="item.url"
                  class="p-4 rounded-sm border border-neutral-200 hover:border-secondary hover:bg-secondary/5 transition-all group focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
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
              class="px-4 py-2 bg-white border border-neutral-200 rounded-sm text-neutral-700 hover:border-primary hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
import { searchItems, type SearchItem, type SearchType } from '~/utils/search'

// SEO Meta Tags
usePageMeta({
  title: 'Search',
  titleSuffix: false,
  description: 'Search VP Associates website for services, projects, and information.',
  robots: 'noindex, follow',
})

const route = useRoute()
const router = useRouter()

// Production is static, so there is no search endpoint. The index is built
// from WordPress when the site is generated, saved in this page's payload,
// and searched in the browser (utils/search.ts).
const { data: searchIndex, error: indexError } = await useFetch<SearchItem[]>('/api/search-index')

// State: what's in the box, and the query the results below are for
const searchQuery = ref('')
const submittedQuery = ref('')
const filterType = ref<'' | SearchType>('')
const filterCategory = ref('')

// Refs
const searchInput = ref<HTMLInputElement | null>(null)

// Results follow typing after a short pause
let searchDebounce: ReturnType<typeof setTimeout> | null = null

// Popular search terms
const popularSearches = [
  'structural steel',
  'concrete design',
  'foundation',
  'seawall',
  'marine',
  'commercial',
]

const searchError = computed(() =>
  indexError.value || !searchIndex.value?.length ? 'Search is unavailable right now. Please browse our services and projects instead.' : ''
)

const searchResults = computed(() => searchItems(searchIndex.value || [], submittedQuery.value))

// Project categories among the results, for the category filter
const availableCategories = computed(() =>
  [...new Set(searchResults.value.map(item => item.category).filter((c): c is string => !!c))].sort()
)

// Results after the type and category filters
const filteredResults = computed(() => searchResults.value.filter(item =>
  (!filterType.value || item.type === filterType.value)
  && (!filterCategory.value || item.category === filterCategory.value)
))

const totalResults = computed(() => filteredResults.value.length)

function resultsOfType(type: SearchType): SearchItem[] {
  return filteredResults.value.filter(item => item.type === type)
}

// Show results for the box's query and keep it in the URL, so a result's
// Back button returns here and a search can be linked as /search?q=...
function submitSearch() {
  if (searchDebounce) clearTimeout(searchDebounce)
  const query = searchQuery.value.trim()
  if (query !== submittedQuery.value) clearFilters()
  submittedQuery.value = query
  if ((route.query.q || '') !== query) {
    router.replace({ query: query ? { q: query } : {} })
  }
}

function onSearchInput() {
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(submitSearch, 250)
}

function searchWithTerm(term: string) {
  searchQuery.value = term
  submitSearch()
}

function clearFilters() {
  filterType.value = ''
  filterCategory.value = ''
}

function clearSearch() {
  searchQuery.value = ''
  submitSearch()
  searchInput.value?.focus()
}

// The prerendered page has no query, so ?q= is read after hydration
function syncFromUrl() {
  const query = typeof route.query.q === 'string' ? route.query.q.trim() : ''
  if (query === submittedQuery.value) return
  searchQuery.value = query
  submittedQuery.value = query
  clearFilters()
}

onMounted(syncFromUrl)
// The header's search link (/search) clears a search in progress
watch(() => route.query.q, syncFromUrl)

onUnmounted(() => {
  if (searchDebounce) clearTimeout(searchDebounce)
})
</script>
