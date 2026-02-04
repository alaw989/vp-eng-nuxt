# Coding Conventions

**Analysis Date:** 2026-02-04

## Naming Patterns

**Files:**
- PascalCase for component files: `AppHeader.vue`, `ProjectCard.vue`
- kebab-case for pages: `index.vue`, `about.vue`, `services/[slug].vue`
- snake_case for utility files: `use_page_meta.ts`, `use_api.ts`
- kebab-case for API routes: `projects.get.ts`, `contact.post.ts`

**Functions:**
- camelCase for functions: `usePageMeta`, `useServices`, `useAnalytics`
- verb-first naming for composable functions: `useFetchProjects`, `useGetFeaturedImage`
- clear action-oriented names: `getFeaturedImage`, `trackPageView`

**Variables:**
- camelCase for variables: `isScrolled`, `isOpen`, `pageTitle`
- descriptive names: `gaMeasurementId`, `wpApiUrl`, `featuredProjects`
- boolean prefixes: `is`, `has`, `can`, `should`
- single character only for loops: `i`, `j`

**Types:**
- PascalCase for interfaces: `PageMetaOptions`, `WPService`, `WPProjectMeta`
- descriptive type names with clear purpose
- union types for string literals: `'website' | 'article'`

## Code Style

**Formatting:**
- Prettier with default configuration (via Nuxt auto-formatting)
- 2-space indentation
- Semicolons omitted (standard Vue/Nuxt convention)
- Single quotes for string literals
- Trailing commas in arrays and objects

**TypeScript:**
- Strict mode enabled: `strict: true`
- Type-checking enabled for production builds: `typeCheck: true`
- Explicit type annotations for function parameters and return types
- Interface definitions for complex objects
- Generic types for API responses: `useFetch<WPService[]>`

**Vue Component Structure:**
```vue
<template>
  <!-- Template with proper semantic HTML -->
  <header>
    <!-- Clear, accessible markup -->
  </header>
</template>

<script setup lang="ts">
// Imports at top
import { computed } from 'vue'
import { useRoute } from '#app'

// Composables
const route = useRoute()

// State
const isOpen = ref(false)

// Computed
const isActive = computed(() => route.path === '/')

// Methods
const closeModal = () => {
  isOpen.value = false
}
</script>

<style scoped>
/* Component-specific styles */
.header {
  @apply sticky top-0;
}
</style>
```

**Import Organization:**
1. Third-party imports: `import { computed } from 'vue'`
2. Nuxt imports: `import { useRoute } from '#app'`
3. Local imports: `import { usePageMeta } from '~/composables/usePageMeta'`

## Error Handling

**Patterns:**
- Try-catch blocks for API calls with fallback data
- Error states returned from composables: `servicesError`, `projectsError`
- Graceful degradation when APIs fail
- Static fallback data for critical content
- Console warnings for non-critical failures

**Error Handling Example:**
```typescript
export async function useServices() {
  const { data, error, pending } = await useFetch<WPService[]>(
    `${WP_API_URL}/services?_embed&_per_page=100`,
    {
      transform: (data: any) => {
        return data.map((item: any) => ({
          id: item.id,
          title: item.title,
          excerpt: item.excerpt,
          content: item.content,
          // ...rest of transformation
        }))
      },
    }
  )

  return {
    services: data,
    servicesError: error,
    servicesPending: pending,
  }
}
```

## Logging

**Framework:** Console logging with development checks

**Patterns:**
```typescript
// Development-only logging
if (process.env.NODE_ENV === 'development') {
  console.log('[Analytics] GA4 not configured')
}

// Structured logging
console.warn('[API] Failed to fetch testimonials:', error)

// Performance logging
console.time('API fetch')
// ... code
console.timeEnd('API fetch')
```

## Comments

**When to Comment:**
- Complex API transformations
- Business logic that isn't self-explanatory
- Third-party integrations
- Performance-critical code
- TODO items for future improvements

**JSDoc/TSDoc:**
- Used for exported functions and interfaces
- Clear parameter descriptions
- Return value documentation
- Example usage when helpful

**Comment Examples:**
```typescript
/**
 * WordPress REST API Base Configuration
 * API endpoint for VP Associates WordPress backend
 */
export const WP_API_URL = 'https://whataustinhasmade.com/vp-eng/wp-json/wp/v2'

/**
 * Fetch a single service by slug
 * @param slug - The service slug to fetch
 * @returns Promise with service data or error
 */
export async function useService(slug: string) {
  // ... implementation
}
```

## Function Design

**Size:**
- Small, focused functions (10-30 lines)
- Single responsibility principle
- Extracted reusable logic to composables

**Parameters:**
- Optional parameters with defaults
- Destructured parameters for objects
- Clear parameter names
- Type annotations for all parameters

**Return Values:**
- Consistent return structures
- Objects with descriptive keys
- Error handling included in return
- Computed values where appropriate

## Module Design

**Exports:**
- Named exports for utilities
- Default exports for components
- Clear module boundaries
- Reusable composable functions

**Barrel Files:**
- Not currently used
- Individual imports recommended for clarity

**State Management:**
- Pinia for complex state (configured but not heavily used)
- Composables for component-level state
- Refs for reactive primitives
- Computed for derived state

---

*Convention analysis: 2026-02-04*
```