import { test, expect } from '../setup/database-setup';
import { loginAsJoe, loginAsSam } from '../helpers/auth-helpers';
import type { Page } from '@playwright/test';

test.describe('Name Upload and Prioritization', () => {
  test('should allow uploading a single name and show it immediately for both users', async ({ browser, databaseHelper }) => {
    // Increase timeout for this complex test
    test.setTimeout(60000);
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
      
      // Wait for either success message or error message
      try {
        await joePage.waitForSelector('text=Successfully added', { timeout: 10000 });
        console.log('✅ Success message appeared');
      } catch (error) {
        // Check for error message
        const errorMessage = await joePage.locator('[role="alert"]').textContent();
        console.log('❌ Error message:', errorMessage);
        
        // Check if form is still loading
        const isLoading = await joePage.locator('button:has-text("Adding...")').isVisible();
        console.log('Is still loading:', isLoading);
        
        if (isLoading) {
          await joePage.waitForTimeout(5000);
        }
      }
      
      // Verify the name was actually saved to the database
      const nameExists = await databaseHelper.checkNameExists(uniqueName);
      console.log(`Name "${uniqueName}" exists in database:`, nameExists);
      
      if (!nameExists) {
        // Let's see what names are in the database
        const allNames = await databaseHelper.getAllNames();
        console.log('All names in database:', allNames.map(n => n.name).slice(0, 10));
        expect(nameExists).toBe(true); // This will fail and show us the issue
      }
      
      // Now both users should see this name prioritized (user-uploaded names come first)
      // Joe goes to swipe page
      await joePage.goto('/swipe');
      await joePage.waitForSelector('[data-testid="name-card"]', { timeout: 10000 });
      
      // Sam goes to swipe page
      await samPage.click('button:has-text("Start Swiping")');
      await samPage.waitForSelector('[data-testid="name-card"]', { timeout: 10000 });
      
      // Function to find the uploaded name by swiping through names
      async function findUploadedName(page: Page, targetName: string, maxSwipes: number = 10): Promise<boolean> {
        const foundNames = [];
        for (let i = 0; i < maxSwipes; i++) {
          try {
            await page.waitForSelector('[data-testid="name-card"]', { timeout: 5000 });
            const nameText = await page.locator('[data-testid="name-card"] h1').textContent();
            if (nameText) {
              foundNames.push(nameText);
            }
            
            console.log(`Swipe ${i + 1}: Found name "${nameText}"`);
            
            if (nameText === targetName) {
              console.log(`✅ Found target name "${targetName}" on swipe ${i + 1}`);
              return true;
            }
            
            // Swipe to next name
            await page.click('button:has-text("Pass")');
            await page.waitForTimeout(1000);
          } catch (error) {
            console.log(`❌ Error on swipe ${i + 1}:`, error.message);
            // If we can't find more names, stop searching
            break;
          }
        }
        console.log(`❌ Did not find "${targetName}" in ${foundNames.length} swipes. Names found:`, foundNames);
        return false;
      }
      
      // Check if both users can find the uploaded name
      const joeFoundUploadedName = await findUploadedName(joePage, uniqueName);
      const samFoundUploadedName = await findUploadedName(samPage, uniqueName);
      
      console.log('Joe found uploaded name:', joeFoundUploadedName);
      console.log('Sam found uploaded name:', samFoundUploadedName);
      console.log('Expected unique name:', uniqueName);
      
      // Both users should have found the uploaded name
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
