import { test, expect } from '@playwright/test';

test.describe('Admin Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.edu');
    await page.fill('input[name="password"]', 'password123');
    
    await page.evaluate(() => {
        const form = document.querySelector('form');
        const newInput = document.createElement('input');
        newInput.type = 'hidden';
        newInput.name = 'captcha';
        newInput.value = 'TEST_BYPASS_TOKEN';
        form?.appendChild(newInput);
    });
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('Manage Students', async ({ page }) => {
    await page.click('a[href="/dashboard/students"]');
    await expect(page.locator('text=Students')).toBeVisible();
    
    // Add Student
    await page.click('button:has-text("Add Student")');
    const timestamp = Date.now();
    await page.fill('input[name="name"]', 'New Student');
    await page.fill('input[name="email"]', `student.${timestamp}@test.edu`);
    await page.fill('input[name="studentId"]', `ST-${timestamp}`);
    await page.click('button[type="submit"]');
    
    await expect(page.locator(`text=student.${timestamp}@test.edu`)).toBeVisible();
  });

  test('Manage Facilities', async ({ page }) => {
    await page.click('a[href="/dashboard/facilities"]');
    await expect(page.locator('text=Facilities')).toBeVisible();
    
    // Add Facility
    await page.click('button:has-text("Add Facility")');
    const facilityName = `Lab ${Date.now()}`;
    await page.fill('input[name="name"]', facilityName);
    await page.fill('textarea[name="description"]', 'Test Lab');
    // Select Type (assuming default is PHYSICAL or we select it)
    await page.click('button[type="submit"]');
    
    await expect(page.locator(`text=${facilityName}`)).toBeVisible();
  });
});
