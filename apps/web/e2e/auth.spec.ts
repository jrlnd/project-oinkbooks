import { test, expect } from '@playwright/test';

/**
 * E2E: authentication & guards.
 * Assumes a seed user alice@oink.dev / hunter2pw exists in the local database.
 */
test.describe('auth flow', () => {
  test('unauthenticated / redirects to /login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator('img.auth-logo')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('register page reachable from login', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: 'Sign Up' }).click();
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByLabel('Username')).toBeVisible();
  });

  test('login with alice routes to dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[formcontrolname="email"]', 'alice@oink.dev');
    await page.fill('input[formcontrolname="password"]', 'hunter2pw');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.locator('h1')).toContainText('Hello alice');
  });

  test('guestGuard redirects authed user away from /login', async ({ page }) => {
    // log in first
    await page.goto('/login');
    await page.fill('input[formcontrolname="email"]', 'alice@oink.dev');
    await page.fill('input[formcontrolname="password"]', 'hunter2pw');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/\/dashboard$/);

    // visiting /login while authed should bounce to /dashboard
    await page.goto('/login');
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
