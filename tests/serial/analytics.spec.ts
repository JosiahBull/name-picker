import { test } from '../fixtures/auth';
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

        await page.waitForTimeout(2000);
        await databaseHelper.clearTestData();

        // Navigate to analytics to check initial state
        await page.click('button:has-text("Analytics")');
        await expect(page).toHaveURL('/analytics');

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
        await page.waitForTimeout(1000); // Wait for API call to update analytics

        const allSwipes = await databaseHelper.getAllSwipes(joeContext.userId);
        console.log('All swipes in database: ', JSON.stringify(allSwipes, null, 2));

        // Navigate back to analytics page
        await page.goto('/analytics');
        await page.waitForTimeout(500); // Ensure page is fully loaded
        {
            const totalSwipesElement = page.locator('text=Total Swipes').locator('..//h3').first();
            const likesElement = page.locator('text=Names Liked').locator('..//h3').first();
            const matchesElement = page.locator('text=Matches Found').locator('..//h3').first();

            // Validate analytics after one like
            await expect(totalSwipesElement).toHaveText(EXPECTED_AFTER_ONE_LIKE.totalSwipes.toString());
            await expect(likesElement).toHaveText(EXPECTED_AFTER_ONE_LIKE.likes.toString());
            await expect(matchesElement).toHaveText(EXPECTED_AFTER_ONE_LIKE.matches.toString());
        }
        await page.goto('/swipe');

        // Perform a pass action on the next card
        await page.click('button:has-text("Pass")');
        await page.waitForTimeout(1000); // Wait for API call to update analytics

        // Validate analytics after one like and one pass
        await page.goto('/analytics');
        await page.waitForTimeout(500); // Ensure page is fully loaded
        {
            const totalSwipesElement = page.locator('text=Total Swipes').locator('..//h3').first();
            const likesElement = page.locator('text=Names Liked').locator('..//h3').first();
            const matchesElement = page.locator('text=Matches Found').locator('..//h3').first();

            await expect(totalSwipesElement).toHaveText(EXPECTED_AFTER_ONE_LIKE_ONE_PASS.totalSwipes.toString());
            await expect(likesElement).toHaveText(EXPECTED_AFTER_ONE_LIKE_ONE_PASS.likes.toString());
            await expect(matchesElement).toHaveText(EXPECTED_AFTER_ONE_LIKE_ONE_PASS.matches.toString());
        }
        await page.goto('/swipe');

        // Find the analytics values on the page and verify they match database
        await page.goto('/analytics');
        await page.waitForTimeout(500); // Ensure page is fully loaded
        {
            const totalSwipesElement = page.locator('text=Total Swipes').locator('..//h3').first();
            const likesElement = page.locator('text=Names Liked').locator('..//h3').first();
            const matchesElement = page.locator('text=Matches Found').locator('..//h3').first();

            // Validate analytics values
            await expect(totalSwipesElement).toHaveText(EXPECTED_AFTER_ONE_LIKE_ONE_PASS.totalSwipes.toString());
            await expect(likesElement).toHaveText(EXPECTED_AFTER_ONE_LIKE_ONE_PASS.likes.toString());
            await expect(matchesElement).toHaveText(EXPECTED_AFTER_ONE_LIKE_ONE_PASS.matches.toString());
        }
        await page.goto('/swipe');

        // Validate that UI displays expected structure
        await expect(page.locator('text=Your Swiping Stats')).toBeVisible();
    });
});
