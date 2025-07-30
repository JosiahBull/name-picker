import { test } from './fixtures';
import { expect } from '@playwright/test';

test.describe('Swiping Functionality', () => {
	test('should display swipe page after login', async ({ joeContext }) => {
		const joePage = joeContext.page;

		// Navigate to swipe page
		await joePage.click('button:has-text("Start Swiping")');
		await expect(joePage).toHaveURL('/swipe');

		// Should show swipe interface title in app bar
		await expect(joePage.locator('header [class*="MuiTypography-h6"]')).toContainText(
			'Swipe Names',
		);
		await expect(joePage.locator('text=Names Reviewed:')).toBeVisible();
	});

	test('should load and display a name card', async ({ joeContext }) => {
		const joePage = joeContext.page;

		await joePage.click('button:has-text("Start Swiping")');

		// Wait for name to load
		await joePage.waitForSelector('[data-testid="name-card"]', { timeout: 10000 });

		// Should display name information
		const nameCard = joePage.locator('[data-testid="name-card"]');
		await expect(nameCard).toBeVisible();

		// Should have swipe buttons
		await expect(joePage.locator('button:has-text("Pass")')).toBeVisible();
		await expect(joePage.locator('button:has-text("Like")')).toBeVisible();
	});

	test('should handle like button click', async ({ joeContext }) => {
		const joePage = joeContext.page;

		await joePage.click('button:has-text("Start Swiping")');

		// Wait for name to load
		await joePage.waitForSelector('[data-testid="name-card"]', { timeout: 10000 });

		// Click like button
		await joePage.click('button:has-text("Like")');

		// Wait for next name to load or completion message
		await joePage.waitForTimeout(1000);

		// Swipe count should increment or show completion
		const content = await joePage.content();
		const hasNextName = content.includes('data-testid="name-card"');
		const isComplete = content.includes('All done for now!');

		expect(hasNextName || isComplete).toBe(true);
	});

	test('should handle pass button click', async ({ joeContext }) => {
		const joePage = joeContext.page;

		await joePage.click('button:has-text("Start Swiping")');

		// Wait for name to load
		await joePage.waitForSelector('[data-testid="name-card"]', { timeout: 10000 });

		// Click pass button
		await joePage.click('button:has-text("Pass")');

		// Wait for next name to load or completion message
		await joePage.waitForTimeout(1000);

		// Should load next name or show completion
		const content = await joePage.content();
		const hasNextName = content.includes('data-testid="name-card"');
		const isComplete = content.includes('All done for now!');

		expect(hasNextName || isComplete).toBe(true);
	});

	test('should show completion message when no more names', async ({
		joeContext,
		databaseHelper,
	}) => {
		const joePage = joeContext.page;

		await joePage.click('button:has-text("Start Swiping")');

		// Swipe through all available names (should be exactly 2 with our seeded data)
		const nameCount = (await databaseHelper.getAllNames()).length;
		let swipeCount = 0;
		for (let i = 0; i < nameCount; i++) {
			// Wait for name card to appear
			await joePage.waitForSelector('[data-testid="name-card"]', { timeout: 10000 });

			// Swipe if name card is available
			const nameCard = joePage.locator('[data-testid="name-card"]');
			if (await nameCard.isVisible()) {
				await joePage.click('button:has-text("Pass")');
				swipeCount++;
				await joePage.waitForTimeout(500);
			}
		}

		// Ensure we are done
		await expect(joePage.locator('text=All done for now!')).toBeVisible();
		await expect(joePage.locator('button:has-text("Go Back")')).toBeVisible();

		// Ensure we swiped through all names
		const totalSwipedCount = (await databaseHelper.getAllSwipes(joeContext.userId)).length;
		expect(totalSwipedCount).toBe(swipeCount);
	});

	test('show match successful match on swipe', async ({
		joeContext,
		samContext,
		databaseHelper,
	}) => {
		const joePage = joeContext.page;
		const samPage = samContext.page;

		// Seed a name that both users will swipe on
		const commonName = 'TestCommonName123';
		await databaseHelper.seedTestName(joeContext.userId, commonName);

		// Joe swipes on the name
		await joePage.click('button:has-text("Start Swiping")');
		await joePage.waitForSelector('[data-testid="name-card"]', { timeout: 10000 });
		await expect(joePage.locator('[data-testid="name-card"]')).toContainText(commonName);
		await joePage.click('button:has-text("Like")');

		// Sam swipes on the same name
		await samPage.click('button:has-text("Start Swiping")');
		await samPage.waitForSelector('[data-testid="name-card"]', { timeout: 10000 });
		expect(samPage.locator('[data-testid="name-card"]')).toContainText(commonName);
		await samPage.click('button:has-text("Like")');

		// Sam should see a match notification
		await expect(samPage.locator("text=🎉 IT'S A MATCH! 🎉")).toBeVisible();

		// Go back
		// The back button is an icon button in the app bar
		await samPage.locator('button [data-testid="ArrowBackIcon"]').click();
		await samPage.click('button:has-text("View Matches")');
		await expect(samPage.locator('text=TestCommonName123')).toBeVisible();

		// Joe should also see the match
		await joePage.locator('button [data-testid="ArrowBackIcon"]').click();
		await joePage.click('button:has-text("View Matches")');
		await expect(joePage.locator('text=TestCommonName123')).toBeVisible();
	});
});
