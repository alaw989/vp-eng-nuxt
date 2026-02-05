# Phase 08: Section Polish - Services - Research

**Researched:** 2026-02-05
**Domain:** Nuxt 3 page development, WordPress API integration, component architecture
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Listing Page Features:**
- Grid-only layout (no grid/list toggle)
- Category tag filtering with horizontal scrollable pills
- URL state persistence via ?category= query param
- Filter resets pagination to page 1

**Detail Page Layout:**
- No sidebar (unlike Projects)
- Add "How This Service Works" section with 4-step generic process
- Keep current 2-column layout (content + benefits box)

**Service Images/Icons:**
- Keep MDI icons for service cards
- Add hero image for each service detail page header
- Hero image source: from related projects tagged with that service
- Background overlay treatment (60/50/70% neutral) with white text/icon
- Icon remains visible alongside title in header

**Visual Consistency:**
- Match Projects patterns for card styling, hover effects
- Keep capabilities in cards (show full list on listing)
- Replace static "Other Services" with dynamic "Related Services" section

### Claude's Discretion
- Exact category groupings for services
- Horizontal scrolling behavior for category pills
- Fallback behavior when no related projects exist for hero image
- "Related services" algorithm
- Exact spacing and typography for process section

### Deferred Ideas (OUT OF SCOPE)
None
</user_constraints>

## Summary

Phase 8 focuses on polishing the Services section to reach visual parity with the completed Phase 7 Projects section. The primary work involves: (1) adding category filtering to the services listing page with horizontal scrollable pills, (2) adding hero images to service detail pages using related project images from Phase 3 migration, (3) inserting a "How This Service Works" 4-step process section, and (4) implementing a dynamic "Related Services" section.

The current services pages use static data with WordPress API fallback. The service data structure includes: title, slug, icon (MDI), standard (certification), description, capabilities (array), and content. Images from Phase 3 are organized in `/public/images/` with WebP/JPG variants at 640w/1280w/1920w breakpoints.

**Primary recommendation:** Mirror the Projects category filter implementation from Phase 7, use the existing project image mapping for service hero images, and reuse the process section HTML pattern from the services listing page for detail pages.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Nuxt 3 | ^3.x | Framework, routing, composables | Already in use, provides useRoute, useFetch |
| Vue 3 | ^3.x | Reactive components, computed, watch | Framework foundation |
| @nuxt/image | ^2.x | Image optimization with NuxtImg component | Already installed, used throughout |
| Tailwind CSS | ^3.x | Utility-first styling | Already configured, used for all components |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| MDI (Material Design Icons) | via Icon component | Service icons | Already mapped to services (mdi:beam, mdi:cube-outline, etc.) |

### Existing Patterns to Reuse

| From Phase | Pattern | Location |
|------------|---------|----------|
| Phase 7 | Category filter pills with URL state | `/pages/projects/index.vue` |
| Phase 7 | Related items algorithm (same category) | `/pages/projects/[slug].vue` |
| Phase 3 | Image mapping for hero sources | `/public/images/image-mapping.json` |
| Existing | Service data structure | `/pages/services/index.vue`, `/server/api/services/[slug].get.ts` |

**No new installations needed.**

## Architecture Patterns

### Current Services Data Structure

**Service Listing (pages/services/index.vue):**
```typescript
interface Service {
  title: string          // Display name
  slug: string           // URL-friendly identifier
  standard?: string      // Certification/standard (e.g., "AISC Certified")
  description: string    // Short description
  icon: string          // MDI icon name (e.g., "mdi:beam")
  capabilities?: string[]  // List of 6-7 capability items
}
```

**Service Detail API Response (server/api/services/[slug].get.ts):**
```typescript
interface ServiceApiResponse {
  success: boolean
  data?: {
    id: number
    title: { rendered: string }
    slug: string
    excerpt: { rendered: string }
    content: { rendered: string }
    acf: {
      icon: string
      standard?: string
      capabilities: string[]
    }
    _embedded: any
  }
  _static?: boolean  // Flag if static fallback was used
}
```

