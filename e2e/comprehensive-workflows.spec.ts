import { test, expect } from '@playwright/test'

test.describe('Complete User Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app before each test
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
  })

  test('User can sign up and create a todo', async ({ page }) => {
    // Click sign up
    await page.click('button:has-text("Sign Up")')
    
    // Fill signup form
    await page.fill('input[type="email"]', `user${Date.now()}@test.com`)
    await page.fill('input[type="password"]', 'TestPassword123')
    
    // Submit
    await page.click('button:has-text("Sign Up")')
    
    // Wait for confirmation message
    await expect(page.locator('text=Check your email')).toBeVisible({ timeout: 5000 })
  })

  test('Guest user can create and complete a todo', async ({ page }) => {
    // Click continue as guest
    await page.click('text=Continue as Guest')
    
    // Wait for dashboard
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 5000 })
    
    // Create todo
    await page.click('button:has-text("Add Todo")')
    await page.fill('input[placeholder="Todo title"]', 'Test Todo')
    await page.click('button:has-text("Create")')
    
    // Verify todo appears
    await expect(page.locator('text=Test Todo')).toBeVisible()
  })

  test('User can log weight', async ({ page }) => {
    // Continue as guest
    await page.click('text=Continue as Guest')
    
    // Navigate to weight
    await page.click('[role="navigation"] a[href="/weight"]')
    
    // Add weight entry
    await page.click('button:has-text("Log Weight")')
    await page.fill('input[type="number"]', '70')
    await page.click('button:has-text("Save")')
    
    // Verify entry appears
    await expect(page.locator('text=70')).toBeVisible()
  })

  test('User can view analytics', async ({ page }) => {
    // Continue as guest
    await page.click('text=Continue as Guest')
    
    // Navigate to analytics
    await page.click('[role="navigation"] a[href="/analytics"]')
    
    // Wait for analytics to load
    await expect(page.locator('text=Statistics')).toBeVisible({ timeout: 5000 })
  })

  test('User can manage categories', async ({ page }) => {
    // Continue as guest
    await page.click('text=Continue as Guest')
    
    // Navigate to settings
    await page.click('[role="navigation"] a[href="/settings"]')
    
    // Create category
    await page.click('button:has-text("Add Category")')
    await page.fill('input[placeholder="Category name"]', 'Shopping')
    await page.click('button:has-text("Create")')
    
    // Verify category appears
    await expect(page.locator('text=Shopping')).toBeVisible()
  })

  test('Guest user can logout', async ({ page }) => {
    // Continue as guest
    await page.click('text=Continue as Guest')
    
    // Navigate to settings
    await page.click('[role="navigation"] a[href="/settings"]')
    
    // Logout
    await page.click('button:has-text("Logout")')
    
    // Verify redirected to login
    await expect(page).toHaveURL('/login')
  })

  test('User data persists across page refreshes', async ({ page, context }) => {
    // Continue as guest
    await page.click('text=Continue as Guest')
    
    // Create todo
    await page.click('button:has-text("Add Todo")')
    await page.fill('input[placeholder="Todo title"]', 'Persistent Todo')
    await page.click('button:has-text("Create")')
    
    // Refresh page
    await page.reload()
    
    // Verify todo still exists
    await expect(page.locator('text=Persistent Todo')).toBeVisible()
  })

  test('User can switch between guest and authenticated mode', async ({ page }) => {
    // Start as guest
    await page.click('text=Continue as Guest')
    
    // Navigate to settings
    await page.click('[role="navigation"] a[href="/settings"]')
    
    // Should see "Sign Up" option
    await expect(page.locator('text=Sign Up')).toBeVisible()
  })
})

test.describe('Responsive Design', () => {
  test('Mobile view - user can navigate', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Navigate to app
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
    
    // Continue as guest
    await page.click('text=Continue as Guest')
    
    // Mobile menu should be visible
    const mobileMenu = page.locator('[role="navigation"]')
    await expect(mobileMenu).toBeVisible()
  })

  test('Tablet view - layout adjusts', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    
    // Navigate to app
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
    
    // Continue as guest
    await page.click('text=Continue as Guest')
    
    // Content should be visible
    await expect(page.locator('text=Dashboard')).toBeVisible()
  })
})

test.describe('Error Handling', () => {
  test('User sees error for invalid email', async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
    
    // Click sign up
    await page.click('button:has-text("Sign Up")')
    
    // Fill with invalid email
    await page.fill('input[type="email"]', 'invalid-email')
    await page.fill('input[type="password"]', 'Password123')
    
    // Submit
    await page.click('button:has-text("Sign Up")')
    
    // Error should appear
    await expect(page.locator('text=Invalid email')).toBeVisible({ timeout: 3000 })
  })

  test('User sees error for weak password', async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
    
    // Click sign up
    await page.click('button:has-text("Sign Up")')
    
    // Fill with weak password
    await page.fill('input[type="email"]', 'user@test.com')
    await page.fill('input[type="password"]', 'weak')
    
    // Submit
    await page.click('button:has-text("Sign Up")')
    
    // Error should appear
    await expect(page.locator('text=Password')).toBeVisible({ timeout: 3000 })
  })
})

test.describe('Performance', () => {
  test('Page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
    
    const loadTime = Date.now() - startTime
    
    // Page should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })

  test('Dashboard renders todos quickly', async ({ page }) => {
    // Go to guest mode
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
    await page.click('text=Continue as Guest')
    
    const startTime = Date.now()
    
    // Wait for todos to render
    await page.waitForSelector('[role="listitem"]', { timeout: 5000 })
    
    const renderTime = Date.now() - startTime
    
    // Should render quickly
    expect(renderTime).toBeLessThan(2000)
  })
})
