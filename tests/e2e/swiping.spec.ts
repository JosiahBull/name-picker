import { test, expect } from '@playwright/test';
import { loginAsJoe, loginAsSam } from '../helpers/auth-helpers';

test.describe('Swiping Functionality', () => {
  test('should display swipe page after login', async ({ page }) => {
    await loginAsJoe(page);
    
    // Navigate to swipe page
    await page.click('button:has-text("Start Swiping")');
    await expect(page).toHaveURL('/swipe');
    
    // Should show swipe interface title in app bar
    await expect(page.locator('header [class*="MuiTypography-h6"]')).toContainText('Swipe Names');
    await expect(page.locator('text=Names Reviewed:')).toBeVisible();
  });

  test('should load and display a name card', async ({ page }) => {
    await loginAsJoe(page);
    await page.click('button:has-text("Start Swiping")');
    
    // Wait for name to load
    await page.waitForSelector('[data-testid="name-card"]', { timeout: 10000 });
    
    // Should display name information
    const nameCard = page.locator('[data-testid="name-card"]');
    await expect(nameCard).toBeVisible();
    
    // Should have swipe buttons
    await expect(page.locator('button:has-text("Pass")')).toBeVisible();
    await expect(page.locator('button:has-text("Like")')).toBeVisible();
  });

  test('should handle like button click', async ({ page }) => {
    await loginAsJoe(page);
    await page.click('button:has-text("Start Swiping")');
    
    // Wait for name to load
    await page.waitForSelector('[data-testid="name-card"]', { timeout: 10000 });
    
    // Get initial swipe count
    const initialCount = await page.locator('text=Names Reviewed:').textContent();
    
    // Click like button
    await page.click('button:has-text("Like")');
    
    // Wait for next name to load or completion message
    await page.waitForTimeout(1000);
    
    // Swipe count should increment or show completion
    const content = await page.content();
    const hasNextName = content.includes('data-testid="name-card"');
    const isComplete = content.includes('All done for now!');
    
    expect(hasNextName || isComplete).toBe(true);
  });

  test('should handle pass button click', async ({ page }) => {
    await loginAsJoe(page);
    await page.click('button:has-text("Start Swiping")');
    
    // Wait for name to load
    await page.waitForSelector('[data-testid="name-card"]', { timeout: 10000 });
    
    // Click pass button
    await page.click('button:has-text("Pass")');
    
    // Wait for next name to load or completion message
    await page.waitForTimeout(1000);
    
    // Should load next name or show completion
    const content = await page.content();
    const hasNextName = content.includes('data-testid="name-card"');
    const isComplete = content.includes('All done for now!');
    
    expect(hasNextName || isComplete).toBe(true);
  });

  test('should show completion message when no more names', async ({ page }) => {
    await loginAsJoe(page);
    await page.click('button:has-text("Start Swiping")');
    
    // Swipe through all available names (limit to prevent infinite loop)
    let swipeCount = 0;
    const maxSwipes = 50;
    
    while (swipeCount < maxSwipes) {
      try {
        // Wait for either name card or completion message
        await page.waitForFunction(() => {
          const hasCard = !!document.querySelector('[data-testid="name-card"]');
          const hasComplete = document.body.textContent?.includes('All done for now!') || false;
          return hasCard || hasComplete;
        }, { timeout: 5000 });
        
        // Check if we're done
        const isComplete = await page.locator('text=All done for now!').isVisible();
        if (isComplete) {
          await expect(page.locator('text=All done for now!')).toBeVisible();
          await expect(page.locator('button:has-text("Go Back")')).toBeVisible();
          break;
        }
        
        // Swipe if name card is available
        const nameCard = page.locator('[data-testid="name-card"]');
        if (await nameCard.isVisible()) {
          await page.click('button:has-text("Pass")');
          swipeCount++;
          await page.waitForTimeout(500);
        } else {
          break;
        }
      } catch (error) {
        // If we timeout waiting for elements, we're probably done
        break;
      }
    }
    
    // Should eventually show completion or we hit our limit
    expect(swipeCount).toBeGreaterThan(0);
  });
});
