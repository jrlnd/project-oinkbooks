import { test, expect } from '@playwright/test';

/**
 * E2E: authentication & guards.
 *
 * Credentials come from .env.test (gitignored). The Playwright globalSetup
 * registers this fixture user against the local API on first run, so the
 * suite is hermetic — `git clone → pnpm db:up → pnpm test:e2e` works
 * without any manual seeding step.
 */
const EMAIL = process.env.TEST_USER_EMAIL ?? '';
const PASSWORD = process.env.TEST_USER_PASSWORD ?? '';
const USERNAME = process.env.TEST_USER_USERNAME ?? '';

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

  test('login as the fixture user routes to dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[formcontrolname="email"]', EMAIL);
    await page.fill('input[formcontrolname="password"]', PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.locator('h1')).toContainText(`Hello ${USERNAME}`);
  });

  test('guestGuard redirects authed user away from /login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[formcontrolname="email"]', EMAIL);
    await page.fill('input[formcontrolname="password"]', PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.goto('/login');
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