### Pattern 1: Category Filter with URL State (from Phase 7 Projects)

**What:** Horizontally scrollable category pills that sync with URL query params.

**When to use:** Services listing page for category filtering.

**Example:**
```vue
<!-- Source: Adapted from /pages/projects/index.vue lines 19-34 -->
<template>
  <div class="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
    <button
      v-for="category in categories"
      :key="category.id"
      @click="setCategory(category.id)"
      :class="[
        'px-6 py-2.5 rounded-full font-semibold transition-all duration-300 whitespace-nowrap',
        filters.category === category.id
          ? 'bg-primary text-white shadow-lg scale-105'
          : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
      ]"
      :aria-pressed="filters.category === category.id"
    >
      {{ category.name }}
    </button>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

interface Category {
  id: string
  name: string
}

const categories: Category[] = [
  { id: 'all', name: 'All Services' },
  { id: 'structural', name: 'Structural Design' },
  { id: 'inspection', name: 'Inspection' },
  // ... more categories
]

const filters = reactive({
  category: (route.query.category as string) || 'all'
})

function setCategory(categoryId: string) {
  filters.category = categoryId
  const query: Record<string, string> = {}
  if (filters.category !== 'all') query.category = filters.category
  navigateTo({ query }, { replace: true })
}
</script>

<style scoped>
/* Hide scrollbar but keep functionality */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
```

### Pattern 2: Hero Image with Background Overlay

**What:** Full-width background image with dark overlay and white text on top.

**When to use:** Service detail page header.

**Example:**
```vue
<!-- Source: Pattern from homepage/AppSection usage -->
<template>
  <section class="relative bg-primary-dark text-white overflow-hidden">
    <!-- Background Image -->
    <div class="absolute inset-0">
      <NuxtImg
        :src="heroImage"
        :alt="serviceTitle"
        class="w-full h-full object-cover"
        format="webp"
        loading="eager"
        :srcset="heroSrcset"
        sizes="100vw"
      />
      <!-- Dark Overlay -->
      <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>
    </div>

    <!-- Content -->
    <div class="relative container py-16 md:py-24">
      <div class="flex items-center gap-4 mb-6">
        <div class="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center">
          <Icon :name="serviceIcon" class="w-8 h-8" />
        </div>
        <div>
          <div v-if="serviceStandard" class="text-secondary font-semibold mb-1">
            {{ serviceStandard }}
          </div>
          <h1 class="text-4xl md:text-5xl font-display font-bold">
            {{ serviceTitle }}
          </h1>
        </div>
      </div>
      <p class="text-xl opacity-90 max-w-3xl">
        {{ serviceDescription }}
      </p>
    </div>
  </section>
</template>
```

### Pattern 3: Related Services Algorithm

**What:** Find related services by category, excluding current service.

**When to use:** Service detail page "Related Services" section.

**Example:**
```typescript
// Source: Adapted from /pages/projects/[slug].vue lines 447-457
const allServices: Service[] = [
  // All 10 services from listing page
]

const relatedServices = computed(() => {
  const currentCategory = getServiceCategory(service.value?.slug)
  if (!currentCategory) return []

  // Filter by same category, exclude current, limit to 3
  return allServices
    .filter(s => getServiceCategory(s.slug) === currentCategory && s.slug !== currentSlug)
    .slice(0, 3)
})

// Helper to map service slugs to categories
function getServiceCategory(slug: string): string | null {
  const categoryMap: Record<string, string> = {
    'structural-steel-design': 'structural',
    'concrete-design': 'structural',
    'masonry-design': 'structural',
    'wood-design': 'structural',
    'foundation-design': 'structural',
    'seawall-design': 'marine',
    'steel-connection-design': 'structural',
    'cad-3d-modeling': 'design',
    'inspection-services': 'inspection',
    'steel-detailing': 'design'
  }
  return categoryMap[slug] || null
}
```

