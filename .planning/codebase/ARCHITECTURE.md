# Architecture

**Analysis Date:** 2024-12-04

## Pattern Overview

**Overall:** Nuxt.js Full-Stack Framework with SSR/SSG Hybrid

**Key Characteristics:**
- Vue 3 Composition API with TypeScript
- Nuxt 3 with Nitro engine for server-side rendering
- Hybrid SSR/SSG architecture with smart caching
- WordPress CMS integration via REST API
- Progressive Web App (PWA) capabilities
- Component-based architecture with atomic design

## Layers

**Presentation Layer:**
- Purpose: User interface components and pages
- Location: `/pages`, `/layouts`, `/components`
- Contains: Vue components, pages, layouts
- Depends on: composables, API layer
- Used by: End users through browser

**Component Layer:**
- Purpose: Reusable UI components and composables
- Location: `/components`, `/composables`
- Contains: Atomic components, business logic hooks
- Depends on: Nuxt core, Vue ecosystem
- Used by: Presentation layer

**API Layer:**
- Purpose: Data fetching and proxy services
- Location: `/server/api`
- Contains: API routes, data transformation logic
- Depends on: WordPress REST API, static fallbacks
- Used by: Presentation layer via useFetch

**Data Layer:**
- Purpose: Data sources and caching
- Location: `/server` (external WordPress API)
- Contains: WordPress CMS data, static fallbacks
- Depends on: External WordPress instance
- Used by: API layer

## Data Flow

**Page Load Flow:**

1. Request hits Nuxt server (SSR) or static generation (SSG)
2. Nuxt renders page using component tree
3. Components use composables for data fetching
4. Composables call API endpoints via useFetch
5. API layer fetches from WordPress or returns static fallback
6. Data flows back through components to UI
7. Final HTML rendered to client with hydration

**Client Navigation Flow:**

1. User navigates to new page
2. Nuxt handles routing with SPA behavior
3. Components mount and fetch data
4. Same API layer logic as server-side
5. UI updates without full page reload

**State Management:**
- Nuxt's `useState()` for reactive state
- Composables for business logic
- No Pinia store (minimal client-side state)
- Data fetched per-component basis

## Key Abstractions

**usePageMeta Composable:**
- Purpose: Centralized SEO and meta tag management
- Location: `/composables/usePageMeta.ts`
- Pattern: Factory function with consistent interface
- Handles: Open Graph, Twitter Cards, canonical URLs

**API Proxy Pattern:**
- Purpose: Bridge between frontend and WordPress
- Location: `/server/api/*.ts`
- Pattern: Proxy with static fallback
- Handles: Error handling, data transformation, caching

**Component Composition:**
- Purpose: Reusable UI building blocks
- Location: `/components/*.vue`
- Pattern: Atomic design with props/events
- Examples: `AppSection`, `ProjectCard`, `ServiceCard`

**Layout System:**
- Purpose: Consistent page structure
- Location: `/layouts/*.vue`
- Pattern: Slot-based composition
- Contains: Header, footer, main content area

## Entry Points

**Main Application:**
- Location: `/pages/index.vue`
- Triggers: Initial page load
- Responsibilities: Homepage with hero, services, projects, testimonials

**Layout Entry:**
- Location: `/layouts/default.vue`
- Triggers: Every page navigation
- Responsibilities: Global layout, PWA integration, accessibility

**Dynamic Routes:**
- Location: `/pages/[category]/[slug].vue`
- Triggers: Individual project/service/career pages
- Responsibilities: Dynamic content display with metadata

## Error Handling

**Strategy:** Graceful degradation with static fallbacks

**Patterns:**
- API calls return static data on failure
- Error boundaries for component errors
- Offline page for PWA scenarios
- Fallback UI for loading states

## Cross-Cutting Concerns

**SEO:**
- Centralized meta tag management
- Structured data (JSON-LD)
- Sitemap generation
- Canonical URLs

**Performance:**
- Image optimization with @nuxt/image
- Code splitting
- Caching strategies
- Preloading critical resources

**Accessibility:**
- Semantic HTML5
- Skip links
- ARIA attributes
- Focus management

**PWA:**
- Service worker for offline support
- Install prompts
- App-like experience
- Background sync

---

*Architecture analysis: 2024-12-04*