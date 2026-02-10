# Feature Landscape: WordPress-Managed Navigation and Footer

**Domain:** CMS-Managed Navigation for Headless WordPress + Nuxt 3
**Project:** VP Associates Website - Structural Engineering Firm
**Milestone:** v1.3 WordPress-Managed Navigation
**Researched:** 2026-02-10
**Overall Confidence:** HIGH

## Executive Summary

This research covers the expected features and behaviors when header navigation and footer content are managed through WordPress CMS rather than hardcoded. Key findings: **WordPress 6.8+ now has native public menu API access** (no plugin needed); **menu items must be fetched separately from menu definitions**; **hierarchical menus require client-side tree building**; **caching is critical for layout components**.

### Critical Insights

1. **WordPress REST API has three menu-related endpoints** - `/menus` (menu definitions), `/menu-items` (individual items), `/menu-locations` (where menus are assigned)
2. **Flat array response requires tree building** - WordPress returns menu items as flat array with `parent` field; frontend must build hierarchy
3. **Footer content is typically ACF Options Page** - Contact info, hours, social links stored in global options, exposed via custom endpoint
4. **Caching is essential for layout stability** - Navigation loads on every page; must be cached client-side and have SSR fallback
5. **Current site has 7 nav items** - Home, About, Services, Projects, Careers, Search, Contact (6 standard + 1 CTA button)

## Current Implementation Analysis

**Header (hardcoded):**
- Logo linking to home
- 7 desktop nav items (Home, About, Services, Projects, Careers, Search icon, Contact CTA)
- Mobile hamburger menu with same 7 items
- Sticky header with scroll shadow
- Search icon instead of text on desktop
- PWA install prompt in nav

**Footer (hardcoded):**
- 4-column layout: Company Info, Quick Links, Services, Contact
- Company description + license info
- Quick links: About, Services, Projects, Contact
- Services: 5 service links + "View All" link
- Contact: Address, phone, email, hours
- Bottom bar: Copyright, Sitemap, LinkedIn, Facebook

## Table Stakes

Features users/editors MUST have when navigation comes from CMS. Missing = integration feels broken.

### Navigation Table Stakes

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| **Fetch menu by location** | Standard CMS pattern | LOW | WP Menu API | "primary-menu", "footer-menu" locations |
| **Menu item titles from CMS** | Core editing requirement | LOW | Menu Items endpoint | Support `title.rendered` field |
| **Menu item URLs from CMS** | Core editing requirement | LOW | Menu Items endpoint | Support `url` field |
| **Internal vs external link handling** | Nuxt uses `NuxtLink` for internal | MEDIUM | URL parsing | External = `<a>`, internal = `<NuxtLink>` |
| **Menu order preserved** | Editors expect WYSIWYG order | LOW | `menu_order` field | Sort by menu_order ascending |
| **CTA button styling** | Contact button is styled differently | LOW | CSS class or custom field | Mark item as "button" type |
| **Active state indication** | Current page highlighted | LOW | Route matching | `aria-current="page"` attribute |
| **Mobile menu items match desktop** | Consistent navigation | LOW | Same data source | Render same menu data differently |
| **Graceful error handling** | API failure shouldn't break site | MEDIUM | Fallback strategy | Hardcoded fallback if API fails |
| **Loading state (no flash)** | Menu shouldn't pop in late | MEDIUM | SSR + caching | Pre-render or cache for instant display |

### Footer Table Stakes

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| **Editable contact info** | Phone/email changes without deploy | LOW | ACF Options | Phone, email, address, hours |
| **Editable company description** | Brand messaging changes | LOW | ACF Options | About paragraph text |
| **Editable social links** | Platform URLs change | LOW | ACF Options | LinkedIn, Facebook URLs |
| **Quick links menu from CMS** | Footer nav editable | LOW | WP Menu API | "footer-quick-links" location |
| **Services links (dynamic)** | Auto-update when services change | LOW | Existing Services API | Already have this endpoint |
| **Copyright year auto-update** | No manual updates needed | LOW | JavaScript | Already implemented: `currentYear` |
| **License number editable** | Compliance info may change | LOW | ACF Options | FL License field |

## Differentiators

