# Project Research Summary

**Project:** v1.3 CMS Control Expansion - WordPress Menu/Footer Integration
**Domain:** Headless WordPress Navigation Management with Nuxt 3
**Researched:** 2026-02-10
**Confidence:** HIGH

## Executive Summary

This research covers adding WordPress-managed navigation and footer content to an existing Nuxt 3 headless site that currently uses hardcoded navigation. The VP Associates engineering website needs to enable client editing of header navigation and footer content without requiring code deployments.

**Recommended approach:** Use WordPress 6.8+ native menu API with `rest_menu_read_access` filter (single PHP snippet), create custom REST endpoints for footer content, and follow established server-side caching patterns already proven in the codebase. No new Nuxt dependencies required - the solution leverages existing `useFetch` and Nitro storage patterns from `services.get.ts`. **Critical insight:** WordPress menu API requires explicit public access configuration, and menu items are returned as flat arrays requiring client-side hierarchy building.

**Key risks:** Menu API fails without proper WordPress configuration, static fallbacks become outdated if not maintained, and accessibility features could regress during component migration. Mitigation involves feature flagging for safe rollouts, maintaining parity between fallbacks and live navigation, and preserving existing ARIA attributes during component refactoring.

## Key Findings

### Recommended Stack

WordPress 6.8+ introduced `rest_menu_read_access` filter making plugins unnecessary for menu API access. The solution requires minimal WordPress configuration (single PHP filter) and leverages existing Nuxt patterns extensively.

**Core technologies:**
- **WordPress native menu API** — `/wp/v2/menus`, `/wp/v2/menu-items` endpoints — WordPress 6.8+ native support eliminates plugin dependency
- **Custom REST endpoint for footer** — `/wp-json/vpa/v1/footer` — lighter than ACF options page, matches existing architecture
- **Nitro storage caching** — server-side 60-min cache — follows established pattern from `services.get.ts`
- **Static fallback strategy** — hardcoded navigation arrays — ensures site functionality during API failures

### Expected Features

WordPress menu integration requires both basic CMS functionality and advanced navigation features specific to the current site design.

**Must have (table stakes):**
- Menu items editable via WordPress admin — core requirement for CMS control
- URL transformation from absolute to relative — WordPress returns full URLs but Nuxt needs relative paths
- Hierarchical menu support — flat API response requires client-side tree building
- Footer contact info from API — address, phone, email, hours must be editable
- Static fallbacks matching current nav — preserve functionality when API unavailable

**Should have (competitive):**
- Button-style menu items — Contact CTA requires special styling
- External vs internal link handling — `<a>` for external, `<NuxtLink>` for internal
- Menu order preservation — editors expect WYSIWYG ordering
- Cache invalidation mechanism — manual refresh option for urgent updates

**Defer (v2+):**
- Dropdown/mega menus — current site has flat navigation
- Menu item icons — visual enhancement not required for MVP
- Real-time preview mode — complex authentication, not essential
- Webhook cache invalidation — manual cache busting sufficient initially

### Architecture Approach

The integration follows existing headless patterns with server-side caching and composable-based client access. Two new server API routes (`/api/navigation/menus.get.ts`, `/api/navigation/footer.get.ts`) proxy WordPress data with transformation and caching. New composables (`useNavigation.ts`) provide reactive menu data following patterns from `useInternalServices()`.

**Major components:**
1. **WordPress API Configuration** — `rest_menu_read_access` filter + custom footer endpoint
2. **Server API Routes** — caching proxy with URL transformation and static fallbacks
3. **Client Composables** — reactive menu data with loading states and error handling
4. **Component Updates** — AppHeader.vue and AppFooter.vue consume API data while preserving existing accessibility

### Critical Pitfalls

Research identified several high-risk failure modes specific to retrofitting dynamic navigation onto existing hardcoded navigation.

