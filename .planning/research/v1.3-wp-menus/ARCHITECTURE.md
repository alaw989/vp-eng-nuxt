# Architecture Patterns: WordPress Menu/Footer Integration

**Domain:** Headless WordPress navigation integration with Nuxt 3
**Researched:** 2026-02-10
**Confidence:** HIGH (based on existing codebase patterns and verified WordPress REST API documentation)

## Executive Summary

This architecture document describes how WordPress menu and footer data integrates with the existing VP Associates Nuxt 3 headless site. The integration follows established patterns already in use for services, projects, team, and testimonials data.

**Key architectural decisions:**
1. Server-side caching via Nitro storage (consistent with existing API routes)
2. Static fallbacks for resilience (consistent with existing patterns)
3. New composable `useNavigation.ts` for menu data access
4. WordPress API exposure via `rest_menu_read_access` filter (WordPress 6.8+) OR WP REST API V2 Menus plugin
5. Minimal component changes - existing AppHeader/AppFooter remain, just swap data source

## System Architecture Overview

```
                                    ┌─────────────────────────────────────┐
                                    │         WordPress Backend           │
                                    │     vp-associates.com/wp-json       │
                                    │                                     │
                                    │  ┌─────────────────────────────┐    │
                                    │  │  Menu Endpoints (choose 1)  │    │
                                    │  │                             │    │
                                    │  │  Option A: WP 6.8 Native    │    │
                                    │  │  /wp/v2/menu-locations      │    │
                                    │  │  /wp/v2/menu-items          │    │
                                    │  │  (requires filter opt-in)   │    │
                                    │  │                             │    │
                                    │  │  Option B: Plugin           │    │
                                    │  │  /menus/v1/menus/{slug}     │    │
                                    │  │  /menus/v1/locations/{loc}  │    │
                                    │  │  (public by default)        │    │
                                    │  └─────────────────────────────┘    │
                                    └──────────────────┬──────────────────┘
                                                       │
                                                       │ HTTP/S
                                                       │
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                   Nuxt 3 Server (Nitro)                                 │
│                                                                                         │
│  ┌────────────────────────────────────────────────────────────────────────────────┐    │
│  │                           Server API Routes                                     │    │
│  │                                                                                 │    │
│  │   /api/navigation/menus.get.ts          /api/navigation/footer.get.ts          │    │
│  │   ┌─────────────────────────────┐       ┌─────────────────────────────┐        │    │
│  │   │ 1. Check storage cache      │       │ 1. Check storage cache      │        │    │
│  │   │ 2. Fetch from WP if stale   │       │ 2. Fetch from WP if stale   │        │    │
│  │   │ 3. Transform to app format  │       │ 3. Transform to app format  │        │    │
│  │   │ 4. Return with cache meta   │       │ 4. Return with cache meta   │        │    │
│  │   │ 5. Fallback on error        │       │ 5. Fallback on error        │        │    │
│  │   └─────────────────────────────┘       └─────────────────────────────┘        │    │
│  │                                                                                 │    │
│  │   Storage: useStorage('navigation')                                            │    │
│  │   Cache TTL: 1 hour (menus change infrequently)                                │    │
│  └────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                         │
└───────────────────────────────────────────┬─────────────────────────────────────────────┘
                                            │
                                            │ Internal API
                                            │
┌───────────────────────────────────────────┴─────────────────────────────────────────────┐
│                                   Nuxt 3 Client (Vue)                                   │
│                                                                                         │
│  ┌────────────────────────────────────────────────────────────────────────────────┐    │
│  │                           Composables Layer                                     │    │
│  │                                                                                 │    │
│  │   composables/useNavigation.ts                                                  │    │
│  │   ┌─────────────────────────────────────────────────────────────────────┐      │    │
│  │   │ useMainMenu()         → Ref<MenuItem[]>                             │      │    │
│  │   │ useFooterMenus()      → { quickLinks, services, contact }           │      │    │
│  │   │ useFooterContent()    → Ref<FooterContent>                          │      │    │
│  │   │                                                                     │      │    │
│  │   │ Internal: Static fallbacks, error handling, loading states          │      │    │
│  │   └─────────────────────────────────────────────────────────────────────┘      │    │
│  └────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                         │
│  ┌────────────────────────────────────────────────────────────────────────────────┐    │
│  │                           Component Layer                                       │    │
│  │                                                                                 │    │
│  │   components/AppHeader.vue (MODIFY)      components/AppFooter.vue (MODIFY)     │    │
│  │   ┌────────────────────────────────┐    ┌────────────────────────────────┐     │    │
│  │   │ - Call useMainMenu()           │    │ - Call useFooterMenus()        │     │    │
│  │   │ - Render menu items from API   │    │ - Call useFooterContent()      │     │    │
│  │   │ - Preserve current styling     │    │ - Render menus from API        │     │    │
│  │   │ - Preserve mobile menu logic   │    │ - Preserve current styling     │     │    │
│  │   └────────────────────────────────┘    └────────────────────────────────┘     │    │
│  └────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

## Integration Points

### 1. WordPress Backend Configuration

**Two options (recommend Option B for faster implementation):**

#### Option A: WordPress 6.8+ Native API (requires server-side filter)

Add to WordPress theme's `functions.php`:

```php
// Expose primary and footer menu locations publicly
add_filter('rest_menu_read_access', function($show_in_rest, $request, $controller) {
    // Expose menu locations
    if ($controller instanceof WP_REST_Menu_Locations_Controller) {
        $allowed_locations = ['primary', 'footer-quick-links', 'footer-services'];
        if (isset($request['location']) && in_array($request['location'], $allowed_locations)) {
            return true;
        }
    }

    // Expose menu items for allowed menus
    if ($controller instanceof WP_REST_Menu_Items_Controller) {
        // Check if the menu belongs to an allowed location
        $menus_param = $request->get_param('menus');
        // Allow if fetching items from specific menu IDs
        return true; // Customize based on menu IDs
    }

    return $show_in_rest;
}, 10, 3);
```

**Endpoints:**
- `GET /wp/v2/menu-locations` - List menu locations
- `GET /wp/v2/menu-locations/{location}` - Get menu by location
- `GET /wp/v2/menu-items?menus={id}` - Get items for a menu

**Confidence:** MEDIUM (requires WordPress admin access to configure)

#### Option B: WP REST API V2 Menus Plugin (recommended)

Install plugin: [WP-REST-API V2 Menus](https://wordpress.org/plugins/wp-rest-api-v2-menus/)

**Endpoints (public by default):**
- `GET /menus/v1/menus` - List all menus
- `GET /menus/v1/menus/{slug}` - Get menu by slug
- `GET /menus/v1/locations` - List all locations
- `GET /menus/v1/locations/{location}` - Get menu by location

**Confidence:** HIGH (plugin is widely used, no authentication needed)

### 2. New Files to Create

| File | Purpose | Pattern Source |
|------|---------|----------------|
| `server/api/navigation/menus.get.ts` | Fetch and cache header menu | `server/api/services.get.ts` |
| `server/api/navigation/footer.get.ts` | Fetch and cache footer data | `server/api/team.get.ts` |
| `composables/useNavigation.ts` | Client-side composable | `composables/useInternalApi.ts` |
| `types/navigation.ts` | TypeScript interfaces | `composables/useApi.ts` types |

### 3. Files to Modify

| File | Change | Impact |
|------|--------|--------|
| `components/AppHeader.vue` | Replace hardcoded links with API data | LOW - structure unchanged |
| `components/AppFooter.vue` | Replace hardcoded content with API data | LOW - structure unchanged |
| `nuxt.config.ts` | (Optional) Add prerender hint for navigation | MINIMAL |

## Component Boundaries

### AppHeader.vue Changes

**Current state (hardcoded):**
```vue
<nav>
  <NuxtLink to="/">Home</NuxtLink>
  <NuxtLink to="/about">About</NuxtLink>
  <NuxtLink to="/services">Services</NuxtLink>
  <!-- ... more links ... -->
