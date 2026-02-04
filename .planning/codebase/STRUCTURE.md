# Codebase Structure

**Analysis Date:** 2024-12-04

## Directory Layout

```
vp-eng-nuxt/
├── assets/                # Static assets and styles
├── components/           # Reusable Vue components
├── composables/          # Vue composables and business logic
├── layouts/              # Page layouts and wrappers
├── pages/                # Page components and routes
├── plugins/              # Nuxt plugins and extensions
├── public/               # Public static files
├── server/               # Server-side code and API routes
├── .planning/            # Planning documents (generated)
├── .output/              # Build output (generated)
├── .nuxt/                # Nuxt build cache (generated)
└── node_modules/         # Dependencies (generated)
```

## Directory Purposes

**assets/**
- Purpose: Source assets and global styles
- Contains: CSS files, fonts, design tokens
- Key files: `assets/css/main.css`

**components/**
- Purpose: Reusable Vue components
- Contains: UI components, feature components
- Key files: `AppHeader.vue`, `AppFooter.vue`, `HeroSlider.vue`
- Subdirectories: None (flat structure)

**composables/**
- Purpose: Business logic and hooks
- Contains: Reusable composables for data and functionality
- Key files: `usePageMeta.ts`, `useAnalytics.ts`

**layouts/**
- Purpose: Page layout templates
- Contains: Layout components that wrap pages
- Key files: `default.vue`, `landing.vue`
- Pattern: Single slot for page content

**pages/**
- Purpose: Page components and routing
- Contains: All page components, dynamic routes
- Key files: `index.vue`, `about.vue`, `contact.vue`
- Pattern: File-based routing, dynamic routes with `[slug].vue`

**plugins/**
- Purpose: Nuxt plugins and third-party integrations
- Contains: Client-side and server-side plugins
- Key files: `analytics.client.ts`

**public/**
- Purpose: Static assets served directly
- Contains: Images, fonts, manifest files
- Key files: `images/`, `manifest.json`, `icon.svg`

**server/**
- Purpose: Server-side code and API routes
- Contains: API endpoints, server utilities
- Key files: `api/projects.get.ts`, `api/services.get.ts`
- Subdirectories: `api/`, `routes/`

## Key File Locations

**Entry Points:**
- `/pages/index.vue`: Homepage entry point
- `/layouts/default.vue`: Default layout for all pages
- `/nuxt.config.ts`: Nuxt configuration

**Configuration:**
- `/package.json`: Project dependencies and scripts
- `/nuxt.config.ts`: Framework and module configuration
- `/tsconfig.json`: TypeScript configuration

**Core Logic:**
- `/composables/usePageMeta.ts`: SEO and meta tag management
- `/server/api/`: All API proxy endpoints
- `/components/`: Reusable UI components

**Testing:**
- No dedicated test directory found
- No testing configuration detected

## Naming Conventions

**Files:**
- PascalCase for components: `AppHeader.vue`, `HeroSlider.vue`
- kebab-case for pages: `index.vue`, `about.vue`
- camelCase for composables: `usePageMeta.ts`

**Directories:**
- lowercase for all directories
- Descriptive names: `components`, `layouts`, `pages`

**Components:**
- Prefix with `App` for layout components: `AppHeader`, `AppFooter`
- Prefix with `Lazy` for lazy-loaded components
- Suffix with `Card` for card components: `ProjectCard`, `ServiceCard`

**API Routes:**
- RESTful naming: `projects.get.ts`, `services.get.ts`
- Descriptive endpoints matching frontend needs

## Where to Add New Code

**New Page:**
- Primary code: `/pages/[path].vue`
- Layout: Uses existing `default.vue` or create new in `/layouts/`
- SEO: Import and use `usePageMeta` composable

**New Component:**
- Implementation: `/components/[ComponentName].vue`
- Props: Define with TypeScript interfaces
- Usage: Import in pages or other components

**New API Endpoint:**
- Implementation: `/server/api/[endpoint].get.ts`
- Pattern: Follow existing proxy pattern with static fallback
- Location: Add in corresponding API file

**New Feature:**
- Logic: `/composables/use[FeatureName].ts`
- UI: `/components/[FeatureComponent].vue`
- Pages: `/pages/[feature]-related.vue`

## Special Directories

**.planning/:
- Purpose: Generated documentation for project planning
- Generated: Yes, by GSD tools
- Committed: Yes, for team reference

**server/api/:
- Purpose: API proxy endpoints
- Generated: No, manually maintained
- Committed: Yes, contains business logic

**public/images/:
- Purpose: Static images and assets
- Generated: No, manually maintained
- Committed: Yes, contains media assets

**.output/ & .nuxt/:
- Purpose: Build artifacts and cache
- Generated: Yes, by build process
- Committed: No, in .gitignore

---

*Structure analysis: 2024-12-04*