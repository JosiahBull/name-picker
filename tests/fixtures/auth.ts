import { BrowserContext, Page, expect, test as base } from '@playwright/test';
import { DatabaseHelper } from './database';

async function loginAsJoe(page: Page) {
	await page.goto('/login');
	await page.click('button:has-text("Joe")');
	await expect(page).toHaveURL('/');
	await expect(page.locator('h3')).toContainText('Welcome, Joe!');
}

async function loginAsSam(page: Page) {
	await page.goto('/login');
	await page.click('button:has-text("Sam")');
	await expect(page).toHaveURL('/');
	await expect(page.locator('h3')).toContainText('Welcome, Sam!');
}

async function logout(page: Page) {
	await page.click('button:has-text("Logout")');
	await expect(page).toHaveURL('/login');
}

export interface UserContext {
	context: BrowserContext;
	page: Page;
	userId: string;
}

// Extend the base test to include database setup and user context fixtures
export const test = base.extend<{
	databaseHelper: DatabaseHelper;
	joeContext: UserContext;
	samContext: UserContext;
	logout: ({ page }: { page: Page }) => Promise<void>;
}>({
	databaseHelper: async ({}, use) => {
		const dbHelper = new DatabaseHelper();

		// Clear database before each test
		await dbHelper.clearTestData();

		// Provide the helper to the test
		await use(dbHelper);

		// Clear database after each test to ensure clean state
		await dbHelper.clearTestData();
	},

	joeContext: async ({ browser, databaseHelper }, use) => {
		const context = await browser.newContext();
		const page = await context.newPage();

		const userId = (await databaseHelper.getTestUserIds()).joeId;

		// Login as Joe
		await loginAsJoe(page);

		// Provide the context and page to the test
		await use({ context, page, userId });

		// Cleanup
		await context.close();
	},

	samContext: async ({ browser, databaseHelper }, use) => {
		const context = await browser.newContext();
		const page = await context.newPage();

		const userId = (await databaseHelper.getTestUserIds()).samId;

		// Login as Sam
		await loginAsSam(page);

		// Provide the context and page to the test
		await use({ context, page, userId });

		// Cleanup
		await context.close();
	},
});
