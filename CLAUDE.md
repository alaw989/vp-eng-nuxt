# VP Associates — Structural Engineering Website

## Tech Stack
- **Framework**: Nuxt 3 (v3.15), Vue 3 (v3.5), TypeScript
- **Styling**: Tailwind CSS (v6) with `@tailwindcss/typography`
- **State**: Pinia, VueUse composables
- **CMS**: WordPress headless via REST API (server-side 30-min cache, static fallbacks)
- **Forms**: Resend API for contact submissions
- **PWA**: `@vite-pwa/nuxt` with offline support and service worker
- **Testing**: Vitest (unit), Playwright (E2E), Lighthouse CI
- **Linting**: Husky pre-commit hooks, ESLint
- **Deploy**: DigitalOcean App Platform, PM2

## Commands
```bash
npm run dev                # Development server (localhost:3000)
npm run build              # Production build
npm run generate           # Static site generation
npm run test               # Run unit tests (vitest)
npm run test:unit:watch    # Watch mode unit tests
npm run test:e2e           # E2E tests (Playwright)
npm run test:all           # Unit + E2E tests
npm run lighthouse         # Lighthouse CI audit
npm run optimize:team      # Optimize team photos
```

## Architecture
- Hybrid rendering: static generation for SEO pages (`/`, `/about`, `/services`, `/projects`), SSR for dynamic content via Nuxt `routeRules`
- Pages: `/`, `/about`, `/services`, `/services/[slug]`, `/projects`, `/projects/[slug]`, `/careers`, `/contact`, `/search`
- WordPress data fetched server-side with `useFetch` and cached. Static fallbacks when API unavailable.
- 301 redirects from legacy WordPress URLs (portfolio → projects, trailing slash normalization)

## Environment
Copy `.env.example` to `.env`. Required vars: `NUXT_PUBLIC_SITE_URL`, `NUXT_PUBLIC_WP_API_URL`, `WP_API_URL`. Optional: `RESEND_API_KEY`, `CONTACT_FORM_EMAIL`, `FROM_EMAIL` (for contact form), `NUXT_PUBLIC_GA_MEASUREMENT_ID` (analytics).

## Conventions
- Vue 3 Composition API (`<script setup>`) — no Options API
- Components in `components/`, composables in `composables/`
- Use `@nuxt/image` for all images (WebP/AVIF optimization)
- Tailwind utility classes for styling — no custom CSS files
- Server API routes in `server/api/`
- Accessibility: WCAG 2.1 AA, axe-core, ARIA labels, keyboard navigation
