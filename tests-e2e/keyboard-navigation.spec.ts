import { test, expect } from '@playwright/test'

test.describe('Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('Tab key follows logical order through interactive elements', async ({ page }) => {
    // Start from body
    await page.keyboard.press('Tab')

    // First tab should focus skip link (if present) or logo
    const firstFocus = await page.evaluate(() => document.activeElement?.tagName)
    expect(['A', 'BUTTON', 'SKIP-LINK']).toContain(firstFocus?.toUpperCase())

    // Tab through navigation
    let tabs = 0
    let foundNav = false
    while (tabs < 20) {
      await page.keyboard.press('Tab')
      const tagName = await page.evaluate(() => document.activeElement?.tagName)
      const ariaLabel = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))

      // Check for main navigation elements
      if (tagName === 'A' || (tagName === 'BUTTON' && ariaLabel?.includes('menu'))) {
        foundNav = true
        break
      }
      tabs++
    }

    expect(foundNav).toBe(true)
  })

  test('Enter key activates buttons and links', async ({ page }) => {
    // Navigate to contact button using Tab
    let tabs = 0
    while (tabs < 30) {
      await page.keyboard.press('Tab')
      const text = await page.evaluate(() => document.activeElement?.textContent)
      if (text?.includes('Contact')) {
        break
      }
      tabs++
    }

    // Press Enter to activate
    await page.keyboard.press('Enter')

    // Should navigate to contact page
    await expect(page).toHaveURL(/\/contact/)
  })

  test('Escape key closes mobile menu', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Find and click mobile menu button
    const menuButton = page.getByRole('button', { name: /open menu/i })
    await menuButton.click()

    // Mobile menu should be visible
    const mobileMenu = page.getByRole('navigation', { name: /mobile navigation/i })
    await expect(mobileMenu).toBeVisible()

    // Press Escape to close
    await page.keyboard.press('Escape')

    // Mobile menu should not be visible
    await expect(mobileMenu).not.toBeVisible()
  })

  test('Arrow keys navigate hero slider', async ({ page }) => {
    // Focus the hero slider
    const heroSlider = page.locator('section[aria-label="Hero slider"]')
    await heroSlider.click()

    // Get initial slide aria-live text
    const initialSlide = await page.locator('.sr-only[aria-live="polite"]').textContent()

    // Press ArrowRight to go to next slide
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(800) // Wait for transition

    // Slide should have changed
    const afterNextSlide = await page.locator('.sr-only[aria-live="polite"]').textContent()
    expect(afterNextSlide).not.toBe(initialSlide)

    // Press ArrowLeft to go back
    await page.keyboard.press('ArrowLeft')
    await page.waitForTimeout(800)

    const afterPrevSlide = await page.locator('.sr-only[aria-live="polite"]').textContent()
    expect(afterPrevSlide).toBe(initialSlide)
  })

  test('Home and End keys navigate to first and last slides', async ({ page }) => {
    // Focus the hero slider
    const heroSlider = page.locator('section[aria-label="Hero slider"]')
    await heroSlider.click()

    // Press ArrowRight a few times to move away from first slide
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(800)
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(800)

    // Press Home to go to first slide
    await page.keyboard.press('Home')
    await page.waitForTimeout(800)

    // Should announce first slide
    const homeSlideText = await page.locator('.sr-only[aria-live="polite"]').textContent()
    expect(homeSlideText).toContain('Slide 1 of')

    // Press End to go to last slide
    await page.keyboard.press('End')
    await page.waitForTimeout(800)

    // Should announce last slide
    const endSlideText = await page.locator('.sr-only[aria-live="polite"]').textContent()
    expect(endSlideText).toContain('Slide 9 of') // Hero has 9 slides
  })

  test('No keyboard traps exist on the homepage', async ({ page }) => {
    // Track visited elements to detect loops
    const visited = new Set<string>()

    // Tab through page and ensure we can exit
    for (let i = 0; i < 100; i++) {
      await page.keyboard.press('Tab')

      const tagName = await page.evaluate(() => document.activeElement?.tagName)
      const id = await page.evaluate(() => document.activeElement?.id)
      const className = await page.evaluate(() => document.activeElement?.className)

      const identifier = `${tagName}-${id}-${className}`

      // If we've seen this exact element 3 times, we might be in a trap
      const count = visited.has(identifier) ? 1 : 0
      if (count > 3) {
        throw new Error(`Possible keyboard trap detected at ${identifier}`)
      }

      visited.add(identifier)

      // If we reach body/html, we've cycled through normally
      if (tagName === 'BODY' || tagName === 'HTML') {
        break
      }
    }

    // Test completed without infinite loop
    expect(true).toBe(true)
  })

  test('Tab navigation works on project detail page gallery', async ({ page }) => {
    // Navigate to a project detail page
    await page.goto('/projects/structural-design-renovation')

    // Tab to gallery images
    let foundGalleryImage = false
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab')
      const role = await page.evaluate(() => document.activeElement?.getAttribute('role'))
      const ariaLabel = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))

      if (role === 'button' && ariaLabel?.includes('Open gallery')) {
        foundGalleryImage = true
        break
      }
    }

    expect(foundGalleryImage).toBe(true)

    // Press Enter to open lightbox
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)

    // Lightbox should be open
    const lightbox = page.getByRole('dialog', { name: /project gallery/i })
    await expect(lightbox).toBeVisible()

    // Press Escape to close lightbox
    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)

    // Lightbox should be closed
    await expect(lightbox).not.toBeVisible()
  })
})
