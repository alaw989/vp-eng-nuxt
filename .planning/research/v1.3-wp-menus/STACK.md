# Technology Stack: WordPress Menu & Footer Integration

**Project:** VP Associates - WordPress Navigation Management
**Researched:** 2026-02-10
**Overall Confidence:** HIGH

---

## Executive Summary

WordPress menu REST API endpoints exist in core WordPress (`/wp/v2/menus`, `/wp/v2/menu-items`, `/wp/v2/menu-locations`) but require authentication by default. WordPress 6.8 (March 2025) introduced the `rest_menu_read_access` filter to enable public access without plugins. For footer content, ACF options pages with custom REST endpoints are the standard headless approach, but the current WordPress installation lacks ACF REST API exposure.

**Recommendation:** Use WordPress native menus with the `rest_menu_read_access` filter (single PHP snippet). Create custom REST endpoints for footer content. No new Nuxt dependencies required - follow existing composables pattern.

---

## Current State Analysis

### Existing WordPress API Structure (Verified)

| Endpoint | Status | Authentication |
|----------|--------|----------------|
| `/wp/v2/services` | Active | Public (custom CPT) |
| `/wp/v2/projects` | Active | Public (custom CPT) |
| `/wp/v2/team` | Active | Public (custom CPT) |
| `/wp/v2/testimonials` | Active | Public (custom CPT) |
| `/wp/v2/menus` | Exists | **401 - Requires auth** |
| `/wp/v2/menu-items` | Exists | **401 - Requires auth** |
| `/wp/v2/menu-locations` | Exists | **401 - Requires auth** |

**Source:** Direct API testing of `https://www.vp-associates.com/wp-json/`

### Available WordPress Namespaces (Verified)

```
- oembed/1.0
- foogallery/v1
- really-simple-security/v1/two-fa/v2
- wp/v2
```

**Note:** No ACF namespace present (`acf/v3` not available). ACF to REST API plugin is not installed.

### Existing Nuxt Patterns (Verified)

The codebase uses established patterns that should be followed:

1. **Server-side API routes** with caching (`/server/api/services.get.ts`)
2. **Composables** for client consumption (`useInternalServices()`, etc.)
3. **Static fallback data** for resilience when API unavailable
4. **30-minute server-side cache** using Nitro storage

---

## Recommended Stack

### WordPress Side: Required Changes

| Component | Action | Rationale |
|-----------|--------|-----------|
| **Menu Public Access Filter** | ADD | WordPress 6.8+ has `rest_menu_read_access` filter - enables public menu API without plugins |
| **Custom Footer Endpoint** | ADD | No standard REST endpoint for site options - need custom route |
| **ACF to REST API Plugin** | DO NOT ADD | Heavyweight for just footer fields; custom endpoint is simpler |
| **WP REST API Menus Plugin** | DO NOT ADD | WordPress 6.8 made this obsolete with native support |

#### Required PHP Code (WordPress Theme or Plugin)

**1. Enable Public Menu Access (WordPress 6.8+)**

```php
/**
 * Enable public read access to WordPress menus via REST API
 * Required for headless Nuxt frontend
 * @since WordPress 6.8
 */
add_filter('rest_menu_read_access', '__return_true');
```

This single line enables:
- `GET /wp/v2/menus` - List all menus
- `GET /wp/v2/menu-items?menus=<id>` - Get items for a specific menu
- `GET /wp/v2/menu-locations` - Get registered menu locations