</nav>
```

**Target state (API-driven):**
```vue
<script setup lang="ts">
const { menuItems, isLoading } = useMainMenu()
</script>

<template>
  <nav>
    <template v-for="item in menuItems" :key="item.id">
      <NuxtLink
        :to="item.url"
        :class="[
          'text-neutral-700 hover:text-primary transition-colors',
          { 'text-primary': isActiveRoute(item.url) }
        ]"
      >
        {{ item.title }}
      </NuxtLink>
    </template>
  </nav>
</template>
```

**Preserved behavior:**
- Scroll shadow effect (isScrolled)
- Mobile menu toggle (isOpen)
- Keyboard navigation (useEscapeKey)
- Route-based menu close
- Accessibility attributes

### AppFooter.vue Changes

**Current state:** Four hardcoded columns:
1. Company info (static text)
2. Quick Links (hardcoded NuxtLinks)
3. Services (hardcoded service links)
4. Contact Info (hardcoded address, phone, email)

**Target state:** Same four columns, API-driven content:
1. Company info → `useFooterContent().companyInfo`
2. Quick Links → `useFooterMenus().quickLinks`
3. Services → `useFooterMenus().services`
4. Contact Info → `useFooterContent().contactInfo`

## Data Flow

### Initial Page Load (SSR)

```
1. User requests page
          ↓