### Pattern 4: Service-to-Project Image Mapping

**What:** Map services to related project images for hero backgrounds.

**When to use:** Service detail page hero image selection.

**Example:**
```typescript
// Source: Based on project image mapping from Phase 3
const serviceToProjectImages: Record<string, string[]> = {
  'structural-steel-design': [
    '/images/projects/steel-connect-1920w.webp',
    '/images/projects/crane-lift-1920w.webp'
  ],
  'concrete-design': [
    '/images/projects/lowrise-1920w.webp',
    '/images/projects/shallowdeepfoundationdesign10-1920w.webp'
  ],
  'masonry-design': [
    '/images/projects/lowrise-1920w.webp'
  ],
  'wood-design': [
    '/images/projects/lowrise-1920w.webp'
  ],
  'foundation-design': [
    '/images/projects/shallowdeepfoundationdesign10-1920w.webp',
    '/images/projects/lowrise-1920w.webp'
  ],
  'seawall-design': [
    '/images/projects/shallowdeepfoundationdesign10-1920w.webp'
  ],
  'steel-connection-design': [
    '/images/projects/steel-connect-1920w.webp',
    '/images/projects/shopdrawing-1920w.webp'
  ],
  'cad-3d-modeling': [
    '/images/projects/cad-drawing-1920w.webp'
  ],
  'inspection-services': [
    '/images/projects/inspection-services-1920w.webp'
  ],
  'steel-detailing': [
    '/images/projects/shopdrawing-1920w.webp',
    '/images/projects/steel-connect-1920w.webp'
  ]
}

const serviceHeroImage = computed(() => {
  const images = serviceToProjectImages[currentSlug] || []
  return images.length > 0 ? images[0] : '/images/hero/home-header-1920w.webp' // fallback
})
```

## Current State Assessment

### Services Listing Page (`/pages/services/index.vue`)

**Current Structure:**
- Static array of 10 services in component script
- 2-column grid layout (grid-cols-1 md:grid-cols-2)
- Cards show: icon, title, standard badge, description, full capabilities list, "Learn More" link
- No filtering, no pagination
- Static "Our Process" 4-step section at bottom
- "Why Choose Us" benefits section

**Missing for Phase 8:**
- Category filter pills
- URL state for filters
- Scrollable filter container

**Components Used:**
- AppSection (existing)
- Icon (MDI via Nuxt Icon)
- NuxtLink

### Services Detail Page (`/pages/services/[slug].vue`)

**Current Structure:**
- Fetches from `/api/services/[slug]` with static fallback
- Solid color header (primary-dark) with icon box
- 2-column content layout: "About This Service" content + "Why Choose VP Associates?" benefits
- Capabilities section with cards
- Static "Related Projects" (3 hardcoded projects)
- Static "Other Services" (3 hardcoded services)

**Missing for Phase 8:**
- Hero image background in header
- "How This Service Works" process section
- Dynamic "Related Services" section (replace static "Other Services")

**Components Used:**
- AppSection (existing)
- AppBreadcrumbs (existing)
- ServiceCard (existing)
- ProjectCard (existing)
- SocialShare (lazy loaded)
- ServiceDetailSkeleton (loading state)

### ServiceCard Component (`/components/ServiceCard.vue`)

**Current Props:**
```typescript
defineProps<{
  title: string
  slug: string
  description: string
  icon: string
}>()
```

**Note:** Does not show capabilities (decided to keep full capabilities on listing page only, per context decision).

## Service Data Structure

### WordPress API Fields

From `/server/api/services/[slug].get.ts`, the API returns:

```typescript
{
  id: number
  title: { rendered: string }
  slug: string
  excerpt: { rendered: string }
  content: { rendered: string }
  acf: {
    icon: string        // MDI icon name
    standard?: string   // Optional certification/standard
    capabilities: string[]
  }
  _embedded: {}        // Featured image, terms, etc.
}
```

