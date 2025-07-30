import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
	testDir: './tests',
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 3 : 2, // More retries in CI
	workers: 1, // Single worker to avoid test interference
	reporter: !!process.env.CI ? [['html', { open: 'never' }], ['dot']] : [['html', { open: 'always' }], ['list']],
	timeout: 60 * 1000, // Global timeout of 60 seconds per test
	use: {
		baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
		trace: 'on',
		screenshot: 'on',
		video: 'on',
		// Slow down actions for better stability
		actionTimeout: 10 * 1000,
		navigationTimeout: 30 * 1000,
	},

	/* Configure projects for major browsers */
	projects: [
		{
			name: 'firefox',
			use: { 
				...devices['Desktop Firefox'],
				// Add a small delay between actions for stability
				launchOptions: {
					slowMo: 100,
				},
			},
			testDir: './tests',
			fullyParallel: false, // Run tests sequentially to avoid interference
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
