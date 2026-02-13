# VP Associates Nuxt 3 - Continuous Improvement Notes

## Current Status

**All audit issues resolved** - Website is functioning correctly.

---

## Verified (Feb 13, 2026)

- ✅ Production build succeeds (`npm run build`)
- ✅ All 10 E2E tests pass (`npx playwright test tests-e2e/home.spec.ts`)
- ✅ AUD-001 to AUD-006 all fixed (see `.planning/audit/WEBSITE_AUDIT_2026-02-13.md`)
- ✅ Contact page SSR bug fixed

---

## Development Commands

```bash
npm run dev     # Start dev server (localhost:3000)
npm run build   # Production build
npm run preview # Preview production build
npx playwright test tests-e2e/home.spec.ts  # Run homepage tests
```

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

---

## Next Steps

No outstanding issues. Consider:
- Running a new audit if visual/functional changes are made
- Addressing the chunk size warning (809KB leaflet vendor bundle) if performance is a concern
