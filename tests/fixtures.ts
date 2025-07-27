import { BrowserContext, Page, expect, test as base } from '@playwright/test';
import { DatabaseHelper } from './helpers';

async function loginAsJoe(page: Page) {
	await page.goto('/login');
	await page.waitForSelector('button:has-text("Joe")', { state: 'visible' });
	await page.click('button:has-text("Joe")');
	
	// Wait for navigation and ensure we're on the home page
	await page.waitForURL('/', { timeout: 10000 });
	
	// Wait for the welcome message to appear
	await page.waitForSelector('h3:has-text("Welcome, Joe!")', { state: 'visible', timeout: 10000 });
}

async function loginAsSam(page: Page) {
	await page.goto('/login');
	await page.waitForSelector('button:has-text("Sam")', { state: 'visible' });
	await page.click('button:has-text("Sam")');
	
	// Wait for navigation and ensure we're on the home page
	await page.waitForURL('/', { timeout: 10000 });
	
	// Wait for the welcome message to appear
	await page.waitForSelector('h3:has-text("Welcome, Sam!")', { state: 'visible', timeout: 10000 });
}

// async function logout(page: Page) {
	// await page.click('button:has-text("Logout")');
	// await expect(page).toHaveURL('/login');
// }

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
}>({
	databaseHelper: async ({}, use) => {
		const dbHelper = new DatabaseHelper();

		// Clear database before each test
		await dbHelper.clearTestData();

		// Provide the helper to the test
		await use(dbHelper);

		// Cleanup
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
