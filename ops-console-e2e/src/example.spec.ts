import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // App redirects / to /requests and shows Data Requests
  expect(await page.locator('h1').innerText()).toContain('Data Requests');
});

test('profile-updates route shows Profile Updates', async ({ page }) => {
  await page.goto('/profile-updates');
  expect(await page.locator('h1').innerText()).toContain('Profile Updates');
});

test('webhooks route shows Webhook Deliveries', async ({ page }) => {
  await page.goto('/webhooks');
  expect(await page.locator('h1').innerText()).toContain('Webhook Deliveries');
});
