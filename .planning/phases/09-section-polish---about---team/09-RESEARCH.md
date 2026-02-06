# Phase 9: Section Polish - About & Team - Research

**Researched:** 2026-02-05
**Domain:** Vue 3 / Nuxt 3 page development, team photo optimization, professional services design patterns
**Confidence:** HIGH

## Summary

Phase 9 focuses on polishing the About page to achieve visual parity with the completed Phases 6 (Homepage), 7 (Projects), and 8 (Services). The primary work involves: (1) investigating team photo migration needs from the source WordPress site, (2) replacing placeholder icons with actual images where appropriate, (3) optimizing team member photos for web performance, and (4) ensuring the TeamMember component is properly integrated.

The current About page (`pages/about.vue`) has a solid structure with sections for Company History, Mission & Values, Leadership Team, Certifications & Affiliations, Service Area, and CTA. The Leadership Team section uses a well-implemented TeamMember component with proper NuxtImg optimization, hover effects, and contact links. However, team photos may need migration from the source site, and placeholder icons are used for Company History and Service Area images.

**Key findings:**
- Team photos exist in `/public/images/` (team-1.jpg through team-4.jpg) but are placeholders with inconsistent sizes
- team-4.jpg is excessively large (320KB) and needs optimization
- TeamMember component is well-implemented with aspect-[4/5] photo container, WebP format, lazy loading
- Nuxt Image component provides built-in optimization; use proper width/height/quality props
- Source site investigation was blocked by access restrictions; need to determine if real team photos exist

**Primary recommendation:** Focus on team photo optimization and migration verification. The TeamMember component requires minimal updates. The About page structure is sound; polish efforts should focus on visual consistency with other polished sections.

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Nuxt 3 | 3.14 | Vue framework with SSR | Already in use, provides useFetch, composables |
| @nuxt/image | Latest | Image optimization with NuxtImg component | Handles WebP/AVIF, sizes, lazy loading automatically |
| Tailwind CSS | 3.x | Utility-first CSS styling | Grid utilities, spacing, transitions already configured |
| @nuxt/icon | Latest | Icon system (MDI) | Used for placeholder icons and contact links |

### Supporting (Consider Adding)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| sharp | ^0.33.x | Image preprocessing for team photos | If optimization script is needed for oversized team photos |

**Installation:**
```bash
# No new packages needed for component work
# If image optimization script is needed:
npm install sharp
```

### Existing Patterns to Reuse

| From Phase | Pattern | Location |
|------------|---------|----------|
| Phase 6 | Hero section with dark overlay gradient | `/pages/index.vue` |
| Phase 7 | Card grid layouts with hover effects | `/pages/projects/index.vue` |
| Phase 8 | 4-step process sections with numbered circles | `/pages/services/index.vue` |
| Phase 3 | Image mapping and optimization patterns | `/public/images/image-mapping.json` |

## Architecture Patterns

### Current About Page Structure

**File:** `/pages/about.vue`

**Sections:**
1. **Page Header** - Dark background (primary-dark), centered white text
2. **Company History** - Two-column grid (text left, image right)
3. **Mission & Values** - Three-column grid with icon cards
4. **Leadership Team** - Four-column grid with TeamMember components
5. **Certifications & Affiliations** - Grid of certification badges
6. **Service Area** - Two-column grid (image left, text right)
7. **CTA Section** - Full-width primary background

**Data Sources:**
- Team members: `/api/team` endpoint with static fallback
- Certifications: Static array in component
- Service areas: Static array in component

### Current Team Data Structure

**API Response** (`server/api/team.get.ts`):
```typescript
interface TeamMember {
  title: { rendered: string }  // Name
  acf: {
    title: string              // Job title
    bio: string                // Bio text
    email: string
    phone: string
    photo: string              // Image path
  }
}

// Static fallback has 4 members:
// 1. Vincent P. Rodriguez, P.E. - President & Principal Engineer
// 2. Jennifer Martinez, P.E. - Vice President
// 3. David Kim, P.E. - Senior Project Engineer
// 4. Sarah Thompson, P.E. - Project Manager
```

### Current Team Images

| File | Size | Status |
|------|------|--------|
| team-1.jpg | 24KB | Reasonable |
| team-2.jpg | 44KB | Reasonable |
| team-3.jpg | 12KB | Good |
| team-4.jpg | 320KB | **Excessive - needs optimization** |

**Recommended target sizes:**
- Team headshots: 20-50KB each (WebP format)
- Maximum dimension: 800-1200px width
- Quality: 80-85% for WebP

### Pattern 1: TeamMember Component Usage