### All Services (from static fallback)

| Slug | Title | Icon | Standard |
|------|-------|------|----------|
| structural-steel-design | Structural Steel Design | mdi:beam | AISC Certified |
| concrete-design | Concrete Design | mdi:cube-outline | ACI Certified |
| masonry-design | Masonry Design | mdi:wall | ACI 530 Compliant |
| wood-design | Wood Design | mdi:tree | NDS Standards |
| foundation-design | Foundation Design | mdi:home-floor-0 | (none) |
| seawall-design | Seawall Design | mdi:waves | (none) |
| steel-connection-design | Steel Connection Design | mdi:vector-arrange-above | (none) |
| cad-3d-modeling | CAD & 3D Modeling | mdi:cube-scan | (none) |
| inspection-services | Inspection Services | mdi:magnify-scan | (none) |
| steel-detailing | Steel Detailing | mdi:pencil-ruler | (none) |

## Category Groupings (Recommended)

Based on service capabilities and industry conventions:

```typescript
interface ServiceCategory {
  id: string
  name: string
  services: string[]  // service slugs
}

const serviceCategories: ServiceCategory[] = [
  {
    id: 'all',
    name: 'All Services',
    services: []  // Special case, shows all
  },
  {
    id: 'structural',
    name: 'Structural Design',
    services: [
      'structural-steel-design',
      'concrete-design',
      'masonry-design',
      'wood-design',
      'foundation-design'
    ]
  },
  {
    id: 'design',
    name: 'Design & Detailing',
    services: [
      'steel-connection-design',
      'cad-3d-modeling',
      'steel-detailing'
    ]
  },
  {
    id: 'inspection',
    name: 'Inspection',
    services: [
      'inspection-services'
    ]
  },
  {
    id: 'marine',
    name: 'Marine & Coastal',
    services: [
      'seawall-design'
    ]
  }
]
```

**Note:** Categories can be adjusted - "Claude's Discretion" allows flexibility here. An alternative would be to merge "marine" into "structural" since it's only one service.

## Hero Image Strategy

### Available Project Images (from Phase 3 mapping)

```typescript
// Images in /public/images/projects/
const availableProjectImages = {
  'steel-connect': '/images/projects/steel-connect-1920w.webp',
  'shallowdeepfoundationdesign10': '/images/projects/shallowdeepfoundationdesign10-1920w.webp',
  'lowrise': '/images/projects/lowrise-1920w.webp',
  'inspection-services': '/images/projects/inspection-services-1920w.webp',
  'crane-lift': '/images/projects/crane-lift-1920w.webp',
  'cad-drawing': '/images/projects/cad-drawing-1920w.webp',
  'shopdrawing': '/images/projects/shopdrawing-1920w.webp'
}
```

### Service to Hero Image Mapping

| Service | Recommended Hero Images |
|---------|------------------------|
| Structural Steel Design | steel-connect-1920w.webp, crane-lift-1920w.webp |
| Concrete Design | lowrise-1920w.webp, shallowdeepfoundationdesign10-1920w.webp |
| Masonry Design | lowrise-1920w.webp |
| Wood Design | lowrise-1920w.webp |
| Foundation Design | shallowdeepfoundationdesign10-1920w.webp, lowrise-1920w.webp |
| Seawall Design | shallowdeepfoundationdesign10-1920w.webp |
| Steel Connection Design | steel-connect-1920w.webp, shopdrawing-1920w.webp |
| CAD & 3D Modeling | cad-drawing-1920w.webp, shopdrawing-1920w.webp |
| Inspection Services | inspection-services-1920w.webp |
| Steel Detailing | shopdrawing-1920w.webp, steel-connect-1920w.webp |

### Fallback Strategy

