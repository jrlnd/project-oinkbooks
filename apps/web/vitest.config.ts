/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

/**
 * Vitest config for unit tests, powered by @analogjs/vite-plugin-angular.
 * Angular's own `@angular/build:unit-test` builder is new and rough; Analog's
 * Vitest plugin is the de-facto choice for component testing.
 *
 * E2E tests live under ./e2e and are run by Playwright (see playwright.config.ts).
 */
export default defineConfig(() => ({
  plugins: [angular()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
  },
  define: {
    'import.meta.vitest': 'undefined',
  },
}));
