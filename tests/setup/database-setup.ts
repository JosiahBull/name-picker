import { test as base } from '@playwright/test';
import { DatabaseHelper } from '../helpers/database-helpers';

// Extend the base test to include database setup
export const test = base.extend<{ databaseHelper: DatabaseHelper }>({
	databaseHelper: async ({}, use) => {
		const dbHelper = new DatabaseHelper();
		
		// Clear database before each test
		await dbHelper.clearTestData();
		
		// Provide the helper to the test
		await use(dbHelper);
		
		// Clear database after each test to ensure clean state
		await dbHelper.clearTestData();
	},
});

export { expect } from '@playwright/test';