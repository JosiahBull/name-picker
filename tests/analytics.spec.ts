import { test } from './fixtures';
import { expect } from '@playwright/test';

// Constants for expected analytics values
const EXPECTED_INITIAL_ANALYTICS = {
    totalSwipes: 0,
    likes: 0,
    matches: 0,
};

const EXPECTED_AFTER_ONE_LIKE = {
    totalSwipes: 1,
    likes: 1,
    matches: 0,
};

const EXPECTED_AFTER_ONE_LIKE_ONE_PASS = {
    totalSwipes: 2,
    likes: 1,
    matches: 0,
};

test.describe('Analytics', () => {
    test('should update analytics correctly as user swipes', async ({
        joeContext,
        databaseHelper,
    }) => {
        const page = joeContext.page;

        // Ensure we're on the home page before starting
        await page.waitForSelector('h3:has-text("Welcome, Joe!")', { state: 'visible', timeout: 10000 });
        
        // Give time for auth state to stabilize
        await page.waitForTimeout(1000);
        
        await databaseHelper.clearTestData();

        // Navigate to analytics to check initial state
        await page.waitForSelector('button:has-text("Analytics")', { state: 'visible' });
        await page.click('button:has-text("Analytics")');
        await page.waitForURL('/analytics', { timeout: 10000 });

        // Check initial analytics display on page
        await expect(page.locator('text=Total Swipes')).toBeVisible();
        await expect(page.getByText('0').first()).toBeVisible(); // Total swipes should be 0

        // Go back to swiping page
        await page.goto('/');
        await page.waitForSelector('button:has-text("Start Swiping")', { state: 'visible' });
        await page.click('button:has-text("Start Swiping")');
        await page.waitForURL('/swipe', { timeout: 10000 });

        // Wait for name card to load
        await page.waitForSelector('[data-testid="name-card"]', { timeout: 10000 });
        
        // Click like and wait for the next card to appear (indicating swipe was processed)
        await page.click('button:has-text("Like")');
        await page.waitForSelector('[data-testid="name-card"]', { state: 'visible', timeout: 10000 });
        await page.waitForTimeout(500); // Small additional wait for database update

        const allSwipes = await databaseHelper.getAllSwipes(joeContext.userId);
        console.log('All swipes in database: ', JSON.stringify(allSwipes, null, 2));

        // Navigate back to analytics page via homepage
        await page.goto('/');
        await page.waitForURL('/', { timeout: 10000 });
        await page.waitForSelector('button:has-text("Analytics")', { state: 'visible' });
        await page.click('button:has-text("Analytics")');
        await page.waitForURL('/analytics', { timeout: 10000 });
        await page.waitForSelector('text=Total Swipes', { state: 'visible' });
        {
            const totalSwipesElement = page.locator('text=Total Swipes').locator('..//h3').first();
            const likesElement = page.locator('text=Names Liked').locator('..//h3').first();
            const matchesElement = page.locator('text=Matches Found').locator('..//h3').first();

            // Validate analytics after one like
            await expect(totalSwipesElement).toHaveText(EXPECTED_AFTER_ONE_LIKE.totalSwipes.toString());
            await expect(likesElement).toHaveText(EXPECTED_AFTER_ONE_LIKE.likes.toString());
            await expect(matchesElement).toHaveText(EXPECTED_AFTER_ONE_LIKE.matches.toString());
        }
        
        // Navigate back to swipe via homepage
        await page.goto('/');
        await page.waitForURL('/', { timeout: 10000 });
        await page.waitForSelector('button:has-text("Start Swiping")', { state: 'visible' });
        await page.click('button:has-text("Start Swiping")');
        await page.waitForURL('/swipe', { timeout: 10000 });

        // Perform a pass action on the next card
        await page.waitForSelector('[data-testid="name-card"]', { state: 'visible' });
        await page.click('button:has-text("Pass")');
        await page.waitForSelector('[data-testid="name-card"]', { state: 'visible', timeout: 10000 });
        await page.waitForTimeout(500); // Small additional wait for database update

        // Validate analytics after one like and one pass
        await page.goto('/');
        await page.waitForURL('/', { timeout: 10000 });
        await page.waitForSelector('button:has-text("Analytics")', { state: 'visible' });
        await page.click('button:has-text("Analytics")');
        await page.waitForURL('/analytics', { timeout: 10000 });
        await page.waitForSelector('text=Total Swipes', { state: 'visible' });
        {
            const totalSwipesElement = page.locator('text=Total Swipes').locator('..//h3').first();
            const likesElement = page.locator('text=Names Liked').locator('..//h3').first();
            const matchesElement = page.locator('text=Matches Found').locator('..//h3').first();

            await expect(totalSwipesElement).toHaveText(EXPECTED_AFTER_ONE_LIKE_ONE_PASS.totalSwipes.toString());
            await expect(likesElement).toHaveText(EXPECTED_AFTER_ONE_LIKE_ONE_PASS.likes.toString());
            await expect(matchesElement).toHaveText(EXPECTED_AFTER_ONE_LIKE_ONE_PASS.matches.toString());
        }
        
        // Validate that UI displays expected structure
        await expect(page.locator('text=Your Swiping Stats')).toBeVisible();
    });
});
