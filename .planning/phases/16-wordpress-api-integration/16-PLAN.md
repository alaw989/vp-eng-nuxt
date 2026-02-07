---
wave: 1
depends_on: []
files_modified:
  - .planning/phases/16-wordpress-api-integration/wordpress-cpt-plugin.php
  - .planning/phases/16-wordpress-api-integration/acf-field-groups.json
  - composables/useApi.ts
  - nuxt.config.ts
  - components/HeroSection.vue
  - components/TestimonialsSection.vue
  - pages/index.vue
  - server/api/*.ts
autonomous: true
must_haves:
  - WordPress CPTs registered with REST API enabled
  - ACF field groups created for each CPT
  - Nuxt site successfully fetches data from live WordPress API
  - Circle elements render as perfect circles
  - Testimonials display as single-row slider
  - Hero has gradient enhancement
---

# Phase 16: WordPress API Integration & Content Analysis

## Goal

Establish headless WordPress architecture with proper Custom Post Types, integrate live API content into Nuxt frontend, and apply styling improvements (circles, testimonials slider, hero gradients).

---

## Plan 16-01: WordPress CPT Registration Plugin

**Wave:** 1
**Estimated time:** 2-3 hours

### Overview
Create a WordPress plugin that registers four Custom Post Types (Services, Projects, Team, Testimonials) with REST API support enabled.

### Tasks

1. **Create plugin foundation**
   - Create plugin directory: `wp-content/plugins/vp-associates-cpt/`
   - Create main plugin file: `vp-associates-cpt.php`
   - Add plugin header with proper metadata

2. **Register Services CPT**
   - Slug: `services`
   - Supports: title, editor, excerpt, thumbnail, custom-fields
   - Taxonomy: service_category
   - REST API: enabled (`show_in_rest = true`)
   - Public: true
   - Has archive: true

3. **Register Projects CPT**
   - Slug: `projects`
   - Supports: title, editor, excerpt, thumbnail, custom-fields
   - Taxonomy: project_category
   - REST API: enabled
   - Public: true
   - Has archive: true

4. **Register Team CPT**
   - Slug: `team`
   - Supports: title, editor, excerpt, thumbnail, custom-fields
   - REST API: enabled
   - Public: true
   - Has archive: false (team only on about page)

5. **Register Testimonials CPT**
   - Slug: `testimonials`
   - Supports: title, editor, excerpt, thumbnail, custom-fields
   - REST API: enabled
   - Public: true
   - Has archive: false

6. **Flush rewrite rules**
   - Add activation hook to flush permalinks

### Deliverables
- `vp-associates-cpt.php` plugin file
- CPTs accessible at `/wp-json/wp/v2/services`, `/projects`, `/team`, `/testimonials`

---

## Plan 16-02: ACF Field Groups for CPTs

**Wave:** 1
**Estimated time:** 2-3 hours

### Overview
Create Advanced Custom Fields field groups for each CPT with appropriate meta fields.

### Tasks

1. **Services fields**
   - Icon (text or image field for service icon)
   - Capabilities (repeater for service capabilities)
   - Related Projects (relationship field)
   - Featured (true/false for homepage)

2. **Projects fields**
   - Location (text)
   - Year (text/select)
   - Square Footage (text)
   - Category (select: Commercial, Industrial, Marine, Residential, etc.)
   - Services Provided (multiselect or relationship to services)
   - Project Stats (group: year, sqft, capacity, duration)
   - Featured (true/false for homepage)
   - Gallery (gallery field for project images)

3. **Team fields**
   - Job Title (text)
   - Bio (textarea)
   - Email (email)
   - Phone (text)
   - LinkedIn (url)
   - Order (number for sorting)

4. **Testimonials fields**
   - Client Name (text)
   - Company (text)
   - Project (relationship to projects)
   - Rating (number/select 1-5)

### Deliverables
- ACF field group configuration (JSON export or PHP registration)
- Fields appearing in WordPress admin for each CPT

---

## Plan 16-03: Content Migration & Entry

**Wave:** 1
**Estimated time:** 3-4 hours

### Overview
Migrate existing content from galleries/pages to new CPTs and populate initial content.

### Tasks

1. **Audit existing content**
   - Review fooGallery items for project images
   - Review existing pages for services/team content
   - Document what content exists vs needs creation

2. **Migrate Projects content**
   - Create Projects from existing gallery items
   - Import images and metadata
   - Set categories and featured images

3. **Create Services entries**
   - Create service pages from existing content
   - Add icons and capabilities
   - Link related projects

4. **Create Team entries**
   - Add team member profiles
   - Include photos and contact info

5. **Create Testimonials entries**
   - Add client testimonials
   - Link to relevant projects

### Deliverables
- All CPTs populated with initial content
- Minimum 3-5 entries per CPT type

---

## Plan 16-04: Nuxt API Integration Update

**Wave:** 2
**Estimated time:** 1-2 hours

### Overview
Update Nuxt composables and server routes to use live WordPress API with proper error handling.

### Tasks

1. **Update API URL configuration**
   - Remove old dev URL references
   - Ensure all point to `https://www.vp-associates.com/wp-json/wp/v2`
   - Update `nuxt.config.ts` runtime config

2. **Update composables/useApi.ts**
   - Remove hardcoded dev URL
   - Use runtime config for API base URL
   - Verify all fetch functions work with live API

3. **Update server API routes**
   - Ensure all `/api/*.ts` files proxy correctly
   - Add proper error handling for API failures
   - Update fallback static data if needed

4. **Test all endpoints**
   - Services listing and detail pages
   - Projects listing and detail pages
   - Team members on about page
   - Testimonials on homepage

### Deliverables
- All Nuxt pages loading data from live WordPress API
- Proper error handling and fallbacks

---

## Plan 16-05: Fix Circle Element Styling

**Wave:** 2
**Estimated time:** 1 hour

### Overview
Ensure all circular elements (team photos, service icons, etc.) render as perfect circles.

### Tasks

1. **Audit circle elements**
   - Find all elements meant to be circular
   - Team member photos
   - Service icons
   - Avatar elements

2. **Fix styling issues**
   - Ensure `aspect-ratio: 1/1` for true circles
   - Add `rounded-full` Tailwind class
   - Fix any image sizing issues
   - Ensure consistent sizing across breakpoints

3. **Test on various content**
   - Different image aspect ratios
   - Different screen sizes
   - Ensure no overflow or clipping

### Deliverables
- All circular elements render as perfect circles
- Consistent styling across breakpoints

---

## Plan 16-06: Testimonials Slider Component

**Wave:** 2
**Estimated time:** 2 hours

### Overview
Convert homepage testimonials from 2-row grid to single-row carousel/slider.

### Tasks

1. **Create TestimonialsSlider component**
   - Use Vue Carousel or similar
   - Show 1-3 testimonials per view based on screen size
   - Add navigation arrows and dots
   - Smooth transitions

2. **Update homepage**
   - Replace grid with slider component
   - Fetch testimonials from WordPress API
   - Handle loading and error states

3. **Styling**
   - Match existing design
   - Ensure accessibility (keyboard nav, ARIA labels)
   - Mobile responsive

### Deliverables
- `components/TestimonialsSlider.vue`
- Homepage displaying single-row testimonials slider

---

## Plan 16-07: Hero Section Enhancement

**Wave:** 2
**Estimated time:** 1-2 hours

### Overview
Add gradient overlays and visual interest to the hero section.

### Tasks

1. **Analyze current hero**
   - Review `components/HeroSection.vue`
   - Understand current styling and imagery

2. **Add gradient effects**
   - Subtle gradient overlay on hero background
   - Gradient text effects for headings
   - Smooth transitions

3. **Enhance visual interest**
   - Consider animated gradient
   - Add depth with layered gradients
   - Ensure text readability maintained

4. **Test across pages**
   - Homepage hero
   - Interior page heroes (if applicable)
   - Ensure consistent branding

### Deliverables
- Enhanced hero section with gradients
- Improved visual appeal while maintaining accessibility

---

## Verification Criteria

### WordPress API
- [ ] All four CPTs registered and accessible via REST API
- [ ] `/wp-json/wp/v2/services` returns services array
- [ ] `/wp-json/wp/v2/projects` returns projects array
- [ ] `/wp-json/wp/v2/team` returns team array
- [ ] `/wp-json/wp/v2/testimonials` returns testimonials array

### Nuxt Integration
- [ ] Services page loads from API
- [ ] Projects page loads from API
- [ ] About page team section loads from API
- [ ] Homepage testimonials load from API
- [ ] No console errors related to API fetching

### Styling
- [ ] All circular elements are perfect circles
- [ ] Testimonials display as slider (not grid)
- [ ] Hero has gradient enhancement
- [ ] Mobile responsive for all changes

### Content
- [ ] At least 3 entries per CPT type
- [ ] All images loading correctly
- [ ] ACF fields displaying properly
