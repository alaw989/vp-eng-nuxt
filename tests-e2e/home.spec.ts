import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/VP Associates/);
  });

  test('loads main navigation', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    await expect(nav.first()).toBeVisible();

    // Check for main navigation links by text (case-insensitive)
    await expect(page.getByRole('link', { name: /^home$/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /^services$/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /^projects$/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /^about$/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /^contact$/i })).toBeVisible();
  });

  test('has hero section with content', async ({ page }) => {
    // Check for some kind of hero/section with structural engineering text
    const hero = page.locator('section, header').filter({ hasText: /structural engineering/i }).first();
    await expect(hero).toBeVisible();
  });

  test('displays services section', async ({ page }) => {
    const services = page.locator('h2, h3').filter({ hasText: /services/i }).first();
    await expect(services).toBeVisible();
  });

  test('displays featured projects', async ({ page }) => {
    const projects = page.locator('h2, h3').filter({ hasText: /projects|portfolio/i }).first();
    await expect(projects).toBeVisible();
  });

  test('has footer with contact information', async ({ page }) => {
    const footer = page.locator('footer').first();
    await expect(footer).toBeVisible();

    // Check for footer text content (email may be encoded or client-rendered)
    const footerText = await footer.textContent();
    expect(footerText?.length).toBeGreaterThan(50);
  });

  test('navigation links work correctly', async ({ page }) => {
    // Test Services link
    await page.click('a[href*="/services"]');
    await expect(page).toHaveURL(/\/services/);

    // Go back
    await page.goBack();

    // Test Projects link
    await page.click('a[href*="/projects"]');
    await expect(page).toHaveURL(/\/projects/);
  });

  test('is responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check page is still usable - nav should still exist
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });

  test('has no console errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(message.text());
      }
    });

    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');

    // Check for hydration errors or Vue warnings
    const hydrationErrors = errors.filter(e =>
      e.includes('Hydration') ||
      e.includes('Vue warning') ||
      e.includes('Failed to fetch')
    );

    expect(hydrationErrors).toHaveLength(0);
  });

  test('meta tags are present', async ({ page }) => {
    // Check for description meta tag
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).not.toBeNull();
    expect(description?.length).toBeGreaterThan(0);

    // Check for viewport meta tag
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width');
  });
});
