import { test, expect } from '@playwright/test';

test.describe('About Pages', () => {
  test('about page loads', async ({ page }) => {
    await page.goto('/about');

    // Check for about heading instead of title (title is globally set)
    await expect(page.locator('h1, h2').filter({ hasText: /about/i }).first()).toBeVisible();
  });

  test('has company description', async ({ page }) => {
    await page.goto('/about');

    // Should have some content about the company
    const main = page.locator('main, article');
    const textContent = await main.textContent();

    expect(textContent?.length).toBeGreaterThan(100);
  });

  test('displays team members or leadership (if present)', async ({ page }) => {
    await page.goto('/about');

    // Look for team section
    const teamSection = page.locator('[id*="team" i], [class*="team" i], h2:has-text("team")');

    const hasTeam = await teamSection.count() > 0;

    if (hasTeam) {
      await expect(teamSection.first()).toBeVisible();
    }
    // Test passes if no team section exists
  });

  test('has navigation from about to other pages', async ({ page }) => {
    await page.goto('/about');

    // Should have navigation links
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    await expect(nav.first()).toBeVisible();
  });
});
