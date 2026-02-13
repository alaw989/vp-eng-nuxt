import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for VP Associates Nuxt 3 website
 *
 * Runs E2E tests against the preview server (http://localhost:3000)
 * Use: npm run build && npm run preview (in background) then npm run test:e2e
 */
export default defineConfig({
  testDir: './tests-e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['list'],
  ],
  timeout: 30000, // Increase timeout for client-side rendering
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Wait for network to be mostly idle before considering page loaded
    navigationTimeout: 15000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