2. Nuxt SSR starts
          ↓
3. Layout renders AppHeader + AppFooter
          ↓
4. Components call useMainMenu() / useFooterMenus()
          ↓
5. Composable calls /api/navigation/menus (server route)
          ↓
6. Server route checks Nitro storage cache
          ↓
   ┌──────┴──────┐
   ↓             ↓
Cache HIT    Cache MISS
   ↓             ↓
Return       Fetch from WP API
cached          ↓
data         Transform data
   ↓             ↓
   └─────┬───────┘
         ↓
7. Return menu data to composable
         ↓
8. Composable returns reactive data
         ↓
9. Component renders menu items
         ↓
10. HTML sent to client with menu data
         ↓
11. Client hydrates (no refetch needed)
```

### Client Navigation (Hydrated)

```
1. User clicks internal link
          ↓
2. Nuxt navigates client-side
          ↓
3. AppHeader/AppFooter already have cached data
          ↓
4. No refetch (data in Nuxt payload)
          ↓
5. Instant navigation
```

### API Error Fallback

```
1. Server route attempts WP API fetch
          ↓
2. Request fails (timeout, 500, network error)
          ↓
3. Server route returns static fallback data
          ↓
4. Composable receives fallback (with _fallback flag)
          ↓
5. Component renders static menu
          ↓
6. Site remains functional
```

## Caching Layer Design

### Server-Side Cache (Nitro Storage)

```typescript
// server/api/navigation/menus.get.ts
const navigationStorage = useStorage('navigation')
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

export default defineEventHandler(async (event) => {
  const { _nocache } = getQuery(event)

  // Check cache
  if (!_nocache) {
    const cached = await navigationStorage.getItem('main_menu')
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return { success: true, data: cached.data, _cached: true }
    }
  }

  try {
    // Fetch from WordPress
    const response = await $fetch(WP_MENUS_URL, { timeout: 10000 })

    // Transform and cache
    const transformed = transformMenuItems(response)
    await navigationStorage.setItem('main_menu', {
      data: transformed,
      timestamp: Date.now()
    })

    return { success: true, data: transformed }
  } catch (error) {
    // Return static fallback
    return {
      success: true,
      data: staticMainMenu,
      _fallback: true
    }
  }
})
```

### Cache TTL Recommendations

| Data Type | TTL | Rationale |
|-----------|-----|-----------|
| Main menu | 1 hour | Menus change infrequently |
| Footer menus | 1 hour | Same as main menu |
| Footer content | 1 hour | Contact info rarely changes |

### Cache Invalidation

**Manual invalidation (via query param):**
```
GET /api/navigation/menus?_nocache=true
```

**Automatic invalidation:** Cache expires after TTL

**Future enhancement:** Webhook from WordPress on menu save (not required for MVP)

## Fallback Strategy

### Static Fallback Data Structure

```typescript
// server/api/navigation/menus.get.ts