Nice-to-have features that enhance the CMS experience beyond basics.

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| **Dropdown/nested menus** | Future-proof for site growth | MEDIUM | Tree building, CSS | Services dropdown could show all services |
| **Menu item icons** | Visual enhancement | LOW | Custom field + Icon component | mdi icons via class name |
| **Menu item descriptions** | Enhanced mega-menu potential | LOW | `description` field | Mostly unused for simple nav |
| **Open in new tab option** | External link control | LOW | `target` field | `_blank` for external |
| **CSS class customization** | Per-item styling | LOW | `classes` field | WordPress supports this natively |
| **Preview mode support** | Editors see changes before publish | HIGH | WP Preview API + auth | Complex token handling |
| **On-demand revalidation** | Instant updates when menu changes | MEDIUM | Webhook + cache invalidation | WP webhook to Nuxt API |
| **Footer widget areas** | Flexible content blocks | HIGH | ACF Flexible Content | Overkill for simple footer |
| **Multiple footer variants** | Different footers per page | MEDIUM | Page meta + conditional | Not needed for 8-page site |
| **A/B testing nav items** | Optimize conversions | HIGH | Analytics integration | Overengineered for this scale |
| **Announcement bar from CMS** | Promotional banner | MEDIUM | ACF Options + dismiss logic | Not requested, but common |

## Anti-Features

Features to deliberately NOT build for this scope. Over-engineering risks.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Mega menu builder** | 8-page site doesn't need it, massive complexity | Simple dropdown if needed later |
| **Visual menu drag-drop in Nuxt** | WordPress already has this, don't duplicate | Use WP admin for editing |
| **Real-time collaborative editing** | Enterprise feature, not needed | Standard WP publish workflow |
| **Menu versioning/rollback** | Overkill for simple site | Manual backup if needed |
| **GraphQL for menus** | REST API is sufficient, adds WPGraphQL dependency | Use native REST endpoints |
| **Multiple header variants** | One header design is sufficient | Single `AppHeader.vue` |
| **Personalized menus** | No user accounts, no personalization | Same menu for all visitors |
| **Menu item analytics** | Over-instrumentation | Track page visits, not menu clicks |
| **Conditional menu items** | Show/hide based on conditions | All items visible to all users |
| **Menu scheduling** | Show items at certain times | Publish/unpublish manually |
| **Footer sticky to bottom** | Current design works | Keep existing `flex-1` main |
| **Infinite footer columns** | 4 columns is plenty | Fixed 4-column grid |
| **Footer accordion on mobile** | Current stacked layout works | Keep simple stack |

## Feature Dependencies

```
[WordPress Menu Integration]
    ├── requires → [WordPress 6.8+ OR WP-REST-API-V2-Menus plugin]
    ├── requires → [Menu registered in theme/plugin: register_nav_menus()]
    └── requires → [Menu assigned to location in WP admin]

[ACF Options Page for Footer]
    ├── requires → [ACF Pro plugin installed]
    ├── requires → [Options page registered: acf_add_options_page()]
    ├── requires → [Fields exposed to REST API: "Show in REST API" setting]
    └── requires → [Custom REST endpoint OR acf-to-rest-api plugin]

[Nuxt Menu Composable]
    ├── depends on → [useApi.ts pattern (already exists)]
    ├── depends on → [Error handling patterns (already exists)]
    └── outputs → [Typed menu data for components]

[AppHeader.vue Refactor]
    ├── depends on → [Nuxt Menu Composable]
    ├── depends on → [Menu caching strategy]
    └── maintains → [Current a11y features (skip links, ARIA, focus management)]

[AppFooter.vue Refactor]
    ├── depends on → [ACF Options endpoint]
    ├── depends on → [Quick Links menu composable]
    └── maintains → [Current 4-column layout]
```

## WordPress API Data Structures

### Menu Items Response (from `/wp/v2/menu-items?menus=<id>`)

```typescript
interface WPMenuItem {
  id: number
  title: { rendered: string }
  url: string
  menu_order: number
  parent: number              // 0 = top level, otherwise parent menu item ID
  type: 'custom' | 'post_type' | 'taxonomy'
  object: string              // 'page', 'post', 'category', 'custom'
  target: string              // '' or '_blank'
  classes: string[]           // CSS classes
  description: string
  attr_title: string          // Title attribute (tooltip)
  menus: number               // Menu ID this item belongs to
}
```

### Transformed Menu Tree (frontend)

