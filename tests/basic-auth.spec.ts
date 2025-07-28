import { test, expect } from '@playwright/test';

test.describe('Basic Authentication', () => {
	test('should display login page when not authenticated', async ({ page }) => {
		await page.goto('/');

		// Should redirect to login page
		await expect(page).toHaveURL('/login');
		await expect(page.locator('h3')).toContainText('Name Picker');
		// Check for login form elements
		await expect(page.locator('input[type="email"]')).toBeVisible();
		await expect(page.locator('input[type="password"]')).toBeVisible();
	});

	test('should allow Joe to login', async ({ page }) => {
		await page.goto('/login');

		// Fill in login form
		await page.fill('input[type="email"]', 'joe@example.com');
		await page.fill('input[type="password"]', 'password123');
		await page.click('button[type="submit"]:has-text("Login")');

		// Should redirect to home page
		await expect(page).toHaveURL('/');
		await expect(page.locator('h3')).toContainText('Welcome, Joe!');
	});

	test('should allow Sam to login', async ({ page }) => {
		await page.goto('/login');

		// Fill in login form
		await page.fill('input[type="email"]', 'sam@example.com');
		await page.fill('input[type="password"]', 'password123');
		await page.click('button[type="submit"]:has-text("Login")');

		// Should redirect to home page
		await expect(page).toHaveURL('/');
		await expect(page.locator('h3')).toContainText('Welcome, Sam!');
	});

	test('should persist login state after page refresh', async ({ page }) => {
		await page.goto('/login');

		// Login as Joe
		await page.fill('input[type="email"]', 'joe@example.com');
		await page.fill('input[type="password"]', 'password123');
		await page.click('button[type="submit"]:has-text("Login")');

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

		// Login as Joe
		await page.fill('input[type="email"]', 'joe@example.com');
		await page.fill('input[type="password"]', 'password123');
		await page.click('button[type="submit"]:has-text("Login")');

		// Wait for home page
		await expect(page).toHaveURL('/');

		// Navigate to settings and logout
		await page.click('button:has-text("Logout")');

		// Should redirect to login page
		await expect(page).toHaveURL('/login');
	});
});