const staticMainMenu: MenuItem[] = [
  { id: 1, title: 'Home', url: '/', order: 0 },
  { id: 2, title: 'About', url: '/about', order: 1 },
  { id: 3, title: 'Services', url: '/services', order: 2 },
  { id: 4, title: 'Projects', url: '/projects', order: 3 },
  { id: 5, title: 'Careers', url: '/careers', order: 4 },
  { id: 6, title: 'Contact', url: '/contact', order: 5, isButton: true },
]

const staticFooterQuickLinks: MenuItem[] = [
  { id: 1, title: 'About Us', url: '/about', order: 0 },
  { id: 2, title: 'Services', url: '/services', order: 1 },
  { id: 3, title: 'Projects Portfolio', url: '/projects', order: 2 },
  { id: 4, title: 'Contact Us', url: '/contact', order: 3 },
]

const staticFooterServices: MenuItem[] = [
  { id: 1, title: 'Structural Steel Design', url: '/services/structural-steel-design', order: 0 },
  { id: 2, title: 'Concrete Design', url: '/services/concrete-design', order: 1 },
  { id: 3, title: 'Foundation Design', url: '/services/foundation-design', order: 2 },
  { id: 4, title: 'Seawall Design', url: '/services/seawall-design', order: 3 },
  { id: 5, title: 'Steel Detailing', url: '/services/steel-detailing', order: 4 },
]

const staticFooterContent: FooterContent = {
  companyName: 'VP Associates',
  companyDescription: 'Providing structural engineering services to Tampa Bay and surrounding areas for over 30 years.',
  licenseInfo: 'Licensed & Insured Florida Engineers\nFL License #PEC-0001234',
  address: 'Tampa Bay Area, Florida',
  phone: '(813) 555-1234',
  email: 'info@vp-associates.com',
  hours: 'Mon-Fri: 8:00 AM - 5:00 PM',
  socialLinks: {
    linkedin: 'https://linkedin.com',
    facebook: 'https://facebook.com',
  }
}
```

### Fallback Trigger Conditions

1. WordPress API timeout (>10 seconds)
2. WordPress API returns 4xx/5xx error
3. WordPress API returns empty response
4. Network failure
5. Invalid response format

## TypeScript Interfaces

```typescript
// types/navigation.ts

export interface MenuItem {
  id: number
  title: string
  url: string
  order: number
  parent?: number  // For nested menus (future)
  target?: '_blank' | '_self'
  cssClasses?: string[]
  isButton?: boolean  // For CTA styling (Contact)
}

export interface FooterContent {
  companyName: string
  companyDescription: string
  licenseInfo: string
  address: string
  phone: string
  email: string
  hours: string
  socialLinks: {
    linkedin?: string
    facebook?: string
    twitter?: string
  }
}

export interface NavigationMenus {
  mainMenu: MenuItem[]
  footerQuickLinks: MenuItem[]
  footerServices: MenuItem[]
}

export interface UseMainMenuReturn {
  menuItems: Ref<MenuItem[]>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
  isStatic: Ref<boolean>
}

export interface UseFooterMenusReturn {
  quickLinks: Ref<MenuItem[]>
  services: Ref<MenuItem[]>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
  isStatic: Ref<boolean>
}

export interface UseFooterContentReturn {
  content: Ref<FooterContent>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
  isStatic: Ref<boolean>
}
```

## WordPress Menu Data Transformation

### Raw WordPress Response (WP REST API V2 Menus Plugin)

```json
{
  "term_id": 2,
  "name": "Primary Menu",
  "slug": "primary-menu",
  "items": [
    {
      "id": 101,
      "order": 1,
      "parent": 0,
      "title": "Home",
      "url": "https://vp-associates.com/",
      "attr": "",
      "target": "",
      "classes": "",
      "description": ""
    },
    {
      "id": 102,
      "order": 2,
      "parent": 0,
      "title": "About",
      "url": "https://vp-associates.com/about/",
      "attr": "",
      "target": "",
      "classes": ""
    }
  ]
}
```

### Transformation Function

```typescript
// server/utils/navigation.ts

