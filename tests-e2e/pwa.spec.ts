import { test, expect } from '@playwright/test'

// The service worker must finish installing for offline support and deploy
// updates to work. A fallback URL that is missing from the precache manifest
// leaves it stuck in "installing" (Workbox throws non-precached-url).
test.describe('Service worker', () => {
  test('activates and controls the page', async ({ page }) => {
    await page.goto('/projects')
    // ready resolves as soon as there is an active worker, which may still be
    // "activating"; poll for the final state before asserting.
    await expect.poll(async () => page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration()
      return {
        active: registration?.active?.state ?? null,
        controller: !!navigator.serviceWorker.controller
      }
    }), { timeout: 15000 }).toEqual({ active: 'activated', controller: true })
  })

  test('unknown URLs still get the site 404 while online', async ({ page }) => {
    await page.goto('/projects')
    await page.evaluate(() => navigator.serviceWorker.ready.then(() => true))
    await page.reload()

    const response = await page.goto('/this-page-does-not-exist-online')

    expect(response?.status()).toBe(404)
    await expect(page.getByRole('heading', { name: /page not found/i })).toBeVisible()
  })

  test('uncached navigation shows the offline page when offline', async ({ page, context }) => {
    await page.goto('/projects')
    await page.evaluate(() => navigator.serviceWorker.ready.then(() => true))
    await page.reload()

    await context.setOffline(true)
    await page.goto('/this-page-does-not-exist-offline').catch(() => {})

    await expect(page.getByRole('heading', { name: /you're offline/i })).toBeVisible()
  })
})
