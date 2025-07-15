import { test, expect } from '@playwright/test';
import { loginAsJoe, loginAsSam } from '../helpers/auth-helpers';

test.describe('Name Upload and Prioritization', () => {
  test('should allow uploading a single name and show it immediately for both users', async ({ browser }) => {
    const joeContext = await browser.newContext();
    const samContext = await browser.newContext();
    
    const joePage = await joeContext.newPage();
    const samPage = await samContext.newPage();
    
    try {
      // Login both users
      await loginAsJoe(joePage);
      await loginAsSam(samPage);
      
      // Joe uploads a new name
      await joePage.click('button:has-text("Upload Names")');
      await expect(joePage).toHaveURL('/upload');
      
      // Generate a unique name to test with
      const uniqueName = `TestName${Date.now()}`;
      
      // Fill in the upload form
      await joePage.fill('input[placeholder*="Martinez"]', uniqueName);
      await joePage.fill('input[placeholder*="Spanish"]', 'Test Origin');
      await joePage.fill('input[placeholder*="Son of Martin"]', 'Test Meaning');
      
      // Submit the form
      await joePage.click('button:has-text("Add Name")');
      
      // Wait for success message or form reset
      await joePage.waitForTimeout(2000);
      
      // Now both users should see this name as the next one to swipe
      // Joe goes to swipe page
      await joePage.goto('/swipe');
      await joePage.waitForSelector('[data-testid="name-card"]', { timeout: 10000 });
      
      // Sam goes to swipe page
      await samPage.click('button:has-text("Start Swiping")');
      await samPage.waitForSelector('[data-testid="name-card"]', { timeout: 10000 });
      
      // Check if the uploaded name appears for both users
      const joeNameText = await joePage.locator('[data-testid="name-card"] h1').textContent();
      const samNameText = await samPage.locator('[data-testid="name-card"] h1').textContent();
      
      console.log('Joe sees name:', joeNameText);
      console.log('Sam sees name:', samNameText);
      console.log('Expected unique name:', uniqueName);
      
      let joeFoundUploadedName = joeNameText === uniqueName;
      let samFoundUploadedName = samNameText === uniqueName;
      
      // Both users should have seen the uploaded name
      expect(joeFoundUploadedName).toBe(true);
      expect(samFoundUploadedName).toBe(true);
    } finally {
      await joeContext.close();
      await samContext.close();
    }
  });

  test('should show upload form with all required fields', async ({ page }) => {
    await loginAsJoe(page);
    
    // Navigate to upload page
    await page.click('button:has-text("Upload Names")');
    await expect(page).toHaveURL('/upload');
    
    // Check that upload form elements are present
    await expect(page.locator('header [class*="MuiTypography-h6"]')).toContainText('Upload Names');
    
    // Check for form fields
    await expect(page.locator('input[placeholder*="Martinez"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="Spanish"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="Son of Martin"]')).toBeVisible();
    await expect(page.locator('button:has-text("Add Name")')).toBeVisible();
    
    // Check for file upload section
    await expect(page.locator('text=Upload from File')).toBeVisible();
  });

  test('should handle form validation correctly', async ({ page }) => {
    await loginAsJoe(page);
    
    // Navigate to upload page
    await page.click('button:has-text("Upload Names")');
    await expect(page).toHaveURL('/upload');
    
    // Check that the button is disabled when form is empty
    const addButton = page.locator('button:has-text("Add Name")');
    await expect(addButton).toBeDisabled();
    
    // Should stay on upload page
    await expect(page).toHaveURL('/upload');
    
    // Fill just the name field (minimum required)
    await page.fill('input[placeholder*="Martinez"]', 'TestName');
    await page.click('button:has-text("Add Name")');
    
    // Should accept with just a name
    await page.waitForTimeout(2000);
    
    // Form should reset or show success
    const nameInput = page.locator('input[placeholder*="Martinez"]');
    const inputValue = await nameInput.inputValue();
    
    // Input should be empty after successful submission
    expect(inputValue).toBe('');
  });

  test('should allow file upload functionality', async ({ page }) => {
    await loginAsJoe(page);
    
    // Navigate to upload page
    await page.click('button:has-text("Upload Names")');
    await expect(page).toHaveURL('/upload');
    
    // Check that file upload section exists
    await expect(page.locator('text=Upload from File')).toBeVisible();
    
    // Check for file input (should be hidden but present)
    const fileInput = page.locator('input[type="file"]');
    const fileInputCount = await fileInput.count();
    expect(fileInputCount).toBeGreaterThan(0);
    
    // Check for upload button (the label for the file input)
    const uploadLabel = page.locator('label[for="file-upload"]');
    await expect(uploadLabel).toBeVisible();
  });
});