```typescript
interface MenuItem {
  id: number
  title: string
  url: string
  order: number
  target?: '_blank'
  classes?: string[]
  isExternal: boolean
  isButton: boolean           // Check for 'btn' or 'button' class
  children?: MenuItem[]       // Nested items built from parent field
}
```

### ACF Options Response (custom endpoint)

```typescript
interface SiteOptions {
  company_description: string
  license_number: string
  address: string
  phone: string
  email: string
  hours: string
  facebook_url: string
  linkedin_url: string
}
```

## Caching Strategy

### Recommended Approach: SSR + SWR

| Content Type | Cache Strategy | TTL | Reason |
|--------------|---------------|-----|--------|
| Main menu | SSR + localStorage | 1 hour | Rarely changes, critical for render |
| Footer menu | SSR + localStorage | 1 hour | Rarely changes, below fold |
| Site options | SSR + localStorage | 1 hour | Company info rarely changes |
| Service links | SSR (existing) | 1 hour | Already cached in current impl |

### Implementation Pattern

```typescript
// Server-side: Pre-fetch during SSR for initial render
const { data: menu } = await useFetch('/api/menu/primary')

// Client-side: Cache in localStorage, stale-while-revalidate
const cachedMenu = useLocalStorage('site-menu', menu)
```

### Fallback Strategy

1. **On SSR**: Fetch from WordPress API
2. **On API failure**: Return hardcoded fallback
3. **On client**: Use SSR-hydrated data or localStorage cache
4. **On hydration mismatch**: Prefer server data

## MVP Feature Set

For MVP (Milestone v1.3), prioritize:

### Must Have (Phase 1)
1. Main navigation from WP menu (7 items)
2. Footer quick links from WP menu
3. Footer contact info from ACF options
4. Footer social links from ACF options
5. Error handling with hardcoded fallback
6. SSR rendering (no layout shift)

### Should Have (Phase 1 stretch)
7. Menu item as button (CTA styling)
8. Open in new tab support
9. Internal vs external link detection

### Defer to Later
- Dropdown/nested menus
- Menu item icons
- On-demand revalidation (webhook)
- Preview mode

## Testing Requirements

| Test Type | Coverage | Notes |
|-----------|----------|-------|
| **API integration tests** | Menu fetch, options fetch | Mock WP responses |
| **Component unit tests** | Menu rendering, link handling | Test with mock data |
| **E2E navigation tests** | All nav items work | Playwright existing patterns |
| **Accessibility tests** | Keyboard nav, screen reader | Maintain WCAG 2.1 AA |
| **Fallback tests** | API failure handling | Simulate 500/timeout |
| **Mobile tests** | Hamburger menu, footer stack | Existing viewport tests |

## Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| WP Menu API | HIGH | Official WordPress documentation verified |
| ACF Options API | HIGH | Official ACF documentation verified |
| Nuxt integration | HIGH | Existing patterns in codebase |
| Caching strategy | MEDIUM | Standard pattern but needs testing |
| Fallback handling | MEDIUM | Pattern is clear, implementation needs care |

## Sources

### Official Documentation
- [WordPress REST API - Nav_Menus](https://developer.wordpress.org/rest-api/reference/nav_menus/)
- [WordPress REST API - Menu Locations](https://developer.wordpress.org/rest-api/reference/menu-locations/)
- [WordPress REST API - Nav_Menu_Items](https://developer.wordpress.org/rest-api/reference/nav_menu_items/)
- [ACF Options Page](https://www.advancedcustomfields.com/resources/options-page/)
- [ACF REST API Integration](https://www.advancedcustomfields.com/resources/wp-rest-api-integration/)

### Community Resources
- [WordPress 6.8 Public Menus via REST API](https://www.pootlepress.com/2025/03/new-in-wordpress-6-8-public-menus-via-rest-api-perfect-for-headless-no-code-builders/)
- [WPNuxt - Nuxt 3 + Headless WordPress](https://wpnuxt.com/)
- [Headless WordPress with Nuxt 3](https://wpengine.com/builders/headless-wordpress-nuxt-3-vue-3/)
- [Navigation Menu Best Practices](https://www.dreamhost.com/blog/navigation-menu-design/)

### Plugins (if WordPress < 6.8)
- [WP-REST-API V2 Menus](https://wordpress.com/plugins/wp-rest-api-v2-menus)
- [ACF to REST API](https://github.com/airesvsg/acf-to-rest-api)
