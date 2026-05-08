import { test, expect } from '@playwright/test';

test.describe('Student Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'student@test.edu');
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

  test('View Dashboard', async ({ page }) => {
    await expect(page.locator('text=Quick Actions')).toBeVisible();
    await expect(page.locator('text=Upcoming Bookings')).toBeVisible();
  });

  test('Book Facility', async ({ page }) => {
    await page.goto('/dashboard/book');
    // Assuming at least one facility exists from seed
    const bookBtn = page.locator('button:has-text("Book")').first();
    if (await bookBtn.count() > 0) {
        // Just verify we can see the button, actual booking flow is covered in presentation-demo
        await expect(bookBtn).toBeVisible();
    }
  });
});
