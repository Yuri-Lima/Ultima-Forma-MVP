import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // App redirects / to /requests and shows Data Requests
  expect(await page.locator('h1').innerText()).toContain('Data Requests');
});
