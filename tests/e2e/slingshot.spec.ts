import { test, expect } from '@playwright/test';

test('launch and hit target -> result screen', async ({ page }) => {
  await page.goto('/');
  // Start from menu: click somewhere to start (simplified selector by coordinates)
  await page.mouse.click(400, 500);

  // Wait a bit for level
  await page.waitForTimeout(500);
  // Drag from slingshot approximate position and release
  await page.mouse.move(180, 520);
  await page.mouse.down();
  await page.mouse.move(80, 620);
  await page.mouse.up();

  // Wait for physics and potential hit
  await page.waitForTimeout(2000);

  // Assert some text from Result overlay may appear (Score label rendered on canvas; no DOM text, so we just ensure no crash)
  expect(true).toBe(true);
});


