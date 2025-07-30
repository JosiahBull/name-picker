import { test } from './fixtures';
import { expect } from '@playwright/test';

test.describe('Navigation', () => {
	test('should navigate between all main pages', async ({ joeContext }) => {
		const page = joeContext.page;

		// Test navigation to Upload page
		await page.click('button:has-text("Upload Names")');
		await expect(page).toHaveURL('/upload');
		await expect(page.locator('header [class*="MuiTypography-h6"]')).toContainText(
			'Upload Names',
		);

		// Navigate back to home using browser back
		await page.goBack();
		await expect(page).toHaveURL('/');

		// Test navigation to Matches page
		await page.click('button:has-text("View Matches")');
		await expect(page).toHaveURL('/matches');
		await expect(page.locator('header [class*="MuiTypography-h6"]')).toContainText(
			'Your Matches',
		);

		// Navigate back to home using browser back
		await page.goBack();
		await expect(page).toHaveURL('/');

		// Test navigation to Analytics page
		await page.click('button:has-text("Analytics")');
		await expect(page).toHaveURL('/analytics');
		await expect(page.locator('header [class*="MuiTypography-h6"]')).toContainText('Analytics');

		// Navigate back to home using browser back
		await page.goBack();
		await expect(page).toHaveURL('/');
	});

	test('should show proper page titles in app bar', async ({ joeContext }) => {
		const page = joeContext.page;

		// Home page
		await expect(page.locator('header [class*="MuiTypography-h6"]')).toContainText(
			'Name Picker',
		);

		// Swipe page
		await page.click('button:has-text("Start Swiping")');
		await expect(page.locator('header [class*="MuiTypography-h6"]')).toContainText(
			'Swipe Names',
		);

		// Upload page
		await page.goto('/upload');
		await expect(page.locator('header [class*="MuiTypography-h6"]')).toContainText(
			'Upload Names',
		);

		// Matches page
		await page.goto('/matches');
		await expect(page.locator('header [class*="MuiTypography-h6"]')).toContainText(
			'Your Matches',
		);

		// Analytics page
		await page.goto('/analytics');
		await expect(page.locator('header [class*="MuiTypography-h6"]')).toContainText('Analytics');
	});

	test('should display user info in app bar', async ({ joeContext }) => {
		const page = joeContext.page;

		// Should show user avatar and name
		await expect(page.locator('header')).toContainText('Joe');
		await expect(page.locator('button:has-text("Logout")')).toBeVisible();
	});
});