**What:** Display individual team member cards with photo, name, title, bio, and contact links.

**When to use:** Leadership Team section on About page.

**Current Implementation** (`/components/TeamMember.vue`):
```vue
<template>
  <div class="bg-white rounded-xl overflow-hidden border border-neutral-200 hover:border-primary hover:shadow-xl transition-all duration-300">
    <!-- Photo Container -->
    <div class="aspect-[4/5] overflow-hidden bg-neutral-100">
      <NuxtImg
        v-if="photo"
        :src="photo"
        :alt="`${name}, ${title}`"
        class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        format="webp"
        loading="lazy"
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
        width="400"
        height="500"
        placeholder
      />
      <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary-dark/20">
        <Icon name="mdi:account-tie" class="w-20 h-20 text-primary/40" />
      </div>
    </div>

    <!-- Member Info -->
    <div class="p-6">
      <h3 class="text-xl font-bold text-neutral-900 mb-1">{{ name }}</h3>
      <div class="text-primary font-semibold mb-3">{{ title }}</div>
      <p v-if="bio" class="text-neutral-600 text-sm mb-4 line-clamp-3">{{ bio }}</p>

      <!-- Contact Links -->
      <div class="flex items-center gap-3 pt-3 border-t border-neutral-200">
        <a v-if="email" :href="`mailto:${email}`" aria-label="Email">
          <Icon name="mdi:email" class="w-5 h-5" />
        </a>
        <a v-if="phone" :href="`tel:${phone}`" aria-label="Call">
          <Icon name="mdi:phone" class="w-5 h-5" />
        </a>
        <a v-if="linkedin" :href="linkedin" target="_blank" aria-label="LinkedIn">
          <Icon name="mdi:linkedin" class="w-5 h-5" />
        </a>
      </div>
    </div>
  </div>
</template>
```

**Analysis:** This component is well-implemented with:
- Proper aspect ratio container (4:5 for portraits)
- WebP format with lazy loading
- Responsive sizes
- Placeholder fallback
- Hover effects
- Accessible contact links

**Potential enhancements:**
- Add `linkedin` field to team data structure (currently unused)
- Add `quality` prop to NuxtImg for consistency

### Pattern 2: NuxtImg Optimization for Team Headshots

**What:** Optimize team member photos using Nuxt Image component best practices.

**When to use:** All team member photo displays.

**Recommended Configuration:**
```vue
<NuxtImg
  :src="photo"
  :alt="`${name}, ${title} - VP Associates team member`"
  format="webp"
  quality="85"
  loading="lazy"
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
  width="400"
  height="500"
  placeholder
  class="w-full h-full object-cover"
/>
```

**Source:** Nuxt 3 documentation on @nuxt/image best practices.

### Pattern 3: Company History Image Section

**What:** Replace placeholder icon with actual company history photo.

**When to use:** Company History section on About page.

**Current (Placeholder):**
```vue
<div class="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/20 to-primary-dark/20 flex items-center justify-center">
  <Icon name="mdi:office-building-marker" class="w-40 h-40 text-primary/30" />
</div>
```

**Recommended (with image):**
```vue
<div class="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
  <NuxtImg
    src="/images/about/company-history-1920w.webp"
    alt="VP Associates office and team"
    class="w-full h-full object-cover"
    format="webp"
    loading="lazy"
    sizes="(max-width: 768px) 100vw, 50vw"
    width="800"
    height="600"
    placeholder
  />
</div>
```

**Fallback strategy:** If no company history image exists, use the placeholder icon with improved styling.

### Pattern 4: Service Area Map Image

**What:** Replace placeholder icon with actual service area map or Tampa Bay photo.

**When to use:** Service Area section on About page.

**Current (Placeholder):**
```vue
<div class="aspect-square rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
  <Icon name="mdi:map-marker-radius" class="w-40 h-40 text-primary/30" />
</div>
```

**Recommended (with image):**
```vue
<div class="aspect-square rounded-2xl overflow-hidden shadow-2xl">
  <NuxtImg
    src="/images/about/tampa-bay-area-1920w.webp"
    alt="VP Associates service area - Tampa Bay"
    class="w-full h-full object-cover"
    format="webp"
    loading="lazy"
    sizes="(max-width: 768px) 100vw, 50vw"
    width="800"
    height="800"
    placeholder
  />
</div>
```

## Team Photo Investigation

### Current Status

**Placeholder Team Photos:**
- Four team photos exist in `/public/images/`
- team-1.jpg (24KB) - Vincent P. Rodriguez
- team-2.jpg (44KB) - Jennifer Martinez
- team-3.jpg (12KB) - David Kim
- team-4.jpg (320KB) - Sarah Thompson **NEEDS OPTIMIZATION**