If no mapped image exists:
1. Primary fallback: `/images/hero/home-header-1920w.webp` (generic building)
2. Secondary fallback: solid color background (current behavior)

## Related Services Algorithm

### Recommended Approach: Same Category

```typescript
// Priority 1: Services in same category (excluding current)
const relatedByCategory = computed(() => {
  const currentCategory = getServiceCategory(currentService.value?.slug)
  return allServices.value
    .filter(s => getServiceCategory(s.slug) === currentCategory && s.slug !== currentService.value?.slug)
    .slice(0, 3)
})

// If fewer than 3 in same category, supplement with commonly paired services
const relatedServices = computed(() => {
  if (relatedByCategory.value.length >= 3) {
    return relatedByCategory.value.slice(0, 3)
  }

  // Supplement with commonly paired services
  const commonPairs: Record<string, string[]> = {
    'structural-steel-design': ['steel-connection-design', 'foundation-design'],
    'concrete-design': ['foundation-design'],
    'foundation-design': ['structural-steel-design', 'concrete-design'],
    // ... etc
  }

  const additional = commonPairs[currentService.value?.slug] || []
  const combined = [...relatedByCategory.value]

  for (const slug of additional) {
    if (combined.length >= 3) break
    if (!combined.find(s => s.slug === slug)) {
      combined.push(allServices.value.find(s => s.slug === slug))
    }
  }

  return combined.slice(0, 3)
})
```

### Alternative: Random Excluding Current

If category-based approach doesn't yield good results, fallback to random selection:

```typescript
const relatedServicesRandom = computed(() => {
  const others = allServices.value.filter(s => s.slug !== currentService.value?.slug)
  // Shuffle and take first 3
  return others.sort(() => Math.random() - 0.5).slice(0, 3)
})
```

**Recommendation:** Use category-based with common pairs fallback (more semantic), with random as ultimate fallback if still fewer than 3.

## Technical Considerations

### Nuxt 3 Composables to Use

| Composable | Purpose | Usage |
|------------|---------|-------|
| `useRoute()` | Access route, query params | Reading/writing ?category= |
| `navigateTo()` | Update URL without page reload | Syncing filter state |
| `useFetch()` | Data fetching from API | Already in use for service detail |
| `computed()` | Reactive derived values | Filtered services, related services |

### Tailwind Patterns to Mirror from Projects

| Pattern | Projects Source | Services Target |
|---------|-----------------|-----------------|
| Category pills active state | bg-primary, shadow-lg, scale-105 | Same |
| Category pills inactive | bg-white, border-neutral-200, hover:bg-neutral-100 | Same |
| Horizontal scroll container | overflow-x-auto with scrollbar-hide | Same |
| Related items grid | md:grid-cols-3 gap-8 | Same for services |
| View All link style | border-2 border-primary text-primary rounded-lg | Same |

### Component Updates Needed

**ServiceCard.vue:** No changes needed (current design works)

**Service Detail Page:**
- Add hero image background to header
- Insert "How This Service Works" section after capabilities
- Replace "Other Services" with "Related Services"

## Code Examples

### Horizontal Scrollable Category Filter

```vue
<template>
  <div class="container">
    <div class="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
      <button
        v-for="category in categories"
        :key="category.id"
        @click="setCategory(category.id)"
        :class="[
          'px-6 py-2.5 rounded-full font-semibold transition-all duration-300 whitespace-nowrap snap-start',
          activeCategory === category.id
            ? 'bg-primary text-white shadow-lg scale-105'
            : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
        ]"
        :aria-pressed="activeCategory === category.id"
        :aria-label="`Filter by ${category.name}`"
      >
        {{ category.name }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
```

### Process Section (4-Step)

