import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
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
    // Parallel-safe tests (no database modifications or swiping)
    {
      name: 'chromium-parallel',
      use: { ...devices['Desktop Chrome'] },
      testMatch: ['**/basic-auth.spec.ts', '**/navigation.spec.ts'],
      fullyParallel: true,
    },
    {
      name: 'firefox-parallel',
      use: { ...devices['Desktop Firefox'] },
      testMatch: ['**/basic-auth.spec.ts', '**/navigation.spec.ts'],
      fullyParallel: true,
    },
    {
      name: 'webkit-parallel',
      use: { ...devices['Desktop Safari'] },
      testMatch: ['**/basic-auth.spec.ts', '**/navigation.spec.ts'],
      fullyParallel: true,
    },
    
    // Serial tests (database modifications, swiping, analytics)
    {
      name: 'chromium-serial',
      use: { ...devices['Desktop Chrome'] },
      testMatch: ['**/swiping.spec.ts', '**/multi-user-matching.spec.ts', '**/analytics.spec.ts', '**/name-upload.spec.ts'],
      fullyParallel: false,
    },
    {
      name: 'firefox-serial',
      use: { ...devices['Desktop Firefox'] },
      testMatch: ['**/swiping.spec.ts', '**/multi-user-matching.spec.ts', '**/analytics.spec.ts', '**/name-upload.spec.ts'],
      fullyParallel: false,
    },
    {
      name: 'webkit-serial',
      use: { ...devices['Desktop Safari'] },
      testMatch: ['**/swiping.spec.ts', '**/multi-user-matching.spec.ts', '**/analytics.spec.ts', '**/name-upload.spec.ts'],
      fullyParallel: false,
    },
  ],
});