**Unknown:**
- Are these actual team member photos or placeholders?
- Does the source WordPress site (vp-associates.com) have real team photos to migrate?
- What is the correct aspect ratio for the original photos?

### Migration Strategy

**Step 1: Check Source Site**
- Attempt to access vp-associates.com/about page
- Check for team member photos with alt text or data attributes
- Compare with current placeholder images

**Step 2: Verify Photo Authenticity**
- Check if team-*.jpg files are actual photos or stock/placeholder images
- Verify file dimensions and aspect ratios
- Check if metadata includes real names or camera info

**Step 3: Optimize oversized images**
```bash
# Use sharp to resize and optimize team-4.jpg
# Target: 800px width, WebP format, 80% quality
```

**Step 4: Update image paths if migration occurs**
- Update `/server/api/team.get.ts` static fallback photo paths
- Update image mapping if using Phase 3 structure

## Image Optimization Best Practices

### Team Headshot Specifications

Based on 2026 web standards for professional team photos:

| Attribute | Recommended Value | Notes |
|-----------|------------------|-------|
| Format | WebP primary, JPG fallback | WebP reduces file size 25-35% |
| Max dimension | 800-1200px width | Sufficient for retina displays |
| Aspect ratio | 4:5 (portrait) or 1:1 (square) | TeamMember uses 4:5 |
| Target file size | 20-50KB per photo | Balance quality and performance |
| Quality setting | 80-85% | Visual quality vs file size |
| Loading | Lazy for below-fold | Team section typically below viewport |

### NuxtImg Component Props

```vue
<NuxtImg
  src="/images/team-1.jpg"
  alt="Team member name and title"
  format="webp"           <!-- Modern format with fallback -->
  quality="85"            <!-- Default is 80, 85 is crisper for faces -->
  loading="lazy"          <!-- Native lazy loading -->
  sizes="sm:100vw md:50vw 25vw"  <!-- Responsive sizes -->
  width="400"             <!-- Display width -->
  height="500"            <!-- Display height (maintains aspect) -->
  placeholder             <!-- Blur-up placeholder -->
/>
```

**Source:** Nuxt 3 performance best practices documentation.

## Visual Polish Considerations

### Consistency with Polished Sections

**From Phase 6 (Homepage):**
- Hero section styling pattern
- Color gradients and overlays
- Section spacing and padding

**From Phase 7 (Projects):**
- Card hover effects
- Grid layouts
- Typography scale

**From Phase 8 (Services):**
- Icon usage patterns
- Process sections with numbered steps
- Background color alternation

### About Page Enhancements

**Potential improvements:**
1. Add subtle scroll animations to sections (use existing `useScrollReveal`)
2. Enhance company history stats (30+, 500+, 100%) with animation
3. Add hover effects to certification badges
4. Improve service area list with map-style presentation
5. Consider adding a timeline for company history

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image format conversion | Custom buffer processing | `format="webp"` on NuxtImg | Handles encoding, fallbacks automatically |
| Responsive image sizing | Manual srcset generation | `sizes` prop on NuxtImg | Generates proper srcset attributes |
| Lazy loading | IntersectionObserver manually | `loading="lazy"` on NuxtImg | Native browser lazy loading |
| Image placeholder | Custom blur CSS | `placeholder` prop on NuxtImg | Built-in LQIP generation |
| Scroll animations | Custom scroll handlers | Existing `useScrollReveal` composable | Already implemented, tested |

**Key insight:** The Nuxt 3 + @nuxt/image stack already provides everything needed for professional image handling. Custom solutions introduce maintenance burden and potential bugs.

## Common Pitfalls

### Pitfall 1: Oversized Team Photos

**What goes wrong:** team-4.jpg at 320KB slows page load, especially on mobile.

**Why it happens:** Images copied from source without optimization, or high-resolution originals not resized.

**How to avoid:**
- Pre-process images before adding to project
- Use Sharp to resize to max 1200px width
- Export at 80-85% quality WebP
- Target file size under 50KB per team photo

**Warning signs:** Large total page size (>2MB for About page), slow LCP scores.

### Pitfall 2: Inconsistent Team Photo Aspect Ratios

**What goes wrong:** Team photos appear with different heights, breaking grid alignment.

**Why it happens:** Original photos have varying aspect ratios, no consistent crop applied.

**How to avoid:**
- Use fixed aspect ratio container: `aspect-[4/5]`
- Apply `object-cover` to fill container
- Pre-crop all team photos to consistent dimensions

