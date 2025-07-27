import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
	testDir: './tests',
	forbidOnly: !!process.env.CI,
	retries: 0,
	workers: 1,
	reporter: !!process.env.CI ? [['html', { open: 'never' }], ['dot']] : [['html', { open: 'always' }], ['list']],
	use: {
		baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
		trace: 'on',
		screenshot: 'on',
		video: 'on',
	},

	/* Configure projects for major browsers */
	projects: [
		{
			name: 'firefox',
			use: { ...devices['Desktop Firefox'] },
			testDir: './tests',
			fullyParallel: true,
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
