<template>
  <div class="min-h-screen bg-neutral-50 py-16">
    <div class="container max-w-5xl mx-auto px-4">
      <!-- Breadcrumb -->
      <AppBreadcrumbs
        :breadcrumbs="[{ title: 'Sitemap', to: '/sitemap' }]"
      />

      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-4">
          Site Map
        </h1>
        <p class="text-lg text-neutral-600 max-w-2xl mx-auto">
          Navigate to any page on our website
        </p>
      </div>

      <!-- Main Pages Section -->
      <AppSection bg-color="white" class="mb-8">
        <template #default>
          <div class="space-y-6">
            <div>
              <h2 class="text-2xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Icon name="mdi:page-layout-header" class="w-6 h-6 text-primary" />
                Main Pages
              </h2>
              <ul class="grid md:grid-cols-2 gap-3">
                <li v-for="page in mainPages" :key="page.href">
                  <NuxtLink
                    :to="page.href"
                    class="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 hover:border-primary hover:bg-primary/5 transition-all group"
                  >
                    <Icon :name="page.icon" class="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                    <div>
                      <span class="font-semibold text-neutral-900 group-hover:text-primary">{{ page.label }}</span>
                      <p v-if="page.description" class="text-sm text-neutral-500">{{ page.description }}</p>
                    </div>
                    <Icon name="mdi:chevron-right" class="w-5 h-5 text-neutral-400 ml-auto group-hover:text-primary" />
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>
        </template>
      </AppSection>

      <!-- Services Section -->
      <AppSection bg-color="white" class="mb-8">
        <template #default>
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <h2 class="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                <Icon name="mdi:cogs" class="w-6 h-6 text-primary" />
                Services
              </h2>
              <NuxtLink
                to="/services"
                class="text-primary hover:text-primary-dark font-semibold inline-flex items-center gap-1"
              >
                View All
                <Icon name="mdi:arrow-right" class="w-4 h-4" />
              </NuxtLink>
            </div>

            <div v-if="pending" class="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              <ServiceCardSkeleton v-for="i in 6" :key="i" />
            </div>
            <ul v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              <li v-for="service in services" :key="service.slug">
                <NuxtLink
                  :to="`/services/${service.slug}`"
                  class="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <Icon
                    :name="service.services_meta?.icon || 'mdi:cog'"
                    class="w-5 h-5 text-primary group-hover:scale-110 transition-transform"
                  />
                  <span class="font-medium text-neutral-900 group-hover:text-primary text-sm">
                    {{ service.title?.rendered }}
                  </span>
                  <Icon name="mdi:chevron-right" class="w-4 h-4 text-neutral-400 ml-auto group-hover:text-primary" />
                </NuxtLink>
              </li>
            </ul>
          </div>
        </template>
      </AppSection>

      <!-- Projects Section -->
      <AppSection bg-color="white" class="mb-8">
        <template #default>
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <h2 class="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                <Icon name="mdi:folder-multiple" class="w-6 h-6 text-primary" />
                Projects
              </h2>
              <NuxtLink
                to="/projects"
                class="text-primary hover:text-primary-dark font-semibold inline-flex items-center gap-1"
              >
                View All
                <Icon name="mdi:arrow-right" class="w-4 h-4" />
              </NuxtLink>
            </div>

            <div v-if="projectsPending" class="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              <ProjectCardSkeleton v-for="i in 6" :key="i" />
            </div>
            <ul v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              <li v-for="project in projects" :key="project.slug">
                <NuxtLink
                  :to="`/projects/${project.slug}`"
                  class="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:border-secondary hover:bg-secondary/5 transition-all group"
                >
                  <Icon name="mdi:office-building" class="w-5 h-5 text-secondary group-hover:scale-110 transition-transform" />
                  <div class="flex-1 min-w-0">
                    <span class="font-medium text-neutral-900 group-hover:text-secondary text-sm block truncate">
                      {{ project.title?.rendered }}
                    </span>
                    <span v-if="project.project_meta?.location" class="text-xs text-neutral-500">
                      {{ project.project_meta.location }}
                    </span>
                  </div>
                  <Icon name="mdi:chevron-right" class="w-4 h-4 text-neutral-400 group-hover:text-secondary" />
                </NuxtLink>
              </li>
            </ul>
          </div>
        </template>
      </AppSection>

      <!-- Resources Section -->
      <AppSection bg-color="white">
        <template #default>
          <div class="space-y-6">
            <h2 class="text-2xl font-bold text-neutral-900 flex items-center gap-2">
              <Icon name="mdi:information" class="w-6 h-6 text-primary" />
              Resources
            </h2>
            <ul class="grid md:grid-cols-2 gap-3">
              <li v-for="resource in resources" :key="resource.href">
                <NuxtLink
                  :to="resource.href"
                  class="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <Icon :name="resource.icon" class="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  <div>
                    <span class="font-semibold text-neutral-900 group-hover:text-primary">{{ resource.label }}</span>
                    <p v-if="resource.description" class="text-sm text-neutral-500">{{ resource.description }}</p>
                  </div>
                  <Icon name="mdi:chevron-right" class="w-5 h-5 text-neutral-400 ml-auto group-hover:text-primary" />
                </NuxtLink>
              </li>
            </ul>
          </div>
        </template>
      </AppSection>
    </div>
  </div>
</template>

<script setup lang="ts">
// SEO Meta Tags
usePageMeta({
  title: 'Site Map',
  titleSuffix: false,
  description: 'Complete site map of VP Associates website. Find all pages, services, and projects.',
  keywords: 'sitemap, site map, navigation, VP Associates',
})

// Main pages data
const mainPages = [
  {
    label: 'Home',
    href: '/',
    icon: 'mdi:home',
    description: 'Welcome to VP Associates'
  },
  {
    label: 'About Us',
    href: '/about',
    icon: 'mdi:information',
    description: 'Company history and team'
  },
  {
    label: 'Services',
    to: '/services',
    icon: 'mdi:cogs',
    description: 'Our engineering services'
  },
  {
    label: 'Projects',
    to: '/projects',
    icon: 'mdi:folder-multiple',
    description: 'Project portfolio'
  },
  {
    label: 'Careers',
    to: '/careers',
    icon: 'mdi:briefcase',
    description: 'Join our team'
  },
  {
    label: 'Contact',
    to: '/contact',
    icon: 'mdi:email',
    description: 'Get in touch'
  },
]

// Resources
const resources = [
  {
    label: 'Privacy Policy',
    href: '/privacy',
    icon: 'mdi:shield-lock',
    description: 'Our privacy practices'
  },
  {
    label: 'Terms of Service',
    href: '/terms',
    icon: 'mdi:file-document',
    description: 'Terms and conditions'
  },
  {
    label: 'Accessibility',
    href: '/accessibility',
    icon: 'mdi:human-wheelchair',
    description: 'Accessibility statement'
  },
]

// Fetch services and projects
const servicesResult = await useInternalServices()
const services = computed(() => {
  const rawServices = servicesResult.services || []
  return rawServices.map((s: any) => ({
    ...s,
    title: { rendered: decodeHtmlEntities(s.title?.rendered) || 'Service' },
  }))
})
const pending = ref(false)

const projectsResult = await useInternalProjects()
const projects = computed(() => {
  const rawProjects = projectsResult.projects || []
  return rawProjects.map((p: any) => ({
    ...p,
    title: { rendered: decodeHtmlEntities(p.title?.rendered) || 'Project' },
  }))
})
const projectsPending = ref(false)
</script>