**Warning signs:** Jagged card heights in team grid.

### Pitfall 3: Missing Alt Text on Team Photos

**What goes wrong:** Poor accessibility, SEO issues.

**Why it happens:** Using generic alt text or leaving alt attribute empty.

**How to avoid:**
- Include name and title in alt text: `${name}, ${title} - VP Associates team member`
- Use descriptive alt text for company history and service area images

**Warning signs:** Low accessibility scores in Lighthouse.

### Pitfall 4: Blocking Team Section Above Fold

**What goes wrong:** Team images use lazy loading but appear above viewport.

**Why it happens:** Team section positioned high on page without considering viewport height.

**How to avoid:**
- Keep lazy loading for team section (typically below viewport)
- Only use `loading="eager"` for truly above-fold content (hero, page header)

**Warning signs:** Images loading late as user scrolls to team section.

### Pitfall 5: Not Respecting prefers-reduced-motion

**What goes wrong:** Animations trigger for users who prefer reduced motion.

**Why it happens:** Adding animations without checking user preference.

**How to avoid:**
- Use existing animation utilities that respect `prefers-reduced-motion`
- Keep hover effects subtle (300ms duration, ease-out)

**Warning signs:** Accessibility complaints, motion sickness triggers.

## Code Examples

### Optimized TeamMember Component

```vue
<!-- Source: /components/TeamMember.vue (enhanced) -->
<template>
  <div class="bg-white rounded-xl overflow-hidden border border-neutral-200 hover:border-primary hover:shadow-xl transition-all duration-300">
    <!-- Photo -->
    <div class="aspect-[4/5] overflow-hidden bg-neutral-100">
      <NuxtImg
        v-if="photo"
        :src="photo"
        :alt="`${name}, ${title} - VP Associates team member`"
        class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        format="webp"
        quality="85"
        loading="lazy"
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
        width="400"
        height="500"
        placeholder
      />
      <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary-dark/20">
        <Icon name="mdi:account-tie" class="w-20 h-20 text-primary/40" />
      </div>
    </div>

    <!-- Member Info -->
    <div class="p-6">
      <h3 class="text-xl font-bold text-neutral-900 mb-1">{{ name }}</h3>
      <div class="text-primary font-semibold mb-3">{{ title }}</div>
      <p v-if="bio" class="text-neutral-600 text-sm mb-4 line-clamp-3">{{ bio }}</p>

      <!-- Contact Links -->
      <div v-if="hasContactInfo" class="flex items-center gap-3 pt-3 border-t border-neutral-200">
        <a
          v-if="email"
          :href="`mailto:${email}`"
          class="text-neutral-500 hover:text-primary transition-colors p-1 focus-visible:ring-2 focus-visible:ring-primary"
          :aria-label="`Email ${name}`"
        >
          <Icon name="mdi:email" class="w-5 h-5" />
        </a>
        <a
          v-if="phone"
          :href="`tel:${phone}`"
          class="text-neutral-500 hover:text-primary transition-colors p-1 focus-visible:ring-2 focus-visible:ring-primary"
          :aria-label="`Call ${name}`"
        >
          <Icon name="mdi:phone" class="w-5 h-5" />
        </a>
        <a
          v-if="linkedin"
          :href="linkedin"
          target="_blank"
          rel="noopener noreferrer"
          class="text-neutral-500 hover:text-primary transition-colors p-1 focus-visible:ring-2 focus-visible:ring-primary"
          :aria-label="`${name}'s LinkedIn profile`"
        >
          <Icon name="mdi:linkedin" class="w-5 h-5" />
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  name: string
  title: string
  bio?: string
  photo?: string
  email?: string
  phone?: string
  linkedin?: string  // Already supported but not used
}

const props = defineProps<Props>()

const hasContactInfo = computed(() =>
  props.email || props.phone || props.linkedin
)
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
```

### Image Preprocessing Script (Optional)

```typescript
// scripts/optimize-team-photos.ts
import sharp from 'sharp'
import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const teamImagesDir = './public/images'
const outputDir = './public/images/team'

const teamPhotos = ['team-1.jpg', 'team-2.jpg', 'team-3.jpg', 'team-4.jpg']

async function optimizeTeamPhotos() {
  for (const photo of teamPhotos) {
    const inputPath = join(teamImagesDir, photo)
    const outputName = photo.replace('.jpg', '')
    const outputPath = join(outputDir, `${outputName}-800w.webp`)

    await sharp(inputPath)
      .resize(800, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 85 })
      .toFile(outputPath)

    console.log(`Optimized ${photo} -> ${outputPath}`)
  }
}

