# Pitfalls Research: WordPress Menu/Footer API Integration

**Domain:** Adding WordPress-managed navigation and footer to existing Nuxt 3 headless site
**Researched:** 2026-02-10
**Confidence:** HIGH (based on existing codebase patterns + official WordPress documentation)

## Executive Summary

This document identifies **common mistakes when adding WordPress menu/footer APIs to an existing Nuxt 3 headless site** that already has hardcoded navigation. The VP Associates site currently uses:
- Hardcoded navigation in `AppHeader.vue` (7 menu items)
- Hardcoded footer in `AppFooter.vue` (4 sections: company info, quick links, services, contact)
- Established API patterns with server-side caching and static fallbacks
- WordPress REST API integration for content (services, projects, team, testimonials)

**Key insight:** The biggest risks are **breaking existing navigation during transition**, **not maintaining fallback parity**, and **URL format mismatches** between WordPress absolute URLs and Nuxt internal routes.

---

## Critical Pitfalls

### Pitfall 1: WordPress Menu API Requires Explicit Public Access (WordPress 6.8+)

**What goes wrong:**
API calls to `/wp-json/wp/v2/menu-items` or `/wp-json/wp/v2/nav_menus` return 401 Unauthorized or empty arrays. Developers assume the menu endpoint is broken when it's actually access-restricted by default.

**Why it happens:**
- WordPress REST API does NOT expose menus publicly by default
- Prior to WordPress 6.8 (March 2025), menus required authentication or plugins
- WordPress 6.8 added `rest_menu_read_access` filter but defaults to false
- Many tutorials use plugins like `wp-rest-api-v2-menus` without explaining why

**Warning signs:**
- API returns 401 Unauthorized for menu endpoints
- Empty arrays returned despite menus existing in WordPress admin
- Menu endpoints work when logged into WordPress, fail otherwise
- Different behavior between local dev (logged in) and production

**Prevention:**
1. **Check WordPress version** - must be 6.8+ for native filter support
2. **Add filter to WordPress theme/plugin:**
```php
// functions.php or custom plugin
// Enable ALL menus publicly (simple approach)
add_filter( 'rest_menu_read_access', '__return_true' );

// OR expose only specific locations (more secure)
function expose_specific_menus( $show_in_rest, $request, $controller ) {
    // Only expose primary and footer menu locations
    if ( $controller instanceof WP_REST_Menu_Locations_Controller ) {
        $location = $request->get_param('location');
        if ( in_array( $location, ['primary', 'footer', 'footer-services'] ) ) {
            return true;
        }
    }
    // Also expose menu items for exposed menus
    if ( $controller instanceof WP_REST_Menu_Items_Controller ) {
        return true;
    }
    return $show_in_rest;
}
add_filter( 'rest_menu_read_access', 'expose_specific_menus', 10, 3 );
```
3. **Alternative: Use a menu plugin** if WordPress < 6.8:
   - `wp-rest-api-v2-menus` (most common)
   - `wp-api-menus` (hierarchical support)
   - Headless CMS plugin (includes header/footer endpoint)

**Phase to address:** WordPress Configuration Phase - verify API access before starting Nuxt integration

