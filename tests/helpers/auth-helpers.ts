import { Page, expect } from '@playwright/test';

export async function loginAsJoe(page: Page) {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'joe@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/');
  await expect(page.locator('h3')).toContainText('Welcome, Joe!');
}

export async function loginAsSam(page: Page) {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'sam@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/');
  await expect(page.locator('h3')).toContainText('Welcome, Sam!');
}

export async function logout(page: Page) {
  await page.click('button:has-text("Logout")');
  await expect(page).toHaveURL('/login');
}

export async function waitForAuth(page: Page) {
  // Wait for either login page or home page to load
  await page.waitForFunction(() => {
    const url = window.location.pathname;
    return url === '/login' || url === '/';
  }, { timeout: 10000 });
}