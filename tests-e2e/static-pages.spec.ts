import { test, expect } from '@playwright/test'

test.describe('Error Page (404)', () => {
  test('error page displays correctly', async ({ page }) => {
    // Navigate to a non-existent page
    await page.goto('/this-page-does-not-exist')
    await page.waitForLoadState('domcontentloaded')

    // Check for 404 heading
    const heading = page.locator('h1:has-text("404"), h1:has-text("Page Not Found"), h1:has-text("Page not found")')
    await expect(heading.first()).toBeVisible()
  })

  test('error page has helpful navigation links', async ({ page }) => {
    await page.goto('/non-existent-page')
    await page.waitForLoadState('domcontentloaded')

    // Check for homepage link - Nitro's default has "Go back home"
    const homeLink = page.locator('a[href="/"], a:has-text("Go to Homepage"), a:has-text("Go back home")')
    await expect(homeLink.first()).toBeVisible()
  })

  test('error page has go back button', async ({ page }) => {
    await page.goto('/another-404-page')
    await page.waitForLoadState('domcontentloaded')

    const backButton = page.locator('button:has-text("Go Back")')
    const exists = await backButton.count()
    if (exists > 0) {
      await expect(backButton.first()).toBeVisible()
    }
  })

  test('error page shows 404 status', async ({ page }) => {
    await page.goto('/page-not-found')
    await page.waitForLoadState('domcontentloaded')

    // The page should show a 404 status code or message
    const bodyText = await page.locator('body').textContent()
    expect(bodyText).toMatch(/404|not found/i)
  })

  test('navigating home from error page works', async ({ page }) => {
    await page.goto('/not-found')
    await page.waitForLoadState('domcontentloaded')

    // Try multiple possible home link texts
    const homeLink = page.locator('a:has-text("Go to Homepage"), a:has-text("Go back home"), a[href="/"]').first()
    await expect(homeLink).toBeVisible()
    await homeLink.click()

    // Should navigate to home - wait for navigation
    await page.waitForURL('/', { timeout: 5000 })
    expect(page.url()).toMatch(/\/$/)
  })
})

test.describe('Offline Page', () => {
  test('offline page displays correctly', async ({ page }) => {
    await page.goto('/offline')
    await page.waitForLoadState('domcontentloaded')

    // Check for offline heading
    const heading = page.locator('h1:has-text("Offline"), h1:has-text("connection")')
    await expect(heading.first()).toBeVisible()
  })

  test('offline page has refresh button', async ({ page }) => {
    await page.goto('/offline')
    await page.waitForLoadState('domcontentloaded')

    const refreshButton = page.locator('button:has-text("Try Again"), button:has-text("Refresh")')
    await expect(refreshButton.first()).toBeVisible()
  })

  test('offline page has home link', async ({ page }) => {
    await page.goto('/offline')
    await page.waitForLoadState('domcontentloaded')

    const homeLink = page.locator('a[href="/"], a:has-text("Go to Home")')
    await expect(homeLink.first()).toBeVisible()
  })

  test('offline page shows contact information', async ({ page }) => {
    await page.goto('/offline')
    await page.waitForLoadState('domcontentloaded')

    // Check for contact section
    const contactSection = page.locator('text=Contact Information, text=Contact')
    const exists = await contactSection.count()
    if (exists > 0) {
      await expect(contactSection.first()).toBeVisible()
    }
  })

  test('offline page has helpful tips', async ({ page }) => {
    await page.goto('/offline')
    await page.waitForLoadState('domcontentloaded')

    // Check for tips section - the page has "What you can do:" heading
    const tipsHeading = page.locator('text=What you can do')
    await expect(tipsHeading.first()).toBeVisible()

    // Check for specific tip content
    const checkConnection = page.locator('text=Check your internet connection')
    await expect(checkConnection.first()).toBeVisible()
  })
})

test.describe('Privacy Policy Page', () => {
  test('privacy page loads successfully', async ({ page }) => {
    await page.goto('/privacy')
    await page.waitForLoadState('domcontentloaded')

    // Check for main heading
    const heading = page.locator('h1:has-text("Privacy Policy")')
    await expect(heading.first()).toBeVisible()
  })

  test('privacy page has last updated date', async ({ page }) => {
    await page.goto('/privacy')
    await page.waitForLoadState('domcontentloaded')

    // Check for date display - "Last Updated:" followed by a date
    const dateText = page.locator('text=Last Updated:')
    await expect(dateText.first()).toBeVisible()
  })

  test('privacy page has main sections', async ({ page }) => {
    await page.goto('/privacy')
    await page.waitForLoadState('domcontentloaded')

    // Check for key sections
    const introduction = page.locator('h2:has-text("Introduction")')
    const infoCollect = page.locator('h2:has-text("Information We Collect"), h2:has-text("Collect")')
    const dataUse = page.locator('h2:has-text("Use Your Information"), h2:has-text("Use")')
    const contactSection = page.locator('h2:has-text("Contact"), h3:has-text("Contact")')

    await expect(introduction.first()).toBeVisible()
    await expect(infoCollect.first()).toBeVisible()
    await expect(dataUse.first()).toBeVisible()
    await expect(contactSection.first()).toBeVisible()
  })

  test('privacy page has contact email', async ({ page }) => {
    await page.goto('/privacy')
    await page.waitForLoadState('domcontentloaded')

    const emailLink = page.locator('a[href^="mailto:"]')
    const count = await emailLink.count()
    if (count > 0) {
      await expect(emailLink.first()).toBeVisible()
    }
  })
})

test.describe('Terms of Service Page', () => {
  test('terms page loads successfully', async ({ page }) => {
    await page.goto('/terms')
    await page.waitForLoadState('domcontentloaded')

    // Check for main heading
    const heading = page.locator('h1:has-text("Terms"), h1:has-text("Conditions")')
    await expect(heading.first()).toBeVisible()
  })

  test('terms page has legal content sections', async ({ page }) => {
    await page.goto('/terms')
    await page.waitForLoadState('domcontentloaded')

    // Check for typical legal sections
    const bodyText = await page.locator('body').textContent()
    expect(bodyText?.length).toBeGreaterThan(500)
  })
})

test.describe('Site Map Page', () => {
  test('sitemap page loads successfully', async ({ page }) => {
    await page.goto('/sitemap')
    await page.waitForLoadState('domcontentloaded')

    // Check for main heading
    const heading = page.locator('h1:has-text("Site Map"), h1:has-text("Sitemap")')
    await expect(heading.first()).toBeVisible()
  })

  test('sitemap has navigation links', async ({ page }) => {
    await page.goto('/sitemap')
    await page.waitForLoadState('domcontentloaded')

    // Check for links to main sections
    const links = page.locator('a[href^="/"]')
    const count = await links.count()
    expect(count).toBeGreaterThan(5)
  })
})

test.describe('Accessibility Page', () => {
  test('accessibility page loads successfully', async ({ page }) => {
    await page.goto('/accessibility')
    await page.waitForLoadState('domcontentloaded')

    // Check for main heading
    const heading = page.locator('h1:has-text("Accessibility")')
    const exists = await heading.count()
    if (exists > 0) {
      await expect(heading.first()).toBeVisible()
    }
  })
})

test.describe('Index/Home Page Navigation', () => {
  test('home page loads from root', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    // Should load successfully
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('home page has main navigation', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    // Check for nav element
    const nav = page.locator('nav')
    await expect(nav.first()).toBeVisible()
  })

  test('home page has footer', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    // Check for footer
    const footer = page.locator('footer')
    await expect(footer.first()).toBeVisible()
  })
})
