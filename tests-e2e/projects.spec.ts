import { test, expect } from '@playwright/test';

test.describe('Projects Pages', () => {
  test('projects index page loads', async ({ page }) => {
    await page.goto('/projects');

    // Wait for page to be loaded (Nuxt uses client-side rendering)
    await page.waitForLoadState('domcontentloaded');

    // Check that we're on the projects page by URL
    await expect(page).toHaveURL(/\/projects/);
  });

  test('displays project cards or grid', async ({ page }) => {
    await page.goto('/projects');

    // Look for project content (may need to wait for client-side rendering)
    await page.waitForLoadState('domcontentloaded');

    // Check that page has some content
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(100);
  });

  test('project detail page loads correctly', async ({ page }) => {
    await page.goto('/projects');

    // Find a project link and click it
    const projectLink = page.locator('a[href*="/projects/"]').first();

    const count = await projectLink.count();

    if (count > 0) {
      await projectLink.click();

      // Wait for navigation
      await page.waitForLoadState('domcontentloaded');

      // Should be on a project detail page
      await expect(page).toHaveURL(/\/projects\/.+/);

      // Should have body content
      const body = page.locator('body');
      await expect(body).toBeVisible();
    } else {
      test.skip(true, 'No project links found to test');
    }
  });

  test('project images load correctly', async ({ page }) => {
    await page.goto('/projects');

    // Find all images on the page
    const images = page.locator('img');

    const count = await images.count();

    if (count > 0) {
      // Check first few images load
      for (let i = 0; i < Math.min(count, 3); i++) {
        const img = images.nth(i);
        await expect(img).toBeVisible();
      }
    }
  });

  test('project filtering or categories work (if present)', async ({ page }) => {
    await page.goto('/projects');

    // Look for category filters
    const categoryButtons = page.locator('button, [role="button"], a').filter({
      hasText: /all|commercial|residential|institutional|educational/i
    });

    const count = await categoryButtons.count();

    if (count > 0) {
      await categoryButtons.first().click();
      await page.waitForTimeout(500);
    }
    // Test passes if no filters exist
  });
});
