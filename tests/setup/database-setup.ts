import { test as base, type BrowserContext, type Page } from '@playwright/test';
import { DatabaseHelper } from '../helpers/database-helpers';
import { loginAsJoe, loginAsSam } from '../helpers/auth-helpers';

interface UserContext {
	context: BrowserContext;
	page: Page;
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
		
		// Clear database after each test to ensure clean state
		await dbHelper.clearTestData();
	},

	joeContext: async ({ browser }, use) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		
		// Login as Joe
		await loginAsJoe(page);
		
		// Provide the context and page to the test
		await use({ context, page });
		
		// Cleanup
		await context.close();
	},

	samContext: async ({ browser }, use) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		
		// Login as Sam
		await loginAsSam(page);
		
		// Provide the context and page to the test
		await use({ context, page });
		
		// Cleanup
		await context.close();
	},
});

export { expect } from '@playwright/test';