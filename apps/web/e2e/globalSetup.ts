import { FullConfig } from '@playwright/test';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'node:path';

// Repo-root .env.test (gitignored). Loaded here rather than in
// playwright.config.ts so the config can stay CommonJS-clean.
loadEnv({ path: resolve(__dirname, '../../../.env.test') });

/**
 * Idempotently register the fixture user used by E2E tests. Runs once before
 * the suite — replaces the prior "the suite assumes alice already exists in
 * the local DB" hidden contract.
 *
 * Credentials are read from .env.test (gitignored). Keeping the literal
 * password out of source silences GitGuardian and lets each contributor
 * pick their own fixture password locally.
 */
export default async function globalSetup(_config: FullConfig): Promise<void> {
  const email = process.env.TEST_USER_EMAIL;
  const username = process.env.TEST_USER_USERNAME;
  const password = process.env.TEST_USER_PASSWORD;
  const apiUrl = process.env.TEST_API_URL ?? 'http://localhost:3000';

  if (!email || !username || !password) {
    throw new Error(
      'E2E setup: TEST_USER_EMAIL / TEST_USER_USERNAME / TEST_USER_PASSWORD must be set ' +
        '(see .env.test.example).',
    );
  }

  // Try to register; if the user already exists the API returns 409 and we
  // can move on. Any other failure is fatal — the suite can't proceed.
  const res = await fetch(`${apiUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password }),
  });

  if (!res.ok && res.status !== 409) {
    const body = await res.text().catch(() => '');
    throw new Error(
      `E2E setup: failed to register fixture user (${res.status}): ${body}`,
    );
  }
}
