# VP Associates — Structural Engineering Website

Corporate website for [VP Associates](https://vp-associates.com), a Tampa Bay-based structural engineering firm with over 30 years of experience. Rebuilt from WordPress to a modern Nuxt 3 application for improved performance, SEO, and maintainability.

## What It Does

- **Showcases services** — steel design, concrete design, masonry, foundations, seawalls, and steel detailing
- **Project portfolio** — filterable gallery of past engineering projects (Marine, Commercial, Residential, Industrial, Institutional)
- **Team profiles** — licensed engineers and staff directory
- **Contact forms** — Resend API integration for client inquiries
- **PWA support** — offline access, install prompts, and service worker caching
- **SEO** — server-rendered pages, auto-generated sitemap, schema markup, 301 redirects from legacy WordPress URLs

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Nuxt 3 (v3.15), Vue 3 (v3.5) |
| Styling | Tailwind CSS (v6), @tailwindcss/typography |
| State | Pinia, VueUse composables |
| CMS | WordPress (headless, REST API) with 30-min server-side cache |
| Forms | Resend API |
| Testing | Vitest (unit), Playwright (E2E), Lighthouse CI |
| Deploy | DigitalOcean App Platform, PM2 |

## Pages

- `/` — Hero, services overview, featured projects, testimonials
- `/about` — Company history and team
- `/services` — Service catalog with category filtering
- `/services/[slug]` — Individual service detail
- `/projects` — Portfolio gallery with category filtering
- `/projects/[slug]` — Individual project detail
- `/careers` — Job listings and position pages
- `/contact` — Contact form
- `/search` — Global site search

## Setup

```bash
npm install
cp .env.example .env     # Configure env vars (see below)
npm run dev              # http://localhost:3000
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NUXT_PUBLIC_SITE_URL` | Public site URL |
| `NUXT_PUBLIC_WP_API_URL` | WordPress REST API URL (public) |
| `WP_API_URL` | WordPress REST API URL (server-side) |
| `RESEND_API_KEY` | Resend API key for contact forms |
| `CONTACT_FORM_EMAIL` | Email to receive form submissions |
| `FROM_EMAIL` | Sender email (must be verified in Resend) |
| `NUXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics ID (optional) |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run generate` | Static site generation |
| `npm run preview` | Preview production build |
| `npm run test:unit` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:all` | Run all tests |
| `npm run lighthouse` | Lighthouse CI audit |
| `npm run optimize:team` | Optimize team photos for web |

## Key Architecture Decisions

- **Hybrid rendering** — static generation for SEO-critical pages, SSR for dynamic content
- **WordPress headless CMS** — content managed in WordPress, served via REST API with server-side caching and static fallbacks
- **PWA** — service worker caching, offline fallback, install prompts for mobile users
- **Accessibility** — WCAG 2.1 AA compliance, axe-core integration, screen reader route announcements, keyboard navigation

## License

Copyright (c) 2026 VP Associates
