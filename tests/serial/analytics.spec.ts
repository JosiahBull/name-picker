import { test, expect } from '../setup/database-setup';
import { loginAsJoe } from '../helpers/auth-helpers';

// Constants for expected analytics values
const EXPECTED_INITIAL_ANALYTICS = {
  totalSwipes: 0,
  likes: 0,
  dislikes: 0,
  matches: 0,
};

const EXPECTED_AFTER_ONE_LIKE = {
  totalSwipes: 1,
  likes: 1,
  dislikes: 0,
  matches: 0,
};

const EXPECTED_AFTER_ONE_LIKE_ONE_PASS = {
  totalSwipes: 2,
  likes: 1,
  dislikes: 1,
  matches: 0,
};

test.describe('Analytics', () => {
  test('should update analytics correctly as user swipes', async ({ page, databaseHelper }) => {
    await loginAsJoe(page);
    
    // Get Joe's user ID for database validation
    const { joeId } = await databaseHelper.getTestUserIds();
    
    // Navigate to analytics to check initial state
    await page.click('button:has-text("Analytics")');
    await expect(page).toHaveURL('/analytics');
    
    // Validate initial analytics values from database
    const initialDbAnalytics = await databaseHelper.getUserAnalytics(joeId);
    expect(initialDbAnalytics).toEqual(EXPECTED_INITIAL_ANALYTICS);
    
    // Check initial analytics display on page
    await expect(page.locator('text=Total Swipes')).toBeVisible();
    await expect(page.getByText('0').first()).toBeVisible(); // Total swipes should be 0
    
    // Go back to swiping page
    await page.goBack();
    await page.click('button:has-text("Start Swiping")');
    await expect(page).toHaveURL('/swipe');
    
    // Wait for name card to load
    await page.waitForSelector('[data-testid="name-card"]', { timeout: 10000 });
    await page.click('button:has-text("Like")');
    await page.waitForTimeout(500); // Wait for API call
    
    // Validate analytics after one like
    const afterLikeDbAnalytics = await databaseHelper.getUserAnalytics(joeId);
    expect(afterLikeDbAnalytics).toEqual(EXPECTED_AFTER_ONE_LIKE);
    
    // Perform a pass action on the next card
    await page.click('button:has-text("Pass")');
    await page.waitForTimeout(500); // Wait for API call
    
    // Validate analytics after one like and one pass
    const afterPassDbAnalytics = await databaseHelper.getUserAnalytics(joeId);
    expect(afterPassDbAnalytics).toEqual(EXPECTED_AFTER_ONE_LIKE_ONE_PASS);

    // Navigate to analytics page
    await page.goto('/analytics');
    
    // Validate that UI shows correct values matching database
    await expect(page.locator('text=Total Swipes')).toBeVisible();
    
    // Find the analytics values on the page and verify they match database
    const totalSwipesElement = page.locator('text=Total Swipes').locator('..//h3').first();
    const likesElement = page.locator('text=Names Liked').locator('..//h3').first();
    const matchesElement = page.locator('text=Matches Found').locator('..//h3').first();
    
    await expect(totalSwipesElement).toHaveText(afterPassDbAnalytics.totalSwipes.toString());
    await expect(likesElement).toHaveText(afterPassDbAnalytics.likes.toString());
    await expect(matchesElement).toHaveText(afterPassDbAnalytics.matches.toString());
    
    // Validate that UI displays expected structure
    await expect(page.locator('text=Your Swiping Stats')).toBeVisible();
  });

  test('should display analytics sections correctly', async ({ page, databaseHelper }) => {
    await loginAsJoe(page);
    
    // Get Joe's user ID for database validation
    const { joeId } = await databaseHelper.getTestUserIds();
    
    // Navigate to analytics page
    await page.click('button:has-text("Analytics")');
    await expect(page).toHaveURL('/analytics');
    
    // Get current analytics from database
    const dbAnalytics = await databaseHelper.getUserAnalytics(joeId);
    
    // Check that main analytics sections are present
    await expect(page.locator('header [class*="MuiTypography-h6"]')).toContainText('Analytics');
    
    // Check for analytics cards/sections
    await expect(page.locator('text=Total Swipes')).toBeVisible();
    await expect(page.locator('text=Names Liked')).toBeVisible();
    await expect(page.locator('text=Matches Found')).toBeVisible();
    await expect(page.locator('text=Your Swiping Stats')).toBeVisible();
    
    // Validate that the displayed values match database values
    const totalSwipesElement = page.locator('text=Total Swipes').locator('..//h3').first();
    const likesElement = page.locator('text=Names Liked').locator('..//h3').first();
    const matchesElement = page.locator('text=Matches Found').locator('..//h3').first();
    
    await expect(totalSwipesElement).toHaveText(dbAnalytics.totalSwipes.toString());
    await expect(likesElement).toHaveText(dbAnalytics.likes.toString());
    await expect(matchesElement).toHaveText(dbAnalytics.matches.toString());
  });
});
