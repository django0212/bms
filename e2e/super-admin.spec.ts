import { test, expect } from '@playwright/test';

test.describe('Super Admin Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'superadmin@test.edu');
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

  test('Manage Universities', async ({ page }) => {
    await page.click('a[href="/dashboard/universities"]');
    await expect(page.locator('text=Universities')).toBeVisible();
    
    // Create University
    await page.click('button:has-text("Add University")');
    const uniName = `New Uni ${Date.now()}`;
    await page.fill('input[name="name"]', uniName);
    await page.fill('input[name="slug"]', `uni-${Date.now()}`);
    await page.fill('input[name="domain"]', `uni-${Date.now()}.edu`);
    await page.click('button[type="submit"]');
    
    await expect(page.locator(`text=${uniName}`)).toBeVisible();
    
    // Edit University
    await page.locator(`div:has-text("${uniName}")`).locator('button:has-text("Edit")').click();
    await page.fill('input[name="name"]', `${uniName} Updated`);
    await page.click('button:has-text("Save Changes")');
    await expect(page.locator(`text=${uniName} Updated`)).toBeVisible();
  });
});
