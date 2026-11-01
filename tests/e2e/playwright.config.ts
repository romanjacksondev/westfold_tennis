import { defineConfig } from '@playwright/test';

const baseURL = process.env.INTEGRATION_BASE_URL;
const outputDir = process.env.PLAYWRIGHT_OUTPUT_DIR;

if (!baseURL || !outputDir) {
  throw new Error('Playwright E2E tests must run through the isolated integration runner.');
}

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  workers: 1,
  reporter: 'line',
  outputDir,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    browserName: 'chromium',
    headless: true,
    screenshot: 'off',
    trace: 'off',
  },
});
