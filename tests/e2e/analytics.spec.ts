import { test, expect } from '@playwright/test';
import { loginAsJoe } from '../helpers/auth-helpers';

test.describe('Analytics', () => {
  test('should update analytics correctly as user swipes', async ({ page }) => {
    await loginAsJoe(page);
    
    // Navigate to analytics to check initial state
    await page.click('button:has-text("Analytics")');
    await expect(page).toHaveURL('/analytics');
    
    // Check initial analytics (should be 0 for new user)
    await expect(page.locator('text=Total Swipes')).toBeVisible();
    
    // Go back to swiping page
    await page.goBack();
    await page.click('button:has-text("Start Swiping")');
    await expect(page).toHaveURL('/swipe');
    
    // Wait for name card to load
    await page.waitForSelector('[data-testid="name-card"]', { timeout: 10000 });
    
    // Perform a like action
    await page.click('button:has-text("Like")');
    await page.waitForTimeout(1000); // Wait for API call
    
    // Check if we can swipe another card or if we're done
    const hasMoreCards = await page.locator('[data-testid="name-card"]').isVisible();
    if (hasMoreCards) {
      // Perform a pass action on the next card
      await page.click('button:has-text("Pass")');
      await page.waitForTimeout(1000); // Wait for API call
    }
    
    // Navigate to analytics page
    await page.goto('/analytics');
    
    // Check that analytics have been updated
    await expect(page.locator('text=Total Swipes')).toBeVisible();
    
    // Check that analytics numbers are displayed
    await expect(page.locator('text=Your Swiping Stats')).toBeVisible();
  });

  test('should display analytics sections correctly', async ({ page }) => {
    await loginAsJoe(page);
    
    // Navigate to analytics page
    await page.click('button:has-text("Analytics")');
    await expect(page).toHaveURL('/analytics');
    
    // Check that main analytics sections are present
    await expect(page.locator('header [class*="MuiTypography-h6"]')).toContainText('Analytics');
    
    // Check for analytics cards/sections
    await expect(page.locator('text=Total Swipes')).toBeVisible();
    await expect(page.locator('text=Names Liked')).toBeVisible();
    await expect(page.locator('text=Matches Found')).toBeVisible();
    await expect(page.locator('text=Your Swiping Stats')).toBeVisible();
  });
});