**Source:** [Make WordPress Core - REST API Filter for Menus in 6.8](https://make.wordpress.org/core/2025/03/27/new-rest-api-filter-for-exposing-menus-publicly-in-wordpress-6-8/)

**2. Custom Footer Content Endpoint**

```php
/**
 * Register custom REST endpoint for footer content
 * Exposes site options without requiring ACF plugin
 */
add_action('rest_api_init', function() {
    register_rest_route('vpa/v1', '/footer', [
        'methods' => 'GET',
        'callback' => 'vpa_get_footer_content',
        'permission_callback' => '__return_true', // Public access
    ]);
});

function vpa_get_footer_content() {
    return [
        'company' => [
            'name' => get_bloginfo('name'),
            'description' => get_option('vpa_footer_description', 'Providing structural engineering services to Tampa Bay and surrounding areas for over 30 years.'),
            'license' => get_option('vpa_footer_license', 'FL License #PEC-0001234'),
        ],
        'contact' => [
            'address' => get_option('vpa_contact_address', 'Tampa Bay Area, Florida'),
            'phone' => get_option('vpa_contact_phone', '(813) 555-1234'),
            'email' => get_option('vpa_contact_email', 'info@vp-associates.com'),
            'hours' => get_option('vpa_contact_hours', 'Mon-Fri: 8:00 AM - 5:00 PM'),
        ],
        'social' => [
            'linkedin' => get_option('vpa_social_linkedin', 'https://linkedin.com'),
            'facebook' => get_option('vpa_social_facebook', 'https://facebook.com'),
        ],
        'copyright_year' => date('Y'),
    ];
}
```

**Why custom options instead of ACF:**
- Simpler - no plugin dependency
- Lighter - only expose what's needed
- Matches existing CPT pattern
- Easy to add WordPress admin UI later with Settings API

### Nuxt Side: Required Changes

| Component | Action | Rationale |
|-----------|--------|-----------|
| **New composable: `useNavigation.ts`** | ADD | Fetch and transform WordPress menu data |
| **New composable: `useFooterContent.ts`** | ADD | Fetch footer options from custom endpoint |
| **New server route: `/api/navigation.get.ts`** | ADD | Server-side caching for menu data |
| **New server route: `/api/footer.get.ts`** | ADD | Server-side caching for footer content |
| **Static fallback data** | ADD | Navigation and footer fallbacks |
| **TypeScript interfaces** | ADD | Type safety for menu/footer structures |
| **WPNuxt module** | DO NOT ADD | Uses GraphQL; existing REST pattern is established |
| **New npm packages** | NONE | Use existing `useFetch` and Nitro storage |

#### Recommended File Structure

```
composables/
  useNavigation.ts          # NEW - Menu composable
  useFooterContent.ts       # NEW - Footer composable

server/api/
  navigation.get.ts         # NEW - Menu proxy with caching
  footer.get.ts             # NEW - Footer proxy with caching

types/
  navigation.ts             # NEW - TypeScript interfaces
```

---

## TypeScript Interfaces

```typescript
// types/navigation.ts

export interface WPMenuItem {
  id: number
  title: { rendered: string }
  url: string
  menu_order: number
  parent: number
  target: string  // '_blank' | ''
  attr_title: string
  classes: string[]
  menus: number  // Menu ID this item belongs to
}

export interface WPMenu {
  id: number
  name: string
  slug: string
  description: string
  locations: string[]
}

export interface WPMenuLocation {
  name: string
  description: string
  menu: number  // Assigned menu ID
}

export interface NavigationItem {
  id: number
  label: string
  href: string
  target?: string
  children?: NavigationItem[]
}

export interface FooterContent {
  company: {
    name: string
    description: string
    license: string
  }
  contact: {
    address: string
    phone: string
    email: string
    hours: string
  }
  social: {
    linkedin: string
    facebook: string
  }
  copyright_year: number
}
```

---

## API Response Structures

### WordPress Menu Items Response

**Endpoint:** `GET /wp/v2/menu-items?menus=<menu_id>&_fields=id,title,url,menu_order,parent,target,classes`

```json
[
  {
    "id": 42,
    "title": { "rendered": "Home" },
    "url": "https://vp-associates.com/",
    "menu_order": 1,
    "parent": 0,
    "target": "",
    "classes": ["menu-item"]
  },
  {
    "id": 43,
    "title": { "rendered": "Services" },
    "url": "https://vp-associates.com/services/",
    "menu_order": 2,
    "parent": 0,
    "target": "",
    "classes": ["menu-item", "menu-item-has-children"]
  }
]
```

### Custom Footer Response

**Endpoint:** `GET /wp-json/vpa/v1/footer`

```json
{
  "company": {
    "name": "VP Associates",
    "description": "Providing structural engineering services...",
    "license": "FL License #PEC-0001234"
  },
  "contact": {
    "address": "Tampa Bay Area, Florida",
    "phone": "(813) 555-1234",
    "email": "info@vp-associates.com",
    "hours": "Mon-Fri: 8:00 AM - 5:00 PM"
  },
  "social": {
    "linkedin": "https://linkedin.com/company/vp-associates",
    "facebook": "https://facebook.com/vpassociates"
  },
  "copyright_year": 2026
}
```

---

## Caching Strategy

Follow established pattern from `services.get.ts`:

| Data Type | Cache TTL | Rationale |
|-----------|-----------|-----------|
| Navigation menus | 60 minutes | Menus change rarely, longer cache is safe |
| Footer content | 60 minutes | Site settings change rarely |
| Menu structure | Invalidate on WordPress publish | Optional webhook integration |

**Server-side caching implementation:**

```typescript
// server/api/navigation.get.ts
const navigationStorage = useStorage('navigation')
const CACHE_KEY = 'main_menu'
const CACHE_TTL = 60 * 60 * 1000 // 60 minutes
```

**PWA caching already configured:** The existing workbox config caches WordPress API responses for 24 hours with NetworkFirst strategy. Menu and footer endpoints will automatically benefit from this.

---

## Alternatives Considered

### Alternative 1: WPNuxt Module

**What:** Full Nuxt module for headless WordPress using GraphQL

**Why NOT:**
- Requires WPGraphQL plugin on WordPress
- Different pattern from existing REST API approach
- Overkill for just menus/footer
- Would require refactoring existing composables

**Source:** [WPNuxt Documentation](https://wpnuxt.com/)

### Alternative 2: ACF Options Page + ACF to REST API Plugin

**What:** ACF PRO options page with dedicated REST endpoints

**Why NOT:**
- ACF to REST API plugin adds `/acf/v3/` namespace with many endpoints
- Heavier than needed for 5-10 footer fields
- ACF not currently installed (would need both ACF PRO + REST plugin)
- Custom endpoint is simpler and matches existing architecture

**Source:** [ACF REST API Integration](https://www.advancedcustomfields.com/resources/wp-rest-api-integration/)

### Alternative 3: WP REST API Menus Plugin

**What:** Third-party plugin that adds `/menus/v1/` endpoints

**Why NOT:**
- WordPress 6.8 made this obsolete (March 2025)
- Native core support is now available
- One more plugin to maintain

**Source:** [WP REST Menus Plugin](https://wordpress.com/plugins/wp-rest-menu)

### Alternative 4: Hardcoded with WordPress Services List

**What:** Keep navigation hardcoded but populate footer services from existing API

**Why NOT:**
- Doesn't solve the core problem (client can't edit nav)
- Partial solution creates inconsistent editing experience
- Still requires code changes for nav updates

---

## Security Considerations

### Menu Public Access

The `rest_menu_read_access` filter makes menus readable by anyone. This is intentional for headless use.

**Risk:** Menu structure visible publicly
**Mitigation:** Menus contain only public navigation - no sensitive data

### Custom Footer Endpoint

**Risk:** Exposing site options publicly
**Mitigation:** Only expose specific, non-sensitive fields via whitelist approach

**DO NOT expose:**
- Admin email (`admin_email`)
- Site URL internals
- Plugin/theme settings
- User data

---

## Implementation Order

1. **WordPress: Add menu filter** (5 minutes)
   - Single line in `functions.php` or mu-plugin
   - Test with direct API call

2. **WordPress: Add footer endpoint** (30 minutes)
   - Register custom route
   - Add options with sensible defaults
   - Optionally add Settings page for admin UI

3. **Nuxt: Create server routes** (1 hour)
   - `/api/navigation.get.ts`
   - `/api/footer.get.ts`
   - Follow existing caching pattern

4. **Nuxt: Create composables** (1 hour)
   - `useNavigation.ts`
   - `useFooterContent.ts`
   - Include static fallbacks

5. **Nuxt: Update components** (2 hours)
   - Refactor `AppHeader.vue` to use `useNavigation`
   - Refactor `AppFooter.vue` to use `useFooterContent`
   - Maintain accessibility features

6. **Test & validate** (1 hour)
   - Verify fallbacks work when API unavailable
   - Test mobile menu behavior
   - Confirm PWA caching works

---

## Installation Summary

### WordPress (Theme or mu-plugin)

No plugins required. Add to `functions.php` or create `mu-plugins/vpa-rest-api.php`:

```php
<?php
/**
 * Plugin Name: VPA REST API Extensions
 * Description: Enables public menu access and footer content endpoint for headless frontend
 * Version: 1.0.0
 */

// Enable public menu access (WordPress 6.8+)
add_filter('rest_menu_read_access', '__return_true');

// Register footer endpoint
add_action('rest_api_init', function() {
    register_rest_route('vpa/v1', '/footer', [
        'methods' => 'GET',
        'callback' => 'vpa_get_footer_content',
        'permission_callback' => '__return_true',
    ]);
});

function vpa_get_footer_content() {
    return [
        'company' => [
            'name' => get_bloginfo('name'),
            'description' => get_option('vpa_footer_description', 'Providing structural engineering services to Tampa Bay and surrounding areas for over 30 years.'),
            'license' => get_option('vpa_footer_license', 'FL License #PEC-0001234'),
        ],
        'contact' => [
            'address' => get_option('vpa_contact_address', 'Tampa Bay Area, Florida'),
            'phone' => get_option('vpa_contact_phone', '(813) 555-1234'),
            'email' => get_option('vpa_contact_email', 'info@vp-associates.com'),
            'hours' => get_option('vpa_contact_hours', 'Mon-Fri: 8:00 AM - 5:00 PM'),
        ],
        'social' => [
            'linkedin' => get_option('vpa_social_linkedin', ''),
            'facebook' => get_option('vpa_social_facebook', ''),
        ],
        'copyright_year' => date('Y'),
    ];
}
```

### Nuxt

No new dependencies. Use existing patterns:
- `useFetch` for data fetching
- `useStorage` (Nitro) for server-side caching
- Static fallback objects for resilience

---

## Confidence Assessment

| Decision | Confidence | Rationale |
|----------|------------|-----------|
| Use native WP menu API | HIGH | Verified endpoints exist at `/wp/v2/menus`, documented in official WordPress REST API handbook |
| `rest_menu_read_access` filter | HIGH | Documented in Make WordPress Core (March 2025), confirmed WordPress 6.8 feature |
| Custom footer endpoint vs ACF | HIGH | Simpler, lighter, matches existing architecture pattern |
| No new Nuxt packages | HIGH | Existing `useFetch` and storage patterns are established and working |
| 60-minute cache TTL | MEDIUM | Reasonable for menu/footer data; can adjust based on client editing frequency |
| Static fallbacks | HIGH | Matches existing pattern in `services.get.ts`, proven approach |

---

## Sources

### Official Documentation
- [WordPress REST API - Menu Locations](https://developer.wordpress.org/rest-api/reference/menu-locations/)
- [WordPress REST API - Nav Menus](https://developer.wordpress.org/rest-api/reference/nav_menus/)
- [ACF REST API Integration](https://www.advancedcustomfields.com/resources/wp-rest-api-integration/)
- [ACF Options Page](https://www.advancedcustomfields.com/resources/options-page/)

### WordPress 6.8 Menu API Changes
- [Make WordPress Core - REST API Filter for Menus in 6.8](https://make.wordpress.org/core/2025/03/27/new-rest-api-filter-for-exposing-menus-publicly-in-wordpress-6-8/)
- [Public REST API Access for WordPress Menus](https://snippets.cloud/public-rest-api-access-for-wordpress-menus/)
- [WordPress 6.8 Public Menus via REST API](https://www.pootlepress.com/2025/03/new-in-wordpress-6-8-public-menus-via-rest-api-perfect-for-headless-no-code-builders/)

### Nuxt Patterns
- [Nuxt Custom useFetch](https://nuxt.com/docs/guide/recipes/custom-usefetch)
- [Headless WordPress with Nuxt 3](https://wpengine.com/builders/headless-wordpress-nuxt-3-vue-3/)
- [WPNuxt](https://wpnuxt.com/) (considered but not recommended)

### Verified via Direct Testing
- WordPress REST API at `https://www.vp-associates.com/wp-json/` (menu endpoints return 401, confirming auth required)
- Available namespaces: `oembed/1.0`, `foogallery/v1`, `really-simple-security/v1`, `wp/v2`
- No ACF namespace present
