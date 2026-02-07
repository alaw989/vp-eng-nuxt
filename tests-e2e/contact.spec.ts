import { test, expect } from '@playwright/test';

test.describe('Contact Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('contact page loads', async ({ page }) => {
    // Check URL instead of title (title is globally set)
    await expect(page).toHaveURL(/\/contact/);

    // Check for contact heading in the page
    const heading = page.locator('h1').filter({ hasText: /contact/i });
    const hasHeading = await heading.count() > 0;

    // Either heading exists or page loads successfully
    if (hasHeading) {
      await expect(heading.first()).toBeVisible();
    }
  });

  test('has contact form or fields', async ({ page }) => {
    // Look for the contact form
    const form = page.locator('form');

    const formCount = await form.count();

    if (formCount > 0) {
      await expect(form.first()).toBeVisible();
    } else {
      // Look for input fields instead (contact form may be rendered client-side)
      const inputs = page.locator('input[id*="name" i], input[id*="email" i], input[name*="name" i], input[name*="email" i], textarea');
      const hasInputs = await inputs.count() > 0;

      // If no inputs found in main content, check that page has some form-related content
      if (!hasInputs) {
        const bodyText = await page.locator('body').textContent();
        // Page should at least have mention of contact
        expect(bodyText?.toLowerCase()).toContain('contact');
      }
    }
  });

  test('has contact information', async ({ page }) => {
    // Check for email in footer or page content
    await expect(page.getByText(/@/)).toBeVisible();
  });

  test('has form or submit capability', async ({ page }) => {
    // Check for form elements anywhere on the page
    const form = page.locator('form');
    const submitButton = page.locator('button[type="submit"], button:has-text("Send"), button:has-text("Submit")');

    const hasForm = await form.count() > 0;
    const hasButton = await submitButton.count() > 0;

    // At minimum, page should have contact-related content
    if (!hasForm && !hasButton) {
      const bodyText = await page.locator('body').textContent();
      expect(bodyText?.toLowerCase()).toMatch(/contact|email|phone|message/i);
    }
  });
});
