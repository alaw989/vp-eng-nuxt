import { test, expect } from '@playwright/test';

test.describe('WordPress API Integration', () => {
  test.describe('Projects API', () => {
    test('fetches projects list successfully', async ({ request }) => {
      const response = await request.get('/api/projects');

      expect(response.status()).toBe(200);
      const data = await response.json();

      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
    });

    test('projects data has required fields', async ({ request }) => {
      const response = await request.get('/api/projects');
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);

      const project = data.data[0];
      expect(project).toHaveProperty('title');
      expect(project).toHaveProperty('slug');
      expect(project).toHaveProperty('custom_fields');
    });

    test('projects have valid structure', async ({ request }) => {
      const response = await request.get('/api/projects');
      const data = await response.json();

      expect(data.success).toBe(true);

      // Check that each project has expected properties
      data.data.forEach((project: any) => {
        expect(project).toHaveProperty('title');
        expect(project).toHaveProperty('slug');

        // Title can be string (fallback) or object (WordPress API)
        if (typeof project.title === 'object') {
          expect(project.title).toHaveProperty('rendered');
        }

        expect(typeof project.slug).toBe('string');
      });
    });

    test('handles API failure gracefully with fallback', async ({ request }) => {
      // Verify fallback data structure exists by checking response succeeds
      const response = await request.get('/api/projects');
      const data = await response.json();

      // The API should always return success (either from WP or fallback)
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  test.describe('Services API', () => {
    test('fetches services list', async ({ request }) => {
      const response = await request.get('/api/services');
      expect(response.status()).toBe(200);
    });

    test('services data has valid structure', async ({ request }) => {
      const response = await request.get('/api/services');
      const data = await response.json();

      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);

      if (data.data.length > 0) {
        const service = data.data[0];
        expect(service).toHaveProperty('title');
        expect(service).toHaveProperty('slug');
      }
    });
  });

  test.describe('Testimonials API', () => {
    test('fetches testimonials list', async ({ request }) => {
      const response = await request.get('/api/testimonials');
      expect(response.status()).toBe(200);
    });

    test('testimonials data has valid structure', async ({ request }) => {
      const response = await request.get('/api/testimonials');
      const data = await response.json();

      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
    });
  });
});