**Sources:**
- [WordPress 6.8 REST API Menu Filter](https://make.wordpress.org/core/2025/03/27/new-rest-api-filter-for-exposing-menus-publicly-in-wordpress-6-8/) - HIGH confidence, official
- [MainWP Code Snippets](https://mainwp.com/level-up-your-wordpress-6-8-site-with-these-practical-code-snippets/) - MEDIUM confidence

---

### Pitfall 2: Menu Items Returned as Flat List, Not Hierarchical

**What goes wrong:**
WordPress REST API returns menu items as a flat array with `parent` ID references. Developers expect nested children and build navigation rendering that doesn't account for hierarchy, resulting in flat menus or missing submenus.

**Why it happens:**
- Core WordPress REST API `/wp/v2/menu-items` returns flat list by design
- Each item has `parent` field (0 = top-level, or parent item ID)
- No automatic nesting - client must build tree structure
- Different plugins handle this differently (some nest, some don't)

**Warning signs:**
- All menu items render at same level (no dropdowns)
- Submenu items appear as siblings of parent
- `parent` field in API response ignored
- No `children` array in response data

**Prevention:**
1. **Understand the data structure:**
```typescript
// Raw WordPress response (FLAT)
[
  { id: 1, title: "Services", parent: 0, menu_order: 1 },
  { id: 2, title: "Steel Design", parent: 1, menu_order: 1 },
  { id: 3, title: "Concrete Design", parent: 1, menu_order: 2 },
  { id: 4, title: "About", parent: 0, menu_order: 2 }
]
```

2. **Build hierarchy client-side:**
```typescript
// composables/useMenuTransform.ts
interface WPMenuItem {
  id: number
  title: { rendered: string }
  url: string
  parent: number
  menu_order: number
}

interface MenuItem extends WPMenuItem {
  children: MenuItem[]
}

export function flatToHierarchical(items: WPMenuItem[]): MenuItem[] {
  const map = new Map<number, MenuItem>()
  const roots: MenuItem[] = []

  // First pass: create map with empty children arrays
  items.forEach(item => {
    map.set(item.id, { ...item, children: [] })
  })

  // Second pass: build tree
  items.forEach(item => {
    const node = map.get(item.id)!
    if (item.parent === 0) {
      roots.push(node)
    } else {
      const parent = map.get(item.parent)
      if (parent) {
        parent.children.push(node)
      }
    }
  })

  // Sort by menu_order at each level
  const sortByOrder = (items: MenuItem[]) => {
    items.sort((a, b) => a.menu_order - b.menu_order)
    items.forEach(item => sortByOrder(item.children))
    return items
  }

  return sortByOrder(roots)
}
```

3. **OR use plugin with nesting:** `wp-rest-api-v2-menus` with `?nested=1` parameter

**Testing:**
- Verify submenus render correctly
- Test menu with 3+ levels of nesting
- Check mobile menu hierarchy

**Phase to address:** API Integration Phase - implement transform utility before component work

**Sources:**
- [WordPress Nav Menu Items Endpoint](https://developer.wordpress.org/rest-api/reference/nav_menu_items/) - HIGH confidence, official
- [WPGraphQL Flat to Hierarchical](https://www.wpgraphql.com/docs/menus) - MEDIUM confidence

---

### Pitfall 3: WordPress Returns Absolute URLs, Nuxt Needs Relative Paths

**What goes wrong:**
WordPress menu items contain absolute URLs (`https://www.vp-associates.com/services/steel-design`) but Nuxt's `<NuxtLink>` expects relative paths (`/services/steel-design`). Using absolute URLs breaks client-side navigation, causing full page reloads instead of SPA transitions.

**Why it happens:**
- WordPress generates URLs based on Site Address setting
- Menu items store full permalinks
- Headless frontend has different domain or needs relative paths
- `<NuxtLink>` doesn't recognize external URLs as internal

**Warning signs:**
- Page transitions don't work (full reload on nav)
- Browser URL shows WordPress domain briefly
- "External link" behavior on internal pages
- `$router.push` fails with full URLs

**Prevention:**
1. **Transform URLs in API layer:**
```typescript
// server/api/menu.get.ts
const WP_DOMAIN = 'https://www.vp-associates.com'

function transformUrl(wpUrl: string): string {
  // Remove WordPress domain to get relative path
  if (wpUrl.startsWith(WP_DOMAIN)) {
    return wpUrl.replace(WP_DOMAIN, '') || '/'
  }
  // Keep external URLs as-is
  return wpUrl
}

// In response transform
const menuItems = rawItems.map(item => ({
  ...item,
  url: transformUrl(item.url),
  isExternal: !item.url.startsWith(WP_DOMAIN)
}))
```

2. **Handle external vs internal links in component:**
```vue
<template>
  <template v-for="item in menuItems" :key="item.id">
    <!-- External links use <a> -->
    <a
      v-if="item.isExternal"
      :href="item.url"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ item.title.rendered }}
    </a>
    <!-- Internal links use NuxtLink -->
    <NuxtLink v-else :to="item.url">
      {{ item.title.rendered }}
    </NuxtLink>
  </template>
</template>
```

3. **Consider WordPress filter for relative URLs:**
```php
// In WordPress theme
function make_menu_links_relative($items) {
    foreach ($items as &$item) {
        $item->url = wp_make_link_relative($item->url);
    }
    return $items;
}
add_filter('wp_nav_menu_objects', 'make_menu_links_relative');
```

**Testing:**
- Click every menu item, verify no full page reload
- Check browser network tab for navigation requests
- Test links to external sites (should open in new tab)

**Phase to address:** API Integration Phase - URL transformation in server route

**Sources:**
- [wp_make_link_relative()](https://developer.wordpress.org/reference/functions/wp_make_link_relative/) - HIGH confidence, official
- [Clarify - WordPress as Headless CMS](https://clarify.nl/en/articles/wordpress-as-headless-cms) - MEDIUM confidence

---

### Pitfall 4: Static Fallback Doesn't Match Current Menu Structure

**What goes wrong:**
API fails, static fallback is served, but fallback menu is outdated. Users see different navigation when API is down vs when it's working. Worse: fallback menu links to pages that don't exist anymore.

**Why it happens:**
- Existing codebase uses static fallbacks (good pattern from services.get.ts, team.get.ts)
- Fallback data created once and never updated
- WordPress menu changes don't sync to static data
- No automated process to keep fallback current

**Warning signs:**
- Complaints about "missing menu items" (seeing fallback)
- Navigation works locally but not in production (API issues)
- `_fallback: true` in API responses going unnoticed
- 404 errors on pages that "used to work"

**Prevention:**
1. **Create fallback that mirrors CURRENT hardcoded navigation:**
```typescript
// server/api/navigation.get.ts
const staticNavigation = [
  { id: 1, title: 'Home', url: '/', parent: 0, menu_order: 1 },
  { id: 2, title: 'About', url: '/about', parent: 0, menu_order: 2 },
  { id: 3, title: 'Services', url: '/services', parent: 0, menu_order: 3 },
  { id: 4, title: 'Projects', url: '/projects', parent: 0, menu_order: 4 },
  { id: 5, title: 'Careers', url: '/careers', parent: 0, menu_order: 5 },
  { id: 6, title: 'Contact', url: '/contact', parent: 0, menu_order: 6 },
]

// Match exact structure of current AppHeader.vue navigation
```

2. **Log when fallback is used:**
```typescript
if (usingFallback) {
  console.warn('[API /navigation] Using static fallback - WordPress API unavailable')
  // Consider: send to error tracking (Sentry, LogRocket)
}
```

3. **Document fallback update process:**
```markdown
## Updating Static Fallback

When WordPress menu changes:
1. Update `staticNavigation` in server/api/navigation.get.ts
2. Update `staticFooterLinks` in server/api/footer.get.ts
3. Verify fallback matches live menu structure
4. Test with `?_nocache=true&_force_fallback=true`
```

4. **Consider build-time fallback generation:**
```typescript
// During build, fetch current menu and write to static file
// nuxt.config.ts hooks.build.before
```

**Phase to address:** Fallback Strategy Phase - create and document fallback management

---

### Pitfall 5: Caching Causes Stale Menu After WordPress Update

**What goes wrong:**
Content editor updates menu in WordPress, but Nuxt site shows old menu for hours. Users see outdated navigation while cache TTL hasn't expired.

**Why it happens:**
- Server-side caching (30-60 minute TTL in existing code)
- PWA workbox caching (24 hours for WP API in nuxt.config.ts)
- No cache invalidation mechanism when WordPress updates
- Multiple cache layers (Nuxt storage, browser, CDN)

**Warning signs:**
- Menu updates don't appear immediately
- Different users see different menus (cache timing)
- "I updated the menu but nothing changed" support tickets
- Changes appear after random time intervals

**Prevention:**
1. **Choose appropriate cache TTL for navigation:**
```typescript
// Navigation changes less often than content - longer cache OK
// But shorter than content because navigation is critical path
const CACHE_TTL = 15 * 60 * 1000 // 15 minutes (vs 30 for services)
```

2. **Implement cache-busting mechanism:**
```typescript
// server/api/navigation.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { _nocache } = query

  // Allow manual cache bypass
  if (_nocache) {
    await navigationStorage.removeItem(CACHE_KEY)
  }
  // ... rest of handler
})
```

3. **WordPress webhook for cache invalidation (advanced):**
```php
// WordPress: send webhook when menu saved
add_action('wp_update_nav_menu', function($menu_id) {
    wp_remote_post('https://vp-associates.com/api/cache/invalidate', [
        'body' => json_encode(['type' => 'navigation'])
    ]);
});
```

4. **Document cache behavior for content editors:**
```markdown
## Menu Update Timeline

After updating menu in WordPress:
- Changes visible within 15 minutes (server cache)
- If urgent: Contact developer to clear cache manually
- PWA users may need to close/reopen browser
```

**Phase to address:** Caching Strategy Phase - balance freshness vs performance

---

### Pitfall 6: Footer Contact Info Not Exposed via REST API

**What goes wrong:**
Footer includes dynamic contact information (address, phone, email, hours) stored in WordPress, but this data isn't available via standard REST API endpoints. Developers hardcode it or create complex custom solutions.

**Why it happens:**
- Contact info often stored in:
  - Theme Customizer settings
  - ACF Options page
  - Widget areas
  - Custom post type
- None of these are exposed by default REST API
- Multiple sources = inconsistent data

**Warning signs:**
- Contact info different on different pages
- Updating phone number requires code deploy
- Widget content not accessible
- "Where is this data coming from?" confusion

**Prevention:**
1. **Use Headless CMS plugin for site settings:**
```
GET /wp-json/rae/v1/header-footer?header_location_id=hcms-menu-header&footer_location_id=hcms-menu-footer
```
Returns: site title, logo, menus, social icons

2. **OR create custom endpoint for site options:**
```php
// WordPress plugin or theme
add_action('rest_api_init', function() {
    register_rest_route('site/v1', '/settings', [
        'methods' => 'GET',
        'callback' => function() {
            return [
                'company_name' => get_option('company_name', 'VP Associates'),
                'address' => get_option('company_address'),
                'phone' => get_option('company_phone'),
                'email' => get_option('company_email'),
                'hours' => get_option('business_hours'),
                'social' => [
                    'linkedin' => get_option('social_linkedin'),
                    'facebook' => get_option('social_facebook'),
                ],
            ];
        },
        'permission_callback' => '__return_true',
    ]);
});
```

3. **Maintain static fallback with current data:**
```typescript
const staticSiteSettings = {
  company_name: 'VP Associates',
  address: 'Tampa Bay Area, Florida',
  phone: '(813) 555-1234',
  email: 'info@vp-associates.com',
  hours: 'Mon-Fri: 8:00 AM - 5:00 PM',
  license: 'FL License #PEC-0001234',
  social: {
    linkedin: 'https://linkedin.com',
    facebook: 'https://facebook.com',
  }
}
// Must match current AppFooter.vue hardcoded values
```

**Phase to address:** Footer API Phase - determine data source before implementation

**Sources:**
- [Headless CMS Plugin](https://github.com/imranhsayed/headless-cms) - MEDIUM confidence
- [Custom REST Endpoints](https://developer.wordpress.org/rest-api/extending-the-rest-api/routes-and-endpoints/) - HIGH confidence, official

---

### Pitfall 7: Breaking Existing Navigation During Transition

**What goes wrong:**
While implementing dynamic menus, the site has broken or partial navigation. Some pages use new API-driven menu, others still hardcoded. Inconsistent user experience during development.

**Why it happens:**
- Big-bang replacement attempted instead of incremental
- Feature flag not implemented
- Testing only in development, not production-like
- Merge conflicts between old and new navigation code

**Warning signs:**
- "Navigation looks different on some pages"
- Merge conflicts in AppHeader.vue
- Some routes have menu, others don't
- Mobile menu works, desktop doesn't (or vice versa)

**Prevention:**
1. **Implement feature flag from day one:**
```typescript
// composables/useFeatureFlags.ts
export function useFeatureFlags() {
  const config = useRuntimeConfig()
  return {
    dynamicNavigation: config.public.featureFlags?.dynamicNavigation ?? false,
  }
}

// nuxt.config.ts
runtimeConfig: {
  public: {
    featureFlags: {
      dynamicNavigation: process.env.FEATURE_DYNAMIC_NAV === 'true',
    }
  }
}
```

2. **Create parallel component, don't modify existing:**
```
components/
  AppHeader.vue          # Current hardcoded (keep working)
  AppHeaderDynamic.vue   # New API-driven (develop here)
```

3. **Switch via feature flag in layout:**
```vue
<!-- layouts/default.vue -->
<template>
  <AppHeaderDynamic v-if="flags.dynamicNavigation" />
  <AppHeader v-else />
  <!-- ... -->
</template>
```

4. **Test both paths in CI:**
```yaml
# Test with flag off (existing behavior)
- run: FEATURE_DYNAMIC_NAV=false npm test

# Test with flag on (new behavior)
- run: FEATURE_DYNAMIC_NAV=true npm test
```

5. **Gradual rollout:**
   - Week 1: Flag off everywhere, develop new components
   - Week 2: Flag on in dev/staging
   - Week 3: Flag on in production (with easy rollback)
   - Week 4: Remove flag, delete old components

**Phase to address:** Every phase - feature flag is the foundation

---

### Pitfall 8: Accessibility Regression in Dynamic Menu

**What goes wrong:**
Current hardcoded navigation has good accessibility (`aria-current`, `aria-label`, `aria-expanded`, keyboard navigation). Dynamic menu loses these because API data doesn't include ARIA attributes.

**Why it happens:**
- WordPress menu items don't include ARIA data
- Developers focus on data mapping, forget accessibility
- Current AppHeader.vue has 8+ accessibility features baked in
- Testing doesn't include keyboard/screen reader

**Warning signs:**
- `aria-current="page"` missing on active link
- Mobile menu `aria-expanded` not working
- No `aria-label` on icon-only buttons (search)
- Skip link integration broken
- Focus management on route change lost

**Prevention:**
1. **Audit current AppHeader.vue accessibility features:**
```vue
<!-- Current accessibility features to preserve: -->
<NuxtLink
  :aria-current="route.path === item.url ? 'page' : undefined"  <!-- 1. Active page -->
  class="focus-visible:ring-2 focus-visible:ring-primary"       <!-- 2. Focus styles -->
>

<button
  :aria-label="isOpen ? 'Close menu' : 'Open menu'"             <!-- 3. Toggle label -->
  :aria-expanded="isOpen"                                        <!-- 4. Expanded state -->
  aria-controls="mobile-menu"                                    <!-- 5. Controls -->
>

<nav role="navigation" aria-label="Main navigation">            <!-- 6. Landmark -->

<div aria-live="polite">                                         <!-- 7. Announcements -->
```

2. **Add accessibility in component, not API:**
```vue
<template>
  <NuxtLink
    v-for="item in menuItems"
    :key="item.id"
    :to="item.url"
    :aria-current="isCurrentPage(item.url) ? 'page' : undefined"
    class="text-neutral-700 hover:text-primary transition-colors duration-300 font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg px-2 py-1"
  >
    {{ item.title.rendered }}
  </NuxtLink>
</template>

<script setup>
const route = useRoute()
const isCurrentPage = (url: string) => {
  if (url === '/') return route.path === '/'
  return route.path.startsWith(url)
}
</script>
```

3. **Include accessibility tests in definition of done:**
- [ ] Keyboard navigation through all menu items
- [ ] Screen reader announces current page
- [ ] Mobile menu has proper ARIA states
- [ ] Focus visible on all interactive elements
- [ ] No Lighthouse accessibility regressions

**Phase to address:** Component Implementation Phase - match existing a11y

**Sources:**
- [Vue.js Accessibility Guide](https://vuejs.org/guide/best-practices/accessibility) - HIGH confidence, official
- Current AppHeader.vue implementation - HIGH confidence, existing code

---

## Moderate Pitfalls

### Pitfall 9: Menu Item Types Not Handled (Custom Links, Categories, Posts)

**What goes wrong:**
Menu includes different item types (custom links, category archives, specific posts) but code only handles page links. Some menu items render incorrectly or link to wrong URLs.

**How to avoid:**
```typescript
// Handle different WordPress menu item types
function processMenuItem(item: WPMenuItem) {
  const processed = {
    id: item.id,
    title: item.title.rendered,
    parent: item.parent,
    order: item.menu_order,
    children: [],
  }

  switch (item.type) {
    case 'custom':
      // Custom URL - use as-is (may be external)
      processed.url = item.url
      processed.isExternal = !item.url.startsWith('/')
      break
    case 'post_type':
      // Page or post - transform WordPress URL
      processed.url = transformWpUrl(item.url)
      break
    case 'taxonomy':
      // Category/tag archive - may need different routing
      processed.url = `/category/${item.object_id}`
      break
    default:
      processed.url = transformWpUrl(item.url)
  }

  return processed
}
```

**Phase to address:** API Transform Phase

---

### Pitfall 10: Mobile Menu State Lost on Route Change

**What goes wrong:**
User opens mobile menu, taps link, new page loads but menu stays open. Or menu closes but body scroll is still locked.

**How to avoid:**
```typescript
// Preserve existing route change behavior
const route = useRoute()
watch(() => route.path, () => {
  isOpen.value = false
  // Also release body scroll lock if using one
})
```

This is already implemented in current AppHeader.vue - ensure it's preserved.

**Phase to address:** Component Migration Phase

---

### Pitfall 11: Footer Services List Out of Sync with Services Page

**What goes wrong:**
Footer lists 5 services but Services page shows 8. WordPress menu and Services CPT are separate data sources that can diverge.

**How to avoid:**
1. **Option A:** Footer services menu in WordPress, manually maintained
2. **Option B:** Fetch from services API, limit to 5 most important
3. **Option C:** Services API returns `featured` flag, show those in footer

Current footer has 5 specific services + "View All Services" link. Consider whether this should be:
- A separate WordPress menu location (editorial control)
- Auto-generated from services with a `show_in_footer` custom field
- Kept static (changes rarely)

**Phase to address:** Footer Architecture Phase - decide data source

---

### Pitfall 12: PWA Offline Mode Shows Empty Navigation

**What goes wrong:**
User goes offline, workbox serves cached page but navigation API call fails. User sees blank header/footer because fallback isn't in service worker cache.

**How to avoid:**
- Ensure navigation API route is included in `workbox.runtimeCaching`
- Use `NetworkFirst` strategy (already configured for WP API in nuxt.config.ts)
- Test offline mode explicitly

```typescript
// nuxt.config.ts - already has WP API caching
workbox: {
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/www\.vp-associates\.com\/wp-json\/wp\/v2\/.*/i,
      handler: 'NetworkFirst',  // Falls back to cache when offline
      options: {
        cacheName: 'wp-api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 // 24 hours
        }
      }
    }
  ]
}
```

But navigation should be on internal API route (`/api/navigation`) - add caching for that:
```typescript
{
  urlPattern: /^\/api\/(navigation|footer).*/i,
  handler: 'NetworkFirst',
  options: {
    cacheName: 'nav-api-cache',
    expiration: {
      maxEntries: 10,
      maxAgeSeconds: 60 * 60 // 1 hour
    }
  }
}
```

**Phase to address:** PWA Integration Phase

---

### Pitfall 13: Search Icon/CTA Button Handling

**What goes wrong:**
Current navigation has special items that aren't standard links:
- Search icon (opens search, no standard URL)
- Contact CTA button (styled differently)
- PWA install prompt

API-driven menu doesn't distinguish these. All items render as plain links.

**How to avoid:**
```typescript
// Add custom fields in WordPress menu item
// OR handle by URL pattern
const specialItems = {
  search: '/search',      // Render as icon
  contact: '/contact',    // Render as CTA button
}

// In template
<template v-for="item in menuItems">
  <SearchButton v-if="item.url === '/search'" />
  <NuxtLink
    v-else-if="item.url === '/contact'"
    :to="item.url"
    class="px-5 py-2.5 bg-primary text-white rounded-lg"
  >
    {{ item.title }}
  </NuxtLink>
  <NuxtLink v-else :to="item.url">
    {{ item.title }}
  </NuxtLink>
</template>
```

Or use WordPress menu item CSS classes to signal intent.

**Phase to address:** Component Implementation Phase

---

## Phase-to-Pitfall Mapping

| Phase | Pitfalls Addressed | Success Criteria |
|-------|-------------------|------------------|
| WordPress Configuration | 1, 6 | Menu endpoints return data without auth |
| API Integration | 2, 3, 9 | Hierarchical menu with correct URLs |
| Fallback Strategy | 4, 12 | Fallback matches current navigation exactly |
| Caching Strategy | 5, 12 | 15-min cache with bypass option |
| Component Implementation | 7, 8, 10, 13 | Feature-flagged, accessible, matches current UX |
| Footer Architecture | 6, 11 | Contact info and services from API with fallback |
| Integration Testing | 7, 8, 10 | All accessibility features preserved, no regressions |

---

## Integration Checklist

### Before Starting
- [ ] Verify WordPress version >= 6.8 (or install menu plugin)
- [ ] Add `rest_menu_read_access` filter in WordPress
- [ ] Test menu endpoint returns data: `GET /wp-json/wp/v2/menu-items?menus=<menu_id>`
- [ ] Identify menu locations: primary, footer-links, footer-services

### During Development
- [ ] Feature flag implemented (`dynamicNavigation`)
- [ ] Parallel components created (don't modify existing)
- [ ] URL transformation handles WordPress domain
- [ ] Flat-to-hierarchical transform works
- [ ] Static fallback created matching current nav
- [ ] All ARIA attributes preserved from current implementation

### Before Merge
- [ ] Lighthouse Accessibility score >= current (90+)
- [ ] Keyboard navigation test passed (Tab through all items)
- [ ] Screen reader test passed (current page announced)
- [ ] Mobile menu test passed (open/close, route change)
- [ ] Offline test passed (navigation cached)
- [ ] Feature flag toggle works both ways
- [ ] Fallback serves when API blocked

### After Launch
- [ ] Document fallback update process
- [ ] Document cache invalidation for content editors
- [ ] Remove feature flag after 1 week stable
- [ ] Delete old hardcoded components

---

## Quick Reference: Current vs Dynamic

| Feature | Current (Hardcoded) | Dynamic (API) |
|---------|---------------------|---------------|
| Data source | AppHeader.vue template | WordPress menu API |
| Update process | Code deploy | WordPress admin |
| Fallback | N/A (is the fallback) | Static array in API route |
| Caching | None (static) | 15-min server cache |
| Accessibility | Built-in | Must preserve in component |
| Special items | Inline handling | URL-based detection |

---

## Sources

### Official Documentation (HIGH confidence)
- [WordPress REST API Nav Menu Items](https://developer.wordpress.org/rest-api/reference/nav_menu_items/)
- [WordPress 6.8 Menu Filter](https://make.wordpress.org/core/2025/03/27/new-rest-api-filter-for-exposing-menus-publicly-in-wordpress-6-8/)
- [wp_make_link_relative()](https://developer.wordpress.org/reference/functions/wp_make_link_relative/)
- [Vue.js Accessibility Guide](https://vuejs.org/guide/best-practices/accessibility)

### Plugins & Extensions (MEDIUM confidence)
- [WP-REST-API V2 Menus](https://wordpress.com/plugins/wp-rest-api-v2-menus)
- [Headless CMS Plugin](https://github.com/imranhsayed/headless-cms)
- [WUXT Headless Extensions](https://wordpress.com/plugins/wuxt-headless-wp-api-extensions)

### Community Resources (MEDIUM confidence)
- [Nuxt + Headless WordPress Challenges](https://medium.com/@chris.geelhoed/nuxt-and-headless-wordpress-motivations-and-challenges-3685f649e045)
- [WPGraphQL Menu Patterns](https://www.wpgraphql.com/docs/menus)

### Existing Codebase (HIGH confidence)
- `/components/AppHeader.vue` - Current navigation implementation
- `/components/AppFooter.vue` - Current footer implementation
- `/server/api/services.get.ts` - API pattern with caching and fallback
- `/composables/useApi.ts` - WordPress API types and utilities

---

*Pitfalls research for: VP Associates Website v1.3 WordPress Menu/Footer Integration*
*Researched: 2026-02-10*
*Focus: Adding WordPress-managed navigation without breaking existing functionality*