function transformMenuItems(wpMenu: WPMenuResponse): MenuItem[] {
  const siteUrl = 'https://vp-associates.com'

  return wpMenu.items
    .sort((a, b) => a.order - b.order)
    .map(item => ({
      id: item.id,
      title: item.title,
      // Convert absolute URLs to relative paths
      url: item.url.replace(siteUrl, '') || '/',
      order: item.order,
      parent: item.parent || undefined,
      target: item.target === '_blank' ? '_blank' : '_self',
      cssClasses: item.classes ? item.classes.split(' ').filter(Boolean) : [],
      isButton: item.classes?.includes('menu-button') || false,
    }))
}
```

## Suggested Build Order

Based on dependencies and risk minimization:

### Phase 1: WordPress Configuration
**Effort:** Low (if admin access) | **Risk:** Low
1. Install WP REST API V2 Menus plugin (or configure 6.8 filter)
2. Verify endpoints are accessible: `/menus/v1/menus/primary-menu`
3. Create/configure menu locations in WordPress admin
4. Document actual menu slugs/IDs

### Phase 2: Types and Server Routes
**Effort:** Medium | **Risk:** Low
1. Create `types/navigation.ts`
2. Create `server/api/navigation/menus.get.ts`
3. Create `server/api/navigation/footer.get.ts`
4. Test server routes independently

### Phase 3: Composable
**Effort:** Medium | **Risk:** Low
1. Create `composables/useNavigation.ts`
2. Implement `useMainMenu()`
3. Implement `useFooterMenus()`
4. Implement `useFooterContent()`
5. Test composables in isolation

### Phase 4: Component Integration
**Effort:** Medium | **Risk:** Medium (visual regression possible)
1. Update `AppHeader.vue` to use `useMainMenu()`
2. Update `AppFooter.vue` to use `useFooterMenus()` and `useFooterContent()`
3. Visual regression testing
4. Accessibility testing (WCAG AA)

### Phase 5: Testing and Fallbacks
**Effort:** Low | **Risk:** Low
1. Test API failure scenarios
2. Verify static fallbacks work
3. Test cache behavior
4. Performance testing

## Anti-Patterns to Avoid

### 1. Fetching in Layout vs Components
**Bad:** Fetching menu data in `layouts/default.vue`
**Why:** Layouts run on every route, but we want SSR + hydration, not refetching

**Good:** Fetch in components (AppHeader, AppFooter) using composables
**Why:** Nuxt handles SSR deduplication and payload transfer

### 2. Client-Only Data Fetching
**Bad:** Using `onMounted` to fetch menu data
**Why:** Causes layout shift, poor SEO, slower perceived performance

**Good:** Use `useFetch` or `useAsyncData` in composable
**Why:** Data fetched during SSR, included in HTML payload

### 3. Direct WordPress API Calls from Client
**Bad:** Calling `vp-associates.com/wp-json/...` directly from browser
**Why:** CORS issues, exposed API structure, no caching

**Good:** Route through Nuxt server API routes
**Why:** Caching, transformation, fallbacks, security

### 4. Over-Engineering Menu Hierarchy
**Bad:** Implementing deep nested menu support for MVP
**Why:** Current site has flat navigation, adds complexity

**Good:** Support parent field in types but render flat initially
**Why:** Future-proof without over-engineering

## Performance Considerations

### Bundle Impact
- New composable: ~2KB gzipped
- No new dependencies required
- Menu data: ~1KB per menu (minimal payload increase)

### Server-Side Caching Benefits
- WordPress API called max once per hour (TTL)
- Subsequent requests served from Nitro storage
- Cache shared across all users

### Client-Side Hydration
- Menu data included in SSR payload
- No additional network requests on navigation
- Instant menu rendering

## Sources

- [WordPress REST API Menu Locations Reference](https://developer.wordpress.org/rest-api/reference/menu-locations/)
- [WordPress 6.8 rest_menu_read_access Filter](https://make.wordpress.org/core/2025/03/27/new-rest-api-filter-for-exposing-menus-publicly-in-wordpress-6-8/)
- [WP REST API V2 Menus Plugin](https://github.com/thebatclaudio/wp-rest-api-v2-menus)
- [Nuxt 3 Data Fetching Guide](https://nuxt.com/docs/4.x/getting-started/data-fetching)
- Existing codebase: `server/api/services.get.ts`, `composables/useInternalApi.ts`
