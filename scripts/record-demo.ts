import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

(async () => {
  const videoDir = path.join(process.cwd(), 'videos');
  if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
  }

  console.log("🚀 Launching headless browser using Brave...");
  const browser = await chromium.launch({ 
    headless: true,
    executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: 'videos/',
      size: { width: 1920, height: 1080 }
    }
  });
  
  const page = await context.newPage();

  try {
    // ---------------------------------------------------------
    // PART 1: STUDENT CONTEXT DEMO
    // ---------------------------------------------------------
    console.log("1️⃣ Logging in as MIT Student...");
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(1000);
    
    await page.fill('input[type="email"]', 'amiller@mit.edu');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign In")');

    await page.waitForURL('**/dashboard**');
    await page.waitForTimeout(2000);

    console.log("   Demonstrating AI Context Window...");
    await page.locator('button.rounded-full.shadow-lg').click();
    await page.waitForTimeout(1500);

    // Using pressSequentially for human-like typing animation
    await page.locator('textarea').pressSequentially('Who am I, and what campus am I on?', { delay: 60 });
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Send' }).click();
    await page.waitForTimeout(8000); // wait for stream and read

    await page.locator('button').filter({ has: page.locator('svg.lucide-x') }).first().click();
    await page.waitForTimeout(1500);

    console.log("   Logging out student...");
    await page.getByRole('button', { name: 'Logout' }).click();
    await page.waitForURL('**/login**');
    await page.waitForTimeout(1500);


    // ---------------------------------------------------------
    // PART 2: ADMIN DB MUTATION DEMO
    // ---------------------------------------------------------
    console.log("2️⃣ Logging in as MIT Admin...");
    await page.fill('input[type="email"]', 'admin@mit.edu');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign In")');

    await page.waitForURL('**/dashboard**');
    await page.waitForTimeout(2000);

    console.log("   Demonstrating Real-time DB mutation...");
    await page.click('a[href="/dashboard/facilities"]');
    await page.waitForTimeout(2500);

    await page.getByRole('button', { name: 'Add Facility' }).click();
    await page.waitForTimeout(1500);

    await page.getByText('Physical Resource').click();
    await page.waitForTimeout(1500);

    await page.fill('input#name', 'Quantum Computing Lab');
    await page.waitForTimeout(500);

    await page.getByPlaceholder('e.g. Catering').fill('Liquid Nitrogen');
    await page.getByPlaceholder('e.g. true or 1').fill('Yes');
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await page.waitForTimeout(500);

    await page.getByPlaceholder('e.g. Catering').fill('High-Speed Ethernet');
    await page.getByPlaceholder('e.g. true or 1').fill('10 Gbps');
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await page.waitForTimeout(500);

    await page.getByPlaceholder('e.g. Catering').fill('Ergonomic Chairs');
    await page.getByPlaceholder('e.g. true or 1').fill('20');
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: 'Add Time Block' }).click();
    const timeInputs = await page.locator('input[type="time"]').all();
    if (timeInputs.length >= 2) {
      await timeInputs[timeInputs.length - 2].fill('09:00');
      await timeInputs[timeInputs.length - 1].fill('17:00');
    }
    
    // Wait a few seconds to let the viewer see all the added amenities and details
    await page.waitForTimeout(3500);

    await page.getByRole('button', { name: 'Create Facility' }).click();
    
    await page.waitForURL('**/dashboard/facilities');
    await page.waitForTimeout(3000);

    console.log("   Logging out admin...");
    await page.getByRole('button', { name: 'Logout' }).click();
    await page.waitForURL('**/login**');
    await page.waitForTimeout(1500);


    // ---------------------------------------------------------
    // PART 3: STUDENT NEW DB / TRANSPORT DEMO
    // ---------------------------------------------------------
    console.log("3️⃣ Logging back in as MIT Student...");
    await page.fill('input[type="email"]', 'amiller@mit.edu');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign In")');

    await page.waitForURL('**/dashboard**');
    await page.waitForTimeout(2000);

    await page.locator('button.rounded-full.shadow-lg').click();
    await page.waitForTimeout(1500);

    console.log("   Demonstrating AI reading new injected context...");
    await page.locator('textarea').pressSequentially('Do we have anywhere on campus with Liquid Nitrogen?', { delay: 60 });
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Send' }).click();
    await page.waitForTimeout(8000);

    console.log("   Demonstrating Transport logic...");
    await page.locator('textarea').pressSequentially('I\'m at Kendall. How do I get to West Campus?', { delay: 60 });
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Send' }).click();
    await page.waitForTimeout(8000);

    console.log("✅ Demo finished perfectly! Saving video...");
  } catch (e) {
    console.error("Error during execution:", e);
  } finally {
    await context.close();
    await browser.close();
    console.log("🎥 Video saved to 'videos' folder in your project directory.");
  }
})();
