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
        <div class="flex flex-wrap items-center justify-center gap-3">
          <button
            v-for="category in categories"
            :key="category.id"
            @click="selectedCategory = category.id"
            :class="[
              'px-6 py-2.5 rounded-full font-semibold transition-all duration-300',
              selectedCategory === category.id
                ? 'bg-primary text-white shadow-lg scale-105'
                : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
            ]"
          >
            {{ category.name }}
          </button>
        </div>
        <div class="text-center mt-4 text-neutral-600">
          <span>{{ filteredProjects.length }} project{{ filteredProjects.length !== 1 ? 's' : '' }}</span>
        </div>
      </div>
    </AppSection>

    <!-- Projects Grid -->
    <AppSection bg-color="white" animate-on-scroll>
      <div v-if="filteredProjects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ProjectCard
          v-for="project in filteredProjects"
          :key="project.slug"
          :title="project.title"
          :slug="project.slug"
          :description="project.description"
          :category="project.category"
          :location="project.location"
          :year="project.year"
        />
      </div>
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
          class="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-lg font-semibold hover:bg-neutral-100 transition-colors"
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

const selectedCategory = ref('all')

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
  },
  {
    title: 'Luxury Residential Estate',
    slug: 'luxury-residential-estate',
    description: 'Complete structural design for 8,000 sq ft waterfront residence with pool',
    category: 'Residential',
    location: 'St. Petersburg, FL',
    year: 2024
  },
  {
    title: 'Industrial Warehouse Complex',
    slug: 'industrial-warehouse-complex',
    description: 'Pre-engineered metal building structure with 40,000 sq ft warehouse',
    category: 'Industrial',
    location: 'Brandon, FL',
    year: 2023
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

const filteredProjects = computed(() => {
  if (selectedCategory.value === 'all') {
    return projects
  }
  return projects.filter(p => p.category === selectedCategory.value)
})
</script>
