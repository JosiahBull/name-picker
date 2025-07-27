import { test, expect } from '@playwright/test';

test.describe('Basic Authentication', () => {
	test('should display login page when not authenticated', async ({ page }) => {
		await page.goto('/');

		// Should redirect to login page
		await expect(page).toHaveURL('/login');
		await expect(page.locator('h3')).toContainText('Name Picker');
		await expect(page.locator('h5')).toContainText('Who are you?');
	});

	test('should allow Joe to login', async ({ page }) => {
		await page.goto('/login');

		// Click Joe's button
		await page.click('button:has-text("Joe")');

		// Should redirect to home page
		await expect(page).toHaveURL('/');
		await expect(page.locator('h3')).toContainText('Welcome, Joe!');
	});

	test('should allow Sam to login', async ({ page }) => {
		await page.goto('/login');

		// Click Sam's button
		await page.click('button:has-text("Sam")');

		// Should redirect to home page
		await expect(page).toHaveURL('/');
		await expect(page.locator('h3')).toContainText('Welcome, Sam!');
	});

	test('should persist login state after page refresh', async ({ page }) => {
		await page.goto('/login');
		await page.click('button:has-text("Joe")');

		// Verify logged in
		await expect(page).toHaveURL('/');
		await expect(page.locator('h3')).toContainText('Welcome, Joe!');

		// Refresh page
		await page.reload();

		// Wait for auth to load and redirect to happen
		await page.waitForURL('/', { timeout: 10000 });

		// Should still be logged in
		await expect(page.locator('h3')).toContainText('Welcome, Joe!');
	});

	test('should allow logout', async ({ page }) => {
		await page.goto('/login');
		await page.click('button:has-text("Joe")');

		// Navigate to settings and logout
		await page.click('button:has-text("Logout")');

		// Should redirect to login page
		await expect(page).toHaveURL('/login');
	});
});
