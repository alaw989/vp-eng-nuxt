# Images Directory

This directory contains all optimized images for the VP Associates website. Images are organized by category and include responsive variants in multiple formats.

## Directory Structure

```
public/images/
├── hero/           # Full-width hero/banner images
├── projects/       # Project showcase and portfolio images
├── team/           # Team member and career-related images
├── general/        # General purpose images (logos, about, etc.)
├── services/       # Service-related images (empty, using general/ for now)
├── shared/         # Duplicate images shared across contexts
├── image-mapping.json  # Source URL to local path reference
└── README.md       # This file
```

## Image Categories

| Category | Description | Typical Dimensions |
|----------|-------------|-------------------|
| `hero/` | Homepage and section headers | 1920x930 (landscape) |
| `projects/` | Project thumbnails and showcase | 300x200 - 400x300 |
| `team/` | Team member avatars and career images | 500x500 (square) |
| `general/` | Logos, about section, miscellaneous | varies |
| `services/` | Service-specific imagery | (currently empty) |
| `shared/` | Duplicate images shared across contexts | varies |

## Responsive Variants

Each image is generated in three sizes for responsive loading:

| Size | Max Width | Use Case |
|------|-----------|----------|
| `640w` | 640px | Mobile devices |
| `1280w` | 1280px | Tablets and small desktops |
| `1920w` | 1920px | Full HD desktop displays |

## File Formats

- **WebP (`.webp`)**: Primary format - modern compression with excellent quality/size ratio
- **JPG (`.jpg`)**: Fallback format - for browsers that don't support WebP

## Filename Convention

```
{basename}-{size}w.{format}
```

Examples:
- `home-header-640w.webp`
- `steel-connect-1280w.webp`
- `careers-handshake-1920w.jpg`

## Usage in Components

### Using Nuxt Image Component

```vue
<script setup lang="ts">
// Nuxt Image module provides optimized lazy-loading
</script>

<template>
  <NuxtImg
    src="/images/hero/home-header.webp"
    width="1920"
    height="930"
    format="webp"
    loading="lazy"
    alt="Hero image description"
  />
</template>
```

### Using Native Picture Element (with WebP fallback)

```vue
<template>
  <picture>
    <source
      srcset="/images/hero/home-header-640w.webp 640w,
              /images/hero/home-header-1280w.webp 1280w,
              /images/hero/home-header-1920w.webp 1920w"
      type="image/webp"
    />
    <img
      srcset="/images/hero/home-header-640w.jpg 640w,
              /images/hero/home-header-1280w.jpg 1280w,
              /images/hero/home-header-1920w.jpg 1920w"
      src="/images/hero/home-header-640w.jpg"
      alt="Hero image description"
      loading="lazy"
    />
  </picture>
</template>
```

### Using Native img with srcset

```vue
<template>
  <img
    srcset="/images/projects/steel-connect-640w.webp 640w,
            /images/projects/steel-connect-1280w.webp 1280w,
            /images/projects/steel-connect-1920w.webp 1920w"
    src="/images/projects/steel-connect-640w.webp"
    alt="Steel Connection project"
    loading="lazy"
  />
</template>
```

## Image Mapping Reference

Use `image-mapping.json` to find the local path for any source image from the original website:

```bash
# Find images by category
cat public/images/image-mapping.json | jq '.images[] | select(.category == "hero")'

# Get srcset for a specific source URL
cat public/images/image-mapping.json | jq '.images[] | select(.sourceUrl | contains("home_header")) | .srcset.webp'

# List all duplicate images
cat public/images/image-mapping.json | jq '.summary.duplicates[]'
```

## Image Quality Settings

- **WebP Quality**: 80
- **JPG Quality**: 80
- **Resizing**: Uses `withoutEnlargement` to prevent upscaling small source images
- **Orientation**: Auto-rotated based on EXIF data before resizing

## Optimization Statistics

- **Total images**: 25
- **Total variants**: 150 (25 images x 3 sizes x 2 formats)
- **Categories with images**: hero (6), projects (14), team (1), general (4)
- **Average compression**: ~70% reduction from original RGB estimate

## Regenerating Images

To re-download or re-optimize images, use the scripts in `.planning/scripts/`:

```bash
# Download images from vp-associates.com
npx tsx .planning/scripts/download-images.ts

# Optimize and generate variants
npx tsx .planning/scripts/optimize-images.ts

# Regenerate this mapping file
npx tsx .planning/scripts/generate-mapping.ts
```

## Adding New Images

1. Place original images in `.planning/audit/images/raw/`
2. Run the optimization script to generate variants
3. Update `image-mapping.json` by running the mapping generator
4. Use the mapped paths in your components

## Notes

- Hero images at 1920w naturally exceed 200KB due to their dimensions
- Consider quality reduction (70-75) or max-width limit (1600px) before production if size is critical
- All images use SHA-256 hash-based deduplication to avoid storing duplicates
