# Phase 16: WordPress API Integration & Content Analysis

## User Decisions (Locked)

### Architecture Approach
- **Option A Selected**: Create Custom Post Types (CPTs) in WordPress
- The WordPress site at `https://www.vp-associates.com` currently has:
  - Standard Pages and Posts
  - Advanced Custom Fields (ACF) plugin
  - Gallery plugins (gallery, fooGallery)
  - **NO Custom Post Types** registered

### API Endpoint
- Production WordPress API: `https://www.vp-associates.com/wp-json/wp/v2/`
- The old dev URL (`whataustinhasmade.com/vp-eng`) should be disregarded

## Claude's Discretion

### CPT Registration Implementation
- Can use either:
  - Custom plugin (recommended for portability)
  - Theme `functions.php`
  - Custom Post Type UI plugin (if user prefers GUI)

### ACF Field Configuration
- Design appropriate field types based on content needs
- Consider existing gallery plugin content when planning fields

### Content Migration Strategy
- Assess existing content in galleries/pages
- Plan migration approach (manual vs automated)

## Deferred Ideas

- GraphQL API (future enhancement)
- Headless WordPress specific optimizations
- Custom authentication for API

## Current WordPress State

### Working Endpoints
- ✅ `/wp/v2/pages` - Standard pages
- ✅ `/wp/v2/posts` - Blog posts
- ✅ `/wp/v2/media` - Images/media
- ✅ `/wp/v2/categories` - Categories

### Missing Endpoints (Need Creation)
- ❌ `/wp/v2/services` - Services CPT
- ❌ `/wp/v2/projects` - Projects CPT
- ❌ `/wp/v2/team` - Team CPT
- ❌ `/wp/v2/testimonials` - Testimonials CPT

## Nuxt Integration Points

### Files to Update
- `composables/useApi.ts` - API endpoint definitions and types
- `server/api/*.ts` - API proxy routes
- `nuxt.config.ts` - Runtime config

### Pages Consuming API
- `/pages/services/[slug].vue`
- `/pages/projects/[slug].vue`
- `/pages/careers/[slug].vue`
- `/pages/about.vue` (team)
- `/pages/index.vue` (featured projects, testimonials)
- `/pages/search.vue`
