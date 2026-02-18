# VP Associates Nuxt 3 - Continuous Improvement Notes

## Current Status

**ALL TESTS PASSING** - ✅ 1780 unit tests + 152 E2E tests (Feb 18, 2026)

---

## Test Coverage Summary

**1780 unit tests** - All passing:
- **Unit Tests**: 1780 tests across 54 test files
  - `components/__tests__/`: All 29 components have tests
  - `composables/__tests__/`: All 11 composables have tests
  - `utils/__tests__/`: HTML entity decoding (100% coverage)
  - `tests/server/api/`: API structure tests (10 files, 146 tests)

**Current Coverage**: **~70%** overall
- **Components**: ~87% statement coverage
- **Composables**: ~81%
- **Server API**: 0% (requires Nitro test environment - tested via E2E)

**152 E2E tests** - All passing (2 skipped):
- `tests-e2e/api/`: WordPress API, Search API, Contact API, RSS API, Team/Testimonials API
- `tests-e2e/static-pages.spec.ts`: Error page, offline, privacy, terms, sitemap, accessibility, home
- `tests-e2e/search.spec.ts`: Search page functionality
- `tests-e2e/home.spec.ts`, `about.spec.ts`, `contact.spec.ts`, `services.spec.ts`, etc.
- `tests-e2e/pdf.spec.ts`: PDF functionality tests
- `tests-e2e/hero.spec.ts`: Hero section tests
- `tests-e2e/keyboard-navigation.spec.ts`: Keyboard accessibility tests

**ALL COMPONENTS AND API ROUTES HAVE UNIT TESTS** - Even if coverage shows 0% for some (browser-dependent features)

---

## Development Commands

```bash
npm run dev     # Start dev server (localhost:3000)
npm run build   # Production build (✅ succeeds)
npm run preview # Preview production build

# Tests
npm test                # Run all tests
npm run test:unit       # Run unit tests (Vitest) - 1780 tests passing
npm run test:e2e        # Run E2E tests (Playwright) - 152 tests passing
npm run test:unit:watch # Run unit tests in watch mode
npm run test:unit:coverage # Run unit tests with coverage report
```

---

## Coverage Limitations

- **SVG/Leaflet map components** (TampaBayMap, ServiceAreaMap) show 0% because they use dynamic imports of Leaflet library which requires browser environment - tested via E2E
- **PWA components** (PwaInstallPrompt, PwaReloadPrompt) show 0% because they depend on `useNuxtApp().$pwa` which is browser-dependent - tested via E2E
- **Server API routes** show 0% because Nitro server routes require separate test environment - structure tests exist in `tests/server/api/` that validate static data
- **useApi/useJsonld composables** rely on Nuxt's useFetch and useHead which are hard to mock in Vitest

---

## WordPress API Info

- **API URL:** https://www.vp-associates.com/wp-json/wp/v2/
- **Note:** All API endpoints have static fallback data

---

## Known Nuxt 4 Compatibility Notes

When using `compatibilityVersion: 4` in nuxt.config.ts:
- Avoid prerender rules for pages with forms or dynamic content
- Be cautious with redirect rules that target page routes directly
- Always clear `.nuxt` cache after config changes
