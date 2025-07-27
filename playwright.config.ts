import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
	testDir: './tests',
	forbidOnly: !!process.env.CI,
	retries: 0,
	workers: process.env.CI ? 1 : undefined,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: [['html'], ['list']],
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Base URL to use in actions like `await page.goto('/')`. */
		baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',

		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: 'on',
		screenshot: 'on',
		video: 'on',
	},

	/* Configure projects for major browsers */
	projects: [
		// Parallel-safe tests (no database modifications)
		{
			name: 'firefox-parallel',
			use: { ...devices['Desktop Firefox'] },
			testDir: './tests/parallel',
			fullyParallel: true,
		},

		// Serial tests (database modifications, swiping, analytics)
		{
			name: 'firefox-serial',
			use: { ...devices['Desktop Firefox'] },
			testDir: './tests/serial',
			fullyParallel: false,
			workers: 1,
		},
	],
	webServer: {
		command: 'pnpm --filter=frontend run dev',
		url: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
		reuseExistingServer: !process.env.CI,
		timeout: 120 * 1000,
		env: {
			VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL!,
			VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY!,
			VITE_SUPABASE_SERVICE_ROLE_KEY: process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!,
		},
		stdout: 'pipe',
		stderr: 'pipe',
	},
});