```vue
<template>
  <AppSection bg-color="neutral-50" animate-on-scroll>
    <div class="text-center mb-12">
      <h2 class="text-4xl font-display font-bold text-neutral-900 mb-4">
        How This Service Works
      </h2>
      <p class="text-xl text-neutral-600 max-w-3xl mx-auto">
        Our proven process from consultation to support
      </p>
    </div>

    <div class="grid md:grid-cols-4 gap-8">
      <div class="relative text-center">
        <div class="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">1</div>
        <h3 class="text-xl font-bold text-neutral-900 mb-2">Consultation</h3>
        <p class="text-neutral-600 text-sm">Initial project review and scope discussion</p>
        <div class="hidden md:block absolute top-6 left-full w-full h-0.5 bg-primary/20 -translate-x-6"></div>
      </div>

      <div class="relative text-center">
        <div class="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">2</div>
        <h3 class="text-xl font-bold text-neutral-900 mb-2">Design</h3>
        <p class="text-neutral-600 text-sm">Structural analysis and calculation preparation</p>
        <div class="hidden md:block absolute top-6 left-full w-full h-0.5 bg-primary/20 -translate-x-6"></div>
      </div>

      <div class="relative text-center">
        <div class="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">3</div>
        <h3 class="text-xl font-bold text-neutral-900 mb-2">Review</h3>
        <p class="text-neutral-600 text-sm">Plan preparation and permitting support</p>
        <div class="hidden md:block absolute top-6 left-full w-full h-0.5 bg-primary/20 -translate-x-6"></div>
      </div>

      <div class="text-center">
        <div class="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">4</div>
        <h3 class="text-xl font-bold text-neutral-900 mb-2">Support</h3>
        <p class="text-neutral-600 text-sm">Construction administration and field services</p>
      </div>
    </div>
  </AppSection>
</template>
```

## Open Questions

1. **Category Granularity**
   - What we know: 10 services need grouping into ~4-5 categories
   - What's unclear: Should "Marine & Coastal" be merged into "Structural" since it's only one service?
   - Recommendation: Keep separate for clarity - marine/coastal work is distinct enough to warrant its own category

2. **Hero Image Selection Algorithm**
   - What we know: Can map services to specific project images
   - What's unclear: Should hero images rotate/cycle if multiple images available?
   - Recommendation: Start with static selection (first image), consider rotation as enhancement

3. **Process Section Content**
   - What we know: Context specifies "generic 4-step process" for all services
   - What's unclear: Should step descriptions be service-specific (e.g., "Steel analysis" vs "Structural analysis")?
   - Recommendation: Keep generic as specified - simpler and consistent across services

4. **Related Services When Few Available**
   - What we know: Some categories have only 1-2 services
   - What's unclear: What if "same category" yields 0-1 related services?
   - Recommendation: Use category match first, then "commonly paired" services, then random to fill 3 slots

## Sources

### Primary (HIGH confidence)

- **Project source code** - `/pages/projects/index.vue` (category filter implementation)
- **Project source code** - `/pages/projects/[slug].vue` (related projects algorithm)
- **Service source code** - `/pages/services/index.vue`, `/pages/services/[slug].vue`
- **API source code** - `/server/api/services/[slug].get.ts`
- **Image mapping** - `/public/images/image-mapping.json` (Phase 3 output)
- **Phase 3 Research** - `.planning/phases/03-image-migration/03-RESEARCH.md`
- **Phase 7 Context** - `.planning/phases/07-section-polish---projects/07-CONTEXT.md`

### Secondary (MEDIUM confidence)

- **Nuxt 3 Documentation** - useRoute, navigateTo, useFetch composables
- **Nuxt Image Documentation** - NuxtImg component props and usage

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All existing project code verified
- Architecture: HIGH - Patterns extracted from working Projects implementation
- Service data structure: HIGH - Verified from API and static fallback code
- Category groupings: MEDIUM - Recommendation based on industry knowledge, can be adjusted
- Pitfalls: MEDIUM - Based on common filtering/state management patterns

**Research date:** 2026-02-05
**Valid until:** 2026-05-05 (3 months - Nuxt 3 is stable, patterns are established)
