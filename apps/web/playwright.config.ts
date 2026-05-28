import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E config. Tests live in ./e2e and drive the running app via
 * a real browser. Both dev servers are auto-started if they aren't already
 * up (reuseExistingServer: true).
 *
 * Run: pnpm --filter @oinkbooks/web e2e
 *      pnpm --filter @oinkbooks/web e2e --ui    (Playwright UI mode)
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? 'list' : 'list',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Use the system Chrome rather than the bundled chromium (~300 MB).
        // Run `pnpm exec playwright install chromium` to use the bundled one.
        channel: 'chrome',
      },
    },
  ],
  webServer: [
    {
      command: 'node dist/main.js',
      cwd: '../api',
      url: 'http://localhost:3000/health',
      reuseExistingServer: true,
      timeout: 60_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: 'pnpm start',
      url: 'http://localhost:4200',
      reuseExistingServer: true,
      timeout: 120_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});