optimizeTeamPhotos().catch(console.error)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single-size JPG team photos | Responsive WebP with JPG fallback | ~2021 | 25-35% file size reduction |
| Lazy loading via JS | Native loading="lazy" | ~2020 | Better browser support, no JS needed |
| Fixed-width images | Responsive sizes with srcset | ~2018 | Better mobile UX, bandwidth savings |
| Placeholder rectangles | Blur-up LQIP placeholders | ~2019 | Better perceived performance |
| Manual image optimization | Sharp preprocessing + NuxtImg runtime | ~2022 | Optimal balance of build-time and runtime |

**Deprecated/outdated:**
- **Custom lazy loading scripts:** Native `loading="lazy"` has >95% support
- **Base64 data URIs for photos:** Increases bundle size, poor caching
- **Separate mobile sites:** Responsive design is standard

## Open Questions

1. **Source Site Team Photos Availability**
   - What we know: Source site (vp-associates.com) access was blocked during research
   - What's unclear: Does the source site have actual team member photos?
   - Recommendation: Attempt manual access during implementation phase. If unavailable, use current placeholders with proper optimization.

2. **team-4.jpg Optimization**
   - What we know: team-4.jpg is 320KB, significantly larger than other team photos
   - What's unclear: Is this a high-resolution photo that needs resizing, or a corrupted file?
   - Recommendation: Optimize using Sharp to max 800px width, WebP format. If quality is poor, replace with placeholder.

3. **LinkedIn Profile URLs**
   - What we know: TeamMember component supports linkedin prop, but no data provided
   - What's unclear: Do team members have LinkedIn profiles to link?
   - Recommendation: Add linkedin field to team data if URLs are available. Otherwise, leave empty to hide icon.

4. **Company History Image**
   - What we know: Current implementation uses placeholder icon
   - What's unclear: Is there an actual company history photo available?
   - Recommendation: Use high-quality project photo or office photo as fallback. If unavailable, improve placeholder styling.

5. **Service Area Map**
   - What we know: Current implementation uses placeholder icon
   - What's unclear: Should this show a literal map, or a Tampa Bay area photo?
   - Recommendation: Use an atmospheric Tampa Bay/St. Petersburg skyline photo rather than a literal map for better visual appeal.

## Sources

### Primary (HIGH confidence)

- **Nuxt 3 Documentation** - @nuxt/image module, NuxtImg component API
  - Image optimization props (format, quality, sizes, placeholder)
  - Performance best practices
  - Lazy loading configuration

- **Sharp Documentation** - Image processing library
  - Resize operations
  - WebP output options
  - Quality settings

- **Project Source Code**
  - `/pages/about.vue` - Current About page implementation
  - `/components/TeamMember.vue` - Team card component
  - `/server/api/team.get.ts` - Team data API
  - `/components/TeamMemberSkeleton.vue` - Loading state component

### Secondary (MEDIUM confidence)

- [Team Headshot Best Practices (2026)](https://www.fotor.com/blog/headshot-size/) - Corporate headshot dimensions and quality standards

- [Professional Headshot Guidelines (2025)](https://nycphoto.com/professional-headshot-guide/) - Aspect ratio recommendations (5×7, square)

- [WebP Image Size Guide (2025)](https://launchthedamnthing.com/blog/resize-images-websites-webp-guide) - Maximum dimension recommendations (2000px), file size targets (under 250KB)

- [Meet the Team Page Best Practices](https://blog.avantiy.com/the-ultimate-guide-to-our-team-web-page-design-2025) - Team page design patterns for professional services

- [Consistent Corporate Headshots Guide](https://thexconcept.com/2025/07/21/the-importance-of-consistent-team-headshots-for-corporate-websites/) - Style guide recommendations

### Tertiary (LOW confidence)

- [Headshot Trends for 2026](https://jamesconnell.com/headshot-trends-for-2026) - Authentic, in-camera expressions preferred

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via official documentation
- Architecture: HIGH - Current implementation reviewed and analyzed
- Team photo investigation: LOW - Source site access blocked, unknown if real photos exist
- Image optimization: HIGH - Based on Nuxt Image and Sharp documentation
- Pitfalls: MEDIUM - Based on common web development patterns

**Research date:** 2026-02-05
**Valid until:** 2026-05-05 (3 months - Nuxt 3 and image standards are stable)

**Key decisions to validate during implementation:**
1. Source site team photo availability (manual check required)
2. Whether team-*.jpg files are placeholders or actual photos
3. LinkedIn profile URL availability for team members
4. Company history and service area image availability