1. **WordPress Menu API Returns 401 by Default** — WordPress 6.8+ requires explicit `rest_menu_read_access` filter configuration for public access
2. **Menu Items Returned as Flat List** — API provides flat array with `parent` references, requiring client-side hierarchy building for nested menus
3. **Absolute URLs Break Client Navigation** — WordPress returns full URLs but Nuxt needs relative paths to maintain SPA behavior
4. **Static Fallbacks Become Stale** — fallback navigation must match current hardcoded navigation exactly or users see different menus during API failures
5. **Accessibility Regression Risk** — current AppHeader.vue has 8+ accessibility features that must be preserved during API migration

## Implications for Roadmap

Based on research, suggested phase structure prioritizes WordPress configuration and API stability before component changes:

### Phase 1: WordPress API Foundation
**Rationale:** All subsequent work depends on properly configured WordPress endpoints
**Delivers:** Working menu and footer REST APIs with public access
**Addresses:** WordPress configuration, API access verification, endpoint testing
**Avoids:** Building Nuxt integration against broken WordPress APIs

### Phase 2: Server-Side Integration
**Rationale:** Establish caching and transformation layer before component changes
**Delivers:** Nuxt server routes with caching, URL transformation, static fallbacks
**Uses:** Existing Nitro storage patterns, proven caching TTL, fallback strategies
**Implements:** API proxy architecture maintaining separation of concerns

### Phase 3: Component Migration with Feature Flags
**Rationale:** Parallel development prevents breaking existing navigation during implementation
**Delivers:** New AppHeaderDynamic.vue and AppFooterDynamic.vue components
**Avoids:** Navigation downtime by maintaining hardcoded versions during development
**Implements:** Feature flag system for safe production rollout

### Phase Ordering Rationale

- **WordPress-first approach** minimizes Nuxt development against unstable APIs
- **Server-side caching before client integration** ensures data layer stability and performance
- **Feature-flagged component migration** allows incremental rollout without breaking existing navigation
- **Static fallbacks created early** ensure resilience throughout development process

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** WordPress admin access required for API configuration — needs client coordination
- **Phase 3:** Accessibility preservation requires detailed audit of current AppHeader/AppFooter implementations

Phases with standard patterns (skip research-phase):
- **Phase 2:** Server-side caching follows established `services.get.ts` pattern exactly
- **Phase 4:** Component testing uses existing Playwright patterns for navigation

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | WordPress 6.8 filter documented in official Make WordPress Core posts |
| Features | HIGH | Requirements derived from existing hardcoded navigation implementation |
| Architecture | HIGH | Follows proven patterns from services/team/testimonials APIs in current codebase |
| Pitfalls | HIGH | Based on official WordPress REST API documentation and common headless WordPress issues |

**Overall confidence:** HIGH

### Gaps to Address

Two areas need validation during implementation rather than additional research:

- **WordPress admin access timeline**: Client must provide admin access for API configuration before Nuxt development begins
- **Existing navigation accessibility audit**: Full inventory of current AppHeader/AppFooter ARIA attributes needed to ensure preservation

## Sources

### Primary (HIGH confidence)
- [WordPress REST API Menu Locations](https://developer.wordpress.org/rest-api/reference/menu-locations/) — official endpoints documentation
- [WordPress 6.8 rest_menu_read_access Filter](https://make.wordpress.org/core/2025/03/27/new-rest-api-filter-for-exposing-menus-publicly-in-wordpress-6-8/) — official filter documentation
- Existing codebase: `server/api/services.get.ts`, `composables/useInternalApi.ts` — proven patterns for server caching and composable architecture

### Secondary (MEDIUM confidence)
- [WP REST API V2 Menus Plugin](https://github.com/thebatclaudio/wp-rest-api-v2-menus) — fallback option for WordPress < 6.8
- [ACF REST API Integration](https://www.advancedcustomfields.com/resources/wp-rest-api-integration/) — alternative approach for footer content

### Tertiary (LOW confidence)
- [WPNuxt Documentation](https://wpnuxt.com/) — considered but rejected as over-engineered for this scope

---
*Research completed: 2026-02-10*
*Ready for roadmap: yes*